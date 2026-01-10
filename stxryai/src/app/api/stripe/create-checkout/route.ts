import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  createCheckoutSession,
  getOrCreateCustomer,
  SUBSCRIPTION_TIERS,
  StripeTier,
  getStripe,
} from '@/lib/stripe/server';
export const runtime = 'edge';

// Map frontend tier names to Stripe tier keys
function mapTierToStripeTier(tier: string): StripeTier | null {
  const tierMap: Record<string, StripeTier> = {
    premium: 'premium',
    pro: 'creatorPro',
    creator_pro: 'creatorPro',
    creatorPro: 'creatorPro',
  };
  return tierMap[tier] || null;
}

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

    const body = await request.json();
    const { tier, successUrl, cancelUrl } = body;

    // Map and validate tier
    const stripeTier = mapTierToStripeTier(tier);
    if (!stripeTier) {
      return NextResponse.json(
        { error: 'Invalid subscription tier. Valid tiers: premium, pro' },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!getStripe()) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer({
      email: user.email!,
      userId: user.id,
    });

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      tier: stripeTier,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
      cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
