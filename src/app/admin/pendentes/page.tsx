'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MediaCard, MediaCardProps } from '@/components/MediaCard';
import { AdminSubmissionLightbox, AdminSubmission } from '@/components/AdminSubmissionLightbox';
import { CATEGORIES } from '@/app/enviar/constants';

interface SubmissionItem extends AdminSubmission {
    id: string;
}

/* ─── Netflix-style Carousel Row ─── */
function CarouselSection({
    title,
    icon,
    iconColor,
    items,
    maxRows,
    onCardClick,
    actions,
    emptyMessage,
}: {
    title: string;
    icon: string;
    iconColor: string;
    items: SubmissionItem[];
    maxRows: number;
    onCardClick: (item: SubmissionItem) => void;
    actions?: (item: SubmissionItem) => React.ReactNode;
    emptyMessage: string;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        updateScrollButtons();
        const el = scrollRef.current;
        if (el) el.addEventListener('scroll', updateScrollButtons);
        window.addEventListener('resize', updateScrollButtons);
        return () => {
            if (el) el.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [items]);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = 220;
        const scrollAmount = cardWidth * 3;
        el.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    };

    const ITEMS_PER_ROW = 10;

    return (
        <section className="relative">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-2xl ${iconColor}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-xs text-gray-500">{items.length} submissão(ões)</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">inbox</span>
                    <p className="text-gray-500 text-sm mt-2">{emptyMessage}</p>
                </div>
            ) : (
                <div className="relative group/carousel">
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-background-light dark:from-background-dark to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </div>
                        </button>
                    )}

                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-background-light dark:from-background-dark to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-card-dark shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </div>
                        </button>
                    )}

                    <div ref={scrollRef} className="overflow-x-auto no-scrollbar scroll-smooth">
                        <div
                            className="grid gap-4 pb-2"
                            style={{
                                gridTemplateRows: `repeat(${Math.min(maxRows, Math.ceil(items.length / ITEMS_PER_ROW))}, auto)`,
                                gridAutoFlow: 'column',
                                gridAutoColumns: 'minmax(200px, 220px)',
                            }}
                        >
                            {items.map((item) => {
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
                                    <div key={item.id} className="flex flex-col gap-2 min-w-[200px]">
                                        <div onClick={() => onCardClick(item)} className="cursor-pointer">
                                            <MediaCard {...cardProps} />
                                        </div>
                                        {actions && (
                                            <div className="flex items-center gap-1.5 px-1">
                                                {actions(item)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

/* ─── Main Page ─── */
export default function AdminSubmissionsPage() {
    const [allSubmissions, setAllSubmissions] = useState<SubmissionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<SubmissionItem | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    // Editing
    const [editingItem, setEditingItem] = useState<SubmissionItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchAll = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions', error);
        } else {
            setAllSubmissions(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const pendentes = useMemo(() => allSubmissions.filter(s => s.status === 'pendente'), [allSubmissions]);
    const aprovados = useMemo(() => allSubmissions.filter(s => s.status === 'aprovado'), [allSubmissions]);
    const rejeitados = useMemo(() => allSubmissions.filter(s => s.status === 'rejeitado'), [allSubmissions]);

    const handleApprove = async (id: string, feedback?: string) => {
        if (!confirm('Aprovar esta submissão? Ela ficará visível publicamente.')) return;
        const { error } = await supabase.from('submissions').update({
            status: 'aprovado',
            admin_feedback: feedback || null
        }).eq('id', id);
        if (error) {
            alert('Erro ao aprovar: ' + error.message);
        } else {
            setAllSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'aprovado', admin_feedback: feedback || s.admin_feedback } : s));
            if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, status: 'aprovado', admin_feedback: feedback || (prev as any).admin_feedback } : null);
        }
    };

    const handleReject = async (id: string, feedback?: string) => {
        if (!confirm('Rejeitar esta submissão?')) return;
        const { error } = await supabase.from('submissions').update({
            status: 'rejeitado',
            admin_feedback: feedback || null
        }).eq('id', id);
        if (error) {
            alert('Erro: ' + error.message);
        } else {
            setAllSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejeitado', admin_feedback: feedback || s.admin_feedback } : s));
            if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, status: 'rejeitado', admin_feedback: feedback || (prev as any).admin_feedback } : null);
        }
    };

    const handleRecover = async (id: string) => {
        if (!confirm('Recuperar esta submissão para pendente?')) return;
        const { error } = await supabase.from('submissions').update({ status: 'pendente' }).eq('id', id);
        if (error) {
            alert('Erro: ' + error.message);
        } else {
            setAllSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'pendente' } : s));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setIsSaving(true);
        const { error } = await supabase.from('submissions').update({
            title: editingItem.title,
            authors: editingItem.authors,
            category: editingItem.category,
            description: editingItem.description,
        }).eq('id', editingItem.id);

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            setAllSubmissions(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...editingItem } : s));
            if (selectedItem?.id === editingItem.id) setSelectedItem(prev => prev ? { ...prev, ...editingItem } : null);
            setEditingItem(null);
        }
        setIsSaving(false);
    };

    // Lightbox navigation
    const allForLightbox = allSubmissions;
    const currentIdx = selectedItem ? allForLightbox.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx !== -1 && currentIdx < allForLightbox.length - 1;
    const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); if (hasPrev) { setSelectedItem(allForLightbox[currentIdx - 1]); setModalImageIdx(0); } };
    const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); if (hasNext) { setSelectedItem(allForLightbox[currentIdx + 1]); setModalImageIdx(0); } };

    const openCard = (item: SubmissionItem) => { setSelectedItem(item); setModalImageIdx(0); };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-blue">Formulário de Envio</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Gerenciamento de Envios</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie e revise todas as submissões de conteúdo do acervo.</p>
            </div>

            {isLoading ? (
                <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl animate-spin text-brand-blue mb-4">progress_activity</span>
                    <p className="text-gray-500 animate-pulse">Carregando submissões...</p>
                </div>
            ) : (
                <>
                    {/* ─── Nível 1: Card de atalho ─── */}
                    <Link
                        href="/admin/acervo"
                        className="flex items-center gap-4 p-5 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-blue/40 transition-all group cursor-pointer"
                    >
                        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-3xl">collections_bookmark</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">Gerenciador de Acervo</h3>
                            <p className="text-sm text-gray-500">Edite, filtre por autor e gerencie todas as submissões em um só lugar</p>
                        </div>
                        <span className="material-symbols-outlined text-2xl text-gray-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all">arrow_forward</span>
                    </Link>

                    {/* ─── Nível 2: Pendentes ─── */}
                    <CarouselSection
                        title="Submissões Pendentes"
                        icon="pending_actions"
                        iconColor="bg-brand-yellow/10 text-brand-yellow"
                        items={pendentes}
                        maxRows={2}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão pendente de aprovação."
                        actions={(item) => (
                            <>
                                <button onClick={() => handleApprove(item.id)} className="flex-1 px-2 py-1.5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">check</span> Aprovar
                                </button>
                                <button onClick={() => handleReject(item.id)} className="flex-1 px-2 py-1.5 bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">close</span> Rejeitar
                                </button>
                            </>
                        )}
                    />

                    {/* Nível 3: Rejeitados */}
                    <CarouselSection
                        title="Submissões Rejeitadas"
                        icon="block"
                        iconColor="bg-brand-red/10 text-brand-red"
                        items={rejeitados}
                        maxRows={2}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão rejeitada."
                        actions={(item) => (
                            <button onClick={() => handleRecover(item.id)} className="flex-1 px-2 py-1.5 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">restore</span> Recuperar
                            </button>
                        )}
                    />

                    {/* Nível 4: Aprovados */}
                    <CarouselSection
                        title="Submissões Aprovadas"
                        icon="check_circle"
                        iconColor="bg-brand-blue/10 text-brand-blue"
                        items={aprovados}
                        maxRows={2}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão aprovada."
                    />

                    {/* ─── Nível 5: Todos os Envios ─── */}
                    <CarouselSection
                        title="Todos os Envios"
                        icon="list"
                        iconColor="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        items={allSubmissions}
                        maxRows={4}
                        onCardClick={openCard}
                        emptyMessage="Nenhuma submissão encontrada."
                    />
                </>
            )}

            {/* Lightbox */}
            {selectedItem && (
                <AdminSubmissionLightbox
                    item={selectedItem as AdminSubmission}
                    statusType={(selectedItem.status as 'pendente' | 'aprovado' | 'rejeitado') || 'pendente'}
                    onClose={() => setSelectedItem(null)}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onEdit={(item) => setEditingItem({ ...item } as SubmissionItem)}
                    modalImageIdx={modalImageIdx}
                    setModalImageIdx={setModalImageIdx}
                />
            )}

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-background-dark">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-blue">edit_document</span>
                                Editar Submissão
                            </h2>
                            <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="edit-form" onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Título</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingItem.title}
                                        onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Autores</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingItem.authors}
                                        onChange={e => setEditingItem({ ...editingItem, authors: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Categoria</label>
                                    <select
                                        value={editingItem.category}
                                        onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição</label>
                                    <textarea
                                        rows={4}
                                        value={editingItem.description}
                                        onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-gray-900 dark:text-white py-2.5 px-4 focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue text-sm resize-none"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 dark:bg-background-dark border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" form="edit-form" disabled={isSaving} className="px-5 py-2 text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/80 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                {!isSaving && <span className="material-symbols-outlined text-[16px]">save</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
