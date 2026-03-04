-- ==========================================================
-- THE GOD SQL v5.0.0 — HUB DE COMUNICAÇÃO CIENTÍFICA (IFUSP)
-- ==========================================================
-- Script 100% IDEMPOTENTE. Consolida v4 + todos os newsqls + Radiation System.
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
    interests TEXT[] DEFAULT '{}',
    artistic_interests TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    review_status profile_review_status DEFAULT 'pending',
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
    created_at TIMESTAMPTZ DEFAULT now()
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

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Format: [{"text": "...", "isCorrect": true}, ...]
    explanation TEXT,
    points INTEGER DEFAULT 10,
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
    SET like_count = (SELECT count(*) FROM public.curtidas WHERE submission_id = target_id)
    WHERE id = target_id;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
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
ALTER TABLE public.pseudonyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;
CREATE POLICY "Admins manage profiles" ON profiles FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());

-- Submissions
DROP POLICY IF EXISTS "Public can view approved submissions" ON public.submissions;
CREATE POLICY "Public can view approved submissions" ON public.submissions FOR SELECT USING ((status = 'aprovado') OR public.is_admin() OR (auth.uid() = user_id));

DROP POLICY IF EXISTS "Authenticated users can submitt" ON public.submissions;
CREATE POLICY "Authenticated users can submitt" ON public.submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Follows
DROP POLICY IF EXISTS "Public follows visibility" ON public.follows;
CREATE POLICY "Public follows visibility" ON public.follows FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Pseudonyms
DROP POLICY IF EXISTS "Admins can manage pseudonyms" ON public.pseudonyms;
DROP POLICY IF EXISTS "Admins can manage all pseudonyms" ON public.pseudonyms;
CREATE POLICY "Admins can manage all pseudonyms" ON public.pseudonyms FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Users can manage own pseudonyms" ON public.pseudonyms;
CREATE POLICY "Users can manage own pseudonyms" ON public.pseudonyms FOR ALL TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view global active pseudonyms" ON public.pseudonyms;
CREATE POLICY "Users can view global active pseudonyms" ON public.pseudonyms FOR SELECT TO authenticated USING (user_id IS NULL AND is_active = true);

-- Messages
DROP POLICY IF EXISTS "Users can view their context messages" ON public.messages;
CREATE POLICY "Users can view their context messages" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Quiz
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view quiz questions" ON public.quiz_questions;
CREATE POLICY "Public can view quiz questions" ON public.quiz_questions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view own attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log their attempts" ON public.quiz_attempts;
CREATE POLICY "Users can log their attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

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

-- ════════════════════════════════════════════════════════════
-- FIM DO GOD SQL v5.0.0
-- ════════════════════════════════════════════════════════════
