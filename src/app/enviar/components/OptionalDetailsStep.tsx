'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { supabase } from '@/lib/supabase';
import { SubmissionFormData } from '../schema';
import { toast } from 'react-hot-toast';
import { HelpTooltip } from './HelpTooltip';

export function OptionalDetailsStep({ onSubmit, isLoading }: { onSubmit: (data: any) => void, isLoading: boolean }) {
    const { setStep } = useSubmissionStore();
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors }
    } = useFormContext<SubmissionFormData>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "quiz"
    });

    const watchedValues = watch();
    const [tagInput, setTagInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search for co-authors (copied from original FormStep)
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }
        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
                .limit(5);
            if (!error && data) setSearchResults(data);
            setIsSearching(false);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const addCoAuthor = (user: any) => {
        const current = watchedValues.co_authors || [];
        if (current.find(c => c.id === user.id)) return;
        setValue('co_authors', [...current, user]);
        setSearchTerm('');
        setSearchResults([]);
    };

    const removeCoAuthor = (id: string) => {
        const current = watchedValues.co_authors || [];
        setValue('co_authors', current.filter(c => c.id !== id));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const tag = tagInput.trim().replace(/^#/, '');
            if (tag && !(watchedValues.tags || []).includes(tag)) {
                setValue('tags', [...(watchedValues.tags || []), tag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', (watchedValues.tags || []).filter(t => t !== tagToRemove));
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => setStep('basic')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Extras Opcionais</h1>
            </div>

            <div className="bg-brand-blue/5 p-6 rounded-[32px] border border-brand-blue/10">
                <p className="text-sm text-gray-500 leading-relaxed">
                    Estes campos são opcionais, mas ajudam muito na descoberta e no crédito do seu trabalho.
                    Deixar seu depoimento também inspira outros alunos!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* WhatsApp */}
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">phone_iphone</span>
                        WhatsApp (Opcional)
                        <HelpTooltip text="Facilita o contato direto para convites em exposições ou novas colaborações científicas." />
                    </label>
                    <input type="tel" {...register('whatsapp')} className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4" placeholder="(11) 99999-9999" />
                </div>

                {/* Tags */}
                <div className="space-y-3 lg:col-span-2">
                    <label className="text-sm font-black uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">sell</span>
                        Tags / Palavras-chave
                        <HelpTooltip text="Tags aumentam a visibilidade do seu trabalho e ajudam na filtragem técnica do catálogo." />
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl">
                        {watchedValues.tags?.map((tag: string) => (
                            <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-brand-yellow/10 text-brand-yellow rounded-xl text-xs font-bold">
                                #{tag}
                                <button type="button" onClick={() => removeTag(tag)}><span className="material-symbols-outlined text-[14px]">close</span></button>
                            </span>
                        ))}
                        <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className="flex-grow bg-transparent outline-none text-sm" placeholder="Adicionar tag..." />
                    </div>
                </div>

                {/* Co-Authors */}
                <div className="lg:col-span-2 space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">person_add</span>
                        Co-autores (Opcional)
                        <HelpTooltip text="Garante que todos os envolvidos no projeto recebam o devido crédito acadêmico." />
                    </label>
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4" placeholder="Buscar por nome..." />
                    {searchResults.length > 0 && (
                        <div className="border bg-white dark:bg-form-dark rounded-xl overflow-hidden shadow-xl">
                            {searchResults.map(user => (
                                <button key={user.id} type="button" onClick={() => addCoAuthor(user)} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center">
                                    <span>{user.full_name}</span>
                                    <span className="material-symbols-outlined text-xs">add</span>
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {watchedValues.co_authors?.map((user: any) => (
                            <div key={user.id} className="bg-brand-blue/10 border border-brand-blue/30 rounded-xl px-4 py-2 flex items-center gap-2">
                                <span className="text-xs font-bold">{user.full_name}</span>
                                <button type="button" onClick={() => removeCoAuthor(user.id)}><span className="material-symbols-outlined text-sm">close</span></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* External Link */}
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">link</span>
                        Link Externo (Drive/Nuvem)
                        <HelpTooltip text="Ideal para anexar datasets pesados, repositórios de código ou documentos complementares." />
                    </label>
                    <input type="url" {...register('external_link')} className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4" placeholder="drive.google.com/..." />
                </div>

                {/* Technical Details */}
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">build</span>
                        Detalhes Técnicos
                        <HelpTooltip text="Especificar lentes, ISO ou softwares ajuda outros alunos a aprenderem com seu método." />
                    </label>
                    <input type="text" {...register('technical_details')} className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4" placeholder="Câmera, software..." />
                </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white dark:bg-card-dark rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 space-y-4">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-yellow">star</span>
                    Seu Depoimento de Sucesso
                    <HelpTooltip text="Seu relato humaniza a ciência e inspira novos alunos a participarem do Hub." />
                </h3>
                <textarea rows={4} {...register('testimonial')} className="w-full bg-gray-50 dark:bg-form-dark/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl px-6 py-4 outline-none italic" placeholder="O Hub de comunicação científica do LabDiv me ajudou a..." />
            </div>

            {/* Mini Quiz Section */}
            <div className="bg-white dark:bg-card-dark rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-blue">quiz</span>
                            Mini Quiz (Recompensa de XP)
                            <HelpTooltip text="Crie até 2 perguntas para testar se os usuários entenderam seu post. Cada resposta correta dará 10 XP ao leitor!" />
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">Crie perguntas curtas e diretas sobre o conteúdo do seu post.</p>
                    </div>
                    {fields.length < 2 && (
                        <button
                            type="button"
                            onClick={() => append({ id: Math.random().toString(36).substring(2, 11), question: '', options: ['', '', '', ''], correct_option: 0 })}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-xl text-sm font-bold hover:bg-brand-blue/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Adicionar Pergunta
                        </button>
                    )}
                </div>

                <div className="space-y-8">
                    {fields.map((field, qIndex) => (
                        <div key={field.id} className="p-6 bg-gray-50 dark:bg-form-dark/30 rounded-3xl border border-gray-100 dark:border-gray-800 relative group animate-in fade-in slide-in-from-top-4 duration-300">
                            <button
                                type="button"
                                onClick={() => remove(qIndex)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-brand-red transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pergunta {qIndex + 1}</label>
                                    <input
                                        {...register(`quiz.${qIndex}.question` as const)}
                                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-bold"
                                        placeholder="Ex: Qual o principal conceito abordado neste post?"
                                    />
                                    {errors.quiz?.[qIndex]?.question && (
                                        <span className="text-[10px] text-brand-red font-bold">{errors.quiz[qIndex]?.question?.message}</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map((oIndex) => (
                                        <div key={oIndex} className="space-y-2">
                                            <div className="flex items-center gap-2 relative">
                                                <input
                                                    type="radio"
                                                    value={oIndex}
                                                    {...register(`quiz.${qIndex}.correct_option` as const)}
                                                    className="size-4 accent-brand-green"
                                                />
                                                <input
                                                    {...register(`quiz.${qIndex}.options.${oIndex}` as const)}
                                                    className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2 text-xs"
                                                    placeholder={`Alternativa ${oIndex + 1}`}
                                                />
                                            </div>
                                            {errors.quiz?.[qIndex]?.options?.[oIndex] && (
                                                <span className="text-[10px] text-brand-red font-bold">{errors.quiz[qIndex]?.options?.[oIndex]?.message}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] text-gray-400 italic">Selecione a bola ao lado da alternativa para marcar a resposta correta.</p>
                            </div>
                        </div>
                    ))}

                    {fields.length === 0 && (
                        <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-gray-400 gap-2">
                            <span className="material-symbols-outlined text-3xl opacity-20">quiz</span>
                            <p className="text-xs font-medium">Nenhuma pergunta adicionada.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center pt-10">
                <button onClick={() => setStep('basic')} className="text-gray-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">west</span> Voltar
                </button>
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                        console.log("Submit button clicked");
                        handleSubmit((data) => {
                            // console.log("Form Data to Submit:", data); // Removed stringify for safety
                            onSubmit(data);
                        }, (errors) => {
                            console.error("VALIDATION ERRORS FOUND");
                            const errorObj = errors as any;
                            const firstErrorField = Object.keys(errorObj)[0];
                            const errorMsg = errorObj[firstErrorField]?.message || "Verifique este campo";
                            toast.error(`${firstErrorField}: ${errorMsg}`);
                        })();
                    }}
                    className="bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red px-12 py-5 rounded-2xl font-black text-white uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    {isLoading ? 'Enviando...' : 'Concluir Envio'}
                    {!isLoading && <span className="material-symbols-outlined">rocket_launch</span>}
                </button>
            </div>
        </div>
    );
}
