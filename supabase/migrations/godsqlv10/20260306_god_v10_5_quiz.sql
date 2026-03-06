-- --- START OF god_v10_5_quiz.sql (QUIZ SYSTEM) ---
-- ==========================================================
-- THE GOD SQL v10.5.0 — MODULE: QUIZ ENGINE (IFUSP)
-- ==========================================================
-- Contém a infraestrutura e o seeding completo de 60 questões.
-- Depende do god_v10.sql (especialmente da função add_radiation_xp).
-- ==========================================================

-- 1. TABELAS DO SISTEMA DE QUIZ
-- Force update of schema
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

-- 2. RLS & POLÍTICAS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Questões são públicas para leitura
DROP POLICY IF EXISTS "Anyone can read quiz questions" ON public.quiz_questions;
CREATE POLICY "Anyone can read quiz questions" ON public.quiz_questions
    FOR SELECT TO public USING (true);

-- Apenas admins podem gerenciar questões
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions
    FOR ALL TO authenticated USING (is_admin());

-- Usuários podem ver suas próprias tentativas
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Usuários podem inserir suas tentativas
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. SEEDING - 60 QUESTÕES (PHASE 2 DEFINITIVE)
TRUNCATE public.quiz_questions;

INSERT INTO public.quiz_questions (question, options, correct_option, explanation, points, category) VALUES

-- --- CATEGORIA: guia-de-boas-praticas (10) ---
('Qual é a recomendação de resolução mínima para imagens e vídeos no Hub?', 
 ARRAY['720p', '1080p', '480p', '4K apenas'], 1, 
 'Conforme o Guia de Boas Práticas, 1080p é o padrão para garantir alta fidelidade na comunicação científica.', 10, 'guia-de-boas-praticas'),

('Qual é o licenciamento padrão para o conteúdo postado no Hub?', 
 ARRAY['Copyright Reservado', 'Creative Commons CC-BY-SA', 'Domínio Público', 'Uso restrito ao IFUSP'], 1, 
 'O Hub utiliza CC-BY-SA para garantir que o conhecimento circule mantendo os créditos aos autores.', 15, 'guia-de-boas-praticas'),

('Qual é o limite rígido de upload direto por arquivo no Hub?', 
 ARRAY['5MB', '10MB', '50MB', '100MB'], 1, 
 'O limite técnico para upload de mídias direto na plataforma é de 10MB.', 10, 'guia-de-boas-praticas'),

('Como devem ser enviados os vídeos para o Hub?', 
 ARRAY['Upload direto mp4', 'Somente via link do YouTube', 'Link do Google Drive', 'Arquivo ZIP'], 1, 
 'Para garantir performance e streaming adequado, usamos exclusivamente integração com YouTube.', 10, 'guia-de-boas-praticas'),

('Sobre o nome de exibição (apelido) no Hub, qual é a regra?', 
 ARRAY['Deve ser o nome completo do RG', 'Pode ser nome real ou apelido acadêmico respeitoso', 'Somente números USP', 'Qualquer palavra é permitida'], 1, 
 'Permitimos apelidos acadêmicos desde que mantenham o respeito e integridade da comunidade.', 10, 'guia-de-boas-praticas'),

('Quem deve usar a categoria "Mentorados Lab-Div" ao postar?', 
 ARRAY['Qualquer aluno da USP', 'Quem recebeu suporte direto das mentorias do LabDiv', 'Apenas alunos de pós-graduação', 'Funcionários do matão'], 1, 
 'Esta categoria destaca trabalhos que passaram pelo processo de mentoria de comunicação do laboratório.', 10, 'guia-de-boas-praticas'),

('Marcar a equipe e colaboradores de um projeto é:', 
 ARRAY['Opcional', 'Obrigatório conforme o Guia de Créditos', 'Apenas para vídeos', 'Apenas para projetos pagos'], 1, 
 'A co-autoria e os créditos são fundamentais para a transparência e reconhecimento no Hub.', 10, 'guia-de-boas-praticas'),

('O que caracteriza a categoria "Síncrotron" na Wiki?', 
 ARRAY['Notícias diárias', 'Hub de tutoriais e guias técnicos', 'Venda de equipamentos', 'Galeria de fotos antigas'], 1, 
 'O Síncrotron concentra o conhecimento prático e técnico para a comunidade.', 10, 'guia-de-boas-praticas'),

