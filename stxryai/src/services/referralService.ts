/**
 * Referral Service
 * Manages referral codes, tracking, and rewards
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string | null;
  referralCode: string;
  status: 'pending' | 'completed' | 'rewarded';
  createdAt: string;
  completedAt: string | null;
  rewardedAt: string | null;
  metadata: Record<string, any>;
}

export interface ReferralReward {
  id: string;
  referralId: string;
  userId: string;
  rewardType: 'premium_month' | 'discount' | 'energy' | 'badge';
  rewardValue: string;
  rewardStatus: 'pending' | 'applied' | 'expired';
  appliedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  appliedRewards: number;
  pendingRewards: number;
}

// ========================================
// SERVICE CLASS
// ========================================

class ReferralService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  // ==================== REFERRAL CODE MANAGEMENT ====================

  /**
   * Generate or get existing referral code for user
   */
  async generateReferralCode(userId: string): Promise<string> {
    const supabase = this.getSupabase();

    // Check if user already has a referral code
    const { data: existing } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', userId)
      .limit(1)
      .single();

    if (existing) {
      return existing.referral_code;
    }

    // Generate new referral code using database function
    const { data: code, error } = await supabase.rpc('generate_referral_code', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error generating referral code:', error);
      // Fallback: generate client-side
      return `STXRY-${userId.slice(0, 8).toUpperCase()}`;
    }

    // Create referral record
    const { error: insertError } = await supabase.from('referrals').insert({
      referrer_id: userId,
      referral_code: code,
      status: 'pending',
    });

    if (insertError) {
      console.error('Error creating referral record:', insertError);
      throw insertError;
    }

    return code;
  }

  /**
   * Get referral code for user
   */
  async getReferralCode(userId: string): Promise<string | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', userId)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No referral code, generate one
        return await this.generateReferralCode(userId);
      }
      console.error('Error fetching referral code:', error);
      return null;
    }

    return data?.referral_code || null;
  }

  /**
   * Use referral code (when new user signs up)
   */
  async useReferralCode(code: string, newUserId: string): Promise<Referral | null> {
    const supabase = this.getSupabase();

    // Use database function to complete referral
    const { data, error } = await supabase.rpc('complete_referral', {
      p_referral_code: code,
      p_referee_id: newUserId,
    });

    if (error) {
      console.error('Error using referral code:', error);
      return null;
    }

    return this.mapReferral(data);
  }

  /**
   * Check if referral code is valid
   */
  async validateReferralCode(code: string, userId: string): Promise<boolean> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('referrals')
      .select('id, referrer_id, status')
      .eq('referral_code', code)
      .eq('status', 'pending')
      .single();

    if (error || !data) {
      return false;
    }

    // Can't use your own referral code
    if (data.referrer_id === userId) {
      return false;
    }

    return true;
  }

  // ==================== REFERRAL TRACKING ====================

  /**
   * Get user's referral statistics
   */
  async getReferralStats(userId: string): Promise<ReferralStats> {
    const supabase = this.getSupabase();

    // Get referrals
    const { data: referrals, error: refError } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_id', userId);

    if (refError) {
      console.error('Error fetching referrals:', refError);
      throw refError;
    }

    const totalReferrals = referrals?.length || 0;
    const completedReferrals =
      referrals?.filter((r) => r.status === 'completed' || r.status === 'rewarded').length || 0;
    const pendingReferrals = referrals?.filter((r) => r.status === 'pending').length || 0;

    // Get rewards
    const { data: rewards, error: rewardError } = await supabase
      .from('referral_rewards')
      .select('reward_status')
      .eq('user_id', userId);

    if (rewardError) {
      console.error('Error fetching rewards:', rewardError);
      throw rewardError;
    }

    const totalRewards = rewards?.length || 0;
    const appliedRewards = rewards?.filter((r) => r.reward_status === 'applied').length || 0;
    const pendingRewards = rewards?.filter((r) => r.reward_status === 'pending').length || 0;

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalRewards,
      appliedRewards,
      pendingRewards,
    };
  }

  /**
   * Get user's referrals
   */
  async getUserReferrals(userId: string): Promise<Referral[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }

    return (data || []).map(this.mapReferral);
  }

  /**
   * Get user's referral rewards
   */
  async getUserRewards(userId: string): Promise<ReferralReward[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }

    return (data || []).map(this.mapReward);
  }

  // ==================== SHARE TRACKING ====================

  /**
   * Track a share event
   */
  async trackShare(
    userId: string | null,
    storyId: string | null,
    platform: string,
    shareType: 'story' | 'achievement' | 'streak' | 'milestone' | 'referral' = 'story',
    shareUrl: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const supabase = this.getSupabase();

    const { error } = await supabase.from('share_tracking').insert({
      user_id: userId,
      story_id: storyId,
      share_platform: platform,
      share_type: shareType,
      share_url: shareUrl,
      metadata,
    });

    if (error) {
      console.error('Error tracking share:', error);
      // Don't throw - share tracking failure shouldn't break sharing
    }
  }

  /**
   * Get share statistics for a story
   */
  async getStoryShareStats(storyId: string): Promise<Record<string, number>> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('share_tracking')
      .select('share_platform')
      .eq('story_id', storyId);

    if (error) {
      console.error('Error fetching share stats:', error);
      return {};
    }

    const stats: Record<string, number> = {};
    data?.forEach((share) => {
      stats[share.share_platform] = (stats[share.share_platform] || 0) + 1;
    });

    return stats;
  }

  // ==================== HELPER METHODS ====================

  private mapReferral(data: any): Referral {
    return {
      id: data.id,
      referrerId: data.referrer_id,
      refereeId: data.referee_id,
      referralCode: data.referral_code,
      status: data.status,
      createdAt: data.created_at,
      completedAt: data.completed_at,
      rewardedAt: data.rewarded_at,
      metadata: data.metadata || {},
    };
  }

  private mapReward(data: any): ReferralReward {
    return {
      id: data.id,
      referralId: data.referral_id,
      userId: data.user_id,
      rewardType: data.reward_type,
      rewardValue: data.reward_value,
      rewardStatus: data.reward_status,
      appliedAt: data.applied_at,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// Export singleton instance
export const referralService = new ReferralService();
