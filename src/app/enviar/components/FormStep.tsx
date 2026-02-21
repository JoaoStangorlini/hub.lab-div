'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FormStep() {
    const router = useRouter();
    const {
        category, mediaType, setStep,
        title, setTitle,
        authors, setAuthors,
        description, setDescription,
        whatsapp, setWhatsapp,
        videoUrl, setVideoUrl,
        externalLink, setExternalLink,
        technicalDetails, setTechnicalDetails,
        altText, setAltText,
        testimonial, setTestimonial,
        selectedFiles, setSelectedFiles,
        reset
    } = useSubmissionStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [readGuide, setReadGuide] = useState(false);
    const [acceptedCC, setAcceptedCC] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setUserEmail(session.user.email);
            }
        };
        fetchUser();
    }, []);

    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    // Staggered variants for children
    const itemVariants: any = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        exit: (idx: any) => ({
            opacity: 0,
            x: (idx % 2 === 0) ? -600 : 600,
            transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
        })
    };

    const containerVariants = {
        visible: {
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    // Dynamic Visibility Logic
    const showAltText = mediaType === 'image' || mediaType === 'video';
    const showFileUpload = ['image', 'pdf', 'zip', 'sdocx'].includes(mediaType);
    const showVideoUrl = mediaType === 'video';
    const isTextMode = mediaType === 'text';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.some(file => file.size > MAX_FILE_SIZE)) {
                setErrorMsg('Cada arquivo deve ter no máximo 10MB.');
                setSelectedFiles([]);
                return;
            }
            if (mediaType === 'image' && files.length > 10) {
                setErrorMsg('Limite máximo de 10 fotos por submissão.');
                setSelectedFiles(files.slice(0, 10));
            } else if (['pdf', 'zip', 'sdocx'].includes(mediaType) && files.length > 1) {
                setErrorMsg('Apenas um arquivo é permitido para este tipo de mídia.');
                setSelectedFiles([files[0]]);
            } else {
                setErrorMsg('');
                setSelectedFiles(files);
            }
        }
    };

    const insertFormatting = (prefix: string, suffix: string = '') => {
        const textarea = descriptionRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = description.substring(start, end);
        const before = description.substring(0, start);
        const after = description.substring(end);
        const newText = `${before}${prefix}${selectedText || 'texto'}${suffix}${after}`;
        setDescription(newText);
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length;
            const newSelEnd = newCursorPos + (selectedText || 'texto').length;
            textarea.setSelectionRange(newCursorPos, newSelEnd);
        }, 0);
    };

    const insertLinePrefix = (prefix: string) => {
        const textarea = descriptionRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = description.substring(start, end);
        const before = description.substring(0, start);
        const after = description.substring(end);
        const lines = selectedText ? selectedText.split('\n') : [''];
        const prefixedLines = lines.map(line => `${prefix}${line}`).join('\n');
        const newText = `${before}${prefixedLines}${after}`;
        setDescription(newText);
        setTimeout(() => textarea.focus(), 0);
    };

    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const resourceType = (mediaType === 'image' || mediaType === 'pdf') ? 'image' : 'auto';
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error("Falha no upload");
        const data = await res.json();
        if (mediaType === 'image') {
            const urlParts = data.secure_url.split('/upload/');
            if (urlParts.length === 2) return `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}`;
        }
        return data.secure_url;
    };

    const parseYoutubeUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Você precisa estar logado.");
            if (!title || !authors) throw new Error("Preencha campos obrigatórios (*)");
            if (showAltText && !altText) throw new Error("O Texto Alternativo é obrigatório para acessibilidade.");

            let finalMediaUrl: string[] = [];
            if (isTextMode) {
                if (description.trim().length < 50) throw new Error("Texto deve ter 50+ caracteres.");
            } else if (showFileUpload) {
                if (selectedFiles.length === 0) throw new Error("Selecione os arquivos.");
                finalMediaUrl = await Promise.all(selectedFiles.map(f => uploadToCloudinary(f)));
            } else if (showVideoUrl) {
                const vidId = parseYoutubeUrl(videoUrl);
                if (!vidId) throw new Error("Link YouTube inválido.");
                finalMediaUrl = [`https://www.youtube.com/embed/${vidId}`];
            }

            // 1. Ensure Profile Exists (Critical for Foreign Key constraint)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error("Profile check error:", profileError);
                throw new Error(`Erro ao verificar perfil: ${profileError.message}`);
            }

            if (!profile) {
                console.log("Profile missing, creating on the fly...");
                const { error: createError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: session.user.id,
                        email: session.user.email,
                        full_name: session.user.user_metadata?.full_name || authors.split(',')[0],
                        avatar_url: session.user.user_metadata?.avatar_url || null
                    }]);

                if (createError) {
                    console.error("Profile creation error:", createError);
                    throw new Error(`Não foi possível criar seu perfil no banco: ${createError.message}`);
                }
            }

            const { error: insError } = await supabase.from('submissions').insert([{
                title, authors, description, category, whatsapp,
                media_type: mediaType,
                media_url: JSON.stringify(finalMediaUrl),
                status: 'pendente',
                external_link: externalLink || null,
                technical_details: technicalDetails || null,
                alt_text: altText || null,
                testimonial: testimonial || null,
                user_id: session.user.id
            }]);

            if (insError) {
                console.error("Supabase Insert Error:", insError);
                throw new Error(`Erro no banco de dados: ${insError.message || JSON.stringify(insError)} (${insError.code || 'sem código'})`);
            }

            fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authors, title, category })
            }).catch(() => { });

            // Success state instead of immediate redirect
            setIsSubmitted(true);
            setTimeout(() => {
                reset();
                router.push('/');
            }, 5000); // 5 seconds of success glory
        } catch (err: any) {
            console.error("Full handle handleSubmit catch error:", err);
            setErrorMsg(err.message || "Erro inesperado.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center space-y-8"
            >
                <div className="relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100 }}
                        className="w-32 h-32 bg-brand-yellow rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"
                    >
                        <span className="material-symbols-outlined text-6xl">rocket_launch</span>
                    </motion.div>
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-brand-yellow rounded-full blur-2xl"
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-gray-900 dark:text-white">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow italic mr-2">Voou!</span>
                        Contribuição Recebida
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
                        Sua ideia agora faz parte do Hub. Nossa curadoria vai analisar tudo com carinho e logo ela aparecerá na vitrine principal.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4 pt-10">
                    <div className="flex items-center gap-2 text-brand-blue font-bold uppercase tracking-widest text-xs">
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Voltando para a home em instantes...
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-10 pb-20"
        >
            {/* Top Banner for Final Step */}
            <motion.div variants={itemVariants} custom={0}
                className="relative overflow-hidden bg-white dark:bg-card-dark rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-brand-yellow/5 mb-10"
            >
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <div className="relative p-8 md:p-10 flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-brand-yellow/10 rounded-3xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-4xl text-brand-yellow">verified</span>
                    </div>

                    <div className="flex-grow space-y-3 text-center lg:text-left">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Quase lá! Vamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow">detalhar</span> sua ideia?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                            Preencha os campos abaixo com atenção. Informações precisas ajudam nossa curadoria a destacar seu trabalho na vitrine principal do Hub.
                            Lembre-se de aceitar os termos de uso antes de finalizar.
                        </p>
                    </div>

                    <a
                        href="/guia"
                        target="_blank"
                        className="group relative overflow-hidden px-8 py-5 rounded-2xl font-bold shadow-xl hover:-translate-y-1 flex items-center gap-3 shrink-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-100 transition-opacity"></div>
                        <span className="relative z-10 text-white flex items-center gap-2">
                            Abrir Guia
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                        </span>
                    </a>

                    <div className="shrink-0 flex -space-x-4">
                        <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 bg-brand-blue flex items-center justify-center text-white scale-110 z-10">
                            <span className="material-symbols-outlined text-xl">1</span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 bg-brand-red flex items-center justify-center text-white scale-110 z-20">
                            <span className="material-symbols-outlined text-xl">2</span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 bg-brand-yellow flex items-center justify-center text-white scale-110 z-30 shadow-lg">
                            <span className="material-symbols-outlined text-xl">3</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} custom={1} className="flex items-center gap-4">
                <button onClick={() => setStep('format')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes Finais</h1>
            </motion.div>

            {errorMsg && (
                <motion.div variants={itemVariants} custom={2} className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined">error</span>
                    {errorMsg}
                </motion.div>
            )}

            <motion.div variants={itemVariants} custom={3} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 lg:col-span-2">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-xl">alternate_email</span>
                        E-mail de Assinatura (Logado)
                    </label>
                    <input
                        type="email"
                        value={userEmail || 'Carregando...'}
                        readOnly
                        className="w-full bg-gray-50 dark:bg-form-dark/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 cursor-not-allowed opacity-70 outline-none transition-all dark:text-gray-400 font-medium"
                    />
                </div>
                <div className="space-y-3 lg:col-span-2">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-blue">
                        <span className="material-symbols-outlined text-xl">title</span>
                        Título da Contribuição *
                    </label>
                    <input
                        type="text" value={title} onChange={e => setTitle(e.target.value)}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all dark:text-white"
                        placeholder="Ex: Luz e Sombra no Lab de Óptica"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-red">
                        <span className="material-symbols-outlined text-xl">group</span>
                        Autores *
                    </label>
                    <input
                        type="text" value={authors} onChange={e => setAuthors(e.target.value)}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:border-brand-red focus:ring-4 focus:ring-brand-red/10 outline-none transition-all dark:text-white"
                        placeholder="Nome, Sobrenome"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-xl">phone_iphone</span>
                        WhatsApp (Opcional)
                    </label>
                    <input
                        type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all dark:text-white"
                        placeholder="(11) 99999-9999"
                    />
                </div>
            </motion.div>

            {/* Dynamic Description/Text Body */}
            <motion.div variants={itemVariants} custom={4} className="space-y-3">
                <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-yellow">
                    <span className="material-symbols-outlined text-xl">{isTextMode ? 'article' : 'description'}</span>
                    {isTextMode ? 'Seu Texto (Markdown) *' : 'Descrição e Contexto'}
                </label>
                <div className="relative group">
                    {isTextMode && (
                        <div className="flex gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-t-2xl border-2 border-b-0 border-gray-100 dark:border-gray-800">
                            <button type="button" onClick={() => insertFormatting('**', '**')} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-sm">format_bold</span>
                            </button>
                            <button type="button" onClick={() => insertFormatting('*', '*')} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-sm">format_italic</span>
                            </button>
                        </div>
                    )}
                    <textarea
                        ref={descriptionRef}
                        rows={isTextMode ? 12 : 6} value={description} onChange={e => setDescription(e.target.value)}
                        className={`w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 px-6 py-4 outline-none focus:border-brand-yellow focus:ring-4 focus:ring-brand-yellow/10 transition-all dark:text-white ${isTextMode ? 'rounded-b-2xl font-mono' : 'rounded-2xl'}`}
                        placeholder={isTextMode ? 'Era uma vez no IF...' : 'Explique do que se trata esse material, curiosidades ou o contexto científico.'}
                    />
                </div>
            </motion.div>

            {showVideoUrl && (
                <motion.div variants={itemVariants} custom={5} className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-red">
                        <span className="material-symbols-outlined text-xl">smart_display</span>
                        Link do YouTube *
                    </label>
                    <input
                        type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:border-brand-red focus:ring-4 focus:ring-brand-red/10 outline-none transition-all dark:text-white"
                        placeholder="https://youtu.be/..."
                    />
                </motion.div>
            )}

            {showFileUpload && (
                <motion.div variants={itemVariants} custom={5} className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-blue">
                        <span className="material-symbols-outlined text-xl">cloud_upload</span>
                        Upload de Arquivos *
                    </label>
                    <div className="border-3 border-dashed border-brand-blue/20 dark:border-brand-blue/10 rounded-[40px] p-12 hover:bg-brand-blue/5 transition-all flex flex-col items-center text-center cursor-pointer group relative overflow-hidden">
                        <input
                            type="file" multiple={mediaType === 'image'}
                            onChange={handleFileChange}
                            accept={mediaType === 'image' ? "image/*" : ".pdf,.zip,.sdocx"}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-4xl text-brand-blue">upload</span>
                        </div>
                        <p className="text-lg font-black text-gray-900 dark:text-white">
                            {selectedFiles.length > 0
                                ? `${selectedFiles.length} arquivo(s) selecionado(s)`
                                : 'Arraste seus arquivos para cá'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Máximo 10MB por arquivo</p>

                        {/* Selected files indicator bubbles */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {Array.from(selectedFiles).map((f, i) => (
                                    <div key={i} className="px-3 py-1 bg-brand-blue text-white text-[10px] rounded-full font-bold">
                                        {f.name.length > 15 ? f.name.substring(0, 12) + '...' : f.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {showAltText && (
                <motion.div variants={itemVariants} custom={6} className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-blue">
                        <span className="material-symbols-outlined text-xl">accessibility</span>
                        Texto Alternativo *
                    </label>
                    <textarea
                        rows={2} value={altText} onChange={e => setAltText(e.target.value)}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all dark:text-white"
                        placeholder="Descreva visualmente o conteúdo para quem não pode ver."
                    />
                </motion.div>
            )}

            <motion.div variants={itemVariants} custom={7} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-xl">link</span>
                        Link Externo (Drive/Nuvem)
                    </label>
                    <input
                        type="url" value={externalLink} onChange={e => setExternalLink(e.target.value)}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-gray-300 dark:focus:border-gray-600 dark:text-white"
                        placeholder="drive.google.com/..."
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-xl">build</span>
                        Detalhes Técnicos
                    </label>
                    <input
                        type="text" value={technicalDetails} onChange={e => setTechnicalDetails(e.target.value)}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-gray-300 dark:focus:border-gray-600 dark:text-white"
                        placeholder="Câmera, software, técnica..."
                    />
                </div>
            </motion.div>

            {/* Testimonial Section - Aesthetic matching Community Cards */}
            <motion.div variants={itemVariants} custom={7.5}
                className="bg-white dark:bg-card-dark rounded-[40px] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden"
            >
                {/* Decorative background icon */}
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[150px] rotate-12">format_quote</span>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-brand-yellow text-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
                                    <span className="material-symbols-outlined text-2xl">star</span>
                                </div>
                                Seu Depoimento de Sucesso
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                Se você teve uma conquista acadêmica ou impacto positivo com seu trabalho, compartilhe conosco!
                                Queremos dar visibilidade às histórias por trás de cada projeto.
                            </p>
                        </div>
                    </div>

                    <textarea
                        rows={4} value={testimonial} onChange={e => setTestimonial(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-form-dark/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl px-6 py-4 outline-none focus:border-brand-yellow focus:ring-4 focus:ring-brand-yellow/10 transition-all dark:text-white italic"
                        placeholder="Ex: Este projeto me ajudou a conseguir um estágio no laboratório de..."
                    />
                </div>
            </motion.div>

            {/* Last Chance Guide Section */}
            <motion.div variants={itemVariants} custom={8} className="bg-brand-yellow/10 border-2 border-brand-yellow/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center text-gray-900 shadow-lg shadow-brand-yellow/20">
                        <span className="material-symbols-outlined font-bold">priority_high</span>
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">Última chance: Sua submissão está perfeita?</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Evite que seu material seja recusado conferindo os detalhes finais no guia.</p>
                    </div>
                </div>
                <a
                    href="/guia"
                    target="_blank"
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-md whitespace-nowrap"
                >
                    Revisar Guia de Qualidade
                </a>
            </motion.div>

            <motion.div variants={itemVariants} custom={9} className="space-y-5 pt-10 border-t-2 border-gray-100 dark:border-gray-800">
                <label className="flex items-start gap-4 cursor-pointer group">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${readGuide ? 'bg-brand-blue border-brand-blue' : 'border-gray-300 group-hover:border-brand-blue'}`}>
                        {readGuide && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                        <input type="checkbox" className="hidden" checked={readGuide} onChange={e => setReadGuide(e.target.checked)} />
                    </div>
                    <span className="text-xs text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors font-medium">
                        Confirmo que li o <Link href="/guia" target="_blank" className="text-brand-blue font-black underline decoration-2">Guia de Boas Práticas</Link>. *
                    </span>
                </label>
                <label className="flex items-start gap-4 cursor-pointer group">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${acceptedCC ? 'bg-brand-red border-brand-red' : 'border-gray-300 group-hover:border-brand-red'}`}>
                        {acceptedCC && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                        <input type="checkbox" className="hidden" checked={acceptedCC} onChange={e => setAcceptedCC(e.target.checked)} />
                    </div>
                    <span className="text-xs text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors font-medium">
                        Concordo em disponibilizar este material sob licença <span className="font-black text-brand-red uppercase">Creative Commons</span>. *
                    </span>
                </label>
            </motion.div>

            <motion.div variants={itemVariants} custom={10} className="flex justify-between items-center pt-10">
                <button
                    onClick={() => setStep('format')}
                    className="text-gray-500 font-black uppercase tracking-widest text-sm hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">west</span>
                    Voltar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !readGuide || !acceptedCC}
                    className={`group relative overflow-hidden px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 ${isLoading || !readGuide || !acceptedCC ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-brand-red/20 active:translate-y-0'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-100 transition-opacity"></div>
                    <span className="relative z-10 text-white flex items-center gap-3">
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                Concluir Envio
                                <span className="material-symbols-outlined group-hover:translate-x-1 decoration-3 transition-transform">rocket_launch</span>
                            </>
                        )}
                    </span>
                </button>
            </motion.div>
        </motion.div>
    );
}
