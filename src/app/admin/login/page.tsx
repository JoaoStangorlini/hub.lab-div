'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/app/actions/auth';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
        >
            {pending ? 'Verificando...' : 'Entrar no Painel'}
            {!pending && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">login</span>}
        </button>
    );
}

export default function LoginPage() {
    const [errorMsg, setErrorMsg] = useState('');

    async function clientAction(formData: FormData) {
        const result = await login(formData);
        if (result?.error) {
            setErrorMsg(result.error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-form-dark font-display px-4">
            <div className="w-full max-w-[90vw] sm:max-w-md bg-white dark:bg-form-dark rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 mb-6 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                        Acesso Restrito
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                        Por favor, insira a senha de administrador para gerir as submissões.
                    </p>

                    <form action={clientAction} className="w-full space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                                    lock
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Senha de acesso"
                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-form-dark/50 border rounded-xl focus:ring-2 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white ${errorMsg
                                        ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/40'
                                        : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20'
                                        }`}
                                />
                            </div>

                            {errorMsg && (
                                <div className="text-red-500 dark:text-red-400 text-sm font-medium animate-pulse text-left pl-2 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px]">error</span>
                                    {errorMsg}
                                </div>
                            )}
                        </div>

                        <SubmitButton />
                    </form>
                </div>

                <div className="bg-slate-50 dark:bg-form-dark/50 p-4 border-t border-slate-100 dark:border-slate-700 text-center">
                    <a href="/" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Voltar ao site público
                    </a>
                </div>
            </div>
        </div>
    );
}
