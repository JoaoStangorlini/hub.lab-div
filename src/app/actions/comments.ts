'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addComment(submissionId: string, authorName: string, content: string) {
    if (!authorName.trim() || !content.trim()) {
        throw new Error('Nome e comentário são obrigatórios.');
    }

    const { error } = await supabase
        .from('comments')
        .insert([{
            submission_id: submissionId,
            author_name: authorName.trim(),
            content: content.trim()
        }]);

    if (error) {
        console.error("Error adding comment:", error);
        throw new Error('Falha ao adicionar comentário.');
    }

    revalidatePath(`/arquivo/${submissionId}`);
}
