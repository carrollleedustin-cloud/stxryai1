# ⚡ Quick Setup - Do This Now!

**Status:** Environment configured ✅
**Next Step:** Set up database schema in Supabase

---

## 🎯 Step 1: Set Up Database Schema (5 minutes)

### Open Supabase SQL Editor:

1. **Go to:** https://supabase.com/dashboard
2. **Click** your project: `lxtjkhphwihroktujzzi`
3. **Click:** "SQL Editor" (in left sidebar, icon looks like `</>`)
4. **Click:** "+ New query" button (top right)

### Run the Schema:

1. **Open this file** on your computer: `l:\stxryai\stxryai\supabase\schema.sql`
2. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
3. **Paste** into the Supabase SQL Editor
4. **Click:** "Run" button (bottom right, or press Ctrl+Enter)
5. **Wait:** 5-10 seconds for execution
6. **Check:** You should see "Success. No rows returned" message

### Verify Tables Created:

1. **Click:** "Table Editor" (left sidebar)
2. **You should see** these tables:
   - users
   - stories
   - chapters
   - choices
   - user_progress
   - collections
   - follows
   - likes
   - comments
   - ratings
   - achievements
   - user_achievements
   - notifications
   - reading_progress
   - ...and more

✅ If you see all these tables, database setup is complete!

---

## 🎯 Step 2: Populate Database with Seed Stories

**After Step 1 is complete,** tell me "database schema is done" and I'll populate it with 17 starter stories automatically.

---

## 🚀 What Happens Next

Once the database schema is set up:

1. ✅ I'll populate database with 17 seed stories
2. ✅ I'll test the authentication system
3. ✅ I'll start the development server
4. ✅ You'll be able to browse stories, create account, and use all features
5. ✅ Then we'll deploy to Netlify for production

---

## ⚠️ Important Note: Anthropic API Key

You're currently configured to use **OpenAI (GPT)** for AI generation. This will work, but the platform is optimized for **Anthropic Claude**.

**Current AI Setup:**
- ✅ OpenAI API: Configured (will work as fallback)
- ❌ Anthropic API: Not configured yet

**To get Anthropic Claude API key:**

1. **Go to:** https://console.anthropic.com
2. **Sign up** with email
3. **Go to:** Settings → API Keys
4. **Click:** "Create Key"
5. **Copy** the key (starts with `sk-ant-api03-...`)
6. **Add $10-20 credits** in Billing section

**Then give me the key and I'll add it to your `.env.local`**

**Cost comparison:**
- Anthropic Claude Sonnet: ~$0.02-0.10 per story generation
- OpenAI GPT-4: ~$0.03-0.15 per story generation

Both work fine, but Claude is specifically what the AI prompts are optimized for.

---

## 📋 Current Status

✅ Supabase URL configured
✅ Supabase API keys configured
✅ OpenAI API key configured
✅ `.env.local` file created
✅ Package.json updated
⏳ **DATABASE SCHEMA - WAITING ON YOU**
⏳ Seed stories - waiting for schema
⏳ Anthropic API - optional but recommended

---

## 🎉 Ready?

**Just do Step 1 above** (paste schema.sql into Supabase SQL Editor and run it)

**Then tell me:** "schema is done"

**I'll handle the rest!** 🚀
