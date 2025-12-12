# 🚀 StxryAI Complete Setup Guide

**Last Updated:** December 12, 2024
**Platform:** StxryAI - AI-Powered Interactive Fiction
**Estimated Time:** 60-90 minutes

---

## 📋 Overview

This guide will walk you through setting up your entire StxryAI platform from scratch. Follow each section in order for a smooth setup experience.

---

## 🎯 What You'll Need

### Accounts to Create (Free):
1. ✅ **Supabase Account** (Database & Authentication)
2. ✅ **Anthropic Account** (Claude AI API)
3. ❌ **Google Cloud Console** (OAuth - OPTIONAL, not required)
4. ❌ **OpenAI Account** (GPT API - OPTIONAL, fallback only)
5. ✅ **Netlify Account** (Hosting - or use Vercel)
6. ❌ **GitHub Account** (Already have)

### What I Can Do With Your Keys:
✅ Configure environment variables
✅ Set up API integrations
✅ Test authentication flows
✅ Populate database with seed data
✅ Configure deployment settings

### What Only You Can Do:
❌ Create accounts (requires your email/payment info)
❌ Navigate OAuth consent screens in browser
❌ Accept terms of service
❌ Add payment methods (if needed)

---

## 📝 Part 1: Supabase Setup (Database & Auth)

### Step 1.1: Create Supabase Project

1. **Go to:** https://supabase.com
2. **Click:** "Start your project" or "Sign In"
3. **Sign up** with GitHub (easiest) or email
4. **Click:** "New Project"
5. **Fill in:**
   - **Project Name:** `stxryai` (or your choice)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan:** Free tier is fine to start
6. **Click:** "Create new project"
7. **Wait:** 2-3 minutes for project to provision

### Step 1.2: Get Supabase Credentials

Once your project is ready:

1. **Go to:** Project Settings (gear icon on left sidebar)
2. **Click:** "API" tab
3. **Copy these 3 values:**

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

⚠️ **IMPORTANT:** Keep the `service_role` key secret! Never commit it to GitHub.

### Step 1.3: Configure Supabase Authentication

1. **Go to:** Authentication → Settings (left sidebar)
2. **Scroll to:** "Site URL"
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com` (we'll update this later)
3. **Scroll to:** "Redirect URLs" → Add these:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```
4. **Click:** Save

### Step 1.4: Enable Email Authentication

1. **Still in:** Authentication → Providers
2. **Find:** "Email" provider
3. **Toggle:** Enable
4. **Configuration:**
   - Enable email confirmations: ✅ ON (recommended)
   - Secure email change: ✅ ON
5. **Click:** Save

### Step 1.5: Disable Google OAuth (Not Needed Yet)

1. **In:** Authentication → Providers
2. **Find:** "Google" provider
3. **Toggle:** OFF (disable it)
4. **Note:** You can enable this later if you want Google sign-in

**✅ Email authentication is all you need right now!**

### Step 1.6: Set Up Database Schema

1. **Go to:** SQL Editor (left sidebar)
2. **Click:** "New query"
3. **Copy the entire database schema** from `supabase/schema.sql` file
4. **Paste** into the SQL editor
5. **Click:** "Run" (bottom right)
6. **Verify:** Tables created successfully (check Table Editor)

**Expected Tables:**
- users
- stories
- chapters
- choices
- story_branches
- tags
- story_tags
- follows
- likes
- comments
- ratings
- achievements
- user_achievements
- reading_progress

---

## 🤖 Part 2: Anthropic (Claude AI) Setup

### Step 2.1: Create Anthropic Account

1. **Go to:** https://console.anthropic.com
2. **Click:** "Sign Up" or "Get Started"
3. **Sign up** with email
4. **Verify** your email address

### Step 2.2: Get API Key

1. **Go to:** https://console.anthropic.com/settings/keys
2. **Click:** "Create Key"
3. **Name it:** `stxryai-production` (or your choice)
4. **Click:** "Create Key"
5. **Copy the key:** `sk-ant-api03-...` (starts with `sk-ant-`)
6. **Save it immediately** - you won't see it again!

### Step 2.3: Add Credits (Required)

⚠️ **Anthropic requires prepaid credits:**

1. **Go to:** Billing → https://console.anthropic.com/settings/billing
2. **Click:** "Add Credits"
3. **Recommended:** Start with $10-20
4. **Add payment method** (credit card)
5. **Purchase credits**

**Cost Estimates:**
- Claude Sonnet 3.5: $3 per million input tokens, $15 per million output tokens
- Average story generation: ~$0.02-0.10
- $10 = ~100-500 story generations
- $20 = ~200-1000 story generations

---

## 🌐 Part 3: Environment Variables Setup

### Option A: Give Me Your Keys (I'll Set It Up)

