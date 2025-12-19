-- Location: supabase/migrations/20241219070000_add_ai_story_assistant.sql
-- Schema Analysis: Existing stories, chapters, user_profiles
-- Integration Type: Extension - Adding AI writing assistant features
-- Dependencies: stories, chapters, auth.users

-- ========================================
-- 1. AI WRITING SUGGESTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_writing_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    
    -- Suggestion details
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('plot', 'character', 'dialogue', 'description', 'pacing', 'tone', 'grammar', 'style', 'continuity', 'conflict')),
    original_text TEXT,
    suggested_text TEXT,
    suggestion_context TEXT, -- What part of the story this applies to
    
    -- AI metadata
    ai_model TEXT DEFAULT 'gpt-4',
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning TEXT, -- Why this suggestion was made
    
    -- User interaction
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'modified', 'dismissed')),
    user_feedback TEXT,
    applied_at TIMESTAMPTZ,
    
    -- Position in text (for inline suggestions)
    start_position INTEGER,
    end_position INTEGER,
    selected_text TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. PLOT DOCTOR ANALYSIS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.plot_doctor_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Analysis details
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('full_story', 'act', 'chapter', 'scene', 'character_arc', 'plot_hole')),
    analyzed_content TEXT NOT NULL,
    
    -- Issues found
    issues_found JSONB DEFAULT '[]' NOT NULL, -- Array of issue objects
    issue_count INTEGER DEFAULT 0 NOT NULL,
    severity_level TEXT CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Suggestions
    suggestions JSONB DEFAULT '[]' NOT NULL, -- Array of suggestion objects
    suggestion_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Strengths
    strengths JSONB DEFAULT '[]' NOT NULL, -- What's working well
    strength_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Overall assessment
    overall_score DECIMAL(3, 2) CHECK (overall_score >= 0 AND overall_score <= 1),
    overall_feedback TEXT,
    
    -- AI metadata
    ai_model TEXT DEFAULT 'gpt-4',
    analysis_parameters JSONB DEFAULT '{}' NOT NULL,
    tokens_used INTEGER,
    
    -- User feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    was_helpful BOOLEAN,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 3. IDEA GENERATOR TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_idea_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Generation request
    generation_type TEXT NOT NULL CHECK (generation_type IN ('story_concept', 'character', 'plot_twist', 'world_building', 'dialogue', 'scene', 'title', 'synopsis')),
    prompt TEXT,
    constraints JSONB DEFAULT '{}' NOT NULL, -- Genre, tone, length, etc
    
    -- Generated ideas
    generated_ideas JSONB DEFAULT '[]' NOT NULL, -- Array of idea objects
    idea_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Selected idea
    selected_idea_index INTEGER,
    selected_idea JSONB,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    used_in_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    
    -- AI metadata
    ai_model TEXT DEFAULT 'gpt-4',
    generation_parameters JSONB DEFAULT '{}' NOT NULL,
    tokens_used INTEGER,
    
    -- User feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. WRITING ASSISTANT SESSIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.writing_assistant_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    
    -- Session details
    session_type TEXT NOT NULL CHECK (session_type IN ('plot_doctor', 'writing_suggestions', 'idea_generation', 'general')),
    session_name TEXT,
    
    -- Session state
    current_context TEXT, -- Current story/chapter being worked on
    conversation_history JSONB DEFAULT '[]' NOT NULL, -- Chat history with AI
    active_suggestions UUID[] DEFAULT '{}', -- Active suggestion IDs
    
    -- Session metrics
    suggestions_generated INTEGER DEFAULT 0,
    suggestions_accepted INTEGER DEFAULT 0,
    suggestions_rejected INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. WRITING PATTERNS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.writing_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    
    -- Pattern details
    pattern_type TEXT NOT NULL CHECK (pattern_type IN ('repetition', 'weak_word', 'passive_voice', 'show_vs_tell', 'pacing_issue', 'dialogue_tag', 'adverb_usage')),
    pattern_description TEXT,
    occurrences JSONB DEFAULT '[]' NOT NULL, -- Array of occurrence locations
    occurrence_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Context
    context_text TEXT,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    
    -- Suggestions
    suggested_improvements TEXT[] DEFAULT '{}',
    
    -- Status
    is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
    resolved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_ai_writing_suggestions_user ON public.ai_writing_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_writing_suggestions_story ON public.ai_writing_suggestions(story_id);
