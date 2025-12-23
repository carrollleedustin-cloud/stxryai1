-- ========================================
-- STXRYAI: Monetization & Content Discovery Schema
-- Version: 1.0.0
-- Date: 2024-12-22
-- ========================================

-- ==========================================
-- USER WALLETS (Virtual Currency)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_balance ON public.user_wallets(balance DESC);

-- ==========================================
-- COIN TRANSACTIONS
-- ==========================================

CREATE TYPE IF NOT EXISTS public.transaction_type AS ENUM (
  'purchase',
  'tip_sent',
  'tip_received',
  'story_unlock',
  'collection_unlock',
  'character_pack',
  'gift_sent',
  'gift_received',
  'reward',
  'refund',
  'admin_adjustment'
);

CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount INTEGER NOT NULL, -- Positive = credit, negative = debit
  balance INTEGER NOT NULL, -- Balance after transaction
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON public.coin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON public.coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_created ON public.coin_transactions(user_id, created_at DESC);

-- ==========================================
-- CONTENT UNLOCKS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.content_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'collection', 'character_pack')),
  price_paid INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

CREATE INDEX IF NOT EXISTS idx_content_unlocks_user_id ON public.content_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_content_unlocks_content ON public.content_unlocks(content_id, content_type);

-- ==========================================
-- SUBSCRIPTIONS
-- ==========================================

CREATE TYPE IF NOT EXISTS public.subscription_tier AS ENUM ('free', 'premium', 'pro', 'enterprise');
CREATE TYPE IF NOT EXISTS public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'paused');
CREATE TYPE IF NOT EXISTS public.billing_period AS ENUM ('monthly', 'yearly');

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier public.subscription_tier NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  billing_period public.billing_period,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON public.subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- ==========================================
-- USER PREFERENCES (for recommendations)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_genres TEXT[] DEFAULT '{}',
  disliked_genres TEXT[] DEFAULT '{}',
  preferred_length TEXT DEFAULT 'any' CHECK (preferred_length IN ('short', 'medium', 'long', 'any')),
  content_rating TEXT DEFAULT 'all' CHECK (content_rating IN ('all', 'teen', 'mature')),
  notification_preferences JSONB DEFAULT '{}',
  display_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ==========================================
