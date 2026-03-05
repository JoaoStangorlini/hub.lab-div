import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for testing

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const userId = '64f451cd-54db-44bd-814f-a91c1fc77f0a'; // Joao Paulo
    console.log("Testing for user:", userId);

    // 1. Busca mensagens
    const { data: messages, error: mError } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (mError) {
        console.error("Messages error:", mError);
    }
    console.log("Messages found:", messages?.length || 0);

    // 2. Busca follows
    const { data: follows, error: fError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

    console.log("Follows found:", follows?.length || 0);

    const conversationMap = new Map();
    messages?.forEach(m => {
        const peerId = m.sender_id === userId ? m.recipient_id : m.sender_id;
        if (!conversationMap.has(peerId)) {
            conversationMap.set(peerId, {
                lastMessage: m.content,
                lastAt: m.created_at
            });
        }
    });

    const followedIds = follows?.map(f => f.following_id) || [];
    const allPeerIds = Array.from(new Set([
        ...Array.from(conversationMap.keys()),
        ...followedIds
    ]));

    console.log("allPeerIds:", allPeerIds);

    if (allPeerIds.length === 0) {
        console.log("No peers found.");
        return;
    }

    // 3. Busca perfis
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name, username, use_nickname, email, avatar_url, xp, level')
        .in('id', allPeerIds);

    if (pError) {
        console.error("Profiles error:", pError);
    }
    console.log("Profiles found:", profiles?.length || 0);
    console.log("Profiles data:", profiles);
}

test();
