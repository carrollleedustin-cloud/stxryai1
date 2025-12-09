// AI-Powered Recommendation Engine
// Analyzes user behavior and preferences to suggest personalized content

export interface UserPreferences {
  favoriteGenres: string[];
  favoriteAuthors: string[];
  readingSpeed: number; // words per minute
  preferredLength: 'short' | 'medium' | 'long';
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  activeHours: number[]; // hours of day (0-23)
  topTags: string[];
}

export interface UserBehavior {
  completedStories: string[];
  abandonedStories: string[];
  bookmarkedStories: string[];
  likedStories: string[];
  averageSessionDuration: number;
  totalReadingTime: number;
  choicePatterns: Record<string, number>; // choice type -> count
  genreExploration: Record<string, number>; // genre -> count
}

export interface StoryMetadata {
  id: string;
  title: string;
  author: string;
  genre: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedReadTime: number;
  wordCount: number;
  averageRating: number;
  totalRatings: number;
  completionRate: number;
  popularity: number;
}

export interface Recommendation {
  story: StoryMetadata;
  score: number; // 0-100
  reason: string;
  confidence: number; // 0-1
  category: 'personalized' | 'trending' | 'similar' | 'new' | 'community';
}

export interface RecommendationConfig {
  maxRecommendations: number;
  diversityFactor: number; // 0-1, higher = more diverse
  noveltyFactor: number; // 0-1, higher = more new genres
  trendingWeight: number; // 0-1
  personalWeight: number; // 0-1
  includeCategories?: string[];
}

/**
 * Calculate recommendation score based on user preferences and story metadata
 */
