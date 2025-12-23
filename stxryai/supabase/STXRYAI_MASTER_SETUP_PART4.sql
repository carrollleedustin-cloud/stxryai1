-- ============================================================================
-- STXRYAI MASTER DATABASE SETUP - PART 4
-- ============================================================================
-- Creator Tools, Comments, Adaptive AI, TTS, Live Events, Moderation, GDPR
-- Run after STXRYAI_MASTER_SETUP_PART3.sql
-- ============================================================================

-- ============================================================================
-- PART 16: CREATOR TOOLS
-- ============================================================================

-- Story Drafts
CREATE TABLE IF NOT EXISTS public.story_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  genre TEXT,
  tags TEXT[] DEFAULT '{}',
  draft_status TEXT DEFAULT 'draft',
  is_auto_save BOOLEAN DEFAULT false,
  version_number INTEGER DEFAULT 1,
  parent_draft_id UUID REFERENCES public.story_drafts(id) ON DELETE SET NULL,
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapter Drafts
CREATE TABLE IF NOT EXISTS public.chapter_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  story_draft_id UUID NOT NULL REFERENCES public.story_drafts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  version_number INTEGER DEFAULT 1,
  parent_draft_id UUID REFERENCES public.chapter_drafts(id) ON DELETE SET NULL,
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draft Comments
CREATE TABLE IF NOT EXISTS public.draft_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES public.story_drafts(id) ON DELETE CASCADE,
  chapter_draft_id UUID REFERENCES public.chapter_drafts(id) ON DELETE CASCADE,
  commenter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general',
  start_position INTEGER,
  end_position INTEGER,
  selected_text TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Collaborators
CREATE TABLE IF NOT EXISTS public.story_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  invitation_status TEXT DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  contribution_percentage DECIMAL(5, 2) DEFAULT 0,
  words_contributed INTEGER DEFAULT 0,
  chapters_contributed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, collaborator_id)
);

-- Collaboration Sessions
CREATE TABLE IF NOT EXISTS public.collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_draft_id UUID REFERENCES public.chapter_drafts(id) ON DELETE CASCADE,
  session_name TEXT,
  started_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  participants UUID[] DEFAULT '{}',
  active_participants UUID[] DEFAULT '{}',
  changes_log JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing Templates
CREATE TABLE IF NOT EXISTS public.writing_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  template_content JSONB NOT NULL,
  template_type TEXT DEFAULT 'outline',
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template Usage
CREATE TABLE IF NOT EXISTS public.template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.writing_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  campaign_status TEXT DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  campaign_content JSONB DEFAULT '{}',
  target_audience JSONB DEFAULT '{}',
  channels TEXT[] DEFAULT '{}',
  social_media_platforms TEXT[] DEFAULT '{}',
  reach_count INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Media Posts
CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  post_type TEXT DEFAULT 'text',
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  link_url TEXT,
  hashtags TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  post_status TEXT DEFAULT 'draft',
  external_post_id TEXT,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  from_name TEXT,
  from_email TEXT,
  html_content TEXT,
  text_content TEXT,
  preview_text TEXT,
  recipient_list JSONB DEFAULT '[]',
  recipient_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  email_status TEXT DEFAULT 'draft',
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 17: CHAPTER COMMENTS
-- ============================================================================

-- Chapter Comments
CREATE TABLE IF NOT EXISTS public.chapter_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  paragraph_number INTEGER,
  sentence_start INTEGER,
  sentence_end INTEGER,
  selected_text TEXT,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  pinned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pinned_at TIMESTAMPTZ,
  is_hidden BOOLEAN DEFAULT false,
  hidden_reason TEXT,
  hidden_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hidden_at TIMESTAMPTZ,
  author_replied BOOLEAN DEFAULT false,
  author_reply_id UUID REFERENCES public.chapter_comments(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapter Comment Likes
CREATE TABLE IF NOT EXISTS public.chapter_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Chapter Comment Threads
CREATE TABLE IF NOT EXISTS public.chapter_comment_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  thread_title TEXT,
  thread_type TEXT DEFAULT 'discussion',
  comment_count INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT false,
  locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ,
  lock_reason TEXT,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapter Comment Subscriptions
CREATE TABLE IF NOT EXISTS public.chapter_comment_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
  subscription_type TEXT DEFAULT 'chapter',
  notify_on_reply BOOLEAN DEFAULT true,
  notify_on_author_reply BOOLEAN DEFAULT true,
  notify_on_like BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id, comment_id, subscription_type)
);

