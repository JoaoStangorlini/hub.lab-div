'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ColisorClientViewProps {
    oportunidades: any[] | null;
}

const getTipoConfig = (tipo: string) => {
    switch (tipo) {
        case 'palestra':
            return { color: 'brand-blue', icon: 'campaign', label: 'Palestra' };
        case 'vaga':
            return { color: 'brand-yellow', icon: 'work', label: 'Vaga' };
        case 'evento':
            return { color: 'brand-red', icon: 'event', label: 'Evento' };
        default:
            return { color: 'brand-blue', icon: 'info', label: tipo };
    }
};

const influencers = [
    {
        name: 'Lumus Quasar',
        role: 'Vídeos de Rotina Acadêmica',
        bio: 'Mostrando os bastidores do meu estágio intergaláctico no cinturão de Órion para meus seguidores da Terra.',
        imagePlaceholder: 'L',
        color: 'brand-blue',
        platform: 'youtube'
    },
    {
        name: 'Doutor Paradoxo',
        role: 'Divulgação Científica no TikTok',
        bio: 'Física interdimensional e por que você não deveria acariciar o gato de Schrödinger.',
        imagePlaceholder: 'D',
        color: 'brand-red',
        platform: 'tiktok'
    },
    {
        name: 'Sintonia Gamma',
        role: 'Pesquisador no Instagram',
        bio: 'Buscando fontes de energia cósmica no meu quintal e postando no canal.',
        imagePlaceholder: 'S',
        color: 'brand-yellow',
        platform: 'instagram'
    },
    {
        name: 'Mestre da Inércia',
        role: 'Dailyvlogs no Laboratório',
        bio: 'Lutando pelo direito de manter objetos em repouso exatamente onde estão.',
        imagePlaceholder: 'M',
        color: 'brand-blue',
        platform: 'youtube'
    },
    {
        name: 'Zeta Bits',
        role: 'Explicações de Artigos',
        bio: 'Descobrindo o universo em 8bits e simulando buracos negros no meu fliperama antigo.',
        imagePlaceholder: 'Z',
        color: 'brand-red',
        platform: 'youtube'
    },
    {
        name: 'Entropia Positiva',
        role: 'Curiosidades da Física',
        bio: 'Dicas práticas de como aumentar a desordem do seu quarto de forma cientificamente provada.',
        imagePlaceholder: 'E',
        color: 'brand-yellow',
        platform: 'tiktok'
    },
    {
        name: 'Dr. Tachyon',
        role: 'Experimentos Práticos',
        bio: 'Testando os limites da velocidade da luz nos finais de semana e desmentindo mitos warp.',
        imagePlaceholder: 'T',
        color: 'brand-blue',
        platform: 'instagram'
    },
    {
        name: 'Nova Estelar',
        role: 'Astronomia Amadora',
        bio: 'Cultivando batatas marcianas e discutindo formas de vida baseadas em silício.',
        imagePlaceholder: 'N',
        color: 'brand-yellow',
        platform: 'youtube'
    },
    {
        name: 'Pulsar XP',
        role: 'Notícias de Ciência',
        bio: 'Transformando radiação cósmica de fundo em lofi hip-hop para estudar no espaço.',
        imagePlaceholder: 'P',
        color: 'brand-red',
        platform: 'instagram'
    },
    {
        name: 'Capitã Órbita',
        role: 'Dicas de Estudo e Pesquisa',
        bio: 'Mostrando os melhores ângulos de Júpiter enquanto desvio de lixo estelar.',
        imagePlaceholder: 'C',
        color: 'brand-blue',
        platform: 'tiktok'
    }
];

