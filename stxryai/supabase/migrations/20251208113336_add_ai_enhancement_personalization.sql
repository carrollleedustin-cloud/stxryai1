-- Location: supabase/migrations/20251208113336_add_ai_enhancement_personalization.sql
-- Schema Analysis: Existing storytelling platform with stories, chapters, user_profiles, engagement metrics, NPC memories
-- Integration Type: Addition - AI enhancement and personalization features
-- Dependencies: user_profiles, stories, story_chapters

-- 1. TYPES
CREATE TYPE public.prompt_category AS ENUM ('contextual', 'dynamic', 'procedural', 'branching');
CREATE TYPE public.content_generation_type AS ENUM ('item_description', 'ambient_event', 'lore_fragment', 'background_character', 'environment_detail');
CREATE TYPE public.translation_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE public.theme_category AS ENUM ('color_palette', 'typography', 'layout', 'animation', 'genre_atmosphere');
CREATE TYPE public.relationship_type AS ENUM ('ally', 'rival', 'romantic', 'mentor', 'family', 'enemy', 'neutral');

-- 2. AI ENHANCEMENT TABLES

-- AI Prompt Templates
CREATE TABLE public.ai_prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    prompt_category public.prompt_category NOT NULL,
    template_name TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    context_variables JSONB DEFAULT '{}'::jsonb,
    creativity_level NUMERIC(3,2) DEFAULT 0.70 CHECK (creativity_level >= 0.00 AND creativity_level <= 1.00),
    usage_count INTEGER DEFAULT 0,
    success_rate NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Prompt Chains
CREATE TABLE public.dynamic_prompt_chains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    chain_name TEXT NOT NULL,
    prompt_sequence JSONB NOT NULL,
    context_history JSONB DEFAULT '[]'::jsonb,
    adaptation_rules JSONB DEFAULT '{}'::jsonb,
    current_step INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Procedural Content Generation
CREATE TABLE public.procedural_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE CASCADE,
    content_type public.content_generation_type NOT NULL,
    generated_content TEXT NOT NULL,
    context_tags JSONB DEFAULT '[]'::jsonb,
    quality_score NUMERIC(3,2) DEFAULT 0.50,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Predictive Analytics
CREATE TABLE public.story_path_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE CASCADE,
    predicted_engagement NUMERIC(5,2) DEFAULT 50.00,
    emotional_intensity NUMERIC(3,2) DEFAULT 0.50,
    decision_weight NUMERIC(3,2) DEFAULT 0.50,
    outcome_impact TEXT,
    reader_choice_probability JSONB DEFAULT '{}'::jsonb,
    narrative_pacing_effect TEXT,
    arc_investment_score NUMERIC(5,2) DEFAULT 50.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Personalized Reading Recaps
CREATE TABLE public.reading_journey_recaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    recap_type TEXT NOT NULL,
    choice_history JSONB DEFAULT '[]'::jsonb,
    moral_alignments JSONB DEFAULT '{}'::jsonb,
    relationship_dynamics JSONB DEFAULT '{}'::jsonb,
    narrative_milestones JSONB DEFAULT '[]'::jsonb,
    recap_content TEXT NOT NULL,
    spoiler_level TEXT DEFAULT 'safe',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Multilingual Translations
CREATE TABLE public.story_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE CASCADE,
    target_language TEXT NOT NULL,
    original_content TEXT NOT NULL,
    translated_content TEXT NOT NULL,
    translation_status public.translation_status DEFAULT 'completed'::public.translation_status,
    tone_preservation_score NUMERIC(3,2) DEFAULT 0.80,
    cultural_adaptation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Interactive Glossary
CREATE TABLE public.story_glossary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL,
    entry_name TEXT NOT NULL,
    entry_description TEXT NOT NULL,
    discovered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    discovery_chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE SET NULL,
    spoiler_protected BOOLEAN DEFAULT true,
    related_entries JSONB DEFAULT '[]'::jsonb,
    lore_depth INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. PERSONALIZATION TABLES

