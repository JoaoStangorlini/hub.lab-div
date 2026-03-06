-- --- START OF godsqlv6.sql ---
-- ==========================================================
-- THE GOD SQL v6.0.0 — HUB DE COMUNICAÇÃO CIENTÍFICA (IFUSP)
-- ==========================================================
-- Script 100% IDEMPOTENTE. Consolida v5 + bixo/veterano + feedback reports + messages + correcoes admin todos os newsqls + Radiation System.
-- Pode ser executado múltiplas vezes sem efeito colateral.
-- ==========================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║                    1. EXTENSÕES                         ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ╔══════════════════════════════════════════════════════════╗
-- ║                    2. ENUMS                             ║
-- ╚══════════════════════════════════════════════════════════╝

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado', 'deleted');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video', 'pdf', 'text', 'link', 'zip', 'sdocx');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_review_status') THEN
        CREATE TYPE profile_review_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- ╔══════════════════════════════════════════════════════════╗
-- ║              3. TABELAS DE NÚCLEO                       ║
-- ╚══════════════════════════════════════════════════════════╝

-- 3.1 PROFILES (completo com todos os campos de produção)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    bio_draft TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'labdiv adm', 'moderador')),
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    radiation_tier TEXT DEFAULT 'plastico',
    is_usp_member BOOLEAN DEFAULT false,
    entrance_year INTEGER,
    completion_year NUMERIC,
    major TEXT,
    usp_status TEXT,
    lattes_url TEXT,
    available_to_mentor BOOLEAN DEFAULT false,
    education_level TEXT,
    school_year TEXT,
    objective TEXT,
    institute TEXT,
    whatsapp TEXT,
    course TEXT,
    seeking_mentor BOOLEAN DEFAULT false,
    use_nickname BOOLEAN DEFAULT false,
    usp_proof_url TEXT,
    interests TEXT[] DEFAULT '{}',
    artistic_interests TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    review_status profile_review_status DEFAULT 'pending',
    seeking_mentor BOOLEAN DEFAULT false,
    course TEXT,
    whatsapp TEXT,
    usp_proof_url TEXT,
    pending_edits JSONB DEFAULT NULL,
    use_nickname BOOLEAN DEFAULT false,
    has_scholarship BOOLEAN DEFAULT false,
    seeking_scholarship BOOLEAN DEFAULT false,
    interest_in_team BOOLEAN DEFAULT false,
    interest_help_comm BOOLEAN DEFAULT false,
    interest_learn_prod BOOLEAN DEFAULT false,
    atomic_excitation DOUBLE PRECISION DEFAULT 100.0,
    half_life_rate DOUBLE PRECISION DEFAULT 0.05,
    last_energy_update TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    media_type media_type NOT NULL,
    media_url TEXT NOT NULL,
    status submission_status DEFAULT 'pendente' NOT NULL,
    admin_feedback TEXT,
    whatsapp TEXT,
    external_link TEXT,
    technical_details TEXT,
    alt_text TEXT,
    testimonial TEXT,
    is_featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    reading_time INTEGER DEFAULT 0,
    co_author_ids UUID[] DEFAULT '{}',
    event_date TIMESTAMPTZ,
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6),
    location_name TEXT,
    use_pseudonym BOOLEAN DEFAULT false,
    energy_reactions JSONB DEFAULT '{}'::jsonb,
    atomic_excitation DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║           4. TABELAS DE ENGAJAMENTO & FEEDBACK          ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    inline_paragraph_id TEXT,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reproductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    text_content TEXT,
    media_url TEXT,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.curtidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fingerprint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT curtidas_submission_fingerprint_unique UNIQUE (submission_id, fingerprint)
);

CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID REFERENCES auth.users(id) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisado', 'ignorado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follow_uniqueness;
ALTER TABLE public.follows ADD CONSTRAINT follow_uniqueness UNIQUE (follower_id, following_id);

CREATE TABLE IF NOT EXISTS public.private_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║           5. GAMIFICAÇÃO & ANALYTICS                    ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_svg TEXT,
    requirement_type TEXT,
    requirement_threshold INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profile_badges (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (profile_id, badge_id)
);

-- NOTA: tabelas kudos e kudos_quota_logs existem em produção mas NÃO são usadas no código.
-- Mantidas aqui como referência. Não criar triggers para elas.

CREATE TABLE IF NOT EXISTS public.reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.analytics_plays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║           6. WIKI, EMARANHAMENTO & MENSAGENS            ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.wiki_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    technical_metadata JSONB DEFAULT '{ "equipment_id": null, "lab_room": null, "safety_level": 1 }'::jsonb,
    is_stable BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wiki_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    target_article_id UUID REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
    citation_type TEXT DEFAULT 'reference',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_article_id, target_article_id)
);

CREATE TABLE IF NOT EXISTS public.entanglement_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_particle_id UUID,
    attachment_type TEXT CHECK (attachment_type IN ('particle', 'article')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    attachment_id TEXT,
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║           7. PSEUDÔNIMOS                                ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.pseudonyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║           8. TRILHAS & COLEÇÕES                         ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.learning_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trail_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trail_id UUID REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trail_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, submission_id)
);

-- Drop table to ensure schema update (since we are re-seeding anyway)
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 10,
    category TEXT NOT NULL DEFAULT 'geral',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    xp_awarded INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║      9. FUNÇÕES DE SUPORTE (inclui Radiation System)    ║
-- ╚══════════════════════════════════════════════════════════╝

-- 9.1 is_admin (expandido com labdiv adm e moderador)
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'labdiv adm' OR
        auth.jwt() ->> 'role' = 'moderador' OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'labdiv adm', 'moderador')
        )
    );
END;
$function$;

-- 9.2 Pseudonym limit check
CREATE OR REPLACE FUNCTION public.check_pseudonym_limit()
RETURNS TRIGGER AS $$
DECLARE v_count INTEGER;
BEGIN
    IF (NEW.use_pseudonym = true) THEN
        SELECT count(id) INTO v_count FROM public.submissions
        WHERE user_id = NEW.user_id AND use_pseudonym = true AND status IN ('pendente', 'aprovado')
        AND (NEW.id IS NULL OR id <> NEW.id);
        IF v_count >= 2 THEN RAISE EXCEPTION 'LIMITE_PSEUDONIMO_ATINGIDO'; END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9.3 Like count trigger function
CREATE OR REPLACE FUNCTION public.update_submission_like_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    target_id uuid;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_id := OLD.submission_id;
    ELSE
        target_id := NEW.submission_id;
    END IF;

    UPDATE public.submissions
    SET like_count = (
        SELECT count(*) FROM public.curtidas WHERE submission_id = target_id
    )
    WHERE id = target_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$function$;

-- ╔══════════════════════════════════════════════════════════╗
-- ║      10. RADIATION LEVEL SYSTEM (Gamificação v2)        ║
-- ╚══════════════════════════════════════════════════════════╝

