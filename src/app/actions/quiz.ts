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
