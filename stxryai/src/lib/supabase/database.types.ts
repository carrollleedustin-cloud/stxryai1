export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          tier: 'free' | 'premium' | 'creator_pro'
          xp: number
          level: number
          energy: number
          max_energy: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          tier?: 'free' | 'premium' | 'creator_pro'
          xp?: number
          level?: number
          energy?: number
          max_energy?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          tier?: 'free' | 'premium' | 'creator_pro'
          xp?: number
          level?: number
          energy?: number
          max_energy?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cover_image: string | null
          genre: string
          difficulty: 'easy' | 'medium' | 'hard'
          tags: string[]
          is_premium: boolean
          is_published: boolean
          rating: number
          rating_count: number
          view_count: number
          read_count: number
          favorite_count: number
          chapter_count: number
          word_count: number
          estimated_duration: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          cover_image?: string | null
          genre: string
          difficulty?: 'easy' | 'medium' | 'hard'
          tags?: string[]
          is_premium?: boolean
          is_published?: boolean
          rating?: number
          rating_count?: number
          view_count?: number
          read_count?: number
          favorite_count?: number
          chapter_count?: number
          word_count?: number
          estimated_duration?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          cover_image?: string | null
          genre?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          tags?: string[]
          is_premium?: boolean
          is_published?: boolean
          rating?: number
          rating_count?: number
          view_count?: number
          read_count?: number
          favorite_count?: number
          chapter_count?: number
          word_count?: number
          estimated_duration?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      chapters: {
        Row: {
          id: string
          story_id: string
          title: string
          content: string
          chapter_number: number
          word_count: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          story_id: string
          title: string
          content: string
          chapter_number: number
          word_count?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          title?: string
          content?: string
          chapter_number?: number
          word_count?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      choices: {
        Row: {
          id: string
          chapter_id: string
          text: string
          next_chapter_id: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          text: string
          next_chapter_id?: string | null
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string
          text?: string
          next_chapter_id?: string | null
          position?: number
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          story_id: string
          chapter_id: string
          progress_percentage: number
          last_read_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          chapter_id: string
          progress_percentage?: number
          last_read_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          chapter_id?: string
          progress_percentage?: number
          last_read_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          icon: string
          color: string
          is_public: boolean
          story_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          icon?: string
          color?: string
          is_public?: boolean
          story_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          icon?: string
          color?: string
          is_public?: boolean
          story_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      collection_stories: {
        Row: {
          id: string
          collection_id: string
          story_id: string
          added_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          story_id: string
          added_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          story_id?: string
          added_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          story_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          rating: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          rating?: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          story_id: string
          chapter_id: string | null
          parent_id: string | null
          content: string
          like_count: number
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          chapter_id?: string | null
          parent_id?: string | null
          content: string
          like_count?: number
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          chapter_id?: string | null
          parent_id?: string | null
          content?: string
          like_count?: number
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          icon: string
          rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
          xp_reward: number
          requirement_type: string
          requirement_value: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon: string
          rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
          xp_reward?: number
          requirement_type: string
          requirement_value: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
          rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
          xp_reward?: number
          requirement_type?: string
          requirement_value?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          progress: number
          unlocked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          progress?: number
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          progress?: number
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'comment' | 'like' | 'follow' | 'achievement' | 'story'
          title: string
          message: string
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'comment' | 'like' | 'follow' | 'achievement' | 'story'
          title: string
          message: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'comment' | 'like' | 'follow' | 'achievement' | 'story'
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      tier: 'free' | 'premium' | 'creator_pro'
      difficulty: 'easy' | 'medium' | 'hard'
      rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
      notification_type: 'comment' | 'like' | 'follow' | 'achievement' | 'story'
    }
  }
}
