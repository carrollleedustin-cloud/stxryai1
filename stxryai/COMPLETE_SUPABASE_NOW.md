# ⚡ COMPLETE SUPABASE SETUP NOW - 5 Minutes

## 🎯 Current Status
- ✅ Database connected
- ✅ Most tables exist
- ⚠️ Storage buckets need creation
- ⚠️ One table missing (`reading_progress`)

---

## 🚀 Step 1: Create Storage Buckets (2 minutes)

### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/sql
   - Or: Dashboard → SQL Editor

2. **Copy the SQL Script**
   - Open file: `stxryai/database/storage-buckets.sql`
   - Select all content (Ctrl+A)
   - Copy (Ctrl+C)

3. **Run the Script**
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for success message

4. **Verify Buckets Created**
   - Go to: Dashboard → Storage → Buckets
   - You should see 5 buckets:
     - ✅ user-avatars
     - ✅ story-covers
     - ✅ user-uploads
     - ✅ story-assets
     - ✅ system-assets

### Option B: Manual Creation (Alternative)

If SQL script fails, create buckets manually:

1. Go to: Dashboard → Storage → New Bucket

2. Create each bucket with these settings:

#### Bucket 1: user-avatars
```
Name: user-avatars
Public: ✅ Yes
File size limit: 5242880 (5MB)
Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
```

#### Bucket 2: story-covers
```
Name: story-covers
Public: ✅ Yes
File size limit: 10485760 (10MB)
Allowed MIME types: image/jpeg, image/png, image/webp
```

#### Bucket 3: user-uploads
```
Name: user-uploads
Public: ❌ No
File size limit: 52428800 (50MB)
Allowed MIME types: image/*, application/pdf, text/plain, application/msword
```

#### Bucket 4: story-assets
```
Name: story-assets
Public: ❌ No
File size limit: 20971520 (20MB)
Allowed MIME types: image/*, audio/*, video/*
```

#### Bucket 5: system-assets
```
Name: system-assets
Public: ✅ Yes
File size limit: 104857600 (100MB)
Allowed MIME types: (leave empty for all types)
```

---

## 🔧 Step 2: Fix Missing Table (1 minute)

The `reading_progress` table might be missing. To add it:

1. **Open SQL Editor**
   - https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/sql

2. **Run this SQL**:

```sql
-- Create reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  last_read_position INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user 
  ON reading_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_reading_progress_story 
  ON reading_progress(story_id);

-- Enable RLS
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own reading progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading progress"
  ON reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading progress"
  ON reading_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading progress"
  ON reading_progress FOR DELETE
  USING (auth.uid() = user_id);
```

3. **Click Run**

---

## ✅ Step 3: Verify Setup (1 minute)

Run the test script again:

```bash
cd stxryai
node test-supabase-connection.js
```

**Expected Output:**
```
✅ Database connection successful!
✅ All tables exist
✅ All storage buckets exist
✅ Auth system operational!
✨ All tests passed!
```

---

## 🎉 Step 4: Test Your Application (1 minute)

Start the development server:

```bash
cd stxryai
npm run dev
```

Visit: http://localhost:3000

**Test these features:**
1. ✅ User registration
2. ✅ User login
3. ✅ Upload profile picture
4. ✅ Create a story
5. ✅ Upload story cover

---

## 🐛 Troubleshooting

### Issue: SQL Script Fails

**Error**: "permission denied" or "already exists"

**Solution**:
- If "already exists": That's OK, skip to next step
- If "permission denied": Use manual bucket creation (Option B above)

### Issue: Buckets Not Showing

**Solution**:
1. Refresh the Storage page
2. Check Dashboard → Logs for errors
3. Try manual creation

### Issue: File Upload Still Fails

**Solution**:
1. Verify bucket exists: Dashboard → Storage
2. Check bucket is public (for avatars/covers)
3. Verify file size is within limits
4. Check MIME type is allowed

### Issue: Reading Progress Not Working

**Solution**:
1. Verify table exists: Run `SELECT * FROM reading_progress LIMIT 1;`
2. Check RLS policies are enabled
3. Verify user is authenticated

---

## 📊 Quick Status Check

Run this SQL to verify everything:

```sql
-- Check all tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

---

## 🎯 Success Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Ran `storage-buckets.sql` script
- [ ] Verified 5 buckets created
- [ ] Ran `reading_progress` table SQL
- [ ] Ran test script - all passed
- [ ] Started dev server
- [ ] Tested user registration
- [ ] Tested file upload

---

## 📞 Need Help?

### Quick Links
- **SQL Editor**: https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/sql
- **Storage**: https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/storage/buckets
- **Logs**: https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/logs/explorer

### Documentation
- [`SUPABASE_COMPLETE_SETUP_GUIDE.md`](./SUPABASE_COMPLETE_SETUP_GUIDE.md) - Full guide
- [`SUPABASE_QUICK_REFERENCE.md`](./SUPABASE_QUICK_REFERENCE.md) - Quick reference
- [`SUPABASE_SETUP_STATUS.md`](./SUPABASE_SETUP_STATUS.md) - Current status

### Test Script
```bash
# Test connection
node test-supabase-connection.js

# Start dev server
npm run dev
```

---

## ⏱️ Time Estimate

- Storage buckets: 2 minutes
- Missing table: 1 minute
- Verification: 1 minute
- Testing: 1 minute

**Total: 5 minutes**

---

**Ready? Let's complete your Supabase setup now! 🚀**
