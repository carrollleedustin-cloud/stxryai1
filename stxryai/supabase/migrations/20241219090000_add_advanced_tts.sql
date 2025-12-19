-- Location: supabase/migrations/20241219090000_add_advanced_tts.sql
-- Schema Analysis: Existing stories, chapters
-- Integration Type: Extension - Adding advanced text-to-speech features
-- Dependencies: stories, chapters, auth.users

-- ========================================
-- 1. TTS VOICES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.tts_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Voice details
    voice_name TEXT NOT NULL,
    voice_id TEXT NOT NULL UNIQUE, -- Provider-specific voice ID
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'elevenlabs', 'google', 'amazon', 'azure')),
    
    -- Voice characteristics
    gender TEXT CHECK (gender IN ('male', 'female', 'neutral')),
    language_code TEXT DEFAULT 'en-US' NOT NULL,
    accent TEXT,
    age_range TEXT, -- 'young', 'adult', 'elderly'
    
    -- Voice quality
    quality_tier TEXT DEFAULT 'standard' CHECK (quality_tier IN ('standard', 'premium', 'ultra')),
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    is_character_voice BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Voice settings
    speed DECIMAL(3, 2) DEFAULT 1.0 CHECK (speed >= 0.5 AND speed <= 2.0),
    pitch DECIMAL(3, 2) DEFAULT 1.0 CHECK (pitch >= 0.5 AND pitch <= 2.0),
    stability DECIMAL(3, 2) DEFAULT 0.5 CHECK (stability >= 0 AND stability <= 1),
    similarity_boost DECIMAL(3, 2) DEFAULT 0.5 CHECK (similarity_boost >= 0 AND similarity_boost <= 1),
    
    -- Metadata
    sample_audio_url TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. CHARACTER VOICES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.character_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    character_name TEXT NOT NULL,
    
    -- Voice assignment
    voice_id UUID NOT NULL REFERENCES public.tts_voices(id) ON DELETE RESTRICT,
    
    -- Character-specific voice settings
    custom_speed DECIMAL(3, 2) CHECK (custom_speed >= 0.5 AND custom_speed <= 2.0),
    custom_pitch DECIMAL(3, 2) CHECK (custom_pitch >= 0.5 AND custom_pitch <= 2.0),
    custom_stability DECIMAL(3, 2) CHECK (custom_stability >= 0 AND custom_stability <= 1),
    custom_similarity_boost DECIMAL(3, 2) CHECK (custom_similarity_boost >= 0 AND custom_similarity_boost <= 1),
    
    -- Character voice metadata
    voice_description TEXT,
    emotion_mappings JSONB DEFAULT '{}' NOT NULL, -- Map emotions to voice settings
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(story_id, character_name)
);

-- ========================================
-- 3. AUDIO GENERATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.audio_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    
    -- Generation details
    text_content TEXT NOT NULL,
    voice_id UUID NOT NULL REFERENCES public.tts_voices(id) ON DELETE RESTRICT,
    character_name TEXT, -- If using character voice
    
    -- Audio file
    audio_url TEXT,
    audio_duration_seconds DECIMAL(10, 2),
    audio_file_size_bytes INTEGER,
    audio_format TEXT DEFAULT 'mp3' CHECK (audio_format IN ('mp3', 'wav', 'ogg', 'm4a')),
    
    -- Generation settings
    speed DECIMAL(3, 2) DEFAULT 1.0,
    pitch DECIMAL(3, 2) DEFAULT 1.0,
    stability DECIMAL(3, 2) DEFAULT 0.5,
    similarity_boost DECIMAL(3, 2) DEFAULT 0.5,
    
    -- Status
    generation_status TEXT DEFAULT 'pending' NOT NULL CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Provider details
    provider TEXT NOT NULL,
    provider_job_id TEXT,
    provider_cost DECIMAL(10, 4), -- Cost in USD
    
    -- Quality metrics
    quality_score DECIMAL(3, 2) CHECK (quality_score >= 0 AND quality_score <= 1),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. AUDIO PLAYBACK SESSIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.audio_playback_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    
    -- Playback state
    current_audio_id UUID REFERENCES public.audio_generations(id) ON DELETE SET NULL,
    playback_position_seconds DECIMAL(10, 2) DEFAULT 0,
    is_playing BOOLEAN DEFAULT FALSE NOT NULL,
    playback_speed DECIMAL(3, 2) DEFAULT 1.0 CHECK (playback_speed >= 0.5 AND playback_speed <= 2.0),
    
    -- Session details
    session_started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_played_at TIMESTAMPTZ,
    total_listen_time_seconds DECIMAL(10, 2) DEFAULT 0,
    
    -- Preferences
    auto_play_next BOOLEAN DEFAULT TRUE NOT NULL,
    background_playback BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. USER TTS PREFERENCES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_tts_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Default preferences
    default_voice_id UUID REFERENCES public.tts_voices(id) ON DELETE SET NULL,
    default_speed DECIMAL(3, 2) DEFAULT 1.0 CHECK (default_speed >= 0.5 AND default_speed <= 2.0),
    default_pitch DECIMAL(3, 2) DEFAULT 1.0 CHECK (default_pitch >= 0.5 AND default_pitch <= 2.0),
    
    -- Playback preferences
    auto_play_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    background_playback_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    skip_silence BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Quality preferences
    preferred_quality_tier TEXT DEFAULT 'standard' CHECK (preferred_quality_tier IN ('standard', 'premium', 'ultra')),
    use_character_voices BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Subscription preferences
    premium_voices_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(user_id)
);

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_tts_voices_provider ON public.tts_voices(provider);
CREATE INDEX IF NOT EXISTS idx_tts_voices_premium ON public.tts_voices(is_premium) WHERE is_premium = TRUE;
CREATE INDEX IF NOT EXISTS idx_tts_voices_character ON public.tts_voices(is_character_voice) WHERE is_character_voice = TRUE;

