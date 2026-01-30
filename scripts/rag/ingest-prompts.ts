/**
 * Ingest all Gemini system prompts into RAG
 * Run: npm run rag:ingest
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { ingestSystemPrompts, checkRagStatus } from '@/lib/ai/rag-ingest';

async function main() {
  console.log('Starting system prompts ingestion...');
  console.log('='.repeat(50));

  try {
    await ingestSystemPrompts();
    console.log('\n✓ Ingestion complete!');
    console.log('\nChecking status...');
    await checkRagStatus();
  } catch (error) {
    console.error('Ingestion failed:', error);
    process.exit(1);
  }
}

main();
