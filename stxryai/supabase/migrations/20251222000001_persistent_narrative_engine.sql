-- ============================================================================
-- PERSISTENT NARRATIVE ENGINE
-- A comprehensive system for multi-book series with persistent memory,
-- character evolution, worldbuilding archives, and canon enforcement.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE ENUMS
-- ============================================================================

CREATE TYPE story_mode AS ENUM ('story', 'book', 'novel', 'series');
CREATE TYPE character_status AS ENUM ('active', 'deceased', 'missing', 'retired', 'transformed');
CREATE TYPE relationship_type AS ENUM ('ally', 'enemy', 'family', 'romantic', 'mentor', 'rival', 'neutral', 'complicated');
CREATE TYPE canon_lock_level AS ENUM ('suggestion', 'soft', 'hard', 'immutable');
CREATE TYPE world_element_type AS ENUM ('geography', 'culture', 'religion', 'magic_system', 'technology', 'political', 'economic', 'historical', 'myth', 'custom');
CREATE TYPE change_type AS ENUM ('physical', 'psychological', 'relational', 'status', 'ability', 'possession', 'location');
CREATE TYPE arc_type AS ENUM ('character', 'plot', 'thematic', 'relationship', 'world');
CREATE TYPE arc_status AS ENUM ('setup', 'rising', 'climax', 'falling', 'resolved', 'abandoned');

-- ============================================================================
-- SERIES MANAGEMENT
-- ============================================================================

-- Series: The top-level container for multi-book narratives
CREATE TABLE story_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  premise TEXT, -- The overarching concept
  genre TEXT NOT NULL,
  subgenres TEXT[] DEFAULT '{}',
  target_book_count INTEGER DEFAULT 1,
  current_book_count INTEGER DEFAULT 0,
  series_status TEXT DEFAULT 'planning' CHECK (series_status IN ('planning', 'active', 'on_hold', 'completed', 'abandoned')),
  
  -- Thematic elements
  primary_themes TEXT[] DEFAULT '{}',
  secondary_themes TEXT[] DEFAULT '{}',
  recurring_motifs TEXT[] DEFAULT '{}',
  
  -- Series-level arcs
  main_conflict TEXT,
  series_arc_summary TEXT,
  planned_ending TEXT,
  
  -- Configuration
  tone TEXT DEFAULT 'balanced',
  pacing TEXT DEFAULT 'moderate',
  target_audience TEXT DEFAULT 'adult',
  content_rating TEXT DEFAULT 'teen',
  
  -- Metadata
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Books within a series (or standalone books)
CREATE TABLE series_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Book positioning
  book_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  
  -- Book-level narrative
  book_premise TEXT,
  book_conflict TEXT,
  book_arc_summary TEXT,
  book_resolution TEXT,
  
  -- Story mode
  story_mode story_mode DEFAULT 'book',
  
  -- Target metrics
  target_word_count INTEGER,
  target_chapter_count INTEGER,
  current_word_count INTEGER DEFAULT 0,
  current_chapter_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'outlining', 'drafting', 'revising', 'editing', 'complete', 'published')),
  
  -- Timeline
  timeline_start TEXT, -- In-universe time
  timeline_end TEXT,
  time_skip_from_previous TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(series_id, book_number)
);

-- ============================================================================
-- CHARACTER PERSISTENCE SYSTEM
-- ============================================================================

-- Master character definitions (persistent across series)
CREATE TABLE persistent_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Identity
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  title TEXT, -- Dr., Lord, Captain, etc.
  
  -- Core traits (persistent baseline)
  core_personality JSONB DEFAULT '{}', -- { traits: [], values: [], fears: [], desires: [] }
  backstory TEXT,
  motivation TEXT,
  fatal_flaw TEXT,
  
  -- Physical baseline
  physical_description JSONB DEFAULT '{}', -- { height, build, hair, eyes, distinguishing_features: [] }
  age_at_series_start INTEGER,
  
  -- Role
  character_role TEXT DEFAULT 'supporting' CHECK (character_role IN ('protagonist', 'antagonist', 'deuteragonist', 'supporting', 'minor', 'background')),
  first_appears_book INTEGER DEFAULT 1,
  
  -- Status tracking
  current_status character_status DEFAULT 'active',
  status_changed_at TIMESTAMPTZ,
  status_change_reason TEXT,
  
  -- Voice
  dialogue_style TEXT,
  speech_patterns TEXT[] DEFAULT '{}',
  vocabulary_level TEXT DEFAULT 'average',
  typical_expressions TEXT[] DEFAULT '{}',
  
  -- Canon locks
  canon_lock_level canon_lock_level DEFAULT 'soft',
  locked_attributes TEXT[] DEFAULT '{}', -- List of attributes that cannot be changed by AI
  
  -- Metadata
  is_ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character state snapshots per book (evolution tracking)
