-- Location: supabase/migrations/20251208111137_add_ai_narrative_features.sql
-- Schema Analysis: Extends existing story/user system with AI narrative capabilities
-- Integration Type: NEW_MODULE - Dynamic Pacing + NPC Memory
-- Dependencies: user_profiles, stories, story_chapters, user_reading_progress

-- ==================== PART 1: TYPES ====================

-- Engagement level classification for dynamic pacing
CREATE TYPE public.engagement_level AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');

-- NPC relationship status tracking
CREATE TYPE public.npc_relationship_type AS ENUM ('neutral', 'friendly', 'hostile', 'romantic', 'mentor', 'rival');

-- ==================== PART 2: CORE TABLES ====================

-- Track user engagement metrics for dynamic pacing
CREATE TABLE public.user_engagement_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE CASCADE,
    
    -- Time-based metrics
    time_on_scene INTEGER DEFAULT 0, -- seconds
    session_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMPTZ,
    
    -- Interaction metrics
    choice_frequency NUMERIC(3,2) DEFAULT 0.00, -- choices per minute
    choices_made_count INTEGER DEFAULT 0,
    scroll_depth NUMERIC(3,2) DEFAULT 0.00, -- 0.00 to 1.00
    
    -- Calculated engagement
    engagement_score NUMERIC(3,2) DEFAULT 0.50, -- 0.00 to 1.00
    engagement_level public.engagement_level DEFAULT 'medium'::public.engagement_level,
    
    -- Pacing recommendations
    recommended_pacing TEXT DEFAULT 'balanced', -- slow, balanced, fast
    pacing_adjustment_factor NUMERIC(3,2) DEFAULT 1.00, -- 0.5 to 2.0
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, story_id, chapter_id)
);

-- Store NPCs with their base characteristics
CREATE TABLE public.story_npcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- NPC identity
    npc_name TEXT NOT NULL,
    npc_role TEXT, -- protagonist, antagonist, mentor, sidekick
    personality_traits JSONB DEFAULT '[]'::JSONB, -- ["brave", "loyal", "cautious"]
    
    -- Base characteristics
    base_dialogue_style TEXT, -- formal, casual, mysterious
    base_knowledge JSONB DEFAULT '{}'::JSONB, -- what NPC knows by default
    
    -- Appearance tracking
    first_appears_chapter INTEGER,
    last_appears_chapter INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(story_id, npc_name)
);

-- Track NPC memory of user interactions
CREATE TABLE public.npc_user_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npc_id UUID NOT NULL REFERENCES public.story_npcs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Memory content
    memory_type TEXT NOT NULL, -- choice, dialogue, event, trait_revealed
    memory_content TEXT NOT NULL,
    chapter_number INTEGER,
    importance_score NUMERIC(3,2) DEFAULT 0.50, -- 0.00 to 1.00
    
    -- Relationship impact
    relationship_delta INTEGER DEFAULT 0, -- -10 to +10
    relationship_type public.npc_relationship_type DEFAULT 'neutral'::public.npc_relationship_type,
    cumulative_relationship_score INTEGER DEFAULT 0,
    
    -- User traits revealed to NPC
    revealed_traits JSONB DEFAULT '[]'::JSONB, -- ["heroic", "cautious", "diplomatic"]
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(npc_id, user_id, memory_type, chapter_number)
);

-- Track dynamic story adjustments based on pacing
CREATE TABLE public.narrative_pacing_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE CASCADE,
    
    -- Adjustment details
    adjustment_type TEXT NOT NULL, -- descriptive_passage, plot_acceleration, choice_frequency
    engagement_trigger public.engagement_level NOT NULL,
    adjustment_data JSONB DEFAULT '{}'::JSONB,
    
    -- AI generation prompt
    generated_content TEXT,
    prompt_used TEXT,
    
    applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PART 3: INDEXES ====================

CREATE INDEX idx_engagement_metrics_user_story ON public.user_engagement_metrics(user_id, story_id);
CREATE INDEX idx_engagement_metrics_level ON public.user_engagement_metrics(engagement_level);
CREATE INDEX idx_story_npcs_story ON public.story_npcs(story_id);
CREATE INDEX idx_npc_memories_npc_user ON public.npc_user_memories(npc_id, user_id);
CREATE INDEX idx_npc_memories_story ON public.npc_user_memories(story_id);
CREATE INDEX idx_npc_memories_relationship ON public.npc_user_memories(relationship_type);
CREATE INDEX idx_pacing_adjustments_user_story ON public.narrative_pacing_adjustments(user_id, story_id);

