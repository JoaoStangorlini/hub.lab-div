-- =============================================
-- GERAÇÃO IV: PCC VALIDATION + XOR ENFORCEMENT
-- Aplicado via MCP em 2026-03-06
-- =============================================

-- 1. Campo PCC
ALTER TABLE public.learning_trails 
ADD COLUMN IF NOT EXISTS requires_pcc_validation BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.learning_trails.requires_pcc_validation IS 
'Indica que a equivalência Bach→Lic exige validação de Práticas como Componente Curricular (PCC).';

UPDATE public.learning_trails SET requires_pcc_validation = true WHERE course_code IN (
    '4300356', '4300358', '4300390', 'EDM0425', 'EDM0426', '4300157', '4300415'
);

-- 2. RPC XOR Check
CREATE OR REPLACE FUNCTION public.check_xor_before_xp(
    p_user_id UUID,
    p_trail_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trail_code TEXT;
    v_trail_equiv TEXT;
    v_exclusion RECORD;
    v_conflicting_progress RECORD;
    v_result JSONB := '{"allowed": true}'::jsonb;
BEGIN
    SELECT course_code, equivalence_group INTO v_trail_code, v_trail_equiv
    FROM public.learning_trails WHERE id = p_trail_id;
    
    IF v_trail_code IS NULL THEN
        RETURN '{"allowed": false, "reason": "Trail not found"}'::jsonb;
    END IF;
    
    FOR v_exclusion IN 
        SELECT group_a, group_b, reason FROM public.equivalence_exclusions
        WHERE group_a = v_trail_code OR group_b = v_trail_code
           OR group_a = v_trail_equiv OR group_b = v_trail_equiv
    LOOP
        DECLARE
            v_other_key TEXT;
        BEGIN
            IF v_exclusion.group_a = v_trail_code OR v_exclusion.group_a = v_trail_equiv THEN
                v_other_key := v_exclusion.group_b;
            ELSE
                v_other_key := v_exclusion.group_a;
            END IF;
            
            SELECT utp.trail_id, lt.course_code, lt.title
            INTO v_conflicting_progress
            FROM public.user_trail_progress utp
            JOIN public.learning_trails lt ON lt.id = utp.trail_id
            WHERE utp.user_id = p_user_id
              AND utp.is_stable = true
              AND (lt.course_code = v_other_key OR lt.equivalence_group = v_other_key)
            LIMIT 1;
            
            IF v_conflicting_progress IS NOT NULL THEN
                v_result := jsonb_build_object(
                    'allowed', false,
                    'reason', 'XOR_EXCLUSION',
                    'conflicting_trail', v_conflicting_progress.title,
                    'conflicting_code', v_conflicting_progress.course_code,
                    'exclusion_reason', v_exclusion.reason
                );
                RETURN v_result;
            END IF;
        END;
    END LOOP;
    
    RETURN v_result;
END;
$$;
