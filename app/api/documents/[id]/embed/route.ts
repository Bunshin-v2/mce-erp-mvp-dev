import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbeddingVector } from '@/lib/ai/embeddings';
import { chunkDocument } from '@/lib/rag/chunking';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await getSafeAuth();
  const { userId } = authResult;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: docId } = await params;
  const { docContent } = await request.json();

  // Fetch token and tenant_id before backgrounding
  const token = await authResult.getToken({ template: 'supabase' });
  const { createAuthenticatedClient } = await import('@/lib/supabase');
  const supabase = createAuthenticatedClient(token || '');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('clerk_user_id', userId)
    .single();

  logger.info(`[Background-Embed] Starting for doc ${docId}`, { userId, tenantId: profile?.tenant_id });

  // Start processing in the background (no await)
  processEmbeddingsInBackground(docId, token || '', profile?.tenant_id, docContent).catch(err => {
    logger.error(`[Background-Embed] Fatal error for doc ${docId}`, { error: err.message });
  });

  return NextResponse.json({ 
    message: "Embedding process started in background.",
    documentId: docId 
  });
}

async function processEmbeddingsInBackground(docId: string, token: string, tenantId: string | undefined, docContent?: string) {
  const { createAuthenticatedClient } = await import('@/lib/supabase');
  const supabase = createAuthenticatedClient(token);
  
  const { data: doc } = await supabase
    .from('documents')
    .select('title, text_content')
    .eq('id', docId)
    .single();

  if (!doc) {
    logger.error(`[Background-Embed] Document ${docId} not found`);
    return;
  }

  const textToEmbed = docContent || doc.text_content || `Placeholder content for ${doc.title || 'document'}.`;
  
  // Use the ragPipeline for robust processing (it has retries and batch insert)
  const { ragPipeline } = await import('@/utils/rag');
  await ragPipeline.processDocument(docId, textToEmbed, tenantId, supabase);
  
  logger.info(`[Background-Embed] Completed for doc ${docId}`);
}
