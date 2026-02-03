-- STXRYAI Starter Stories - Check Users and Import
-- Run this in Supabase SQL Editor

-- First, let's see what users exist
SELECT id, email, username, role, is_admin 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- If you see your email (Stonedape710@gmail.com) in the results above,
-- uncomment and run the section below to make yourself admin and import stories:

/*
-- Make yourself admin
UPDATE user_profiles
SET 
  role = 'admin',
  is_admin = true,
  updated_at = NOW()
WHERE email = 'Stonedape710@gmail.com';

-- Import stories
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id 
  FROM user_profiles 
  WHERE email = 'Stonedape710@gmail.com';
  
  INSERT INTO stories (
    user_id, title, description, genre, tags, is_published, word_count, chapter_count, view_count, published_at
  ) VALUES
  (admin_user_id, 'The Shepherd''s Burden', 'A young shepherd is chosen by ancient stones to become a hero he never wanted to be.', 'fantasy', ARRAY['reluctant-hero', 'epic-fantasy'], true, 2847, 1, 150, NOW()),
  (admin_user_id, 'The Poison Crown', 'Lady Morrigan must decide whether to accept a cursed throne or revolutionize the kingdom.', 'fantasy', ARRAY['dark-fantasy', 'political-intrigue'], true, 2956, 1, 200, NOW()),
  (admin_user_id, 'The Untalented', 'Lily discovers her "failed" magic is actually a rare gift for Chaos Weaving.', 'fantasy', ARRAY['magic-academy', 'coming-of-age'], true, 2734, 1, 180, NOW()),
  (admin_user_id, 'The Fifth Element', 'General Kira ends a 300-year war by becoming the Fifth Element—Spirit.', 'fantasy', ARRAY['elemental-magic', 'war'], true, 2891, 1, 175, NOW()),
  (admin_user_id, 'The Last Bookshop', 'Detective Maya Chen must venture into the Other to rescue people from the Wild Hunt.', 'fantasy', ARRAY['urban-fantasy', 'detective'], true, 2812, 1, 165, NOW()),
  (admin_user_id, 'First Contact Protocol', 'Dr. Amara Okafor becomes humanity''s first contact with alien anthropologists.', 'science-fiction', ARRAY['first-contact', 'space-exploration'], true, 2923, 1, 190, NOW()),
  (admin_user_id, 'Neon Requiem', 'Detective Kai investigates corporate murders involving digital consciousness.', 'science-fiction', ARRAY['cyberpunk', 'noir'], true, 2867, 1, 210, NOW()),
  (admin_user_id, 'The Rival''s Gambit', 'Marketing rivals compete for a promotion while realizing their animosity masks deeper feelings.', 'romance', ARRAY['enemies-to-lovers', 'workplace'], true, 2678, 1, 220, NOW()),
  (admin_user_id, 'Beneath the Gaslight', 'An American artist and French painter navigate class differences in 1889 Paris.', 'romance', ARRAY['historical-romance', 'paris'], true, 2823, 1, 195, NOW()),
  (admin_user_id, 'The Lighthouse Murders', 'Ten strangers trapped in a lighthouse when one is murdered—everyone is a suspect.', 'mystery', ARRAY['whodunit', 'locked-room'], true, 2845, 1, 185, NOW()),
  (admin_user_id, 'The Unreliable Witness', 'A woman with DID witnesses a murder but can''t trust her own memories.', 'mystery', ARRAY['psychological-thriller', 'DID'], true, 2778, 1, 170, NOW()),
  (admin_user_id, 'Blackwood Manor', 'An archivist discovers the decaying estate she''s cataloging is alive and hungry.', 'horror', ARRAY['gothic-horror', 'haunted-house'], true, 2823, 1, 160, NOW()),
  (admin_user_id, 'The Geometry of Fear', 'A mathematician discovers equations revealing incomprehensible cosmic entities.', 'horror', ARRAY['cosmic-horror', 'lovecraftian'], true, 2889, 1, 155, NOW()),
  (admin_user_id, 'The Weight of Water', 'Three generations of women confront decades of unspoken resentments.', 'literary-fiction', ARRAY['family-dynamics', 'forgiveness'], true, 2789, 1, 140, NOW()),
  (admin_user_id, 'The Summer of Becoming', 'A queer teenager discovers identity and courage working at a bookstore.', 'literary-fiction', ARRAY['coming-of-age', 'lgbtq'], true, 2834, 1, 145, NOW());
  
  RAISE NOTICE '✓ Imported 16 stories successfully!';
END $$;
*/

-- After uncommenting and running the above, verify with:
-- SELECT COUNT(*) as total_stories FROM stories WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'Stonedape710@gmail.com');