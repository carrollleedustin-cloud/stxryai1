# 🆘 Troubleshooting Guide

## Error: "column 'category' does not exist"

### Quick Fix
1. Go to Supabase SQL Editor
2. Run: `supabase/FIX_MISSING_COLUMNS.sql`
3. Done! ✅

### What Happened
The `reading_clubs` table exists but is missing the `category` column. This happens when:
- Table was created with old schema
- Columns were accidentally deleted
- Migration wasn't complete

### How to Fix

**Option A: Auto-Fix (Recommended)**
```bash
# Go to Supabase SQL Editor
# Copy contents of supabase/FIX_MISSING_COLUMNS.sql
# Click "Run"
```

**Option B: Manual Fix**
```sql
ALTER TABLE reading_clubs
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;
```

**Option C: Verify & Fix**
```sql
-- Check what columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'reading_clubs';

-- Add missing columns
ALTER TABLE reading_clubs
ADD COLUMN IF NOT EXISTS category TEXT;
```

---

## Error: "relation 'reading_clubs' does not exist"

### Cause
The table hasn't been created yet.

### Fix
1. Go to Supabase SQL Editor
2. Copy full SQL from `SOCIAL_FEATURES_SETUP.md`
3. Run all the CREATE TABLE statements
4. Run all the CREATE INDEX statements
5. Run all the RLS policy statements

### Verification
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'reading_clubs';
```

Should return: `reading_clubs`

---

## Error: "permission denied for schema public"

### Cause
RLS policies are blocking the operation.

### Fix
1. Check if RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'reading_clubs';
```

2. If RLS is enabled, verify policies exist:
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'reading_clubs';
```

3. If policies are missing, run RLS policy SQL from `SOCIAL_FEATURES_SETUP.md`

---

## Error: "Failed to create club" (in app)

### Check 1: Are you authenticated?
- Go to browser console
- Check if user is logged in
- If not, log in first

### Check 2: Check API response
- Open Network tab in browser
- Try to create a club
- Look for POST request to `/api/clubs`
- Check the response for error details

### Check 3: Check server logs
- Look for error messages in terminal
- Check Supabase logs
- Look for database errors

### Check 4: Verify database
```sql
-- Check if table exists
SELECT * FROM reading_clubs LIMIT 1;

-- Check if columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'reading_clubs';

-- Check RLS policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'reading_clubs';
```

---

## Error: "Failed to create story"

### Check 1: Are you authenticated?
- Must be logged in to create stories
- Check browser console

### Check 2: Check stories table
```sql
-- Verify table exists
SELECT * FROM stories LIMIT 1;

-- Check columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'stories';
```

### Check 3: Check API response
- Open Network tab
- Try to create a story
- Look for POST request to `/api/stories`
- Check response for error details

---

## Error: "Failed to join club"

### Possible Causes

**1. Already a member**
```sql
-- Check if already a member
SELECT * FROM club_members 
WHERE club_id = 'club-id' 
AND user_id = 'your-user-id';
```

**2. Club doesn't exist**
```sql
-- Check if club exists
SELECT * FROM reading_clubs 
WHERE id = 'club-id';
```

**3. RLS policy issue**
```sql
-- Check RLS policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'club_members';
```

### Fix
- Try a different club
- Verify club exists
- Check RLS policies are correct

---

## Error: "Unauthorized" (401)

### Cause
Not authenticated or session expired.

### Fix
1. Log out and log back in
2. Check if authentication is working
3. Verify Supabase auth is configured
4. Check browser console for auth errors

---

## Error: "Forbidden" (403)

### Cause
RLS policy is blocking the operation.

### Fix
1. Check RLS policies:
```sql
SELECT policyname, permissive, roles, qual 
FROM pg_policies 
WHERE tablename = 'reading_clubs';
```

2. Verify policy allows your operation:
```sql
-- Example: Check if you can insert
SELECT * FROM pg_policies 
WHERE tablename = 'reading_clubs' 
AND policyname LIKE '%insert%';
```

3. If policies are wrong, recreate them from `SOCIAL_FEATURES_SETUP.md`

---

## Error: "Duplicate key value"

### Cause
You're trying to do something twice (e.g., join a club twice).

### Fix
- This is expected behavior
- Just try a different action
- For clubs: try joining a different club

---

## Database Not Responding

### Check 1: Is Supabase up?
- Go to https://status.supabase.com
- Check if there are any incidents

### Check 2: Check connection
```sql
-- Simple query to test connection
SELECT 1;
```

### Check 3: Check credentials
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
- Check .env.local file

---

## API Route Not Found (404)

### Cause
API route doesn't exist or path is wrong.

### Fix
1. Verify file exists:
   - `src/app/api/clubs/route.ts`
   - `src/app/api/clubs/[clubId]/route.ts`
   - `src/app/api/stories/route.ts`

2. Verify path is correct:
   - POST `/api/clubs` → Create club
   - GET `/api/clubs` → List clubs
   - POST `/api/clubs/[clubId]` → Join club
   - DELETE `/api/clubs/[clubId]` → Leave club
   - POST `/api/stories` → Create story
   - GET `/api/stories` → Get stories

3. Restart dev server:
```bash
npm run dev
```

---

## Slow Performance

### Check 1: Indexes exist
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'reading_clubs';
```

