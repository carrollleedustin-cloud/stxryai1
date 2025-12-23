-- ============================================================================
-- STXRYAI MASTER DATABASE SETUP - PART 3
-- ============================================================================
-- AI Features, Narrative Engine, Global Story, Creator Tools
-- Run after STXRYAI_MASTER_SETUP_PART2.sql
-- ============================================================================

-- ============================================================================
-- PART 13: AI & NARRATIVE ENGINE
-- ============================================================================

-- AI Generations
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL,
  prompt TEXT,
  result TEXT,
  tokens_used INTEGER DEFAULT 0,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reader Story Sessions
CREATE TABLE IF NOT EXISTS public.reader_story_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  current_chapter INTEGER DEFAULT 1,
  session_data JSONB DEFAULT '{}',
  companion_memory JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Reader Choice History
CREATE TABLE IF NOT EXISTS public.reader_choice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.reader_story_sessions(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  choice_text TEXT NOT NULL,
  choice_result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic Story Branches
CREATE TABLE IF NOT EXISTS public.dynamic_story_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  parent_chapter INTEGER,
  branch_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Series
CREATE TABLE IF NOT EXISTS public.story_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  premise TEXT,
  genre TEXT NOT NULL,
  subgenres TEXT[] DEFAULT '{}',
  target_book_count INTEGER DEFAULT 1,
  current_book_count INTEGER DEFAULT 0,
  series_status TEXT DEFAULT 'planning',
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

-- Series Books
CREATE TABLE IF NOT EXISTS public.series_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  book_premise TEXT,
  book_conflict TEXT,
  book_arc_summary TEXT,
  book_resolution TEXT,
  status TEXT DEFAULT 'planning',
  target_word_count INTEGER,
  target_chapter_count INTEGER,
  current_word_count INTEGER DEFAULT 0,
  current_chapter_count INTEGER DEFAULT 0,
  timeline_start TEXT,
  timeline_end TEXT,
  time_skip_from_previous TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, book_number)
);

-- Persistent Characters
CREATE TABLE IF NOT EXISTS public.persistent_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  full_name TEXT,
  aliases TEXT[] DEFAULT '{}',
  title TEXT,
  character_type TEXT DEFAULT 'supporting',
  character_role TEXT DEFAULT 'supporting',
  status TEXT DEFAULT 'active',
  current_status TEXT DEFAULT 'active',
  biography TEXT,
  backstory TEXT,
  motivation TEXT,
  fatal_flaw TEXT,
  physical_description JSONB DEFAULT '{}',
  core_personality JSONB DEFAULT '{}',
  personality_traits TEXT[] DEFAULT '{}',
  abilities TEXT[] DEFAULT '{}',
  relationships JSONB DEFAULT '[]',
  age_at_series_start INTEGER,
  first_appearance_book INTEGER DEFAULT 1,
  first_appears_book INTEGER DEFAULT 1,
  dialogue_style TEXT,
  speech_patterns TEXT[] DEFAULT '{}',
  vocabulary_level TEXT DEFAULT 'average',
  typical_expressions TEXT[] DEFAULT '{}',
  status_changed_at TIMESTAMPTZ,
  status_change_reason TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character Events
CREATE TABLE IF NOT EXISTS public.character_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES public.persistent_characters(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.series_books(id) ON DELETE CASCADE,
  chapter_id UUID,
  book_number INTEGER,
  chapter_number INTEGER,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  event_cause TEXT,
  occurred_at_chapter INTEGER,
  in_universe_date TEXT,
  is_permanent BOOLEAN DEFAULT true,
  reversal_possible BOOLEAN DEFAULT false,
  significance_level INTEGER DEFAULT 5,
  impact_level TEXT DEFAULT 'minor',
  previous_state JSONB DEFAULT '{}',
  new_state JSONB DEFAULT '{}',
  is_canon BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character Book States
CREATE TABLE IF NOT EXISTS public.character_book_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES public.persistent_characters(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.series_books(id) ON DELETE CASCADE,
  book_number INTEGER NOT NULL,
  status_at_start TEXT DEFAULT 'active',
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
  arc_resolution TEXT,
  word_count INTEGER DEFAULT 0,
  scene_count INTEGER DEFAULT 0,
  chapter_appearances INTEGER[] DEFAULT '{}',
  state_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, book_number)
);

-- World Elements
CREATE TABLE IF NOT EXISTS public.world_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_element_id UUID REFERENCES public.world_elements(id) ON DELETE SET NULL,
  element_type TEXT NOT NULL,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  short_description TEXT,
  full_description TEXT,
  visual_description TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  properties JSONB DEFAULT '{}',
  rules JSONB DEFAULT '{}',
  related_elements UUID[] DEFAULT '{}',
  conflicts_with UUID[] DEFAULT '{}',
  depends_on UUID[] DEFAULT '{}',
  introduced_in_book INTEGER,
  introduced_in_chapter INTEGER,
  first_mentioned_book INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  destroyed_in_book INTEGER,
  destruction_reason TEXT,
  canon_level TEXT DEFAULT 'soft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Narrative Arcs
