// scripts/smoke-test.ts
// Verifies DB connectivity and critical schema existence

import { getSupabaseClient } from '../lib/supabase';

const supabase = getSupabaseClient();

async function runSmokeTest() {
  console.log("🔥 Starting MCE Command Center v2.0 Smoke Test...");

  const tables = [
    { name: 'projects_master', module: 'Portfolio' },
    { name: 'tenders', module: 'Pipeline' },
    { name: 'tender_requirements', module: 'Tender Wizard' },
    { name: 'purchase_orders', module: 'Iron Dome' },
    { name: 'documents', module: 'Registry' },
    { name: 'document_embeddings', module: 'RAG Hybrid' },
    { name: 'audit_logs', module: 'Compliance' }
  ];

  console.log("\n--- SCHEMA INTEGRITY CHECK ---");
  for (const table of tables) {
    const { error } = await supabase.from(table.name).select('id').limit(1);
    if (error) {
      console.error(`❌ [${table.module}] Table '${table.name}' MISSING or INACCESSIBLE`);
    } else {
      console.log(`✅ [${table.module}] Table '${table.name}': ONLINE`);
    }
  }

  // 3. RAG Column Check (FTS)
  const { data: embeddingCols } = await supabase.rpc('get_table_columns', { table_name: 'document_embeddings' } as any);
  // Note: if RPC doesn't exist, we fallback to a manual check
  const { error: ftsError } = await supabase.from('document_embeddings').select('fts').limit(1);
  if (ftsError) {
    console.warn("⚠️ [RAG Hybrid] 'fts' column not detected. Hybrid search might be degraded.");
  } else {
    console.log("✅ [RAG Hybrid] Hybrid Search Index (FTS): ACTIVE");
  }

  console.log("\n🚀 SMOKE TEST COMPLETED: Review logs for any module variances.");
}

runSmokeTest();
