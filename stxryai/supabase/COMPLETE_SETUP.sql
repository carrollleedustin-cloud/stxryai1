-- ============================================
-- STXRYAI COMPLETE DATABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better search

-- ============================================
-- CORE TABLES
-- ============================================

-- User Profiles Table (Extended)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'lifetime')),
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  daily_choice_limit INTEGER DEFAULT 50,
  daily_choices_used INTEGER DEFAULT 0,
  last_choice_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories Table (Extended)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  genre TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('beginner', 'medium', 'advanced')),
  tags TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  estimated_duration INTEGER, -- in minutes
  content_maturity TEXT DEFAULT 'everyone' CHECK (content_maturity IN ('everyone', 'teen', 'mature')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Chapters Table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  choices JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, chapter_number)
);

-- Reading Progress Table (Extended)
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  current_chapter INTEGER DEFAULT 0,
  current_choice_path JSONB DEFAULT '[]',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  choices_made INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  bookmark_data JSONB DEFAULT '{}',
  UNIQUE(user_id, story_id)
);

-- User Activity Table (Extended)
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'story_started', 'story_completed', 'chapter_read', 'choice_made',
    'story_liked', 'story_bookmarked', 'review_posted', 'achievement_unlocked',
    'level_up', 'friend_added', 'story_shared', 'comment_posted'
  )),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- GAMIFICATION TABLES
-- ============================================

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT DEFAULT 'general',
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('xp', 'stories_completed', 'reading_time', 'choices_made')),
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  period TEXT DEFAULT 'all_time' CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
  period_start DATE,
  period_end DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

-- ============================================
-- SOCIAL FEATURES TABLES
-- ============================================

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  is_spoiler BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Story Likes Table
CREATE TABLE IF NOT EXISTS story_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Story Bookmarks Table
CREATE TABLE IF NOT EXISTS story_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  folder TEXT DEFAULT 'default',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'story_update', 'comment_reply', 'like', 'follow', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  icon TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view any profile" ON user_profiles;
CREATE POLICY "Users can view any profile"
  ON user_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Stories Policies
DROP POLICY IF EXISTS "Published stories are viewable by everyone" ON stories;
CREATE POLICY "Published stories are viewable by everyone"
  ON stories FOR SELECT
  USING (is_published = true OR auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can insert own stories" ON stories;
CREATE POLICY "Authors can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own stories" ON stories;
CREATE POLICY "Authors can update own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete own stories" ON stories;
CREATE POLICY "Authors can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = author_id);

-- Chapters Policies
DROP POLICY IF EXISTS "Published story chapters are viewable" ON chapters;
CREATE POLICY "Published story chapters are viewable"
  ON chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND (stories.is_published = true OR stories.author_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authors can manage own story chapters" ON chapters;
CREATE POLICY "Authors can manage own story chapters"
  ON chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.author_id = auth.uid()
    )
  );

-- Reading Progress Policies
DROP POLICY IF EXISTS "Users can manage own reading progress" ON reading_progress;
CREATE POLICY "Users can manage own reading progress"
  ON reading_progress FOR ALL
  USING (auth.uid() = user_id);

-- User Activity Policies
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
CREATE POLICY "Users can view own activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity;
CREATE POLICY "Users can insert own activity"
  ON user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Achievements Policies
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- User Achievements Policies
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view others achievements" ON user_achievements;
CREATE POLICY "Users can view others achievements"
  ON user_achievements FOR SELECT
  USING (true);

-- Leaderboard Policies
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON leaderboard;
CREATE POLICY "Leaderboard is viewable by everyone"
  ON leaderboard FOR SELECT
  USING (true);

-- Comments Policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Reviews Policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage own reviews" ON reviews;
CREATE POLICY "Users can manage own reviews"
  ON reviews FOR ALL
  USING (auth.uid() = user_id);

-- Story Likes Policies
DROP POLICY IF EXISTS "Story likes are viewable by everyone" ON story_likes;
CREATE POLICY "Story likes are viewable by everyone"
  ON story_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON story_likes;
CREATE POLICY "Users can manage own likes"
  ON story_likes FOR ALL
  USING (auth.uid() = user_id);

-- Story Bookmarks Policies
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON story_bookmarks;
CREATE POLICY "Users can manage own bookmarks"
  ON story_bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_genre ON stories(genre);
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published);
CREATE INDEX IF NOT EXISTS idx_stories_featured ON stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_stories_rating ON stories(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chapters_story ON chapters(story_id, chapter_number);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_story ON reading_progress(story_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON reading_progress(last_read_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category_rank ON leaderboard(category, rank);

CREATE INDEX IF NOT EXISTS idx_comments_story ON comments(story_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_story ON reviews(story_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_story_likes_story ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_bookmarks_user ON story_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_stories_title_search ON stories USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_stories_description_search ON stories USING gin(to_tsvector('english', description));

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily choices
CREATE OR REPLACE FUNCTION reset_daily_choices()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET daily_choices_used = 0,
      last_choice_reset_date = CURRENT_DATE
  WHERE last_choice_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to update story stats on like
CREATE OR REPLACE FUNCTION update_story_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET like_count = like_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET like_count = like_count - 1 WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS story_like_count_trigger ON story_likes;
CREATE TRIGGER story_like_count_trigger
  AFTER INSERT OR DELETE ON story_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_like_count();

-- Function to update story bookmark count
CREATE OR REPLACE FUNCTION update_story_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET bookmark_count = bookmark_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET bookmark_count = bookmark_count - 1 WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS story_bookmark_count_trigger ON story_bookmarks;
CREATE TRIGGER story_bookmark_count_trigger
  AFTER INSERT OR DELETE ON story_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_story_bookmark_count();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert some default achievements
INSERT INTO achievements (code, name, description, icon, category, xp_reward, rarity) VALUES
  ('first_story', 'Story Starter', 'Complete your first story', 'BookOpenIcon', 'reading', 100, 'common'),
  ('ten_stories', 'Bookworm', 'Complete 10 stories', 'BookmarkIcon', 'reading', 500, 'rare'),
  ('speed_reader', 'Speed Reader', 'Complete a story in under 30 minutes', 'BoltIcon', 'reading', 200, 'rare'),
  ('choice_maker', 'Decision Maker', 'Make 100 choices', 'CheckCircleIcon', 'engagement', 300, 'common'),
  ('reviewer', 'Critic', 'Leave 5 reviews', 'StarIcon', 'social', 150, 'common'),
  ('social_butterfly', 'Social Butterfly', 'Comment on 20 stories', 'ChatBubbleLeftIcon', 'social', 250, 'rare')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 'Database schema setup complete!' AS status;
