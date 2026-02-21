const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Inspecting 'submissions' table...");
    // We can't easily query information_schema from the anon client if RLS is on 
    // and it's restricted, but we can try to fetch one row and look at keys again, 
    // or try a dummy insert to see the specific error.

    const { data, error } = await supabase.from('submissions').select('*').limit(1);

    if (error) {
        console.error("Error fetching:", error);
    } else {
        console.log("Current columns:", Object.keys(data[0] || {}));
    }

    // Try dummy insert with testimonial to confirm it fails
    console.log("Testing insert with 'testimonial'...");
    const { error: insError } = await supabase.from('submissions').insert([{
        title: 'test',
        authors: 'test',
        description: 'test',
        media_type: 'image',
        media_url: '[]',
        testimonial: 'test'
    }]);

    if (insError) {
        console.log("Insert failed as expected:", insError.message, insError.code);
    } else {
        console.log("Insert succeeded? (testimonial exists)");
    }
}

checkSchema();
