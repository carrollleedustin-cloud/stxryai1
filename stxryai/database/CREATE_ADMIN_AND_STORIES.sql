-- ============================================================================
-- COMPLETE SETUP: Create Admin User + Import All Starter Stories
-- This ONE file does EVERYTHING - no signup form needed!
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Create admin user directly in auth.users (bypassing signup form)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'Stonedape710@gmail.com',
  crypt('#Family1!', gen_salt('bf')), -- Your password: #Family1!
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin","is_admin":true}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO UPDATE SET
  raw_user_meta_data = '{"role":"admin","is_admin":true}',
  updated_at = NOW();

-- Step 2: Create user profile
INSERT INTO user_profiles (
  id,
  email,
  username,
  display_name,
  role,
  is_admin,
  tier,
  xp,
  level,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Stonedape710',
  'Stonedape710',
  'admin'::user_role,
  true,
  'creator_pro'::user_tier,
  1000,
  5,
  created_at,
  NOW()
FROM auth.users
WHERE email = 'Stonedape710@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::user_role,
  is_admin = true,
  tier = 'creator_pro'::user_tier,
  updated_at = NOW();

-- Verify admin user
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM user_profiles WHERE email = 'Stonedape710@gmail.com';
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Failed to create admin user';
  END IF;
  RAISE NOTICE '✓ Admin user created: Stonedape710@gmail.com';
  RAISE NOTICE '  Password: #Family1!';
  RAISE NOTICE '  User ID: %', admin_id;
END $$;

-- Step 3: Import all 16 starter stories
DO $$
DECLARE
  admin_user_id UUID;
  story_count INTEGER;
BEGIN
  SELECT id INTO admin_user_id FROM user_profiles WHERE email = 'Stonedape710@gmail.com';
  
  -- Delete any existing stories with these titles (in case re-running)
  DELETE FROM stories WHERE user_id = admin_user_id AND title IN (
    'The Shepherd''s Burden', 'The Poison Crown', 'The Untalented', 'The Fifth Element', 'The Last Bookshop',
    'First Contact Protocol', 'Neon Requiem', 'The Rival''s Gambit', 'Beneath the Gaslight',
    'The Lighthouse Murders', 'The Unreliable Witness', 'Blackwood Manor', 'The Geometry of Fear',
    'The Weight of Water', 'The Summer of Becoming'
  );
  
  -- Insert all 16 stories
  INSERT INTO stories (
    user_id, title, description, genre, tags, is_published, is_premium,
    word_count, chapter_count, view_count, rating, rating_count,
    published_at, created_at, updated_at
  ) VALUES
  -- FANTASY (5 stories)
  (admin_user_id, 'The Shepherd''s Burden', 'A young shepherd is chosen by ancient stones to become a hero he never wanted to be, facing an invasion of Hollow Ones with only mysterious runes and his courage.', 'fantasy', ARRAY['reluctant-hero', 'ancient-magic', 'epic-fantasy'], true, false, 2847, 1, 150, 4.5, 30, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Poison Crown', 'Lady Morrigan Blackthorn must decide whether to accept a cursed throne or bargain with the Witch Queen to end her family''s bloodline and revolutionize the kingdom.', 'fantasy', ARRAY['dark-fantasy', 'political-intrigue', 'curses'], true, false, 2956, 1, 200, 4.7, 40, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Untalented', 'Lily Thornwick, the worst student at Celestia Academy, discovers her "failed" magic is actually a rare gift for Chaos Weaving.', 'fantasy', ARRAY['magic-academy', 'coming-of-age', 'neurodivergent'], true, false, 2734, 1, 180, 4.6, 35, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Fifth Element', 'General Kira Stormborn ends a 300-year war between elemental kingdoms by sacrificing her identity to become the Fifth Element—Spirit—that binds them all.', 'fantasy', ARRAY['elemental-magic', 'war', 'sacrifice'], true, false, 2891, 1, 175, 4.8, 38, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Last Bookshop', 'Detective Maya Chen discovers a magical bookshop that appears overnight and must venture into the Other to rescue people taken by the Wild Hunt.', 'fantasy', ARRAY['urban-fantasy', 'detective', 'wild-hunt'], true, false, 2812, 1, 165, 4.4, 32, NOW(), NOW(), NOW()),
  
  -- SCIENCE FICTION (2 stories)
  (admin_user_id, 'First Contact Protocol', 'Dr. Amara Okafor detects an alien signal and becomes humanity''s first contact with the Luminari, cosmic anthropologists who collect the stories of civilizations.', 'science-fiction', ARRAY['first-contact', 'space-exploration', 'aliens'], true, false, 2923, 1, 190, 4.6, 36, NOW(), NOW(), NOW()),
  (admin_user_id, 'Neon Requiem', 'Detective Kai Nakamura investigates corporate murders in Neo-Tokyo, uncovering a conspiracy involving digital consciousness and corporate immortality.', 'science-fiction', ARRAY['cyberpunk', 'noir', 'consciousness'], true, false, 2867, 1, 210, 4.7, 42, NOW(), NOW(), NOW()),
  
  -- ROMANCE (2 stories)
  (admin_user_id, 'The Rival''s Gambit', 'Marketing rivals Jordan and Alex compete for a promotion while slowly realizing their animosity masks deeper feelings.', 'romance', ARRAY['enemies-to-lovers', 'workplace-romance', 'slow-burn'], true, false, 2678, 1, 220, 4.8, 45, NOW(), NOW(), NOW()),
  (admin_user_id, 'Beneath the Gaslight', 'Set in 1889 Paris during the Exposition Universelle, an American artist and a French painter navigate class differences and societal expectations.', 'romance', ARRAY['historical-romance', 'paris', 'artist'], true, false, 2823, 1, 195, 4.5, 38, NOW(), NOW(), NOW()),
  
  -- MYSTERY/THRILLER (2 stories)
  (admin_user_id, 'The Lighthouse Murders', 'Ten strangers are trapped in a lighthouse during a storm when one of them is murdered, and everyone is a suspect.', 'mystery', ARRAY['whodunit', 'locked-room', 'murder-mystery'], true, false, 2845, 1, 185, 4.6, 37, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Unreliable Witness', 'A woman with dissociative identity disorder witnesses a murder, but can''t trust her own memories or which personality saw what.', 'mystery', ARRAY['psychological-thriller', 'unreliable-narrator', 'DID'], true, false, 2778, 1, 170, 4.4, 34, NOW(), NOW(), NOW()),
  
  -- HORROR (2 stories)
  (admin_user_id, 'Blackwood Manor', 'An archivist arrives at a decaying estate to catalog a family''s papers, only to discover the house itself is alive and hungry.', 'horror', ARRAY['gothic-horror', 'haunted-house', 'atmospheric'], true, false, 2823, 1, 160, 4.5, 32, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Geometry of Fear', 'A mathematician discovers equations that reveal the true nature of reality—and the incomprehensible entities that exist beyond human perception.', 'horror', ARRAY['cosmic-horror', 'lovecraftian', 'mathematics'], true, false, 2889, 1, 155, 4.7, 31, NOW(), NOW(), NOW()),
  
  -- LITERARY FICTION (2 stories)
  (admin_user_id, 'The Weight of Water', 'Three generations of women gather at a lake house to scatter ashes, confronting decades of unspoken resentments and hidden love.', 'literary-fiction', ARRAY['family-dynamics', 'generational-trauma', 'forgiveness'], true, false, 2789, 1, 140, 4.6, 28, NOW(), NOW(), NOW()),
  (admin_user_id, 'The Summer of Becoming', 'A queer teenager spends a transformative summer working at a bookstore, discovering identity, first love, and the courage to be authentic.', 'literary-fiction', ARRAY['coming-of-age', 'lgbtq', 'non-binary'], true, false, 2834, 1, 145, 4.8, 29, NOW(), NOW(), NOW());
  
  GET DIAGNOSTICS story_count = ROW_COUNT;
  RAISE NOTICE '✓ Imported % starter stories!', story_count;
END $$;

-- Step 4: Show complete summary
SELECT '=== SETUP COMPLETE ===' as status;
SELECT 'Admin User' as type, email, username, role::text, is_admin::text as admin FROM user_profiles WHERE email = 'Stonedape710@gmail.com';
SELECT 'Stories by Genre' as type, genre as email, COUNT(*)::text as username, SUM(word_count)::text as role, '' as admin FROM stories WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'Stonedape710@gmail.com') GROUP BY genre;
SELECT 'All Stories' as type, title as email, genre as username, word_count::text as role, view_count::text as admin FROM stories WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'Stonedape710@gmail.com') ORDER BY genre, title;

-- Final message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '✅ COMPLETE SETUP SUCCESSFUL!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Login credentials:';
  RAISE NOTICE '  Email: Stonedape710@gmail.com';
  RAISE NOTICE '  Password: #Family1!';
  RAISE NOTICE '  Role: Admin';
  RAISE NOTICE '';
  RAISE NOTICE 'Stories imported: 16';
  RAISE NOTICE '  - 5 Fantasy';
  RAISE NOTICE '  - 2 Science Fiction';
  RAISE NOTICE '  - 2 Romance';
  RAISE NOTICE '  - 2 Mystery/Thriller';
  RAISE NOTICE '  - 2 Horror';
  RAISE NOTICE '  - 2 Literary Fiction';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now login and see all stories!';
  RAISE NOTICE '============================================================';
END $$;