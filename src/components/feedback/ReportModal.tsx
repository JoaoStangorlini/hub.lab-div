'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ReportModal = ({ isOpen, onClose }: ReportModalProps) => {
    const [type, setType] = useState<'bug' | 'visual' | 'suggestion' | null>(null);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [consent, setConsent] = useState(false);
    const [metadata, setMetadata] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setType(null);
            setMetadata({
                url: window.location.href,
                userAgent: navigator.userAgent,
                resolution: `${window.innerWidth}x${window.innerHeight}`,
                timestamp: new Date().toISOString()
            });
        } else {
            setFile(null);
            setPreviewUrl(null);
            setDescription('');
            setConsent(false);
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error('Arquivo muito grande (máx 10MB)');
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'hub_unsigned');
        formData.append('folder', 'reports');

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            throw new Error("Falha no upload da imagem");
        }

        const data = await res.json();
        return data.secure_url;
    };

    const handleSubmit = async () => {
        if (!consent) {
            toast.error('Você deve aceitar o envio dos dados.');
            return;
        }

        if (!type) {
            toast.error('Selecione uma categoria.');
            return;
        }

        if (!description.trim()) {
            toast.error('Por favor, descreva o problema.');
            return;
        }

        setIsSubmitting(true);
        try {
            let screenshotUrl = null;

            if (file) {
                screenshotUrl = await uploadToCloudinary(file);
            }

            const { data: { user } } = await supabase.auth.getUser();

            const { error: dbError } = await supabase
                .from('feedback_reports')
                .insert([{
                    user_id: user?.id || null,
                    type,
                    description,
                    metadata,
                    screenshot_url: screenshotUrl,
                    status: 'open'
                }]);

            if (dbError) throw dbError;

            toast.success('Relatório enviado com sucesso!');
            onClose();
        } catch (error: any) {
            console.error('Report submission failed:', error);
            toast.error('Erro ao enviar relatório: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm report-modal-overlay"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-brand-red/5">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-brand-red text-3xl">report</span>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reportar Problema</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-black">(Feedback & Denúncias)</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Type Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-black uppercase tracking-widest text-brand-red">1. Selecione a Categoria</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setType('bug')}
                                    className={`py-3 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 flex flex-col items-center justify-center gap-2 h-20 ${type === 'bug'
                                        ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20 scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:border-brand-red/30'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">bug_report</span>
                                    <span className="text-center leading-tight">Erro Técnico</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('visual')}
                                    className={`py-3 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 flex flex-col items-center justify-center gap-2 h-20 ${type === 'visual'
                                        ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20 scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:border-brand-red/30'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">palette</span>
                                    <span className="text-center leading-tight">Visual/Layout</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('suggestion')}
                                    className={`py-3 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 flex flex-col items-center justify-center gap-2 h-20 ${type === 'suggestion'
                                        ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20 scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:border-brand-red/30'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">lightbulb</span>
                                    <span className="text-center leading-tight">Sugestão</span>
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className={`space-y-2 transition-opacity duration-300 ${!type ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <label className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">2. Descrição</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={!type}
                                placeholder={!type ? "Selecione uma categoria acima primeiro..." : "Descreva o que está acontecendo..."}
                                className="w-full h-32 bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-3xl p-5 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-red/30 transition-all resize-none shadow-inner"
                            ></textarea>
                        </div>

                        {/* File Upload */}
                        <div className={`space-y-2 transition-opacity duration-300 ${!type ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <label className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">3. Anexar Imagem (Opcional)</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative aspect-video bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 cursor-pointer group hover:border-brand-red/30 transition-all"
                            >
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-bold">Trocar Imagem</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                                        <span className="text-xs font-bold uppercase tracking-wider">Clique para anexar (Máx 10MB)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata Box */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <span className="material-symbols-outlined text-sm">settings_ethernet</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Logs de Diagnóstico</span>
                            </div>
                            <pre className="text-[10px] text-gray-500 font-mono whitespace-pre-wrap leading-tight">
                                URL: {metadata?.url}
                                {"\n"}UA: {metadata?.userAgent?.substring(0, 60)}...
                                {"\n"}RES: {metadata?.resolution}
                            </pre>
                        </div>

                        {/* Consent Checkbox */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                            />
                            <span className="text-xs text-gray-500 leading-tight group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors font-medium">
                                Concordo em enviar os dados acima para análise da equipe Lab-Div.
                            </span>
                        </label>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={isSubmitting || !type || !description.trim() || !consent}
                            onClick={handleSubmit}
                            className={`flex-[2] py-4 bg-brand-red text-white text-sm font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-brand-red/20 transition-all flex items-center justify-center gap-2 ${isSubmitting || !type || !description.trim() || !consent ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 active:scale-95'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">send</span>
                                    Enviar Relatório
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
