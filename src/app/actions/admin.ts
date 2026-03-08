'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const BulkActionSchema = z.object({
    submission_ids: z.array(z.string().uuid()).min(1, "Selecione ao menos um item"),
});

/**
 * Valida sugestões de IA em massa com proteção Zod
 */
export async function validateAISuggestionsBulk(ids: string[]) {
    // 1. Validação Strict
    const result = BulkActionSchema.safeParse({ submission_ids: ids });

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message };
    }

    // 2. Chamada RPC Atômica
    const supabase = await createServerSupabase();
    const { error } = await supabase.rpc('accept_ai_suggestions_bulk', {
        submission_ids: result.data.submission_ids
    });

    if (error) {
        console.error('Erro na RPC Bulk Validate:', error);
        return { success: false, error: 'Falha no processamento atômico do banco de dados.' };
    }

    revalidatePath('/admin/acervo');
    return { success: true };
}

/**
 * Solicita re-processamento de IA para itens com erro
 */
export async function reprocessAI(submissionId: string) {
    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from('submissions')
        .update({ ai_status: 'pending' })
        .eq('id', submissionId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/acervo');
    return { success: true };
}

/**
 * Vincula uma submissão a uma trilha e tópico.
 */
export async function linkSubmissionToTrail(submissionId: string, trailId: string, topicIndex: number) {
    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from('trail_submissions')
        .insert({
            submission_id: submissionId,
            trail_id: trailId,
            topic_index: topicIndex,
            sort_order: 0
        });

    if (error) {
        console.error('Erro ao vincular trilha:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/acervo');
    revalidatePath(`/trilhas/${trailId}`);
    return { success: true };
}

/**
 * Remove o vínculo de uma submissão com uma trilha.
 */
export async function unlinkSubmissionFromTrail(linkId: string, trailId: string) {
    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from('trail_submissions')
        .delete()
        .eq('id', linkId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/acervo');
    revalidatePath(`/trilhas/${trailId}`);
    return { success: true };
}

/**
 * Busca todas as trilhas para o seletor administrativo.
 */
export async function fetchAllTrails() {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from('learning_trails')
        .select('id, title, course_code, program')
        .order('title');

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

/**
 * Busca todas as trilhas às quais uma submissão já está vinculada.
 */
export async function fetchSubmissionTrails(submissionId: string) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from('trail_submissions')
        .select(`
            id,
            trail_id,
            topic_index,
            learning_trails(title, course_code)
        `)
        .eq('submission_id', submissionId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