('Arquivos de notas de estudo nativos (ex: Samsung Notes) são:', 
 ARRAY['Proibidos', 'Aceitos como formatos de contribuição', 'Apenas para admins', 'Convertidos automaticamente para PDF'], 1, 
 'O Hub incentiva o compartilhamento de notas de estudo em seus formatos originais.', 10, 'guia-de-boas-praticas'),

('Qual o objetivo principal do Guia de Boas Práticas?', 
 ARRAY['Punir usuários', 'Padronizar a qualidade e ética da comunicação no Hub', 'Limpar o banco de dados', 'Substituir os professores'], 1, 
 'O guia serve para elevar o nível da divulgação científica feita pela nossa comunidade.', 10, 'guia-de-boas-praticas'),

-- --- CATEGORIA: calouro (10) ---
('Qual ônibus circular faz a ligação direta entre a Cidade Universitária e a estação da CPTM?', 
 ARRAY['8012', '8032', '8022', 'Circular Pró-USP'], 1, 
 'A linha 8032 é essencial para quem depende do trem para chegar ao campus.', 10, 'calouro'),

('Onde os alunos devem realizar o exame médico para usar o CEPEUSP?', 
 ARRAY['Em qualquer farmácia', 'No serviço médico oficial do CEPE ou HU', 'Não é necessário exame', 'No centro de vivência'], 1, 
 'O exame médico oficial é obrigatório para garantir a segurança nas atividades esportivas.', 10, 'calouro'),

('A sigla SAS, responsável pelos bandejões e auxílios, significa:', 
 ARRAY['Sistema de Alunos Social', 'Superintendência de Assistência Social', 'Secretaria Anti-Stress', 'Suporte Acadêmico Sênior'], 1, 
 'A SAS gere o bem-estar e a permanência estudantil na USP.', 10, 'calouro'),

('Qual é o nome da rua principal onde se localiza o Instituto de Física?', 
 ARRAY['Avenida da Universidade', 'Rua do Matão', 'Rua da Física', 'Avenida Prof. Lineu Prestes'], 1, 
 'O IFUSP está historicamente localizado na famosa Rua do Matão.', 10, 'calouro'),

('Para acessar notas, frequências e realizar matrículas, o aluno usa o:', 
 ARRAY['Facebook USP', 'Júpiter Web', 'Moodle apenas', 'E-mail institucional'], 1, 
 'O Júpiter Web é o sistema oficial de graduação da USP.', 10, 'calouro'),

('O CRUSP, conjunto residencial estudantil, é dividido em:', 
 ARRAY['Alas Norte e Sul', 'Blocos identificados por letras (A a G, etc)', 'Andares por curso', 'Vilas isoladas'], 1, 
 'A moradia estudantil é organizada por blocos dentro do campus.', 10, 'calouro'),

('A Seção de Alunos do IFUSP é responsável por:', 
 ARRAY['Consertar computadores', 'Burocracia acadêmica, matrículas e certificados', 'Limpeza dos laboratórios', 'Venda de lanches'], 1, 
 'Todo o suporte administrativo ao aluno de graduação passa pela Seção de Alunos.', 10, 'calouro'),

('O laboratório de informática focados no uso dos alunos é conhecido como:', 
 ARRAY['Aquário', 'Pró-Aluno', 'Síncrotron', 'Datacenter'], 1, 
 'O Pró-Aluno oferece computadores e impressão para suporte aos estudos.', 10, 'calouro'),

('Em caso de emergências de segurança no campus 24h, você deve ligar para:', 
 ARRAY['Diretoria do IF', 'Guarda Universitária', 'Prefeitura de SP', 'Seção de Alunos'], 1, 
 'A Guarda Universitária faz a segurança interna e monitoramento do campus.', 10, 'calouro'),

('O e-mail institucional oficial do aluno USP termina em:', 
 ARRAY['@gmail.com', '@usp.br', '@if.usp.br', '@yahoo.com.br'], 1, 
 'O e-mail @usp.br é sua identidade digital oficial na universidade.', 10, 'calouro'),

-- --- CATEGORIA: bolsas (10) ---
('Qual bolsa é voltada para a Iniciação à Docência em escolas públicas?', 
 ARRAY['PUB', 'PIBID', 'FAPESP', 'Monitoria'], 1, 
 'O PIBID coloca alunos de licenciatura em contato direto com a prática escolar.', 15, 'bolsas'),

