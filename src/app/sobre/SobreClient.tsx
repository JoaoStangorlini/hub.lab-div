'use client';

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MediaCard, MediaCardProps } from "@/components/MediaCard";

interface SobreClientProps {
    initialTestimonials: MediaCardProps[];
}

export function SobreClient({ initialTestimonials }: SobreClientProps) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Hero Section */}
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                        O que é o <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow">Hub de Comunicação</span>?
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Um ecossistema digital criado pelo Lab-Div para centralizar, organizar e potencializar a divulgação científica produzida no Instituto de Física da USP.
                    </p>
                </div>

                {/* Ramificações Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">

                    {/* Card 1: Influenciadores */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-brand-red/10 rounded-xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-3xl text-brand-red">campaign</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Apoio aos Criadores</h3>
                        <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                            Mapeamos e integramos a rede de influenciadores e criadores de conteúdo vinculados ao instituto. O hub serve como uma vitrine para amplificar as vozes daqueles que já traduzem a ciência complexa do IFUSP em materiais acessíveis ao grande público, como vídeos, podcasts e posts em redes sociais.
                        </p>
                        <Link href="/criadores" className="mt-6 text-brand-red font-semibold hover:underline flex items-center gap-1">
                            Conheça os criadores <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Card 2: Arquivo Feito por Nós */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 overflow-hidden">
                            <Image src="/arquivo-logo.png" alt="Logo do Arquivo" width={56} height={56} className="object-contain" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">O Arquivo Oficial</h3>
                        <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                            O coração do projeto é a construção de um grande Arquivo visual. Capturamos o cotidiano dos laboratórios, o maquinário e os bastidores das pesquisas de forma profissional. Nosso objetivo é ter um banco de imagens institucionais de alta qualidade, pronto para suprir demandas de jornalistas, designers e pesquisadores.
                        </p>
                        <Link href="/" className="mt-6 text-brand-blue font-semibold hover:underline flex items-center gap-1">
                            Explore o acervo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Card 3: Participação da Comunidade */}
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-brand-yellow/10 rounded-xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-3xl text-brand-yellow">group_add</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Envios da Comunidade</h3>
                        <p className="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                            O Hub é colaborativo! Permitimos que qualquer aluno, técnico ou professor do Instituto possa enviar suas próprias fotos e vídeos do cotidiano do seu laboratório. Após uma rápida curadoria, o seu registro passa a integrar a galeria principal, ajudando a documentar a enorme produção do instituto em rede.
                        </p>
                        <Link href="/enviar" className="mt-6 text-brand-yellow font-semibold hover:underline flex items-center gap-1">
                            Envie seu material <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>

                </div>

                {/* Section About Lab-Div */}
                <div className="bg-gradient-to-br from-brand-blue/5 to-brand-red/5 dark:from-blue-900/10 dark:to-red-900/10 rounded-3xl p-8 md:p-12 border border-brand-blue/10 mb-20">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-6">O Papel do Lab-Div</h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                O Laboratório de Divulgação Científica do IFUSP trabalha para reduzir o abismo entre o que é produzido na academia e o que chega à sociedade.
                            </p>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                Este Hub é uma ferramenta desenhada para resolver um problema histórico: a falta de acessibilidade visual e narrativa sobre a pesquisa de base. Ao unificar criadores, arquivistas e a própria comunidade de pesquisadores em um só lugar, criamos um motor contínuo de difusão do conhecimento.
                            </p>
                            <a href="https://labdiv.notion.site" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-brand-blue font-semibold hover:text-brand-blue/80 transition-colors mt-8 group">
                                Conhecer mais <span className="material-symbols-outlined text-[20px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                        <div className="hidden md:flex w-48 h-48 rounded-2xl items-center justify-center flex-shrink-0 overflow-hidden">
                            <Image src="/labdiv-logo.png" alt="Logo do Lab-Div" width={192} height={192} className="object-contain" />
                        </div>
                    </div>
                </div>

                {/* Dynamic Impacto e Conquistas Section */}
                <div className="space-y-12">
                    <div
                        className="bg-white dark:bg-card-dark rounded-[40px] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden"
                    >
                        {/* Decorative background icon */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <span className="material-symbols-outlined text-[180px] md:text-[220px] rotate-12">workspace_premium</span>
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div className="max-w-2xl">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 bg-brand-yellow text-black rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
                                            <span className="material-symbols-outlined text-3xl">star</span>
                                        </div>
                                        Impacto e Conquistas
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                                        Resultados alcançados, prêmios e histórias de sucesso que inspiram a nossa comunidade.
                                    </p>
                                </div>
                                <Link
                                    href="/?category=Impacto e Conquistas"
                                    className="bg-brand-yellow text-black px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 group whitespace-nowrap"
                                >
                                    Ver todas as conquistas
                                    <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                                </Link>
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {initialTestimonials.length > 0 ? (
                                    initialTestimonials.map((item) => (
                                        <div key={item.id}>
                                            <MediaCard {...item} />
                                        </div>
                                    ))
                                ) : (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={`placeholder-${i}`}
                                            className="aspect-[3/4] rounded-3xl bg-gray-50 dark:bg-background-dark/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-gray-300 relative group/card overflow-hidden"
                                        >
                                            <span className="material-symbols-outlined text-5xl mb-3 group-hover/card:scale-110 transition-transform duration-500">workspace_premium</span>
                                            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Conquista em breve</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
