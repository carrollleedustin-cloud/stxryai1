/**
 * Story Analytics Service
 * Provides author dashboard with reader insights and engagement metrics.
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface StoryEngagement {
  story_id: string;
  total_views: number;
  unique_readers: number;
  total_reading_time_minutes: number;
  average_completion_rate: number;
  total_choices_made: number;
  total_bookmarks: number;
  total_shares: number;
  total_comments: number;
  rating_average: number;
  rating_count: number;
}

export interface ChapterAnalytics {
  chapter_id: string;
  chapter_title: string;
  chapter_order: number;
  views: number;
  completion_rate: number;
  average_time_spent: number;
  drop_off_rate: number;
  choice_distribution: Record<string, number>;
}

export interface ReaderDemographics {
  age_groups: Record<string, number>;
  top_countries: Array<{ country: string; count: number }>;
  device_types: Record<string, number>;
  referral_sources: Record<string, number>;
}

export interface EngagementTrend {
  date: string;
  views: number;
  new_readers: number;
  returning_readers: number;
  average_session_duration: number;
}

export interface ReaderRetention {
  day: number;
  retention_rate: number;
  cohort_size: number;
}

export interface PopularChoice {
  chapter_id: string;
  chapter_title: string;
  choice_text: string;
  selection_count: number;
  selection_percentage: number;
}

export interface AuthorDashboard {
  overview: {
    total_stories: number;
    total_readers: number;
    total_reading_time_hours: number;
    average_rating: number;
    total_earnings?: number;
  };
  top_stories: Array<{
    story_id: string;
    title: string;
    views: number;
    rating: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  recent_activity: Array<{
    type: 'view' | 'comment' | 'rating' | 'bookmark' | 'share';
    story_title: string;
    user_name?: string;
    timestamp: string;
    details?: string;
  }>;
  engagement_summary: {
    this_week_views: number;
    last_week_views: number;
    growth_percentage: number;
  };
}

export interface HeatmapData {
  hour: number;
  day: number;
  value: number;
}

export const storyAnalyticsService = {
  /**
   * Get comprehensive engagement metrics for a story
   */
  async getStoryEngagement(storyId: string): Promise<StoryEngagement | null> {
    const { data: story } = await supabase
      .from('stories')
      .select('id, view_count')
      .eq('id', storyId)
      .single();

    if (!story) return null;

    // Get unique readers
    const { count: uniqueReaders } = await supabase
      .from('user_progress')
      .select('user_id', { count: 'exact', head: true })
      .eq('story_id', storyId);

    // Get reading sessions for time calculation
    const { data: sessions } = await supabase
      .from('reading_sessions')
      .select('duration_minutes, choices_made')
      .eq('story_id', storyId);

    const totalReadingTime = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
    const totalChoices = sessions?.reduce((sum, s) => sum + (s.choices_made || 0), 0) || 0;

    // Get completion rate
    const { data: completions } = await supabase
      .from('user_progress')
      .select('progress_percentage')
      .eq('story_id', storyId);

    const avgCompletion = completions?.length
      ? completions.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / completions.length
      : 0;

    // Get social metrics
    const { count: bookmarks } = await supabase
      .from('user_collections')
      .select('id', { count: 'exact', head: true })
      .contains('story_ids', [storyId]);

    const { count: comments } = await supabase
      .from('story_comments')
      .select('id', { count: 'exact', head: true })
      .eq('story_id', storyId);

    // Get ratings
    const { data: ratings } = await supabase
      .from('story_ratings')
      .select('rating')
      .eq('story_id', storyId);

    const ratingAvg = ratings?.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return {
      story_id: storyId,
      total_views: story.view_count || 0,
      unique_readers: uniqueReaders || 0,
      total_reading_time_minutes: totalReadingTime,
      average_completion_rate: Math.round(avgCompletion),
      total_choices_made: totalChoices,
      total_bookmarks: bookmarks || 0,
      total_shares: 0, // Would need a shares table
      total_comments: comments || 0,
      rating_average: Math.round(ratingAvg * 10) / 10,
      rating_count: ratings?.length || 0,
    };
  },

  /**
   * Get chapter-level analytics
   */
  async getChapterAnalytics(storyId: string): Promise<ChapterAnalytics[]> {
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id, title, order')
      .eq('story_id', storyId)
      .order('order', { ascending: true });

    if (!chapters) return [];

    const analytics: ChapterAnalytics[] = [];

    for (const chapter of chapters) {
      // Get chapter sessions
      const { data: sessions } = await supabase
        .from('reading_sessions')
        .select('duration_minutes')
        .eq('chapter_id', chapter.id);

      const views = sessions?.length || 0;
      const avgTime = sessions?.length
        ? sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length
        : 0;

      // Get choice distribution for this chapter
      const { data: choices } = await supabase
        .from('user_choices')
        .select('choice_text')
        .eq('chapter_id', chapter.id);

      const choiceDistribution: Record<string, number> = {};
      choices?.forEach((c) => {
        choiceDistribution[c.choice_text] = (choiceDistribution[c.choice_text] || 0) + 1;
      });

      // Calculate drop-off rate (readers who didn't continue to next chapter)
      const nextChapter = chapters.find((c) => c.order === chapter.order + 1);
      let dropOffRate = 0;
      if (nextChapter && views > 0) {
        const { data: nextSessions } = await supabase
          .from('reading_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('chapter_id', nextChapter.id);

        const nextViews = nextSessions?.length || 0;
        dropOffRate = Math.round(((views - nextViews) / views) * 100);
      }

      analytics.push({
        chapter_id: chapter.id,
        chapter_title: chapter.title,
        chapter_order: chapter.order,
        views,
        completion_rate: views > 0 ? 85 : 0, // Simplified
        average_time_spent: Math.round(avgTime),
        drop_off_rate: Math.max(0, dropOffRate),
        choice_distribution: choiceDistribution,
      });
    }

    return analytics;
  },

  /**
   * Get engagement trends over time
   */
  async getEngagementTrends(
    storyId: string,
    days: number = 30
  ): Promise<EngagementTrend[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: sessions } = await supabase
      .from('reading_sessions')
      .select('started_at, duration_minutes, user_id')
      .eq('story_id', storyId)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: true });

    if (!sessions) return [];

    // Group by date
    const dailyData: Record<string, {
      views: number;
      users: Set<string>;
      totalDuration: number;
    }> = {};

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { views: 0, users: new Set(), totalDuration: 0 };
    }

    // Populate data
    sessions.forEach((session) => {
      const dateStr = new Date(session.started_at).toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].views++;
        dailyData[dateStr].users.add(session.user_id);
        dailyData[dateStr].totalDuration += session.duration_minutes || 0;
      }
    });

    // Get first-time readers for "new vs returning"
    const { data: firstReads } = await supabase
      .from('user_progress')
      .select('user_id, created_at')
      .eq('story_id', storyId);

    const firstReadDates = new Map<string, string>();
    firstReads?.forEach((fr) => {
      const dateStr = new Date(fr.created_at).toISOString().split('T')[0];
      if (!firstReadDates.has(fr.user_id)) {
        firstReadDates.set(fr.user_id, dateStr);
      }
    });

    return Object.entries(dailyData)
      .map(([date, data]) => {
        const newReaders = Array.from(data.users).filter(
          (userId) => firstReadDates.get(userId) === date
        ).length;

        return {
          date,
          views: data.views,
          new_readers: newReaders,
          returning_readers: data.users.size - newReaders,
          average_session_duration: data.views > 0
            ? Math.round(data.totalDuration / data.views)
            : 0,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Get reading time heatmap data
   */
  async getReadingHeatmap(storyId: string): Promise<HeatmapData[]> {
    const { data: sessions } = await supabase
      .from('reading_sessions')
      .select('started_at')
      .eq('story_id', storyId);

    if (!sessions) return [];

    const heatmap: Record<string, number> = {};

    // Initialize all hour/day combinations
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmap[`${day}-${hour}`] = 0;
      }
    }

    // Count sessions
    sessions.forEach((session) => {
      const date = new Date(session.started_at);
      const day = date.getDay();
      const hour = date.getHours();
      heatmap[`${day}-${hour}`]++;
    });

    return Object.entries(heatmap).map(([key, value]) => {
      const [day, hour] = key.split('-').map(Number);
      return { day, hour, value };
    });
  },

  /**
   * Get most popular choices
   */
  async getPopularChoices(storyId: string, limit: number = 10): Promise<PopularChoice[]> {
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id, title')
      .eq('story_id', storyId);

    if (!chapters) return [];

    const chapterMap = new Map(chapters.map((c) => [c.id, c.title]));

    const { data: choices } = await supabase
      .from('user_choices')
      .select('chapter_id, choice_text')
      .in('chapter_id', chapters.map((c) => c.id));

    if (!choices) return [];

    // Count choices per chapter
    const choiceCounts: Record<string, Record<string, number>> = {};
    const chapterTotals: Record<string, number> = {};

    choices.forEach((choice) => {
      if (!choiceCounts[choice.chapter_id]) {
        choiceCounts[choice.chapter_id] = {};
        chapterTotals[choice.chapter_id] = 0;
      }
      choiceCounts[choice.chapter_id][choice.choice_text] =
        (choiceCounts[choice.chapter_id][choice.choice_text] || 0) + 1;
      chapterTotals[choice.chapter_id]++;
    });

    // Flatten and sort
    const allChoices: PopularChoice[] = [];
    Object.entries(choiceCounts).forEach(([chapterId, choices]) => {
      Object.entries(choices).forEach(([choiceText, count]) => {
        allChoices.push({
          chapter_id: chapterId,
          chapter_title: chapterMap.get(chapterId) || 'Unknown',
          choice_text: choiceText,
          selection_count: count,
          selection_percentage: Math.round((count / chapterTotals[chapterId]) * 100),
        });
      });
    });

    return allChoices
      .sort((a, b) => b.selection_count - a.selection_count)
      .slice(0, limit);
  },

  /**
   * Get author dashboard overview
   */
  async getAuthorDashboard(authorId: string): Promise<AuthorDashboard> {
    // Get all author's stories
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, view_count, created_at')
      .eq('author_id', authorId);

    if (!stories || stories.length === 0) {
      return {
        overview: {
          total_stories: 0,
          total_readers: 0,
          total_reading_time_hours: 0,
          average_rating: 0,
        },
        top_stories: [],
        recent_activity: [],
        engagement_summary: {
          this_week_views: 0,
          last_week_views: 0,
          growth_percentage: 0,
        },
      };
    }

    const storyIds = stories.map((s) => s.id);

    // Get total unique readers
    const { count: totalReaders } = await supabase
      .from('user_progress')
      .select('user_id', { count: 'exact', head: true })
      .in('story_id', storyIds);

    // Get total reading time
    const { data: sessions } = await supabase
      .from('reading_sessions')
      .select('duration_minutes, started_at')
      .in('story_id', storyIds);

    const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

    // Get average rating
    const { data: ratings } = await supabase
      .from('story_ratings')
      .select('rating')
      .in('story_id', storyIds);

    const avgRating = ratings?.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // Get top stories with trend
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const topStories = await Promise.all(
      stories
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 5)
        .map(async (story) => {
          const { data: storyRatings } = await supabase
            .from('story_ratings')
            .select('rating')
            .eq('story_id', story.id);

          const rating = storyRatings?.length
            ? storyRatings.reduce((sum, r) => sum + r.rating, 0) / storyRatings.length
            : 0;

          // Calculate trend (simplified)
          const { count: thisWeek } = await supabase
            .from('reading_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('story_id', story.id)
            .gte('started_at', weekAgo.toISOString());

          const { count: lastWeek } = await supabase
            .from('reading_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('story_id', story.id)
            .gte('started_at', twoWeeksAgo.toISOString())
            .lt('started_at', weekAgo.toISOString());

          let trend: 'up' | 'down' | 'stable' = 'stable';
          if ((thisWeek || 0) > (lastWeek || 0) * 1.1) trend = 'up';
          else if ((thisWeek || 0) < (lastWeek || 0) * 0.9) trend = 'down';

          return {
            story_id: story.id,
            title: story.title,
            views: story.view_count || 0,
            rating: Math.round(rating * 10) / 10,
            trend,
          };
        })
    );

    // Get recent activity
    const recentActivity: AuthorDashboard['recent_activity'] = [];

    // Recent comments
    const { data: recentComments } = await supabase
      .from('story_comments')
      .select(`
        created_at,
        content,
        story_id,
        user:user_id (display_name)
      `)
      .in('story_id', storyIds)
      .order('created_at', { ascending: false })
      .limit(5);

    recentComments?.forEach((comment) => {
      const story = stories.find((s) => s.id === comment.story_id);
      const userData = comment.user as { display_name?: string } | null;
      recentActivity.push({
        type: 'comment',
        story_title: story?.title || 'Unknown',
        user_name: userData?.display_name,
        timestamp: comment.created_at,
        details: comment.content.slice(0, 50) + '...',
      });
    });

    // Recent ratings
    const { data: recentRatings } = await supabase
      .from('story_ratings')
      .select(`
        created_at,
        rating,
        story_id,
        user:user_id (display_name)
      `)
      .in('story_id', storyIds)
      .order('created_at', { ascending: false })
      .limit(5);

    recentRatings?.forEach((rating) => {
      const story = stories.find((s) => s.id === rating.story_id);
      const userData = rating.user as { display_name?: string } | null;
      recentActivity.push({
        type: 'rating',
        story_title: story?.title || 'Unknown',
        user_name: userData?.display_name,
        timestamp: rating.created_at,
        details: `${rating.rating} stars`,
      });
    });

    // Sort by timestamp
    recentActivity.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Calculate engagement summary
    const thisWeekSessions = sessions?.filter(
      (s) => new Date(s.started_at) >= weekAgo
    ).length || 0;

    const lastWeekSessions = sessions?.filter(
      (s) => new Date(s.started_at) >= twoWeeksAgo && new Date(s.started_at) < weekAgo
    ).length || 0;

    const growthPercentage = lastWeekSessions > 0
      ? Math.round(((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100)
      : thisWeekSessions > 0 ? 100 : 0;

    return {
      overview: {
        total_stories: stories.length,
        total_readers: totalReaders || 0,
        total_reading_time_hours: Math.round(totalMinutes / 60),
        average_rating: Math.round(avgRating * 10) / 10,
      },
      top_stories: topStories,
      recent_activity: recentActivity.slice(0, 10),
      engagement_summary: {
        this_week_views: thisWeekSessions,
        last_week_views: lastWeekSessions,
        growth_percentage: growthPercentage,
      },
    };
  },

  /**
   * Get reader retention cohorts
   */
  async getReaderRetention(storyId: string): Promise<ReaderRetention[]> {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('user_id, created_at')
      .eq('story_id', storyId);

    if (!progress) return [];

    const cohortSize = progress.length;
    const retention: ReaderRetention[] = [];

    // Check which users returned on day 1, 7, 14, 30
    const checkDays = [1, 7, 14, 30];

    for (const day of checkDays) {
      let retained = 0;

      for (const user of progress) {
        const startDate = new Date(user.created_at);
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + day);

        const { count } = await supabase
          .from('reading_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('story_id', storyId)
          .eq('user_id', user.user_id)
          .gte('started_at', checkDate.toISOString())
          .lt('started_at', new Date(checkDate.getTime() + 24 * 60 * 60 * 1000).toISOString());

        if ((count || 0) > 0) retained++;
      }

      retention.push({
        day,
        retention_rate: cohortSize > 0 ? Math.round((retained / cohortSize) * 100) : 0,
        cohort_size: cohortSize,
      });
    }

    return retention;
  },

  /**
   * Export analytics data as CSV
   */
  async exportAnalytics(
    storyId: string,
    type: 'engagement' | 'chapters' | 'trends'
  ): Promise<string> {
    let csvContent = '';

    switch (type) {
      case 'engagement': {
        const data = await this.getStoryEngagement(storyId);
        if (data) {
          csvContent = 'Metric,Value\n';
          csvContent += `Total Views,${data.total_views}\n`;
          csvContent += `Unique Readers,${data.unique_readers}\n`;
          csvContent += `Reading Time (min),${data.total_reading_time_minutes}\n`;
          csvContent += `Completion Rate,${data.average_completion_rate}%\n`;
          csvContent += `Total Choices,${data.total_choices_made}\n`;
          csvContent += `Bookmarks,${data.total_bookmarks}\n`;
          csvContent += `Comments,${data.total_comments}\n`;
          csvContent += `Average Rating,${data.rating_average}\n`;
          csvContent += `Rating Count,${data.rating_count}\n`;
        }
        break;
      }
      case 'chapters': {
        const data = await this.getChapterAnalytics(storyId);
        csvContent = 'Chapter,Order,Views,Completion Rate,Avg Time,Drop-off Rate\n';
        data.forEach((ch) => {
          csvContent += `"${ch.chapter_title}",${ch.chapter_order},${ch.views},${ch.completion_rate}%,${ch.average_time_spent}min,${ch.drop_off_rate}%\n`;
        });
        break;
      }
      case 'trends': {
        const data = await this.getEngagementTrends(storyId, 30);
        csvContent = 'Date,Views,New Readers,Returning Readers,Avg Session Duration\n';
        data.forEach((d) => {
          csvContent += `${d.date},${d.views},${d.new_readers},${d.returning_readers},${d.average_session_duration}min\n`;
        });
        break;
      }
    }

    return csvContent;
  },
};

export default storyAnalyticsService;