-- ==================== PART 4: FUNCTIONS ====================

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(
    time_seconds INTEGER,
    choice_freq NUMERIC,
    scroll_d NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $func$
DECLARE
    time_score NUMERIC;
    choice_score NUMERIC;
    scroll_score NUMERIC;
    final_score NUMERIC;
BEGIN
    -- Time score: optimal engagement around 60-180 seconds per scene
    time_score := CASE
        WHEN time_seconds < 30 THEN 0.3
        WHEN time_seconds BETWEEN 30 AND 60 THEN 0.5
        WHEN time_seconds BETWEEN 60 AND 180 THEN 1.0
        WHEN time_seconds BETWEEN 180 AND 300 THEN 0.7
        ELSE 0.4
    END;
    
    -- Choice frequency score: 0.5-2.0 choices per minute is optimal
    choice_score := CASE
        WHEN choice_freq < 0.3 THEN 0.4
        WHEN choice_freq BETWEEN 0.3 AND 0.5 THEN 0.6
        WHEN choice_freq BETWEEN 0.5 AND 2.0 THEN 1.0
        WHEN choice_freq BETWEEN 2.0 AND 3.0 THEN 0.7
        ELSE 0.5
    END;
    
    -- Scroll depth score
    scroll_score := scroll_d;
    
    -- Weighted average
    final_score := (time_score * 0.4) + (choice_score * 0.3) + (scroll_score * 0.3);
    
    RETURN LEAST(1.0, GREATEST(0.0, final_score));
END;
$func$;

-- Function to determine engagement level
CREATE OR REPLACE FUNCTION public.get_engagement_level(score NUMERIC)
RETURNS public.engagement_level
LANGUAGE plpgsql
STABLE
AS $func$
BEGIN
    RETURN CASE
        WHEN score < 0.2 THEN 'very_low'::public.engagement_level
        WHEN score < 0.4 THEN 'low'::public.engagement_level
        WHEN score < 0.6 THEN 'medium'::public.engagement_level
        WHEN score < 0.8 THEN 'high'::public.engagement_level
        ELSE 'very_high'::public.engagement_level
    END;
END;
$func$;

-- Function to get pacing recommendation
CREATE OR REPLACE FUNCTION public.recommend_pacing(level public.engagement_level)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $func$
BEGIN
    RETURN CASE level
        WHEN 'very_low'::public.engagement_level THEN 'fast'
        WHEN 'low'::public.engagement_level THEN 'fast'
        WHEN 'medium'::public.engagement_level THEN 'balanced'
        WHEN 'high'::public.engagement_level THEN 'balanced'
        WHEN 'very_high'::public.engagement_level THEN 'slow'
    END;
END;
$func$;

-- Trigger to auto-calculate engagement metrics
CREATE OR REPLACE FUNCTION public.update_engagement_calculations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    calc_score NUMERIC;
    calc_level public.engagement_level;
BEGIN
    -- Calculate engagement score
    calc_score := public.calculate_engagement_score(
        NEW.time_on_scene,
        NEW.choice_frequency,
        NEW.scroll_depth
    );
    
    -- Determine engagement level
    calc_level := public.get_engagement_level(calc_score);
    
    -- Update fields
    NEW.engagement_score := calc_score;
    NEW.engagement_level := calc_level;
    NEW.recommended_pacing := public.recommend_pacing(calc_level);
    NEW.pacing_adjustment_factor := CASE calc_level
        WHEN 'very_low'::public.engagement_level THEN 1.5
        WHEN 'low'::public.engagement_level THEN 1.3
        WHEN 'medium'::public.engagement_level THEN 1.0
        WHEN 'high'::public.engagement_level THEN 0.9
        WHEN 'very_high'::public.engagement_level THEN 0.7
    END;
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$func$;

-- Function to update NPC relationship
CREATE OR REPLACE FUNCTION public.update_npc_relationship()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    total_score INTEGER;
BEGIN
    -- Calculate cumulative relationship score
    SELECT COALESCE(SUM(relationship_delta), 0) INTO total_score
    FROM public.npc_user_memories
    WHERE npc_id = NEW.npc_id AND user_id = NEW.user_id;
    
    NEW.cumulative_relationship_score := total_score;
    
    -- Determine relationship type based on cumulative score
    NEW.relationship_type := CASE
        WHEN total_score < -20 THEN 'hostile'::public.npc_relationship_type
        WHEN total_score < -5 THEN 'rival'::public.npc_relationship_type
        WHEN total_score < 5 THEN 'neutral'::public.npc_relationship_type
        WHEN total_score < 15 THEN 'friendly'::public.npc_relationship_type
        WHEN total_score < 25 THEN 'mentor'::public.npc_relationship_type
        ELSE 'romantic'::public.npc_relationship_type
    END;
    
    RETURN NEW;
END;
$func$;

-- ==================== PART 5: RLS SETUP ====================

ALTER TABLE public.user_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.npc_user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narrative_pacing_adjustments ENABLE ROW LEVEL SECURITY;

-- ==================== PART 6: RLS POLICIES ====================

-- User engagement metrics: users manage own data
CREATE POLICY "users_manage_own_engagement_metrics"
ON public.user_engagement_metrics
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Story NPCs: public read, authors manage
CREATE POLICY "public_can_view_story_npcs"
ON public.story_npcs
FOR SELECT
TO public
USING (EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_npcs.story_id
    AND s.status = 'published'::public.story_status
));

