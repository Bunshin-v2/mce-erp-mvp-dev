import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

/**
 * Get Tender Detail API
 * GET /api/tenders/[id]
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
      .from('tenders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('TENDER_DETAIL_FAILURE', { error: error.message });
    return NextResponse.json({ error: 'Failed to fetch tender' }, { status: 500 });
  }
}
