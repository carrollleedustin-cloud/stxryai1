-- =============================================================================
-- StoryPet System Migration
-- Creates the user_pets table for the Tamagotchi-like companion system
-- =============================================================================

-- Create the user_pets table
CREATE TABLE IF NOT EXISTS user_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identity
  name VARCHAR(50) NOT NULL,
  base_type VARCHAR(20) NOT NULL,
  element VARCHAR(20) NOT NULL,
  personality VARCHAR(20) NOT NULL,
  evolution_stage VARCHAR(20) NOT NULL DEFAULT 'baby',
  
  -- Appearance (stored as JSONB for flexibility)
  traits JSONB NOT NULL DEFAULT '{}'::JSONB,
  current_mood VARCHAR(20) NOT NULL DEFAULT 'happy',
  accessories JSONB NOT NULL DEFAULT '[]'::JSONB,
  
  -- Stats
  stats JSONB NOT NULL DEFAULT '{
    "level": 1,
    "experience": 0,
    "experienceToNextLevel": 115,
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
  }'::JSONB,
  
  -- Memory
  memories JSONB NOT NULL DEFAULT '[]'::JSONB,
  
  -- Metadata
  born_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_interaction TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_fed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique generation seed
  genetic_seed VARCHAR(100) NOT NULL,
  
  -- Evolution history
  evolution_history JSONB NOT NULL DEFAULT '[]'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each user can only have one pet
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_pets_user_id ON user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_evolution_stage ON user_pets(evolution_stage);
CREATE INDEX IF NOT EXISTS idx_user_pets_last_interaction ON user_pets(last_interaction DESC);

-- Enable RLS
ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can read their own pet
CREATE POLICY "Users can read own pet"
  ON user_pets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own pet
CREATE POLICY "Users can insert own pet"
  ON user_pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pet
CREATE POLICY "Users can update own pet"
  ON user_pets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own pet
CREATE POLICY "Users can delete own pet"
  ON user_pets FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_pets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_user_pets_updated_at ON user_pets;
CREATE TRIGGER trigger_user_pets_updated_at
  BEFORE UPDATE ON user_pets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_pets_updated_at();

-- =============================================================================
-- Pet Accessories Table (for unlockable items)
-- =============================================================================

CREATE TABLE IF NOT EXISTS pet_accessory_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- hat, collar, wings, glasses, bow, crown, scarf, aura
  rarity VARCHAR(20) NOT NULL DEFAULT 'common', -- common, rare, epic, legendary
  description TEXT,
  image_url VARCHAR(500),
  unlock_condition JSONB, -- How to unlock this accessory
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert some default accessories
INSERT INTO pet_accessory_catalog (name, type, rarity, description, unlock_condition) VALUES
  ('Reading Crown', 'crown', 'epic', 'A crown for devoted readers', '{"type": "stories_read", "value": 50}'::JSONB),
  ('Story Scarf', 'scarf', 'common', 'A cozy scarf for reading', '{"type": "stories_read", "value": 5}'::JSONB),
  ('Author''s Glasses', 'glasses', 'rare', 'Glasses worn by famous authors', '{"type": "stories_created", "value": 10}'::JSONB),
  ('Streak Flame Aura', 'aura', 'legendary', 'An aura of dedication', '{"type": "streak_days", "value": 30}'::JSONB),
  ('Adventurer''s Hat', 'hat', 'common', 'A hat for brave explorers', '{"type": "genres_explored", "value": 5}'::JSONB),
  ('Social Butterfly Wings', 'wings', 'rare', 'Wings for social readers', '{"type": "comments_written", "value": 25}'::JSONB),
  ('Champion Bow', 'bow', 'epic', 'A bow for top performers', '{"type": "achievements_unlocked", "value": 20}'::JSONB),
  ('Void Collar', 'collar', 'legendary', 'A collar from the void itself', '{"type": "level", "value": 50}'::JSONB)
ON CONFLICT DO NOTHING;

-- Enable RLS on catalog (everyone can read)
ALTER TABLE pet_accessory_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read accessory catalog"
  ON pet_accessory_catalog FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE user_pets IS 'Stores unique Tamagotchi-like companion pets for each user';
COMMENT ON COLUMN user_pets.genetic_seed IS 'Unique seed used to procedurally generate the pet''s appearance';
COMMENT ON COLUMN user_pets.traits IS 'JSONB object containing visual traits like colors, patterns, and features';
COMMENT ON COLUMN user_pets.stats IS 'JSONB object containing all pet statistics and activity data';
COMMENT ON COLUMN user_pets.memories IS 'JSONB array of significant moments the pet remembers';
COMMENT ON COLUMN user_pets.evolution_history IS 'JSONB array tracking all evolution stages achieved';