CREATE TABLE IF NOT EXISTS public.narrative_arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  arc_name TEXT NOT NULL,
  arc_type TEXT NOT NULL,
  arc_status TEXT DEFAULT 'setup',
  arc_description TEXT,
  description TEXT,
  starts_in_book INTEGER,
  ends_in_book INTEGER,
  start_book INTEGER,
  end_book INTEGER,
  starts_in_chapter INTEGER,
  ends_in_chapter INTEGER,
  completion_percentage INTEGER DEFAULT 0,
  setup_points TEXT[] DEFAULT '{}',
  rising_action_points TEXT[] DEFAULT '{}',
  climax_point TEXT,
  falling_action_points TEXT[] DEFAULT '{}',
  resolution_point TEXT,
  resolution_notes TEXT,
  primary_characters UUID[] DEFAULT '{}',
  secondary_characters UUID[] DEFAULT '{}',
  related_arcs UUID[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',
  foreshadowing_elements JSONB DEFAULT '{}',
  key_events JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canon Rules
CREATE TABLE IF NOT EXISTS public.canon_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_category TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  rule_type TEXT DEFAULT 'must',
  applies_to_entity_type TEXT,
  applies_to_entity_ids UUID[] DEFAULT '{}',
  applies_from_book INTEGER DEFAULT 1,
  applies_until_book INTEGER,
  applies_to JSONB DEFAULT '[]',
  exceptions TEXT[] DEFAULT '{}',
  lock_level TEXT DEFAULT 'hard',
  violation_severity TEXT DEFAULT 'error',
  violation_message TEXT,
  valid_examples TEXT[] DEFAULT '{}',
  invalid_examples TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  superseded_by UUID REFERENCES public.canon_rules(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canon Violations
CREATE TABLE IF NOT EXISTS public.canon_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  rule_id UUID REFERENCES public.canon_rules(id) ON DELETE SET NULL,
  book_id UUID,
  chapter_id UUID,
  detected_in_book INTEGER,
  detected_in_chapter INTEGER,
  violation_type TEXT,
  violation_description TEXT NOT NULL,
  violating_content TEXT,
  severity TEXT DEFAULT 'warning',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  detected_by TEXT DEFAULT 'system',
  resolution_status TEXT DEFAULT 'pending',
  resolution_action TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  is_intentional_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Continuity Notes
CREATE TABLE IF NOT EXISTS public.continuity_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL,
  note_title TEXT,
  note_content TEXT,
  description TEXT NOT NULL,
  related_elements JSONB DEFAULT '[]',
  referenced_book INTEGER,
  referenced_chapter INTEGER,
  book_number INTEGER,
  chapter_number INTEGER,
  referenced_characters UUID[] DEFAULT '{}',
  referenced_elements UUID[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium',
  is_resolved BOOLEAN DEFAULT false,
  resolution TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 14: GLOBAL STORY & DONATIONS
-- ============================================================================

-- Global Stories
CREATE TABLE IF NOT EXISTS public.global_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  theme TEXT,
  starting_premise TEXT NOT NULL,
  current_content TEXT NOT NULL DEFAULT '',
  chapter_count INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,
  unique_contributors INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Global Story Chapters
CREATE TABLE IF NOT EXISTS public.global_story_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_story_id UUID NOT NULL REFERENCES public.global_stories(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  ai_generated_choices JSONB DEFAULT '[]',
  winning_action_id UUID,
  winning_action_text TEXT,
  votes_tallied BOOLEAN DEFAULT FALSE,
  voting_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(global_story_id, chapter_number)
);

-- Global Story Actions
CREATE TABLE IF NOT EXISTS public.global_story_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_story_id UUID NOT NULL REFERENCES public.global_stories(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.global_story_chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_text TEXT NOT NULL,
  preset_choice_index INTEGER,
  vote_count INTEGER DEFAULT 1,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(global_story_id, chapter_id, user_id)
);

-- Global Story Action Votes
CREATE TABLE IF NOT EXISTS public.global_story_action_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES public.global_story_actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(action_id, user_id)
);

-- Global Story User Cooldowns
CREATE TABLE IF NOT EXISTS public.global_story_user_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_story_id UUID NOT NULL REFERENCES public.global_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_action_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_contributions INTEGER DEFAULT 1,
  UNIQUE(global_story_id, user_id)
);

-- Donation Tiers
CREATE TABLE IF NOT EXISTS public.donation_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  description TEXT,
  min_amount INTEGER NOT NULL,
  max_amount INTEGER,
  badge_icon TEXT,
  badge_emoji TEXT,
  badge_name TEXT,
  badge_color TEXT,
  badge_description TEXT,
  perks JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  tier_id UUID REFERENCES public.donation_tiers(id) ON DELETE SET NULL,
  payment_provider TEXT,
  payment_id TEXT,
  stripe_payment_id TEXT,
  payment_status TEXT DEFAULT 'completed',
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Donation Badges
CREATE TABLE IF NOT EXISTS public.user_donation_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.donation_tiers(id) ON DELETE CASCADE,
  total_donated INTEGER DEFAULT 0,
  badge_earned_at TIMESTAMPTZ DEFAULT NOW(),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_displayed BOOLEAN DEFAULT true,
  UNIQUE(user_id, tier_id)
);

