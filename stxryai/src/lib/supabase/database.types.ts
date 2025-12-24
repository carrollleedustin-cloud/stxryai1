export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          tier: 'free' | 'premium' | 'creator_pro' | 'enterprise';
          role: 'user' | 'moderator' | 'admin';
          is_admin: boolean;
          xp: number;
          level: number;
          energy: number;
          max_energy: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          tier?: 'free' | 'premium' | 'creator_pro';
          role?: 'user' | 'moderator' | 'admin';
          is_admin?: boolean;
          xp?: number;
          level?: number;
          energy?: number;
          max_energy?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          tier?: 'free' | 'premium' | 'creator_pro';
          role?: 'user' | 'moderator' | 'admin';
          is_admin?: boolean;
          xp?: number;
          level?: number;
          energy?: number;
          max_energy?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          cover_image: string | null;
          genre: string;
          difficulty: 'easy' | 'medium' | 'hard';
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
          published_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          cover_image?: string | null;
          genre: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          tags?: string[];
          is_premium?: boolean;
          is_published?: boolean;
          rating?: number;
          rating_count?: number;
          view_count?: number;
          read_count?: number;
          favorite_count?: number;
          chapter_count?: number;
          word_count?: number;
          estimated_duration?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          cover_image?: string | null;
          genre?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          tags?: string[];
          is_premium?: boolean;
          is_published?: boolean;
          rating?: number;
          rating_count?: number;
          view_count?: number;
          read_count?: number;
          favorite_count?: number;
          chapter_count?: number;
          word_count?: number;
          estimated_duration?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      chapters: {
        Row: {
          id: string;
          story_id: string;
          title: string;
          content: string;
          chapter_number: number;
          word_count: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          title: string;
          content: string;
          chapter_number: number;
          word_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          title?: string;
          content?: string;
          chapter_number?: number;
          word_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      choices: {
        Row: {
          id: string;
          chapter_id: string;
          text: string;
          next_chapter_id: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          text: string;
          next_chapter_id?: string | null;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          text?: string;
          next_chapter_id?: string | null;
          position?: number;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          chapter_id: string;
          progress_percentage: number;
          last_read_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          chapter_id: string;
          progress_percentage?: number;
          last_read_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          chapter_id?: string;
          progress_percentage?: number;
          last_read_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          icon: string;
          color: string;
          is_public: boolean;
          story_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          icon?: string;
          color?: string;
          is_public?: boolean;
          story_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          is_public?: boolean;
          story_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      collection_stories: {
        Row: {
          id: string;
          collection_id: string;
          story_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          story_id: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          story_id?: string;
          added_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          rating: number;
          review: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          rating: number;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          rating?: number;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          chapter_id: string | null;
          parent_id: string | null;
          content: string;
          like_count: number;
          is_edited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          chapter_id?: string | null;
          parent_id?: string | null;
          content: string;
          like_count?: number;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          chapter_id?: string | null;
          parent_id?: string | null;
          content?: string;
          like_count?: number;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
          xp_reward: number;
          requirement_type: string;
          requirement_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          icon: string;
          rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
          xp_reward?: number;
          requirement_type: string;
          requirement_value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon?: string;
          rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
          xp_reward?: number;
          requirement_type?: string;
          requirement_value?: number;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          progress: number;
          unlocked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          progress?: number;
          unlocked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          progress?: number;
          unlocked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'comment' | 'like' | 'follow' | 'achievement' | 'story';
          title: string;
          message: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'comment' | 'like' | 'follow' | 'achievement' | 'story';
          title: string;
          message: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'comment' | 'like' | 'follow' | 'achievement' | 'story';
          title?: string;
          message?: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          chapter_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          chapter_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          chapter_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_name: string;
          badge_type: string;
          badge_description: string | null;
          badge_icon: string | null;
          earned_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_name: string;
          badge_type: string;
          badge_description?: string | null;
          badge_icon?: string | null;
          earned_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_name?: string;
          badge_type?: string;
          badge_description?: string | null;
          badge_icon?: string | null;
          earned_at?: string;
          created_at?: string;
        };
      };
      user_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          activity_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          activity_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          activity_data?: Json;
          created_at?: string;
        };
      };
      user_friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      user_reading_lists: {
        Row: {
          id: string;
          user_id: string;
          list_name: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          list_name: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          list_name?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reading_list_items: {
        Row: {
          id: string;
          list_id: string;
          story_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          story_id: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          story_id?: string;
          added_at?: string;
        };
      };
      ai_prompt_templates: {
        Row: {
          id: string;
          user_id: string;
          story_id: string | null;
          prompt_category: string;
          template_name: string;
          prompt_text: string;
          context_variables: Json;
          creativity_level: number;
          usage_count: number;
          success_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id?: string | null;
          prompt_category?: string;
          template_name?: string;
          prompt_text?: string;
          context_variables?: Json;
          creativity_level?: number;
          usage_count?: number;
          success_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string | null;
          prompt_category?: string;
          template_name?: string;
          prompt_text?: string;
          context_variables?: Json;
          creativity_level?: number;
          usage_count?: number;
          success_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      dynamic_prompt_chains: {
        Row: {
          id: string;
          user_id: string;
          story_id: string | null;
          chain_name: string;
          prompt_sequence: Json;
          context_history: Json;
          adaptation_rules: Json;
          current_step: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id?: string | null;
          chain_name?: string;
          prompt_sequence?: Json;
          context_history?: Json;
          adaptation_rules?: Json;
          current_step?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string | null;
          chain_name?: string;
          prompt_sequence?: Json;
          context_history?: Json;
          adaptation_rules?: Json;
          current_step?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      procedural_content: {
        Row: {
          id: string;
          story_id: string;
          chapter_id: string | null;
          content_type: string;
          generated_content: string;
          context_tags: string[];
          quality_score: number;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          chapter_id?: string | null;
          content_type?: string;
          generated_content?: string;
          context_tags?: string[];
          quality_score?: number;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          chapter_id?: string | null;
          content_type?: string;
          generated_content?: string;
          context_tags?: string[];
          quality_score?: number;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      reading_journey_recaps: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          recap_type: string;
          choice_history: Json;
          moral_alignments: Json;
          relationship_dynamics: Json;
          narrative_milestones: Json;
          recap_content: string;
          spoiler_level: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          recap_type?: string;
          choice_history?: Json;
          moral_alignments?: Json;
          relationship_dynamics?: Json;
          narrative_milestones?: Json;
          recap_content?: string;
          spoiler_level?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          recap_type?: string;
          choice_history?: Json;
          moral_alignments?: Json;
          relationship_dynamics?: Json;
          narrative_milestones?: Json;
          recap_content?: string;
          spoiler_level?: string;
          created_at?: string;
        };
      };
      story_translations: {
        Row: {
          id: string;
          story_id: string;
          chapter_id: string | null;
          target_language: string;
          original_content: string;
          translated_content: string;
          translation_status: string;
          tone_preservation_score: number;
          cultural_adaptation_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          chapter_id?: string | null;
          target_language?: string;
          original_content?: string;
          translated_content?: string;
          translation_status?: string;
          tone_preservation_score?: number;
          cultural_adaptation_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          chapter_id?: string | null;
          target_language?: string;
          original_content?: string;
          translated_content?: string;
          translation_status?: string;
          tone_preservation_score?: number;
          cultural_adaptation_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      story_glossary: {
        Row: {
          id: string;
          story_id: string;
          user_id: string;
          entry_type: string;
          entry_name: string;
          entry_description: string;
          discovered_at: string;
          discovery_chapter_id: string | null;
          spoiler_protected: boolean;
          related_entries: string[];
          lore_depth: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          user_id: string;
          entry_type?: string;
          entry_name?: string;
          entry_description?: string;
          discovered_at?: string;
          discovery_chapter_id?: string | null;
          spoiler_protected?: boolean;
          related_entries?: string[];
          lore_depth?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          user_id?: string;
          entry_type?: string;
          entry_name?: string;
          entry_description?: string;
          discovered_at?: string;
          discovery_chapter_id?: string | null;
          spoiler_protected?: boolean;
          related_entries?: string[];
          lore_depth?: number;
          created_at?: string;
        };
      };
      writing_prompts: {
        Row: {
          id: string;
          user_id: string;
          prompt_type: string;
          genre_specific: string | null;
          worldbuilding_focus: string | null;
          character_motivation_theme: string | null;
          scene_construction_guidance: string | null;
          atmospheric_enhancements: string[];
          psychological_layers: string | null;
          suggested_expansions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_type?: string;
          genre_specific?: string | null;
          worldbuilding_focus?: string | null;
          character_motivation_theme?: string | null;
          scene_construction_guidance?: string | null;
          atmospheric_enhancements?: string[];
          psychological_layers?: string | null;
          suggested_expansions?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_type?: string;
          genre_specific?: string | null;
          worldbuilding_focus?: string | null;
          character_motivation_theme?: string | null;
          scene_construction_guidance?: string | null;
          atmospheric_enhancements?: string[];
          psychological_layers?: string | null;
          suggested_expansions?: string | null;
          created_at?: string;
        };
      };
      club_members: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      discussion_forums: {
        Row: {
          id: string;
          club_id: string | null;
          title: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id?: string | null;
          title: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string | null;
          title?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      discussion_replies: {
        Row: {
          id: string;
          discussion_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          discussion_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          discussion_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      user_ui_themes: {
        Row: {
          id: string;
          user_id: string;
          theme_name: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme_name?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme_name?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      character_relationships: {
        Row: {
          id: string;
          user_id: string;
          character_id: string;
          relationship_type: string;
          strength: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          character_id: string;
          relationship_type?: string;
          strength?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          character_id?: string;
          relationship_type?: string;
          strength?: number;
          created_at?: string;
        };
      };
      discovery_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferences: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferences?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferences?: Json;
          updated_at?: string;
        };
      };
      reader_feedback: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          feedback: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          feedback?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          feedback?: string;
          created_at?: string;
        };
      };
      user_engagement_metrics: {
        Row: {
          id: string;
          user_id: string;
          metric_key: string;
          metric_value: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_key: string;
          metric_value?: number;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_key?: string;
          metric_value?: number;
          recorded_at?: string;
        };
      };
      story_npcs: {
        Row: {
          id: string;
          story_id: string;
          npc_name: string;
          role: string;
          attributes: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          npc_name: string;
          role?: string;
          attributes?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          npc_name?: string;
          role?: string;
          attributes?: Json;
          created_at?: string;
        };
      };
      npc_user_memories: {
        Row: {
          id: string;
          npc_id: string;
          user_id: string;
          memory: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          npc_id: string;
          user_id: string;
          memory?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          npc_id?: string;
          user_id?: string;
          memory?: string;
          created_at?: string;
        };
      };
      narrative_pacing_adjustments: {
        Row: {
          id: string;
          story_id: string;
          adjustment: Json;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          adjustment?: Json;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          adjustment?: Json;
          reason?: string | null;
          created_at?: string;
        };
      };
      reported_content: {
        Row: {
          id: string;
          reported_by: string;
          target_table: string;
          target_id: string;
          reason: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reported_by: string;
          target_table: string;
          target_id: string;
          reason: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          reported_by?: string;
          target_table?: string;
          target_id?: string;
          reason?: string;
          status?: string;
          created_at?: string;
        };
      };
      user_pets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          base_type: string;
          element: string;
          personality: string;
          evolution_stage: string;
          traits: Json;
          current_mood: string;
          accessories: Json;
          stats: Json;
          memories: Json;
          born_at: string;
          last_interaction: string;
          last_fed: string;
          genetic_seed: string;
          evolution_history: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          base_type: string;
          element: string;
          personality: string;
          evolution_stage?: string;
          traits?: Json;
          current_mood?: string;
          accessories?: Json;
          stats?: Json;
          memories?: Json;
          born_at?: string;
          last_interaction?: string;
          last_fed?: string;
          genetic_seed: string;
          evolution_history?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          base_type?: string;
          element?: string;
          personality?: string;
          evolution_stage?: string;
          traits?: Json;
          current_mood?: string;
          accessories?: Json;
          stats?: Json;
          memories?: Json;
          born_at?: string;
          last_interaction?: string;
          last_fed?: string;
          genetic_seed?: string;
          evolution_history?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      tier: 'free' | 'premium' | 'creator_pro';
      difficulty: 'easy' | 'medium' | 'hard';
      rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
      notification_type: 'comment' | 'like' | 'follow' | 'achievement' | 'story';
    };
  };
}
