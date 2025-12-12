-- Seed Data: Starter Stories Across Multiple Genres
-- This file populates the database with diverse, high-quality starter stories

-- Note: Replace 'YOUR_ADMIN_USER_ID' with actual admin user ID after first user creation
-- Or create a dedicated system user for these stories

-- ===========================================
-- CHILDREN'S STORIES (Ages 3-8)
-- ===========================================

-- Children's Story 1: Adventure
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'YOUR_ADMIN_USER_ID',
  'The Magic Treehouse Mystery',
  'Join Luna and Max as they discover a magical treehouse in their backyard that transports them to different worlds! Perfect for young readers learning to make choices.',
  '/images/stories/magic-treehouse.jpg',
  'Children''s Adventure',
  'easy',
  ARRAY['kids', 'magic', 'adventure', 'animals', 'educational'],
  false,
  true,
  4.8,
  234,
  1247,
  5,
  850,
  NOW()
);

INSERT INTO chapters (id, story_id, title, content, chapter_number, word_count, is_published)
VALUES (
  'c1100000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'The Mysterious Door',
  'Luna and Max were playing in their backyard when they noticed something strange. Behind the old oak tree, there was a tiny door they had never seen before!

"Look, Max!" Luna pointed. "That door wasn''t there yesterday!"

Max walked closer, his eyes wide with wonder. The door was painted bright blue and had a tiny golden doorknob. It was just big enough for them to fit through.

"Should we knock?" Max asked.

Luna thought for a moment. She was the older sister and wanted to be brave.

What should they do?',
  1,
  85,
  true
);

INSERT INTO choices (chapter_id, text, next_chapter_id, position)
VALUES
  ('c1100000-0000-0000-0000-000000000001', 'Knock on the door three times', 'c1100000-0000-0000-0000-000000000002', 1),
  ('c1100000-0000-0000-0000-000000000001', 'Try to open it very carefully', 'c1100000-0000-0000-0000-000000000003', 2),
  ('c1100000-0000-0000-0000-000000000001', 'Call their parents first', 'c1100000-0000-0000-0000-000000000004', 3);

-- Children's Story 2: Learning & Friendship
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c1000000-0000-0000-0000-000000000002',
  'YOUR_ADMIN_USER_ID',
  'Benny the Brave Bunny',
  'Benny is a little bunny who is afraid of the dark. Follow his journey as he learns to be brave with help from his forest friends!',
  '/images/stories/benny-bunny.jpg',
  'Children''s Educational',
  'easy',
  ARRAY['kids', 'animals', 'emotions', 'friendship', 'learning'],
  false,
  true,
  4.9,
  456,
  2103,
  4,
  720,
  NOW()
);

-- ===========================================
-- MIDDLE GRADE (Ages 8-12)
-- ===========================================

-- Middle Grade Story 1: Mystery
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c2000000-0000-0000-0000-000000000001',
  'YOUR_ADMIN_USER_ID',
  'The Secret of Willow Creek',
  'When strange things start happening in the small town of Willow Creek, 12-year-old detective Sophie Chen must solve the mystery before it''s too late!',
  '/images/stories/willow-creek.jpg',
  'Mystery',
  'medium',
  ARRAY['mystery', 'detective', 'middle-grade', 'puzzle', 'adventure'],
  false,
  true,
  4.7,
  892,
  4521,
  8,
  3400,
  NOW()
);

INSERT INTO chapters (id, story_id, title, content, chapter_number, word_count, is_published)
VALUES (
  'c2100000-0000-0000-0000-000000000001',
  'c2000000-0000-0000-0000-000000000001',
  'The Missing Book',
  'Sophie Chen pushed her glasses up her nose as she examined the empty shelf. The oldest book in Willow Creek Library—"The Founder''s Journal"—had vanished.

"It was here yesterday," Mrs. Patterson, the librarian, said nervously. "That book has been in this library for 150 years. It never leaves the building!"

Sophie noticed something odd. The dust on the shelf showed a rectangular outline where the book should be, but there were also three small circular marks—like someone had placed something there temporarily.

"Mrs. Patterson, who has access to this section?" Sophie asked, pulling out her detective notebook.

"Only myself and the mayor," the librarian replied. "The book is too valuable to let anyone else handle it."

Sophie frowned. This was getting interesting. The circular marks suggested someone used a tool or device. But why would anyone steal a dusty old history book?

What should Sophie investigate first?',
  1,
  145,
  true
);

INSERT INTO choices (chapter_id, text, next_chapter_id, position)
VALUES
  ('c2100000-0000-0000-0000-000000000001', 'Examine the circular marks more closely', 'c2100000-0000-0000-0000-000000000002', 1),
  ('c2100000-0000-0000-0000-000000000001', 'Interview the mayor about the book', 'c2100000-0000-0000-0000-000000000003', 2),
  ('c2100000-0000-0000-0000-000000000001', 'Check the library security cameras', 'c2100000-0000-0000-0000-000000000004', 3);

