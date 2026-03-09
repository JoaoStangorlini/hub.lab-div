-- Migration: Add quiz column to submissions and track responses
-- Created: 2026-03-06

-- 1. Add quiz column
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS quiz JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.submissions.quiz IS 'Mini quiz for the post. Array of objects {id, question, options[], correct_option}';

-- 2. Create tracking table for responses
CREATE TABLE IF NOT EXISTS public.submission_quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

-- 3. Enable RLS
ALTER TABLE public.submission_quiz_responses ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Users can view own quiz responses" ON public.submission_quiz_responses;
DROP POLICY IF EXISTS "Users can view own quiz responses" ON public.submission_quiz_responses;
CREATE POLICY "Users can view own quiz responses" ON public.submission_quiz_responses
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz responses" ON public.submission_quiz_responses;
DROP POLICY IF EXISTS "Users can insert own quiz responses" ON public.submission_quiz_responses;
CREATE POLICY "Users can insert own quiz responses" ON public.submission_quiz_responses
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_submission ON public.submission_quiz_responses(submission_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user ON public.submission_quiz_responses(user_id);

-- ========================================================
-- HUB LAB-DIV: GOD SQL MK1 (CONSOLIDATED MIGRATIONS)
-- Compiled on: 2026-03-08
-- ========================================================


-- --- FILE: 20260306_trilhas_schema_v2.sql ---

-- MigraÃ§Ã£o: Trilhas Curriculares - Estrutura Completa
-- Aplicado via MCP em 2026-03-06

-- 1. Adicionar restriÃ§Ã£o de unicidade ao course_code
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'learning_trails_course_code_key') THEN
        ALTER TABLE public.learning_trails ADD CONSTRAINT learning_trails_course_code_key UNIQUE (course_code);
    END IF;
END $$;

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

-- --- FILE: 20260306_trilhas_data_fase2.sql ---

-- MigraÃ§Ã£o: InjeÃ§Ã£o Massiva de Trilhas Curriculares (Fase 2)
-- Aplicado via MCP em 2026-03-06
-- Total: 102 trilhas (Blocos A, B, C e D)

-- ========================================
-- BLOCO A: CICLO BÃSICO (axis='comum')
-- ========================================
INSERT INTO public.learning_trails 
(course_code, title, axis, category, excitation_level, credits_aula, credits_trabalho, is_experimental, program, prerequisites, status)
VALUES 
('4302111', 'FÃ­sica I', 'comum', 'obrigatoria', 1, 6, 0, false, '["CinemÃ¡tica vetorial", "Leis de Newton", "Trabalho e energia", "Sistemas de partÃ­culas", "Corpo rÃ­gido e momento angular"]', '{}', 'estavel'),
('4302113', 'FÃ­sica Experimental I', 'comum', 'obrigatoria', 1, 4, 0, true, '["Metodologia cientÃ­fica", "Teoria de erros", "InstrumentaÃ§Ã£o bÃ¡sica", "AnÃ¡lise de dados", "RelatÃ³rios cientÃ­ficos"]', '{}', 'estavel'),
('MAT2453', 'CÃ¡lculo Diferencial e Integral I', 'comum', 'obrigatoria', 1, 6, 0, false, '["Limites e Continuidade", "Derivadas e AplicaÃ§Ãµes", "Teorema Fundamental do CÃ¡lculo", "TÃ©cnicas de IntegraÃ§Ã£o", "SÃ©ries e SequÃªncias"]', '{}', 'estavel'),
('MAT0112', 'Vetores e Geometria', 'comum', 'obrigatoria', 1, 4, 0, false, '["Vetores no plano e espaÃ§o", "Retas e planos", "CÃ´nicas e quÃ¡dricas", "TransformaÃ§Ãµes lineares elementares"]', '{}', 'estavel'),
('4302112', 'FÃ­sica II', 'comum', 'obrigatoria', 2, 6, 0, false, '["GravitaÃ§Ã£o", "OscilaÃ§Ãµes harmÃ´nicas", "Ondas em meios elÃ¡sticos", "EstÃ¡tica e dinÃ¢mica de fluidos", "TermodinÃ¢mica"]', '{"4302111", "MAT2453"}', 'estavel'),
('4302114', 'FÃ­sica Experimental II', 'comum', 'obrigatoria', 2, 4, 0, true, '["MecÃ¢nica dos fluidos", "OscilaÃ§Ãµes", "Ondas", "Calorimetria", "TermodinÃ¢mica"]', '{"4302113"}', 'estavel'),
('MAT2454', 'CÃ¡lculo Diferencial e Integral II', 'comum', 'obrigatoria', 2, 4, 0, false, '["FunÃ§Ãµes de vÃ¡rias variÃ¡veis", "Derivadas parciais", "Gradiente e otimizaÃ§Ã£o", "Integrais mÃºltiplas", "Teoremas de cÃ¡lculo vetorial"]', '{"MAT2453"}', 'estavel'),
('MAT0122', 'Ãlgebra Linear I', 'comum', 'obrigatoria', 2, 4, 0, false, '["EspaÃ§os vetoriais", "Bases e dimensÃ£o", "TransformaÃ§Ãµes lineares", "Autovalores e autovetores", "DiagonalizaÃ§Ã£o"]', '{"MAT0112"}', 'estavel'),
('4302211', 'FÃ­sica III', 'comum', 'obrigatoria', 3, 6, 0, false, '["EletrostÃ¡tica", "CapacitÃ¢ncia e dielÃ©tricos", "Corrente e resistÃªncia", "Circuitos CC", "Campo magnÃ©tico"]', '{"4302112", "MAT2454", "MAT0112"}', 'estavel'),
('4302213', 'FÃ­sica Experimental III', 'comum', 'obrigatoria', 3, 4, 0, true, '["EletrostÃ¡tica", "Circuitos bÃ¡sicos", "Magnetismo", "InduÃ§Ã£o eletromagnÃ©tica", "Medidas de precisÃ£o"]', '{"4302114"}', 'estavel'),
('MAT0216', 'CÃ¡lculo Diferencial e Integral III', 'comum', 'obrigatoria', 3, 6, 0, false, '["Integrais de linha", "Fluxo e Teorema de Gauss", "Teorema de Stokes", "EquaÃ§Ãµes diferenciais de 1Âª ordem", "Sistemas de EDOs"]', '{"MAT2454", "MAT0122"}', 'estavel'),
('MAC0115', 'IntroduÃ§Ã£o Ã  ComputaÃ§Ã£o', 'comum', 'obrigatoria', 3, 4, 0, false, '["LÃ³gica de programaÃ§Ã£o", "Estruturas de controle", "FunÃ§Ãµes e escopo", "Vetores e matrizes", "Algoritmos de busca e ordenaÃ§Ã£o"]', '{}', 'estavel'),
('4302212', 'FÃ­sica IV', 'comum', 'obrigatoria', 4, 6, 0, false, '["InduÃ§Ã£o Faraday", "EquaÃ§Ãµes de Maxwell", "Ondas eletromagnÃ©ticas", "Ã“ptica geomÃ©trica", "InterferÃªncia e difraÃ§Ã£o"]', '{"4302211", "4302112"}', 'estavel'),
('4302214', 'FÃ­sica Experimental IV', 'comum', 'obrigatoria', 4, 4, 0, true, '["Ã“ptica", "InterferÃªncia", "DifraÃ§Ã£o", "RadiaÃ§Ã£o tÃ©rmica", "FÃ­sica moderna experimental"]', '{"4302213"}', 'estavel'),
('MAT0220', 'CÃ¡lculo Diferencial e Integral IV', 'comum', 'obrigatoria', 4, 4, 0, false, '["SequÃªncias e sÃ©ries de funÃ§Ãµes", "SÃ©ries de Fourier", "Transformada de Laplace", "EquaÃ§Ãµes diferenciais parciais", "IntroduÃ§Ã£o a variÃ¡veis complexas"]', '{"MAT0216"}', 'estavel'),
('MAP0214', 'CÃ¡lculo NumÃ©rico', 'comum', 'obrigatoria', 4, 4, 0, false, '["Zeros de funÃ§Ãµes", "Sistemas lineares", "InterpolaÃ§Ã£o", "IntegraÃ§Ã£o numÃ©rica", "ResoluÃ§Ã£o numÃ©rica de EDOs"]', '{"MAC0115"}', 'estavel')
ON CONFLICT (course_code) DO UPDATE SET title = EXCLUDED.title, excitation_level = EXCLUDED.excitation_level, credits_aula = EXCLUDED.credits_aula, credits_trabalho = EXCLUDED.credits_trabalho, is_experimental = EXCLUDED.is_experimental, program = EXCLUDED.program, prerequisites = EXCLUDED.prerequisites, axis = EXCLUDED.axis, category = EXCLUDED.category;