-- ============================================================================
-- PART 18: ADAPTIVE STORYTELLING & AI ASSISTANT
-- ============================================================================

-- User Reading Preferences
CREATE TABLE IF NOT EXISTS public.user_reading_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_pacing TEXT DEFAULT 'medium',
  preferred_narrative_style TEXT[] DEFAULT '{}',
  preferred_genre_tags TEXT[] DEFAULT '{}',
  preferred_content_rating TEXT DEFAULT 'all',
  preferred_themes TEXT[] DEFAULT '{}',
  preferred_tone TEXT[] DEFAULT '{}',
  preferred_choice_frequency TEXT DEFAULT 'medium',
  preferred_choice_complexity TEXT DEFAULT 'medium',
  preferred_branching_depth TEXT DEFAULT 'medium',
  ai_personality_profile JSONB DEFAULT '{}',
  reading_patterns JSONB DEFAULT '{}',
  engagement_patterns JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Adaptation Log
CREATE TABLE IF NOT EXISTS public.story_adaptation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  adaptation_type TEXT NOT NULL,
  original_content TEXT,
  adapted_content TEXT,
  adaptation_reason TEXT,
  ai_model TEXT DEFAULT 'gpt-4',
  confidence_score DECIMAL(3, 2),
  adaptation_parameters JSONB DEFAULT '{}',
  user_feedback TEXT,
  user_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Choice Predictions
CREATE TABLE IF NOT EXISTS public.choice_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  choice_id UUID,
  choice_text TEXT,
  choice_options JSONB DEFAULT '[]',
  predicted_choice_index INTEGER,
  predicted_choice_text TEXT,
  prediction_confidence DECIMAL(3, 2),
  actual_choice_index INTEGER,
  actual_choice_text TEXT,
  was_correct BOOLEAN,
  model_version TEXT DEFAULT 'v1',
  prediction_features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personalized Narrative Paths
CREATE TABLE IF NOT EXISTS public.personalized_narrative_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  path_name TEXT,
  path_description TEXT,
  is_active BOOLEAN DEFAULT true,
  personalization_factors JSONB DEFAULT '{}',
  adaptation_summary TEXT,
  current_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  path_progress DECIMAL(5, 2) DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0,
  completion_likelihood DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic Content Generation
CREATE TABLE IF NOT EXISTS public.dynamic_content_generation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  generation_type TEXT NOT NULL,
  original_template_id UUID,
  generated_content TEXT NOT NULL,
  generation_context JSONB DEFAULT '{}',
  generation_prompt TEXT,
  ai_model TEXT DEFAULT 'gpt-4',
  generation_parameters JSONB DEFAULT '{}',
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  quality_score DECIMAL(3, 2),
  coherence_score DECIMAL(3, 2),
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  user_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Writing Suggestions
CREATE TABLE IF NOT EXISTS public.ai_writing_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  suggestion_type TEXT NOT NULL,
  original_text TEXT,
  suggested_text TEXT,
  suggestion_context TEXT,
  ai_model TEXT DEFAULT 'gpt-4',
  confidence_score DECIMAL(3, 2),
  reasoning TEXT,
  status TEXT DEFAULT 'pending',
  user_feedback TEXT,
  applied_at TIMESTAMPTZ,
  start_position INTEGER,
  end_position INTEGER,
  selected_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plot Doctor Analyses
CREATE TABLE IF NOT EXISTS public.plot_doctor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  analyzed_content TEXT NOT NULL,
  issues_found JSONB DEFAULT '[]',
  issue_count INTEGER DEFAULT 0,
  severity_level TEXT,
  suggestions JSONB DEFAULT '[]',
  suggestion_count INTEGER DEFAULT 0,
  strengths JSONB DEFAULT '[]',
  strength_count INTEGER DEFAULT 0,
  overall_score DECIMAL(3, 2),
  overall_feedback TEXT,
  ai_model TEXT DEFAULT 'gpt-4',
  analysis_parameters JSONB DEFAULT '{}',
  tokens_used INTEGER,
  user_rating INTEGER,
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Idea Generations
CREATE TABLE IF NOT EXISTS public.ai_idea_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL,
  prompt TEXT,
  constraints JSONB DEFAULT '{}',
  generated_ideas JSONB DEFAULT '[]',
  idea_count INTEGER DEFAULT 0,
  selected_idea_index INTEGER,
  selected_idea JSONB,
  is_used BOOLEAN DEFAULT false,
  used_in_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  ai_model TEXT DEFAULT 'gpt-4',
  generation_parameters JSONB DEFAULT '{}',
  tokens_used INTEGER,
  user_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing Assistant Sessions
