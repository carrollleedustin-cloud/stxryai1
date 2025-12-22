-- ============================================================================
-- STXRYAI UNIFIED DATABASE SCHEMA
-- Complete setup including base tables AND Persistent Narrative Engine
-- ============================================================================
--
-- USAGE:
-- 1. Run this file ONCE in your Supabase SQL Editor to set up the complete database
-- 2. This includes:
--    - Base story platform tables (users, stories, chapters, etc.)
--    - Persistent Narrative Engine tables (series, characters, world elements, etc.)
--
-- IMPORTANT: Run migrations in order if you have existing data:
--    1. COMPLETE_SETUP.sql (base schema)
--    2. migrations/20251222000001_persistent_narrative_engine.sql
--
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- SECTION 1: BASE PLATFORM SCHEMA
-- ============================================================================
-- (See COMPLETE_SETUP.sql for full base schema)
-- The following are the key tables that the Narrative Engine depends on:

-- User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  subscription_tier TEXT DEFAULT 'free',
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories (simple stories - legacy support)
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}',
  genre TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  estimated_duration INTEGER,
  content_maturity TEXT DEFAULT 'everyone',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Chapters
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  choices JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, chapter_number)
);

-- ============================================================================
-- SECTION 2: PERSISTENT NARRATIVE ENGINE SCHEMA
-- ============================================================================

-- ============================================================================
-- CORE ENUMS
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_mode') THEN
    CREATE TYPE story_mode AS ENUM ('story', 'book', 'novel', 'series');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'character_status') THEN
    CREATE TYPE character_status AS ENUM ('active', 'deceased', 'missing', 'retired', 'transformed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canon_lock_level') THEN
    CREATE TYPE canon_lock_level AS ENUM ('suggestion', 'soft', 'hard', 'immutable');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'world_element_type') THEN
    CREATE TYPE world_element_type AS ENUM ('geography', 'culture', 'religion', 'magic_system', 'technology', 'political', 'economic', 'historical', 'myth', 'custom');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_type') THEN
    CREATE TYPE change_type AS ENUM ('physical', 'psychological', 'relational', 'status', 'ability', 'possession', 'location');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'arc_type') THEN
    CREATE TYPE arc_type AS ENUM ('character', 'plot', 'thematic', 'relationship', 'world');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'arc_status') THEN
    CREATE TYPE arc_status AS ENUM ('setup', 'rising', 'climax', 'falling', 'resolved', 'abandoned');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ne_relationship_type') THEN
    CREATE TYPE ne_relationship_type AS ENUM ('ally', 'enemy', 'family', 'romantic', 'mentor', 'rival', 'neutral', 'complicated');
  END IF;
END $$;

-- ============================================================================
-- SERIES MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.story_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  premise TEXT,
  genre TEXT NOT NULL,
  subgenres TEXT[] DEFAULT '{}',
  target_book_count INTEGER DEFAULT 1,
  current_book_count INTEGER DEFAULT 0,
  series_status TEXT DEFAULT 'planning' CHECK (series_status IN ('planning', 'active', 'on_hold', 'completed', 'abandoned')),
  primary_themes TEXT[] DEFAULT '{}',
  secondary_themes TEXT[] DEFAULT '{}',
  recurring_motifs TEXT[] DEFAULT '{}',
  main_conflict TEXT,
  series_arc_summary TEXT,
  planned_ending TEXT,
  tone TEXT DEFAULT 'balanced',
  pacing TEXT DEFAULT 'moderate',
  target_audience TEXT DEFAULT 'adult',
  content_rating TEXT DEFAULT 'teen',
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.series_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  book_premise TEXT,
  book_conflict TEXT,
  book_arc_summary TEXT,
  book_resolution TEXT,
  story_mode story_mode DEFAULT 'book',
  target_word_count INTEGER,
  target_chapter_count INTEGER,
  current_word_count INTEGER DEFAULT 0,
  current_chapter_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'outlining', 'drafting', 'revising', 'editing', 'complete', 'published')),
  timeline_start TEXT,
  timeline_end TEXT,
  time_skip_from_previous TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, book_number)
);

