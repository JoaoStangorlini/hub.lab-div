'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Lightweight presence badge for cards.
 * Subscribes to the same Supabase Realtime channel as PresenceIndicator
 * but renders as a compact badge suitable for grid cards.
 */
export function CardPresenceBadge({ submissionId }: { submissionId: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const channel = supabase.channel(`reading:${submissionId}`, {
            config: { presence: { key: 'user' } },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                setCount(Object.keys(channel.presenceState()).length);
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [submissionId]);

    if (count === 0) return null;

    return (
        <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-[10px] font-bold shadow-lg">
            <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-red"></span>
            </span>
            🔥 {count}
        </div>
    );
}
