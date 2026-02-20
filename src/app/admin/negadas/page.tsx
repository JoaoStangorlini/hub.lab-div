'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MediaCard, MediaCardProps, parseMediaUrl, formatYoutubeUrl, getDownloadUrl } from '@/components/MediaCard';

interface Submission {
    id: string;
    title: string;
    description: string;
    authors: string;
    media_type: 'image' | 'video';
    media_url: string;
    category: string;
    created_at: string;
}

export default function NegadasPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Submission | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    const fetchNegadas = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'rejeitado')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions', error);
        } else {
            setSubmissions(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchNegadas();
    }, []);

    const handleApprove = async (id: string) => {
        if (!confirm('Deseja restaurar esta submissão e marcá-la como Aprovada?')) return;

        const { error } = await supabase
            .from('submissions')
            .update({ status: 'aprovado' })
            .eq('id', id);

        if (error) {
            alert('Erro: ' + error.message);
        } else {
            setSubmissions(prev => prev.filter(s => s.id !== id));
        }
    };

    const currentSubmissionIndex = selectedItem ? submissions.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrevSubmission = currentSubmissionIndex > 0;
    const hasNextSubmission = currentSubmissionIndex !== -1 && currentSubmissionIndex < submissions.length - 1;

    const handlePrevSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasPrevSubmission) {
            setSelectedItem(submissions[currentSubmissionIndex - 1]);
            setModalImageIdx(0);
        }
    };

    const handleNextSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasNextSubmission) {
            setSelectedItem(submissions[currentSubmissionIndex + 1]);
            setModalImageIdx(0);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer">Dashboard</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Negadas</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Submissões Negadas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Itens que foram rejeitados e não estão visíveis para o público.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-200">
                        {submissions.length} Rejeitados
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500">Carregando itens...</div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">inbox</span>
                        <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">Nenhum item rejeitado.</h3>
                    </div>
                ) : (
                    <div className="masonry-grid opacity-70 hover:opacity-100 transition-opacity">
                        {submissions.map((item) => {
                            const cardProps: MediaCardProps = {
                                id: item.id,
                                title: item.title,
                                authors: item.authors,
                                description: item.description,
                                category: item.category,
                                mediaType: item.media_type,
                                mediaUrl: item.media_url,
                            };
                            return (
                                <div key={item.id} className="flex flex-col gap-3 grayscale hover:grayscale-0 transition-all">
                                    <div onClick={() => { setSelectedItem(item); setModalImageIdx(0); }}>
                                        <MediaCard {...cardProps} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(item.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition-colors text-sm font-medium"
                                            title="Desfazer e Aprovar"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">restore</span>
                                            <span>Restaurar (Aprovar)</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Admin Lightbox Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-6 lg:p-12 transition-opacity"
                    onClick={() => setSelectedItem(null)}
                >
                    <button
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all flex items-center justify-center backdrop-blur-md z-[110]"
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>

                    {/* Global Nav Left */}
                    {hasPrevSubmission && (
                        <button
                            onClick={handlePrevSubmission}
                            className="hidden md:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                            aria-label="Submissão Anterior"
                        >
                            <span className="material-symbols-outlined text-3xl lg:text-4xl">chevron_left</span>
                        </button>
                    )}

                    {/* Global Nav Right */}
                    {hasNextSubmission && (
                        <button
                            onClick={handleNextSubmission}
                            className="hidden md:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                            aria-label="Próxima Submissão"
                        >
                            <span className="material-symbols-outlined text-3xl lg:text-4xl">chevron_right</span>
                        </button>
                    )}

                    <div
                        className="w-full max-w-5xl xl:max-w-6xl max-h-full bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative z-[105]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Global Nav Overlay */}
                        <div className="md:hidden absolute inset-y-0 left-0 w-16 z-[106] flex items-center px-1 pointer-events-none">
                            {hasPrevSubmission && (
                                <button onClick={handlePrevSubmission} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-r-lg p-2 backdrop-blur-sm transition-colors">
                                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                </button>
                            )}
                        </div>
                        <div className="md:hidden absolute inset-y-0 right-0 w-16 z-[106] flex items-center justify-end px-1 pointer-events-none">
                            {hasNextSubmission && (
                                <button onClick={handleNextSubmission} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-l-lg p-2 backdrop-blur-sm transition-colors">
                                    <span className="material-symbols-outlined text-3xl">chevron_right</span>
                                </button>
                            )}
                        </div>

                        {/* Media Section */}
                        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[30vh] lg:min-h-full group grayscale">
                            {selectedItem.media_type === 'video' ? (
                                (() => {
                                    const rawUrls = parseMediaUrl(selectedItem.media_url);
                                    const videoUrl = rawUrls.length > 0 ? formatYoutubeUrl(rawUrls[0]) : '';
                                    return videoUrl ? (
                                        <iframe
                                            src={videoUrl}
                                            className="w-full h-full min-h-[400px] aspect-video"
                                            allowFullScreen
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    ) : (
                                        <span className="text-white">Vídeo não encontrado</span>
                                    );
                                })()
                            ) : (
                                (() => {
                                    const urls = parseMediaUrl(selectedItem.media_url);
                                    if (urls.length === 0) return <span className="text-white">Imagem não encontrada</span>;

                                    return (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img src={urls[modalImageIdx]} alt={selectedItem.title} className="max-w-full max-h-[80vh] object-contain" />
                                            {urls.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p - 1 + urls.length) % urls.length) }}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                                    >
                                                        <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p + 1) % urls.length) }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                                    >
                                                        <span className="material-symbols-outlined text-3xl">chevron_right</span>
                                                    </button>

                                                    <div className="absolute bottom-6 flex gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md">
                                                        {urls.map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-2.5 rounded-full cursor-pointer hover:bg-white transition-all ${i === modalImageIdx ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
                                                                onClick={(e) => { e.stopPropagation(); setModalImageIdx(i); }}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                })()
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 bg-white dark:bg-gray-900 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 max-h-[50vh] lg:max-h-full border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold tracking-wide uppercase line-through">
                                    Rejeitado
                                </span>
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-text-muted dark:text-gray-300 rounded-full text-xs font-bold tracking-wide uppercase">
                                    {selectedItem.category}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                {selectedItem.title}
                            </h2>

                            <div className="flex items-center gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
                                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                                    {selectedItem.authors.substring(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Autor</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedItem.authors}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Enviado em: {formatDate(selectedItem.created_at)}</span>
                                </div>
                            </div>

                            {selectedItem.description && (
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Descrição do Trabalho</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                        {selectedItem.description}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3 mt-auto">
                                {selectedItem.media_type === 'image' && (
                                    <a
                                        href={getDownloadUrl(parseMediaUrl(selectedItem.media_url)[modalImageIdx])}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">download</span> Baixar
                                    </a>
                                )}
                                <button
                                    onClick={() => { handleApprove(selectedItem.id); setSelectedItem(null); }}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 transition-colors text-sm font-medium"
                                >
                                    <span className="material-symbols-outlined text-[18px]">restore</span>
                                    Restaurar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
