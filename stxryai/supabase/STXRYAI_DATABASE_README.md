# StxryAI Database Setup Guide

## 📁 Files Overview

The complete database schema is split into organized parts for easier management:

| File | Description | Size |
|------|-------------|------|
| `STXRYAI_MASTER_SETUP.sql` | Extensions, ENUM types, helper functions | ~30KB |
| `STXRYAI_MASTER_SETUP_PART2.sql` | Core tables (users, stories, chapters, progress) | ~35KB |
| `STXRYAI_MASTER_SETUP_PART3.sql` | Gamification, social, community features | ~40KB |
| `STXRYAI_MASTER_SETUP_PART4.sql` | Monetization, AI/narrative engine | ~50KB |
| `STXRYAI_MASTER_SETUP_PART5.sql` | Advanced features, indexes, functions | ~45KB |
| `STXRYAI_RLS_POLICIES.sql` | Row Level Security policies | ~15KB |

## 🚀 Fresh Installation

Run these files **in order** in your Supabase SQL editor or via psql:

```bash
# Option 1: Supabase Dashboard
# Go to SQL Editor → New Query → Paste each file in order

# Option 2: Command line (if you have direct access)
psql -h your-host -U postgres -d postgres -f STXRYAI_MASTER_SETUP.sql
psql -h your-host -U postgres -d postgres -f STXRYAI_MASTER_SETUP_PART2.sql
psql -h your-host -U postgres -d postgres -f STXRYAI_MASTER_SETUP_PART3.sql
psql -h your-host -U postgres -d postgres -f STXRYAI_MASTER_SETUP_PART4.sql
psql -h your-host -U postgres -d postgres -f STXRYAI_MASTER_SETUP_PART5.sql
psql -h your-host -U postgres -d postgres -f STXRYAI_RLS_POLICIES.sql
```

## 📋 Feature Summary

### Part 1: Foundation
- PostgreSQL extensions (uuid-ossp, pg_trgm, pgcrypto)
- 25+ custom ENUM types for type safety
- Helper functions for timestamps, validation

### Part 2: Core Tables
- **Users**: profiles, preferences, levels, stats
- **Stories**: main table, chapters, choices, templates
- **Progress**: reading progress, bookmarks, activities

### Part 3: Engagement
- **Gamification**: achievements, badges, streaks, challenges, goals
- **Social**: reviews, likes, comments, friendships, leaderboards
- **Community**: clubs, forums, events, mentorship

### Part 4: Advanced
- **Monetization**: wallets, transactions, subscriptions, tips
- **AI Narrative**: series, characters, world elements, arcs
- **Global Stories**: community-driven collaborative stories

### Part 5: Features
- **Analytics**: creator stats, audience insights
- **Collaboration**: drafts, sessions, templates
- **TTS**: voices, audio generation
- **Live Events**: registrations, polls, Q&A
- **Moderation**: AI moderation, flags, queue
- **GDPR**: consents, exports, privacy settings

## 🔒 Security

- Row Level Security (RLS) enabled on all user-facing tables
- Policies ensure users can only access their own data
- Public content (published stories) readable by all
- Admin tables restricted to service role

## 📊 Indexes

All files include appropriate indexes for:
- Primary key lookups
- Foreign key relationships  
- Common query patterns
- Full-text search (GIN indexes)
- JSON/JSONB fields

## 🔄 Updates

When the schema needs updates:
1. Create a new migration in `supabase/migrations/`
2. Update the relevant MASTER_SETUP file
3. Increment the version number in file header

## 📝 Version History

- **v3.0.0** (Dec 23, 2024): Complete consolidated schema with all migrations
- **v2.0.0**: Added monetization, AI narrative engine
- **v1.0.0**: Initial release

## ⚠️ Important Notes

1. **Order matters**: Run files in sequence (Part 1 → 2 → 3 → 4 → 5 → RLS)
2. **Idempotent**: Uses `IF NOT EXISTS` so safe to re-run
3. **Clean install**: For fresh DB, drop all tables first if needed
4. **Backup**: Always backup before running on production

## 🛠️ Troubleshooting

### "Type already exists" error
Types are created with `IF NOT EXISTS` - this should not happen with the current setup.

### "Table already exists" error  
Tables use `IF NOT EXISTS` - safe to ignore if intentionally re-running.

### Foreign key errors
Ensure you run files in order. Part 2 depends on Part 1, etc.

### RLS policy errors
Run `STXRYAI_RLS_POLICIES.sql` last, after all tables exist.


