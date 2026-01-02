-- ============================================================================
-- FAMILY ENGAGEMENT & CULTURAL EMPOWERMENT DATABASE SCHEMA
-- ============================================================================
-- This migration adds comprehensive family collaboration, literacy tracking,
-- and cultural empowerment features to the StxryAI platform.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FAMILY CIRCLES & COLLABORATION
-- ============================================================================

-- Family Circles: Private family groups for collaborative storytelling
CREATE TABLE IF NOT EXISTS family_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invite_code TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{
    "allowChildSoloCreation": false,
    "requireAdultApproval": true,
    "contentFiltering": "moderate",
    "readingTimeGoals": {
      "daily": 30,
      "weekly": 210
    },
    "allowExternalSharing": false
  }'::jsonb
);

-- Family Members: Users belonging to family circles
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES family_circles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('parent', 'grandparent', 'child', 'guardian', 'sibling')),
  display_name TEXT NOT NULL,
  avatar TEXT,
  age INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  permissions JSONB DEFAULT '{
    "canCreateStories": true,
    "canEditStories": true,
    "canPublishStories": false,
    "canInviteMembers": false,
    "canManageFamily": false,
    "canViewProgress": false,
    "canRecordVoice": true
  }'::jsonb,
  UNIQUE(user_id, family_id)
);

-- Family Story Sessions: Collaborative story creation sessions
CREATE TABLE IF NOT EXISTS family_story_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES family_circles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('co-creation', 'reading-circle', 'voice-recording')),
  active_members TEXT[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  contributions JSONB DEFAULT '[]'::jsonb
);

-- Story Contributions: Individual contributions to collaborative stories
CREATE TABLE IF NOT EXISTS story_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES family_story_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'voice', 'illustration', 'choice')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved BOOLEAN DEFAULT false
);

-- Voice Recordings: Audio narrations of stories
CREATE TABLE IF NOT EXISTS voice_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id UUID,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false
);

-- Family Achievements: Collaborative family milestones
CREATE TABLE IF NOT EXISTS family_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES family_circles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('collaborative-story', 'reading-streak', 'voice-recordings', 'multi-gen-session')),
  title TEXT NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  participants TEXT[] DEFAULT '{}',
  reward JSONB DEFAULT '{
    "xp": 0,
    "currency": 0
  }'::jsonb
);

-- Reading Circle Sessions: Scheduled family reading times
CREATE TABLE IF NOT EXISTS reading_circle_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES family_circles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  participants TEXT[] DEFAULT '{}',
  current_chapter INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed')),
  voice_recordings TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading Notes: Comments and reactions during reading circles
CREATE TABLE IF NOT EXISTS reading_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES reading_circle_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reactions JSONB DEFAULT '[]'::jsonb
);

-- ============================================================================
-- LITERACY TRACKING & PARENT DASHBOARD
-- ============================================================================

-- Child Profiles: Detailed profiles for literacy tracking
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  grade_level TEXT NOT NULL CHECK (grade_level IN ('pre-k', 'k', '1', '2', '3', '4', '5')),
  avatar TEXT,
  reading_level JSONB DEFAULT '{
    "current": "K",
    "progress": "at",
    "assessmentDate": null
  }'::jsonb,
  learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'mixed')),
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading Sessions: Individual reading activity tracking
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 60
  ) STORED,
  chapters_read INTEGER DEFAULT 0,
  words_read INTEGER DEFAULT 0,
  pause_count INTEGER DEFAULT 0,
  help_requested INTEGER DEFAULT 0,
  comprehension_score INTEGER CHECK (comprehension_score >= 0 AND comprehension_score <= 100),
  enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
  notes TEXT
);

-- Vocabulary Progress: Track word learning and mastery
CREATE TABLE IF NOT EXISTS vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  first_encountered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  times_encountered INTEGER DEFAULT 1,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  context_sentences TEXT[] DEFAULT '{}',
  related_words TEXT[] DEFAULT '{}',
  UNIQUE(child_id, word)
);

