import { createClient } from '@/lib/supabase/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const ALLOWED_STATUSES = new Set(['Review', 'Reviewed', 'Approved', 'Rejected']);

/**
 * Update Document Status API
 * PATCH /api/documents/[id]/status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getSafeAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { status } = body;
    if (!status || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${Array.from(ALLOWED_STATUSES).join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify permission (L3+ for status changes)
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('clerk_user_id', userId)
      .single();

    if (!profile || !['L3', 'L4'].includes(profile.tier || '')) {
      return NextResponse.json({ error: 'Forbidden: L3+ permission required' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('documents')
      .update({ 
        status, 
        reviewed_at: status === 'Approved' ? new Date().toISOString() : null 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('DOCUMENT_STATUS_UPDATED', { id, status, userId });
    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('DOCUMENT_STATUS_UPDATE_FAILURE', { error: error.message });
    return NextResponse.json({ error: 'Failed to update document status' }, { status: 500 });
  }
}
