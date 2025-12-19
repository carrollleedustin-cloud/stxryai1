-- Location: supabase/migrations/20241219140000_add_multilanguage_support.sql
-- Schema Analysis: Existing stories, chapters, user_profiles
-- Integration Type: Extension - Adding multi-language and translation support
-- Dependencies: stories, chapters, user_profiles, auth.users

-- ========================================
-- 1. LANGUAGES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Language details
    language_code TEXT NOT NULL UNIQUE, -- ISO 639-1 code (e.g., 'en', 'es', 'fr')
    language_name TEXT NOT NULL, -- English name
    native_name TEXT NOT NULL, -- Native name
    language_family TEXT, -- e.g., 'Indo-European', 'Sino-Tibetan'
    
    -- Script and locale
    script TEXT DEFAULT 'Latin', -- Writing system
    locale TEXT, -- e.g., 'en-US', 'es-ES', 'fr-FR'
    direction TEXT DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_supported BOOLEAN DEFAULT TRUE NOT NULL, -- Platform support
    translation_available BOOLEAN DEFAULT FALSE NOT NULL, -- AI translation available
    
    -- Metadata
    flag_emoji TEXT, -- Country flag emoji
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. STORY TRANSLATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    target_language_code TEXT NOT NULL REFERENCES public.languages(language_code) ON DELETE RESTRICT,
    
    -- Translation details
    translated_title TEXT NOT NULL,
    translated_description TEXT,
    translated_synopsis TEXT,
    
    -- Translation metadata
    translation_status TEXT DEFAULT 'pending' NOT NULL CHECK (translation_status IN ('pending', 'in_progress', 'completed', 'reviewed', 'published', 'needs_revision')),
    translation_method TEXT DEFAULT 'ai' CHECK (translation_method IN ('ai', 'human', 'hybrid', 'community')),
    
    -- Translator information
    translated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    
    -- Quality metrics
    translation_quality_score DECIMAL(3, 2) CHECK (translation_quality_score >= 0 AND translation_quality_score <= 1),
    completeness_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (completeness_percentage >= 0 AND completeness_percentage <= 100),
    
    -- AI translation details
    ai_model TEXT, -- e.g., 'gpt-4', 'claude-3', 'google-translate'
    translation_cost DECIMAL(10, 4), -- Cost in USD
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(original_story_id, target_language_code)
);

-- ========================================
-- 3. CHAPTER TRANSLATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.chapter_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    story_translation_id UUID NOT NULL REFERENCES public.story_translations(id) ON DELETE CASCADE,
    target_language_code TEXT NOT NULL REFERENCES public.languages(language_code) ON DELETE RESTRICT,
    
    -- Translation content
    translated_title TEXT,
    translated_content TEXT NOT NULL,
    
    -- Translation metadata
    translation_status TEXT DEFAULT 'pending' NOT NULL CHECK (translation_status IN ('pending', 'in_progress', 'completed', 'reviewed', 'published', 'needs_revision')),
    translation_method TEXT DEFAULT 'ai',
    
    -- Translator information
    translated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    
    -- Quality metrics
    translation_quality_score DECIMAL(3, 2),
    word_count INTEGER,
    character_count INTEGER,
    
    -- AI translation details
    ai_model TEXT,
    translation_cost DECIMAL(10, 4),
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(original_chapter_id, story_translation_id)
);

-- ========================================
-- 4. TRANSLATION JOBS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.translation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    target_language_code TEXT NOT NULL REFERENCES public.languages(language_code) ON DELETE RESTRICT,
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Job details
    job_type TEXT NOT NULL CHECK (job_type IN ('full_story', 'chapter', 'batch')),
    translation_method TEXT DEFAULT 'ai' CHECK (translation_method IN ('ai', 'human', 'hybrid')),
    
    -- Status
    job_status TEXT DEFAULT 'queued' NOT NULL CHECK (job_status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    progress_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Processing details
    total_chapters INTEGER DEFAULT 0,
    completed_chapters INTEGER DEFAULT 0,
    failed_chapters INTEGER DEFAULT 0,
    
    -- AI details
    ai_model TEXT,
    estimated_cost DECIMAL(10, 4),
    actual_cost DECIMAL(10, 4),
    tokens_used INTEGER,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_completion_at TIMESTAMPTZ,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. LOCALIZATION STRINGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.localization_strings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- String identification
    string_key TEXT NOT NULL, -- e.g., 'common.save', 'story.read_more'
    namespace TEXT DEFAULT 'common', -- Grouping namespace
    
    -- Translations
    translations JSONB DEFAULT '{}' NOT NULL, -- {language_code: translated_text}
    
    -- Context
    context TEXT, -- Usage context
    description TEXT, -- Description for translators
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    needs_review BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(string_key, namespace)
);

