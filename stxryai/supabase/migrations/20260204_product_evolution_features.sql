-- Product Evolution Features Migration
-- Adds tables for: Companion Reactions, Reading Memories, Story Echoes, Reader Identity, Emotional Fingerprint

-- ============================================
-- 1. COMPANION REACTIONS & MEMORIES
-- ============================================

-- Companion memories of story events
CREATE TABLE IF NOT EXISTS companion_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    reaction JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companion_memories_pet ON companion_memories(pet_id);
CREATE INDEX IF NOT EXISTS idx_companion_memories_user ON companion_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_companion_memories_story ON companion_memories(story_id);

-- Companion opinions about stories/choices
CREATE TABLE IF NOT EXISTS companion_opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    opinion TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'conflicted')),
    confidence DECIMAL(3,2) DEFAULT 0.5,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companion_opinions_pet ON companion_opinions(pet_id);

-- ============================================
-- 2. READING MEMORIES
-- ============================================

CREATE TABLE IF NOT EXISTS reading_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    memory_type TEXT CHECK (memory_type IN ('choice', 'quote', 'character', 'ending', 'milestone', 'emotion')),
    title TEXT NOT NULL,
    description TEXT,
    choice_text TEXT,
    quote_text TEXT,
    character_name TEXT,
    emotional_tone TEXT CHECK (emotional_tone IN ('joy', 'sadness', 'excitement', 'fear', 'love', 'triumph', 'loss', 'wonder')),
    intensity INTEGER CHECK (intensity >= 0 AND intensity <= 100),
    screenshot_url TEXT,
    background_color TEXT DEFAULT '#EDE9FE',
    accent_color TEXT DEFAULT '#8B5CF6',
    story_title TEXT,
    story_genre TEXT,
    chapter_title TEXT,
    reading_progress INTEGER,
    is_public BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    story_date TIMESTAMPTZ,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reading_memories_user ON reading_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_memories_story ON reading_memories(story_id);
CREATE INDEX IF NOT EXISTS idx_reading_memories_public ON reading_memories(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_reading_memories_captured ON reading_memories(captured_at);

-- Memory collections
CREATE TABLE IF NOT EXISTS memory_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    memory_ids UUID[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    theme TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_collections_user ON memory_collections(user_id);

-- Memory likes tracking
CREATE TABLE IF NOT EXISTS memory_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES reading_memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(memory_id, user_id)
);

-- Function to increment memory likes
CREATE OR REPLACE FUNCTION increment_memory_likes(memory_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE reading_memories
    SET likes = likes + 1
    WHERE id = memory_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. STORY ECHOES (SOCIAL PROOF)
-- ============================================

-- Choice statistics aggregation
CREATE TABLE IF NOT EXISTS choice_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    choice_point_id TEXT NOT NULL,
    choice_id TEXT NOT NULL,
    choice_text TEXT NOT NULL,
    selection_count INTEGER DEFAULT 0,
    recent_selections INTEGER DEFAULT 0, -- Last 24h
    previous_count INTEGER DEFAULT 0, -- For trend calculation
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, chapter_id, choice_point_id, choice_id)
);

CREATE INDEX IF NOT EXISTS idx_choice_statistics_story ON choice_statistics(story_id);
CREATE INDEX IF NOT EXISTS idx_choice_statistics_chapter ON choice_statistics(chapter_id);

-- Individual reader choices
CREATE TABLE IF NOT EXISTS reader_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    choice_point_id TEXT NOT NULL,
    choice_id TEXT NOT NULL,
    choice_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reader_choices_user ON reader_choices(user_id);
CREATE INDEX IF NOT EXISTS idx_reader_choices_story ON reader_choices(story_id);
CREATE INDEX IF NOT EXISTS idx_reader_choices_recent ON reader_choices(created_at DESC);

