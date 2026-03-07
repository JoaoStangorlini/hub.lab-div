-- =============================================
-- EMARANHAMENTO CURRICULAR V3.2 — SCHEMA DDL
-- Data: 2026-03-06
-- =============================================

-- 1. Adicionar campo equivalence_group na tabela learning_trails
ALTER TABLE public.learning_trails 
ADD COLUMN IF NOT EXISTS equivalence_group TEXT DEFAULT NULL;

-- 2. Índice para buscas rápidas por grupo de equivalência
CREATE INDEX IF NOT EXISTS idx_learning_trails_eq_group 
ON public.learning_trails(equivalence_group) WHERE equivalence_group IS NOT NULL;

-- 3. Tabela de Exclusões Mútuas (Lógica XOR)
CREATE TABLE IF NOT EXISTS public.equivalence_exclusions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_a TEXT NOT NULL,
    group_b TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.equivalence_exclusions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read equivalence_exclusions" ON public.equivalence_exclusions 
FOR SELECT USING (true);

-- 4. Constraint UNIQUE em user_trail_progress para ON CONFLICT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_trail_progress_user_trail_unique'
    ) THEN
        ALTER TABLE public.user_trail_progress 
        ADD CONSTRAINT user_trail_progress_user_trail_unique UNIQUE (user_id, trail_id);
    END IF;
END $$;

-- 5. RPC para sincronizar progresso entre disciplinas equivalentes
CREATE OR REPLACE FUNCTION sync_equivalence_progress(p_user_id UUID, p_trail_id UUID)
RETURNS void AS $$
DECLARE
    v_group TEXT;
BEGIN
    SELECT equivalence_group INTO v_group FROM public.learning_trails WHERE id = p_trail_id;
    IF v_group IS NOT NULL THEN
        INSERT INTO public.user_trail_progress (user_id, trail_id, is_stable, updated_at)
        SELECT p_user_id, lt.id, true, now()
        FROM public.learning_trails lt
        WHERE lt.equivalence_group = v_group AND lt.id != p_trail_id
        ON CONFLICT (user_id, trail_id) DO UPDATE SET is_stable = true, updated_at = now();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MAPEAMENTO DE GRUPOS DE EQUIVALÊNCIA
-- =============================================

-- BLOCO A: Ciclo Básico
UPDATE public.learning_trails SET equivalence_group = 'GRP_FISICA_1' WHERE course_code IN ('4302111', '4300151', '4300153');
UPDATE public.learning_trails SET equivalence_group = 'GRP_FISICA_2' WHERE course_code IN ('4302112', '4300159', '4300255');
UPDATE public.learning_trails SET equivalence_group = 'GRP_FISICA_3' WHERE course_code IN ('4302211', '4300270');
UPDATE public.learning_trails SET equivalence_group = 'GRP_FISICA_4' WHERE course_code IN ('4302212', '4300271');
UPDATE public.learning_trails SET equivalence_group = 'GRP_EXP_1' WHERE course_code IN ('4302113', '4300152');
UPDATE public.learning_trails SET equivalence_group = 'GRP_EXP_2' WHERE course_code IN ('4302114', '4300254');
UPDATE public.learning_trails SET equivalence_group = 'GRP_EXP_3' WHERE course_code IN ('4302213', '4300373');
UPDATE public.learning_trails SET equivalence_group = 'GRP_EXP_4' WHERE course_code IN ('4302214', '4300377');
UPDATE public.learning_trails SET equivalence_group = 'GRP_CALC_1' WHERE course_code IN ('MAT2453', 'MAT0105', 'MAT1351');
UPDATE public.learning_trails SET equivalence_group = 'GRP_CALC_2' WHERE course_code IN ('MAT2454', 'MAT1352');
UPDATE public.learning_trails SET equivalence_group = 'GRP_ALG_LIN' WHERE course_code IN ('MAT0122', 'MAT2351');

-- BLOCO B: Avançadas
UPDATE public.learning_trails SET equivalence_group = 'GRP_MQ_INTRO' WHERE course_code IN ('4302311', '4300371', '4302311_MED');
UPDATE public.learning_trails SET equivalence_group = 'GRP_MEC_CLASS' WHERE course_code IN ('4302305', '4300458', '4302305_MED');
UPDATE public.learning_trails SET equivalence_group = 'GRP_TERMO' WHERE course_code IN ('4302308', '4300259');
UPDATE public.learning_trails SET equivalence_group = 'GRP_ELETROMAG' WHERE course_code IN ('4302303', '4300372');
UPDATE public.learning_trails SET equivalence_group = 'GRP_ESTADO_SOLIDO' WHERE course_code IN ('4300402', '4300379');

-- Exclusões Mútuas
INSERT INTO public.equivalence_exclusions (group_a, group_b, reason)
VALUES
('GRP_ESTADO_SOLIDO', 'GRP_ESTADO_SOLIDO', 'Disciplinas 4300402 (Bach) e 4300379 (Lic) são equivalentes. Créditos contados apenas uma vez.'),
('GRP_NUCLEAR_PART', 'GRP_NUCLEAR_PART', 'Disciplina 4300378 aparece nas duas grades. Créditos contados apenas uma vez.')
ON CONFLICT DO NOTHING;
