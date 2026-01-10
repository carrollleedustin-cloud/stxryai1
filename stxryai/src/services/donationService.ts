/**
 * Donation Service
 * Manages donations and supporter badges
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export interface DonationTier {
  id: string;
  name: string;
  displayName: string;
  minAmount: number;
  maxAmount?: number;
  badgeEmoji: string;
  badgeColor: string;
  badgeDescription?: string;
  sortOrder: number;
}

export interface Donation {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  tierId?: string;
  tierName?: string;
  tierBadge?: string;
  paymentProvider: string;
  paymentStatus: string;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface UserDonationBadge {
  id: string;
  tierId: string;
  tierName: string;
  tierDisplayName: string;
  badgeEmoji: string;
  badgeColor: string;
  totalDonated: number;
  earnedAt: string;
  isDisplayed: boolean;
}

export interface DonorProfile {
  userId: string;
  username: string;
  avatarUrl?: string;
  totalDonated: number;
  donationCount: number;
  highestBadge?: string;
  highestTier?: string;
  badges: UserDonationBadge[];
  lastDonationAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  totalDonated: number;
  donationCount: number;
  highestBadge: string;
  highestTier: string;
}

export interface DonationStats {
  totalRaised: number;
  donorCount: number;
  averageDonation: number;
  thisMonthRaised: number;
  thisMonthDonors: number;
  topTier: string;
  topTierCount: number;
}

// ========================================
// SERVICE
// ========================================

class DonationService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');
    return client;
  }

  // ==================== TIERS ====================

  /**
   * Get all donation tiers
   */
  async getTiers(): Promise<DonationTier[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('donation_tiers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) return [];
    return (data || []).map(this.mapTier);
  }

  /**
   * Get tier for amount
   */
  async getTierForAmount(amount: number): Promise<DonationTier | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('donation_tiers')
      .select('*')
      .lte('min_amount', amount)
      .or(`max_amount.gte.${amount},max_amount.is.null`)
      .eq('is_active', true)
      .order('min_amount', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return this.mapTier(data);
  }

  // ==================== DONATIONS ====================

  /**
   * Create a donation (after payment is processed)
   */
  async processDonation(
    amount: number,
    paymentId: string,
    options: {
      paymentProvider?: string;
      message?: string;
      isAnonymous?: boolean;
    } = {}
  ): Promise<{
    donation: Donation;
    tierName?: string;
    badgeEmoji?: string;
    newBadgeEarned: boolean;
  }> {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('process_donation', {
      p_user_id: user.id,
      p_amount: amount,
      p_payment_id: paymentId,
      p_payment_provider: options.paymentProvider || 'stripe',
      p_message: options.message || null,
      p_is_anonymous: options.isAnonymous || false,
    });

    if (error) throw error;

    const result = data[0];

    // Fetch the full donation record
    const { data: donation } = await supabase
      .from('donations')
      .select(
        `
        *,
        donation_tiers:tier_id (name, badge_emoji)
      `
      )
      .eq('id', result.donation_id)
      .single();

    return {
      donation: this.mapDonation(donation),
      tierName: result.tier_name,
      badgeEmoji: result.badge_emoji,
      newBadgeEarned: result.new_badge_earned,
    };
  }

  /**
   * Get user's donations
   */
  async getUserDonations(userId?: string): Promise<Donation[]> {
    const supabase = this.getSupabase();

    let targetUserId = userId;
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }

    if (!targetUserId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('donations')
      .select(
        `
        *,
        donation_tiers:tier_id (name, badge_emoji)
      `
      )
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(this.mapDonation);
  }

  /**
   * Get user's total donated
   */
  async getUserTotalDonated(userId?: string): Promise<number> {
    const supabase = this.getSupabase();

    let targetUserId = userId;
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }

    if (!targetUserId) return 0;

    const { data } = await supabase
      .from('donations')
      .select('amount')
      .eq('user_id', targetUserId)
      .eq('payment_status', 'completed');

    return (data || []).reduce((sum, d) => sum + parseFloat(d.amount), 0);
  }

  // ==================== BADGES ====================

  /**
   * Get user's donation badges
   */
  async getUserBadges(userId?: string): Promise<UserDonationBadge[]> {
    const supabase = this.getSupabase();

    let targetUserId = userId;
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }

    if (!targetUserId) return [];

    const { data, error } = await supabase
      .from('user_donation_badges')
      .select(
        `
        *,
        donation_tiers:tier_id (name, display_name, badge_emoji, badge_color)
      `
      )
      .eq('user_id', targetUserId)
      .order('total_donated', { ascending: false });

    if (error) return [];
    return (data || []).map(this.mapBadge);
  }

  /**
   * Get user's highest badge
   */
  async getHighestBadge(userId?: string): Promise<UserDonationBadge | null> {
    const badges = await this.getUserBadges(userId);
    return badges[0] || null;
  }

  /**
   * Toggle badge visibility
   */
  async toggleBadgeDisplay(badgeId: string, displayed: boolean): Promise<void> {
    const supabase = this.getSupabase();

    await supabase
      .from('user_donation_badges')
      .update({ is_displayed: displayed })
      .eq('id', badgeId);
  }

  // ==================== DONOR PROFILE ====================

  /**
   * Get donor profile
   */
  async getDonorProfile(userId: string): Promise<DonorProfile | null> {
    const supabase = this.getSupabase();

    const { data: user } = await supabase
      .from('users')
      .select('id, username, avatar_url')
      .eq('id', userId)
      .single();

    if (!user) return null;

    const [donations, badges] = await Promise.all([
      this.getUserDonations(userId),
      this.getUserBadges(userId),
    ]);

    const totalDonated = donations
      .filter((d) => d.paymentStatus === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);

    const highestBadge = badges[0];

    return {
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatar_url,
      totalDonated,
      donationCount: donations.filter((d) => d.paymentStatus === 'completed').length,
      highestBadge: highestBadge?.badgeEmoji,
      highestTier: highestBadge?.tierDisplayName,
      badges: badges.filter((b) => b.isDisplayed),
      lastDonationAt: donations[0]?.createdAt,
    };
  }

  // ==================== LEADERBOARD ====================

  /**
   * Get donation leaderboard
   */
  async getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase.from('donation_leaderboard').select('*').limit(limit);

    if (error) return [];

    return (data || []).map((entry, index) => ({
      rank: index + 1,
      userId: entry.user_id,
      username: entry.username || 'Anonymous',
      avatarUrl: entry.avatar_url,
      totalDonated: parseFloat(entry.total_donated),
      donationCount: entry.donation_count,
      highestBadge: entry.highest_badge || '💚',
      highestTier: entry.highest_tier || 'Supporter',
    }));
  }

  // ==================== STATS ====================

  /**
   * Get donation statistics (admin)
   */
  async getStats(): Promise<DonationStats> {
    const supabase = this.getSupabase();

    const { data: allDonations } = await supabase
      .from('donations')
      .select('amount, user_id, created_at')
      .eq('payment_status', 'completed');

    const donations = allDonations || [];
    const totalRaised = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const donorCount = new Set(donations.map((d) => d.user_id)).size;
    const averageDonation = donations.length > 0 ? totalRaised / donations.length : 0;

    // This month
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthDonations = donations.filter((d) => new Date(d.created_at) >= monthStart);
    const thisMonthRaised = thisMonthDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const thisMonthDonors = new Set(thisMonthDonations.map((d) => d.user_id)).size;

    // Top tier
    const { data: topTierData } = await supabase
      .from('user_donation_badges')
      .select('tier_id, donation_tiers!inner(name)')
      .order('total_donated', { ascending: false });

    const tierCounts: Record<string, number> = {};
    (topTierData || []).forEach((b) => {
      const name = (b.donation_tiers as any)?.name;
      if (name) tierCounts[name] = (tierCounts[name] || 0) + 1;
    });

    const topTier = Object.entries(tierCounts).sort(([, a], [, b]) => b - a)[0];

    return {
      totalRaised,
      donorCount,
      averageDonation,
      thisMonthRaised,
      thisMonthDonors,
      topTier: topTier?.[0] || 'None',
      topTierCount: topTier?.[1] || 0,
    };
  }

  // ==================== PAYMENT INTEGRATION ====================

  /**
   * Create Stripe checkout session for donation
   */
  async createCheckoutSession(
    amount: number,
    options: {
      message?: string;
      isAnonymous?: boolean;
      successUrl: string;
      cancelUrl: string;
    }
  ): Promise<{ url: string }> {
    const response = await fetch('/api/donations/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        message: options.message,
        isAnonymous: options.isAnonymous,
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return response.json();
  }

  // ==================== MAPPERS ====================

  private mapTier(data: any): DonationTier {
    return {
      id: data.id,
      name: data.name,
      displayName: data.display_name,
      minAmount: parseFloat(data.min_amount),
      maxAmount: data.max_amount ? parseFloat(data.max_amount) : undefined,
      badgeEmoji: data.badge_emoji,
      badgeColor: data.badge_color,
      badgeDescription: data.badge_description,
      sortOrder: data.sort_order,
    };
  }

  private mapDonation(data: any): Donation {
    return {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      currency: data.currency,
      tierId: data.tier_id,
      tierName: data.donation_tiers?.name,
      tierBadge: data.donation_tiers?.badge_emoji,
      paymentProvider: data.payment_provider,
      paymentStatus: data.payment_status,
      message: data.message,
      isAnonymous: data.is_anonymous,
      createdAt: data.created_at,
    };
  }

  private mapBadge(data: any): UserDonationBadge {
    return {
      id: data.id,
      tierId: data.tier_id,
      tierName: data.donation_tiers?.name,
      tierDisplayName: data.donation_tiers?.display_name,
      badgeEmoji: data.donation_tiers?.badge_emoji,
      badgeColor: data.donation_tiers?.badge_color,
      totalDonated: parseFloat(data.total_donated),
      earnedAt: data.earned_at,
      isDisplayed: data.is_displayed,
    };
  }
}

export const donationService = new DonationService();
