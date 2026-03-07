-- Migração: Trilhas Curriculares - Estrutura Completa
-- Aplicado via MCP em 2026-03-06

-- 1. Adicionar restrição de unicidade ao course_code
ALTER TABLE public.learning_trails ADD CONSTRAINT IF NOT EXISTS learning_trails_course_code_key UNIQUE (course_code);

-- 2. Garantir coluna category com CHECK constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'learning_trails' AND column_name = 'category'
    ) THEN
        ALTER TABLE public.learning_trails ADD COLUMN category TEXT DEFAULT 'obrigatoria' CHECK (category IN ('obrigatoria', 'eletiva', 'livre'));
    END IF;
END $$;

-- 3. Garantir axis CHECK atualizado (sem 'optativa')
ALTER TABLE public.learning_trails DROP CONSTRAINT IF EXISTS learning_trails_axis_check;
ALTER TABLE public.learning_trails ADD CONSTRAINT learning_trails_axis_check CHECK (axis IN ('bach', 'lic', 'med', 'comum'));
