/**
 * Subscription Service
 * Manages subscription tiers, features, and billing
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export type SubscriptionTier = 'free' | 'premium' | 'pro' | 'enterprise';
export type BillingPeriod = 'monthly' | 'yearly';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  features: TierFeatures;
  limits: TierLimits;
  badge?: string;
  color: string;
}

export interface TierFeatures {
  unlimitedStories: boolean;
  noAds: boolean;
  aiChoicesLevel: 'basic' | 'enhanced' | 'priority' | 'custom';
  customChoices: boolean;
  aiCompanionLevel: 'none' | 'basic' | 'advanced' | 'custom';
  analyticsLevel: 'basic' | 'standard' | 'advanced' | 'enterprise';
  offlineReading: boolean;
  prioritySupport: boolean;
  earlyAccess: boolean;
  customThemes: boolean;
  profileBadge: boolean;
  revenueShare: number; // Percentage for creators
}

export interface TierLimits {
  storiesPerDay: number; // -1 = unlimited
  storyCreationPerMonth: number;
  dailyAIGenerations: number;
  downloadStoriesCount: number;
  customChoicesPerDay: number;
  streakFreezesPerMonth: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  billingPeriod: BillingPeriod;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageStats {
  storiesReadToday: number;
  storiesCreatedThisMonth: number;
  aiGenerationsToday: number;
  downloadedStories: number;
  customChoicesToday: number;
  streakFreezesUsedThisMonth: number;
}

// ========================================
// TIER CONFIGURATIONS
// ========================================

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for casual readers',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscount: 0,
    features: {
      unlimitedStories: false,
      noAds: false,
      aiChoicesLevel: 'basic',
      customChoices: false,
      aiCompanionLevel: 'none',
      analyticsLevel: 'basic',
      offlineReading: false,
      prioritySupport: false,
      earlyAccess: false,
      customThemes: false,
      profileBadge: false,
      revenueShare: 0,
    },
    limits: {
      storiesPerDay: 3,
      storyCreationPerMonth: 1,
      dailyAIGenerations: 10,
      downloadStoriesCount: 0,
      customChoicesPerDay: 0,
      streakFreezesPerMonth: 1,
    },
    color: 'gray',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'For dedicated readers',
    monthlyPrice: 6.99,
    yearlyPrice: 55.99, // $4.67/mo - 33% off
    yearlyDiscount: 33,
    features: {
      unlimitedStories: true,
      noAds: true,
      aiChoicesLevel: 'enhanced',
      customChoices: true,
      aiCompanionLevel: 'basic',
      analyticsLevel: 'standard',
      offlineReading: true,
      prioritySupport: false,
      earlyAccess: false,
      customThemes: true,
      profileBadge: true,
      revenueShare: 0,
    },
    limits: {
      storiesPerDay: -1,
      storyCreationPerMonth: 5,
      dailyAIGenerations: 50,
      downloadStoriesCount: 10,
      customChoicesPerDay: 20,
      streakFreezesPerMonth: 3,
    },
    badge: '⭐',
    color: 'blue',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For power users & creators',
    monthlyPrice: 14.99,
    yearlyPrice: 119.99, // $10/mo - 33% off
    yearlyDiscount: 33,
    features: {
      unlimitedStories: true,
      noAds: true,
      aiChoicesLevel: 'priority',
      customChoices: true,
      aiCompanionLevel: 'advanced',
      analyticsLevel: 'advanced',
      offlineReading: true,
      prioritySupport: true,
      earlyAccess: true,
      customThemes: true,
      profileBadge: true,
      revenueShare: 70,
    },
    limits: {
      storiesPerDay: -1,
      storyCreationPerMonth: -1,
      dailyAIGenerations: 200,
      downloadStoriesCount: 50,
      customChoicesPerDay: -1,
      streakFreezesPerMonth: 5,
    },
    badge: '👑',
    color: 'purple',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For schools & organizations',
    monthlyPrice: -1, // Custom pricing
    yearlyPrice: -1,
    yearlyDiscount: 0,
    features: {
      unlimitedStories: true,
      noAds: true,
      aiChoicesLevel: 'custom',
      customChoices: true,
      aiCompanionLevel: 'custom',
      analyticsLevel: 'enterprise',
      offlineReading: true,
      prioritySupport: true,
      earlyAccess: true,
      customThemes: true,
      profileBadge: true,
      revenueShare: -1, // Negotiable
    },
    limits: {
      storiesPerDay: -1,
      storyCreationPerMonth: -1,
      dailyAIGenerations: -1,
      downloadStoriesCount: -1,
      customChoicesPerDay: -1,
      streakFreezesPerMonth: -1,
    },
    badge: '🏢',
    color: 'gold',
  },
};

// ========================================
// SERVICE CLASS
// ========================================

class SubscriptionService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription - return free tier
        return null;
      }
      console.error('Error fetching subscription:', error);
      return null;
    }

    return this.mapSubscription(data);
  }

  /**
   * Get user's effective tier (considering trial, etc.)
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) return 'free';
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return 'free';
    }

    return subscription.tier;
  }

  /**
   * Get tier configuration
   */
  getTierConfig(tier: SubscriptionTier): TierConfig {
    return TIER_CONFIGS[tier];
  }

  /**
   * Check if user has access to a feature
   */
  async hasFeature(userId: string, feature: keyof TierFeatures): Promise<boolean> {
    const tier = await this.getUserTier(userId);
    const config = this.getTierConfig(tier);
    
    const value = config.features[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    return value !== 'none';
  }

  /**
   * Get user's usage stats
   */
  async getUsageStats(userId: string): Promise<UsageStats> {
    const supabase = this.getSupabase();
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [
      { count: storiesReadToday },
      { count: storiesCreatedThisMonth },
      { count: aiGenerationsToday },
      { count: downloadedStories },
      { data: streakData },
    ] = await Promise.all([
      supabase.from('user_activity').select('*', { count: 'exact' })
        .eq('user_id', userId).eq('activity_type', 'story_read')
        .gte('created_at', today),
      supabase.from('stories').select('*', { count: 'exact' })
        .eq('author_id', userId).gte('created_at', monthStart),
      supabase.from('ai_generations').select('*', { count: 'exact' })
        .eq('user_id', userId).gte('created_at', today),
      supabase.from('offline_downloads').select('*', { count: 'exact' })
        .eq('user_id', userId),
      supabase.from('reading_streaks').select('streak_freezes_used_this_month')
        .eq('user_id', userId).single(),
    ]);

    return {
      storiesReadToday: storiesReadToday || 0,
      storiesCreatedThisMonth: storiesCreatedThisMonth || 0,
      aiGenerationsToday: aiGenerationsToday || 0,
      downloadedStories: downloadedStories || 0,
      customChoicesToday: 0, // Would need separate tracking
      streakFreezesUsedThisMonth: streakData?.streak_freezes_used_this_month || 0,
    };
  }

  /**
   * Check if user can perform an action based on limits
   */
  async canPerformAction(
    userId: string,
    action: keyof TierLimits,
    increment: number = 1
  ): Promise<{ allowed: boolean; remaining: number; limit: number; reason?: string }> {
    const tier = await this.getUserTier(userId);
    const config = this.getTierConfig(tier);
    const limit = config.limits[action];

    if (limit === -1) {
      return { allowed: true, remaining: -1, limit: -1 };
    }

    const usage = await this.getUsageStats(userId);
    const usageMap: Record<string, number> = {
      storiesPerDay: usage.storiesReadToday,
      storyCreationPerMonth: usage.storiesCreatedThisMonth,
      dailyAIGenerations: usage.aiGenerationsToday,
      downloadStoriesCount: usage.downloadedStories,
      customChoicesPerDay: usage.customChoicesToday,
      streakFreezesPerMonth: usage.streakFreezesUsedThisMonth,
    };

    const current = usageMap[action] || 0;
    const remaining = limit - current;
    const allowed = remaining >= increment;

    return {
      allowed,
      remaining: Math.max(0, remaining - increment),
      limit,
      reason: !allowed ? `You've reached your ${action} limit. Upgrade to continue!` : undefined,
    };
  }

  /**
   * Compare tiers
   */
  compareTiers(tier1: SubscriptionTier, tier2: SubscriptionTier): -1 | 0 | 1 {
    const order = ['free', 'premium', 'pro', 'enterprise'];
    const idx1 = order.indexOf(tier1);
    const idx2 = order.indexOf(tier2);
    
    if (idx1 < idx2) return -1;
    if (idx1 > idx2) return 1;
    return 0;
  }

  /**
   * Get upgrade options for a tier
   */
  getUpgradeOptions(currentTier: SubscriptionTier): TierConfig[] {
    const order: SubscriptionTier[] = ['free', 'premium', 'pro'];
    const currentIndex = order.indexOf(currentTier);
    
    return order
      .slice(currentIndex + 1)
      .map(tier => TIER_CONFIGS[tier]);
  }

  /**
   * Calculate pricing for upgrade
   */
  calculateUpgradePrice(
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier,
    period: BillingPeriod,
    currentPeriodEnd?: string
  ): { price: number; prorated?: number; total: number } {
    const currentConfig = TIER_CONFIGS[currentTier];
    const targetConfig = TIER_CONFIGS[targetTier];

    const targetPrice = period === 'yearly' 
      ? targetConfig.yearlyPrice 
      : targetConfig.monthlyPrice;

    // If upgrading mid-cycle, calculate proration
    if (currentPeriodEnd && currentTier !== 'free') {
      const remaining = new Date(currentPeriodEnd).getTime() - Date.now();
      const periodLength = period === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      const percentRemaining = remaining / periodLength;

      const currentPrice = period === 'yearly'
        ? currentConfig.yearlyPrice
        : currentConfig.monthlyPrice;

      const prorated = (targetPrice - currentPrice) * percentRemaining;

      return {
        price: targetPrice,
        prorated: Math.max(0, prorated),
        total: Math.max(0, prorated),
      };
    }

    return {
      price: targetPrice,
      total: targetPrice,
    };
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(
    userId: string,
    tier: SubscriptionTier,
    period: BillingPeriod,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string } | null> {
    // This would integrate with Stripe
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        tier,
        period,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      console.error('Failed to create checkout session');
      return null;
    }

    return response.json();
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<boolean> {
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    return response.ok;
  }

  /**
   * Resume canceled subscription
   */
  async resumeSubscription(userId: string): Promise<boolean> {
    const response = await fetch('/api/stripe/resume-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    return response.ok;
  }

  private mapSubscription(data: any): UserSubscription {
    return {
      id: data.id,
      userId: data.user_id,
      tier: data.tier,
      status: data.status,
      billingPeriod: data.billing_period,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const subscriptionService = new SubscriptionService();