-- ============================================================================
-- CHARACTER PERSISTENCE SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.persistent_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  title TEXT,
  core_personality JSONB DEFAULT '{}',
  backstory TEXT,
  motivation TEXT,
  fatal_flaw TEXT,
  physical_description JSONB DEFAULT '{}',
  age_at_series_start INTEGER,
  character_role TEXT DEFAULT 'supporting' CHECK (character_role IN ('protagonist', 'antagonist', 'deuteragonist', 'supporting', 'minor', 'background')),
  first_appears_book INTEGER DEFAULT 1,
  current_status character_status DEFAULT 'active',
  status_changed_at TIMESTAMPTZ,
  status_change_reason TEXT,
  dialogue_style TEXT,
  speech_patterns TEXT[] DEFAULT '{}',
  vocabulary_level TEXT DEFAULT 'average',
  typical_expressions TEXT[] DEFAULT '{}',
  canon_lock_level canon_lock_level DEFAULT 'soft',
  locked_attributes TEXT[] DEFAULT '{}',
  is_ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.character_book_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES persistent_characters(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE NOT NULL,
  status_at_start character_status DEFAULT 'active',
  age_at_book INTEGER,
  location_at_start TEXT,
  physical_changes TEXT[] DEFAULT '{}',
  appearance_notes TEXT,
  mental_state TEXT,
  emotional_arc TEXT,
  beliefs_at_start JSONB DEFAULT '{}',
  beliefs_at_end JSONB DEFAULT '{}',
  key_relationships JSONB DEFAULT '{}',
  book_goal TEXT,
  internal_conflict TEXT,
  external_conflict TEXT,
  arc_type arc_type,
  arc_status arc_status DEFAULT 'setup',
  arc_resolution TEXT,
  word_count INTEGER DEFAULT 0,
  scene_count INTEGER DEFAULT 0,
  chapter_appearances INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, book_id)
);