-- ===========================================
-- YOUNG ADULT (Ages 13-17)
-- ===========================================

-- YA Story 1: Fantasy Adventure
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c3000000-0000-0000-0000-000000000001',
  'YOUR_ADMIN_USER_ID',
  'Echoes of the Shattered Realm',
  'In a world where magic is dying, 16-year-old Aria must choose between saving her kingdom or discovering the truth about her mysterious past.',
  '/images/stories/shattered-realm.jpg',
  'Fantasy',
  'medium',
  ARRAY['fantasy', 'magic', 'ya', 'coming-of-age', 'epic'],
  false,
  true,
  4.9,
  3247,
  15678,
  12,
  8900,
  NOW()
);

-- YA Story 2: Sci-Fi
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c3000000-0000-0000-0000-000000000002',
  'YOUR_ADMIN_USER_ID',
  'Neon Nights: 2084',
  'In Neo-Tokyo 2084, teenage hacker Kai discovers a conspiracy that could bring down the megacorporations controlling the city. But can he trust his new allies?',
  '/images/stories/neon-nights.jpg',
  'Cyberpunk',
  'hard',
  ARRAY['cyberpunk', 'sci-fi', 'hacking', 'dystopia', 'action'],
  false,
  true,
  4.6,
  2134,
  9876,
  10,
  7200,
  NOW()
);

-- ===========================================
-- ADULT - DIVERSE GENRES
-- ===========================================

-- Adult Story 1: Romance
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c4000000-0000-0000-0000-000000000001',
  'YOUR_ADMIN_USER_ID',
  'Coffee Shop Chronicles',
  'Emma, a struggling writer, finds unexpected romance when she meets Alex, a mysterious regular at her favorite coffee shop. But both are hiding secrets that could tear them apart.',
  '/images/stories/coffee-shop.jpg',
  'Romance',
  'medium',
  ARRAY['romance', 'contemporary', 'sweet', 'coffee', 'writer'],
  false,
  true,
  4.8,
  5621,
  23456,
  15,
  12000,
  NOW()
);

-- Adult Story 2: Thriller
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c4000000-0000-0000-0000-000000000002',
  'YOUR_ADMIN_USER_ID',
  'The Last Witness',
  'Detective Sarah Morgan has 48 hours to find the only witness to a murder before the killer does. Every choice matters. Every second counts.',
  '/images/stories/last-witness.jpg',
  'Thriller',
  'hard',
  ARRAY['thriller', 'mystery', 'detective', 'suspense', 'crime'],
  false,
  true,
  4.7,
  4892,
  19234,
  14,
  11500,
  NOW()
);

-- Adult Story 3: Horror
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c4000000-0000-0000-0000-000000000003',
  'YOUR_ADMIN_USER_ID',
  'Whispers in the Walls',
  'The old mansion was supposed to be a fresh start. But the house has other plans, and the walls are beginning to whisper...',
  '/images/stories/whispers-walls.jpg',
  'Horror',
  'hard',
  ARRAY['horror', 'psychological', 'haunted', 'suspense', 'dark'],
  false,
  true,
  4.5,
  3421,
  14567,
  10,
  9200,
  NOW()
);

-- Adult Story 4: Historical Fiction
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c4000000-0000-0000-0000-000000000004',
  'YOUR_ADMIN_USER_ID',
  'Letters from the Front',
  'Paris, 1944. Resistance fighter Isabelle must choose between love and duty as the Allied forces approach. Based on true events.',
  '/images/stories/letters-front.jpg',
  'Historical',
  'medium',
  ARRAY['historical', 'wwii', 'france', 'resistance', 'war'],
  false,
  true,
  4.9,
  6734,
  28901,
  16,
  14000,
  NOW()
);

-- Adult Story 5: Western
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c4000000-0000-0000-0000-000000000005',
  'YOUR_ADMIN_USER_ID',
  'Dust and Glory',
  'A gunslinger with a troubled past must protect a small frontier town from a ruthless gang. But redemption comes at a price.',
  '/images/stories/dust-glory.jpg',
  'Western',
  'medium',
  ARRAY['western', 'action', 'redemption', 'frontier', 'adventure'],
  false,
  true,
  4.6,
  2156,
  8934,
  12,
  9800,
  NOW()
);

