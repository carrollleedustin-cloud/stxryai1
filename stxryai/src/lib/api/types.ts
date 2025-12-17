/**
 * Comprehensive API type definitions
 * Provides type-safe interfaces for all API operations
 */

// Base response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Story types
export interface StoryFilters {
  genre?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  isPremium?: boolean;
  isPublished?: boolean;
  authorId?: string;
  tags?: string[];
  minRating?: number;
  search?: string;
}

export type StorySortOption =
  | 'newest'
  | 'oldest'
  | 'popular'
  | 'rating'
  | 'trending'
  | 'alphabetical';

// User types
export type SubscriptionTier = 'free' | 'premium' | 'creator_pro';

export interface UserStats {
  storiesRead: number;
  storiesCreated: number;
  totalXP: number;
  level: number;
  achievementsUnlocked: number;
  friendsCount: number;
  readingStreak: number;
}

// Achievement types
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
  criteria: {
    type: string;
    value: number;
  };
}

// Activity types
export type ActivityType =
  | 'story_read'
  | 'story_completed'
  | 'story_created'
  | 'story_published'
  | 'achievement_unlocked'
  | 'level_up'
  | 'friend_added'
  | 'comment_posted'
  | 'rating_given'
  | 'club_joined';

export interface ActivityEntry {
  id: string;
  userId: string;
  type: ActivityType;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// Notification types
export type NotificationType =
  | 'achievement'
  | 'friend_request'
  | 'friend_accepted'
  | 'story_comment'
  | 'story_rating'
  | 'story_milestone'
  | 'system'
  | 'promotional';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Comment types
export interface Comment {
  id: string;
  userId: string;
  storyId: string;
  chapterId?: string;
  parentId?: string;
  content: string;
  likes: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
}

// Rating types
export interface Rating {
  id: string;
  userId: string;
  storyId: string;
  score: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

// Reading progress types
export interface ReadingProgress {
  userId: string;
  storyId: string;
  currentChapterId: string;
  choicesMade: string[];
  completedChapters: string[];
  startedAt: string;
  lastReadAt: string;
  completedAt?: string;
  percentComplete: number;
}

// Bookmark types
export interface Bookmark {
  id: string;
  userId: string;
  storyId: string;
  chapterId: string;
  note?: string;
  createdAt: string;
}

// Collection types
export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  storyCount: number;
  createdAt: string;
  updatedAt: string;
}

// Social types
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
  friend?: {
    id: string;
    username: string;
    avatarUrl?: string;
    level: number;
  };
}

// Leaderboard types
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';
export type LeaderboardCategory = 'xp' | 'stories_read' | 'achievements' | 'streaks';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  change?: number; // Position change from previous period
}

// Energy system types
export interface EnergyState {
  current: number;
  max: number;
  regenRate: number; // Per hour
  nextRegenAt?: string;
  boostActive?: {
    multiplier: number;
    expiresAt: string;
  };
}

// AI types
export interface AIGenerationRequest {
  prompt: string;
  context?: string;
  style?: 'creative' | 'professional' | 'casual';
  maxLength?: number;
  temperature?: number;
}

export interface AIGenerationResponse {
  content: string;
  tokensUsed: number;
  model: string;
  finishReason: 'stop' | 'length' | 'error';
}

// Report types
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'copyright'
  | 'other';

export interface ContentReport {
  id: string;
  reporterId: string;
  contentType: 'story' | 'comment' | 'user' | 'review';
  contentId: string;
  reason: ReportReason;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export type WithId<T> = T & {
  id: string;
};