**If you want me to configure everything, provide:**

```bash
# Supabase (from Part 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic (from Part 2)
ANTHROPIC_API_KEY=sk-ant-api03-...

# App URL (we'll set this up later)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Just paste these values and I'll create your `.env.local` file!**

### Option B: Manual Setup

1. **In your project root** (`l:\stxryai\stxryai\`), create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Service Configuration
ANTHROPIC_API_KEY=sk-ant-api03-...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

2. **Save the file**
3. **Verify:** `.env.local` is in `.gitignore` (it should be)

---

## 🗄️ Part 4: Populate Database with Seed Stories

### Step 4.1: Install Dependencies

```bash
cd stxryai
npm install
```

### Step 4.2: Run Population Script

**After providing your Supabase keys (Part 3), run:**

```bash
npm run populate-db
```

**Expected Output:**
```
🚀 StxryAI Database Population Script
📡 Connecting to Supabase...
🔍 Looking for admin user...
📚 Starting to populate stories...

✅ Created story: "The Magic Treehouse Mystery"
   ✅ Created chapter: "The Mysterious Door"
✅ Created story: "Benny the Brave Bunny"
✅ Created story: "The Secret of Willow Creek"
...

📊 Summary:
   ✅ Successfully created: 17 stories
   ❌ Failed: 0 stories

✨ Database population complete!
```

### Step 4.3: Verify in Supabase

1. **Go to:** Supabase Dashboard → Table Editor
2. **Click:** `stories` table
3. **Verify:** You see 17 stories
4. **Click:** `chapters` table
5. **Verify:** You see sample chapters

---

## 🚀 Part 5: Local Development Testing

### Step 5.1: Start Development Server

```bash
cd stxryai
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

### Step 5.2: Test the Application

1. **Open browser:** http://localhost:3000
2. **Test Landing Page:**
   - Should see hero section
   - Animated stats should count up
   - Interactive demo should work
   - Trending stories carousel should auto-play

3. **Test Authentication:**
   - Click "Get Started" or "Sign Up"
   - Go to: http://localhost:3000/authentication
   - **Create an account** with your email
   - Check your email for verification link
   - Click verification link
   - Log in

4. **Test Story Creation:**
   - After login, go to: http://localhost:3000/create
   - Click "Create New Story"
   - Fill in title, genre, description
   - **Test AI Features:**
     - Click "AI Tools" tab
     - Click "Generate Story Idea"
     - Select genre, tone, narrative style
     - Click "Generate Idea"
     - Verify AI response appears

5. **Test Reading:**
   - Go to browse page
   - Click on any seed story
   - Verify genre-specific theme applies
   - Test reading customization (font size, spacing, width)

### Step 5.3: Common Issues & Fixes

**Issue: "Failed to fetch" or API errors**
- ✅ Check `.env.local` has correct Supabase URL and keys
- ✅ Check Anthropic API key is valid
- ✅ Restart dev server after changing `.env.local`

**Issue: "Google authentication not configured"**
- ✅ This is normal! Google OAuth is OPTIONAL and disabled
- ✅ Use email authentication instead
- ✅ If you see this message, ignore it - email auth works fine

**Issue: AI generation fails**
- ✅ Check Anthropic API key is correct
- ✅ Check you have credits in Anthropic account
- ✅ Check browser console for error messages

---

## 🌐 Part 6: Production Deployment (Netlify)

### Step 6.1: Create Netlify Account

1. **Go to:** https://www.netlify.com
2. **Click:** "Sign Up"
3. **Sign up** with GitHub (easiest - auto-connects repos)
4. **Authorize** Netlify to access your GitHub

### Step 6.2: Connect GitHub Repository

1. **Click:** "Add new site" → "Import an existing project"
2. **Choose:** GitHub
3. **Select:** Your `stxryai` repository
4. **Configure:**
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. **Click:** "Deploy site"

### Step 6.3: Add Environment Variables to Netlify

**CRITICAL:** Your app won't work without these!

1. **Go to:** Site settings → Environment variables
2. **Click:** "Add a variable" for each:

```bash
# Add these one by one:
NEXT_PUBLIC_SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY = sk-ant-api03-...
NEXT_PUBLIC_APP_URL = https://your-site-name.netlify.app
NODE_ENV = production
```

3. **For `NEXT_PUBLIC_APP_URL`:**
   - First deployment: Use the Netlify URL (e.g., `https://stxryai-123abc.netlify.app`)
   - After custom domain: Update to your domain

### Step 6.4: Trigger Redeploy

1. **Go to:** Deploys tab
2. **Click:** "Trigger deploy" → "Clear cache and deploy site"
3. **Wait:** 2-5 minutes for build to complete
4. **Check:** Deploy log for any errors