-- Donation Leaderboard
CREATE TABLE IF NOT EXISTS public.donation_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_donated INTEGER DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  highest_tier_id UUID REFERENCES public.donation_tiers(id) ON DELETE SET NULL,
  last_donation_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 15: CREATOR ANALYTICS
-- ============================================================================

-- Creator Analytics Snapshots
CREATE TABLE IF NOT EXISTS public.creator_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  period_type TEXT NOT NULL,
  total_views INTEGER DEFAULT 0,
  unique_readers INTEGER DEFAULT 0,
  total_reads INTEGER DEFAULT 0,
  average_reading_time_minutes DECIMAL(10, 2) DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_subscriptions INTEGER DEFAULT 0,
  total_tips DECIMAL(10, 2) DEFAULT 0,
  average_purchase_value DECIMAL(10, 2) DEFAULT 0,
  new_readers INTEGER DEFAULT 0,
  returning_readers INTEGER DEFAULT 0,
  top_countries JSONB DEFAULT '[]',
  top_demographics JSONB DEFAULT '{}',
  chapters_published INTEGER DEFAULT 0,
  words_written INTEGER DEFAULT 0,
  average_chapter_length INTEGER DEFAULT 0,
  views_growth_percentage DECIMAL(5, 2) DEFAULT 0,
  revenue_growth_percentage DECIMAL(5, 2) DEFAULT 0,
  readers_growth_percentage DECIMAL(5, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, story_id, snapshot_date, period_type)
);

-- Story Performance Tracking
CREATE TABLE IF NOT EXISTS public.story_performance_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE UNIQUE,
  current_views INTEGER DEFAULT 0,
  current_readers INTEGER DEFAULT 0,
  current_likes INTEGER DEFAULT 0,
  current_comments INTEGER DEFAULT 0,
  current_reviews INTEGER DEFAULT 0,
  current_bookmarks INTEGER DEFAULT 0,
  current_rating DECIMAL(3, 2) DEFAULT 0,
  current_rating_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_subscriptions INTEGER DEFAULT 0,
  total_tips DECIMAL(10, 2) DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0,
  popularity_score DECIMAL(5, 2) DEFAULT 0,
  revenue_score DECIMAL(5, 2) DEFAULT 0,
  overall_score DECIMAL(5, 2) DEFAULT 0,
  views_trend TEXT,
  revenue_trend TEXT,
  engagement_trend TEXT,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audience Insights
CREATE TABLE IF NOT EXISTS public.audience_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  country_distribution JSONB DEFAULT '{}',
  city_distribution JSONB DEFAULT '{}',
  age_distribution JSONB DEFAULT '{}',
  gender_distribution JSONB DEFAULT '{}',
  device_distribution JSONB DEFAULT '{}',
  browser_distribution JSONB DEFAULT '{}',
  os_distribution JSONB DEFAULT '{}',
  average_session_duration_minutes DECIMAL(10, 2) DEFAULT 0,
  average_chapters_per_session DECIMAL(5, 2) DEFAULT 0,
  peak_reading_times JSONB DEFAULT '{}',
  preferred_genres JSONB DEFAULT '[]',
  most_active_days JSONB DEFAULT '{}',
  retention_rate DECIMAL(5, 2) DEFAULT 0,
  churn_rate DECIMAL(5, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue Analytics
CREATE TABLE IF NOT EXISTS public.revenue_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL,
  purchase_revenue DECIMAL(10, 2) DEFAULT 0,
  subscription_revenue DECIMAL(10, 2) DEFAULT 0,
  tip_revenue DECIMAL(10, 2) DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  subscription_count INTEGER DEFAULT 0,
  tip_count INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  average_purchase_value DECIMAL(10, 2) DEFAULT 0,
  average_subscription_value DECIMAL(10, 2) DEFAULT 0,
  average_tip_value DECIMAL(10, 2) DEFAULT 0,
  views_to_purchase_rate DECIMAL(5, 2) DEFAULT 0,
  readers_to_purchase_rate DECIMAL(5, 2) DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  revenue_by_story JSONB DEFAULT '{}',
  revenue_by_country JSONB DEFAULT '{}',
  revenue_growth_percentage DECIMAL(5, 2) DEFAULT 0,
  transaction_growth_percentage DECIMAL(5, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Continue in STXRYAI_MASTER_SETUP_PART4.sql...

SELECT 'Part 3 Complete: AI/Narrative Engine, Global Story, Donations, and Creator Analytics tables created.' AS status;


