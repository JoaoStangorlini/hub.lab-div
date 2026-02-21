'use server';

import { supabase } from '@/lib/supabase';
import { MediaCardProps } from '@/components/MediaCard';

export interface FetchParams {
    page: number;
    limit: number;
    query: string;
    category: string;
    sort: 'recentes' | 'antigas';
}

export async function fetchSubmissions({ page, limit, query, category, sort }: FetchParams): Promise<{ items: MediaCardProps[], hasMore: boolean }> {
    let queryBuilder = supabase
        .from('submissions')
        .select('*', { count: 'exact' })
        .eq('status', 'aprovado');

    // Filtering
    if (category !== 'Todos') {
        queryBuilder = queryBuilder.eq('category', category);
    }

    if (query) {
        // Use textSearch for better performance with GIN index on title and description,
        // or ilike as a fallback if plain search is preferred. We'll use ilike on a concatenated string
        // or multiple ilike conditions if we want partial matches without full text config.
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,authors.ilike.%${query}%`);
    }

    // Sorting
    if (sort === 'antigas') {
        queryBuilder = queryBuilder.order('created_at', { ascending: true });
    } else {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data: submissions, error, count } = await queryBuilder;

    if (error || !submissions) {
        console.error('Error fetching submissions', error);
        return { items: [], hasMore: false };
    }

    // Fetch like counts for ONLY the returned submissions
    const submissionIds = submissions.map(s => s.id);
    const { data: likeCounts } = await supabase
        .from('curtidas')
        .select('submission_id')
        .in('submission_id', submissionIds);

    const likeMap: Record<string, number> = {};
    if (likeCounts) {
        for (const row of likeCounts) {
            likeMap[row.submission_id] = (likeMap[row.submission_id] || 0) + 1;
        }
    }

    const items: MediaCardProps[] = submissions.map(sub => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        authors: sub.authors,
        mediaType: sub.media_type,
        mediaUrl: sub.media_url,
        category: sub.category,
        isFeatured: sub.featured,
        likeCount: likeMap[sub.id] || 0,
        external_link: sub.external_link,
        created_at: sub.created_at,
        technical_details: sub.technical_details,
        alt_text: sub.alt_text,
    }));

    const hasMore = count ? from + submissions.length < count : false;

    return { items, hasMore };
}
