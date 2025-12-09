# Supabase Database Setup Instructions

## Quick Setup

### 1. Access Supabase SQL Editor

1. Go to your Supabase project: https://lxtjkhphwihroktujzzi.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Complete Setup Script

Copy and paste the entire contents of `supabase/COMPLETE_SETUP.sql` into the SQL Editor and click **RUN**.

This will create:
- ✅ All core tables (user_profiles, stories, chapters, reading_progress, etc.)
- ✅ Gamification tables (achievements, leaderboard, user_achievements)
- ✅ Social features tables (comments, reviews, likes, bookmarks, notifications)
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Performance indexes
- ✅ Triggers and functions
- ✅ Seed data (default achievements)

### 3. Verify Installation

Run this query to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these tables:
- achievements
- chapters
- comments
- leaderboard
- notifications
- reading_progress
- reviews
- stories
- story_bookmarks
- story_likes
- user_achievements
- user_activity
- user_profiles

### 4. Test Database Connection

Your app is already configured with these credentials in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://lxtjkhphwihroktujzzi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key-here]
```

## What's Already Set Up

✅ **Environment Variables**: `.env.local` is configured with Supabase credentials and OpenAI API key

✅ **Dependencies**: All required npm packages are installed (579 packages including framer-motion, sonner, cmdk)

✅ **Phase 1 Complete**: Foundation & animations system fully implemented

## Next Steps

After running the database setup SQL:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the app** at http://localhost:4028

3. **Create a test account** at /authentication

4. **Continue with remaining phases**:
   - Phase 2: UI Enhancements (In Progress)
   - Phase 3: Gamification System
   - Phase 4: Social Features Expansion
   - Phase 5: Immersive Story Elements
   - Phase 6: Advanced Analytics
   - Phase 7: AI Integration
   - Phase 8: Performance Optimizations

## Troubleshooting

**If you get "table already exists" errors**: Tables might already be created. You can either:
- Ignore the errors (the script uses `IF NOT EXISTS`)
- Drop and recreate tables (⚠️ WARNING: This deletes all data!)

**If RLS policies fail**: Some policies might already exist from previous migrations. The script uses `DROP POLICY IF EXISTS` to handle this.

## Database Schema Overview

### Core Tables
- **user_profiles**: Extended user data with XP, levels, subscription tiers
- **stories**: Story content, metadata, and statistics
- **chapters**: Individual story chapters with choices
- **reading_progress**: Track user progress through stories

### Gamification
- **achievements**: Available achievements with rewards
- **user_achievements**: Unlocked achievements per user
- **leaderboard**: Rankings by XP, stories completed, etc.

### Social Features
- **comments**: Story comments and replies
- **reviews**: Story ratings and reviews
- **story_likes**: Like system
- **story_bookmarks**: Save stories with notes
- **notifications**: In-app notifications

All tables have:
- ✅ Row Level Security (RLS) enabled
- ✅ Proper indexes for performance
- ✅ Timestamps (created_at, updated_at)
- ✅ Foreign key relationships

---

**Ready to continue building!** 🚀
