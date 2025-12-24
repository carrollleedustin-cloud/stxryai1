import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe/server';

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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription ID from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Check subscription status
    const currentSubscription = await stripe.subscriptions.retrieve(
      userData.stripe_subscription_id
    );

    if (!currentSubscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      );
    }

    // Resume subscription (remove cancellation)
    const subscription = await stripe.subscriptions.update(
      userData.stripe_subscription_id,
      { cancel_at_period_end: false }
    );

    // Update database
    await supabase
      .from('users')
      .update({
        subscription_status: 'active',
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to resume subscription' },
      { status: 500 }
    );
  }
}

