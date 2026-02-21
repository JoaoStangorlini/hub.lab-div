'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Reproduction {
    id: string;
    submission_id: string;
    user_id: string;
    text_content: string;
    title?: string;
    media_url?: string;
    status: 'pendente' | 'aprovado' | 'rejeitado';
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
        email: string;
    };
    submissions?: {
        title: string;
    };
}

function ReproductionCard({ rep, onAction }: { rep: Reproduction; onAction: (action: 'approve' | 'reject' | 'delete', rep: Reproduction) => void }) {
    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-brand-blue/30 transition-colors">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center overflow-hidden border border-brand-blue/20 shrink-0">
                            {rep.profiles?.avatar_url ? (
                                <img src={rep.profiles.avatar_url} alt={rep.profiles.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-brand-blue">person</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{rep.profiles?.full_name || 'Participante'}</h3>
                            <p className="text-[10px] text-gray-500 uppercase font-semibold">
                                {new Date(rep.created_at).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-background-dark/50 p-3 rounded-xl space-y-2">
                        {rep.title && <p className="text-xs font-black text-brand-blue uppercase tracking-wider">{rep.title}</p>}
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">&quot;{rep.text_content}&quot;</p>
                    </div>
                    {rep.media_url && (
                        <a href={rep.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline">
                            <span className="material-symbols-outlined text-base">visibility</span>
                            Ver Mídia Anexada
                        </a>
                    )}
                    <Link
                        href={`/arquivo/${rep.submission_id}`}
                        target="_blank"
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-brand-blue transition-colors group/link"
                    >
                        <span className="material-symbols-outlined text-[16px]">link</span>
                        <span>Em: <span className="text-brand-blue font-medium group-hover/link:underline">{rep.submissions?.title || 'Submissão não encontrada'}</span></span>
                    </Link>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                    {rep.status === 'pendente' && (
                        <>
                            <button onClick={() => onAction('approve', rep)} className="flex-1 px-4 py-2 bg-brand-blue hover:bg-brand-blue/80 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">check</span> Aprovar
                            </button>
                            <button onClick={() => onAction('reject', rep)} className="flex-1 px-4 py-2 bg-brand-red hover:bg-brand-red/80 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">close</span> Negar
                            </button>
                        </>
                    )}
                    {rep.status === 'aprovado' && (
                        <button onClick={() => onAction('reject', rep)} className="flex-1 px-4 py-2 border border-brand-red text-brand-red hover:bg-brand-red hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">block</span> Remover
                        </button>
                    )}
                    {rep.status === 'rejeitado' && (
                        <button onClick={() => onAction('approve', rep)} className="flex-1 px-4 py-2 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span> Recuperar
                        </button>
                    )}
                    <button onClick={() => onAction('delete', rep)} className="p-2 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors" title="Excluir permanentemente">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminReproducoesPage() {
    const [pendentes, setPendentes] = useState<Reproduction[]>([]);
    const [aprovados, setAprovados] = useState<Reproduction[]>([]);
    const [rejeitados, setRejeitados] = useState<Reproduction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAll = async () => {
        setIsLoading(true);
        const [pRes, aRes, rRes] = await Promise.all([
            supabase.from('reproductions').select('*, profiles(full_name, avatar_url, email), submissions(title)').eq('status', 'pendente').order('created_at', { ascending: false }),
            supabase.from('reproductions').select('*, profiles(full_name, avatar_url, email), submissions(title)').eq('status', 'aprovado').order('created_at', { ascending: false }),
            supabase.from('reproductions').select('*, profiles(full_name, avatar_url, email), submissions(title)').eq('status', 'rejeitado').order('created_at', { ascending: false }),
        ]);
        setPendentes((pRes.data as any) || []);
        setAprovados((aRes.data as any) || []);
        setRejeitados((rRes.data as any) || []);
        setIsLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAction = async (action: 'approve' | 'reject' | 'delete', rep: Reproduction) => {
        try {
            if (action === 'approve') {
                const { error } = await supabase.from('reproductions').update({ status: 'aprovado' }).eq('id', rep.id);
                if (error) throw error;
            } else if (action === 'reject') {
                const { error } = await supabase.from('reproductions').update({ status: 'rejeitado' }).eq('id', rep.id);
                if (error) throw error;
            } else if (action === 'delete') {
                if (!confirm('Deseja excluir permanentemente esta reprodução?')) return;
                const { error } = await supabase.from('reproductions').delete().eq('id', rep.id);
                if (error) throw error;
            }
            fetchAll();
        } catch (error: any) {
            alert('Erro ao processar ação: ' + (error?.message || 'Erro desconhecido'));
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-blue">Reproduções</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Moderação de Reproduções</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os envios da seção &quot;Eu Reproduzi!&quot; dos materiais do arquivo.</p>
            </div>

            {isLoading ? (
                <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl animate-spin text-brand-blue mb-4">progress_activity</span>
                    <p className="text-gray-500 animate-pulse">Carregando reproduções...</p>
                </div>
            ) : (
                <>
                    {/* Pendentes Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-brand-yellow/10 text-brand-yellow">
                                <span className="material-symbols-outlined">pending_actions</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pendentes</h2>
                                <p className="text-xs text-gray-500">{pendentes.length} reprodução(ões) aguardando moderação</p>
                            </div>
                        </div>
                        {pendentes.length === 0 ? (
                            <div className="text-center py-8 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                                <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">cameraswitch</span>
                                <p className="text-gray-500 text-sm mt-2">Nenhuma reprodução pendente.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">{pendentes.map(r => <ReproductionCard key={r.id} rep={r} onAction={handleAction} />)}</div>
                        )}
                    </section>

                    {/* Arquivados Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                                <span className="material-symbols-outlined">block</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Arquivados</h2>
                                <p className="text-xs text-gray-500">{rejeitados.length} reprodução(ões) não aprovadas</p>
                            </div>
                        </div>
                        {rejeitados.length === 0 ? (
                            <div className="text-center py-8 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                                <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">inventory_2</span>
                                <p className="text-gray-500 text-sm mt-2">Nenhuma reprodução arquivada.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">{rejeitados.map(r => <ReproductionCard key={r.id} rep={r} onAction={handleAction} />)}</div>
                        )}
                    </section>

                    {/* Aprovados Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Aprovados</h2>
                                <p className="text-xs text-gray-500">{aprovados.length} reprodução(ões) publicadas</p>
                            </div>
                        </div>
                        {aprovados.length === 0 ? (
                            <div className="text-center py-8 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                                <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">cameraswitch</span>
                                <p className="text-gray-500 text-sm mt-2">Nenhuma reprodução aprovada.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">{aprovados.map(r => <ReproductionCard key={r.id} rep={r} onAction={handleAction} />)}</div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
