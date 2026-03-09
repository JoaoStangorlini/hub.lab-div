'use client';

import { useState, useEffect } from 'react';
import { fetchFreshmenForAdoption } from '@/app/actions/profiles';
import { Avatar } from '@/components/ui/Avatar';
import { ShieldCheck, Mail, Phone, ExternalLink, Loader2, UserPlus, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Freshman } from '@/types';

interface MatchAcademicoTabProps {
    isMentor: boolean;
}

export function MatchAcademicoTab({ isMentor }: MatchAcademicoTabProps) {
    const [freshmen, setFreshmen] = useState<Freshman[]>([]);
    const [myAdoptions, setMyAdoptions] = useState<Freshman[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subTab, setSubTab] = useState<'available' | 'mine'>('available');

    const loadData = async () => {
        setIsLoading(true);
        if (subTab === 'available') {
            const res = await fetchFreshmenForAdoption();
            if (res.success && res.data) {
                setFreshmen(res.data);
            } else if (res.error) {
                toast.error(res.error);
            }
        } else {
            const { fetchMyAdoptedFreshmen } = await import('@/app/actions/profiles');
            const res = await fetchMyAdoptedFreshmen();
            if (res.success && res.data) {
                setMyAdoptions(res.data);
            } else if (res.error) {
                toast.error(res.error);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isMentor) {
            loadData();
        } else {
            setIsLoading(false);
        }
    }, [isMentor, subTab]);

    if (!isMentor) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 mb-6 rounded-full border-2 border-brand-blue/20 flex items-center justify-center bg-brand-blue/5">
                    <ShieldCheck className="w-12 h-12 text-brand-blue/40" />
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Recurso para Mentores</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium italic">
                    Esta aba é exclusiva para veteranos que se disponibilizaram a adotar bixos.
                    Se você é um veterano e quer ajudar, ative a opção no seu perfil!
                </p>
                <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl max-w-md mx-auto flex items-start gap-3">
                    <Info className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
                    <p className="text-[11px] text-left font-bold text-brand-yellow uppercase tracking-tight leading-normal">
                        Bixos buscando adoção não aparecem aqui para outros bixos por questões de privacidade e foco pedagógico da rede IFUSP Ciência.
                    </p>
                </div>
            </div>
        );
    }

    const displayData = subTab === 'available' ? freshmen : myAdoptions;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">Match Acadêmico</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Conecte-se com a nova geração do IFUSP</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/5">
                    <button
                        onClick={() => setSubTab('available')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'available'
                            ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Disponíveis
                    </button>
                    <button
                        onClick={() => setSubTab('mine')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'mine'
                            ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Meus Bixos
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                </div>
            ) : displayData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 mb-6 rounded-full border-2 border-gray-200 dark:border-white/10 flex items-center justify-center">
                        <UserPlus className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                        {subTab === 'available' ? 'Nenhum bixo na fila' : 'Nenhuma adoção aprovada'}
                    </h2>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto font-medium italic">
                        {subTab === 'available'
                            ? 'No momento, não há bixos marcados como "buscando mentor".'
                            : 'Suas adoções aparecerão aqui assim que forem validadas pelo ADM.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayData.map((freshman) => (
                        <div
                            key={freshman.id}
                            className={`glass-card p-6 rounded-[32px] group hover:scale-[1.02] transition-all duration-300 border ${subTab === 'mine' ? 'border-brand-blue/30 bg-brand-blue/5' : 'border-gray-100 dark:border-white/5'
                                }`}
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <Avatar
                                    src={freshman.avatar_url}
                                    name={freshman.use_nickname ? freshman.username : freshman.full_name}
                                    size="md"
                                    xp={freshman.xp}
                                    level={freshman.level}
                                    isLabDiv={freshman.is_labdiv}
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-display font-bold text-gray-900 dark:text-white truncate">
                                        {freshman.use_nickname ? freshman.username : freshman.full_name}
                                    </h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {freshman.course && (
                                            <span className="px-2 py-0.5 bg-brand-blue/5 text-brand-blue text-[9px] font-black rounded uppercase tracking-tighter">
                                                {freshman.course}
                                            </span>
                                        )}
                                        {freshman.entrance_year && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[9px] font-black rounded uppercase tracking-tighter">
                                                Ingresso: {freshman.entrance_year}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {freshman.bio && (
                                <p className="text-[13px] text-gray-600 dark:text-gray-400 italic mb-6 line-clamp-3 leading-relaxed">
                                    "{freshman.bio}"
                                </p>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-white/5">
                                {freshman.whatsapp && (
                                    <a
                                        href={`https://wa.me/${freshman.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/90 transition-all shadow-sm"
                                    >
                                        <Phone className="w-3 h-3" />
                                        WhatsApp
                                    </a>
                                )}
                                {freshman.email && (
                                    <button
                                        onClick={() => {
                                            if (freshman.email) {
                                                navigator.clipboard.writeText(freshman.email);
                                                toast.success('E-mail copiado!');
                                                window.location.href = `mailto:${freshman.email}`;
                                            }
                                        }}
                                        className="flex items-center justify-center p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all shadow-sm"
                                        title="Enviar E-mail (e copiar endereço)"
                                    >
                                        <Mail className="w-4 h-4" />
                                    </button>
                                )}
                                <a
                                    href={`/emaranhamento?user=${freshman.id}`}
                                    className="flex items-center justify-center p-2.5 bg-brand-yellow/10 text-brand-yellow rounded-2xl hover:bg-brand-yellow/20 transition-all shadow-sm"
                                    title="Emaranhar (Mensagem Direta)"
                                >
                                    <span className="material-symbols-outlined text-lg">hub</span>
                                </a>
                                <a
                                    href={`/lab?user=${freshman.id}`}
                                    className="flex items-center justify-center p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all shadow-sm"
                                    title="Ver Perfil"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
