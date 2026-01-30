/**
 * Check RAG ingestion status
 * Run: npm run rag:status
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { checkRagStatus } from '@/lib/ai/rag-ingest';

async function main() {
  console.log('Checking RAG ingestion status...');
  console.log('='.repeat(50));

  try {
    await checkRagStatus();
  } catch (error) {
    console.error('Status check failed:', error);
    process.exit(1);
  }
}

main();
