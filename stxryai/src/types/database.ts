export type Tier = "free" | "premium" | "creator_pro";
export type Difficulty = "easy" | "medium" | "hard";
export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type NotificationType = "comment" | "like" | "follow" | "achievement" | "story";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  tier: Tier;
  xp: number;
  level: number;
  energy: number;
  max_energy: number;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  subscription_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  cover_image?: string | null;
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
  published_at?: string | null;
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

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: Rarity;
    xp_reward: number;
    requirement_type: string;
    requirement_value: number;
    created_at: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    progress: number;
    unlocked_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string | null;
    read: boolean;
    created_at: string;
}
