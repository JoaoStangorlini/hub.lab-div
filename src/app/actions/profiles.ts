'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Profile } from '@/types';

export async function updateProfile(updates: Partial<Profile>) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Não autorizado' };
    }

    // Get current profile status
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('review_status, pending_edits')
        .eq('id', user.id)
        .single();

    // ALL changes by users (non-admins) go to pending_edits for review.
    // The main columns always hold the last approved version.
    const updatePayload = {
        pending_edits: {
            ...(currentProfile?.pending_edits || {}),
            ...updates
        },
        review_status: 'pending'
    };

    // Special case: username/use_nickname should probably be live if they are just toggles?
    // Actually, user wants "ao editar deve ser aprovado pelo adm". So everything goes to pending.

    // BUT, we want to allow immediate nickname selection if it's already created?
    // Let's stick to the rule: ALL edits go to pending.

    const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
    }

    revalidatePath('/lab');
    revalidatePath('/admin/profiles');
    return { success: true, data };
}

export async function approveProfile(profileId: string) {
    const supabase = await createServerSupabase();
    const { data: { user: adminUser } } = await supabase.auth.getUser();

    if (!adminUser) return { error: 'Não autorizado' };

    // Admin check
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single();
    if (adminProfile?.role !== 'admin') return { error: 'Acesso negado' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    if (!profile) return { error: 'Perfil não encontrado' };

    const finalData = {
        ...(profile.pending_edits || {}),
        pending_edits: null,
        review_status: 'approved'
    };

    const { error } = await supabase
        .from('profiles')
        .update(finalData)
        .eq('id', profileId);

    if (error) return { error: error.message };

    revalidatePath('/lab');
    revalidatePath('/admin/profiles');
    revalidatePath('/orbit'); // Revalidate orbit view too
    return { success: true };
}

export async function getProfileWithPseudonyms() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (pError) return { error: pError.message };

    // Merge pending_edits so the user sees their latest draft in the modal
    const profileWithEdits = {
        ...profile,
        ...(profile.pending_edits || {}),
        email: user.email // Inject explicit email from Auth
    };

    const { data: pseudonyms, error: psError } = await supabase
        .from('pseudonyms')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

    return {
        profile: profileWithEdits as Profile,
        pseudonyms: pseudonyms || []
    };
}

export async function uploadEnrollmentProof(formData: FormData) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const file = formData.get('proof') as File | null;
    if (!file || file.size === 0) return { error: 'Arquivo inválido' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `proofs/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('enrollment_proofs')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error('Error uploading proof:', uploadError);
        return { error: 'Falha ao fazer upload do comprovante' };
    }

    return { success: true, path: filePath };
}

export async function getEnrollmentProofUrl(path: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Admin Check
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') return { error: 'Acesso negado' };

    // Valid for 60 seconds
    const { data, error } = await supabase.storage
        .from('enrollment_proofs')
        .createSignedUrl(path, 60);

    if (error || !data) {
        console.error('Error creating signed URL:', error);
        return { error: 'Erro ao gerar link de visualização' };
    }

    return { success: true, url: data.signedUrl };
}
