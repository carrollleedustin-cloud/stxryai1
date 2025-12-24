-- ============================================
-- STORYPET COMPANION SYSTEM TABLES
-- Run this to create all pet-related tables
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PET TYPES
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_base_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        CREATE TYPE public.pet_base_type AS ENUM ('wisp', 'sprite', 'dragon', 'phoenix', 'wolf', 'cat', 'owl', 'fox', 'bunny', 'slime', 'crystal', 'shadow');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_element' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        CREATE TYPE public.pet_element AS ENUM ('fire', 'water', 'earth', 'air', 'lightning', 'ice', 'nature', 'shadow', 'light', 'cosmic', 'void');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_personality' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        CREATE TYPE public.pet_personality AS ENUM ('energetic', 'calm', 'curious', 'playful', 'wise', 'mischievous', 'shy', 'brave', 'dreamy', 'loyal');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_evolution_stage' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        CREATE TYPE public.pet_evolution_stage AS ENUM ('egg', 'baby', 'young', 'adult', 'elder', 'legendary');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pet_mood' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        CREATE TYPE public.pet_mood AS ENUM ('happy', 'excited', 'content', 'bored', 'hungry', 'sad');
    END IF;
END $$;

-- ============================================
-- USER PETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    base_type public.pet_base_type NOT NULL,
    element public.pet_element NOT NULL,
    personality public.pet_personality NOT NULL,
    evolution_stage public.pet_evolution_stage DEFAULT 'baby' NOT NULL,
    
    -- Appearance
    traits JSONB NOT NULL DEFAULT '{}',
    current_mood public.pet_mood DEFAULT 'happy' NOT NULL,
    accessories JSONB DEFAULT '[]' NOT NULL,
    
    -- Stats
    stats JSONB NOT NULL DEFAULT '{
        "level": 1,
        "experience": 0,
        "experienceToNextLevel": 100,
        "totalExperience": 0,
        "storiesRead": 0,
        "choicesMade": 0,
        "storiesCreated": 0,
        "commentsWritten": 0,
        "daysActive": 1,
        "currentStreak": 1,
        "longestStreak": 1,
        "happiness": 80,
        "energy": 100,
        "wordsRead": 0,
        "genresExplored": [],
        "rareAchievements": 0
    }',
    
    -- Memory and history
    memories JSONB DEFAULT '[]' NOT NULL,
    born_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_interaction TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_fed TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    genetic_seed TEXT NOT NULL,
    evolution_history JSONB DEFAULT '[]' NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- PET INTERACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.pet_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('pet', 'feed', 'play', 'talk', 'gift')),
    response TEXT NOT NULL,
    happiness_change INTEGER DEFAULT 0,
    energy_change INTEGER DEFAULT 0,
    experience_gained INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- PET ACCESSORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.pet_accessories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    category TEXT NOT NULL CHECK (category IN ('hat', 'collar', 'wings', 'aura', 'tail', 'other')),
    icon_emoji TEXT,
    unlock_requirement TEXT,
    unlock_condition JSONB DEFAULT '{}' NOT NULL,
    is_limited_edition BOOLEAN DEFAULT FALSE NOT NULL,
    available_until TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- USER PET ACCESSORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_pet_accessories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
    accessory_id UUID NOT NULL REFERENCES public.pet_accessories(id) ON DELETE CASCADE,
    equipped BOOLEAN DEFAULT FALSE NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    equipped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, pet_id, accessory_id)
);