CREATE TABLE IF NOT EXISTS public.character_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES persistent_characters(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  event_type change_type NOT NULL,
  event_description TEXT NOT NULL,
  event_cause TEXT,
  occurred_at_chapter INTEGER,
  in_universe_date TEXT,
  is_permanent BOOLEAN DEFAULT true,
  reversal_possible BOOLEAN DEFAULT false,
  significance_level INTEGER DEFAULT 5 CHECK (significance_level BETWEEN 1 AND 10),
  previous_state JSONB DEFAULT '{}',
  new_state JSONB DEFAULT '{}',
  canon_lock_level canon_lock_level DEFAULT 'soft',
  is_canon BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.character_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_a_id UUID REFERENCES persistent_characters(id) ON DELETE CASCADE NOT NULL,
  character_b_id UUID REFERENCES persistent_characters(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  relationship_type_a_to_b ne_relationship_type DEFAULT 'neutral',
  intensity_a_to_b INTEGER DEFAULT 5 CHECK (intensity_a_to_b BETWEEN 1 AND 10),
  relationship_type_b_to_a ne_relationship_type DEFAULT 'neutral',
  intensity_b_to_a INTEGER DEFAULT 5 CHECK (intensity_b_to_a BETWEEN 1 AND 10),
  relationship_history TEXT,
  first_meeting_description TEXT,
  current_dynamic TEXT,
  tension_points TEXT[] DEFAULT '{}',
  shared_history TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  ended_in_book INTEGER,
  ending_reason TEXT,
  canon_lock_level canon_lock_level DEFAULT 'soft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_a_id, character_b_id, series_id),
  CHECK(character_a_id < character_b_id)
);

-- ============================================================================
-- WORLDBUILDING ARCHIVE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.world_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_element_id UUID REFERENCES world_elements(id) ON DELETE SET NULL,
  element_type world_element_type NOT NULL,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  short_description TEXT,
  full_description TEXT,
  visual_description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  related_elements UUID[] DEFAULT '{}',
  conflicts_with UUID[] DEFAULT '{}',
  depends_on UUID[] DEFAULT '{}',
  rules JSONB DEFAULT '{}',
  introduced_in_book INTEGER,
  introduced_in_chapter INTEGER,
  is_active BOOLEAN DEFAULT true,
  destroyed_in_book INTEGER,
  destruction_reason TEXT,
  canon_lock_level canon_lock_level DEFAULT 'soft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.world_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_id UUID REFERENCES world_elements(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  location_type TEXT,
  coordinates JSONB DEFAULT '{}',
  parent_location_id UUID REFERENCES world_locations(id) ON DELETE SET NULL,
  population TEXT,
  climate TEXT,
  terrain TEXT,
  resources TEXT[] DEFAULT '{}',
  hazards TEXT[] DEFAULT '{}',
  controlling_faction TEXT,
  government_type TEXT,
  connected_locations UUID[] DEFAULT '{}',
  travel_times JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.world_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_id UUID REFERENCES world_elements(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  system_type TEXT NOT NULL,
  system_name TEXT NOT NULL,
  fundamental_laws TEXT[] DEFAULT '{}',
  energy_source TEXT,
  limitations TEXT[] DEFAULT '{}',
  costs TEXT[] DEFAULT '{}',
  power_levels JSONB DEFAULT '{}',
  who_can_use TEXT,
  training_required BOOLEAN DEFAULT true,
  hereditary BOOLEAN DEFAULT false,
  known_abilities JSONB DEFAULT '{}',
  taboos TEXT[] DEFAULT '{}',
  dangers TEXT[] DEFAULT '{}',
  canon_lock_level canon_lock_level DEFAULT 'hard',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.world_factions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_id UUID REFERENCES world_elements(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  faction_name TEXT NOT NULL,
  faction_type TEXT,
  leadership_type TEXT,
  hierarchy_structure TEXT,
  public_goals TEXT[] DEFAULT '{}',
  secret_goals TEXT[] DEFAULT '{}',
  power_base TEXT,
  military_strength TEXT,
  economic_power TEXT,
  allied_factions UUID[] DEFAULT '{}',
  enemy_factions UUID[] DEFAULT '{}',
  leader_id UUID REFERENCES persistent_characters(id) ON DELETE SET NULL,
  key_members UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  dissolved_in_book INTEGER,
  dissolution_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CANON ENFORCEMENT SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.canon_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rule_category TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  rule_type TEXT DEFAULT 'must' CHECK (rule_type IN ('must', 'must_not', 'should', 'should_not', 'may')),
  applies_to_entity_type TEXT,
  applies_to_entity_ids UUID[] DEFAULT '{}',
  applies_from_book INTEGER DEFAULT 1,
  applies_until_book INTEGER,
  lock_level canon_lock_level DEFAULT 'hard',
  violation_severity TEXT DEFAULT 'error' CHECK (violation_severity IN ('warning', 'error', 'critical')),
  violation_message TEXT,
  valid_examples TEXT[] DEFAULT '{}',
  invalid_examples TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  superseded_by UUID REFERENCES canon_rules(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.canon_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID REFERENCES canon_rules(id) ON DELETE SET NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  violation_type TEXT NOT NULL,
  violation_description TEXT NOT NULL,
  violating_content TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  detected_by TEXT DEFAULT 'system',
  resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'ignored', 'overridden')),
  resolution_action TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  is_intentional_override BOOLEAN DEFAULT false,
  override_reason TEXT
);

-- ============================================================================
-- NARRATIVE ARCS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.narrative_arcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  arc_name TEXT NOT NULL,
  arc_type arc_type NOT NULL,
  arc_description TEXT,
  starts_in_book INTEGER NOT NULL,
  ends_in_book INTEGER,
  starts_in_chapter INTEGER,
  ends_in_chapter INTEGER,
  arc_status arc_status DEFAULT 'setup',
  completion_percentage INTEGER DEFAULT 0,
  setup_points TEXT[] DEFAULT '{}',
  rising_action_points TEXT[] DEFAULT '{}',
  climax_point TEXT,
  falling_action_points TEXT[] DEFAULT '{}',
  resolution_point TEXT,
  primary_characters UUID[] DEFAULT '{}',
  secondary_characters UUID[] DEFAULT '{}',
  related_arcs UUID[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',
  foreshadowing_elements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TIMELINE & CONTINUITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  event_name TEXT NOT NULL,
  event_description TEXT,
  event_type TEXT,
  in_universe_date TEXT,
  relative_timing TEXT,
  sequence_number INTEGER,
  referenced_in_books INTEGER[] DEFAULT '{}',
  first_mentioned_book INTEGER,
  first_mentioned_chapter INTEGER,
  involved_characters UUID[] DEFAULT '{}',
  involved_factions UUID[] DEFAULT '{}',
  involved_locations UUID[] DEFAULT '{}',
  consequences TEXT[] DEFAULT '{}',
  leads_to_events UUID[] DEFAULT '{}',
  caused_by_events UUID[] DEFAULT '{}',
  is_canon BOOLEAN DEFAULT true,
  canon_lock_level canon_lock_level DEFAULT 'soft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.continuity_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note_type TEXT NOT NULL,
  note_title TEXT NOT NULL,
  note_content TEXT NOT NULL,
  referenced_book INTEGER,
  referenced_chapter INTEGER,
  referenced_characters UUID[] DEFAULT '{}',
  referenced_elements UUID[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_resolved BOOLEAN DEFAULT false,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GENERATION CONTEXT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.generation_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  context_type TEXT NOT NULL,
  world_state JSONB DEFAULT '{}',
  active_characters JSONB DEFAULT '{}',
  relationship_map JSONB DEFAULT '{}',
  active_arcs JSONB DEFAULT '{}',
  recent_events JSONB DEFAULT '{}',
  canon_rules JSONB DEFAULT '{}',
  locked_elements TEXT[] DEFAULT '{}',
  tone_guidance TEXT,
  pacing_guidance TEXT,
  theme_reminders TEXT[] DEFAULT '{}',
  pending_payoffs TEXT[] DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_story_series_author ON story_series(author_id);
CREATE INDEX IF NOT EXISTS idx_series_books_series ON series_books(series_id);
CREATE INDEX IF NOT EXISTS idx_series_books_story ON series_books(story_id);
CREATE INDEX IF NOT EXISTS idx_persistent_characters_series ON persistent_characters(series_id);
CREATE INDEX IF NOT EXISTS idx_persistent_characters_status ON persistent_characters(current_status);
CREATE INDEX IF NOT EXISTS idx_character_book_states_character ON character_book_states(character_id);
CREATE INDEX IF NOT EXISTS idx_character_book_states_book ON character_book_states(book_id);
CREATE INDEX IF NOT EXISTS idx_character_events_character ON character_events(character_id);
CREATE INDEX IF NOT EXISTS idx_character_relationships_series ON character_relationships(series_id);
CREATE INDEX IF NOT EXISTS idx_world_elements_series ON world_elements(series_id);
CREATE INDEX IF NOT EXISTS idx_world_elements_type ON world_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_canon_rules_series ON canon_rules(series_id);
CREATE INDEX IF NOT EXISTS idx_narrative_arcs_series ON narrative_arcs(series_id);
CREATE INDEX IF NOT EXISTS idx_narrative_arcs_status ON narrative_arcs(arc_status);
CREATE INDEX IF NOT EXISTS idx_timeline_events_series ON timeline_events(series_id);
CREATE INDEX IF NOT EXISTS idx_generation_contexts_series ON generation_contexts(series_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE story_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE persistent_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_book_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canon_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE canon_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrative_arcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_contexts ENABLE ROW LEVEL SECURITY;

-- Series policies
CREATE POLICY IF NOT EXISTS "Users can view their own series" ON story_series FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can view published series" ON story_series FOR SELECT USING (is_published = true);
CREATE POLICY IF NOT EXISTS "Users can create series" ON story_series FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can update their own series" ON story_series FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own series" ON story_series FOR DELETE USING (auth.uid() = author_id);

-- Books policies
CREATE POLICY IF NOT EXISTS "Users can view their own books" ON series_books FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can create books" ON series_books FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can update their own books" ON series_books FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own books" ON series_books FOR DELETE USING (auth.uid() = author_id);

-- Characters policies
CREATE POLICY IF NOT EXISTS "Users can view their own characters" ON persistent_characters FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can create characters" ON persistent_characters FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can update their own characters" ON persistent_characters FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own characters" ON persistent_characters FOR DELETE USING (auth.uid() = author_id);

-- World elements policies
CREATE POLICY IF NOT EXISTS "Users can view their own world elements" ON world_elements FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can create world elements" ON world_elements FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can update their own world elements" ON world_elements FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own world elements" ON world_elements FOR DELETE USING (auth.uid() = author_id);

-- Canon rules policies
CREATE POLICY IF NOT EXISTS "Users can view their own canon rules" ON canon_rules FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can create canon rules" ON canon_rules FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can update their own canon rules" ON canon_rules FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own canon rules" ON canon_rules FOR DELETE USING (auth.uid() = author_id);

-- Narrative arcs policies
CREATE POLICY IF NOT EXISTS "Users can view their own narrative arcs" ON narrative_arcs FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can create narrative arcs" ON narrative_arcs FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can update their own narrative arcs" ON narrative_arcs FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own narrative arcs" ON narrative_arcs FOR DELETE USING (auth.uid() = author_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Increment series book count
CREATE OR REPLACE FUNCTION increment_series_book_count(p_series_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE story_series 
  SET current_book_count = current_book_count + 1,
      updated_at = NOW()
  WHERE id = p_series_id;
END;
$$ LANGUAGE plpgsql;

-- Get character state at a specific book
CREATE OR REPLACE FUNCTION get_character_state_at_book(
  p_character_id UUID,
  p_book_number INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'character', to_jsonb(pc.*),
    'book_state', to_jsonb(cbs.*),
    'events', COALESCE((
      SELECT jsonb_agg(to_jsonb(ce.*) ORDER BY ce.occurred_at_chapter)
      FROM character_events ce
      JOIN series_books sb ON ce.book_id = sb.id
      WHERE ce.character_id = p_character_id
      AND sb.book_number <= p_book_number
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM persistent_characters pc
  LEFT JOIN series_books sb ON sb.series_id = pc.series_id AND sb.book_number = p_book_number
  LEFT JOIN character_book_states cbs ON cbs.character_id = pc.id AND cbs.book_id = sb.id
  WHERE pc.id = p_character_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Compile generation context
CREATE OR REPLACE FUNCTION compile_generation_context(
  p_series_id UUID,
  p_book_id UUID,
  p_chapter_number INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_context_id UUID;
  v_book_number INTEGER;
BEGIN
  SELECT book_number INTO v_book_number FROM series_books WHERE id = p_book_id;
  
  INSERT INTO generation_contexts (
    series_id,
    book_id,
    context_type,
    world_state,
    active_characters,
    relationship_map,
    active_arcs,
    canon_rules
  )
  SELECT 
    p_series_id,
    p_book_id,
    CASE 
      WHEN p_chapter_number IS NOT NULL THEN 'chapter_context'
      WHEN p_book_id IS NOT NULL THEN 'book_summary'
      ELSE 'full_series'
    END,
    (SELECT COALESCE(jsonb_agg(to_jsonb(we.*)), '[]'::jsonb) FROM world_elements we WHERE we.series_id = p_series_id AND we.is_active = true),
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('id', pc.id, 'name', pc.name, 'role', pc.character_role, 'status', pc.current_status, 'core_personality', pc.core_personality)), '[]'::jsonb) FROM persistent_characters pc WHERE pc.series_id = p_series_id AND pc.current_status = 'active' AND pc.first_appears_book <= v_book_number),
    (SELECT COALESCE(jsonb_agg(to_jsonb(cr.*)), '[]'::jsonb) FROM character_relationships cr WHERE cr.series_id = p_series_id AND cr.is_active = true),
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('id', na.id, 'name', na.arc_name, 'type', na.arc_type, 'status', na.arc_status, 'completion', na.completion_percentage)), '[]'::jsonb) FROM narrative_arcs na WHERE na.series_id = p_series_id AND na.arc_status NOT IN ('resolved', 'abandoned')),
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('category', cr.rule_category, 'name', cr.rule_name, 'rule', cr.rule_description, 'type', cr.rule_type, 'lock_level', cr.lock_level)), '[]'::jsonb) FROM canon_rules cr WHERE cr.series_id = p_series_id AND cr.is_active = true AND cr.applies_from_book <= v_book_number AND (cr.applies_until_book IS NULL OR cr.applies_until_book >= v_book_number))
  RETURNING id INTO v_context_id;
  
  RETURN v_context_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEMA SETUP COMPLETE
-- ============================================================================

SELECT 'Unified StxryAI schema setup complete!' AS status;

