'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function answerSubmissionQuiz(submissionId: string, answers: number[]) {
    const supabase = await createServerSupabase();

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Você precisa estar logado para responder ao quiz.' };
    }

    // 2. Get submission quiz data
    const { data: submission, error: subError } = await supabase
        .from('submissions')
        .select('quiz, user_id')
        .eq('id', submissionId)
        .single();

    if (subError || !submission) {
        return { success: false, error: 'Submissão não encontrada.' };
    }

    const isAuthor = submission.user_id === user.id;

    // 3. Check if already answered
    const { data: existingResponse } = await supabase
        .from('submission_quiz_responses')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('user_id', user.id)
        .single();

    if (existingResponse && !isAuthor) {
        return { success: false, error: 'Você já respondeu ao quiz deste post.' };
    }

    const quiz = submission.quiz as any[];
    if (!quiz || quiz.length === 0) {
        return { success: false, error: 'Este post não possui um quiz.' };
    }

    // 5. Calculate score (10 XP per correct answer)
    let correctCount = 0;
    quiz.forEach((q, index) => {
        if (answers[index] === q.correct_option) {
            correctCount++;
        }
    });

    const xpToAward = isAuthor ? 0 : (correctCount * 10);

    // 6. Record response (Use upsert to allow authors to re-test)
    const { error: insertError } = await supabase
        .from('submission_quiz_responses')
        .upsert({
            submission_id: submissionId,
            user_id: user.id,
            score: correctCount,
            xp_awarded: xpToAward
        }, { onConflict: 'user_id, submission_id' });

    if (insertError) {
        console.error("Error saving quiz response:", insertError);
        return { success: false, error: 'Erro ao salvar sua resposta.' };
    }

    // 7. Award XP via RPC if score > 0
    if (xpToAward > 0) {
        const { error: xpError } = await supabase.rpc('add_radiation_xp', {
            p_profile_id: user.id,
            p_points: xpToAward
        });

        if (xpError) {
            console.error("Error awarding XP:", xpError);
        }
    }

    revalidatePath(`/arquivo/${submissionId}`);

    return {
        success: true,
        correctCount,
        totalCount: quiz.length,
        xpAwarded: xpToAward
    };
}

export async function checkQuizStatus(submissionId: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { answered: false };

    const { data } = await supabase
        .from('submission_quiz_responses')
        .select('score, xp_awarded')
        .eq('submission_id', submissionId)
        .eq('user_id', user.id)
        .single();

    return {
        answered: !!data,
        response: data
    };
}

// ─── Admin: Save/Update Quiz ────────────────────────────────────
import { z } from 'zod';

const QuizQuestionSchema = z.object({
    id: z.string(),
    question: z.string().min(3, 'Pergunta muito curta'),
    options: z.array(z.string().min(1)).length(4, 'Cada pergunta deve ter 4 opções'),
    correct_option: z.number().min(0).max(3),
});

const SaveQuizSchema = z.object({
    submissionId: z.string().uuid(),
    questions: z.array(QuizQuestionSchema).min(1, 'O quiz precisa de pelo menos 1 pergunta'),
});

export async function saveSubmissionQuiz(submissionId: string, questions: any[]) {
    const parsed = SaveQuizSchema.safeParse({ submissionId, questions });
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message || 'Dados inválidos.' };
    }

    const supabase = await createServerSupabase();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Não autenticado.' };
    }

    // Admin role check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
        return { success: false, error: 'Permissão negada. Somente administradores podem gerenciar quizzes.' };
    }

    // Save quiz to submissions table
    const { error: updateError } = await supabase
        .from('submissions')
        .update({ quiz: parsed.data.questions })
        .eq('id', submissionId);

    if (updateError) {
        console.error('Error saving quiz:', updateError);
        return { success: false, error: 'Erro ao salvar quiz no banco de dados.' };
    }

    revalidatePath(`/arquivo/${submissionId}`);
    revalidatePath('/admin/acervo');

    return { success: true };
}

export async function deleteSubmissionQuiz(submissionId: string) {
    const supabase = await createServerSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Não autenticado.' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
        return { success: false, error: 'Permissão negada.' };
    }

    const { error } = await supabase
        .from('submissions')
        .update({ quiz: null })
        .eq('id', submissionId);

    if (error) {
        console.error('Error deleting quiz:', error);
        return { success: false, error: 'Erro ao remover quiz.' };
    }

    revalidatePath(`/arquivo/${submissionId}`);
    revalidatePath('/admin/acervo');

    return { success: true };
}
