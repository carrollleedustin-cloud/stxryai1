# Quick Setup Guide - Starter Stories

This guide will help you set up admin access and import the starter stories in just a few minutes.

## Step 1: Make Yourself Admin

Run this command with your email address:

```bash
cd stxryai
node scripts/create-admin-user.js your.email@example.com
```

**What this does:**
- Creates or updates your user account
- Sets your role to "admin"
- Gives you admin privileges
- Prepares your account for importing stories

**Example:**
```bash
node scripts/create-admin-user.js dustin@stxryai.com
```

## Step 2: Import Starter Stories

Once you're an admin, run:

```bash
node scripts/import-starter-stories.js
```

**What this does:**
- Imports all 16 completed stories
- Creates a "Platform Starter Stories" collection
- Links stories to the collection
- Sets stories as featured and published

## Step 3: Verify

Visit your platform and check:
- `/stories` - Should show all stories
- `/stories?collection=platform-starter-stories` - Should show the collection
- Individual story pages like `/stories/the-shepherds-burden`

## Troubleshooting

### "Admin user not found"
Run the create-admin-user script first:
```bash
node scripts/create-admin-user.js your.email@example.com
```

### "Cannot find module '@supabase/supabase-js'"
Install dependencies:
```bash
npm install
```

### "SUPABASE_SERVICE_ROLE_KEY not found"
Check your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from your Supabase project settings:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy the URL and service_role key

### Stories not appearing
1. Check database connection
2. Verify admin user exists
3. Check console for error messages
4. Try running import script again

## Alternative: SQL Import

If the Node.js script doesn't work, use SQL directly:

```bash
cd stxryai/database
psql -h your-supabase-host -U postgres -d postgres -f starter-stories-seed.sql
```

Or in Supabase SQL Editor:
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy contents of `database/starter-stories-seed.sql`
4. Paste and run

## What You Get

After setup, you'll have:
- ✅ 16 professional stories across 6 categories
- ✅ "Platform Starter Stories" featured collection
- ✅ All stories published and searchable
- ✅ Admin access to manage content
- ✅ Ready-to-use platform content

## Next Steps

1. **Customize**: Edit story metadata if needed
2. **Feature**: Set which stories appear on homepage
3. **Promote**: Share stories on social media
4. **Engage**: Monitor user engagement with stories
5. **Expand**: Add more stories using the same format

## Need Help?

Check these files for more details:
- `INTEGRATION_GUIDE.md` - Full integration documentation
- `README.md` - Complete story index
- `PROJECT_STATUS.md` - Current project status

---

**Quick Reference Commands:**

```bash
# Make yourself admin
node scripts/create-admin-user.js your.email@example.com

# Import stories
node scripts/import-starter-stories.js

# Verify (in psql or Supabase SQL Editor)
SELECT COUNT(*) FROM stories WHERE is_starter_story = true;
```

That's it! You're ready to go. 🚀