import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { logger } from '@/lib/logger';

/**
 * Get Project Detail API
 * GET /api/projects/[id]
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
      .from('projects_master')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('PROJECT_DETAIL_FAILURE', { error: error.message });
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

/**
 * Update Project API
 * PATCH /api/projects/[id]
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
    const supabase = await createClient();

    // Verify user tier (L3+ required for updates)
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('clerk_user_id', userId)
      .single();

    if (!profile || !['L3', 'L4'].includes(profile.tier || '')) {
      return NextResponse.json({ error: 'Forbidden: L3+ permission required' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('projects_master')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('PROJECT_UPDATED', { id, userId });
    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('PROJECT_UPDATE_FAILURE', { error: error.message });
    return NextResponse.json({ error: error.message || 'Failed to update project' }, { status: 500 });
  }
}
