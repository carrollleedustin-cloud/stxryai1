/**
 * Social Proof Service
 * Real-time reader counts, trending stories, and milestones
 */

import { createClient } from '@/lib/supabase/client';

export interface LiveReaderCount {
  storyId: string;
  count: number;
  recentReaders: Array<{
    displayName: string;
    avatarUrl: string;
  }>;
}

export interface TrendingStory {
  storyId: string;
  storyTitle: string;
  storyDescription: string;
  coverImageUrl: string;
  authorName: string;
  genre: string;
  rank: number;
  score: number;
  readsCount: number;
  likesCount: number;
  sharesCount: number;
  trendingReason: string;
}

export interface StoryMilestone {
  milestoneType: 'readers' | 'likes' | 'comments' | 'shares' | 'completions';
  milestoneValue: number;
  achievedAt: string;
  announced: boolean;
}

class SocialProofService {
  private supabase = createClient();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Join as live reader
   */
  async joinAsLiveReader(userId: string, storyId: string): Promise<void> {
    try {
      await this.supabase.from('story_live_readers').upsert({
        story_id: storyId,
        user_id: userId,
        started_at: new Date().toISOString(),
        last_heartbeat: new Date().toISOString(),
      });

      // Start heartbeat
      this.startHeartbeat(userId, storyId);
    } catch (error) {
      console.error('Error joining as live reader:', error);
    }
  }

