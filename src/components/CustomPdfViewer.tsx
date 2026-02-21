'use client';

import React from 'react';

interface CustomPdfViewerProps {
    fileUrl: string;
    title?: string;
}

/**
 * Gets a Cloudinary-rendered image thumbnail of the first page of the PDF.
 * This always works because Cloudinary rasterizes PDFs from the /image/ endpoint.
 */
const getPdfThumbnailUrl = (url: string): string => {
    if (!url) return '';
    // Strip existing transformations and rebuild clean
    let thumbUrl = url.replace(/\/upload\/.*?(\/v\d+\/)/, '/upload$1');
    // Ensure .jpg extension for the rasterized thumbnail
    if (thumbUrl.toLowerCase().endsWith('.pdf')) {
        thumbUrl = thumbUrl.replace(/\.pdf$/i, '.jpg');
    }
    return thumbUrl;
};

export const CustomPdfViewer = ({ fileUrl, title }: CustomPdfViewerProps) => {
    const thumbnailUrl = getPdfThumbnailUrl(fileUrl);

    return (
        <div className="w-full h-full min-h-[60vh] md:min-h-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-6">
            {/* PDF Thumbnail - Full first page */}
            <div className="relative max-w-lg w-full shadow-2xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                    src={thumbnailUrl}
                    alt={title || 'Prévia do PDF'}
                    className="w-full h-auto object-contain bg-white"
                />
                {/* PDF Badge */}
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    PDF
                </div>
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Use o botão <strong>"Acessar PDF Completo"</strong> ao lado para ler o documento inteiro.
            </p>
        </div>
    );
};
