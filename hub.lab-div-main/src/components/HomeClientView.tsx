'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MediaCard, MediaCardProps } from './MediaCard';
import { SubmissionLightbox } from './SubmissionLightbox';
import { CATEGORIES, CATEGORY_STYLES, DEFAULT_STYLE } from '@/lib/constants';
import { fetchSubmissions } from '@/app/actions/submissions';
import { useInView } from 'react-intersection-observer';

interface HomeClientViewProps {
    initialItems: MediaCardProps[];
    initialHasMore: boolean;
}

export const HomeClientView = ({ initialItems, initialHasMore }: HomeClientViewProps) => {
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [sortOrder, setSortOrder] = useState<'recentes' | 'antigas'>('recentes');

    // Pagination & Data State
    const [items, setItems] = useState<MediaCardProps[]>(initialItems);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Modal State
    const [selectedItem, setSelectedItem] = useState<MediaCardProps | null>(null);

    // Parallax Mouse State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Debounce Search 
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Infinite Scroll trigger
    useEffect(() => {
        if (inView && hasMore && !isLoadingMore && !isLoading) {
            handleLoadMore();
        }
    }, [inView, hasMore, isLoadingMore, isLoading]);

    // Fetch new results when filters change
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const fetchFiltered = async () => {
            setIsLoading(true);
            try {
                const res = await fetchSubmissions({
                    page: 1, limit: 12, query: debouncedQuery, category: selectedCategory, sort: sortOrder
                });
                setItems(res.items);
                setHasMore(res.hasMore);
                setPage(1);
            } catch (err) {
                console.error("Failed to fetch", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiltered();
    }, [debouncedQuery, selectedCategory, sortOrder]);

    const handleLoadMore = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = page + 1;
        try {
            const res = await fetchSubmissions({
                page: nextPage, limit: 12, query: debouncedQuery, category: selectedCategory, sort: sortOrder
            });
            setItems(prev => [...prev, ...res.items]);
            setHasMore(res.hasMore);
            setPage(nextPage);
        } catch (err) {
            console.error("Failed to load more", err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const openModal = (item: MediaCardProps) => {
        setSelectedItem(item);
    };

    const currentSubmissionIndex = selectedItem ? items.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrevSubmission = currentSubmissionIndex > 0;
    const hasNextSubmission = currentSubmissionIndex !== -1 && currentSubmissionIndex < items.length - 1;

    const handlePrevSubmission = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (hasPrevSubmission) {
            setSelectedItem(items[currentSubmissionIndex - 1]);
        }
    };

    const handleNextSubmission = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (hasNextSubmission) {
            setSelectedItem(items[currentSubmissionIndex + 1]);

            // Fetch more if we navigate close to the end (prefetching)
            if (currentSubmissionIndex + 1 >= items.length - 3 && hasMore && !isLoadingMore) {
                await handleLoadMore();
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (typeof window !== 'undefined') {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setMousePos({ x, y });
        }
    };

    // Memoized featured items
    const featuredItems = useMemo(() => items.filter(i => i.isFeatured), [items]);

    return (
        <div className="flex flex-col min-h-screen">
            <header
                className="relative pt-20 pb-32 overflow-hidden flex-shrink-0"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
            >
                <div className="absolute inset-0 bg-background-light dark:bg-background-dark -z-20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:30px_30px] opacity-10 dark:opacity-30 -z-10"></div>

                {/* IDV Blobs */}
                <div
                    className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/30 dark:bg-brand-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-blob-bounce transition-transform duration-700 ease-out z-0"
                    style={{ transform: `translate(calc(-10% + ${mousePos.x * -120}px), calc(-20% + ${mousePos.y * -120}px))` }}
                ></div>
                <div
                    className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-brand-red/30 dark:bg-brand-red/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 animate-blob-bounce transition-transform duration-700 ease-out delay-75"
                    style={{ transform: `translate(calc(-25% + ${mousePos.x * 100}px), calc(33.333% + ${mousePos.y * 100}px))` }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-brand-yellow/30 dark:bg-brand-yellow/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-blob-bounce transition-transform duration-700 ease-out delay-150"
                    style={{ transform: `translate(calc(-50% + ${mousePos.x * -160}px), calc(-50% + ${mousePos.y * -160}px))` }}
                ></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 dark:border-brand-blue/30 text-brand-blue dark:text-brand-blue text-xs font-semibold uppercase tracking-wide mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
                            Excelência em Pesquisa
                        </div>
                        <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.1]">
                            A Ciência <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red">Acontece Aqui</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
                            O arquivo oficial de divulgação científica do IF-USP. Explore fotos, vídeos, textos e materiais didáticos para ficar sempre antenado nas descobertas que transformam o mundo.
                        </p>

                        <div className="relative max-w-2xl group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red rounded-2xl blur opacity-20 dark:hidden group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center bg-white dark:bg-form-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <span className="material-symbols-outlined text-brand-blue pl-4 text-2xl">search</span>
                                <input
                                    className="w-full py-4 px-4 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg"
                                    placeholder="Buscar por autor, título, descrição..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-5 space-y-2 pl-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow shrink-0"></span>
                                Experimente o filtro <span className="font-semibold text-brand-yellow cursor-pointer hover:underline" onClick={() => setSelectedCategory('Bastidores da Ciência')}>Bastidores da Ciência</span> para ver as gambiarras e Easter eggs da ciência.
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 opacity-90 transition-opacity hover:opacity-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0"></span>
                                Você quer levar ciência para os alunos sem se preocupar com possíveis erros? Use o filtro <span className="font-semibold text-brand-blue cursor-pointer hover:underline" onClick={() => setSelectedCategory('Uso Didático')}>Uso Didático</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50 sticky top-24 z-40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
                        <div className="flex gap-2">
                            {CATEGORIES.map(cat => {
                                const isActive = selectedCategory === cat;
                                const style = CATEGORY_STYLES[cat] || DEFAULT_STYLE;
                                const activeClass = isActive ? style.filterActive : style.filterInactive;

                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm transition-colors whitespace-nowrap border ${activeClass}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-brand-blue">Ordenar por:</span>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'recentes' | 'antigas')}
                                className="bg-transparent border-none focus:ring-0 cursor-pointer font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-blue transition-colors outline-none"
                            >
                                <option value="recentes">Mais recentes</option>
                                <option value="antigas">Mais antigas</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Destaque da Semana Section */}
            {featuredItems.length > 0 && (
                <section className="bg-gradient-to-br from-brand-yellow/5 via-white to-brand-red/5 dark:from-brand-yellow/10 dark:via-background-dark dark:to-brand-red/10 py-10 border-b border-gray-200 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-red to-brand-yellow text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                Destaque da Semana
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-brand-yellow/40 to-transparent"></div>
                        </div>
                        <div className={`grid gap-6 ${featuredItems.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                            {featuredItems.map(item => (
                                <div key={item.id} onClick={() => openModal(item)} className="transform hover:scale-[1.02] transition-transform">
                                    <div className="relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-red via-brand-yellow to-brand-red rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                        <div className="relative">
                                            <MediaCard {...item} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-background-subtle dark:bg-background-dark py-12 transition-colors flex-grow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mb-4"></div>
                            <p className="text-gray-500 font-medium">Buscando itens na base de dados...</p>
                        </div>
                    ) : (
                        <div className="masonry-grid">
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <div key={item.id} onClick={() => openModal(item)}>
                                        <MediaCard {...item} />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">search_off</span>
                                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Nenhum resultado encontrado</h3>
                                    <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou termo de busca.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }}
                                        className="mt-6 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                                    >
                                        Limpar Filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Infinite Scroll Trigger */}
                    <div ref={loadMoreRef} className="h-10 mt-8 flex items-center justify-center">
                        {isLoadingMore && (
                            <div className="flex items-center gap-2 text-brand-blue">
                                <div className="w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">Carregando mais...</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedItem && (
                <SubmissionLightbox
                    selectedItem={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    hasPrev={hasPrevSubmission}
                    hasNext={hasNextSubmission}
                    onPrev={handlePrevSubmission}
                    onNext={handleNextSubmission}
                />
            )}
        </div>
    );
};
