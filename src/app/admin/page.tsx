'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Counts {
    pendentes: number;
    aprovados: number;
    rejeitados: number;
}

export default function AdminDashboardOverview() {
    const [counts, setCounts] = useState<Counts>({ pendentes: 0, aprovados: 0, rejeitados: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            setIsLoading(true);

            const [pendentesRes, aprovadosRes, rejeitadosRes] = await Promise.all([
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'aprovado'),
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejeitado'),
            ]);

            setCounts({
                pendentes: pendentesRes.count || 0,
                aprovados: aprovadosRes.count || 0,
                rejeitados: rejeitadosRes.count || 0,
            });

            setIsLoading(false);
        }

        fetchCounts();
    }, []);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Dashboard</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Visão Geral</span>
            </div>

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Visão Geral</h1>
                <p className="text-slate-500 dark:text-slate-400">Acompanhe as estatísticas gerais de submissões do Arquivo Lab-Div.</p>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-slate-500">
                    Carregando estatísticas...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">

                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Aguardando Avaliação</span>
                            <div className="h-10 w-10 flexItems-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex">
                                <span className="material-symbols-outlined m-auto">assignment</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{counts.pendentes}</span>
                            <span className="text-sm text-slate-500 mt-1">Submissões Pendentes</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Públicos</span>
                            <div className="h-10 w-10 flexItems-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex">
                                <span className="material-symbols-outlined m-auto">check_circle</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{counts.aprovados}</span>
                            <span className="text-sm text-slate-500 mt-1">Submissões Aprovadas</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Arquivados</span>
                            <div className="h-10 w-10 flexItems-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex">
                                <span className="material-symbols-outlined m-auto">cancel</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{counts.rejeitados}</span>
                            <span className="text-sm text-slate-500 mt-1">Submissões Rejeitadas</span>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
