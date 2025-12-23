-- ============================================================================
-- STXRYAI MASTER DATABASE SETUP - PART 5
-- ============================================================================
-- TTS, Live Events, Community Stories, Moderation, GDPR, Indexes, RLS, Functions
-- Run after STXRYAI_MASTER_SETUP_PART4.sql
-- ============================================================================

-- ============================================================================
-- PART 21: TTS (Text-to-Speech)
-- ============================================================================

-- TTS Voices
CREATE TABLE IF NOT EXISTS public.tts_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_name TEXT NOT NULL,
  voice_id TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  gender TEXT,
  language_code TEXT DEFAULT 'en-US',
  accent TEXT,
  age_range TEXT,
  quality_tier TEXT DEFAULT 'standard',
  is_premium BOOLEAN DEFAULT false,
  is_character_voice BOOLEAN DEFAULT false,
  speed DECIMAL(3, 2) DEFAULT 1.0,
  pitch DECIMAL(3, 2) DEFAULT 1.0,
  stability DECIMAL(3, 2) DEFAULT 0.5,
  similarity_boost DECIMAL(3, 2) DEFAULT 0.5,
  sample_audio_url TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character Voices
CREATE TABLE IF NOT EXISTS public.character_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  voice_id UUID NOT NULL REFERENCES public.tts_voices(id) ON DELETE RESTRICT,
  custom_speed DECIMAL(3, 2),
  custom_pitch DECIMAL(3, 2),
  custom_stability DECIMAL(3, 2),
  custom_similarity_boost DECIMAL(3, 2),
  voice_description TEXT,
  emotion_mappings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, character_name)
);

-- Audio Generations
CREATE TABLE IF NOT EXISTS public.audio_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  text_content TEXT NOT NULL,
  voice_id UUID NOT NULL REFERENCES public.tts_voices(id) ON DELETE RESTRICT,
  character_name TEXT,
  audio_url TEXT,
  audio_duration_seconds DECIMAL(10, 2),
  audio_file_size_bytes INTEGER,
  audio_format TEXT DEFAULT 'mp3',
  speed DECIMAL(3, 2) DEFAULT 1.0,
  pitch DECIMAL(3, 2) DEFAULT 1.0,
  stability DECIMAL(3, 2) DEFAULT 0.5,
  similarity_boost DECIMAL(3, 2) DEFAULT 0.5,
  generation_status TEXT DEFAULT 'pending',
  error_message TEXT,
  provider TEXT NOT NULL,
  provider_job_id TEXT,
  provider_cost DECIMAL(10, 4),
  quality_score DECIMAL(3, 2),
  user_rating INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audio Playback Sessions
CREATE TABLE IF NOT EXISTS public.audio_playback_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  current_audio_id UUID REFERENCES public.audio_generations(id) ON DELETE SET NULL,
  playback_position_seconds DECIMAL(10, 2) DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  playback_speed DECIMAL(3, 2) DEFAULT 1.0,
  session_started_at TIMESTAMPTZ DEFAULT NOW(),
  last_played_at TIMESTAMPTZ,
  total_listen_time_seconds DECIMAL(10, 2) DEFAULT 0,
  auto_play_next BOOLEAN DEFAULT true,
  background_playback BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User TTS Preferences
CREATE TABLE IF NOT EXISTS public.user_tts_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_voice_id UUID REFERENCES public.tts_voices(id) ON DELETE SET NULL,
  default_speed DECIMAL(3, 2) DEFAULT 1.0,
  default_pitch DECIMAL(3, 2) DEFAULT 1.0,
  auto_play_enabled BOOLEAN DEFAULT false,
  background_playback_enabled BOOLEAN DEFAULT false,
  skip_silence BOOLEAN DEFAULT true,
  preferred_quality_tier TEXT DEFAULT 'standard',
  use_character_voices BOOLEAN DEFAULT true,
  premium_voices_enabled BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 22: LIVE EVENTS
-- ============================================================================

