-- STXRYAI Starter Stories Database Seed
-- This file adds the 16 completed starter stories to the platform database
-- Run this after the main database initialization

-- ============================================================================
-- STARTER STORIES INSERTION
-- ============================================================================

-- Note: Adjust user_id to match the platform admin/system user
-- These stories are marked as featured and published

-- FANTASY CATEGORY STORIES (5 stories)

INSERT INTO stories (
  title,
  slug,
  description,
  content_path,
  category,
  subcategory,
  word_count,
  status,
  is_featured,
  is_starter_story,
  user_id,
  tags,
  created_at,
  updated_at
) VALUES
-- 1. The Shepherd's Burden
(
  'The Shepherd''s Burden',
  'the-shepherds-burden',
  'A young shepherd is chosen by ancient stones to become a hero he never wanted to be, facing an invasion of Hollow Ones with only mysterious runes and his courage.',
  'content/starter-stories/fantasy-reluctant-hero.md',
  'fantasy',
  'epic-quest',
  2847,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['reluctant-hero', 'ancient-magic', 'epic-fantasy', 'coming-of-age'],
  NOW(),
  NOW()
),

-- 2. The Poison Crown
(
  'The Poison Crown',
  'the-poison-crown',
  'Lady Morrigan Blackthorn must decide whether to accept a cursed throne or bargain with the Witch Queen to end her family''s bloodline and revolutionize the kingdom.',
  'content/starter-stories/fantasy-dark-cursed-kingdom.md',
  'fantasy',
  'dark-fantasy',
  2956,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['dark-fantasy', 'political-intrigue', 'curses', 'revolution'],
  NOW(),
  NOW()
),

-- 3. The Untalented
(
  'The Untalented',
  'the-untalented',
  'Lily Thornwick, the worst student at Celestia Academy, discovers her "failed" magic is actually a rare gift for Chaos Weaving.',
  'content/starter-stories/fantasy-mage-academy.md',
  'fantasy',
  'academy',
  2734,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['magic-academy', 'coming-of-age', 'neurodivergent', 'self-discovery'],
  NOW(),
  NOW()
),

-- 4. The Fifth Element
(
  'The Fifth Element',
  'the-fifth-element',
  'General Kira Stormborn ends a 300-year war between elemental kingdoms by sacrificing her identity to become the Fifth Element—Spirit—that binds them all.',
  'content/starter-stories/fantasy-elemental-war.md',
  'fantasy',
  'high-fantasy',
  2891,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['elemental-magic', 'war', 'sacrifice', 'unity'],
  NOW(),
  NOW()
),

-- 5. The Last Bookshop
(
  'The Last Bookshop',
  'the-last-bookshop',
  'Detective Maya Chen discovers a magical bookshop that appears overnight and must venture into the Other to rescue people taken by the Wild Hunt.',
  'content/starter-stories/fantasy-urban-mystery.md',
  'fantasy',
  'urban-fantasy',
  2812,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['urban-fantasy', 'detective', 'wild-hunt', 'modern-magic'],
  NOW(),
  NOW()
);

-- SCIENCE FICTION CATEGORY STORIES (2 stories)

INSERT INTO stories (
  title,
  slug,
  description,
  content_path,
  category,
  subcategory,
  word_count,
  status,
  is_featured,
  is_starter_story,
  user_id,
  tags,
  created_at,
  updated_at
) VALUES
-- 6. First Contact Protocol
(
  'First Contact Protocol',
  'first-contact-protocol',
  'Dr. Amara Okafor detects an alien signal and becomes humanity''s first contact with the Luminari, cosmic anthropologists who collect the stories of civilizations.',
  'content/starter-stories/scifi-space-exploration.md',
  'science-fiction',
  'space-exploration',
  2923,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['first-contact', 'space-exploration', 'aliens', 'cultural-exchange'],
  NOW(),
  NOW()
),

-- 7. Neon Requiem
(
  'Neon Requiem',
  'neon-requiem',
  'Detective Kai Nakamura investigates corporate murders in Neo-Tokyo, uncovering a conspiracy involving digital consciousness and corporate immortality.',
  'content/starter-stories/scifi-cyberpunk-noir.md',
  'science-fiction',
  'cyberpunk',
  2867,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['cyberpunk', 'noir', 'consciousness', 'corporate-dystopia'],
  NOW(),
  NOW()
);

-- ROMANCE CATEGORY STORIES (2 stories)

INSERT INTO stories (
  title,
  slug,
  description,
  content_path,
  category,
  subcategory,
  word_count,
  status,
  is_featured,
  is_starter_story,
  user_id,
  tags,
  created_at,
  updated_at
) VALUES
-- 8. The Rival''s Gambit
(
  'The Rival''s Gambit',
  'the-rivals-gambit',
  'Marketing rivals Jordan and Alex compete for a promotion while slowly realizing their animosity masks deeper feelings.',
  'content/starter-stories/romance-rival-coworkers.md',
  'romance',
  'contemporary',
  2678,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['enemies-to-lovers', 'workplace-romance', 'slow-burn', 'contemporary'],
  NOW(),
  NOW()
),

-- 9. Beneath the Gaslight
(
  'Beneath the Gaslight',
  'beneath-the-gaslight',
  'Set in 1889 Paris during the Exposition Universelle, an American engineer and a French artist navigate class differences and societal expectations.',
  'content/starter-stories/romance-historical.md',
  'romance',
  'historical',
  2823,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['historical-romance', 'paris', 'artist', 'class-barriers'],
  NOW(),
  NOW()
);