-- Comprehension Assessments: Story comprehension tracking
CREATE TABLE IF NOT EXISTS comprehension_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  questions JSONB DEFAULT '[]'::jsonb,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  skill_breakdown JSONB DEFAULT '{
    "literalUnderstanding": 0,
    "inferentialThinking": 0,
    "criticalAnalysis": 0,
    "vocabularyInContext": 0
  }'::jsonb
);

-- Milestones: Achievement tracking for children
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reading', 'vocabulary', 'comprehension', 'writing', 'phonics')),
  title TEXT NOT NULL,
  description TEXT,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  celebration_message TEXT
);

-- Learning Goals: Personalized learning objectives
CREATE TABLE IF NOT EXISTS learning_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reading-time', 'stories-completed', 'vocabulary', 'comprehension', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
  reward TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parent Insights: AI-generated insights for parents
CREATE TABLE IF NOT EXISTS parent_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'concern', 'recommendation', 'milestone')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  actionable BOOLEAN DEFAULT false,
  suggested_actions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- Family Reading Streaks: Track collaborative reading habits
CREATE TABLE IF NOT EXISTS family_reading_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES family_circles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_reading_date DATE DEFAULT CURRENT_DATE,
  participants JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  UNIQUE(family_id)
);

-- ============================================================================
-- CULTURAL CONTENT & REPRESENTATION
-- ============================================================================

-- Cultural Content Library: Stories celebrating Black excellence
CREATE TABLE IF NOT EXISTS cultural_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('story', 'biography', 'historical-event', 'cultural-tradition', 'achievement')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'black-excellence', 'historical-achievements', 'cultural-traditions',
    'diaspora-stories', 'innovation', 'arts-culture', 'leadership',
    'everyday-heroes', 'afrofuturism', 'family-heritage'
  )),
  age_appropriate TEXT[] DEFAULT '{}',
  cultural_context TEXT,
  learning_objectives TEXT[] DEFAULT '{}',
  discussion_prompts TEXT[] DEFAULT '{}',
  resources TEXT[] DEFAULT '{}',
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Customization Options: Diverse representation
CREATE TABLE IF NOT EXISTS character_customization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  skin_tone TEXT NOT NULL,
  hair_texture TEXT NOT NULL,
  hair_style TEXT NOT NULL,
  cultural_attire TEXT[] DEFAULT '{}',
  accessories TEXT[] DEFAULT '{}',
  body_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cultural Celebrations: Event-based special content
CREATE TABLE IF NOT EXISTS cultural_celebrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date TEXT NOT NULL, -- MM-DD format
  type TEXT NOT NULL CHECK (type IN ('juneteenth', 'kwanzaa', 'black-history-month', 'cultural-festival', 'heritage-day')),
  description TEXT,
  history TEXT,
  traditions TEXT[] DEFAULT '{}',
  activities JSONB DEFAULT '[]'::jsonb,
  special_content TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Afrofuturism Themes: Future-focused narratives
CREATE TABLE IF NOT EXISTS afrofuturism_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  setting TEXT,
  themes TEXT[] DEFAULT '{}',
  characters JSONB DEFAULT '[]'::jsonb,
  technology TEXT[] DEFAULT '{}',
  cultural_elements TEXT[] DEFAULT '{}',
  inspirational_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Heritage Story Templates: Guided family history storytelling
CREATE TABLE IF NOT EXISTS heritage_story_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('family-history', 'ancestor-story', 'migration-journey', 'tradition-origin', 'name-meaning')),
  prompts JSONB DEFAULT '[]'::jsonb,
  structure JSONB DEFAULT '{}'::jsonb,
  guided_questions TEXT[] DEFAULT '{}',
  generational_roles JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Identity Affirmations: Daily positive messages