-- UI Theme Customization
CREATE TABLE public.user_ui_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    theme_name TEXT NOT NULL,
    theme_category public.theme_category NOT NULL,
    color_palette JSONB DEFAULT '{}'::jsonb,
    typography_settings JSONB DEFAULT '{}'::jsonb,
    layout_preferences JSONB DEFAULT '{}'::jsonb,
    animation_settings JSONB DEFAULT '{}'::jsonb,
    genre_atmosphere JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Character Relationship Mapping
CREATE TABLE public.character_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    character_a_name TEXT NOT NULL,
    character_b_name TEXT NOT NULL,
    relationship_type public.relationship_type NOT NULL,
    relationship_strength NUMERIC(3,2) DEFAULT 0.50 CHECK (relationship_strength >= 0.00 AND relationship_strength <= 1.00),
    emotional_bonds JSONB DEFAULT '[]'::jsonb,
    conflict_history JSONB DEFAULT '[]'::jsonb,
    alliance_status TEXT,
    secret_dynamics TEXT,
    evolution_timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, user_id, character_a_name, character_b_name)
);

-- Achievement System Extensions
CREATE TABLE public.achievement_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id UUID REFERENCES public.user_badges(id) ON DELETE CASCADE,
    tier_level INTEGER NOT NULL,
    tier_name TEXT NOT NULL,
    requirements JSONB NOT NULL,
    rewards JSONB DEFAULT '{}'::jsonb,
    seasonal_theme TEXT,
    story_specific BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Personalized Discovery Settings
CREATE TABLE public.discovery_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    favorite_genres JSONB DEFAULT '[]'::jsonb,
    preferred_writing_styles JSONB DEFAULT '[]'::jsonb,
    emotional_tone_preferences JSONB DEFAULT '[]'::jsonb,
    branching_behavior_patterns JSONB DEFAULT '{}'::jsonb,
    reading_pace_preference TEXT DEFAULT 'moderate',
    content_maturity_level TEXT DEFAULT 'teen',
    discovery_algorithm_weights JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Reader Feedback & Gifting
CREATE TABLE public.reader_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giver_user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    receiver_user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL,
    gift_item JSONB DEFAULT '{}'::jsonb,
    milestone_achieved TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Writing Prompt System
CREATE TABLE public.writing_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    prompt_type TEXT NOT NULL,
    genre_specific TEXT,
    worldbuilding_focus TEXT,
    character_motivation_theme TEXT,
    scene_construction_guidance TEXT,
    atmospheric_enhancements JSONB DEFAULT '[]'::jsonb,
    psychological_layers TEXT,
    suggested_expansions TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. INDEXES
CREATE INDEX idx_ai_prompts_user_story ON public.ai_prompt_templates(user_id, story_id);
CREATE INDEX idx_prompt_chains_story ON public.dynamic_prompt_chains(story_id);
CREATE INDEX idx_procedural_content_story ON public.procedural_content(story_id);
CREATE INDEX idx_path_analytics_story ON public.story_path_analytics(story_id);
CREATE INDEX idx_reading_recaps_user ON public.reading_journey_recaps(user_id);
CREATE INDEX idx_translations_story ON public.story_translations(story_id);
CREATE INDEX idx_glossary_story_user ON public.story_glossary(story_id, user_id);
CREATE INDEX idx_ui_themes_user ON public.user_ui_themes(user_id);
CREATE INDEX idx_char_relationships_story ON public.character_relationships(story_id, user_id);
CREATE INDEX idx_achievement_tiers_badge ON public.achievement_tiers(badge_id);
CREATE INDEX idx_discovery_prefs_user ON public.discovery_preferences(user_id);
CREATE INDEX idx_feedback_receiver ON public.reader_feedback(receiver_user_id);
CREATE INDEX idx_writing_prompts_user ON public.writing_prompts(user_id);

