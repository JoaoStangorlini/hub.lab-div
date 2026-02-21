'use client';

import { useState } from 'react';

export function ImageCarouselClient({ urls, title }: { urls: string[], title: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => setCurrentIndex(p => (p + 1) % urls.length);
    const prevImage = () => setCurrentIndex(p => (p - 1 + urls.length) % urls.length);

    if (urls.length === 0) {
        return <span className="text-white">Imagem não encontrada</span>;
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center min-h-[300px] md:min-h-[500px]">
            <img src={urls[currentIndex]} alt={`${title} - ${currentIndex + 1}`} className="w-full object-contain max-h-[70vh]" />
            {urls.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 md:p-3 backdrop-blur-md transition-all hover:scale-110"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 md:p-3 backdrop-blur-md transition-all hover:scale-110"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
                    </button>

                    <div className="absolute bottom-4 flex gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md">
                        {urls.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2.5 rounded-full cursor-pointer hover:bg-white transition-all ${i === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
                                onClick={() => setCurrentIndex(i)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
