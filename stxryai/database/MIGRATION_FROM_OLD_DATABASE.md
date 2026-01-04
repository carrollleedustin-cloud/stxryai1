# Migration Guide: Old Database (184 tables) → New Database (50 tables)

## Overview

You have an **existing database with 184 tables** (old setup) and need to migrate to the **new streamlined 50-table setup**. This guide provides two approaches:

## Option 1: Fresh Start (Recommended for Development)

### Step 1: Backup Your Data
```sql
-- In Supabase SQL Editor, export important data
-- Stories
SELECT * FROM stories;
-- User profiles
SELECT * FROM user_profiles;
-- Any other critical data
```

### Step 2: Create New Database
1. Go to Supabase Dashboard → Settings → Database
2. Create a new project OR reset the current database
3. Run the initialization scripts in order:

```bash
# Order matters!
1. init.sql                           # Core 20 tables
2. family-and-cultural-features.sql   # Family & cultural 30+ tables
3. achievements-expanded.sql          # Achievement data
4. storage-buckets.sql                # Storage configuration
```

### Step 3: Import Your Data
Use Supabase's import tools or SQL INSERT statements to restore your backed-up data.

---

## Option 2: Incremental Migration (For Production with Existing Data)

### Step 1: Run Migration Fix Script
This adds missing columns to your existing tables without losing data:

```sql
-- Run this FIRST in Supabase SQL Editor
-- File: migration-fix-stories-table.sql
```

This script:
- ✅ Adds missing columns to existing tables
- ✅ Preserves all your existing data
- ✅ Creates necessary indexes
- ✅ Safe to run multiple times (idempotent)

### Step 2: Run Modified Init Script
After running the migration fix, you can run [`init.sql`](init.sql) which will:
- Skip creating tables that already exist (using `IF NOT EXISTS`)
- Add new tables you don't have yet
- Create indexes and policies

### Step 3: Add Family & Cultural Features
```sql
-- Run: family-and-cultural-features.sql
-- This adds 30+ new tables for family collaboration
```

### Step 4: Populate Achievements
```sql
-- Run: achievements-expanded.sql
-- This adds 100+ achievement records
```

---

## Why 184 Tables vs 50 Tables?

### Old Setup (184 tables)
- **~100 Supabase system tables** (auth, storage, realtime, etc.)
- **~50 application tables** (your actual data)
- **~34 legacy/duplicate tables** (old migrations, unused tables)

### New Setup (50 tables)
- **20 core tables** (users, stories, chapters, social features)
- **30+ family/cultural tables** (new features)
- **Clean, organized schema** with no legacy bloat

---

## Comparison: What Changed

### Tables That Stayed (with updates)
| Table | Old | New | Changes |
|-------|-----|-----|---------|
| `user_profiles` | ✅ | ✅ | Added `tier`, `role`, `xp`, `level`, `energy` |
| `stories` | ✅ | ✅ | Added `difficulty`, `tags`, `rating`, `view_count`, `published_at` |
| `chapters` | ✅ | ✅ | Added `word_count`, `is_published` |
| `comments` | ✅ | ✅ | Added `like_count`, `is_edited` |
| `achievements` | ✅ | ✅ | Added `rarity` enum, expanded to 100+ records |

### New Tables Added
- `user_pets` - Pet companion system
- `collections` - Story collections
- `user_badges` - Badge system
- `user_activities` - Activity tracking
- `user_friendships` - Friend system
- `user_reading_lists` - Reading list management
- **30+ family & cultural tables** - See [`family-and-cultural-features.sql`](family-and-cultural-features.sql)

### Tables Removed (Legacy)
The old setup likely had many unused tables from:
- Old migration experiments
- Deprecated features
- Test tables
- Duplicate structures

---

## Migration Checklist

### Pre-Migration
- [ ] Backup all data from Supabase dashboard
- [ ] Export critical tables to CSV
- [ ] Document any custom tables you created
- [ ] Note any custom RLS policies

### Migration
- [ ] Run [`migration-fix-stories-table.sql`](migration-fix-stories-table.sql)
- [ ] Run [`init.sql`](init.sql)
- [ ] Run [`family-and-cultural-features.sql`](family-and-cultural-features.sql)
- [ ] Run [`achievements-expanded.sql`](achievements-expanded.sql)
- [ ] Run [`storage-buckets.sql`](storage-buckets.sql)

### Post-Migration
- [ ] Verify all tables exist: `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'`
- [ ] Check RLS policies are enabled
- [ ] Test authentication flow
- [ ] Test story creation
- [ ] Test family features
- [ ] Verify storage buckets

---

## Troubleshooting

### Error: "column X does not exist"
**Solution**: Run [`migration-fix-stories-table.sql`](migration-fix-stories-table.sql) first

### Error: "relation already exists"
**Solution**: This is normal with `IF NOT EXISTS` - the script will skip existing tables

### Error: "type already exists"
**Solution**: This is normal - the script will skip existing enum types

### Too Many Tables (184)
**Solution**: 
1. Check system tables: `SELECT * FROM information_schema.tables WHERE table_schema NOT IN ('public', 'auth', 'storage')`
2. Drop unused tables manually
3. Or start fresh with a new database

---

## Verification Queries

After migration, run these to verify:

```sql
-- Count application tables (should be ~50)
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- List all your tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check stories table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stories';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Run the verification queries above
3. Check Supabase logs in Dashboard → Database → Logs
4. Ensure you're running scripts in the correct order

## Recommended Approach

For your situation with existing data:
1. ✅ Run [`migration-fix-stories-table.sql`](migration-fix-stories-table.sql) - Fixes existing tables
2. ✅ Run [`init.sql`](init.sql) - Adds missing tables
3. ✅ Run [`family-and-cultural-features.sql`](family-and-cultural-features.sql) - New features
4. ✅ Run [`achievements-expanded.sql`](achievements-expanded.sql) - Achievement data

This preserves your existing data while adding new features!
