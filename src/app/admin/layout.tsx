'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Visão Geral', href: '/admin', icon: 'pie_chart' },
        { name: 'Pendentes', href: '/admin/pendentes', icon: 'assignment' },
        { name: 'Aprovados', href: '/admin/aprovados', icon: 'check_circle' },
        { name: 'Negadas', href: '/admin/negadas', icon: 'cancel' },
        { name: 'Filtrar por Autor', href: '/admin/autores', icon: 'person_search' },
        { name: 'Editar Submissões', href: '/admin/editar', icon: 'edit_square' },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased min-h-screen flex overflow-hidden">
            <aside className="w-64 bg-white dark:bg-[#18212f] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen overflow-y-auto sticky top-0 transition-colors">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-2xl">science</span>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight truncate">Arquivo Lab-Div</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">Painel Admin</p>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex flex-col gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                        ? 'bg-primary/10 text-primary dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : 'group-hover:text-primary dark:group-hover:text-blue-400'
                                        }`}>
                                        {link.icon}
                                    </span>
                                    <span className="text-sm font-medium">{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 transition-colors">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-3 py-2 w-full text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">logout</span>
                        <span className="text-sm font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto h-screen relative">
                {children}
            </main>
        </div>
    );
}