('O que significa a sigla PUB?', 
 ARRAY['Projeto Unitário de Biblioteca', 'Programa Unificado de Bolsas', 'Portal de Usuários Brasileiros', 'Plano de Unificação de Bolsistas'], 1, 
 'O PUB unifica bolsas de Ensino, Pesquisa e Extensão sob um único edital.', 10, 'bolsas'),

('O programa PAPFE da SAS oferece auxílios focados em:', 
 ARRAY['Viagens internacionais', 'Permanência e Formação Estudantil (Moradia/Alimentação)', 'Compra de livros didáticos', 'Aulas particulares'], 1, 
 'O PAPFE é o principal pilar de apoio socioeconômico da USP.', 10, 'bolsas'),

('Qual órgão estadual é o principal fomentador de bolsas de Iniciação Científica (IC)?', 
 ARRAY['CNPq', 'FAPESP', 'CAPES', 'Santander'], 1, 
 'A FAPESP é fundamental para o financiamento da pesquisa no estado de São Paulo.', 15, 'bolsas'),

('A monitoria de disciplinas no IFUSP geralmente exige:', 
 ARRAY['Ser aluno de primeiro ano', 'Já ter cursado a disciplina com bom desempenho', 'Não ser aluno da USP', 'Pagar uma taxa de inscrição'], 1, 
 'Monitores auxiliam professores e alunos em disciplinas que já dominaram.', 10, 'bolsas'),

('Onde o aluno deve acompanhar a abertura de editais de bolsas unificadas?', 
 ARRAY['Jornal Nacional', 'Portal JupiterWeb / Sistema Jupiter', 'Quadro de avisos da lanchonete', 'Instagram oficial da USP apenas'], 1, 
 'O sistema Jupiter concentra os editais e inscrições para monitorias e bolsas PUB.', 10, 'bolsas'),

('Alunos com bolsa de isenção de alimentação (Bolsa Alimentação) podem usar:', 
 ARRAY['Apenas um restaurante específico', 'Restaurantes Universitários (bandejões) da SAS', 'Qualquer lanchonete do Matão', 'Apenas o refeitório do IF'], 1, 
 'A bolsa garante o acesso gratuito às refeições nos RUs da universidade.', 10, 'bolsas'),

('O auxílio-moradia é destinado prioritariamente a:', 
 ARRAY['Alunos que moram na capital', 'Alunos com dificuldades socioeconômicas comprovadas', 'Qualquer aluno de pós-graduação', 'Alunos com as melhores notas'], 1, 
 'O critério socioeconômico é a base da permanência estudantil.', 10, 'bolsas'),

('O Programa de Monitoria da Graduação visa:', 
 ARRAY['Substituir o professor em sala', 'Auxiliar no processo de ensino-aprendizagem e tirar dúvidas', 'Corrigir todas as provas sozinho', 'Limpar as salas de aula'], 1, 
 'O monitor é um elo entre o docente e os alunos para facilitar o aprendizado.', 10, 'bolsas'),

('Bolsas de Iniciação Tecnológica são voltadas para:', 
 ARRAY['Apenas artes visuais', 'Desenvolvimento de projetos aplicados e inovação', 'Aulas de natação', 'História da ciência apenas'], 1, 
 'Focam na aplicação prática do conhecimento científico em tecnologia.', 10, 'bolsas'),

-- --- CATEGORIA: divulgacao (10) ---
('O Toolkit visual oficial para divulgadores do LabDiv chama-se:', 
 ARRAY['DesignKit', 'KitDiv', 'AssetHub', 'IF-Style'], 1, 
 'O KitDiv contém logos, fontes e assets oficiais da identidade LabDiv.', 10, 'divulgacao'),

('Qual é a cor principal da identidade visual "Modern Sleek" do LabDiv?', 
 ARRAY['Vermelho Ferrari', 'Azul Elétrico (Electric Blue)', 'Verde Musgo', 'Cinza Chumbo'], 1, 
 'O azul elétrico é a marca registrada das produções de alta tecnologia do laboratório.', 10, 'divulgacao'),

('O recurso de "Mapeamento 360" visa oferecer:', 
 ARRAY['Mapas de papel do IF', 'Experiências imersivas em VR de laboratórios', 'Cálculo de rotas de ônibus', 'Gráficos de pizza'], 1, 
 'Usamos tecnologia 360 para levar o público para dentro dos experimentos.', 15, 'divulgacao'),

('O estilo de design inspirado no MIT, usado no LabDiv, prioriza:', 
 ARRAY['Muitas cores e gradientes complexos', 'Minimalismo, clareza e tipografia limpa', 'Desenhos feitos à mão', 'Estilo barroco'], 1, 
 'A clareza visual é essencial para a transmissão eficiente de dados científicos.', 10, 'divulgacao'),

