#!/usr/bin/env node

/**
 * Direct SQL Setup Script for StxryAI
 * Runs database setup directly using PostgreSQL connection
 */

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

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

const connectionString = env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env.local');
  console.log('Make sure you have the correct DATABASE_URL from Supabase Dashboard → Settings → Database');
  process.exit(1);
}

console.log('🚀 StxryAI Direct SQL Setup');
console.log('=' .repeat(50));
console.log(`📍 Connecting to: ${connectionString.split('@')[1]?.split('/')[0] || 'database'}`);
console.log('=' .repeat(50) + '\n');

const sql = postgres(connectionString);

async function runSetup() {
  try {
    console.log('🔍 Checking current database state...\n');

    // Check existing tables
    const tables = await sql`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('📊 Existing tables:');
    tables.forEach(table => console.log(`   - ${table.tablename}`));
    console.log('');

    // Check existing buckets
    const buckets = await sql`
      SELECT id, name, public FROM storage.buckets
      ORDER BY name
    `;

    console.log('📦 Existing storage buckets:');
    if (buckets.length === 0) {
      console.log('   - No buckets found');
    } else {
      buckets.forEach(bucket => console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`));
    }
    console.log('');

    // Create reading_progress table if missing
    const hasReadingProgress = tables.some(t => t.tablename === 'reading_progress');
    if (!hasReadingProgress) {
      console.log('📝 Creating reading_progress table...');
      await sql`
        CREATE TABLE reading_progress (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
          story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
          chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
          progress_percentage INTEGER DEFAULT 0,
          last_read_position INTEGER DEFAULT 0,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, story_id)
        )
      `;

      await sql`CREATE INDEX idx_reading_progress_user ON reading_progress(user_id)`;
      await sql`CREATE INDEX idx_reading_progress_story ON reading_progress(story_id)`;
      await sql`ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY`;

      console.log('✅ reading_progress table created');
    } else {
      console.log('ℹ️ reading_progress table already exists');
    }

    // Create storage buckets if missing
    const requiredBuckets = [
      { id: 'user-avatars', name: 'user-avatars', public: true, size: 5242880, mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
      { id: 'story-covers', name: 'story-covers', public: true, size: 10485760, mimes: ['image/jpeg', 'image/png', 'image/webp'] },
      { id: 'user-uploads', name: 'user-uploads', public: false, size: 52428800, mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
      { id: 'story-assets', name: 'story-assets', public: false, size: 20971520, mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm'] },
      { id: 'system-assets', name: 'system-assets', public: true, size: 104857600, mimes: null }
    ];

    console.log('\n📦 Creating storage buckets...');

    for (const bucket of requiredBuckets) {
      const exists = buckets.some(b => b.id === bucket.id);
      if (!exists) {
        await sql`
          INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
          VALUES (${bucket.id}, ${bucket.name}, ${bucket.public}, ${bucket.size}, ${bucket.mimes})
          ON CONFLICT (id) DO NOTHING
        `;
        console.log(`✅ Created bucket: ${bucket.name}`);
      } else {
        console.log(`ℹ️ Bucket already exists: ${bucket.name}`);
      }
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ reading_progress table ready');
    console.log('   ✅ All storage buckets created');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run: node test-supabase-connection.js');
    console.log('   2. Start: npm run dev');
    console.log('   3. Test file uploads and user registration');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check DATABASE_URL in .env.local');
    console.log('   2. Verify Supabase project is active');
    console.log('   3. Check database password is correct');
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runSetup();