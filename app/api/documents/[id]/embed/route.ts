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
  const { getSupabaseClient } = await import('@/lib/supabase');
  const supabase = getSupabaseClient();

  if (token) {
    await supabase.auth.setSession({ access_token: token, refresh_token: '' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('clerk_user_id', userId)
    .single();

  if (!profile) {
    logger.error(`[Background-Embed] Profile not found for user ${userId}`);
    return;
  }

  logger.info(`[Background-Embed] Starting for doc ${docId}`, { userId, tenantId: (profile as any).tenant_id });

  // Start processing in the background (no await)
  processEmbeddingsInBackground(docId, token || '', (profile as any).tenant_id, docContent).catch(err => {
    logger.error(`[Background-Embed] Fatal error for doc ${docId}`, { error: err.message });
  });

  return NextResponse.json({
    message: "Embedding process started in background.",
    documentId: docId
  });
}

async function processEmbeddingsInBackground(docId: string, token: string, tenantId: string | undefined, docContent?: string) {
  const { getSupabaseClient } = await import('@/lib/supabase');
  const supabase = getSupabaseClient();

  if (token) {
    await supabase.auth.setSession({ access_token: token, refresh_token: '' });
  }

  const { data: doc, error } = await supabase
    .from('documents')
    .select('title, text_content')
    .eq('id', docId)
    .single();

  if (error || !doc) {
    logger.error(`[Background-Embed] Document ${docId} not found or error`, { error: error?.message });
    return;
  }

  const textToEmbed = docContent || (doc as any).text_content || `Placeholder content for ${(doc as any).title || 'document'}.`;

  // Use the ragPipeline for robust processing (it has retries and batch insert)
  const { ragPipeline } = await import('@/utils/rag');
  await ragPipeline.processDocument(docId, textToEmbed, tenantId, supabase);

  logger.info(`[Background-Embed] Completed for doc ${docId}`);
}
