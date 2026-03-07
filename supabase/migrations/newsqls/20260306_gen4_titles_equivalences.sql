-- =============================================
-- GERAÇÃO IV: CORREÇÃO DE TÍTULOS INCORRETOS  
-- Aplicado via MCP em 2026-03-06
-- =============================================

UPDATE public.learning_trails SET title = 'Introdução à Termodinâmica' WHERE course_code = '4300208' AND axis = 'bach';
UPDATE public.learning_trails SET title = 'Introdução à Física Computacional' WHERE course_code = '4300218' AND axis = 'bach';
UPDATE public.learning_trails SET title = 'Geometria Analítica' WHERE course_code = 'MAT0105';
UPDATE public.learning_trails SET title = 'Cálculo para Funções de Uma Variável Real I' WHERE course_code = 'MAT1351';
UPDATE public.learning_trails SET title = 'Cálculo para Funções de Uma Variável Real II' WHERE course_code = 'MAT1352';
UPDATE public.learning_trails SET title = 'Cálculo para Funções de Várias Variáveis I' WHERE course_code = 'MAT2351';
UPDATE public.learning_trails SET title = 'Cálculo para Funções de Várias Variáveis II' WHERE course_code = 'MAT2352';
UPDATE public.learning_trails SET title = 'Equipamentos Médico-Hospitalares I' WHERE course_code = 'MDR0636';
UPDATE public.learning_trails SET title = 'Projetos – ATPA', category = 'obrigatoria', excitation_level = 7 WHERE course_code = '4300415' AND axis = 'lic';

-- =============================================
-- EQUIVALÊNCIAS N-PARA-1
-- =============================================

UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS1' WHERE course_code IN ('4302111', '4300151', '4300153');
UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS2' WHERE course_code IN ('4302112', '4300159', '4300357');
UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS3' WHERE course_code IN ('4302211', '4300270', '4300271');
UPDATE public.learning_trails SET equivalence_group = 'EQ_FIS4' WHERE course_code IN ('4302212', '4300160', '4300372', '4300374');
UPDATE public.learning_trails SET equivalence_group = 'EQ_QUANT' WHERE course_code IN ('4302311', '4300371');
UPDATE public.learning_trails SET equivalence_group = 'EQ_EXP1' WHERE course_code IN ('4302113', '4300152', '4300254');
UPDATE public.learning_trails SET equivalence_group = 'EQ_EXP3' WHERE course_code IN ('4302213', '4300373');
UPDATE public.learning_trails SET equivalence_group = 'EQ_EXP5' WHERE course_code IN ('4302313', '4300377');

-- EXCLUSÕES MÚTUAS XOR
INSERT INTO public.equivalence_exclusions (group_a, group_b, reason)
SELECT 'AGA0416', '4300430', 'Sobreposição: Cosmologia (IAG vs IF)'
WHERE NOT EXISTS (SELECT 1 FROM public.equivalence_exclusions WHERE group_a = 'AGA0416' AND group_b = '4300430');

INSERT INTO public.equivalence_exclusions (group_a, group_b, reason)
SELECT 'AGA0319', '4300374', 'Sobreposição: Relatividade Geral (IAG vs Lic)'
WHERE NOT EXISTS (SELECT 1 FROM public.equivalence_exclusions WHERE group_a = 'AGA0319' AND group_b = '4300374');

-- =============================================
-- CORREÇÃO DE PRÉ-REQUISITOS
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

-- Física Médica
UPDATE public.learning_trails SET prerequisites = '{MDR0633}' WHERE course_code = 'MDR0636';
UPDATE public.learning_trails SET prerequisites = '{4300437, MDR0636}' WHERE course_code = 'MDR0642';
UPDATE public.learning_trails SET prerequisites = '{4302303, MDR0636, MDR0639}' WHERE course_code = 'MDR0643';
UPDATE public.learning_trails SET prerequisites = '{MDR0635, MDR0637}' WHERE course_code = 'MDR0645';
UPDATE public.learning_trails SET prerequisites = '{MAT0216, MDR0634}' WHERE course_code = 'MDR0646';
UPDATE public.learning_trails SET prerequisites = '{MDR0644}' WHERE course_code = 'MDR0647';
