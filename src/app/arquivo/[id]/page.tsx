import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ShareButtons } from './ShareButtons';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getSubmission(id: string) {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .eq('status', 'aprovado')
        .single();

    if (error || !data) return null;
    return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const submission = await getSubmission(id);

    if (!submission) {
        return { title: 'Submissão não encontrada' };
    }

    const mediaUrls = Array.isArray(submission.media_url) ? submission.media_url : [submission.media_url];
    const firstImage = mediaUrls[0] || '';

    return {
        title: `${submission.title} — Hub Lab-Div`,
        description: submission.description || `Por ${submission.authors}`,
        openGraph: {
            title: submission.title,
            description: submission.description || `Submissão de ${submission.authors} no Hub de Comunicação Científica do Lab-Div`,
            images: submission.media_type === 'image' && firstImage ? [{ url: firstImage }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: submission.title,
            description: submission.description || `Por ${submission.authors}`,
            images: submission.media_type === 'image' && firstImage ? [firstImage] : [],
        },
    };
}

function parseMediaUrl(mediaUrl: string | string[]): string[] {
    try {
        if (Array.isArray(mediaUrl)) return mediaUrl;
        if (typeof mediaUrl === 'string') {
            if (mediaUrl.startsWith('[') && mediaUrl.endsWith(']')) return JSON.parse(mediaUrl);
            return [mediaUrl];
        }
    } catch { /* ignore */ }
    return [];
}

function formatYoutubeEmbed(url: string) {
    if (url.includes('/embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

export default async function ArquivoItemPage({ params }: PageProps) {
    const { id } = await params;
    const submission = await getSubmission(id);

    if (!submission) {
        notFound();
    }

    const urls = parseMediaUrl(submission.media_url);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="bg-white dark:bg-card-dark rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">

                    {/* Media Section */}
                    <div className="bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
                        {submission.media_type === 'video' ? (
                            urls.length > 0 ? (
                                <iframe
                                    src={formatYoutubeEmbed(urls[0])}
                                    className="w-full aspect-video"
                                    allowFullScreen
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            ) : (
                                <span className="text-white">Vídeo não encontrado</span>
                            )
                        ) : (
                            urls.length > 0 ? (
                                <div className="w-full">
                                    {urls.map((url, i) => (
                                        <img
                                            key={i}
                                            src={url}
                                            alt={`${submission.title} - ${i + 1}`}
                                            className="w-full object-contain max-h-[70vh]"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <span className="text-white">Imagem não encontrada</span>
                            )
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="p-6 md:p-10 space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                            {submission.category && (
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold tracking-wide uppercase">
                                    {submission.category}
                                </span>
                            )}
                            {submission.featured && (
                                <span className="px-3 py-1 bg-gradient-to-r from-brand-red to-brand-yellow text-white rounded-full text-xs font-bold tracking-wide uppercase">
                                    Destaque
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                            {submission.title}
                        </h1>

                        <div className="flex items-center gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
                            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                                {submission.authors.substring(0, 2)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Autores</span>
                                <span className="text-base font-bold text-gray-900 dark:text-white">{submission.authors}</span>
                            </div>
                        </div>

                        {submission.description && (
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Descrição</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                                    {submission.description}
                                </p>
                            </div>
                        )}

                        {/* Share Buttons */}
                        <ShareButtons title={submission.title} id={submission.id} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
