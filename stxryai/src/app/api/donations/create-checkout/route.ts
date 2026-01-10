import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getStripe } from '@/lib/stripe/server';
export const runtime = 'edge';

/**
 * Create a Stripe checkout session for donations
 */
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

    // Get user (optional for donations)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { amount, message, isAnonymous, successUrl, cancelUrl } = body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid donation amount. Minimum is $1.' },
        { status: 400 }
      );
    }

    // Create a one-time payment checkout session
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing is not configured' }, { status: 503 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to StxryAI',
              description: message
                ? `Message: ${message.slice(0, 100)}`
                : 'Thank you for your support!',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings?donation=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings?donation=canceled`,
      metadata: {
        type: 'donation',
        userId: user?.id || 'anonymous',
        message: message?.slice(0, 500) || '',
        isAnonymous: String(isAnonymous || false),
      },
      ...(user?.email && !isAnonymous ? { customer_email: user.email } : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Create donation checkout error:', error);
    return NextResponse.json({ error: 'Failed to create donation checkout' }, { status: 500 });
  }
}