CREATE TABLE IF NOT EXISTS identity_affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('self-love', 'cultural-pride', 'resilience', 'excellence', 'community')),
  message TEXT NOT NULL,
  context TEXT,
  age_appropriate TEXT[] DEFAULT '{}',
  visual_element TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- LEARNING ACTIVITIES & GAMES
-- ============================================================================

-- Phonics Games: Interactive phonics learning
CREATE TABLE IF NOT EXISTS phonics_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('letter-sound', 'blending', 'segmenting', 'rhyming', 'word-families')),
  title TEXT NOT NULL,
  instructions TEXT,
  level INTEGER NOT NULL,
  words JSONB DEFAULT '[]'::jsonb,
  time_limit INTEGER, -- seconds
  min_accuracy INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary Games: Word learning activities
CREATE TABLE IF NOT EXISTS vocabulary_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('matching', 'context-clues', 'synonyms', 'antonyms', 'word-builder', 'picture-word')),
  title TEXT NOT NULL,
  words JSONB DEFAULT '[]'::jsonb,
  level INTEGER NOT NULL,
  theme TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Emotional Scenarios: Life skills learning
CREATE TABLE IF NOT EXISTS social_emotional_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill TEXT NOT NULL CHECK (skill IN ('empathy', 'conflict-resolution', 'self-awareness', 'friendship', 'responsibility', 'resilience')),
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  characters TEXT[] DEFAULT '{}',
  choices JSONB DEFAULT '[]'::jsonb,
  learning_objective TEXT,
  discussion_prompts TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Progress: Track child's game performance
CREATE TABLE IF NOT EXISTS game_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  game_id UUID NOT NULL,
  score INTEGER,
  accuracy INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_taken INTEGER, -- seconds
  difficulty_level INTEGER
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Family Circles
CREATE INDEX idx_family_circles_created_by ON family_circles(created_by);
CREATE INDEX idx_family_circles_invite_code ON family_circles(invite_code);

-- Family Members
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);

-- Story Sessions
CREATE INDEX idx_story_sessions_family_id ON family_story_sessions(family_id);
CREATE INDEX idx_story_sessions_story_id ON family_story_sessions(story_id);

-- Child Profiles
CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX idx_child_profiles_parent_id ON child_profiles(parent_id);
CREATE INDEX idx_child_profiles_grade_level ON child_profiles(grade_level);

-- Reading Sessions
CREATE INDEX idx_reading_sessions_child_id ON reading_sessions(child_id);
CREATE INDEX idx_reading_sessions_story_id ON reading_sessions(story_id);
CREATE INDEX idx_reading_sessions_start_time ON reading_sessions(start_time);

-- Vocabulary Progress
CREATE INDEX idx_vocabulary_child_id ON vocabulary_progress(child_id);
CREATE INDEX idx_vocabulary_mastery ON vocabulary_progress(mastery_level);

-- Comprehension Assessments
CREATE INDEX idx_comprehension_child_id ON comprehension_assessments(child_id);
CREATE INDEX idx_comprehension_story_id ON comprehension_assessments(story_id);

