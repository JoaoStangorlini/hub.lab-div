import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { supabase } from '@/lib/supabase';

export function CategoryStep() {
    const { category: selectedCategory, setCategory, setStep } = useSubmissionStore();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoadingRole, setIsLoadingRole] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUserRole(profile.role);
                }
            }
            setIsLoadingRole(false);
        };
        fetchUserRole();
    }, []);

    const handleNext = () => {
        if (selectedCategory) {
            const isRestricted = selectedCategory === 'Lab-Div' && !['admin', 'labdiv', 'moderador', 'labdiv adm'].includes(userRole || '');
            if (!isRestricted) {
                setStep('format');
            }
        }
    };

    if (isLoadingRole) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Sincronizando Permissões...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Expanded Guide Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-white dark:bg-card-dark rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-brand-blue/5"
            >
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <div className="relative p-8 md:p-10 flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-brand-yellow/10 rounded-3xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-4xl text-brand-yellow">auto_stories</span>
                    </div>

                    <div className="flex-grow space-y-3 text-center lg:text-left">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Não sabe qual <span className="text-brand-blue">categoria</span> escolher?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                            A categorização correta é fundamental para que seu material seja encontrado por pesquisadores e alunos.
                            Cada categoria possui requisitos específicos de metadados e formatos recomendados.
                            Confira o <span className="font-bold text-gray-900 dark:text-white">Guia de Boas Práticas</span> para detalhes sobre iluminação, enquadramento e descrição técnica.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Metadados Precisos
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-red bg-brand-red/5 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Qualidade Técnica
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-yellow bg-brand-yellow/5 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Contexto Acadêmico
                            </div>
                        </div>
                    </div>

                    <a
                        href="/wiki/guia-de-boas-praticas"
                        target="_blank"
                        className="group relative overflow-hidden px-8 py-5 rounded-2xl font-bold shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 shrink-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-100 transition-opacity"></div>
                        <span className="relative z-10 text-white flex items-center gap-2">
                            Abrir Guia Detalhado
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                        </span>
                    </a>
                </div>
            </motion.div>

            {/* Grid de Categorias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((cat, idx) => {
                    const isSelected = selectedCategory === cat.id;
                    const isRestricted = cat.id === 'Lab-Div' && !['admin', 'labdiv', 'moderador', 'labdiv adm'].includes(userRole || '');

                    return (
                        <motion.button
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{
                                opacity: 0,
                                x: (idx % 2 === 0) ? -500 : 500,
                                transition: { duration: 0.5, ease: "easeInOut" }
                            }}
                            transition={{ delay: idx * 0.05 }}
                            disabled={isRestricted}
                            onClick={() => setCategory(cat.id)}
                            className={`text-left p-6 rounded-3xl border-2 group relative overflow-hidden h-full flex flex-col transition-all ${isRestricted ? 'opacity-40 grayscale cursor-not-allowed' : ''} ${isSelected
                                ? `border-${cat.color} bg-${cat.color}/5 shadow-lg shadow-${cat.color}/10`
                                : `border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark hover:border-${cat.color}/30`
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${isSelected
                                ? `bg-${cat.color} text-white shadow-lg shadow-${cat.color}/20`
                                : `bg-${cat.color}/10 text-${cat.color}`
                                }`}>
                                <span className="material-symbols-outlined">{isRestricted ? 'lock' : cat.icon}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white transition-colors group-hover:text-gray-900 dark:group-hover:text-white">{cat.title}</h4>
                                {isRestricted && (
                                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[8px] font-black uppercase tracking-widest text-gray-400 border border-white/10">
                                        Restrito
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">{cat.description}</p>
                            <div className={`pt-4 border-t ${isSelected ? `border-${cat.color}/20` : 'border-gray-50 dark:border-gray-800'}`}>
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? `text-${cat.color}` : 'text-gray-400'}`}>Exemplos:</span>
                                <p className={`text-[11px] mt-1 italic ${isSelected ? `text-${cat.color}/70` : 'text-gray-400'}`}>{cat.examples}</p>
                            </div>

                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`absolute top-4 right-4 w-6 h-6 bg-${cat.color} rounded-full flex items-center justify-center text-white shadow-md`}
                                >
                                    <span className="material-symbols-outlined text-sm">check</span>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Footer Action */}
            <div className="flex justify-end pt-8">
                <button
                    onClick={handleNext}
                    disabled={!selectedCategory || (selectedCategory === 'Lab-Div' && !['admin', 'labdiv', 'moderador', 'labdiv adm'].includes(userRole || ''))}
                    className="bg-brand-blue text-white px-10 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    Próximo Passo: Formato
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
