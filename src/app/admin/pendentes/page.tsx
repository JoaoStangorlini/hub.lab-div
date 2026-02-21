'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MediaCard, MediaCardProps } from '@/components/MediaCard';
import { AdminSubmissionLightbox, AdminSubmission } from '@/components/AdminSubmissionLightbox';

// Inherit from AdminSubmission structure that the Lightbox expects
interface PendingSubmission extends AdminSubmission {
    id: string;
}

export default function AdminDashboard() {
    const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<PendingSubmission | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    const fetchPending = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'pendente')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions', error);
        } else {
            setSubmissions(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id: string) => {
        if (!confirm('Deseja realmente aprovar este item? Ele ficará visível publicamente.')) return;

        // In a real app we would ensure RLS rules allow this only for authenticated admins
        const { error } = await supabase
            .from('submissions')
            .update({ status: 'aprovado' })
            .eq('id', id);

        if (error) {
            alert('Erro ao aprovar: ' + error.message);
        } else {
            setSubmissions(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Deseja rejeitar esta submissão?')) return;

        const { error } = await supabase
            .from('submissions')
            .update({ status: 'rejeitado' })
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
                <span className="text-slate-900 dark:text-white font-medium">Moderação</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Fila de Moderação</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie e revise as submissões de conteúdo aguardando aprovação científica.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">
                        {submissions.length} Pendentes
                    </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 bg-white dark:bg-[#1e293b] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex flex-1 gap-2">
                    <div className="relative flex-1 max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por título, autor ou palavra-chave..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-form-dark border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 placeholder-slate-400"
                        />
                    </div>
                    <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <select className="bg-slate-50 dark:bg-form-dark border-none rounded-lg text-sm py-2 pl-3 pr-8 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/50 cursor-pointer">
                        <option>Todos os tipos</option>
                        <option>Imagem</option>
                        <option>Vídeo</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500">Carregando itens pendentes...</div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">check_circle</span>
                        <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">Nenhum item pendente de aprovação.</h3>
                    </div>
                ) : (
                    <div className="masonry-grid">
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
                                <div key={item.id} className="flex flex-col gap-3">
                                    <div onClick={() => { setSelectedItem(item); setModalImageIdx(0); }}>
                                        <MediaCard {...cardProps} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(item.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition-colors text-sm font-medium cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                            Aprovar
                                        </button>
                                        <button
                                            onClick={() => handleReject(item.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors text-sm font-medium cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                            Rejeitar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {submissions.length > 0 && (
                <div className="flex justify-between items-center py-4 border-t border-slate-200 dark:border-slate-800">
                    <button className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-form-dark border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50" disabled>
                        Anterior
                    </button>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Página <span className="font-semibold text-slate-900 dark:text-white">1</span> de <span className="font-semibold text-slate-900 dark:text-white">1</span>
                    </span>
                    <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-form-dark border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50" disabled>
                        Próxima
                    </button>
                </div>
            )}

            {/* Global Admin Modal replacing ~180 lines of duplicate UI code */}
            {selectedItem && (
                <AdminSubmissionLightbox
                    item={selectedItem as AdminSubmission}
                    statusType="pendente"
                    onClose={() => setSelectedItem(null)}
                    hasPrev={hasPrevSubmission}
                    hasNext={hasNextSubmission}
                    onPrev={handlePrevSubmission}
                    onNext={handleNextSubmission}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    modalImageIdx={modalImageIdx}
                    setModalImageIdx={setModalImageIdx}
                />
            )}
        </div>
    );
}
