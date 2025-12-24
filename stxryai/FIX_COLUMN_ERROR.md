# 🔧 Fix: Column "category" Does Not Exist

## Problem
You're getting this error:
```
ERROR: 42703: column "category" does not exist
```

This means the `reading_clubs` table exists but is missing the `category` column (and possibly other columns).

---

## Solution

### Option 1: Quick Fix (Recommended)

1. Go to Supabase SQL Editor
2. Copy and paste the contents of `supabase/FIX_MISSING_COLUMNS.sql`
3. Click "Run"
4. Done! ✅

This script will:
- Add missing columns to existing tables
- Create missing indexes
- Verify all tables exist

### Option 2: Manual Fix

If Option 1 doesn't work, run these commands one by one:

```sql
-- Add missing columns to reading_clubs
ALTER TABLE reading_clubs
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- Add missing columns to stories
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add missing columns to live_events
ALTER TABLE live_events
ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
```

### Option 3: Complete Rebuild (Nuclear Option)

If the tables are corrupted, drop and recreate them:

```sql
-- Drop all tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS live_events CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS story_bookmarks CASCADE;
DROP TABLE IF EXISTS story_likes CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS club_members CASCADE;
DROP TABLE IF EXISTS reading_clubs CASCADE;

-- Then run the full SQL from SOCIAL_FEATURES_SETUP.md
```

---

## Verification

After running the fix, verify the tables are correct:

```sql
-- Check reading_clubs columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reading_clubs'
ORDER BY ordinal_position;

-- Check stories columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stories'
ORDER BY ordinal_position;

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reading_clubs', 'club_members', 'stories', 'story_likes', 'user_follows', 'messages', 'live_events')
ORDER BY table_name;
```

Expected output for `reading_clubs`:
```
id                  | uuid
name                | text
description         | text
category            | text          ← Should exist
is_private          | boolean
cover_image_url     | text
tags                | text[]        ← Should exist
created_by          | uuid
member_count        | integer       ← Should exist
created_at          | timestamp
updated_at          | timestamp
```

---

## Testing After Fix

1. Go to `/clubs`
2. Click "Create Club"
3. Fill in the form with:
   - Name: "Test Club"
   - Description: "Test Description"
   - Category: "Horror"
   - Private: unchecked
4. Click "Create Club"
5. ✅ Should succeed!

---

## If Still Getting Errors

### Error: "relation 'reading_clubs' does not exist"
→ Tables haven't been created yet
→ Run the full SQL from `SOCIAL_FEATURES_SETUP.md`

### Error: "column 'category' does not exist"
→ Table exists but column is missing
→ Run `FIX_MISSING_COLUMNS.sql`

### Error: "permission denied"
→ RLS policies are blocking the operation
→ Check RLS policies are set up correctly
→ Run the RLS policy SQL from `SOCIAL_FEATURES_SETUP.md`

### Error: "duplicate key value"
→ You're trying to join a club twice
→ This is expected - just try a different club

---

## Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| column "category" does not exist | Missing column | Run FIX_MISSING_COLUMNS.sql |
| relation "reading_clubs" does not exist | Table not created | Run full SQL from SOCIAL_FEATURES_SETUP.md |
| permission denied for schema public | RLS policy issue | Check RLS policies are enabled |
| duplicate key value violates unique constraint | Already a member | Try a different club |
| Failed to create club | API error | Check browser console for details |

---

## Step-by-Step Recovery

### Step 1: Check What Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Step 2: Check What Columns Exist
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reading_clubs'
ORDER BY ordinal_position;
```

### Step 3: Add Missing Columns
```sql
ALTER TABLE reading_clubs
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;
```

### Step 4: Verify Fix
```sql
SELECT * FROM reading_clubs LIMIT 1;
```

### Step 5: Test in App
- Go to `/clubs`
- Try to create a club
- Should work now! ✅

---

## Prevention

To avoid this in the future:

1. **Always use CREATE TABLE IF NOT EXISTS**
   - Prevents errors if table already exists

2. **Always use ADD COLUMN IF NOT EXISTS**
   - Prevents errors if column already exists

3. **Test after each migration**
   - Verify tables and columns exist

4. **Keep backups**
   - Export data before major changes

---

## Support

If you're still having issues:

1. **Check the error message** - It usually tells you what's wrong
2. **Run the verification queries** - See what tables/columns exist
3. **Check the browser console** - Client-side errors
4. **Check the Network tab** - API response errors
5. **Check server logs** - Backend errors

---

## Summary

**Quick Fix:**
1. Go to Supabase SQL Editor
2. Run `supabase/FIX_MISSING_COLUMNS.sql`
3. Done! ✅

**If that doesn't work:**
1. Run the verification queries
2. Identify what's missing
3. Run the appropriate fix
4. Test in the app

**If still broken:**
1. Drop all tables (WARNING: deletes data)
2. Run full SQL from `SOCIAL_FEATURES_SETUP.md`
3. Re-enable RLS policies
4. Test again

---

## Next Steps

After fixing:
1. ✅ Test club creation
2. ✅ Test story creation
3. ✅ Test joining clubs
4. ✅ Deploy to production

You're all set! 🚀
