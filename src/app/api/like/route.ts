import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateFingerprint(request: NextRequest): string {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    // Simple hash: combine IP + UA into a deterministic string
    const raw = `${ip}::${userAgent}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(36);
}

export async function POST(request: NextRequest) {
    try {
        const { submission_id } = await request.json();

        if (!submission_id) {
            return NextResponse.json({ error: 'submission_id is required' }, { status: 400 });
        }

        const fingerprint = generateFingerprint(request);

        // Call the atomic RPC function
        const { data: result, error } = await supabase.rpc('toggle_like', {
            p_submission_id: submission_id,
            p_fingerprint: fingerprint
        });

        if (error) {
            console.error('Supabase RPC Error:', error);
            throw error;
        }

        // result.liked (boolean) and result.count (integer) returned from RPC
        return NextResponse.json({
            liked: result.liked,
            likeCount: result.count
        });

    } catch (error: unknown) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