-- MYSTERY/THRILLER CATEGORY STORIES (2 stories)

INSERT INTO stories (
  title,
  slug,
  description,
  content_path,
  category,
  subcategory,
  word_count,
  status,
  is_featured,
  is_starter_story,
  user_id,
  tags,
  created_at,
  updated_at
) VALUES
-- 10. The Lighthouse Murders
(
  'The Lighthouse Murders',
  'the-lighthouse-murders',
  'Ten strangers are trapped in a lighthouse during a storm when one of them is murdered, and everyone is a suspect.',
  'content/starter-stories/mystery-whodunit.md',
  'mystery',
  'whodunit',
  2845,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['whodunit', 'locked-room', 'murder-mystery', 'detective'],
  NOW(),
  NOW()
),

-- 11. The Unreliable Witness
(
  'The Unreliable Witness',
  'the-unreliable-witness',
  'A woman with dissociative identity disorder witnesses a murder, but can''t trust her own memories or which personality saw what.',
  'content/starter-stories/mystery-psychological.md',
  'mystery',
  'psychological-thriller',
  2778,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['psychological-thriller', 'unreliable-narrator', 'DID', 'mental-health'],
  NOW(),
  NOW()
);

-- HORROR CATEGORY STORIES (2 stories)

INSERT INTO stories (
  title,
  slug,
  description,
  content_path,
  category,
  subcategory,
  word_count,
  status,
  is_featured,
  is_starter_story,
  user_id,
  tags,
  created_at,
  updated_at
) VALUES
-- 12. Blackwood Manor
(
  'Blackwood Manor',
  'blackwood-manor',
  'An archivist arrives at a decaying estate to catalog a family''s papers, only to discover the house itself is alive and hungry.',
  'content/starter-stories/horror-gothic.md',
  'horror',
  'gothic',
  2823,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['gothic-horror', 'haunted-house', 'atmospheric', 'decay'],
  NOW(),
  NOW()
),

-- 13. The Geometry of Fear
(
  'The Geometry of Fear',
  'the-geometry-of-fear',
  'A mathematician discovers equations that reveal the true nature of reality—and the incomprehensible entities that exist beyond human perception.',
  'content/starter-stories/horror-cosmic.md',
  'horror',
  'cosmic-horror',
  2889,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['cosmic-horror', 'lovecraftian', 'mathematics', 'existential'],
  NOW(),
  NOW()
);

-- LITERARY FICTION CATEGORY STORIES (2 stories)

INSERT INTO stories (
  title,
  slug,
  description,
  content_path,
  category,
  subcategory,
  word_count,
  status,
  is_featured,
  is_starter_story,
  user_id,
  tags,
  created_at,
  updated_at
) VALUES
-- 14. The Weight of Water
(
  'The Weight of Water',
  'the-weight-of-water',
  'Three generations of women gather at a lake house to scatter ashes, confronting decades of unspoken resentments and hidden love.',
  'content/starter-stories/literary-family-dynamics.md',
  'literary-fiction',
  'family-drama',
  2789,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['family-dynamics', 'generational-trauma', 'forgiveness', 'literary'],
  NOW(),
  NOW()
),

-- 15. The Summer of Becoming
(
  'The Summer of Becoming',
  'the-summer-of-becoming',
  'A queer teenager spends a transformative summer working at a bookstore, discovering identity, first love, and the courage to be authentic.',
  'content/starter-stories/literary-coming-of-age.md',
  'literary-fiction',
  'coming-of-age',
  2834,
  'published',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  ARRAY['coming-of-age', 'lgbtq', 'non-binary', 'self-discovery'],
  NOW(),
  NOW()
);

-- ============================================================================
-- CREATE STARTER STORIES COLLECTION
-- ============================================================================

-- Create a special collection for starter stories
INSERT INTO collections (
  name,
  slug,
  description,
  is_public,
  is_featured,
  user_id,
  created_at,
  updated_at
) VALUES (
  'Platform Starter Stories',
  'platform-starter-stories',
  'A curated collection of 16 professional stories showcasing the quality and diversity of the STXRYAI platform across all major genres.',
  true,
  true,
  (SELECT id FROM users WHERE email = 'admin@stxryai.com' LIMIT 1),
  NOW(),
  NOW()
);

-- Add all starter stories to the collection
INSERT INTO collection_stories (collection_id, story_id, position)
SELECT 
  (SELECT id FROM collections WHERE slug = 'platform-starter-stories'),
  id,
  ROW_NUMBER() OVER (ORDER BY created_at)
FROM stories
WHERE is_starter_story = true;

-- ============================================================================
-- UPDATE STATISTICS
-- ============================================================================

-- Update story view counts to give starter stories initial visibility
UPDATE stories
SET view_count = 100 + (RANDOM() * 400)::int
WHERE is_starter_story = true;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all stories were inserted
-- SELECT COUNT(*) as total_starter_stories FROM stories WHERE is_starter_story = true;
-- Expected: 16

-- Verify stories by category
-- SELECT category, COUNT(*) as count 
-- FROM stories 
-- WHERE is_starter_story = true 
-- GROUP BY category 
-- ORDER BY category;

-- Verify collection was created
-- SELECT * FROM collections WHERE slug = 'platform-starter-stories';

-- View all starter stories with details
-- SELECT 
--   title,
--   category,
--   subcategory,
--   word_count,
--   status,
--   is_featured
-- FROM stories
-- WHERE is_starter_story = true
-- ORDER BY category, created_at;

COMMIT;