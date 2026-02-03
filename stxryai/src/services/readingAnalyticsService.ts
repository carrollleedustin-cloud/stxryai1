/**
 * Reading Analytics Service
 * User reading statistics, trends, and yearly wrapped
 */

import { createClient } from '@/lib/supabase/client';

export interface ReadingStats {
  totalStoriesRead: number;
  totalChaptersRead: number;
  totalWordsRead: number;
  totalTimeMinutes: number;
  totalChoicesMade: number;
  storiesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  favoriteGenre: string | null;
  avgSessionMinutes: number;
  readingDays: number;
}

export interface ReadingTrend {
  date: string;
  minutesRead: number;
  chaptersRead: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | null;
}

export interface GenreBreakdown {
  genre: string;
  storiesRead: number;
  totalTimeMinutes: number;
  preferenceScore: number;
}

export interface ReadingChallenge {
  id: string;
  year: number;
  challengeType: 'books_goal' | 'pages_goal' | 'genre_diversity' | 'author_variety' | 'streak_goal';
  targetValue: number;
  currentValue: number;
  completedAt: string | null;
  progressPercentage: number;
}

export interface YearlyWrapped {
  year: number;
  totalStories: number;
  totalChapters: number;
  totalWords: number;
  totalTimeHours: number;
  topGenres: Array<{ genre: string; count: number }>;
  topAuthors: Array<{ authorId: string; name: string; count: number }>;
  topStories: Array<{ storyId: string; title: string; completedAt: string }>;
  longestStreak: number;
  achievementsEarned: number;
  readingPersonality: string;
}

class ReadingAnalyticsService {
  private supabase = createClient();

