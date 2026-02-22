'use client';

import React, { useRef } from 'react';
import { MediaCard, MediaCardProps } from './MediaCard';
import { motion } from 'framer-motion';

interface FeaturedCarouselProps {
    items: MediaCardProps[];
}

export function FeaturedCarousel({ items }: FeaturedCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!items || items.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth * 0.8
                : scrollLeft + clientWidth * 0.8;

            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative mb-16 group">
            {/* Background Decorative Glow */}
            <div className="absolute -inset-x-4 -inset-y-8 z-0 overflow-hidden pointer-events-none sm:block hidden">
                <div className="absolute top-1/2 left-1/4 size-96 bg-brand-yellow/10 rounded-full blur-[100px] animate-blob-bounce"></div>
                <div className="absolute top-0 right-1/4 size-96 bg-brand-red/10 rounded-full blur-[100px] animate-blob-bounce" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-brand-yellow rounded-full blur opacity-25 animate-premium-glow"></div>
                        <span className="relative material-symbols-outlined text-brand-red dark:text-brand-yellow text-2xl animate-pulse">stars</span>
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] shimmer-text">
                        Destaques Premiações
                    </h2>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand-blue transition-all"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">chevron_left</span>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand-blue transition-all"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">chevron_right</span>
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-6 px-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="min-w-[300px] md:min-w-[380px] snap-start"
                    >
                        <MediaCard {...item} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