-- Live Events
CREATE TABLE IF NOT EXISTS public.live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  duration_minutes INTEGER,
  max_participants INTEGER,
  is_public BOOLEAN DEFAULT true,
  requires_registration BOOLEAN DEFAULT true,
  registration_deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  agenda JSONB DEFAULT '[]',
  resources JSONB DEFAULT '[]',
  recording_url TEXT,
  related_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  participant_count INTEGER DEFAULT 0,
  viewer_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_status TEXT DEFAULT 'registered',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  attendance_duration_minutes INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  comments_made INTEGER DEFAULT 0,
  participation_score DECIMAL(3, 2) DEFAULT 0,
  rating INTEGER,
  feedback_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Live Event Participants
CREATE TABLE IF NOT EXISTS public.live_event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_present BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'participant',
  is_muted BOOLEAN DEFAULT false,
  is_video_enabled BOOLEAN DEFAULT false,
  hand_raised BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Event Messages
CREATE TABLE IF NOT EXISTS public.event_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT DEFAULT 'chat',
  content TEXT NOT NULL,
  parent_message_id UUID REFERENCES public.event_messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  is_moderated BOOLEAN DEFAULT false,
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  reaction_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Questions
CREATE TABLE IF NOT EXISTS public.event_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
  questioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_status TEXT DEFAULT 'pending',
  answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  answer_text TEXT,
  answered_at TIMESTAMPTZ,
  upvote_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Polls
CREATE TABLE IF NOT EXISTS public.event_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_votes INTEGER DEFAULT 0,
  results JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll Responses
CREATE TABLE IF NOT EXISTS public.poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.event_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_option_index INTEGER NOT NULL,
  selected_option_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- ============================================================================
-- PART 23: COMMUNITY & COLLABORATIVE STORIES
-- ============================================================================

-- Community Stories
CREATE TABLE IF NOT EXISTS public.community_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE UNIQUE,
  story_type TEXT DEFAULT 'community',
  original_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  is_open_for_contributions BOOLEAN DEFAULT true,
  contribution_guidelines TEXT,
  moderation_level TEXT DEFAULT 'moderate',
  contributor_count INTEGER DEFAULT 0,
  chapter_count INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  completion_percentage DECIMAL(5, 2) DEFAULT 0,
  community_rating DECIMAL(3, 2) DEFAULT 0,
  community_rating_count INTEGER DEFAULT 0,
  discussion_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Contributions
CREATE TABLE IF NOT EXISTS public.story_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_story_id UUID NOT NULL REFERENCES public.community_stories(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  contribution_type TEXT NOT NULL,
  contribution_content TEXT,
  contribution_status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  quality_score DECIMAL(3, 2),
  community_votes INTEGER DEFAULT 0,
  community_rating DECIMAL(3, 2),
  words_added INTEGER DEFAULT 0,
  characters_added INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Remixes
CREATE TABLE IF NOT EXISTS public.story_remixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  remix_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE UNIQUE,
  remixer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  remix_type TEXT NOT NULL,
  remix_description TEXT,
  credits_original_author BOOLEAN DEFAULT true,
  remix_license TEXT DEFAULT 'remix',
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  similarity_score DECIMAL(3, 2),
  originality_score DECIMAL(3, 2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Forks
CREATE TABLE IF NOT EXISTS public.story_forks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  forked_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE UNIQUE,
  forker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fork_point_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  fork_reason TEXT,
  fork_description TEXT,
  credits_original BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  divergence_point INTEGER,
  chapters_added INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contribution Votes
CREATE TABLE IF NOT EXISTS public.contribution_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID NOT NULL REFERENCES public.story_contributions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT DEFAULT 'upvote',
  vote_weight INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contribution_id, voter_id)
);

-- ============================================================================
-- PART 24: CONTENT MODERATION
-- ============================================================================

-- AI Moderation Logs
CREATE TABLE IF NOT EXISTS public.ai_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_text TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  flagged BOOLEAN DEFAULT false,
  severity TEXT,
  confidence DECIMAL(3, 2),
  auto_action TEXT,
  detected_categories JSONB DEFAULT '{}',
  category_scores JSONB DEFAULT '{}',
  moderation_source TEXT DEFAULT 'openai',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation Queue
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, content_type)
);

