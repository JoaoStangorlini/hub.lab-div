import { createServerSupabase } from '@/lib/supabase/server';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { notFound } from 'next/navigation';
import TrailDetailsClient from '../TrailDetailsClient';

export const revalidate = 0;

async function getTrailData(id: string) {
    const supabase = await createServerSupabase();

    const { data: trail, error: trailError } = await supabase
        .from('learning_trails')
        .select('*')
        .eq('id', id)
        .single();

    if (trailError || !trail) return null;

    // Fetch initial batch of materials (limit 6 for v2 architecture)
    const { data: materials, count: totalMaterials, error: matError } = await supabase
        .from('trail_submissions')
        .select(`
            trail_id,
            topic_index,
            sort_order,
            submissions!inner (
                id,
                title,
                authors,
                description,
                media_type,
                media_url,
                created_at,
                views,
                like_count,
                status
            )
        `, { count: 'exact' })
        .eq('trail_id', id)
        .eq('submissions.status', 'aprovado')
        .order('sort_order', { ascending: true })
        .limit(6);

    if (matError) {
        console.error(' [DEBUG] matError:', matError);
    }



    // Resolve prerequisite trail names
    let prerequisiteTrails: { course_code: string; title: string; id: string }[] = [];
    if (trail.prerequisites && trail.prerequisites.length > 0) {
        const { data: prereqs } = await supabase
            .from('learning_trails')
            .select('id, course_code, title')
            .in('course_code', trail.prerequisites);
        prerequisiteTrails = prereqs || [];
    }

    // Fetch equivalent trails
    let equivalentTrails: { id: string; course_code: string; title: string; axis: string }[] = [];
    if (trail.equivalence_group) {
        const { data: eqTrails } = await supabase
            .from('learning_trails')
            .select('id, course_code, title, axis')
            .eq('equivalence_group', trail.equivalence_group)
            .neq('id', trail.id);
        equivalentTrails = eqTrails || [];
    }

    // Fetch XOR exclusions
    let xorExclusions: { group_a: string; group_b: string; reason: string }[] = [];
    if (trail.course_code || trail.equivalence_group) {
        const codes = [trail.course_code, trail.equivalence_group].filter(Boolean);
        const { data: xorData } = await supabase
            .from('equivalence_exclusions')
            .select('group_a, group_b, reason')
            .or(codes.map(c => `group_a.eq.${c},group_b.eq.${c}`).join(','));
        xorExclusions = xorData || [];
    }

    // Fetch user progress for current user (Cookie-aware)
    const { data: { user } } = await supabase.auth.getUser();
    let userProgress = null;
    let isCompleted = false;

    if (user) {
        // Fetch status/progresso (user_trail_progress)
        const { data: progress } = await supabase
            .from('user_trail_progress')
            .select('status, completed_topics')
            .eq('trail_id', id)
            .eq('user_id', user.id)
            .single();
        userProgress = progress;

        // Fetch se já foi concluída permanentemente (user_completed_trails)
        const { data: completed } = await supabase
            .from('user_completed_trails')
            .select('id')
            .eq('trail_id', id)
            .eq('user_id', user.id)
            .single();
        isCompleted = !!completed;
    }

    return {
        trail,
        materials: materials?.map((m: any) => ({
            ...m.submissions,
            topic_index: m.topic_index,
            submission_link_id: `${m.trail_id}-${m.submissions.id}`
        })) || [],
        totalMaterials: totalMaterials || 0,
        userProgress: userProgress || null,
        isCompleted,
        prerequisiteTrails,
        equivalentTrails,
        xorExclusions,
    };
}

export default async function TrailDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getTrailData(id);

    if (!data) notFound();

    return (
        <MainLayoutWrapper>
            <TrailDetailsClient
                trail={data.trail}
                initialMaterials={data.materials}
                totalMaterials={data.totalMaterials}
                userProgress={data.userProgress}
                isCompleted={data.isCompleted}
                prerequisiteTrails={data.prerequisiteTrails}
                equivalentTrails={data.equivalentTrails}
                xorExclusions={data.xorExclusions}
            />
        </MainLayoutWrapper>
    );
}
