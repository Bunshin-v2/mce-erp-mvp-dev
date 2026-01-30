import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

/**
 * Get Document Detail API
 * GET /api/documents/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getSafeAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('documents')
      .select('*, projects_master(project_name)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('DOCUMENT_DETAIL_FAILURE', { error: error.message });
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}
