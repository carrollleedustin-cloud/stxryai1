-- ========================================
-- STXRYAI: Advanced Features Database Indexes & Tables
-- For: Adaptive AI, Companion AI, Live Events, Collaboration, Voice/Audio
-- Version: 1.0.0
-- Date: 2024-12-22
-- ========================================

-- ==========================================
-- 1. ADAPTIVE AI STORYTELLING
-- ==========================================

-- AI Generation History (for learning and caching)
CREATE TABLE IF NOT EXISTS public.ai_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  generation_type TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  prompt_context JSONB NOT NULL DEFAULT '{}',
  response_content TEXT,
  response_tokens INTEGER,
  model_used TEXT,
  temperature DECIMAL(3,2),
  quality_score DECIMAL(3,2), -- User feedback on quality
  was_accepted BOOLEAN DEFAULT TRUE,
  was_edited BOOLEAN DEFAULT FALSE,
  edit_distance INTEGER, -- Levenshtein distance if edited
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for AI adaptation learning
CREATE INDEX IF NOT EXISTS idx_ai_history_user ON public.ai_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_story ON public.ai_generation_history(story_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_type ON public.ai_generation_history(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_history_prompt_hash ON public.ai_generation_history(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_history_quality ON public.ai_generation_history(quality_score DESC) WHERE quality_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_history_accepted ON public.ai_generation_history(was_accepted, generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_history_created ON public.ai_generation_history(created_at DESC);

-- User AI Preferences (learned over time)
CREATE TABLE IF NOT EXISTS public.user_ai_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_writing_style TEXT, -- 'descriptive', 'action', 'dialogue-heavy'
  preferred_tone TEXT, -- 'dark', 'light', 'balanced'
  preferred_pacing TEXT, -- 'fast', 'slow', 'varied'
  vocabulary_level TEXT, -- 'simple', 'moderate', 'advanced'
  genre_preferences JSONB DEFAULT '{}', -- Genre-specific preferences
  character_preferences JSONB DEFAULT '{}', -- What types of characters they engage with
  choice_patterns JSONB DEFAULT '{}', -- Analytics on choice patterns
  engagement_metrics JSONB DEFAULT '{}', -- Reading speed, re-reads, etc.
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_ai_prefs_user ON public.user_ai_preferences(user_id);

-- ==========================================
-- 2. ENHANCED COMPANION AI
-- ==========================================

-- AI Companions (persistent across stories)
CREATE TABLE IF NOT EXISTS public.ai_companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  personality TEXT NOT NULL,
  voice_style TEXT, -- 'formal', 'casual', 'playful', 'wise'
  avatar_url TEXT,
  memory JSONB DEFAULT '{}', -- Long-term memory of interactions
  relationship_level INTEGER DEFAULT 1, -- Grows with interaction
  total_interactions INTEGER DEFAULT 0,
  favorite_topics TEXT[] DEFAULT '{}',
  unlocked_features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companions_user ON public.ai_companions(user_id);
CREATE INDEX IF NOT EXISTS idx_companions_relationship ON public.ai_companions(relationship_level DESC);

-- Companion Conversations
CREATE TABLE IF NOT EXISTS public.companion_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID NOT NULL REFERENCES public.ai_companions(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  chapter_id UUID,
  message_type TEXT NOT NULL, -- 'user', 'companion', 'system'
  content TEXT NOT NULL,
  emotion TEXT, -- Detected or expressed emotion
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companion_conv_companion ON public.companion_conversations(companion_id);
CREATE INDEX IF NOT EXISTS idx_companion_conv_story ON public.companion_conversations(story_id);
CREATE INDEX IF NOT EXISTS idx_companion_conv_created ON public.companion_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companion_conv_type ON public.companion_conversations(message_type);

-- ==========================================
-- 3. LIVE READING EVENTS
-- ==========================================

-- Live Events
CREATE TABLE IF NOT EXISTS public.live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended', 'cancelled'
  max_participants INTEGER DEFAULT 100,
  current_chapter_id UUID,
  chat_enabled BOOLEAN DEFAULT TRUE,
  voting_enabled BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_events_host ON public.live_events(host_id);
CREATE INDEX IF NOT EXISTS idx_live_events_story ON public.live_events(story_id);
CREATE INDEX IF NOT EXISTS idx_live_events_status ON public.live_events(status);
CREATE INDEX IF NOT EXISTS idx_live_events_scheduled ON public.live_events(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_live_events_public ON public.live_events(is_public, status, scheduled_start);

-- Event Participants
CREATE TABLE IF NOT EXISTS public.live_event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer', -- 'viewer', 'moderator', 'co-host'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.live_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.live_event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_active ON public.live_event_participants(event_id, is_active);

-- Event Chat Messages
CREATE TABLE IF NOT EXISTS public.live_event_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat', -- 'chat', 'reaction', 'vote', 'system'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_messages_event ON public.live_event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_created ON public.live_event_messages(event_id, created_at DESC);

-- Event Votes (for live choice voting)
CREATE TABLE IF NOT EXISTS public.live_event_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
  chapter_id UUID,
  choice_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_weight INTEGER DEFAULT 1, -- Premium users might have higher weight
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, chapter_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_votes_event_chapter ON public.live_event_votes(event_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_event_votes_choice ON public.live_event_votes(choice_id);

-- ==========================================
-- 4. COLLABORATIVE CREATION TOOLS
-- ==========================================

-- Story Collaborators
CREATE TABLE IF NOT EXISTS public.story_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor', -- 'owner', 'co-author', 'editor', 'reviewer', 'reader'
  permissions JSONB DEFAULT '{}', -- Granular permissions
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'removed'
  UNIQUE(story_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collaborators_story ON public.story_collaborators(story_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON public.story_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_status ON public.story_collaborators(status);

-- Collaboration Sessions (real-time editing)
CREATE TABLE IF NOT EXISTS public.collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  participants UUID[] DEFAULT '{}',
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_sessions_story ON public.collaboration_sessions(story_id);
CREATE INDEX IF NOT EXISTS idx_collab_sessions_active ON public.collaboration_sessions(is_active, last_activity DESC);

-- Edit History (for version control)
CREATE TABLE IF NOT EXISTS public.story_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  edit_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'restore'
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  diff JSONB, -- Structured diff for content changes
  session_id UUID REFERENCES public.collaboration_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edit_history_story ON public.story_edit_history(story_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_chapter ON public.story_edit_history(chapter_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_user ON public.story_edit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_created ON public.story_edit_history(created_at DESC);

-- Comments and Suggestions (for review workflow)
CREATE TABLE IF NOT EXISTS public.story_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  suggestion_type TEXT NOT NULL, -- 'comment', 'edit_suggestion', 'question'
  content TEXT NOT NULL,
  suggested_text TEXT, -- For edit suggestions
  position_start INTEGER, -- Character position in content
  position_end INTEGER,
  status TEXT DEFAULT 'open', -- 'open', 'accepted', 'rejected', 'resolved'
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_story ON public.story_suggestions(story_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_chapter ON public.story_suggestions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.story_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_user ON public.story_suggestions(user_id);

-- ==========================================
-- 5. VOICE/AUDIO FEATURES
-- ==========================================

-- Audio Narrations
CREATE TABLE IF NOT EXISTS public.audio_narrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  narrator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  voice_type TEXT, -- 'human', 'ai_generated'
  voice_id TEXT, -- AI voice identifier if AI-generated
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes INTEGER,
  status TEXT DEFAULT 'processing', -- 'processing', 'ready', 'error'
  quality TEXT DEFAULT 'standard', -- 'standard', 'hd'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_story ON public.audio_narrations(story_id);
CREATE INDEX IF NOT EXISTS idx_audio_chapter ON public.audio_narrations(chapter_id);
CREATE INDEX IF NOT EXISTS idx_audio_narrator ON public.audio_narrations(narrator_id);
CREATE INDEX IF NOT EXISTS idx_audio_status ON public.audio_narrations(status);

-- Character Voices (for AI voice generation)
CREATE TABLE IF NOT EXISTS public.character_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.persistent_characters(id) ON DELETE CASCADE,
  voice_id TEXT NOT NULL, -- External voice service ID
  voice_provider TEXT NOT NULL, -- 'elevenlabs', 'azure', 'aws', 'google'
  voice_settings JSONB DEFAULT '{}', -- Pitch, speed, emotion settings
  sample_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(character_id)
);

CREATE INDEX IF NOT EXISTS idx_char_voices_character ON public.character_voices(character_id);
CREATE INDEX IF NOT EXISTS idx_char_voices_provider ON public.character_voices(voice_provider);

-- Audio Playback Progress
CREATE TABLE IF NOT EXISTS public.audio_playback_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  narration_id UUID NOT NULL REFERENCES public.audio_narrations(id) ON DELETE CASCADE,
  position_seconds DECIMAL(10,2) NOT NULL DEFAULT 0,
  playback_speed DECIMAL(3,2) DEFAULT 1.0,
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, narration_id)
);

CREATE INDEX IF NOT EXISTS idx_audio_progress_user ON public.audio_playback_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_progress_narration ON public.audio_playback_progress(narration_id);

-- ==========================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ==========================================

-- Stories: Common filter combinations
CREATE INDEX IF NOT EXISTS idx_stories_discovery 
  ON public.stories(is_published, genre, average_rating DESC, play_count DESC)
  WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_stories_author_published 
  ON public.stories(author_id, is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stories_trending 
  ON public.stories(is_published, play_count DESC, created_at DESC)
  WHERE is_published = TRUE;

-- User activity patterns
CREATE INDEX IF NOT EXISTS idx_user_activity_patterns 
  ON public.user_activity(user_id, activity_type, created_at DESC);

-- Reading progress optimization
CREATE INDEX IF NOT EXISTS idx_progress_active_readers 
  ON public.user_progress(user_id, last_read_at DESC)
  WHERE is_completed = FALSE;

-- Notifications delivery
CREATE INDEX IF NOT EXISTS idx_notifications_delivery 
  ON public.notifications(user_id, is_read, created_at DESC);

-- ==========================================
-- RLS POLICIES FOR NEW TABLES
-- ==========================================

-- AI Generation History
ALTER TABLE public.ai_generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI history"
  ON public.ai_generation_history FOR SELECT
  USING (auth.uid() = user_id);

-- User AI Preferences
ALTER TABLE public.user_ai_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI preferences"
  ON public.user_ai_preferences FOR ALL
  USING (auth.uid() = user_id);

-- AI Companions
ALTER TABLE public.ai_companions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own companions"
  ON public.ai_companions FOR ALL
  USING (auth.uid() = user_id);

-- Companion Conversations
ALTER TABLE public.companion_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own companion conversations"
  ON public.companion_conversations FOR SELECT
  USING (
    companion_id IN (SELECT id FROM public.ai_companions WHERE user_id = auth.uid())
  );

-- Live Events
ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public events"
  ON public.live_events FOR SELECT
  USING (is_public = TRUE OR host_id = auth.uid());

CREATE POLICY "Hosts can manage own events"
  ON public.live_events FOR ALL
  USING (host_id = auth.uid());

-- Event Participants
ALTER TABLE public.live_event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event hosts and participants can view"
  ON public.live_event_participants FOR SELECT
  USING (
    user_id = auth.uid() OR
    event_id IN (SELECT id FROM public.live_events WHERE host_id = auth.uid())
  );

-- Story Collaborators
ALTER TABLE public.story_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collaborators can view collaborations"
  ON public.story_collaborators FOR SELECT
  USING (
    user_id = auth.uid() OR
    story_id IN (SELECT id FROM public.stories WHERE author_id = auth.uid())
  );

CREATE POLICY "Story owners can manage collaborators"
  ON public.story_collaborators FOR ALL
  USING (
    story_id IN (SELECT id FROM public.stories WHERE author_id = auth.uid())
  );

-- Edit History
ALTER TABLE public.story_edit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collaborators can view edit history"
  ON public.story_edit_history FOR SELECT
  USING (
    story_id IN (
      SELECT story_id FROM public.story_collaborators 
      WHERE user_id = auth.uid() AND status = 'accepted'
    ) OR
    story_id IN (SELECT id FROM public.stories WHERE author_id = auth.uid())
  );

-- Audio Narrations
ALTER TABLE public.audio_narrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published audio"
  ON public.audio_narrations FOR SELECT
  USING (
    story_id IN (SELECT id FROM public.stories WHERE is_published = TRUE)
  );

CREATE POLICY "Story authors can manage audio"
  ON public.audio_narrations FOR ALL
  USING (
    story_id IN (SELECT id FROM public.stories WHERE author_id = auth.uid())
  );

-- Audio Playback Progress
ALTER TABLE public.audio_playback_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own audio progress"
  ON public.audio_playback_progress FOR ALL
  USING (auth.uid() = user_id);

COMMIT;

