-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE story_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE story_genre AS ENUM ('fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'adventure', 'thriller', 'historical');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'vip');
CREATE TYPE badge_type AS ENUM ('reader', 'explorer', 'completionist', 'social', 'creator');

-- User profiles table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  total_reading_time INTEGER DEFAULT 0,
  stories_completed INTEGER DEFAULT 0,
  choices_made INTEGER DEFAULT 0,
  daily_choice_limit INTEGER DEFAULT 10,
  daily_choices_used INTEGER DEFAULT 0,
  last_choice_reset TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  genre story_genre NOT NULL,
  difficulty difficulty_level DEFAULT 'beginner',
  estimated_duration INTEGER, -- in minutes
  status story_status DEFAULT 'published',
  is_premium BOOLEAN DEFAULT false,
  total_chapters INTEGER DEFAULT 0,
  total_choices INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story chapters table
CREATE TABLE story_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, chapter_number)
);

-- Story choices table
CREATE TABLE story_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES story_chapters(id) ON DELETE CASCADE NOT NULL,
  choice_text TEXT NOT NULL,
  consequence_text TEXT,
  next_chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
  choice_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reading progress table
CREATE TABLE user_reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  current_chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
  last_choice_id UUID REFERENCES story_choices(id) ON DELETE SET NULL,
  progress_percentage INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0, -- in minutes
  is_completed BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- User badges/achievements table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  badge_name TEXT NOT NULL,
  badge_type badge_type NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_name)
);

-- User reading lists table
CREATE TABLE user_reading_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  list_name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading list items table
CREATE TABLE reading_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES user_reading_lists(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, story_id)
);

-- User friendships table
CREATE TABLE user_friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- User activity feed table
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- completed_story, earned_badge, joined_club, etc.
  activity_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story reviews table
CREATE TABLE story_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_stories_genre ON stories(genre);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_author ON stories(author_id);
CREATE INDEX idx_user_reading_progress_user ON user_reading_progress(user_id);
CREATE INDEX idx_user_reading_progress_story ON user_reading_progress(story_id);
CREATE INDEX idx_user_activities_user ON user_activities(user_id);
CREATE INDEX idx_story_reviews_story ON story_reviews(story_id);
CREATE INDEX idx_user_friendships_user ON user_friendships(user_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for stories
CREATE POLICY "Anyone can view published stories" ON stories
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can manage own stories" ON stories
  FOR ALL USING (auth.uid() = author_id);

-- RLS Policies for story_chapters
CREATE POLICY "Anyone can view chapters of published stories" ON story_chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_chapters.story_id 
      AND stories.status = 'published'
    )
  );

-- RLS Policies for story_choices
CREATE POLICY "Anyone can view choices of published stories" ON story_choices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM story_chapters 
      JOIN stories ON stories.id = story_chapters.story_id
      WHERE story_chapters.id = story_choices.chapter_id 
      AND stories.status = 'published'
    )
  );

-- RLS Policies for user_reading_progress
CREATE POLICY "Users can view own reading progress" ON user_reading_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reading progress" ON user_reading_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view all badges" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_reading_lists
CREATE POLICY "Users can view public lists and own lists" ON user_reading_lists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own lists" ON user_reading_lists
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for reading_list_items
CREATE POLICY "Users can view items from accessible lists" ON reading_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_reading_lists 
      WHERE user_reading_lists.id = reading_list_items.list_id 
      AND (user_reading_lists.is_public = true OR user_reading_lists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own list items" ON reading_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_reading_lists 
      WHERE user_reading_lists.id = reading_list_items.list_id 
      AND user_reading_lists.user_id = auth.uid()
    )
  );

-- RLS Policies for user_friendships
CREATE POLICY "Users can view own friendships" ON user_friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can manage own friendships" ON user_friendships
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_activities
CREATE POLICY "Users can view friends' activities" ON user_activities
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_friendships 
      WHERE user_friendships.user_id = auth.uid() 
      AND user_friendships.friend_id = user_activities.user_id
      AND user_friendships.status = 'accepted'
    )
  );

CREATE POLICY "Users can insert own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for story_reviews
CREATE POLICY "Anyone can view reviews" ON story_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own reviews" ON story_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Function to update story rating when review is added
CREATE OR REPLACE FUNCTION update_story_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories
  SET rating = (
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM story_reviews
    WHERE story_id = NEW.story_id
  ),
  review_count = (
    SELECT COUNT(*)
    FROM story_reviews
    WHERE story_id = NEW.story_id
  ),
  updated_at = NOW()
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_story_rating_trigger
AFTER INSERT OR UPDATE ON story_reviews
FOR EACH ROW
EXECUTE FUNCTION update_story_rating();

-- Function to reset daily choice limit
CREATE OR REPLACE FUNCTION reset_daily_choices()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_choice_reset::date < CURRENT_DATE THEN
    NEW.daily_choices_used := 0;
    NEW.last_choice_reset := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reset_daily_choices_trigger
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION reset_daily_choices();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_user_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();

-- Insert sample stories
INSERT INTO stories (id, title, description, cover_image_url, genre, difficulty, estimated_duration, is_premium, total_chapters, total_choices, rating, review_count, play_count, completion_count)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'The Enchanted Forest Mystery', 'Unravel ancient secrets in a magical woodland where every choice shapes reality', 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f', 'fantasy', 'beginner', 45, false, 12, 36, 4.5, 128, 1543, 892),
  ('22222222-2222-2222-2222-222222222222', 'Cyber Nexus 2077', 'Navigate a dystopian future where your decisions determine humanity''s fate', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f', 'sci-fi', 'advanced', 90, true, 20, 68, 4.8, 256, 2341, 1234),
  ('33333333-3333-3333-3333-333333333333', 'Murder at Moonlight Manor', 'Solve a classic whodunit in an isolated Victorian estate', 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6', 'mystery', 'intermediate', 60, false, 15, 45, 4.3, 89, 987, 543),
  ('44444444-4444-4444-4444-444444444444', 'Hearts in the Highlands', 'A romantic adventure through the Scottish countryside', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 'romance', 'beginner', 50, true, 14, 42, 4.7, 178, 1876, 1123),
  ('55555555-5555-5555-5555-555555555555', 'The Cursed Lighthouse', 'Face supernatural horrors in an abandoned coastal beacon', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'horror', 'advanced', 75, true, 18, 54, 4.6, 145, 1234, 789),
  ('66666666-6666-6666-6666-666666666666', 'Pirates of the Crimson Tide', 'Sail the high seas in search of legendary treasure', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 'adventure', 'intermediate', 80, false, 16, 48, 4.4, 203, 1654, 987);

-- Insert sample chapters for first story
INSERT INTO story_chapters (id, story_id, chapter_number, title, content)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 1, 'The Mysterious Path', 'You stand at the edge of the Enchanted Forest, sunlight filtering through ancient trees. A worn path splits into two directions...'),
  ('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 2, 'The Hidden Glade', 'Following the left path, you discover a secret glade where magical creatures gather...'),
  ('c3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 3, 'The Dark Woods', 'The right path leads deeper into shadowy woods where ancient magic still lingers...');

-- Insert sample choices
INSERT INTO story_choices (chapter_id, choice_text, consequence_text, next_chapter_id, choice_order)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Take the sunlit left path', 'You feel drawn to the light and warmth', 'c2222222-2222-2222-2222-222222222222', 1),
  ('c1111111-1111-1111-1111-111111111111', 'Venture down the shadowy right path', 'Curiosity pulls you toward the unknown', 'c3333333-3333-3333-3333-333333333333', 2);