-- Content Flags
CREATE TABLE IF NOT EXISTS public.content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  flag_value TEXT NOT NULL,
  severity TEXT DEFAULT 'low',
  auto_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation Statistics
CREATE TABLE IF NOT EXISTS public.moderation_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  content_type TEXT NOT NULL,
  total_checked INTEGER DEFAULT 0,
  flagged_count INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,
  reviewed_count INTEGER DEFAULT 0,
  false_positive_count INTEGER DEFAULT 0,
  category_counts JSONB DEFAULT '{}',
  avg_processing_time_ms INTEGER,
  api_calls_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, content_type)
);

-- ============================================================================
-- PART 25: GDPR COMPLIANCE
-- ============================================================================

-- User Consents
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consented BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  consent_version TEXT,
  withdrawn BOOLEAN DEFAULT false,
  withdrawn_date TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);

-- Data Export Requests
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  export_format TEXT DEFAULT 'json',
  include_types TEXT[] DEFAULT ARRAY['all'],
  file_url TEXT,
  file_size_bytes BIGINT,
  expires_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Deletion Requests
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  deletion_scope TEXT DEFAULT 'full',
  exclude_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  verification_token TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Privacy Settings
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_visibility TEXT DEFAULT 'public',
  show_reading_activity BOOLEAN DEFAULT true,
  show_achievements BOOLEAN DEFAULT true,
  show_followers BOOLEAN DEFAULT true,
  allow_data_sharing BOOLEAN DEFAULT false,
  allow_analytics BOOLEAN DEFAULT true,
  allow_personalization BOOLEAN DEFAULT true,
  show_in_search BOOLEAN DEFAULT true,
  show_email_in_search BOOLEAN DEFAULT false,
  allow_third_party_sharing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cookie Preferences
CREATE TABLE IF NOT EXISTS public.cookie_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  essential BOOLEAN DEFAULT true,
  analytics BOOLEAN DEFAULT false,
  marketing BOOLEAN DEFAULT false,
  functional BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 26: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

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
-- PART 27: HELPER FUNCTIONS
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
  INSERT INTO public.privacy_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update story like count
CREATE OR REPLACE FUNCTION public.update_story_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories SET like_count = like_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories SET like_count = like_count - 1 WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update story bookmark count
CREATE OR REPLACE FUNCTION public.update_story_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories SET bookmark_count = bookmark_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories SET bookmark_count = bookmark_count - 1 WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 28: TRIGGERS
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

-- Like count triggers
DROP TRIGGER IF EXISTS update_like_count ON public.story_likes;
CREATE TRIGGER update_like_count
  AFTER INSERT OR DELETE ON public.story_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_story_like_count();

-- Bookmark count triggers
DROP TRIGGER IF EXISTS update_bookmark_count ON public.story_bookmarks;
CREATE TRIGGER update_bookmark_count
  AFTER INSERT OR DELETE ON public.story_bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_story_bookmark_count();

-- ============================================================================
-- PART 29: SAMPLE DATA
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

-- Sample Donation Tiers
INSERT INTO public.donation_tiers (name, display_name, description, min_amount, badge_icon, badge_emoji, badge_name, badge_color, perks, sort_order)
VALUES
  ('supporter', 'Supporter', 'Thank you for your support!', 500, '💝', '💚', 'Supporter Badge', '#22c55e', '["Special supporter badge", "Name in credits"]', 1),
  ('champion', 'Champion', 'You are a champion of stories!', 2000, '🏆', '💜', 'Champion Badge', '#8b5cf6', '["Champion badge", "Exclusive Discord role", "Name in credits"]', 2),
  ('legend', 'Legend', 'A legendary supporter!', 5000, '👑', '💛', 'Legend Badge', '#eab308', '["Legend badge", "All previous perks", "Early access to features", "Personal thank you"]', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

SELECT '✅ StxryAI MASTER database setup COMPLETE!' AS status;
SELECT 'Total tables created in public schema: ' || COUNT(*)::TEXT FROM pg_tables WHERE schemaname = 'public';


