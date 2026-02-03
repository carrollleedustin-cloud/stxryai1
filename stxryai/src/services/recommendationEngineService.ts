/**
 * Recommendation Engine Service
 * AI-powered story recommendations based on user behavior and preferences
 */

import { createClient } from '@/lib/supabase/client';

export interface Recommendation {
  id: string;
  storyId: string;
  storyTitle: string;
  storyDescription: string;
  coverImageUrl: string;
  authorName: string;
  genre: string;
  recommendationType: 'because_you_read' | 'similar_readers' | 'trending' | 'new_release' | 'personalized' | 'staff_pick' | 'daily_pick';
  score: number;
  reason: string;
  sourceStoryTitle?: string;
}

export interface DailyPicks {
  date: string;
  stories: Recommendation[];
}

export interface UserPreferences {
  preferredGenres: string[];
  preferredThemes: string[];
  preferredLength: 'short' | 'medium' | 'long' | 'any';
  preferredMood: string[];
  dislikedGenres: string[];
  readingSpeed: 'slow' | 'medium' | 'fast';
}

class RecommendationEngineService {
  private supabase = createClient();

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId: string, limit: number = 20): Promise<Recommendation[]> {
    try {
      // Get multiple recommendation types
      const [
        becauseYouRead,
        trending,
        personalized,
        newReleases,
      ] = await Promise.all([
        this.getBecauseYouReadRecommendations(userId, Math.ceil(limit / 4)),
        this.getTrendingRecommendations(Math.ceil(limit / 4)),
        this.getPersonalizedRecommendations(userId, Math.ceil(limit / 4)),
        this.getNewReleaseRecommendations(Math.ceil(limit / 4)),
      ]);

      // Combine and deduplicate
      const allRecs = [...becauseYouRead, ...trending, ...personalized, ...newReleases];
      const seen = new Set<string>();
      const unique: Recommendation[] = [];

      for (const rec of allRecs) {
        if (!seen.has(rec.storyId)) {
          seen.add(rec.storyId);
          unique.push(rec);
        }
      }

      // Sort by score and return limited
      return unique.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Get "Because you read X" recommendations
   */
  async getBecauseYouReadRecommendations(userId: string, limit: number = 5): Promise<Recommendation[]> {
    try {
      // Get user's recently completed stories
      const { data: recentlyRead } = await this.supabase
        .from('reading_history')
        .select('story_id')
        .eq('user_id', userId)
        .eq('action_type', 'completed_story')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!recentlyRead || recentlyRead.length === 0) {
        return [];
      }

      const storyIds = recentlyRead.map((r) => r.story_id);

      // Get similar stories
      const { data: similarities } = await this.supabase
        .from('story_similarities')
        .select(`
          story_id_b,
          similarity_score,
          similarity_reasons,
          source:story_id_a (title)
        `)
        .in('story_id_a', storyIds)
        .order('similarity_score', { ascending: false })
        .limit(limit * 2);

      if (!similarities || similarities.length === 0) {
        return [];
      }

      // Get full story details
      const similarStoryIds = similarities.map((s) => s.story_id_b);
      const { data: stories } = await this.supabase
        .from('stories')
        .select('id, title, description, cover_image_url, genre, user_profiles!stories_author_id_fkey(display_name)')
        .in('id', similarStoryIds)
        .eq('is_published', true)
        .limit(limit);

      if (!stories) return [];

      return stories.map((story) => {
        const similarity = similarities.find((s) => s.story_id_b === story.id);
        return {
          id: `rec_${story.id}`,
          storyId: story.id,
          storyTitle: story.title,
          storyDescription: story.description || '',
          coverImageUrl: story.cover_image_url || '',
          authorName: (story.user_profiles as any)?.display_name || 'Unknown',
          genre: story.genre || '',
          recommendationType: 'because_you_read' as const,
          score: similarity?.similarity_score || 0.5,
          reason: `Because you enjoyed "${(similarity?.source as any)?.title || 'similar stories'}"`,
          sourceStoryTitle: (similarity?.source as any)?.title,
        };
      });
    } catch (error) {
      console.error('Error getting because_you_read recommendations:', error);
      return [];
    }
  }

  /**
   * Get trending stories
   */
  async getTrendingRecommendations(limit: number = 5): Promise<Recommendation[]> {
    try {
      const { data: trending } = await this.supabase
        .from('trending_stories')
        .select(`
          story_id,
          score,
          reads_count,
          stories!trending_stories_story_id_fkey (
            id, title, description, cover_image_url, genre,
            user_profiles!stories_author_id_fkey(display_name)
          )
        `)
        .eq('period', 'weekly')
        .order('rank', { ascending: true })
        .limit(limit);

      if (!trending) return [];

      return trending.map((t) => {
        const story = t.stories as any;
        return {
          id: `rec_trending_${story.id}`,
          storyId: story.id,
          storyTitle: story.title,
          storyDescription: story.description || '',
          coverImageUrl: story.cover_image_url || '',
          authorName: story.user_profiles?.display_name || 'Unknown',
          genre: story.genre || '',
          recommendationType: 'trending' as const,
          score: t.score / 100, // Normalize
          reason: `Trending this week with ${t.reads_count} reads`,
        };
      });
    } catch (error) {
      console.error('Error getting trending recommendations:', error);
      return [];
    }
  }

  /**
   * Get personalized recommendations based on preferences
   */
  async getPersonalizedRecommendations(userId: string, limit: number = 5): Promise<Recommendation[]> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);

      if (!preferences || preferences.preferredGenres.length === 0) {
        return [];
      }

      // Query stories matching preferences
      let query = this.supabase
        .from('stories')
        .select('id, title, description, cover_image_url, genre, user_profiles!stories_author_id_fkey(display_name)')
        .eq('is_published', true)
        .in('genre', preferences.preferredGenres)
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      // Exclude disliked genres
      if (preferences.dislikedGenres.length > 0) {
        query = query.not('genre', 'in', `(${preferences.dislikedGenres.join(',')})`);
      }

      const { data: stories } = await query;

      if (!stories) return [];

      // Exclude already read stories
      const { data: readStories } = await this.supabase
        .from('reading_history')
        .select('story_id')
        .eq('user_id', userId);

      const readStoryIds = new Set(readStories?.map((r) => r.story_id) || []);
      const unreadStories = stories.filter((s) => !readStoryIds.has(s.id));

      return unreadStories.slice(0, limit).map((story) => ({
        id: `rec_personal_${story.id}`,
        storyId: story.id,
        storyTitle: story.title,
        storyDescription: story.description || '',
        coverImageUrl: story.cover_image_url || '',
        authorName: (story.user_profiles as any)?.display_name || 'Unknown',
        genre: story.genre || '',
        recommendationType: 'personalized' as const,
        score: 0.7,
        reason: `Matches your ${story.genre} preference`,
      }));
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  /**
   * Get new release recommendations
   */
  async getNewReleaseRecommendations(limit: number = 5): Promise<Recommendation[]> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: stories } = await this.supabase
        .from('stories')
        .select('id, title, description, cover_image_url, genre, created_at, user_profiles!stories_author_id_fkey(display_name)')
        .eq('is_published', true)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!stories) return [];

      return stories.map((story) => ({
        id: `rec_new_${story.id}`,
        storyId: story.id,
        storyTitle: story.title,
        storyDescription: story.description || '',
        coverImageUrl: story.cover_image_url || '',
        authorName: (story.user_profiles as any)?.display_name || 'Unknown',
        genre: story.genre || '',
        recommendationType: 'new_release' as const,
        score: 0.6,
        reason: 'Just released this week',
      }));
    } catch (error) {
      console.error('Error getting new release recommendations:', error);
      return [];
    }
  }

  /**
   * Get daily picks for user
   */
  async getDailyPicks(userId: string): Promise<DailyPicks> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if we already have picks for today
      const { data: existingPicks } = await this.supabase
        .from('daily_picks')
        .select('*')
        .eq('user_id', userId)
        .eq('pick_date', today)
        .single();

      if (existingPicks) {
        // Fetch full story details
        const { data: stories } = await this.supabase
          .from('stories')
          .select('id, title, description, cover_image_url, genre, user_profiles!stories_author_id_fkey(display_name)')
          .in('id', existingPicks.story_ids);

        return {
          date: today,
          stories: (stories || []).map((story) => ({
            id: `daily_${story.id}`,
            storyId: story.id,
            storyTitle: story.title,
            storyDescription: story.description || '',
            coverImageUrl: story.cover_image_url || '',
            authorName: (story.user_profiles as any)?.display_name || 'Unknown',
            genre: story.genre || '',
            recommendationType: 'daily_pick' as const,
            score: 1.0,
            reason: 'Your daily pick',
          })),
        };
      }

      // Generate new daily picks
      const recommendations = await this.getRecommendations(userId, 10);
      const dailyPicks = recommendations.slice(0, 3);
      const storyIds = dailyPicks.map((r) => r.storyId);

      // Save daily picks
      await this.supabase.from('daily_picks').insert({
        user_id: userId,
        pick_date: today,
        story_ids: storyIds,
      });

      return {
        date: today,
        stories: dailyPicks.map((r) => ({
          ...r,
          recommendationType: 'daily_pick' as const,
          reason: 'Your daily pick',
        })),
      };
    } catch (error) {
      console.error('Error getting daily picks:', error);
      return { date: new Date().toISOString().split('T')[0], stories: [] };
    }
  }

  /**
   * Get user reading preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data } = await this.supabase
        .from('user_reading_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!data) {
        // Learn preferences from reading history
        return await this.learnPreferences(userId);
      }

      return {
        preferredGenres: data.preferred_genres || [],
        preferredThemes: data.preferred_themes || [],
        preferredLength: data.preferred_length || 'any',
        preferredMood: data.preferred_mood || [],
        dislikedGenres: data.disliked_genres || [],
        readingSpeed: data.reading_speed || 'medium',
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Learn preferences from reading history
   */
  private async learnPreferences(userId: string): Promise<UserPreferences> {
    try {
      // Get user's reading history
      const { data: history } = await this.supabase
        .from('reading_history')
        .select('story_id')
        .eq('user_id', userId)
        .eq('action_type', 'completed_story')
        .limit(50);

      if (!history || history.length === 0) {
        return {
          preferredGenres: [],
          preferredThemes: [],
          preferredLength: 'any',
          preferredMood: [],
          dislikedGenres: [],
          readingSpeed: 'medium',
        };
      }

      // Get genres of completed stories
      const storyIds = history.map((h) => h.story_id);
      const { data: stories } = await this.supabase
        .from('stories')
        .select('genre')
        .in('id', storyIds);

      // Count genre frequency
      const genreCounts: Record<string, number> = {};
      for (const story of stories || []) {
        if (story.genre) {
          genreCounts[story.genre] = (genreCounts[story.genre] || 0) + 1;
        }
      }

      // Sort by frequency
      const sortedGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([genre]) => genre);

      const preferences: UserPreferences = {
        preferredGenres: sortedGenres.slice(0, 5),
        preferredThemes: [],
        preferredLength: 'any',
        preferredMood: [],
        dislikedGenres: [],
        readingSpeed: 'medium',
      };

      // Save learned preferences
      await this.updatePreferences(userId, preferences);

      return preferences;
    } catch (error) {
      console.error('Error learning preferences:', error);
      return {
        preferredGenres: [],
        preferredThemes: [],
        preferredLength: 'any',
        preferredMood: [],
        dislikedGenres: [],
        readingSpeed: 'medium',
      };
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      await this.supabase.from('user_reading_preferences').upsert({
        user_id: userId,
        preferred_genres: preferences.preferredGenres,
        preferred_themes: preferences.preferredThemes,
        preferred_length: preferences.preferredLength,
        preferred_mood: preferences.preferredMood,
        disliked_genres: preferences.dislikedGenres,
        reading_speed: preferences.readingSpeed,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  /**
   * Record recommendation click
   */
  async recordRecommendationClick(recommendationId: string, userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_recommendations')
        .update({ clicked_at: new Date().toISOString() })
        .eq('id', recommendationId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error recording recommendation click:', error);
    }
  }

  /**
   * Dismiss a recommendation
   */
  async dismissRecommendation(recommendationId: string, userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_recommendations')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', recommendationId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  }

  /**
   * Get mood-based recommendations
   */
  async getMoodBasedRecommendations(userId: string, mood: string, limit: number = 5): Promise<Recommendation[]> {
    try {
      const moodGenreMap: Record<string, string[]> = {
        happy: ['Comedy', 'Romance', 'Adventure'],
        sad: ['Drama', 'Romance', 'Literary Fiction'],
        excited: ['Thriller', 'Action', 'Adventure', 'Sci-Fi'],
        relaxed: ['Slice of Life', 'Romance', 'Cozy Mystery'],
        scared: ['Horror', 'Thriller', 'Mystery'],
        curious: ['Mystery', 'Sci-Fi', 'Fantasy', 'Non-Fiction'],
        romantic: ['Romance', 'Drama', 'Historical Fiction'],
        adventurous: ['Adventure', 'Fantasy', 'Action', 'Sci-Fi'],
      };

      const genres = moodGenreMap[mood.toLowerCase()] || [];

      if (genres.length === 0) {
        return this.getRecommendations(userId, limit);
      }

      const { data: stories } = await this.supabase
        .from('stories')
        .select('id, title, description, cover_image_url, genre, user_profiles!stories_author_id_fkey(display_name)')
        .eq('is_published', true)
        .in('genre', genres)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!stories) return [];

      // Save mood recommendation for feedback
      await this.supabase.from('mood_recommendations').insert({
        user_id: userId,
        user_stated_mood: mood,
        recommended_stories: stories.map((s) => s.id),
        reasoning: `Based on your ${mood} mood`,
      });

      return stories.map((story) => ({
        id: `mood_${story.id}`,
        storyId: story.id,
        storyTitle: story.title,
        storyDescription: story.description || '',
        coverImageUrl: story.cover_image_url || '',
        authorName: (story.user_profiles as any)?.display_name || 'Unknown',
        genre: story.genre || '',
        recommendationType: 'personalized' as const,
        score: 0.8,
        reason: `Perfect for when you're feeling ${mood}`,
      }));
    } catch (error) {
      console.error('Error getting mood-based recommendations:', error);
      return [];
    }
  }
}

export const recommendationEngineService = new RecommendationEngineService();