-- 5. ENABLE RLS
ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_prompt_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedural_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_path_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_journey_recaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ui_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reader_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_prompts ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- AI Prompt Templates
CREATE POLICY "users_manage_own_ai_prompts"
ON public.ai_prompt_templates
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Dynamic Prompt Chains
CREATE POLICY "users_manage_own_prompt_chains"
ON public.dynamic_prompt_chains
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Procedural Content
CREATE POLICY "public_can_view_approved_content"
ON public.procedural_content
FOR SELECT
TO public
USING (is_approved = true);

CREATE POLICY "authenticated_can_generate_content"
ON public.procedural_content
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Story Path Analytics
CREATE POLICY "public_can_view_analytics"
ON public.story_path_analytics
FOR SELECT
TO public
USING (true);

-- Reading Journey Recaps
CREATE POLICY "users_manage_own_recaps"
ON public.reading_journey_recaps
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Story Translations
CREATE POLICY "public_can_view_completed_translations"
ON public.story_translations
FOR SELECT
TO public
USING (translation_status = 'completed'::public.translation_status);

-- Story Glossary
CREATE POLICY "users_manage_own_glossary"
ON public.story_glossary
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User UI Themes
CREATE POLICY "users_manage_own_themes"
ON public.user_ui_themes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Character Relationships
CREATE POLICY "users_manage_own_relationships"
ON public.character_relationships
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Achievement Tiers
CREATE POLICY "public_can_view_achievement_tiers"
ON public.achievement_tiers
FOR SELECT
TO public
USING (true);

-- Discovery Preferences
CREATE POLICY "users_manage_own_discovery_prefs"
ON public.discovery_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Reader Feedback
CREATE POLICY "users_can_give_feedback"
ON public.reader_feedback
FOR INSERT
TO authenticated
WITH CHECK (giver_user_id = auth.uid());

CREATE POLICY "users_can_view_received_feedback"
ON public.reader_feedback
FOR SELECT
TO authenticated
USING (receiver_user_id = auth.uid() OR giver_user_id = auth.uid());

-- Writing Prompts
CREATE POLICY "users_manage_own_prompts"
ON public.writing_prompts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. MOCK DATA
DO $$
DECLARE
    existing_user_id UUID;
    existing_story_id UUID;
    existing_chapter_id UUID;
    prompt_template_id UUID;
    theme_id UUID;
