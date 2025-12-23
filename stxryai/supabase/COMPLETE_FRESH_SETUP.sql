-- ============================================================================
-- STXRYAI COMPLETE DATABASE SETUP - FULL VERSION
-- ============================================================================
-- This is the COMPREHENSIVE setup that includes ALL tables for ALL features.
-- Run this ONCE in a fresh Supabase project SQL Editor.
-- 
-- WARNING: This replaces FRESH_SETUP.sql with more complete coverage.
-- ============================================================================
-- Version: 2.0.0 | Date: December 2024
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 2: CREATE ALL ENUMS (Custom Types)
-- ============================================================================

DO $$ 
BEGIN
  -- Story related enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_status') THEN
    CREATE TYPE story_status AS ENUM ('draft', 'published', 'archived');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_genre') THEN
    CREATE TYPE story_genre AS ENUM ('fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'adventure', 'thriller', 'historical');
  END IF;

  -- User related enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'creator_pro', 'enterprise', 'vip', 'lifetime');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_type') THEN
    CREATE TYPE badge_type AS ENUM ('reader', 'explorer', 'completionist', 'social', 'creator', 'streak', 'collector');
  END IF;

  -- Gamification enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_type') THEN
    CREATE TYPE goal_type AS ENUM ('time', 'stories', 'chapters');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'challenge_type') THEN
    CREATE TYPE challenge_type AS ENUM ('genre', 'count', 'time', 'explore', 'social');
  END IF;

  -- Community enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'club_status') THEN
    CREATE TYPE club_status AS ENUM ('active', 'inactive', 'archived');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discussion_category') THEN
    CREATE TYPE discussion_category AS ENUM ('general', 'genre_specific', 'story_specific', 'writing_tips', 'community');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('reading_marathon', 'author_qa', 'writing_workshop', 'collaborative_story');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentorship_status') THEN
    CREATE TYPE mentorship_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
  END IF;

  -- Monetization enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('purchase', 'tip_sent', 'tip_received', 'story_unlock', 'collection_unlock', 'character_pack', 'gift_sent', 'gift_received', 'reward', 'refund', 'admin_adjustment');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'paused');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_period') THEN
    CREATE TYPE billing_period AS ENUM ('monthly', 'yearly');
  END IF;

  -- Narrative Engine enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_mode') THEN
    CREATE TYPE story_mode AS ENUM ('story', 'book', 'novel', 'series');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'character_status') THEN
    CREATE TYPE character_status AS ENUM ('active', 'deceased', 'missing', 'retired', 'transformed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canon_lock_level') THEN
    CREATE TYPE canon_lock_level AS ENUM ('suggestion', 'soft', 'hard', 'immutable');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'world_element_type') THEN
    CREATE TYPE world_element_type AS ENUM ('geography', 'culture', 'religion', 'magic_system', 'technology', 'political', 'economic', 'historical', 'myth', 'custom');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_type') THEN
    CREATE TYPE change_type AS ENUM ('physical', 'psychological', 'relational', 'status', 'ability', 'possession', 'location');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'arc_type') THEN
    CREATE TYPE arc_type AS ENUM ('character', 'plot', 'thematic', 'relationship', 'world');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'arc_status') THEN
    CREATE TYPE arc_status AS ENUM ('setup', 'rising', 'climax', 'falling', 'resolved', 'abandoned');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
    CREATE TYPE relationship_type AS ENUM ('ally', 'enemy', 'family', 'romantic', 'mentor', 'rival', 'neutral', 'complicated');
  END IF;
  
  -- AI & Content enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'engagement_level') THEN
    CREATE TYPE engagement_level AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'npc_relationship_type') THEN
    CREATE TYPE npc_relationship_type AS ENUM ('neutral', 'friendly', 'hostile', 'romantic', 'mentor', 'rival');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'translation_status') THEN
    CREATE TYPE translation_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
  END IF;

END $$;

-- ============================================================================
-- STEP 3: CORE USER TABLES
-- ============================================================================

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'free',
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_reading_time INTEGER DEFAULT 0,
  stories_completed INTEGER DEFAULT 0,
  choices_made INTEGER DEFAULT 0,
  daily_choice_limit INTEGER DEFAULT 10,
  daily_choices_used INTEGER DEFAULT 0,
  last_choice_reset TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alternate users table (for services that use 'users' directly)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'free',
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  subscription_end_date TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  favorite_genres TEXT[] DEFAULT '{}',
  disliked_genres TEXT[] DEFAULT '{}',
  preferred_length TEXT DEFAULT 'any',
  content_rating TEXT DEFAULT 'all',
  notification_preferences JSONB DEFAULT '{}',
  display_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Levels (XP System)