CREATE INDEX IF NOT EXISTS idx_character_voices_story ON public.character_voices(story_id);
CREATE INDEX IF NOT EXISTS idx_character_voices_voice ON public.character_voices(voice_id);

CREATE INDEX IF NOT EXISTS idx_audio_generations_user ON public.audio_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_generations_story ON public.audio_generations(story_id);
CREATE INDEX IF NOT EXISTS idx_audio_generations_chapter ON public.audio_generations(chapter_id);
CREATE INDEX IF NOT EXISTS idx_audio_generations_status ON public.audio_generations(generation_status);
CREATE INDEX IF NOT EXISTS idx_audio_generations_pending ON public.audio_generations(generation_status) WHERE generation_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_audio_playback_sessions_user ON public.audio_playback_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_playback_sessions_story ON public.audio_playback_sessions(story_id);
CREATE INDEX IF NOT EXISTS idx_audio_playback_sessions_playing ON public.audio_playback_sessions(is_playing) WHERE is_playing = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_tts_preferences_user ON public.user_tts_preferences(user_id);

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.tts_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_playback_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tts_preferences ENABLE ROW LEVEL SECURITY;

-- TTS Voices Policies
CREATE POLICY "Anyone can view available voices"
    ON public.tts_voices FOR SELECT
    USING (true);

-- Character Voices Policies
CREATE POLICY "Anyone can view character voices"
    ON public.character_voices FOR SELECT
    USING (true);

CREATE POLICY "Story authors can manage character voices"
    ON public.character_voices FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = character_voices.story_id
            AND stories.author_id = auth.uid()
        )
    );

-- Audio Generations Policies
CREATE POLICY "Users can view their own audio generations"
    ON public.audio_generations FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create audio generations"
    ON public.audio_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Audio Playback Sessions Policies
CREATE POLICY "Users can manage their own playback sessions"
    ON public.audio_playback_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User TTS Preferences Policies
CREATE POLICY "Users can manage their own TTS preferences"
    ON public.user_tts_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 8. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_tts_voices_updated_at
    BEFORE UPDATE ON public.tts_voices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_character_voices_updated_at
    BEFORE UPDATE ON public.character_voices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audio_generations_updated_at
    BEFORE UPDATE ON public.audio_generations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audio_playback_sessions_updated_at
    BEFORE UPDATE ON public.audio_playback_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tts_preferences_updated_at
    BEFORE UPDATE ON public.user_tts_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.tts_voices IS 'Available TTS voices from various providers';
COMMENT ON TABLE public.character_voices IS 'Voice assignments for story characters';
COMMENT ON TABLE public.audio_generations IS 'Generated audio files from text-to-speech';
COMMENT ON TABLE public.audio_playback_sessions IS 'User audio playback sessions';
COMMENT ON TABLE public.user_tts_preferences IS 'User preferences for text-to-speech';

COMMENT ON COLUMN public.tts_voices.quality_tier IS 'Voice quality tier (standard, premium, ultra)';
COMMENT ON COLUMN public.character_voices.emotion_mappings IS 'Map emotions to voice parameter adjustments';
COMMENT ON COLUMN public.audio_generations.provider_cost IS 'Cost in USD for generating this audio';

