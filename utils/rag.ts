import { supabase, supabaseAdmin } from '../lib/supabase';
import { generateEmbeddingVector } from '../lib/ai/embeddings';
import { chunkDocument } from '../lib/rag/chunking';
import { logger } from '../lib/logger';

/**
 * Dynamic batch size calculation based on document count
 */
function calculateBatchSize(totalDocs: number): number {
  if (totalDocs < 50) return 20;      // Small sets: process fast
  if (totalDocs < 200) return 15;     // Medium sets: balanced
  if (totalDocs < 500) return 10;     // Large sets: slower but safer
  return 5;                           // Very large sets: conservative
}

/**
 * Retry logic for batch processing with exponential backoff
 */
async function processBatchWithRetry<T>(
  batch: T[],
  processor: (batch: T[]) => Promise<void>,
  retries = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await processor(batch);
      return true;
    } catch (error: any) {
      logger.warn('Batch processing failed, retrying', {
        attempt,
        maxRetries: retries,
        error: error.message,
        batchSize: batch.length
      });

      if (attempt === retries) {
        logger.error('Batch processing failed after retries', {
          batchSize: batch.length,
          error: error.message
        });
        return false;
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return false;
}

export const ragPipeline = {
  /**
   * 1. Generate Embeddings with Retry logic
   */
  async generateEmbedding(text: string, retries = 3): Promise<number[] | null> {
    for (let i = 0; i < retries; i++) {
      try {
        return await generateEmbeddingVector(text);
      } catch (err: any) {
        logger.error(`[RAG] Embedding attempt ${i + 1} failed`, { error: err.message });
        if (i === retries - 1) return null;
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
      }
    }
    return null;
  },

  /**
   * 2. Process & Store
   * Orchestrates the full pipeline with better error handling.
   */
  async processDocument(documentId: string, fullText: string, tenantId?: string, supabaseClient?: any) {
    logger.info(`Starting RAG pipeline for doc: ${documentId}`, { tenantId });

    const client = supabaseClient || supabase;

    // Fetch document metadata for Front Matter
    const { data: doc } = await (client
      .from('documents' as any) as any)
      .select('title, category, project_id')
      .eq('id', documentId)
      .single();

    const chunks = chunkDocument(fullText, {
      maxChunkSize: 1000
    });

    logger.info(`Generated ${chunks.length} chunks`);

    // Step 2: Generate all embeddings first
    const embeddingResults = await Promise.allSettled(
      chunks.map(chunk => this.generateEmbedding(chunk.content))
    );

    const failures = embeddingResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value));
    if (failures.length > 0 && chunks.length > 0) {
      logger.error(`[RAG] Failed to generate ${failures.length}/${chunks.length} embeddings`, { documentId });
    }

    // Step 3: Batch Insert
    const insertData = embeddingResults
      .map((res, i) => {
        if (res.status === 'fulfilled' && res.value) {
          return {
            document_id: documentId,
            tenant_id: tenantId,
            content: chunks[i].content,
            metadata: {
              ...chunks[i].metadata,
              documentId,
              tenantId,
              title: doc?.title,
              category: doc?.category,
              project_ref: doc?.project_id
            },
            embedding: res.value
          };
        }
        return null;
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);

    if (insertData.length === 0) {
      return { success: false, chunksProcessed: 0 };
    }

    const dbClient = supabaseClient || supabaseAdmin || supabase;

    const { error } = await (dbClient
      .from('document_embeddings' as any) as any)
      .insert(insertData);

    if (error) {
      logger.error("[RAG] Batch insert failed", { error: error.message, documentId });
      return { success: false, chunksProcessed: 0 };
    }

    // Step 4: Mark Document as Processed
    await (supabase.from('documents' as any) as any).update({ status: 'Reviewed' }).eq('id', documentId);

    logger.info(`RAG pipeline completed for doc: ${documentId}`, { chunksIndexed: insertData.length });
    return { success: true, chunksProcessed: insertData.length };
  },

  /**
   * 3. Process Documents with Batch Optimization
   * Handles large document sets with dynamic batching and progress tracking
   */
  async processDocumentBatch(
    documents: Array<{ id: string; content: string }>,
    tenantId?: string,
    supabaseClient?: any
  ): Promise<{ processedCount: number; failedCount: number }> {
    const batchSize = calculateBatchSize(documents.length);
    const totalBatches = Math.ceil(documents.length / batchSize);

    logger.info('Starting batch processing', {
      totalDocuments: documents.length,
      batchSize,
      totalBatches
    });

    let processedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      logger.info('Processing batch', {
        batchNumber,
        totalBatches,
        documentsInBatch: batch.length,
        progress: `${batchNumber}/${totalBatches}`
      });

      const success = await processBatchWithRetry(
        batch,
        async (batchDocs) => {
          await Promise.all(
            batchDocs.map(doc => this.processDocument(doc.id, doc.content, tenantId, supabaseClient))
          );
        }
      );

      if (success) {
        processedCount += batch.length;
      } else {
        failedCount += batch.length;
      }
    }

    logger.info('Batch processing complete', {
      totalProcessed: processedCount,
      totalFailed: failedCount
    });

    return { processedCount, failedCount };
  }
};
