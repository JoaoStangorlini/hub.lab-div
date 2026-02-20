import Link from 'next/link';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-background-dark/90 transition-colors">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-2xl">science</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold tracking-tight text-text-main dark:text-white leading-none">Arquivo Lab-Div</h1>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Instituto de Física</span>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        href="/enviar"
                        className="flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-xs sm:text-sm sm:px-4 sm:flex font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none shadow-sm"
                    >
                        Enviar Contribuição
                    </Link>
                    <button className="md:hidden p-2 text-text-main dark:text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60"></div>
        </header>
    );
}
