import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const { notes } = await request.json();
    const { userId } = await getSafeAuth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // 1. Get unacknowledged change events
    const { data: changes } = await supabase
      .from('document_change_events')
      .select('id')
      .eq('document_id', documentId);

    if (!changes || changes.length === 0) {
      return NextResponse.json({ message: 'No changes to acknowledge' });
    }

    // 2. Insert acknowledgments
    const acks = changes.map(c => ({
      document_id: documentId,
      change_event_id: c.id,
      user_id: userId,
      acknowledged_at: new Date().toISOString(),
      acknowledgment_notes: notes
    }));

    const { error } = await supabase.from('document_acknowledgments').insert(acks);

    if (error) throw error;

    logger.info('DELTA_ACKNOWLEDGED', { documentId, userId, count: acks.length });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('ACKNOWLEDGE_ERROR', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
