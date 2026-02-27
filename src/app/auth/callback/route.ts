import { createServerSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        // Use the cookie-aware server client so the session
        // is properly persisted in the browser via set-cookie headers
        const supabase = await createServerSupabase();
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && session) {
            const track = searchParams.get('track');
            const email = session.user.email || '';
            const isUspDomain = email.endsWith('@usp.br') || email.endsWith('@alumni.usp.br');

            // Hard-Lock Security Refined: If they chose the USP track but didn't provide a USP email
            if (track === 'usp' && !isUspDomain) {
                console.warn(`Auth Conflict: Non-USP email attempted USP login: ${email}`);
                // Redirect back to login with conflict flag instead of silent signOut
                const conflictUrl = new URL('/login', request.url);
                conflictUrl.searchParams.set('conflict', 'true');
                conflictUrl.searchParams.set('email', email);
                conflictUrl.searchParams.set('next', next);
                return NextResponse.redirect(conflictUrl);
            }

            // Sync profile data (simple set is_usp_member based on domain)
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ is_usp_member: isUspDomain })
                .eq('id', session.user.id);

            if (profileError) {
                console.error('Profile sync error:', profileError);
            }

            // Ensure redirect is absolute or properly constructed
            console.log(`Auth Success: Redirecting to ${next}`);
            const baseUrl = request.nextUrl.origin;
            const redirectUrl = new URL(next, baseUrl);

            return NextResponse.redirect(redirectUrl.toString());
        }
        console.error('Auth callback: Code exchange failed or no session', error);
    } else {
        console.warn('Auth callback: No code provided in URL');
    }

    // Error: redirect back to login with a specific error flag
    const baseUrl = request.nextUrl.origin;
    const errorUrl = new URL('/login', baseUrl);
    errorUrl.searchParams.set('error', 'auth-code-error');
    return NextResponse.redirect(errorUrl.toString());
}

