'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

interface Pergunta {
    id: string;
    nome: string;
    pergunta: string;
    resposta: string;
    respondido_por: string;
    created_at: string;
}

export default function PerguntasPage() {
    const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [perguntaText, setPerguntaText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        async function fetchPerguntas() {
            const { data, error } = await supabase
                .from('perguntas')
                .select('id, nome, pergunta, resposta, respondido_por, created_at')
                .eq('status', 'respondida')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching perguntas:', error);
            } else {
                setPerguntas(data || []);
            }
            setIsLoading(false);
        }
        fetchPerguntas();
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');

        if (!nome.trim() || !email.trim() || !perguntaText.trim()) {
            setSubmitError('Preencha todos os campos obrigatórios.');
            setIsSubmitting(false);
            return;
        }

        const { error } = await supabase.from('perguntas').insert([{
            nome: nome.trim(),
            email: email.trim(),
            pergunta: perguntaText.trim(),
            status: 'pendente',
        }]);

        if (error) {
            setSubmitError('Erro ao enviar pergunta. Tente novamente.');
            console.error(error);
        } else {
            setSubmitSuccess(true);
            setNome('');
            setEmail('');
            setPerguntaText('');
            setTimeout(() => {
                setShowModal(false);
                setSubmitSuccess(false);
            }, 2500);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-200 dark:border-gray-800 pb-6 gap-6">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wide mb-4">
                            <span className="material-symbols-outlined text-[14px]">quiz</span>
                            Curiosidade Científica
                        </div>
                        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 text-gray-900 dark:text-white">
                            Pergunte a um <span className="text-brand-blue">Cientista</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Tem uma dúvida sobre ciência? Envie sua pergunta e nossos pesquisadores do IF-USP responderão!
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="group relative overflow-hidden rounded-xl bg-brand-blue hover:bg-brand-darkBlue text-white px-6 py-3.5 font-bold shadow-lg shadow-brand-blue/25 transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">edit</span>
                        Enviar Pergunta
                    </button>
                </div>

                {/* Q&A Feed */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="material-symbols-outlined text-4xl animate-spin text-brand-blue mb-4">progress_activity</span>
                        <p className="font-medium animate-pulse">Carregando perguntas respondidas...</p>
                    </div>
                ) : perguntas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">forum</span>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Nenhuma pergunta respondida ainda</h3>
                        <p className="text-gray-500 mt-2">Seja o primeiro a perguntar! 🧪</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {perguntas.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Question */}
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 font-bold text-sm uppercase">
                                            {p.nome.substring(0, 2)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm">{p.nome}</span>
                                                <span className="text-xs text-gray-400">perguntou</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{p.pergunta}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Answer */}
                                <div className="p-6 bg-brand-blue/5 dark:bg-brand-blue/10">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-xl">science</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm">{p.respondido_por || 'Cientista IF-USP'}</span>
                                                <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-bold uppercase tracking-wider">Resposta</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{p.resposta}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            {/* Submit Question Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !isSubmitting && setShowModal(false)}>
                    <div
                        className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-form-dark/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-blue">quiz</span>
                                Enviar sua Pergunta
                            </h2>
                            <button onClick={() => !isSubmitting && setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {submitSuccess ? (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pergunta enviada! 🎉</h3>
                                <p className="text-gray-500">Assim que um cientista responder, ela aparecerá no feed.</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-5">
                                {submitError && (
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 border border-red-200 dark:border-red-800">
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        {submitError}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Seu Nome *</label>
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                                        placeholder="Ex: Maria Silva"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">E-mail *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Sua Pergunta *</label>
                                    <textarea
                                        rows={4}
                                        value={perguntaText}
                                        onChange={e => setPerguntaText(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all resize-none"
                                        placeholder="O que você gostaria de perguntar a um cientista?"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-brand-blue hover:bg-brand-darkBlue rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                Enviar Pergunta
                                                <span className="material-symbols-outlined text-[18px]">send</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