-- ========================================
-- BLOCO B: BACHARELADO (axis='bach')
-- ========================================
INSERT INTO public.learning_trails 
(course_code, title, axis, category, excitation_level, credits_aula, credits_trabalho, is_experimental, program, prerequisites, status)
VALUES 
('4302303', 'Eletromagnetismo I', 'bach', 'obrigatoria', 5, 4, 0, false, '["EletrostÃ¡tica e meios materiais", "MagnetostÃ¡tica e campos na matÃ©ria", "Leis de Faraday e InduÃ§Ã£o", "EquaÃ§Ãµes de Maxwell", "Ondas eletromagnÃ©ticas"]', '{"4302212", "MAT0216"}', 'estavel'),
('4302305', 'MecÃ¢nica I', 'bach', 'obrigatoria', 5, 4, 0, false, '["PrincÃ­pios variacionais", "EquaÃ§Ãµes de Lagrange", "Leis de conservaÃ§Ã£o e Simetrias", "EquaÃ§Ãµes de Hamilton", "DinÃ¢mica de Corpo RÃ­gido"]', '{"4302112", "MAT2454"}', 'estavel'),
('4302311', 'FÃ­sica QuÃ¢ntica', 'bach', 'obrigatoria', 5, 4, 0, false, '["RadiaÃ§Ã£o tÃ©rmica e fÃ³tons", "Ondas de matÃ©ria de de Broglie", "Modelos atÃ´micos e Bohr", "EquaÃ§Ã£o de SchrÃ¶dinger dependente do tempo", "Potenciais unidimensionais"]', '{"MAT0216", "4302212"}', 'estavel'),
('4302313', 'FÃ­sica Experimental V', 'bach', 'obrigatoria', 5, 4, 0, true, '["Interferometria e DifraÃ§Ã£o", "Ã“ptica GeomÃ©trica e FÃ­sica", "PolarizaÃ§Ã£o da luz", "Espectros atÃ´micos", "Sensores Ã³pticos"]', '{"4302214"}', 'estavel'),
('4302304', 'Eletromagnetismo II', 'bach', 'obrigatoria', 6, 4, 0, false, '["Guias de ondas e cavidades", "RadiaÃ§Ã£o dipolar", "Espalhamento de radiaÃ§Ã£o", "Relatividade restrita no Eletromagnetismo", "Potenciais de LiÃ©nard-Wiechert"]', '{"4302303"}', 'estavel'),
('4302306', 'MecÃ¢nica II', 'bach', 'obrigatoria', 6, 4, 0, false, '["TransformaÃ§Ãµes canÃ´nicas", "Teoria de Hamilton-Jacobi", "Teoria de perturbaÃ§Ãµes", "MecÃ¢nica de meios contÃ­nuos", "IntroduÃ§Ã£o Ã  DinÃ¢mica de FluÃ­dos"]', '{"4302305"}', 'estavel'),
('4302204', 'FÃ­sica MatemÃ¡tica I', 'bach', 'obrigatoria', 6, 4, 0, false, '["EquaÃ§Ãµes diferenciais parciais", "Problemas de condiÃ§Ãµes de contorno", "MÃ©todo de separaÃ§Ã£o de variÃ¡veis", "SÃ©ries de Fourier", "Transformadas de Fourier e Laplace"]', '{"MAT2454"}', 'estavel'),
('4302314', 'FÃ­sica Experimental VI', 'bach', 'obrigatoria', 6, 4, 0, true, '["Efeito FotoelÃ©trico", "RadiaÃ§Ã£o de corpo negro", "Experimento de Franck-Hertz", "Raios-X e DifraÃ§Ã£o de elÃ©trons", "Efeito Zeeman"]', '{"4302313"}', 'estavel'),
('4302403', 'MecÃ¢nica QuÃ¢ntica I', 'bach', 'obrigatoria', 7, 4, 0, false, '["EspaÃ§o de Hilbert e Operadores", "Postulados da MQ", "Oscilador HarmÃ´nico", "Momento Angular e Spin", "Ãtomo de HidrogÃªnio"]', '{"4302311", "MAT0122", "4302204"}', 'estavel'),
('4302308', 'TermodinÃ¢mica', 'bach', 'obrigatoria', 7, 4, 0, false, '["Leis da TermodinÃ¢mica", "Potenciais termodinÃ¢micos", "RelaÃ§Ãµes de Maxwell", "TransiÃ§Ãµes de fase", "Teorema de Nernst e 3Âª Lei"]', '{"4302112"}', 'estavel'),
('4302307', 'FÃ­sica MatemÃ¡tica II', 'bach', 'obrigatoria', 7, 4, 0, false, '["FunÃ§Ãµes de variÃ¡vel complexa", "CÃ¡lculo de resÃ­duos", "FunÃ§Ãµes especiais (Bessel, Legendre)", "FunÃ§Ãµes de Green", "AplicaÃ§Ãµes em FÃ­sica AvanÃ§ada"]', '{"4302204"}', 'estavel'),
('4302401', 'MecÃ¢nica EstatÃ­stica', 'bach', 'obrigatoria', 7, 4, 0, false, '["Ensemble MicrocanÃ´nico", "Ensembles CanÃ´nico e Grande CanÃ´nico", "Gases de fÃ³tons e radiaÃ§Ã£o", "Sistemas de bÃ³sons e fÃ©rmions", "CÃ¡lculo de propriedades macroscÃ³picas"]', '{"4302308", "4302305"}', 'estavel'),
('4302404', 'MecÃ¢nica QuÃ¢ntica II', 'bach', 'obrigatoria', 8, 4, 0, false, '["Teoria de PerturbaÃ§Ã£o independente e dependente do tempo", "MÃ©todo Variacional", "AproximaÃ§Ã£o WKB", "Teoria de Espalhamento", "Estrutura Fina e Efeito Stark"]', '{"4302403"}', 'estavel'),
('4302402', 'LaboratÃ³rio de FÃ­sica AvanÃ§ada', 'bach', 'obrigatoria', 8, 8, 0, true, '["RessonÃ¢ncia MagnÃ©tica Nuclear", "Efeito MÃ¶ssbauer", "FÃ­sica de Baixas Temperaturas", "Supercondutividade", "FÃ­sica Nuclear Experimental"]', '{"4302314"}', 'estavel'),
('4300402', 'IntroduÃ§Ã£o Ã  FÃ­sica do Estado SÃ³lido', 'bach', 'eletiva', 8, 4, 0, false, '["Estrutura Cristalina e Rede RecÃ­proca", "VibraÃ§Ãµes da rede e fÃ´nons", "GÃ¡s de elÃ©trons de Fermi", "Estrutura de bandas em sÃ³lidos", "Semicondutores e Propriedades MagnÃ©ticas"]', '{"4302403", "4302401"}', 'estavel'),
('4300378', 'IntroduÃ§Ã£o Ã  FÃ­sica Nuclear e de PartÃ­culas', 'bach', 'eletiva', 8, 4, 0, false, '["Propriedades dos nÃºcleos e decaimentos", "Modelos Nucleares", "InteraÃ§Ã£o da radiaÃ§Ã£o com a matÃ©ria", "PartÃ­culas elementares e Modelo PadrÃ£o", "Aceleradores e Detectores"]', '{"4302403"}', 'estavel')
ON CONFLICT (course_code) DO UPDATE SET title = EXCLUDED.title, excitation_level = EXCLUDED.excitation_level, credits_aula = EXCLUDED.credits_aula, credits_trabalho = EXCLUDED.credits_trabalho, is_experimental = EXCLUDED.is_experimental, program = EXCLUDED.program, prerequisites = EXCLUDED.prerequisites, axis = EXCLUDED.axis, category = EXCLUDED.category;

