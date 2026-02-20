import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Apenas intercepta rotas /admin e subrotas (exceto /admin/login)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        // Verifica se o cookie 'admin_session' existe e possui valor válido
        const authCookie = request.cookies.get('admin_session');

        // Se não possuir, ou não for a token validada, redireciona
        if (!authCookie || authCookie.value !== 'authenticated') {
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    // Configura o matcher para rodar o middleware apenas nas requisições que nos importam
    // Evita rodar em estáticos, arquivos públicos, chamadas de API internas ou home pages comuns
    matcher: ['/admin/:path*'],
};