### Step 6.5: Update Supabase URLs

1. **Go back to:** Supabase Dashboard → Authentication → Settings
2. **Update Site URL:** `https://your-site-name.netlify.app`
3. **Add Redirect URL:** `https://your-site-name.netlify.app/auth/callback`
4. **Click:** Save

### Step 6.6: Test Production Site

1. **Visit:** Your Netlify URL
2. **Test:** Landing page loads
3. **Test:** Sign up works
4. **Test:** Email verification works
5. **Test:** Login works
6. **Test:** AI generation works
7. **Test:** Story creation works

---

## 🎨 Part 7: Custom Domain (Optional)

### Step 7.1: Purchase Domain

**Popular registrars:**
- Namecheap: https://www.namecheap.com
- Google Domains: https://domains.google
- GoDaddy: https://www.godaddy.com
- Cloudflare: https://www.cloudflare.com/products/registrar/

**Recommended domain:** `stxryai.com` or similar

### Step 7.2: Configure DNS in Netlify

1. **Go to:** Netlify Site Settings → Domain management
2. **Click:** "Add custom domain"
3. **Enter:** Your domain (e.g., `stxryai.com`)
4. **Netlify will show:** DNS configuration instructions

**Option A: Netlify DNS (Easiest)**
1. **Click:** "Use Netlify DNS"
2. **Copy** the nameservers shown (e.g., `dns1.p08.nsone.net`)
3. **Go to** your domain registrar
4. **Update nameservers** to Netlify's nameservers
5. **Wait** 24-48 hours for DNS propagation

**Option B: External DNS**
1. **Go to** your domain registrar's DNS settings
2. **Add A record:**
   - Name: `@`
   - Type: `A`
   - Value: `75.2.60.5` (Netlify's load balancer)
3. **Add CNAME record:**
   - Name: `www`
   - Type: `CNAME`
   - Value: `your-site-name.netlify.app`

### Step 7.3: Enable HTTPS

1. **In Netlify:** Domain management → HTTPS
2. **Click:** "Verify DNS configuration"
3. **Click:** "Provision certificate"
4. **Wait:** 1-2 minutes for SSL certificate
5. **Enable:** "Force HTTPS" toggle

### Step 7.4: Update Environment Variables

1. **Netlify:** Site settings → Environment variables
2. **Update:** `NEXT_PUBLIC_APP_URL` to `https://stxryai.com`
3. **Trigger:** New deployment

4. **Supabase:** Authentication → Settings
5. **Update Site URL:** `https://stxryai.com`
6. **Update Redirect URLs:** `https://stxryai.com/auth/callback`

---

## 📧 Part 8: Email Configuration (Optional but Recommended)

### Option A: Use Supabase Email (Default)

**Pros:**
- Already configured
- Free tier: 3 auth emails per hour
- Works out of the box

**Cons:**
- Limited sending (3/hour on free tier)
- Generic sender address
- May go to spam

**Setup:** None needed! Already working.

### Option B: Custom SMTP (Better for Production)

**Recommended providers:**
- SendGrid: Free tier 100 emails/day
- Mailgun: Free tier 5000 emails/month (first month)
- Amazon SES: $0.10 per 1000 emails

**Setup in Supabase:**
1. **Go to:** Project Settings → Auth → SMTP Settings
2. **Enable:** Custom SMTP
3. **Configure:**
   - SMTP Host: `smtp.sendgrid.net` (or your provider)
   - SMTP Port: `587`
   - Username: `apikey` (for SendGrid)
   - Password: Your API key
   - Sender email: `noreply@stxryai.com`
   - Sender name: `StxryAI`
4. **Click:** Save

---

## 🔒 Part 9: Security Checklist

### ✅ Environment Variables
- [ ] `.env.local` is in `.gitignore`
- [ ] Never commit API keys to GitHub
- [ ] Production keys in Netlify only
- [ ] Service role key kept secret

### ✅ Supabase Security
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] API keys rotated if ever exposed
- [ ] Database password is strong
- [ ] Only necessary auth providers enabled

### ✅ API Keys
- [ ] Anthropic API key has spending limits
- [ ] Monitor API usage regularly
- [ ] Rotate keys every 90 days (best practice)

### ✅ Deployment
- [ ] HTTPS enabled and forced
- [ ] Environment variables set in Netlify
- [ ] Site URL updated in Supabase
- [ ] DNS properly configured

---

## 📊 Part 10: Monitoring & Analytics (Optional)

### Google Analytics 4

1. **Create GA4 Property:**
   - Go to: https://analytics.google.com
   - Create account → Create property
   - Copy Measurement ID (e.g., `G-XXXXXXXXXX`)

2. **Add to Next.js:**
   - I can help integrate this with your measurement ID
   - Add script to `app/layout.tsx`

