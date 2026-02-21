'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Pergunta {
    id: string;
    nome: string;
    email: string;
    pergunta: string;
    resposta: string | null;
    status: string;
    respondido_por: string | null;
    created_at: string;
}

export default function AdminPerguntasPage() {
    const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'pendente' | 'respondida'>('pendente');
    const [respondingTo, setRespondingTo] = useState<Pergunta | null>(null);
    const [resposta, setResposta] = useState('');
    const [respondidoPor, setRespondidoPor] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchPerguntas = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('perguntas')
            .select('*')
            .eq('status', filter)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching perguntas:', error);
        } else {
            setPerguntas(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPerguntas();
    }, [filter]);

    const handleResponder = (p: Pergunta) => {
        setRespondingTo(p);
        setResposta(p.resposta || '');
        setRespondidoPor(p.respondido_por || '');
    };

    const handleSaveResposta = async () => {
        if (!respondingTo || !resposta.trim() || !respondidoPor.trim()) return;
        setIsSaving(true);

        const { error } = await supabase
            .from('perguntas')
            .update({
                resposta: resposta.trim(),
                respondido_por: respondidoPor.trim(),
                status: 'respondida',
            })
            .eq('id', respondingTo.id);

        if (error) {
            alert('Erro ao salvar resposta: ' + error.message);
        } else {
            setRespondingTo(null);
            setResposta('');
            setRespondidoPor('');
            fetchPerguntas();
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta pergunta?')) return;

        const { error } = await supabase.from('perguntas').delete().eq('id', id);
        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchPerguntas();
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-blue">Perguntas</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Pergunte a um Cientista</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie as perguntas da comunidade e adicione respostas dos cientistas.</p>
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setFilter('pendente')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'pendente'
                                ? 'bg-white dark:bg-gray-700 text-brand-yellow shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            ⏳ Pendentes
                        </button>
                        <button
                            onClick={() => setFilter('respondida')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'respondida'
                                ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            ✅ Respondidas
                        </button>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl animate-spin text-brand-blue mb-4">progress_activity</span>
                    <p className="font-medium animate-pulse">Carregando perguntas...</p>
                </div>
            ) : perguntas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">inbox</span>
                    <p className="font-medium">Nenhuma pergunta {filter === 'pendente' ? 'pendente' : 'respondida'}.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {perguntas.map((p) => (
                        <div key={p.id} className="bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-gray-900 dark:text-white">{p.nome}</span>
                                        <span className="text-xs text-gray-400">({p.email})</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">{p.pergunta}</p>

                                    {p.resposta && (
                                        <div className="mt-3 p-3 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-lg border-l-4 border-brand-blue">
                                            <span className="text-xs font-bold text-brand-blue">Resposta de {p.respondido_por}:</span>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 whitespace-pre-line">{p.resposta}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleResponder(p)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-xs font-bold hover:bg-brand-blue hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">{p.status === 'respondida' ? 'edit' : 'reply'}</span>
                                        {p.status === 'respondida' ? 'Editar' : 'Responder'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="inline-flex items-center gap-1 px-2 py-1.5 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Respond Modal */}
            {respondingTo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-form-dark rounded-2xl w-full max-w-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-form-dark/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-blue">reply</span>
                                Responder Pergunta
                            </h2>
                            <button onClick={() => setRespondingTo(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5">
                            {/* Original Question */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pergunta de {respondingTo.nome}:</span>
                                <p className="text-gray-800 dark:text-gray-200 mt-1">{respondingTo.pergunta}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Nome do Cientista *</label>
                                <input
                                    type="text"
                                    value={respondidoPor}
                                    onChange={e => setRespondidoPor(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-form-dark text-gray-900 dark:text-white py-2.5 px-3 focus:ring-brand-blue focus:border-brand-blue"
                                    placeholder="Prof. Dr. João Silva"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Resposta *</label>
                                <textarea
                                    rows={6}
                                    value={resposta}
                                    onChange={e => setResposta(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-form-dark text-gray-900 dark:text-white py-2.5 px-3 focus:ring-brand-blue focus:border-brand-blue resize-none"
                                    placeholder="Escreva a resposta do cientista..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 dark:bg-form-dark/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setRespondingTo(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveResposta}
                                disabled={isSaving || !resposta.trim() || !respondidoPor.trim()}
                                className="px-5 py-2 text-sm font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? 'Salvando...' : 'Publicar Resposta'}
                                {!isSaving && <span className="material-symbols-outlined text-[16px]">send</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
