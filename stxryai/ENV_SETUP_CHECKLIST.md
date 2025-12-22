# 🔑 Environment Variables & API Keys Setup Checklist

**Quick Reference Guide** - Complete this checklist to ensure all API keys and environment variables are properly configured.

---

## ✅ What I Can Do For You

- ✅ Check which environment variables are required
- ✅ Create template files
- ✅ Verify variable names match the code
- ✅ Create validation scripts
- ❌ **Cannot** get API keys (you need accounts for each service)
- ❌ **Cannot** set variables in Netlify (you need to do this manually)

---

## 📋 Setup Checklist

### 🔴 **REQUIRED** - App Won't Work Without These

#### 1. Supabase (Database & Auth)
- [ ] **NEXT_PUBLIC_SUPABASE_URL**
  - Where: [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API
  - Format: `https://xxxxx.supabase.co`
  - ✅ I can verify the format is correct
  
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY**
  - Where: Same as above (labeled "anon public")
  - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - ✅ I can verify the format is correct

- [ ] **SUPABASE_SERVICE_ROLE_KEY** (Server-side only)
  - Where: Same page (labeled "service_role" - **KEEP SECRET!**)
  - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - ⚠️ **Never expose this in client-side code**
  - ✅ I can verify it's only used server-side

**How to get:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create one)
3. Go to **Settings** → **API**
4. Copy the values

---

### 🟡 **HIGHLY RECOMMENDED** - Core Features Need These

#### 2. App URL
- [ ] **NEXT_PUBLIC_APP_URL**
  - Development: `http://localhost:3000`
  - Production: `https://stxryai.com` (or your domain)
  - ✅ I can help set this based on your domain

---

### 🟢 **OPTIONAL** - Features Work Without, But Better With

