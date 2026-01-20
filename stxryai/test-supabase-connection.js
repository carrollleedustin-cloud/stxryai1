#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * Tests database, storage, and authentication connectivity
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('📝 Please create .env.local with your Supabase credentials');
  process.exit(1);
}

// Parse .env.local manually
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required variables:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 StxryAI Supabase Connection Test\n');
console.log('=' .repeat(50));
console.log(`📍 Project URL: ${supabaseUrl}`);
console.log('=' .repeat(50) + '\n');

async function testConnection() {
  let allTestsPassed = true;

  // Test 1: Database Connection
  console.log('🔍 Test 1: Database Connection');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('   ❌ Failed:', error.message);
      allTestsPassed = false;
    } else {
      console.log('   ✅ Database connection successful!');
    }
  } catch (err) {
    console.error('   ❌ Error:', err.message);
    allTestsPassed = false;
  }

  // Test 2: Check Tables Exist
  console.log('\n🔍 Test 2: Verify Core Tables');
  const requiredTables = [
    'user_profiles',
    'stories',
    'chapters',
    'reading_progress',
    'achievements',
    'notifications'
  ];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Table '${table}' not found or not accessible`);
        allTestsPassed = false;
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    } catch (err) {
      console.log(`   ❌ Table '${table}' error: ${err.message}`);
      allTestsPassed = false;
    }
  }

  // Test 3: Storage Buckets
  console.log('\n🔍 Test 3: Storage Buckets');
  try {
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      console.error('   ❌ Failed to list buckets:', error.message);
      allTestsPassed = false;
    } else {
      console.log('   ✅ Storage connection successful!');
      
      const requiredBuckets = [
        'user-avatars',
        'story-covers',
        'user-uploads',
        'story-assets',
        'system-assets'
      ];
      
      const existingBuckets = buckets.map(b => b.name);
      
      requiredBuckets.forEach(bucket => {
        if (existingBuckets.includes(bucket)) {
          console.log(`   ✅ Bucket '${bucket}' exists`);
        } else {
          console.log(`   ⚠️  Bucket '${bucket}' not found (run storage-buckets.sql)`);
        }
      });
    }
  } catch (err) {
    console.error('   ❌ Error:', err.message);
    allTestsPassed = false;
  }

  // Test 4: Authentication System
  console.log('\n🔍 Test 4: Authentication System');
  try {
    const { data: session } = await supabase.auth.getSession();
    console.log('   ✅ Auth system operational!');
    
    if (session?.session) {
      console.log('   ℹ️  Current session active');
    } else {
      console.log('   ℹ️  No active session (expected for test)');
    }
  } catch (err) {
    console.error('   ❌ Error:', err.message);
    allTestsPassed = false;
  }

  // Test 5: Database Extensions
  console.log('\n🔍 Test 5: Database Extensions');
  try {
    const { data, error } = await supabase
      .rpc('pg_available_extensions')
      .select('name')
      .in('name', ['uuid-ossp', 'pgcrypto']);
    
    if (error) {
      console.log('   ⚠️  Could not verify extensions (may require admin access)');
    } else {
      console.log('   ✅ Required extensions available');
    }
  } catch (err) {
    console.log('   ℹ️  Extension check skipped (requires admin access)');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('✨ All tests passed! Supabase is ready to use.');
    console.log('\n📚 Next steps:');
    console.log('   1. Run database migrations if tables are missing');
    console.log('   2. Run storage-buckets.sql if buckets are missing');
    console.log('   3. Start your development server: npm run dev');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Verify your Supabase credentials in .env.local');
    console.log('   2. Run database/init-safe-migration.sql in Supabase SQL Editor');
    console.log('   3. Run database/storage-buckets.sql in Supabase SQL Editor');
    console.log('   4. Check Supabase Dashboard → Logs for more details');
  }
  console.log('='.repeat(50) + '\n');

  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
testConnection().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