-- ========================================
-- 6. USER LANGUAGE PREFERENCES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_language_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Language preferences
    primary_language_code TEXT NOT NULL REFERENCES public.languages(language_code) ON DELETE RESTRICT,
    preferred_languages TEXT[] DEFAULT '{}' NOT NULL, -- Array of language codes in preference order
    
    -- Display preferences
    interface_language TEXT NOT NULL REFERENCES public.languages(language_code) ON DELETE RESTRICT,
    content_language_preference TEXT DEFAULT 'original' CHECK (content_language_preference IN ('original', 'translated', 'both')),
    
    -- Translation preferences
    auto_translate_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    translation_quality_preference TEXT DEFAULT 'balanced' CHECK (translation_quality_preference IN ('fast', 'balanced', 'quality')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(user_id)
);

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_languages_code ON public.languages(language_code);
CREATE INDEX IF NOT EXISTS idx_languages_active ON public.languages(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_languages_supported ON public.languages(is_supported) WHERE is_supported = TRUE;

CREATE INDEX IF NOT EXISTS idx_story_translations_story ON public.story_translations(original_story_id);
CREATE INDEX IF NOT EXISTS idx_story_translations_language ON public.story_translations(target_language_code);
CREATE INDEX IF NOT EXISTS idx_story_translations_status ON public.story_translations(translation_status);
CREATE INDEX IF NOT EXISTS idx_story_translations_published ON public.story_translations(translation_status) WHERE translation_status = 'published';

CREATE INDEX IF NOT EXISTS idx_chapter_translations_chapter ON public.chapter_translations(original_chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_translations_story_translation ON public.chapter_translations(story_translation_id);
CREATE INDEX IF NOT EXISTS idx_chapter_translations_language ON public.chapter_translations(target_language_code);

CREATE INDEX IF NOT EXISTS idx_translation_jobs_story ON public.translation_jobs(story_id);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_status ON public.translation_jobs(job_status);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_queued ON public.translation_jobs(job_status) WHERE job_status = 'queued';

CREATE INDEX IF NOT EXISTS idx_localization_strings_key ON public.localization_strings(string_key);
CREATE INDEX IF NOT EXISTS idx_localization_strings_namespace ON public.localization_strings(namespace);

CREATE INDEX IF NOT EXISTS idx_user_language_preferences_user ON public.user_language_preferences(user_id);

-- ========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localization_strings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_language_preferences ENABLE ROW LEVEL SECURITY;

-- Languages Policies
CREATE POLICY "Anyone can view active languages"
    ON public.languages FOR SELECT
    USING (is_active = TRUE);

-- Story Translations Policies
CREATE POLICY "Anyone can view published translations"
    ON public.story_translations FOR SELECT
    USING (translation_status = 'published');

CREATE POLICY "Story authors can manage translations"
    ON public.story_translations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = story_translations.original_story_id
            AND stories.author_id = auth.uid()
        )
    );

-- Chapter Translations Policies
CREATE POLICY "Anyone can view published chapter translations"
    ON public.chapter_translations FOR SELECT
    USING (translation_status = 'published');

-- Translation Jobs Policies
CREATE POLICY "Users can view their own translation jobs"
    ON public.translation_jobs FOR SELECT
    USING (auth.uid() = requested_by);

CREATE POLICY "Users can create translation jobs"
    ON public.translation_jobs FOR INSERT
    WITH CHECK (auth.uid() = requested_by);

-- Localization Strings Policies
CREATE POLICY "Anyone can view active localization strings"
    ON public.localization_strings FOR SELECT
    USING (is_active = TRUE);

-- User Language Preferences Policies
CREATE POLICY "Users can manage their own language preferences"
    ON public.user_language_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 9. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_languages_updated_at
    BEFORE UPDATE ON public.languages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_story_translations_updated_at
    BEFORE UPDATE ON public.story_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapter_translations_updated_at
    BEFORE UPDATE ON public.chapter_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translation_jobs_updated_at
    BEFORE UPDATE ON public.translation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_localization_strings_updated_at
    BEFORE UPDATE ON public.localization_strings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_language_preferences_updated_at
    BEFORE UPDATE ON public.user_language_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update translation completeness
CREATE OR REPLACE FUNCTION public.update_translation_completeness()
RETURNS TRIGGER AS $$
DECLARE
    v_total_chapters INTEGER;
    v_translated_chapters INTEGER;
    v_completeness DECIMAL(5, 2);
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Get total chapters for the story
        SELECT COUNT(*) INTO v_total_chapters
        FROM public.chapters
        WHERE story_id = (
            SELECT original_story_id FROM public.story_translations
            WHERE id = NEW.story_translation_id
        );
        
        -- Get translated chapters
        SELECT COUNT(*) INTO v_translated_chapters
        FROM public.chapter_translations
        WHERE story_translation_id = NEW.story_translation_id
        AND translation_status IN ('completed', 'reviewed', 'published');
        
        -- Calculate completeness
        IF v_total_chapters > 0 THEN
            v_completeness := (v_translated_chapters::DECIMAL / v_total_chapters) * 100;
        ELSE
            v_completeness := 0;
        END IF;
        
        -- Update story translation completeness
        UPDATE public.story_translations
        SET completeness_percentage = v_completeness
        WHERE id = NEW.story_translation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_translation_completeness_trigger
    AFTER INSERT OR UPDATE ON public.chapter_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_translation_completeness();

-- ========================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.languages IS 'Supported languages for translation and localization';
COMMENT ON TABLE public.story_translations IS 'Translated versions of stories';
COMMENT ON TABLE public.chapter_translations IS 'Translated versions of chapters';
COMMENT ON TABLE public.translation_jobs IS 'Translation job queue and tracking';
COMMENT ON TABLE public.localization_strings IS 'UI string translations for localization';
COMMENT ON TABLE public.user_language_preferences IS 'User language and translation preferences';

COMMENT ON COLUMN public.story_translations.translation_method IS 'Method used for translation (ai, human, hybrid, community)';
COMMENT ON COLUMN public.translation_jobs.job_status IS 'Status of translation job (queued, processing, completed, failed, cancelled)';
COMMENT ON COLUMN public.user_language_preferences.content_language_preference IS 'User preference for content language (original, translated, both)';

