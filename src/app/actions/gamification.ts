'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitQuizResults(score: number, xpAwarded: number) {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Não autenticado' }

    // Award XP via the RPC function we defined in SQL
    const { error: xpError } = await supabase.rpc('add_radiation_xp', {
        p_profile_id: user.id,
        p_points: xpAwarded
    })

    if (xpError) {
        console.error('XP Award Error:', xpError);
        return { error: 'Erro ao atribuir radiação' }
    }

    // Log the attempt
    const { error: attemptError } = await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        score,
        xp_awarded: xpAwarded
    })

    if (attemptError) {
        console.error('Quiz attempt log error:', attemptError);
    }

    revalidatePath('/laboratorio')
    revalidatePath('/wiki/quiz')

    return { success: true }
}