  /**
   * Get comprehensive reading stats
   */
  async getReadingStats(userId: string, period: 'all_time' | 'yearly' | 'monthly' | 'weekly' = 'all_time'): Promise<ReadingStats> {
    try {
      const periodStart = this.getPeriodStart(period);

      // Get aggregated stats
      const { data: analytics } = await this.supabase
        .from('user_reading_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('period', period === 'all_time' ? 'all_time' : period)
        .single();

      if (analytics) {
        return {
          totalStoriesRead: analytics.stories_read,
          totalChaptersRead: analytics.chapters_read,
          totalWordsRead: analytics.words_read,
          totalTimeMinutes: analytics.time_spent_minutes,
          totalChoicesMade: analytics.choices_made,
          storiesCompleted: analytics.stories_completed,
          currentStreak: 0, // Get from streak service
          longestStreak: 0,
          favoriteGenre: analytics.favorite_genre,
          avgSessionMinutes: analytics.avg_session_minutes,
          readingDays: analytics.reading_days,
        };
      }

      // Calculate from raw data if not cached
      return await this.calculateStats(userId, periodStart);
    } catch (error) {
      console.error('Error getting reading stats:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Calculate stats from raw data
   */
  private async calculateStats(userId: string, since?: Date): Promise<ReadingStats> {
    try {
      let historyQuery = this.supabase
        .from('reading_history')
        .select('action_type, story_id, created_at')
        .eq('user_id', userId);

      if (since) {
        historyQuery = historyQuery.gte('created_at', since.toISOString());
      }

      const { data: history } = await historyQuery;

      if (!history) {
        return this.getEmptyStats();
      }

      const storiesStarted = history.filter(h => h.action_type === 'started').length;
      const storiesCompleted = history.filter(h => h.action_type === 'completed_story').length;
      const chaptersCompleted = history.filter(h => h.action_type === 'completed_chapter').length;
      const choicesMade = history.filter(h => h.action_type === 'choice_made').length;

      // Get genre breakdown for favorite
      const completedStoryIds = history
        .filter(h => h.action_type === 'completed_story')
        .map(h => h.story_id);

      let favoriteGenre: string | null = null;
      if (completedStoryIds.length > 0) {
        const { data: stories } = await this.supabase
          .from('stories')
          .select('genre')
          .in('id', completedStoryIds);

        const genreCounts: Record<string, number> = {};
        for (const story of stories || []) {
          if (story.genre) {
            genreCounts[story.genre] = (genreCounts[story.genre] || 0) + 1;
          }
        }

        const sorted = Object.entries(genreCounts).sort(([, a], [, b]) => b - a);
        favoriteGenre = sorted[0]?.[0] || null;
      }

      // Get reading days
      const uniqueDays = new Set(
        history.map(h => new Date(h.created_at).toISOString().split('T')[0])
      );

      return {
        totalStoriesRead: storiesStarted,
        totalChaptersRead: chaptersCompleted,
        totalWordsRead: 0, // Would need to aggregate from sessions
        totalTimeMinutes: 0,
        totalChoicesMade: choicesMade,
        storiesCompleted,
        currentStreak: 0,
        longestStreak: 0,
        favoriteGenre,
        avgSessionMinutes: 0,
        readingDays: uniqueDays.size,
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Get reading trends over time
   */
  async getReadingTrends(userId: string, days: number = 30): Promise<ReadingTrend[]> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await this.supabase
        .from('reading_trends')
        .select('*')
        .eq('user_id', userId)
        .gte('trend_date', since.toISOString().split('T')[0])
        .order('trend_date', { ascending: true });

      if (error) {
        console.error('Error fetching trends:', error);
        return [];
      }

      return (data || []).map(t => ({
        date: t.trend_date,
        minutesRead: t.minutes_read,
        chaptersRead: t.chapters_read,
        timeOfDay: t.time_of_day,
      }));
    } catch (error) {
      console.error('Error in getReadingTrends:', error);
      return [];
    }
  }

  /**
   * Get genre breakdown
   */
  async getGenreBreakdown(userId: string): Promise<GenreBreakdown[]> {
    try {
      const { data, error } = await this.supabase
        .from('genre_exploration')
        .select('*')
        .eq('user_id', userId)
        .order('stories_read', { ascending: false });

      if (error) {
        console.error('Error fetching genre breakdown:', error);
        return [];
      }

      return (data || []).map(g => ({
        genre: g.genre,
        storiesRead: g.stories_read,
        totalTimeMinutes: g.total_time_minutes,
        preferenceScore: g.preference_score,
      }));
    } catch (error) {
      console.error('Error in getGenreBreakdown:', error);
      return [];
    }
  }

  /**
   * Get reading challenges
   */
  async getReadingChallenges(userId: string, year?: number): Promise<ReadingChallenge[]> {
    try {
      const targetYear = year || new Date().getFullYear();

      const { data, error } = await this.supabase
        .from('reading_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('year', targetYear);

      if (error) {
        console.error('Error fetching challenges:', error);
        return [];
      }

      return (data || []).map(c => ({
        id: c.id,
        year: c.year,
        challengeType: c.challenge_type,
        targetValue: c.target_value,
        currentValue: c.current_value,
        completedAt: c.completed_at,
        progressPercentage: Math.min(100, (c.current_value / c.target_value) * 100),
      }));
    } catch (error) {
      console.error('Error in getReadingChallenges:', error);
      return [];
    }
  }

  /**
   * Set reading challenge
   */
  async setReadingChallenge(
    userId: string,
    challengeType: ReadingChallenge['challengeType'],
    targetValue: number,
    year?: number
  ): Promise<boolean> {
    try {
      const targetYear = year || new Date().getFullYear();

      await this.supabase.from('reading_challenges').upsert({
        user_id: userId,
        year: targetYear,
        challenge_type: challengeType,
        target_value: targetValue,
        current_value: 0,
      });

      return true;
    } catch (error) {
      console.error('Error setting challenge:', error);
      return false;
    }
  }

  /**
   * Update challenge progress
   */
  async updateChallengeProgress(
    userId: string,
    challengeType: ReadingChallenge['challengeType'],
    increment: number = 1
  ): Promise<void> {
    try {
      const year = new Date().getFullYear();

      const { data: challenge } = await this.supabase
        .from('reading_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('challenge_type', challengeType)
        .single();

      if (!challenge) return;

      const newValue = challenge.current_value + increment;
      const completed = newValue >= challenge.target_value && !challenge.completed_at;

      await this.supabase
        .from('reading_challenges')
        .update({
          current_value: newValue,
          completed_at: completed ? new Date().toISOString() : challenge.completed_at,
        })
        .eq('id', challenge.id);
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }

  /**
   * Generate yearly wrapped
   */
  async generateYearlyWrapped(userId: string, year?: number): Promise<YearlyWrapped | null> {
    try {
      const targetYear = year || new Date().getFullYear();

      // Check for cached wrapped
      const { data: existing } = await this.supabase
        .from('yearly_wrapped')
        .select('*')
        .eq('user_id', userId)
        .eq('year', targetYear)
        .single();

      if (existing) {
        return {
          year: existing.year,
          totalStories: existing.total_stories,
          totalChapters: existing.total_chapters,
          totalWords: existing.total_words,
          totalTimeHours: existing.total_time_hours,
          topGenres: existing.top_genres,
          topAuthors: existing.top_authors,
          topStories: existing.top_stories,
          longestStreak: existing.longest_streak,
          achievementsEarned: existing.achievements_earned,
          readingPersonality: existing.reading_personality,
        };
      }

      // Generate new wrapped
      const yearStart = new Date(targetYear, 0, 1);
      const yearEnd = new Date(targetYear, 11, 31);

      // Get reading history for the year
      const { data: history } = await this.supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', yearStart.toISOString())
        .lte('created_at', yearEnd.toISOString());

      if (!history || history.length === 0) {
        return null;
      }

      const completedStoryIds = history
        .filter(h => h.action_type === 'completed_story')
        .map(h => h.story_id);

      // Get story details
      const { data: stories } = await this.supabase
        .from('stories')
        .select('id, title, genre, author_id, user_profiles!stories_author_id_fkey(display_name)')
        .in('id', completedStoryIds);

      // Calculate top genres
      const genreCounts: Record<string, number> = {};
      for (const story of stories || []) {
        if (story.genre) {
          genreCounts[story.genre] = (genreCounts[story.genre] || 0) + 1;
        }
      }
      const topGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }));

      // Calculate top authors
      const authorCounts: Record<string, { name: string; count: number }> = {};
      for (const story of stories || []) {
        const authorName = (story.user_profiles as any)?.display_name || 'Unknown';
        if (!authorCounts[story.author_id]) {
          authorCounts[story.author_id] = { name: authorName, count: 0 };
        }
        authorCounts[story.author_id].count++;
      }
      const topAuthors = Object.entries(authorCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([authorId, data]) => ({ authorId, name: data.name, count: data.count }));

      // Top stories (most recently completed)
      const topStories = (stories || []).slice(0, 5).map(s => ({
        storyId: s.id,
        title: s.title,
        completedAt: history.find(h => h.story_id === s.id)?.created_at || '',
      }));

      // Determine reading personality
      const readingPersonality = this.determineReadingPersonality(topGenres, completedStoryIds.length);

      // Get achievements earned this year
      const { count: achievementsEarned } = await this.supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('earned_at', yearStart.toISOString())
        .lte('earned_at', yearEnd.toISOString());

      const wrapped: YearlyWrapped = {
        year: targetYear,
        totalStories: completedStoryIds.length,
        totalChapters: history.filter(h => h.action_type === 'completed_chapter').length,
        totalWords: 0, // Would need to aggregate
        totalTimeHours: 0,
        topGenres,
        topAuthors,
        topStories,
        longestStreak: 0, // Would need streak data
        achievementsEarned: achievementsEarned || 0,
        readingPersonality,
      };

      // Cache the wrapped
      await this.supabase.from('yearly_wrapped').insert({
        user_id: userId,
        year: targetYear,
        total_stories: wrapped.totalStories,
        total_chapters: wrapped.totalChapters,
        total_words: wrapped.totalWords,
        total_time_hours: wrapped.totalTimeHours,
        top_genres: wrapped.topGenres,
        top_authors: wrapped.topAuthors,
        top_stories: wrapped.topStories,
        longest_streak: wrapped.longestStreak,
        achievements_earned: wrapped.achievementsEarned,
        reading_personality: wrapped.readingPersonality,
      });

      return wrapped;
    } catch (error) {
      console.error('Error generating yearly wrapped:', error);
      return null;
    }
  }

  /**
   * Determine reading personality based on habits
   */
  private determineReadingPersonality(
    topGenres: Array<{ genre: string; count: number }>,
    totalBooks: number
  ): string {
    const personalities: Record<string, { genres: string[]; description: string }> = {
      'The Explorer': { genres: ['Adventure', 'Fantasy', 'Sci-Fi'], description: 'Loves discovering new worlds' },
      'The Romantic': { genres: ['Romance', 'Drama'], description: 'Seeks heartfelt stories' },
      'The Thrill-Seeker': { genres: ['Thriller', 'Horror', 'Mystery'], description: 'Craves suspense and excitement' },
      'The Intellectual': { genres: ['Literary Fiction', 'Non-Fiction'], description: 'Values depth and meaning' },
      'The Comedian': { genres: ['Comedy', 'Satire'], description: 'Seeks laughter and joy' },
      'The Night Owl': { genres: ['Horror', 'Mystery'], description: 'Prefers dark and mysterious tales' },
      'The Dreamer': { genres: ['Fantasy', 'Romance'], description: 'Lives for magical stories' },
    };

    const topGenre = topGenres[0]?.genre;

    for (const [personality, data] of Object.entries(personalities)) {
      if (topGenre && data.genres.includes(topGenre)) {
        return personality;
      }
    }

    if (totalBooks > 50) {
      return 'The Bookworm';
    }

    return 'The Curious Reader';
  }

  /**
   * Record reading session
   */
  async recordReadingSession(
    userId: string,
    storyId: string,
    durationMinutes: number,
    chaptersRead: number
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const hour = new Date().getHours();
      
      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      if (hour >= 5 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      // Upsert daily trend
      const { data: existing } = await this.supabase
        .from('reading_trends')
        .select('*')
        .eq('user_id', userId)
        .eq('trend_date', today)
        .single();

      if (existing) {
        await this.supabase
          .from('reading_trends')
          .update({
            minutes_read: existing.minutes_read + durationMinutes,
            chapters_read: existing.chapters_read + chaptersRead,
          })
          .eq('id', existing.id);
      } else {
        await this.supabase.from('reading_trends').insert({
          user_id: userId,
          trend_date: today,
          minutes_read: durationMinutes,
          chapters_read: chaptersRead,
          time_of_day: timeOfDay,
        });
      }

      // Update genre exploration
      const { data: story } = await this.supabase
        .from('stories')
        .select('genre')
        .eq('id', storyId)
        .single();

      if (story?.genre) {
        const { data: genreData } = await this.supabase
          .from('genre_exploration')
          .select('*')
          .eq('user_id', userId)
          .eq('genre', story.genre)
          .single();

        if (genreData) {
          await this.supabase
            .from('genre_exploration')
            .update({
              total_time_minutes: genreData.total_time_minutes + durationMinutes,
              last_read_at: new Date().toISOString(),
            })
            .eq('id', genreData.id);
        } else {
          await this.supabase.from('genre_exploration').insert({
            user_id: userId,
            genre: story.genre,
            stories_read: 0,
            total_time_minutes: durationMinutes,
            first_read_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error recording reading session:', error);
    }
  }

  private getPeriodStart(period: string): Date | undefined {
    const now = new Date();
    switch (period) {
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return weekStart;
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return undefined;
    }
  }

  private getEmptyStats(): ReadingStats {
    return {
      totalStoriesRead: 0,
      totalChaptersRead: 0,
      totalWordsRead: 0,
      totalTimeMinutes: 0,
      totalChoicesMade: 0,
      storiesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      favoriteGenre: null,
      avgSessionMinutes: 0,
      readingDays: 0,
    };
  }
}

export const readingAnalyticsService = new ReadingAnalyticsService();
