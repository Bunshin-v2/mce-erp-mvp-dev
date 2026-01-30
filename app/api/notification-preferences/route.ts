
import { createClient } from '@/lib/supabase/server';
import { getSafeAuth } from '@/lib/auth-safe';
import { NextResponse } from 'next/server';

export async function GET() {
    const { userId } = await getSafeAuth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('profile_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PATCH(request: Request) {
    const { userId } = await getSafeAuth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({ profile_id: userId, ...body }, { onConflict: 'profile_id' })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