BEGIN
    -- Get existing user and story IDs
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_story_id FROM public.stories LIMIT 1;
    SELECT id INTO existing_chapter_id FROM public.story_chapters LIMIT 1;

    IF existing_user_id IS NOT NULL AND existing_story_id IS NOT NULL THEN
        -- AI Prompt Templates
        INSERT INTO public.ai_prompt_templates (user_id, story_id, prompt_category, template_name, prompt_text, creativity_level) VALUES
            (existing_user_id, existing_story_id, 'contextual', 'Epic Battle Scene', 'Generate an intense battle scene with focus on character emotions and strategic decisions. Context: {character_name} faces {enemy_type} in {location}.', 0.85),
            (existing_user_id, existing_story_id, 'dynamic', 'Branching Dialogue', 'Create dialogue that adapts to previous choices. Tone: {current_mood}, Relationship: {character_relationship}', 0.75);

        -- Dynamic Prompt Chains
        INSERT INTO public.dynamic_prompt_chains (user_id, story_id, chain_name, prompt_sequence) VALUES
            (existing_user_id, existing_story_id, 'Mystery Arc Development', '{"steps": ["Initial clue discovery", "Red herring introduction", "Character suspect interviews", "Plot twist revelation", "Final confrontation"]}');

        -- Procedural Content
        INSERT INTO public.procedural_content (story_id, chapter_id, content_type, generated_content, quality_score, is_approved) VALUES
            (existing_story_id, existing_chapter_id, 'ambient_event', 'A distant owl hoots as the moonlight filters through ancient oak branches, casting dancing shadows on the forest floor.', 0.92, true),
            (existing_story_id, existing_chapter_id, 'item_description', 'An ornate silver locket with intricate vine patterns, warm to the touch despite the cold evening air. Inside, a faded portrait of a woman with kind eyes.', 0.88, true);

        -- Story Path Analytics
        INSERT INTO public.story_path_analytics (story_id, chapter_id, predicted_engagement, emotional_intensity, decision_weight, outcome_impact) VALUES
            (existing_story_id, existing_chapter_id, 87.50, 0.92, 0.85, 'High impact decision affecting character survival and story ending'),
            (existing_story_id, existing_chapter_id, 72.30, 0.68, 0.55, 'Moderate impact choice influencing relationship dynamics');

        -- Reading Journey Recaps
        INSERT INTO public.reading_journey_recaps (user_id, story_id, recap_type, choice_history, moral_alignments, recap_content) VALUES
            (existing_user_id, existing_story_id, 'chapter_completion', '[{"chapter": 1, "choice": "helped_stranger"}, {"chapter": 2, "choice": "revealed_secret"}]', '{"compassion": 85, "honesty": 90, "courage": 75}', 'Your journey has been marked by acts of compassion and honesty. You chose to help the stranger despite personal risk, and your decision to reveal the secret changed the course of relationships forever.');

        -- Story Translations
        INSERT INTO public.story_translations (story_id, chapter_id, target_language, original_content, translated_content, tone_preservation_score) VALUES
            (existing_story_id, existing_chapter_id, 'Spanish', 'The mysterious path ahead beckons with promises of adventure.', 'El misterioso camino por delante llama con promesas de aventura.', 0.95),
            (existing_story_id, existing_chapter_id, 'French', 'Your heart races as the decision looms before you.', 'Votre cœur bat la chamade alors que la décision se profile devant vous.', 0.93);

        -- Story Glossary
        INSERT INTO public.story_glossary (story_id, user_id, entry_type, entry_name, entry_description, discovery_chapter_id) VALUES
            (existing_story_id, existing_user_id, 'character', 'Elder Morrigan', 'A wise forest guardian who has protected the ancient woods for centuries. Known for her prophetic visions and deep connection to nature.', existing_chapter_id),
            (existing_story_id, existing_user_id, 'location', 'Whispering Grove', 'A sacred clearing where the trees seem to speak in hushed voices. Legend says important choices made here echo through time.', existing_chapter_id);

        -- UI Themes
        INSERT INTO public.user_ui_themes (user_id, theme_name, theme_category, color_palette, is_active) VALUES
            (existing_user_id, 'Dark Fantasy', 'genre_atmosphere', '{"primary": "#1a0b2e", "secondary": "#6f2dbd", "accent": "#e25d9d", "background": "#0f0615", "text": "#e8e4f3"}', true),
            (existing_user_id, 'Cozy Reader', 'color_palette', '{"primary": "#8b7355", "secondary": "#d4a574", "accent": "#f4e4c1", "background": "#f9f6f1", "text": "#3c2f2f"}', false);

        -- Character Relationships
        INSERT INTO public.character_relationships (story_id, user_id, character_a_name, character_b_name, relationship_type, relationship_strength) VALUES
            (existing_story_id, existing_user_id, 'Protagonist', 'Elder Morrigan', 'mentor', 0.85),
            (existing_story_id, existing_user_id, 'Protagonist', 'Shadow Figure', 'enemy', 0.72);

        -- Discovery Preferences
        INSERT INTO public.discovery_preferences (user_id, favorite_genres, preferred_writing_styles, emotional_tone_preferences) VALUES
            (existing_user_id, '["fantasy", "mystery", "adventure"]', '["descriptive", "character-driven", "atmospheric"]', '["mysterious", "hopeful", "suspenseful"]');

        -- Writing Prompts
        INSERT INTO public.writing_prompts (user_id, prompt_type, genre_specific, worldbuilding_focus) VALUES
            (existing_user_id, 'scene_expansion', 'fantasy', 'Develop the magic system rules and how they affect daily life in your world'),
            (existing_user_id, 'character_development', 'mystery', 'Create a character with a hidden past that gradually reveals their true motivations');
    END IF;
END $$;