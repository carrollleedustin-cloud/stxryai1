-- ============================================================================
-- STXRYAI MASTER DATABASE SETUP - COMPLETE UNIFIED VERSION
-- ============================================================================
-- Version: 3.0.0 | Date: December 23, 2024
-- 
-- This is the COMPREHENSIVE unified setup combining:
-- - CREATE_ALL_TABLES.sql
-- - COMPLETE_FRESH_SETUP.sql
-- - All migrations up to December 2024
-- - Persistent Narrative Engine
-- - Global Story & Donations
-- - Monetization & Discovery
-- 
-- Run this ONCE in a fresh Supabase project SQL Editor.
-- ============================================================================

-- ============================================================================
-- PART 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PART 2: ALL ENUMS (Custom Types)
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
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prompt_category') THEN
    CREATE TYPE prompt_category AS ENUM ('contextual', 'dynamic', 'procedural', 'branching');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_generation_type') THEN
    CREATE TYPE content_generation_type AS ENUM ('item_description', 'ambient_event', 'lore_fragment', 'background_character', 'environment_detail');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_category') THEN
    CREATE TYPE theme_category AS ENUM ('color_palette', 'typography', 'layout', 'animation', 'genre_atmosphere');
  END IF;

END $$;

-- ============================================================================
-- PART 3: CORE USER TABLES
-- ============================================================================

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'free',
  role TEXT DEFAULT 'user',
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_reading_time INTEGER DEFAULT 0,
  stories_completed INTEGER DEFAULT 0,
  choices_made INTEGER DEFAULT 0,
  daily_choice_limit INTEGER DEFAULT 50,
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
-- PART 4: STORY TABLES
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
  completion_rate DECIMAL(5,2) DEFAULT 0,
  content_maturity TEXT DEFAULT 'everyone',
  language TEXT DEFAULT 'en',
  premium_price INTEGER DEFAULT 0,
  content JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Story Chapters
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

-- Chapters (alternate table)
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
  name TEXT NOT NULL,
  title TEXT,
  description TEXT NOT NULL,
  genre TEXT NOT NULL,
  sub_genre TEXT,
  thumbnail TEXT,
  preview_image TEXT,
  difficulty TEXT DEFAULT 'medium',
  estimated_length TEXT DEFAULT 'medium',
  estimated_chapters INTEGER DEFAULT 10,
  estimated_duration INTEGER DEFAULT 60,
  structure JSONB DEFAULT '{}',
  characters JSONB DEFAULT '[]',
  world_elements JSONB DEFAULT '[]',
  plot_points JSONB DEFAULT '[]',
  template_data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_by TEXT DEFAULT 'stxryai',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
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
  like_count INTEGER DEFAULT 0,
  is_spoiler BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 5: USER PROGRESS & ACTIVITY
-- ============================================================================

-- User Reading Progress
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

-- Story Bookmarks
CREATE TABLE IF NOT EXISTS public.story_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  folder TEXT DEFAULT 'default',
  notes TEXT,
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
-- PART 6: GAMIFICATION TABLES
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

-- Leaderboard
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  period TEXT DEFAULT 'all_time',
  period_start DATE,
  period_end DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, period)
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
  streak_start_date DATE,
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
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

-- Monthly Challenges
CREATE TABLE IF NOT EXISTS public.monthly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_month DATE NOT NULL,
  challenge_type TEXT NOT NULL,
  challenge_data JSONB DEFAULT '{}',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_xp INTEGER DEFAULT 0,
  reward_badge TEXT,
  reward_title TEXT,
  difficulty TEXT DEFAULT 'medium',
  is_featured BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_month, challenge_type)
);

-- User Monthly Challenges
CREATE TABLE IF NOT EXISTS public.user_monthly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.monthly_challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,
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

-- Community Competitions
CREATE TABLE IF NOT EXISTS public.community_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  competition_type TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  voting_end_date TIMESTAMPTZ,
  requirements JSONB DEFAULT '{}',
  rewards JSONB DEFAULT '{}',
  participant_count INTEGER DEFAULT 0,
  submission_count INTEGER DEFAULT 0,
  cover_image_url TEXT,
  banner_image_url TEXT,
  created_by UUID,
  is_official BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competition Participants
CREATE TABLE IF NOT EXISTS public.competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.community_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_data JSONB DEFAULT '{}',
  submission_ids UUID[] DEFAULT '{}',
  score INTEGER DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

-- Competition Leaderboard
CREATE TABLE IF NOT EXISTS public.competition_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.community_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  user_display_name TEXT,
  user_avatar_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

-- Continue in next section...
-- See STXRYAI_MASTER_SETUP_PART2.sql for remaining tables

SELECT 'Part 1 Complete: Extensions, Enums, Core User, Story, Progress, and Gamification tables created.' AS status;


