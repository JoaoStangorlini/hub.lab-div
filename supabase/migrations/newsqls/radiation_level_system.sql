-- ==========================================================
-- RADIATION LEVEL SYSTEM — Triggers de XP expandidos
-- ==========================================================

-- 1. Adicionar coluna de tier se não existir
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'radiation_tier') THEN
        ALTER TABLE public.profiles ADD COLUMN radiation_tier TEXT DEFAULT 'plastico';
    END IF;
END $$;

-- 2. Função para calcular tier baseado no XP
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

-- 3. Função genérica para adicionar XP e atualizar tier
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

    -- Calcular novo nível (baseado nos thresholds)
    SELECT CASE
        WHEN v_new_xp >= 7500 THEN 26
        WHEN v_new_xp >= 6500 THEN 25
        WHEN v_new_xp >= 6000 THEN 24
        WHEN v_new_xp >= 5520 THEN 23
        WHEN v_new_xp >= 5060 THEN 22
        WHEN v_new_xp >= 4620 THEN 21
        WHEN v_new_xp >= 4200 THEN 20
        WHEN v_new_xp >= 3800 THEN 19
        WHEN v_new_xp >= 3420 THEN 18
        WHEN v_new_xp >= 3060 THEN 17
        WHEN v_new_xp >= 2720 THEN 16
        WHEN v_new_xp >= 2400 THEN 15
        WHEN v_new_xp >= 2100 THEN 14
        WHEN v_new_xp >= 1820 THEN 13
        WHEN v_new_xp >= 1560 THEN 12
        WHEN v_new_xp >= 1320 THEN 11
        WHEN v_new_xp >= 1100 THEN 10
        WHEN v_new_xp >= 900 THEN 9
        WHEN v_new_xp >= 720 THEN 8
        WHEN v_new_xp >= 560 THEN 7
        WHEN v_new_xp >= 420 THEN 6
        WHEN v_new_xp >= 300 THEN 5
        WHEN v_new_xp >= 200 THEN 4
        WHEN v_new_xp >= 120 THEN 3
        WHEN v_new_xp >= 50 THEN 2
        ELSE 1
    END INTO v_new_level;

    v_new_tier := public.get_radiation_tier(v_new_xp);

    UPDATE public.profiles
    SET level = v_new_level,
        radiation_tier = v_new_tier
    WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reescrever calculate_profile_xp para usar add_radiation_xp
CREATE OR REPLACE FUNCTION public.calculate_profile_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_profile_id UUID;
    v_points INTEGER := 0;
    v_recent_quota_count INTEGER;