-- ========================================
-- BLOCO C: LICENCIATURA (axis='lic')
-- ========================================
INSERT INTO public.learning_trails 
(course_code, title, axis, category, excitation_level, credits_aula, credits_trabalho, is_experimental, program, prerequisites, status)
VALUES 
('4300151', 'Fundamentos de MecÃ¢nica', 'lic', 'obrigatoria', 1, 4, 0, false, '["Grandezas FÃ­sicas e Vetores", "CinemÃ¡tica da PartÃ­cula", "Leis de Newton", "Trabalho e Energia CinÃ©tica", "ConservaÃ§Ã£o da Energia"]', '{}', 'estavel'),
('4300157', 'CiÃªncia, EducaÃ§Ã£o e Linguagem', 'lic', 'obrigatoria', 1, 2, 1, false, '["Linguagem CientÃ­fica e Escolar", "HistÃ³ria da CiÃªncia na EducaÃ§Ã£o", "ArgumentaÃ§Ã£o no Ensino de CiÃªncias", "DivulgaÃ§Ã£o CientÃ­fica", "Leitura e Escrita em FÃ­sica"]', '{}', 'estavel'),
('4300160', 'Ã“tica', 'lic', 'obrigatoria', 1, 2, 1, true, '["ReflexÃ£o e RefraÃ§Ã£o", "Espelhos e Lentes", "Ã“tica GeomÃ©trica", "InterferÃªncia e DifraÃ§Ã£o", "Instrumentos Ã“ticos"]', '{}', 'estavel'),
('4300152', 'IntroduÃ§Ã£o Ã s Medidas em FÃ­sica', 'lic', 'obrigatoria', 2, 4, 0, true, '["Teoria de Erros e Incertezas", "Instrumentos de Medida", "GrÃ¡ficos e LinearizaÃ§Ã£o", "DistribuiÃ§Ãµes EstatÃ­sticas", "RelatÃ³rios Experimentais"]', '{}', 'estavel'),
('4300153', 'MecÃ¢nica', 'lic', 'obrigatoria', 2, 4, 1, false, '["Sistemas de PartÃ­culas", "ColisÃµes e Momento Linear", "RotaÃ§Ãµes de Corpos RÃ­gidos", "Torque e Momento Angular", "EquilÃ­brio EstÃ¡tico"]', '{"4300151"}', 'estavel'),
('4300156', 'GravitaÃ§Ã£o', 'lic', 'obrigatoria', 2, 2, 0, false, '["Leis de Kepler", "Lei da GravitaÃ§Ã£o Universal", "Potencial Gravitacional", "Ã“rbita e Energia Orbital", "NoÃ§Ãµes de Cosmologia"]', '{"4300151"}', 'estavel'),
('EDM0402', 'DidÃ¡tica', 'lic', 'obrigatoria', 2, 4, 1, false, '["Teorias da Aprendizagem", "Planejamento Escolar", "MÃ©todos de Ensino", "AvaliaÃ§Ã£o Educacional", "RelaÃ§Ã£o Professor-Aluno"]', '{}', 'estavel'),
('4300159', 'FÃ­sica do Calor', 'lic', 'obrigatoria', 3, 4, 0, false, '["Temperatura e Calor", "Primeira e Segunda Lei da TermodinÃ¢mica", "Gases Ideais", "Teoria CinÃ©tica dos Gases", "Entropia"]', '{"4300151"}', 'estavel'),
('4300254', 'LaboratÃ³rio de MecÃ¢nica', 'lic', 'obrigatoria', 3, 2, 0, true, '["Experimentos de CinemÃ¡tica", "DinÃ¢mica e Atrito", "ConservaÃ§Ã£o de Energia Experimental", "Momento de InÃ©rcia", "OscilaÃ§Ãµes MecÃ¢nicas"]', '{"4300152", "4300153"}', 'estavel'),
('4300255', 'MecÃ¢nica dos Corpos RÃ­gidos e dos Fluidos', 'lic', 'obrigatoria', 3, 4, 1, false, '["Tensores de InÃ©rcia", "DinÃ¢mica de RotaÃ§Ã£o AvanÃ§ada", "EstÃ¡tica dos Fluidos", "DinÃ¢mica dos Fluidos", "EquaÃ§Ãµes de Bernoulli e Continuidade"]', '{"4300153"}', 'estavel'),
('4300259', 'Termo-estatÃ­stica', 'lic', 'obrigatoria', 4, 4, 1, false, '["Microestados e Macroestados", "DistribuiÃ§Ã£o de Boltzmann", "TransiÃ§Ãµes de Fase", "EstatÃ­sticas de Maxwell-Boltzmann", "AplicaÃ§Ãµes EstatÃ­sticas na FÃ­sica"]', '{"4300159"}', 'estavel'),
('4300270', 'Eletricidade e Magnetismo I', 'lic', 'obrigatoria', 4, 4, 0, false, '["Carga ElÃ©trica e Lei de Coulomb", "Campo ElÃ©trico e Lei de Gauss", "Potencial ElÃ©trico", "CapacitÃ¢ncia e DielÃ©tricos", "Corrente ElÃ©trica e ResistÃªncia"]', '{"4300153"}', 'estavel'),
('4300356', 'Elementos e EstratÃ©gia para o Ensino de FÃ­sica e CiÃªncias', 'lic', 'obrigatoria', 4, 4, 1, false, '["TransposiÃ§Ã£o DidÃ¡tica", "Experimentos de Baixo Custo", "Uso de Tecnologias no Ensino", "SeqÃ¼Ãªncias de Ensino Investigativo", "PCN e BNCC de FÃ­sica"]', '{"EDM0402"}', 'estavel'),
('4300271', 'Eletricidade e Magnetismo II', 'lic', 'obrigatoria', 5, 4, 1, false, '["ForÃ§a MagnÃ©tica e Campo MagnÃ©tico", "Lei de Biot-Savart e Lei de AmpÃ¨re", "InduÃ§Ã£o de Faraday e Lei de Lenz", "Circuitos AC", "Propriedades MagnÃ©ticas da MatÃ©ria"]', '{"4300270"}', 'estavel'),
('4300357', 'OscilaÃ§Ãµes e Ondas', 'lic', 'obrigatoria', 5, 2, 0, false, '["Oscilador HarmÃ´nico Simples", "OscilaÃ§Ãµes Amortecidas e ForÃ§adas", "EquaÃ§Ã£o de Onda", "Som e Ondas em Cordas", "Efeito Doppler"]', '{"4300153"}', 'estavel'),
('4300358', 'Propostas e Projetos para o Ensino de FÃ­sica e CiÃªncias', 'lic', 'obrigatoria', 5, 4, 1, false, '["ElaboraÃ§Ã£o de Projetos Escolares", "Feiras de CiÃªncias", "Interdisciplinaridade", "AvaliaÃ§Ã£o de Projetos Educativos", "Ã‰tica na Pesquisa Educacional"]', '{"4300356"}', 'estavel'),
('4300373', 'LaboratÃ³rio de Eletromagnetismo', 'lic', 'obrigatoria', 5, 4, 0, true, '["Mapeamento de Campo ElÃ©trico", "BalanÃ§a de Corrente", "InduÃ§Ã£o EletromagnÃ©tica Experimental", "Carga e Descarga de Capacitores", "Transformadores"]', '{"4300270", "4300152"}', 'estavel'),
('4300390', 'PrÃ¡ticas em Ensino de FÃ­sica e CiÃªncias', 'lic', 'obrigatoria', 5, 2, 3, false, '["ObservaÃ§Ã£o e RegÃªncia em Sala de Aula", "Desenvolvimento de Materiais DidÃ¡ticos", "PrÃ¡ticas Experimentais Docentes", "AnÃ¡lise CrÃ­tica da PrÃ¡tica Escolar", "RelatÃ³rio de PrÃ¡tica de Ensino"]', '{"4300356"}', 'estavel'),
('4300372', 'Eletromagnetismo', 'lic', 'obrigatoria', 6, 4, 0, false, '["EquaÃ§Ãµes de Maxwell", "Ondas EletromagnÃ©ticas no VÃ¡cuo", "Vetor de Poynting e Energia", "RadiaÃ§Ã£o EletromagnÃ©tica", "Potenciais de LiÃ©nard-Wiechert"]', '{"4300271"}', 'estavel'),
('4300374', 'Relatividade', 'lic', 'obrigatoria', 6, 2, 1, false, '["Postulados da Relatividade Especial", "TransformaÃ§Ãµes de Lorentz", "DilataÃ§Ã£o do Tempo e ContraÃ§Ã£o do EspaÃ§o", "MecÃ¢nica RelativÃ­stica", "E=mcÂ² e Energia de Repouso"]', '{"4300153"}', 'estavel'),
('4300377', 'EvidÃªncias Experimentais da Natureza QuÃ¢ntica', 'lic', 'obrigatoria', 6, 4, 0, true, '["RadiaÃ§Ã£o de Corpo Negro", "Efeito FotoelÃ©trico", "Efeito Compton", "Espectros AtÃ´micos", "Dualidade Onda-PartÃ­cula"]', '{"4300271", "4300373"}', 'estavel'),
('4300371', 'IntroduÃ§Ã£o Ã  MecÃ¢nica QuÃ¢ntica OndulatÃ³ria', 'lic', 'obrigatoria', 7, 4, 1, false, '["EquaÃ§Ã£o de SchrÃ¶dinger", "PoÃ§os de Potencial", "Oscilador HarmÃ´nico QuÃ¢ntico", "Ãtomo de HidrogÃªnio", "Spin e PrincÃ­pio de ExclusÃ£o"]', '{"4300377", "4300357"}', 'estavel'),
('4300458', 'Complementos de MecÃ¢nica ClÃ¡ssica', 'lic', 'obrigatoria', 7, 4, 0, false, '["MecÃ¢nica Lagrangiana", "MecÃ¢nica Hamiltoniana", "Pequenas OscilaÃ§Ãµes", "VÃ­nculos e Coordenadas Generalizadas", "Sistemas nÃ£o-Inerciais"]', '{"4300255"}', 'estavel'),
('EDM0425', 'Metodologia do Ensino de FÃ­sica I', 'lic', 'obrigatoria', 7, 4, 3, false, '["HistÃ³ria do Ensino de FÃ­sica", "Conceitos de Epistemologia da CiÃªncia", "EstratÃ©gias de ResoluÃ§Ã£o de Problemas", "LaboratÃ³rios DidÃ¡ticos no Ensino MÃ©dio", "AnÃ¡lise de Livros DidÃ¡ticos"]', '{"4300356"}', 'estavel'),
('MFT0964', 'LÃ­ngua Brasileira de Sinais', 'lic', 'obrigatoria', 7, 4, 2, false, '["Cultura Surda e Identidade", "GramÃ¡tica BÃ¡sica de Libras", "VocabulÃ¡rio do Cotidiano e CientÃ­fico", "LegislaÃ§Ã£o e EducaÃ§Ã£o Especial", "PrÃ¡ticas de InterpretaÃ§Ã£o"]', '{}', 'estavel'),
('EDM0426', 'Metodologia do Ensino de FÃ­sica II', 'lic', 'obrigatoria', 8, 4, 3, false, '["Ensino de FÃ­sica Moderna", "Cultura CientÃ­fica e Sociedade", "Aulas de Campo e Museus", "TemÃ¡ticas Atuais do Ensino de FÃ­sica", "Trabalho de ConclusÃ£o de Curso Docente"]', '{"EDM0425"}', 'estavel')
ON CONFLICT (course_code) DO UPDATE SET title = EXCLUDED.title, excitation_level = EXCLUDED.excitation_level, credits_aula = EXCLUDED.credits_aula, credits_trabalho = EXCLUDED.credits_trabalho, is_experimental = EXCLUDED.is_experimental, program = EXCLUDED.program, prerequisites = EXCLUDED.prerequisites, axis = EXCLUDED.axis, category = EXCLUDED.category;