CREATE TABLE IF NOT EXISTS public.user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- XP History
CREATE TABLE IF NOT EXISTS public.xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Stats
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stories_started INTEGER DEFAULT 0,
  stories_completed INTEGER DEFAULT 0,
  total_reading_time INTEGER DEFAULT 0,
  total_choices_made INTEGER DEFAULT 0,
  genres_explored TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: STORY TABLES
-- ============================================================================

-- Stories
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  genre TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  tags TEXT[] DEFAULT '{}',
  estimated_duration INTEGER,
  status TEXT DEFAULT 'published',
  is_premium BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  total_chapters INTEGER DEFAULT 0,
  total_choices INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  content_maturity TEXT DEFAULT 'everyone',
  language TEXT DEFAULT 'en',
  content JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Story Chapters (primary table)
CREATE TABLE IF NOT EXISTS public.story_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, chapter_number)
);

-- Chapters (alternate table - some services use this)
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  choices JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, chapter_number)
);

-- Story Choices
CREATE TABLE IF NOT EXISTS public.story_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE CASCADE NOT NULL,
  choice_text TEXT NOT NULL,
  consequence_text TEXT,
  next_chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE SET NULL,
  choice_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Choices (alternate table)
CREATE TABLE IF NOT EXISTS public.choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  consequence_text TEXT,
  next_chapter_id UUID,
  choice_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Templates
CREATE TABLE IF NOT EXISTS public.story_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  template_data JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments on stories
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: USER PROGRESS & ACTIVITY
-- ============================================================================

-- User Reading Progress (primary)
CREATE TABLE IF NOT EXISTS public.user_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  current_chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE SET NULL,
  last_choice_id UUID REFERENCES public.story_choices(id) ON DELETE SET NULL,
  progress_percentage INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Reading Progress (alternate)
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  current_chapter INTEGER DEFAULT 1,
  current_node_id TEXT,
  current_choice_path JSONB DEFAULT '[]',
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  choices_made JSONB DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  bookmark_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- User Progress (alternate)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  current_chapter INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- User Activities
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activity (alternate)
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Activity Feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: GAMIFICATION TABLES
-- ============================================================================

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common',
  requirements JSONB DEFAULT '{}',
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_name TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_name)
);

-- Reading Streaks
CREATE TABLE IF NOT EXISTS public.reading_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE DEFAULT CURRENT_DATE,
  streak_recovery_used INTEGER DEFAULT 0,
  streak_recovery_reset_date DATE,
  streak_freezes_available INTEGER DEFAULT 0,
  streak_freezes_used_this_month INTEGER DEFAULT 0,
  last_freeze_used_date DATE,
  is_frozen BOOLEAN DEFAULT false,
  freeze_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Reading Streaks (alternate)
CREATE TABLE IF NOT EXISTS public.user_reading_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Reading Goals
CREATE TABLE IF NOT EXISTS public.daily_reading_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_date DATE DEFAULT CURRENT_DATE,
  goal_type TEXT NOT NULL,
  goal_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_date)
);

-- Reading Calendar
CREATE TABLE IF NOT EXISTS public.reading_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_date DATE DEFAULT CURRENT_DATE,
  reading_time INTEGER DEFAULT 0,
  stories_read INTEGER DEFAULT 0,
  chapters_read INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, read_date)
);

-- Weekly Challenges
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_week DATE NOT NULL,
  challenge_type TEXT NOT NULL,
  challenge_data JSONB DEFAULT '{}',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_xp INTEGER DEFAULT 0,
  reward_badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_week, challenge_type)
);

-- User Weekly Challenges
CREATE TABLE IF NOT EXISTS public.user_weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Daily Challenges
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE DEFAULT CURRENT_DATE,
  challenge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER DEFAULT 1,
  reward_xp INTEGER DEFAULT 50,
  reward_coins INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Daily Challenges
CREATE TABLE IF NOT EXISTS public.user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Milestones
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  reward_xp INTEGER DEFAULT 0,
  badge_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Milestones
CREATE TABLE IF NOT EXISTS public.user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  celebrated BOOLEAN DEFAULT false,
  UNIQUE(user_id, milestone_id)
);

-- ============================================================================
-- STEP 7: SOCIAL FEATURES
-- ============================================================================

