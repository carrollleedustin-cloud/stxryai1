# Stxryai Setup Guide

Complete setup guide for deploying Stxryai with authentication and AI features.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Google Cloud Console account (for Google OAuth)
- Discord Developer Portal account (for Discord OAuth)
- OpenAI or Anthropic API key (for AI features)

## 1. Supabase Setup

### Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - Project name: `stxryai` (or your choice)
   - Database password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (takes ~2 minutes)

### Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider:
   - Toggle "Enable Email provider" ON
   - Enable "Confirm email" (recommended for production)
   - Save

## 2. Google OAuth Setup

### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Stxryai`
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/authentication/callback` (for local dev)
   - Click **CREATE**
5. Copy **Client ID** and **Client Secret**

### Configure in Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Google** and toggle ON
3. Paste your **Client ID** and **Client Secret**
4. Save

## 3. Discord OAuth Setup

### Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name: `Stxryai`
4. Go to **OAuth2** tab
5. Copy **Client ID** and **Client Secret**
6. Add Redirects:
   - ``
   - `http://localhost:3000/authentication/callback` (for local dev)
7. Save Changes

### Configure in Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Discord** and toggle ON
3. Paste your **Client ID** and **Client Secret**
4. Save

## 4. Environment Variables Setup

Create a `.env.local` file in the `stxryai` directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI API (Choose one or both)
OPENAI_API_KEY=sk-...your_openai_key
ANTHROPIC_API_KEY=sk-ant-...your_anthropic_key

# Stripe (Optional - for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google AdSense (Optional)
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-...
NEXT_PUBLIC_ADSENSE_ID=your_adsense_id_here
```

### Get AI API Keys

**OpenAI:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign in or create account
3. Go to **API Keys**
4. Click **+ Create new secret key**
5. Copy the key (starts with `sk-`)

**Anthropic (Claude):**
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Sign in or create account
3. Go to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)

## 5. Database Schema Setup

Run these SQL commands in your Supabase SQL Editor:

```sql
-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view any profile"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  genre TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Story Policies
CREATE POLICY "Published stories are viewable by everyone"
  ON stories FOR SELECT
  USING (is_published = true OR auth.uid() = author_id);

CREATE POLICY "Authors can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = author_id);

-- Reading Progress Table
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  current_chapter INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reading progress"
  ON reading_progress FOR ALL
  USING (auth.uid() = user_id);

-- User Activity Table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_stories_author ON stories(author_id);
CREATE INDEX idx_stories_genre ON stories(genre);
CREATE INDEX idx_stories_published ON stories(is_published);
CREATE INDEX idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_story ON reading_progress(story_id);
CREATE INDEX idx_user_activity_user ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
```

## 6. Local Development

1. Install dependencies:
```bash
cd stxryai
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## 7. Testing Authentication

### Test Email Signup

1. Go to `/authentication`
2. Click "Sign Up"
3. Fill in the form with your email
4. Check email for confirmation link (if email confirmation is enabled)
5. After confirming, you should be redirected to `/user-dashboard`

### Test Google OAuth

1. Go to `/authentication`
2. Click "Continue with Google"
3. Select your Google account
4. Grant permissions
5. You should be redirected to `/user-dashboard`

### Test Discord OAuth

1. Go to `/authentication`
2. Click "Continue with Discord"
3. Authorize the application
4. You should be redirected to `/user-dashboard`

## 8. Create Admin Account

### Option 1: Through UI

1. Go to `/authentication`
2. Sign up with your admin email
3. In Supabase dashboard, go to **Authentication** → **Users**
4. Find your user
5. Add custom claim in user metadata:
```json
{
  "role": "admin"
}
```

### Option 2: Through SQL

```sql
-- After signing up, run this with your user ID
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-admin-email@example.com';
```

## 9. Deploy to Production

### Netlify Deployment

1. Push code to GitHub repository
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to your GitHub repository
5. Configure build settings:
   - Build command: `cd stxryai && npm run build`
   - Publish directory: `stxryai/.next`
6. Add environment variables (all from `.env.local`)
7. Deploy!

### Update OAuth Redirect URLs

After deployment, update redirect URLs in:
1. **Google Cloud Console** → Add production URL
2. **Discord Developer Portal** → Add production URL
3. **Supabase** → Update site URL in Settings

## 10. AI API Integration

The app is configured to use AI APIs for:
- Story generation assistance
- Content suggestions
- Personalized recommendations

See `src/lib/ai/` for implementation details.

### Configure AI Provider

Edit `src/lib/ai/config.ts` to set your preferred provider:

```typescript
export const AI_CONhttps://your-project.supabase.co/auth/v1/callbackFIG = {
  provider: 'anthropic', // or 'openai'
  model: 'claude-3-5-sonnet-20241022', // or 'gpt-4'
  maxTokens: 4000,
  temperature: 0.7
};
```

## Troubleshooting

### "Supabase is not configured"

- Check that `.env.local` exists and has correct values
- Restart development server after adding env variables
- Verify Supabase project is not paused

### OAuth Not Working

- Verify redirect URLs match exactly (including http/https)
- Check that OAuth providers are enabled in Supabase
- Clear browser cookies and try again

### Database Errors

- Ensure all SQL commands ran successfully
- Check Supabase database logs for errors
- Verify RLS policies are correct

## Next Steps

1. ✅ Authentication is now fully functional
2. Configure AI API for story generation
3. Customize branding and styling
4. Add custom features
5. Launch!

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review Next.js docs: https://nextjs.org/docs
- Open an issue on GitHub

---

**Ready to launch!** 🚀
