'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { SubmissionFormData } from '../schema';
import { getUserPseudonyms, createPseudonym } from '@/app/actions/submissions';
import { HelpTooltip } from './HelpTooltip';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function BasicDetailsStep() {
    const {
        mediaType, setStep, selectedFiles, setSelectedFiles
    } = useSubmissionStore();

    const {
        register,
        watch,
        setValue,
        formState: { errors },
        trigger
    } = useFormContext<SubmissionFormData>();

    const [realName, setRealName] = useState('');
    const [userPseudonyms, setUserPseudonyms] = useState<any[]>([]);
    const [isCreatingPseudonym, setIsCreatingPseudonym] = useState(false);

    const watchedValues = watch();
    const usePseudonym = watchedValues.use_pseudonym;
    const isInitialized = useRef(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.full_name) {
                    setRealName(profile.full_name);
                    if (!isInitialized.current) {
                        setValue('authors', profile.full_name);
                        isInitialized.current = true;
                    }
                }
            }
        };
        fetchUser();
        getUserPseudonyms().then(p => setUserPseudonyms(p || [])).catch(() => { });
    }, [setValue]);

    useEffect(() => {
        if (!usePseudonym && realName) {
            setValue('authors', realName);
            setValue('pseudonym_id', undefined);
        }
    }, [usePseudonym, realName, setValue]);

    const handleCreatePseudonym = async () => {
        const name = watch('new_pseudonym');
        if (!name || name.length < 2) return;

        setIsCreatingPseudonym(true);
        const res = await createPseudonym(name);
        if (res.success && res.data) {
            setUserPseudonyms(prev => [...prev, res.data]);
            setValue('pseudonym_id', res.data.id);
            setValue('authors', res.data.name);
            setValue('new_pseudonym', '');
            toast.success("Apelido criado!");
        } else {
            toast.error(res.error || "Erro ao criar apelido");
        }
        setIsCreatingPseudonym(false);
    };

    const handleSelectPseudonym = (p: any) => {
        setValue('pseudonym_id', p.id);
        setValue('authors', p.name);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);
            setSelectedFiles([...selectedFiles, ...validFiles].slice(0, 10));
        }
    };

    const handleContinue = async () => {
        const isValid = await trigger(['title', 'authors', 'event_year', 'description', 'read_guide', 'accepted_cc']);
        if (isValid) {
            // Validation Traps for Media
            const showFileUpload = ['image', 'pdf', 'zip', 'sdocx'].includes(mediaType);
            const showVideoUrl = mediaType === 'video';

            if (showFileUpload && selectedFiles.length === 0) {
                toast.error("Por favor, selecione ao menos um arquivo para continuar.");
                return;
            }

            if (showVideoUrl && !watch('video_url')) {
                toast.error("Por favor, insira o link do vídeo do YouTube.");
                return;
            }

            setStep('optional');
        } else {
            toast.error("Por favor, preencha os campos obrigatórios corretamente.");
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    const showFileUpload = ['image', 'pdf', 'zip', 'sdocx'].includes(mediaType);
    const showVideoUrl = mediaType === 'video';
    const isTextMode = mediaType === 'text';

    return (
        <div className="space-y-10 pb-20">
            <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setStep('format')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes da Contribuição</h1>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Título */}
                <div className="space-y-3 lg:col-span-2">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-blue">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">title</span>
                            Título da Contribuição *
                            <HelpTooltip text="Títulos impactantes ajudam na descoberta. Seja específico sobre o experimento ou conceito abordado." />
                        </div>
                        <span className={`text-[10px] font-bold ${(watchedValues.title || '').length > 60 ? 'text-brand-red' : 'text-gray-400'}`}>
                            {(watchedValues.title || '').length}/60
                        </span>
                    </label>
                    <input
                        type="text" {...register('title')}
                        className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white ${errors.title ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-blue focus:ring-brand-blue/10'}`}
                        placeholder="Ex: Luz e Sombra no Lab de Óptica"
                    />
                    {errors.title && <p className="text-red-500 text-xs font-bold">{errors.title.message}</p>}
                </div>

                {/* Autor Principal */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-red">
                            <span className="material-symbols-outlined text-xl">group</span>
                            Autor Principal *
                            <HelpTooltip text="O nome real garante o crédito acadêmico oficial. O apelido é útil se você já tem uma identidade consolidada no Hub." />
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" {...register('use_pseudonym')} className="peer sr-only" />
                            <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-brand-blue relative transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Usar Apelido</span>
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            type="text" {...register('authors')}
                            readOnly={true}
                            className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white 
                                opacity-60 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/10
                                ${errors.authors ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-red focus:ring-brand-red/10'}`}
                            placeholder={usePseudonym ? "Escolha um apelido abaixo" : "Nome do Perfil"}
                        />
                        {!usePseudonym && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                NOME REAL
                            </div>
                        )}
                    </div>

                    {usePseudonym && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {userPseudonyms.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {userPseudonyms.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => handleSelectPseudonym(p)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${watch('pseudonym_id') === p.id ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-gray-100 dark:border-gray-800 hover:border-brand-blue/30'}`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {userPseudonyms.length < 2 && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        {...register('new_pseudonym')}
                                        placeholder="Novo apelido..."
                                        className="flex-grow bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-xs outline-none focus:border-brand-blue transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreatePseudonym}
                                        disabled={isCreatingPseudonym || !watch('new_pseudonym')}
                                        className="bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-blue/80 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {isCreatingPseudonym ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">add</span>}
                                        Criar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {errors.authors && <p className="text-red-500 text-xs font-bold">{errors.authors.message}</p>}
                </div>

                {/* Ano */}
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-blue">
                        <span className="material-symbols-outlined text-xl">event</span>
                        Ano do Trabalho *
                        <HelpTooltip text="Ajuda a organizar a linha do tempo histórica do Instituto de Física." />
                    </label>
                    <select
                        {...register('event_year')}
                        className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white ${errors.event_year ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-blue focus:ring-brand-blue/10'}`}
                    >
                        {Array.from({ length: new Date().getFullYear() - 1934 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year.toString()}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Descrição */}
            <div className="space-y-3">
                <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-yellow">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">{isTextMode ? 'article' : 'description'}</span>
                        {isTextMode ? 'Seu Texto (Markdown) *' : 'Descrição e Contexto *'}
                        <HelpTooltip text="Explique o contexto técnico e humano. Isso ajuda quem não é da área a entender o valor do seu trabalho." />
                    </div>
                </label>
                <textarea
                    {...register('description')}
                    rows={6}
                    className={`w-full bg-white dark:bg-form-dark border-2 px-6 py-4 outline-none focus:ring-4 transition-all dark:text-white ${errors.description ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-yellow focus:ring-brand-yellow/10'} rounded-2xl`}
                    placeholder={isTextMode ? 'Utilize Markdown...' : 'Explique do que se trata esse material...'}
                />
                {errors.description && <p className="text-red-500 text-xs font-bold">{errors.description.message}</p>}
            </div>

            {/* Mídia */}
            {showVideoUrl && (
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-brand-red flex items-center">
                        Link do YouTube *
                        <HelpTooltip text="Vídeos devem ser hospedados no YouTube para garantir carregamento instantâneo e qualidade." />
                    </label>
                    <input type="url" {...register('video_url')} className="w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4" placeholder="https://youtu.be/..." />
                </div>
            )}

            {showFileUpload && (
                <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-brand-blue flex items-center">
                        Arquivos (Máx: 10MB cada) *
                        <HelpTooltip text="A qualidade técnica dos arquivos fortalece o rigor do acervo científico do Hub." />
                    </label>
                    <div className="border-4 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 text-center cursor-pointer border-gray-100 dark:border-gray-800" onClick={() => document.getElementById('file-upload')?.click()}>
                        <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
                        <span className="material-symbols-outlined text-4xl text-gray-400">cloud_upload</span>
                        <p className="font-black text-gray-900 dark:text-white">Clique para selecionar arquivos</p>
                    </div>
                    {selectedFiles && selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((file, i) => (
                                <div key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-bold flex items-center gap-2">
                                    {file.name}
                                    <button type="button" onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))}>
                                        <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-5 pt-10 border-t-2 border-gray-100 dark:border-gray-800">
                <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 hover:bg-brand-blue/10 transition-all">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            {...register('read_guide')}
                            className="peer appearance-none size-8 border-2 border-brand-blue rounded-lg checked:bg-brand-blue transition-all cursor-pointer"
                        />
                        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xl font-bold">check</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-bold uppercase tracking-wider">Confirmo que li o Guia de Boas Práticas. *</span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl bg-brand-red/5 border border-brand-red/10 hover:bg-brand-red/10 transition-all">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            {...register('accepted_cc')}
                            className="peer appearance-none size-8 border-2 border-brand-red rounded-lg checked:bg-brand-red transition-all cursor-pointer"
                        />
                        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xl font-bold">check</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-bold uppercase tracking-wider">Concordo com a licença Creative Commons. *</span>
                </label>
            </div>

            <div className="flex justify-between items-center pt-10">
                <button onClick={() => setStep('format')} className="text-gray-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">west</span> Voltar
                </button>
                <button
                    type="button"
                    onClick={handleContinue}
                    className="bg-gradient-to-r from-brand-blue to-brand-red px-12 py-5 rounded-2xl font-black text-white uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Continuar para Extras
                </button>
            </div>
        </div>
    );
}
