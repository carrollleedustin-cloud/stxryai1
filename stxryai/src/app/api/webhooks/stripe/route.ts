import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature, getTierFromPriceId } from '@/lib/stripe/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { updateUserById, insertNotification } from '@/lib/supabase/typed';
import type { Stripe } from 'stripe';

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// Map any tier to allowed values
type AllowedTier = 'free' | 'premium' | 'creator_pro';
const mapTier = (tier: string | null | undefined): AllowedTier => {
  if (tier === 'premium') return 'premium';
  if (tier === 'creator_pro') return 'creator_pro';
  if (tier === 'enterprise') return 'creator_pro'; // Map enterprise to creator_pro
  return 'free';
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(body, signature) as Stripe.Event;
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook error: ${error.message}` }, { status: 400 });
  }

  const supabase = createServiceRoleClient() as any;

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by Stripe customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!user) {
          console.error('User not found for customer:', customerId);
          break;
        }

        // Determine tier from subscription
        const priceId = subscription.items.data[0].price.id;
        const rawTier = getTierFromPriceId(priceId);
        const mappedTier: 'free' | 'premium' | 'creator_pro' = mapTier(rawTier);

        // Cast to access Stripe subscription properties
        const sub = subscription as unknown as { id: string; status: string; current_period_end: number };

        // Update user subscription - explicitly typed to match updateUserById
        await updateUserById(user.id, {
          tier: mappedTier,
          stripe_subscription_id: sub.id,
          subscription_status: String(sub.status),
          subscription_end_date: new Date(sub.current_period_end * 1000).toISOString(),
        } as Parameters<typeof updateUserById>[1]);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by Stripe customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!user) {
          console.error('User not found for customer:', customerId);
          break;
        }

        // Downgrade to free tier
        const downgradeData = {
          tier: 'free' as const,
          stripe_subscription_id: null,
          subscription_status: 'canceled',
          subscription_end_date: null,
        };

        await updateUserById(user.id, downgradeData as any);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.client_reference_id;

        if (!userId) {
          console.error('No user ID in session');
          break;
        }

        // Update user with Stripe customer ID
        await updateUserById(userId as string, { stripe_customer_id: customerId } as any);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle successful payment
        console.log('Payment succeeded:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Get user and send notification
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await insertNotification({
            user_id: user.id,
            type: 'story',
            title: 'Payment Failed',
            message: 'Your subscription payment failed. Please update your payment method.',
            link: '/settings',
          });
        }

        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