-- ========================================
-- BLOCO C (cont.): FÃSICA MÃ‰DICA (axis='med')
-- ========================================
INSERT INTO public.learning_trails 
(course_code, title, axis, category, excitation_level, credits_aula, credits_trabalho, is_experimental, program, prerequisites, status)
VALUES 
('MDR0632', 'IntroduÃ§Ã£o Ã  FÃ­sica MÃ©dica', 'med', 'obrigatoria', 2, 2, 0, false, '["HistÃ³ria da FÃ­sica MÃ©dica", "Ãreas de AtuaÃ§Ã£o Profissional", "Conceitos BÃ¡sicos de Radiobiologia", "OrganizaÃ§Ã£o Hospitalar", "Ã‰tica na FÃ­sica MÃ©dica"]', '{}', 'estavel'),
('MDR0633', 'Elementos de Anatomia e Fisiologia Humana', 'med', 'obrigatoria', 2, 4, 0, false, '["Sistema EsquelÃ©tico e Muscular", "Sistema Cardiovascular e RespiratÃ³rio", "Sistema Nervoso e EndÃ³crino", "Fisiologia Celular e BiofÃ­sica", "Anatomia RadiogrÃ¡fica"]', '{}', 'estavel'),
('MDR0635', 'EstatÃ­stica MÃ©dica I', 'med', 'obrigatoria', 3, 4, 0, false, '["BioestatÃ­stica e Probabilidade", "Testes de HipÃ³teses MÃ©dicas", "AnÃ¡lise de CorrelaÃ§Ã£o e RegressÃ£o", "Curvas de SobrevivÃªncia", "Epidemiologia Quantitativa"]', '{}', 'estavel'),
('MDR0634', 'InformÃ¡tica MÃ©dica e SaÃºde Digital', 'med', 'obrigatoria', 4, 4, 0, false, '["Sistemas de InformaÃ§Ã£o em SaÃºde", "PruontuÃ¡rio EletrÃ´nico", "PadrÃ£o DICOM e PACS", "Telemedicina", "InteligÃªncia Artificial na SaÃºde"]', '{}', 'estavel'),
('4300325', 'FÃ­sica do Corpo Humano', 'med', 'obrigatoria', 5, 4, 0, false, '["BiomecÃ¢nica e DinÃ¢mica EsquelÃ©tica", "BiofÃ­sica dos Fluidos CirculatÃ³rios", "Processos de Transporte no Corpo", "TermodinÃ¢mica BiolÃ³gica", "Bioeletricidade"]', '{"4302112", "MAT2454"}', 'estavel'),
('MDR0637', 'DiagnÃ³stico por Imagens MÃ©dicas', 'med', 'obrigatoria', 5, 4, 0, false, '["TÃ©cnicas de RadiodiagnÃ³stico", "Tomografia Computadorizada", "RessonÃ¢ncia MagnÃ©tica", "Ultrassonografia MÃ©dica", "IntroduÃ§Ã£o Ã  Medicina Nuclear"]', '{"4302212"}', 'estavel'),
('MDR0639', 'FÃ­sica do DiagnÃ³stico por imagens I', 'med', 'obrigatoria', 5, 4, 0, false, '["FÃ­sica da ProduÃ§Ã£o de Raios-X", "InteraÃ§Ã£o da RadiaÃ§Ã£o com a MatÃ©ria", "Qualidade da Imagem RadiogrÃ¡fica", "Dosimetria em RadiodiagnÃ³stico", "Sistemas de DetecÃ§Ã£o de RadiaÃ§Ã£o"]', '{"4302212"}', 'estavel'),
('4300436', 'Efeitos BiolÃ³gicos das RadiaÃ§Ãµes', 'med', 'obrigatoria', 6, 4, 0, false, '["Mecanismos Celulares de Dano por RadiaÃ§Ã£o", "Efeitos EstocÃ¡sticos e RadioinduÃ§Ã£o", "Efeitos DeterminÃ­sticos e SÃ­ndromes Radiais", "CinÃ©tica de Reparo de DNA", "RelaÃ§Ã£o Dose-Resposta BiolÃ³gica"]', '{"MDR0633"}', 'estavel'),
('4302305_MED', 'MecÃ¢nica I (FÃ­sica MÃ©dica)', 'med', 'obrigatoria', 6, 4, 0, false, '["CinemÃ¡tica em 3D", "DinÃ¢mica de Sistemas de PartÃ­culas", "OscilaÃ§Ãµes MecÃ¢nicas AvanÃ§adas", "ForÃ§as Centrais e Ã“rbitas", "Sistemas de ReferÃªncia nÃ£o Inerciais"]', '{"4302112", "MAT0216"}', 'estavel'),
('4302311_MED', 'FÃ­sica QuÃ¢ntica (FÃ­sica MÃ©dica)', 'med', 'obrigatoria', 6, 2, 0, false, '["FÃ­sica Moderna e Ãtomo de Bohr", "EquaÃ§Ã£o de SchrÃ¶dinger 1D", "Potenciais de Barreira e Tunelamento", "Modelos AtÃ´micos de Muitos ElÃ©trons", "RadiaÃ§Ã£o e MatÃ©ria em Escala MicroscÃ³pica"]', '{"4302212"}', 'estavel'),
('4300437', 'FÃ­sica das RadiaÃ§Ãµes I', 'med', 'obrigatoria', 7, 6, 0, false, '["FÃ­sica Nuclear BÃ¡sica", "CinÃ©tica de Decaimento Radioativo", "InteraÃ§Ã£o de PartÃ­culas Carregadas e FÃ³tons", "Fontes Radioativas na Medicina", "Teoria da Cavidade e Dosimetria"]', '{"4302311"}', 'estavel'),
('MDR0640', 'ProteÃ§Ã£o RadiolÃ³gica I', 'med', 'obrigatoria', 7, 4, 0, false, '["Normas da CNEN e VigilÃ¢ncia SanitÃ¡ria", "CÃ¡lculo de Blindagens MÃ©dicas", "MonitoraÃ§Ã£o Individual e de Ã¡rea", "Plano de ProteÃ§Ã£o RadiolÃ³gica Hospitalar", "Gerenciamento de Rejeitos Radioativos"]', '{"MDR0639"}', 'estavel'),
('4300439', 'LaboratÃ³rio de Dosimetria das RadiaÃ§Ãµes', 'med', 'obrigatoria', 8, 4, 0, true, '["CalibraÃ§Ã£o de CÃ¢maras de IonizaÃ§Ã£o", "Medidas de Kerma e Dose Absorvida", "Dosimetria Termoluminescente (TLD)", "Contadores Geiger-MÃ¼ller e CintilaÃ§Ã£o", "Garantia de Qualidade em Dosimetria"]', '{"4300437"}', 'estavel'),
('MDR0641', 'Medicina Nuclear', 'med', 'obrigatoria', 8, 4, 0, false, '["RadiofÃ¡rmacos e Marcadores", "FÃ­sica da CÃ¢mara Gama e SPECT", "FÃ­sica do PET-CT", "Dosimetria Interna em Medicina Nuclear", "Controle de Qualidade em Equipamentos de Medicina Nuclear"]', '{"4300437"}', 'estavel'),
('MDR0642', 'Radioterapia', 'med', 'obrigatoria', 8, 4, 0, false, '["Aceleradores Lineares MÃ©dicos", "Braquiterapia FÃ­sica", "Planejamento de Tratamento Computadorizado", "DistribuiÃ§Ã£o de Dose em Radioterapia", "Protocolos de Dosimetria ClÃ­nica"]', '{"4300437"}', 'estavel'),
('MDR0643', 'FÃ­sica do DiagnÃ³stico por Imagens II', 'med', 'obrigatoria', 8, 4, 0, false, '["FÃ­sica da RessonÃ¢ncia MagnÃ©tica", "FÃ­sica do Ultrassom", "Processamento Digital de Imagens MÃ©dicas", "SeguranÃ§a em Ambientes de RM", "AplicaÃ§Ãµes de Contraste e Doppler"]', '{"MDR0639"}', 'estavel'),
('MDR0644', 'IntroduÃ§Ã£o ao Ambiente Hospitalar', 'med', 'obrigatoria', 8, 2, 0, false, '["GestÃ£o da Qualidade Hospitalar", "BiosseguranÃ§a e Controle de InfecÃ§Ã£o", "Rotinas e Fluxos Hospitalares", "SeguranÃ§a do Paciente", "Tecnologia em SaÃºde e Sustentabilidade"]', '{"MDR0632"}', 'estavel'),
('MDR0645', 'IntroduÃ§Ã£o Ã  SaÃºde Ocupacional, Medicina Legal e Ã‰tica da FÃ­sica MÃ©dica', 'med', 'obrigatoria', 9, 4, 0, false, '["LegislaÃ§Ã£o do Trabalho e PerÃ­cias", "Ã‰tica no Atendimento MÃ©dico-Hospitalar", "SaÃºde do Profissional da FÃ­sica MÃ©dica", "Responsabilidade Civil do FÃ­sico MÃ©dico", "CÃ³digos de Ã‰tica Profissional"]', '{"MDR0640"}', 'estavel'),
('MDR0646', 'TÃ³picos AvanÃ§ados de MatemÃ¡tica e FÃ­sica em Medicina', 'med', 'obrigatoria', 9, 4, 0, false, '["SimulaÃ§Ãµes Monte Carlo na FÃ­sica MÃ©dica", "Processamento AvanÃ§ado de Sinais MÃ©dicos", "Modelagem NumÃ©rica em Radiobiologia", "BiofotÃ´nica", "Nanomedicina e FÃ­sica"]', '{"4302305", "4302303"}', 'estavel'),
('MDR0647', 'EstÃ¡gio Hospitalar Geral', 'med', 'obrigatoria', 9, 0, 4, false, '["PrÃ¡tica em ProteÃ§Ã£o RadiolÃ³gica", "Acompanhamento TÃ©cnico em DiagnÃ³stico", "Rotinas de Medicina Nuclear e Radioterapia", "RelatÃ³rio de Atividades Hospitalares", "InteraÃ§Ã£o Multidisciplinar ClÃ­nica"]', '{"MDR0640", "MDR0641", "MDR0642"}', 'estavel'),
('MDR0660', 'PrÃ¡tica Profissional em Imagens MÃ©dicas', 'med', 'obrigatoria', 10, 0, 5, false, '["ExecuÃ§Ã£o de Protocolos de CQ em Imagem", "AnÃ¡lise de Imagens para DiagnÃ³stico", "GestÃ£o de Sistemas de AquisiÃ§Ã£o", "OtimizaÃ§Ã£o de Dose em Radiologia", "SeminÃ¡rios de PrÃ¡tica ClÃ­nica"]', '{"MDR0647"}', 'estavel'),
('MDR0661', 'PrÃ¡tica Profissional em Radioterapia', 'med', 'obrigatoria', 10, 0, 5, false, '["Dosimetria em Aceleradores Lineares", "VerificaÃ§Ã£o de Planos e IMRT", "GestÃ£o de SeguranÃ§a em Radioterapia", "Controle de Qualidade em Braquiterapia", "ApresentaÃ§Ã£o de Casos ClÃ­nicos"]', '{"MDR0647"}', 'estavel')
ON CONFLICT (course_code) DO UPDATE SET title = EXCLUDED.title, excitation_level = EXCLUDED.excitation_level, credits_aula = EXCLUDED.credits_aula, credits_trabalho = EXCLUDED.credits_trabalho, is_experimental = EXCLUDED.is_experimental, program = EXCLUDED.program, prerequisites = EXCLUDED.prerequisites, axis = EXCLUDED.axis, category = EXCLUDED.category;