-- User Friendships
CREATE TABLE IF NOT EXISTS public.user_friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Friendships (alternate)
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- User Follows
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Story Reviews
CREATE TABLE IF NOT EXISTS public.story_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Story Likes
CREATE TABLE IF NOT EXISTS public.story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- User Reading Lists
CREATE TABLE IF NOT EXISTS public.user_reading_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  list_name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading List Items
CREATE TABLE IF NOT EXISTS public.reading_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES public.user_reading_lists(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, story_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 8: DIRECT MESSAGING
-- ============================================================================

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('direct', 'group')),
  conversation_name TEXT,
  participants UUID[] DEFAULT '{}',
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  group_avatar_url TEXT,
  group_description TEXT,
  is_archived BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  reply_preview TEXT,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  read_by UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Participants
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  is_muted BOOLEAN DEFAULT false,
  mute_until TIMESTAMPTZ,
  last_read_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  last_read_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Typing Indicators
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Message Reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- ============================================================================
-- STEP 9: ANNOUNCEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  target_audience TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dismissed_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- ============================================================================
-- STEP 10: COMMUNITY HUB
-- ============================================================================

-- Reading Clubs
CREATE TABLE IF NOT EXISTS public.reading_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  member_count INTEGER DEFAULT 0,
  current_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club Members
CREATE TABLE IF NOT EXISTS public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.reading_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Discussion Forums
CREATE TABLE IF NOT EXISTS public.discussion_forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  club_id UUID REFERENCES public.reading_clubs(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion Replies
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID NOT NULL REFERENCES public.discussion_forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Events
CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  club_id UUID REFERENCES public.reading_clubs(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  participant_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Participants
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rsvp_status TEXT DEFAULT 'going',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- User Reputation
CREATE TABLE IF NOT EXISTS public.user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  reputation_points INTEGER DEFAULT 0,
  contribution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 11: MONETIZATION
-- ============================================================================

-- User Wallets
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coin Transactions
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  billing_period TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Unlocks
CREATE TABLE IF NOT EXISTS public.content_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  price_paid INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- Offline Downloads
CREATE TABLE IF NOT EXISTS public.offline_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, story_id)
);

-- ============================================================================
-- STEP 12: AI & NARRATIVE ENGINE TABLES
-- ============================================================================

-- AI Generations (for tracking)
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL,
  prompt TEXT,
  result TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reader Story Sessions (AI Companion)
CREATE TABLE IF NOT EXISTS public.reader_story_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  current_chapter INTEGER DEFAULT 1,
  session_data JSONB DEFAULT '{}',
  companion_memory JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Reader Choice History
CREATE TABLE IF NOT EXISTS public.reader_choice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.reader_story_sessions(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  choice_text TEXT NOT NULL,
  choice_result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic Story Branches
CREATE TABLE IF NOT EXISTS public.dynamic_story_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  parent_chapter INTEGER,
  branch_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Series
CREATE TABLE IF NOT EXISTS public.story_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  premise TEXT,
  genre TEXT NOT NULL,
  subgenres TEXT[] DEFAULT '{}',
  target_book_count INTEGER DEFAULT 1,
  current_book_count INTEGER DEFAULT 0,
  series_status TEXT DEFAULT 'planning',
  primary_themes TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Series Books
CREATE TABLE IF NOT EXISTS public.series_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  book_premise TEXT,
  status TEXT DEFAULT 'planning',
  target_word_count INTEGER,
  current_word_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, book_number)
);

-- Persistent Characters
CREATE TABLE IF NOT EXISTS public.persistent_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT,
  character_type TEXT DEFAULT 'supporting',
  status TEXT DEFAULT 'active',
  biography TEXT,
  physical_description JSONB DEFAULT '{}',
  personality_traits TEXT[] DEFAULT '{}',
  abilities TEXT[] DEFAULT '{}',
  relationships JSONB DEFAULT '[]',
  first_appearance_book INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character Events
CREATE TABLE IF NOT EXISTS public.character_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES public.persistent_characters(id) ON DELETE CASCADE NOT NULL,
  book_number INTEGER NOT NULL,
  chapter_number INTEGER,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  impact_level TEXT DEFAULT 'minor',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character Book States
CREATE TABLE IF NOT EXISTS public.character_book_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES public.persistent_characters(id) ON DELETE CASCADE NOT NULL,
  book_number INTEGER NOT NULL,
  state_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, book_number)
);