-- STORY TEMPLATES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.story_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  genre TEXT NOT NULL,
  sub_genre TEXT,
  thumbnail TEXT,
  preview_image TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_length TEXT NOT NULL CHECK (estimated_length IN ('short', 'medium', 'long', 'epic')),
  estimated_chapters INTEGER NOT NULL DEFAULT 10,
  estimated_duration INTEGER NOT NULL DEFAULT 60, -- minutes
  structure JSONB NOT NULL,
  characters JSONB NOT NULL DEFAULT '[]',
  world_elements JSONB NOT NULL DEFAULT '[]',
  plot_points JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_by TEXT NOT NULL CHECK (created_by IN ('stxryai', 'community')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_templates_genre ON public.story_templates(genre);
CREATE INDEX IF NOT EXISTS idx_story_templates_difficulty ON public.story_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_story_templates_usage ON public.story_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_story_templates_rating ON public.story_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_story_templates_approved ON public.story_templates(is_approved);
CREATE INDEX IF NOT EXISTS idx_story_templates_author ON public.story_templates(author_id);

-- ==========================================
-- STORY COLLECTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.story_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  curator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cover_images TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_price INTEGER DEFAULT 0,
  story_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.story_collections(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_story_collections_curator ON public.story_collections(curator_id);
CREATE INDEX IF NOT EXISTS idx_collection_stories_collection ON public.collection_stories(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_stories_story ON public.collection_stories(story_id);

-- ==========================================
-- CHARACTER PACKS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.character_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cover_image TEXT,
  characters JSONB NOT NULL DEFAULT '[]',
  is_premium BOOLEAN DEFAULT FALSE,
  premium_price INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_character_packs_author ON public.character_packs(author_id);
CREATE INDEX IF NOT EXISTS idx_character_packs_premium ON public.character_packs(is_premium);

-- ==========================================
-- AI GENERATIONS TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON public.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created ON public.ai_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_date ON public.ai_generations(user_id, created_at DESC);

-- ==========================================
-- OFFLINE DOWNLOADS TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.offline_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  size_bytes INTEGER,
  UNIQUE(user_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_offline_downloads_user ON public.offline_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_downloads_expires ON public.offline_downloads(expires_at);

-- ==========================================
-- READING STREAKS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.reading_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_read_date DATE,
  streak_freezes_used_this_month INTEGER DEFAULT 0,
  streak_start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_streaks_user ON public.reading_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_streaks_current ON public.reading_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_reading_streaks_longest ON public.reading_streaks(longest_streak DESC);

-- ==========================================
-- STORY PLAYS (for trending algorithm)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.story_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  chapters_read INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  source TEXT, -- 'search', 'recommendation', 'trending', 'direct'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_plays_story ON public.story_plays(story_id);
CREATE INDEX IF NOT EXISTS idx_story_plays_user ON public.story_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_story_plays_created ON public.story_plays(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_plays_story_created ON public.story_plays(story_id, created_at DESC);

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- User Wallets
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON public.user_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage wallets"
  ON public.user_wallets FOR ALL
  USING (auth.role() = 'service_role');

-- Coin Transactions
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Content Unlocks
ALTER TABLE public.content_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocks"
  ON public.content_unlocks FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- User Preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Story Templates
ALTER TABLE public.story_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved templates"
  ON public.story_templates FOR SELECT
  USING (is_approved = TRUE OR auth.uid() = author_id);

CREATE POLICY "Users can create templates"
  ON public.story_templates FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own templates"
  ON public.story_templates FOR UPDATE
  USING (auth.uid() = author_id);

-- Story Collections
ALTER TABLE public.story_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public collections"
  ON public.story_collections FOR SELECT
  USING (is_public = TRUE OR auth.uid() = curator_id);

CREATE POLICY "Users can manage own collections"
  ON public.story_collections FOR ALL
  USING (auth.uid() = curator_id);

-- Reading Streaks
ALTER TABLE public.reading_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON public.reading_streaks FOR SELECT
  USING (auth.uid() = user_id);

-- Story Plays (for analytics)
ALTER TABLE public.story_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plays"
  ON public.story_plays FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authors can view story plays"
  ON public.story_plays FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM public.stories WHERE author_id = auth.uid()
    )
  );

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to update wallet balance atomically
CREATE OR REPLACE FUNCTION public.update_wallet_balance(
  p_user_id UUID,
  p_amount INTEGER,
  p_type public.transaction_type,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (new_balance INTEGER, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current balance and lock row
  SELECT balance INTO v_new_balance
  FROM public.user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- If no wallet exists, create one
  IF v_new_balance IS NULL THEN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (p_user_id, 0);
    v_new_balance := 0;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_new_balance + p_amount;
  
  -- Check for negative balance (shouldn't happen for debits)
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Update wallet
  UPDATE public.user_wallets
  SET 
    balance = v_new_balance,
    total_earned = CASE WHEN p_amount > 0 THEN total_earned + p_amount ELSE total_earned END,
    total_spent = CASE WHEN p_amount < 0 THEN total_spent + ABS(p_amount) ELSE total_spent END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.coin_transactions (user_id, type, amount, balance, description, metadata)
  VALUES (p_user_id, p_type, p_amount, v_new_balance, p_description, p_metadata)
  RETURNING id INTO v_transaction_id;
  
  RETURN QUERY SELECT v_new_balance, v_transaction_id;
END;
$$;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_reading_streak(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_read DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get current streak data
  SELECT last_read_date, current_streak, longest_streak
  INTO v_last_read, v_current_streak, v_longest_streak
  FROM public.reading_streaks
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF v_last_read IS NULL THEN
    INSERT INTO public.reading_streaks (user_id, current_streak, longest_streak, last_read_date, streak_start_date)
    VALUES (p_user_id, 1, 1, v_today, v_today);
    RETURN;
  END IF;
  
  -- Update streak based on last read date
  IF v_last_read = v_today THEN
    -- Already read today, no update needed
    RETURN;
  ELSIF v_last_read = v_today - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  ELSE
    -- Streak broken, reset
    v_current_streak := 1;
  END IF;
  
  UPDATE public.reading_streaks
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_read_date = v_today,
    streak_start_date = CASE WHEN v_current_streak = 1 THEN v_today ELSE streak_start_date END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- Function to record story play
CREATE OR REPLACE FUNCTION public.record_story_play(
  p_story_id UUID,
  p_user_id UUID,
  p_source TEXT DEFAULT 'direct'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_play_id UUID;
BEGIN
  INSERT INTO public.story_plays (story_id, user_id, source)
  VALUES (p_story_id, p_user_id, p_source)
  RETURNING id INTO v_play_id;
  
  -- Update story play count
  UPDATE public.stories
  SET play_count = play_count + 1
  WHERE id = p_story_id;
  
  -- Update user streak
  IF p_user_id IS NOT NULL THEN
    PERFORM public.update_reading_streak(p_user_id);
  END IF;
  
  RETURN v_play_id;
END;
$$;

-- ==========================================
-- Add new columns to existing tables
-- ==========================================

-- Add premium_price to stories if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'stories' AND column_name = 'premium_price'
  ) THEN
    ALTER TABLE public.stories ADD COLUMN premium_price INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add template_id to stories if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'stories' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE public.stories ADD COLUMN template_id UUID REFERENCES public.story_templates(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add completion_rate to stories if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'stories' AND column_name = 'completion_rate'
  ) THEN
    ALTER TABLE public.stories ADD COLUMN completion_rate DECIMAL(5,2) DEFAULT 0;
  END IF;
END $$;

COMMIT;

