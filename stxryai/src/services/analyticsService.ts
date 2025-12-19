/**
 * Analytics Service
 * Provides analytics data for creators including performance metrics, audience insights, and revenue tracking
 */

import { createClient } from '@/lib/supabase/client';

export interface StoryPerformance {
  id: string;
  storyId: string;
  currentViews: number;
  currentReaders: number;
  currentLikes: number;
  currentComments: number;
  currentReviews: number;
  currentBookmarks: number;
  currentRating: number;
  currentRatingCount: number;
  totalRevenue: number;
  totalPurchases: number;
  totalSubscriptions: number;
  totalTips: number;
  engagementScore: number;
  popularityScore: number;
  revenueScore: number;
  overallScore: number;
  viewsTrend?: 'up' | 'down' | 'stable';
  revenueTrend?: 'up' | 'down' | 'stable';
  engagementTrend?: 'up' | 'down' | 'stable';
  lastCalculatedAt: string;
  updatedAt: string;
}

export interface CreatorAnalyticsSnapshot {
  id: string;
  creatorId: string;
  storyId?: string;
  snapshotDate: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'all_time';
  totalViews: number;
  uniqueReaders: number;
  totalReads: number;
  averageReadingTimeMinutes: number;
  completionRate: number;
  totalLikes: number;
  totalComments: number;
  totalReviews: number;
  averageRating: number;
  totalBookmarks: number;
  totalShares: number;
  totalRevenue: number;
  totalPurchases: number;
  totalSubscriptions: number;
  totalTips: number;
  averagePurchaseValue: number;
  newReaders: number;
  returningReaders: number;
  topCountries: any[];
  topDemographics: Record<string, any>;
  chaptersPublished: number;
  wordsWritten: number;
  averageChapterLength: number;
  viewsGrowthPercentage: number;
  revenueGrowthPercentage: number;
  readersGrowthPercentage: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceInsights {
  id: string;
  creatorId: string;
  storyId?: string;
  periodStart: string;
  periodEnd: string;
  countryDistribution: Record<string, number>;
  cityDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  browserDistribution: Record<string, number>;
  osDistribution: Record<string, number>;
  averageSessionDurationMinutes: number;
  averageChaptersPerSession: number;
  peakReadingTimes: Record<string, number>;
  preferredGenres: string[];
  mostActiveDays: Record<string, number>;
  retentionRate: number;
  churnRate: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueAnalytics {
  id: string;
  creatorId: string;
  storyId?: string;
  periodStart: string;
  periodEnd: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  purchaseRevenue: number;
  subscriptionRevenue: number;
  tipRevenue: number;
  totalRevenue: number;
  purchaseCount: number;
  subscriptionCount: number;
  tipCount: number;
  totalTransactions: number;
  averagePurchaseValue: number;
  averageSubscriptionValue: number;
  averageTipValue: number;
  viewsToPurchaseRate: number;
  readersToPurchaseRate: number;
  conversionRate: number;
  revenueByStory: Record<string, number>;
  revenueByCountry: Record<string, number>;
  revenueGrowthPercentage: number;
  transactionGrowthPercentage: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsOverview {
  totalStories: number;
  totalViews: number;
  totalReaders: number;
  totalRevenue: number;
  totalEarnings: number;
  averageRating: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  conversionRate: number;
  topPerformingStories: Array<{
    storyId: string;
    title: string;
    views: number;
    revenue: number;
    rating: number;
  }>;
}

export class AnalyticsService {
  private supabase = createClient();

  // ========================================
  // STORY PERFORMANCE
  // ========================================

  /**
   * Get performance metrics for a story
   */
  async getStoryPerformance(storyId: string): Promise<StoryPerformance | null> {
    // Calculate/update performance first
    await this.supabase.rpc('calculate_story_performance', {
      p_story_id: storyId,
    });

    const { data, error } = await this.supabase
      .from('story_performance_tracking')
      .select('*')
      .eq('story_id', storyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapStoryPerformance(data);
  }

  /**
   * Get performance for all creator's stories
   */
  async getCreatorStoriesPerformance(creatorId: string): Promise<StoryPerformance[]> {
    const { data, error } = await this.supabase
      .from('story_performance_tracking')
      .select(`
        *,
        stories!inner(author_id)
      `)
      .eq('stories.author_id', creatorId)
      .order('overall_score', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapStoryPerformance(item));
  }

  /**
   * Calculate performance for a story (triggers recalculation)
   */
  async calculateStoryPerformance(storyId: string): Promise<void> {
    const { error } = await this.supabase.rpc('calculate_story_performance', {
      p_story_id: storyId,
    });

    if (error) throw error;
  }

  // ========================================
  // ANALYTICS OVERVIEW
  // ========================================

  /**
   * Get comprehensive analytics overview for creator
   */
  async getCreatorOverview(creatorId: string): Promise<AnalyticsOverview> {
    // Get all creator's stories
    const { data: stories } = await this.supabase
      .from('stories')
      .select('id, title')
      .eq('author_id', creatorId);

    const storyIds = stories?.map(s => s.id) || [];

    if (storyIds.length === 0) {
      return this.getEmptyOverview();
    }

    // Get aggregated metrics
    const [
      viewsResult,
      readersResult,
      likesResult,
      commentsResult,
      reviewsResult,
      purchasesResult,
      earningsResult,
    ] = await Promise.all([
      // Total views
      this.supabase
        .from('reading_progress')
        .select('id', { count: 'exact', head: true })
        .in('story_id', storyIds),
      
      // Unique readers
      this.supabase
        .from('reading_progress')
        .select('user_id')
        .in('story_id', storyIds),
      
      // Total likes
      this.supabase
        .from('story_likes')
        .select('id', { count: 'exact', head: true })
        .in('story_id', storyIds),
      
      // Total comments
      this.supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .in('story_id', storyIds),
      
      // Reviews and rating
      this.supabase
        .from('reviews')
        .select('rating')
        .in('story_id', storyIds),
      
      // Purchases
      this.supabase
        .from('story_purchases')
        .select('amount_paid')
        .in('story_id', storyIds)
        .eq('payment_status', 'succeeded'),
      
      // Earnings
      this.supabase
        .from('creator_earnings')
        .select('creator_earnings')
        .eq('creator_id', creatorId),
    ]);

    const totalViews = viewsResult.count || 0;
    const uniqueReaders = new Set(readersResult.data?.map(r => r.user_id) || []).size;
    const totalLikes = likesResult.count || 0;
    const totalComments = commentsResult.count || 0;
    const reviews = reviewsResult.data || [];
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;
    const purchases = purchasesResult.data || [];
    const totalRevenue = purchases.reduce((sum, p) => sum + parseFloat(p.amount_paid || '0'), 0);
    const earnings = earningsResult.data || [];
    const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.creator_earnings || '0'), 0);

    // Get top performing stories
    const performances = await this.getCreatorStoriesPerformance(creatorId);
    const topPerformingStories = performances
      .slice(0, 5)
      .map(p => ({
        storyId: p.storyId,
        title: stories?.find(s => s.id === p.storyId)?.title || 'Unknown',
        views: p.currentViews,
        revenue: p.totalRevenue,
        rating: p.currentRating,
      }));

    const engagementRate = totalReaders > 0
      ? ((totalLikes + totalComments) / totalReaders) * 100
      : 0;

    const conversionRate = totalReaders > 0
      ? (purchases.length / totalReaders) * 100
      : 0;

    return {
      totalStories: storyIds.length,
      totalViews,
      totalReaders: uniqueReaders,
      totalRevenue,
      totalEarnings,
      averageRating,
      totalLikes,
      totalComments,
      engagementRate,
      conversionRate,
      topPerformingStories,
    };
  }

  // ========================================
  // REVENUE ANALYTICS
  // ========================================

  /**
   * Get revenue analytics for a period
   */
  async getRevenueAnalytics(
    creatorId: string,
    periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
    limit: number = 12
  ): Promise<RevenueAnalytics[]> {
    const { data, error } = await this.supabase
      .from('revenue_analytics')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('period_type', periodType)
      .order('period_start', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((item: any) => this.mapRevenueAnalytics(item));
  }

  // ========================================
  // AUDIENCE INSIGHTS
  // ========================================

  /**
   * Get audience insights
   */
  async getAudienceInsights(
    creatorId: string,
    storyId?: string,
    limit: number = 1
  ): Promise<AudienceInsights | null> {
    let query = this.supabase
      .from('audience_insights')
      .select('*')
      .eq('creator_id', creatorId)
      .order('period_end', { ascending: false })
      .limit(limit);

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return this.mapAudienceInsights(data[0]);
  }

  // ========================================
  // ANALYTICS SNAPSHOTS
  // ========================================

  /**
   * Get analytics snapshots
   */
  async getAnalyticsSnapshots(
    creatorId: string,
    storyId?: string,
    periodType: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'monthly',
    limit: number = 12
  ): Promise<CreatorAnalyticsSnapshot[]> {
    let query = this.supabase
      .from('creator_analytics_snapshots')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('period_type', periodType)
      .order('snapshot_date', { ascending: false })
      .limit(limit);

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((item: any) => this.mapAnalyticsSnapshot(item));
  }

  /**
   * Generate analytics snapshot
   */
  async generateSnapshot(
    creatorId: string,
    storyId?: string,
    periodType: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'daily'
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc('generate_analytics_snapshot', {
      p_creator_id: creatorId,
      p_story_id: storyId || null,
      p_period_type: periodType,
    });

    if (error) throw error;
    return data;
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapStoryPerformance(data: any): StoryPerformance {
    return {
      id: data.id,
      storyId: data.story_id,
      currentViews: data.current_views || 0,
      currentReaders: data.current_readers || 0,
      currentLikes: data.current_likes || 0,
      currentComments: data.current_comments || 0,
      currentReviews: data.current_reviews || 0,
      currentBookmarks: data.current_bookmarks || 0,
      currentRating: parseFloat(data.current_rating || '0'),
      currentRatingCount: data.current_rating_count || 0,
      totalRevenue: parseFloat(data.total_revenue || '0'),
      totalPurchases: data.total_purchases || 0,
      totalSubscriptions: data.total_subscriptions || 0,
      totalTips: parseFloat(data.total_tips || '0'),
      engagementScore: parseFloat(data.engagement_score || '0'),
      popularityScore: parseFloat(data.popularity_score || '0'),
      revenueScore: parseFloat(data.revenue_score || '0'),
      overallScore: parseFloat(data.overall_score || '0'),
      viewsTrend: data.views_trend,
      revenueTrend: data.revenue_trend,
      engagementTrend: data.engagement_trend,
      lastCalculatedAt: data.last_calculated_at,
      updatedAt: data.updated_at,
    };
  }

  private mapAnalyticsSnapshot(data: any): CreatorAnalyticsSnapshot {
    return {
      id: data.id,
      creatorId: data.creator_id,
      storyId: data.story_id,
      snapshotDate: data.snapshot_date,
      periodType: data.period_type,
      totalViews: data.total_views || 0,
      uniqueReaders: data.unique_readers || 0,
      totalReads: data.total_reads || 0,
      averageReadingTimeMinutes: parseFloat(data.average_reading_time_minutes || '0'),
      completionRate: parseFloat(data.completion_rate || '0'),
      totalLikes: data.total_likes || 0,
      totalComments: data.total_comments || 0,
      totalReviews: data.total_reviews || 0,
      averageRating: parseFloat(data.average_rating || '0'),
      totalBookmarks: data.total_bookmarks || 0,
      totalShares: data.total_shares || 0,
      totalRevenue: parseFloat(data.total_revenue || '0'),
      totalPurchases: data.total_purchases || 0,
      totalSubscriptions: data.total_subscriptions || 0,
      totalTips: parseFloat(data.total_tips || '0'),
      averagePurchaseValue: parseFloat(data.average_purchase_value || '0'),
      newReaders: data.new_readers || 0,
      returningReaders: data.returning_readers || 0,
      topCountries: data.top_countries || [],
      topDemographics: data.top_demographics || {},
      chaptersPublished: data.chapters_published || 0,
      wordsWritten: data.words_written || 0,
      averageChapterLength: data.average_chapter_length || 0,
      viewsGrowthPercentage: parseFloat(data.views_growth_percentage || '0'),
      revenueGrowthPercentage: parseFloat(data.revenue_growth_percentage || '0'),
      readersGrowthPercentage: parseFloat(data.readers_growth_percentage || '0'),
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapAudienceInsights(data: any): AudienceInsights {
    return {
      id: data.id,
      creatorId: data.creator_id,
      storyId: data.story_id,
      periodStart: data.period_start,
      periodEnd: data.period_end,
      countryDistribution: data.country_distribution || {},
      cityDistribution: data.city_distribution || {},
      ageDistribution: data.age_distribution || {},
      genderDistribution: data.gender_distribution || {},
      deviceDistribution: data.device_distribution || {},
      browserDistribution: data.browser_distribution || {},
      osDistribution: data.os_distribution || {},
      averageSessionDurationMinutes: parseFloat(data.average_session_duration_minutes || '0'),
      averageChaptersPerSession: parseFloat(data.average_chapters_per_session || '0'),
      peakReadingTimes: data.peak_reading_times || {},
      preferredGenres: data.preferred_genres || [],
      mostActiveDays: data.most_active_days || {},
      retentionRate: parseFloat(data.retention_rate || '0'),
      churnRate: parseFloat(data.churn_rate || '0'),
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapRevenueAnalytics(data: any): RevenueAnalytics {
    return {
      id: data.id,
      creatorId: data.creator_id,
      storyId: data.story_id,
      periodStart: data.period_start,
      periodEnd: data.period_end,
      periodType: data.period_type,
      purchaseRevenue: parseFloat(data.purchase_revenue || '0'),
      subscriptionRevenue: parseFloat(data.subscription_revenue || '0'),
      tipRevenue: parseFloat(data.tip_revenue || '0'),
      totalRevenue: parseFloat(data.total_revenue || '0'),
      purchaseCount: data.purchase_count || 0,
      subscriptionCount: data.subscription_count || 0,
      tipCount: data.tip_count || 0,
      totalTransactions: data.total_transactions || 0,
      averagePurchaseValue: parseFloat(data.average_purchase_value || '0'),
      averageSubscriptionValue: parseFloat(data.average_subscription_value || '0'),
      averageTipValue: parseFloat(data.average_tip_value || '0'),
      viewsToPurchaseRate: parseFloat(data.views_to_purchase_rate || '0'),
      readersToPurchaseRate: parseFloat(data.readers_to_purchase_rate || '0'),
      conversionRate: parseFloat(data.conversion_rate || '0'),
      revenueByStory: data.revenue_by_story || {},
      revenueByCountry: data.revenue_by_country || {},
      revenueGrowthPercentage: parseFloat(data.revenue_growth_percentage || '0'),
      transactionGrowthPercentage: parseFloat(data.transaction_growth_percentage || '0'),
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private getEmptyOverview(): AnalyticsOverview {
    return {
      totalStories: 0,
      totalViews: 0,
      totalReaders: 0,
      totalRevenue: 0,
      totalEarnings: 0,
      averageRating: 0,
      totalLikes: 0,
      totalComments: 0,
      engagementRate: 0,
      conversionRate: 0,
      topPerformingStories: [],
    };
  }
}

export const analyticsService = new AnalyticsService();
