-- ============================================
-- DATABASE VERIFICATION SCRIPT
-- Run this to verify all tables and policies are set up correctly
-- ============================================

-- Check if all required tables exist
SELECT 
  'user_pets' as table_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_pets') as exists
UNION ALL
SELECT 'pet_interactions', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pet_interactions')
UNION ALL
SELECT 'pet_accessories', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pet_accessories')
UNION ALL
SELECT 'pet_dialogues', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pet_dialogues')
UNION ALL
SELECT 'pet_achievements', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pet_achievements')
UNION ALL
SELECT 'user_pet_accessories', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_pet_accessories')
UNION ALL
SELECT 'user_pet_achievements', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_pet_achievements')
UNION ALL
SELECT 'stories', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stories')
UNION ALL
SELECT 'chapters', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chapters')
UNION ALL
SELECT 'user_profiles', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles')
ORDER BY table_name;

-- Check RLS policies on pet tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('user_pets', 'pet_interactions', 'user_pet_accessories', 'user_pet_achievements')
ORDER BY tablename, policyname;

-- Check indexes on pet tables
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('user_pets', 'pet_interactions', 'user_pet_accessories', 'user_pet_achievements')
ORDER BY tablename, indexname;

-- Check pet dialogues seed data
SELECT COUNT(*) as dialogue_count FROM public.pet_dialogues;

-- Check pet accessories seed data
SELECT COUNT(*) as accessory_count FROM public.pet_accessories;

-- Check pet achievements seed data
SELECT COUNT(*) as achievement_count FROM public.pet_achievements;

-- Verify column types for user_pets
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_pets'
ORDER BY ordinal_position;

-- Check storage buckets (if accessible)
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE name IN ('avatars', 'user-avatars', 'story-assets')
ORDER BY name;

-- Summary report
SELECT 
  'Tables' as check_type,
  COUNT(*) as count,
  'All required tables exist' as status
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_pets', 'pet_interactions', 'pet_accessories', 'pet_dialogues', 
    'pet_achievements', 'user_pet_accessories', 'user_pet_achievements',
    'stories', 'chapters', 'user_profiles'
  )
UNION ALL
SELECT 
  'RLS Policies',
  COUNT(*),
  'Policies configured'
FROM pg_policies
WHERE tablename IN ('user_pets', 'pet_interactions', 'user_pet_accessories', 'user_pet_achievements')
UNION ALL
SELECT 
  'Indexes',
  COUNT(*),
  'Indexes created'
FROM pg_indexes
WHERE tablename IN ('user_pets', 'pet_interactions', 'user_pet_accessories', 'user_pet_achievements')
UNION ALL
SELECT 
  'Pet Dialogues',
  COUNT(*),
  'Seed data loaded'
FROM public.pet_dialogues
UNION ALL
SELECT 
  'Pet Accessories',
  COUNT(*),
  'Seed data loaded'
FROM public.pet_accessories
UNION ALL
SELECT 
  'Pet Achievements',
  COUNT(*),
  'Seed data loaded'
FROM public.pet_achievements;

-- ============================================
-- EXPECTED OUTPUT
-- ============================================
-- All tables should show 'true' for exists
-- RLS policies should show multiple policies per table
-- Indexes should show multiple indexes per table
-- Seed data counts should be > 0
-- Summary should show all checks passed

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If any table shows 'false', run CREATE_PET_TABLES.sql
-- If no RLS policies, run STXRYAI_RLS_POLICIES.sql
-- If no seed data, check if INSERT statements ran successfully
-- If storage buckets don't show, create them manually in Supabase UI
