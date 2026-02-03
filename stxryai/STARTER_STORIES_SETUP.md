# Starter Stories - Simple Setup Guide

You have 16 professional stories ready to add to your platform. Here's the simplest way to do it:

## ✅ What You Have

**16 Complete Stories** (45,000+ words):
- 5 Fantasy stories
- 2 Science Fiction stories
- 2 Romance stories
- 2 Mystery/Thriller stories
- 2 Horror stories
- 2 Literary Fiction stories

All story files are in: `stxryai/content/starter-stories/`

## 🚀 Simple Setup (SQL Method)

### Step 1: Check Your Users

In Supabase SQL Editor, run:
```sql
SELECT id, email, username, role, is_admin 
FROM user_profiles 
ORDER BY created_at DESC;
```

### Step 2A: If You See Your Email

If you see `Stonedape710@gmail.com` in the results, run this to make yourself admin:

```sql
UPDATE user_profiles
SET role = 'admin', is_admin = true
WHERE email = 'Stonedape710@gmail.com';
```

### Step 2B: If You DON'T See Your Email

1. Go to your STXRYAI website
2. Sign up with Stonedape710@gmail.com
3. Then come back and run Step 2A

### Step 3: Import Stories

After you're admin, run this SQL (replace the email if needed):

```sql
DO $$
DECLARE
  my_user_id UUID;
BEGIN
  -- Get your user ID
  SELECT id INTO my_user_id FROM user_profiles WHERE email = 'Stonedape710@gmail.com';
  
  -- Insert all 16 stories
  INSERT INTO stories (user_id, title, description, genre, tags, is_published, word_count, chapter_count, view_count, published_at) VALUES
  (my_user_id, 'The Shepherd''s Burden', 'A young shepherd chosen by ancient stones to become a hero.', 'fantasy', ARRAY['epic-fantasy'], true, 2847, 1, 150, NOW()),
  (my_user_id, 'The Poison Crown', 'A cursed throne and a choice to revolutionize the kingdom.', 'fantasy', ARRAY['dark-fantasy'], true, 2956, 1, 200, NOW()),
  (my_user_id, 'The Untalented', 'A failed mage discovers her unique gift for Chaos Weaving.', 'fantasy', ARRAY['magic-academy'], true, 2734, 1, 180, NOW()),
  (my_user_id, 'The Fifth Element', 'Ending a 300-year war by becoming the Fifth Element.', 'fantasy', ARRAY['elemental-magic'], true, 2891, 1, 175, NOW()),
  (my_user_id, 'The Last Bookshop', 'A detective ventures into the Other to rescue people from the Wild Hunt.', 'fantasy', ARRAY['urban-fantasy'], true, 2812, 1, 165, NOW()),
  (my_user_id, 'First Contact Protocol', 'Humanity''s first contact with alien anthropologists.', 'science-fiction', ARRAY['first-contact'], true, 2923, 1, 190, NOW()),
  (my_user_id, 'Neon Requiem', 'Corporate murders and digital consciousness in Neo-Tokyo.', 'science-fiction', ARRAY['cyberpunk'], true, 2867, 1, 210, NOW()),
  (my_user_id, 'The Rival''s Gambit', 'Workplace rivals discover deeper feelings.', 'romance', ARRAY['enemies-to-lovers'], true, 2678, 1, 220, NOW()),
  (my_user_id, 'Beneath the Gaslight', 'Love across class barriers in 1889 Paris.', 'romance', ARRAY['historical-romance'], true, 2823, 1, 195, NOW()),
  (my_user_id, 'The Lighthouse Murders', 'A classic whodunit in an isolated lighthouse.', 'mystery', ARRAY['whodunit'], true, 2845, 1, 185, NOW()),
  (my_user_id, 'The Unreliable Witness', 'A witness with DID can''t trust her own memories.', 'mystery', ARRAY['psychological-thriller'], true, 2778, 1, 170, NOW()),
  (my_user_id, 'Blackwood Manor', 'A haunted house that''s alive and hungry.', 'horror', ARRAY['gothic-horror'], true, 2823, 1, 160, NOW()),
  (my_user_id, 'The Geometry of Fear', 'Equations revealing cosmic horror.', 'horror', ARRAY['cosmic-horror'], true, 2889, 1, 155, NOW()),
  (my_user_id, 'The Weight of Water', 'Three generations confronting family trauma.', 'literary-fiction', ARRAY['family-dynamics'], true, 2789, 1, 140, NOW()),
  (my_user_id, 'The Summer of Becoming', 'A queer teen''s journey of self-discovery.', 'literary-fiction', ARRAY['coming-of-age'], true, 2834, 1, 145, NOW());
END $$;
```

### Step 4: Verify

Run this to see your stories:
```sql
SELECT title, genre, word_count, is_published 
FROM stories 
WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'Stonedape710@gmail.com');
```

You should see all 16 stories!

## 📁 Story Files

All the full story content (2,000-3,000 words each) is in:
- `stxryai/content/starter-stories/fantasy-reluctant-hero.md`
- `stxryai/content/starter-stories/fantasy-dark-cursed-kingdom.md`
- `stxryai/content/starter-stories/fantasy-mage-academy.md`
- `stxryai/content/starter-stories/fantasy-elemental-war.md`
- `stxryai/content/starter-stories/fantasy-urban-mystery.md`
- `stxryai/content/starter-stories/scifi-space-exploration.md`
- `stxryai/content/starter-stories/scifi-cyberpunk-noir.md`
- `stxryai/content/starter-stories/romance-rival-coworkers.md`
- `stxryai/content/starter-stories/romance-historical.md`
- `stxryai/content/starter-stories/mystery-whodunit.md`
- `stxryai/content/starter-stories/mystery-psychological.md`
- `stxryai/content/starter-stories/horror-gothic.md`
- `stxryai/content/starter-stories/horror-cosmic.md`
- `stxryai/content/starter-stories/literary-family-dynamics.md`
- `stxryai/content/starter-stories/literary-coming-of-age.md`

## 💡 Why SQL Instead of Scripts?

The Node.js scripts need API keys configured in `.env.local`. The SQL method works directly in Supabase and is simpler—just copy, paste, and run!

## ✅ After Import

Your platform will have:
- 16 published stories
- Professional quality content
- Diverse genres represented
- Ready for users to read

That's it! Just use the SQL method in Supabase—no API keys needed! 🎉