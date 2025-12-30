import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !key) throw new Error('Supabase env vars are not configured');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Basic normalization
    const normalized = email.trim().toLowerCase();
    const supabase = getSupabaseServer();

    // Ensure table exists note: in production, manage via migrations
    // Expected schema: newsletter_subscriptions(email text primary key, created_at timestamptz default now())

    const { error } = await supabase
      .from('newsletter_subscriptions')
      .upsert({ email: normalized }, { onConflict: 'email' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Subscription failed' }, { status: 500 });
  }
}
