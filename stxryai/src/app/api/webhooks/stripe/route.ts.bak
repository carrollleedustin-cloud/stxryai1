import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, verifyWebhookSignature } from '@/lib/stripe/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const event = verifyWebhookSignature(body, signature);

  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
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
        let tier: 'premium' | 'creator_pro' = 'premium';

        if (priceId === process.env.STRIPE_CREATOR_PRO_PRICE_ID) {
          tier = 'creator_pro';
        }

        // Update user subscription
        await supabase
          .from('users')
          .update({
            tier,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', user.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
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
        await supabase
          .from('users')
          .update({
            tier: 'free',
            stripe_subscription_id: null,
            subscription_status: 'canceled',
            subscription_end_date: null,
          })
          .eq('id', user.id);

        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer as string;
        const userId = session.client_reference_id || session.metadata?.userId;

        if (!userId) {
          console.error('No user ID in session');
          break;
        }

        // Update user with Stripe customer ID
        await supabase
          .from('users')
          .update({
            stripe_customer_id: customerId,
          })
          .eq('id', userId);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        // Handle successful payment
        console.log('Payment succeeded:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        // Get user and send notification
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'story',
            title: 'Payment Failed',
            message: 'Your subscription payment failed. Please update your payment method.',
            link: '/account/billing',
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
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
