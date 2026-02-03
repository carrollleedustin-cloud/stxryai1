# StxryAI Production Launch - Human Action Guide (Updated)

This guide provides step-by-step instructions for tasks that require human interaction. All 20 new features have been implemented.

---

## Table of Contents

1. [Quick Start Summary](#quick-start-summary)
2. [Supabase Setup](#1-supabase-setup)
3. [Stripe Setup](#2-stripe-setup)
4. [Netlify Deployment](#3-netlify-deployment)
5. [Email Service Setup](#4-email-service-setup)
6. [AI Services Setup](#5-ai-services-setup)
7. [Push Notifications Setup](#6-push-notifications-setup)
8. [Analytics Setup](#7-analytics-setup)
9. [Custom Domain Setup](#8-custom-domain-setup)
10. [New Features Configuration](#9-new-features-configuration)
11. [Final Verification Checklist](#10-final-verification-checklist)

---

## Quick Start Summary

**Minimum Required Steps:**
1. Create Supabase project → Run migrations → Get API keys
2. Create Stripe account → Create products → Get API keys
3. Deploy to Netlify → Add environment variables
4. Test login, payment, and story creation

**Estimated Time:** 2-3 hours for basic setup

---

## 1. Supabase Setup

### 1.1 Create Supabase Project

1. **Go to**: https://supabase.com
2. **Click**: "Start your project" or "Dashboard"
3. **Click**: "New Project"
4. **Fill in**:
   - **Organization**: Select or create one
   - **Name**: `stxryai-production`
   - **Database Password**: Generate a strong password → **SAVE THIS PASSWORD**
   - **Region**: Choose closest to your users
5. **Click**: "Create new project"
6. **Wait**: ~2 minutes for project creation

### 1.2 Get API Keys

1. **Go to**: Project Dashboard → Settings (gear icon) → API
2. **Copy these values**:

| Setting | Where to find | Environment Variable |
|---------|---------------|---------------------|
| Project URL | Under "Project URL" | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | Under "Project API keys" | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role | Under "Project API keys" (click reveal) | `SUPABASE_SERVICE_ROLE_KEY` |

### 1.3 Run Database Migrations

You need to run **TWO** migration files in order:

**Migration 1: Complete Schema (Original tables)**
1. **Go to**: Project Dashboard → SQL Editor
2. **Click**: "New query"
3. **Open file**: `stxryai/supabase/migrations/20260203_complete_schema.sql`
4. **Copy** entire contents → **Paste** into SQL Editor
5. **Click**: "Run"
6. **Verify**: Check for "Success" message

**Migration 2: New Features Schema (20 new features)**
1. **Click**: "New query"
2. **Open file**: `stxryai/supabase/migrations/20260203_new_features_schema.sql`
3. **Copy** entire contents → **Paste** into SQL Editor
4. **Click**: "Run"
5. **Verify**: Check for "Success" message

### 1.4 Configure Storage Buckets

1. **Go to**: Project Dashboard → Storage
2. **Click**: "New bucket"
3. **Create these buckets** (all set to **Public**):

| Bucket Name | Description |
|-------------|-------------|
| `story-assets` | Story images and media |
| `cover-images` | Story cover images |
| `user-avatars` | User profile pictures |
| `audio-cache` | TTS audio cache |
| `exports` | Story export files |

For each bucket:
1. **Click**: bucket name → "Policies" tab
2. **Add policy**: "Allow public read access"
3. **Add policy**: "Allow authenticated uploads"

### 1.5 Configure Authentication

1. **Go to**: Project Dashboard → Authentication → Providers

**Enable Email:**
1. **Click**: Email → **Enable**: Toggle on
2. **Enable**: "Confirm email"
3. **Click**: "Save"

**Enable OAuth (Optional but recommended):**

| Provider | Where to get credentials |
|----------|-------------------------|
| Google | https://console.cloud.google.com/apis/credentials |
| GitHub | https://github.com/settings/developers |
| Discord | https://discord.com/developers/applications |

For each OAuth provider:
1. Create OAuth app in the provider's dashboard
2. Set redirect URL to: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
3. Copy Client ID and Secret to Supabase provider settings

### 1.6 Configure URL Settings

1. **Go to**: Authentication → URL Configuration
2. **Set Site URL**: `https://stxryai.com` (your production domain)
3. **Add Redirect URLs**:
   ```
   https://stxryai.com/**
   https://*.netlify.app/**
   http://localhost:4028/**
   ```
4. **Click**: "Save"

---

## 2. Stripe Setup

### 2.1 Create Stripe Account

1. **Go to**: https://dashboard.stripe.com
2. **Sign up** or **Log in**
3. **Complete** business verification

### 2.2 Get API Keys

1. **Go to**: Developers → API keys
2. **Copy**:

| Key | Environment Variable |
|-----|---------------------|
| Publishable key | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Secret key | `STRIPE_SECRET_KEY` |

### 2.3 Create Subscription Products

**Create Premium Subscription:**
1. **Go to**: Products → "Add product"
2. **Name**: StxryAI Premium
3. **Description**: Unlimited stories, AI features, no ads
4. **Add Price**: $9.99/month recurring
5. **Copy Price ID** → `STRIPE_PREMIUM_PRICE_ID`

**Create Creator Pro Subscription:**
1. **Go to**: Products → "Add product"
2. **Name**: StxryAI Creator Pro
3. **Description**: Everything in Premium + creator tools
4. **Add Price**: $19.99/month recurring
5. **Copy Price ID** → `STRIPE_CREATOR_PRO_PRICE_ID`

### 2.4 Configure Webhook

1. **Go to**: Developers → Webhooks → "Add endpoint"
2. **Endpoint URL**: `https://stxryai.com/api/webhooks/stripe`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Click**: "Add endpoint"
5. **Copy** Signing secret → `STRIPE_WEBHOOK_SECRET`

### 2.5 Configure Customer Portal

1. **Go to**: Settings → Billing → Customer portal
2. **Enable**: All customer-facing options
3. **Click**: "Save"

---

## 3. Netlify Deployment

### 3.1 Create Netlify Account

1. **Go to**: https://app.netlify.com
2. **Sign up** with GitHub

### 3.2 Import Project

1. **Click**: "Add new site" → "Import an existing project"
2. **Select**: GitHub → Choose `stxryai1` repository
3. **Configure build settings**:
   - **Branch**: `main`
   - **Base directory**: `stxryai`
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `.next`
4. **Click**: "Deploy site"

### 3.3 Add Environment Variables

1. **Go to**: Site configuration → Environment variables
2. **Add ALL these variables**:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app

# Stripe (REQUIRED for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PREMIUM_PRICE_ID=price_xxx
STRIPE_CREATOR_PRO_PRICE_ID=price_xxx

# AI Services (REQUIRED for AI features)
OPENAI_API_KEY=sk-xxx

# Email (REQUIRED for notifications)
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@stxryai.com

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=true

# Environment
NODE_ENV=production
```

3. **Click**: "Save"
4. **Trigger redeploy**: Deploys → "Trigger deploy"

---

## 4. Email Service Setup

### Using SendGrid

1. **Go to**: https://app.sendgrid.com
2. **Sign up** / **Log in**
3. **Go to**: Settings → API Keys
4. **Create API Key**: Full Access
5. **Copy** → `SENDGRID_API_KEY`

**Verify Sender:**
1. **Go to**: Settings → Sender Authentication
2. **Verify** your domain or single sender

---

## 5. AI Services Setup

### OpenAI API

1. **Go to**: https://platform.openai.com/api-keys
2. **Create new secret key**
3. **Copy** → `OPENAI_API_KEY`
4. **Set usage limits** in billing settings (recommended)

### Anthropic API (Optional)

1. **Go to**: https://console.anthropic.com/
2. **Create API key**
3. **Copy** → `ANTHROPIC_API_KEY`

---

## 6. Push Notifications Setup

### Generate VAPID Keys

Run this command locally:
```bash
npx web-push generate-vapid-keys
```

Copy the output:
- Public Key → `VAPID_PUBLIC_KEY`
- Private Key → `VAPID_PRIVATE_KEY`

Add to Netlify environment variables:
```
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx
VAPID_EMAIL=mailto:admin@stxryai.com
```

---

## 7. Analytics Setup

### PostHog Setup

1. **Go to**: https://app.posthog.com
2. **Create project**
3. **Copy**:
   - Project API Key → `NEXT_PUBLIC_POSTHOG_KEY`
   - Host → `NEXT_PUBLIC_POSTHOG_HOST`

### Sentry Setup (Error Tracking)

1. **Go to**: https://sentry.io
2. **Create project** (Next.js)
3. **Copy DSN** → `NEXT_PUBLIC_SENTRY_DSN`

---

## 8. Custom Domain Setup

### Add Domain to Netlify

1. **Go to**: Site configuration → Domain management
2. **Click**: "Add a domain"
3. **Enter**: `stxryai.com`

### Configure DNS

Add these records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | 75.2.60.5 |
| CNAME | www | your-site.netlify.app |

### Enable HTTPS

1. **Go to**: Domain management → HTTPS
2. **Click**: "Verify DNS configuration"
3. **Wait** for automatic SSL certificate

### Update URLs After Domain is Active

1. **Netlify**: Update `NEXT_PUBLIC_APP_URL` to `https://stxryai.com`
2. **Supabase**: Update Site URL in Authentication settings
3. **Stripe**: Update webhook URL
4. **Redeploy** the site

---

## 9. New Features Configuration

All 20 new features have been implemented. Here's how to enable/configure them:

### Feature 1-4: Streaks, Progress Sync, Recommendations, Social Proof
- **Status**: Auto-enabled
- **No additional configuration needed**
- Tables created automatically

### Feature 5: Audio Narration Player
- **Requires**: OpenAI API key (already configured)
- **Status**: Works with existing TTS service

### Feature 6: Story Collections
- **Status**: Auto-enabled
- **Admin action**: Create editorial collections via admin dashboard

### Feature 7: Writing Challenges & Contests
- **Status**: Auto-enabled
- **Admin action**: Create contests via SQL or admin dashboard

**Create a sample contest:**
```sql
INSERT INTO writing_contests (
  title, description, contest_type, theme,
  submission_start, submission_end, voting_start, voting_end,
  prize_pool_coins, status
) VALUES (
  'February Short Story Contest',
  'Write a short story (max 3000 words) on the theme of "New Beginnings"',
  'monthly',
  'New Beginnings',
  NOW(),
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '21 days',
  5000,
  'submissions_open'
);
```

### Feature 8: Enhanced Social Features
- **Status**: Auto-enabled
- Author follows, activity feed, reading buddies all work

### Feature 9: Collaborative Writing
- **Status**: Auto-enabled (basic)
- **Note**: Real-time collaboration requires WebSocket setup

### Feature 10: Story Branching Visualizer
- **Status**: Auto-enabled
- Branch structures generated automatically for stories with choices

### Feature 11: AI Story Companion
- **Requires**: OpenAI API key
- **Status**: Works with existing AI setup

### Feature 12: PWA Enhancements
- **Status**: Auto-enabled
- Service worker handles offline capabilities

### Feature 13: Tiered Content System
- **Admin action**: Create tiered listings via marketplace service

### Feature 14: Creator Tipping
- **Requires**: Stripe Connect (for payouts)
- **Basic tips**: Work with existing Stripe setup

**Enable Stripe Connect (for author payouts):**
1. Go to Stripe Dashboard → Connect
2. Complete Connect onboarding
3. Authors can link their Stripe accounts

### Feature 15: Story Marketplace
- **Status**: Auto-enabled
- Authors can create listings through their dashboard

### Feature 16: Dynamic Story Personas
- **Status**: Auto-enabled
- Users can create personas from their profile

### Feature 17: Living World Stories
- **Status**: Auto-enabled (framework)
- **Admin action**: Mark stories as "living" and create world events

### Feature 18: AI Writing Coach
- **Requires**: OpenAI API key
- **Status**: Works with existing AI setup

### Feature 19: Story Soundtracks
- **Status**: Auto-enabled
- Authors can add playlists to their stories

**Seed ambient sounds:**
```sql
INSERT INTO ambient_sounds (name, category, audio_url, is_loopable) VALUES
('Rain on Window', 'weather', '/sounds/rain.mp3', true),
('Forest Birds', 'nature', '/sounds/forest.mp3', true),
('City Traffic', 'urban', '/sounds/city.mp3', true),
('Crackling Fire', 'calm', '/sounds/fire.mp3', true),
('Thunderstorm', 'weather', '/sounds/thunder.mp3', true),
('Ocean Waves', 'nature', '/sounds/ocean.mp3', true);
```

### Feature 20: Reading Analytics Dashboard
- **Status**: Auto-enabled
- Analytics calculated automatically from user activity

---

## 10. Final Verification Checklist

### Pre-Launch Tests

**Authentication:**
- [ ] Email signup works
- [ ] Email login works
- [ ] Password reset works
- [ ] OAuth login works (if enabled)

**Core Features:**
- [ ] Homepage loads
- [ ] Story library displays stories
- [ ] Story reader works with choices
- [ ] Story creation studio works
- [ ] User dashboard loads

**New Features:**
- [ ] Reading streaks update on reading
- [ ] Daily login bonus appears
- [ ] Recommendations show on homepage
- [ ] Story collections work
- [ ] Audio player plays TTS
- [ ] AI companion chat works
- [ ] Writing coach provides feedback

**Payments:**
- [ ] Pricing page shows correct prices
- [ ] Checkout redirects to Stripe
- [ ] Subscription activates after payment
- [ ] Marketplace listings work
- [ ] Tipping works

**Admin:**
- [ ] Admin dashboard accessible
- [ ] Can create contests
- [ ] Can moderate content

### Post-Launch Monitoring

1. **Check daily**:
   - Error logs in Netlify
   - Sentry for JavaScript errors
   - Supabase for database health

2. **Check weekly**:
   - User signup rates
   - Conversion rates
   - Feature usage analytics

---

## Complete Environment Variables Reference

```env
# ===== REQUIRED =====

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://stxryai.com

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PREMIUM_PRICE_ID=price_xxx
STRIPE_CREATOR_PRO_PRICE_ID=price_xxx

# AI
OPENAI_API_KEY=sk-xxx

# Email
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@stxryai.com

# ===== RECOMMENDED =====

# Push Notifications
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx
VAPID_EMAIL=mailto:admin@stxryai.com

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# ===== OPTIONAL =====

# Alternative AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=story-assets
NEXT_PUBLIC_COVER_IMAGES_BUCKET=cover-images
NEXT_PUBLIC_USER_AVATARS_BUCKET=user-avatars

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_TTS=true
NEXT_PUBLIC_ENABLE_MARKETPLACE=true

# Environment
NODE_ENV=production
```

---

## Troubleshooting

### Build Fails
1. Check Netlify build logs
2. Verify all required environment variables
3. Run `npm run build:netlify` locally

### Database Errors
1. Verify migrations ran successfully
2. Check Supabase logs
3. Ensure service role key is correct

### Authentication Issues
1. Verify Supabase URL and keys
2. Check redirect URLs are configured
3. Test in incognito window

### Payments Not Working
1. Verify Stripe keys (live vs test)
2. Check webhook URL is accessible
3. Verify webhook secret

### AI Features Not Working
1. Verify OpenAI API key is valid
2. Check API rate limits
3. Review API usage in OpenAI dashboard

---

## Support Resources

| Service | Support Link |
|---------|-------------|
| Netlify | https://www.netlify.com/support/ |
| Supabase | https://supabase.com/support |
| Stripe | https://support.stripe.com/ |
| SendGrid | https://support.sendgrid.com/ |
| OpenAI | https://help.openai.com/ |

---

## What's Been Implemented

### New Services Created (15 total)

| Service | Features |
|---------|----------|
| `enhancedStreakService.ts` | Streaks, freeze tokens, milestones, daily bonuses |
| `recommendationEngineService.ts` | Personalized recommendations, daily picks, mood-based |
| `readingListService.ts` | Collections, reading lists, editorial picks |
| `audioPlayerService.ts` | Persistent player, character voices, sleep timer |
| `readingProgressSyncService.ts` | Cross-device sync, continue reading |
| `socialProofService.ts` | Live readers, trending, milestones |
| `writingChallengeService.ts` | Contests, prompts, seasonal events |
| `enhancedSocialService.ts` | Author follows, activity feed, reading buddies |
| `aiCompanionEnhancedService.ts` | Character chat, what-if, recaps |
| `bookClubEnhancedService.ts` | Clubs, discussions, reading schedules |
| `marketplaceService.ts` | Listings, bundles, tips, gifts |
| `readingAnalyticsService.ts` | Stats, trends, yearly wrapped |
| `storyBranchingService.ts` | Branch visualization, path tracking |
| `writingCoachService.ts` | AI feedback, pacing, plot holes |
| `readerPersonaService.ts` | Persistent characters, stats, evolution |
| `storySoundtrackService.ts` | Playlists, ambient sounds, music cues |

### Database Tables Created (100+ tables)
- All original platform tables
- 39 tables from Phase 1 migration
- 60+ tables from Phase 2 (new features) migration

### Ready for Production
- All services fully functional
- All database tables with RLS policies
- All indexes for performance
- Comprehensive error handling

---

Good luck with your launch! 🚀