  /**
   * Leave as live reader
   */
  async leaveAsLiveReader(userId: string, storyId: string): Promise<void> {
    try {
      this.stopHeartbeat();
      
      await this.supabase
        .from('story_live_readers')
        .delete()
        .eq('story_id', storyId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error leaving as live reader:', error);
    }
  }

  /**
   * Start heartbeat to keep reader status alive
   */
  private startHeartbeat(userId: string, storyId: string): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.supabase
          .from('story_live_readers')
          .update({ last_heartbeat: new Date().toISOString() })
          .eq('story_id', storyId)
          .eq('user_id', userId);
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get live reader count for a story
   */
  async getLiveReaderCount(storyId: string): Promise<LiveReaderCount> {
    try {
      // Count readers with recent heartbeat (last 2 minutes)
      const twoMinutesAgo = new Date();
      twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

      const { data, error, count } = await this.supabase
        .from('story_live_readers')
        .select(`
          user_id,
          user_profiles!story_live_readers_user_id_fkey (
            display_name,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('story_id', storyId)
        .gte('last_heartbeat', twoMinutesAgo.toISOString())
        .limit(5);

      if (error) {
        console.error('Error getting live reader count:', error);
        return { storyId, count: 0, recentReaders: [] };
      }

      return {
        storyId,
        count: count || 0,
        recentReaders: (data || []).map((r) => ({
          displayName: (r.user_profiles as any)?.display_name || 'Reader',
          avatarUrl: (r.user_profiles as any)?.avatar_url || '',
        })),
      };
    } catch (error) {
      console.error('Error in getLiveReaderCount:', error);
      return { storyId, count: 0, recentReaders: [] };
    }
  }

  /**
   * Get trending stories
   */
  async getTrendingStories(
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'weekly',
    limit: number = 10
  ): Promise<TrendingStory[]> {
    try {
      const { data, error } = await this.supabase
        .from('trending_stories')
        .select(`
          story_id,
          rank,
          score,
          reads_count,
          likes_count,
          shares_count,
          stories!trending_stories_story_id_fkey (
            id, title, description, cover_image_url, genre,
            user_profiles!stories_author_id_fkey (display_name)
          )
        `)
        .eq('period', period)
        .order('rank', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching trending stories:', error);
        return [];
      }

      return (data || []).map((t) => {
        const story = t.stories as any;
        return {
          storyId: t.story_id,
          storyTitle: story?.title || '',
          storyDescription: story?.description || '',
          coverImageUrl: story?.cover_image_url || '',
          authorName: story?.user_profiles?.display_name || 'Unknown',
          genre: story?.genre || '',
          rank: t.rank,
          score: t.score,
          readsCount: t.reads_count,
          likesCount: t.likes_count,
          sharesCount: t.shares_count,
          trendingReason: this.getTrendingReason(t),
        };
      });
    } catch (error) {
      console.error('Error in getTrendingStories:', error);
      return [];
    }
  }

  /**
   * Generate trending reason text
   */
  private getTrendingReason(data: any): string {
    const reasons: string[] = [];
    
    if (data.reads_count > 1000) {
      reasons.push(`${this.formatNumber(data.reads_count)} readers`);
    }
    if (data.likes_count > 100) {
      reasons.push(`${this.formatNumber(data.likes_count)} likes`);
    }
    if (data.shares_count > 50) {
      reasons.push(`${this.formatNumber(data.shares_count)} shares`);
    }

    return reasons.length > 0 ? reasons.join(' • ') : 'Trending now';
  }

  /**
   * Format number for display
   */
  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Calculate and update trending scores
   */
  async updateTrendingScores(): Promise<void> {
    // This would typically run as a scheduled job
    // Scoring algorithm considers:
    // - Recent reads (weighted heavily)
    // - Likes (weighted moderately)
    // - Shares (weighted highly)
    // - Comments (weighted moderately)
    // - Velocity (how fast metrics are growing)
    
    const periods: Array<{ name: string; hours: number }> = [
      { name: 'hourly', hours: 1 },
      { name: 'daily', hours: 24 },
      { name: 'weekly', hours: 168 },
      { name: 'monthly', hours: 720 },
    ];

    for (const period of periods) {
      const since = new Date();
      since.setHours(since.getHours() - period.hours);

      // Get story metrics for the period
      const { data: stories } = await this.supabase
        .from('stories')
        .select('id, play_count, like_count')
        .eq('is_published', true)
        .gte('updated_at', since.toISOString());

      if (!stories) continue;

      // Calculate scores
      const scored = stories.map((story) => ({
        storyId: story.id,
        score: (story.play_count || 0) * 1 + (story.like_count || 0) * 3,
        readsCount: story.play_count || 0,
        likesCount: story.like_count || 0,
      }));

      // Sort by score
      scored.sort((a, b) => b.score - a.score);

      // Update trending table
      for (let i = 0; i < Math.min(scored.length, 100); i++) {
        const story = scored[i];
        await this.supabase.from('trending_stories').upsert({
          story_id: story.storyId,
          period: period.name,
          rank: i + 1,
          score: story.score,
          reads_count: story.readsCount,
          likes_count: story.likesCount,
          shares_count: 0, // Would need to calculate from shares table
          computed_at: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Get story milestones
   */
  async getStoryMilestones(storyId: string): Promise<StoryMilestone[]> {
    try {
      const { data, error } = await this.supabase
        .from('story_milestones')
        .select('*')
        .eq('story_id', storyId)
        .order('achieved_at', { ascending: false });

      if (error) {
        console.error('Error fetching story milestones:', error);
        return [];
      }

      return (data || []).map((m) => ({
        milestoneType: m.milestone_type,
        milestoneValue: m.milestone_value,
        achievedAt: m.achieved_at,
        announced: m.announced,
      }));
    } catch (error) {
      console.error('Error in getStoryMilestones:', error);
      return [];
    }
  }

  /**
   * Check and record milestones
   */
  async checkMilestones(storyId: string, metrics: {
    readers?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    completions?: number;
  }): Promise<StoryMilestone[]> {
    const milestoneThresholds = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];
    const newMilestones: StoryMilestone[] = [];

    for (const [metricType, value] of Object.entries(metrics)) {
      if (!value) continue;

      for (const threshold of milestoneThresholds) {
        if (value >= threshold) {
          // Check if already recorded
          const { data: existing } = await this.supabase
            .from('story_milestones')
            .select('id')
            .eq('story_id', storyId)
            .eq('milestone_type', metricType)
            .eq('milestone_value', threshold)
            .single();

          if (!existing) {
            // Record new milestone
            const { error } = await this.supabase.from('story_milestones').insert({
              story_id: storyId,
              milestone_type: metricType,
              milestone_value: threshold,
              announced: false,
            });

            if (!error) {
              newMilestones.push({
                milestoneType: metricType as any,
                milestoneValue: threshold,
                achievedAt: new Date().toISOString(),
                announced: false,
              });
            }
          }
        }
      }
    }

    return newMilestones;
  }

  /**
   * Mark milestone as announced
   */
  async announceMilestone(storyId: string, milestoneType: string, milestoneValue: number): Promise<void> {
    try {
      await this.supabase
        .from('story_milestones')
        .update({ announced: true })
        .eq('story_id', storyId)
        .eq('milestone_type', milestoneType)
        .eq('milestone_value', milestoneValue);
    } catch (error) {
      console.error('Error announcing milestone:', error);
    }
  }

  /**
   * Get social proof summary for story
   */
  async getSocialProofSummary(storyId: string): Promise<{
    liveReaders: number;
    totalReaders: number;
    likes: number;
    completionRate: number;
    latestMilestone: StoryMilestone | null;
    trendingRank: number | null;
  }> {
    try {
      // Get live readers
      const liveCount = await this.getLiveReaderCount(storyId);

      // Get story stats
      const { data: story } = await this.supabase
        .from('stories')
        .select('play_count, like_count')
        .eq('id', storyId)
        .single();

      // Get latest milestone
      const milestones = await this.getStoryMilestones(storyId);
      const latestMilestone = milestones[0] || null;

      // Get trending rank
      const { data: trending } = await this.supabase
        .from('trending_stories')
        .select('rank')
        .eq('story_id', storyId)
        .eq('period', 'weekly')
        .single();

      // Calculate completion rate (would need more data)
      const completionRate = 0; // Placeholder

      return {
        liveReaders: liveCount.count,
        totalReaders: story?.play_count || 0,
        likes: story?.like_count || 0,
        completionRate,
        latestMilestone,
        trendingRank: trending?.rank || null,
      };
    } catch (error) {
      console.error('Error getting social proof summary:', error);
      return {
        liveReaders: 0,
        totalReaders: 0,
        likes: 0,
        completionRate: 0,
        latestMilestone: null,
        trendingRank: null,
      };
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToLiveReaders(storyId: string, callback: (count: number) => void): () => void {
    const channel = this.supabase
      .channel(`live_readers_${storyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_live_readers',
          filter: `story_id=eq.${storyId}`,
        },
        async () => {
          const count = await this.getLiveReaderCount(storyId);
          callback(count.count);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}

export const socialProofService = new SocialProofService();
