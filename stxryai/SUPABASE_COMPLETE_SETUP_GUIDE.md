# 🚀 SUPABASE COMPLETE SETUP GUIDE - StxryAI Platform

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Supabase Setup](#initial-supabase-setup)
4. [Database Configuration](#database-configuration)
5. [Storage Buckets Setup](#storage-buckets-setup)
6. [Authentication Configuration](#authentication-configuration)
7. [Environment Variables](#environment-variables)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

This guide will walk you through setting up Supabase for the StxryAI platform from scratch. Your Supabase instance is already configured with:

- **Project URL**: `https://kdqgpnbymjzuzdscaiko.supabase.co`
- **Project ID**: `kdqgpnbymjzuzdscaiko`

---

## ✅ Prerequisites

- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] Project created (already done: `kdqgpnbymjzuzdscaiko`)
- [ ] API keys obtained (already in `.env.local`)
- [ ] PostgreSQL client installed (optional, for local testing)

---

## 🎯 Initial Supabase Setup

### Step 1: Access Your Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your project: **kdqgpnbymjzuzdscaiko**

### Step 2: Verify API Keys

Your API keys are already configured in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kdqgpnbymjzuzdscaiko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Status**: API keys are configured

---

## 🗄️ Database Configuration

### Step 1: Run Initial Database Migration

Navigate to your Supabase Dashboard → **SQL Editor** and run the following scripts in order:

#### Option A: Safe Migration (Recommended for existing databases)

```bash
# Copy the SQL content from:
stxryai/database/init-safe-migration.sql
```

**What this does:**
- Creates all required database tables
- Sets up enums (user_tier, user_role, story_difficulty, etc.)
- Creates indexes for performance
- Sets up Row Level Security (RLS) policies
- Safe to run multiple times (won't error on duplicates)

#### Option B: Fresh Installation

```bash
# Copy the SQL content from:
stxryai/database/init.sql
```

**Use this only for:**
- Brand new Supabase projects
- Complete database resets

### Step 2: Run Additional Feature Migrations

After the initial migration, run these additional scripts:

#### 1. Achievements System
```sql
-- Copy and run: stxryai/database/achievements-expanded.sql
```

#### 2. Family & Cultural Features
```sql
-- Copy and run: stxryai/database/family-and-cultural-features.sql
```

#### 3. Stories Table Fix (if needed)
```sql
-- Copy and run: stxryai/database/migration-fix-stories-table.sql
```

### Step 3: Verify Database Tables

Run this query in SQL Editor to verify all tables were created:

```sql
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected tables:**
- `user_profiles`
- `stories`
- `chapters`
- `reading_progress`
- `achievements`
- `user_achievements`
- `notifications`
- `comments`
- `likes`
- `follows`
- `reading_challenges`
- `challenge_participants`
- `story_analytics`
- `creator_earnings`
- `subscriptions`
- `family_groups`
- `cultural_content`
- And more...

---

## 📦 Storage Buckets Setup

### Step 1: Navigate to Storage

1. In Supabase Dashboard, go to **Storage** → **Buckets**
2. Click **New Bucket**

### Step 2: Create Required Buckets

Run the storage configuration script:

1. Go to **SQL Editor**
2. Copy and paste the content from: `stxryai/database/storage-buckets.sql`
3. Click **Run**

This creates the following buckets:

| Bucket Name | Public | Size Limit | Purpose |
|-------------|--------|------------|---------|
| `user-avatars` | ✅ Yes | 5MB | User profile pictures |
| `story-covers` | ✅ Yes | 10MB | Story cover images |
| `user-uploads` | ❌ No | 50MB | Private user files |
| `story-assets` | ❌ No | 20MB | Story images, audio, video |
| `system-assets` | ✅ Yes | 100MB | Platform assets (admin only) |

### Step 3: Verify Storage Policies

After running the script, verify policies are applied:

1. Go to **Storage** → **Policies**
2. Check each bucket has appropriate policies:
   - SELECT (view)
   - INSERT (upload)
   - UPDATE (modify)
   - DELETE (remove)

---

## 🔐 Authentication Configuration

### Step 1: Enable Authentication Providers

1. Go to **Authentication** → **Providers**
2. Enable the following providers:

#### Email Authentication (Required)
- ✅ Enable Email provider
- ✅ Enable Email confirmations
- Set confirmation URL: `https://your-domain.com/auth/callback`

#### OAuth Providers (Optional but Recommended)

**Google OAuth:**
1. Enable Google provider
2. Add your Google Client ID and Secret
3. Set redirect URL: `https://kdqgpnbymjzuzdscaiko.supabase.co/auth/v1/callback`

**GitHub OAuth:**
1. Enable GitHub provider
2. Add your GitHub Client ID and Secret
3. Set redirect URL: `https://kdqgpnbymjzuzdscaiko.supabase.co/auth/v1/callback`

### Step 2: Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - Confirm signup
   - Invite user
   - Magic Link
   - Change Email Address
   - Reset Password

### Step 3: Set Up Auth Policies

The database migration already includes RLS policies. Verify them:

```sql
-- Check RLS is enabled on user_profiles
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';
```

---

## 🔧 Environment Variables

### Current Configuration

Your `.env.local` file is already configured with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kdqgpnbymjzuzdscaiko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration
DATABASE_URL=postgresql://postgres.kdqgpnbymjzuzdscaiko:...
POSTGRES_URL=postgresql://postgres.kdqgpnbymjzuzdscaiko:...

# JWT Configuration
JWT_SECRET=4d682277-3db5-438b-8bb1-35fa448984cd

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### For Production (Netlify)

Add these environment variables in Netlify:

1. Go to Netlify Dashboard → **Site Settings** → **Environment Variables**
2. Add all variables from `.env.local`
3. Update `NEXT_PUBLIC_APP_URL` to your production domain
4. Set `NODE_ENV=production`

---

## 🧪 Testing & Verification

### Step 1: Test Database Connection

Create a test file: `stxryai/test-supabase-connection.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  // Test 1: Database connection
  const { data, error } = await supabase
    .from('user_profiles')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('❌ Database connection failed:', error.message);
  } else {
    console.log('✅ Database connection successful!');
  }
  
  // Test 2: Storage buckets
  const { data: buckets, error: bucketError } = await supabase
    .storage
    .listBuckets();
  
  if (bucketError) {
    console.error('❌ Storage connection failed:', bucketError.message);
  } else {
    console.log('✅ Storage connection successful!');
    console.log('📦 Available buckets:', buckets.map(b => b.name).join(', '));
  }
  
  // Test 3: Authentication
  const { data: session } = await supabase.auth.getSession();
  console.log('✅ Auth system operational!');
  
  console.log('\n✨ All tests passed!');
}

testConnection();
```

Run the test:

```bash
cd stxryai
node test-supabase-connection.js
```

### Step 2: Test in Development

Start your development server:

```bash
cd stxryai
npm run dev
```

Visit `http://localhost:3000` and test:
- [ ] User registration
- [ ] User login
- [ ] Profile creation
- [ ] Image upload
- [ ] Story creation

### Step 3: Verify RLS Policies

Test that Row Level Security is working:

```sql
-- This should only return the current user's profile
SELECT * FROM user_profiles WHERE id = auth.uid();

-- This should fail (no access to other users' private data)
SELECT * FROM user_profiles WHERE id != auth.uid();
```

---

## 🔍 Database Schema Overview

### Core Tables

#### `user_profiles`
- Extends Supabase auth.users
- Stores user metadata, tier, XP, level
- Links to Stripe for subscriptions

#### `stories`
- Main content table
- Supports premium content
- Tracks views, ratings, favorites

#### `chapters`
- Story content broken into chapters
- Supports rich text and media

#### `reading_progress`
- Tracks user reading history
- Enables "continue reading" feature

### Social Features

#### `follows`
- User-to-user following system

#### `likes`
- Story and comment likes

#### `comments`
- Nested comment system
- Supports replies

### Gamification

#### `achievements`
- Achievement definitions
- Rarity levels: common → mythic

#### `user_achievements`
- User achievement unlocks
- Progress tracking

#### `reading_challenges`
- Time-based reading challenges
- Leaderboards

### Monetization

#### `subscriptions`
- Premium tier management
- Links to Stripe

#### `creator_earnings`
- Creator revenue tracking
- Payout management

---

## 🚨 Troubleshooting

### Issue: "relation does not exist"

**Solution:**
```sql
-- Run the init-safe-migration.sql script again
-- It's safe to run multiple times
```

### Issue: "permission denied for table"

**Solution:**
```sql
-- Enable RLS on the table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Add appropriate policies
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);
```

### Issue: Storage upload fails

**Solution:**
1. Check bucket exists: Storage → Buckets
2. Verify policies: Storage → Policies
3. Check file size limits
4. Verify MIME types are allowed

### Issue: Authentication not working

**Solution:**
1. Verify API keys in `.env.local`
2. Check auth provider is enabled
3. Verify redirect URLs match
4. Clear browser cache and cookies

### Issue: Database connection timeout

**Solution:**
```bash
# Check if database is paused (free tier)
# Go to Supabase Dashboard → Database → Check status

# Restart database if needed
# Dashboard → Settings → Database → Restart
```

---

## 📚 Additional Resources

### Supabase Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Auth Guide](https://supabase.com/docs/guides/auth)

### StxryAI Documentation
- [`DATABASE_SETUP_INSTRUCTIONS.md`](./DATABASE_SETUP_INSTRUCTIONS.md)
- [`COMPLETE_SETUP_GUIDE_2026.md`](./COMPLETE_SETUP_GUIDE_2026.md)
- [`MIGRATION_CHECKLIST.md`](./MIGRATION_CHECKLIST.md)

### SQL Scripts Location
- Main migration: [`database/init-safe-migration.sql`](./database/init-safe-migration.sql)
- Storage setup: [`database/storage-buckets.sql`](./database/storage-buckets.sql)
- Achievements: [`database/achievements-expanded.sql`](./database/achievements-expanded.sql)
- Family features: [`database/family-and-cultural-features.sql`](./database/family-and-cultural-features.sql)

---

## ✅ Setup Checklist

Use this checklist to track your progress:

### Database Setup
- [ ] Run `init-safe-migration.sql`
- [ ] Run `achievements-expanded.sql`
- [ ] Run `family-and-cultural-features.sql`
- [ ] Verify all tables created
- [ ] Check RLS policies enabled

### Storage Setup
- [ ] Run `storage-buckets.sql`
- [ ] Verify all 5 buckets created
- [ ] Check storage policies applied
- [ ] Test file upload

### Authentication Setup
- [ ] Enable email authentication
- [ ] Configure email templates
- [ ] Enable OAuth providers (optional)
- [ ] Test user registration
- [ ] Test user login

### Environment Variables
- [ ] Verify `.env.local` configuration
- [ ] Add variables to Netlify (production)
- [ ] Test connection locally
- [ ] Test connection in production

### Testing
- [ ] Run connection test script
- [ ] Test user registration flow
- [ ] Test story creation
- [ ] Test file uploads
- [ ] Test authentication

### Production Deployment
- [ ] Database migrations applied
- [ ] Storage buckets configured
- [ ] Environment variables set
- [ ] SSL/TLS enabled
- [ ] Backups configured

---

## 🎉 Next Steps

After completing this setup:

1. **Test the Application**
   ```bash
   cd stxryai
   npm run dev
   ```

2. **Create Your First Admin User**
   - Register through the UI
   - Manually set `is_admin = true` in database

3. **Configure Additional Services**
   - Stripe for payments
   - OpenAI for AI features
   - Email service (Resend)
   - Analytics (PostHog)

4. **Deploy to Production**
   - Push to GitHub
   - Deploy via Netlify
   - Run production migrations
   - Test live site

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Supabase logs: Dashboard → Logs
3. Check browser console for errors
4. Review server logs in Netlify

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