('Para posters científicos de alto impacto, o LabDiv recomenda usar:', 
 ARRAY['Microsoft Paint', 'Modelos e grids profissionais do KitDiv', 'Apenas texto sem imagens', 'Papel manteiga'], 1, 
 'Grids e modelos pré-definidos ajudam a manter a autoridade visual do conteúdo.', 10, 'divulgacao'),

('A "Emissão de Luz" na Wiki refere-se a:', 
 ARRAY['Lâmpadas do prédio', 'Processo de divulgação e comunicação científica', 'Experimentos de ótica apenas', 'Consumo de energia'], 1, 
 'Divulgar é, metaforicamente, emitir luz sobre o conhecimento.', 10, 'divulgacao'),

('Qual software é frequentemente citado para edição de imagens técnicas?', 
 ARRAY['Excel', 'Adobe Photoshop / Lightroom / GIMP', 'Notepad', 'PowerPoint para tudo'], 1, 
 'Softwares de edição profissional garantem a precisão das imagens científicas.', 10, 'divulgacao'),

('O Hub incentiva vídeos imersivos para:', 
 ARRAY['Gastar banda de internet', 'Gerar maior engajamento e compreensão do ambiente de pesquisa', 'Substituir as aulas presenciais', 'Fazer vlogs de rotina'], 1, 
 'A imersão ajuda o público a "viver" a ciência de perto.', 10, 'divulgacao'),

('A tipografia oficial do LabDiv geralmente busca ser:', 
 ARRAY['Manuscrita e artística', 'Sans-serif moderna e de alta legibilidade', 'Com serifas clássicas romanas', 'Gótica medieval'], 1, 
 'Fontes sans-serif modernas são padrão na estética do laboratório.', 10, 'divulgacao'),

('Impacto visual na divulgação científica serve para:', 
 ARRAY['Enganar o leitor', 'Atrair atenção e facilitar a retenção do conhecimento', 'Esconder dados ruins', 'Apenas beleza estética'], 1, 
 'O design é uma ferramenta pedagógica forte na comunicação.', 10, 'divulgacao'),

-- --- CATEGORIA: protecao (10) ---
('O programa institucional do IFUSP para suporte direto e acolhimento chama-se:', 
 ARRAY['IF-Safe', 'Física Acolhe', 'Radar Aluno', 'Suporte Matão'], 1, 
 'O Física Acolhe é o principal canal de bem-estar estudantil do instituto.', 10, 'protecao'),

('O Programa ECOS foca primordialmente em:', 
 ARRAY['Aulas de reforço de cálculo', 'Escuta, acolhimento e mediação de conflitos', 'Distribuição de lanches', 'Esportes de aventura'], 1, 
 'O ECOS oferece um espaço seguro para diálogo e orientação.', 10, 'protecao'),

('Para suporte a pautas de assédio e gênero na USP, existe o canal:', 
 ARRAY['Disque Denúncia 190', 'USP Mulheres', 'Sindicato apenas', 'Seção acadêmica'], 1, 
 'A USP possui instâncias específicas para lidar com questões de gênero e assédio.', 10, 'protecao'),

('O acolhimento a alunos com neurodiversidade (ex: TEA) é uma pauta de:', 
 ARRAY['Matrícula apenas', 'Protocolos de Proteção e Inclusão', 'Apenas para quem tem nota alta', 'Pós-graduandos apenas'], 1, 
 'A inclusão de neurodivergentes é prioritária para a saúde da comunidade.', 15, 'protecao'),

('Onde o aluno pode encontrar tratamento psiquiátrico de longa duração?', 
 ARRAY['Na lanchonete do IF', 'No Hospital Universitário (HU) ou IP (Instituto de Psicologia)', 'No Pró-Aluno', 'Na biblioteca'], 1, 
 'A USP oferece serviços de saúde mental através de suas unidades especializadas.', 10, 'protecao'),

('Em casos de conflitos interpessoais graves, a recomendação é:', 
 ARRAY['Ignorar o problema', 'Buscar mediação via ECOS ou Física Acolhe', 'Postar anonimamente na internet', 'Abandonar o curso'], 1, 
 'Canais oficiais garantem sigilo e orientação adequada.', 10, 'protecao'),

