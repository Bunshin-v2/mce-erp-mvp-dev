
import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables FIRST
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

// Initialize Supabase Admin client
const supabase = createClient(supabaseUrl, supabaseKey);

// Formatting helper for Project-based documents
function formatProjectContext(project: any): string {
    return `
PROJECT: ${project.project_name} (Code: ${project.project_code})
CLIENT: ${project.client_name}
STATUS: ${project.project_status}
LOCATION: ${project.project_address || 'N/A'}

CONTRACT DETAILS:
- Value: AED ${project.contract_value_excl_vat}
- Start Date: ${project.project_start_date}
- Planned Completion: ${project.project_completion_date_planned}
- Actual Completion: ${project.project_completion_date_actual || 'Ongoing'}

PERFORMANCE:
- Completion %: ${project.completion_percent}%
- Delivery Risk: ${project.delivery_risk_rating}

DESCRIPTION:
${project.scope_of_work || 'No scope definition provided.'}
  `.trim();
}

async function main() {
    // Dynamic import to ensure env vars are loaded
    const { ragPipeline } = await import('../utils/rag');

    console.log('Starting Retroactive Document Sync...');

    const { data: docs, error } = await supabase
        .from('documents')
        .select('*');

    if (error || !docs) {
        console.error('Failed to fetch documents:', error);
        process.exit(1);
    }

    console.log(`Found ${docs.length} documents.`);

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (const doc of docs) {
        console.log(`Processing Document ${doc.id} (${doc.title || 'Untitled'})...`);

        let text = '';

        try {
            if (doc.project_id) {
                console.log(`  -> Type: Project Link (Project ID: ${doc.project_id})`);
                const { data: project } = await supabase
                    .from('projects_master')
                    .select('*')
                    .eq('id', doc.project_id)
                    .single();

                if (project) {
                    text = formatProjectContext(project);
                } else {
                    console.warn(`  -> Warning: Project ${doc.project_id} not found.`);
                }
            } else if (doc.storage_path) {
                console.log(`  -> Type: File (Path: ${doc.storage_path})`);
                const { data: fileData, error: downloadError } = await supabase.storage
                    .from('documents')
                    .download(doc.storage_path);

                if (downloadError) {
                    console.warn(`  -> Warning: Failed to download file: ${downloadError.message}`);
                } else if (fileData) {
                    text = await fileData.text();
                }
            } else {
                console.log(`  -> Skipped: No project_id or storage_path found.`);
                skipCount++;
                continue;
            }

            if (text && text.trim().length > 0) {
                const result = await ragPipeline.processDocument(doc.id, text, doc.tenant_id, supabase);
                if (result.success) {
                    console.log(`  -> Success! Indexed ${result.chunksProcessed} chunks.`);
                    successCount++;
                } else {
                    console.error(`  -> Failed to index.`);
                    failCount++;
                }
            } else {
                console.warn(`  -> Skipped: text content is empty.`);
                skipCount++;
            }
        } catch (err: any) {
            console.error(`  -> Error processing doc ${doc.id}: ${err.message}`);
            failCount++;
        }
    }

    console.log('\n--- Sync Complete ---');
    console.log(`Total: ${docs.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Skipped: ${skipCount}`);
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