CREATE POLICY "authors_manage_story_npcs"
ON public.story_npcs
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_npcs.story_id
    AND s.author_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_npcs.story_id
    AND s.author_id = auth.uid()
));

-- NPC memories: users manage own memories
CREATE POLICY "users_manage_own_npc_memories"
ON public.npc_user_memories
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pacing adjustments: users view own adjustments
CREATE POLICY "users_view_own_pacing_adjustments"
ON public.narrative_pacing_adjustments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_create_pacing_adjustments"
ON public.narrative_pacing_adjustments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ==================== PART 7: TRIGGERS ====================

CREATE TRIGGER update_engagement_calculations_trigger
    BEFORE INSERT OR UPDATE ON public.user_engagement_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_engagement_calculations();

CREATE TRIGGER update_npc_relationship_trigger
    BEFORE INSERT OR UPDATE ON public.npc_user_memories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_npc_relationship();

-- ==================== PART 8: MOCK DATA ====================

DO $$
DECLARE
    story1_id UUID;
    story2_id UUID;
    user1_id UUID;
    npc1_id UUID;
    npc2_id UUID;
    chapter1_id UUID;
BEGIN
    -- Get existing story and user IDs
    SELECT id INTO story1_id FROM public.stories WHERE title = 'The Enchanted Forest Mystery' LIMIT 1;
    SELECT id INTO story2_id FROM public.stories WHERE title = 'Cyber Nexus 2077' LIMIT 1;
    SELECT id INTO user1_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO chapter1_id FROM public.story_chapters WHERE story_id = story1_id LIMIT 1;
    
    -- Create sample NPCs for story 1
    INSERT INTO public.story_npcs (id, story_id, npc_name, npc_role, personality_traits, base_dialogue_style, base_knowledge, first_appears_chapter)
    VALUES
        (gen_random_uuid(), story1_id, 'Eldrin the Wise', 'mentor', '["wise", "patient", "mysterious"]'::JSONB, 'formal', '{"forest_secrets": true, "ancient_magic": true}'::JSONB, 1),
        (gen_random_uuid(), story1_id, 'Shadow Wolf', 'antagonist', '["cunning", "aggressive", "loyal"]'::JSONB, 'mysterious', '{"forest_paths": true, "pack_locations": true}'::JSONB, 2)
    RETURNING id INTO npc1_id;
    
    -- Get second NPC ID
    SELECT id INTO npc2_id FROM public.story_npcs WHERE story_id = story1_id AND npc_name = 'Shadow Wolf';
    
    -- Create sample engagement metrics
    INSERT INTO public.user_engagement_metrics (user_id, story_id, chapter_id, time_on_scene, choice_frequency, choices_made_count, scroll_depth)
    VALUES
        (user1_id, story1_id, chapter1_id, 120, 1.5, 3, 0.85),
        (user1_id, story2_id, NULL, 45, 0.8, 2, 0.45);
    
    -- Create sample NPC memories
    IF npc1_id IS NOT NULL THEN
        INSERT INTO public.npc_user_memories (npc_id, user_id, story_id, memory_type, memory_content, chapter_number, importance_score, relationship_delta, revealed_traits)
        VALUES
            (npc1_id, user1_id, story1_id, 'choice', 'User chose to trust Eldrin with the ancient artifact', 1, 0.9, 5, '["trustworthy", "brave"]'::JSONB),
            (npc1_id, user1_id, story1_id, 'dialogue', 'User asked about the forest history respectfully', 1, 0.7, 3, '["curious", "respectful"]'::JSONB);
    END IF;
    
    IF npc2_id IS NOT NULL THEN
        INSERT INTO public.npc_user_memories (npc_id, user_id, story_id, memory_type, memory_content, chapter_number, importance_score, relationship_delta, revealed_traits)
        VALUES
            (npc2_id, user1_id, story1_id, 'event', 'User spared the wolf cub during encounter', 2, 0.95, 8, '["merciful", "nature_lover"]'::JSONB);
    END IF;
    
    -- Create sample pacing adjustments
    INSERT INTO public.narrative_pacing_adjustments (user_id, story_id, chapter_id, adjustment_type, engagement_trigger, adjustment_data, generated_content)
    VALUES
        (user1_id, story1_id, chapter1_id, 'plot_acceleration', 'high'::public.engagement_level, 
         '{"reason": "High engagement detected, accelerating plot"}'::JSONB,
         'A sudden rustle in the bushes draws your attention. Before you can react, a mysterious figure emerges from the shadows...');
         
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion completed with some records skipped: %', SQLERRM;
END $$;