# 🔐 StxryAI Environment Variables Guide

> **Copy the template below into a new file called `.env.local` in the `stxryai` folder.**

---

## Quick Links to Get API Keys

| Service | Where to Get Key | Required? |
|---------|-----------------|-----------|
| **Supabase** | [app.supabase.com](https://app.supabase.com) → Project → Settings → API | ✅ Yes |
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | 🟡 One AI Required |
| **Anthropic** | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) | 🟡 One AI Required |
| **Stripe** | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) | ⭕ Optional |
| **Resend** | [resend.com/api-keys](https://resend.com/api-keys) | ⭕ Optional |
| **PostHog** | [app.posthog.com](https://app.posthog.com) → Project Settings | ⭕ Optional |
| **Google Analytics** | [analytics.google.com](https://analytics.google.com) → Admin → Data Streams | ⭕ Optional |
| **Perspective API** | [developers.perspectiveapi.com](https://developers.perspectiveapi.com/s/) | ⭕ Optional |
| **Sentry** | [sentry.io](https://sentry.io) → Settings → Projects → Client Keys | ⭕ Optional |

---

## 🚨 What "Keep Secret" Means

Variables marked as **SECRET** or **PRIVATE**:

1. **NEVER commit to Git** - They're in `.gitignore`
2. **NEVER log to console** in production
3. **NEVER send to the browser** - Server-side only
4. **NEVER share screenshots** with these visible
5. **NEVER use in client-side code** (files without 'use server')

**If a secret is ever exposed:**
1. Rotate it immediately in the service's dashboard
2. Update `.env.local` with the new key
3. Redeploy your application

**Why this matters:**
- `SUPABASE_SERVICE_ROLE_KEY` bypasses ALL database security
- `STRIPE_SECRET_KEY` can make charges to your account
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` use your AI credits

---

## 📋 Complete `.env.local` Template

Copy everything below and save as `.env.local` in your `stxryai` folder:

```bash
# ============================================================================
# STXRYAI ENVIRONMENT CONFIGURATION
# ============================================================================

# ============================================================================
# 🔐 SUPABASE (REQUIRED)
# ============================================================================
# From: https://app.supabase.com → Your Project → Settings → API

# PUBLIC - Safe for browser
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key

# ⚠️ SECRET - Server only! Bypasses all RLS security!
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key


# ============================================================================
# 🌐 SITE URL (REQUIRED)
# ============================================================================
# Development:
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: https://yourdomain.com


# ============================================================================
# 🤖 AI SERVICES (AT LEAST ONE REQUIRED)
# ============================================================================
# You need at least ONE of these for story generation to work.
# If both are set, Claude is preferred for narrative quality.

# Option A: OpenAI GPT-4
# From: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# Option B: Anthropic Claude (Recommended)
# From: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-api03-...


# ============================================================================
# 💳 STRIPE PAYMENTS (OPTIONAL)
# ============================================================================
# Skip this section if not accepting payments yet.
# From: https://dashboard.stripe.com/apikeys

# PUBLIC - For checkout button
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ⚠️ SECRET - Server only!
STRIPE_SECRET_KEY=sk_test_...

# From: https://dashboard.stripe.com/webhooks
# Create endpoint: https://yourdomain.com/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_...

# From: https://dashboard.stripe.com/products
# Create your subscription products first, then copy Price IDs
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_CREATOR_PRO_PRICE_ID=price_...


# ============================================================================
# 📧 EMAIL WITH RESEND (OPTIONAL)
# ============================================================================
# Skip if not sending transactional emails yet.
# From: https://resend.com/api-keys

# ⚠️ SECRET
RESEND_API_KEY=re_...

# Your verified domain
EMAIL_FROM=noreply@yourdomain.com


# ============================================================================
# 📊 ANALYTICS (OPTIONAL)
# ============================================================================

# PostHog (Privacy-focused, recommended)
# From: https://app.posthog.com → Project Settings
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Google Analytics
# From: https://analytics.google.com → Admin → Data Streams
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...


# ============================================================================
# 💰 GOOGLE ADSENSE (OPTIONAL)
# ============================================================================
# Skip if not running ads.
# From: https://www.google.com/adsense → Sites → Ad units

NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-...
NEXT_PUBLIC_ADSENSE_ENABLED=false


# ============================================================================
# 🔔 WEB PUSH NOTIFICATIONS (OPTIONAL)
# ============================================================================
# Generate keys: npx web-push generate-vapid-keys

NEXT_PUBLIC_VAPID_PUBLIC_KEY=BP...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:your@email.com


# ============================================================================
# 🛡️ PERSPECTIVE API - Content Moderation (OPTIONAL)
# ============================================================================
# From: https://developers.perspectiveapi.com/s/

NEXT_PUBLIC_PERSPECTIVE_API_KEY=AIza...


# ============================================================================
# 🐛 SENTRY - Error Tracking (OPTIONAL)
# ============================================================================
# From: https://sentry.io → Settings → Projects → Client Keys

NEXT_PUBLIC_SENTRY_DSN=https://...@o...ingest.sentry.io/...
```

---

## ✅ Minimum Required for Development

To get started with basic functionality, you only need:

```bash
# Minimum required .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=sk-proj-...
# OR
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Replace `localhost:3000` with your real domain
- [ ] Replace Stripe `test` keys with `live` keys
- [ ] Verify email domain in Resend
- [ ] Update OAuth redirect URLs in Supabase Auth settings
- [ ] Update Stripe webhook URL to production domain
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (PostHog or GA)

---

## 🔧 Testing Your Setup

After setting up `.env.local`, run:

```bash
npm run dev
```

Check the terminal for any warnings about missing environment variables.

---

## 📝 Notes

- **NEXT_PUBLIC_** prefix = Safe for browser, included in JavaScript bundle
- **No prefix** = Server-side only, never exposed to client
- Variables are loaded at build time, so restart `npm run dev` after changes