-- Function to increment choice count
CREATE OR REPLACE FUNCTION increment_choice_count(
    p_story_id UUID,
    p_chapter_id UUID,
    p_choice_point_id TEXT,
    p_choice_id TEXT,
    p_choice_text TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO choice_statistics (story_id, chapter_id, choice_point_id, choice_id, choice_text, selection_count)
    VALUES (p_story_id, p_chapter_id, p_choice_point_id, p_choice_id, p_choice_text, 1)
    ON CONFLICT (story_id, chapter_id, choice_point_id, choice_id)
    DO UPDATE SET 
        selection_count = choice_statistics.selection_count + 1,
        recent_selections = choice_statistics.recent_selections + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Active reading sessions (for ghost readers)
CREATE TABLE IF NOT EXISTS active_reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    progress INTEGER DEFAULT 0,
    reading_speed INTEGER, -- words per minute
    last_active TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_story ON active_reading_sessions(story_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_active ON active_reading_sessions(last_active DESC);

-- Story activity feed
CREATE TABLE IF NOT EXISTS story_activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL,
    story_title TEXT,
    activity_type TEXT CHECK (activity_type IN ('reading', 'choice', 'finishing', 'starting', 'emotional_moment')),
    chapter_id UUID,
    chapter_title TEXT,
    choice_text TEXT,
    emotional_tone TEXT,
    anonymous_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_story ON story_activity_feed(story_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_recent ON story_activity_feed(timestamp DESC);

-- Story momentum metrics
CREATE TABLE IF NOT EXISTS story_momentum (
    story_id UUID PRIMARY KEY,
    current_readers INTEGER DEFAULT 0,
    readers_today INTEGER DEFAULT 0,
    readers_yesterday INTEGER DEFAULT 0,
    completions_today INTEGER DEFAULT 0,
    emotional_pulse JSONB DEFAULT '{"joy": 0, "sadness": 0, "excitement": 0, "fear": 0}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to increment emotional pulse
CREATE OR REPLACE FUNCTION increment_emotional_pulse(p_story_id UUID, p_emotion TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO story_momentum (story_id, emotional_pulse)
    VALUES (p_story_id, jsonb_build_object(p_emotion, 1))
    ON CONFLICT (story_id)
    DO UPDATE SET 
        emotional_pulse = jsonb_set(
            COALESCE(story_momentum.emotional_pulse, '{}'),
            ARRAY[p_emotion],
            to_jsonb(COALESCE((story_momentum.emotional_pulse->>p_emotion)::int, 0) + 1)
        ),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. READER IDENTITY
-- ============================================

CREATE TABLE IF NOT EXISTS reader_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    primary_archetype TEXT DEFAULT 'Undefined',
    archetype_confidence INTEGER DEFAULT 0,
    archetype_evolution JSONB DEFAULT '[]',
    secondary_traits TEXT[] DEFAULT '{}',
    choice_patterns JSONB DEFAULT '{"bravery": 0, "morality": 0, "logic": 0, "social": 0, "curiosity": 0, "aggression": 0}',
    genre_affinity JSONB DEFAULT '{}',
    reading_style JSONB DEFAULT '{"avgSessionLength": 0, "preferredTimeOfDay": "evening", "bingeTendency": 50, "completionRate": 0}',
    total_choices_made INTEGER DEFAULT 0,
    stories_completed INTEGER DEFAULT 0,
    unique_paths_explored INTEGER DEFAULT 0,
    rare_choices_found INTEGER DEFAULT 0,
    earned_titles TEXT[] DEFAULT '{}',
    active_title TEXT,
    first_read_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ,
    identity_formed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reader_identities_user ON reader_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_reader_identities_archetype ON reader_identities(primary_archetype);

-- ============================================
-- 5. EMOTIONAL FINGERPRINT
-- ============================================

CREATE TABLE IF NOT EXISTS emotional_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    emotional_profile JSONB DEFAULT '{"joy": 50, "sadness": 50, "excitement": 50, "fear": 50, "romance": 50, "nostalgia": 50, "wonder": 50, "tension": 50}',
    pacing_profile JSONB DEFAULT '{"preferredTensionLevel": "medium", "tensionRecoveryRate": 50, "cliffhangerTolerance": 50, "actionPacePref": "balanced"}',
    sensitivity_profile JSONB DEFAULT '{"violenceThreshold": "moderate", "romanceComfort": "suggestive", "darkThemesTolerance": 50, "jumpScareReaction": "tolerate"}',
    engagement_signals JSONB DEFAULT '{"avgReadingSpeed": 200, "rereadBehavior": "sometimes", "abandonmentTriggers": [], "completionMotivators": []}',
    temporal_patterns JSONB DEFAULT '{"preferredReadingTimes": [], "sessionLengthByMood": {}, "weekdayVsWeekend": "no_diff"}',
    emotional_journey_preference TEXT DEFAULT 'balanced',
    personalized_recommendation_factors TEXT[] DEFAULT '{}',
    data_points INTEGER DEFAULT 0,
    confidence_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotional_fingerprints_user ON emotional_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_fingerprints_confidence ON emotional_fingerprints(confidence_score);

-- Emotional events for learning
CREATE TABLE IF NOT EXISTS emotional_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    event_type TEXT CHECK (event_type IN ('pause', 'speed_up', 'slow_down', 'reread', 'skip', 'chapter_end', 'abandon')),
    emotional_context TEXT,
    duration INTEGER, -- milliseconds
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotional_events_user ON emotional_events(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_events_story ON emotional_events(story_id);

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE companion_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE choice_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_momentum ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_events ENABLE ROW LEVEL SECURITY;

-- Companion memories policies
CREATE POLICY "Users can view own companion memories" ON companion_memories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own companion memories" ON companion_memories FOR INSERT WITH CHECK (user_id = auth.uid());

-- Companion opinions policies
CREATE POLICY "Users can view own companion opinions" ON companion_opinions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own companion opinions" ON companion_opinions FOR INSERT WITH CHECK (user_id = auth.uid());

-- Reading memories policies
CREATE POLICY "Users can view own memories" ON reading_memories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view public memories" ON reading_memories FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users can insert own memories" ON reading_memories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own memories" ON reading_memories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own memories" ON reading_memories FOR DELETE USING (user_id = auth.uid());

-- Memory collections policies
CREATE POLICY "Users can view own collections" ON memory_collections FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view public collections" ON memory_collections FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users can insert own collections" ON memory_collections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own collections" ON memory_collections FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own collections" ON memory_collections FOR DELETE USING (user_id = auth.uid());

-- Memory likes policies
CREATE POLICY "Users can view likes" ON memory_likes FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert own likes" ON memory_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own likes" ON memory_likes FOR DELETE USING (user_id = auth.uid());

-- Choice statistics policies (public read)
CREATE POLICY "Anyone can view choice statistics" ON choice_statistics FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can update statistics" ON choice_statistics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify statistics" ON choice_statistics FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Reader choices policies
CREATE POLICY "Users can view own choices" ON reader_choices FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own choices" ON reader_choices FOR INSERT WITH CHECK (user_id = auth.uid());

-- Active reading sessions policies
CREATE POLICY "Users can manage own sessions" ON active_reading_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view others in same chapter" ON active_reading_sessions FOR SELECT USING (TRUE);

-- Story activity feed policies (public)
CREATE POLICY "Anyone can view activity feed" ON story_activity_feed FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated can insert activity" ON story_activity_feed FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Story momentum policies (public read)
CREATE POLICY "Anyone can view momentum" ON story_momentum FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated can update momentum" ON story_momentum FOR ALL USING (auth.uid() IS NOT NULL);

-- Reader identities policies
CREATE POLICY "Users can view own identity" ON reader_identities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own identity" ON reader_identities FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own identity" ON reader_identities FOR UPDATE USING (user_id = auth.uid());

-- Emotional fingerprints policies
CREATE POLICY "Users can view own fingerprint" ON emotional_fingerprints FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own fingerprint" ON emotional_fingerprints FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own fingerprint" ON emotional_fingerprints FOR UPDATE USING (user_id = auth.uid());

-- Emotional events policies
CREATE POLICY "Users can manage own events" ON emotional_events FOR ALL USING (user_id = auth.uid());

-- ============================================
-- 7. CLEANUP JOBS (scheduled functions)
-- ============================================

-- Function to reset daily counts at midnight
CREATE OR REPLACE FUNCTION reset_daily_counts()
RETURNS VOID AS $$
BEGIN
    -- Reset recent selections in choice statistics
    UPDATE choice_statistics
    SET previous_count = selection_count,
        recent_selections = 0,
        updated_at = NOW();
    
    -- Reset daily reader counts
    UPDATE story_momentum
    SET readers_yesterday = readers_today,
        readers_today = 0,
        completions_today = 0,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old reading sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS VOID AS $$
BEGIN
    DELETE FROM active_reading_sessions
    WHERE last_active < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old activity feed entries
CREATE OR REPLACE FUNCTION cleanup_old_activity()
RETURNS VOID AS $$
BEGIN
    DELETE FROM story_activity_feed
    WHERE timestamp < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE story_activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE choice_statistics;

COMMENT ON TABLE companion_memories IS 'Stores companion reactions to story events for "remember when" features';
COMMENT ON TABLE reading_memories IS 'User-captured memorable moments from reading experience';
COMMENT ON TABLE choice_statistics IS 'Aggregated choice data for Story Echoes social proof';
COMMENT ON TABLE reader_identities IS 'Reader archetypes and identity formed through choices';
COMMENT ON TABLE emotional_fingerprints IS 'Invisible emotional preferences learned over time';
