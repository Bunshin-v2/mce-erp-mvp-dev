/**
 * Ingest financial statement PDF into RAG
 * Run: npm run rag:ingest-financial
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { ingestFinancialStatement, checkRagStatus } from '@/lib/ai/rag-ingest';
import path from 'path';

async function main() {
  const pdfPath = path.join(process.cwd(), '2024 Audited Financial Statement.pdf');

  console.log(`Ingesting financial statement from: ${pdfPath}`);
  console.log('='.repeat(50));

  try {
    await ingestFinancialStatement(pdfPath);
    console.log('\n✓ Financial statement queued for RAG ingestion!');
    console.log('\nChecking status...');
    await checkRagStatus();
  } catch (error) {
    console.error('Ingestion failed:', error);
    process.exit(1);
  }
}

main();