CREATE TABLE IF NOT EXISTS public.writing_assistant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL,
  session_name TEXT,
  current_context TEXT,
  conversation_history JSONB DEFAULT '[]',
  active_suggestions UUID[] DEFAULT '{}',
  suggestions_generated INTEGER DEFAULT 0,
  suggestions_accepted INTEGER DEFAULT 0,
  suggestions_rejected INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing Patterns
CREATE TABLE IF NOT EXISTS public.writing_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  pattern_type TEXT NOT NULL,
  pattern_description TEXT,
  occurrences JSONB DEFAULT '[]',
  occurrence_count INTEGER DEFAULT 0,
  context_text TEXT,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  suggested_improvements TEXT[] DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 19: ENGAGEMENT METRICS & NPC SYSTEM
-- ============================================================================

-- User Engagement Metrics
CREATE TABLE IF NOT EXISTS public.user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  metric_key TEXT,
  metric_value DECIMAL(10,2),
  time_on_scene INTEGER DEFAULT 0,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  choice_frequency DECIMAL(3,2) DEFAULT 0,
  choices_made_count INTEGER DEFAULT 0,
  scroll_depth DECIMAL(3,2) DEFAULT 0,
  engagement_score DECIMAL(3,2) DEFAULT 0.50,
  recommended_pacing TEXT DEFAULT 'balanced',
  pacing_adjustment_factor DECIMAL(3,2) DEFAULT 1.00,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story NPCs
CREATE TABLE IF NOT EXISTS public.story_npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  npc_name TEXT NOT NULL,
  npc_role TEXT,
  personality_traits TEXT[] DEFAULT '{}',
  base_dialogue_style TEXT,
  base_knowledge JSONB DEFAULT '{}',
  first_appears_chapter INTEGER DEFAULT 1,
  last_appears_chapter INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, npc_name)
);

-- NPC Memory
CREATE TABLE IF NOT EXISTS public.npc_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npc_id UUID NOT NULL REFERENCES public.story_npcs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  memory_content TEXT NOT NULL,
  chapter_number INTEGER,
  importance_score INTEGER DEFAULT 5,
  relationship_delta INTEGER DEFAULT 0,
  relationship_type TEXT,
  cumulative_relationship_score INTEGER DEFAULT 0,
  revealed_traits TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPC User Memories (alternate)
CREATE TABLE IF NOT EXISTS public.npc_user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npc_id UUID NOT NULL REFERENCES public.story_npcs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  memory_content TEXT NOT NULL,
  chapter_number INTEGER,
  importance_score DECIMAL(3,2) DEFAULT 0.50,
  relationship_delta INTEGER DEFAULT 0,
  cumulative_relationship_score INTEGER DEFAULT 0,
  revealed_traits JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pacing Adjustments
CREATE TABLE IF NOT EXISTS public.pacing_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  adjustment_type TEXT NOT NULL,
  engagement_trigger TEXT NOT NULL,
  adjustment_data JSONB DEFAULT '{}',
  generated_content TEXT,
  prompt_used TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Narrative Pacing Adjustments (alternate)
CREATE TABLE IF NOT EXISTS public.narrative_pacing_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL,
  engagement_trigger TEXT NOT NULL,
  adjustment_data JSONB DEFAULT '{}',
  generated_content TEXT,
  prompt_used TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adaptive Storytelling Analytics
