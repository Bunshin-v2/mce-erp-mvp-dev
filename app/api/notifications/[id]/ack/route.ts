
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

  const supabase = await createClient();
  const { id: notificationId } = await params;

  // First, verify the notification belongs to the user and requires acknowledgement
  const { data: notification, error: fetchError } = await supabase
    .from('notifications')
    .select('id, user_id, ack_required')
    .eq('id', notificationId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !notification) {
    return NextResponse.json({ error: 'Notification not found or access denied.' }, { status: 404 });
  }

  if (!notification.ack_required) {
    return NextResponse.json({ error: 'Acknowledgement not required for this notification.' }, { status: 400 });
  }

  // Update the notification
  const { data, error } = await supabase
    .from('notifications')
    .update({
      ack_at: new Date().toISOString(),
      ack_by_user_id: userId,
      read_at: new Date().toISOString(), // Acknowledging also marks as read
    })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
