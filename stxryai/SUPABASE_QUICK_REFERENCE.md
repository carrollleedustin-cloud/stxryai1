# 🚀 SUPABASE QUICK REFERENCE - StxryAI

## 📌 Your Supabase Project

```
Project ID:  kdqgpnbymjzuzdscaiko
Project URL: https://kdqgpnbymjzuzdscaiko.supabase.co
Dashboard:   https://app.supabase.com/project/kdqgpnbymjzuzdscaiko
```

---

## ⚡ Quick Setup (5 Minutes)

### 1. Create Storage Buckets (REQUIRED)

Go to: **Supabase Dashboard → SQL Editor**

Copy and run: [`database/storage-buckets.sql`](./database/storage-buckets.sql)

This creates 5 buckets:
- `user-avatars` (5MB, public)
- `story-covers` (10MB, public)
- `user-uploads` (50MB, private)
- `story-assets` (20MB, conditional)
- `system-assets` (100MB, admin only)

### 2. Verify Setup

```bash
cd stxryai
node test-supabase-connection.js
```

### 3. Start Development

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🔑 API Keys (Already Configured)

Your `.env.local` has:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## 📊 Database Tables

### ✅ Already Created
- `user_profiles` - User accounts
- `stories` - Story content
- `chapters` - Story chapters
- `achievements` - Achievement system
- `notifications` - User notifications

### ⚠️ May Need Migration
- `reading_progress` - Reading tracking

**Fix**: Run [`database/init-safe-migration.sql`](./database/init-safe-migration.sql)

---

## 🔧 Common Tasks

### View Database Tables
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Check Storage Buckets
Dashboard → Storage → Buckets

### View Users
Dashboard → Authentication → Users

### Check Logs
Dashboard → Logs → All logs

---

## 🐛 Troubleshooting

### File Upload Fails
**Cause**: Storage buckets not created  
**Fix**: Run `database/storage-buckets.sql`

### Table Not Found
**Cause**: Migration not run  
**Fix**: Run `database/init-safe-migration.sql`

### Auth Error
**Cause**: Invalid API keys  
**Fix**: Check `.env.local` matches Dashboard → Settings → API

### Connection Timeout
**Cause**: Database paused (free tier)  
**Fix**: Dashboard → Database → Restart

---

## 📚 Full Documentation

- [`SUPABASE_COMPLETE_SETUP_GUIDE.md`](./SUPABASE_COMPLETE_SETUP_GUIDE.md) - Complete guide
- [`SUPABASE_SETUP_STATUS.md`](./SUPABASE_SETUP_STATUS.md) - Current status
- [`COMPLETE_SETUP_GUIDE_2026.md`](./COMPLETE_SETUP_GUIDE_2026.md) - Full platform setup

---

## 🎯 Next Steps

1. ⚠️ **Create storage buckets** (5 min)
2. ✅ Test application (2 min)
3. 🎨 Customize email templates (optional)
4. 🔐 Enable OAuth providers (optional)

---

## 📞 Quick Links

| Resource | URL |
|----------|-----|
| Dashboard | https://app.supabase.com/project/kdqgpnbymjzuzdscaiko |
| SQL Editor | https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/sql |
| Storage | https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/storage/buckets |
| Auth | https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/auth/users |
| API Keys | https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/settings/api |

---

**Status**: 🟡 80% Complete  
**Action**: Create storage buckets  
**Time**: 5 minutes
