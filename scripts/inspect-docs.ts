
import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) process.exit(1);

const supabase = createClient(url, key);

async function inspect() {
    try {
        const { data, error } = await supabase.from('documents').select('project_id').not('project_id', 'is', null).limit(5);
        if (error) console.error(error);
        else console.log('Project IDs:', data);
    } catch (e) {
        console.error(e);
    }
}

inspect();
