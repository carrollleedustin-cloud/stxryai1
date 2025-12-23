-- ========================================
-- STXRYAI: Global Community Story & Donation System
-- Version: 1.0.0
-- Date: 2024-12-22
-- ========================================

-- ==========================================
-- GLOBAL COMMUNITY STORY
-- ==========================================

-- Global Stories (admin-managed, one active at a time)
CREATE TABLE IF NOT EXISTS public.global_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  theme TEXT, -- 'fantasy', 'sci-fi', 'mystery', etc.
  starting_premise TEXT NOT NULL, -- The initial story setup
  current_content TEXT NOT NULL DEFAULT '', -- Full accumulated story
  chapter_count INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,
  unique_contributors INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_global_stories_status ON public.global_stories(status);
CREATE INDEX IF NOT EXISTS idx_global_stories_active ON public.global_stories(status) WHERE status = 'active';

-- Global Story Chapters (segments of the story)
CREATE TABLE IF NOT EXISTS public.global_story_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_story_id UUID NOT NULL REFERENCES public.global_stories(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  ai_generated_choices JSONB DEFAULT '[]', -- Pre-generated choice options
  winning_action_id UUID, -- Reference to the action that won
  winning_action_text TEXT, -- The text of the winning action
  votes_tallied BOOLEAN DEFAULT FALSE,
  voting_ends_at TIMESTAMPTZ, -- When voting for next action closes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(global_story_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_global_chapters_story ON public.global_story_chapters(global_story_id);
CREATE INDEX IF NOT EXISTS idx_global_chapters_voting ON public.global_story_chapters(voting_ends_at) WHERE votes_tallied = FALSE;

-- User Actions on Global Story (one per 24 hours)
CREATE TABLE IF NOT EXISTS public.global_story_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_story_id UUID NOT NULL REFERENCES public.global_stories(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.global_story_chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'preset_choice', 'custom_write'
  action_text TEXT NOT NULL, -- The action/choice text
  preset_choice_index INTEGER, -- If preset, which choice index
  vote_count INTEGER DEFAULT 1, -- Others can upvote popular actions
  is_selected BOOLEAN DEFAULT FALSE, -- Was this the winning action?
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One action per user per chapter
  UNIQUE(global_story_id, chapter_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_global_actions_story ON public.global_story_actions(global_story_id);
CREATE INDEX IF NOT EXISTS idx_global_actions_chapter ON public.global_story_actions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_global_actions_user ON public.global_story_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_global_actions_votes ON public.global_story_actions(chapter_id, vote_count DESC);

-- Action Votes (users can upvote other users' actions)
CREATE TABLE IF NOT EXISTS public.global_story_action_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES public.global_story_actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(action_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_action_votes_action ON public.global_story_action_votes(action_id);
CREATE INDEX IF NOT EXISTS idx_action_votes_user ON public.global_story_action_votes(user_id);

-- User's last action time (for 24-hour cooldown)
CREATE TABLE IF NOT EXISTS public.global_story_user_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_story_id UUID NOT NULL REFERENCES public.global_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_action_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_contributions INTEGER DEFAULT 1,
  UNIQUE(global_story_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cooldowns_story_user ON public.global_story_user_cooldowns(global_story_id, user_id);
CREATE INDEX IF NOT EXISTS idx_cooldowns_last_action ON public.global_story_user_cooldowns(last_action_at);

-- ==========================================
-- DONATION SYSTEM
-- ==========================================

-- Donation Tiers
CREATE TABLE IF NOT EXISTS public.donation_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  min_amount DECIMAL(10,2) NOT NULL, -- Minimum donation for this tier
  max_amount DECIMAL(10,2), -- Max amount (null = unlimited)
  badge_emoji TEXT NOT NULL, -- The badge emoji
  badge_color TEXT NOT NULL, -- CSS color for the badge
  badge_description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default donation tiers
INSERT INTO public.donation_tiers (name, display_name, min_amount, max_amount, badge_emoji, badge_color, badge_description, sort_order) VALUES
  ('supporter', 'Supporter', 1.00, 4.99, '💚', '#22c55e', 'Thanks for your support!', 1),
  ('friend', 'Friend', 5.00, 9.99, '💙', '#3b82f6', 'A true friend of StxryAI', 2),
  ('champion', 'Champion', 10.00, 24.99, '💜', '#8b5cf6', 'Story Champion', 3),
  ('hero', 'Hero', 25.00, 49.99, '🧡', '#f97316', 'Community Hero', 4),
  ('legend', 'Legend', 50.00, 99.99, '💛', '#eab308', 'Legendary Supporter', 5),
  ('patron', 'Patron', 100.00, NULL, '❤️', '#ef4444', 'StxryAI Patron', 6)
ON CONFLICT (name) DO NOTHING;

-- User Donations
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  tier_id UUID REFERENCES public.donation_tiers(id),
  payment_provider TEXT, -- 'stripe', 'paypal', etc.
  payment_id TEXT, -- External payment reference
  payment_status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
  message TEXT, -- Optional thank you message from donor
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_user ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_tier ON public.donations(tier_id);
CREATE INDEX IF NOT EXISTS idx_donations_created ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(payment_status);

-- User Donation Badges (earned badges based on total donations)
CREATE TABLE IF NOT EXISTS public.user_donation_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.donation_tiers(id) ON DELETE CASCADE,
  total_donated DECIMAL(10,2) NOT NULL, -- Total amount at time of earning
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_displayed BOOLEAN DEFAULT TRUE, -- User can choose to show/hide
  UNIQUE(user_id, tier_id)
);

CREATE INDEX IF NOT EXISTS idx_donation_badges_user ON public.user_donation_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_badges_tier ON public.user_donation_badges(tier_id);

-- Donation Leaderboard View (top donors)
CREATE OR REPLACE VIEW public.donation_leaderboard AS
SELECT 
  u.id as user_id,
  u.username,
  u.avatar_url,
  COALESCE(SUM(d.amount), 0) as total_donated,
  COUNT(d.id) as donation_count,
  MAX(dt.badge_emoji) as highest_badge,
  MAX(dt.display_name) as highest_tier,
  MAX(d.created_at) as last_donation_at
FROM auth.users u
LEFT JOIN public.donations d ON d.user_id = u.id AND d.payment_status = 'completed' AND d.is_anonymous = FALSE
LEFT JOIN public.donation_tiers dt ON d.tier_id = dt.id
GROUP BY u.id, u.username, u.avatar_url
HAVING COALESCE(SUM(d.amount), 0) > 0
ORDER BY total_donated DESC;

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Check if user can take action (24-hour cooldown)
CREATE OR REPLACE FUNCTION public.can_user_take_global_action(
  p_user_id UUID,
  p_story_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_action TIMESTAMPTZ;
BEGIN
  SELECT last_action_at INTO v_last_action
  FROM public.global_story_user_cooldowns
  WHERE user_id = p_user_id AND global_story_id = p_story_id;
  
  IF v_last_action IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RETURN v_last_action < NOW() - INTERVAL '24 hours';
END;
$$;

-- Submit global story action
CREATE OR REPLACE FUNCTION public.submit_global_story_action(
  p_user_id UUID,
  p_story_id UUID,
  p_chapter_id UUID,
  p_action_type TEXT,
  p_action_text TEXT,
  p_preset_index INTEGER DEFAULT NULL
)
RETURNS TABLE (success BOOLEAN, message TEXT, action_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_can_act BOOLEAN;
  v_new_action_id UUID;
BEGIN
  -- Check cooldown
  v_can_act := public.can_user_take_global_action(p_user_id, p_story_id);
  
  IF NOT v_can_act THEN
    RETURN QUERY SELECT FALSE, 'You can only take one action every 24 hours', NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if chapter is still accepting actions
  IF NOT EXISTS (
    SELECT 1 FROM public.global_story_chapters 
    WHERE id = p_chapter_id 
    AND votes_tallied = FALSE
    AND (voting_ends_at IS NULL OR voting_ends_at > NOW())
  ) THEN
    RETURN QUERY SELECT FALSE, 'This chapter is no longer accepting actions', NULL::UUID;
    RETURN;
  END IF;
  
  -- Insert the action
  INSERT INTO public.global_story_actions (
    global_story_id, chapter_id, user_id, action_type, action_text, preset_choice_index
  ) VALUES (
    p_story_id, p_chapter_id, p_user_id, p_action_type, p_action_text, p_preset_index
  )
  RETURNING id INTO v_new_action_id;
  
  -- Update or insert cooldown
  INSERT INTO public.global_story_user_cooldowns (global_story_id, user_id, last_action_at, total_contributions)
  VALUES (p_story_id, p_user_id, NOW(), 1)
  ON CONFLICT (global_story_id, user_id) 
  DO UPDATE SET 
    last_action_at = NOW(),
    total_contributions = global_story_user_cooldowns.total_contributions + 1;
  
  -- Update story stats
  UPDATE public.global_stories
  SET 
    total_contributions = total_contributions + 1,
    unique_contributors = (
      SELECT COUNT(DISTINCT user_id) FROM public.global_story_user_cooldowns WHERE global_story_id = p_story_id
    ),
    updated_at = NOW()
  WHERE id = p_story_id;
  
  RETURN QUERY SELECT TRUE, 'Action submitted successfully', v_new_action_id;
END;
$$;

-- Process donation and award badges
CREATE OR REPLACE FUNCTION public.process_donation(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_payment_id TEXT,
  p_payment_provider TEXT DEFAULT 'stripe',
  p_message TEXT DEFAULT NULL,
  p_is_anonymous BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (donation_id UUID, tier_name TEXT, badge_emoji TEXT, new_badge_earned BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donation_id UUID;
  v_tier_id UUID;
  v_tier_name TEXT;
  v_badge_emoji TEXT;
  v_total_donated DECIMAL(10,2);
  v_new_badge BOOLEAN := FALSE;
BEGIN
  -- Find the appropriate tier for this donation
  SELECT id, name, badge_emoji INTO v_tier_id, v_tier_name, v_badge_emoji
  FROM public.donation_tiers
  WHERE p_amount >= min_amount AND (max_amount IS NULL OR p_amount <= max_amount)
  AND is_active = TRUE
  ORDER BY min_amount DESC
  LIMIT 1;
  
  -- Insert the donation
  INSERT INTO public.donations (user_id, amount, tier_id, payment_id, payment_provider, message, is_anonymous)
  VALUES (p_user_id, p_amount, v_tier_id, p_payment_id, p_payment_provider, p_message, p_is_anonymous)
  RETURNING id INTO v_donation_id;
  
  -- Calculate total donated
  SELECT COALESCE(SUM(amount), 0) INTO v_total_donated
  FROM public.donations
  WHERE user_id = p_user_id AND payment_status = 'completed';
  
  -- Check if user earns a new badge based on total donations
  FOR v_tier_id, v_tier_name, v_badge_emoji IN
    SELECT dt.id, dt.name, dt.badge_emoji
    FROM public.donation_tiers dt
    WHERE v_total_donated >= dt.min_amount
    AND dt.is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM public.user_donation_badges udb 
      WHERE udb.user_id = p_user_id AND udb.tier_id = dt.id
    )
    ORDER BY dt.min_amount
  LOOP
    INSERT INTO public.user_donation_badges (user_id, tier_id, total_donated)
    VALUES (p_user_id, v_tier_id, v_total_donated);
    v_new_badge := TRUE;
  END LOOP;
  
  RETURN QUERY SELECT v_donation_id, v_tier_name, v_badge_emoji, v_new_badge;
END;
$$;

-- Tally votes and select winning action
CREATE OR REPLACE FUNCTION public.tally_global_chapter_votes(p_chapter_id UUID)
RETURNS TABLE (winning_action_id UUID, winning_action_text TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_winning_action_id UUID;
  v_winning_text TEXT;
BEGIN
  -- Find the action with the most votes
  SELECT id, action_text INTO v_winning_action_id, v_winning_text
  FROM public.global_story_actions
  WHERE chapter_id = p_chapter_id
  ORDER BY vote_count DESC, created_at ASC
  LIMIT 1;
  
  -- Mark the chapter as tallied
  UPDATE public.global_story_chapters
  SET 
    votes_tallied = TRUE,
    winning_action_id = v_winning_action_id,
    winning_action_text = v_winning_text
  WHERE id = p_chapter_id;
  
  -- Mark the winning action
  UPDATE public.global_story_actions
  SET is_selected = TRUE
  WHERE id = v_winning_action_id;
  
  RETURN QUERY SELECT v_winning_action_id, v_winning_text;
END;
$$;

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Global Stories
ALTER TABLE public.global_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active global stories"
  ON public.global_stories FOR SELECT
  USING (status IN ('active', 'completed'));

CREATE POLICY "Admins can manage global stories"
  ON public.global_stories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Global Story Chapters
ALTER TABLE public.global_story_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view global story chapters"
  ON public.global_story_chapters FOR SELECT
  USING (TRUE);

-- Global Story Actions
ALTER TABLE public.global_story_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view global story actions"
  ON public.global_story_actions FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create own actions"
  ON public.global_story_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Action Votes
ALTER TABLE public.global_story_action_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own votes"
  ON public.global_story_action_votes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view votes"
  ON public.global_story_action_votes FOR SELECT
  USING (TRUE);

-- Cooldowns
ALTER TABLE public.global_story_user_cooldowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cooldown"
  ON public.global_story_user_cooldowns FOR SELECT
  USING (auth.uid() = user_id);

-- Donations
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own donations"
  ON public.donations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations"
  ON public.donations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Donation Badges
ALTER TABLE public.user_donation_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donation badges"
  ON public.user_donation_badges FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can toggle own badge display"
  ON public.user_donation_badges FOR UPDATE
  USING (auth.uid() = user_id);

COMMIT;

