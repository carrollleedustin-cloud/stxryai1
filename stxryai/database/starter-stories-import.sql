-- STXRYAI Starter Stories Import (Corrected for Actual Schema)
-- This file matches your actual database schema
-- Run this in Supabase SQL Editor

-- Step 1: Make yourself admin
UPDATE user_profiles
SET 
  role = 'admin',
  is_admin = true,
  updated_at = NOW()
WHERE email = 'Stonedape710@gmail.com';

-- Step 2: Import all 16 starter stories
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get your user ID
  SELECT id INTO admin_user_id 
  FROM user_profiles 
  WHERE email = 'Stonedape710@gmail.com';
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found. Please sign up on the platform first.';
  END IF;
  
  -- Insert all 16 stories
  INSERT INTO stories (
    user_id, 
    title, 
    description, 
    genre, 
    tags, 
    is_published, 
    word_count, 
    chapter_count, 
    view_count, 
    published_at,
    created_at,
    updated_at
  ) VALUES
  -- FANTASY (5 stories)
  (admin_user_id, 'The Shepherd''s Burden', 'A young shepherd is chosen by ancient stones to become a hero he never wanted to be, facing an invasion of Hollow Ones with only mysterious runes and his courage.', 'fantasy', ARRAY['reluctant-hero', 'ancient-magic', 'epic-fantasy'], true, 2847, 1, 150, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Poison Crown', 'Lady Morrigan Blackthorn must decide whether to accept a cursed throne or bargain with the Witch Queen to end her family''s bloodline and revolutionize the kingdom.', 'fantasy', ARRAY['dark-fantasy', 'political-intrigue', 'curses'], true, 2956, 1, 200, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Untalented', 'Lily Thornwick, the worst student at Celestia Academy, discovers her "failed" magic is actually a rare gift for Chaos Weaving.', 'fantasy', ARRAY['magic-academy', 'coming-of-age', 'neurodivergent'], true, 2734, 1, 180, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Fifth Element', 'General Kira Stormborn ends a 300-year war between elemental kingdoms by sacrificing her identity to become the Fifth Element—Spirit—that binds them all.', 'fantasy', ARRAY['elemental-magic', 'war', 'sacrifice'], true, 2891, 1, 175, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Last Bookshop', 'Detective Maya Chen discovers a magical bookshop that appears overnight and must venture into the Other to rescue people taken by the Wild Hunt.', 'fantasy', ARRAY['urban-fantasy', 'detective', 'wild-hunt'], true, 2812, 1, 165, NOW(), NOW(), NOW()),
  
  -- SCIENCE FICTION (2 stories)
  (admin_user_id, 'First Contact Protocol', 'Dr. Amara Okafor detects an alien signal and becomes humanity''s first contact with the Luminari, cosmic anthropologists who collect the stories of civilizations.', 'science-fiction', ARRAY['first-contact', 'space-exploration', 'aliens'], true, 2923, 1, 190, NOW(), NOW(), NOW()),
  (admin_user_id, 'Neon Requiem', 'Detective Kai Nakamura investigates corporate murders in Neo-Tokyo, uncovering a conspiracy involving digital consciousness and corporate immortality.', 'science-fiction', ARRAY['cyberpunk', 'noir', 'consciousness'], true, 2867, 1, 210, NOW(), NOW(), NOW()),
  
  -- ROMANCE (2 stories)
  (admin_user_id, 'The Rival''s Gambit', 'Marketing rivals Jordan and Alex compete for a promotion while slowly realizing their animosity masks deeper feelings.', 'romance', ARRAY['enemies-to-lovers', 'workplace-romance', 'slow-burn'], true, 2678, 1, 220, NOW(), NOW(), NOW()),
  (admin_user_id, 'Beneath the Gaslight', 'Set in 1889 Paris during the Exposition Universelle, an American engineer and a French artist navigate class differences and societal expectations.', 'romance', ARRAY['historical-romance', 'paris', 'artist'], true, 2823, 1, 195, NOW(), NOW(), NOW()),
  
  -- MYSTERY/THRILLER (2 stories)
  (admin_user_id, 'The Lighthouse Murders', 'Ten strangers are trapped in a lighthouse during a storm when one of them is murdered, and everyone is a suspect.', 'mystery', ARRAY['whodunit', 'locked-room', 'murder-mystery'], true, 2845, 1, 185, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Unreliable Witness', 'A woman with dissociative identity disorder witnesses a murder, but can''t trust her own memories or which personality saw what.', 'mystery', ARRAY['psychological-thriller', 'unreliable-narrator', 'DID'], true, 2778, 1, 170, NOW(), NOW(), NOW()),
  
  -- HORROR (2 stories)
  (admin_user_id, 'Blackwood Manor', 'An archivist arrives at a decaying estate to catalog a family''s papers, only to discover the house itself is alive and hungry.', 'horror', ARRAY['gothic-horror', 'haunted-house', 'atmospheric'], true, 2823, 1, 160, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Geometry of Fear', 'A mathematician discovers equations that reveal the true nature of reality—and the incomprehensible entities that exist beyond human perception.', 'horror', ARRAY['cosmic-horror', 'lovecraftian', 'mathematics'], true, 2889, 1, 155, NOW(), NOW(), NOW()),
  
  -- LITERARY FICTION (2 stories)
  (admin_user_id, 'The Weight of Water', 'Three generations of women gather at a lake house to scatter ashes, confronting decades of unspoken resentments and hidden love.', 'literary-fiction', ARRAY['family-dynamics', 'generational-trauma', 'forgiveness'], true, 2789, 1, 140, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Summer of Becoming', 'A queer teenager spends a transformative summer working at a bookstore, discovering identity, first love, and the courage to be authentic.', 'literary-fiction', ARRAY['coming-of-age', 'lgbtq', 'non-binary'], true, 2834, 1, 145, NOW(), NOW(), NOW());
  
  RAISE NOTICE '✓ Successfully imported 16 starter stories for user: %', admin_user_id;
END $$;

-- Verify the import
SELECT 
  title,
  genre,
  word_count,
  is_published,
  view_count,
  array_length(tags, 1) as tag_count
FROM stories
WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'Stonedape710@gmail.com')
ORDER BY created_at DESC;

-- Show summary by genre
SELECT 
  genre,
  COUNT(*) as story_count,
  SUM(word_count) as total_words
FROM stories
WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'Stonedape710@gmail.com')
GROUP BY genre
ORDER BY genre;

COMMIT;