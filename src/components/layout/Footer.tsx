import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 transition-colors">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined text-xl">science</span>
                            </div>
                            <span className="text-lg font-bold text-text-main dark:text-white">Arquivo Lab-Div</span>
                        </div>
                        <p className="text-sm text-text-muted dark:text-gray-400 max-w-md">
                            O hub oficial de comunicação científica do Instituto de Física da Universidade de São Paulo. Conectando a pesquisa de ponta com a sociedade.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text-main dark:text-white mb-4">Navegação</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-sm text-text-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">home</span>Início</Link></li>
                            <li><Link href="/enviar" className="text-sm text-text-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">send</span>Formulário de Envio</Link></li>
                            <li><Link href="/admin" className="text-sm text-text-muted hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>Admin</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text-main dark:text-white mb-4">Contato</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-2 text-sm text-text-muted dark:text-gray-400">
                                <span className="material-symbols-outlined text-[18px] shrink-0 pt-0.5">person</span>
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Responsável pelo site</span>
                                    <a href="mailto:joaopaulostangorlini@usp.br" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">mail</span> joaopaulostangorlini@usp.br</a>
                                    <a href="tel:+5511968401823" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">call</span> (11) 96840-1823</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-text-muted dark:text-gray-400">
                                <span className="material-symbols-outlined text-[18px] shrink-0 pt-0.5">science</span>
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Lab-Div</span>
                                    <a href="mailto:labdiv@usp.br" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">mail</span> labdiv@usp.br</a>
                                    <a href="https://labdiv.notion.site" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">link</span> labdiv.notion.site</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-text-muted dark:text-gray-400">
                                <span className="material-symbols-outlined text-[18px] shrink-0 pt-0.5">location_on</span>
                                <span className="leading-relaxed">Ed. Novo Milênio Instituto de Física, Universidade de São Paulo.<br />Rua do Matão, 1371, São Paulo - SP.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center md:text-left">
                        © {new Date().getFullYear()} Instituto de Física - USP. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                            <span className="sr-only">Facebook</span>
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                            <span className="sr-only">Instagram</span>
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm0 1.981h.166c-2.443 0-2.753.01-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.055-.058 1.37-.058 4.041v.08c0 2.597.011 2.911.058 3.965.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.911-.011 3.965-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.011-2.911-.058-3.965-.045-.975-.207-1.504-.344-1.857a3.257 3.257 0 00-.748-1.15 3.257 3.257 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
