'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNavigationStore } from '@/store/useNavigationStore';
import {
    MainLayoutWrapper
} from '@/components/layout/MainLayoutWrapper';
import {
    Breadcrumbs,
    TechnicalAccordion,
    DataCard,
    ActionButton,
    ContentSection
} from '@/components/wiki/WikiComponents';
import {
    ShieldCheck,
    Zap,
    Atom,
    Coins,
    Telescope,
    Brain,
    HeartHandshake,
    Network,
    Microscope,
    Compass,
    FileText,
    Calendar,
    Users,
    Download,
    ExternalLink,
    AlertCircle,
    Info,
    Landmark
} from 'lucide-react';

// --- TECHNICAL DATA SHARD ---
const pageContent: Record<string, any> = {
    'guia-de-boas-praticas': {
        title: 'Guia de Boas Práticas',
        subtitle: 'Produção, Créditos e Qualidade Hub',
        icon: <ShieldCheck className="w-12 h-12" />,
        color: 'brand-blue',
        sections: [
            {
                title: 'Estrutura em 4 Etapas',
                content: 'Para tornar o envio menos exaustivo e mais organizado, dividimos o formulário em 4 etapas: [1] Categoria, [2] Formato, [3] Detalhes Básicos (obrigatórios) e [4] Detalhes Complementares (opcionais).'
            },
            {
                title: 'Etapa 3: Detalhes Básicos (Obrigatórios)',
                content: 'Aqui você define o título (impactante e específico), o autor principal (seu nome real ou apelido acadêmico), o ano do trabalho e a descrição principal. Se o formato exigir, é nesta etapa que você faz o upload dos arquivos (máx 10MB) ou insere o link do YouTube.'
            },
            {
                title: 'Etapa 4: Detalhes Complementares (Opcionais)',
                content: 'Esta nova etapa permite enriquecer sua contribuição sem pressa. Você pode adicionar WhatsApp para contato, Tags para facilitar a busca, Coautores que participaram do projeto, Links Externos (Drive, GitHub, Notion), Detalhes Técnicos (ISO, Câmera, Software) e um Depoimento pessoal sobre o trabalho.'
            },
            {
                title: 'Por que preencher o opcional?',
                content: 'Campos como "Detalhes Técnicos" ajudam outros alunos a aprenderem seu método. "Tags" aumentam a visibilidade da sua pesquisa no Hub. "Coautores" garantem que todos os envolvidos recebam o devido crédito técnico e acadêmico.'
            },
            {
                title: 'Apelidos e Identidade',
                content: 'No passo 3, você pode optar por usar um Apelido Acadêmico. Ele será seu nome de exibição público. Nomes ofensivos ou que tentem se passar por entidades oficiais não são permitidos. A integridade da comunidade vem em primeiro lugar.'
            },
            {
                title: 'Links Externos e Grandes Arquivos',
                content: 'O limite de upload direto é 10MB. Para datasets pesados, PDFs extensos ou códigos, utilize o campo "Link Externo" na Etapa 4, apontando para Google Drive, GitHub ou similares. Certifique-se de que os links tenham permissão de leitura.'
            },
            {
                title: 'Mini Quiz: Gamificação e Engajamento',
                content: 'Na Etapa 4, você pode criar um Mini Quiz (até 2 perguntas) sobre o seu conteúdo. Leitores que acertarem as respostas ganham XP no Hub. É uma ótima forma de garantir que sua mensagem foi compreendida e de recompensar a comunidade pela atenção.'
            },
            {
                title: 'Creative Commons',
                content: 'Todo conteúdo no Hub é, por padrão, CC-BY-SA. Isso garante que o conhecimento circule livremente, mantendo os créditos devidos aos autores originais. Você confirma essa adesão na Etapa 3.'
            }
        ],
        dates: [],
        actions: [
            { label: 'Por em Prática', icon: <Zap className="w-4 h-4" />, href: '/enviar' },
            { label: 'Ver Exemplos', icon: <Telescope className="w-4 h-4" />, href: '/arquivo-labdiv#catalogo' }
        ]
    },
    'calouro': {
        title: 'Iniciação de Partículas',
        subtitle: 'Manual de Sobrevivência na USP',
        icon: <Zap className="w-12 h-12" />,
        color: 'brand-yellow',
        sections: [
            {
                title: 'Mobilidade (Circulares e BUSP)',
                content: 'As linhas circulares principais são: 8082-10, 8083-10, 8084-10 e 8085-10. Nos fins de semana e madrugadas, operam apenas as linhas 8012-10 e 8022-10. O cartão BUSP é obrigatório para gratuidade; sem ele, a tarifa é cobrada via Bilhete Único.'
            },
            {
                title: 'Guia do Bandejão',
                content: 'Embora o Bandejão da Física seja o mais próximo, ele não é a maior preferência dos uspianos, sendo o Central o mais preferido. Caso não tenha muito tempo ou as filas estejam grandes, o da Prefeitura também é melhor avaliado que o da Física. Para recarregar os créditos, utilize a seção RU Card do aplicativo Cardápio USP via PIX. Caso seja beneficiário do PAPFE, o sistema carrega os créditos automaticamente para você.'
            },
            {
                title: 'Esporte e Lazer (CEPEUSP)',
                content: 'O CEPE oferece piscinas, quadras e academia gratuitas para alunos. Para utilizar, basta fazer o exame médico no local e apresentar a carteirinha USP digital. É o local ideal para desintegrar o estresse das provas.'
            },
            {
                title: 'Burocracia e Infraestrutura',
                content: 'A Seção de Alunos resolve trancamentos e matrículas. O Pró-Aluno é seu hub de computação: use para imprimir trabalhos e acessar softwares técnicos necessários para os laboratórios.'
            },
            {
                title: 'Networking Acadêmico',
                content: 'Dica de Ouro: Professores são pesquisadores. A melhor forma de conseguir uma Iniciação Científica é a proatividade: mande um email formal, apresente seu interesse e pergunte quando pode ir à sala dele para conversar brevemente.'
            },
            {
                title: 'Conheça o Instituto de Física',
                fullWidth: true,
                content: (
                    <div className="p-8 rounded-[40px] border-2 border-[#17739A]/30 bg-gradient-to-br from-[#17739A]/15 via-[#17739A]/5 to-transparent group hover:border-[#17739A]/50 transition-all duration-500 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#17739A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex flex-col md:flex-row md:items-center gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-2xl bg-[#17739A]/20 border border-[#17739A]/30">
                                        <Landmark className="w-6 h-6 text-[#17739A]" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#17739A]">Instituto de Física da USP</span>
                                </div>
                                <h5 className="text-white text-lg font-black uppercase italic mb-3">O seu Instituto por Dentro</h5>
                                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                    Mergulhe na história do IFUSP e entenda como um dos institutos de física mais respeitados do mundo é organizado atualmente. Descubra o legado, os departamentos e a estrutura de governança do nosso instituto.
                                </p>
                                <ActionButton label="Aprender sobre o IFUSP" icon={<Landmark className="w-4 h-4" />} href="/wiki/instituto" variant="primary" />
                            </div>
                        </div>
                    </div>
                )
            }
        ],
        dates: [],
        actions: [
            { label: 'Acessar Júpiter', icon: <ExternalLink className="w-4 h-4" />, href: 'https://jupiterweb.usp.br' },
            { label: 'Mapa da USP', icon: <Download className="w-4 h-4" />, href: 'https://www.puspc.usp.br/wp-content/uploads/sites/159/2016/08/Mapa-do-Campus-abril-de-2019.pdf' },
            { label: 'Mapa do IFUSP', icon: <Download className="w-4 h-4" />, href: 'https://portal.if.usp.br/ifusp/pt-br/media-gallery/lightbox/1518/441827' },
            { label: 'Mapa dos Circulares', icon: <Download className="w-4 h-4" />, href: 'https://www5.usp.br/wp-content/uploads/2011/02/Captura-de-tela-2024-09-19-065302.png' }
        ]
    },
    'ifusp': {
        title: 'Estrutura da Matéria',
        subtitle: 'Evolução Acadêmica e Estágios',
        icon: <Atom className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'Em Desenvolvimento',
                fullWidth: true,
                content: 'Esta aba está em construção. No futuro, teremos aqui um guia completo sobre a progressão dos cursos do IFUSP, incluindo os Projetos Político-Pedagógicos (PPPs), informações essenciais do manual de cada habilitação, quantidade de créditos necessários, grade de matérias, semestres, horas de Atividades de Extensão (AEx) e tudo o que você precisa saber para entender como e quando se formar.'
            }
        ],
        dates: [],
        actions: []
    },
    'bolsas': {
        title: 'Energia de Permanência',
        subtitle: 'Bolsas e Auxílios Completos',
        icon: <Coins className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'PAPFE (Auxílio de Permanência)',
                fullWidth: true,
                content: 'O Programa de Apoio à Permanência e Formação Estudantil (PAPFE) oferece auxílios fundamentais para alimentação, transporte e manutenção para alunos em situação de vulnerabilidade socioeconômica. A inscrição é anual via PRIP.'
            },
            {
                title: 'CRUSP (Moradia Estudantil)',
                fullWidth: true,
                content: 'O Conjunto Residencial da USP (CRUSP) oferece moradia gratuita dentro do campus para alunos selecionados. É o principal hub de convivência e suporte para alunos que residem na Cidade Universitária.'
            },
            {
                title: 'Bolsas de Docência (Licenciatura)',
                fullWidth: true,
                content: (
                    <div className="space-y-8">
                        <p className="text-gray-400 text-sm italic">Iniciativas essenciais para alunos de Licenciatura que buscam experiência prática em sala de aula e apoio financeiro.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col justify-between hover:border-brand-red/20 transition-colors">
                                <div>
                                    <h4 className="text-white font-black uppercase italic mb-2 text-sm text-brand-red">PIBID</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed mb-6">Programa de iniciação à docência focado na introdução do aluno ao cotidiano de escolas públicas desde o início do curso, promovendo a integração entre teoria e prática.</p>
                                </div>
                                <ActionButton label="Edital PIBID" icon={<Download className="w-4 h-4" />} href="https://prg.usp.br/wp-content/uploads/Edital-Bolsas-Pibid-Discentes-complementar-170325.pdf" variant="secondary" />
                            </div>
                            <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col justify-between hover:border-brand-red/20 transition-colors">
                                <div>
                                    <h4 className="text-white font-black uppercase italic mb-2 text-sm text-brand-red">PROIAD</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed mb-6">Incentivo à monitoria e apoio pedagógico, auxiliando na adaptação e no desempenho acadêmico de outros discentes através de orientação especializada.</p>
                                </div>
                                <ActionButton label="Edital PROIAD" icon={<Download className="w-4 h-4" />} href="https://prg.usp.br/wp-content/uploads/Edital-PROIAD-2026.pdf" variant="secondary" />
                            </div>
                            <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col justify-between hover:border-brand-red/20 transition-colors">
                                <div>
                                    <h4 className="text-white font-black uppercase italic mb-2 text-sm text-brand-red">SEDUC</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed mb-6">Atuação direta em escolas da rede estadual, conectando a formação de física com os desafios reais e a estrutura do sistema de ensino de São Paulo.</p>
                                </div>
                                <ActionButton label="Edital SEDUC" icon={<Download className="w-4 h-4" />} href="https://prg.usp.br/wp-content/uploads/Edital-Bolsa-Seduc-2026.pdf" variant="secondary" />
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: 'Bolsas USP (Ensino e Apoio)',
                fullWidth: true,
                content: (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col justify-between hover:border-brand-blue/20 transition-colors">
                                <div>
                                    <h4 className="text-white font-black uppercase italic mb-3 text-sm text-brand-blue">PEEG</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed mb-6">
                                        O **Programa de Estímulo ao Ensino de Graduação** é focado no aprimoramento do ensino através da monitoria acadêmica. Como bolsista PEEG, você atuará diretamente com docentes no suporte a disciplinas, auxiliando na preparação de materiais didáticos e no suporte pedagógico aos alunos.
                                    </p>
                                </div>
                                <ActionButton label="Edital PEEG" icon={<Download className="w-4 h-4" />} href="https://prg.usp.br/wp-content/uploads/Edital_PEEG_1_sem_2026.pdf" variant="secondary" />
                            </div>
                            <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col justify-between hover:border-brand-blue/20 transition-colors">
                                <div>
                                    <h4 className="text-white font-black uppercase italic mb-3 text-sm text-brand-blue">PUB</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed mb-6">
                                        O **Programa Unificado de Bolsas** é a principal iniciativa da USP para integrar formação e permanência. Com projetos abrangendo Ensino, Pesquisa, Extensão e Cultura, permite a participação de atividades transversais com suporte financeiro mensal.
                                    </p>
                                </div>
                                <ActionButton label="Edital PUB" icon={<Download className="w-4 h-4" />} href="https://www.eca.usp.br/sites/default/files/inline-files/Edital-PUB-2025-2026_0_0_0.pdf" variant="secondary" />
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: 'Iniciação Científica (Pesquisa e Inovação)',
                fullWidth: true,
                content: (
                    <div className="space-y-10">
                        <div className="p-8 glass-card border-brand-red/20 rounded-[40px] bg-brand-red/5 group">
                            <div className="flex flex-col md:flex-row md:items-center gap-8">
                                <div className="flex-1">
                                    <h5 className="text-white text-xl font-black uppercase italic mb-3">Como começar na IC?</h5>
                                    <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                        A jornada na pesquisa científica exige proatividade e planejamento. Antes de buscar uma bolsa, é fundamental entender como escolher orientador, definir um tema e navegar pelos sistemas. Confira nosso guia técnico completo.
                                    </p>
                                    <ActionButton label="Acessar Guia de Sistemas de Pesquisa" icon={<Microscope className="w-4 h-4" />} href="/wiki/pesquisa" variant="primary" />
                                </div>
                                <div className="hidden md:flex size-32 rounded-full border border-brand-red/10 items-center justify-center bg-brand-red/10 group-hover:scale-105 transition-transform duration-500">
                                    <Microscope className="w-12 h-12 text-brand-red" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col justify-between hover:border-brand-red/20 transition-colors">
                                <div>
                                    <h4 className="text-white font-black uppercase italic mb-2 text-xs text-brand-red">PIBIC - Pesquisa Acadêmica</h4>
                                    <p className="text-[10px] text-gray-500 leading-relaxed mb-4">Focado em iniciação científica padrão, o PIBIC visa introduzir o aluno na metodologia científica e no pensamento crítico acadêmico.</p>
                                </div>
                                <ActionButton label="Edital PIBIC" icon={<Download className="w-4 h-4" />} href="https://prpi.usp.br/wp-content/uploads/sites/1239/2025/05/Edital-PIBIC-2025_2026.pdf" variant="secondary" />
                            </div>
                            <div className="glass-card p-6 rounded-3xl border-white/5 flex flex-col justify-between hover:border-brand-red/20 transition-colors">
                                <div>
                                    <h4 className="text-white font-black uppercase italic mb-2 text-xs text-brand-red">PIBITI - Inovação</h4>
                                    <p className="text-[10px] text-gray-500 leading-relaxed mb-4">Focado em Desenvolvimento Tecnológico e Inovação, o PIBITI estimula a criação de aplicações práticas e protótipos.</p>
                                </div>
                                <ActionButton label="Edital PIBITI" icon={<Download className="w-4 h-4" />} href="https://prpi.usp.br/wp-content/uploads/sites/1239/2025/05/Edital-PIBITI-2025_2026_PIBITI.pdf" variant="secondary" />
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: 'Bolsas das Unidades (Pro-Aluno)',
                fullWidth: true,
                content: (
                    <div className="p-6 glass-card border-white/5 rounded-[32px] bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
                                <Info className="w-6 h-6 text-brand-blue" />
                            </div>
                            <div>
                                <h5 className="text-white font-black uppercase italic text-sm">Apoios Específicos do Instituto</h5>
                                <p className="text-[11px] text-gray-400 leading-relaxed">
                                    Cada instituto possui também suas próprias bolsas **Pro-Aluno** e apoios geridos diretamente pela **Seção de Alunos**. Consulte o site oficial ou a secretaria da sua unidade para conhecer as vagas internas de monitoria técnica e administrativa.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: 'Outras Oportunidades (Portal PRIP)',
                fullWidth: true,
                content: (
                    <div className="p-8 glass-card border-brand-blue/20 rounded-[40px] bg-brand-blue/5 overflow-hidden relative group">
                        <div className="flex flex-col md:flex-row md:items-center gap-8">
                            <div className="flex-1">
                                <h5 className="text-white text-xl font-black uppercase italic mb-3">Descubra Novas Bolsas e Projetos</h5>
                                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                    Além das bolsas tradicionais, a USP publica regularmente editais de projetos específicos, eventos e novos auxílios que muitas vezes são pouco divulgados. O portal da **PRIP (Pró-Reitoria de Inclusão e Pertencimento)** centraliza todas essas chamadas abertas. Vale a pena conferir mensalmente!
                                </p>
                                <ActionButton label="Ver todos os Editais PRIP" icon={<ExternalLink className="w-4 h-4" />} href="https://prip.usp.br/sobre/legislacao-e-portarias/editais/" variant="primary" />
                            </div>
                        </div>
                    </div>
                )
            }
        ],
        dates: [],
        actions: [
            { label: 'Editais Ativos', icon: <Calendar className="w-4 h-4" />, href: 'https://prip.usp.br/sobre/legislacao-e-portarias/editais/' }
        ]
    },
    'divulgacao': {
        title: 'Emissão de Luz',
        subtitle: 'Mini-curso de Criação LabDiv',
        icon: <Telescope className="w-12 h-12" />,
        color: 'brand-blue',
        sections: [
            {
                title: 'Fotografia Essencial',
                content: 'Aplique a Regra dos Terços: posicione o objeto de interesse nas intersecções da grade para criar equilíbrio. Busque ângulos que revelem a tridimensionalidade dos equipamentos.'
            },
            {
                title: 'Iluminação e Modo Pro',
                content: 'Configure o ISO baixo (100-400) para evitar ruído. Ajuste o Tempo de Obturador para capturar o movimento exato ou congelar fenômenos de alta energia. No celular, use o bloqueio de foco/exposição.'
            },
            {
                title: 'Redação e Divulgação',
                content: 'Escreva para humanos: comece com o gancho (o "porquê" importa), explique o mecanismo e termine com o impacto. Divulgação científica é o transporte de conceitos complexos para mentes curiosas.'
            },
            {
                title: 'Recursos Lab-Div',
                content: (
                    <div className="space-y-6">
                        <p>Utilize o KitDiv para assets visuais e tipografia oficial. Caso precise de suporte personalizado, agende uma Mentoria com nossa equipe técnica de comunicação.</p>
                        <div className="flex flex-wrap gap-4">
                            <ActionButton label="Acessar KitDiv" icon={<Download className="w-4 h-4" />} href="/arquivo-labdiv#kitdiv" variant="primary" />
                            <ActionButton label="Agendar Mentoria" icon={<Brain className="w-4 h-4" />} href="/arquivo-labdiv#mentorias" variant="secondary" />
                        </div>
                    </div>
                )
            }
        ],
        dates: [],
        actions: [
            { label: 'Acessar KitDiv', icon: <Download className="w-4 h-4" />, href: '/arquivo-labdiv' },
            { label: 'Agendar Mentoria', icon: <Brain className="w-4 h-4" />, href: '/arquivo-labdiv' }
        ]
    },
    'protecao': {
        title: 'Protocolos de Proteção',
        subtitle: 'Saúde Mental e Acolhimento',
        icon: <HeartHandshake className="w-12 h-12" />,
        color: 'brand-yellow',
        sections: [
            {
                title: 'Acolhimento IFUSP',
                content: (
                    <div className="space-y-4">
                        <p>O Portal de Acolhimento do IFUSP é o ponto de partida para estudantes que buscam orientação, apoio em situações de conflito ou simplesmente um espaço de escuta dentro do nosso instituto.</p>
                        <ActionButton label="Solicitar Apoio IF" icon={<Users className="w-4 h-4" />} href="https://portal.if.usp.br/ad/pt-br/node/328" variant="secondary" />
                    </div>
                )
            },
            {
                title: 'Física Acolhe',
                content: (
                    <div className="space-y-4">
                        <p>Iniciativa dedicada ao suporte direto e acolhimento dos alunos do Instituto de Física, promovendo um ambiente acadêmico mais saudável e integrado.</p>
                        <ActionButton label="Conhecer Física Acolhe" icon={<HeartHandshake className="w-4 h-4" />} href="https://portal.if.usp.br/ad/pt-br/node/380" variant="secondary" />
                    </div>
                )
            },
            {
                title: 'Direitos e Inclusão (Autismo/TEA)',
                content: (
                    <div className="space-y-4">
                        <p>A USP garante direitos específicos para estudantes autistas (TEA) através de portarias da PRIP. Entre as assegurações estão o direito a realizar avaliações em salas separadas e o uso de fones de ouvido ou abafadores de ruído para conforto sensorial.</p>
                        <ActionButton label="Ler Portaria PRIP 059 (TEA)" icon={<FileText className="w-4 h-4" />} href="https://prip.usp.br/wp-content/uploads/sites/1128/2024/11/Portaria_PRIP_059-TEA-Errata.pdf" variant="secondary" />
                    </div>
                )
            },
            {
                title: 'Programa ECOS',
                content: 'Localizado ao lado do Bandejão Central, o Programa ECOS foca na escuta e acolhimento em casos de conflitos ou necessidade de orientação institucional, oferecendo inclusive escutas pontuais para a comunidade.'
            },
            {
                title: 'Sistema USP de Acolhimento (SUA)',
                content: (
                    <div className="space-y-4">
                        <p>Canal central da PRIP (Pró-Reitoria de Inclusão e Pertencimento) para denúncias de assédio, discriminação e violações de direitos humanos em toda a universidade.</p>
                        <ActionButton label="Acessar Portal SUA" icon={<ExternalLink className="w-4 h-4" />} href="https://prip.usp.br/institucional/sistema-usp-de-acolhimento-sua/" variant="secondary" />
                    </div>
                )
            },
            {
                title: 'Hospital Universitário (HU)',
                content: (
                    <div className="space-y-4">
                        <p>O HU oferece acompanhamento psiquiátrico especializado para a comunidade USP através de seu serviço de triagem e encaminhamento.</p>
                        <ActionButton label="Agendar Consulta HU" icon={<ExternalLink className="w-4 h-4" />} href="https://www.hu.usp.br/solicitacao_consultaseagendamentos" variant="secondary" />
                    </div>
                )
            }
        ],
        dates: [],
        actions: []
    },
    'extensao': {
        title: 'Interações de Fronteira',
        subtitle: 'Mapa da Integração IFUSP',
        icon: <Network className="w-12 h-12" />,
        color: 'brand-blue',
        sections: [
            {
                title: 'Mapeamento de Grupos',
                content: (
                    <div className="space-y-6">
                        <p>O IFUSP pulsa com coletivos que transformam a vivência acadêmica. Conheça e participe das iniciativas que moldam nossa comunidade:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/colisor#iniciativas-espacos" className="p-4 glass-card rounded-2xl hover:bg-brand-blue/5 transition-all group border border-white/5">
                                <h4 className="font-black text-brand-blue uppercase text-xs mb-1">Vaca Esférica</h4>
                                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">Rádio e divulgação científica feita por alunos.</p>
                            </Link>
                            <Link href="/colisor#iniciativas-espacos" className="p-4 glass-card rounded-2xl hover:bg-brand-red/5 transition-all group border border-white/5">
                                <h4 className="font-black text-brand-red uppercase text-xs mb-1">LabDiv</h4>
                                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">Laboratório de Design e Comunicação.</p>
                            </Link>
                            <Link href="/colisor#iniciativas-espacos" className="p-4 glass-card rounded-2xl hover:bg-brand-yellow/5 transition-all group border border-white/5">
                                <h4 className="font-black text-brand-yellow uppercase text-xs mb-1">Show de Física</h4>
                                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">Encantos e experimentos para o público escolar.</p>
                            </Link>
                        </div>
                    </div>
                )
            },
            {
                title: 'Guia de Integração',
                fullWidth: true,
                content: (
                    <div className="space-y-6">
                        <p>Para se enturmar, frequente o Aquário (vivência dos alunos) ou participe das reuniões abertas dos grupos. No IFUSP, a colaboração é a força fundamental.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/colisor#iniciativas-espacos" className="p-4 glass-card border-brand-blue/20 rounded-2xl hover:bg-brand-blue/5 transition-all group">
                                <h4 className="font-black text-brand-blue uppercase text-xs mb-1">Amélia Império</h4>
                                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 font-bold">Conheça o espaço no Colisor</p>
                            </Link>
                            <Link href="/colisor#iniciativas-espacos" className="p-4 glass-card border-brand-red/20 rounded-2xl hover:bg-brand-red/5 transition-all group">
                                <h4 className="font-black text-brand-red uppercase text-xs mb-1">HS (Humanidades)</h4>
                                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 font-bold">Debates éticos no Síncrotron</p>
                            </Link>
                        </div>
                    </div>
                )
            },
            {
                title: 'Pontes com Docentes (IC)',
                fullWidth: true,
                content: (
                    <div className="p-6 bg-brand-yellow/5 border border-brand-yellow/20 rounded-[32px] group hover:bg-brand-yellow/10 transition-all">
                        <h4 className="flex items-center gap-2 font-black text-brand-yellow uppercase text-xs mb-3">
                            <Users className="w-4 h-4" /> Comunicação e Pesquisa
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">
                            Professores são pesquisadores. A melhor forma de conseguir uma Iniciação Científica é a proatividade: mande um email formal, apresente seu interesse e pergunte quando pode ir à sua sala para conversar brevemente.
                        </p>
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold text-gray-500">#Proatividade</span>
                            <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold text-gray-500">#EtiquetaAcademica</span>
                        </div>
                    </div>
                )
            }
        ],
        dates: [],
        actions: [
            { label: 'Ver mais grupos e espaços', icon: <Download className="w-4 h-4" />, href: '/colisor#iniciativas-espacos' },
            { label: 'Próximos Eventos', icon: <Calendar className="w-4 h-4" />, href: '/colisor#oportunidades' }
        ]
    },
    'quiz': {
        title: 'Teste de Radiação',
        subtitle: 'Gamificação e Conhecimento Hub',
        icon: <Brain className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'Contador Geiger',
                content: 'Acerte as questões técnicas e históricas para explodir o contador Geiger no seu perfil do Hub. Quanto mais colidido seu conhecimento, maior seu impacto na comunidade.'
            },
            {
                title: 'Curiosidades IF',
                content: 'Você sabia que o acelerador Pelletron foi inaugurado em 1972? Teste seu conhecimento sobre o patrimônio científico da Rua do Matão.'
            },
            {
                title: 'Desafios de Física',
                content: 'Problemas conceituais rápidos para aquecer os neurônios entre uma aula e outra. Colisões mentais de alta energia.'
            }
        ],
        dates: [],
        actions: [
            { label: 'Iniciar Quiz', icon: <Zap className="w-4 h-4" />, href: '/wiki/quiz' },
            { label: 'Ver Ranking', icon: <Telescope className="w-4 h-4" />, href: '#' }
        ]
    },
    'pesquisa': {
        title: 'Sistemas de Pesquisa',
        subtitle: 'IC e Ciência Experimental',
        icon: <Microscope className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'Em Desenvolvimento',
                fullWidth: true,
                content: 'Estamos trabalhando nesta seção! Em breve, você encontrará aqui um guia completo sobre como iniciar sua trajetória na pesquisa científica, como utilizar os softwares técnicos essenciais e o passo a passo para conquistar sua primeira Iniciação Científica (IC).'
            }
        ],
        dates: [],
        actions: []
    },
    'carreira': {
        title: 'Vetores de Carreira',
        subtitle: 'Trajetórias Pós-IFUSP',
        icon: <Compass className="w-12 h-12" />,
        color: 'brand-yellow',
        sections: [
            {
                title: 'Em Desenvolvimento',
                fullWidth: true,
                content: 'Esta aba está em construção. No futuro, teremos aqui um guia detalhado sobre os possíveis caminhos ao final da graduação e após a formação, explorando carreiras acadêmicas, mercado de trabalho e novas fronteiras para físicos.'
            }
        ],
        dates: [],
        actions: []
    },
    'instituto': {
        title: 'O Instituto de Física',
        subtitle: 'Estrutura, História e Espaços IFUSP',
        icon: <Landmark className="w-12 h-12" />,
        color: '#17739A',
        sections: [
            {
                title: 'Em Desenvolvimento',
                fullWidth: true,
                content: 'Esta aba está em construção. No futuro, teremos aqui um guia completo focado na organização atual do Instituto de Física (Diretoria, Conselhos e Comissões), sua história de pioneirismo e excelência, e a estrutura de seus departamentos e centros de pesquisa. Outras informações práticas do cotidiano já podem ser encontradas nas demais seções da Wiki.'
            }
        ],
        dates: [],
        actions: []
    }
};