-- Adult Story 6: Steampunk
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c4000000-0000-0000-0000-000000000006',
  'YOUR_ADMIN_USER_ID',
  'Gears of Rebellion',
  'Victorian London, 1889. Inventor Ada Sterling creates a mechanical marvel that could change the world—or destroy it. The choice is yours.',
  '/images/stories/gears-rebellion.jpg',
  'Steampunk',
  'medium',
  ARRAY['steampunk', 'victorian', 'inventor', 'adventure', 'technology'],
  false,
  true,
  4.7,
  3892,
  16234,
  13,
  10500,
  NOW()
);

-- Adult Story 7: Post-Apocalyptic
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c4000000-0000-0000-0000-000000000007',
  'YOUR_ADMIN_USER_ID',
  'After the Ash',
  'Ten years after the bombs fell, survivor Marcus leads a small community. When strangers arrive with news of a sanctuary, he must decide who to trust.',
  '/images/stories/after-ash.jpg',
  'Post-Apocalyptic',
  'hard',
  ARRAY['post-apocalyptic', 'survival', 'dystopia', 'action', 'hope'],
  false,
  true,
  4.8,
  5234,
  21567,
  14,
  11200,
  NOW()
);

-- Adult Story 8: Superhero
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c4000000-0000-0000-0000-000000000008',
  'YOUR_ADMIN_USER_ID',
  'The Ordinary Hero',
  'When an ordinary office worker gains superpowers, they discover being a hero isn''t about the powers—it''s about the choices you make.',
  '/images/stories/ordinary-hero.jpg',
  'Superhero',
  'medium',
  ARRAY['superhero', 'powers', 'action', 'morality', 'modern'],
  false,
  true,
  4.7,
  4521,
  18234,
  11,
  9500,
  NOW()
);

-- ===========================================
-- GENRE-SPECIFIC VARIATIONS
-- ===========================================

-- Philosophical Sci-Fi
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c5000000-0000-0000-0000-000000000001',
  'YOUR_ADMIN_USER_ID',
  'The Consciousness Paradox',
  'In 2147, humans can upload their minds to the cloud. Dr. Elena Chen must decide if she''s willing to sacrifice her humanity for immortality.',
  '/images/stories/consciousness.jpg',
  'Sci-Fi',
  'hard',
  ARRAY['sci-fi', 'philosophical', 'ai', 'consciousness', 'future'],
  false,
  true,
  4.9,
  2890,
  12456,
  9,
  8200,
  NOW()
);

-- Cozy Mystery
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c5000000-0000-0000-0000-000000000002',
  'YOUR_ADMIN_USER_ID',
  'Murder at the Book Club',
  'Librarian and amateur sleuth Margaret Rose must solve the murder of a book club member—before the killer strikes again during their weekly meeting.',
  '/images/stories/book-club.jpg',
  'Mystery',
  'easy',
  ARRAY['cozy-mystery', 'books', 'amateur-detective', 'charming', 'puzzle'],
  false,
  true,
  4.8,
  6234,
  25678,
  10,
  8500,
  NOW()
);

-- Dark Fantasy
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c5000000-0000-0000-0000-000000000003',
  'YOUR_ADMIN_USER_ID',
  'Crown of Thorns',
  'To save her kingdom, Princess Elara makes a deal with a dark sorcerer. But every choice has a price, and some debts are paid in blood.',
  '/images/stories/crown-thorns.jpg',
  'Fantasy',
  'hard',
  ARRAY['dark-fantasy', 'morally-gray', 'magic', 'sacrifice', 'epic'],
  false,
  true,
  4.8,
  4567,
  19234,
  15,
  12800,
  NOW()
);

-- Humorous Adventure
INSERT INTO stories (id, user_id, title, description, cover_image, genre, difficulty, tags, is_premium, is_published, rating, rating_count, view_count, chapter_count, word_count, published_at)
VALUES (
  'c5000000-0000-0000-0000-000000000004',
  'YOUR_ADMIN_USER_ID',
  'The Accidental Wizard',
  'Office worker Jerry accidentally becomes a wizard after a mix-up at a mystical postal service. Now he has to save the world—without any idea what he''s doing.',
  '/images/stories/accidental-wizard.jpg',
  'Fantasy',
  'medium',
  ARRAY['fantasy', 'comedy', 'magic', 'humor', 'modern'],
  false,
  true,
  4.9,
  7892,
  32145,
  12,
  10200,
  NOW()
);

-- Update story count
UPDATE stories SET chapter_count = (SELECT COUNT(*) FROM chapters WHERE chapters.story_id = stories.id);

-- Note: To use this seed data:
-- 1. Create an admin user or system user first
-- 2. Replace 'YOUR_ADMIN_USER_ID' with the actual UUID
-- 3. Run this SQL file
-- 4. Add actual cover images to your /public/images/stories/ directory
-- 5. Complete the chapters and choices for each story as needed
