import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    let queryBuilder = supabase
        .from('submissions')
        .select('*', { count: 'exact' })
        .eq('status', 'aprovado')
        .order('created_at', { ascending: false })
        .range(0, 9);

    const { data, error, count } = await queryBuilder;

    return NextResponse.json({
        data,
        error,
        count
    });
}
