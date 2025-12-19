-- Location: supabase/migrations/20241219060000_add_adaptive_storytelling.sql
-- Schema Analysis: Existing stories, chapters, reading_progress, user_profiles
-- Integration Type: Extension - Adding adaptive storytelling and AI personalization
-- Dependencies: stories, chapters, reading_progress, user_profiles, auth.users

-- ========================================
-- 1. USER READING PREFERENCES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_reading_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Reading style preferences
    preferred_pacing TEXT DEFAULT 'medium' CHECK (preferred_pacing IN ('slow', 'medium', 'fast')),
    preferred_narrative_style TEXT[] DEFAULT '{}', -- ['first_person', 'third_person', 'dialogue_heavy', etc]
    preferred_genre_tags TEXT[] DEFAULT '{}',
    
    -- Content preferences
    preferred_content_rating TEXT DEFAULT 'all' CHECK (preferred_content_rating IN ('all', 'pg', 'pg13', 'mature')),
    preferred_themes TEXT[] DEFAULT '{}', -- ['adventure', 'romance', 'mystery', etc]
    preferred_tone TEXT[] DEFAULT '{}', -- ['light', 'dark', 'humorous', 'serious', etc]
    
    -- Interaction preferences
    preferred_choice_frequency TEXT DEFAULT 'medium' CHECK (preferred_choice_frequency IN ('low', 'medium', 'high')),
    preferred_choice_complexity TEXT DEFAULT 'medium' CHECK (preferred_choice_complexity IN ('simple', 'medium', 'complex')),
    preferred_branching_depth TEXT DEFAULT 'medium' CHECK (preferred_branching_depth IN ('shallow', 'medium', 'deep')),
    
    -- AI personalization
    ai_personality_profile JSONB DEFAULT '{}' NOT NULL, -- Learned personality traits
    reading_patterns JSONB DEFAULT '{}' NOT NULL, -- Time of day, session length, etc
    engagement_patterns JSONB DEFAULT '{}' NOT NULL, -- What keeps user engaged
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(user_id)
);

