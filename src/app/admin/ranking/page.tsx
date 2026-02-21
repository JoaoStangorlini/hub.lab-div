'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RankedSubmission {
    id: string;
    title: string;
    authors: string;
    category: string;
    total_likes: number;
    weekly_likes: number;
}

export default function RankingPage() {
    const [rankings, setRankings] = useState<RankedSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'alltime' | 'trending'>('alltime');

    useEffect(() => {
        async function fetchRankings() {
            setIsLoading(true);

            // Fetch all approved submissions
            const { data: submissions } = await supabase
                .from('submissions')
                .select('id, title, authors, category')
                .eq('status', 'aprovado');

            // Fetch all likes
            const { data: allLikes } = await supabase
                .from('curtidas')
                .select('submission_id, created_at');

            if (!submissions || !allLikes) {
                setRankings([]);
                setIsLoading(false);
                return;
            }

            // Calculate one week ago
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Build like counts
            const totalMap: Record<string, number> = {};
            const weeklyMap: Record<string, number> = {};

            for (const like of allLikes) {
                totalMap[like.submission_id] = (totalMap[like.submission_id] || 0) + 1;
                if (new Date(like.created_at) >= oneWeekAgo) {
                    weeklyMap[like.submission_id] = (weeklyMap[like.submission_id] || 0) + 1;
                }
            }

            // Merge
            const ranked: RankedSubmission[] = submissions.map(sub => ({
                id: sub.id,
                title: sub.title,
                authors: sub.authors,
                category: sub.category || 'Outros',
                total_likes: totalMap[sub.id] || 0,
                weekly_likes: weeklyMap[sub.id] || 0
            }));

            // Sort by selected filter
            ranked.sort((a, b) => {
                if (filter === 'trending') return b.weekly_likes - a.weekly_likes;
                return b.total_likes - a.total_likes;
            });

            setRankings(ranked);
            setIsLoading(false);
        }

        fetchRankings();
    }, [filter]);

    const getMedalIcon = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `${index + 1}`;
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-red">Ranking de Curtidas</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Ranking de Engajamento</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Veja quais submissões estão recebendo mais curtidas da comunidade.</p>
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setFilter('alltime')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'alltime'
                                    ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            🏆 All-time
                        </button>
                        <button
                            onClick={() => setFilter('trending')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'trending'
                                    ? 'bg-white dark:bg-gray-700 text-brand-red shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            🔥 Trending (7 dias)
                        </button>
                    </div>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-4xl animate-spin text-brand-red mb-4">progress_activity</span>
                        <p className="font-medium animate-pulse">Calculando ranking...</p>
                    </div>
                ) : rankings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-4">bar_chart_off</span>
                        <p className="font-medium">Nenhuma curtida registrada ainda.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-form-dark/50 text-gray-500 dark:text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 w-16 text-center">#</th>
                                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Submissão</th>
                                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Autores</th>
                                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Categoria</th>
                                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center">
                                        {filter === 'alltime' ? '❤️ Total' : '🔥 Semana'}
                                    </th>
                                    {filter === 'trending' && (
                                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center">❤️ Total</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {rankings.map((item, index) => {
                                    const displayCount = filter === 'alltime' ? item.total_likes : item.weekly_likes;
                                    if (displayCount === 0 && index > 9) return null;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3 text-center font-bold text-lg">
                                                {getMedalIcon(index)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white max-w-[250px] truncate" title={item.title}>
                                                {item.title}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[150px] truncate" title={item.authors}>
                                                {item.authors}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {item.category}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${displayCount > 0
                                                        ? 'bg-brand-red/10 text-brand-red'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                    {displayCount}
                                                </span>
                                            </td>
                                            {filter === 'trending' && (
                                                <td className="px-4 py-3 text-center text-gray-500">
                                                    {item.total_likes}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
