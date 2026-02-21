const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    console.log("Fetching submissions...");
    // Just copy the basic query from actions/submissions.ts
    const { data, error } = await supabase
        .from('submissions')
        .select('*', { count: 'exact' })
        .eq('status', 'aprovado')
        .order('created_at', { ascending: false })
        .range(0, 9);

    if (error) {
        console.error("SUPABASE ERROR:", error);
    } else {
        console.log("Success. Rows:", data.length);
        console.log("First row keys:", Object.keys(data[0] || {}));
    }
}

check();
