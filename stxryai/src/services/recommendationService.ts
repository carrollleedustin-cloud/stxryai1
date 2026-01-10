/**
 * Story Recommendation Service
 * Provides personalized story recommendations based on reading history and preferences.
 */

import { supabase } from '@/lib/supabase/client';
import { Story } from '@/types/database';

// Types
export interface RecommendationReason {
  type: 'genre' | 'author' | 'similar' | 'trending' | 'friends' | 'completion' | 'new';
  text: string;
}

export interface RecommendedStory extends Story {
  recommendation_score: number;
  reasons: RecommendationReason[];
}

export interface UserPreferences {
  favorite_genres: string[];
  favorite_authors: string[];
  preferred_length: 'short' | 'medium' | 'long' | 'any';
  preferred_difficulty: 'easy' | 'medium' | 'hard' | 'any';
  avoid_genres: string[];
}

export interface SocialShareData {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'copy' | 'email';
  story_id: string;
  story_title: string;
  story_url: string;
  custom_message?: string;
}

export const recommendationService = {
  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendedStory[]> {
    // Get user's reading history
    const { data: readHistory } = await supabase
      .from('user_progress')
      .select('story_id, stories:story_id(genre, user_id)')
      .eq('user_id', userId);

    const readStoryIds = readHistory?.map((r) => r.story_id) || [];
    const genreCounts: Record<string, number> = {};
    const authorIds: string[] = [];

    readHistory?.forEach((r) => {
      const story = r.stories as { genre?: string; user_id?: string } | null;
      if (story?.genre) {
        genreCounts[story.genre] = (genreCounts[story.genre] || 0) + 1;
      }
      if (story?.user_id) {
        authorIds.push(story.user_id);
      }
    });

    // Get top genres
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    // Build recommendations from multiple sources
    const recommendations: RecommendedStory[] = [];

    // 1. Genre-based recommendations
    if (topGenres.length > 0) {
      const { data: genreStories } = await supabase
        .from('stories')
        .select('*')
        .eq('is_published', true)
        .in('genre', topGenres)
        .not('id', 'in', `(${readStoryIds.join(',')})`)
        .order('rating', { ascending: false })
        .limit(5);

      genreStories?.forEach((story) => {
        recommendations.push({
          ...story,
          recommendation_score: 0.8,
          reasons: [
            {
              type: 'genre',
              text: `Because you enjoy ${story.genre} stories`,
            },
          ],
        });
      });
    }

    // 2. Author-based recommendations
    const uniqueAuthors = [...new Set(authorIds)];
    if (uniqueAuthors.length > 0) {
      const { data: authorStories } = await supabase
        .from('stories')
        .select('*, author:user_id(display_name)')
        .eq('is_published', true)
        .in('user_id', uniqueAuthors.slice(0, 3))
        .not('id', 'in', `(${readStoryIds.join(',')})`)
        .limit(3);

      authorStories?.forEach((story) => {
        const authorName = (story.author as { display_name?: string })?.display_name;
        recommendations.push({
          ...story,
          recommendation_score: 0.75,
          reasons: [
            {
              type: 'author',
              text: `More from ${authorName || 'an author you like'}`,
            },
          ],
        });
      });
    }

    // 3. Trending stories
    const { data: trendingStories } = await supabase
      .from('stories')
      .select('*')
      .eq('is_published', true)
      .not('id', 'in', `(${readStoryIds.join(',')})`)
      .order('view_count', { ascending: false })
      .limit(5);

    trendingStories?.forEach((story) => {
      const existing = recommendations.find((r) => r.id === story.id);
      if (existing) {
        existing.reasons.push({
          type: 'trending',
          text: 'Trending in the community',
        });
        existing.recommendation_score += 0.1;
      } else {
        recommendations.push({
          ...story,
          recommendation_score: 0.6,
          reasons: [
            {
              type: 'trending',
              text: 'Trending in the community',
            },
          ],
        });
      }
    });

    // 4. New releases
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: newStories } = await supabase
      .from('stories')
      .select('*')
      .eq('is_published', true)
      .gte('published_at', weekAgo.toISOString())
      .not('id', 'in', `(${readStoryIds.join(',')})`)
      .order('published_at', { ascending: false })
      .limit(3);

    newStories?.forEach((story) => {
      const existing = recommendations.find((r) => r.id === story.id);
      if (existing) {
        existing.reasons.push({
          type: 'new',
          text: 'Just published',
        });
        existing.recommendation_score += 0.15;
      } else {
        recommendations.push({
          ...story,
          recommendation_score: 0.5,
          reasons: [
            {
              type: 'new',
              text: 'Just published',
            },
          ],
        });
      }
    });

    // Sort by score and deduplicate
    const uniqueRecs = recommendations.reduce((acc, rec) => {
      const existing = acc.find((r) => r.id === rec.id);
      if (!existing) {
        acc.push(rec);
      }
      return acc;
    }, [] as RecommendedStory[]);

    return uniqueRecs
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit);
  },

  /**
   * Get "Because you read X" recommendations
   */
  async getSimilarStories(storyId: string, limit: number = 5): Promise<RecommendedStory[]> {
    // Get the source story
    const { data: sourceStory } = await supabase
      .from('stories')
      .select('genre, tags, user_id')
      .eq('id', storyId)
      .single();

    if (!sourceStory) return [];

    // Find similar stories by genre
    const { data: similarStories } = await supabase
      .from('stories')
      .select('*')
      .eq('is_published', true)
      .eq('genre', sourceStory.genre)
      .neq('id', storyId)
      .order('rating', { ascending: false })
      .limit(limit);

    return (
      similarStories?.map((story) => ({
        ...story,
        recommendation_score: 0.7,
        reasons: [
          {
            type: 'similar' as const,
            text: `Similar to stories you've enjoyed`,
          },
        ],
      })) || []
    );
  },

  /**
   * Get friend activity recommendations
   */
  async getFriendsReading(userId: string, limit: number = 5): Promise<RecommendedStory[]> {
    // Get user's friends/following
    const { data: following } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (!following || following.length === 0) return [];

    const friendIds = following.map((f) => f.following_id);

    // Get what friends are reading
    const { data: friendProgress } = await supabase
      .from('user_progress')
      .select(
        `
        story_id,
        user_id,
        stories:story_id (*),
        users:user_id (display_name)
      `
      )
      .in('user_id', friendIds)
      .order('last_read_at', { ascending: false })
      .limit(limit * 2);

    // Deduplicate and format
    const storyMap = new Map<string, RecommendedStory>();

    friendProgress?.forEach((fp) => {
      if (!storyMap.has(fp.story_id)) {
        const storyData = fp.stories;
        const story = (Array.isArray(storyData) ? storyData[0] : storyData) as Story;
        if (!story) return;
        const friendData = fp.users;
        const friendUser = Array.isArray(friendData) ? friendData[0] : friendData;
        const friendName = (friendUser as { display_name?: string })?.display_name;
        storyMap.set(fp.story_id, {
          ...story,
          recommendation_score: 0.65,
          reasons: [
            {
              type: 'friends',
              text: `${friendName || 'A friend'} is reading this`,
            },
          ],
        });
      }
    });

    return Array.from(storyMap.values()).slice(0, limit);
  },

  /**
   * Get completion-based recommendations
   * "You're almost done with genre X, try these next"
   */
  async getCompletionRecommendations(userId: string): Promise<RecommendedStory[]> {
    // Get recently completed stories
    const { data: completed } = await supabase
      .from('user_progress')
      .select('story_id, stories:story_id(genre)')
      .eq('user_id', userId)
      .eq('progress_percentage', 100)
      .order('last_read_at', { ascending: false })
      .limit(3);

    if (!completed || completed.length === 0) return [];

    const recentGenres = completed
      .map((c) => (c.stories as { genre?: string })?.genre)
      .filter(Boolean) as string[];

    if (recentGenres.length === 0) return [];

    // Get highly rated stories in those genres
    const { data: nextStories } = await supabase
      .from('stories')
      .select('*')
      .eq('is_published', true)
      .in('genre', recentGenres)
      .gte('rating', 4)
      .order('rating', { ascending: false })
      .limit(5);

    return (
      nextStories?.map((story) => ({
        ...story,
        recommendation_score: 0.7,
        reasons: [
          {
            type: 'completion' as const,
            text: `Great next read after finishing a ${story.genre} story`,
          },
        ],
      })) || []
    );
  },

  /**
   * Generate social share content
   */
  generateShareContent(data: SocialShareData): {
    url: string;
    text: string;
  } {
    const baseMessage = data.custom_message || `Check out "${data.story_title}" on StxryAI!`;
    const shareUrl = encodeURIComponent(data.story_url);
    const shareText = encodeURIComponent(baseMessage);

    switch (data.platform) {
      case 'twitter':
        return {
          url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
          text: baseMessage,
        };

      case 'facebook':
        return {
          url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
          text: baseMessage,
        };

      case 'linkedin':
        return {
          url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
          text: baseMessage,
        };

      case 'email':
        const subject = encodeURIComponent(`Check out this story: ${data.story_title}`);
        const body = encodeURIComponent(`${baseMessage}\n\nRead it here: ${data.story_url}`);
        return {
          url: `mailto:?subject=${subject}&body=${body}`,
          text: baseMessage,
        };

      case 'copy':
      default:
        return {
          url: data.story_url,
          text: `${baseMessage} ${data.story_url}`,
        };
    }
  },

  /**
   * Track a share event for analytics
   */
  async trackShare(
    userId: string,
    storyId: string,
    platform: SocialShareData['platform']
  ): Promise<void> {
    await supabase.from('story_shares').insert({
      user_id: userId,
      story_id: storyId,
      platform,
      shared_at: new Date().toISOString(),
    });

    // Increment story share count
    await supabase.rpc('increment_story_shares', { story_id: storyId });
  },

  /**
   * Get user's sharing history
   */
  async getUserShares(
    userId: string,
    limit: number = 10
  ): Promise<{ story_id: string; platform: string; shared_at: string }[]> {
    const { data } = await supabase
      .from('story_shares')
      .select('story_id, platform, shared_at')
      .eq('user_id', userId)
      .order('shared_at', { ascending: false })
      .limit(limit);

    return data || [];
  },

  /**
   * Save user preferences for better recommendations
   */
  async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<boolean> {
    const { error } = await supabase.from('user_preferences').upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error saving preferences:', error);
      return false;
    }

    return true;
  },

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) return null;

    return {
      favorite_genres: data.favorite_genres || [],
      favorite_authors: data.favorite_authors || [],
      preferred_length: data.preferred_length || 'any',
      preferred_difficulty: data.preferred_difficulty || 'any',
      avoid_genres: data.avoid_genres || [],
    };
  },
};

export default recommendationService;
