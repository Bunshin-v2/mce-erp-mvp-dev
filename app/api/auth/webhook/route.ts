
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js'; // Import the standard client
import { NextResponse } from 'next/server';

// Special Supabase client with service role key for admin-level access
const createAdminClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        console.error('CRITICAL: Supabase URL or Service Role Key is missing. Webhook cannot connect.');
        // Return a mock client that always fails to prevent crash
        return { from: () => ({ insert: () => ({ error: { message: 'DB_UNCONFIGURED' } }), update: () => ({ error: { message: 'DB_UNCONFIGURED' } }), delete: () => ({ error: { message: 'DB_UNCONFIGURED' } }) }) } as any;
    }

    // This client uses the service role key, bypassing RLS.
    return createClient(url, serviceKey);
}

export async function POST(req: Request) {

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
  
  const supabase = createAdminClient();

  if (eventType === 'user.created') {
    const { email_addresses, first_name, last_name } = evt.data;
    const { error } = await supabase.from('user_profiles').insert({
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
    const { error } = await supabase.from('user_profiles')
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
    const { error } = await supabase.from('user_profiles')
        .delete()
        .eq('id', id);

     if (error) {
        console.error('Supabase error on user.deleted:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
