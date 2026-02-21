import { supabase } from '@/lib/supabase';
import { MediaCard, MediaCardProps } from '@/components/MediaCard';
import Link from 'next/link';

export default async function AutorPage({ params }: { params: Promise<{ nome: string }> }) {
    const rawNome = (await params).nome;
    const decodedNome = decodeURIComponent(rawNome);

    // Fetch submissions matching this author exactly or partially (if the string has multiple authors)
    // We use ilike because authors is a comma-separated text string
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'aprovado')
        .ilike('authors', `%${decodedNome}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching author submissions:", error);
    }

    // Fetch likes (we can fetch all curtidas for these submissions)
    let likeMap: Record<string, number> = {};
    if (submissions && submissions.length > 0) {
        const subIds = submissions.map(s => s.id);
        const { data: likes } = await supabase
            .from('curtidas')
            .select('submission_id')
            .in('submission_id', subIds);

        if (likes) {
            likes.forEach(l => {
                likeMap[l.submission_id] = (likeMap[l.submission_id] || 0) + 1;
            });
        }
    }

    const items: MediaCardProps[] = (submissions || []).map(sub => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        authors: sub.authors,
        mediaType: sub.media_type,
        mediaUrl: sub.media_url,
        category: sub.category,
        isFeatured: sub.featured,
        likeCount: likeMap[sub.id] || 0,
        external_link: sub.external_link,
        created_at: sub.created_at,
        technical_details: sub.technical_details,
        alt_text: sub.alt_text,
    }));

    return (
        <div className="relative min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:30px_30px] opacity-40 -z-20"></div>

            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 dark:hidden rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse -z-10"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow/10 dark:hidden rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 -z-10"></div>

            {/* Simple Header */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-background-dark/80 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors font-medium">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        Voltar para o Arquivo
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-red"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                    </div>
                </div>
            </header>

            <main className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 z-10 mx-auto max-w-7xl">
                {/* Author Profile Header */}
                <div className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center gap-8 border-b border-gray-200 dark:border-gray-800 pb-10">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-blue to-brand-yellow p-1 shadow-xl shrink-0">
                        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center font-display text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-wider overflow-hidden">
                            {decodedNome.substring(0, 2)}
                        </div>
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wide">
                            <span className="material-symbols-outlined text-[14px]">school</span>
                            Perfil de Autor
                        </div>
                        <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-900 dark:text-white tracking-tight mb-2">
                            {decodedNome}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {items.length} {items.length === 1 ? 'publicação oficial aprovada' : 'publicações oficiais aprovadas'}
                        </p>
                    </div>
                </div>

                {/* Submissions Grid */}
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
                        {items.map(submission => (
                            <MediaCard key={submission.id} {...submission} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhuma publicação encontrada</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md">
                            Este autor ainda não possui arquivos ou projetos aprovados no catálogo público do Lab-Div.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