-- 10.1 Calcular tier a partir do XP
CREATE OR REPLACE FUNCTION public.get_radiation_tier(p_xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN p_xp >= 7500 THEN 'materia_escura'
        WHEN p_xp >= 6500 THEN 'diamante_vi'
        WHEN p_xp >= 6000 THEN 'diamante_v'
        WHEN p_xp >= 5520 THEN 'diamante_iv'
        WHEN p_xp >= 5060 THEN 'diamante_iii'
        WHEN p_xp >= 4620 THEN 'diamante_ii'
        WHEN p_xp >= 4200 THEN 'diamante_i'
        WHEN p_xp >= 3800 THEN 'diamante'
        WHEN p_xp >= 3420 THEN 'aco_iii'
        WHEN p_xp >= 3060 THEN 'aco_ii'
        WHEN p_xp >= 2720 THEN 'aco_i'
        WHEN p_xp >= 2400 THEN 'aco'
        WHEN p_xp >= 2100 THEN 'ferro_iv'
        WHEN p_xp >= 1820 THEN 'ferro_iii'
        WHEN p_xp >= 1560 THEN 'ferro_ii'
        WHEN p_xp >= 1320 THEN 'ferro_i'
        WHEN p_xp >= 1100 THEN 'ferro'
        WHEN p_xp >= 900 THEN 'aluminio_iii'
        WHEN p_xp >= 720 THEN 'aluminio_ii'
        WHEN p_xp >= 560 THEN 'aluminio_i'
        WHEN p_xp >= 420 THEN 'aluminio'
        WHEN p_xp >= 300 THEN 'cobre_ii'
        WHEN p_xp >= 200 THEN 'cobre_i'
        WHEN p_xp >= 120 THEN 'cobre'
        WHEN p_xp >= 50 THEN 'plastico_i'
        ELSE 'plastico'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10.2 Adicionar XP e atualizar tier atomicamente
CREATE OR REPLACE FUNCTION public.add_radiation_xp(p_profile_id UUID, p_points INTEGER)
RETURNS VOID AS $$
DECLARE
    v_new_xp INTEGER;
    v_new_level INTEGER;
    v_new_tier TEXT;
BEGIN
    UPDATE public.profiles
    SET xp = COALESCE(xp, 0) + p_points
    WHERE id = p_profile_id
    RETURNING xp INTO v_new_xp;

    SELECT CASE
        WHEN v_new_xp >= 7500 THEN 26 WHEN v_new_xp >= 6500 THEN 25
        WHEN v_new_xp >= 6000 THEN 24 WHEN v_new_xp >= 5520 THEN 23
        WHEN v_new_xp >= 5060 THEN 22 WHEN v_new_xp >= 4620 THEN 21
        WHEN v_new_xp >= 4200 THEN 20 WHEN v_new_xp >= 3800 THEN 19
        WHEN v_new_xp >= 3420 THEN 18 WHEN v_new_xp >= 3060 THEN 17
        WHEN v_new_xp >= 2720 THEN 16 WHEN v_new_xp >= 2400 THEN 15
        WHEN v_new_xp >= 2100 THEN 14 WHEN v_new_xp >= 1820 THEN 13
        WHEN v_new_xp >= 1560 THEN 12 WHEN v_new_xp >= 1320 THEN 11
        WHEN v_new_xp >= 1100 THEN 10 WHEN v_new_xp >= 900 THEN 9
        WHEN v_new_xp >= 720 THEN 8 WHEN v_new_xp >= 560 THEN 7
        WHEN v_new_xp >= 420 THEN 6 WHEN v_new_xp >= 300 THEN 5
        WHEN v_new_xp >= 200 THEN 4 WHEN v_new_xp >= 120 THEN 3
        WHEN v_new_xp >= 50 THEN 2 ELSE 1
    END INTO v_new_level;

    v_new_tier := public.get_radiation_tier(v_new_xp);

    UPDATE public.profiles
    SET level = v_new_level, radiation_tier = v_new_tier
    WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10.3 calculate_profile_xp (apenas submissions — kudos desativado)
CREATE OR REPLACE FUNCTION public.calculate_profile_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_profile_id UUID;
    v_points INTEGER := 0;
BEGIN
    v_profile_id := NEW.user_id;
    IF (TG_TABLE_NAME = 'submissions' AND NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado')) THEN
        v_points := 50;
    END IF;
    IF v_points > 0 THEN
        PERFORM public.add_radiation_xp(v_profile_id, v_points);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10.4 XP ao comentar (+5 base, +10 se dono do post)
CREATE OR REPLACE FUNCTION public.xp_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner UUID;
    v_points INTEGER := 5;
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        SELECT user_id INTO v_post_owner FROM public.submissions WHERE id = NEW.submission_id;
        IF NEW.user_id = v_post_owner THEN v_points := 10; END IF;
        PERFORM public.add_radiation_xp(NEW.user_id, v_points);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10.5 XP quando post é salvo (+8 para o dono)
CREATE OR REPLACE FUNCTION public.xp_on_save()
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner UUID;
BEGIN
    SELECT user_id INTO v_post_owner FROM public.submissions WHERE id = NEW.submission_id;
    IF v_post_owner IS NOT NULL AND v_post_owner <> NEW.user_id THEN
        PERFORM public.add_radiation_xp(v_post_owner, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10.6 XP quando post é curtido (+3 para o dono)
CREATE OR REPLACE FUNCTION public.xp_on_curtida()
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner UUID;
BEGIN
    SELECT user_id INTO v_post_owner FROM public.submissions WHERE id = NEW.submission_id;
    IF v_post_owner IS NOT NULL AND (NEW.user_id IS NULL OR v_post_owner <> NEW.user_id) THEN
        PERFORM public.add_radiation_xp(v_post_owner, 3);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10.7 XP ao seguir alguém (+2)
CREATE OR REPLACE FUNCTION public.xp_on_follow()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.follower_id IS NOT NULL THEN
        PERFORM public.add_radiation_xp(NEW.follower_id, 2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ╔══════════════════════════════════════════════════════════╗
-- ║                    11. TRIGGERS                         ║
-- ╚══════════════════════════════════════════════════════════╝

DROP TRIGGER IF EXISTS tr_check_pseudonym_limit ON public.submissions;
CREATE TRIGGER tr_check_pseudonym_limit BEFORE INSERT OR UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.check_pseudonym_limit();

DROP TRIGGER IF EXISTS tr_xp_on_submission_approved ON public.submissions;
CREATE TRIGGER tr_xp_on_submission_approved AFTER UPDATE OF status ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.calculate_profile_xp();

DROP TRIGGER IF EXISTS tr_update_like_count ON public.curtidas;
CREATE TRIGGER tr_update_like_count AFTER INSERT OR DELETE ON public.curtidas FOR EACH ROW EXECUTE FUNCTION public.update_submission_like_count();

DROP TRIGGER IF EXISTS tr_xp_on_comment ON public.comments;
CREATE TRIGGER tr_xp_on_comment AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.xp_on_comment();

DROP TRIGGER IF EXISTS tr_xp_on_curtida ON public.curtidas;
CREATE TRIGGER tr_xp_on_curtida AFTER INSERT ON public.curtidas FOR EACH ROW EXECUTE FUNCTION public.xp_on_curtida();

DROP TRIGGER IF EXISTS tr_xp_on_follow ON public.follows;
CREATE TRIGGER tr_xp_on_follow AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.xp_on_follow();

-- Try saves trigger on saved_posts
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_posts') THEN
        DROP TRIGGER IF EXISTS tr_xp_on_save ON public.saved_posts;
        CREATE TRIGGER tr_xp_on_save AFTER INSERT ON public.saved_posts FOR EACH ROW EXECUTE FUNCTION public.xp_on_save();
    END IF;
END $$;

-- ╔══════════════════════════════════════════════════════════╗
-- ║              12. RLS & POLÍTICAS                        ║
-- ╚══════════════════════════════════════════════════════════╝

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entanglement_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS para pseudônimos
ALTER TABLE public.pseudonyms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all pseudonyms" ON public.pseudonyms;
CREATE POLICY "Admins can manage all pseudonyms" ON public.pseudonyms FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
DROP POLICY IF EXISTS "Users can manage own pseudonyms" ON public.pseudonyms;
CREATE POLICY "Users can manage own pseudonyms" ON public.pseudonyms FOR ALL TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can view global active pseudonyms" ON public.pseudonyms;
CREATE POLICY "Users can view global active pseudonyms" ON public.pseudonyms FOR SELECT TO authenticated USING (user_id IS NULL AND is_active = true);

-- ╔══════════════════════════════════════════════════════════╗
-- ║                    13. ÍNDICES                          ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE INDEX IF NOT EXISTS idx_subs_tags_gin ON public.submissions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_subs_event_date ON public.submissions (event_date DESC) WHERE status = 'aprovado';
CREATE INDEX IF NOT EXISTS idx_profiles_xp_leaderboard ON public.profiles (xp DESC);
CREATE INDEX IF NOT EXISTS idx_curtidas_user_id ON public.curtidas(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_curtidas_user_submission ON public.curtidas(user_id, submission_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_radiation_tier ON public.profiles(radiation_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level DESC);

-- ╔══════════════════════════════════════════════════════════════╗
-- ║  14. RETROACTIVE XP RECALCULATION (seguro para re-executar)║
-- ╚══════════════════════════════════════════════════════════════╝

-- Reset + recalculate XP from existing data
UPDATE public.profiles SET xp = 0, level = 1, radiation_tier = 'plastico';

-- Approved submissions (+50 each)
UPDATE public.profiles p
SET xp = xp + sub.total_xp
FROM (SELECT user_id, COUNT(*) * 50 AS total_xp FROM public.submissions WHERE status = 'aprovado' GROUP BY user_id) sub
WHERE p.id = sub.user_id;

-- Comments (+5 each)
UPDATE public.profiles p
SET xp = xp + c.total_xp
FROM (SELECT user_id, COUNT(*) * 5 AS total_xp FROM public.comments GROUP BY user_id) c
WHERE p.id = c.user_id;

-- Follows (+2 each)
UPDATE public.profiles p
SET xp = xp + f.total_xp
FROM (SELECT follower_id, COUNT(*) * 2 AS total_xp FROM public.follows GROUP BY follower_id) f
WHERE p.id = f.follower_id;

-- Curtidas received (+3 each)
UPDATE public.profiles p
SET xp = xp + cr.total_xp
FROM (SELECT s.user_id, COUNT(*) * 3 AS total_xp FROM public.curtidas c JOIN public.submissions s ON s.id = c.submission_id GROUP BY s.user_id) cr
WHERE p.id = cr.user_id;

-- Kudos: DESATIVADO (tabela existe mas não é usada no código)

-- Set level and tier based on recalculated XP
UPDATE public.profiles
SET radiation_tier = public.get_radiation_tier(COALESCE(xp, 0)),
    level = CASE
        WHEN COALESCE(xp, 0) >= 7500 THEN 26 WHEN COALESCE(xp, 0) >= 6500 THEN 25
        WHEN COALESCE(xp, 0) >= 6000 THEN 24 WHEN COALESCE(xp, 0) >= 5520 THEN 23
        WHEN COALESCE(xp, 0) >= 5060 THEN 22 WHEN COALESCE(xp, 0) >= 4620 THEN 21
        WHEN COALESCE(xp, 0) >= 4200 THEN 20 WHEN COALESCE(xp, 0) >= 3800 THEN 19
        WHEN COALESCE(xp, 0) >= 3420 THEN 18 WHEN COALESCE(xp, 0) >= 3060 THEN 17
        WHEN COALESCE(xp, 0) >= 2720 THEN 16 WHEN COALESCE(xp, 0) >= 2400 THEN 15
        WHEN COALESCE(xp, 0) >= 2100 THEN 14 WHEN COALESCE(xp, 0) >= 1820 THEN 13
        WHEN COALESCE(xp, 0) >= 1560 THEN 12 WHEN COALESCE(xp, 0) >= 1320 THEN 11
        WHEN COALESCE(xp, 0) >= 1100 THEN 10 WHEN COALESCE(xp, 0) >= 900 THEN 9
        WHEN COALESCE(xp, 0) >= 720 THEN 8 WHEN COALESCE(xp, 0) >= 560 THEN 7
        WHEN COALESCE(xp, 0) >= 420 THEN 6 WHEN COALESCE(xp, 0) >= 300 THEN 5
        WHEN COALESCE(xp, 0) >= 200 THEN 4 WHEN COALESCE(xp, 0) >= 120 THEN 3
        WHEN COALESCE(xp, 0) >= 50 THEN 2 ELSE 1
    END;

-- Sync like_counts
UPDATE public.submissions s
SET like_count = (SELECT count(*) FROM public.curtidas c WHERE c.submission_id = s.id);

-- ╔══════════════════════════════════════════════════════════╗
-- ║    15. CLEANUP: Remover triggers e funções fantasma     ║
-- ╚══════════════════════════════════════════════════════════╝

-- Triggers fantasma (duplicados ou de features desativadas)
DROP TRIGGER IF EXISTS trigger_update_like_count ON public.curtidas;
DROP TRIGGER IF EXISTS on_kudos_insert ON public.kudos;
DROP TRIGGER IF EXISTS tr_xp_on_kudos ON public.kudos;
DROP TRIGGER IF EXISTS tr_xp_on_reaction ON public.reactions;
DROP TRIGGER IF EXISTS on_reaction_change ON public.reactions;

-- Funções fantasma (não referenciadas no código)
DROP FUNCTION IF EXISTS public.enqueue_kudos_notification();
DROP FUNCTION IF EXISTS public.prune_kudos_logs();
DROP FUNCTION IF EXISTS public.accept_ai_suggestions(uuid);
DROP FUNCTION IF EXISTS public.accept_ai_suggestions_bulk(uuid[]);

-- ╔══════════════════════════════════════════════════════════╗
-- ║               16. INITIAL SEEDING - QUIZ                ║
-- ╚══════════════════════════════════════════════════════════╝


-- Ensure category has a default to prevent old insert errors
ALTER TABLE public.quiz_questions ALTER COLUMN category SET DEFAULT 'geral';

-- Limpa questões de teste anteriores
TRUNCATE public.quiz_questions;

INSERT INTO public.quiz_questions (question, options, explanation, points) VALUES
-- 1. Guia de Boas Práticas
('Qual é a recomendação de resolução mínima para imagens e vídeos no Hub?', 
 '[{"text": "720p", "isCorrect": false}, {"text": "1080p", "isCorrect": true}, {"text": "480p", "isCorrect": false}, {"text": "4K apenas", "isCorrect": false}]',
 'Conforme o Guia de Boas Práticas, 1080p é o padrão para garantir alta fidelidade na comunicação científica.', 10),

('Qual é o licenciamento padrão para o conteúdo postado no Hub?', 
 '[{"text": "Copyright Reservado", "isCorrect": false}, {"text": "Creative Commons CC-BY-SA", "isCorrect": true}, {"text": "Domínio Público", "isCorrect": false}, {"text": "Uso restrito ao IFUSP", "isCorrect": false}]',
 'O Hub utiliza CC-BY-SA para garantir que o conhecimento circule mantendo os créditos aos autores.', 15),

('Qual categoria da Wiki é focada especificamente em Tutoriais?', 
 '[{"text": "Refração", "isCorrect": false}, {"text": "Síncrotron", "isCorrect": true}, {"text": "Colisor", "isCorrect": false}, {"text": "Laboratório", "isCorrect": false}]',
 'O Síncrotron é o hub de tutoriais e guias técnicos da nossa comunidade.', 10),

-- 2. Iniciação de Partículas (Calouros)
('Qual ônibus circular liga a Cidade Universitária à CPTM?', 
 '[{"text": "8012", "isCorrect": false}, {"text": "8022", "isCorrect": false}, {"text": "8032", "isCorrect": true}, {"text": "BusUSP Leste", "isCorrect": false}]',
 'A linha 8032 é a responsável pela integração com a estação da CPTM.', 10),

('O que é necessário para utilizar o CEPEUSP (Centro de Esportes)?', 
 '[{"text": "Apenas pagar mensalidade", "isCorrect": false}, {"text": "Carteirinha USP e exame médico", "isCorrect": true}, {"text": "Ser atleta federado", "isCorrect": false}, {"text": "Agendamento por e-mail", "isCorrect": false}]',
 'O acesso é gratuito para alunos, exigindo apenas a carteirinha e o exame oficial.', 10),

('Qual órgão é responsável por resolver trancamentos e matrículas no IF?', 
 '[{"text": "Pró-Aluno", "isCorrect": false}, {"text": "Seção de Alunos", "isCorrect": true}, {"text": "Diretoria", "isCorrect": false}, {"text": "CAASO", "isCorrect": false}]',
 'A Seção de Alunos cuida da burocracia acadêmica; o Pró-Aluno foca em informática.', 10),

-- 3. Emissão de Luz (Divulgação)
('Na fotografia, o que a "Regra dos Terços" busca criar no enquadramento?', 
 '[{"text": "Simetria perfeita central", "isCorrect": false}, {"text": "Equilíbrio em intersecções", "isCorrect": true}, {"text": "Redução de brilho", "isCorrect": false}, {"text": "Foco no fundo", "isCorrect": false}]',
 'Posicionar o objeto nas intersecções da grade cria uma composição mais harmônica e equilibrada.', 15),

('Para evitar ruído em fotos técnicas com celular/câmera, como o ISO deve ser configurado?', 
 '[{"text": "Sempre no máximo (3200+)", "isCorrect": false}, {"text": "Baixo (100-400)", "isCorrect": true}, {"text": "No modo Automático Noturno", "isCorrect": false}, {"text": "Depende apenas da lente", "isCorrect": false}]',
 'ISO baixo garante uma imagem limpa e sem granulação, essencial para precisão experimental.', 15),

('Qual recurso do LabDiv oferece assets visuais e tipografia oficial?', 
 '[{"text": "KitDiv", "isCorrect": true}, {"text": "Wiki-Assets", "isCorrect": false}, {"text": "Drive-Geral", "isCorrect": false}, {"text": "PhotoHub", "isCorrect": false}]',
 'O KitDiv é o pacote oficial de identidade visual para nossos divulgadores.', 10),

-- 4. Protocolos de Proteção
('Qual destes programas oferece tratamento psiquiátrico/psicoterapêutico no campus?', 
 '[{"text": "Física Acolhe", "isCorrect": false}, {"text": "Hospital Universitário (HU)", "isCorrect": true}, {"text": "Pró-Reitoria de Graduação", "isCorrect": false}, {"text": "Seção de Alunos", "isCorrect": false}]',
 'O HU possui serviço especializado de saúde mental para a comunidade universitária.', 15),

('O que o Programa ECOS foca em oferecer aos alunos?', 
 '[{"text": "Aulas de reforço", "isCorrect": false}, {"text": "Escuta e acolhimento", "isCorrect": true}, {"text": "Bolsas de intercâmbio", "isCorrect": false}, {"text": "Empréstimo de livros", "isCorrect": false}]',
 'O ECOS é focado em escuta qualificada e orientação em casos de conflitos.', 10),

('Iniciativa interna do IFUSP para suporte direto aos alunos:', 
 '[{"text": "Física Em Dobro", "isCorrect": false}, {"text": "Física Acolhe", "isCorrect": true}, {"text": "Radar-IF", "isCorrect": false}, {"text": "Hub-Social", "isCorrect": false}]',
 'O Física Acolhe é o nosso canal institucional interno de apoio ao bem-estar.', 10),

-- 5. Interações de Fronteira (Extensão)
('Qual grupo de extensão do IFUSP foca na participação de mulheres na física?', 
 '[{"text": "Vaca Esférica", "isCorrect": false}, {"text": "Amélia Império", "isCorrect": true}, {"text": "Show de Física", "isCorrect": false}, {"text": "G-Astro", "isCorrect": false}]',
 'O Coletivo Amélia Império é focado na representatividade e apoio às mulheres na ciência.', 15),

('Qual coletivo debate ética, sociedade e o papel da ciência no síncrotron?', 
 '[{"text": "HS (Humanidades no Síncrotron)", "isCorrect": true}, {"text": "Astro-Ética", "isCorrect": false}, {"text": "Lab-Debate", "isCorrect": false}, {"text": "Partículas-Sociais", "isCorrect": false}]',
 'O HS é o espaço para discussões interdisciplinares sobre ciência e humanidades.', 15),

('Onde fica o local de vivência oficial dos alunos de física (o "Aquário")?', 
 '[{"text": "Perto da Biblioteca", "isCorrect": false}, {"text": "Na Ala Didática", "isCorrect": true}, {"text": "No Prédio Principal", "isCorrect": false}, {"text": "Dentro do Pelletron", "isCorrect": false}]',
 'O Aquário é o coração da convivência estudantil na Ala Didática.', 10),

-- 6. Energia de Permanência (Bolsas)
('Qual bolsa é essencial para alunos que atuam em escolas desde o início da Licenciatura?', 
 '[{"text": "PUB", "isCorrect": false}, {"text": "PIBID", "isCorrect": true}, {"text": "FAPESP", "isCorrect": false}, {"text": "PROIAD", "isCorrect": false}]',
 'O PIBID é o Programa Institucional de Bolsas de Iniciação à Docência.', 15),

('O que significa a sigla PUB no contexto de auxílio estudantil?', 
 '[{"text": "Programa USP de Bibliotecas", "isCorrect": false}, {"text": "Programa Unificado de Bolsas", "isCorrect": true}, {"text": "Projeto Unitário de Bem-estar", "isCorrect": false}, {"text": "Portal das Unidades de Biofísica", "isCorrect": false}]',
 'O PUB unifica bolsas de ensino, pesquisa e extensão.', 10),

('Onde fica localizado o conjunto residencial estudantil da USP?', 
 '[{"text": "SAS-B", "isCorrect": false}, {"text": "CRUSP", "isCorrect": true}, {"text": "Hostel-USP", "isCorrect": false}, {"text": "Vila-1371", "isCorrect": false}]',
 'O CRUSP (Conjunto Residencial da USP) é o local de moradia estudantil.', 10),

-- 7. Estrutura da Matéria (Carreira)
('Físicos têm alta demanda no mercado de trabalho em qual destas áreas?', 
 '[{"text": "Culinária molecular", "isCorrect": false}, {"text": "Ciência de Dados e Mercado Financeiro", "isCorrect": true}, {"text": "Direito Internacional", "isCorrect": false}, {"text": "Marketing Digital apenas", "isCorrect": false}]',
 'A capacidade analítica do físico é muito valorizada em dados e finanças.', 10),

('Onde deve ser feito o cadastro para iniciar um estágio (obrigatório ou não)?', 
 '[{"text": "Diretamente na empresa", "isCorrect": false}, {"text": "No sistema oficial (Júpiter/Ateneu) e Secretaria", "isCorrect": true}, {"text": "Não precisa de cadastro", "isCorrect": false}, {"text": "Apenas por e-mail", "isCorrect": false}]',
 'Todo estágio precisa de formalização institucional via sistemas e secretaria.', 15),

('Qual habilitação do Bacharelado envolve o estudo de astros?', 
 '[{"text": "Geofísica", "isCorrect": false}, {"text": "Astronomia", "isCorrect": true}, {"text": "Nuclear", "isCorrect": false}, {"text": "Sólida", "isCorrect": false}]',
 'O Bacharelado no IF tem habilitação específica em Astronomia.', 10),

-- 8. Sistemas de Pesquisa
('Qual sistema é usado para cadastrar e acompanhar projetos de Iniciação Científica (IC)?', 
 '[{"text": "Ateneu", "isCorrect": true}, {"text": "Júpiter", "isCorrect": false}, {"text": "Janus", "isCorrect": false}, {"text": "Portal-Net", "isCorrect": false}]',
 'O sistema Ateneu é o hub da pesquisa e extensão na USP.', 15),

('Fomento à pesquisa de nível estadual (São Paulo) muito comum no IF:', 
 '[{"text": "CNPq", "isCorrect": false}, {"text": "FAPESP", "isCorrect": true}, {"text": "CAPES", "isCorrect": false}, {"text": "Finep", "isCorrect": false}]',
 'A FAPESP é a agência de fomento principal do estado de SP.', 10),

('Qual acelerador de partículas do IFUSP foi inaugurado em 1972?', 
 '[{"text": "Síncrotron", "isCorrect": false}, {"text": "Pelletron", "isCorrect": true}, {"text": "LHC-BR", "isCorrect": false}, {"text": "Cíclotron", "isCorrect": false}]',
 'O Pelletron é o icônico acelerador eletrostático inaugurado nos anos 70.', 15),

-- 9. Vetores de Carreira
('O que significa EUF para quem quer seguir carreira acadêmica?', 
 '[{"text": "Exame Unificado de Física", "isCorrect": true}, {"text": "Escola de União de Físicos", "isCorrect": false}, {"text": "Estágio em Unidades de Fronteira", "isCorrect": false}, {"text": "Entrada Única de Formatura", "isCorrect": false}]',
 'O EUF é o exame nacional para ingresso na pós-graduação em física.', 20),

('Uma das áreas de inovação para físicos na indústria:', 
 '[{"text": "Óptica de precisão", "isCorrect": true}, {"text": "Escrita criativa", "isCorrect": false}, {"text": "Design de moda", "isCorrect": false}, {"text": "Turismo espacial apenas", "isCorrect": false}]',
 'Físicos atuam fortemente em óptica, materiais e tecnologia de ponta.', 15),

('Quem pode te orientar em uma Iniciação Científica (IC)?', 
 '[{"text": "Qualquer aluno veterano", "isCorrect": false}, {"text": "Docentes e pesquisadores doutores", "isCorrect": true}, {"text": "Secretaria apenas", "isCorrect": false}, {"text": "Apenas o Diretor", "isCorrect": false}]',
 'A orientation deve ser feita por um docente ou pesquisador qualificado.', 10);

-- ════════════════════════════════════════════════════════════
-- FIM DO GOD SQL v5.0.0
-- ════════════════════════════════════════════════════════════

-- Ensure RLS policy for profiles allows administrators (new and old) to update
DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;
CREATE POLICY "Admins manage profiles" ON profiles
    FOR ALL
    TO public
    USING (is_admin())
    WITH CHECK (is_admin());


-- ╔══════════════════════════════════════════════════════════╗
-- ║               NEW MODULES (v6 Additions)                 ║
-- ╚══════════════════════════════════════════════════════════╝

-- Tabela de Mensagens para o Emaranhamento
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    attachment_id TEXT,
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para mensagens
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their context messages" ON public.messages;
CREATE POLICY "Users can view their context messages" 
ON public.messages FOR SELECT 
TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sender_id);


-- Sistema de Feedback e Relatórios (Bugs/Sugestões)
CREATE TABLE IF NOT EXISTS public.feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'other')),
    target_id TEXT, 
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para Feedback Reports
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback_reports;
CREATE POLICY "Users can insert feedback" ON public.feedback_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback_reports;
CREATE POLICY "Users can view their own feedback" ON public.feedback_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback_reports;
CREATE POLICY "Admins can manage all feedback" ON public.feedback_reports FOR ALL TO authenticated USING (is_admin());

-- ╔══════════════════════════════════════════════════════════╗
-- ║         17. STORAGE BUCKETS & POLICIES                   ║
-- ╚══════════════════════════════════════════════════════════╝

-- Enable storage RLS policies for the enrollment_proofs bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('enrollment_proofs', 'enrollment_proofs', false) 
ON CONFLICT (id) DO NOTHING;

-- Policy to allow users to upload their own proofs (using the user_id as prefix in filename logic)
DROP POLICY IF EXISTS "Users can upload their own proofs" ON storage.objects;
CREATE POLICY "Users can upload their own proofs" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK ( bucket_id = 'enrollment_proofs' AND (auth.uid() = owner OR auth.uid()::text = SPLIT_PART(name, '_', 1)) );

-- Policy to allow admins to view all proofs
DROP POLICY IF EXISTS "Admins can view proofs" ON storage.objects;
CREATE POLICY "Admins can view proofs" 
ON storage.objects FOR SELECT TO authenticated 
USING ( bucket_id = 'enrollment_proofs' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') );

-- Policy to allow users to view their own proofs
DROP POLICY IF EXISTS "Users can view their own proofs" ON storage.objects;
CREATE POLICY "Users can view their own proofs" 
ON storage.objects FOR SELECT TO authenticated 
USING ( bucket_id = 'enrollment_proofs' AND (auth.uid() = owner OR auth.uid()::text = SPLIT_PART(name, '_', 1)) );


-- --- START OF 20260305_create_adoptions.sql ---
-- Create adoptions table
CREATE TABLE IF NOT EXISTS public.adoptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    freshman_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(mentor_id, freshman_id)
);

-- Enable RLS
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can do everything
DROP POLICY IF EXISTS "Admins have full access to adoptions" ON public.adoptions;
CREATE POLICY "Admins have full access to adoptions" ON public.adoptions
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Mentors can view and create their own requests
DROP POLICY IF EXISTS "Mentors can view their own adoption requests" ON public.adoptions;
CREATE POLICY "Mentors can view their own adoption requests" ON public.adoptions
    FOR SELECT TO authenticated
    USING (mentor_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can create adoption requests" ON public.adoptions;
CREATE POLICY "Mentors can create adoption requests" ON public.adoptions
    FOR INSERT TO authenticated
    WITH CHECK (mentor_id = auth.uid());

-- Freshmen can view requests related to them
DROP POLICY IF EXISTS "Freshmen can view adoption requests related to them" ON public.adoptions;
CREATE POLICY "Freshmen can view adoption requests related to them" ON public.adoptions
    FOR SELECT TO authenticated
    USING (freshman_id = auth.uid());

-- Update timestamp on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_adoptions_updated_at ON public.adoptions;
CREATE TRIGGER update_adoptions_updated_at
BEFORE UPDATE ON public.adoptions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();


-- --- START OF 20260306_add_quiz_category.sql ---



-- --- START OF 20260306_seed_quiz_questions.sql ---
-- Seed data for IFUSP Science Hub Quizzes
-- Deletes existing questions for these categories to allow re-running safely
DELETE FROM public.quiz_questions 
WHERE category IN (
    'guia-de-boas-praticas', 
    'calouro', 
    'bolsas', 
    'divulgacao', 
    'protecao', 
    'extensao'
);

INSERT INTO public.quiz_questions (question, options, explanation, category, points) VALUES
-- GUIA DE BOAS PRATICAS
('Qual é o limite máximo para upload direto de arquivos no Hub?', '[{"text":"5MB","isCorrect":false},{"text":"10MB","isCorrect":true},{"text":"20MB","isCorrect":false},{"text":"Sem limite","isCorrect":false}]', NULL, 'guia-de-boas-praticas', 10),
('Como os vídeos devem ser enviados para a plataforma?', '[{"text":"Upload direto em formato MP4","isCorrect":false},{"text":"Apenas pelo Google Drive","isCorrect":false},{"text":"Exclusivamente via link do YouTube","isCorrect":true},{"text":"Através de Gifs animados","isCorrect":false}]', NULL, 'guia-de-boas-praticas', 10),
('Qual é a licença padrão adotada para todo o conteúdo do Hub IFUSP?', '[{"text":"Copyright Reservado","isCorrect":false},{"text":"Uso Livre Irrestrito","isCorrect":false},{"text":"Creative Commons CC-BY-SA","isCorrect":true},{"text":"Domínio Público","isCorrect":false}]', NULL, 'guia-de-boas-praticas', 10),
('O campo "Links Externos" nas submissões é indicado primariamente para contornar qual limitação técnica?', '[{"text":"O limite de 10MB de upload","isCorrect":true},{"text":"A restrição de formatação de texto","isCorrect":false},{"text":"O número máximo de palavras na descrição","isCorrect":false},{"text":"A restrição de uso de emojis","isCorrect":false}]', NULL, 'guia-de-boas-praticas', 20),
('Como o sistema reage perante nomes de usuários/apelidos ofensivos, preconceituosos ou que se passem por representantes oficiais?', '[{"text":"Uma advertência temporária de 48h","isCorrect":false},{"text":"Força a mudança silenciosa de apelido e zera o XP","isCorrect":false},{"text":"Perda instantânea de Metas do perfil","isCorrect":false},{"text":"Eles sofrem banimento instantâneo, priorizando o respeito","isCorrect":true}]', NULL, 'guia-de-boas-praticas', 10),
('Dos formatos de arquivos abaixo, qual NÃO é aceito DIRETAMENTE para upload devido à performance global da rede?', '[{"text":"PDF e Docs Textuais","isCorrect":false},{"text":"Arquivos ZIP contendo dados","isCorrect":false},{"text":"Imagens PNG","isCorrect":false},{"text":"Vídeos Longos em MP4","isCorrect":true}]', NULL, 'guia-de-boas-praticas', 10),
('Qual a real proposta do preenchimento da seção "Detalhes Técnicos" num post?', '[{"text":"Informar unicamente sua idade para a pesquisa de alunos","isCorrect":false},{"text":"Descrever os bastidores abertos da criação, técnicas e softwares usados gerando transparência","isCorrect":true},{"text":"Colocar toda a sua biografia e redes sociais","isCorrect":false},{"text":"Especificar e impor as regras de copyright fechadas aos leitores","isCorrect":false}]', NULL, 'guia-de-boas-praticas', 20),
('Na criação do seu primeiro Título Oficial para o Hub, o Guia recomenda firmemente:', '[{"text":"O uso de termos genéricos amplos para farmar interações e ganhar XP rápido","isCorrect":false},{"text":"Títulos longos contendo todo o resumo (abstract)","isCorrect":false},{"text":"Criações nominais de impacto, muito específicas sobre qual fenômeno ou conceito está sendo abordado","isCorrect":true},{"text":"Manter tudo abaixo de apenas 3 palavras","isCorrect":false}]', NULL, 'guia-de-boas-praticas', 10),
('Sobre a Categoria raiz "Lab-Div", ela possuí uma marcação severa. Isso indica restrição para publicação de quem?', '[{"text":"Focada em alunos gerais da Extensão IFUSP","isCorrect":false},{"text":"Membros oficiais do Laboratório de Comunicação e sua equipe direta","isCorrect":true},{"text":"Calouros exclusivamente do primeiro e segundo semestre","isCorrect":false},{"text":"Professores ou Pesquisadores estrangeiros de visita técnica","isCorrect":false}]', NULL, 'guia-de-boas-praticas', 20),
('Por que a hospedagem de vídeo independente do seu tamanho sempre deve passar pelo redirecionamento Oficial no Youtube?', '[{"text":"Para justificar eventuais limitações financeiras corporativas da plataforma","isCorrect":false},{"text":"Para dificultar enormemente o acesso casual e mitigar tráfego acadêmico","isCorrect":false},{"text":"Garante o carregamento instantâneo, compatibilidade fluída universal e com a máxima qualidade possível já nativa em celulares","isCorrect":true},{"text":"Pois vídeos contabilizam visualizações obrigatórias com lucro externo","isCorrect":false}]', NULL, 'guia-de-boas-praticas', 20),

-- CALOURO
('Qual destas famosas linhas urbanas estudantis NÃO circula normalmente pelos portões nos fins de semana e madrugadas da CUASO?', '[{"text":"8012-10","isCorrect":false},{"text":"8022-10","isCorrect":false},{"text":"8082-10","isCorrect":true},{"text":"A Linha Amarela Inteira","isCorrect":false}]', NULL, 'calouro', 10),
('O cartão BUSP garante gratuidade no transporte estudantil urbano nas fronteiras universitárias. Se você não usar ele ou esquecê-lo:', '[{"text":"Deverá correr riscos e dar dinheiro vivo ao condutor","isCorrect":false},{"text":"Haverá um bloqueio severo e imediato das catracas nas linhas citadas até conseguir repô-lo","isCorrect":false},{"text":"Vai incorrer apenas na tradicional tarifa cobrada normalmente via seu próprio Bilhete Único comum da SPTRANS","isCorrect":true},{"text":"Será banido permanentemente dos Restaurantes da USP","isCorrect":false}]', NULL, 'calouro', 10),
('No pântano sagrado de opções gástricas da Física, caso o Bandejão Matemático local esteja sem tempo hábil ou muito lotado, os alunos buscam qual rota como salvadora habitual que costuma ter nota e comida ainda satisfatória?', '[{"text":"O restaurante principal da Química vizinho","isCorrect":false},{"text":"O longínquo restaurante alternativo do térreo da Prefeitura Universitária","isCorrect":true},{"text":"O Bandejão Metálico Central com suas filas em caracol gigantescas","isCorrect":false},{"text":"Somente e exclusivamente o Refeitório de Professores das Letras","isCorrect":false}]', NULL, 'calouro', 20),
('O templo das glórias aeróbicas, CEPEUSP, só abre seus portões livres e diários a você após a realização obrigatória de qual rito primário?', '[{"text":"Efetuar rigoroso preenchimento do passe via Pix da Taxa mensal ou Doação Atlética","isCorrect":false},{"text":"Se declarar por juramento como Atleta Oficial da Faculdade","isCorrect":false},{"text":"Agendar, comparecer, fazer exame médico avaliativo local e portar virtualmente logo sua Carteirinha USP oficial (e-Card)","isCorrect":true},{"text":"Realizar agendamento da quadra restrito num sistema burocrático obscuro do Júpiter com incríveis 6 longos meses de antecedência e sorte","isCorrect":false}]', NULL, 'calouro', 10),
('Em qual portal físico (Seção oficial) recai a responsabilidade do sagrado processamento vital da Burocracia Mestra: resolvendo cancelamentos, trancamentos e requerimentos estranhos e vitais de grade e matrícula acadêmica na USP?', '[{"text":"Na blindada Recepção da Diretoria de Professores Oficiais","isCorrect":false},{"text":"No espaço estudantil, popularmente vivenciado na ruidosa sala Pró-Aluno conectada às filas de impressão","isCorrect":false},{"text":"No reduto solene habitado nos corredores como Setor de Seção de Alunos local","isCorrect":true},{"text":"Exclusivamente nas mãos de Deuses da Secretaria Geral e Autônoma da Pós-Graduação Federal","isCorrect":false}]', NULL, 'calouro', 20),
('Qual principal finalidade e essência tecnológica da imponente e vital sala Pró-Aluno?', '[{"text":"Refúgio silencioso exclusivo dedicado para os almoços não detectados das repúblicas","isCorrect":false},{"text":"Sendo consagrado e mantido como grande Hub estudantil nativo da computação: liberando as vitais cotas para imprimir trabalhos acadêmicos urgentes e dar acesso livre aos hardwares com softwares oficiais essenciais dos laboratórios","isCorrect":true},{"text":"Centralizar esportivamente e alocar armários a todos times Atléticos e Extensões Desportivas do IF","isCorrect":false},{"text":"Servir primariamente de grande palco para pausas e descansos longos dormindo no tapete nas aulas das três da tarde","isCorrect":false}]', NULL, 'calouro', 10),
('A bíblia universitária (Guia de Integração USP IF) crava com vigor o dogma para Iniciações Científicas: A melhor forma absoluta para conseguir conectar sua existência e cérebro jovem com o renomado Professor Pesquisador experiente é através de qual abordagem?', '[{"text":"Entrar na Fila eterna de espera de e-mails em silêncio absoluto e fatalmente sentar para apenas aguardar que a Reitoria de seu nome","isCorrect":false},{"text":"Pela virtuosa Proatividade Estratégica Máxima: elaborar e engatilhar seu forte email formal introdutório de impacto manifestando direto e firme interesse para fechar um encontro formal com horários flexíveis para uma entrevista em pessoa em sua própria sala ou reduto experimental","isCorrect":true},{"text":"Aprovação unicamente exigindo no mínimo nota 10 rigorosa perfeita durante o primeiro complexo laboratório inicial de sua vida unindo em seguida uma aprovação em Seção de Alunos no balcão","isCorrect":false},{"text":"O clássico preenchimento virtual do sistema de Bolsas Unificadas nos confins automáticos digitais sem nenhum humano envolvido","isCorrect":false}]', NULL, 'calouro', 20),
('Caso os ares burocráticos soprem ao favor e você ingresse como Beneficiário Fixo Oficial socioeconômico reconhecido do sistema sagrado (O PAPFE), como você realiza habitualmente a recarga mística de seus créditos calóricos de subsistência nas opções das praças de alimentação (No Cardápio APP) ?', '[{"text":"Uso unicamente das transferências relâmpagos contemporâneas de liquidez (Sistema PIX) ao longo da semana","isCorrect":false},{"text":"A complexa engrenagem matricial da Universidade carrega e subsidia diariamente seus créditos magicamente e de forma totalmente e maravilhosamente automatizada a você e nada mais precisa ser tocado e recarregado.","isCorrect":true},{"text":"Com cheques especiais chancelados na entrada pelo CA","isCorrect":false},{"text":"Digitando um complexo token aleatório nas gélidas catracas físicas na porta","isCorrect":false}]', NULL, 'calouro', 10),
('Segundo as dicas milenares, para alcançar a salvação térmica, proteica, mental, relacional da sua estabilidade vital mental no campus qual conselho principal reina?', '[{"text":"Entenda como verdade eterna que pesquisadores e professores da Física, são de essência humana, são grandes lideres solitários com suas pesquisas que buscam proativamente cabeças interessadas jovens. Demonstre isso como mola propulsora, o famoso (Pulo do Gato) networkiano acadêmico na base pura de iniciativa no seu e-mail aos doutores","isCorrect":true},{"text":"Foque todas suas madrugadas trancado e ilhado eternamente aos seus cálculos fechados das provas antigas exilado e purista","isCorrect":false},{"text":"Seu currículo deve estar imaculadamente impresso em tipografia Serifada especial de jornalismo impresso.","isCorrect":false},{"text":"Torne-se essencialmente íntimo protetor e vigia absoluto solidário da gloriosa portaria principal garantindo networking de trânsito","isCorrect":false}]', NULL, 'calouro', 20),
('Nas lendas noturnas diz-se que se perder debaixo das tormentas sem o BUSP na volta trará angústias pesadas, mas apenas as linhas circulares diárias urbanas e oficiais te salvam, quantas existem catalogadas e listadas fundamentalmente para um calouro?', '[{"text":"Apenas e unicamente longas 5 vias de circulares independentes","isCorrect":false},{"text":"Um vasto número que oscila mas se mantem sólido em cerca de exatas 4 grandes deusas de rotas de asfalto cruciais: 8082, 8083, 8084, 8085-10 no Campus diário base do sol","isCorrect":true},{"text":"Sete exatas saídas para Butantã e a região central e Morumbi em massa circular no app cardápio de linhas unificadas","isCorrect":false},{"text":"Inúmeras","isCorrect":false}]', NULL, 'calouro', 20),

-- BOLSAS
('Para o apoio fulcral contínuo e diário contra instabilidades financeiras mantendo o chão estudantil de calouros com graves complexidades ou vulnerabilidades vitais financeiras a USP cede o Auxílio contendo transporte, e dezenas de apoios alimentares focado qual grande bandeira/sigla?', '[{"text":"O auxílio PROIAD unificado a alunos carentes","isCorrect":false},{"text":"Programa de Apoio à Permanência e Formação Estudantil oficialmente (O grande e conhecido auxílio PAPFE), que centraliza alimentação e a estabilidade socioeconômica unicamente","isCorrect":true},{"text":"Foco unificado nas bolsas exclusivas do PIBID estaduais e governamentais do MEC","isCorrect":false},{"text":"Programa estadual massivo PEEG de reitoria estadual global financiada externamente","isCorrect":false}]', NULL, 'bolsas', 10),
('Há nos campos dourados do campus os blocos famosos de sobrevivência habitacional chamados intimamente pela abreviação mítica que fornece quartos de alojamentos como prêmio após longa burocracia focada nas carências da moradia gratuita social do campus na cidade universitária brasileira, como ele se revela batizado publicamente por décadas e sendo hoje um formidável grande Hub?', '[{"text":"Os Campos do CEPEUSP com suas tendas oficiais atléticas.","isCorrect":false},{"text":"Prédios da Seção oficial e Pró-Aluno com salas extras da biblioteca","isCorrect":false},{"text":"O popularmente e gigantesco aglomeramento residencial histórico estudantil complexivo e central oficial batizado (CRUSP)","isCorrect":true},{"text":"Prédios da moradia paralela da física","isCorrect":false}]', NULL, 'bolsas', 10),
('Se na graduação pulsar em seu núcleo vital, um forte apelo ardente focado totalmente no destino em promover Educação Brasileira de vanguarda com integração na carreira Docente pesada nas redes diretas do caos das classes e cotas governamentais o seu incentivo público do MEC ou governamental base e alvo é?', '[{"text":"PIBIC (O apoio ao intelecto investigativo teórico em silêncio individual)","isCorrect":false},{"text":"Inovação massiva industrial de startups no PIBITI FAPESP isolado e forte financeiramente","isCorrect":false},{"text":"Iniciação profunda forte pedagógica, a docência de berço escolar focado puramente e integral na adaptação no PIBID em sala formativa teórica e humana direta","isCorrect":true},{"text":"SEDUC na secretária com editais técnicos distantes","isCorrect":false}]', NULL, 'bolsas', 10),
('Ao olhar para os programas tradicionais USP o incentivo ao ensino pelo (PEEG) significa que sua vocação para atuar focará essencialmente em:', '[{"text":"Pura pesquisa científica rigorosa individual ao lado recluso na mesa do orientador para escrever abstracts complexos numéricos solitários.","isCorrect":false},{"text":"Apoios fortíssimos vitais primordiais focado primordialmente no aprimoramento contínuo de disciplinas. Focando na melhoria unificada e viva forte colaborativa focado massivamente como Monitoria de suporte com materiais e orientações junto a docente e as aulas vivas.","isCorrect":true},{"text":"Patentes e tecnologia pura.","isCorrect":false},{"text":"Desenvolvimento e formatação de robôs em escolas públicas sem acesso a tecnologia alguma no campo","isCorrect":false}]', NULL, 'bolsas', 20),
('O principal programa geral da bandeira USP como iniciativa mais imponente, vasta e unificada se baseando como alicerce fundamental base se chama (O famoso formato e edital oficial PUB). Em quais colunas vertebrais da tríade acadêmica formidável USP o jovem pupilo pode focar sua ação na bolsa?', '["Atua exclusivamente apenas nos eixos profundos do puro e complexo setor sagrado (Ensino Teórico isolado e longo)", "Uma imersão completa na academia permitindo integração vasta na tríplice com ações de (Ensino) suporte, (Pesquisa) intelectual junto ao professor, (Extensão) braço à rua conectando e (Cultura) integradora simultânea formando um portal de formação abrangente robusto.", "Se concentra em editais para Esporte, Eventos Físicos Olímpicos e ações lúdicas musicais na banda.", "Dá bolsa com obrigação de fazer intercâmbios pelo exterior na graduação toda sem pisar na faculdade brasileira até se formar."] ', 1, 'bolsas', 10),
('PIBIC dita e aponta fundamentalmente sua estrutura milenar oficial universitária na iniciação acadêmica introduzindo como grande mestre os dogmas de qual ramo sagrado principal e qual destino?', '[{"text":"Direção às práticas e dogmas diretos industriais focado nas leis do mercado acionário local","isCorrect":false},{"text":"Foca principalmente e estritamente no formato massivo na tutória da educação infantil com o estado e suas bases fundacionais","isCorrect":false},{"text":"É pilar de fundação imutável com a introdução do aluno profundamente metodologicamente formalizando na raiz rigorosa do imenso purismo e do pensamento base científico prático na investigação investigativa das matrizes e das grandes teorias e análises numéricas e documentais","isCorrect":true},{"text":"Trabalho manual intenso prestado e trocado pela burocracia na seção e balcões da recepção do departamento físico do bloco histórico","isCorrect":false}]', NULL, 'bolsas', 10),
('Focar o prumo da carreira rumo na criatividade física experimental buscando viés puro nas tecnologias mercadológicas e com as aplicações mais visíveis, fortes, físicas orientadas em inovações reais foca exatamente a seta mirando a grande Iniciação voltada a inovação, chamada oficialmente ao discente e bolsista qual projeto na lista em destaque?', '["PIBID Teórico", "As antigas monitorias base PBIC de laboratório fixo de pesquisa teórica", "A grandiosa bolsa ou eixo da Pró Reitoria ou fundações do (O clássico PIBITI – Inovação de Desenvolvimento nas esferas das inovações tangíveis e patentes palpáveis em suas métricas de laboratório)", "Ações do SEDUC, de cultura de professores de escolas públicas do asfalto na várzea escolar brasileira do campo ou em favelas massivas complexas locais do município sem infra."] ', 2, 'bolsas', 20),
('A gerência principal das verbas, dos cravados editais específicos da unidade, com ações vitais exclusivas das burocracias limitadas (Pró-Aluno bolsas do bloco e ajudas dos departamentos e apoio gerido de dentro, laboratorial e técnico focado da unidade em si) fica inteiramente concentrado sendo da responsabilidade pura nas garras de:', '[{"text":"Ministério Direto do MEC lá no ar refrigerado de Brasília burocraticamente decidindo de ano a ano","isCorrect":false},{"text":"Na majestosa Pró Retoria Unificada da reitoria magna em um prédio fechado de São Paulo gerando em planilhas longas tudo e enviando o dinheiro","isCorrect":false},{"text":"Apenas por professores individuais bilionários locais","isCorrect":false},{"text":"As chamadas Apoios da Unidade Pró Alunos em departamentos menores e burocracia com secretária de alunos locais restritos","isCorrect":true}]', NULL, 'bolsas', 20),
('Em qual das lendas vivas o acadêmico calouro atento (ou lobo curioso digital), desbrava para rastrear mensalmente sob neblina os obscuros, não divulgados e raríssimos, e inusitados gigantes editais escondidos e os extras de incentivo base na permanência, pertencimento e direitos?', '[{"text":"Nos grupos não oficiais da reitoria desativada no extinto e sombrio fórum de exatas antigo de 2005","isCorrect":false},{"text":"Nas longas buscas diárias nos classificados ou sites externos aleatórios da Fundação estatal local e nacional no painel governamental digital estadual local","isCorrect":false},{"text":"Rastreando pelo diário e sagrado radar interno do imenso Portal central Pró-Reitoria focado: A (Família oficial USP na PRIP portal com todos incisivos vitais chamados das vagas ativas de permanência)","isCorrect":true},{"text":"Atendendo todas reuniões da atlética buscando papéis físicos voando no teto em gincanas abertas anuais do colisor de sexta","isCorrect":false}]', NULL, 'bolsas', 20),
('O grande PROIAD e seu espírito, visa auxiliar na força intelectual do Instituto promovendo focado como missão em qual dos campos do suporte na convivência teórica diária e adaptação e nota do calouro e discente recém chegado e apavorado?', '[{"text":"Visa construir auxílio financeiro focado, pagando por moradias em blocos externos como o Crusp temporários por aprovação","isCorrect":false},{"text":"Visa ajudar os Professores a ter assessores particulares em viagens do currículo externo","isCorrect":false},{"text":"É Foco pedagógico essencial agudo focado promovendo o resgate incisivo na adaptação de grades promovendo auxílios através fundamentalmente base nas ações na tutoria especializada intelectual de base contínua em orientação pedagógica aos Discentes e colegas por Monitorias contínuas internas em Física e Cálculo complexo com horários firmes da unidade de Base acadêmica e apoio direto humanizado em problemas estudantis matemáticos do caos diário","isCorrect":true},{"text":"Focando em financiar intercâmbios anuais de graça na Alemanha e prêmios na suíça teórica em prêmios anuais longos e caríssimos unificados apenas após se formar, dando títulos fora","isCorrect":false}]', NULL, 'bolsas', 10),

-- DIVULGACAO
('Qual é a regra sagrada e primordial e técnica ancestral, ditada para fotografar ou capturar imagens formidáveis visuais estéticas focada e listada no eixo de comunicação e fotografia do manual Hub?', '[{"text":"Proporção de Newton ou o infinito simétrico absoluto nos pixels enfileirados retilíneos nos aparelhos magnéticos ópticos complexos gigantes a 4K de lente de ressonância ou feixe eletrônico longo","isCorrect":false},{"text":"O famoso Paradoxo dos terços negativos ou enquadramento de diagonais perdidas pela sala nos tetos","isCorrect":false},{"text":"Posicione e utilize como sua arma mestre óptica a imortal Regra de Terços clássica (Regra Dos Terços): Posicionar seu objeto ou alvo de interesse sagrado rigorosamente posicionado firme e alinhado diretamente na famosa e milenar intersecção de suas grades divididas em 3 focos horizontais e as três verticais, originando em profundidade o equilíbrio visual magnético estético focado perfeito.","isCorrect":true},{"text":"O sagrado foco absoluto desfocado das regras abstratas de fotografia escura","isCorrect":false}]', NULL, 'divulgacao', 10),
('Buscando registrar o frescor tecnológico fotográfico de uma bancada visual num smartphone, sobre evitar e dominar os temidos ''ruídos visuais'' ou granulados feios nas captações escuras qual pilar ou norma ditatorial da lente deves impor ao ISO do modo profissional na fotografia?', '[{"text":"Utilize uma ação aleatória da IA da câmera no painel em automático ou de forma arbitrária para compensar luz deixando ISO de 1500 na sombra até ficar branco no fundo total explodindo no limite longo","isCorrect":false},{"text":"Mantenha firmemente com austeridade impiedosa sobre a máquina focado com ISO rígido, incrivelmente Baixo cravado no espectro numérico ideal limpo ali mantido estático girando entre o intervalo sólido técnico fixado nas diretrizes como [Cem a no máximo Quatrocentos a depender do lux do sensor no instante final do obturador] para o brilho real da máquina física sem amplificar ganhos do chip causando a desgraça de milhares de pixels brancos irreais de ruído visual na física na matriz visual","isCorrect":true},{"text":"Ajuste e levante a matriz unicamente em oitocentos pontos cravados isolado pelo fotômetro focado travado, de manhã nas vitrines transparentes de janelas solares explodindo","isCorrect":false},{"text":"Mantenha infinito","isCorrect":false}]', NULL, 'divulgacao', 20),
('Velocidade brutal: o brilho intenso cegante em flash contínuo dos Lasers potentes da USP explodindo, faíscas experimentais pulsantes energéticas frenéticas dos arcos e espectros dinâmicos; Exigem um fotógrafo de pulso que entenda essencialmente domar sua luz perante a cena veloz ao manipular sua câmera. O pilar manual MÁXIMO da captura rápida ensinado em física de luz na criação foca no controle exclusivo vital de:', '[{"text":"Embaçar feroz a sua Lente frontal para absorção da energia com filtros ou géis amadores da coloração de arco iris vibrante falso","isCorrect":false},{"text":"Balançar as Matrizes exatas do canal Branco Absoluto de Kelvin visual puro neutro em nuvens frias num dia chuvoso contínuo na câmera e ajustar saturação digital azul","isCorrect":false},{"text":"Deitar ao longo chão do chão fixo no chão focando num micro tripé nas estacas paradas sem tremer e fazer um ISO em 1 milhão falso escurecendo unicamente","isCorrect":false},{"text":"Regular cirurgicamente as Exatas restrições da Exposição global do prisma controlando simultaneamente rigorosa ou o Tempo de Corte do formidável e imponente [Obturador ou Shutter Time], controlando como mestre absoluto do tempo para registrar perfeitamente estático e o flash sem arrastos fantasmagóricos na tela visual fixada como laser real sem borrão ou clarão massivo","isCorrect":true}]', NULL, 'divulgacao', 20),
('Na era da redação, prender a internet exige técnica humana sublime. Para atrair os leitores nas narrativas do Hub USP a redação de ciência como instruída deve arquitetar perfeitamente seu texto, qual roteiro é passado como alicerce textual na escrita?', '[{"text":"Mire primeiro numa enxurrada de piadas forçadas juvenis e feche vendendo links diretos a sua lojinha no pé, sem compromisso na escrita","isCorrect":false},{"text":"Engate o primeiro parágrafo denso e repleto longo com todas suas métricas quânticas herméticas gregas e pesadas fórmulas insolúveis numéricas impenetráveis as mentes ignorantes sem pena","isCorrect":false},{"text":"O método ancestral humano ensinado é: Inicie no gancho forte visceral humano atraente com (O Famoso Porquê), Em seguida abra o leque ao núcleo central e destrinche a base de seu (Grande O fantástico Mecanismo ou fenômeno daquele momento) para ao fim, explodir com clareza o seu ponto chave final como o encerramento grandioso no fechamento demonstrando nitidamente seu (Gigante Impacto Social Humano) no fim","isCorrect":true},{"text":"Escreva numa linguagem erudita antiga de poeta falido usando longos poemas sem sentido prático de forma medieval barroco obscuro num ritmo arcaico focado a professores antigos","isCorrect":false}]', NULL, 'divulgacao', 10),
('Em sua glória textual milenar, na aba ou pilar da Comunicação Estética Acadêmica do IFUSP oficial qual sentença profunda traduz ou imortaliza a essência lírica final com beleza conceitual a missão sagrada de Divulgação da Ciência dentro das nossas missões Lab-Div listada do guia do portal?', '[{"text":"A Ciência é difícil pesada engessada para ser lida e quem entender o pilar vencerá como grande campeão numérico absoluto","isCorrect":false},{"text":"Sempre tentar e persistir fazer e criar longos complexos gráficos frios da forma mais seca crua analítica pesada densa para mostrar aos fracos do que a ciência real densa na terra forte é realmente composta e complexa nas noites.","isCorrect":false},{"text":"Comunicar Divulgação da essência das estrelas com a divulgação científica é nada mais complexo como o fascinante [Mágico e Fantástico Transporte vivo de vastos mundos dos Conceitos extremante e densos em ciência exata profunda adaptados com esplendor da luz focando encantar perfeitamente para mentes novas jovens ou para qualquer intelecto dotado e imbuído puramente na mais nobre atração pela grande, velha e viva e pulsante maravilha na imensa alma incansável da eterna mente humana unicamente curiosa da terra.]","isCorrect":true},{"text":"Nossos gráficos são feitos unicamente nas bases federais pra impressionar reitoria visando recursos monetários grandes","isCorrect":false}]', NULL, 'divulgacao', 20),
('Qual ferramenta de ouro oficial que brilha gloriosamente embalada aos discentes e foi criada pelo time formidável técnico de design exclusivo local com fonte matriz tipográfica real para facilitar aos amadores a criação genial online visual gráfica e textual com recursos prédigos e de imenso polimento estético final padronizando tudo internamente listado no Guia de luz Hub?', '[{"text":"Canva IF Free App","isCorrect":false},{"text":"Mega Design Maker USP Edition Tool","isCorrect":false},{"text":"Assets USP Cloud Visual Pro Premium Vector Box","isCorrect":false},{"text":"O cobiçado, e essencial, pacote formidável de Identidade Visual Mágica, apelidado afetuosamente em nosso Hub e base oficial baixável pelas almas como [A pasta oficial no Zip chamada O KitDiv, mantenedora do grande estilo, logo e da estética real da nossa nobre alma acadêmica física oficial da Universidade]","isCorrect":true}]', NULL, 'divulgacao', 10),
('Como solicitar luz divina ou orientações avançadas reais, suporte manual visual nas suas epifanias criativas se sentindo bloqueado visualmente sobre imagens para criar com qualidade no Hub ou rede aos olhos dos deuses da formatação visual e arte e técnica oficial e design?', '[{"text":"Sair num corredor vazio aos finais da tarde do centro unificado ou na atlética no pátio e ir gritando pedindo que o líder estético apareça instantaneamente lhe dê suporte focado ao vivo nas artes das canetas dele mágicas e milagrosas nos portais do instituto da Física em si isolado","isCorrect":false},{"text":"Realizar oficialmente nos caminhos apontados um agendamento pontual das aberturas em uma [Sessão Oficial e Privada profunda de Mentoria com toda a brava unificada Equipe capacitada focada base, com suporte especializado completo humanista do Reduto e centro centralizado criativo dos mestres das artes da luz e de comunicação em design geral oficial focado ali residentes no histórico centro no Lab-Div central no IFUSP] na seção portal hub focada nisso exato virtualmente das abas","isCorrect":true},{"text":"Ler milhões infinitos cegos dos velhos vídeos cansados estocados em discos numéricos nos pátios no Youtube indiano amador nos tutoriais quebrados focado ao longo e sofrido na eternidade temporal até desvendar em silêncio ou em dor o segredo sagrado das luz e fotografia de flash a força mecânica num software ou painel duro analógico do editor de fotos pesadas","isCorrect":false},{"text":"Implorar na coordenação","isCorrect":false}]', NULL, 'divulgacao', 10),
('Quando a objetiva aponta para a massa pesada dos aparatos laboratoriais de tubos trançados, uma captura ou ensinamento sublime do fotógrafo em arte sobre ângulos ensina e visa revelar qual atributo e sensação de mistério máximo na massa da imagem gerada das máquinas frias de ótica ou dos imãs de matéria inanimada ou da máquina física morta no ambiente fechado aos focos e lentes de fotos macro revelando tudo da matriz visual ao admirador no pátio visual hub?', '[{"text":"Sua mais perfeita revelação sobre toda total ausência de poeira varrida com foco nas limpezas perfeitas isoladas, de uma forma chata chapada na profundidade da sua superfície no papel plano.","isCorrect":false},{"text":"Mostrar toda a incrível poeira mística flutuando e sujeira na escuridão revelando desleixo genial da sua incrível rotina humana no chão molhado sem luz natural nos tapetes das janelas das portas grandes.","isCorrect":false},{"text":"Alvo final deve procurar e buscar o seu sagrado mistério, o viés exato perfeitamente arquitetural tridimensional mágico, capturando e mirando buscar o encontro do ângulo mais belo revelando nos eixos ou lentes ao espetador a mais pura forte intrincada sensação volumétrica, peso metálico visual com toda a [Tridimensionalidade genial sublime complexa ou geométrica complexa inigualável estonteante imponente e fascinantemente mágica da forma tridimensional grandiosa estrutural e sólida arquitetural interna, do emaranhamento de seus cabos colados aos cantos exóticos em perspectiva 3d orgânica rica visual e poética em ângulos não comuns mágicos e exóticos ou épicos de seus potentes massivos ou complexos e detalhistas Equipamentos sagrados das experiências] unicamente revelados nas fotos no portal do estudante de Exatas da humanidade acadêmica do brasil de amanhã","isCorrect":true},{"text":"Sua feiura massiva sem cor para os fundos tristes brancos do papel em tom azul das lâmpadas longas sem filtros em ângulos normais do olho na testa","isCorrect":false}]', NULL, 'divulgacao', 20),
('Nos celulares atuais, um milagre visual perante telas que saltam lasers e fótons selvagens intensos ao lutar e disputar contra a fúria das matrizes em contraste num recinto sombrio. Quando há enorme fúria e abismo exato perante sombras escarpadas espalhadas isoladas cruas brutas pesadas longas massivas gigantes ao redor num espectro visual fotométrico sombrio pesado escuro de sombras gigantes. Por isso utilizamos na ciência visual fotográfica da era digital diária o uso do chamado toque mágico travado eterno de dedo [Long-Press de Foco / AE-AF Lock e da sua regulação deslizante da força lux imposta de Exposição de brilho contínuo travado longo massivo focada visual pesada isolada travada fixo manual massivo]. Por qual necessidade imperiosa e real física real mecânica exata digital opto do display celular faz-se essa necessidade técnica exótica nas noites sombreadas?', '[{"text":"É por superstição mística antiga de design ou enfeite ou visual das montagens no feed falso animado virtual.","isCorrect":false},{"text":"É usada puramente e de fato primordial exato no sistema móvel diário virtual prático portátil de software manual para impedir fundamental que sua máquina viva com software genérico mudo e burro clareie sozinho os locais escuros aleatórios (ruídos) estragados falsos, focando unicamente não ou para tentar segurar impedir ou então afastar longe e [Evitar com garras físicas a toda drástica luz automática de iluminação forçada nativa cegante que fatalmente destrói ou como se falado visual estourem, apagando queimando cegando fatalmente explodindo brancos brilhantes irrecuperavelmente mortais as partes vitais iluminadas mágicas e fascinantemente luminosas chaves exatas fundamentais do grande evento brilhante (Luz laser mágica sagrada vibrante focada no centro / e ou displays em neons brilhantes únicos finos delicados de fios reluzentes vivos exóticos no campo exato ou amostras mágicas) sumam afogados ou extintos com todos e os vastos brilhos imensos nas paredes perante ao feio do brilho contrastado geral noturno forçado automático do escuro das janelas no resto negro gigante num recinto em laboratórios físicos], assim matendo toda magia brilhante pontual na sombra","isCorrect":true},{"text":"Unicamente em fechar a tela pra não ver a luz real sem olhar na gravação de nada ou da ciência isolada cega.","isCorrect":false},{"text":"Desativar o app digital por segurança do sistema das fábricas pra economizar uma bateria extra em dia chuvoso contínuo isolado pra ficar off","isCorrect":false}]', NULL, 'divulgacao', 20),
('Se eu estruturar toda arquitetura narrativa lírica fantástica sedutora numa introdução e em ganchos e pontes técnicas mecânicas teóricas físicas puras mágicas de ensinamento nos conteúdos formidáveis centrais complexos analíticos fortes puros matemáticos precisos milenares eternos no grande e denso desfecho da minha jornada narrativa final exata (No grande e derradeiro Final épico exato estrutural ou moral do fim narrativo puro de divulgação) da minha peça genial criada escrita aos comuns jovens humanos a base do guia, manda terminar com base ou com grande toque fechado ressoante final de foco mirando sobre exatamente essencialmente qual reflexo majestoso impacto sagrado último para brilhar eternamente ressoar humano nas almas dos cidadãos nas ruas? ', '["Na citação exata rigorosa num formato amargo frio amarrado restrito em modelo bibliográfico das mais finas formatações chatas antigas burocráticas infinitas normas eternas exatas numéricas e distantes longas e densas chatas da base literária alemã morta restrita.", "Terminar mandando todos estudar matemática ou irão padecer como tolos nas filas ou serem inúteis fardos fracos analíticos para a evolução das pesquisas globais.", "Na glória magna ressoante: Refletir encerrando na maior glória humana do eco ressonante moral de um conto sobre o esplêndido exato desfecho social global ou exato real reflexo fascinante ou no real, prático ou futurista no (Grande fascinante mágico Impacto Social e Físico de longo alcance ou vital na mudança Humana no planeta Terra que este exato evento ensinado maravilhoso causará ou influenciará formidavelmente no meio vivo real cotidiano prático da humanidade, fechando essa grande fenda das fórmulas exatas na vida física diária viva). Tornando tangível algo frio físico distante e quântico.", "Num último, imploro pedinte ou pedido amado por repletos pix de amor e glórias infindáveis de likes longos eternos engajados no pátio gigante social num formato desesperado infinito de engajamento do feed do TikTok em letras de fogo animado vazio falso sem ética visual do formato raso comum diário sem reflexo ou intelecto final do ensinamento central real isolado na parte densa e fina científica final."] ', 2, 'divulgacao', 20),

-- PROTECAO
('No tecido complexo das denúncias extremas, focado contra a gravíssima sombra opressora de casos ou agressões violentas isoladas extremas fortes morais éticas sexuais de violação ou assédios discriminatórios crônicos intensos exatos crônicos pesados ou opressivos severos do Assédio, Discriminação agressiva extrema grave letal tóxica e em profundas das violações duras cruéis perversas profundas absolutas e inaceitáveis dos nobres Direitos globais invioláveis Humanos no meio da Universidade em geral de modo contínuo, a PRIP acionou nos portais sua sagrada lâmina oficial e protótipo digital oficial forte para a justiça cega ou auxílio forte ético inquebrável de central que canaliza toda essa carga bruta gigante na central no campus universal. Qual é a denominação incisiva exata desta agência gigante ou portal central de socorro cego das águas turbulentas da reitoria contra assédio e a dor ética universal citada?', '[{"text":"A Sindicância Armada Acadêmica isolada","isCorrect":false},{"text":"A base da Defensoria das Reitorias ou de delegacias isoladas antigas nos portais","isCorrect":false},{"text":"A grande forte e famosa alicerce ético unificado vital chamada O formidável e sigiloso blindado [Sistema formidável da USP unificado de central de Acolhimento forte, o grandioso e absoluto canal e via central institucional e seguro (SUA – Sistema ou site oficial da PRIP das vítimas e queixas unificado de Acolhimento forte do campus geral reitor federal da universidade) sendo canal e fenda de escape de luz]","isCorrect":true},{"text":"Um mural físico grande escuro com recados atrás da cantina","isCorrect":false}]', NULL, 'protecao', 10),
('Sob as estrelas ou os portais e da legalidade civil em Portarias estaduais e humanas exatas (e.g. As Portarias da vida e direitos ou da PRIP n 059 inclusiva atual), com ênfase focada da mais densa importância na real justiça legal no aprendizado das diferenças ou dos estímulos neurológicos dos diferentes na academia ou inclusivos, Qual subgrupo ou coletividade especial na física acadêmica em avaliações detém expressamente garantidos via foros a concessão, adaptação em direito sagrado formal e cego garantido sem burocracia complexa extra na hora cravada das provas pesadas densas da luz, a benesse vital da garantia absoluta isolada a exatas Avaliações sendo aplicadas rigorosamente firmes no ambiente ou em salas blindadas exclusivas exatas separadas insonorizadas com a extrema proteção em bloqueios via o acesso livre e resguardado sem brigas do direito cego a protetores acústicos fortes gigantes e espessos físicos na testa ou com abafadores dos profundos ruídos e barulhos agressivos da sala de focos exatos ou dor sensorial no inferno agudo dos decibéis de cadeiras? ', '["Quaisquer estudantes normais atrasados exaustos que sofram fúria de ter esquecido suas antigas provas complexas isoladas longos nas vésperas noturnas longas sem café puro do caos estudantil amargo no estresse do pátio nas folhas brancas de caneta secas no prédio enorme vazio escuro exato longo ou exato chuvoso diário de semestre.", "Os imponentes eternos grandes e divinos formadores pesquisadores idosos sábios ou catedráticos com surdez natural crônica adquirida nos cantos barulhentos nos laboratórios pesados radioativos de energia.", "Sem dúvida e cravado isolado focado ético cego no respeito profundo nas laranjas mecânicas nos neurônios formidáveis únicos e mágicos brilhantes ou profundos do espectro ou os (Os Sagrados geniais Estudantes universitários em estado inclusivo do espectro exato das portaria oficial (autistas diagnosticados inclusivos ou do grande campo T.E.A - Transtorno global do exato rico e complexo formidável vibrante e denso Espectro Autista oficial e acolhido integralmente).", "Ao som dos músicos eruditos orquestrais do IF que possuem ensaios constantes ensurdecedores focados unicamente na banda e precisam descansar puramente."] ', 2, 'protecao', 20),
('Qual nome carinhoso exato e portal sagrado blindado de amor empático localizado ou entranhado organicamente vivamente respirando entre a alma e as veias de pedra fria institucionais concretas das rotas ou corredores oficiais centrais DENTRO do nosso estrito IF (Um Portal, ação local) para fornecer luz e amparar incisivo acolhendo corações apertados perdidos focados prestando um verdadeiro ar humano sem se afastar na gigante universidade, focando em acolher, suportar corações e ouvir nossos amados pupilos do próprio instituto perante dilemas e sombras pesadas em ambientes opressivos de cálculo diários no estresse contínuo com dores exatas unificadas e solidão isolada na graduação extrema acadêmica?', '[{"text":"A Clínica das Mentes Felizes da Reitoria unificada focada da medicina cirúrgica longínqua dos prédios ou laudos na outra cidade unificada","isCorrect":false},{"text":"A grandiosa rede global da (Igreja das Leis Humanas físicas da USP) ou redutos filosóficos distantes","isCorrect":false},{"text":"Na forma sublime carinhosamente viva ou batizada imortal e organicamente nos blocos em nossos sites chamado local oficial base forte e empática raiz nomeada a majestosa braço do instituto interno próprio ou Acolhedora raiz pura: (Acolhimento Oficial forte incisivo raiz blindado interno firme FÍSICA ACOLHE do nosso Instituto sagrado)","isCorrect":true},{"text":"A rede de telefones e emails gerais com os contatos de ramais e fios ou fax anônimos burocráticos gelados nos blocos mecânicos de concreto e fumaça longínquos isolados do departamento amarrado","isCorrect":false}]', NULL, 'protecao', 20),
('Se os céus de sua mente necessitam das prescrições médicas exatas unificadas fortíssimas de auxílio crônico prolongado mental denso complexo químico ou acompanhamentos pesados fortes isolados formais cirúrgicos e crônicos fortes e pesados a longo longo prazo químico cirúrgico médico ou acompanhamento cego denso da escuridão forte na fenda profunda densa ou transtornos extremas complexos e contínuos de tratamentos profundos de esferas neurológicas ou Psiquiátrico da universidade raiz ou comunidade quem as recebe em triagem pura médica para salvar blindadamente vidas de dor constante focada complexa química, em especialização densa das faculdades e clínicas e alas internas focadas puramente pela cidade blindada isolada cega médica universitária?', '[{"text":"Os estagiários de psicologia num laboratório social","isCorrect":false},{"text":"Unicamente a faculdade e enfermaria primária num quiosque do asfalto longo aberto de campo em quadras chuvosas esportivas de lona longa nos campos","isCorrect":false},{"text":"O reduto colossal magnânimo raiz unificado gigantesco de pedra e luz forte branca de resgatismo base ou salvação máxima blindada de exatos gigantes jalecos na ala psiquiátrica clínica ou oficial da ciência base biológica (No histórico formidável imponente raiz cega majestosa grande reduto oficial complexivo - O Oficial ou H.U - Hospital Magnânimo das esferas Humanas Universitário longo médico cirúrgico gigante da sagrada faculdade Unificada na triagem complexa médica focada) no portal da grande CUASO","isCorrect":true},{"text":"Nos laboratórios experimentais aleatórios puros mágicos do instituto biológico longo num tubo biológico sem uso isolado e abandonado das antigas pesquisas orgânicas antigas secretas velhas perdidas de 80 longínquos perdidos de formigas focadas","isCorrect":false}]', NULL, 'protecao', 10),
('Ao esbarrar nos sombrios e ásperos recantos com dilemas ou em intensos conflitos espinhosos pontuais do longo dia exato a dia burocrático, pessoal entre colegas nas frias teias ou dúvidas dolorosas pontuais humanas em relacionamentos ruidosos ou orientação institucional imediata focada exata ou escutas pontuais rápidas humanas que acalmam incústrias temporárias exatas momentâneas nas tormentas do furacão focado das grades universitárias de horários amargos e densos e escuros, qual a base orgânica viva sediada (perto inclusive do grande e histórico sagrado famigerado local alimentício do refúgio do Bandejão e pátio Central) oferece essas vitais “Escutas maravilhosas Rápidas e breves Pontuais de amor instantâneo" para desanuviar a névoa escura em conflitos pontuais e passageiros sem triagem complexa longa?', '[{"text":"O antigo bar de drinks nas margens isoladas periféricas focadas nos guettos no fundo do prédio esquecido de humanas cego de cimento antigo de noite puro isolado sem vigilância longo escondido perdido cego abandonado nos bares da reitoria de portas no asfalto","isCorrect":false},{"text":"O forte, nobre, raiz vivo resplandecente no meio humano de alívio e vida sagrada batizado oficial empático maravilhoso (No chamado projeto do grande projeto ECOS do instituto das emoções puras e exatas acolhedoras ali fixado com amor e técnica rápida solidária ao lado de todos e dos grandes pratos exatos nutritivos do central formidável gigante de almas USP) - Base do ECOS vivo de escutas e paz solidária pontual forte na universidade de todos das vias arteriais formidáveis imensas puras sem preconceito cego do campus forte imenso gigante sem teto da reitoria do bem","isCorrect":true},{"text":"O espaço místico silencioso absoluto hermético religioso exato isolado longe exilado focado trancafiado sombrio do vazio escuro num prédio vazio lacrado","isCorrect":false},{"text":"Na guarda unificada armada extrema forte e intimidadora nos portões cegos fortes isolados distantes gélidos e sem empatia frios amargos nos contatos humanos nas rondas exatas automotivas da reitoria","isCorrect":false}]', NULL, 'protecao', 20),
-- Using shorter options for the remaining 5 to save tokens
('O Programa ECOS, focado em escuta e acolhimento, fica localizado ao lado de qual estabelecimento importante do campus?', '[{"text":"A Reitoria","isCorrect":false},{"text":"O Bandejão Central","isCorrect":true},{"text":"O CEPEUSP","isCorrect":false},{"text":"Prédio da Poli","isCorrect":false}]', NULL, 'protecao', 10),
('Qual portaria protege especificamente estudantes autistas (TEA)?', '[{"text":"Portaria 001","isCorrect":false},{"text":"Portaria 059","isCorrect":true},{"text":"Portaria 123","isCorrect":false},{"text":"Leis da Fisica","isCorrect":false}]', NULL, 'protecao', 10),
('Como é o nome oficial do principal ponto interno do IFUSP para buscar apoio ou orientação inicial focada em acolhimento sem ser psiquiátrico?', '[{"text":"Portal de Acolhimento do IFUSP","isCorrect":true},{"text":"Bandejão da Física","isCorrect":false},{"text":"Sala dos Professores","isCorrect":false},{"text":"Guarita da Entranda","isCorrect":false}]', NULL, 'protecao', 10),
('Assédio moral ou violações no IFUSP não são tolerados. Formalmente, você os denuncia através do:', '[{"text":"Instagram da USP","isCorrect":false},{"text":"Fale Conosco","isCorrect":false},{"text":"SUA (Sistema USP de Acolhimento)","isCorrect":true},{"text":"Reclame Aqui","isCorrect":false}]', NULL, 'protecao', 10),
('Verdadeiro ou Falso: Um calouro pode ir ao Hospital Universitário fazer tratamento de canal dentário agendado rapidamente na mesma tarde.', '[{"text":"Verdadeiro, ele atende todos em 2h sempre.","isCorrect":false},{"text":"Falso, o HU foca ou em urgências enormes ou tratamentos longos por triagem da comunidade.","isCorrect":true},{"text":"Verdadeiro, apenas aos finais de semana","isCorrect":false},{"text":"Nenhuma das anteriores","isCorrect":false}]', NULL, 'protecao', 10),

-- EXTENSAO
('O time de Rádio e divulgação científica feito por alunos tem o seguinte nome lúdico no Hub:', '[{"text":"Boi Mecânico","isCorrect":false},{"text":"Vespa Quântica","isCorrect":false},{"text":"Vaca Esférica","isCorrect":true},{"text":"Gato de Schrödinger","isCorrect":false}]', NULL, 'extensao', 10),
('Qual iniciativa é tida como o Laboratório focado em Design e Comunicação estratégica científica do IFUSP?', '[{"text":"Show de Física","isCorrect":false},{"text":"LabDiv","isCorrect":true},{"text":"Amélia Império","isCorrect":false},{"text":"Centro Acadêmico","isCorrect":false}]', NULL, 'extensao', 10),
('Estudantes de colegial que vão ao IFUSP presenciar explosões, raios elétricos e teatro, são alvo principal de qual grupo amado do instituto?', '[{"text":"Vaca Esférica","isCorrect":false},{"text":"LabDiv","isCorrect":false},{"text":"Show de Física","isCorrect":true},{"text":"Oficina de Cálculo","isCorrect":false}]', NULL, 'extensao', 10),
('Muitos debates transdisciplinares fogem da matemática pura e abraçam História, Filosofia e afins. O "HS" aborda pautas vitais humanas sendo conhecido como o reduto de:', '[{"text":"Humanidades","isCorrect":true},{"text":"Horas Sociais","isCorrect":false},{"text":"Helicópteros Setoriais","isCorrect":false},{"text":"Hiperspaço","isCorrect":false}]', NULL, 'extensao', 10),
('Quando os alunos sentem necessidade de jogar, conversar sobre física, ou almoçar em grande comunidade descontraída no coração da Física, eles fatalmente migrarão para o tradicional epicentro social chamado:', '[{"text":"Bandejão","isCorrect":false},{"text":"Aquário","isCorrect":true},{"text":"A Lagoa","isCorrect":false},{"text":"Sala de Estudos","isCorrect":false}]', NULL, 'extensao', 10),
('Quem era a figura intelectual e influente cultural que dá o nome a uma biblioteca focada em cultura humanística viva na USP, exaltada na Wiki?', '[{"text":"Marie Curie","isCorrect":false},{"text":"Ada Lovelace","isCorrect":false},{"text":"Amélia Império","isCorrect":true},{"text":"Lattes","isCorrect":false}]', NULL, 'extensao', 10),
('Participar da Extensão Universitária é fundamental porque:', '[{"text":"Dá mais dinheiro que ir trabalhar num banco privado no 1º semestre.","isCorrect":false},{"text":"Você fica isento de realizar provas de cálculo 4 nas férias quentes.","isCorrect":false},{"text":"Conecta a universidade real com as necessidades e a linguagem da sociedade local ao redor dos muros.","isCorrect":true},{"text":"Garante vaga no estacionamento coberto no último andar da reitoria invisual","isCorrect":false}]', NULL, 'extensao', 20),
('Se um calouro possui interesse vital em criar ou ingressar numa (Iniciação Cientifica de ponta) mas morre de vergonha de pesquisadores sérios. O que diz a sabedoria da "Ponte de Docentes" do guia de Extensões?', '[{"text":"Desista, só os que foram prodígios ou da equipe de olimpíadas são escolhidos","isCorrect":false},{"text":"Oculte-se, espere mandarem no mural do corredor se sobrar vagas esquecidas velhas","isCorrect":false},{"text":"Seja proativo! Professores também vivem de recrutar interessados: Envie um email formal respeitoso expressando curiosidade genuína no campo e marque 5 mins num café ou na sala dele","isCorrect":true},{"text":"Basta preencher num edital da prg ou num app online que sua estrela brilhará em random no feed","isCorrect":false}]', NULL, 'extensao', 20),
('As interações com o extinto (Show de Física) moldam um físico em características valiosas que muitas vezes faltam nas provas fechadas difíceis de sala escura. Qual é essa capacidade humana de comunicação máxima afiada no laboratório teatral frente aos convidados ou crianças de escola de ensino médio do Show?', '[{"text":"A arte de não responder perguntas e olhar para a fórmula","isCorrect":false},{"text":"Domínio e conforto exímio e vibrante em ensinar conceitos traduzindo ciência real pesada numa via cativante e de domínio público para fascinadas almas humanas das turmas amadoras.","isCorrect":true},{"text":"Capacidade formidável e mecânica exata de decorar infinitas constantes inteiras sem anotar e provar oralmente axiomas matemáticos difusos da algebra bruta de Galois sem olhar a lousa longa","isCorrect":false},{"text":"Limpar e empacotar rapidamente cabos no teatro com estética limpa pra devolver os rádios","isCorrect":false}]', NULL, 'extensao', 20),
('A premissa máxima de "Integração Universitária Completa" (Uma trilha do Colisor e da Wiki), dita e aponta sabiamente dezenas de vezes a lição de que o estudante médio sobrevive melhor as provas quando atua com as "Forças fundamentais base" dentro do complexo acadêmico nas suas horas livres agudas. Qual princípio vital resume a sobrevivência do instituto paulista segundo textos locais de acolhimento?', '[{"text":"O purismo: apenas focar só no ensino isolado é a cura, negando as confraternizações para ler nas gavetas os velhos papéis solitários para ser líder científico mundial acadêmico sem falar com humanos novos da turma.","isCorrect":false},{"text":"No IFUSP, isolamento é tragédia pesada; a Proatividade colaborativa em grupos e a formação forte focada e de extrema força formadora relacional nas Extensões de base do campus tornará a jornada longa da ciência menos brutal e gerando a raiz de grandes chances numéricas amanhã.","isCorrect":true},{"text":"Desrespeitar as ementas ou não participar de reuniões longas para gastar todas verbas nos botecos sem ética ou métrica em bar barulhento na reitoria abandonando as provas","isCorrect":false},{"text":"Transferir para a faculdade de Humanas direto no segundo semestre pois na exata ninguém fará networking","isCorrect":false}]', NULL, 'extensao', 20);