### Check 2: Create missing indexes
```sql
CREATE INDEX IF NOT EXISTS idx_reading_clubs_category ON reading_clubs(category);
CREATE INDEX IF NOT EXISTS idx_reading_clubs_created_by ON reading_clubs(created_by);
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
```

### Check 3: Check query performance
```sql
EXPLAIN ANALYZE SELECT * FROM reading_clubs WHERE category = 'Horror';
```

---

## Data Not Saving

### Check 1: RLS policies allow INSERT
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'reading_clubs' 
AND policyname LIKE '%insert%';
```

### Check 2: Check if data was inserted
```sql
SELECT COUNT(*) FROM reading_clubs;
SELECT * FROM reading_clubs ORDER BY created_at DESC LIMIT 1;
```

### Check 3: Check for errors
- Look at browser console
- Look at Network tab response
- Look at server logs

---

## Complete Diagnostic

Run this to check everything:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reading_clubs', 'club_members', 'stories', 'story_likes', 'user_follows', 'messages', 'live_events')
ORDER BY table_name;

-- Check reading_clubs columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'reading_clubs' 
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('reading_clubs', 'club_members', 'stories');

-- Check RLS policies exist
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('reading_clubs', 'club_members', 'stories')
ORDER BY tablename;

-- Check indexes exist
SELECT tablename, indexname FROM pg_indexes 
WHERE tablename IN ('reading_clubs', 'club_members', 'stories')
ORDER BY tablename;

-- Check data exists
SELECT COUNT(*) as club_count FROM reading_clubs;
SELECT COUNT(*) as member_count FROM club_members;
SELECT COUNT(*) as story_count FROM stories;
```

---

## Still Having Issues?

### Step 1: Gather Information
- Error message (exact text)
- What were you trying to do?
- Browser console errors
- Network tab response
- Server logs

### Step 2: Check Documentation
- `SOCIAL_FEATURES_SETUP.md` - Setup guide
- `SOCIAL_FEATURES_COMPLETE.md` - Full docs
- `FIX_COLUMN_ERROR.md` - Column error fix

### Step 3: Run Diagnostics
- Run the complete diagnostic SQL above
- Check all tables exist
- Check all columns exist
- Check RLS policies
- Check indexes

### Step 4: Try Fixes
- Run `FIX_MISSING_COLUMNS.sql`
- Recreate RLS policies
- Restart dev server
- Clear browser cache

### Step 5: Nuclear Option
- Drop all tables
- Recreate from scratch
- Run full SQL from `SOCIAL_FEATURES_SETUP.md`

---

## Quick Reference

| Error | File to Check | Fix |
|-------|---------------|-----|
| column "category" does not exist | FIX_COLUMN_ERROR.md | Run FIX_MISSING_COLUMNS.sql |
| relation "reading_clubs" does not exist | SOCIAL_FEATURES_SETUP.md | Run CREATE TABLE SQL |
| permission denied | SOCIAL_FEATURES_SETUP.md | Run RLS policy SQL |
| Failed to create club | Browser console | Check API response |
| Failed to create story | Browser console | Check API response |
| Failed to join club | Browser console | Check API response |
| Unauthorized (401) | Browser console | Log in again |
| Forbidden (403) | SOCIAL_FEATURES_SETUP.md | Check RLS policies |
| Duplicate key | Expected | Try different action |
| API route not found (404) | File system | Verify file exists |
| Slow performance | SOCIAL_FEATURES_SETUP.md | Create indexes |

---

## Support Resources

- **Setup Guide**: `SOCIAL_FEATURES_SETUP.md`
- **Full Documentation**: `SOCIAL_FEATURES_COMPLETE.md`
- **Column Error Fix**: `FIX_COLUMN_ERROR.md`
- **This Guide**: `TROUBLESHOOTING.md`

---

## Summary

**Most Common Issue**: Missing `category` column
**Quick Fix**: Run `supabase/FIX_MISSING_COLUMNS.sql`
**Time to Fix**: 2 minutes

**If that doesn't work**:
1. Run diagnostic SQL
2. Identify what's missing
3. Run appropriate fix
4. Test in app

You've got this! 🚀
