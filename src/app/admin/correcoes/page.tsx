'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Correction {
    id: string;
    user_id: string;
    submission_id: string;
    original_text: string;
    suggested_text: string;
    comment: string | null;
    status: string;
    created_at: string;
    profiles?: { full_name: string; email: string } | null;
    submissions?: { title: string } | null;
}

export default function AdminCorrecoesPage() {
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'pendente' | 'aceito' | 'rejeitado'>('pendente');

    useEffect(() => { fetchCorrections(); }, [filter]);

    async function fetchCorrections() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('corrections')
            .select('*, profiles(full_name, email), submissions(title)')
            .eq('status', filter)
            .order('created_at', { ascending: false });

        if (!error && data) setCorrections(data as Correction[]);
        setIsLoading(false);
    }

    async function handleAction(id: string, status: 'aceito' | 'rejeitado') {
        await supabase.from('corrections').update({ status }).eq('id', id);
        fetchCorrections();
    }

    const filters = [
        { key: 'pendente' as const, label: 'Pendentes', icon: 'pending_actions', color: 'text-brand-yellow' },
        { key: 'aceito' as const, label: 'Aceitas', icon: 'check_circle', color: 'text-[#0055ff]' },
        { key: 'rejeitado' as const, label: 'Rejeitadas', icon: 'cancel', color: 'text-brand-red' },
    ];

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Admin</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-[#0055ff]">Peer Review</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                    Sugestões de <span className="text-[#0055ff]">Correção</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Moderação de correções sugeridas pela comunidade.</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${filter === f.key
                            ? 'bg-[#0055ff] text-white border-[#0055ff] shadow-lg shadow-[#0055ff]/20'
                            : 'bg-white dark:bg-card-dark text-gray-500 border-gray-100 dark:border-gray-800 hover:border-[#0055ff]/30'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-[18px] ${filter === f.key ? 'text-white' : f.color}`}>{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl animate-spin text-[#0055ff] mb-4">progress_activity</span>
                    <p className="font-medium text-gray-500 animate-pulse">Carregando correções...</p>
                </div>
            ) : corrections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">spellcheck</span>
                    <p className="font-bold text-lg text-gray-700 dark:text-gray-300">Nenhuma correção {filter}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {corrections.map(c => (
                        <div key={c.id} className="bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-all">
                            {/* Header */}
                            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">
                                        Artigo: <span className="font-bold text-gray-700 dark:text-gray-300">{c.submissions?.title || c.submission_id}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        Por: <span className="font-bold">{c.profiles?.full_name || c.profiles?.email || c.user_id}</span>
                                        <span className="mx-2">•</span>
                                        {new Date(c.created_at).toLocaleDateString('pt-BR')} às {new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                {filter === 'pendente' && (
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleAction(c.id, 'aceito')}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-[#0055ff] text-white rounded-xl text-xs font-bold hover:bg-[#0044cc] transition-colors shadow-md"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                            Aceitar
                                        </button>
                                        <button
                                            onClick={() => handleAction(c.id, 'rejeitado')}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red/10 text-brand-red rounded-xl text-xs font-bold hover:bg-brand-red/20 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                            Rejeitar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Diff View */}
                            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-red flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">remove_circle</span>
                                        Original
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {c.original_text}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#0055ff] flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                        Sugestão
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {c.suggested_text}
                                    </div>
                                </div>
                            </div>

                            {/* Comment */}
                            {c.comment && (
                                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                                    <div className="bg-gray-50 dark:bg-background-dark/50 p-3 rounded-xl text-sm text-gray-500 dark:text-gray-400">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Comentário</span>
                                        {c.comment}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