CREATE TABLE character_book_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES persistent_characters(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE NOT NULL,
  
  -- State at book start
  status_at_start character_status DEFAULT 'active',
  age_at_book INTEGER,
  location_at_start TEXT,
  
  -- Physical state
  physical_changes TEXT[] DEFAULT '{}', -- Scars, injuries, transformations
  appearance_notes TEXT,
  
  -- Psychological state
  mental_state TEXT,
  emotional_arc TEXT,
  beliefs_at_start JSONB DEFAULT '{}',
  beliefs_at_end JSONB DEFAULT '{}',
  
  -- Relationship summary at book start/end
  key_relationships JSONB DEFAULT '{}', -- { character_id: { type, intensity, status } }
  
  -- Goals and conflicts
  book_goal TEXT,
  internal_conflict TEXT,
  external_conflict TEXT,
  
  -- Arc completion
  arc_type arc_type,
  arc_status arc_status DEFAULT 'setup',
  arc_resolution TEXT,
  
  -- Word presence
  word_count INTEGER DEFAULT 0,
  scene_count INTEGER DEFAULT 0,
  chapter_appearances INTEGER[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(character_id, book_id)
);

-- Character changes/events timeline
CREATE TABLE character_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES persistent_characters(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  
  -- Event details
  event_type change_type NOT NULL,
  event_description TEXT NOT NULL,
  event_cause TEXT,
  
  -- Timing
  occurred_at_chapter INTEGER,
  in_universe_date TEXT,
  
  -- Impact
  is_permanent BOOLEAN DEFAULT true,
  reversal_possible BOOLEAN DEFAULT false,
  significance_level INTEGER DEFAULT 5 CHECK (significance_level BETWEEN 1 AND 10),
  
  -- Before/after state
  previous_state JSONB DEFAULT '{}',
  new_state JSONB DEFAULT '{}',
  
  -- Canon
  canon_lock_level canon_lock_level DEFAULT 'soft',
  is_canon BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character relationships (bidirectional tracking)
CREATE TABLE character_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_a_id UUID REFERENCES persistent_characters(id) ON DELETE CASCADE NOT NULL,
  character_b_id UUID REFERENCES persistent_characters(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  
  -- Relationship from A's perspective
  relationship_type_a_to_b relationship_type DEFAULT 'neutral',
  intensity_a_to_b INTEGER DEFAULT 5 CHECK (intensity_a_to_b BETWEEN 1 AND 10),
  
  -- Relationship from B's perspective  
  relationship_type_b_to_a relationship_type DEFAULT 'neutral',
  intensity_b_to_a INTEGER DEFAULT 5 CHECK (intensity_b_to_a BETWEEN 1 AND 10),
  
  -- Relationship details
  relationship_history TEXT,
  first_meeting_description TEXT,
  current_dynamic TEXT,
  tension_points TEXT[] DEFAULT '{}',
  shared_history TEXT[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  ended_in_book INTEGER,
  ending_reason TEXT,
  
  -- Canon
  canon_lock_level canon_lock_level DEFAULT 'soft',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(character_a_id, character_b_id, series_id),
  CHECK(character_a_id < character_b_id) -- Ensure consistent ordering
);

-- Relationship evolution per book
CREATE TABLE relationship_book_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID REFERENCES character_relationships(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE NOT NULL,
  
  -- State at book start
  status_at_start JSONB DEFAULT '{}', -- { type_a_to_b, type_b_to_a, intensity }
  
  -- State at book end
  status_at_end JSONB DEFAULT '{}',
  
  -- Key events
  pivotal_moments TEXT[] DEFAULT '{}',
  conflicts TEXT[] DEFAULT '{}',
  resolutions TEXT[] DEFAULT '{}',
  
  -- Arc
  relationship_arc TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(relationship_id, book_id)
);

-- ============================================================================
-- WORLDBUILDING ARCHIVE
-- ============================================================================

-- World elements (persistent world state)
CREATE TABLE world_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_element_id UUID REFERENCES world_elements(id) ON DELETE SET NULL, -- Hierarchical structure
  
  -- Element identity
  element_type world_element_type NOT NULL,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  
  -- Description
  short_description TEXT,
  full_description TEXT,
  visual_description TEXT,
  
  -- Categorization
  category TEXT, -- Sub-type within element_type
  tags TEXT[] DEFAULT '{}',
  
  -- Relationships to other elements
  related_elements UUID[] DEFAULT '{}',
  conflicts_with UUID[] DEFAULT '{}',
  depends_on UUID[] DEFAULT '{}',
  
  -- Internal rules/logic
  rules JSONB DEFAULT '{}', -- { rules: [], constraints: [], exceptions: [] }
  
  -- First appearance
  introduced_in_book INTEGER,
  introduced_in_chapter INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  destroyed_in_book INTEGER,
  destruction_reason TEXT,
  
  -- Canon
  canon_lock_level canon_lock_level DEFAULT 'soft',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- World element changes over time
CREATE TABLE world_element_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_id UUID REFERENCES world_elements(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  
  -- Change details
  change_description TEXT NOT NULL,
  change_cause TEXT,
  change_type TEXT, -- expansion, destruction, transformation, revelation
  
  -- Before/after
  previous_state JSONB DEFAULT '{}',
  new_state JSONB DEFAULT '{}',
  
  -- Impact
  affected_elements UUID[] DEFAULT '{}',
  affected_characters UUID[] DEFAULT '{}',
  
  -- Canon
  is_canon BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geography/Locations
CREATE TABLE world_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_id UUID REFERENCES world_elements(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  
  -- Location details
  location_type TEXT, -- city, country, continent, building, realm, etc.
  coordinates JSONB DEFAULT '{}', -- { lat, lng } or custom coordinate system
  
  -- Parent location
  parent_location_id UUID REFERENCES world_locations(id) ON DELETE SET NULL,
  
  -- Properties
  population TEXT,
  climate TEXT,
  terrain TEXT,
  resources TEXT[] DEFAULT '{}',
  hazards TEXT[] DEFAULT '{}',
  
  -- Political
  controlling_faction TEXT,
  government_type TEXT,
  
  -- Connections
  connected_locations UUID[] DEFAULT '{}',
  travel_times JSONB DEFAULT '{}', -- { location_id: "2 days by horse" }
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Magic/Technology Systems
CREATE TABLE world_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_id UUID REFERENCES world_elements(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  
  -- System details
  system_type TEXT NOT NULL, -- magic, technology, psionics, divine, etc.
  system_name TEXT NOT NULL,
  
  -- Rules
  fundamental_laws TEXT[] DEFAULT '{}', -- The "physics" of this system
  energy_source TEXT,
  limitations TEXT[] DEFAULT '{}',
  costs TEXT[] DEFAULT '{}', -- What does using this cost?
  
  -- Hierarchy
  power_levels JSONB DEFAULT '{}', -- { levels: [], descriptions: [] }
  
  -- Users
  who_can_use TEXT,
  training_required BOOLEAN DEFAULT true,
  hereditary BOOLEAN DEFAULT false,
  
  -- Known abilities/effects
  known_abilities JSONB DEFAULT '{}', -- { name, description, requirements, effects }
  
  -- Forbidden/dangerous
  taboos TEXT[] DEFAULT '{}',
  dangers TEXT[] DEFAULT '{}',
  
  -- Canon
  canon_lock_level canon_lock_level DEFAULT 'hard',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Factions/Organizations
CREATE TABLE world_factions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_id UUID REFERENCES world_elements(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  
  -- Identity
  faction_name TEXT NOT NULL,
  faction_type TEXT, -- government, religion, guild, secret_society, etc.
  
  -- Structure
  leadership_type TEXT,
  hierarchy_structure TEXT,
  
  -- Goals
  public_goals TEXT[] DEFAULT '{}',
  secret_goals TEXT[] DEFAULT '{}',
  
  -- Resources
  power_base TEXT,
  military_strength TEXT,
  economic_power TEXT,
  
  -- Relationships
  allied_factions UUID[] DEFAULT '{}',
  enemy_factions UUID[] DEFAULT '{}',
  
  -- Key members (character references)
  leader_id UUID REFERENCES persistent_characters(id) ON DELETE SET NULL,
  key_members UUID[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  dissolved_in_book INTEGER,
  dissolution_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CANON ENFORCEMENT SYSTEM
-- ============================================================================

-- Canon rules/facts
CREATE TABLE canon_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Rule identity
  rule_category TEXT NOT NULL, -- character, world, plot, timeline, relationship, system
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  
  -- Rule specifics
  rule_type TEXT DEFAULT 'must' CHECK (rule_type IN ('must', 'must_not', 'should', 'should_not', 'may')),
  
  -- Scope
  applies_to_entity_type TEXT, -- character, location, faction, etc.
  applies_to_entity_ids UUID[] DEFAULT '{}',
  applies_from_book INTEGER DEFAULT 1,
  applies_until_book INTEGER, -- NULL means forever
  
  -- Lock level
  lock_level canon_lock_level DEFAULT 'hard',
  
  -- Violation handling
  violation_severity TEXT DEFAULT 'error' CHECK (violation_severity IN ('warning', 'error', 'critical')),
  violation_message TEXT,
  
  -- Examples
  valid_examples TEXT[] DEFAULT '{}',
  invalid_examples TEXT[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  superseded_by UUID REFERENCES canon_rules(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canon violations log
CREATE TABLE canon_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID REFERENCES canon_rules(id) ON DELETE SET NULL,
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  
  -- Violation details
  violation_type TEXT NOT NULL,
  violation_description TEXT NOT NULL,
  violating_content TEXT,
  
  -- Context
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  detected_by TEXT DEFAULT 'system', -- system, author, ai
  
  -- Resolution
  resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'ignored', 'overridden')),
  resolution_action TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  
  -- Override (if author chooses to break canon)
  is_intentional_override BOOLEAN DEFAULT false,
  override_reason TEXT
);

-- ============================================================================
-- NARRATIVE ARCS
-- ============================================================================

-- Story arcs (can span books)
CREATE TABLE narrative_arcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Arc identity
  arc_name TEXT NOT NULL,
  arc_type arc_type NOT NULL,
  arc_description TEXT,
  
  -- Scope
  starts_in_book INTEGER NOT NULL,
  ends_in_book INTEGER,
  starts_in_chapter INTEGER,
  ends_in_chapter INTEGER,
  
  -- Status
  arc_status arc_status DEFAULT 'setup',
  completion_percentage INTEGER DEFAULT 0,
  
  -- Arc structure (for plot arcs)
  setup_points TEXT[] DEFAULT '{}',
  rising_action_points TEXT[] DEFAULT '{}',
  climax_point TEXT,
  falling_action_points TEXT[] DEFAULT '{}',
  resolution_point TEXT,
  
  -- Connected elements
  primary_characters UUID[] DEFAULT '{}',
  secondary_characters UUID[] DEFAULT '{}',
  related_arcs UUID[] DEFAULT '{}',
  
  -- Themes
  themes TEXT[] DEFAULT '{}',
  
  -- Foreshadowing
  foreshadowing_elements JSONB DEFAULT '{}', -- { planted_in: [], payoff_in: [] }
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Arc progress tracking
CREATE TABLE arc_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arc_id UUID REFERENCES narrative_arcs(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  
  -- Progress
  progress_type TEXT NOT NULL, -- beat, milestone, complication, revelation
  progress_description TEXT NOT NULL,
  
  -- Status after this progress
  arc_status_after arc_status,
  completion_percentage_after INTEGER,
  
  -- Timing
  occurred_in_chapter INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONTINUITY TRACKING
-- ============================================================================

-- Timeline events (for chronology tracking)
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  
  -- Event details
  event_name TEXT NOT NULL,
  event_description TEXT,
  event_type TEXT, -- historical, current, flashback, prophecy
  
  -- Timing
  in_universe_date TEXT, -- Flexible format for fantasy calendars
  relative_timing TEXT, -- "2 years before Book 1", etc.
  sequence_number INTEGER, -- Absolute ordering
  
  -- Book/Chapter references
  referenced_in_books INTEGER[] DEFAULT '{}',
  first_mentioned_book INTEGER,
  first_mentioned_chapter INTEGER,
  
  -- Participants
  involved_characters UUID[] DEFAULT '{}',
  involved_factions UUID[] DEFAULT '{}',
  involved_locations UUID[] DEFAULT '{}',
  
  -- Impact
  consequences TEXT[] DEFAULT '{}',
  leads_to_events UUID[] DEFAULT '{}',
  caused_by_events UUID[] DEFAULT '{}',
  
  -- Canon
  is_canon BOOLEAN DEFAULT true,
  canon_lock_level canon_lock_level DEFAULT 'soft',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Continuity notes (author notes for tracking)
CREATE TABLE continuity_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Note details
  note_type TEXT NOT NULL, -- reminder, question, todo, inconsistency, idea
  note_title TEXT NOT NULL,
  note_content TEXT NOT NULL,
  
  -- References
  referenced_book INTEGER,
  referenced_chapter INTEGER,
  referenced_characters UUID[] DEFAULT '{}',
  referenced_elements UUID[] DEFAULT '{}',
  
  -- Priority
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Status
  is_resolved BOOLEAN DEFAULT false,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- POV AND NARRATIVE STRUCTURE
-- ============================================================================

-- POV tracking per chapter
CREATE TABLE chapter_pov (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE NOT NULL,
  
  -- POV character
  pov_character_id UUID REFERENCES persistent_characters(id) ON DELETE SET NULL,
  pov_type TEXT DEFAULT 'third_limited' CHECK (pov_type IN ('first', 'second', 'third_limited', 'third_omniscient', 'multiple')),
  
  -- Additional POV characters (for multiple POV chapters)
  secondary_pov_characters UUID[] DEFAULT '{}',
  
  -- Scene-level POV breakdown (for chapters with multiple POVs)
  pov_breakdown JSONB DEFAULT '{}', -- { scenes: [{ start_word: 0, end_word: 1000, pov_character_id: "" }] }
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subplots
CREATE TABLE subplots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  arc_id UUID REFERENCES narrative_arcs(id) ON DELETE SET NULL, -- Parent arc if any
  
  -- Subplot details
  subplot_name TEXT NOT NULL,
  subplot_description TEXT,
  subplot_type TEXT, -- romance, mystery, political, personal, etc.
  
  -- Scope
  starts_in_book INTEGER NOT NULL,
  ends_in_book INTEGER,
  
  -- Status
  status arc_status DEFAULT 'setup',
  
  -- Characters
  primary_characters UUID[] DEFAULT '{}',
  
  -- Integration
  integrates_with_main_plot BOOLEAN DEFAULT true,
  integration_points TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REVISION AND PROPAGATION
-- ============================================================================

-- Revision requests (for tracking changes that need propagation)
CREATE TABLE revision_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Request details
  revision_type TEXT NOT NULL, -- character_change, world_change, retcon, consistency_fix
  revision_description TEXT NOT NULL,
  
  -- Scope
  affects_entity_type TEXT NOT NULL, -- character, world_element, relationship, timeline
  affects_entity_id UUID NOT NULL,
  
  -- Books affected
  affects_books INTEGER[] DEFAULT '{}', -- Empty means all books
  
  -- The change
  old_value JSONB DEFAULT '{}',
  new_value JSONB DEFAULT '{}',
  
  -- Propagation
  propagation_status TEXT DEFAULT 'pending' CHECK (propagation_status IN ('pending', 'analyzing', 'ready', 'in_progress', 'completed', 'failed', 'cancelled')),
  
  -- Analysis results
  affected_chapters UUID[] DEFAULT '{}',
  required_changes JSONB DEFAULT '{}', -- { chapter_id: [{ type, description, suggested_edit }] }
  
  -- AI analysis
  ai_analysis TEXT,
  ai_suggested_changes JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Propagated changes log
CREATE TABLE propagated_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  revision_request_id UUID REFERENCES revision_requests(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  
  -- Change details
  change_type TEXT NOT NULL,
  original_content TEXT,
  updated_content TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'manual_review')),
  
  -- Review
  reviewed_by TEXT,
  review_notes TEXT,
  
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GENERATION CONTEXT
-- ============================================================================

-- Context snapshots for AI generation
CREATE TABLE generation_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES story_series(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES series_books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  
  -- Context type
  context_type TEXT NOT NULL, -- full_series, book_summary, chapter_context, scene_context
  
  -- Compiled context
  world_state JSONB DEFAULT '{}', -- Current state of relevant world elements
  active_characters JSONB DEFAULT '{}', -- Characters present with their current states
  relationship_map JSONB DEFAULT '{}', -- Current relationship states
  active_arcs JSONB DEFAULT '{}', -- Arcs in progress
  recent_events JSONB DEFAULT '{}', -- Recent significant events
  
  -- Constraints
  canon_rules JSONB DEFAULT '{}', -- Applicable canon rules
  locked_elements TEXT[] DEFAULT '{}', -- Elements that cannot be changed
  
  -- Narrative guidance
  tone_guidance TEXT,
  pacing_guidance TEXT,
  theme_reminders TEXT[] DEFAULT '{}',
  
  -- Foreshadowing
  pending_payoffs TEXT[] DEFAULT '{}', -- Foreshadowing that needs to pay off
  
  -- Generated at
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ -- Context may need refresh after this
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_series_books_series ON series_books(series_id);
CREATE INDEX idx_series_books_story ON series_books(story_id);
CREATE INDEX idx_persistent_characters_series ON persistent_characters(series_id);
CREATE INDEX idx_persistent_characters_status ON persistent_characters(current_status);
CREATE INDEX idx_character_book_states_character ON character_book_states(character_id);
CREATE INDEX idx_character_book_states_book ON character_book_states(book_id);
CREATE INDEX idx_character_events_character ON character_events(character_id);
CREATE INDEX idx_character_events_book ON character_events(book_id);
CREATE INDEX idx_character_relationships_series ON character_relationships(series_id);
CREATE INDEX idx_world_elements_series ON world_elements(series_id);
CREATE INDEX idx_world_elements_type ON world_elements(element_type);
CREATE INDEX idx_canon_rules_series ON canon_rules(series_id);
CREATE INDEX idx_canon_rules_category ON canon_rules(rule_category);
CREATE INDEX idx_narrative_arcs_series ON narrative_arcs(series_id);
CREATE INDEX idx_narrative_arcs_status ON narrative_arcs(arc_status);
CREATE INDEX idx_timeline_events_series ON timeline_events(series_id);
CREATE INDEX idx_timeline_events_sequence ON timeline_events(sequence_number);
CREATE INDEX idx_revision_requests_series ON revision_requests(series_id);
CREATE INDEX idx_revision_requests_status ON revision_requests(propagation_status);
CREATE INDEX idx_generation_contexts_series ON generation_contexts(series_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get character state at a specific book
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
    ), '[]'::jsonb),
    'relationships', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'with_character', CASE 
          WHEN cr.character_a_id = p_character_id THEN cr.character_b_id 
          ELSE cr.character_a_id 
        END,
        'type_to', CASE 
          WHEN cr.character_a_id = p_character_id THEN cr.relationship_type_a_to_b 
          ELSE cr.relationship_type_b_to_a 
        END,
        'intensity', CASE 
          WHEN cr.character_a_id = p_character_id THEN cr.intensity_a_to_b 
          ELSE cr.intensity_b_to_a 
        END
      ))
      FROM character_relationships cr
      WHERE (cr.character_a_id = p_character_id OR cr.character_b_id = p_character_id)
      AND cr.is_active = true
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

-- Function to check canon rule violations
CREATE OR REPLACE FUNCTION check_canon_violations(
  p_series_id UUID,
  p_book_number INTEGER,
  p_content TEXT
)
RETURNS TABLE (
  rule_id UUID,
  rule_name TEXT,
  violation_severity TEXT,
  violation_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.rule_name,
    cr.violation_severity,
    cr.violation_message
  FROM canon_rules cr
  WHERE cr.series_id = p_series_id
  AND cr.is_active = true
  AND cr.applies_from_book <= p_book_number
  AND (cr.applies_until_book IS NULL OR cr.applies_until_book >= p_book_number);
  -- Note: Actual content checking would need NLP/AI integration
END;
$$ LANGUAGE plpgsql;

-- Function to compile generation context
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
  -- Get book number
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
    -- World state
    (
      SELECT COALESCE(jsonb_agg(to_jsonb(we.*)), '[]'::jsonb)
      FROM world_elements we
      WHERE we.series_id = p_series_id
      AND we.is_active = true
    ),
    -- Active characters
    (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', pc.id,
          'name', pc.name,
          'role', pc.character_role,
          'status', pc.current_status,
          'core_personality', pc.core_personality
        )
      ), '[]'::jsonb)
      FROM persistent_characters pc
      WHERE pc.series_id = p_series_id
      AND pc.current_status = 'active'
      AND pc.first_appears_book <= v_book_number
    ),
    -- Relationships
    (
      SELECT COALESCE(jsonb_agg(to_jsonb(cr.*)), '[]'::jsonb)
      FROM character_relationships cr
      WHERE cr.series_id = p_series_id
      AND cr.is_active = true
    ),
    -- Active arcs
    (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', na.id,
          'name', na.arc_name,
          'type', na.arc_type,
          'status', na.arc_status,
          'completion', na.completion_percentage
        )
      ), '[]'::jsonb)
      FROM narrative_arcs na
      WHERE na.series_id = p_series_id
      AND na.arc_status NOT IN ('resolved', 'abandoned')
    ),
    -- Canon rules
    (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'category', cr.rule_category,
          'name', cr.rule_name,
          'rule', cr.rule_description,
          'type', cr.rule_type,
          'lock_level', cr.lock_level
        )
      ), '[]'::jsonb)
      FROM canon_rules cr
      WHERE cr.series_id = p_series_id
      AND cr.is_active = true
      AND cr.applies_from_book <= v_book_number
      AND (cr.applies_until_book IS NULL OR cr.applies_until_book >= v_book_number)
    )
  RETURNING id INTO v_context_id;
  
  RETURN v_context_id;
