'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ViewTrackerProps {
    submissionId: string;
}

export function ViewTracker({ submissionId }: ViewTrackerProps) {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (hasTracked.current) return;

        async function incrementView() {
            try {
                // Call the RPC function to increment views
                const { error } = await supabase.rpc('increment_view_count', {
                    submission_id: submissionId
                });

                if (!error) {
                    hasTracked.current = true;
                }
            } catch (err) {
                console.error('Failed to increment view count:', err);
            }
        }

        incrementView();
    }, [submissionId]);

    // This component renders nothing
    return null;
}
