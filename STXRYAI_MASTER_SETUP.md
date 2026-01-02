# StxryAI Master Setup Guide

This guide provides everything you need to set up the StxryAI platform from scratch, including the Supabase backend, the Web application, and the Mobile application.

---

## Part 1: Supabase Infrastructure (The Brain)

### 1. Create your Supabase Project
Go to [supabase.com](https://supabase.com) and create a new project. Keep your project URL and API keys handy.

### 2. Configure Storage Buckets
Go to **Storage** and create these 3 buckets (set them to **Public**):
- `covers`: For story and book artwork.
- `avatars`: For user profile photos.
- `assets`: For general AI-generated illustrations.

**Set Security Policies** (Go to Storage > [Bucket] > Policies):
- Add a policy for `SELECT`: Allow "public" to read.
- Add a policy for `INSERT/UPDATE`: Allow "authenticated" users to upload.
- *Recommended for `avatars`*: Use `(storage.foldername(name))[1] = auth.uid()::text` to restrict users to their own folder.

### 3. Ultimate Database SQL
Run this in the **SQL Editor** to build the entire infrastructure (50+ tables, enums, and triggers):

```sql
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. CUSTOM TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'creator_pro');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE USER SYSTEM
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    tier subscription_tier DEFAULT 'free',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    energy INTEGER DEFAULT 100,
    max_energy INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORY ENGINE
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    genre TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    rating DECIMAL DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PERSISTENT NARRATIVE ENGINE (Series & Memory)
CREATE TABLE IF NOT EXISTS public.story_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.world_ripples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES public.story_series(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GAMIFICATION (BINGO & ACHIEVEMENTS)
CREATE TABLE IF NOT EXISTS public.bingo_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    tiles JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUTOMATION: PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for published stories" ON public.stories FOR SELECT USING (is_published = true);
CREATE POLICY "Users can edit own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
```

---

## Part 2: Application Configuration

### 1. Web App (`stxryai/.env.local`)
Create this file and add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key
```

### 2. Mobile App (`stxryai-mobile/.env`)
Create this file and add:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Part 3: Running the Apps

### Web App (Dashboard & Reader)
```bash
cd stxryai
npm install
npm run dev
```
Open [http://localhost:4028](http://localhost:4028)

### Mobile App (iOS/Android)
```bash
cd stxryai-mobile
npm install
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone.

---

## Part 4: Permanent Mobile Install (EAS Build)

If you want the app to stay on your phone permanently without Expo Go:

1. **Install EAS**: `npm install -g eas-cli`
2. **Log in**: `eas login`
3. **Configure**: `eas build:configure` (Select "All")
4. **Build (Android)**: `eas build --platform android --profile preview`
5. **Download**: Open the link generated on your phone to install the APK.

---

## Part 5: Final Admin Steps

1. **Get Admin Rights**: After signing up, run this in Supabase SQL:
   ```sql
   UPDATE public.users SET is_admin = true WHERE email = 'your-email@example.com';
   ```
2. **Seed Content**: Run the `seed-stories.sql` file (found in `stxryai/supabase/`) to instantly populate your app with sample stories.
