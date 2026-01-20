# 🛠️ MANUAL STORAGE BUCKET CREATION

## If SQL Scripts Fail - Create Buckets Manually

### Step 1: Go to Supabase Dashboard
- Open: https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/storage/buckets

### Step 2: Create Each Bucket

#### Bucket 1: user-avatars
```
Name: user-avatars
✅ Public bucket
File size limit: 5242880 (5MB)
Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
```
**Click "Create bucket"**

#### Bucket 2: story-covers
```
Name: story-covers
✅ Public bucket
File size limit: 10485760 (10MB)
Allowed MIME types: image/jpeg, image/png, image/webp
```
**Click "Create bucket"**

#### Bucket 3: user-uploads
```
Name: user-uploads
❌ Private bucket (uncheck "Public bucket")
File size limit: 52428800 (50MB)
Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
```
**Click "Create bucket"**

#### Bucket 4: story-assets
```
Name: story-assets
❌ Private bucket (uncheck "Public bucket")
File size limit: 20971520 (20MB)
Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, audio/mpeg, audio/wav, video/mp4, video/webm
```
**Click "Create bucket"**

#### Bucket 5: system-assets
```
Name: system-assets
✅ Public bucket
File size limit: 104857600 (100MB)
Allowed MIME types: (leave empty for all types)
```
**Click "Create bucket"**

### Step 3: Verify Buckets Created
- Refresh the page
- You should see all 5 buckets listed
- Check the test script again

### Step 4: Create Reading Progress Table (if needed)

If the table is still missing, run this SQL:

```sql
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

CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_story ON reading_progress(story_id);
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
```

### Step 5: Test Again

```bash
cd stxryai
node test-supabase-connection.js
```

**Expected: All buckets found ✅**

---

## 🔍 Troubleshooting

### Issue: "Bucket already exists"
**Solution**: Skip that bucket, continue with others

### Issue: SQL Editor not working
**Solution**: Use manual bucket creation above

### Issue: Still showing buckets missing
**Solution**:
1. Hard refresh browser (Ctrl+F5)
2. Check you're in the right project
3. Try the test script again

### Issue: Permission denied
**Solution**: Make sure you're logged into Supabase with the correct account

---

## ✅ Success Checklist

- [ ] Opened Storage → Buckets
- [ ] Created user-avatars bucket
- [ ] Created story-covers bucket
- [ ] Created user-uploads bucket
- [ ] Created story-assets bucket
- [ ] Created system-assets bucket
- [ ] Ran test script - all buckets found
- [ ] Started dev server: `npm run dev`

---

**Manual creation takes 3-5 minutes and guarantees success!** 🎯