('O sigilo nas conversas com o Física Acolhe é:', 
 ARRAY['Inexistente', 'Garantido para proteção do aluno', 'Compartilhado com os professores', 'Apenas para alunos de graduação'], 1, 
 'A confidencialidade é o pilar do suporte emocional.', 10, 'protecao'),

('A palavra-chave que define o suporte à saúde mental no IF é:', 
 ARRAY['Burocracia', 'Acolhimento', 'Competição', 'Silêncio'], 1, 
 'Transformar o ambiente em um espaço acolhedor é o objetivo dessas iniciativas.', 10, 'protecao'),

('Canais de acolhimento visam combater, entre outros:', 
 ARRAY['O estudo excessivo', 'A evasão estudantil causada por problemas de saúde mental', 'O uso de computadores', 'A culinária do bandejão'], 1, 
 'Apoiar o aluno emocionalmente ajuda na permanência acadêmica.', 10, 'protecao'),

('Iniciativas de proteção e inclusão no Hub buscam:', 
 ARRAY['Criar uma comunidade mais justa e diversa', 'Aumentar o valor da mensalidade', 'Diminuir o número de alunos', 'Acabar com as provas'], 1, 
 'A diversidade fortalece a produção científica.', 10, 'protecao'),

-- --- CATEGORIA: extensao (10) ---
('A série de palestras para o público leigo sobre temas atuais da física chama-se:', 
 ARRAY['Física Show', 'Física para Todos', 'CineFísica', 'Palestras Matão'], 1, 
 'Física para Todos é o evento de extensão mais tradicional do instituto.', 10, 'extensao'),

('O local de vivência clássico dos alunos na Ala Didática é conhecido como:', 
 ARRAY['Gaiola', 'Aquário', 'Terrário', 'Laboratório 0'], 1, 
 'O Aquário é onde os alunos se reúnem para estudar e conviver.', 10, 'extensao'),

('Qual coletivo do IF se dedica a debater ética e sociedade no Síncrotron?', 
 ARRAY['AstroBio', 'HS (Humanidades no Síncrotron)', 'Física-Social', 'Caminhos do IF'], 1, 
 'O HS traz a discussão interdisciplinar para o coração da técnica.', 15, 'extensao'),

('O "Show de Física" do IFUSP é famoso por:', 
 ARRAY['Demonstrações interativas e lúdicas de fenômenos físicos', 'Apenas ler artigos em voz alta', 'Venda de ingressos caros', 'Ser apenas para professores'], 1, 
 'O Show atrai milhares de escolas para ver a física em ação.', 10, 'extensao'),

('O Coletivo Amélia Império foca na pauta de:', 
 ARRAY['Astronomia amadora', 'Mulheres na Física e representatividade', 'Física de Partículas experimental', 'Reforma do prédio'], 1, 
 'Amélia Império simboliza a luta e presença feminina na nossa ciência.', 15, 'extensao'),

('Interações de Fronteira, na Wiki, refere-se a:', 
 ARRAY['Viagens para o exterior', 'Projetos de Extensão e Cultura', 'Fronteiras entre países apenas', 'Muros do campus'], 1, 
 'Extensão é a fronteira entre a universidade e a sociedade.', 10, 'extensao'),

('A Vaca Esférica é uma iniciativa estudantil focada em:', 
 ARRAY['Criação de gado', 'Humor, memes e vivência acadêmica', 'Física teórica pura apenas', 'Desenho técnico'], 1, 
 'A Vaca Esférica é um ícone da cultura interna e descontração dos alunos.', 10, 'extensao'),

('O grupo G-Astro concentra atividades sobre:', 
 ARRAY['Geologia', 'Astronomia e Astrofísica', 'Gastronomia molecular', 'Gestão de carreiras'], 1, 
 'O G-Astro é o ponto de encontro para entusiastas do cosmos.', 10, 'extensao'),

('A PRCEU é a Pró-Reitoria responsável por:', 
 ARRAY['Graduação', 'Cultura e Extensão Universitária', 'Pesquisa apenas', 'Finanças'], 1, 
 'A PRCEU fomenta projetos que levam a USP para além de seus muros.', 10, 'extensao'),

('O Catálogo de Grupos de Extensão do IFUSP serve para:', 
 ARRAY['Escolher onde lanchar', 'Descobrir coletivos e grupos para participar', 'Comprar livros usados', 'Agendar aulas de cálculo'], 1, 
 'O catálogo centraliza as diversas oportunidades de engajamento além da sala de aula.', 10, 'extensao');
