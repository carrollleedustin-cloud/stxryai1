/**
 * Database Population Script
 * Populates the database with seed stories
 * Run with: ts-node scripts/populate-stories.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getOrCreateAdminUser() {
  console.log('🔍 Looking for admin user...');

  // Try to find existing admin user
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', 'stxryai_admin')
    .limit(1);

  if (error) {
    console.error('❌ Error finding admin user:', error);
    throw error;
  }

  if (users && users.length > 0) {
    console.log('✅ Found existing admin user:', users[0].id);
    return users[0].id;
  }

  console.log('📝 Admin user not found. Please create one manually or use an existing user ID.');
  console.log('You can get a user ID from your Supabase dashboard: Authentication > Users');

  const firstUser = await supabase.from('users').select('id').limit(1).single();

  if (firstUser.data) {
    console.log('Using first available user:', firstUser.data.id);
    return firstUser.data.id;
  }

  throw new Error('No users found in database. Please create a user first.');
}

async function populateStories(userId: string) {
  console.log('📚 Starting to populate stories...\n');

  const stories = [
    // Children's Stories
    {
      id: 'c1000000-0000-0000-0000-000000000001',
      title: 'The Magic Treehouse Mystery',
      description:
        'Join Luna and Max as they discover a magical treehouse in their backyard that transports them to different worlds! Perfect for young readers learning to make choices.',
      genre: "Children's Adventure",
      difficulty: 'easy',
      tags: ['kids', 'magic', 'adventure', 'animals', 'educational'],
      is_published: true,
      rating: 4.8,
      rating_count: 234,
      view_count: 1247,
      chapter_count: 5,
      word_count: 850,
      chapters: [
        {
          title: 'The Mysterious Door',
          content: `Luna and Max were playing in their backyard when they noticed something strange. Behind the old oak tree, there was a tiny door they had never seen before!

"Look, Max!" Luna pointed. "That door wasn't there yesterday!"

Max walked closer, his eyes wide with wonder. The door was painted bright blue and had a tiny golden doorknob. It was just big enough for them to fit through.

"Should we knock?" Max asked.

Luna thought for a moment. She was the older sister and wanted to be brave.

What should they do?`,
          chapter_number: 1,
          word_count: 85,
        },
      ],
    },
    {
      id: 'c1000000-0000-0000-0000-000000000002',
      title: 'Benny the Brave Bunny',
      description:
        'Benny is a little bunny who is afraid of the dark. Follow his journey as he learns to be brave with help from his forest friends!',
      genre: "Children's Educational",
      difficulty: 'easy',
      tags: ['kids', 'animals', 'emotions', 'friendship', 'learning'],
      is_published: true,
      rating: 4.9,
      rating_count: 456,
      view_count: 2103,
      chapter_count: 4,
      word_count: 720,
      chapters: [],
    },

    // Middle Grade
    {
      id: 'c2000000-0000-0000-0000-000000000001',
      title: 'The Secret of Willow Creek',
      description:
        "When strange things start happening in the small town of Willow Creek, 12-year-old detective Sophie Chen must solve the mystery before it's too late!",
      genre: 'Mystery',
      difficulty: 'medium',
      tags: ['mystery', 'detective', 'middle-grade', 'puzzle', 'adventure'],
      is_published: true,
      rating: 4.7,
      rating_count: 892,
      view_count: 4521,
      chapter_count: 8,
      word_count: 3400,
      chapters: [],
    },

    // Young Adult
    {
      id: 'c3000000-0000-0000-0000-000000000001',
      title: 'Echoes of the Shattered Realm',
      description:
        'In a world where magic is dying, 16-year-old Aria must choose between saving her kingdom or discovering the truth about her mysterious past.',
      genre: 'Fantasy',
      difficulty: 'medium',
      tags: ['fantasy', 'magic', 'ya', 'coming-of-age', 'epic'],
      is_published: true,
      rating: 4.9,
      rating_count: 3247,
      view_count: 15678,
      chapter_count: 12,
      word_count: 8900,
      chapters: [],
    },
    {
      id: 'c3000000-0000-0000-0000-000000000002',
      title: 'Neon Nights: 2084',
      description:
        'In Neo-Tokyo 2084, teenage hacker Kai discovers a conspiracy that could bring down the megacorporations controlling the city. But can he trust his new allies?',
      genre: 'Cyberpunk',
      difficulty: 'hard',
      tags: ['cyberpunk', 'sci-fi', 'hacking', 'dystopia', 'action'],
      is_published: true,
      rating: 4.6,
      rating_count: 2134,
      view_count: 9876,
      chapter_count: 10,
      word_count: 7200,
      chapters: [],
    },

    // Adult Fiction
    {
      id: 'c4000000-0000-0000-0000-000000000001',
      title: 'Coffee Shop Chronicles',
      description:
        'Emma, a struggling writer, finds unexpected romance when she meets Alex, a mysterious regular at her favorite coffee shop. But both are hiding secrets that could tear them apart.',
      genre: 'Romance',
      difficulty: 'medium',
      tags: ['romance', 'contemporary', 'sweet', 'coffee', 'writer'],
      is_published: true,
      rating: 4.8,
      rating_count: 5621,
      view_count: 23456,
      chapter_count: 15,
      word_count: 12000,
      chapters: [],
    },
    {
      id: 'c4000000-0000-0000-0000-000000000002',
      title: 'The Last Witness',
      description:
        'Detective Sarah Morgan has 48 hours to find the only witness to a murder before the killer does. Every choice matters. Every second counts.',
      genre: 'Thriller',
      difficulty: 'hard',
      tags: ['thriller', 'mystery', 'detective', 'suspense', 'crime'],
      is_published: true,
      rating: 4.7,
      rating_count: 4892,
      view_count: 19234,
      chapter_count: 14,
      word_count: 11500,
      chapters: [],
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const storyData of stories) {
    try {
      // Extract chapters before inserting story
      const { chapters, ...storyOnly } = storyData;

      // Insert story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          ...storyOnly,
          user_id: userId,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (storyError) {
        console.error(`❌ Error creating story "${storyData.title}":`, storyError.message);
        errorCount++;
        continue;
      }

      console.log(`✅ Created story: "${storyData.title}"`);

      // Insert chapters if any
      if (chapters && chapters.length > 0) {
        for (const chapterData of chapters) {
          const { error: chapterError } = await supabase.from('chapters').insert({
            story_id: story.id,
            ...chapterData,
            is_published: true,
          });

          if (chapterError) {
            console.error(
              `   ❌ Error creating chapter "${chapterData.title}":`,
              chapterError.message
            );
          } else {
            console.log(`   ✅ Created chapter: "${chapterData.title}"`);
          }
        }
      }

      successCount++;
    } catch (err: any) {
      console.error(`❌ Error processing story "${storyData.title}":`, err.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully created: ${successCount} stories`);
  console.log(`   ❌ Failed: ${errorCount} stories`);
}

async function main() {
  try {
    console.log('🚀 StxryAI Database Population Script\n');
    console.log('📡 Connecting to Supabase...');

    const userId = await getOrCreateAdminUser();
    console.log('');

    await populateStories(userId);

    console.log('\n✨ Database population complete!');
    console.log('🌐 Visit your StxryAI platform to see the new stories!\n');
  } catch (error: any) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main();
