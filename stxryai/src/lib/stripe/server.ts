import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Database tier type (matches database.types.ts)
export type DatabaseTier = 'free' | 'premium' | 'creator_pro' | 'enterprise';

// Subscription tiers and prices (Stripe uses camelCase internally)
export const SUBSCRIPTION_TIERS = {
  premium: {
    name: 'Premium',
    dbTier: 'premium' as DatabaseTier,
    price: 7.14,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    features: [
      'Unlimited energy',
      'Ad-free experience',
      'Exclusive stories',
      'Early access to new features',
      'Premium badge',
    ],
  },
  creatorPro: {
    name: 'Creator Pro',
    dbTier: 'creator_pro' as DatabaseTier,
    price: 15.0,
    priceId: process.env.STRIPE_CREATOR_PRO_PRICE_ID!,
    features: [
      'All Premium features',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Monetization tools',
      'Collaborative editing',
    ],
  },
} as const;

export type StripeTier = keyof typeof SUBSCRIPTION_TIERS;

/**
 * Convert database tier to Stripe tier key
 */
export function dbTierToStripeTier(dbTier: DatabaseTier): StripeTier | null {
  if (dbTier === 'premium') return 'premium';
  if (dbTier === 'creator_pro') return 'creatorPro';
  return null; // free and enterprise don't have Stripe tiers
}

/**
 * Convert Stripe tier key to database tier
 */
export function stripeTierToDbTier(stripeTier: StripeTier): DatabaseTier {
  return SUBSCRIPTION_TIERS[stripeTier].dbTier;
}

/**
 * Get tier from Stripe price ID
 */
export function getTierFromPriceId(priceId: string): DatabaseTier | null {
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return 'premium';
  if (priceId === process.env.STRIPE_CREATOR_PRO_PRICE_ID) return 'creator_pro';
  return null;
}

// Legacy export for backward compatibility
export type SubscriptionTier = StripeTier;

// Create checkout session
export async function createCheckoutSession({
  userId,
  tier,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  tier: SubscriptionTier;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: SUBSCRIPTION_TIERS[tier].priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: {
      userId,
      tier,
    },
  });

  return session;
}

// Create customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Create or retrieve customer
export async function getOrCreateCustomer({ email, userId }: { email: string; userId: string }) {
  // Check if customer exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer;
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return event;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (err) {
    console.error('Failed to retrieve subscription:', err);
    return null;
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (err) {
    console.error('Failed to cancel subscription:', err);
    return null;
  }
}

// Update subscription
export async function updateSubscription({
  subscriptionId,
  priceId,
}: {
  subscriptionId: string;
  priceId: string;
}) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
    });
    return updatedSubscription;
  } catch (err) {
    console.error('Failed to update subscription:', err);
    return null;
  }
}