-- ========================================
-- 2. STORY ADAPTATION LOG TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_adaptation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    
    -- Adaptation details
    adaptation_type TEXT NOT NULL CHECK (adaptation_type IN ('pacing', 'tone', 'complexity', 'content', 'narrative_style', 'choice_prediction')),
    original_content TEXT,
    adapted_content TEXT,
    adaptation_reason TEXT,
    
    -- AI metadata
    ai_model TEXT DEFAULT 'gpt-4',
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    adaptation_parameters JSONB DEFAULT '{}' NOT NULL,
    
    -- User feedback
    user_feedback TEXT CHECK (user_feedback IN ('positive', 'neutral', 'negative')),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 3. CHOICE PREDICTION TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.choice_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    
    -- Choice context
    choice_id UUID, -- Reference to the choice being predicted
    choice_text TEXT,
    choice_options JSONB DEFAULT '[]' NOT NULL, -- Array of available choices
    
    -- Predictions
    predicted_choice_index INTEGER,
    predicted_choice_text TEXT,
    prediction_confidence DECIMAL(3, 2) CHECK (prediction_confidence >= 0 AND prediction_confidence <= 1),
    
    -- Actual user choice (filled after user makes choice)
    actual_choice_index INTEGER,
    actual_choice_text TEXT,
    was_correct BOOLEAN,
    
    -- Prediction model
    model_version TEXT DEFAULT 'v1',
    prediction_features JSONB DEFAULT '{}' NOT NULL, -- Features used for prediction
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. PERSONALIZED NARRATIVE PATHS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.personalized_narrative_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Path information
    path_name TEXT,
    path_description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Personalization
    personalization_factors JSONB DEFAULT '{}' NOT NULL, -- What factors influenced this path
    adaptation_summary TEXT, -- Summary of adaptations made
    
    -- Path tracking
    current_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    path_progress DECIMAL(5, 2) DEFAULT 0 CHECK (path_progress >= 0 AND path_progress <= 100),
    
    -- Metrics
    engagement_score DECIMAL(5, 2) DEFAULT 0,
    completion_likelihood DECIMAL(3, 2) CHECK (completion_likelihood >= 0 AND completion_likelihood <= 1),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. DYNAMIC CONTENT GENERATION TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.dynamic_content_generation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    
    -- Generation details
    generation_type TEXT NOT NULL CHECK (generation_type IN ('dialogue', 'description', 'action', 'choice', 'narrative_branch')),
    original_template_id UUID, -- Reference to template if used
    generated_content TEXT NOT NULL,
    
    -- Context
    generation_context JSONB DEFAULT '{}' NOT NULL, -- User preferences, story state, etc
    generation_prompt TEXT, -- The prompt used for generation
    
    -- AI metadata
    ai_model TEXT DEFAULT 'gpt-4',
    generation_parameters JSONB DEFAULT '{}' NOT NULL,
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    
    -- Quality metrics
    quality_score DECIMAL(3, 2) CHECK (quality_score >= 0 AND quality_score <= 1),
    coherence_score DECIMAL(3, 2) CHECK (coherence_score >= 0 AND coherence_score <= 1),
    
    -- Usage
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    used_at TIMESTAMPTZ,
    
    -- User feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 6. ADAPTIVE STORYTELLING ANALYTICS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.adaptive_storytelling_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Adaptation metrics
    total_adaptations INTEGER DEFAULT 0,
    adaptations_by_type JSONB DEFAULT '{}' NOT NULL, -- {pacing: 5, tone: 3, etc}
    average_confidence_score DECIMAL(3, 2) DEFAULT 0,
    
    -- Prediction metrics
    total_predictions INTEGER DEFAULT 0,
    correct_predictions INTEGER DEFAULT 0,
    prediction_accuracy DECIMAL(5, 2) DEFAULT 0,
    
    -- Engagement metrics
    engagement_score DECIMAL(5, 2) DEFAULT 0,
    session_duration_avg_minutes DECIMAL(10, 2) DEFAULT 0,
    completion_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Personalization effectiveness
    personalization_effectiveness_score DECIMAL(3, 2) DEFAULT 0,
    user_satisfaction_score DECIMAL(3, 2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_user_reading_preferences_user ON public.user_reading_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_story_adaptation_log_user ON public.story_adaptation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_story_adaptation_log_story ON public.story_adaptation_log(story_id);
CREATE INDEX IF NOT EXISTS idx_story_adaptation_log_type ON public.story_adaptation_log(adaptation_type);
CREATE INDEX IF NOT EXISTS idx_story_adaptation_log_created ON public.story_adaptation_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_choice_predictions_user ON public.choice_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_choice_predictions_story ON public.choice_predictions(story_id);
CREATE INDEX IF NOT EXISTS idx_choice_predictions_chapter ON public.choice_predictions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_choice_predictions_correct ON public.choice_predictions(was_correct) WHERE was_correct IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_personalized_narrative_paths_user ON public.personalized_narrative_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_narrative_paths_story ON public.personalized_narrative_paths(story_id);
CREATE INDEX IF NOT EXISTS idx_personalized_narrative_paths_active ON public.personalized_narrative_paths(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_dynamic_content_generation_user ON public.dynamic_content_generation(user_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_content_generation_story ON public.dynamic_content_generation(story_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_content_generation_type ON public.dynamic_content_generation(generation_type);
CREATE INDEX IF NOT EXISTS idx_dynamic_content_generation_used ON public.dynamic_content_generation(is_used) WHERE is_used = TRUE;

CREATE INDEX IF NOT EXISTS idx_adaptive_storytelling_analytics_user ON public.adaptive_storytelling_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_storytelling_analytics_story ON public.adaptive_storytelling_analytics(story_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_storytelling_analytics_period ON public.adaptive_storytelling_analytics(period_start, period_end);

-- ========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.user_reading_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_adaptation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choice_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_narrative_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_content_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_storytelling_analytics ENABLE ROW LEVEL SECURITY;

-- User Reading Preferences Policies
CREATE POLICY "Users can manage their own reading preferences"
    ON public.user_reading_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Story Adaptation Log Policies
CREATE POLICY "Users can view their own adaptation logs"
    ON public.story_adaptation_log FOR SELECT
    USING (auth.uid() = user_id);

-- Choice Predictions Policies
CREATE POLICY "Users can view their own choice predictions"
    ON public.choice_predictions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create choice predictions"
    ON public.choice_predictions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update choice predictions"
    ON public.choice_predictions FOR UPDATE
    USING (true);

-- Personalized Narrative Paths Policies
CREATE POLICY "Users can view their own narrative paths"
    ON public.personalized_narrative_paths FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage narrative paths"
    ON public.personalized_narrative_paths FOR ALL
    USING (true)
    WITH CHECK (true);

-- Dynamic Content Generation Policies
CREATE POLICY "Users can view their own generated content"
    ON public.dynamic_content_generation FOR SELECT
    USING (auth.uid() = user_id);

-- Adaptive Storytelling Analytics Policies
CREATE POLICY "Users can view their own analytics"
    ON public.adaptive_storytelling_analytics FOR SELECT
    USING (auth.uid() = user_id);

-- ========================================
-- 9. FUNCTIONS AND TRIGGERS
-- ========================================

-- Trigger for updated_at
CREATE TRIGGER update_user_reading_preferences_updated_at
    BEFORE UPDATE ON public.user_reading_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_choice_predictions_updated_at
    BEFORE UPDATE ON public.choice_predictions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personalized_narrative_paths_updated_at
    BEFORE UPDATE ON public.personalized_narrative_paths
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adaptive_storytelling_analytics_updated_at
    BEFORE UPDATE ON public.adaptive_storytelling_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update prediction accuracy
CREATE OR REPLACE FUNCTION public.update_prediction_accuracy()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.actual_choice_index IS NOT NULL AND NEW.predicted_choice_index IS NOT NULL THEN
        NEW.was_correct := (NEW.actual_choice_index = NEW.predicted_choice_index);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prediction_accuracy_trigger
    BEFORE INSERT OR UPDATE ON public.choice_predictions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_prediction_accuracy();

-- Function to get user reading profile
CREATE OR REPLACE FUNCTION public.get_user_reading_profile(p_user_id UUID)
RETURNS TABLE (
    preferred_pacing TEXT,
    preferred_narrative_style TEXT[],
    preferred_genre_tags TEXT[],
    preferred_themes TEXT[],
    preferred_tone TEXT[],
    preferred_choice_frequency TEXT,
    ai_personality_profile JSONB,
    reading_patterns JSONB,
    engagement_patterns JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        urp.preferred_pacing,
        urp.preferred_narrative_style,
        urp.preferred_genre_tags,
        urp.preferred_themes,
        urp.preferred_tone,
        urp.preferred_choice_frequency,
        urp.ai_personality_profile,
        urp.reading_patterns,
        urp.engagement_patterns
    FROM public.user_reading_preferences urp
    WHERE urp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate adaptation effectiveness
CREATE OR REPLACE FUNCTION public.calculate_adaptation_effectiveness(
    p_user_id UUID,
    p_story_id UUID,
    p_period_days INTEGER DEFAULT 30
)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
    v_effectiveness DECIMAL(3, 2);
    v_total_adaptations INTEGER;
    v_positive_feedback INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE user_feedback = 'positive')
    INTO v_total_adaptations, v_positive_feedback
    FROM public.story_adaptation_log
    WHERE user_id = p_user_id
    AND story_id = p_story_id
    AND created_at >= NOW() - (p_period_days || ' days')::INTERVAL
    AND user_feedback IS NOT NULL;
    
    IF v_total_adaptations = 0 THEN
        RETURN 0.5; -- Default neutral score
    END IF;
    
    v_effectiveness := (v_positive_feedback::DECIMAL / v_total_adaptations);
    RETURN LEAST(1.0, GREATEST(0.0, v_effectiveness));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.user_reading_preferences IS 'User preferences for personalized storytelling';
COMMENT ON TABLE public.story_adaptation_log IS 'Log of all story adaptations made for users';
COMMENT ON TABLE public.choice_predictions IS 'AI predictions of user choices with accuracy tracking';
COMMENT ON TABLE public.personalized_narrative_paths IS 'Personalized story paths for individual users';
COMMENT ON TABLE public.dynamic_content_generation IS 'AI-generated dynamic content for stories';
COMMENT ON TABLE public.adaptive_storytelling_analytics IS 'Analytics on adaptive storytelling effectiveness';

COMMENT ON COLUMN public.user_reading_preferences.ai_personality_profile IS 'AI-learned personality traits from reading behavior';
COMMENT ON COLUMN public.choice_predictions.prediction_confidence IS 'Confidence score (0-1) for the prediction';
COMMENT ON COLUMN public.dynamic_content_generation.quality_score IS 'AI-assessed quality of generated content';

