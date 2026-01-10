import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createPortalSession, getStripe } from '@/lib/stripe/server';
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle cookies in Server Component
            }
          },
        },
      }
    );

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings`;

    // Create portal session
    if (!getStripe()) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }
    const session = await createPortalSession({
      customerId: userData.stripe_customer_id,
      returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Create portal session error:', error);
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
  }
}