CREATE TABLE IF NOT EXISTS public.adaptive_storytelling_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_adaptations INTEGER DEFAULT 0,
  adaptations_by_type JSONB DEFAULT '{}',
  average_confidence_score DECIMAL(3, 2) DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  prediction_accuracy DECIMAL(5, 2) DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0,
  session_duration_avg_minutes DECIMAL(10, 2) DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  personalization_effectiveness_score DECIMAL(3, 2) DEFAULT 0,
  user_satisfaction_score DECIMAL(3, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 20: AI ENHANCEMENT & PERSONALIZATION
-- ============================================================================

-- AI Prompt Templates
CREATE TABLE IF NOT EXISTS public.ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  prompt_category TEXT NOT NULL,
  template_name TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  context_variables JSONB DEFAULT '{}',
  creativity_level DECIMAL(3,2) DEFAULT 0.70,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic Prompt Chains
CREATE TABLE IF NOT EXISTS public.dynamic_prompt_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chain_name TEXT NOT NULL,
  prompt_sequence JSONB NOT NULL,
  context_history JSONB DEFAULT '[]',
  adaptation_rules JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Procedural Content
CREATE TABLE IF NOT EXISTS public.procedural_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  context_tags JSONB DEFAULT '[]',
  quality_score DECIMAL(3,2) DEFAULT 0.50,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Path Analytics
CREATE TABLE IF NOT EXISTS public.story_path_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  predicted_engagement DECIMAL(5,2) DEFAULT 50.00,
  emotional_intensity DECIMAL(3,2) DEFAULT 0.50,
  decision_weight DECIMAL(3,2) DEFAULT 0.50,
  outcome_impact TEXT,
  reader_choice_probability JSONB DEFAULT '{}',
  narrative_pacing_effect TEXT,
  arc_investment_score DECIMAL(5,2) DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading Journey Recaps
CREATE TABLE IF NOT EXISTS public.reading_journey_recaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  recap_type TEXT NOT NULL,
  choice_history JSONB DEFAULT '[]',
  moral_alignments JSONB DEFAULT '{}',
  relationship_dynamics JSONB DEFAULT '{}',
  narrative_milestones JSONB DEFAULT '[]',
  recap_content TEXT NOT NULL,
  spoiler_level TEXT DEFAULT 'safe',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Translations
CREATE TABLE IF NOT EXISTS public.story_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  target_language TEXT NOT NULL,
  original_content TEXT NOT NULL,
  translated_content TEXT NOT NULL,
  translation_status TEXT DEFAULT 'completed',
  tone_preservation_score DECIMAL(3,2) DEFAULT 0.80,
  cultural_adaptation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Glossary
CREATE TABLE IF NOT EXISTS public.story_glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  entry_name TEXT NOT NULL,
  entry_description TEXT NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  discovery_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  spoiler_protected BOOLEAN DEFAULT true,
  related_entries JSONB DEFAULT '[]',
  lore_depth INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User UI Themes
CREATE TABLE IF NOT EXISTS public.user_ui_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_name TEXT NOT NULL,
  theme_category TEXT NOT NULL,
  color_palette JSONB DEFAULT '{}',
  typography_settings JSONB DEFAULT '{}',
  layout_preferences JSONB DEFAULT '{}',
  animation_settings JSONB DEFAULT '{}',
  genre_atmosphere JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character Relationships (for tracking)
CREATE TABLE IF NOT EXISTS public.character_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  character_a_id UUID,
  character_b_id UUID,
  series_id UUID,
  character_a_name TEXT NOT NULL,
  character_b_name TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  relationship_type_a_to_b TEXT,
  relationship_type_b_to_a TEXT,
  intensity_a_to_b INTEGER DEFAULT 5,
  intensity_b_to_a INTEGER DEFAULT 5,
  relationship_strength DECIMAL(3,2) DEFAULT 0.50,
  relationship_history TEXT,
  first_meeting_description TEXT,
  current_dynamic TEXT,
  tension_points TEXT[] DEFAULT '{}',
  shared_history TEXT[] DEFAULT '{}',
  emotional_bonds JSONB DEFAULT '[]',
  conflict_history JSONB DEFAULT '[]',
  alliance_status TEXT,
  secret_dynamics TEXT,
  evolution_timeline JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  ended_in_book INTEGER,
  ending_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discovery Preferences
CREATE TABLE IF NOT EXISTS public.discovery_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_genres JSONB DEFAULT '[]',
  preferred_writing_styles JSONB DEFAULT '[]',
  emotional_tone_preferences JSONB DEFAULT '[]',
  branching_behavior_patterns JSONB DEFAULT '{}',
  reading_pace_preference TEXT DEFAULT 'moderate',
  content_maturity_level TEXT DEFAULT 'teen',
  discovery_algorithm_weights JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reader Feedback
CREATE TABLE IF NOT EXISTS public.reader_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL,
  gift_item JSONB DEFAULT '{}',
  milestone_achieved TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing Prompts
CREATE TABLE IF NOT EXISTS public.writing_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL,
  genre_specific TEXT,
  worldbuilding_focus TEXT,
  character_motivation_theme TEXT,
  scene_construction_guidance TEXT,
  atmospheric_enhancements JSONB DEFAULT '[]',
  psychological_layers TEXT,
  suggested_expansions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Continue in STXRYAI_MASTER_SETUP_PART5.sql for remaining tables, indexes, policies, and functions...

SELECT 'Part 4 Complete: Creator Tools, Chapter Comments, Adaptive AI, Engagement, AI Enhancement tables created.' AS status;


