'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FORMATS } from '../constants';
import { useSubmissionStore } from '@/store/useSubmissionStore';

export function FormatStep() {
    const { mediaType: selectedFormat, setMediaType, setStep, category } = useSubmissionStore();

    const handleNext = () => {
        if (selectedFormat) {
            setStep('form');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="space-y-12"
        >
            {/* Expanded Guide Banner for Formats */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-white dark:bg-card-dark rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-brand-red/5 mb-12"
            >
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <div className="relative p-8 md:p-10 flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-brand-yellow/10 rounded-3xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-4xl text-brand-yellow">folder_shared</span>
                    </div>

                    <div className="flex-grow space-y-3 text-center lg:text-left">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Dúvidas sobre o <span className="text-brand-red">formato</span> do arquivo?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                            Cada tipo de mídia exige cuidados específicos para garantir a preservação do acervo.
                            Imagens devem estar em alta resolução, vídeos preferencialmente no YouTube e documentos em PDF para acessibilidade.
                            Materiais compactados (.zip) são ideais para coleções de documentos ou códigos.
                            O limite por arquivo é de <span className="font-bold text-gray-900 dark:text-white">10MB</span>.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/5 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-sm">image</span>
                                JPG, PNG, GIF
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-red bg-brand-red/5 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                PDF & Documentos
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-yellow bg-brand-yellow/5 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-sm">inventory_2</span>
                                ZIP & Notas
                            </div>
                        </div>
                    </div>

                    <a
                        href="/guia"
                        target="_blank"
                        className="group relative overflow-hidden px-8 py-5 rounded-2xl font-bold shadow-xl hover:-translate-y-1 flex items-center gap-3 shrink-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-100 transition-opacity"></div>
                        <span className="relative z-10 text-white flex items-center gap-2">
                            Guia de Formatos
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                        </span>
                    </a>
                </div>
            </motion.div>

            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => setStep('category')}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Qual o formato do material?</h2>
                    <p className="text-gray-500 text-sm">Categoria selecionada: <span className="font-bold text-brand-blue">{category}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {FORMATS.map((format, idx) => {
                    const isSelected = selectedFormat === format.id;
                    return (
                        <motion.button
                            key={format.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{
                                opacity: 0,
                                x: (idx % 2 === 0) ? -500 : 500,
                                transition: { duration: 0.4, ease: "easeInOut" }
                            }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setMediaType(format.id as any)}
                            className={`text-left p-8 rounded-[32px] border-2 group relative overflow-hidden ${isSelected
                                ? `border-${format.color} bg-${format.color}/5 shadow-lg shadow-${format.color}/10`
                                : `border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark hover:border-${format.color}/30`
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${isSelected ? `bg-${format.color} text-white shadow-lg shadow-${format.color}/20` : `bg-${format.color}/10 text-${format.color}`
                                }`}>
                                <span className="material-symbols-outlined text-3xl">{format.icon}</span>
                            </div>
                            <h4 className={`font-bold text-xl mb-2 transition-colors ${isSelected ? `text-gray-900 dark:text-white` : 'text-gray-900 dark:text-white'}`}>{format.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{format.description}</p>

                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`absolute top-6 right-6 w-8 h-8 bg-${format.color} rounded-full flex items-center justify-center text-white shadow-lg`}
                                >
                                    <span className="material-symbols-outlined text-base">check</span>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Last Chance Guide Section */}
            <div className="bg-brand-yellow/10 border-2 border-brand-yellow/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center text-gray-900 shadow-lg shadow-brand-yellow/20">
                        <span className="material-symbols-outlined font-bold">tips_and_updates</span>
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">Dica: Escolheu o formato certo?</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Certifique-se de que o formato escolhido é o que melhor preserva os detalhes do seu trabalho.</p>
                    </div>
                </div>
                <a
                    href="/guia"
                    target="_blank"
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-md whitespace-nowrap"
                >
                    Ver Dicas de Formato
                </a>
            </div>

            <div className="flex justify-between pt-8">
                <button
                    onClick={() => setStep('category')}
                    className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                    Voltar
                </button>
                <button
                    onClick={handleNext}
                    disabled={!selectedFormat}
                    className="bg-brand-red text-white px-10 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    Finalizar Detalhes
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </motion.div>
    );
}
