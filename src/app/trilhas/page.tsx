import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
    title: 'Trilhas de Aprendizagem — Hub Lab-Div',
    description: 'Playlists temáticas de artigos do Hub de Comunicação Científica do IFUSP.',
};

async function getTrails() {
    const { data: trails } = await supabase
        .from('learning_trails')
        .select('*')
        .order('created_at', { ascending: false });

    if (!trails || trails.length === 0) return [];

    const trailsWithData = await Promise.all(
        trails.map(async (trail) => {
            const { data: trailSubs, count } = await supabase
                .from('trail_submissions')
                .select('submission_id, submissions!inner(id, title, authors, media_type)', { count: 'exact' })
                .eq('trail_id', trail.id)
                .order('sort_order', { ascending: true })
                .limit(4);

            return {
                ...trail,
                submissionCount: count || 0,
                previewSubmissions: trailSubs?.map((ts: any) => ts.submissions) || [],
            };
        })
    );

    return trailsWithData;
}

export default async function TrilhasPage() {
    const trails = await getTrails();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-grow pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0055ff]/10 text-[#0055ff] rounded-full text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[16px]">route</span>
                            Trilhas de Aprendizagem
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">
                            Playlists do <span className="text-[#0055ff]">Hub</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                            Sequências organizadas de artigos e materiais para guiar seus estudos.
                            Cada trilha é curada pela equipe Lab-Div.
                        </p>
                    </div>

                    {/* Trails Grid */}
                    {trails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="w-24 h-24 bg-[#0055ff]/10 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-5xl text-[#0055ff]">route</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nenhuma trilha disponível</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm">As trilhas de aprendizagem estão sendo preparadas e logo estarão disponíveis.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {trails.map((trail) => (
                                <div
                                    key={trail.id}
                                    className="group relative bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-[#0055ff]/30 transition-all overflow-hidden"
                                >
                                    <div className="h-1.5 bg-gradient-to-r from-[#0055ff] via-[#0055ff]/60 to-transparent"></div>

                                    <div className="p-6 sm:p-8 space-y-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="material-symbols-outlined text-[#0055ff] text-2xl">route</span>
                                                    <h2 className="text-xl font-black text-gray-900 dark:text-white truncate">{trail.title}</h2>
                                                </div>
                                                {trail.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{trail.description}</p>
                                                )}
                                            </div>
                                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#0055ff]/10 text-[#0055ff] shrink-0">
                                                <span className="text-xl font-black">{trail.submissionCount}</span>
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        {trail.previewSubmissions.length > 0 && (
                                            <div className="space-y-2">
                                                {trail.previewSubmissions.slice(0, 3).map((sub: any, idx: number) => (
                                                    <Link
                                                        key={sub.id}
                                                        href={`/arquivo/${sub.id}`}
                                                        className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 dark:bg-background-dark/50 rounded-xl hover:bg-[#0055ff]/5 transition-colors group/item"
                                                    >
                                                        <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 w-5 text-center">{idx + 1}</span>
                                                        <span className="material-symbols-outlined text-gray-400 text-lg">
                                                            {sub.media_type === 'video' ? 'play_circle' : sub.media_type === 'text' ? 'article' : 'image'}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate block group-hover/item:text-[#0055ff] transition-colors">{sub.title}</span>
                                                            <span className="text-[10px] text-gray-400 truncate block">{sub.authors}</span>
                                                        </div>
                                                        <span className="material-symbols-outlined text-gray-300 text-sm opacity-0 group-hover/item:opacity-100 transition-opacity">arrow_forward</span>
                                                    </Link>
                                                ))}
                                                {trail.submissionCount > 3 && (
                                                    <div className="text-center text-[10px] font-bold text-[#0055ff] uppercase tracking-wider pt-1">
                                                        + {trail.submissionCount - 3} artigos na trilha
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                {trail.submissionCount} {trail.submissionCount === 1 ? 'artigo' : 'artigos'}
                                            </span>
                                            <span className="text-[10px] text-gray-300 dark:text-gray-600">
                                                {new Date(trail.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