### Error Tracking - Sentry (Optional)

1. **Create Sentry account:** https://sentry.io
2. **Create project:** Next.js
3. **Copy DSN:** Will be like `https://xxx@xxx.ingest.sentry.io/xxx`
4. **Provide DSN:** I can integrate it

---

## 🎯 Quick Reference: What to Give Me

**To let me complete the setup for you, provide:**

### Required (Copy/Paste Format):

```
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_KEY=sk-ant-api03-...
```

### Optional:
```
OPENAI_KEY=sk-... (if you want GPT as fallback)
GA4_MEASUREMENT_ID=G-XXXXXXXXXX (for analytics)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx (for error tracking)
```

---

## ✅ Setup Checklist

### Phase 1: Accounts & Keys
- [ ] Created Supabase account
- [ ] Created Supabase project
- [ ] Got Supabase URL and keys
- [ ] Created Anthropic account
- [ ] Got Anthropic API key
- [ ] Added credits to Anthropic ($10+ recommended)

### Phase 2: Configuration
- [ ] Configured Supabase auth (email enabled, Google disabled)
- [ ] Set up database schema
- [ ] Created `.env.local` file
- [ ] Provided keys to Claude (or set up manually)

### Phase 3: Testing
- [ ] Ran `npm install`
- [ ] Ran database population script
- [ ] Verified 17 stories created
- [ ] Started dev server (`npm run dev`)
- [ ] Tested landing page
- [ ] Tested email signup/login
- [ ] Tested AI generation
- [ ] Tested story creation

### Phase 4: Deployment
- [ ] Created Netlify account
- [ ] Connected GitHub repo
- [ ] Added environment variables to Netlify
- [ ] Deployed successfully
- [ ] Updated Supabase redirect URLs
- [ ] Tested production site

### Phase 5: Optional Enhancements
- [ ] Custom domain configured
- [ ] DNS propagated
- [ ] HTTPS enabled
- [ ] Custom SMTP configured
- [ ] Analytics added
- [ ] Error tracking added

---

## 🆘 Troubleshooting

### "Build failed on Netlify"
1. Check build logs for specific error
2. Verify all environment variables are set
3. Check for TypeScript errors: `npm run type-check`
4. Clear cache and redeploy

### "Authentication not working"
1. Check Supabase redirect URLs match your domain exactly
2. Verify email confirmation is sent (check spam)
3. Check browser console for errors
4. Ensure `.env.local` has correct Supabase keys

### "AI generation fails"
1. Check Anthropic API key is correct
2. Verify you have credits in Anthropic account
3. Check API key spending limits
4. Look at browser network tab for error details

### "Database errors"
1. Verify schema was created successfully
2. Check RLS policies are correct
3. Check service role key is correct
4. Verify user has proper permissions

---

## 📞 Support

**If you get stuck:**

1. **Provide error messages:** Copy exact error from console/logs
2. **Provide context:** What were you doing when error occurred?
3. **Provide environment:** Development (localhost) or Production (Netlify)?
4. **Screenshots:** Always helpful

**I can help with:**
- Configuration issues
- Code errors
- Integration problems
- Deployment issues
- Database setup
- API integration

**I cannot help with:**
- Creating accounts for you (requires your email)
- Entering payment information
- Clicking through OAuth consent screens

---

## 🎉 Success Criteria

**You'll know setup is complete when:**

1. ✅ Landing page loads at your URL
2. ✅ You can sign up with email
3. ✅ Email verification works
4. ✅ You can log in
5. ✅ You can create a story
6. ✅ AI generation works (idea generator, writing suggestions)
7. ✅ You can read seed stories
8. ✅ Genre themes apply correctly
9. ✅ No console errors
10. ✅ Production deployment is live

---

## 🚀 Next Steps After Setup

1. **Create your first story** to test the full workflow
2. **Invite beta testers** (friends, family)
3. **Gather feedback** on UX and features
4. **Set up analytics** to track user behavior
5. **Plan marketing launch** (social media, content, ads)
6. **Monitor costs** (Anthropic API usage, Supabase limits)
7. **Iterate based on data** (A/B test landing page, CTAs)

---

## 💡 Pro Tips

1. **Start with email auth only** - Google OAuth adds complexity you don't need yet
2. **Monitor API costs** - Set up billing alerts in Anthropic console
3. **Use free tiers** - Supabase, Netlify free tiers are generous
4. **Test locally first** - Always verify changes work on localhost before deploying
5. **Keep keys secret** - Never share service role keys or commit them
6. **Backup database** - Export Supabase data regularly
7. **Version control** - Commit often, push to GitHub
8. **Read logs** - Check Netlify deploy logs and browser console for errors

---

**Ready to start? Let me know what keys you have and I'll help configure everything!** 🚀
