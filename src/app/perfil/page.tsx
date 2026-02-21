'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchUserSubmissions } from '@/app/actions/submissions';
import { MediaCardProps } from '@/components/MediaCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'perfil';

    const [user, setUser] = useState<any>(null);
    const [submissions, setSubmissions] = useState<MediaCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);

            const userSubs = await fetchUserSubmissions(session.user.id);
            setSubmissions(userSubs);
            setIsLoading(false);
        };
        loadData();
    }, [router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const feedbacks = submissions.filter(s => s.admin_feedback);
    const approvedCount = submissions.filter(s => s.status === 'aprovado').length;

    const badges = [
        { id: 'pioneiro', label: 'Pioneiro', icon: 'auto_awesome', requirement: 1, color: 'bg-blue-500', description: 'Enviou sua primeira contribuição aprovada.' },
        { id: 'frequente', label: 'Colaborador Frequente', icon: 'verified', requirement: 3, color: 'bg-green-500', description: 'Três ou mais contribuições aprovadas no acervo.' },
        { id: 'mestre', label: 'Mestre do Acervo', icon: 'military_tech', requirement: 10, color: 'bg-brand-yellow', description: 'Referência em compartilhamento científico (10+ publicações).' },
    ];

    const unlockedBadges = badges.filter(b => approvedCount >= b.requirement);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans dark:bg-background-dark/30">
            <Header />
            <main className="flex-1 pt-12 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <div className="bg-white dark:bg-card-dark rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-brand-blue/10 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-5xl text-brand-blue">person</span>
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 bg-brand-yellow text-black p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
                                    <span className="material-symbols-outlined text-sm filled">stars</span>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{user.user_metadata?.full_name || 'Usuário'}</h1>
                                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                                    <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full uppercase tracking-wider">
                                        {submissions.length} Publicações
                                    </span>
                                    <span className="px-3 py-1 bg-brand-yellow/20 text-brand-yellow-dark dark:text-brand-yellow text-xs font-bold rounded-full uppercase tracking-wider">
                                        {unlockedBadges.length} Selos Conquistados
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-white dark:bg-card-dark p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        {[
                            { id: 'perfil', label: 'Início', icon: 'grid_view' },
                            { id: 'submissoes', label: 'Minhas Submissões', icon: 'description' },
                            { id: 'retornos', label: 'Meus Retornos', icon: 'feedback' },
                            { id: 'selos', label: 'Meus Selos', icon: 'military_tech' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/25 scale-105'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in duration-500">
                        {activeTab === 'perfil' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-brand-blue">history</span>
                                        Atividade Recente
                                    </h2>
                                    {submissions.length > 0 ? (
                                        <div className="space-y-4">
                                            {submissions.slice(0, 3).map(sub => (
                                                <div key={sub.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-background-dark/50">
                                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                                                        {sub.mediaType === 'image' ? (
                                                            <img src={Array.isArray(sub.mediaUrl) ? sub.mediaUrl[0] : sub.mediaUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-gray-400">article</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm truncate">{sub.title}</p>
                                                        <p className="text-[10px] uppercase text-gray-400 font-bold">{sub.status}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">Nenhuma atividade registrada ainda.</p>
                                    )}
                                </div>

                                <div className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-brand-yellow">military_tech</span>
                                        Progresso de Selos
                                    </h2>
                                    <div className="space-y-4 text-center py-4">
                                        <div className="inline-block p-4 rounded-full bg-brand-yellow/10 mb-2">
                                            <span className="material-symbols-outlined text-4xl text-brand-yellow">{unlockedBadges.length > 0 ? 'emoji_events' : 'lock'}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {unlockedBadges.length > 0 ? `Parabéns! Você já conquistou ${unlockedBadges.length} selo(s).` : 'Continue contribuindo para desbloquear seu primeiro selo!'}
                                        </p>
                                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-brand-yellow h-full transition-all duration-1000"
                                                style={{ width: `${Math.min((approvedCount / 3) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{approvedCount} / 3 para o selo Frequente</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'submissoes' && (
                            <div className="space-y-4">
                                {submissions.length > 0 ? (
                                    submissions.map(sub => (
                                        <div key={sub.id} className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6">
                                            <div className="w-full md:w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                                                {sub.mediaType === 'image' ? (
                                                    <img src={Array.isArray(sub.mediaUrl) ? sub.mediaUrl[0] : sub.mediaUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-3xl text-gray-400">article</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <h3 className="text-lg font-bold">{sub.title}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                                                        sub.status === 'rejeitado' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {sub.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-2">{sub.description}</p>
                                                <div className="pt-2 flex gap-4 text-[10px] text-gray-400 font-bold uppercase">
                                                    <span>{sub.category}</span>
                                                    <span>{new Date(sub.created_at || '').toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white dark:bg-card-dark rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 tracking-tighter">post_add</span>
                                        <p className="text-gray-500 font-medium">Você ainda não enviou nenhuma contribuição.</p>
                                        <button onClick={() => router.push('/enviar')} className="mt-4 text-brand-blue font-bold hover:underline">Começar agora</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'retornos' && (
                            <div className="space-y-4">
                                {feedbacks.length > 0 ? (
                                    feedbacks.map(sub => (
                                        <div key={sub.id} className="bg-brand-blue/5 dark:bg-brand-blue/10 p-8 rounded-3xl border border-brand-blue/10 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <span className="material-symbols-outlined text-8xl rotate-12">forum</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center">
                                                        <span className="material-symbols-outlined">support_agent</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-brand-blue font-bold uppercase tracking-widest">Feedback Administrativo</p>
                                                        <h3 className="font-bold text-gray-900 dark:text-white">Sobre: {sub.title}</h3>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-brand-blue/10 italic text-gray-700 dark:text-gray-300">
                                                    "{sub.admin_feedback}"
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white dark:bg-card-dark rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">mail</span>
                                        <p className="text-gray-500 font-medium">Nenhum retorno recebido até o momento.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'selos' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {badges.map(badge => {
                                    const isUnlocked = approvedCount >= badge.requirement;
                                    return (
                                        <div
                                            key={badge.id}
                                            className={`group relative overflow-hidden bg-white dark:bg-card-dark p-6 rounded-3xl border transition-all ${isUnlocked
                                                ? 'border-brand-blue/20 dark:border-brand-blue/30 shadow-lg scale-100'
                                                : 'border-gray-100 dark:border-gray-800 opacity-50 grayscale scale-95'
                                                }`}
                                        >
                                            <div className={`p-4 rounded-2xl inline-flex mb-4 transition-transform group-hover:scale-110 ${isUnlocked ? `${badge.color} text-white` : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-1">{badge.label}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{badge.description}</p>
                                            {!isUnlocked && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                                        Progresso: {approvedCount} / {badge.requirement} submissões
                                                    </p>
                                                </div>
                                            )}
                                            {isUnlocked && (
                                                <div className="absolute top-4 right-4 text-green-500">
                                                    <span className="material-symbols-outlined filled text-xl">check_circle</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
