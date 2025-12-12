/**
 * AI-Powered Recommendation Engine
 * Provides personalized story recommendations based on user behavior and preferences
 */

interface UserProfile {
  userId: string;
  readingHistory: string[]; // Story IDs
  completedStories: string[];
  favoriteGenres: string[];
  averageRating: number;
  readingSpeed: number; // words per minute
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  interactionPatterns: {
    timeOfDay: string[];
    sessionDuration: number;
    choicePatterns: string[];
  };
}

interface Story {
  id: string;
  title: string;
  genre: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  averageRating: number;
  totalReads: number;
  wordCount: number;
  author: string;
  publicationDate: Date;
}

interface RecommendationScore {
  storyId: string;
  score: number;
  reasons: string[];
  matchFactors: {
    genreMatch: number;
    difficultyMatch: number;
    popularityBoost: number;
    diversityScore: number;
    freshness: number;
  };
}

export class RecommendationEngine {
  private readonly WEIGHTS = {
    genre: 0.3,
    difficulty: 0.15,
    rating: 0.2,
    popularity: 0.15,
    diversity: 0.1,
    freshness: 0.1,
  };

  /**
   * Get personalized story recommendations for a user
   */
  async getRecommendations(
    userProfile: UserProfile,
    availableStories: Story[],
    count: number = 10
  ): Promise<RecommendationScore[]> {
    // Filter out already read stories
    const unreadStories = availableStories.filter(
      (story) => !userProfile.readingHistory.includes(story.id)
    );

    // Calculate scores for each story
    const scoredStories = unreadStories.map((story) =>
      this.calculateRecommendationScore(userProfile, story, availableStories)
    );

    // Sort by score and return top N
    return scoredStories.sort((a, b) => b.score - a.score).slice(0, count);
  }

