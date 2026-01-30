
import { createClient } from '@/lib/supabase/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { userId } = await getSafeAuth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  const read = searchParams.get('read'); // 'true', 'false', or null

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (read === 'true') {
    query = query.not('read_at', 'is', null);
  } else if (read === 'false') {
    query = query.is('read_at', null);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