export default function WikiSubPage() {
    const params = useParams();
    const slug = params.slug as string;
    const content = pageContent[slug];
    const { setReportModalOpen } = useNavigationStore();

    if (!content) {
        return (
            <MainLayoutWrapper>
                <div className="min-h-screen bg-transparent pt-24 px-4 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-20 h-20 text-brand-red mx-auto mb-6 opacity-20" />
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Partícula não encontrada</h1>
                        <Link href="/wiki" className="mt-8 inline-block text-brand-blue font-black uppercase tracking-widest hover:underline">
                            Voltar ao Síncrotron
                        </Link>
                    </div>
                </div>
            </MainLayoutWrapper>
        );
    }

    return (
        <MainLayoutWrapper>
            <div className="min-h-screen bg-transparent pb-24 px-4 overflow-x-hidden">
                <div className="max-w-6xl mx-auto">

                    <Breadcrumbs slug={slug} title={content.title} />

                    <div className="flex flex-col lg:flex-row gap-16">

                        {/* --- Main Content Col (70%) --- */}
                        <div className="lg:w-[70%] order-2 lg:order-1">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex items-center gap-6 mb-12">
                                    <div className={`size-20 rounded-[32px] bg-${content.color}/10 text-${content.color} flex items-center justify-center ring-1 ring-${content.color}/20 shadow-2xl shadow-${content.color}/10`}>
                                        {content.icon}
                                    </div>
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
                                            {content.title}
                                        </h1>
                                        <p className="text-brand-blue text-xs font-black uppercase tracking-[0.3em]">
                                            {content.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                    {/* Decorative vertical line */}
                                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-brand-blue/50 via-brand-red/50 to-transparent hidden md:block opacity-20" />

                                    {content.sections.map((section: any, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                                            className={`${section.fullWidth || idx % 3 === 0 ? 'md:col-span-2' : 'md:col-span-1'}`}
                                        >
                                            <ContentSection title={section.title} color={content.color}>
                                                <div className="relative group">
                                                    {/* Premium Glow effect */}
                                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-blue to-brand-red rounded-[40px] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl" />

                                                    {typeof section.content === 'string' ? (
                                                        <div className="relative text-gray-400 font-medium leading-relaxed glass-card p-8 rounded-[40px] transition-all hover:-translate-y-1 shadow-2xl">
                                                            <div className={`absolute top-4 right-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/5 group-hover:${content.color.startsWith('#') ? `text-[${content.color}]` : `text-${content.color}`}/20 transition-colors`}>
                                                                SEÇÃO {String(idx + 1).padStart(2, '0')}
                                                            </div>
                                                            {section.content}
                                                        </div>
                                                    ) : (
                                                        <div className="relative transition-all hover:-translate-y-1">
                                                            <div className="absolute top-0 right-0 text-[10px] font-black uppercase tracking-[0.2em] text-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                SEÇÃO {String(idx + 1).padStart(2, '0')}
                                                            </div>
                                                            {section.content}
                                                        </div>
                                                    )}
                                                </div>
                                            </ContentSection>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* --- Sidebar Info (30%) --- */}
                        <aside className="lg:w-[30%] order-1 lg:order-2">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="sticky top-24 space-y-8"
                            >
                                {/* Dates/DataCards */}
                                {content.dates && content.dates.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">Métricas de Colisão</h4>
                                        {content.dates.map((date: any, idx: number) => (
                                            <DataCard key={idx} label={date.label} value={date.value} color={content.color} />
                                        ))}
                                    </div>
                                )}

                                {/* Actions/ActionButtons */}
                                <div className="space-y-4 pt-8 border-t border-white/5">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">Ações Rápidas</h4>
                                    {content.actions?.map((action: any, idx: number) => (
                                        <ActionButton key={idx} label={action.label} icon={action.icon} href={action.href} variant={idx === 0 ? 'primary' : 'secondary'} color={content.color} />
                                    ))}
                                </div>

                                {/* Support Card (Report System) */}
                                <div className="p-8 glass-card border-brand-red/20 rounded-[40px] mt-12 group">
                                    <AlertCircle className="w-8 h-8 text-brand-red mb-4 group-hover:scale-110 transition-transform" />
                                    <h5 className="text-sm font-black text-white uppercase italic mb-2">Dúvida Técnica?</h5>
                                    <p className="text-[11px] text-gray-500 font-bold leading-relaxed mb-6">Utilize o canal de Report para informar flutuações de dados ou problemas técnicos.</p>
                                    <button onClick={() => setReportModalOpen(true)} className="w-full text-xs font-black text-brand-red uppercase hover:underline border border-brand-red/20 rounded-xl px-4 py-2 hover:bg-brand-red/10 transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">report</span>
                                        Reportar Problema
                                    </button>
                                </div>
                            </motion.div>
                        </aside>

                    </div>
                </div>
            </div>

            {/* Re-injecting Global Tooltip Color Classes (Defensive) */}
            <style jsx global>{`
                .ring-brand-green\/10 { --tw-ring-color: rgba(16, 185, 129, 0.1); }
                .shadow-brand-green\/10 { --tw-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -2px rgba(16, 185, 129, 0.1); }
                .bg-brand-green\/10 { background-color: rgba(16, 185, 129, 0.1); }
                .text-brand-green { color: #10b981; }
                .bg-brand-blue\/10 { background-color: rgba(0, 150, 255, 0.1); }
                .text-brand-blue { color: #0096FF; }
                .bg-brand-red\/10 { background-color: rgba(255, 59, 48, 0.1); }
                .shadow-brand-red\/10 { --tw-shadow: 0 4px 6px -1px rgba(255, 59, 48, 0.1), 0 2px 4px -2px rgba(255, 59, 48, 0.1); }
            `}</style>
        </MainLayoutWrapper>
    );
}
