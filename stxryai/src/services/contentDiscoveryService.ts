/**
 * Content Discovery Service
 * Provides ML-powered recommendations, trending stories, and personalized feeds
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export type Genre =
  | 'fantasy'
  | 'sci-fi'
  | 'mystery'
  | 'romance'
  | 'horror'
  | 'adventure'
  | 'thriller'
  | 'historical';

export interface StoryRecommendation {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  genre: Genre;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  stats: {
    rating: number;
    ratingCount: number;
    playCount: number;
    completionRate: number;
  };
  matchScore: number;
  matchReasons: string[];
  isPremium: boolean;
  estimatedDuration: number;
  createdAt: string;
}

export interface TrendingStory extends StoryRecommendation {
  trendingScore: number;
  trendingReason: 'viral' | 'rising' | 'hot' | 'staff_pick' | 'new';
  rank: number;
  previousRank?: number;
}

export interface ForYouFeedItem {
  type: 'story' | 'collection' | 'author' | 'genre' | 'challenge';
  priority: number;
  data:
    | StoryRecommendation
    | StoryCollection
    | AuthorRecommendation
    | GenreRecommendation
    | ChallengeCard;
  reason: string;
}

export interface StoryCollection {
  id: string;
  title: string;
  description: string;
  stories: StoryRecommendation[];
  coverImages: string[];
  storyCount: number;
  curator?: {
    id: string;
    username: string;
  };
}

export interface AuthorRecommendation {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  storyCount: number;
  followerCount: number;
  totalPlays: number;
  topGenres: Genre[];
  matchReason: string;
}

export interface GenreRecommendation {
  genre: Genre;
  description: string;
  icon: string;
  storyCount: number;
  newThisWeek: number;
  topStory: StoryRecommendation;
}

export interface ChallengeCard {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  expiresAt: string;
  progress?: number;
}

export interface UserPreferences {
  favoriteGenres: Genre[];
  dislikedGenres: Genre[];
  preferredLength: 'short' | 'medium' | 'long' | 'any';
  contentRating: 'all' | 'teen' | 'mature';
  readingHistory: string[]; // Story IDs
  likedStories: string[];
  completedStories: string[];
  followedAuthors: string[];
}

// ========================================
// SCORING WEIGHTS
// ========================================

const SCORING_WEIGHTS = {
  // Trending algorithm weights
  trending: {
    recentPlays: 0.35, // Plays in last 24h
    completionRate: 0.2, // How many finish the story
    rating: 0.15, // Average rating
    ratingVelocity: 0.15, // New ratings in last 24h
    socialShares: 0.15, // Social shares
  },
  // Recommendation weights
  recommendation: {
    genreMatch: 0.3, // Matches user's preferred genres
    authorFollow: 0.2, // From followed author
    similarToLiked: 0.25, // Similar to liked stories
    rating: 0.15, // Story quality
    freshness: 0.1, // Newer stories get a boost
  },
  // Similarity weights
  similarity: {
    genre: 0.35,
    tags: 0.25,
    author: 0.15,
    length: 0.1,
    readersAlsoLiked: 0.15,
  },
};

// ========================================
// SERVICE CLASS
// ========================================

class ContentDiscoveryService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  // ==================== TRENDING ====================

  /**
   * Get trending stories
   */
  async getTrending(
    limit: number = 20,
    timeframe: '24h' | '7d' | '30d' = '24h',
    genre?: Genre
  ): Promise<TrendingStory[]> {
    const supabase = this.getSupabase();

    // Calculate cutoff date
    const cutoff = new Date();
    switch (timeframe) {
      case '24h':
        cutoff.setHours(cutoff.getHours() - 24);
        break;
      case '7d':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(cutoff.getDate() - 30);
        break;
    }

    // Fetch stories with activity metrics
    let query = supabase
      .from('stories')
      .select(
        `
        *,
        users:author_id (id, username, avatar_url),
        story_plays!left (count),
        reviews!left (rating, created_at)
      `
      )
      .eq('is_published', true)
      .order('play_count', { ascending: false })
      .limit(limit * 2); // Fetch extra for scoring

    if (genre) {
      query = query.eq('genre', genre);
    }

    const { data: stories, error } = await query;

    if (error) {
      console.error('Error fetching trending:', error);
      return [];
    }

    // Calculate trending scores
    const scoredStories = (stories || []).map((story, index) => {
      const recentPlays = story.story_plays?.[0]?.count || 0;
      const recentRatings = (story.reviews || []).filter(
        (r: any) => new Date(r.created_at) > cutoff
      ).length;

      const trendingScore =
        recentPlays * SCORING_WEIGHTS.trending.recentPlays +
        (story.completion_rate || 0) * SCORING_WEIGHTS.trending.completionRate +
        ((story.rating || 0) / 5) * SCORING_WEIGHTS.trending.rating +
        Math.min(recentRatings / 10, 1) * SCORING_WEIGHTS.trending.ratingVelocity;

      const trendingReason = this.getTrendingReason(story, recentPlays, recentRatings);

      return {
        ...this.mapStoryToRecommendation(story),
        trendingScore,
        trendingReason,
        rank: 0,
        matchScore: trendingScore,
        matchReasons: [this.getTrendingReasonText(trendingReason)],
      };
    });

    // Sort by score and assign ranks
    scoredStories.sort((a, b) => b.trendingScore - a.trendingScore);
    scoredStories.forEach((story, index) => {
      story.rank = index + 1;
    });

    return scoredStories.slice(0, limit);
  }

  // ==================== RECOMMENDATIONS ====================

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId: string, limit: number = 20): Promise<StoryRecommendation[]> {
    const supabase = this.getSupabase();

    // Fetch user preferences
    const preferences = await this.getUserPreferences(userId);

    // Fetch candidate stories
    const { data: stories, error } = await supabase
      .from('stories')
      .select(
        `
        *,
        users:author_id (id, username, avatar_url)
      `
      )
      .eq('is_published', true)
      .not('id', 'in', `(${preferences.readingHistory.join(',') || 'null'})`)
      .order('rating', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }

    // Score stories based on user preferences
    const scoredStories = (stories || []).map((story) => {
      const scores = this.calculateRecommendationScores(story, preferences);
      const matchScore =
        scores.genreMatch * SCORING_WEIGHTS.recommendation.genreMatch +
        scores.authorFollow * SCORING_WEIGHTS.recommendation.authorFollow +
        scores.similarToLiked * SCORING_WEIGHTS.recommendation.similarToLiked +
        ((story.rating || 0) / 5) * SCORING_WEIGHTS.recommendation.rating +
        scores.freshness * SCORING_WEIGHTS.recommendation.freshness;

      return {
        ...this.mapStoryToRecommendation(story),
        matchScore,
        matchReasons: this.getMatchReasons(scores, story, preferences),
      };
    });

    // Sort by score and return top results
    scoredStories.sort((a, b) => b.matchScore - a.matchScore);
    return scoredStories.slice(0, limit);
  }

  /**
   * Get "For You" personalized feed
   */
  async getForYouFeed(userId: string, limit: number = 30): Promise<ForYouFeedItem[]> {
    const feed: ForYouFeedItem[] = [];

    // Get recommendations
    const recommendations = await this.getRecommendations(userId, 10);
    recommendations.forEach((story, index) => {
      feed.push({
        type: 'story',
        priority: 100 - index * 5,
        data: story,
        reason: story.matchReasons[0] || 'Recommended for you',
      });
    });

    // Get trending stories
    const trending = await this.getTrending(5);
    trending.forEach((story, index) => {
      if (!recommendations.find((r) => r.id === story.id)) {
        feed.push({
          type: 'story',
          priority: 80 - index * 5,
          data: story,
          reason: `Trending: ${story.trendingReason}`,
        });
      }
    });

    // Get genre recommendations
    const preferences = await this.getUserPreferences(userId);
    for (const genre of preferences.favoriteGenres.slice(0, 2)) {
      const genreRec = await this.getGenreRecommendation(genre);
      if (genreRec) {
        feed.push({
          type: 'genre',
          priority: 70,
          data: genreRec,
          reason: `Because you love ${genre}`,
        });
      }
    }

    // Get author recommendations
    const authorRecs = await this.getRecommendedAuthors(userId, 2);
    authorRecs.forEach((author) => {
      feed.push({
        type: 'author',
        priority: 60,
        data: author,
        reason: author.matchReason,
      });
    });

    // Sort by priority and return
    feed.sort((a, b) => b.priority - a.priority);
    return feed.slice(0, limit);
  }

  // ==================== SIMILAR STORIES ====================

  /**
   * Get stories similar to a given story
   */
  async getSimilarStories(storyId: string, limit: number = 10): Promise<StoryRecommendation[]> {
    const supabase = this.getSupabase();

    // Get the source story
    const { data: sourceStory, error: sourceError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (sourceError || !sourceStory) {
      return [];
    }

    // Find similar stories
    const { data: candidates, error } = await supabase
      .from('stories')
      .select(
        `
        *,
        users:author_id (id, username, avatar_url)
      `
      )
      .eq('is_published', true)
      .neq('id', storyId)
      .limit(50);

    if (error) {
      console.error('Error fetching similar stories:', error);
      return [];
    }

    // Score by similarity
    const scoredStories = (candidates || []).map((story) => {
      const similarityScore = this.calculateSimilarityScore(sourceStory, story);

      return {
        ...this.mapStoryToRecommendation(story),
        matchScore: similarityScore,
        matchReasons: this.getSimilarityReasons(sourceStory, story),
      };
    });

    scoredStories.sort((a, b) => b.matchScore - a.matchScore);
    return scoredStories.slice(0, limit);
  }

  /**
   * Get "Readers also liked" stories
   */
  async getReadersAlsoLiked(
    storyId: string,
    userId?: string,
    limit: number = 6
  ): Promise<StoryRecommendation[]> {
    const supabase = this.getSupabase();

    // Find users who liked/completed this story
    const { data: readers } = await supabase
      .from('user_progress')
      .select('user_id')
      .eq('story_id', storyId)
      .eq('is_completed', true)
      .limit(100);

    if (!readers || readers.length === 0) {
      return this.getSimilarStories(storyId, limit);
    }

    const readerIds = readers.map((r) => r.user_id);

    // Find other stories these readers completed
    const { data: otherStories, error } = await supabase
      .from('user_progress')
      .select(
        `
        story_id,
        stories!inner (
          *,
          users:author_id (id, username, avatar_url)
        )
      `
      )
      .in('user_id', readerIds)
      .eq('is_completed', true)
      .neq('story_id', storyId);

    if (error || !otherStories) {
      return this.getSimilarStories(storyId, limit);
    }

    // Count occurrences and score
    const storyScores = new Map<string, { story: any; count: number }>();

    otherStories.forEach((item) => {
      const story = item.stories;
      if (!story) return;

      const existing = storyScores.get(story.id);
      if (existing) {
        existing.count++;
      } else {
        storyScores.set(story.id, { story, count: 1 });
      }
    });

    // Convert to recommendations
    const recommendations = Array.from(storyScores.entries())
      .map(([id, { story, count }]) => ({
        ...this.mapStoryToRecommendation(story),
        matchScore: count / readers.length,
        matchReasons: [
          `${Math.round((count / readers.length) * 100)}% of readers also enjoyed this`,
        ],
      }))
      .filter((r) => !userId || r.id !== userId)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return recommendations;
  }

  // ==================== SEARCH ====================

  /**
   * Advanced search with filters
   */
  async advancedSearch(
    query: string,
    filters: {
      genres?: Genre[];
      minRating?: number;
      maxDuration?: number;
      isPremium?: boolean;
      sortBy?: 'relevance' | 'rating' | 'newest' | 'popular';
    } = {}
  ): Promise<StoryRecommendation[]> {
    const supabase = this.getSupabase();

    let dbQuery = supabase
      .from('stories')
      .select(
        `
        *,
        users:author_id (id, username, avatar_url)
      `
      )
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    // Apply filters
    if (filters.genres && filters.genres.length > 0) {
      dbQuery = dbQuery.in('genre', filters.genres);
    }
    if (filters.minRating) {
      dbQuery = dbQuery.gte('rating', filters.minRating);
    }
    if (filters.maxDuration) {
      dbQuery = dbQuery.lte('estimated_duration', filters.maxDuration);
    }
    if (filters.isPremium !== undefined) {
      dbQuery = dbQuery.eq('is_premium', filters.isPremium);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'rating':
        dbQuery = dbQuery.order('rating', { ascending: false });
        break;
      case 'newest':
        dbQuery = dbQuery.order('created_at', { ascending: false });
        break;
      case 'popular':
        dbQuery = dbQuery.order('play_count', { ascending: false });
        break;
      default:
        // Relevance - handled by match scoring
        break;
    }

    const { data, error } = await dbQuery.limit(50);

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    // Score by relevance if not using another sort
    const results = (data || []).map((story) => {
      const relevanceScore = this.calculateRelevanceScore(story, query);
      return {
        ...this.mapStoryToRecommendation(story),
        matchScore: relevanceScore,
        matchReasons: [],
      };
    });

    if (!filters.sortBy || filters.sortBy === 'relevance') {
      results.sort((a, b) => b.matchScore - a.matchScore);
    }

    return results;
  }

  // ==================== HELPER METHODS ====================

  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    const supabase = this.getSupabase();

    // Fetch user's reading history and preferences
    const [progressData, likesData, prefsData] = await Promise.all([
      supabase.from('user_progress').select('story_id, is_completed').eq('user_id', userId),
      supabase.from('story_likes').select('story_id').eq('user_id', userId),
      supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
    ]);

    const readingHistory = (progressData.data || []).map((p) => p.story_id);
    const completedStories = (progressData.data || [])
      .filter((p) => p.is_completed)
      .map((p) => p.story_id);
    const likedStories = (likesData.data || []).map((l) => l.story_id);

    // Infer favorite genres from reading history
    const { data: historyStories } = await supabase
      .from('stories')
      .select('genre')
      .in('id', readingHistory.slice(0, 50));

    const genreCounts: Record<string, number> = {};
    (historyStories || []).forEach((s) => {
      genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
    });

    const favoriteGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre as Genre);

    return {
      favoriteGenres: prefsData.data?.favorite_genres || favoriteGenres,
      dislikedGenres: prefsData.data?.disliked_genres || [],
      preferredLength: prefsData.data?.preferred_length || 'any',
      contentRating: prefsData.data?.content_rating || 'all',
      readingHistory,
      likedStories,
      completedStories,
      followedAuthors: [],
    };
  }

  private calculateRecommendationScores(story: any, preferences: UserPreferences) {
    return {
      genreMatch: preferences.favoriteGenres.includes(story.genre)
        ? 1
        : preferences.dislikedGenres.includes(story.genre)
          ? 0
          : 0.5,
      authorFollow: preferences.followedAuthors.includes(story.author_id) ? 1 : 0,
      similarToLiked: 0.5, // Would require more complex similarity calculation
      rating: (story.average_rating || 0) / 5,
      freshness: this.calculateFreshnessScore(story.created_at),
    };
  }

  private calculateSimilarityScore(source: any, candidate: any): number {
    let score = 0;

    // Genre match
    if (source.genre === candidate.genre) {
      score += SCORING_WEIGHTS.similarity.genre;
    }

    // Author match
    if (source.author_id === candidate.author_id) {
      score += SCORING_WEIGHTS.similarity.author;
    }

    // Tags overlap (if available)
    const sourceTags = source.tags || [];
    const candidateTags = candidate.tags || [];
    const tagOverlap = sourceTags.filter((t: string) => candidateTags.includes(t)).length;
    if (sourceTags.length > 0) {
      score += (tagOverlap / sourceTags.length) * SCORING_WEIGHTS.similarity.tags;
    }

    // Length similarity
    const sourceDuration = source.estimated_duration || 30;
    const candidateDuration = candidate.estimated_duration || 30;
    const durationDiff = Math.abs(sourceDuration - candidateDuration);
    const lengthScore = Math.max(0, 1 - durationDiff / 60);
    score += lengthScore * SCORING_WEIGHTS.similarity.length;

    return score;
  }

  private calculateRelevanceScore(story: any, query: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = (story.title || '').toLowerCase();
    const descLower = (story.description || '').toLowerCase();

    let score = 0;

    // Exact title match
    if (titleLower === queryLower) score += 1;
    // Title contains query
    else if (titleLower.includes(queryLower)) score += 0.7;

    // Description contains query
    if (descLower.includes(queryLower)) score += 0.3;

    // Boost by rating
    score *= 1 + (story.rating || 0) / 10;

    return score;
  }

  private calculateFreshnessScore(createdAt: string): number {
    const age = Date.now() - new Date(createdAt).getTime();
    const daysOld = age / (1000 * 60 * 60 * 24);

    if (daysOld < 1) return 1;
    if (daysOld < 7) return 0.8;
    if (daysOld < 30) return 0.5;
    if (daysOld < 90) return 0.3;
    return 0.1;
  }

  private getTrendingReason(
    story: any,
    recentPlays: number,
    recentRatings: number
  ): TrendingStory['trendingReason'] {
    if (story.is_staff_pick) return 'staff_pick';

    const ageHours = (Date.now() - new Date(story.created_at).getTime()) / (1000 * 60 * 60);
    if (ageHours < 48) return 'new';

    if (recentPlays > 100) return 'viral';
    if (recentRatings > 20) return 'hot';
    return 'rising';
  }

  private getTrendingReasonText(reason: TrendingStory['trendingReason']): string {
    switch (reason) {
      case 'viral':
        return '🔥 Going viral';
      case 'rising':
        return '📈 Rising fast';
      case 'hot':
        return '💫 Hot right now';
      case 'staff_pick':
        return '⭐ Staff Pick';
      case 'new':
        return '✨ Just released';
    }
  }

  private getMatchReasons(scores: any, story: any, preferences: UserPreferences): string[] {
    const reasons: string[] = [];

    if (scores.genreMatch === 1) {
      reasons.push(`Because you love ${story.genre}`);
    }
    if (scores.authorFollow === 1) {
      reasons.push('From an author you follow');
    }
    if (scores.rating > 0.8) {
      reasons.push(`Highly rated (${story.rating?.toFixed(1)}★)`);
    }
    if (scores.freshness > 0.8) {
      reasons.push('New release');
    }

    return reasons.length > 0 ? reasons : ['Recommended for you'];
  }

  private getSimilarityReasons(source: any, candidate: any): string[] {
    const reasons: string[] = [];

    if (source.genre === candidate.genre) {
      reasons.push(`Same genre: ${source.genre}`);
    }
    if (source.author_id === candidate.author_id) {
      reasons.push('Same author');
    }

    return reasons.length > 0 ? reasons : ['Similar story'];
  }

  private mapStoryToRecommendation(
    story: any
  ): Omit<StoryRecommendation, 'matchScore' | 'matchReasons'> {
    return {
      id: story.id,
      title: story.title,
      description: story.description,
      coverImageUrl: story.cover_image,
      genre: story.genre,
      author: {
        id: story.users?.id || story.author_id,
        username: story.users?.username || 'Unknown',
        avatarUrl: story.users?.avatar_url,
      },
      stats: {
        rating: story.rating || 0,
        ratingCount: story.rating_count || 0,
        playCount: story.play_count || 0,
        completionRate: story.completion_rate || 0,
      },
      isPremium: story.is_premium || false,
      estimatedDuration: story.estimated_duration || 30,
      createdAt: story.created_at,
    };
  }

  private async getGenreRecommendation(genre: Genre): Promise<GenreRecommendation | null> {
    const supabase = this.getSupabase();

    const { data: stories, error } = await supabase
      .from('stories')
      .select(
        `
        *,
        users:author_id (id, username, avatar_url)
      `
      )
      .eq('genre', genre)
      .eq('is_published', true)
      .order('rating', { ascending: false })
      .limit(1);

    if (error || !stories || stories.length === 0) return null;

    const GENRE_INFO: Record<Genre, { description: string; icon: string }> = {
      fantasy: { description: 'Epic worlds of magic and adventure', icon: '🧙' },
      'sci-fi': { description: 'Explore the future and beyond', icon: '🚀' },
      mystery: { description: 'Solve puzzles and uncover secrets', icon: '🔍' },
      romance: { description: 'Love stories that touch the heart', icon: '💕' },
      horror: { description: 'Face your fears', icon: '👻' },
      adventure: { description: 'Thrilling journeys await', icon: '🗺️' },
      thriller: { description: 'Edge-of-your-seat suspense', icon: '🎭' },
      historical: { description: 'Stories from the past', icon: '📜' },
    };

    return {
      genre,
      description: GENRE_INFO[genre].description,
      icon: GENRE_INFO[genre].icon,
      storyCount: 0, // Would need a count query
      newThisWeek: 0,
      topStory: {
        ...this.mapStoryToRecommendation(stories[0]),
        matchScore: 1,
        matchReasons: ['Top rated in ' + genre],
      },
    };
  }

  private async getRecommendedAuthors(
    userId: string,
    limit: number
  ): Promise<AuthorRecommendation[]> {
    const supabase = this.getSupabase();

    const { data: authors, error } = await supabase
      .from('users')
      .select(
        `
        *,
        stories:stories!author_id (genre)
      `
      )
      .gt('stories_count', 0)
      .order('total_plays', { ascending: false })
      .limit(limit);

    if (error || !authors) return [];

    return authors.map((author) => {
      const genreCounts: Record<string, number> = {};
      (author.stories || []).forEach((s: any) => {
        genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
      });
      const topGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre as Genre);

      return {
        id: author.id,
        username: author.username,
        displayName: author.display_name || author.username,
        avatarUrl: author.avatar_url,
        bio: author.bio,
        storyCount: author.stories_count || 0,
        followerCount: author.follower_count || 0,
        totalPlays: author.total_plays || 0,
        topGenres,
        matchReason: 'Popular author you might like',
      };
    });
  }
}

export const contentDiscoveryService = new ContentDiscoveryService();
