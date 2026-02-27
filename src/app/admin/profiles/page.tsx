'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    institute: string;
    role: string;
    review_status: string;
    bio: string;
    is_usp_member: boolean;
    created_at: string;
    usp_status?: string;
    entrance_year?: number;
    artistic_interests?: string[];
    education_level?: string;
    major?: string;
}

export default function ProfileApprovalPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfiles = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('review_status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Erro ao carregar perfis.");
        } else {
            setProfiles(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('profiles')
            .update({ review_status: status })
            .eq('id', id);

        if (error) {
            toast.error("Erro ao processar ação.");
        } else {
            toast.success(status === 'approved' ? "Perfil aprovado!" : "Perfil rejeitado.");
            setProfiles(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                    Aprovação de <span className="text-[#0055ff]">Perfis</span>
                </h1>
                <p className="text-gray-400 mt-1">Revise os novos cadastros para garantir a integridade da rede.</p>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <span className="material-symbols-outlined text-4xl animate-spin text-[#0055ff]">progress_activity</span>
                </div>
            ) : profiles.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                    <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">person_off</span>
                    <p className="text-gray-500 font-medium">Nenhum perfil pendente para revisão.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {profiles.map(profile => (
                        <div key={profile.id} className="bg-card-dark border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white">{profile.full_name || 'Sem Nome'}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${profile.is_usp_member ? 'bg-brand-blue/20 text-brand-blue' : 'bg-gray-800 text-gray-400'}`}>
                                            {profile.is_usp_member ? 'Membro USP' : 'Curioso'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Informações Básicas</p>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="flex items-center gap-2 text-gray-300">
                                                    <span className="material-symbols-outlined text-sm text-gray-500">mail</span>
                                                    {profile.email}
                                                </span>
                                                <span className="flex items-center gap-2 text-gray-300">
                                                    <span className="material-symbols-outlined text-sm text-gray-500">apartment</span>
                                                    {profile.institute || 'N/A'}
                                                </span>
                                                {profile.is_usp_member && (
                                                    <>
                                                        <span className="flex items-center gap-2 text-gray-300">
                                                            <span className="material-symbols-outlined text-sm text-gray-500">school</span>
                                                            {profile.usp_status} ({profile.entrance_year})
                                                        </span>
                                                    </>
                                                )}
                                                {!profile.is_usp_member && (
                                                    <>
                                                        <span className="flex items-center gap-2 text-gray-300">
                                                            <span className="material-symbols-outlined text-sm text-gray-500">history_edu</span>
                                                            {profile.education_level} {profile.major ? `- ${profile.major}` : ''}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Lado Artístico / Interesses</p>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.artistic_interests?.length ? (
                                                    profile.artistic_interests.map(interest => (
                                                        <span key={interest} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-400">
                                                            {interest}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-600 italic text-[10px]">Nenhum interesse informado</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Biografia / Apresentação</p>
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {profile.bio || 'Sem biografia fornecida.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                                    <button
                                        onClick={() => handleAction(profile.id, 'approved')}
                                        className="flex-1 md:w-40 py-3 rounded-2xl bg-[#0055ff] text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">check</span>
                                        Aprovar
                                    </button>
                                    <button
                                        onClick={() => handleAction(profile.id, 'rejected')}
                                        className="flex-1 md:w-40 py-3 rounded-2xl bg-brand-red/10 text-brand-red font-bold text-sm hover:bg-brand-red/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                        Rejeitar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