BEGIN
    v_profile_id := COALESCE(NEW.user_id, NEW.profile_id);

    IF (TG_TABLE_NAME = 'submissions' AND NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado')) THEN
        v_points := 50;
    ELSIF (TG_TABLE_NAME = 'kudos' AND TG_OP = 'INSERT') THEN
        SELECT COUNT(*) INTO v_recent_quota_count FROM public.kudos_quota_logs
        WHERE profile_id = v_profile_id AND action_at > NOW() - INTERVAL '1 hour';
        IF v_recent_quota_count < 10 THEN
            v_points := 10;
            INSERT INTO public.kudos_quota_logs (profile_id) VALUES (v_profile_id);
        END IF;
    END IF;

    IF v_points > 0 THEN
        PERFORM public.add_radiation_xp(v_profile_id, v_points);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger XP ao comentar (+5 base, +10 se é resposta do dono do post)
CREATE OR REPLACE FUNCTION public.xp_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner UUID;
    v_points INTEGER := 5;
BEGIN
    -- Dar XP ao comentarista
    IF NEW.user_id IS NOT NULL THEN
        -- Verificar se é o dono do post respondendo (extra XP)
        SELECT user_id INTO v_post_owner FROM public.submissions WHERE id = NEW.submission_id;
        IF NEW.user_id = v_post_owner THEN
            v_points := 10; -- Responder no próprio post = +10
        END IF;
        PERFORM public.add_radiation_xp(NEW.user_id, v_points);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_xp_on_comment ON public.comments;
CREATE TRIGGER tr_xp_on_comment
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.xp_on_comment();

-- 6. Trigger XP quando seu post é salvo na constelação (+8 para o dono)
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

-- Try saves table first, fallback to saved_posts
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saves') THEN
        DROP TRIGGER IF EXISTS tr_xp_on_save ON public.saves;
        CREATE TRIGGER tr_xp_on_save AFTER INSERT ON public.saves FOR EACH ROW EXECUTE FUNCTION public.xp_on_save();
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_posts') THEN
        DROP TRIGGER IF EXISTS tr_xp_on_save ON public.saved_posts;
        CREATE TRIGGER tr_xp_on_save AFTER INSERT ON public.saved_posts FOR EACH ROW EXECUTE FUNCTION public.xp_on_save();
    END IF;
END $$;

-- 7. Trigger XP quando seu post é curtido/atomizado (+3 para o dono)
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

DROP TRIGGER IF EXISTS tr_xp_on_curtida ON public.curtidas;
CREATE TRIGGER tr_xp_on_curtida
AFTER INSERT ON public.curtidas
FOR EACH ROW EXECUTE FUNCTION public.xp_on_curtida();

-- 8. Trigger XP ao seguir alguém (+2)
CREATE OR REPLACE FUNCTION public.xp_on_follow()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.follower_id IS NOT NULL THEN
        PERFORM public.add_radiation_xp(NEW.follower_id, 2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_xp_on_follow ON public.follows;
CREATE TRIGGER tr_xp_on_follow
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.xp_on_follow();

-- 9. RETROACTIVE XP RECALCULATION from existing data
-- Reset all XP to 0 first, then recalculate from scratch
UPDATE public.profiles SET xp = 0;

-- Add XP for approved submissions (+50 each)
UPDATE public.profiles p
SET xp = xp + sub.total_xp
FROM (
    SELECT user_id, COUNT(*) * 50 AS total_xp
    FROM public.submissions
    WHERE status = 'aprovado'
    GROUP BY user_id
) sub
WHERE p.id = sub.user_id;

-- Add XP for comments posted (+5 each)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        EXECUTE '
            UPDATE public.profiles p
            SET xp = xp + c.total_xp
            FROM (
                SELECT user_id, COUNT(*) * 5 AS total_xp
                FROM public.comments
                GROUP BY user_id
            ) c
            WHERE p.id = c.user_id';
    END IF;
END $$;

-- Add XP for follows made (+2 each)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'follows') THEN
        EXECUTE '
            UPDATE public.profiles p
            SET xp = xp + f.total_xp
            FROM (
                SELECT follower_id, COUNT(*) * 2 AS total_xp
                FROM public.follows
                GROUP BY follower_id
            ) f
            WHERE p.id = f.follower_id';
    END IF;
END $$;

-- Add XP for kudos received (+10 each)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kudos') THEN
        EXECUTE '
            UPDATE public.profiles p
            SET xp = xp + k.total_xp
            FROM (
                SELECT profile_id, COUNT(*) * 10 AS total_xp
                FROM public.kudos
                GROUP BY profile_id
            ) k
            WHERE p.id = k.profile_id';
    END IF;
END $$;

-- Add XP for curtidas received on your posts (+3 each)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'curtidas') THEN
        EXECUTE '
            UPDATE public.profiles p
            SET xp = xp + cr.total_xp
            FROM (
                SELECT s.user_id, COUNT(*) * 3 AS total_xp
                FROM public.curtidas c
                JOIN public.submissions s ON s.id = c.submission_id
                GROUP BY s.user_id
            ) cr
            WHERE p.id = cr.user_id';
    END IF;
END $$;

-- Now set level and tier based on recalculated XP
UPDATE public.profiles
SET radiation_tier = public.get_radiation_tier(COALESCE(xp, 0)),
    level = CASE
        WHEN COALESCE(xp, 0) >= 7500 THEN 26
        WHEN COALESCE(xp, 0) >= 6500 THEN 25
        WHEN COALESCE(xp, 0) >= 6000 THEN 24
        WHEN COALESCE(xp, 0) >= 5520 THEN 23
        WHEN COALESCE(xp, 0) >= 5060 THEN 22
        WHEN COALESCE(xp, 0) >= 4620 THEN 21
        WHEN COALESCE(xp, 0) >= 4200 THEN 20
        WHEN COALESCE(xp, 0) >= 3800 THEN 19
        WHEN COALESCE(xp, 0) >= 3420 THEN 18
        WHEN COALESCE(xp, 0) >= 3060 THEN 17
        WHEN COALESCE(xp, 0) >= 2720 THEN 16
        WHEN COALESCE(xp, 0) >= 2400 THEN 15
        WHEN COALESCE(xp, 0) >= 2100 THEN 14
        WHEN COALESCE(xp, 0) >= 1820 THEN 13
        WHEN COALESCE(xp, 0) >= 1560 THEN 12
        WHEN COALESCE(xp, 0) >= 1320 THEN 11
        WHEN COALESCE(xp, 0) >= 1100 THEN 10
        WHEN COALESCE(xp, 0) >= 900 THEN 9
        WHEN COALESCE(xp, 0) >= 720 THEN 8
        WHEN COALESCE(xp, 0) >= 560 THEN 7
        WHEN COALESCE(xp, 0) >= 420 THEN 6
        WHEN COALESCE(xp, 0) >= 300 THEN 5
        WHEN COALESCE(xp, 0) >= 200 THEN 4
        WHEN COALESCE(xp, 0) >= 120 THEN 3
        WHEN COALESCE(xp, 0) >= 50 THEN 2
        ELSE 1
    END;

