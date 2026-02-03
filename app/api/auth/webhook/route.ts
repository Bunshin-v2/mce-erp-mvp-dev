
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('CRITICAL: Supabase Admin initialization failed for webhook');
    return new Response('Internal Server Error', { status: 500 });
  }

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;


  if (eventType === 'user.created') {
    const { email_addresses, first_name, last_name } = evt.data;
    const { error } = await (supabase.from('user_profiles') as any).insert({
      id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      role: 'viewer' // Default role
    });

    if (error) {
      console.error('Supabase error on user.created:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { email_addresses, first_name, last_name } = evt.data;
    const { error } = await (supabase.from('user_profiles') as any)
      .update({
        email: email_addresses[0].email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error on user.updated:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  if (eventType === 'user.deleted') {
    const { error } = await (supabase.from('user_profiles') as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error on user.deleted:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