-- ========================================
-- BLOCO D: OPTATIVAS & ELETIVAS
-- ========================================
INSERT INTO public.learning_trails 
(course_code, title, axis, category, excitation_level, credits_aula, credits_trabalho, is_experimental, program, prerequisites, status)
VALUES 
('AGA0319', 'Relatividade Geral e AplicaÃ§Ãµes AstrofÃ­sicas', 'bach', 'eletiva', 7, 4, 0, false, '["Relatividade restrita e mecÃ¢nica relativÃ­stica", "Gravidade e geometria do espaÃ§o-tempo", "EspaÃ§os-tempos curvos e geodÃ©sicas", "Buracos negros de Schwarzschild e Kerr", "Ondas gravitacionais"]', '{"4302305"}', 'estavel'),
('4300430', 'Cosmologia FÃ­sica', 'bach', 'eletiva', 8, 4, 0, false, '["Modelo cosmolÃ³gico padrÃ£o", "ExpansÃ£o do universo e Lei de Hubble", "NucleossÃ­ntese primordial", "RadiaÃ§Ã£o CÃ³smica de Fundo", "Energia escura e matÃ©ria escura"]', '{"4302403"}', 'estavel'),
('AGA0293', 'AstrofÃ­sica Estelar', 'bach', 'eletiva', 7, 4, 0, false, '["Estrutura e evoluÃ§Ã£o estelar", "NucleossÃ­ntese em estrelas", "Diagrama HR e classificaÃ§Ã£o espectral", "AnÃ£s brancas e estrelas de nÃªutrons", "Supernovas e elementos pesados"]', '{"4302212"}', 'estavel'),
('AGA0299', 'AstrofÃ­sica GalÃ¡ctica', 'bach', 'eletiva', 8, 4, 0, false, '["Estrutura da Via LÃ¡ctea", "PopulaÃ§Ãµes estelares e meio interestelar", "DinÃ¢mica galÃ¡ctica", "GalÃ¡xias ativas e quasares", "FormaÃ§Ã£o e evoluÃ§Ã£o de galÃ¡xias"]', '{"AGA0293"}', 'estavel'),
('4300441', 'Detectores de RadiaÃ§Ã£o', 'bach', 'eletiva', 7, 4, 0, false, '["Detectores a gÃ¡s (Geiger-MÃ¼ller)", "Detectores de cintilaÃ§Ã£o", "Detectores semicondutores", "Fotodetectores e CCDs", "EletrÃ´nica de aquisiÃ§Ã£o de dados"]', '{"4302212"}', 'estavel'),
('4300405', 'EvoluÃ§Ã£o dos Conceitos da FÃ­sica', 'bach', 'eletiva', 5, 4, 0, false, '["FÃ­sica aristotÃ©lica e medieval", "RevoluÃ§Ã£o copernicana e mecÃ¢nica newtoniana", "TermodinÃ¢mica e eletromagnetismo no sÃ©c XIX", "Relatividade e mecÃ¢nica quÃ¢ntica", "FÃ­sica contemporÃ¢nea e fronteiras"]', '{}', 'estavel'),
('4300420', 'IntroduÃ§Ã£o Ã  FÃ­sica de Plasmas', 'bach', 'eletiva', 8, 4, 0, false, '["Conceitos fundamentais de plasmas", "EquaÃ§Ãµes de movimento de partÃ­culas carregadas", "Ondas em plasmas", "Confinamento magnÃ©tico e Tokamaks", "AplicaÃ§Ãµes tecnolÃ³gicas de plasmas"]', '{"4302303", "4302305"}', 'estavel'),
('4300410', 'Ã“ptica NÃ£o-Linear', 'bach', 'eletiva', 8, 4, 0, false, '["PolarizaÃ§Ã£o nÃ£o-linear e susceptibilidade", "GeraÃ§Ã£o de segundo harmÃ´nico", "Efeito Kerr Ã³ptico", "Espalhamento Raman estimulado", "AplicaÃ§Ãµes em lasers e telecomunicaÃ§Ãµes"]', '{"4302303"}', 'estavel'),
('4300415', 'FÃ­sica Computacional', 'bach', 'eletiva', 6, 4, 0, false, '["MÃ©todos de Monte Carlo", "DinÃ¢mica molecular", "ResoluÃ§Ã£o numÃ©rica de EDPs", "SimulaÃ§Ã£o de sistemas quÃ¢nticos", "VisualizaÃ§Ã£o cientÃ­fica e anÃ¡lise de dados"]', '{"MAC0115", "4302212"}', 'estavel'),
('4300425', 'IntroduÃ§Ã£o Ã  Teoria QuÃ¢ntica de Campos', 'bach', 'eletiva', 9, 4, 0, false, '["QuantizaÃ§Ã£o canÃ´nica do campo escalar", "Campo de Dirac e spinores", "EletrodinÃ¢mica quÃ¢ntica (QED)", "Diagramas de Feynman", "RenormalizaÃ§Ã£o e grupo de renormalizaÃ§Ã£o"]', '{"4302404"}', 'estavel'),
('4300435', 'Supercondutividade e SuperfluÃ­dez', 'bach', 'eletiva', 9, 4, 0, false, '["Fenomenologia da supercondutividade", "Teoria BCS", "Efeito Josephson", "Supercondutores de alta temperatura", "SuperfluÃ­dez do HÃ©lio lÃ­quido"]', '{"4302403", "4302401"}', 'estavel'),
('4300445', 'Aprendizado de MÃ¡quina para FÃ­sica', 'bach', 'eletiva', 8, 4, 0, false, '["RegressÃ£o e classificaÃ§Ã£o", "Redes neurais e deep learning", "AnÃ¡lise de dados experimentais com ML", "SimulaÃ§Ãµes assistidas por IA", "AplicaÃ§Ãµes em fÃ­sica de partÃ­culas e materiais"]', '{"MAC0115"}', 'estavel'),
('4300450', 'FÃ­sica de Semicondutores', 'bach', 'eletiva', 8, 4, 0, false, '["Estrutura de bandas em semicondutores", "Portadores de carga e dopagem", "JunÃ§Ã£o p-n e diodos", "Transistores e dispositivos optoeletrÃ´nicos", "Nanodispositivos e LEDs"]', '{"4300402"}', 'estavel'),
('4300455', 'CaracterizaÃ§Ã£o de Materiais', 'bach', 'eletiva', 8, 4, 0, true, '["DifraÃ§Ã£o de Raios-X e estrutura cristalina", "Microscopia eletrÃ´nica (SEM, TEM)", "Espectroscopia Raman e Infravermelho", "Microscopia de ForÃ§a AtÃ´mica (AFM)", "AnÃ¡lise tÃ©rmica e calorimetria"]', '{"4302212"}', 'estavel'),
('4300465', 'EvoluÃ§Ã£o dos Conceitos da FÃ­sica (Lic)', 'lic', 'eletiva', 6, 4, 0, false, '["GÃªnese do pensamento cientÃ­fico", "Newton e a mecÃ¢nica clÃ¡ssica", "Eletromagnetismo e termodinÃ¢mica no sÃ©c XIX", "Crise da fÃ­sica clÃ¡ssica", "ConstruÃ§Ã£o da fÃ­sica moderna"]', '{}', 'estavel'),
('4300470', 'DivulgaÃ§Ã£o CientÃ­fica e Ensino de FÃ­sica', 'lic', 'eletiva', 7, 2, 2, false, '["Museus e centros de ciÃªncia", "MÃ­dias digitais na divulgaÃ§Ã£o", "ProduÃ§Ã£o de material de divulgaÃ§Ã£o", "ComunicaÃ§Ã£o pÃºblica da ciÃªncia", "FÃ­sica para nÃ£o-fÃ­sicos"]', '{}', 'estavel'),
('4300475', 'Processos Criativos no Ensino', 'lic', 'eletiva', 7, 2, 2, false, '["Criatividade e inovaÃ§Ã£o educacional", "Design thinking aplicado ao ensino", "GamificaÃ§Ã£o na sala de aula", "Projetos STEAM", "Teatro e arte na educaÃ§Ã£o cientÃ­fica"]', '{"EDM0402"}', 'estavel'),
('4300480', 'FÃ­sica e Sociedade', 'lic', 'eletiva', 5, 2, 0, false, '["CiÃªncia, Tecnologia e Sociedade (CTS)", "Impactos ambientais da energia nuclear", "Ã‰tica na pesquisa cientÃ­fica", "PolÃ­tica cientÃ­fica no Brasil", "FÃ­sica e sustentabilidade"]', '{}', 'estavel'),
('MDR0650', 'Aceleradores de PartÃ­culas na Medicina', 'med', 'eletiva', 9, 4, 0, false, '["PrincÃ­pios de aceleraÃ§Ã£o de partÃ­culas", "CÃ­clotrons e sÃ­ncrotrons mÃ©dicos", "Terapia com prÃ³tons e Ã­ons pesados", "ProduÃ§Ã£o de radioisÃ³topos para PET", "Dosimetria em hadronterapia"]', '{"4300437"}', 'estavel'),
('MDR0655', 'Sala Limpa e Nanotecnologia MÃ©dica', 'med', 'eletiva', 9, 4, 0, true, '["Protocolos de sala limpa", "FabricaÃ§Ã£o de microdispositivos", "NanopartÃ­culas para diagnÃ³stico", "TeranÃ³stica e nanomedicina", "Controle de qualidade em nanofabricaÃ§Ã£o"]', '{"MDR0633"}', 'estavel'),
('5910186', 'BiofÃ­sica I', 'med', 'eletiva', 6, 4, 0, false, '["TermodinÃ¢mica de sistemas biolÃ³gicos", "Transporte atravÃ©s de membranas", "Eletrofisiologia", "Estrutura de biomolÃ©culas", "BioenergÃ©tica celular"]', '{"4302112"}', 'estavel'),
('4300485', 'PartÃ­culas Elementares para Leigos', 'bach', 'livre', 3, 2, 0, false, '["O que sÃ£o partÃ­culas elementares", "O Modelo PadrÃ£o simplificado", "O BÃ³son de Higgs", "Aceleradores de partÃ­culas: como funcionam", "MistÃ©rios nÃ£o resolvidos da fÃ­sica"]', '{}', 'estavel')
ON CONFLICT (course_code) DO UPDATE SET title = EXCLUDED.title, excitation_level = EXCLUDED.excitation_level, credits_aula = EXCLUDED.credits_aula, credits_trabalho = EXCLUDED.credits_trabalho, is_experimental = EXCLUDED.is_experimental, program = EXCLUDED.program, prerequisites = EXCLUDED.prerequisites, axis = EXCLUDED.axis, category = EXCLUDED.category;

-- --- FILE: 20260307000001_seed_missing_disciplines.sql ---

-- Migrations: seed missing disciplines

INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('732017e2-992b-46f7-bd5f-98ff01514400', 'Probabilidade', '4300223', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('23a04a91-cc85-4e34-9717-820f71a4dfad', 'MecÃ¢nica QuÃ¢ntica AvanÃ§ada I', '4305001', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('dfbb6b0c-4142-4873-b986-9a79c4c6eff8', 'MecÃ¢nica QuÃ¢ntica AvanÃ§ada II', '4305002', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('38499359-c82c-496c-bbb6-3d4d2c09e43f', 'EletrodinÃ¢mi ca I', '4305003', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('b05fd886-e01b-49ff-b286-dce1d8c834dc', 'EletrodinÃ¢mi ca II', '4305004', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('0d76fc30-8dd6-4639-b346-acf0eed5fb7d', 'MecÃ¢nica ClÃ¡ssica', '4305005', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('4d977d13-e062-4f99-a513-87d4b84ca284', 'MecÃ¢nica EstatÃ­stica II', '4305006', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('cd22bb60-6d4b-45d7-aed5-3f4da92723e2', 'TÃ³picos avanÃ§ados em  tratamento estatÃ­stico de dados em fÃ­sica experimental', '4305103', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('1a63fb77-311d-44ab-afdd-493f1db8ddea', 'FÃ­sica de PartÃ­culas Eleme ntares', '4305106', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('a7894995-9795-419f-814c-5d2c4760df00', 'IntroduÃ§Ã£o Ã  Teoria QuÃ¢ntica de Camp os I', '4305107', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('ca6de039-b68b-4302-9953-bfdac258041d', 'FÃ­sica do Estado SÃ³ lido I', '4305110', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('59df1297-c852-4d31-9e98-c7bf18dec987', 'Microscopia de ForÃ§a AtÃ´mi ca e Tunelame nto', '4305205', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('ab2338a5-c19c-467f-a52b-e90ad25e4319', 'Simu laÃ§Ã£o Comp utacional de LÃ­quidos Moleculares e So luÃ§Ãµes', '4305216', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('4db0b290-2c24-4e20-aaac-7880118de9b5', 'IntroduÃ§Ã£o Ã  Teoria QuÃ¢ntica da Luz', '4305275', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('bd610e9e-f87d-4bec-ace6-b57b34401b1e', 'Cosmo logia FÃ­sica I', '4305292', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('d7696410-3ed7-49e1-905a-3667143f6990', 'Teoria QuÃ¢ntica de Muitos Corpos em  MatÃ©ria Condensada', '4305295', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('36d00fa9-d7ea-481b-8fce-526d96c2171f', 'Cosmo logia FÃ­sica II', '4305299', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('47f360a7-4111-4322-9709-cc7d64194c1b', 'IntroduÃ§Ã£o Ã  fÃ­sica de hÃ¡drons', '4305300', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('19920231-bcd5-41cf-ae2f-ce5942e623b7', 'Fenome nologia de ColisÃµes de Ã ons Pesados RelativÃ­sticos', '4305324', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('5aeed6b8-cf18-4e91-b773-8e42a0d61239', 'Sistema s DinÃ¢mi cos nÃ£o Lineares', '4305326', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('f15c953d-a9e0-4152-b4ff-c6edfbfefafd', 'Informa Ã§Ã£o QuÃ¢ntica e RuÃ­dos QuÃ¢nticos', '4305343', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('c1703519-7995-4478-af86-c92688497c3b', 'FenÃ´me nos Eme rgentes em  MatÃ©ria QuÃ¢ntica Correlacionada', '4305358', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('e11d972c-2729-4b8e-858f-23d77b8e26fc', 'MatÃ©ria QuÃ¢ntica TopolÃ³gica e seu desafio na fÃ­sica', '4305359', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('63dab033-c770-4619-9cf5-2db7f11c7809', 'Teoria do Funcional da Densidade: MolÃ©culas e SÃ³ lidos', '4305360', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('64a38cb4-7501-4b13-82e2-596c14f25d76', 'Processame nto de dispositivos em  sala limp a', '4305374', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('a6b75395-0748-481b-8196-04aa5e80a51b', 'Termo eletricidade e ma teriais quÃ¢nticos', '4305376', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('70e89c62-aeed-4bba-af78-26c12b026b5e', 'IntroduÃ§Ã£o Ã  Teoria QuÃ¢ntica de Camp os II', '4305828', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('19563216-42b4-46e6-be10-ff58e2cbe436', 'Eleme ntos de Mineralogia e Petrologia', 'GMG0630', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('97a769b1-c44d-4dd3-823e-d2465efea8b3', 'Fundame ntos de Oceanografia Fisica', 'IOF0201', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('359e21d8-28e9-4029-be50-19165115ed30', 'IntroduÃ§Ã£o Ã  DinÃ¢mi ca da Atmo sfera e dos Oceanos', 'IOF0210', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('fdf24eb5-e87d-478f-bac9-24a9f6b6a256', 'BioquÃ­mica e Biologia Molecular', 'QBQ0102', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('9c7929e0-dd7f-4362-95ab-2d1e4f14d546', 'BioquÃ­mica e Biologia Molecular', 'QBQ0104', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('5e98ab91-40a7-4c7b-a180-85f54d44e403', 'BioquÃ­mica', 'QBQ0106', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('bc85dc6f-9060-40ca-8553-38ac38e21c9e', 'BioquÃ­mica: Estrutura de Biomo lÃ©culas e Metabolismo', 'QBQ0116', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('089d37fb-2cda-417f-b1e1-019d081c076a', 'BioquÃ­mica: Estrutura de Biomo lÃ©culas e Metabolismo', 'QBQ0204', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('7a7d7911-81f7-4df7-9bca-64a9eda5f5f0', 'BioquÃ­mica', 'QBQ0313', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('81e1ae06-c579-4e67-bc45-9e9f25a5fc56', 'Biologia Molecular', 'QBQ0317', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('7e856e47-9677-48c1-87c9-4fedf0cd812d', 'BioquÃ­mica e Biologia Molecular: RealizaÃ§Ãµes e Perspectivas', 'QBQ2500', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('8ca74be8-d84f-4efd-ba70-1fb0ffaa2afe', 'Biologia Estrutural', 'QBQ2505', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('5b95767f-88eb-4778-8966-01dce02f7b19', 'BioquÃ­mica: Estrutura de Biomo lÃ©culas e Metabolismo', 'QBQ0230', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('91241ad0-4183-4d3b-9a7e-93f12933bbdf', 'BioquÃ­mica: Estrutura de Biomo lÃ©culas e Metabolismo', 'QBQ0250', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('9c5209f7-7b47-4aca-8e96-ee0383286688', 'BioquÃ­mica da NutriÃ§Ã£o', 'QBQ0314', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('7c6e601b-c6a4-4542-af2f-47f8c6f87c90', 'BioquÃ­mica MetabÃ³lica', 'QBQ1252', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('246e05b9-2d98-4cc4-8c9d-f1b95b8b7ae4', 'Tecnologia do Dna Recomb inante', 'QBQ2457', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('c485114c-173c-44f2-853d-aa82e4e7f25b', 'Biologia Molecular', 'QBQ1354', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('134bae9a-5a28-461a-bf78-3d7ab73c86ef', 'Enzimo logia', 'QBQ2502', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('20d28e8a-0621-4fcd-9620-5c29545b0349', 'ExpressÃ£o GÃªnica', 'QBQ2503', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('2283b342-af98-4c8b-ad03-a9e68fc8f59d', 'Biologia Molecular Comp utacional', 'QBQ2507', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('b6d9a216-8899-451a-b8b9-67a8f03519d4', 'Transporte e SinalizaÃ§Ã£o Celular', 'QBQ2508', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;
INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula) VALUES ('7c91cdba-f9f4-4c3d-8ba2-5aaebfa7e282', 'BioquÃ­mica Redox', 'QBQ2509', 'comum', 'eletiva', '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb, 1, 4) ON CONFLICT (course_code) DO NOTHING;

-- Migrations: update category map for existing

UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'b0f4f704-d14d-4a04-9f5e-39a6d420c2f9';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '81438ad1-1a6c-4bf7-9a80-ea729f7236cb';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'b33a97e8-2e70-4a7b-9a66-7dccbe4c9fe1';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'e0123a45-8e4c-4502-bca8-82c61f7577a2';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '7fcaf07f-734e-4156-be67-906fd4b9974f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f3e6ded1-1370-44a9-9d05-02e568a96cc3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f50fba42-faf3-4941-b0e2-f83cb2a43f57';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '921c9909-8899-440c-aa17-467ace6151af';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '9a731f29-e80c-4533-9071-798cde153c8d';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f3d32023-523d-46ae-8700-7931a6ac6292';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'b5d8d71b-7557-460e-9a32-7b2b2bfb4089';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'bc93e17b-f9b9-482c-8c77-d9baa018c0ca';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'a400fd8a-a27d-478c-9075-5d00cb1dde96';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3afc55b7-ce6c-45c4-8226-aeb864999cee';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'ea45aeba-1cc3-4c6a-8af3-0234fe9def1b';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '04e99c57-f9d6-460e-b6f5-449f3cd6ba2b';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'ebc8ebf4-9bf7-4a57-a64c-a04abd019a90';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'decfa858-a703-4bac-a791-00f675876c32';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '588c3799-d3e8-4cb6-b957-6a02bd37bb8b';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '1b7ff091-44dd-4a30-8e81-2a6060c128f7';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '1ef3cae8-b557-4dd3-900c-868d87e247ee';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f0c04c27-cc52-41d1-a4ca-29756e13496d';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '493b196b-7528-4d19-97fe-6945090085e8';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'aee11d25-a877-4547-88cd-6159e26bd290';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '773ecebc-2f27-4cad-b267-be284ad5a1e3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'fa56a33e-d550-400f-b874-f4d8c8177803';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'aa96ec7e-322b-442f-8136-059ffb04056c';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3a40ee68-afbc-40ea-823a-aa7df978fa98';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'fb84bc52-b4fa-40df-a74d-e4ad11f9bae5';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '60a0df60-4462-4529-8f28-e30076693cf7';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f98ee2c1-693a-44dd-80ac-4c69846a47a6';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '1085f287-90e5-4e26-8632-59a7a4c210b3';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'c2ace881-4604-405a-b1b8-b6f7312708b9';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f8b4816b-b93e-4ed5-bf2b-bb15c9f2af1f';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'c15a31e8-f22d-47d9-ad9d-7879893f0a13';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '27daaf19-dba6-498b-877b-b36d4476f3f3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '50158552-65b7-4c26-bb75-75e2d37ac06c';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '97405603-5a2f-4e70-8e8c-8a387da376ae';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '7e6841bb-1de3-4941-8f7e-5220a6f8b6aa';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '4e30ed39-2e2e-46db-9b6e-ed830e61e101';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '909f98d5-52d4-45aa-8687-c0bc5dbef786';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '4c6c80ab-2a20-46a6-ab98-f1d9fbb25038';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '50d2781e-dbc0-442c-bcb3-67455c0c49ff';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '283b620a-d34a-4e7a-99c5-69e6af8721e3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3577db0e-5c34-4444-b716-c5aadb60ab16';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '00020111-49c4-46c6-804c-64b3f3255e23';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0f3768e6-0828-41d4-a544-2a62ee3a298e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'd737b79e-4a23-41c1-b5b8-59899ac7a120';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '4bd5cd85-a730-4a17-9f82-dd58e267d950';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '4fc73e94-e441-4fc8-8cb6-117f403ac797';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'fff27b00-f3f4-4a33-98b7-676f2ff6d838';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '2e24860b-4e9b-43e6-b025-110fc986b399';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '998f0607-b78c-44be-b411-bb4bfe170b56';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '12d65378-8d5e-4dc6-aa47-41400999666e';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '5450766d-59ba-48e2-b1dc-9c2a6547116a';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '7dd22316-5194-4a01-93d8-68761eee766b';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'fb2ecff0-be2e-465e-ba82-f8c46774f707';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '6717d8c0-0448-4a9f-b991-42e63aaba801';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '42e79410-955b-41e9-8195-fe12d5336bba';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '5bb00e70-0292-46cb-9e96-7acc8932b844';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'e7ed68df-f9bc-4645-92d3-228a20e90c65';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '04749345-927d-4ece-9b0d-5d98d9a98921';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0f923164-aebb-4c12-8670-2cf2e775855b';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '60ab292b-f5b5-4eec-8d17-d3c390eb7f03';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'f0cb87f8-05c3-4938-864f-7f405becdd25';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '41872d6b-e51d-4927-8fcf-80b2725fc3b4';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'd511861a-620f-414e-8ceb-bee5d49a3269';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '73c36f5d-84cb-45d6-861e-006dec925814';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"eletiva"}'::jsonb WHERE id = '87e476bb-2c89-4888-8761-aaceeb38a21f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f90f3b85-d57e-4b51-8c20-007e6bcc783f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '080a7a5d-cb6d-49db-925e-0fc6aeb51a8d';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0779765e-85cc-43c7-911b-e9047d460cae';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '387aec65-da02-40e2-a5b1-1a61542f054e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3f1b8838-85a5-4117-a0c8-2ef35bc4051a';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'a1b94a10-4212-492b-8df6-13bc1586644e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '034767cb-0204-489f-adae-2213e5659dcc';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '76adec1d-1a96-4a07-b779-45caf4765fb1';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '2b989009-b002-490a-b2bd-136baf8e12db';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '9274d692-aa5f-4eff-b3dc-3052d13db7c4';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0fe287c2-b28a-4a43-bfae-453e3e80a340';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'bba5e513-bede-4822-a826-f742c243a16b';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '61e19475-01dc-4f7e-a1e6-2d45a3ee2f1f';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '1c17d876-d435-4a82-8660-7ceffe11f462';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '95a8139c-4c93-42a6-8ae7-35ca0a175213';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '356f90f5-0cb5-433f-8429-fb56ea1b5da1';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '13f2ac8d-f1d7-4a6d-a91e-b3cf62587e9b';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '31473107-ead3-4866-ae68-140c1769a6ce';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '3a2dcdb6-0a17-4ad5-a30f-5bd2a3db8317';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'd8f1e669-25c2-4b4d-94cd-0971e25b00b5';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '1e0fed4e-a277-46bc-b2ab-84c2d62158b1';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'de5646f3-713c-4889-8931-f7e14343b2be';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '1d915b72-f42b-4372-abad-e3517c1af19e';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '756db88d-4ec9-42ab-b702-2b710b32665a';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '74517ce2-db83-44ae-8ba5-a14a6434e554';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '2baed303-ea47-4e01-85ca-3e881cb79b5a';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'fb3c573d-8a01-4f55-9276-3e722cb974fd';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '5ee8114d-d73a-49d3-a8fd-5e5d7d59ece7';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '162f5ae5-f5cb-4f66-b2e6-1432df653a74';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'a0f42efc-3f9b-4874-a17a-49eff0b3a20e';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'be991f0b-56aa-437a-ae60-3d783c019677';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'f4e437e4-1dcf-43ba-b767-ca3862de9a2e';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '2ea422ff-1633-44ca-b156-95a5480f3077';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '2ba9a206-90d3-42b7-a4d4-c39c696730b7';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = 'da9465e9-5112-4c18-b272-3683a8b67caf';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '980e8bd9-8f46-43a8-8959-3f5d055c9493';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '3f5724a1-3125-4a04-af02-ad72ed350fbd';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '68ddf705-67da-4a45-a83e-401bf9069f6d';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'd4d81f4f-a200-4224-ad38-6a55d2bc4838';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '1ff162da-d5b9-4f41-9610-07289e556efe';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"eletiva","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '19d91e93-55c2-4994-ac90-c08fd64fedc5';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '4f39d98b-6cea-4951-a063-9b00f88de3d7';
UPDATE learning_trails SET category_map = '{"bacharelado":"obrigatoria","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '9ad57420-5fdc-4f58-8fb0-b1a9f5139f98';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '33831989-cecb-4cdd-beb5-a981e8c11792';
UPDATE learning_trails SET category_map = '{"bacharelado":"eletiva","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '8900236e-ed5e-4e13-824d-565aa5c42be8';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '471b77f1-37f6-40ff-9333-770963911eab';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '7f077512-1dd3-4a4f-bb64-aab9d0fd9b87';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '0887a6ec-f891-4371-9472-cb60096ccf51';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '19b37c9a-9386-46c5-9626-8bc1f518a584';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '5c4f11f9-54af-46f1-b11b-c0062f41ec11';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'e74e0595-5f3c-4d48-92c9-c954bc1f2f51';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'aa034a80-bd28-442f-a8eb-cae03a7145dc';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '3e81abf5-80d2-441e-b252-5031da1bf8c1';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"obrigatoria","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '5dc1c1a8-2218-48b3-b31d-b130fb520552';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'c2c81e62-41c8-410f-b046-5597f2bb54e3';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'ed3ad21b-6e98-41da-bbf6-8b6d313c2723';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '6ba888b3-2d53-4c9b-81c1-7d4b5cbefb7c';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'df17518a-caef-49b4-ab71-4d3e3540c836';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '260e4277-2506-49dc-b47b-0a1380766ea0';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'cf7be32d-6668-437a-98fa-614144d6e05b';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'de918dc9-be0c-41f0-824e-5ba417b804ca';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'a23541de-8390-4df7-82d0-1277217901be';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'e854aa86-ae80-40c5-a978-283ee01a482e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'abc9301a-9af8-406a-b6d1-e073cb834811';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '8c4e227d-27af-49e9-a02f-25a8fac708eb';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '26a48fcd-e170-4536-8e23-1656df0b01e8';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '04931e91-fedd-46f7-83cc-5598d7e68890';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '96614102-86ad-4bae-9974-748761728bc6';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = '1e7309f8-e6f6-4ad9-bf80-215952833a6f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"eletiva","fisica_medica":"nao_se_aplica"}'::jsonb WHERE id = 'c1a8942a-07f2-405c-af14-359dbf87af2e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'be6c2225-f132-49d5-b84e-92ae34d20889';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'ba6bd1d1-0397-4df9-9e35-f68c68bca404';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '7874848b-8254-4a1c-b484-819c251894a4';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '64098e6d-7a05-4817-8946-bf66f44785b7';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'baf156ff-7d4f-4049-a9d4-d6ef4f19cd5b';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'ea0d974a-e5fe-406b-b8af-922c39f18ca2';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'f003183e-4a23-46ad-babc-d44845f5a113';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '7812d2e4-e438-4bf4-806d-a2dc045a4cb5';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '73f9cb40-5b56-4744-b711-795c9f892681';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '686cb272-5fb7-428d-9709-1fe8aac09b3f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '3bffeb26-e09a-4acb-bcb3-0f0eda074fc5';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '8855da45-d34e-4833-9141-069a2b77979e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '5160cb26-0e9f-42b9-adbb-c363903f46cb';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '99fa5b90-9dc2-4646-87e0-3322c279b30f';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '466f1ca5-fd52-44ca-9c18-d0e8fe584b4e';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = 'adf6e898-62e5-423b-8c8d-8950f56fe620';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"obrigatoria"}'::jsonb WHERE id = '2a564a90-0416-4689-8258-e88b5598fc34';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '3c294b76-68ed-4c91-a60f-cb36cdec8256';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '1e9cd3e8-8e27-4333-9cc3-35d60540538d';
UPDATE learning_trails SET category_map = '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"eletiva"}'::jsonb WHERE id = '1ef00f42-8b6a-47f8-980c-0bc0a6b29058';

-- --- FILE: 20260306_emaranhamento_curricular_v3_2.sql ---

-- =============================================
-- EMARANHAMENTO CURRICULAR V3.2 â€” SCHEMA DDL
-- Data: 2026-03-06
-- =============================================

-- 1. Adicionar campo equivalence_group na tabela learning_trails
ALTER TABLE public.learning_trails 
ADD COLUMN IF NOT EXISTS equivalence_group TEXT DEFAULT NULL;

-- 2. Ãndice para buscas rÃ¡pidas por grupo de equivalÃªncia
CREATE INDEX IF NOT EXISTS idx_learning_trails_eq_group 
ON public.learning_trails(equivalence_group) WHERE equivalence_group IS NOT NULL;

-- 3. Tabela de ExclusÃµes MÃºtuas (LÃ³gica XOR)
CREATE TABLE IF NOT EXISTS public.equivalence_exclusions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_a TEXT NOT NULL,
    group_b TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.equivalence_exclusions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read equivalence_exclusions" ON public.equivalence_exclusions;
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
-- MAPEAMENTO DE GRUPOS DE EQUIVALÃŠNCIA
-- =============================================

-- BLOCO A: Ciclo BÃ¡sico
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

-- BLOCO B: AvanÃ§adas
UPDATE public.learning_trails SET equivalence_group = 'GRP_MQ_INTRO' WHERE course_code IN ('4302311', '4300371', '4302311_MED');
UPDATE public.learning_trails SET equivalence_group = 'GRP_MEC_CLASS' WHERE course_code IN ('4302305', '4300458', '4302305_MED');
UPDATE public.learning_trails SET equivalence_group = 'GRP_TERMO' WHERE course_code IN ('4302308', '4300259');
UPDATE public.learning_trails SET equivalence_group = 'GRP_ELETROMAG' WHERE course_code IN ('4302303', '4300372');
UPDATE public.learning_trails SET equivalence_group = 'GRP_ESTADO_SOLIDO' WHERE course_code IN ('4300402', '4300379');

-- ExclusÃµes MÃºtuas
INSERT INTO public.equivalence_exclusions (group_a, group_b, reason)
VALUES
('GRP_ESTADO_SOLIDO', 'GRP_ESTADO_SOLIDO', 'Disciplinas 4300402 (Bach) e 4300379 (Lic) sÃ£o equivalentes. CrÃ©ditos contados apenas uma vez.'),
('GRP_NUCLEAR_PART', 'GRP_NUCLEAR_PART', 'Disciplina 4300378 aparece nas duas grades. CrÃ©ditos contados apenas uma vez.')
ON CONFLICT DO NOTHING;

-- --- FILE: 20260306_gen4_pcc_xor_enforcement.sql ---

-- =============================================
-- GERAÃ‡ÃƒO IV: PCC VALIDATION + XOR ENFORCEMENT
-- Aplicado via MCP em 2026-03-06
-- =============================================

-- 1. Campo PCC
ALTER TABLE public.learning_trails 
ADD COLUMN IF NOT EXISTS requires_pcc_validation BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.learning_trails.requires_pcc_validation IS 
'Indica que a equivalÃªncia Bachâ†’Lic exige validaÃ§Ã£o de PrÃ¡ticas como Componente Curricular (PCC).';

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

-- --- FILE: 20260306_gen4_titles_equivalences.sql ---

-- =============================================
-- GERAÃ‡ÃƒO IV: CORREÃ‡ÃƒO DE TÃTULOS INCORRETOS  
-- Aplicado via MCP em 2026-03-06
-- =============================================

UPDATE public.learning_trails SET title = 'IntroduÃ§Ã£o Ã  TermodinÃ¢mica' WHERE course_code = '4300208' AND axis = 'bach';
UPDATE public.learning_trails SET title = 'IntroduÃ§Ã£o Ã  FÃ­sica Computacional' WHERE course_code = '4300218' AND axis = 'bach';
UPDATE public.learning_trails SET title = 'Geometria AnalÃ­tica' WHERE course_code = 'MAT0105';
UPDATE public.learning_trails SET title = 'CÃ¡lculo para FunÃ§Ãµes de Uma VariÃ¡vel Real I' WHERE course_code = 'MAT1351';
UPDATE public.learning_trails SET title = 'CÃ¡lculo para FunÃ§Ãµes de Uma VariÃ¡vel Real II' WHERE course_code = 'MAT1352';
UPDATE public.learning_trails SET title = 'CÃ¡lculo para FunÃ§Ãµes de VÃ¡rias VariÃ¡veis I' WHERE course_code = 'MAT2351';
UPDATE public.learning_trails SET title = 'CÃ¡lculo para FunÃ§Ãµes de VÃ¡rias VariÃ¡veis II' WHERE course_code = 'MAT2352';
UPDATE public.learning_trails SET title = 'Equipamentos MÃ©dico-Hospitalares I' WHERE course_code = 'MDR0636';
UPDATE public.learning_trails SET title = 'Projetos â€“ ATPA', category = 'obrigatoria', excitation_level = 7 WHERE course_code = '4300415' AND axis = 'lic';

-- =============================================
-- EQUIVALÃŠNCIAS N-PARA-1
-- =============================================

UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS1' WHERE course_code IN ('4302111', '4300151', '4300153');
UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS2' WHERE course_code IN ('4302112', '4300159', '4300357');
UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS3' WHERE course_code IN ('4302211', '4300270', '4300271');
UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS4' WHERE course_code IN ('4302212', '4300160', '4300372', '4300374');
UPDATE public.learning_trails SET equivalence_group = 'EQ_QUANT' WHERE course_code IN ('4302311', '4300371');
UPDATE public.learning_trails SET equivalence_group = 'EQ_EXP1' WHERE course_code IN ('4302113', '4300152', '4300254');
UPDATE public.learning_trails SET equivalence_group = 'EQ_EXP3' WHERE course_code IN ('4302213', '4300373');
UPDATE public.learning_trails SET equivalence_group = 'EQ_EXP5' WHERE course_code IN ('4302313', '4300377');

-- EXCLUSÃ•ES MÃšTUAS XOR
INSERT INTO public.equivalence_exclusions (group_a, group_b, reason)
SELECT 'AGA0416', '4300430', 'SobreposiÃ§Ã£o: Cosmologia (IAG vs IF)'
WHERE NOT EXISTS (SELECT 1 FROM public.equivalence_exclusions WHERE group_a = 'AGA0416' AND group_b = '4300430');

INSERT INTO public.equivalence_exclusions (group_a, group_b, reason)
SELECT 'AGA0319', '4300374', 'SobreposiÃ§Ã£o: Relatividade Geral (IAG vs Lic)'
WHERE NOT EXISTS (SELECT 1 FROM public.equivalence_exclusions WHERE group_a = 'AGA0319' AND group_b = '4300374');

-- =============================================
-- CORREÃ‡ÃƒO DE PRÃ‰-REQUISITOS
-- =============================================

-- Bacharelado
UPDATE public.learning_trails SET prerequisites = '{4302111}', excitation_level = 2 WHERE course_code = '4300208' AND axis = 'bach';
UPDATE public.learning_trails SET prerequisites = '{4302111}', excitation_level = 2 WHERE course_code = '4300218' AND axis = 'bach';
UPDATE public.learning_trails SET prerequisites = '{4302112, 4300208, MAT2454}' WHERE course_code = '4302401';
UPDATE public.learning_trails SET prerequisites = '{4300218, MAT2453}' WHERE course_code = 'MAP0214' AND axis = 'comum';

-- Licenciatura
UPDATE public.learning_trails SET prerequisites = '{4300156, 4300157}' WHERE course_code = '4300356';
UPDATE public.learning_trails SET prerequisites = '{4300271, MAT2351, 4300160, MAT0105}' WHERE course_code = '4300372';
UPDATE public.learning_trails SET prerequisites = '{4300357, MAT2352}' WHERE course_code = '4300458';
UPDATE public.learning_trails SET prerequisites = '{MAT1351}' WHERE course_code = '4300270';
UPDATE public.learning_trails SET prerequisites = '{4300153, 4300156}' WHERE course_code = '4300374';
UPDATE public.learning_trails SET prerequisites = '{4300390}' WHERE course_code = 'EDM0425';
UPDATE public.learning_trails SET prerequisites = '{4300377}' WHERE course_code = '4300371';
UPDATE public.learning_trails SET prerequisites = '{MAT1351, 4300153}' WHERE course_code = '4300255';
UPDATE public.learning_trails SET prerequisites = '{4300159, MAT1352}' WHERE course_code = '4300259';

-- FÃ­sica MÃ©dica
UPDATE public.learning_trails SET prerequisites = '{MDR0633}' WHERE course_code = 'MDR0636';
UPDATE public.learning_trails SET prerequisites = '{4300437, MDR0636}' WHERE course_code = 'MDR0642';
UPDATE public.learning_trails SET prerequisites = '{4302303, MDR0636, MDR0639}' WHERE course_code = 'MDR0643';
UPDATE public.learning_trails SET prerequisites = '{MDR0635, MDR0637}' WHERE course_code = 'MDR0645';
UPDATE public.learning_trails SET prerequisites = '{MAT0216, MDR0634}' WHERE course_code = 'MDR0646';
UPDATE public.learning_trails SET prerequisites = '{MDR0644}' WHERE course_code = 'MDR0647';

-- --- FILE: 20260306_upgrade_user_progress.sql ---

-- Create enum for trail progress status
DO $$ BEGIN
    CREATE TYPE trail_status AS ENUM ('cursando', 'concluida');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to user_trail_progress
ALTER TABLE public.user_trail_progress 
ADD COLUMN IF NOT EXISTS status trail_status;

-- Update RLS for user_trail_progress if not already set robustly
-- (Assuming standard profile-based RLS is active)

-- Optimization index for the horizontal feed
CREATE INDEX IF NOT EXISTS idx_user_trail_progress_status ON public.user_trail_progress (user_id, status);

-- RPC for toggling progress (To avoid complex client-side logic)
CREATE OR REPLACE FUNCTION toggle_trail_status(p_trail_id UUID, p_status trail_status)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    INSERT INTO public.user_trail_progress (user_id, trail_id, status, updated_at)
    VALUES (v_user_id, p_trail_id, p_status, now())
    ON CONFLICT (user_id, trail_id) 
    DO UPDATE SET 
        status = CASE 
            WHEN user_trail_progress.status = p_status THEN NULL 
            ELSE p_status 
        END,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- FILE: 20260306_completed_trails.sql ---

-- Protocolo SÃ­ncrotron v3: Persistent Tracker
-- Tabela para armazenar quais trilhas (disciplinas) o usuÃ¡rio jÃ¡ concluiu de fato.

CREATE TABLE IF NOT EXISTS public.user_completed_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    trail_id UUID NOT NULL REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, trail_id)
);

-- Ativar RLS
ALTER TABLE public.user_completed_trails ENABLE ROW LEVEL SECURITY;

-- PolÃ­ticas de SeguranÃ§a
DROP POLICY IF EXISTS "Users can manage their own completed trails" ON public.user_completed_trails;
CREATE POLICY "Users can manage their own completed trails"
ON public.user_completed_trails
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- FunÃ§Ã£o RPC para Toggle AtÃ´mico
-- Retorna TRUE se agora estÃ¡ concluÃ­da, FALSE se foi removida.
CREATE OR REPLACE FUNCTION public.toggle_trail_completion(field_trail_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_exists BOOLEAN;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'NÃ£o autenticado';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.user_completed_trails 
        WHERE user_id = v_user_id AND trail_id = field_trail_id
    ) INTO v_exists;

    IF v_exists THEN
        DELETE FROM public.user_completed_trails 
        WHERE user_id = v_user_id AND trail_id = field_trail_id;
        RETURN FALSE;
    ELSE
        INSERT INTO public.user_completed_trails (user_id, trail_id)
        VALUES (v_user_id, field_trail_id);
        RETURN TRUE;
    END IF;
END;
$$;

-- --- FILE: 20260306_add_quiz_to_submissions.sql ---

-- Migration: Add quiz column to submissions and track responses
-- Created: 2026-03-06

-- 1. Add quiz column
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS quiz JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.submissions.quiz IS 'Mini quiz for the post. Array of objects {id, question, options[], correct_option}';

-- 2. Create tracking table for responses
CREATE TABLE IF NOT EXISTS public.submission_quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

-- 3. Enable RLS
ALTER TABLE public.submission_quiz_responses ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Users can view own quiz responses" ON public.submission_quiz_responses;
DROP POLICY IF EXISTS "Users can view own quiz responses" ON public.submission_quiz_responses;
CREATE POLICY "Users can view own quiz responses" ON public.submission_quiz_responses
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz responses" ON public.submission_quiz_responses;
DROP POLICY IF EXISTS "Users can insert own quiz responses" ON public.submission_quiz_responses;
CREATE POLICY "Users can insert own quiz responses" ON public.submission_quiz_responses
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_submission ON public.submission_quiz_responses(submission_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_user ON public.submission_quiz_responses(user_id);

-- --- FILE: 20260307000000_update_schema.sql ---

-- Migration: Add category_map column
ALTER TABLE learning_trails ADD COLUMN IF NOT EXISTS category_map JSONB DEFAULT '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb;

-- --- FILE: 20260307_governance_v1.sql ---

-- Migration: GovernanÃ§a e PapÃ©is v1
-- Adiciona flags de Membro Lab-Div e Visibilidade, e ajusta restriÃ§Ãµes de Role.

-- 1. Adicionar novas colunas se nÃ£o existirem
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_labdiv BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 2. Migrar papel 'labdiv' legado para a nova flag
-- Todos que eram 'labdiv' agora sÃ£o 'user' com a flag is_labdiv = true
UPDATE public.profiles 
SET is_labdiv = true, role = 'user' 
WHERE role = 'labdiv';

-- 3. Garantir que todos tenham um papel vÃ¡lido (fallback para 'user')
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('user', 'moderator', 'admin');

-- 4. Atualizar restriÃ§Ã£o de CHECK para os papÃ©is permitidos
-- Nota: Se o constraint tiver outro nome, o drop pode falhar, mas o add garantirÃ¡ a nova regra.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'moderator', 'admin'));

-- 5. ComentÃ¡rios para documentaÃ§Ã£o
COMMENT ON COLUMN public.profiles.is_labdiv IS 'Indica se o usuÃ¡rio Ã© um membro oficial do Lab-Div (recurso de governanÃ§a).';
COMMENT ON COLUMN public.profiles.is_visible IS 'Controla se o perfil Ã© visÃ­vel publicamente na plataforma (ajustÃ¡vel por Admins).';

-- (Role update already handled)

-- Migration: Fix Role Constraints and Sync
-- Ensures 'moderator' and 'moderador' are both accepted or standardized.
-- We will standardize on 'moderator' (English) as per types/index.ts.

-- 1. Update any existing 'moderador' to 'moderator'
UPDATE public.profiles SET role = 'moderator' WHERE role = 'moderador';

-- 2. Update check constraint to be more robust
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'moderator', 'admin'));

-- --- FILE: 20260308_fix_feedback_rls.sql ---

-- Migration: Fix Feedback Reports RLS
-- Allows anyone to insert feedback and makes title optional for quick reporting.

-- 1. Ensure 'title' isn't required (current UI only uses description)
ALTER TABLE public.feedback_reports ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.feedback_reports ALTER COLUMN title DROP NOT NULL;

-- 2. Relax RLS to allow anonymous inserts
DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback_reports;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback_reports;
CREATE POLICY "Anyone can insert feedback" ON public.feedback_reports 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 3. Ensure admins can manage everything
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback_reports;
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback_reports;
CREATE POLICY "Admins can manage all feedback" ON public.feedback_reports 
FOR ALL 
TO authenticated 
USING (is_admin());

-- --- FILE: 20260306_create_nuclear_reset_v4.sql ---

-- Migration: 20260306_create_nuclear_reset_v4.sql
-- Description: Cria a funÃ§Ã£o RPC nuclear_reset_v4 para limpar todas as tabelas e perfis de usuÃ¡rios, apagando todo o conteÃºdo do site.

CREATE OR REPLACE FUNCTION public.nuclear_reset_v4()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Trunca as tabelas principais. O CASCADE garante que tabelas com chaves estrangeiras que dependem destas tambÃ©m sejam limpas (ex: comentÃ¡rios, curtidas, etc).
  -- A tabela auth.users nÃ£o pode ser truncada diretamente por aqui facilmente devido a FKs e limitaÃ§Ãµes do Supabase Auth.
  -- Perfis e conteÃºdo pÃºblico:
  
  TRUNCATE TABLE public.profiles CASCADE;
  TRUNCATE TABLE public.submissions CASCADE;
  TRUNCATE TABLE public.perguntas CASCADE;
  TRUNCATE TABLE public.messages CASCADE;
  TRUNCATE TABLE public.entanglement_messages CASCADE;
  TRUNCATE TABLE public.learning_trails CASCADE;
  TRUNCATE TABLE public.collections CASCADE;
  TRUNCATE TABLE public.reports CASCADE;
  TRUNCATE TABLE public.feedback_reports CASCADE;
  TRUNCATE TABLE public.notifications CASCADE;
  TRUNCATE TABLE public.quiz_attempts CASCADE;
  TRUNCATE TABLE public.reading_history CASCADE;
  TRUNCATE TABLE public.analytics_plays CASCADE;

  -- Remove usuÃ¡rios do auth.users (isso cascateia para auth.identities, auth.sessions, etc)
  -- NOTA: O auth.users requer privilÃ©gios de superuser que a role postgres do Supabase geralmente tem no dashboard/migrations,
  -- mas pode falhar dependendo da role que chama o RPC se nÃ£o for a correta, por isso usamos SECURITY DEFINER (roda como o criador, usualmente o superuser da migration).
  DELETE FROM auth.users;

END;
$$;

-- --- EXTRA: profile_customization ---
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS use_nickname BOOLEAN DEFAULT false;
COMMENT ON COLUMN public.profiles.use_nickname IS 'Se verdadeiro, o sistema exibirÃ¡ o username/apelido em vez do full_name em todo o Hub.';

