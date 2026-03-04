import Link from 'next/link';
import { AppRoutes } from '@/types/navigation';

export function Footer() {
    return (
        <footer className="bg-[#0B1E3B] border-t border-[#1e3a8a] pt-16 pb-8 border-b-8 border-b-brand-blue text-white/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 lg:col-span-1">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative w-8 h-8 flex-shrink-0">
                                <div className="absolute w-5 h-6 bg-brand-blue rounded-[1px] top-0 left-0 z-0"></div>
                                <div className="absolute w-5 h-6 bg-brand-red rounded-[1px] bottom-0 right-0 z-0 translate-y-1"></div>
                                <div className="absolute w-5 h-5 bg-brand-yellow rounded-full top-2 left-2 z-20 shadow-sm border border-white dark:border-transparent"></div>
                            </div>
                            <div className="flex flex-col -space-y-0.5">
                                <span className="font-sans font-bold text-lg text-gray-900 dark:text-white leading-tight">Hub <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow">Lab-Div</span></span>
                                <span className="text-[8px] uppercase tracking-wider text-gray-500 font-medium">Instituto de Física</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Hub de Comunicação Científica do Lab-Div - Um projeto para melhorar a comunicação do IF-USP e reunir em um FLUXO interativo o arquivo de material de divulgação do Lab-Div e de toda a comunidade — de dentro e fora do instituto.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-brand-blue transition-colors bg-gray-50 dark:bg-gray-800 hover:bg-brand-blue/10 w-10 h-10 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-xl">public</span></a>
                            <a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors bg-gray-50 dark:bg-gray-800 hover:bg-brand-yellow/10 w-10 h-10 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-xl">camera_alt</span></a>
                            <a href="#" className="text-gray-400 hover:text-brand-red transition-colors bg-gray-50 dark:bg-gray-800 hover:bg-brand-red/10 w-10 h-10 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-xl">alternate_email</span></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-wider border-l-4 border-brand-blue pl-3">Navegação</h4>
                        <ul className="space-y-3">
                            <li><Link href="/" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">grain</span> Fluxo de Partículas</Link></li>
                            <li><Link href="/arquivo-labdiv" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">campaign</span> LabDiv</Link></li>
                            <li><Link href="/colisor" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">hub</span> O Grande Colisor</Link></li>
                            <li><Link href={AppRoutes.WIKI} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">menu_book</span> Wiki Hub</Link></li>
                            <li><Link href="/trilhas" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">route</span> Trilhas</Link></li>
                            <li><Link href="/perguntas" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">help_outline</span> Pergunte a um Cientista</Link></li>
                            <li><Link href="/criadores" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">groups</span> Criadores</Link></li>
                            <li><Link href="/mapa" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">map</span> Mapa de Mídia</Link></li>
                            <li><Link href="/sobre" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">info</span> Sobre</Link></li>
                            <li><Link href="/admin" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"><span className="material-symbols-outlined text-xs">admin_panel_settings</span> Painel de Controle</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-wider border-l-4 border-brand-yellow pl-3">Responsável pelo site</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-sm mt-0.5 text-brand-blue">person</span>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-200">João Paulo</p>
                                    <a href="mailto:joaopaulostangorlini@usp.br" className="hover:text-brand-blue transition-colors">joaopaulostangorlini@usp.br</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-sm mt-0.5 text-brand-blue">phone</span>
                                <a href="https://wa.me/5511968401823" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue transition-colors">
                                    (11) 96840-1823
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-wider border-l-4 border-brand-red pl-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow">Lab-Div</span>
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-sm mt-0.5 text-brand-red">email</span>
                                <a href="mailto:joaopaulostangorlini@usp.br" className="hover:text-brand-red transition-colors">joaopaulostangorlini@usp.br</a>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-sm mt-0.5 text-brand-red">language</span>
                                <a href="https://labdiv.notion.site" target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors">labdiv.notion.site</a>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <span className="material-symbols-outlined text-sm mt-0.5 text-brand-red">place</span>
                                <span className="leading-tight">Ed. Novo Milênio Instituto de Física, Universidade de São Paulo.<br />Rua do Matão, 1371, São Paulo - SP.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        © {new Date().getFullYear()} Instituto de Física - USP. Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 border border-gray-100 dark:border-gray-800 px-2 py-0.5 rounded">v3.1.5</span>
                        <div className="flex gap-4">
                            <div className="w-3 h-3 rounded-sm bg-brand-blue shadow-sm shadow-brand-blue/50"></div>
                            <div className="w-3 h-3 rounded-sm bg-brand-red shadow-sm shadow-brand-red/50"></div>
                            <div className="w-3 h-3 rounded-sm bg-brand-yellow shadow-sm shadow-brand-yellow/50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