-- World Elements
CREATE TABLE IF NOT EXISTS public.world_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  element_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  properties JSONB DEFAULT '{}',
  relationships JSONB DEFAULT '[]',
  first_mentioned_book INTEGER DEFAULT 1,
  canon_level TEXT DEFAULT 'soft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Narrative Arcs
CREATE TABLE IF NOT EXISTS public.narrative_arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  arc_name TEXT NOT NULL,
  arc_type TEXT NOT NULL,
  arc_status TEXT DEFAULT 'setup',
  description TEXT,
  start_book INTEGER,
  end_book INTEGER,
  key_events JSONB DEFAULT '[]',
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canon Rules
CREATE TABLE IF NOT EXISTS public.canon_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  lock_level TEXT DEFAULT 'soft',
  applies_to JSONB DEFAULT '[]',
  exceptions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canon Violations
CREATE TABLE IF NOT EXISTS public.canon_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  rule_id UUID REFERENCES public.canon_rules(id) ON DELETE CASCADE,
  violation_description TEXT NOT NULL,
  detected_in_book INTEGER,
  detected_in_chapter INTEGER,
  severity TEXT DEFAULT 'warning',
  resolution_status TEXT DEFAULT 'pending',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Continuity Notes
CREATE TABLE IF NOT EXISTS public.continuity_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  note_type TEXT NOT NULL,
  description TEXT NOT NULL,
  related_elements JSONB DEFAULT '[]',
  book_number INTEGER,
  chapter_number INTEGER,
  is_resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 13: GLOBAL STORY & DONATIONS
-- ============================================================================

-- Global Stories
CREATE TABLE IF NOT EXISTS public.global_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  theme TEXT,
  starting_premise TEXT NOT NULL,
  current_content TEXT NOT NULL DEFAULT '',
  chapter_count INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,
  unique_contributors INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Global Story Chapters
CREATE TABLE IF NOT EXISTS public.global_story_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_story_id UUID NOT NULL REFERENCES public.global_stories(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  ai_generated_choices JSONB DEFAULT '[]',
  winning_action_id UUID,
  winning_action_text TEXT,
  votes_tallied BOOLEAN DEFAULT FALSE,
  voting_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(global_story_id, chapter_number)
);

-- Global Story Actions
CREATE TABLE IF NOT EXISTS public.global_story_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_story_id UUID NOT NULL REFERENCES public.global_stories(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.global_story_chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_text TEXT NOT NULL,
  preset_choice_index INTEGER,
  vote_count INTEGER DEFAULT 1,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(global_story_id, chapter_id, user_id)
);

-- Global Story Action Votes
CREATE TABLE IF NOT EXISTS public.global_story_action_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES public.global_story_actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(action_id, user_id)
);

-- Global Story User Cooldowns
CREATE TABLE IF NOT EXISTS public.global_story_user_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_story_id UUID NOT NULL REFERENCES public.global_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_action_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_contributions INTEGER DEFAULT 1,
  UNIQUE(global_story_id, user_id)
);

-- Donation Tiers
CREATE TABLE IF NOT EXISTS public.donation_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  min_amount INTEGER NOT NULL,
  max_amount INTEGER,
  badge_icon TEXT,
  badge_name TEXT,
  perks JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  tier_id UUID REFERENCES public.donation_tiers(id) ON DELETE SET NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Donation Badges
CREATE TABLE IF NOT EXISTS public.user_donation_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.donation_tiers(id) ON DELETE CASCADE,
  total_donated INTEGER DEFAULT 0,
  badge_earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tier_id)
);

-- Donation Leaderboard (materialized view as table)
CREATE TABLE IF NOT EXISTS public.donation_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_donated INTEGER DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  highest_tier_id UUID REFERENCES public.donation_tiers(id) ON DELETE SET NULL,
  last_donation_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 14: PUSH NOTIFICATIONS
-- ============================================================================

-- Push Subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  story_updates BOOLEAN DEFAULT true,
  social_notifications BOOLEAN DEFAULT true,
  marketing BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Notifications
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 15: ENGAGEMENT METRICS
-- ============================================================================

-- User Engagement Metrics
CREATE TABLE IF NOT EXISTS public.user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story NPCs
CREATE TABLE IF NOT EXISTS public.story_npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  npc_name TEXT NOT NULL,
  npc_role TEXT,
  personality_traits TEXT[] DEFAULT '{}',
  base_dialogue_style TEXT,
  base_knowledge JSONB DEFAULT '{}',
  first_appears_chapter INTEGER DEFAULT 1,
  last_appears_chapter INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPC Memory
