/**
 * Enhanced Stripe Payment Utilities
 * Comprehensive payment processing with subscriptions, invoices, and webhooks
 */

import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// ============================================================================
// TYPES
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  status: string;
  pdfUrl: string;
  createdAt: Date;
}

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceId: '',
    amount: 0,
    currency: 'usd',
    interval: 'month',
    features: [
      'Read unlimited stories',
      'Create up to 3 stories',
      'Basic AI assistance',
      'Community access',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    amount: 999, // $9.99
    currency: 'usd',
    interval: 'month',
    features: [
      'Everything in Free',
      'Create unlimited stories',
      'Advanced AI assistance',
      'Priority support',
      'Ad-free experience',
      'Early access to features',
    ],
  },
  creatorPro: {
    id: 'creator_pro',
    name: 'Creator Pro',
    priceId: process.env.STRIPE_CREATOR_PRO_PRICE_ID!,
    amount: 1999, // $19.99
    currency: 'usd',
    interval: 'month',
    features: [
      'Everything in Premium',
      'Advanced analytics',
      'Monetization tools',
      'Custom branding',
      'API access',
      'Dedicated support',
    ],
  },
};

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Create or retrieve Stripe customer
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });
}

/**
 * Update customer information
 */
export async function updateCustomer(
  customerId: string,
  data: {
    email?: string;
    name?: string;
    metadata?: Record<string, string>;
  }
): Promise<Stripe.Customer> {
  return await stripe.customers.update(customerId, data);
}

/**
 * Delete customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  await stripe.customers.del(customerId);
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Create subscription
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  options?: {
    trialDays?: number;
    coupon?: string;
    metadata?: Record<string, string>;
  }
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: options?.trialDays,
    coupon: options?.coupon,
    metadata: options?.metadata,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });
}

/**
 * Update subscription (upgrade/downgrade)
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string,
  options?: {
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
  }
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: options?.prorationBehavior || 'create_prorations',
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Pause subscription
 */
export async function pauseSubscription(
  subscriptionId: string,
  resumeAt?: Date
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    pause_collection: {
      behavior: 'mark_uncollectible',
      resumes_at: resumeAt ? Math.floor(resumeAt.getTime() / 1000) : undefined,
    },
  });
}

/**
 * Resume paused subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    pause_collection: null as any,
  });
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Attach payment method to customer
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
}

/**
 * Detach payment method from customer
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  return await stripe.paymentMethods.detach(paymentMethodId);
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  return await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
}

/**
 * List customer payment methods
 */
export async function listPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });

  return paymentMethods.data;
}

// ============================================================================
// ONE-TIME PAYMENTS
// ============================================================================

/**
 * Create payment intent for one-time payment
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  customerId?: string,
  metadata?: Record<string, string>
): Promise<PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    clientSecret: paymentIntent.client_secret!,
  };
}

/**
 * Confirm payment intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });
}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

/**
 * Retrieve invoice
 */
export async function getInvoice(invoiceId: string): Promise<Invoice> {
  const invoice = await stripe.invoices.retrieve(invoiceId);

  return {
    id: invoice.id,
    customerId: invoice.customer as string,
    amount: invoice.amount_due,
    status: invoice.status!,
    pdfUrl: invoice.invoice_pdf!,
    createdAt: new Date(invoice.created * 1000),
  };
}

/**
 * List customer invoices
 */
export async function listInvoices(
  customerId: string,
  limit: number = 10
): Promise<Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data.map((invoice) => ({
    id: invoice.id,
    customerId: invoice.customer as string,
    amount: invoice.amount_due,
    status: invoice.status!,
    pdfUrl: invoice.invoice_pdf!,
    createdAt: new Date(invoice.created * 1000),
  }));
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(invoiceId: string): Promise<void> {
  await stripe.invoices.sendInvoice(invoiceId);
}

// ============================================================================
// REFUNDS
// ============================================================================

/**
 * Create refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason,
  });
}

/**
 * List refunds
 */
export async function listRefunds(
  paymentIntentId: string
): Promise<Stripe.Refund[]> {
  const refunds = await stripe.refunds.list({
    payment_intent: paymentIntentId,
  });

  return refunds.data;
}

// ============================================================================
// WEBHOOK HANDLING
// ============================================================================

/**
 * Construct webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Handle webhook event
 */
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// ============================================================================
// WEBHOOK HANDLERS (Implement based on your business logic)
// ============================================================================

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Payment succeeded:', paymentIntent.id);
  // Update database, send confirmation email, etc.
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Payment failed:', paymentIntent.id);
  // Notify user, log failure, etc.
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription created:', subscription.id);
  // Update user tier in database
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription updated:', subscription.id);
  // Update user tier, handle upgrades/downgrades
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription deleted:', subscription.id);
  // Downgrade user to free tier
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('Invoice payment succeeded:', invoice.id);
  // Send receipt, update payment history
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('Invoice payment failed:', invoice.id);
  // Implement dunning management, notify user
}

// ============================================================================
// DUNNING MANAGEMENT
// ============================================================================

/**
 * Handle failed payment recovery
 */
export async function handleFailedPayment(
  subscriptionId: string,
  attemptNumber: number
): Promise<void> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = subscription.customer as string;

  // Implement your dunning logic here
  // Example: Send email reminders, pause subscription after X attempts, etc.

  if (attemptNumber === 1) {
    // First attempt: Send friendly reminder
    console.log(`Sending payment reminder to customer ${customerId}`);
  } else if (attemptNumber === 3) {
    // Third attempt: Send urgent notice
    console.log(`Sending urgent payment notice to customer ${customerId}`);
  } else if (attemptNumber >= 5) {
    // Fifth attempt: Pause subscription
    await pauseSubscription(subscriptionId);
    console.log(`Paused subscription ${subscriptionId} due to failed payments`);
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get subscription analytics
 */
export async function getSubscriptionAnalytics(
  startDate: Date,
  endDate: Date
): Promise<{
  totalRevenue: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  canceledSubscriptions: number;
  churnRate: number;
}> {
  // Implement analytics logic using Stripe API
  // This is a placeholder implementation
  return {
    totalRevenue: 0,
    activeSubscriptions: 0,
    newSubscriptions: 0,
    canceledSubscriptions: 0,
    churnRate: 0,
  };
}

export default stripe;