export function calculateRecommendationScore(
  story: StoryMetadata,
  preferences: UserPreferences,
  behavior: UserBehavior
): number {
  let score = 0;
  const weights = {
    genre: 0.25,
    author: 0.15,
    tags: 0.15,
    difficulty: 0.10,
    length: 0.10,
    rating: 0.15,
    popularity: 0.10
  };

  // Genre matching
  const genreMatch = preferences.favoriteGenres.includes(story.genre);
  score += genreMatch ? weights.genre * 100 : 0;

  // Author matching
  const authorMatch = preferences.favoriteAuthors.includes(story.author);
  score += authorMatch ? weights.author * 100 : 0;

  // Tag matching
  const tagMatches = story.tags.filter(tag => preferences.topTags.includes(tag)).length;
  const tagScore = Math.min(tagMatches / preferences.topTags.length, 1);
  score += tagScore * weights.tags * 100;

  // Difficulty matching
  const difficultyMatch = story.difficulty === preferences.preferredDifficulty;
  score += difficultyMatch ? weights.difficulty * 100 : weights.difficulty * 50;

  // Length matching
  const estimatedLength = getStoryLength(story.wordCount);
  const lengthMatch = estimatedLength === preferences.preferredLength;
  score += lengthMatch ? weights.length * 100 : weights.length * 50;

  // Rating score
  const ratingScore = (story.averageRating / 5) * weights.rating * 100;
  score += ratingScore;

  // Popularity score (with diminishing returns to avoid echo chamber)
  const popularityScore = Math.log10(story.popularity + 1) / 5 * weights.popularity * 100;
  score += popularityScore;

  // Penalize if already completed
  if (behavior.completedStories.includes(story.id)) {
    score *= 0.3;
  }

  // Boost if bookmarked but not completed
  if (behavior.bookmarkedStories.includes(story.id) && !behavior.completedStories.includes(story.id)) {
    score *= 1.2;
  }

  // Penalize if abandoned
  if (behavior.abandonedStories.includes(story.id)) {
    score *= 0.1;
  }

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Generate personalized story recommendations
 */
export function generateRecommendations(
  availableStories: StoryMetadata[],
  preferences: UserPreferences,
  behavior: UserBehavior,
  config: RecommendationConfig = {
    maxRecommendations: 10,
    diversityFactor: 0.3,
    noveltyFactor: 0.2,
    trendingWeight: 0.3,
    personalWeight: 0.7
  }
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Score all stories
  const scoredStories = availableStories.map(story => ({
    story,
    personalScore: calculateRecommendationScore(story, preferences, behavior),
    trendingScore: calculateTrendingScore(story),
    similarityScore: calculateSimilarityScore(story, behavior),
    noveltyScore: calculateNoveltyScore(story, preferences, behavior)
  }));

  // Calculate final scores with weights
  const finalScored = scoredStories.map(item => {
    const finalScore =
      (item.personalScore * config.personalWeight) +
      (item.trendingScore * config.trendingWeight) +
      (item.noveltyScore * config.noveltyFactor) +
      (item.similarityScore * (1 - config.personalWeight - config.trendingWeight));

    return {
      ...item,
      finalScore,
      confidence: calculateConfidence(item.personalScore, behavior)
    };
  });

  // Sort by final score
  finalScored.sort((a, b) => b.finalScore - a.finalScore);

  // Apply diversity to avoid recommending too many similar stories
  const diverseRecommendations = applyDiversity(finalScored, config.diversityFactor);

  // Convert to recommendations with reasons
  for (const item of diverseRecommendations.slice(0, config.maxRecommendations)) {
    const reason = generateRecommendationReason(item, preferences, behavior);
    const category = determineCategory(item);

    recommendations.push({
      story: item.story,
      score: item.finalScore,
      reason,
      confidence: item.confidence,
      category
    });
  }

  return recommendations;
}

/**
 * Calculate trending score based on recent popularity
 */
function calculateTrendingScore(story: StoryMetadata): number {
  // Simple trending calculation based on popularity and completion rate
  const popularityFactor = Math.min(story.popularity / 10000, 1);
  const completionFactor = story.completionRate / 100;
  const ratingFactor = story.averageRating / 5;

  return (popularityFactor * 0.4 + completionFactor * 0.3 + ratingFactor * 0.3) * 100;
}

/**
 * Calculate similarity to user's liked stories
 */
function calculateSimilarityScore(story: StoryMetadata, behavior: UserBehavior): number {
  // If user has liked stories, boost similar ones
  if (behavior.likedStories.length === 0) return 50;

  // In a real implementation, this would use collaborative filtering
  // For now, use a simple genre-based similarity
  const genreSimilarity = behavior.genreExploration[story.genre] || 0;
  const maxGenreCount = Math.max(...Object.values(behavior.genreExploration), 1);

  return (genreSimilarity / maxGenreCount) * 100;
}

/**
 * Calculate novelty score to encourage exploration
 */
function calculateNoveltyScore(
  story: StoryMetadata,
  preferences: UserPreferences,
  behavior: UserBehavior
): number {
  let noveltyScore = 0;

  // Boost if genre hasn't been explored much
  const genreExploration = behavior.genreExploration[story.genre] || 0;
  const maxExploration = Math.max(...Object.values(behavior.genreExploration), 1);
  const genreNovelty = 1 - (genreExploration / maxExploration);
  noveltyScore += genreNovelty * 40;

  // Boost if author is new
  const isNewAuthor = !preferences.favoriteAuthors.includes(story.author);
  noveltyScore += isNewAuthor ? 30 : 0;

  // Boost if tags are new
  const newTags = story.tags.filter(tag => !preferences.topTags.includes(tag));
  noveltyScore += (newTags.length / story.tags.length) * 30;

  return noveltyScore;
}

/**
 * Calculate confidence in recommendation
 */
function calculateConfidence(score: number, behavior: UserBehavior): number {
  // Higher confidence if we have more behavioral data
  const dataPoints =
    behavior.completedStories.length +
    behavior.likedStories.length +
    behavior.bookmarkedStories.length;

  const dataConfidence = Math.min(dataPoints / 20, 1);
  const scoreConfidence = score / 100;

  return (dataConfidence * 0.6 + scoreConfidence * 0.4);
}

/**
 * Apply diversity to avoid too many similar recommendations
 */
function applyDiversity(
  scoredStories: any[],
  diversityFactor: number
): any[] {
  const diverse: any[] = [];
  const genreCount: Record<string, number> = {};
  const authorCount: Record<string, number> = {};

  for (const item of scoredStories) {
    const genre = item.story.genre;
    const author = item.story.author;

    // Penalize if we already have many from this genre/author
    const genrePenalty = (genreCount[genre] || 0) * diversityFactor * 10;
    const authorPenalty = (authorCount[author] || 0) * diversityFactor * 15;

    item.diversityAdjustedScore = item.finalScore - genrePenalty - authorPenalty;

    diverse.push(item);

    genreCount[genre] = (genreCount[genre] || 0) + 1;
    authorCount[author] = (authorCount[author] || 0) + 1;
  }

  diverse.sort((a, b) => b.diversityAdjustedScore - a.diversityAdjustedScore);
  return diverse;
}

/**
 * Generate human-readable reason for recommendation
 */
function generateRecommendationReason(
  item: any,
  preferences: UserPreferences,
  behavior: UserBehavior
): string {
  const story = item.story;
  const reasons: string[] = [];

  // Genre match
  if (preferences.favoriteGenres.includes(story.genre)) {
    reasons.push(`You love ${story.genre}`);
  }

  // Author match
  if (preferences.favoriteAuthors.includes(story.author)) {
    reasons.push(`From your favorite author ${story.author}`);
  }

  // High rating
  if (story.averageRating >= 4.5) {
    reasons.push(`Highly rated (${story.averageRating.toFixed(1)}⭐)`);
  }

  // Trending
  if (item.trendingScore > 70) {
    reasons.push('Trending now');
  }

  // Similar to liked
  if (behavior.likedStories.length > 0 && item.similarityScore > 70) {
    reasons.push('Similar to stories you liked');
  }

  // New exploration
  if (item.noveltyScore > 70) {
    reasons.push('Discover something new');
  }

  // Popular
  if (story.popularity > 5000) {
    reasons.push('Popular with readers');
  }

  return reasons.slice(0, 2).join(' • ') || 'Recommended for you';
}

/**
 * Determine recommendation category
 */
function determineCategory(item: any): Recommendation['category'] {
  if (item.personalScore > 75) return 'personalized';
  if (item.trendingScore > 75) return 'trending';
  if (item.similarityScore > 75) return 'similar';
  if (item.noveltyScore > 75) return 'new';
  return 'community';
}

/**
 * Get story length category from word count
 */
function getStoryLength(wordCount: number): 'short' | 'medium' | 'long' {
  if (wordCount < 5000) return 'short';
  if (wordCount < 20000) return 'medium';
  return 'long';
}

/**
 * Analyze user reading patterns and extract preferences
 */
export function analyzeUserPreferences(behavior: UserBehavior): UserPreferences {
  // Extract favorite genres from reading history
  const genreEntries = Object.entries(behavior.genreExploration);
  genreEntries.sort((a, b) => b[1] - a[1]);
  const favoriteGenres = genreEntries.slice(0, 3).map(([genre]) => genre);

  // Extract favorite authors (would need additional data in real implementation)
  const favoriteAuthors: string[] = [];

  // Calculate reading speed (would need timing data)
  const readingSpeed = 250; // Default WPM

  // Determine preferred length from session duration
  const preferredLength: 'short' | 'medium' | 'long' =
    behavior.averageSessionDuration < 30 ? 'short' :
    behavior.averageSessionDuration < 60 ? 'medium' : 'long';

  // Default difficulty to medium
  const preferredDifficulty: 'easy' | 'medium' | 'hard' = 'medium';

  // Default active hours (would need timing data)
  const activeHours = [19, 20, 21, 22]; // Evening

  // Extract top tags (would need tag tracking)
  const topTags: string[] = [];

  return {
    favoriteGenres,
    favoriteAuthors,
    readingSpeed,
    preferredLength,
    preferredDifficulty,
    activeHours,
    topTags
  };
}
