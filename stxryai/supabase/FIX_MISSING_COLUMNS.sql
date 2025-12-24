-- ============================================
-- FIX: Add missing columns to existing tables
-- Run this if you get "column does not exist" errors
-- ============================================

-- Check if reading_clubs table exists and add missing columns
ALTER TABLE IF EXISTS reading_clubs
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Check if stories table exists and add missing columns
ALTER TABLE IF EXISTS stories
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS genre TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Check if live_events table exists and add missing columns
ALTER TABLE IF EXISTS live_events
ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS event_type TEXT,
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Check if club_members table exists and add missing columns
ALTER TABLE IF EXISTS club_members
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES reading_clubs(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member',
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- Check if story_likes table exists and add missing columns
ALTER TABLE IF EXISTS story_likes
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Check if story_bookmarks table exists and add missing columns
ALTER TABLE IF EXISTS story_bookmarks
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Check if user_follows table exists and add missing columns
ALTER TABLE IF EXISTS user_follows
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Check if messages table exists and add missing columns
ALTER TABLE IF EXISTS messages
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Check if event_registrations table exists and add missing columns
ALTER TABLE IF EXISTS event_registrations
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES live_events(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_reading_clubs_category ON reading_clubs(category);
CREATE INDEX IF NOT EXISTS idx_reading_clubs_created_by ON reading_clubs(created_by);
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_genre ON stories(genre);
CREATE INDEX IF NOT EXISTS idx_stories_is_published ON stories(is_published);
CREATE INDEX IF NOT EXISTS idx_story_likes_user_id ON story_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- Verify tables exist
SELECT 
  table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reading_clubs') as reading_clubs_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'club_members') as club_members_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stories') as stories_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'story_likes') as story_likes_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_follows') as user_follows_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') as messages_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_events') as live_events_exists
FROM information_schema.tables
WHERE table_schema = 'public'
LIMIT 1;
