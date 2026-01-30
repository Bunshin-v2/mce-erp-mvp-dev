
import { createClient } from '@supabase/supabase-js';

const url = "https://ywiwcrbwvdrjtujjgejx.supabase.co";
// Testing the "sb_publishable" key that appeared to work
const key = "sb_publishable_rnpXwns0i7vkiOeEm7wPMw_EriC47mv";

console.log("Deep Verification of Key: " + key);

const supabase = createClient(url, key);

async function testConnection() {
    try {
        // Attempt to actually read data, not just count
        const { data, error } = await supabase
            .from('projects_master')
            .select('project_name, project_code')
            .limit(3);

        if (error) {
            console.error("❌ READ FAILED: " + error.message);
        } else {
            console.log("✅ READ SUCCESS!");
            console.log("   Data Sample:", JSON.stringify(data, null, 2));

            if (Array.isArray(data) && data.length === 0) {
                console.warn("   ⚠️ Warning: Connection succeeded but table is empty or RLS hidden.");
            }
        }

    } catch (err: any) {
        console.error("❌ EXCEPTION: " + err.message);
    }
}

testConnection();
