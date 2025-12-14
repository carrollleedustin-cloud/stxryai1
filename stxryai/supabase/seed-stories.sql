-- Seed Stories for StxryAI
-- Run this in Supabase SQL Editor AFTER you create your first account
-- This will use your actual user ID

-- Step 1: First, create an account at http://localhost:4028/authentication
-- Step 2: Then run this script, replacing YOUR_USER_ID with your actual ID

-- To get your user ID, run this query first:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Copy your user ID and replace it below

-- Temporarily disable RLS to insert seed data
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE chapters DISABLE ROW LEVEL SECURITY;

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from the query above
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the first user (should be you)
  SELECT id INTO admin_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create an account first at http://localhost:4028/authentication';
  END IF;

  -- Insert seed stories with your user ID
  INSERT INTO stories (id, user_id, title, description, genre, difficulty, tags, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
  VALUES
    ('c1000000-0000-0000-0000-000000000001', admin_user_id, 'The Magic Treehouse Mystery', 'Join Luna and Max as they discover a magical treehouse in their backyard that transports them to different worlds! Perfect for young readers learning to make choices.', 'Children''s Adventure', 'easy', ARRAY['kids', 'magic', 'adventure'], TRUE, 4.8, 234, 1247, 1, 850, NOW()),
    ('c3000000-0000-0000-0000-000000000001', admin_user_id, 'Echoes of the Shattered Realm', 'In a world where magic is dying, 16-year-old Aria must choose between saving her kingdom or discovering the truth about her mysterious past.', 'Fantasy', 'medium', ARRAY['fantasy', 'magic', 'ya'], TRUE, 4.9, 3247, 15678, 1, 8900, NOW()),
    ('c4000000-0000-0000-0000-000000000001', admin_user_id, 'Coffee Shop Chronicles', 'Emma, a struggling writer, finds unexpected romance when she meets Alex, a mysterious regular at her favorite coffee shop.', 'Romance', 'medium', ARRAY['romance', 'contemporary'], TRUE, 4.8, 5621, 23456, 1, 12000, NOW());

  -- Insert chapters
  INSERT INTO chapters (story_id, title, content, chapter_number, word_count, is_published)
  VALUES
    ('c1000000-0000-0000-0000-000000000001', 'The Mysterious Door', E'Luna and Max were playing in their backyard when they noticed something strange. Behind the old oak tree, there was a tiny door they had never seen before!\n\n"Look, Max!" Luna pointed. "That door wasn''t there yesterday!"\n\nMax walked closer, his eyes wide with wonder. The door was painted bright blue and had a tiny golden doorknob. It was just big enough for them to fit through.\n\n"Should we knock?" Max asked.\n\nLuna thought for a moment. She was the older sister and wanted to be brave.\n\nWhat should they do?', 1, 85, TRUE),

    ('c3000000-0000-0000-0000-000000000001', 'The Dying Light', E'Aria stood at the edge of the dying forest, watching as another ancient tree lost its glow. The magic was fading faster now.\n\n"We don''t have much time," said Master Elron, his weathered face grave. "The kingdom needs you to make a choice, Aria. Will you seek the Heartstone to save our people, or journey to the Lost Archives to learn the truth about your heritage?"\n\nAria''s hands trembled. Both paths were dangerous, but only one could be chosen.\n\nWhat would she decide?', 1, 105, TRUE),

    ('c4000000-0000-0000-0000-000000000001', 'The Regular', E'Emma stared at her laptop screen, the cursor blinking mockingly at her. Chapter 12 of her novel was going nowhere.\n\n"Another coffee?" a warm voice asked.\n\nShe looked up to see Alex, the mysterious regular who always sat in the corner with a book. They''d exchanged smiles for weeks but never really talked.\n\n"I probably shouldn''t," Emma said, gesturing at her empty cup. "But yes, please."\n\nAlex smiled. "Writer''s block?"\n\nEmma laughed. "Is it that obvious?"', 1, 92, TRUE);

  RAISE NOTICE 'Successfully created % stories for user %', 3, admin_user_id;
END $$;

-- Re-enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Verify stories were created
SELECT title, genre, view_count FROM stories ORDER BY created_at DESC;
