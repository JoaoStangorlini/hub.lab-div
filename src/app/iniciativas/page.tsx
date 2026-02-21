import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { supabase } from '@/lib/supabase';

interface Oportunidade {
    id: string;
    titulo: string;
    descricao: string;
    data: string;
    local: string;
    link: string | null;
    tipo: string;
    created_at: string;
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

export default async function DivulgacaoPage() {
    // Fetch Oportunidades
    const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3); // Fetch only 3 most recent to not overwhelm the page

    if (error) {
        console.error('Error fetching oportunidades:', error);
    }

    const items: Oportunidade[] = oportunidades || [];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 w-full">
                {/* Hero */}
                <section className="relative overflow-hidden py-16 bg-gradient-to-br from-brand-blue/5 via-white to-brand-yellow/5 dark:from-brand-blue/10 dark:via-background-dark dark:to-brand-yellow/10 border-b border-gray-200 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="max-w-3xl">
                            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 text-gray-900 dark:text-white">
                                Divulgação e <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-yellow">Oportunidades</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Descubra projetos do instituto, eventos, vagas e espaços focados na difusão científica.
                            </p>
                        </div>
                    </div>
                </section>

                {/* --- SEÇÃO OPORTUNIDADES DENTRO DE DIVULGAÇÃO --- */}
                <section className="py-12 bg-background-subtle dark:bg-background-dark max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-brand-red text-3xl">event_available</span>
                        <h2 className="text-3xl font-bold">Oportunidades Recentes</h2>
                    </div>

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">event_busy</span>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Nenhuma oportunidade no momento</h3>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-3">
                            {items.map((item) => {
                                const config = getTipoConfig(item.tipo);
                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 relative border-t-4 border-t-${config.color}`}
                                    >
                                        <div className="p-6 flex flex-col h-full space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-xl bg-${config.color}/10 dark:bg-${config.color}/20 text-${config.color} flex items-center justify-center`}>
                                                    <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${config.color}/10 text-${config.color} border border-${config.color}/20`}>
                                                    {config.label}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                                {item.titulo}
                                            </h3>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 line-clamp-3">
                                                {item.descricao}
                                            </p>

                                            <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                    <span className="font-medium truncate">{item.data}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                    <span className="truncate">{item.local}</span>
                                                </div>
                                            </div>

                                            {item.link && (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center justify-center gap-2 mt-2 px-4 py-2 w-full rounded-xl bg-${config.color}/10 hover:bg-${config.color}/20 text-${config.color} font-bold transition-colors text-sm border border-${config.color}/20`}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                                    Ver mais
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* --- SEÇÃO DE PROJETOS E ESPAÇOS --- */}
                <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-brand-blue text-3xl">hub</span>
                        <h2 className="text-3xl font-bold">Projetos & Espaços Físicos</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Iniciativa 1 */}
                        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 hover:-translate-y-1 transition-transform group">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                                <Image src="/labdiv-logo.png" alt="Logo do Lab-Div" width={64} height={64} className="object-contain" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Lab-Div</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Iniciativa inspirada no CommLab do MIT, focada em aprimorar a comunicação científica no IFUSP. Oferece programa de tutoria entre pares para auxiliar estudantes com a escrita científica, apresentações orais e design visual de trabalhos acadêmicos – feito por quem faz física, para quem faz física.
                            </p>
                            <a href="https://labdiv.notion.site" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-brand-blue font-semibold group-hover:text-brand-darkBlue transition-colors">
                                Conhecer mais <span className="material-symbols-outlined text-[20px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>

                        {/* Iniciativa 2 */}
                        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 hover:-translate-y-1 transition-transform group">
                            <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl text-brand-red">desktop_windows</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">DigitalLab</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                                Iniciativa com foco na criação de experiências digitais, programação e conteúdos audiovisuais voltados para a popularização da ciência na internet.
                            </p>
                            <a href="#" className="inline-flex items-center text-brand-red font-semibold group-hover:opacity-80 transition-colors">
                                Conhecer mais <span className="material-symbols-outlined text-[20px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>

                        {/* Iniciativa 3 */}
                        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 hover:-translate-y-1 transition-transform group">
                            <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl text-brand-yellow">newspaper</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Boletim Supernova</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Publicação do Centro Acadêmico de Física (CEFISMA) que serve como espaço de diálogo crítico, político e cultural dentro do IFUSP. Traz textos produzidos por estudantes, artigos de opinião, relatos institucionais e expressões artísticas.
                            </p>
                            <a href="https://cefisma.com.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-brand-yellow font-semibold group-hover:opacity-80 transition-colors">
                                Conhecer mais <span className="material-symbols-outlined text-[20px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>

                        {/* Iniciativa 4 */}
                        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 hover:-translate-y-1 transition-transform group">
                            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl text-brand-green">memory</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Hackerspace IFUSP</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Laboratório aberto e colaborativo dentro do IFUSP, um dos primeiros hackerspaces do Brasil. Oferece Arduinos, Raspberry Pis, impressoras 3D, osciloscópios e muito mais para projetos de eletrônica, robótica e desenvolvimento de jogos.
                            </p>
                            <a href="https://hackerspace.if.usp.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-brand-green font-semibold group-hover:opacity-80 transition-colors">
                                Conhecer mais <span className="material-symbols-outlined text-[20px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
