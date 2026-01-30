
import { createClient } from '@/lib/supabase/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await getSafeAuth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { until } = await request.json(); // e.g., until = '2026-01-27T12:00:00Z'
  if (!until) {
      return NextResponse.json({ error: '"until" property is required.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { id: notificationId } = await params;

  // We should also mark the notification as 'read' so it disappears from the main view
  const { error: updateError } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('notification_snoozes')
    .insert({
      notification_id: notificationId,
      snoozed_by_profile_id: userId,
      snoozed_until: until,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