END;
$$ LANGUAGE plpgsql;

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
ALTER TABLE world_element_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE canon_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrative_arcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Policies for series
CREATE POLICY "Users can view their own series" ON story_series FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can create series" ON story_series FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own series" ON story_series FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own series" ON story_series FOR DELETE USING (auth.uid() = author_id);

-- Policies for books
CREATE POLICY "Users can view their own books" ON series_books FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can create books" ON series_books FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own books" ON series_books FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own books" ON series_books FOR DELETE USING (auth.uid() = author_id);

-- Policies for characters
CREATE POLICY "Users can view their own characters" ON persistent_characters FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can create characters" ON persistent_characters FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own characters" ON persistent_characters FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own characters" ON persistent_characters FOR DELETE USING (auth.uid() = author_id);

-- Policies for world elements
CREATE POLICY "Users can view their own world elements" ON world_elements FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can create world elements" ON world_elements FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own world elements" ON world_elements FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own world elements" ON world_elements FOR DELETE USING (auth.uid() = author_id);

-- Policies for canon rules
CREATE POLICY "Users can view their own canon rules" ON canon_rules FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can create canon rules" ON canon_rules FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own canon rules" ON canon_rules FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own canon rules" ON canon_rules FOR DELETE USING (auth.uid() = author_id);

-- Policies for narrative arcs
CREATE POLICY "Users can view their own narrative arcs" ON narrative_arcs FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can create narrative arcs" ON narrative_arcs FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own narrative arcs" ON narrative_arcs FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own narrative arcs" ON narrative_arcs FOR DELETE USING (auth.uid() = author_id);

