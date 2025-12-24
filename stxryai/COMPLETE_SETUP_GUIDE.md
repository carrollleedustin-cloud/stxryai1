# Complete Setup Guide: AI, Pet System, and Database Configuration

## Overview
This guide walks you through setting up:
1. **OpenAI Integration** - For story generation and character sheets
2. **Pet Companion System** - Tamagotchi-like companion with AI dialogue
3. **Database Schema** - All required tables and RLS policies
4. **Storage Buckets** - For profile pictures and media

---

## Part 1: Environment Configuration

### 1.1 Set Up Environment Variables

Create or update `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-openai-key-here

# Optional: Anthropic (will be ignored if OpenAI is set)
# ANTHROPIC_API_KEY=your-anthropic-key-here

# Optional: Other Services
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 1.2 Verify Environment Setup

Run the environment check:

```bash
npm run check-env
```

Expected output:
```
✓ NEXT_PUBLIC_SUPABASE_URL configured
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY configured
✓ SUPABASE_SERVICE_ROLE_KEY configured
✓ OPENAI_API_KEY configured
✓ All required environment variables are set
```

---

## Part 2: Database Setup

### 2.1 Create Core Tables

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `supabase/CREATE_ALL_TABLES.sql`
5. Click "Run"

Wait for completion (may take 1-2 minutes).

### 2.2 Create Pet System Tables

1. In SQL Editor, create a new query
2. Copy and paste the contents of `supabase/CREATE_PET_TABLES.sql`
3. Click "Run"

This creates:
- `user_pets` - Main pet data
- `pet_interactions` - Interaction history
- `pet_accessories` - Wearable items
- `pet_dialogues` - AI-generated dialogue
- `pet_achievements` - Pet milestones
- Plus RLS policies and seed data

### 2.3 Apply RLS Policies

1. In SQL Editor, create a new query
2. Copy and paste the contents of `supabase/STXRYAI_RLS_POLICIES.sql`
3. Click "Run"

This ensures:
- Users can only access their own data
- Public data is readable by all
- Proper authentication checks

### 2.4 Verify Schema

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see tables like:
- `user_pets`
- `pet_interactions`
- `pet_accessories`
- `pet_dialogues`
- `pet_achievements`
- `stories`
- `chapters`
- `reading_progress`
- And many more...

---

## Part 3: Storage Bucket Setup

### 3.1 Create Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Create bucket: `avatars`
   - Make it **Public**
   - Click "Create Bucket"
4. Create bucket: `user-avatars`
   - Make it **Public**
   - Click "Create Bucket"
5. Create bucket: `story-assets`
   - Make it **Public**
   - Click "Create Bucket"

### 3.2 Set Storage Policies

For each bucket, go to Policies tab and add:

**For `avatars` bucket:**

Read Policy (Public):
```sql
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

Write Policy (Authenticated):
```sql
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
```

Update Policy (Authenticated):
```sql
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

Delete Policy (Authenticated):
```sql
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

Repeat similar policies for `user-avatars` and `story-assets` buckets.

---

## Part 4: AI Configuration Verification

### 4.1 Test OpenAI Connection

Create a test file `test-ai.ts`:

```typescript
import { getAIConfig, validateAIConfig, getProviderInfo } from '@/lib/ai/config';

async function testAI() {
  console.log('Testing AI Configuration...\n');
  
  // Check validation
  const validation = validateAIConfig();
  console.log('Validation:', validation);
  
  // Get provider info
  const info = getProviderInfo();
  console.log('\nProvider Info:', info);
  
  // Get config
  try {
    const config = getAIConfig();
    console.log('\nActive Config:');
    console.log('- Provider:', config.provider);
    console.log('- Model:', config.model);
    console.log('- Max Tokens:', config.maxTokens);
    console.log('- Temperature:', config.temperature);
    console.log('- API Key Set:', !!config.apiKey);
  } catch (error) {
    console.error('Error getting config:', error);
  }
}

testAI();
```

Run:
```bash
npx ts-node test-ai.ts
```

Expected output:
```
Testing AI Configuration...

Validation: { valid: true, errors: [] }

Provider Info: {
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  configured: true,
  errors: []
}

Active Config:
- Provider: openai
- Model: gpt-4-turbo-preview
- Max Tokens: 2000
- Temperature: 0.7
- API Key Set: true
```

### 4.2 Test Character Sheet Generation

1. Start the dev server: `npm run dev`
2. Go to `/profile/character-sheet`
3. Fill in birth data:
   - Name: Test User
   - Birth Date: 1990-01-15
   - Birth Time: 14:30
   - Birth City: New York
   - Birth Country: USA
4. Click "Generate Character Sheet"

Expected: Character sheet JSON with astrological data

### 4.3 Test Story Generation

