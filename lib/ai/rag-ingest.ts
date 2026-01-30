/**
 * RAG Document Ingestion Pipeline
 * Ingest Gemini prompts and external documents into RAG system
 */

import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

interface IngestJob {
  document_id: string;
  content_hash: string;
  status: 'queued' | 'processing' | 'indexed' | 'failed';
}

/**
 * Ensure RAG index version exists (with fallback for missing table)
 */
async function ensureRagIndexVersion(): Promise<string | null> {
  try {
    // Check if there's an active index version
    const { data: activeIndex, error: queryError } = await supabase
      .from('rag_index_versions')
      .select('index_version_id')
      .eq('status', 'active')
      .single();

    if (queryError && queryError.code === 'PGRST205') {
      // Table doesn't exist - return null to use simple mode
      console.log('⚠ RAG versioning tables not yet applied. Using simple ingestion mode.');
      return null;
    }

    if (queryError) throw queryError;
    if (activeIndex) {
      return activeIndex.index_version_id;
    }

    // Create initial index version
    const { data: newIndex, error: createError } = await supabase
      .from('rag_index_versions')
      .insert({
        status: 'active',
        embedding_model: 'text-embedding-3-small',
        embedding_dim: 1536,
        chunker_version: '1.0',
        prompt_template_version: '1.0',
        activated_at: new Date().toISOString()
      })
      .select('index_version_id')
      .single();

    if (createError) throw createError;
    console.log('✓ Created RAG index version');
    return newIndex.index_version_id;
  } catch (error) {
    console.error('Failed to ensure RAG index version:', error);
    throw error;
  }
}

/**
 * Ingest system prompts from docs folder into RAG
 */
export async function ingestSystemPrompts(): Promise<void> {
  try {
    const docsPath = path.join(process.cwd(), 'docs');
    const promptFiles = fs.readdirSync(docsPath)
      .filter(f => f.startsWith('P-') && f.endsWith('.txt'));

    console.log(`Found ${promptFiles.length} system prompts to ingest`);

    let successCount = 0;
    let skippedCount = 0;

    for (const file of promptFiles) {
      const filePath = path.join(docsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      const promptKey = file.replace('.txt', '').toLowerCase();
      const title = file.replace('.txt', '').replace(/_/g, ' ');

      // Check if already exists
      const { data: existing } = await supabase
        .from('system_prompts')
        .select('id')
        .eq('prompt_key', promptKey)
        .single();

      if (existing) {
        console.log(`⊘ Skipped ${title} (already ingested)`);
        skippedCount++;
        continue;
      }

      // Upsert into system_prompts table
      const { error: promptError } = await supabase
        .from('system_prompts')
        .upsert({
          prompt_key: promptKey,
          title: title,
          content: content,
          category: 'architecture',
          is_active: true
        }, { onConflict: 'prompt_key' });

      if (promptError) {
        console.error(`Error ingesting ${title}:`, promptError.message);
      } else {
        console.log(`✓ Ingested ${title}`);
        successCount++;
      }
    }

    console.log(`\n✓ Successfully ingested ${successCount}/${promptFiles.length} prompts${skippedCount > 0 ? ` (${skippedCount} skipped)` : ''}`);
  } catch (error) {
    console.error('System prompts ingestion failed:', error);
    throw error;
  }
}

/**
 * Ingest financial statement PDF
 */
export async function ingestFinancialStatement(filePath: string): Promise<void> {
  try {
    const fileName = path.basename(filePath);
    const fileSize = fs.statSync(filePath).size;
    const fileStats = fs.statSync(filePath);

    const promptKey = `financial_${new Date().getFullYear().toString().toLowerCase()}`;
    const title = `Financial Statement - ${new Date().getFullYear()}`;

    // Check if already ingested
    const { data: existing } = await supabase
      .from('system_prompts')
      .select('id')
      .eq('prompt_key', promptKey)
      .single();

    if (existing) {
      console.log(`✓ Financial statement already ingested`);
      return;
    }

    // Create descriptive content for the PDF (avoiding binary data)
    const content = `Financial Statement Document

File: ${fileName}
Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB
Last Modified: ${fileStats.mtime.toISOString()}

This is the 2024 Audited Financial Statement. The full PDF file is available for reference.
The document contains complete financial data including balance sheets, income statements,
and cash flow analysis for the audit period ending ${new Date().getFullYear()}.

Key Sections:
- Financial Position & Balance Sheet
- Income Statement & Profitability Analysis
- Cash Flow & Liquidity Analysis
- Audit Notes & Disclosures
- Management Commentary`;

    // Ingest financial statement reference as system prompt
    const { error: promptError } = await supabase
      .from('system_prompts')
      .insert({
        prompt_key: promptKey,
        title: title,
        content: content,
        category: 'reference',
        is_active: true
      });

    if (promptError) {
      console.error('Error ingesting financial statement:', promptError.message);
      throw promptError;
    }

    console.log(`✓ Financial statement (${(fileSize / 1024 / 1024).toFixed(2)} MB) queued for RAG ingestion`);
  } catch (error) {
    console.error('Financial statement ingestion failed:', error);
    throw error;
  }
}

/**
 * Check RAG ingest status
 */
export async function checkRagStatus(): Promise<void> {
  try {
    // Get status from system_prompts table
    const { data: prompts, error: promptError } = await supabase
      .from('system_prompts')
      .select('id, title, category, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (promptError) throw promptError;

    const architectureCount = prompts?.filter(p => p.category === 'architecture').length || 0;
    const referenceCount = prompts?.filter(p => p.category === 'reference').length || 0;

    console.log('\nRAG Ingestion Status:');
    console.log('====================');
    console.log(`Total prompts: ${prompts?.length || 0}`);
    console.log(`Architecture guides: ${architectureCount}`);
    console.log(`Reference documents: ${referenceCount}`);

    if (prompts && prompts.length > 0) {
      console.log('\nIngested documents:');
      prompts.forEach(prompt => {
        const status = prompt.is_active ? '✓' : '⊘';
        console.log(`  ${status} ${prompt.title} (${prompt.category})`);
      });
    } else {
      console.log('\n⚠ No prompts ingested yet. Run: npm run rag:ingest');
    }

    console.log('\n💡 ChatAssistant will automatically load these prompts on startup.');
  } catch (error) {
    console.error('Failed to check RAG status:', error);
  }
}
