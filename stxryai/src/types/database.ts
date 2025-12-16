export type Tier = 'free' | 'premium' | 'creator_pro';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type UserRole = 'user' | 'moderator' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  tier: Tier;
  role: UserRole;
  xp: number;
  level: number;
  energy: number;
  max_energy: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  subscription_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_image?: string;
  genre: string;
  difficulty: Difficulty;
  tags: string[];
  is_premium: boolean;
  is_published: boolean;
  rating: number;
  rating_count: number;
  view_count: number;
  read_count: number;
  favorite_count: number;
  chapter_count: number;
  word_count: number;
  estimated_duration: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  author: {
    display_name: string;
    avatar_url: string;
  };
}

export interface Chapter {
  id: string;
  story_id: string;
  title: string;
  content: string;
  chapter_number: number;
  word_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Choice {
  id: string;
  chapter_id: string;
  text: string;
  next_chapter_id?: string;
  position: number;
  created_at: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
    xp_reward: number;
    requirement_type: string;
    requirement_value: number;
    created_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  progress: number;
  unlocked_at?: string;
}

export interface Notification {
  id?: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read?: boolean;
  created_at?: string;
}
