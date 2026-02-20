'use client';

import React, { useState } from 'react';
import { MediaCard, MediaCardProps, parseMediaUrl, formatYoutubeUrl, getDownloadUrl } from './MediaCard';

interface HomeClientViewProps {
    initialItems: MediaCardProps[];
}

export const HomeClientView = ({ initialItems }: HomeClientViewProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedItem, setSelectedItem] = useState<MediaCardProps | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);
    const [visibleCount, setVisibleCount] = useState(9);

    const categories = ['Todos', 'Laboratórios', 'Pesquisadores', 'Eventos', 'Convivência', 'Outros'];

    // Filter Logic
    const filteredItems = initialItems.filter(item => {
        const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            item.title.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower)) ||
            item.authors.toLowerCase().includes(searchLower);

        return matchesCategory && matchesSearch;
    });

    const displayedItems = filteredItems.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 9);
    };

    const openModal = (item: MediaCardProps) => {
        setSelectedItem(item);
        setModalImageIdx(0);
    };

    const currentSubmissionIndex = selectedItem ? filteredItems.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrevSubmission = currentSubmissionIndex > 0;
    const hasNextSubmission = currentSubmissionIndex !== -1 && currentSubmissionIndex < filteredItems.length - 1;

    const handlePrevSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasPrevSubmission) {
            setSelectedItem(filteredItems[currentSubmissionIndex - 1]);
            setModalImageIdx(0);
        }
    };

    const handleNextSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasNextSubmission) {
            setSelectedItem(filteredItems[currentSubmissionIndex + 1]);
            setModalImageIdx(0);

            // Expand visibleCount if we navigate beyond the currently loaded items
            if (currentSubmissionIndex + 1 >= visibleCount) {
                setVisibleCount(prev => prev + 9);
            }
        }
    };

    return (
        <>
            <section className="relative overflow-hidden bg-background-subtle dark:bg-gray-900 pt-12 pb-20 lg:pt-20 lg:pb-28">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-background-light/95 via-background-light/70 to-transparent dark:from-background-dark/95 dark:via-background-dark/70 z-10"></div>
                    <img
                        alt="Laboratório de física moderna"
                        className="h-full w-full object-cover opacity-40 dark:opacity-20"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsdbfz1Z20wp2oNE9w8jHp_0ZiIehzGE_7RuSgSeUV84GxjWlAy5YbkwTPsp-eRJEBfYOAcyoghJa2qHjxJOcW2gS-rAJNZakoVMDJBgFMMsv-vZxEvn9pgR3XwkWUsD4S5jANNKe914awgUZSoiiREnnwNOia8XVDGcT9LrSP06tHlGVrKAJoNga9WhO3Vl4iKr3a08SGUvOwj1bIX2SQjvpUkXJHernrp3zDTSdl_Ml7j_iQb18tSZdRDx7xN48ioVjXGawvQw-d"
                    />
                </div>

                <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20 mb-6">
                            <span className="material-symbols-outlined text-[16px]">school</span>
                            Excelência em Pesquisa
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl lg:text-6xl mb-6 dark:text-white">
                            A Ciência <br className="hidden sm:block" />
                            <span className="text-primary relative inline-block">
                                Acontece Aqui
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary opacity-50" preserveAspectRatio="none" viewBox="0 0 100 10">
                                    <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                </svg>
                            </span>
                        </h2>
                        <p className="mt-4 text-lg text-text-muted dark:text-gray-300 leading-relaxed max-w-xl">
                            O arquivo de fotos, vídeos, textos e todo tipo de material para divulgação científica. Para você ficar sempre antenado do que está acontecendo no IF-USP!
                        </p>

                        <div className="mt-8 max-w-lg">
                            <label className="sr-only" htmlFor="search">Buscar pesquisa</label>
                            <div className="relative flex items-center shadow-lg rounded-xl bg-white dark:bg-gray-800">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <span className="material-symbols-outlined text-gray-400">search</span>
                                </div>
                                <input
                                    className="block w-full rounded-xl border-0 py-4 pl-12 pr-4 text-text-main ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500 transition-all shadow-sm"
                                    id="search"
                                    name="search"
                                    placeholder="Buscar por autor, título, descrição"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-gray-100 bg-white/95 backdrop-blur-md dark:bg-background-dark/95 dark:border-gray-800 sticky top-16 z-40 transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar mask-gradient">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors shadow-sm ${selectedCategory === cat
                                    ? 'bg-text-main text-white dark:bg-white dark:text-black hover:bg-gray-800'
                                    : 'bg-gray-100 text-text-muted hover:bg-gray-200 hover:text-text-main dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-background-subtle dark:bg-background-dark py-12 transition-colors flex-grow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="masonry-grid">
                        {displayedItems.length > 0 ? (
                            displayedItems.map((item) => (
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
                    {visibleCount < filteredItems.length && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-4 text-sm font-bold text-text-main shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors"
                            >
                                Carregar mais pesquisas
                                <span className="material-symbols-outlined text-xl">expand_more</span>
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox / Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-6 lg:p-12 transition-opacity"
                    onClick={() => setSelectedItem(null)}
                >
                    <button
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all flex items-center justify-center backdrop-blur-md z-[110]"
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>

                    {/* Global Nav Left */}
                    {hasPrevSubmission && (
                        <button
                            onClick={handlePrevSubmission}
                            className="hidden md:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 lg:p-4 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
                            aria-label="Submissão Anterior"
                        >
                            <span className="material-symbols-outlined text-3xl lg:text-4xl">chevron_left</span>
                        </button>
                    )}

                    {/* Global Nav Right */}
                    {hasNextSubmission && (
                        <button
                            onClick={handleNextSubmission}
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

                        {/* Mobile Global Nav Overlay (Visible only on small screens) */}
                        <div className="md:hidden absolute inset-y-0 left-0 w-16 z-[106] flex items-center px-1 pointer-events-none">
                            {hasPrevSubmission && (
                                <button onClick={handlePrevSubmission} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-r-lg p-2 backdrop-blur-sm transition-colors">
                                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                </button>
                            )}
                        </div>
                        <div className="md:hidden absolute inset-y-0 right-0 w-16 z-[106] flex items-center justify-end px-1 pointer-events-none">
                            {hasNextSubmission && (
                                <button onClick={handleNextSubmission} className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-l-lg p-2 backdrop-blur-sm transition-colors">
                                    <span className="material-symbols-outlined text-3xl">chevron_right</span>
                                </button>
                            )}
                        </div>

                        {/* Media Section */}
                        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[30vh] lg:min-h-full group">
                            {selectedItem.mediaType === 'video' ? (
                                (() => {
                                    const rawUrls = parseMediaUrl(selectedItem.mediaUrl);
                                    const videoUrl = rawUrls.length > 0 ? formatYoutubeUrl(rawUrls[0]) : '';
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
                            ) : (
                                (() => {
                                    const urls = parseMediaUrl(selectedItem.mediaUrl);
                                    if (urls.length === 0) return <span className="text-white">Imagem não encontrada</span>;

                                    return (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img src={urls[modalImageIdx]} alt={selectedItem.title} className="max-w-full max-h-[80vh] object-contain" />
                                            {urls.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p - 1 + urls.length) % urls.length) }}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                                    >
                                                        <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setModalImageIdx(p => (p + 1) % urls.length) }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-md transition-all hover:scale-110"
                                                    >
                                                        <span className="material-symbols-outlined text-3xl">chevron_right</span>
                                                    </button>

                                                    <div className="absolute bottom-6 flex gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md">
                                                        {urls.map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-2.5 rounded-full cursor-pointer hover:bg-white transition-all ${i === modalImageIdx ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
                                                                onClick={(e) => { e.stopPropagation(); setModalImageIdx(i); }}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                })()
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

                            {selectedItem.description && (
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Descrição do Trabalho</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                        {selectedItem.description}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3 mt-auto">
                                {selectedItem.mediaType === 'image' && (
                                    <a
                                        href={getDownloadUrl(parseMediaUrl(selectedItem.mediaUrl)[modalImageIdx])}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">download</span> Baixar Agora
                                    </a>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};
