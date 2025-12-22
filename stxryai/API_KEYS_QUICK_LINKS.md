# 🔑 API Keys - Quick Access Links

Direct links to get all your API keys. Bookmark this page for easy access!

---

## 🔴 **REQUIRED** - App Won't Work Without These

### 1. Supabase (Database & Auth)

**Get all 3 keys from one place:**

🔗 **Direct Link:** https://app.supabase.com → Your Project → **Settings** → **API**

**What you need:**
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL (starts with `https://`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon/Public key (starts with `eyJ`)
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role key (starts with `eyJ`) ⚠️ **Keep secret!**

**Steps:**
1. Go to https://app.supabase.com
2. Select your project (or create one)
3. Click **Settings** (gear icon) in left sidebar
4. Click **API** in the settings menu
5. Copy the values from the page

---

## 🟡 **HIGHLY RECOMMENDED**

### 2. App URL

**Set this yourself:**
- **Development:** `http://localhost:4028`
- **Production:** `https://stxryai.com` (your actual domain)

**No link needed** - just set it in your `.env.local` and Netlify

---

## 🟢 **OPTIONAL** - But Recommended for Full Features

### 3. Stripe (Payments)

🔗 **Direct Link:** https://dashboard.stripe.com → **Developers** → **API keys**

**What you need:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Publishable key (starts with `pk_test_` or `pk_live_`)
- `STRIPE_SECRET_KEY` - Secret key (starts with `sk_test_` or `sk_live_`) ⚠️ **Keep secret!**
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (starts with `whsec_`)
- `STRIPE_PREMIUM_PRICE_ID` - Price ID (starts with `price_`)
- `STRIPE_CREATOR_PRO_PRICE_ID` - Price ID (starts with `price_`)

**Steps:**
1. Go to https://dashboard.stripe.com
2. Sign up or log in
3. Click **Developers** in top menu
4. Click **API keys** in left sidebar
5. **For development:** Use "Test mode" keys (toggle in top right)
6. **For production:** Use "Live mode" keys
7. **For webhooks:** Go to **Developers** → **Webhooks** → Create endpoint → Copy signing secret
8. **For price IDs:** Go to **Products** → Create product → Copy Price ID

**Webhook Setup:**
- Endpoint URL: `https://stxryai.com/api/webhooks/stripe` (or your domain)
- Events to listen: `payment_intent.succeeded`, `customer.subscription.created`, etc.

---

### 4. OpenAI (AI Features)

🔗 **Direct Link:** https://platform.openai.com → **API keys**

**What you need:**
- `OPEN_AI_SECRET_KEY` - API key (starts with `sk-`)
- `OPEN_AI_SERVICE_KEY` - Can be same as above or different key

**Steps:**
1. Go to https://platform.openai.com
2. Sign up or log in
3. Click your profile icon (top right)
4. Click **API keys**
5. Click **+ Create new secret key**
6. **Copy immediately** - you can't view it again!
7. Name it (e.g., "StxryAI Production")

**Note:** You can use the same key for both `OPEN_AI_SECRET_KEY` and `OPEN_AI_SERVICE_KEY`, or create separate keys.

---

### 5. Resend (Email Service)

🔗 **Direct Link:** https://resend.com → **API Keys**

**What you need:**
- `RESEND_API_KEY` - API key (starts with `re_`)
- `EMAIL_FROM` - Your verified email address (e.g., `noreply@stxryai.com`)

**Steps:**
1. Go to https://resend.com
2. Sign up or log in
3. Click **API Keys** in left sidebar
4. Click **Create API Key**
5. Name it (e.g., "StxryAI Production")
6. Copy the key
7. **Verify your domain:** Go to **Domains** → Add domain → Follow DNS setup
8. Use verified domain for `EMAIL_FROM`

**Domain Verification:**
- Add DNS records (TXT, MX) as shown in Resend dashboard
- Wait for verification (usually a few minutes)

---

### 6. PostHog (Analytics)

🔗 **Direct Link:** https://posthog.com → **Project Settings** → **API Key**

**What you need:**
- `NEXT_PUBLIC_POSTHOG_KEY` - Project API key (starts with `phc_`)

**Steps:**
1. Go to https://posthog.com
2. Sign up or log in
3. Select your project
4. Click **Project Settings** (gear icon)
5. Scroll to **API Key** section
6. Copy the **Project API Key**

---

### 7. Google Analytics

🔗 **Direct Link:** https://analytics.google.com → **Admin** → **Data Streams**

**What you need:**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Measurement ID (starts with `G-`)

**Steps:**
1. Go to https://analytics.google.com
2. Sign up or log in
3. Create a property (or use existing)
4. Click **Admin** (gear icon, bottom left)
5. Under **Property**, click **Data Streams**
6. Click on your web stream (or create one)
7. Copy the **Measurement ID** (starts with `G-`)

---

### 8. Google AdSense

🔗 **Direct Link:** https://www.google.com/adsense → **Account** → **Sites**

**What you need:**
- `NEXT_PUBLIC_ADSENSE_CLIENT` - Publisher ID (starts with `ca-pub-`)
- `NEXT_PUBLIC_ADSENSE_ID` - Ad unit ID (optional, usually same as client)

**Steps:**
1. Go to https://www.google.com/adsense
2. Sign up or log in
3. Add your site (if not already added)
4. Go to **Account** → **Sites**
5. Copy your **Publisher ID** (starts with `ca-pub-`)
6. For ad units, go to **Ads** → **By site** → Create ad unit → Copy ID

**Note:** AdSense approval can take 1-2 weeks. You can set this up later.

---

## 📋 Quick Checklist

Use this to track which keys you've obtained:

- [ ] **Supabase URL** - https://app.supabase.com → Settings → API
- [ ] **Supabase Anon Key** - Same page as above
- [ ] **Supabase Service Role Key** - Same page as above
- [ ] **Stripe Publishable Key** - https://dashboard.stripe.com → Developers → API keys
- [ ] **Stripe Secret Key** - Same page as above
- [ ] **Stripe Webhook Secret** - https://dashboard.stripe.com → Developers → Webhooks
- [ ] **Stripe Price IDs** - https://dashboard.stripe.com → Products
- [ ] **OpenAI API Key** - https://platform.openai.com → API keys
- [ ] **Resend API Key** - https://resend.com → API Keys
- [ ] **PostHog Key** - https://posthog.com → Project Settings
- [ ] **Google Analytics ID** - https://analytics.google.com → Admin → Data Streams
- [ ] **Google AdSense** - https://www.google.com/adsense → Account → Sites

---

## 🎯 Priority Order

**Get these first (required for app to work):**
1. ✅ Supabase (all 3 keys)
2. ✅ App URL (set to your domain)

**Get these next (core features):**
3. ✅ Stripe (for payments)
4. ✅ OpenAI (for AI features)
5. ✅ Resend (for emails)

**Get these later (nice to have):**
6. PostHog (analytics)
7. Google Analytics (analytics)
8. Google AdSense (monetization)

---

## 💡 Pro Tips

- **Test vs Production:** Use test keys for development, live keys for production
- **Keep Secrets Safe:** Never commit keys to git (they're in `.gitignore`)
- **Rotate Keys:** If a key is exposed, regenerate it immediately
- **One Key Per Service:** You can use one key for multiple purposes, or create separate keys for better security
- **Document Your Keys:** Keep a secure note of which keys are for which environment

---

## 🆘 Need Help?

- **Supabase Issues:** https://supabase.com/docs/guides/getting-started
- **Stripe Setup:** https://stripe.com/docs/development/quickstart
- **OpenAI Docs:** https://platform.openai.com/docs
- **Resend Docs:** https://resend.com/docs

---

**Bookmark this page for quick access to all your API key dashboards!** 🔖