1. Create a story first (if you don't have one)
2. Go to the story editor
3. Click "Generate with AI"
4. Select generation type (e.g., "Scene")
5. Enter a prompt
6. Click "Generate"

Expected: Generated story content appears

---

## Part 5: Pet System Setup

### 5.1 Create Your First Pet

1. Log in to the app
2. Look for the pet panel (bottom-right corner)
3. Click "Create Pet" or "Summon Companion"
4. Enter a pet name
5. Click "Summon"

Expected: Pet appears with unique appearance based on your account

### 5.2 Interact with Your Pet

Available interactions:
- **Pet** - Gentle interaction (+10 happiness)
- **Feed** - Restore energy (+15 happiness, +20 energy)
- **Play** - Active interaction (+20 happiness, -10 energy)
- **Talk** - Conversation (+8 happiness)
- **Gift** - Special reward (+25 happiness)

### 5.3 Pet Evolution

Pets evolve through stages:
- Egg (Level 0-1)
- Baby (Level 1-5)
- Young (Level 5-15)
- Adult (Level 15-30)
- Elder (Level 30-50)
- Legendary (Level 50+)

Earn XP by:
- Reading stories (+50 XP)
- Making choices (+10 XP)
- Creating stories (+100 XP)
- Writing comments (+5 XP)
- Daily streaks (+25 XP)

---

## Part 6: Deployment Checklist

### Before Deploying to Production:

- [ ] All environment variables set in deployment platform
- [ ] Database migrations applied to production Supabase
- [ ] Storage buckets created and policies set
- [ ] OpenAI API key valid and has sufficient credits
- [ ] RLS policies verified
- [ ] Test character sheet generation
- [ ] Test story generation
- [ ] Test pet creation and interactions
- [ ] Test profile picture upload
- [ ] Verify all API routes return 200 status

### Deployment Steps:

1. **Set Environment Variables**
   - In your deployment platform (Vercel, Netlify, etc.)
   - Add all variables from `.env.local`

2. **Run Database Migrations**
   - Connect to production Supabase
   - Run all SQL scripts in order:
     1. CREATE_ALL_TABLES.sql
     2. CREATE_PET_TABLES.sql
     3. STXRYAI_RLS_POLICIES.sql

3. **Create Storage Buckets**
   - Follow Part 3 steps in production Supabase

4. **Deploy Application**
   - Push to main branch
   - Deployment platform builds and deploys automatically

5. **Verify Production**
   - Test character sheet generation
   - Test story generation
   - Test pet creation
   - Check error logs

---

## Part 7: Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution:**
```bash
# Check if env var is set
echo $OPENAI_API_KEY

# If empty, add to .env.local
OPENAI_API_KEY=sk-your-key-here

# Restart dev server
npm run dev
```

### Issue: Character sheet generation returns 500

**Check:**
1. OpenAI API key is valid
2. API key has sufficient credits
3. Check server logs for error message
4. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

**Debug:**
```bash
# Test API directly
curl -X POST http://localhost:3000/api/character-sheet/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthCity": "New York",
    "birthCountry": "USA"
  }'
```

### Issue: Pet not appearing

**Check:**
1. User is authenticated
2. `user_pets` table exists
3. RLS policies allow user to read/write
4. Check browser console for errors

**Debug:**
```sql
-- Check if pet exists
SELECT * FROM public.user_pets WHERE user_id = 'your-user-id';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_pets';
```

### Issue: Profile picture upload fails

**Check:**
1. `avatars` bucket exists and is public
2. Storage policies allow authenticated users to upload
3. File size is reasonable (< 5MB)
4. File type is image (jpg, png, gif, webp)

**Debug:**
```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Issue: Story generation is slow

**Solution:**
- Use `gpt-3.5-turbo` for faster generation (less accurate)
- Reduce `maxTokens` in config
- Implement caching for similar prompts
- Use streaming for real-time feedback

---

## Part 8: Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_stories_author_id ON public.stories(author_id);
CREATE INDEX idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX idx_reading_progress_user_id ON public.reading_progress(user_id);
CREATE INDEX idx_user_pets_user_id ON public.user_pets(user_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM public.stories WHERE author_id = 'user-id';
```

### AI Optimization

```typescript
// Use task-specific configs for better performance
import { getTaskConfig } from '@/lib/ai/config';

// For character sheets (complex, needs full model)
const charConfig = getTaskConfig('characterSheet');

// For pet dialogue (simple, can use faster model)
const petConfig = getTaskConfig('petDialogue');

// For content moderation (deterministic, low temperature)
const modConfig = getTaskConfig('contentModeration');
```

### Caching Strategy

```typescript
// Cache character sheets for 24 hours
const cacheKey = `character-sheet:${userId}:${birthDate}`;
const cached = await cache.get(cacheKey);

if (cached) {
  return cached;
}

const result = await generateCharacterSheet(birthData);
await cache.set(cacheKey, result, { ttl: 24 * 60 * 60 });
return result;
```

---

## Part 9: Monitoring and Logging

### Set Up Error Tracking

```typescript
// In your API routes
import { captureException } from '@/lib/error-tracking';

try {
  // Your code
} catch (error) {
  captureException(error, {
    context: 'character-sheet-generation',
    userId: user.id,
    birthData: sanitizedData,
  });
  
  return NextResponse.json(
    { error: 'Failed to generate character sheet' },
    { status: 500 }
  );
}
```

### Monitor AI Usage

```typescript
// Track API calls and costs
const trackAIUsage = async (
  provider: string,
  model: string,
  tokensUsed: number,
  cost: number
) => {
  await supabase
    .from('ai_usage_logs')
    .insert({
      provider,
      model,
      tokens_used: tokensUsed,
      cost,
      created_at: new Date().toISOString(),
    });
};
```

---

## Part 10: Support and Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### Useful Commands

```bash
# Check environment
npm run check-env

# Run database migrations
npm run db:migrate

# Test AI configuration
npm run test:ai

# Build for production
npm run build

# Start production server
npm start

# View logs
npm run logs
```

### Getting Help

1. Check error logs in browser console
2. Check server logs in terminal
3. Check Supabase dashboard for database errors
4. Check OpenAI dashboard for API errors
5. Review this guide's troubleshooting section

---

## Summary

You now have:
✅ OpenAI integration for story generation and character sheets
✅ Pet companion system with AI dialogue
✅ Complete database schema with RLS policies
✅ Storage buckets for media uploads
✅ Environment configuration
✅ Deployment checklist
✅ Troubleshooting guide

**Next Steps:**
1. Run all SQL migrations
2. Create storage buckets
3. Set environment variables
4. Test all features
5. Deploy to production

Good luck! 🚀