CREATE TABLE IF NOT EXISTS public.npc_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npc_id UUID NOT NULL REFERENCES public.story_npcs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  memory_content TEXT NOT NULL,
  chapter_number INTEGER,
  importance_score INTEGER DEFAULT 5,
  relationship_delta INTEGER DEFAULT 0,
  relationship_type TEXT,
  cumulative_relationship_score INTEGER DEFAULT 0,
  revealed_traits TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pacing Adjustments
CREATE TABLE IF NOT EXISTS public.pacing_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  adjustment_type TEXT NOT NULL,
  engagement_trigger TEXT NOT NULL,
  adjustment_data JSONB DEFAULT '{}',
  generated_content TEXT,
  prompt_used TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 16: CREATE ALL INDEXES
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON public.user_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_tier ON public.users(tier);

-- Story indexes
CREATE INDEX IF NOT EXISTS idx_stories_genre ON public.stories(genre);
CREATE INDEX IF NOT EXISTS idx_stories_status ON public.stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_author ON public.stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_is_featured ON public.stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_stories_is_premium ON public.stories(is_premium);
CREATE INDEX IF NOT EXISTS idx_stories_play_count ON public.stories(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_stories_is_published ON public.stories(is_published);

-- Progress indexes
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_user ON public.user_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_story ON public.user_reading_progress(story_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON public.reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_story_id ON public.reading_progress(story_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_reading_streaks_user_id ON public.reading_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_calendar_user_date ON public.reading_calendar(user_id, read_date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(challenge_date);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_story_reviews_story ON public.story_reviews(story_id);
CREATE INDEX IF NOT EXISTS idx_user_friendships_user ON public.user_friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_user ON public.story_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_story ON public.story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON public.activity_feed(user_id);

-- Messaging indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_reading_clubs_creator ON public.reading_clubs(creator_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON public.club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_discussion_forums_category ON public.discussion_forums(category);
CREATE INDEX IF NOT EXISTS idx_community_events_start_time ON public.community_events(start_time);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON public.announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_target ON public.announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_dismissed_announcements_user ON public.dismissed_announcements(user_id);

-- AI/Narrative indexes
CREATE INDEX IF NOT EXISTS idx_story_series_author ON public.story_series(author_id);
CREATE INDEX IF NOT EXISTS idx_series_books_series ON public.series_books(series_id);
CREATE INDEX IF NOT EXISTS idx_persistent_characters_series ON public.persistent_characters(series_id);
CREATE INDEX IF NOT EXISTS idx_world_elements_series ON public.world_elements(series_id);
CREATE INDEX IF NOT EXISTS idx_narrative_arcs_series ON public.narrative_arcs(series_id);

-- Global story indexes
CREATE INDEX IF NOT EXISTS idx_global_stories_status ON public.global_stories(status);
CREATE INDEX IF NOT EXISTS idx_global_chapters_story ON public.global_story_chapters(global_story_id);
CREATE INDEX IF NOT EXISTS idx_global_actions_chapter ON public.global_story_actions(chapter_id);

-- ============================================================================
-- STEP 17: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- ============================================================================
-- STEP 18: RLS POLICIES
-- ============================================================================

-- User Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users (alternate)
DROP POLICY IF EXISTS "Public users viewable" ON public.users;
CREATE POLICY "Public users viewable" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own" ON public.users;
CREATE POLICY "Users can manage own" ON public.users FOR ALL USING (auth.uid() = id);

-- Stories
DROP POLICY IF EXISTS "Anyone can view published stories" ON public.stories;
CREATE POLICY "Anyone can view published stories" ON public.stories FOR SELECT USING (status = 'published' OR is_published = true);
DROP POLICY IF EXISTS "Authors can manage own stories" ON public.stories;
CREATE POLICY "Authors can manage own stories" ON public.stories FOR ALL USING (auth.uid() = author_id);

-- Story Chapters
DROP POLICY IF EXISTS "Anyone can view chapters" ON public.story_chapters;
CREATE POLICY "Anyone can view chapters" ON public.story_chapters FOR SELECT USING (true);

-- Chapters
DROP POLICY IF EXISTS "Anyone can view chapter content" ON public.chapters;
CREATE POLICY "Anyone can view chapter content" ON public.chapters FOR SELECT USING (true);

-- Story Choices
DROP POLICY IF EXISTS "Anyone can view choices" ON public.story_choices;
CREATE POLICY "Anyone can view choices" ON public.story_choices FOR SELECT USING (true);

-- Choices
DROP POLICY IF EXISTS "Anyone can view choice options" ON public.choices;
CREATE POLICY "Anyone can view choice options" ON public.choices FOR SELECT USING (true);

-- Reading Progress (all variants)
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_reading_progress;
CREATE POLICY "Users can view own progress" ON public.user_reading_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_reading_progress;
CREATE POLICY "Users can manage own progress" ON public.user_reading_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own reading_progress" ON public.reading_progress;
CREATE POLICY "Users view own reading_progress" ON public.reading_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own reading_progress" ON public.reading_progress;
CREATE POLICY "Users manage own reading_progress" ON public.reading_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own user_progress" ON public.user_progress;
CREATE POLICY "Users view own user_progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own user_progress" ON public.user_progress;
CREATE POLICY "Users manage own user_progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- User Preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- User Levels
DROP POLICY IF EXISTS "Users can view all levels" ON public.user_levels;
CREATE POLICY "Users can view all levels" ON public.user_levels FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own level" ON public.user_levels;
CREATE POLICY "Users can manage own level" ON public.user_levels FOR ALL USING (auth.uid() = user_id);

-- Achievements
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlock achievements" ON public.user_achievements;
CREATE POLICY "Users can unlock achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges
DROP POLICY IF EXISTS "Anyone can view badges" ON public.user_badges;
CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can earn badges" ON public.user_badges;
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reading Streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON public.reading_streaks;
CREATE POLICY "Users can view own streaks" ON public.reading_streaks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own streaks" ON public.reading_streaks;
CREATE POLICY "Users can manage own streaks" ON public.reading_streaks FOR ALL USING (auth.uid() = user_id);

-- Daily/Weekly challenges
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.daily_challenges;
CREATE POLICY "Anyone can view challenges" ON public.daily_challenges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can view weekly challenges" ON public.weekly_challenges;
CREATE POLICY "Anyone can view weekly challenges" ON public.weekly_challenges FOR SELECT USING (true);

-- Friendships
DROP POLICY IF EXISTS "Users can view friendships" ON public.user_friendships;
CREATE POLICY "Users can view friendships" ON public.user_friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
DROP POLICY IF EXISTS "Users can manage friendships" ON public.user_friendships;
CREATE POLICY "Users can manage friendships" ON public.user_friendships FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own friendships alt" ON public.friendships;
CREATE POLICY "Users view own friendships alt" ON public.friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
DROP POLICY IF EXISTS "Users manage own friendships alt" ON public.friendships;
CREATE POLICY "Users manage own friendships alt" ON public.friendships FOR ALL USING (auth.uid() = user_id);

-- Reviews and Likes
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.story_reviews;
CREATE POLICY "Anyone can view reviews" ON public.story_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own reviews" ON public.story_reviews;
CREATE POLICY "Users can manage own reviews" ON public.story_reviews FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view likes" ON public.story_likes;
CREATE POLICY "Anyone can view likes" ON public.story_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own likes" ON public.story_likes;
CREATE POLICY "Users can manage own likes" ON public.story_likes FOR ALL USING (auth.uid() = user_id);

-- Conversations & Messages
DROP POLICY IF EXISTS "Users view their conversations" ON public.conversations;
CREATE POLICY "Users view their conversations" ON public.conversations FOR SELECT USING (auth.uid() = ANY(participants));
DROP POLICY IF EXISTS "Users create conversations" ON public.conversations;
CREATE POLICY "Users create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = ANY(participants));
DROP POLICY IF EXISTS "Users update conversations" ON public.conversations;
CREATE POLICY "Users update conversations" ON public.conversations FOR UPDATE USING (auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "Users view messages in conversations" ON public.messages;
CREATE POLICY "Users view messages in conversations" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND auth.uid() = ANY(participants)));
DROP POLICY IF EXISTS "Users send messages" ON public.messages;
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users update own messages" ON public.messages;
CREATE POLICY "Users update own messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Announcements
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Community
DROP POLICY IF EXISTS "Public clubs viewable" ON public.reading_clubs;
CREATE POLICY "Public clubs viewable" ON public.reading_clubs FOR SELECT USING (is_private = false OR creator_id = auth.uid());
DROP POLICY IF EXISTS "Creators manage clubs" ON public.reading_clubs;
CREATE POLICY "Creators manage clubs" ON public.reading_clubs FOR ALL USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Anyone view forums" ON public.discussion_forums;
CREATE POLICY "Anyone view forums" ON public.discussion_forums FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users create forums" ON public.discussion_forums;
CREATE POLICY "Users create forums" ON public.discussion_forums FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Public events viewable" ON public.community_events;
CREATE POLICY "Public events viewable" ON public.community_events FOR SELECT USING (is_public = true);

-- Monetization
DROP POLICY IF EXISTS "Users view own wallet" ON public.user_wallets;
CREATE POLICY "Users view own wallet" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own transactions" ON public.coin_transactions;
CREATE POLICY "Users view own transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own subscription" ON public.subscriptions;
CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Activity Feed
DROP POLICY IF EXISTS "Users view activity" ON public.activity_feed;
CREATE POLICY "Users view activity" ON public.activity_feed FOR SELECT USING (is_public = true OR auth.uid() = user_id);
DROP POLICY IF EXISTS "Users create activity" ON public.activity_feed;
CREATE POLICY "Users create activity" ON public.activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI Sessions
DROP POLICY IF EXISTS "Users manage own sessions" ON public.reader_story_sessions;
CREATE POLICY "Users manage own sessions" ON public.reader_story_sessions FOR ALL USING (auth.uid() = user_id);

-- Story Series
DROP POLICY IF EXISTS "Anyone view published series" ON public.story_series;
CREATE POLICY "Anyone view published series" ON public.story_series FOR SELECT USING (is_published = true OR auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors manage series" ON public.story_series;
CREATE POLICY "Authors manage series" ON public.story_series FOR ALL USING (auth.uid() = author_id);

-- Global Stories
DROP POLICY IF EXISTS "Anyone view global stories" ON public.global_stories;
CREATE POLICY "Anyone view global stories" ON public.global_stories FOR SELECT USING (status != 'draft' OR created_by = auth.uid());

-- Donations
DROP POLICY IF EXISTS "Anyone view donation tiers" ON public.donation_tiers;
CREATE POLICY "Anyone view donation tiers" ON public.donation_tiers FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Users view own donations" ON public.donations;
CREATE POLICY "Users view own donations" ON public.donations FOR SELECT USING (auth.uid() = user_id OR is_anonymous = false);

-- ============================================================================
-- STEP 19: HELPER FUNCTIONS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update story rating function
CREATE OR REPLACE FUNCTION public.update_story_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stories
  SET rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.story_reviews WHERE story_id = NEW.story_id),
      average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.story_reviews WHERE story_id = NEW.story_id),
      review_count = (SELECT COUNT(*) FROM public.story_reviews WHERE story_id = NEW.story_id),
      updated_at = NOW()
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user_profiles entry
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create users entry
  INSERT INTO public.users (id, username, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create related records
  INSERT INTO public.user_levels (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.reading_streaks (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_reputation (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 20: CREATE TRIGGERS
-- ============================================================================

-- Auto-create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update rating trigger
DROP TRIGGER IF EXISTS update_story_rating_trigger ON public.story_reviews;
CREATE TRIGGER update_story_rating_trigger
  AFTER INSERT OR UPDATE ON public.story_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_story_rating();

-- Updated_at triggers for main tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('user_profiles', 'users', 'stories', 'reading_streaks', 'conversations', 'messages', 'user_preferences', 'subscriptions', 'reading_clubs', 'story_series')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- ============================================================================
-- STEP 21: SAMPLE DATA
-- ============================================================================

-- Sample Achievements
INSERT INTO public.achievements (name, description, category, icon, xp_reward, rarity, is_hidden)
VALUES
  ('First Steps', 'Read your first story', 'reading', '📖', 50, 'common', false),
  ('Bookworm', 'Complete 10 stories', 'reading', '📚', 200, 'uncommon', false),
  ('Speed Reader', 'Read 5 stories in a week', 'reading', '⚡', 300, 'rare', false),
  ('Story Master', 'Complete 50 stories', 'reading', '👑', 1000, 'legendary', false),
  ('Social Butterfly', 'Add 10 friends', 'social', '🦋', 150, 'uncommon', false),
  ('Streak Starter', 'Maintain a 7-day streak', 'streak', '🔥', 100, 'common', false),
  ('Streak Legend', 'Maintain a 30-day streak', 'streak', '💎', 500, 'epic', false),
  ('Collector', 'Add 25 stories to your reading list', 'collector', '⭐', 175, 'uncommon', false),
  ('Explorer', 'Read stories from 5 different genres', 'explorer', '🧭', 250, 'rare', false),
  ('Night Owl', 'Read for 2 hours after midnight', 'special', '🦉', 100, 'uncommon', true)
ON CONFLICT (name) DO NOTHING;

-- Sample Stories
INSERT INTO public.stories (id, title, description, cover_image_url, genre, difficulty, estimated_duration, is_premium, total_chapters, status, is_featured, is_published)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'The Enchanted Forest Mystery', 'Unravel ancient secrets in a magical woodland where every choice shapes reality', 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f', 'fantasy', 'beginner', 45, false, 12, 'published', true, true),
  ('22222222-2222-2222-2222-222222222222', 'Cyber Nexus 2077', 'Navigate a dystopian future where your decisions determine humanity''s fate', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f', 'sci-fi', 'advanced', 90, true, 20, 'published', true, true),
  ('33333333-3333-3333-3333-333333333333', 'Murder at Moonlight Manor', 'Solve a classic whodunit in an isolated Victorian estate', 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6', 'mystery', 'intermediate', 60, false, 15, 'published', false, true),
  ('44444444-4444-4444-4444-444444444444', 'Hearts in the Highlands', 'A romantic adventure through the Scottish countryside', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 'romance', 'beginner', 50, false, 14, 'published', false, true),
  ('55555555-5555-5555-5555-555555555555', 'The Cursed Lighthouse', 'Face supernatural horrors in an abandoned coastal beacon', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'horror', 'advanced', 75, true, 18, 'published', true, true),
  ('66666666-6666-6666-6666-666666666666', 'Pirates of the Crimson Tide', 'Sail the high seas in search of legendary treasure', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 'adventure', 'intermediate', 80, false, 16, 'published', false, true)
ON CONFLICT (id) DO NOTHING;

-- Sample Story Chapters
INSERT INTO public.story_chapters (id, story_id, chapter_number, title, content)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 1, 'The Mysterious Path', 'You stand at the edge of the Enchanted Forest, sunlight filtering through ancient trees. A worn path splits into two directions. The left path glows with warm golden light, while the right path descends into mysterious shadows. Strange whispers seem to call from both directions...'),
  ('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 2, 'The Hidden Glade', 'Following the sunlit path, you discover a secret glade where magical creatures gather. Tiny fairies dance in beams of light, while a majestic unicorn drinks from a crystal-clear pond. They seem to notice your presence...'),
  ('c3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 3, 'The Dark Woods', 'The shadowy path leads deeper into ancient, twisted woods. Strange glowing fungi light your way as you hear distant howling. An old stone altar stands ahead, covered in mysterious runes...')
ON CONFLICT (story_id, chapter_number) DO NOTHING;

-- Sample Chapters (alternate table)
INSERT INTO public.chapters (id, story_id, chapter_number, title, content, choices)
VALUES
  ('ch111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 1, 'The Mysterious Path', 'You stand at the edge of the Enchanted Forest, sunlight filtering through ancient trees.', '[{"text": "Take the sunlit path", "nextChapter": 2}, {"text": "Enter the shadows", "nextChapter": 3}]')
ON CONFLICT (story_id, chapter_number) DO NOTHING;

-- Sample Choices
INSERT INTO public.story_choices (chapter_id, choice_text, consequence_text, next_chapter_id, choice_order)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Take the sunlit left path', 'You feel drawn to the light and warmth', 'c2222222-2222-2222-2222-222222222222', 1),
  ('c1111111-1111-1111-1111-111111111111', 'Venture down the shadowy right path', 'Curiosity pulls you toward the unknown', 'c3333333-3333-3333-3333-333333333333', 2)
ON CONFLICT DO NOTHING;

-- Sample Donation Tiers
INSERT INTO public.donation_tiers (name, description, min_amount, badge_icon, badge_name, perks, sort_order)
VALUES
  ('Supporter', 'Thank you for your support!', 500, '💝', 'Supporter Badge', '["Special supporter badge", "Name in credits"]', 1),
  ('Champion', 'You are a champion of stories!', 2000, '🏆', 'Champion Badge', '["Champion badge", "Exclusive Discord role", "Name in credits"]', 2),
  ('Legend', 'A legendary supporter!', 5000, '👑', 'Legend Badge', '["Legend badge", "All previous perks", "Early access to features", "Personal thank you"]', 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

SELECT '✅ StxryAI COMPLETE database setup finished!' AS status;
SELECT 'Tables created: ' || COUNT(*)::TEXT || ' tables' AS info FROM pg_tables WHERE schemaname = 'public';

