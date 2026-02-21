import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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

export default async function OportunidadesPage() {
    const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching oportunidades:', error);
    }

    const items: Oportunidade[] = oportunidades || [];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="relative overflow-hidden py-16 bg-gradient-to-br from-brand-blue/5 via-white to-brand-yellow/5 dark:from-brand-blue/10 dark:via-background-dark dark:to-brand-yellow/10 border-b border-gray-200 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wide mb-4">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            Fique por dentro
                        </div>
                        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 text-gray-900 dark:text-white">
                            Oportunidades
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                            Palestras, eventos e vagas no Instituto de Física da USP.
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12 bg-background-subtle dark:bg-background-dark">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">event_busy</span>
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Nenhuma oportunidade no momento</h3>
                                <p className="text-gray-500 mt-2">Volte em breve para novas oportunidades!</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {items.map((item) => {
                                    const config = getTipoConfig(item.tipo);
                                    return (
                                        <div
                                            key={item.id}
                                            className={`bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 border-t-4 border-t-${config.color}`}
                                        >
                                            <div className="p-6 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-10 h-10 rounded-xl bg-${config.color}/10 dark:bg-${config.color}/20 text-${config.color} flex items-center justify-center`}>
                                                        <span className="material-symbols-outlined">{config.icon}</span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${config.color}/10 text-${config.color} border border-${config.color}/20`}>
                                                        {config.label}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                                    {item.titulo}
                                                </h3>

                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                    {item.descricao}
                                                </p>

                                                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                                        <span className="font-medium">{item.data}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                        <span>{item.local}</span>
                                                    </div>
                                                </div>

                                                {item.link && (
                                                    <a
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-${config.color} text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm`}
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                        Saiba mais
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
