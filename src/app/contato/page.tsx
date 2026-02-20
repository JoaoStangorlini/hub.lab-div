'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [message, setMessage] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setAlertMsg(null);

        try {
            if (!name || !email || !message) {
                throw new Error("Por favor, preencha os campos obrigatórios (Nome, E-mail e Mensagem).");
            }

            const { error } = await supabase.from('contatos').insert([{
                name,
                email,
                whatsapp,
                message
            }]);

            if (error) throw error;

            setAlertMsg({ type: 'success', text: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' });

            // Clear form
            setName('');
            setEmail('');
            setWhatsapp('');
            setMessage('');

        } catch (err: any) {
            console.error(err);
            setAlertMsg({ type: 'error', text: err.message || 'Ocorreu um erro ao enviar sua mensagem.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
            <Header />

            <main className="flex-grow flex flex-col pb-20">
                <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 pt-16 pb-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20 mb-6">
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            Fale Conosco
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl mb-4 dark:text-white">
                            Entre em Contato
                        </h1>
                        <p className="text-lg text-text-muted dark:text-gray-300 max-w-2xl mx-auto">
                            Dúvidas, sugestões ou interesse em divulgar algum material específico? Nossa equipe está pronta para ajudar.
                        </p>
                    </div>
                </section>

                <section className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
                        {alertMsg && (
                            <div className={`mb-8 p-4 rounded-xl border font-medium text-sm flex items-center gap-3 ${alertMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                }`}>
                                <span className="material-symbols-outlined">
                                    {alertMsg.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {alertMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="name">
                                        Nome Completo *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3.5 px-4 text-text-main ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm shadow-sm dark:bg-gray-900/50 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 transition-all font-medium"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                                        E-mail *
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3.5 px-4 text-text-main ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm shadow-sm dark:bg-gray-900/50 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 transition-all font-medium"
                                        placeholder="seu@email.usp.br"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="whatsapp">
                                    WhatsApp <span className="text-gray-400 font-normal">(Opcional)</span>
                                </label>
                                <input
                                    id="whatsapp"
                                    type="tel"
                                    value={whatsapp}
                                    onChange={e => setWhatsapp(e.target.value)}
                                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-text-main ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm shadow-sm dark:bg-gray-900/50 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 transition-all font-medium"
                                    placeholder="(11) 90000-0000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="message">
                                    Mensagem *
                                </label>
                                <textarea
                                    id="message"
                                    required
                                    rows={5}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-text-main ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm shadow-sm dark:bg-gray-900/50 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 transition-all font-medium resize-none"
                                    placeholder="Como podemos te ajudar hoje?"
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
                                    {!isLoading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
