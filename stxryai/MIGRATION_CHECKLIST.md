# Database Migration Checklist

**Quick Reference for Running Phase 1 Migrations**

---

## ✅ Dependencies Installed

- [x] `web-push` package installed
- [x] All npm dependencies up to date

---

## 📋 Migration Execution Checklist

### Step 1: Open Supabase Dashboard
- [ ] Go to https://app.supabase.com
- [ ] Select your StxryAI project
- [ ] Navigate to SQL Editor

### Step 2: Run Migrations in Order

#### Migration 1: Reading Streaks & Gamification
- [ ] Open file: `supabase/migrations/20241218120000_add_reading_streaks_gamification.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify: "Success. No rows returned"
- [ ] Check: 5 tables created (reading_streaks, daily_reading_goals, reading_calendar, weekly_challenges, user_weekly_challenges)

#### Migration 2: Push Notifications
- [ ] Open file: `supabase/migrations/20241218130000_add_push_notifications.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify: "Success. No rows returned"
- [ ] Check: 2 tables created (push_subscriptions, notification_preferences)

#### Migration 3: Referral System
- [ ] Open file: `supabase/migrations/20241218140000_add_referral_system.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify: "Success. No rows returned"
- [ ] Check: 3 tables created (referrals, referral_rewards, share_tracking)

#### Migration 4: Content Moderation
- [ ] Open file: `supabase/migrations/20241218150000_enhance_content_moderation.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify: "Success. No rows returned"
- [ ] Check: 4 tables created (ai_moderation_logs, moderation_queue, content_flags, moderation_statistics)

#### Migration 5: GDPR Compliance
- [ ] Open file: `supabase/migrations/20241218160000_add_gdpr_compliance.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify: "Success. No rows returned"
- [ ] Check: 5 tables created (user_consents, data_export_requests, data_deletion_requests, privacy_settings, cookie_preferences)

---

## ✅ Verification Queries

Run these after all migrations to verify:

### Check All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'reading_streaks', 'daily_reading_goals', 'reading_calendar',
  'weekly_challenges', 'user_weekly_challenges',
  'push_subscriptions', 'notification_preferences',
  'referrals', 'referral_rewards', 'share_tracking',
  'ai_moderation_logs', 'moderation_queue', 'content_flags', 'moderation_statistics',
  'user_consents', 'data_export_requests', 'data_deletion_requests',
  'privacy_settings', 'cookie_preferences'
)
ORDER BY table_name;
```

**Expected:** 19 tables

### Check Functions
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%streak%' 
   OR routine_name LIKE '%referral%'
   OR routine_name LIKE '%moderation%'
   OR routine_name LIKE '%privacy%'
   OR routine_name LIKE '%cookie%'
ORDER BY routine_name;
```

**Expected:** 8+ functions

---

## 🔧 Post-Migration Setup

### Environment Variables
Add to `.env.local`:

```bash
# Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:notifications@stxryai.com

# Content Moderation (Perspective API)
NEXT_PUBLIC_PERSPECTIVE_API_KEY=your_perspective_key_here
```

### Generate VAPID Keys (for Push Notifications)
```bash
npm install -g web-push
web-push generate-vapid-keys
```

Copy the public and private keys to `.env.local`

---

## ⚠️ Common Issues

### Issue: "relation already exists"
**Fix:** Table already exists. Check if it has the correct structure. If not, drop and recreate:
```sql
DROP TABLE IF EXISTS table_name CASCADE;
-- Then re-run migration
```

### Issue: "function does not exist"
**Fix:** Ensure `update_updated_at_column()` exists:
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Issue: "permission denied"
**Fix:** Use service role key or ensure proper RLS policies are set.

---

## 📊 Migration Summary

- **Total Migrations:** 5
- **Total Tables:** 19
- **Total Functions:** 8+
- **Total Policies:** 30+
- **Estimated Time:** 5-10 minutes

---

## ✅ Completion Checklist

- [ ] All 5 migrations executed successfully
- [ ] All 19 tables verified
- [ ] All functions verified
- [ ] RLS policies active
- [ ] Environment variables configured
- [ ] VAPID keys generated (for push notifications)
- [ ] Perspective API key configured (for moderation)

---

**Status:** Ready to Execute  
**Next Step:** Open Supabase Dashboard and run migrations

