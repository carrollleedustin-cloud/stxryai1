/**
 * Marketplace Service
 * Manages premium story purchases, creator monetization, and payments
 */

import { createClient } from '@/lib/supabase/client';

export interface PremiumStoryPricing {
  id: string;
  storyId: string;
  pricingModel: 'one_time' | 'chapter_based' | 'subscription' | 'free_with_ads';
  priceAmount: number;
  currency: string;
  chapterPrice?: number;
  freeChapters: number;
  subscriptionDurationDays?: number;
  discountPercentage: number;
  discountExpiresAt?: string;
  creatorSharePercentage: number;
  platformSharePercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoryPurchase {
  id: string;
  userId: string;
  storyId: string;
  purchaseType: 'full_story' | 'chapter' | 'subscription';
  pricingId?: string;
  paymentIntentId?: string;
  paymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  amountPaid: number;
  currency: string;
  chapterId?: string;
  chapterNumber?: number;
  accessGrantedAt?: string;
  accessExpiresAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorEarnings {
  id: string;
  creatorId: string;
  storyId: string;
  purchaseId: string;
  purchaseAmount: number;
  creatorSharePercentage: number;
  creatorEarnings: number;
  platformFee: number;
  payoutId?: string;
  isPaidOut: boolean;
  paidOutAt?: string;
  createdAt: string;
}

export interface CreatorPayout {
  id: string;
  creatorId: string;
  payoutPeriodStart: string;
  payoutPeriodEnd: string;
  totalEarnings: number;
  platformFee: number;
  netEarnings: number;
  payoutStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payoutMethod?: 'stripe' | 'paypal' | 'bank_transfer' | 'crypto';
  payoutReference?: string;
  paidAt?: string;
  payoutNotes?: string;
  earningsBreakdown: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StorySubscription {
  id: string;
  userId: string;
  storyId: string;
  pricingId: string;
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeSubscriptionId?: string;
  paymentIntentId?: string;
  autoRenew: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorTip {
  id: string;
  tipperId: string;
  creatorId: string;
  storyId?: string;
  tipAmount: number;
  currency: string;
  message?: string;
  paymentIntentId?: string;
  paymentStatus: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  platformFeePercentage: number;
  platformFee: number;
  creatorReceives: number;
  payoutId?: string;
  isPaidOut: boolean;
  createdAt: string;
}

export class MarketplaceService {
  private supabase = createClient();

  // ========================================
  // PREMIUM STORY PRICING
  // ========================================

  /**
   * Get pricing for a story
   */
  async getStoryPricing(storyId: string): Promise<PremiumStoryPricing | null> {
    const { data, error } = await this.supabase
      .from('premium_story_pricing')
      .select('*')
      .eq('story_id', storyId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapPricing(data);
  }

  /**
   * Set pricing for a story (creator only)
   */
  async setStoryPricing(
    storyId: string,
    pricing: Partial<PremiumStoryPricing>
  ): Promise<PremiumStoryPricing> {
    const { data, error } = await this.supabase
      .from('premium_story_pricing')
      .upsert(
        {
          story_id: storyId,
          pricing_model: pricing.pricingModel,
          price_amount: pricing.priceAmount,
          currency: pricing.currency || 'USD',
          chapter_price: pricing.chapterPrice,
          free_chapters: pricing.freeChapters || 0,
          subscription_duration_days: pricing.subscriptionDurationDays,
          discount_percentage: pricing.discountPercentage || 0,
          discount_expires_at: pricing.discountExpiresAt,
          creator_share_percentage: pricing.creatorSharePercentage || 70.0,
          platform_share_percentage: pricing.platformSharePercentage || 30.0,
          is_active: pricing.isActive !== undefined ? pricing.isActive : true,
        },
        {
          onConflict: 'story_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return this.mapPricing(data);
  }

  // ========================================
  // STORY ACCESS
  // ========================================

  /**
   * Check if user has access to a story/chapter
   */
  async checkStoryAccess(userId: string, storyId: string, chapterId?: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('check_story_access', {
      p_user_id: userId,
      p_story_id: storyId,
      p_chapter_id: chapterId || null,
    });

    if (error) throw error;
    return data === true;
  }

  /**
   * Get user's purchases for a story
   */
  async getUserStoryPurchases(userId: string, storyId: string): Promise<StoryPurchase[]> {
    const { data, error } = await this.supabase
      .from('story_purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .eq('payment_status', 'succeeded')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return this.mapPurchases(data || []);
  }

  // ========================================
  // PURCHASES
  // ========================================

  /**
   * Create a purchase record (before payment)
   */
  async createPurchase(
    userId: string,
    storyId: string,
    purchaseType: 'full_story' | 'chapter' | 'subscription',
    pricingId: string,
    amount: number,
    chapterId?: string
  ): Promise<StoryPurchase> {
    const { data, error } = await this.supabase
      .from('story_purchases')
      .insert({
        user_id: userId,
        story_id: storyId,
        purchase_type: purchaseType,
        pricing_id: pricingId,
        payment_status: 'pending',
        amount_paid: amount,
        currency: 'USD',
        chapter_id: chapterId,
        metadata: {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapPurchase(data);
  }

  /**
   * Update purchase payment status
   */
  async updatePurchaseStatus(
    purchaseId: string,
    paymentIntentId: string,
    status: 'succeeded' | 'failed' | 'processing'
  ): Promise<StoryPurchase> {
    const updateData: any = {
      payment_intent_id: paymentIntentId,
      payment_status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'succeeded') {
      updateData.access_granted_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('story_purchases')
      .update(updateData)
      .eq('id', purchaseId)
      .select()
      .single();

    if (error) throw error;
    return this.mapPurchase(data);
  }

  // ========================================
  // SUBSCRIPTIONS
  // ========================================

  /**
   * Create or update story subscription
   */
  async createSubscription(
    userId: string,
    storyId: string,
    pricingId: string,
    stripeSubscriptionId?: string
  ): Promise<StorySubscription> {
    const pricing = await this.getStoryPricing(storyId);
    if (!pricing || !pricing.subscriptionDurationDays) {
      throw new Error('Subscription pricing not available for this story');
    }

    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + pricing.subscriptionDurationDays);

    const { data, error } = await this.supabase
      .from('story_subscriptions')
      .upsert(
        {
          user_id: userId,
          story_id: storyId,
          pricing_id: pricingId,
          subscription_status: 'active',
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          stripe_subscription_id: stripeSubscriptionId,
          auto_renew: true,
        },
        {
          onConflict: 'user_id,story_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return this.mapSubscription(data);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<StorySubscription> {
    const { data, error } = await this.supabase
      .from('story_subscriptions')
      .update({
        subscription_status: 'cancelled',
        auto_renew: false,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSubscription(data);
  }

  /**
   * Get user's active subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<StorySubscription[]> {
    const { data, error } = await this.supabase
      .from('story_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('subscription_status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return this.mapSubscriptions(data || []);
  }

  // ========================================
  // CREATOR EARNINGS
  // ========================================

  /**
   * Get creator's total earnings
   */
  async getCreatorEarnings(creatorId: string): Promise<{
    totalEarnings: number;
    paidOut: number;
    pending: number;
    earnings: CreatorEarnings[];
  }> {
    const { data, error } = await this.supabase
      .from('creator_earnings')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const earnings = this.mapEarnings(data || []);
    const totalEarnings = earnings.reduce((sum, e) => sum + e.creatorEarnings, 0);
    const paidOut = earnings
      .filter((e) => e.isPaidOut)
      .reduce((sum, e) => sum + e.creatorEarnings, 0);
    const pending = totalEarnings - paidOut;

    return {
      totalEarnings,
      paidOut,
      pending,
      earnings,
    };
  }

  /**
   * Get creator's payout history
   */
  async getCreatorPayouts(creatorId: string): Promise<CreatorPayout[]> {
    const { data, error } = await this.supabase
      .from('creator_payouts')
      .select('*')
      .eq('creator_id', creatorId)
      .order('payout_period_start', { ascending: false });

    if (error) throw error;
    return this.mapPayouts(data || []);
  }

  // ========================================
  // TIPPING
  // ========================================

  /**
   * Create a tip
   */
  async createTip(
    tipperId: string,
    creatorId: string,
    tipAmount: number,
    storyId?: string,
    message?: string
  ): Promise<CreatorTip> {
    const { data, error } = await this.supabase
      .from('creator_tips')
      .insert({
        tipper_id: tipperId,
        creator_id: creatorId,
        story_id: storyId,
        tip_amount: tipAmount,
        currency: 'USD',
        message,
        payment_status: 'pending',
        platform_fee_percentage: 5.0, // Lower fee for tips
        platform_fee: 0, // Will be calculated by trigger
        creator_receives: 0, // Will be calculated by trigger
        is_paid_out: false,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTip(data);
  }

  /**
   * Update tip payment status
   */
  async updateTipStatus(
    tipId: string,
    paymentIntentId: string,
    status: 'succeeded' | 'failed' | 'processing'
  ): Promise<CreatorTip> {
    const { data, error } = await this.supabase
      .from('creator_tips')
      .update({
        payment_intent_id: paymentIntentId,
        payment_status: status,
      })
      .eq('id', tipId)
      .select()
      .single();

    if (error) throw error;
    return this.mapTip(data);
  }

  /**
   * Get tips received by creator
   */
  async getCreatorTips(creatorId: string): Promise<CreatorTip[]> {
    const { data, error } = await this.supabase
      .from('creator_tips')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('payment_status', 'succeeded')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return this.mapTips(data || []);
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapPricing(data: any): PremiumStoryPricing {
    return {
      id: data.id,
      storyId: data.story_id,
      pricingModel: data.pricing_model,
      priceAmount: parseFloat(data.price_amount),
      currency: data.currency,
      chapterPrice: data.chapter_price ? parseFloat(data.chapter_price) : undefined,
      freeChapters: data.free_chapters,
      subscriptionDurationDays: data.subscription_duration_days,
      discountPercentage: parseFloat(data.discount_percentage),
      discountExpiresAt: data.discount_expires_at,
      creatorSharePercentage: parseFloat(data.creator_share_percentage),
      platformSharePercentage: parseFloat(data.platform_share_percentage),
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapPurchase(data: any): StoryPurchase {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      purchaseType: data.purchase_type,
      pricingId: data.pricing_id,
      paymentIntentId: data.payment_intent_id,
      paymentStatus: data.payment_status,
      amountPaid: parseFloat(data.amount_paid),
      currency: data.currency,
      chapterId: data.chapter_id,
      chapterNumber: data.chapter_number,
      accessGrantedAt: data.access_granted_at,
      accessExpiresAt: data.access_expires_at,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapPurchases(data: any[]): StoryPurchase[] {
    return data.map((item) => this.mapPurchase(item));
  }

  private mapEarnings(data: any[]): CreatorEarnings[] {
    return data.map((item) => ({
      id: item.id,
      creatorId: item.creator_id,
      storyId: item.story_id,
      purchaseId: item.purchase_id,
      purchaseAmount: parseFloat(item.purchase_amount),
      creatorSharePercentage: parseFloat(item.creator_share_percentage),
      creatorEarnings: parseFloat(item.creator_earnings),
      platformFee: parseFloat(item.platform_fee),
      payoutId: item.payout_id,
      isPaidOut: item.is_paid_out,
      paidOutAt: item.paid_out_at,
      createdAt: item.created_at,
    }));
  }

  private mapPayouts(data: any[]): CreatorPayout[] {
    return data.map((item) => ({
      id: item.id,
      creatorId: item.creator_id,
      payoutPeriodStart: item.payout_period_start,
      payoutPeriodEnd: item.payout_period_end,
      totalEarnings: parseFloat(item.total_earnings),
      platformFee: parseFloat(item.platform_fee),
      netEarnings: parseFloat(item.net_earnings),
      payoutStatus: item.payout_status,
      payoutMethod: item.payout_method,
      payoutReference: item.payout_reference,
      paidAt: item.paid_at,
      payoutNotes: item.payout_notes,
      earningsBreakdown: item.earnings_breakdown || {},
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  private mapSubscription(data: any): StorySubscription {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      pricingId: data.pricing_id,
      subscriptionStatus: data.subscription_status,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      stripeSubscriptionId: data.stripe_subscription_id,
      paymentIntentId: data.payment_intent_id,
      autoRenew: data.auto_renew,
      cancelledAt: data.cancelled_at,
      cancellationReason: data.cancellation_reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSubscriptions(data: any[]): StorySubscription[] {
    return data.map((item) => this.mapSubscription(item));
  }

  private mapTip(data: any): CreatorTip {
    return {
      id: data.id,
      tipperId: data.tipper_id,
      creatorId: data.creator_id,
      storyId: data.story_id,
      tipAmount: parseFloat(data.tip_amount),
      currency: data.currency,
      message: data.message,
      paymentIntentId: data.payment_intent_id,
      paymentStatus: data.payment_status,
      platformFeePercentage: parseFloat(data.platform_fee_percentage),
      platformFee: parseFloat(data.platform_fee),
      creatorReceives: parseFloat(data.creator_receives),
      payoutId: data.payout_id,
      isPaidOut: data.is_paid_out,
      createdAt: data.created_at,
    };
  }

  private mapTips(data: any[]): CreatorTip[] {
    return data.map((item) => this.mapTip(item));
  }
}

export const marketplaceService = new MarketplaceService();
