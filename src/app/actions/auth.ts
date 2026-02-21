'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const password = formData.get('password') as string;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!password) {
        return { error: 'Por favor, insira a senha.' };
    }

    if (!adminPassword) {
        console.error('ADMIN_PASSWORD não está definida nas variáveis de ambiente');
        return { error: 'Erro de configuração do servidor.' };
    }

    if (password === adminPassword) {
        // Se a senha estiver correta, criamos o cookie com segurança
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 semana // Expira em 7 dias
        });

        // Redireciona para o painel
        redirect('/admin');
    } else {
        return { error: 'Senha incorreta. Tente novamente.' };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/');
}
