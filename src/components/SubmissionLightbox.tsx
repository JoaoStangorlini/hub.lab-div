'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import { MediaCardProps } from './MediaCard';
import { parseMediaUrl, formatYoutubeUrl, getDownloadUrl, getPdfViewerUrl } from '@/lib/media-utils';

const CustomPdfViewer = dynamic(
    () => import('./CustomPdfViewer').then((mod) => mod.CustomPdfViewer),
    { ssr: false }
);

interface SubmissionLightboxProps {
    selectedItem: MediaCardProps;
    onClose: () => void;
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: (e: React.MouseEvent) => void;
    onNext: (e: React.MouseEvent) => void;
}

export const SubmissionLightbox = ({
    selectedItem,
    onClose,
    hasPrev,
    hasNext,
    onPrev,
    onNext
}: SubmissionLightboxProps) => {
    const [modalImageIdx, setModalImageIdx] = useState(0);
    const [citeCopied, setCiteCopied] = useState(false);

    const handleCopyCitation = async () => {
        const year = selectedItem.created_at ? new Date(selectedItem.created_at).getFullYear() : new Date().getFullYear();
        const citation = `${selectedItem.authors.toUpperCase()}. ${selectedItem.title}. Hub Lab-Div IF-USP, ${year}. Disponível em: ${window.location.origin}/arquivo/${selectedItem.id}`;
        try {
            await navigator.clipboard.writeText(citation);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = citation;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setCiteCopied(true);
        setTimeout(() => setCiteCopied(false), 2000);
    };

    const mediaUrls = parseMediaUrl(selectedItem.mediaUrl);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-6 lg:p-12 transition-opacity"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all flex items-center justify-center backdrop-blur-md z-[110]"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Close modal"
            >
                <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {/* Global Nav Left */}
            {hasPrev && (
                <button
                    onClick={onPrev}
                    className="hidden md:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                    aria-label="Submissão Anterior"
                >
                    <span className="material-symbols-outlined text-3xl lg:text-4xl">chevron_left</span>
                </button>
            )}

            {/* Global Nav Right */}
            {hasNext && (
                <button
                    onClick={onNext}
                    className="hidden md:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                    aria-label="Próxima Submissão"
                >
                    <span className="material-symbols-outlined text-3xl lg:text-4xl">chevron_right</span>
                </button>
            )}

            <div
                className="w-full max-w-5xl xl:max-w-6xl max-h-full bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative z-[105]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Mobile Global Nav Overlay */}
                <div className="md:hidden absolute inset-y-0 left-0 w-16 z-[106] flex items-center px-1 pointer-events-none">
                    {hasPrev && (
                        <button onClick={onPrev} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-r-lg p-2 backdrop-blur-sm transition-colors">
                            <span className="material-symbols-outlined text-3xl">chevron_left</span>
                        </button>
                    )}
                </div>
                <div className="md:hidden absolute inset-y-0 right-0 w-16 z-[106] flex items-center justify-end px-1 pointer-events-none">
                    {hasNext && (
                        <button onClick={onNext} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-l-lg p-2 backdrop-blur-sm transition-colors">
                            <span className="material-symbols-outlined text-3xl">chevron_right</span>
                        </button>
                    )}
                </div>

                {/* Media Section */}
                <div className="flex-1 bg-black flex items-center justify-center relative min-h-[30vh] lg:min-h-full group">
                    {selectedItem.mediaType === 'video' ? (
                        (() => {
                            const videoUrl = mediaUrls.length > 0 ? formatYoutubeUrl(mediaUrls[0]) : '';
                            return videoUrl ? (
                                <iframe
                                    src={videoUrl}
                                    className="w-full h-full min-h-[400px] aspect-video"
                                    allowFullScreen
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            ) : (
                                <span className="text-white">Vídeo não encontrado</span>
                            );
                        })()
                    ) : selectedItem.mediaType === 'pdf' ? (
                        (() => {
                            const pdfUrl = mediaUrls.length > 0 ? getPdfViewerUrl(mediaUrls[0]) : '';
                            return pdfUrl ? (
                                <div className="w-full h-full min-h-[60vh] md:min-h-full bg-white rounded-l-2xl md:rounded-l-3xl overflow-hidden relative">
                                    <CustomPdfViewer fileUrl={pdfUrl} title={selectedItem.title} />
                                </div>
                            ) : (
                                <span className="text-white">PDF não encontrado</span>
                            );
                        })()
                    ) : selectedItem.mediaType === 'text' ? (
                        <div className="w-full h-full min-h-[60vh] md:min-h-full bg-white dark:bg-gray-900 rounded-l-2xl md:rounded-l-3xl overflow-auto p-8 md:p-12">
                            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{selectedItem.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">person</span>
                                    {selectedItem.authors}
                                </p>
                                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                                    <ReactMarkdown>{selectedItem.description || ''}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {mediaUrls.length > 0 ? (
                                <>
                                    <img src={mediaUrls[modalImageIdx]} alt={selectedItem.title} className="max-w-full max-h-[80vh] object-contain" />
                                    {mediaUrls.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p - 1 + mediaUrls.length) % mediaUrls.length) }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                            >
                                                <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p + 1) % mediaUrls.length) }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                            >
                                                <span className="material-symbols-outlined text-3xl">chevron_right</span>
                                            </button>

                                            <div className="absolute bottom-6 flex gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md">
                                                {mediaUrls.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-2.5 rounded-full cursor-pointer hover:bg-white transition-all ${i === modalImageIdx ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
                                                        onClick={(e) => { e.stopPropagation(); setModalImageIdx(i); }}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <span className="text-white">Imagem não encontrada</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 bg-white dark:bg-gray-900 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 max-h-[50vh] lg:max-h-full border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-text-muted dark:text-gray-300 rounded-full text-xs font-bold tracking-wide uppercase">
                            {selectedItem.category}
                        </span>
                        {selectedItem.isFeatured && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold tracking-wide uppercase">
                                Destaque
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                        {selectedItem.title}
                    </h2>

                    <div className="flex items-center gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                            {selectedItem.authors.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Autor</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedItem.authors}</span>
                        </div>
                    </div>

                    {selectedItem.description && selectedItem.mediaType !== 'text' && (
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Descrição do Trabalho</h3>
                            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{selectedItem.description}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {selectedItem.external_link && (
                        <div className="mt-4">
                            <a
                                href={selectedItem.external_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white font-semibold py-3 flex items-center justify-center gap-2 rounded-xl transition-colors shadow-lg hover:shadow-xl group"
                            >
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                                Acessar PDF Completo
                            </a>
                        </div>
                    )}

                    {/* ABNT Citation Button */}
                    <div className="mt-4">
                        <button
                            onClick={handleCopyCitation}
                            className="w-full bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 font-semibold py-3 flex items-center justify-center gap-2 rounded-xl transition-colors text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">{citeCopied ? 'check' : 'format_quote'}</span>
                            {citeCopied ? 'Citação copiada!' : 'Copiar Citação ABNT'}
                        </button>
                    </div>

                    {/* Technical Details */}
                    {selectedItem.technical_details && (
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-brand-yellow text-[16px]">build</span>
                                Bastidores Técnicos
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                {selectedItem.technical_details}
                            </p>
                        </div>
                    )}

                    <div className="pt-4 flex flex-col gap-3 mt-auto">
                        {(selectedItem.mediaType === 'image' || selectedItem.mediaType === 'pdf' || selectedItem.mediaType === 'zip' || selectedItem.mediaType === 'sdocx') && mediaUrls.length > 0 && (
                            <div className="space-y-3">
                                <a
                                    href={getDownloadUrl(mediaUrls[modalImageIdx])}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <span className="material-symbols-outlined">download</span>
                                    {selectedItem.mediaType === 'image' ? 'Baixar Imagem' : 'Baixar Arquivo'}
                                </a>

                                <div className="flex items-center gap-2 px-3 py-2 bg-brand-green/5 border border-brand-green/20 rounded-lg">
                                    <span className="material-symbols-outlined text-brand-green text-[18px]">verified_user</span>
                                    <span className="text-[11px] text-brand-green font-medium">
                                        Segurança: Arquivo verificado contra vírus pela curadoria administrativa.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