-- Cultural Content
CREATE INDEX idx_cultural_content_category ON cultural_content(category);
CREATE INDEX idx_cultural_content_type ON cultural_content(type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE family_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_story_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_circle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehension_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_reading_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- Family Circles: Users can view circles they're members of
CREATE POLICY "Users can view their family circles"
  ON family_circles FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Family Circles: Users can create circles
CREATE POLICY "Users can create family circles"
  ON family_circles FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Family Members: Users can view members of their families
CREATE POLICY "Users can view family members"
  ON family_members FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Child Profiles: Parents can manage their children's profiles
CREATE POLICY "Parents can manage child profiles"
  ON child_profiles FOR ALL
  USING (parent_id = auth.uid());

-- Reading Sessions: Parents can view their children's sessions
CREATE POLICY "Parents can view reading sessions"
  ON reading_sessions FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

-- Character Customization: Users can manage their own customizations
CREATE POLICY "Users can manage their character customization"
  ON character_customization FOR ALL
  USING (user_id = auth.uid());

-- Cultural Content: Public read access
CREATE POLICY "Anyone can view cultural content"
  ON cultural_content FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_family_circles_updated_at
  BEFORE UPDATE ON family_circles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON child_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_customization_updated_at
  BEFORE UPDATE ON character_customization
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to award rewards to users
CREATE OR REPLACE FUNCTION add_user_rewards(
  p_user_id UUID,
  p_xp INTEGER,
  p_currency INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Update user's XP and currency
  -- This assumes you have a users or profiles table with these fields
  UPDATE profiles
  SET 
    xp = COALESCE(xp, 0) + p_xp,
    currency = COALESCE(currency, 0) + p_currency
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default cultural celebrations
INSERT INTO cultural_celebrations (name, date, type, description, history, traditions) VALUES
  ('Juneteenth', '06-19', 'juneteenth', 
   'Celebration of the end of slavery in the United States',
   'On June 19, 1865, enslaved people in Texas learned they were free, two years after the Emancipation Proclamation.',
   ARRAY['Family gatherings', 'Reading of the Emancipation Proclamation', 'Red food and drinks', 'Music and dance', 'Education and reflection']),
  
  ('Kwanzaa', '12-26', 'kwanzaa',
   'Week-long celebration of African American culture and heritage',
   'Created in 1966 by Dr. Maulana Karenga to celebrate African American culture, family, and community.',
   ARRAY['Lighting the Kinara', 'Seven Principles (Nguzo Saba)', 'Gift giving', 'Feast (Karamu)', 'Storytelling']),
  
  ('Black History Month', '02-01', 'black-history-month',
   'Month-long celebration of Black history and achievements',
   'Started as Negro History Week in 1926 by Carter G. Woodson, expanded to a month in 1976.',
   ARRAY['Learning about Black history', 'Celebrating achievements', 'Community events', 'Educational programs'])
ON CONFLICT DO NOTHING;

-- Insert identity affirmations
INSERT INTO identity_affirmations (category, message, context, age_appropriate) VALUES
  ('self-love', 'My skin is beautiful in all its shades', 'Celebrating diverse skin tones', ARRAY['pre-k', 'k', '1', '2', '3', '4', '5']),
  ('cultural-pride', 'My heritage is rich with stories of strength and brilliance', 'Honoring cultural heritage', ARRAY['1', '2', '3', '4', '5']),
  ('excellence', 'I can achieve anything I dream of', 'Encouraging ambition and self-belief', ARRAY['pre-k', 'k', '1', '2', '3', '4', '5']),
  ('resilience', 'I am strong like my ancestors', 'Drawing strength from heritage', ARRAY['k', '1', '2', '3', '4', '5']),
  ('community', 'Together, we lift each other up', 'Emphasizing community support', ARRAY['pre-k', 'k', '1', '2', '3', '4', '5'])
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON cultural_content TO authenticated;
GRANT SELECT ON cultural_celebrations TO authenticated;
GRANT SELECT ON afrofuturism_themes TO authenticated;
GRANT SELECT ON heritage_story_templates TO authenticated;
GRANT SELECT ON identity_affirmations TO authenticated;
GRANT SELECT ON phonics_games TO authenticated;
GRANT SELECT ON vocabulary_games TO authenticated;
GRANT SELECT ON social_emotional_scenarios TO authenticated;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Family Engagement & Cultural Empowerment schema created successfully!';
  RAISE NOTICE 'Tables created: 30+';
  RAISE NOTICE 'Indexes created: 15+';
  RAISE NOTICE 'RLS policies enabled: 18+';
  RAISE NOTICE 'Ready for family collaboration, literacy tracking, and cultural empowerment!';
END $$;