const getPlatformIcon = (platform: string) => {
    if (platform === 'youtube') return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
    );
    if (platform === 'instagram') return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    );
    if (platform === 'tiktok') return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.36-5.17 2.05-7.11 1.57-1.79 4.11-2.9 6.55-2.73 0 1.34.02 2.69 0 4.03-1.07-.15-2.18.06-3.12.63-1.08.66-1.85 1.83-2.02 3.1-.15 1.14.07 2.34.61 3.32.78 1.45 2.58 2.36 4.19 2.03 2.15-.46 3.65-2.42 3.65-4.66.01-4.8.01-9.61 0-14.41-.01-.57-.01-1.14-.01-1.71h.01z" /></svg>
    );
    return <span className="material-symbols-outlined text-[18px]">open_in_new</span>;
};

export function ColisorClientView({ oportunidades }: ColisorClientViewProps) {
    return (
        <div className="py-12 max-w-5xl mx-auto px-4">
            {/* Wiki Header */}
            <div className="mb-12 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-blue/20">
                        <span className="material-symbols-outlined text-3xl font-black">network_node</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">O Grande Colisor</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl leading-relaxed">
                    O repositório técnico de conhecimento estruturado do Instituto de Física e da USP. Explore a conexão entre iniciativas e oportunidades.
                </p>
            </div>

            {/* --- SEÇÃO OPORTUNIDADES --- */}
            <section id="oportunidades" className="mb-20">
                <div className="mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-red text-3xl">event_available</span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Oportunidades no IF</h2>
                </div>

                {!oportunidades || oportunidades.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800">
                        Nenhuma oportunidade cadastrada no momento.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-3">
                        {oportunidades.map((item) => {
                            const config = getTipoConfig(item.tipo);
                            return (
                                <div key={item.id} className="bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg transition-all border-t-4 border-t-brand-blue p-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-${config.color}/10 text-${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{item.titulo}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{item.descricao}</p>
                                    <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400">{item.data}</span>
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-brand-blue text-xs font-black flex items-center gap-1 hover:underline">
                                                Ver <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* --- SEÇÃO PROJETOS & ESPAÇOS --- */}
            <section id="iniciativas-espacos">
                <div className="mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-yellow text-3xl">hub</span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Iniciativas & Espaços</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Lab-Div Card */}
                    <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 hover:-translate-y-1 transition-transform group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-brand-blue">science</span>
                        </div>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                            <img src="/labdiv-logo.png" alt="Logo do Lab-Div" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight mb-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow">Lab-Div</span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Inspirada no CommLab do MIT, foca na comunicação científica no IFUSP. Oferece tutoria entre pares para escrita científica, apresentações e design.
                        </p>
                        <Link href="/arquivo-labdiv" className="text-brand-blue font-black flex items-center gap-2 group-hover:underline text-sm">
                            Explorar Acervo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Hackerspace IFUSP Card */}
                    <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 hover:-translate-y-1 transition-transform group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-brand-green">memory</span>
                        </div>
                        <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-brand-green">memory</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Hackerspace IFUSP</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Laboratório aberto e colaborativo. Oferece Arduinos, Raspberry Pis, impressoras 3D e eletrônica para projetos de física e robótica.
                        </p>
                        <a href="https://hackerspace.if.usp.br" target="_blank" rel="noopener noreferrer" className="text-brand-green font-black flex items-center gap-2 group-hover:underline text-sm">
                            Conhecer <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    {/* Boletim Supernova */}
                    <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 hover:-translate-y-1 transition-transform group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-brand-yellow">newspaper</span>
                        </div>
                        <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-brand-yellow">newspaper</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Boletim Supernova</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Publicação do CEFISMA que serve como espaço de diálogo crítico e cultural no IFUSP. Traz textos de estudantes, artigos de opinião e artes.
                        </p>
                        <a href="https://cefisma.com.br" target="_blank" rel="noopener noreferrer" className="text-brand-yellow font-black flex items-center gap-2 group-hover:underline text-sm">
                            Ler Boletim <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    {/* BIFUSP Card */}
                    <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 hover:-translate-y-1 transition-transform group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-brand-blue">library_books</span>
                        </div>
                        <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-brand-blue">library_books</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">BIFUSP</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            A Biblioteca do Instituto de Física. Um acervo vasto de livros, periódicos e teses, oferecendo suporte essencial para o estudo e a pesquisa acadêmica de excelência.
                        </p>
                        <a href="https://portal.if.usp.br/biblioteca/" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-black flex items-center gap-2 group-hover:underline text-sm">
                            Acessar Biblioteca <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    {/* Lab Demo Card */}
                    <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 hover:-translate-y-1 transition-transform group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-brand-red">rocket_launch</span>
                        </div>
                        <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-brand-red">rocket_launch</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Lab Demo</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Laboratório de Demonstrações Ernst Wolfgang Hamburger. Espaço dedicado à experimentação física e demonstrações lúdicas que aproximam a ciência do cotidiano.
                        </p>
                        <a href="https://portal.if.usp.br/demonstracoes/" target="_blank" rel="noopener noreferrer" className="text-brand-red font-black flex items-center gap-2 group-hover:underline text-sm">
                            Ver Experimentos <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    {/* DigitalLab */}
                    <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 hover:-translate-y-1 transition-transform group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-brand-red">desktop_windows</span>
                        </div>
                        <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-brand-red">desktop_windows</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">DigitalLab</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Foco na criação de experiências digitais, programação e conteúdos audiovisuais voltados para a popularização da ciência na internet.
                        </p>
                        <div className="text-brand-red font-black flex items-center gap-2 text-sm opacity-50 cursor-default">
                            Em breve <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                        </div>
                    </div>

                    {/* Cientec Card */}
                    <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 hover:-translate-y-1 transition-transform group relative overflow-hidden md:col-span-2">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-brand-blue">
                            <span className="material-symbols-outlined text-8xl">park</span>
                        </div>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                            <img src="/cientec-logo.png" alt="Logo do Parque CienTec" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Parque CienTec</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Museu interativo e a céu aberto dedicado à divulgação científica e preservação ambiental. Inclui trilhas, observatório astronômico e estação meteorológica.
                        </p>
                        <a href="https://parquecientec.usp.br" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-black flex items-center gap-2 group-hover:underline text-sm">
                            Visitar Site <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* --- SEÇÃO INFLUENCIADORES --- */}
            <section className="mt-20">
                <div className="mb-8 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-brand-blue text-3xl">record_voice_over</span>
                        <h2 className="text-2xl font-black uppercase tracking-tight">
                            Influenciadores do <span className="text-brand-yellow">IF-USP</span>
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Acompanhe nossos estudantes espalhando ciência criativa pelo TikTok, YouTube e outras plataformas.
                    </p>
                </div>

                <div className="w-full">
                    <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 pb-8 no-scrollbar">
                        {influencers.map((influencer, index) => (
                            <div key={index} className="flex flex-col items-center text-center group snap-center shrink-0 w-[260px] md:w-[300px] p-6 bg-white dark:bg-card-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                                <div className={`relative w-28 h-28 rounded-full mb-5 flex items-center justify-center text-4xl font-bold text-white bg-${influencer.color} shadow-lg ring-4 ring-background-light dark:ring-background-dark outline outline-2 outline-gray-200 dark:outline-gray-800 transition-transform group-hover:scale-105 duration-300`}>
                                    {influencer.imagePlaceholder}
                                    <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 group-hover:text-brand-yellow transition-colors">{influencer.name}</h3>
                                <p className={`text-xs font-bold uppercase tracking-wider text-${influencer.color} mb-4`}>{influencer.role}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{influencer.bio}</p>
                                <div className="mt-auto">
                                    <div className={`w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-${influencer.color} hover:shadow-lg hover:shadow-${influencer.color}/30 transition-all duration-300 transform group-hover:scale-110 cursor-pointer`}>
                                        {getPlatformIcon(influencer.platform)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
