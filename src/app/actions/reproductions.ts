'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addReproduction(submissionId: string, userId: string, textContent: string, mediaUrl?: string, title?: string) {
    const { error } = await supabase
        .from('reproductions')
        .insert([{
            submission_id: submissionId,
            user_id: userId,
            title: title || null,
            text_content: textContent,
            media_url: mediaUrl,
            status: 'pendente'
        }]);

    if (error) {
        console.error("Error adding reproduction:", error);
        throw new Error('Falha ao enviar reprodução.');
    }

    revalidatePath(`/arquivo/${submissionId}`);
    revalidatePath('/comunidade');
}

export async function fetchReproductionsBySubmission(submissionId: string) {
    const { data, error } = await supabase
        .from('reproductions')
        .select('*, profiles(full_name, avatar_url)')
        .eq('submission_id', submissionId)
        .eq('status', 'aprovado')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching reproductions:", error);
        return [];
    }

    return data;
}