#### 3. Stripe (Payments)
- [ ] **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
  - Where: [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys
  - Format: `pk_test_...` (test) or `pk_live_...` (production)
  
- [ ] **STRIPE_SECRET_KEY**
  - Where: Same page (labeled "Secret key")
  - Format: `sk_test_...` (test) or `sk_live_...` (production)
  - ⚠️ **Keep secret!**

- [ ] **STRIPE_WEBHOOK_SECRET** (If using webhooks)
  - Where: Stripe Dashboard → Developers → Webhooks → Add endpoint
  - Format: `whsec_...`
  
- [ ] **STRIPE_PREMIUM_PRICE_ID** (If offering premium)
  - Where: Stripe Dashboard → Products → Create product → Copy Price ID
  - Format: `price_...`
  
- [ ] **STRIPE_CREATOR_PRO_PRICE_ID** (If offering creator pro)
  - Same as above

**How to get:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in
3. Go to **Developers** → **API keys**
4. Use **Test mode** keys for development
5. Switch to **Live mode** for production

---

#### 4. OpenAI (AI Features)
- [ ] **OPEN_AI_SECRET_KEY**
  - Where: [OpenAI Platform](https://platform.openai.com) → API keys
  - Format: `sk-...`
  
- [ ] **OPEN_AI_SERVICE_KEY** (Alternative/backup)
  - Same as above (can be same key or different)

**How to get:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Go to **API keys**
4. Click **+ Create new secret key**
5. Copy immediately (can't view again)

---

#### 5. Email (Resend)
- [ ] **RESEND_API_KEY**
  - Where: [Resend Dashboard](https://resend.com/api-keys)
  - Format: `re_...`
  
- [ ] **EMAIL_FROM**
  - Format: `noreply@stxryai.com` (use your verified domain)
  - Must be verified in Resend

**How to get:**
1. Go to [Resend](https://resend.com)
2. Sign up or log in
3. Go to **API Keys** → **Create API Key**
4. Verify your domain in **Domains**

---

#### 6. Analytics (Optional)
- [ ] **NEXT_PUBLIC_POSTHOG_KEY**
  - Where: [PostHog](https://posthog.com) → Project Settings → API Key
  - Format: `phc_...`
  
- [ ] **NEXT_PUBLIC_GA_MEASUREMENT_ID**
  - Where: [Google Analytics](https://analytics.google.com) → Admin → Data Streams
  - Format: `G-XXXXXXXXXX`

---

#### 7. Ads (Optional)
- [ ] **NEXT_PUBLIC_ADSENSE_CLIENT**
  - Where: [Google AdSense](https://www.google.com/adsense) → Account → Sites
  - Format: `ca-pub-...`
  
- [ ] **NEXT_PUBLIC_ADSENSE_ID**
  - Where: Same as above
  - Format: Usually same as client or provided separately

---

## 🚀 Where to Set These

### Local Development (`.env.local`)
Create a file called `.env.local` in the `stxryai` folder:

```bash
# Copy this template and fill in your values
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Important:** `.env.local` is in `.gitignore` - never commit it!

---

### Production (Netlify)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add each variable one by one

**For each variable:**
- **Key:** The variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
- **Value:** Your actual key/value
- **Scopes:** Leave as "All scopes" (or select specific if needed)

---

## ✅ Verification Steps

### 1. Check What's Currently Set
I can create a script to check which variables are set. Would you like me to create this?

### 2. Test Locally
```bash
# In the stxryai folder
npm run dev
```
- If you see errors about missing env vars, those are the ones you need to add

### 3. Test Build
```bash
npm run build
```
- Build should complete without env-related errors

### 4. Check Netlify Build Logs
- Go to Netlify → Deploys
- Check the latest build log
- Look for any "Missing required environment variables" errors

---

## 🆘 Common Issues

### "Missing required environment variables"
- **Fix:** Add the missing variables to Netlify (Site Settings → Environment Variables)
- **After adding:** Trigger a new deploy

### "Supabase is not configured"
- **Fix:** Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- **Verify:** Keys should start with `https://` and `eyJ` respectively

### "Cannot access 'T' before initialization"
- **Fix:** This is a code issue (already fixed), but can also happen if env vars cause module loading issues
- **Check:** Make sure all required vars are set

### Build works locally but fails on Netlify
- **Fix:** Variables might be set locally but not in Netlify
- **Check:** Netlify → Site Settings → Environment Variables

---

## 📝 Quick Reference

| Variable | Required? | Where to Get | Format |
|----------|-----------|--------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase Dashboard | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase Dashboard | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase Dashboard | `eyJ...` |
| `NEXT_PUBLIC_APP_URL` | 🟡 Recommended | Your domain | `https://stxryai.com` |
| `STRIPE_SECRET_KEY` | 🟢 Optional | Stripe Dashboard | `sk_...` |
| `OPEN_AI_SECRET_KEY` | 🟢 Optional | OpenAI Platform | `sk-...` |
| `RESEND_API_KEY` | 🟢 Optional | Resend Dashboard | `re_...` |

---

## 🎯 What I Need From You

To help you set this up, I can:

1. **Create a validation script** - Checks which vars are missing
2. **Create a template file** - `.env.local.example` with all variables listed
3. **Verify your setup** - Once you tell me what's set, I can verify it matches the code

**Just tell me:**
- "Create the validation script" - I'll make a script to check what's missing
- "Create the template" - I'll create `.env.local.example`
- "Check my Netlify setup" - Share your Netlify env vars (safely - mask the actual keys) and I'll verify

---

## 🔒 Security Notes

- ✅ **Safe to expose:** Variables starting with `NEXT_PUBLIC_` (they're public anyway)
- ⚠️ **Never expose:** `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `OPEN_AI_SECRET_KEY`, `RESEND_API_KEY`
- ✅ **Best practice:** Use different keys for development and production
- ✅ **Netlify:** All variables are encrypted at rest

---

**Ready to start?** Let me know which service you want to set up first, or if you want me to create the validation script/template!