CREATE INDEX IF NOT EXISTS idx_ai_writing_suggestions_type ON public.ai_writing_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_ai_writing_suggestions_status ON public.ai_writing_suggestions(status);

CREATE INDEX IF NOT EXISTS idx_plot_doctor_analyses_user ON public.plot_doctor_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_plot_doctor_analyses_story ON public.plot_doctor_analyses(story_id);
CREATE INDEX IF NOT EXISTS idx_plot_doctor_analyses_type ON public.plot_doctor_analyses(analysis_type);

CREATE INDEX IF NOT EXISTS idx_ai_idea_generations_user ON public.ai_idea_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_idea_generations_type ON public.ai_idea_generations(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_idea_generations_used ON public.ai_idea_generations(is_used) WHERE is_used = TRUE;

CREATE INDEX IF NOT EXISTS idx_writing_assistant_sessions_user ON public.writing_assistant_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_assistant_sessions_active ON public.writing_assistant_sessions(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_writing_patterns_user ON public.writing_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_patterns_story ON public.writing_patterns(story_id);
CREATE INDEX IF NOT EXISTS idx_writing_patterns_type ON public.writing_patterns(pattern_type);

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.ai_writing_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plot_doctor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_idea_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_assistant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_patterns ENABLE ROW LEVEL SECURITY;

-- AI Writing Suggestions Policies
CREATE POLICY "Users can manage their own writing suggestions"
    ON public.ai_writing_suggestions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Plot Doctor Analyses Policies
CREATE POLICY "Users can manage their own plot analyses"
    ON public.plot_doctor_analyses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- AI Idea Generations Policies
CREATE POLICY "Users can manage their own idea generations"
    ON public.ai_idea_generations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Writing Assistant Sessions Policies
CREATE POLICY "Users can manage their own assistant sessions"
    ON public.writing_assistant_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Writing Patterns Policies
CREATE POLICY "Users can manage their own writing patterns"
    ON public.writing_patterns FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 8. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_ai_writing_suggestions_updated_at
    BEFORE UPDATE ON public.ai_writing_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plot_doctor_analyses_updated_at
    BEFORE UPDATE ON public.plot_doctor_analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_idea_generations_updated_at
    BEFORE UPDATE ON public.ai_idea_generations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_writing_assistant_sessions_updated_at
    BEFORE UPDATE ON public.writing_assistant_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_writing_patterns_updated_at
    BEFORE UPDATE ON public.writing_patterns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update suggestion acceptance rate
CREATE OR REPLACE FUNCTION public.update_suggestion_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        IF NEW.status = 'accepted' THEN
            UPDATE public.writing_assistant_sessions
            SET suggestions_accepted = suggestions_accepted + 1
            WHERE id = (
                SELECT session_id FROM public.ai_writing_suggestions
                WHERE id = NEW.id
            );
        ELSIF NEW.status = 'rejected' THEN
            UPDATE public.writing_assistant_sessions
            SET suggestions_rejected = suggestions_rejected + 1
            WHERE id = (
                SELECT session_id FROM public.ai_writing_suggestions
                WHERE id = NEW.id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suggestion_stats_trigger
    AFTER UPDATE ON public.ai_writing_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_suggestion_stats();

-- ========================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.ai_writing_suggestions IS 'AI-generated writing suggestions for creators';
COMMENT ON TABLE public.plot_doctor_analyses IS 'Plot Doctor analysis results for story improvement';
COMMENT ON TABLE public.ai_idea_generations IS 'AI-generated story ideas and concepts';
COMMENT ON TABLE public.writing_assistant_sessions IS 'Active writing assistant sessions';
COMMENT ON TABLE public.writing_patterns IS 'Detected writing patterns and issues';

COMMENT ON COLUMN public.ai_writing_suggestions.suggestion_type IS 'Type of suggestion (plot, character, dialogue, etc.)';
COMMENT ON COLUMN public.plot_doctor_analyses.issues_found IS 'Array of plot issues, inconsistencies, or problems';
COMMENT ON COLUMN public.ai_idea_generations.generated_ideas IS 'Array of generated idea objects';

