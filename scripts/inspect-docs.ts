
import { getSupabaseAdmin } from '../lib/supabase';

const supabase = getSupabaseAdmin();

if (!supabase) {
    console.error('Failed to initialize admin client');
    process.exit(1);
}

async function inspect() {
    try {
        const { data, error } = await supabase!.from('documents').select('project_id').not('project_id', 'is', null).limit(5);
        if (error) console.error(error);
        else console.log('Project IDs:', data);
    } catch (e) {
        console.error(e);
    }
}

inspect();
