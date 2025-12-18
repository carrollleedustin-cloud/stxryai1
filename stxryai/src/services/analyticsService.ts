/**
 * Reading Analytics Service
 * Provides insights into reading habits, patterns, and statistics.
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface ReadingSession {
  id: string;
  user_id: string;
  story_id: string;
  chapter_id?: string;
  started_at: string;
  ended_at?: string;
  duration_minutes: number;
  pages_read: number;
  choices_made: number;
}

export interface ReadingStreak {
  current_streak: number;
  longest_streak: number;
  last_read_date: string;
  streak_start_date?: string;
}

export interface ReadingGoal {
  id: string;
  user_id: string;
  goal_type: 'daily_minutes' | 'weekly_stories' | 'monthly_chapters' | 'yearly_books';
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  is_completed: boolean;
  created_at: string;
}

export interface GenreDistribution {
  genre: string;
  count: number;
  percentage: number;
  total_time_minutes: number;
}

export interface ReadingInsight {
  type: 'achievement' | 'suggestion' | 'milestone' | 'trend';
  title: string;
  description: string;
  icon?: string;
  action_url?: string;
}

export interface WeeklyStats {
  day: string;
  minutes_read: number;
  stories_started: number;
  chapters_completed: number;
}

export interface MonthlyOverview {
  total_reading_time: number;
  stories_completed: number;
  chapters_read: number;
  choices_made: number;
  favorite_genre: string;
  reading_velocity: number; // pages per hour
  consistency_score: number; // 0-100
}

export const analyticsService = {
  /**
   * Track a reading session start
   */
  async startReadingSession(
    userId: string,
    storyId: string,
    chapterId?: string
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('reading_sessions')
      .insert({
        user_id: userId,
        story_id: storyId,
        chapter_id: chapterId,
        started_at: new Date().toISOString(),
        duration_minutes: 0,
        pages_read: 0,
        choices_made: 0,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error starting reading session:', error);
      return null;
    }

    return data.id;
  },

  /**
   * Update and end a reading session
   */
  async endReadingSession(
    sessionId: string,
    pagesRead: number,
    choicesMade: number
  ): Promise<void> {
    const { data: session } = await supabase
      .from('reading_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    if (!session) return;

    const startedAt = new Date(session.started_at);
    const durationMinutes = Math.round(
      (Date.now() - startedAt.getTime()) / (1000 * 60)
    );

    await supabase
      .from('reading_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
        pages_read: pagesRead,
        choices_made: choicesMade,
      })
      .eq('id', sessionId);
  },

  /**
   * Get user's reading streak information
   */
  async getReadingStreak(userId: string): Promise<ReadingStreak> {
    const { data: streakData } = await supabase
      .from('user_reading_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (streakData) {
      return {
        current_streak: streakData.current_streak || 0,
        longest_streak: streakData.longest_streak || 0,
        last_read_date: streakData.last_read_date,
        streak_start_date: streakData.streak_start_date,
      };
    }

    // Calculate from reading sessions if no streak record exists
    const { data: sessions } = await supabase
      .from('reading_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(365);

    if (!sessions || sessions.length === 0) {
      return {
        current_streak: 0,
        longest_streak: 0,
        last_read_date: new Date().toISOString(),
      };
    }

    // Calculate streak from sessions
    const readDates = new Set(
      sessions.map((s) => new Date(s.started_at).toDateString())
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toDateString();

      if (readDates.has(dateStr)) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (i === 0) currentStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_read_date: sessions[0].started_at,
    };
  },

  /**
   * Update reading streak (call after each reading session)
   */
  async updateReadingStreak(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('user_reading_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!existing) {
      await supabase.from('user_reading_streaks').insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_read_date: today,
        streak_start_date: today,
      });
      return;
    }

    const lastRead = new Date(existing.last_read_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = existing.current_streak;
    let streakStart = existing.streak_start_date;

    if (diffDays === 0) {
      // Same day, no change
      return;
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
      streakStart = today;
    }

    await supabase
      .from('user_reading_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, existing.longest_streak),
        last_read_date: today,
        streak_start_date: streakStart,
      })
      .eq('user_id', userId);
  },

  /**
   * Get genre distribution for a user
   */
  async getGenreDistribution(userId: string): Promise<GenreDistribution[]> {
    const { data: progress } = await supabase
      .from('user_progress')
      .select(
        `
        story_id,
        stories:story_id (genre)
      `
      )
      .eq('user_id', userId);

    if (!progress) return [];

    const genreCounts: Record<string, number> = {};
    progress.forEach((p) => {
      const genre = (p.stories as { genre?: string })?.genre || 'Unknown';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    const total = Object.values(genreCounts).reduce((a, b) => a + b, 0);

    return Object.entries(genreCounts)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / total) * 100),
        total_time_minutes: 0, // Would need to join with sessions
      }))
      .sort((a, b) => b.count - a.count);
  },

  /**
   * Get weekly reading stats
   */
  async getWeeklyStats(userId: string): Promise<WeeklyStats[]> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: sessions } = await supabase
      .from('reading_sessions')
      .select('started_at, duration_minutes')
      .eq('user_id', userId)
      .gte('started_at', weekAgo.toISOString());

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const statsMap: Record<string, WeeklyStats> = {};

    // Initialize all days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      statsMap[dayName] = {
        day: dayName,
        minutes_read: 0,
        stories_started: 0,
        chapters_completed: 0,
      };
    }

    // Aggregate session data
    sessions?.forEach((session) => {
      const dayName = days[new Date(session.started_at).getDay()];
      if (statsMap[dayName]) {
        statsMap[dayName].minutes_read += session.duration_minutes || 0;
        statsMap[dayName].stories_started += 1;
      }
    });

    return Object.values(statsMap).reverse();
  },

  /**
   * Get monthly overview statistics
   */
  async getMonthlyOverview(userId: string): Promise<MonthlyOverview> {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const { data: sessions } = await supabase
      .from('reading_sessions')
      .select('started_at, duration_minutes, pages_read, choices_made')
      .eq('user_id', userId)
      .gte('started_at', monthAgo.toISOString());

    const { data: completedStories } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('progress_percentage', 100)
      .gte('last_read_at', monthAgo.toISOString());

    const totalMinutes =
      sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
    const totalPages =
      sessions?.reduce((sum, s) => sum + (s.pages_read || 0), 0) || 0;
    const totalChoices =
      sessions?.reduce((sum, s) => sum + (s.choices_made || 0), 0) || 0;

    // Calculate reading velocity (pages per hour)
    const readingVelocity =
      totalMinutes > 0 ? Math.round((totalPages / totalMinutes) * 60) : 0;

    // Calculate consistency score based on days with reading
    const readingDays = new Set(
      sessions?.map((s) => new Date(s.started_at).toDateString()) || []
    );
    const consistencyScore = Math.round((readingDays.size / 30) * 100);

    // Get favorite genre
    const genreDistribution = await this.getGenreDistribution(userId);
    const favoriteGenre = genreDistribution[0]?.genre || 'None yet';

    return {
      total_reading_time: totalMinutes,
      stories_completed: completedStories?.length || 0,
      chapters_read: sessions?.length || 0,
      choices_made: totalChoices,
      favorite_genre: favoriteGenre,
      reading_velocity: readingVelocity,
      consistency_score: consistencyScore,
    };
  },

  /**
   * Generate personalized reading insights
   */
  async getReadingInsights(userId: string): Promise<ReadingInsight[]> {
    const insights: ReadingInsight[] = [];

    const [streak, monthly, genres] = await Promise.all([
      this.getReadingStreak(userId),
      this.getMonthlyOverview(userId),
      this.getGenreDistribution(userId),
    ]);

    // Streak achievements
    if (streak.current_streak >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Week Warrior!',
        description: `You've been reading for ${streak.current_streak} days straight!`,
        icon: '🔥',
      });
    }

    if (streak.current_streak === streak.longest_streak && streak.current_streak > 1) {
      insights.push({
        type: 'milestone',
        title: 'New Personal Record!',
        description: `This is your longest reading streak ever!`,
        icon: '🏆',
      });
    }

    // Reading time insights
    if (monthly.total_reading_time > 600) {
      insights.push({
        type: 'achievement',
        title: 'Bookworm Badge',
        description: `You've read for over 10 hours this month!`,
        icon: '📚',
      });
    }

    // Genre suggestions
    if (genres.length > 0 && genres[0].percentage > 50) {
      const otherGenres = genres.slice(1, 3).map((g) => g.genre);
      if (otherGenres.length > 0) {
        insights.push({
          type: 'suggestion',
          title: 'Try Something New',
          description: `You love ${genres[0].genre}! Maybe try ${otherGenres.join(' or ')}?`,
          icon: '💡',
          action_url: `/story-library?genre=${otherGenres[0]}`,
        });
      }
    }

    // Consistency feedback
    if (monthly.consistency_score < 30) {
      insights.push({
        type: 'suggestion',
        title: 'Build a Habit',
        description: 'Try reading for just 10 minutes daily to build consistency.',
        icon: '🎯',
      });
    } else if (monthly.consistency_score >= 80) {
      insights.push({
        type: 'achievement',
        title: 'Consistent Reader',
        description: 'Amazing dedication! You read most days this month.',
        icon: '⭐',
      });
    }

    return insights;
  },

  /**
   * Get reading goals for a user
   */
  async getReadingGoals(userId: string): Promise<ReadingGoal[]> {
    const { data, error } = await supabase
      .from('reading_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reading goals:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Create a new reading goal
   */
  async createReadingGoal(
    userId: string,
    goalType: ReadingGoal['goal_type'],
    targetValue: number
  ): Promise<ReadingGoal | null> {
    const now = new Date();
    let periodEnd: Date;

    switch (goalType) {
      case 'daily_minutes':
        periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;
      case 'weekly_stories':
        periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case 'monthly_chapters':
        periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
      case 'yearly_books':
        periodEnd = new Date(now);
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        break;
    }

    const { data, error } = await supabase
      .from('reading_goals')
      .insert({
        user_id: userId,
        goal_type: goalType,
        target_value: targetValue,
        current_value: 0,
        period_start: now.toISOString(),
        period_end: periodEnd.toISOString(),
        is_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reading goal:', error);
      return null;
    }

    return data;
  },

  /**
   * Update goal progress
   */
  async updateGoalProgress(
    goalId: string,
    incrementBy: number
  ): Promise<void> {
    const { data: goal } = await supabase
      .from('reading_goals')
      .select('current_value, target_value')
      .eq('id', goalId)
      .single();

    if (!goal) return;

    const newValue = goal.current_value + incrementBy;
    const isCompleted = newValue >= goal.target_value;

    await supabase
      .from('reading_goals')
      .update({
        current_value: newValue,
        is_completed: isCompleted,
      })
      .eq('id', goalId);
  },
};

export default analyticsService;
