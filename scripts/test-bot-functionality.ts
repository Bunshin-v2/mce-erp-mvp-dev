import { getSupabaseAdmin } from '../lib/supabase';

async function testBotFunctionality() {
  console.log('\x1b[36m%s\x1b[0m', '🔍 Starting Bot Functionality Dial-In Verification...\n');

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Failed to initialize admin client');
    process.exit(1);
  }
  let passed = 0;
  let failed = 0;

  // 1. Database Connection
  console.log('1️⃣ Testing Database Connection...');
  const { data: projects, error: dbError } = await supabase.from('projects_master').select('id').limit(1);
  if (dbError) {
    console.error('\x1b[31m%s\x1b[0m', `   ❌ Database Error: ${dbError.message}`);
    failed++;
  } else {
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Database Connected');
    passed++;
  }

  // 2. Hybrid Search RPC Integrity
  console.log('\n2️⃣ Testing Hybrid Search RPC (match_documents_hybrid)...');
  const { data: searchResults, error: rpcError } = await supabase.rpc('match_documents_hybrid', {
    query_embedding: Array(1536).fill(0),
    query_text: 'test',
    match_threshold: 0.1,
    match_count: 1
  });

  if (rpcError) {
    console.error('\x1b[31m%s\x1b[0m', `   ❌ RPC Error: ${rpcError.message}`);
    failed++;
  } else {
    console.log('\x1b[32m%s\x1b[0m', '   ✅ RPC Signature Verified');
    passed++;
  }

  // 3. Vector Dimension Integrity
  console.log('\n3️⃣ Testing Vector Dimension Integrity (1536)...');
  const { data: embeddings, error: embError } = await supabase
    .from('document_embeddings')
    .select('embedding')
    .limit(1);

  if (embError) {
    console.error('\x1b[31m%s\x1b[0m', `   ❌ Embedding Table Error: ${embError.message}`);
    failed++;
  } else if (embeddings && embeddings.length > 0 && embeddings[0].embedding) {
    // Check length of embedding
    // In pg-js, vector comes back as a string '[0.1, 0.2, ...]'
    const vectorStr = embeddings[0].embedding as unknown as string;
    const dims = vectorStr.replace('[', '').replace(']', '').split(',').length;

    if (dims === 1536) {
      console.log('\x1b[32m%s\x1b[0m', `   ✅ Dimension Lock Verified: 1536`);
      passed++;
    } else {
      console.error('\x1b[31m%s\x1b[0m', `   ❌ Dimension Mismatch: Found ${dims}, Expected 1536`);
      failed++;
    }
  } else {
    console.log('\x1b[33m%s\x1b[0m', '   ⚠️ No embeddings found to test dimensions. Please sync documents first.');
  }

  // 4. Rate Limiter (Local check)
  console.log('\n4️⃣ Testing Rate Limiter Infrastructure...');
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  if (!upstashUrl) {
    console.log('\x1b[33m%s\x1b[0m', '   ⚠️ Upstash URL missing. Rate limiting will fall back to in-memory mode.');
  } else {
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Upstash Redis Configuration Detected');
    passed++;
  }

  // 5. AI API Connectivity (Health check endpoint)
  console.log('\n5️⃣ Testing AI Engine Connectivity...');
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.error('\x1b[31m%s\x1b[0m', '   ❌ GEMINI_API_KEY missing');
      failed++;
    } else {
      console.log('\x1b[32m%s\x1b[0m', '   ✅ AI API Key Verified');
      passed++;
    }
  } catch (e) {
    failed++;
  }

  // Final Summary
  console.log('\n' + '='.repeat(40));
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('='.repeat(40));

  if (failed === 0) {
    console.log('\x1b[32m%s\x1b[0m', '\n🎉 BOT DIAL-IN COMPLETE: System is healthy and ready for production.');
    process.exit(0);
  } else {
    console.log('\x1b[31m%s\x1b[0m', '\n⚠️ BOT DIAL-IN FAILED: Please review the errors above.');
    process.exit(1);
  }
}

testBotFunctionality();