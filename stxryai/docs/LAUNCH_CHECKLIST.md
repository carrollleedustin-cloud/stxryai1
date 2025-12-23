# 🚀 StxryAI Complete Launch Checklist

A comprehensive step-by-step guide to launch your StxryAI platform.

---

## 📋 Quick Links - Get Your API Keys Here

| Service | Dashboard | Purpose |
|---------|-----------|---------|
| **Supabase** | [app.supabase.com](https://app.supabase.com) | Database, Auth, Storage |
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | AI Story Generation |
| **Anthropic** | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) | AI Story Generation (Alternative) |
| **Stripe** | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) | Payments & Subscriptions |
| **Resend** | [resend.com/api-keys](https://resend.com/api-keys) | Transactional Emails |
| **Netlify** | [app.netlify.com](https://app.netlify.com) | Hosting & Deployment |
| **PostHog** | [app.posthog.com](https://app.posthog.com) | Analytics |
| **Google Analytics** | [analytics.google.com](https://analytics.google.com) | Analytics (Alternative) |
| **Google OAuth** | [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) | Social Login |
| **GitHub OAuth** | [github.com/settings/developers](https://github.com/settings/developers) | Social Login |
| **Discord OAuth** | [discord.com/developers/applications](https://discord.com/developers/applications) | Social Login |
| **Sentry** | [sentry.io](https://sentry.io) | Error Tracking |

---

## Phase 1: Supabase Database Setup

### 1.1 Create New Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `stxryai-production`
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

- [ ] Project created successfully

### 1.2 Run Database Schema

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. **Choose ONE of these SQL files:**
   - **`CREATE_ALL_TABLES.sql`** (185KB) - MOST COMPLETE, all features
   - **`COMPLETE_FRESH_SETUP.sql`** (78KB) - Core features, simpler
4. Copy the **entire contents** (Ctrl+A, Ctrl+C)
5. Paste into SQL Editor
6. Click **"Run"** (or Ctrl+Enter)
7. Wait for success message

> **Recommendation:** Use `CREATE_ALL_TABLES.sql` for production deployments.

- [ ] Schema created successfully
- [ ] No errors in output

### 1.3 Get Your API Keys

Go to **Project Settings** → **API**:

| Key | What it is | Where to use |
|-----|------------|--------------|
| **Project URL** | `https://xxxx.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | Starts with `eyJ...` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** | Starts with `eyJ...` | `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **KEEP SECRET** |

- [ ] Copied Project URL
- [ ] Copied anon key
- [ ] Copied service_role key (stored securely)

### 1.4 Configure Authentication

Go to **Authentication** → **Providers**:

#### Email (Required)
- [ ] Enable **Email** provider
- [ ] "Confirm email" = **ON** (recommended for production)

#### Google OAuth (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Set Authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

- [ ] Google OAuth configured

#### GitHub OAuth (Optional)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

- [ ] GitHub OAuth configured

#### Discord OAuth (Optional)
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 → General
4. Add redirect: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret to Supabase

- [ ] Discord OAuth configured

### 1.5 Configure Auth Settings

Go to **Authentication** → **URL Configuration**:

| Setting | Development | Production |
|---------|-------------|------------|
| Site URL | `http://localhost:3000` | `https://yourdomain.com` |
| Redirect URLs | `http://localhost:3000/**` | `https://yourdomain.com/**` |

- [ ] Site URL configured
- [ ] Redirect URLs added

### 1.6 Create Storage Buckets (Optional)

Go to **Storage** → **New bucket**:

| Bucket | Public? | Purpose |
|--------|---------|---------|
| `avatars` | ✅ Yes | User profile pictures |
| `story-covers` | ✅ Yes | Story cover images |
| `user-uploads` | ❌ No | Private user files |

- [ ] Storage buckets created

---

## Phase 2: Environment Variables Setup

### 2.1 Create Your `.env.local` File

In your `stxryai` folder, create a file called `.env.local`:

```bash
# ============================================================================
# REQUIRED - Won't work without these
# ============================================================================

# Supabase (from Phase 1.3)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Site URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI - At least one required for story generation
OPENAI_API_KEY=sk-proj-...
# OR
ANTHROPIC_API_KEY=sk-ant-api03-...

# ============================================================================
# OPTIONAL - Add when ready
# ============================================================================

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_CREATOR_PRO_PRICE_ID=price_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

- [ ] `.env.local` created with required values
- [ ] AI key added (OpenAI or Anthropic)

### 2.2 Test Local Development

```bash
cd stxryai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- [ ] Site loads without errors
- [ ] No environment variable warnings in console

---

## Phase 3: AI Integration

### Option A: OpenAI

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Copy the key (you won't see it again!)
4. Add to `.env.local`: `OPENAI_API_KEY=sk-proj-...`

**Recommended Settings:**
- Set usage limits in [Usage → Limits](https://platform.openai.com/usage)
- Start with $10-20 monthly cap

- [ ] OpenAI key created
- [ ] Usage limits set

### Option B: Anthropic (Recommended for Narrative)

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click **"Create Key"**
3. Copy the key
4. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-api03-...`

**Recommended Settings:**
- Set spending limit in Console → Organization

- [ ] Anthropic key created
- [ ] Spending limit set

---

## Phase 4: Stripe Payments (Optional)

### 4.1 Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete identity verification

- [ ] Stripe account verified

### 4.2 Get API Keys

Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys):

| Key | Environment Variable |
|-----|---------------------|
| Publishable key (`pk_test_...`) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Secret key (`sk_test_...`) | `STRIPE_SECRET_KEY` ⚠️ **KEEP SECRET** |

- [ ] API keys copied

### 4.3 Create Products

Go to **Products** → **Add product**:

#### Premium Subscription
- Name: "StxryAI Premium"
- Pricing: 
  - $9.99/month (recurring)
  - $99/year (recurring) - optional
- Copy Price ID → `STRIPE_PREMIUM_PRICE_ID`

#### Creator Pro Subscription
- Name: "StxryAI Creator Pro"
- Pricing:
  - $19.99/month (recurring)
  - $199/year (recurring) - optional
- Copy Price ID → `STRIPE_CREATOR_PRO_PRICE_ID`

- [ ] Premium product created
- [ ] Creator Pro product created
- [ ] Price IDs copied

### 4.4 Create Webhook

Go to **Developers** → **Webhooks** → **Add endpoint**:

| Setting | Value |
|---------|-------|
| Endpoint URL | `https://yourdomain.com/api/webhooks/stripe` |
| Events | See below |

**Events to select:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

- [ ] Webhook created
- [ ] Events selected
- [ ] Signing secret copied

### 4.5 Customer Portal

Go to **Settings** → **Billing** → **Customer portal**:

- [ ] Enable customer portal
- [ ] Allow cancellation
- [ ] Allow payment method updates

---

## Phase 5: Email Setup with Resend (Optional)

### 5.1 Create Account

1. Sign up at [resend.com](https://resend.com)
2. Create API key → `RESEND_API_KEY`

- [ ] Resend account created
- [ ] API key copied

### 5.2 Verify Domain

Go to **Domains** → **Add domain**:

1. Add your domain (e.g., `yourdomain.com`)
2. Add the DNS records Resend provides:
   - 2 DKIM records
   - 1 SPF record (if not exists)
3. Wait for verification (can take up to 72 hours)

- [ ] Domain added
- [ ] DNS records added
- [ ] Domain verified

### 5.3 Configure Sending

Set `EMAIL_FROM=noreply@yourdomain.com` in `.env.local`

- [ ] Email from address configured

---

## Phase 6: Deploy to Netlify

### 6.1 Connect Repository

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub
4. Select your `stxryai` repository

- [ ] Repository connected

### 6.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| Base directory | `stxryai` |
| Build command | `npm run build` |
| Publish directory | `.next` |

- [ ] Build settings configured

### 6.3 Add Environment Variables

Go to **Site settings** → **Environment variables**:

Add ALL your `.env.local` variables here:

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase |
| `NEXT_PUBLIC_APP_URL` | Your production URL |
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | AI provider |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | If using Stripe |
| `STRIPE_SECRET_KEY` | If using Stripe |
| `STRIPE_WEBHOOK_SECRET` | If using Stripe |
| ... | Add all others |

**Important:** Use production values, not test/development values!

- [ ] All environment variables added
- [ ] Using production keys (not test keys)

### 6.4 Deploy

1. Click **"Deploy site"**
2. Watch the build logs
3. Fix any errors that appear

- [ ] Build successful
- [ ] Site deployed

### 6.5 Custom Domain (Optional)

Go to **Domain settings**:

1. Add your custom domain
2. Configure DNS:
   - If using Netlify DNS: Update nameservers at registrar
   - If external DNS: Add CNAME/A records Netlify provides
3. Wait for SSL certificate (automatic)

- [ ] Custom domain added
- [ ] DNS configured
- [ ] SSL active

### 6.6 Update Callback URLs

After deployment, update these settings:

**Supabase** (Authentication → URL Configuration):
- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/**`

**Stripe** (if using):
- Webhook URL: `https://yourdomain.com/api/webhooks/stripe`

**OAuth Providers** (if using):
- Update callback URLs to production domain

- [ ] Supabase URLs updated
- [ ] Stripe webhook URL updated
- [ ] OAuth callback URLs updated

---

## Phase 7: Final Testing

### 7.1 Authentication

- [ ] Sign up with email works
- [ ] Email confirmation received (if enabled)
- [ ] Sign in works
- [ ] Sign out works
- [ ] Google login works (if configured)
- [ ] Password reset works

### 7.2 Core Features

- [ ] Landing page loads correctly
- [ ] Story library displays stories
- [ ] Can start reading a story
- [ ] Choices appear and work
- [ ] AI-generated content appears (if AI configured)
- [ ] Reading progress is saved
- [ ] Dashboard shows user stats

### 7.3 Social Features

- [ ] Can view other user profiles
- [ ] Can send friend requests
- [ ] Direct messaging works
- [ ] Announcements display

### 7.4 Premium Features (if Stripe configured)

- [ ] Pricing page displays correctly
- [ ] Checkout flow works (test mode)
- [ ] Subscription activates
- [ ] Customer portal works
- [ ] Cancellation works

### 7.5 Admin Features

- [ ] Admin dashboard loads (for admin users)
- [ ] Can create announcements
- [ ] Analytics display correctly

---

## Phase 8: Go Live! 🎉

### Pre-Launch Checklist

- [ ] All environment variables set to production values
- [ ] Stripe using live keys (not test)
- [ ] Database has some sample content
- [ ] SSL certificate active
- [ ] Error tracking enabled (Sentry, optional)
- [ ] Analytics tracking verified

### Launch

- [ ] Set site live
- [ ] Monitor error logs for first 24 hours
- [ ] Check Supabase usage dashboard
- [ ] Check Stripe dashboard for payment issues

### Post-Launch

- [ ] Set up regular backups (Supabase handles automatically)
- [ ] Monitor AI usage costs
- [ ] Set up alerts for errors
- [ ] Create user support workflow

---

## 🆘 Common Issues & Fixes

### Auth not working
1. Check Site URL in Supabase matches your domain exactly
2. Check Redirect URLs include `/**` wildcard
3. Verify OAuth callback URLs are correct

### RLS (Row Level Security) errors
1. Go to Supabase SQL Editor
2. Check that RLS is enabled on tables
3. Verify policies exist for your operations

### Payments not processing
1. Check Stripe webhook logs
2. Verify webhook secret is correct
3. Ensure webhook events are selected

### AI not generating
1. Check API key is valid
2. Verify usage limits aren't exceeded
3. Check error logs for specific issues

### Build failing on Netlify
1. Check build logs for specific errors
2. Verify all environment variables are set
3. Clear cache and retry

---

## 📊 Monitoring & Maintenance

### Weekly Tasks
- [ ] Check error logs
- [ ] Review AI usage costs
- [ ] Monitor Stripe for failed payments
- [ ] Check database size

### Monthly Tasks
- [ ] Review analytics
- [ ] Check for package updates
- [ ] Review user feedback
- [ ] Optimize slow queries (if any)

---

## 📞 Support Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Stripe Docs](https://stripe.com/docs)
- [Resend Docs](https://resend.com/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
- [Anthropic Docs](https://docs.anthropic.com)

---

**Last Updated:** December 2024

🎉 **Congratulations on launching StxryAI!**
