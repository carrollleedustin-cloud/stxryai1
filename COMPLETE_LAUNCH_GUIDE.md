# StxryAI - Complete Production Launch Guide

**This is your step-by-step guide to launch StxryAI.**  
**The AI cannot click buttons - YOU must do these steps.**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#1-supabase-setup)
3. [Stripe Setup](#2-stripe-setup)
4. [Netlify Setup](#3-netlify-setup)
5. [Email Setup (SendGrid)](#4-email-setup-sendgrid)
6. [AI Setup (OpenAI)](#5-ai-setup-openai)
7. [Push Notifications Setup](#6-push-notifications-setup)
8. [Analytics Setup](#7-analytics-setup)
9. [Custom Domain Setup](#8-custom-domain-setup)
10. [Final Launch Checklist](#9-final-launch-checklist)

---

## Prerequisites

Before starting, you need:
- [ ] A GitHub account (repository already exists)
- [ ] A credit card for paid services (Stripe, etc.)
- [ ] About 2-3 hours of time

---

## 1. Supabase Setup

### 1.1 Create Your Project

1. **Go to**: https://supabase.com
2. **Click**: "Start your project" (green button)
3. **Sign in** with GitHub
4. **Click**: "New Project"
5. **Fill in**:
   - **Organization**: Create one or select existing
   - **Name**: `stxryai-production`
   - **Database Password**: Click "Generate" → **COPY AND SAVE THIS PASSWORD**
   - **Region**: Choose closest to your users (e.g., "East US" for US users)
6. **Click**: "Create new project"
7. **Wait**: ~2 minutes for setup

### 1.2 Get Your API Keys

1. **Click**: Settings (gear icon on left sidebar)
2. **Click**: "API" in the menu
3. **Copy these values** (you'll need them for Netlify):

| Find This | Copy It | Netlify Variable Name |
|-----------|---------|----------------------|
| Project URL | `https://xxxxx.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public (under Project API keys) | `eyJhbGci...` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role (click "Reveal") | `eyJhbGci...` | `SUPABASE_SERVICE_ROLE_KEY` |

⚠️ **SAVE THESE SOMEWHERE SAFE** - You'll need them later!

### 1.3 Run the Database Setup

1. **Click**: "SQL Editor" (left sidebar)
2. **Click**: "New query"
3. **Open this file** from your project: `stxryai/supabase/FRESH_INSTALL_RUN_THIS.sql`
4. **Copy** the ENTIRE file contents
5. **Paste** into the SQL Editor
6. **Click**: "Run" (or press Ctrl/Cmd + Enter)
7. **Verify**: You should see "Success. No rows returned"

**If you see an error:**
- The file is large, make sure you copied ALL of it
- Try running in smaller chunks if needed

### 1.4 Run Additional Migrations

**Migration 2: New Features**
1. **Click**: "New query"
2. **Open file**: `stxryai/supabase/migrations/20260203_new_features_schema.sql`
3. **Copy** → **Paste** → **Run**
4. **Verify**: Success message

**Migration 3: Product Evolution**
1. **Click**: "New query"
2. **Open file**: `stxryai/supabase/migrations/20260204_product_evolution_features.sql`
3. **Copy** → **Paste** → **Run**
4. **Verify**: Success message

### 1.5 Create Storage Buckets

1. **Click**: "Storage" (left sidebar)
2. **Click**: "New bucket"
3. **Create these buckets** (one at a time):

| Bucket Name | Public | Description |
|-------------|--------|-------------|
| `story-assets` | ✅ Yes | Story images |
| `cover-images` | ✅ Yes | Story covers |
| `user-avatars` | ✅ Yes | Profile pictures |
| `audio-cache` | ✅ Yes | TTS audio |
| `exports` | ✅ Yes | Story exports |

For each bucket:
1. Click the bucket name
2. Click "Policies" tab
3. Click "New Policy"
4. Select "Get started quickly"
5. Select "Allow public read access"
6. Click "Review" → "Save"

### 1.6 Configure Authentication

1. **Click**: "Authentication" (left sidebar)
2. **Click**: "Providers"
3. **Click**: "Email" → Toggle ON
4. **Check**: "Confirm email" (optional but recommended)
5. **Click**: "Save"

**Optional - Enable Google Login:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Set redirect URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret back to Supabase

### 1.7 Configure Site URL

1. **Click**: "Authentication" → "URL Configuration"
2. **Site URL**: `https://stxryai.com` (or your domain)
3. **Redirect URLs**: Add these (one per line):
   ```
   https://stxryai.com/**
   https://*.netlify.app/**
   http://localhost:4028/**
   ```
4. **Click**: "Save"

---

## 2. Stripe Setup

### 2.1 Create Account

1. **Go to**: https://dashboard.stripe.com
2. **Sign up** with your email
3. **Verify** your email
4. **Complete** business verification (required for live payments)

### 2.2 Get API Keys

1. **Click**: "Developers" (top right)
2. **Click**: "API keys"
3. **Copy**:

| Key | Netlify Variable |
|-----|------------------|
| Publishable key (starts with `pk_`) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Secret key (starts with `sk_`) | `STRIPE_SECRET_KEY` |

### 2.3 Create Products

**Create Premium Subscription:**
1. **Click**: "Products" (left sidebar)
2. **Click**: "Add product"
3. **Name**: `StxryAI Premium`
4. **Description**: `Unlimited stories, AI features, no ads`
5. **Click**: "Add pricing"
6. **Price**: `$9.99` / month (recurring)
7. **Click**: "Save product"
8. **Copy the Price ID** (starts with `price_`) → `STRIPE_PREMIUM_PRICE_ID`

**Create Creator Pro Subscription:**
1. **Click**: "Add product"
2. **Name**: `StxryAI Creator Pro`
3. **Description**: `Everything in Premium + creator tools`
4. **Click**: "Add pricing"
5. **Price**: `$19.99` / month (recurring)
6. **Click**: "Save product"
7. **Copy the Price ID** → `STRIPE_CREATOR_PRO_PRICE_ID`

### 2.4 Set Up Webhook

1. **Click**: "Developers" → "Webhooks"
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `https://your-site.netlify.app/api/webhooks/stripe`
   (Replace with your actual Netlify URL after deployment)
4. **Select events**: Click "Select events" and check:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Click**: "Add endpoint"
6. **Click**: "Reveal" next to Signing secret
7. **Copy**: The webhook secret (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

---

## 3. Netlify Setup

### 3.1 Create Account

1. **Go to**: https://app.netlify.com
2. **Click**: "Sign up"
3. **Sign up with GitHub** (easiest)
4. **Authorize** Netlify to access your repos

### 3.2 Deploy Your Site

1. **Click**: "Add new site"
2. **Click**: "Import an existing project"
3. **Click**: "Deploy with GitHub"
4. **Search for**: `stxryai1`
5. **Click** on your repository
6. **Configure**:
   - **Branch to deploy**: `main`
   - **Base directory**: `stxryai`
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `.next`
7. **Click**: "Deploy site"

⚠️ **The first build will FAIL** - that's normal! We need to add environment variables.

### 3.3 Add Environment Variables

1. **Click**: "Site configuration" (left sidebar)
2. **Click**: "Environment variables"
3. **Click**: "Add a variable" for EACH of these:

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL = [from Supabase step 1.2]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [from Supabase step 1.2]
SUPABASE_SERVICE_ROLE_KEY = [from Supabase step 1.2]
NEXT_PUBLIC_APP_URL = [your Netlify URL, e.g., https://stxryai.netlify.app]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = [from Stripe step 2.2]
STRIPE_SECRET_KEY = [from Stripe step 2.2]
STRIPE_WEBHOOK_SECRET = [from Stripe step 2.4]
STRIPE_PREMIUM_PRICE_ID = [from Stripe step 2.3]
STRIPE_CREATOR_PRO_PRICE_ID = [from Stripe step 2.3]
OPENAI_API_KEY = [from OpenAI - see step 5]
SENDGRID_API_KEY = [from SendGrid - see step 4]
EMAIL_FROM = noreply@stxryai.com
NODE_ENV = production
```

**Recommended Variables:**
```
NEXT_PUBLIC_ENABLE_AI_FEATURES = true
NEXT_PUBLIC_ENABLE_ANALYTICS = true
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN = true
```

4. **Click**: "Save"

### 3.4 Trigger Redeploy

1. **Click**: "Deploys" (left sidebar)
2. **Click**: "Trigger deploy"
3. **Click**: "Deploy site"
4. **Wait**: ~5-10 minutes for build

### 3.5 Update Stripe Webhook (After Deploy)

1. Go back to Stripe → Webhooks
2. **Click** on your webhook endpoint
3. **Click**: "Update endpoint"
4. **Change URL** to your actual Netlify URL: `https://YOUR-SITE.netlify.app/api/webhooks/stripe`
5. **Click**: "Update endpoint"

---

## 4. Email Setup (SendGrid)

### 4.1 Create Account

1. **Go to**: https://app.sendgrid.com
2. **Sign up** with your email
3. **Verify** your email

### 4.2 Get API Key

1. **Click**: Settings → API Keys
2. **Click**: "Create API Key"
3. **Name**: `StxryAI Production`
4. **Permissions**: "Full Access"
5. **Click**: "Create & View"
6. **Copy** the API key → `SENDGRID_API_KEY`

### 4.3 Verify Sender

1. **Click**: Settings → Sender Authentication
2. **Click**: "Verify a Single Sender"
3. **Fill in** your details
4. **Click**: "Create"
5. **Check your email** and verify

---

## 5. AI Setup (OpenAI)

### 5.1 Create Account

1. **Go to**: https://platform.openai.com
2. **Sign up** or **Log in**
3. **Add payment method** in Billing

### 5.2 Get API Key

1. **Click**: API keys (left sidebar)
2. **Click**: "Create new secret key"
3. **Name**: `StxryAI Production`
4. **Click**: "Create secret key"
5. **Copy** immediately → `OPENAI_API_KEY`

⚠️ **You can only see this key ONCE** - copy it now!

### 5.3 Set Usage Limits (Recommended)

1. **Click**: Settings → Limits
2. **Set** monthly limit (e.g., $50)
3. **Set** notification threshold (e.g., $25)

---

## 6. Push Notifications Setup

### 6.1 Generate VAPID Keys

Run this command on your computer:

```bash
npx web-push generate-vapid-keys
```

You'll see output like:
```
Public Key: BNxxxxxx...
Private Key: xxxxx...
```

### 6.2 Add to Netlify

Add these environment variables in Netlify:
```
VAPID_PUBLIC_KEY = [the public key]
VAPID_PRIVATE_KEY = [the private key]
VAPID_EMAIL = mailto:admin@stxryai.com
```

---

## 7. Analytics Setup

### 7.1 PostHog (Recommended)

1. **Go to**: https://app.posthog.com
2. **Sign up** (free tier available)
3. **Create project**
4. **Copy**:
   - Project API Key → `NEXT_PUBLIC_POSTHOG_KEY`
   - Host URL → `NEXT_PUBLIC_POSTHOG_HOST`

### 7.2 Sentry (Error Tracking)

1. **Go to**: https://sentry.io
2. **Sign up** (free tier available)
3. **Create project** (select Next.js)
4. **Copy DSN** → `NEXT_PUBLIC_SENTRY_DSN`

---

## 8. Custom Domain Setup

### 8.1 Add Domain to Netlify

1. **Go to**: Site configuration → Domain management
2. **Click**: "Add a domain"
3. **Enter**: `stxryai.com` (your domain)
4. **Follow** Netlify's instructions

### 8.2 Update DNS Records

At your domain registrar, add:

| Type | Name | Value |
|------|------|-------|
| A | @ | 75.2.60.5 |
| CNAME | www | your-site.netlify.app |

### 8.3 Enable HTTPS

1. **Go to**: Domain management → HTTPS
2. **Wait** for DNS verification
3. **Click**: "Provision certificate" if needed

### 8.4 Update All URLs

After domain is active:
1. **Netlify**: Update `NEXT_PUBLIC_APP_URL` to `https://stxryai.com`
2. **Supabase**: Update Site URL in Authentication settings
3. **Stripe**: Update webhook URL
4. **Trigger redeploy** in Netlify

---

## 9. Final Launch Checklist

### Test These BEFORE Announcing Launch

**Authentication:**
- [ ] Sign up with email works
- [ ] Sign in works
- [ ] Password reset works
- [ ] OAuth login works (if enabled)

**Core Features:**
- [ ] Homepage loads
- [ ] Story library shows stories
- [ ] Story reader works
- [ ] Choices work in stories
- [ ] Story creation works
- [ ] Profile page works

**Payments:**
- [ ] Pricing page shows correct prices
- [ ] Checkout redirects to Stripe
- [ ] Test purchase works (use Stripe test mode first!)
- [ ] Subscription shows in user profile

**Admin:**
- [ ] Admin dashboard loads (you need to set `is_admin: true` in your profile)

### After Launch

Monitor these daily for the first week:
- [ ] Netlify build logs (for errors)
- [ ] Supabase dashboard (for database issues)
- [ ] Stripe dashboard (for payment issues)
- [ ] User feedback

---

## Quick Reference: All Environment Variables

Copy this template and fill in your values:

```env
# REQUIRED - Without these, the app won't work
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=https://stxryai.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_CREATOR_PRO_PRICE_ID=price_...
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG....
EMAIL_FROM=noreply@stxryai.com
NODE_ENV=production

# RECOMMENDED - Enhance the experience
VAPID_PUBLIC_KEY=BN...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:admin@stxryai.com
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# FEATURE FLAGS - Enable/disable features
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

---

## Troubleshooting

### Build Fails on Netlify

1. Check the build log for specific error
2. Verify all required environment variables are set
3. Make sure `NEXT_PUBLIC_` prefix is used for client-side variables

### Database Errors

1. Check if migrations ran successfully in Supabase SQL Editor
2. Verify your Supabase URL and keys are correct
3. Check Supabase logs for errors

### Authentication Not Working

1. Verify Site URL is correct in Supabase
2. Check redirect URLs include your domain
3. Make sure anon key (not service key) is used for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Payments Not Working

1. Verify you're using live keys in production (not test keys)
2. Check webhook URL is accessible
3. Verify webhook secret matches

### AI Features Not Working

1. Verify OpenAI API key is valid
2. Check you have billing set up in OpenAI
3. Check usage limits haven't been exceeded

---

## Support Contacts

| Service | Help |
|---------|------|
| Supabase | https://supabase.com/support |
| Netlify | https://www.netlify.com/support |
| Stripe | https://support.stripe.com |
| SendGrid | https://support.sendgrid.com |
| OpenAI | https://help.openai.com |

---

## You Did It! 🎉

Your StxryAI platform is now live!

**Next Steps:**
1. Create your admin account
2. Add some sample stories
3. Test all features one more time
4. Announce your launch!

Good luck with your launch! 🚀
