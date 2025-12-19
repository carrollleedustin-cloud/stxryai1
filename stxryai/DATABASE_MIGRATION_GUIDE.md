# Database Migration Guide

**Date:** December 18, 2024  
**Status:** Ready for Execution

---

## 📋 Migration Files Created

The following migration files have been created and need to be run in Supabase:

1. **Reading Streaks & Gamification**
   - File: `supabase/migrations/20241218120000_add_reading_streaks_gamification.sql`
   - Tables: `reading_streaks`, `daily_reading_goals`, `reading_calendar`, `weekly_challenges`, `user_weekly_challenges`

2. **Push Notifications**
   - File: `supabase/migrations/20241218130000_add_push_notifications.sql`
   - Tables: `push_subscriptions`, `notification_preferences`

3. **Referral System**
   - File: `supabase/migrations/20241218140000_add_referral_system.sql`
   - Tables: `referrals`, `referral_rewards`, `share_tracking`

4. **Content Moderation**
   - File: `supabase/migrations/20241218150000_enhance_content_moderation.sql`
   - Tables: `ai_moderation_logs`, `moderation_queue`, `content_flags`, `moderation_statistics`

5. **GDPR Compliance**
   - File: `supabase/migrations/20241218160000_add_gdpr_compliance.sql`
   - Tables: `user_consents`, `data_export_requests`, `data_deletion_requests`, `privacy_settings`, `cookie_preferences`

---

## 🚀 How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Each Migration**
   - Copy the contents of each migration file
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for success confirmation

4. **Run Migrations in Order**
   ```
   1. 20241218120000_add_reading_streaks_gamification.sql
   2. 20241218130000_add_push_notifications.sql
   3. 20241218140000_add_referral_system.sql
   4. 20241218150000_enhance_content_moderation.sql
   5. 20241218160000_add_gdpr_compliance.sql
   ```

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to project directory
cd stxryai

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Or run specific migration
supabase migration up
```

### Option 3: Direct SQL Execution

You can also run the SQL files directly using psql or any PostgreSQL client:

```bash
# Using psql
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20241218120000_add_reading_streaks_gamification.sql
```

---

## ✅ Verification Steps

After running migrations, verify they were successful:

### 1. Check Tables Exist

Run this query in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'reading_streaks',
  'daily_reading_goals',
  'reading_calendar',
  'push_subscriptions',
  'notification_preferences',
  'referrals',
  'referral_rewards',
  'share_tracking',
  'ai_moderation_logs',
  'moderation_queue',
  'user_consents',
  'data_export_requests',
  'privacy_settings',
  'cookie_preferences'
)
ORDER BY table_name;
```

Expected: All 14 tables should be listed.

### 2. Check RLS Policies

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'reading_streaks',
  'push_subscriptions',
  'referrals',
  'ai_moderation_logs',
  'user_consents'
)
ORDER BY tablename, policyname;
```

Expected: Multiple policies per table.

### 3. Check Functions

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_or_create_reading_streak',
  'update_reading_streak_on_read',
  'generate_referral_code',
  'complete_referral',
  'add_to_moderation_queue',
  'update_moderation_stats',
  'create_default_privacy_settings',
  'get_or_create_cookie_preferences'
)
ORDER BY routine_name;
```

Expected: All 8 functions should be listed.

---

## ⚠️ Important Notes

### Migration Order
**CRITICAL:** Run migrations in the exact order listed above. Each migration may depend on previous ones.

### Backup First
Before running migrations, create a backup:
```sql
-- In Supabase Dashboard, go to Settings > Database > Backups
-- Or use pg_dump for manual backup
```

### Error Handling
If a migration fails:
1. Check the error message
2. Verify dependencies (tables/functions from previous migrations)
3. Check if tables already exist (may need to drop and recreate)
4. Review RLS policies

### Rollback
If you need to rollback a migration:
```sql
-- Drop tables (in reverse order)
DROP TABLE IF EXISTS cookie_preferences CASCADE;
DROP TABLE IF EXISTS privacy_settings CASCADE;
DROP TABLE IF EXISTS data_deletion_requests CASCADE;
-- ... etc
```

---

## 🔍 Troubleshooting

### Error: "relation already exists"
**Solution:** The table already exists. Either:
- Skip the migration if structure matches
- Drop and recreate: `DROP TABLE IF EXISTS table_name CASCADE;`

### Error: "function does not exist"
**Solution:** Ensure `update_updated_at_column()` function exists. If not, create it:
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Error: "permission denied"
**Solution:** Ensure you're using the service role key or have proper permissions.

### Error: "column does not exist"
**Solution:** Check if dependent migrations were run. Run migrations in order.

---

## 📊 Post-Migration Checklist

- [ ] All tables created successfully
- [ ] All RLS policies active
- [ ] All functions created
- [ ] All indexes created
- [ ] Test data insertion works
- [ ] Test RLS policies work
- [ ] Verify foreign key constraints

---

## 🧪 Test Queries

After migrations, test with these queries:

### Test Reading Streaks
```sql
-- Should return empty result (no error)
SELECT * FROM reading_streaks LIMIT 1;
```

### Test Push Subscriptions
```sql
-- Should return empty result (no error)
SELECT * FROM push_subscriptions LIMIT 1;
```

### Test Referrals
```sql
-- Test referral code generation
SELECT public.generate_referral_code('00000000-0000-0000-0000-000000000000'::UUID);
```

### Test Moderation
```sql
-- Test moderation queue function
SELECT public.add_to_moderation_queue(
  '00000000-0000-0000-0000-000000000000'::UUID,
  'story',
  'normal'
);
```

---

## 📝 Migration Summary

**Total Tables Created:** 14  
**Total Functions Created:** 8+  
**Total Policies Created:** 30+  
**Estimated Execution Time:** 2-5 minutes

---

**Status:** ✅ Ready to Execute  
**Next:** Run migrations in Supabase Dashboard