  /**
   * Get similar stories based on a reference story
   */
  async getSimilarStories(
    referenceStory: Story,
    availableStories: Story[],
    count: number = 5
  ): Promise<Story[]> {
    const similarities = availableStories
      .filter((s) => s.id !== referenceStory.id)
      .map((story) => ({
        story,
        similarity: this.calculateSimilarity(referenceStory, story),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count);

    return similarities.map((s) => s.story);
  }

  /**
   * Get trending stories based on recent activity
   */
  async getTrendingStories(
    stories: Story[],
    recentActivity: Map<string, number>, // storyId -> recent read count
    timeWindow: number = 7 // days
  ): Promise<Story[]> {
    const trendingScores = stories.map((story) => {
      const recentReads = recentActivity.get(story.id) || 0;
      const trendScore = this.calculateTrendScore(story, recentReads, timeWindow);

      return { story, score: trendScore };
    });

    return trendingScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((s) => s.story);
  }

  /**
   * Get stories to help users discover new genres
   */
  async getDiscoveryRecommendations(
    userProfile: UserProfile,
    availableStories: Story[],
    count: number = 5
  ): Promise<Story[]> {
    // Find genres user hasn't explored much
    const genreCounts = new Map<string, number>();
    userProfile.readingHistory.forEach((storyId) => {
      const story = availableStories.find((s) => s.id === storyId);
      if (story) {
        genreCounts.set(story.genre, (genreCounts.get(story.genre) || 0) + 1);
      }
    });

    // Prioritize high-rated stories from unexplored genres
    const discoveryStories = availableStories
      .filter(
        (story) =>
          !userProfile.readingHistory.includes(story.id) &&
          (genreCounts.get(story.genre) || 0) < 3
      )
      .filter((story) => story.averageRating >= 4.0)
      .sort((a, b) => {
        const aExploration = genreCounts.get(a.genre) || 0;
        const bExploration = genreCounts.get(b.genre) || 0;
        if (aExploration !== bExploration) {
          return aExploration - bExploration; // Less explored first
        }
        return b.averageRating - a.averageRating; // Then by rating
      })
      .slice(0, count);

    return discoveryStories;
  }

  /**
   * Get "Continue Reading" recommendations
   */
  async getContinueReading(
    userProfile: UserProfile,
    stories: Story[],
    progressData: Map<string, number> // storyId -> completion percentage
  ): Promise<Story[]> {
    const inProgressStories = Array.from(progressData.entries())
      .filter(([storyId, progress]) => {
        return (
          progress > 0 &&
          progress < 100 &&
          !userProfile.completedStories.includes(storyId)
        );
      })
      .map(([storyId, progress]) => {
        const story = stories.find((s) => s.id === storyId);
        return { story, progress };
      })
      .filter((item): item is { story: Story; progress: number } => item.story !== undefined)
      .sort((a, b) => b.progress - a.progress); // Sort by most progress

    return inProgressStories.map((item) => item.story);
  }

  /**
   * Calculate recommendation score for a story
   */
  private calculateRecommendationScore(
    user: UserProfile,
    story: Story,
    allStories: Story[]
  ): RecommendationScore {
    const factors = {
      genreMatch: this.calculateGenreMatch(user, story),
      difficultyMatch: this.calculateDifficultyMatch(user, story),
      popularityBoost: this.calculatePopularityScore(story, allStories),
      diversityScore: this.calculateDiversityScore(user, story),
      freshness: this.calculateFreshnessScore(story),
    };

    const score =
      factors.genreMatch * this.WEIGHTS.genre +
      factors.difficultyMatch * this.WEIGHTS.difficulty +
      story.averageRating * 0.2 * this.WEIGHTS.rating +
      factors.popularityBoost * this.WEIGHTS.popularity +
      factors.diversityScore * this.WEIGHTS.diversity +
      factors.freshness * this.WEIGHTS.freshness;

    const reasons = this.generateReasons(factors, story, user);

    return {
      storyId: story.id,
      score,
      reasons,
      matchFactors: factors,
    };
  }

  private calculateGenreMatch(user: UserProfile, story: Story): number {
    const genrePreference = user.favoriteGenres.includes(story.genre) ? 1.0 : 0.3;
    const tagMatch =
      story.tags.filter((tag) => user.favoriteGenres.includes(tag)).length / story.tags.length;
    return genrePreference * 0.7 + tagMatch * 0.3;
  }

  private calculateDifficultyMatch(user: UserProfile, story: Story): number {
    const difficultyMap = { easy: 1, medium: 2, hard: 3 };
    const userLevel = difficultyMap[user.preferredDifficulty];
    const storyLevel = difficultyMap[story.difficulty];
    const difference = Math.abs(userLevel - storyLevel);
    return Math.max(0, 1 - difference * 0.4);
  }

  private calculatePopularityScore(story: Story, allStories: Story[]): number {
    const maxReads = Math.max(...allStories.map((s) => s.totalReads));
    if (maxReads === 0) return 0;
    return story.totalReads / maxReads;
  }

  private calculateDiversityScore(user: UserProfile, story: Story): number {
    // Reward stories that are different from what user normally reads
    const hasReadGenre = user.readingHistory.some((id) => {
      // In real implementation, look up actual stories
      return false; // Placeholder
    });
    return hasReadGenre ? 0.3 : 1.0;
  }

  private calculateFreshnessScore(story: Story): number {
    const daysSincePublication =
      (Date.now() - story.publicationDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublication <= 7) return 1.0;
    if (daysSincePublication <= 30) return 0.7;
    if (daysSincePublication <= 90) return 0.4;
    return 0.2;
  }

  private calculateSimilarity(story1: Story, story2: Story): number {
    let similarity = 0;

    // Genre match
    if (story1.genre === story2.genre) similarity += 0.4;

    // Tag overlap
    const commonTags = story1.tags.filter((tag) => story2.tags.includes(tag));
    similarity += (commonTags.length / Math.max(story1.tags.length, story2.tags.length)) * 0.3;

    // Difficulty match
    if (story1.difficulty === story2.difficulty) similarity += 0.15;

    // Rating similarity
    const ratingDiff = Math.abs(story1.averageRating - story2.averageRating);
    similarity += Math.max(0, (1 - ratingDiff / 5) * 0.15);

    return similarity;
  }

  private calculateTrendScore(story: Story, recentReads: number, timeWindow: number): number {
    // Calculate velocity (reads per day)
    const velocity = recentReads / timeWindow;

    // Normalize by total reads to favor genuine trends over established popular stories
    const trendRatio = story.totalReads > 0 ? recentReads / story.totalReads : 1;

    // Combine factors
    return velocity * 0.6 + trendRatio * 0.4;
  }

  private generateReasons(
    factors: RecommendationScore['matchFactors'],
    story: Story,
    user: UserProfile
  ): string[] {
    const reasons: string[] = [];

    if (factors.genreMatch > 0.7) {
      reasons.push(`Matches your favorite genre: ${story.genre}`);
    }

    if (story.averageRating >= 4.5) {
      reasons.push(`Highly rated (${story.averageRating.toFixed(1)}⭐)`);
    }

    if (factors.popularityBoost > 0.7) {
      reasons.push('Popular among readers');
    }

    if (factors.freshness > 0.7) {
      reasons.push('Newly published');
    }

    if (factors.difficultyMatch > 0.8) {
      reasons.push(`Perfect ${story.difficulty} difficulty for you`);
    }

    if (factors.diversityScore > 0.7) {
      reasons.push('Explore something new');
    }

    return reasons;
  }

  /**
   * Collaborative filtering - find users with similar tastes
   */
  async findSimilarUsers(
    targetUser: UserProfile,
    allUsers: UserProfile[],
    count: number = 10
  ): Promise<UserProfile[]> {
    const similarities = allUsers
      .filter((u) => u.userId !== targetUser.userId)
      .map((user) => ({
        user,
        similarity: this.calculateUserSimilarity(targetUser, user),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count);

    return similarities.map((s) => s.user);
  }

  private calculateUserSimilarity(user1: UserProfile, user2: UserProfile): number {
    // Genre overlap
    const genreOverlap =
      user1.favoriteGenres.filter((g) => user2.favoriteGenres.includes(g)).length /
      Math.max(user1.favoriteGenres.length, user2.favoriteGenres.length);

    // Reading history overlap
    const historyOverlap =
      user1.readingHistory.filter((id) => user2.readingHistory.includes(id)).length /
      Math.max(user1.readingHistory.length, user2.readingHistory.length);

    // Rating similarity
    const ratingDiff = Math.abs(user1.averageRating - user2.averageRating);
    const ratingSimilarity = Math.max(0, 1 - ratingDiff / 5);

    return genreOverlap * 0.4 + historyOverlap * 0.4 + ratingSimilarity * 0.2;
  }

  /**
   * Generate "Because you read X" recommendations
   */
  async getBecauseYouRead(
    referenceStoryId: string,
    allStories: Story[],
    count: number = 5
  ): Promise<Story[]> {
    const referenceStory = allStories.find((s) => s.id === referenceStoryId);
    if (!referenceStory) return [];

    return this.getSimilarStories(referenceStory, allStories, count);
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