-- ============================================
-- PET DIALOGUES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.pet_dialogues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trigger TEXT NOT NULL CHECK (trigger IN ('greeting', 'reading_start', 'reading_end', 'choice_made', 'milestone', 'idle', 'encouragement', 'celebration')),
    personality public.pet_personality NOT NULL,
    mood public.pet_mood,
    evolution_stage public.pet_evolution_stage,
    messages TEXT[] NOT NULL DEFAULT '{}',
    requires_level INTEGER,
    requires_element public.pet_element,
    weight INTEGER DEFAULT 1 CHECK (weight > 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- PET ACHIEVEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.pet_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_emoji TEXT,
    category TEXT DEFAULT 'general',
    unlock_condition JSONB NOT NULL DEFAULT '{}',
    reward_xp INTEGER DEFAULT 0,
    reward_accessory_id UUID REFERENCES public.pet_accessories(id) ON DELETE SET NULL,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- USER PET ACHIEVEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_pet_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.user_pets(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.pet_achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, pet_id, achievement_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_pets_user_id ON public.user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_user_id ON public.pet_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_pet_id ON public.pet_interactions(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_created_at ON public.pet_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_pet_accessories_user_id ON public.user_pet_accessories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pet_accessories_pet_id ON public.user_pet_accessories(pet_id);
CREATE INDEX IF NOT EXISTS idx_user_pet_achievements_user_id ON public.user_pet_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pet_achievements_pet_id ON public.user_pet_achievements(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_dialogues_trigger ON public.pet_dialogues(trigger);
CREATE INDEX IF NOT EXISTS idx_pet_dialogues_personality ON public.pet_dialogues(personality);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all pet tables
ALTER TABLE public.user_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pet_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pet_achievements ENABLE ROW LEVEL SECURITY;

-- User Pets Policies
CREATE POLICY "Users can view their own pet"
    ON public.user_pets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pet"
    ON public.user_pets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet"
    ON public.user_pets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet"
    ON public.user_pets FOR DELETE
    USING (auth.uid() = user_id);

-- Pet Interactions Policies
CREATE POLICY "Users can view their own pet interactions"
    ON public.pet_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create pet interactions"
    ON public.pet_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User Pet Accessories Policies
CREATE POLICY "Users can view their own pet accessories"
    ON public.user_pet_accessories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pet accessories"
    ON public.user_pet_accessories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet accessories"
    ON public.user_pet_accessories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Pet Achievements Policies
CREATE POLICY "Users can view their own pet achievements"
    ON public.user_pet_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create pet achievements"
    ON public.user_pet_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Pet Accessories and Dialogues are public read
CREATE POLICY "Anyone can view pet accessories"
    ON public.pet_accessories FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view pet dialogues"
    ON public.pet_dialogues FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view pet achievements"
    ON public.pet_achievements FOR SELECT
    USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default pet dialogues
INSERT INTO public.pet_dialogues (trigger, personality, messages, weight) VALUES
    ('greeting', 'energetic', ARRAY['*ZOOMS around* YOU''RE HERE!', '*bounces excitedly* Ready for adventure?', '*spins* Let''s go!'], 3),
    ('greeting', 'calm', ARRAY['*peaceful wave* Welcome back.', '*nods gently* Good to see you.', '*settles down* Hello, friend.'], 2),
    ('greeting', 'curious', ARRAY['*tilts head* What shall we explore today?', '*investigates* Anything new?', '*looks around* Where are we going?'], 2),
    ('reading_start', 'energetic', ARRAY['*eyes widen* This looks exciting!', '*settles in eagerly* Let''s begin!', '*bounces* A new story!'], 3),
    ('reading_start', 'calm', ARRAY['*gets cozy* I''m ready.', '*settles peacefully* Let''s see...', '*nods* I''m listening.'], 2),
    ('reading_end', 'energetic', ARRAY['*happy dance* That was amazing!', '*bounces* What a journey!', '*celebrates* Incredible!'], 3),
    ('reading_end', 'calm', ARRAY['*peaceful sigh* That was lovely...', '*reflects* What a story...', '*nods contentedly* Beautiful.'], 2),
    ('choice_made', 'playful', ARRAY['*giggles* Interesting choice!', '*nods* Bold move!', '*excited* Let''s see what happens!'], 2),
    ('milestone', 'energetic', ARRAY['*confetti appears* WE DID IT!', '*celebrates* Achievement unlocked!', '*proud dance* Look at us!'], 3),
    ('idle', 'curious', ARRAY['*looks around* What''s this?', '*investigates* Anything interesting?', '*pokes you* Hey! Let''s do something!'], 2),
    ('encouragement', 'loyal', ARRAY['You can do it! I believe in you!', '*cheers* Keep going!', 'We''re in this together!'], 3),
    ('celebration', 'energetic', ARRAY['*throws confetti* YAYYY!', '*does a flip* We''re the best!', '*glowing with pride* Incredible!'], 3);

-- Insert default pet accessories
INSERT INTO public.pet_accessories (name, description, rarity, category, icon_emoji, unlock_requirement) VALUES
    ('Crown', 'A majestic crown fit for royalty', 'epic', 'hat', '👑', 'Reach level 10'),
    ('Halo', 'A glowing halo of pure light', 'legendary', 'aura', '✨', 'Reach level 25'),
    ('Bow Tie', 'A dapper bow tie for style', 'common', 'collar', '🎀', 'Start playing'),
    ('Wings', 'Beautiful ethereal wings', 'rare', 'wings', '🪽', 'Read 50 stories'),
    ('Scarf', 'A cozy magical scarf', 'uncommon', 'collar', '🧣', 'Read 10 stories'),
    ('Sparkle Aura', 'Surrounded by magical sparkles', 'rare', 'aura', '✨', 'Make 100 choices');

-- Insert default pet achievements
INSERT INTO public.pet_achievements (code, name, description, icon_emoji, category, unlock_condition, reward_xp, rarity) VALUES
    ('first_story', 'Story Starter', 'Read your first story', '📖', 'reading', '{"storiesRead": 1}', 50, 'common'),
    ('ten_stories', 'Avid Reader', 'Read 10 stories', '📚', 'reading', '{"storiesRead": 10}', 200, 'uncommon'),
    ('fifty_stories', 'Story Collector', 'Read 50 stories', '📚📚', 'reading', '{"storiesRead": 50}', 500, 'rare'),
    ('hundred_choices', 'Choice Master', 'Make 100 choices', '🎯', 'choices', '{"choicesMade": 100}', 300, 'uncommon'),
    ('seven_day_streak', 'Dedicated Reader', 'Maintain a 7-day reading streak', '🔥', 'streaks', '{"currentStreak": 7}', 250, 'uncommon'),
    ('thirty_day_streak', 'Reading Legend', 'Maintain a 30-day reading streak', '🔥🔥', 'streaks', '{"currentStreak": 30}', 1000, 'epic'),
    ('level_ten', 'Growing Strong', 'Reach level 10', '⭐', 'levels', '{"level": 10}', 400, 'uncommon'),
    ('level_twenty_five', 'Mighty Companion', 'Reach level 25', '⭐⭐', 'levels', '{"level": 25}', 1000, 'rare');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- This script creates all necessary tables for the StoryPet companion system.
-- The pet system is now ready to use!
-- 
-- Next steps:
-- 1. Run this migration in your Supabase SQL editor
-- 2. Verify all tables are created
-- 3. Test pet creation and interactions
-- 4. Deploy the updated petService to your application
