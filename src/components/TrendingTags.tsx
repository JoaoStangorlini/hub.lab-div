'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TrendingTagsProps {
    tags: string[];
    onTagClick: (tag: string) => void;
    activeTag?: string;
}

export function TrendingTags({ tags, onTagClick, activeTag }: TrendingTagsProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="mb-8 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-brand-blue dark:text-brand-yellow text-xl">trending_up</span>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                    Trending Topics
                </h3>
            </div>

            <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => {
                    const isActive = activeTag === `#${tag}`;
                    const colors = [
                        'hover:bg-brand-blue/10 hover:text-brand-blue hover:border-brand-blue/30',
                        'hover:bg-brand-yellow/10 hover:text-brand-yellow hover:border-brand-yellow/30',
                        'hover:bg-brand-red/10 hover:text-brand-red hover:border-brand-red/30'
                    ];
                    const colorClass = colors[index % colors.length];

                    return (
                        <motion.button
                            key={tag}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onTagClick(tag)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border select-none
                                ${isActive
                                    ? 'bg-brand-blue text-white border-brand-blue shadow-lg scale-105'
                                    : `bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800 ${colorClass}`
                                }`}
                        >
                            #{tag}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
