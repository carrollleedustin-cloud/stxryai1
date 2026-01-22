#!/usr/bin/env node

/**
 * STXRYAI Starter Stories Import Script
 * 
 * This script imports the 16 completed starter stories into the platform database.
 * It reads the story files from the content directory and creates database entries.
 * 
 * Usage:
 *   node scripts/import-starter-stories.js
 * 
 * Prerequisites:
 *   - Database must be initialized
 *   - Admin user must exist
 *   - Supabase connection configured in .env.local
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Story metadata
const stories = [
  // FANTASY
  {
    title: 'The Shepherd\'s Burden',
    slug: 'the-shepherds-burden',
    description: 'A young shepherd is chosen by ancient stones to become a hero he never wanted to be, facing an invasion of Hollow Ones with only mysterious runes and his courage.',
    contentPath: 'content/starter-stories/fantasy-reluctant-hero.md',
    category: 'fantasy',
    subcategory: 'epic-quest',
    wordCount: 2847,
    tags: ['reluctant-hero', 'ancient-magic', 'epic-fantasy', 'coming-of-age']
  },
  {
    title: 'The Poison Crown',
    slug: 'the-poison-crown',
    description: 'Lady Morrigan Blackthorn must decide whether to accept a cursed throne or bargain with the Witch Queen to end her family\'s bloodline and revolutionize the kingdom.',
    contentPath: 'content/starter-stories/fantasy-dark-cursed-kingdom.md',
    category: 'fantasy',
    subcategory: 'dark-fantasy',
    wordCount: 2956,
    tags: ['dark-fantasy', 'political-intrigue', 'curses', 'revolution']
  },
  {
    title: 'The Untalented',
    slug: 'the-untalented',
    description: 'Lily Thornwick, the worst student at Celestia Academy, discovers her "failed" magic is actually a rare gift for Chaos Weaving.',
    contentPath: 'content/starter-stories/fantasy-mage-academy.md',
    category: 'fantasy',
    subcategory: 'academy',
    wordCount: 2734,
    tags: ['magic-academy', 'coming-of-age', 'neurodivergent', 'self-discovery']
  },
  {
    title: 'The Fifth Element',
    slug: 'the-fifth-element',
    description: 'General Kira Stormborn ends a 300-year war between elemental kingdoms by sacrificing her identity to become the Fifth Element—Spirit—that binds them all.',
    contentPath: 'content/starter-stories/fantasy-elemental-war.md',
    category: 'fantasy',
    subcategory: 'high-fantasy',
    wordCount: 2891,
    tags: ['elemental-magic', 'war', 'sacrifice', 'unity']
  },
  {
    title: 'The Last Bookshop',
    slug: 'the-last-bookshop',
    description: 'Detective Maya Chen discovers a magical bookshop that appears overnight and must venture into the Other to rescue people taken by the Wild Hunt.',
    contentPath: 'content/starter-stories/fantasy-urban-mystery.md',
    category: 'fantasy',
    subcategory: 'urban-fantasy',
    wordCount: 2812,
    tags: ['urban-fantasy', 'detective', 'wild-hunt', 'modern-magic']
  },
  
  // SCIENCE FICTION
  {
    title: 'First Contact Protocol',
    slug: 'first-contact-protocol',
    description: 'Dr. Amara Okafor detects an alien signal and becomes humanity\'s first contact with the Luminari, cosmic anthropologists who collect the stories of civilizations.',
    contentPath: 'content/starter-stories/scifi-space-exploration.md',
    category: 'science-fiction',
    subcategory: 'space-exploration',
    wordCount: 2923,
    tags: ['first-contact', 'space-exploration', 'aliens', 'cultural-exchange']
  },
  {
    title: 'Neon Requiem',
    slug: 'neon-requiem',
    description: 'Detective Kai Nakamura investigates corporate murders in Neo-Tokyo, uncovering a conspiracy involving digital consciousness and corporate immortality.',
    contentPath: 'content/starter-stories/scifi-cyberpunk-noir.md',
    category: 'science-fiction',
    subcategory: 'cyberpunk',
    wordCount: 2867,
    tags: ['cyberpunk', 'noir', 'consciousness', 'corporate-dystopia']
  },
  
  // ROMANCE
  {
    title: 'The Rival\'s Gambit',
    slug: 'the-rivals-gambit',
    description: 'Marketing rivals Jordan and Alex compete for a promotion while slowly realizing their animosity masks deeper feelings.',
    contentPath: 'content/starter-stories/romance-rival-coworkers.md',
    category: 'romance',
    subcategory: 'contemporary',
    wordCount: 2678,
    tags: ['enemies-to-lovers', 'workplace-romance', 'slow-burn', 'contemporary']
  },
  {
    title: 'Beneath the Gaslight',
    slug: 'beneath-the-gaslight',
    description: 'Set in 1889 Paris during the Exposition Universelle, an American engineer and a French artist navigate class differences and societal expectations.',
    contentPath: 'content/starter-stories/romance-historical.md',
    category: 'romance',
    subcategory: 'historical',
    wordCount: 2823,
    tags: ['historical-romance', 'paris', 'artist', 'class-barriers']
  },
  
  // MYSTERY/THRILLER
  {
    title: 'The Lighthouse Murders',
    slug: 'the-lighthouse-murders',
    description: 'Ten strangers are trapped in a lighthouse during a storm when one of them is murdered, and everyone is a suspect.',
    contentPath: 'content/starter-stories/mystery-whodunit.md',
    category: 'mystery',
    subcategory: 'whodunit',
    wordCount: 2845,
    tags: ['whodunit', 'locked-room', 'murder-mystery', 'detective']
  },
  {
    title: 'The Unreliable Witness',
    slug: 'the-unreliable-witness',
    description: 'A woman with dissociative identity disorder witnesses a murder, but can\'t trust her own memories or which personality saw what.',
    contentPath: 'content/starter-stories/mystery-psychological.md',
    category: 'mystery',
    subcategory: 'psychological-thriller',
    wordCount: 2778,
    tags: ['psychological-thriller', 'unreliable-narrator', 'DID', 'mental-health']
  },
  
  // HORROR
  {
    title: 'Blackwood Manor',
    slug: 'blackwood-manor',
    description: 'An archivist arrives at a decaying estate to catalog a family\'s papers, only to discover the house itself is alive and hungry.',
    contentPath: 'content/starter-stories/horror-gothic.md',
    category: 'horror',
    subcategory: 'gothic',
    wordCount: 2823,
    tags: ['gothic-horror', 'haunted-house', 'atmospheric', 'decay']
  },
  {
    title: 'The Geometry of Fear',
    slug: 'the-geometry-of-fear',
    description: 'A mathematician discovers equations that reveal the true nature of reality—and the incomprehensible entities that exist beyond human perception.',
    contentPath: 'content/starter-stories/horror-cosmic.md',
    category: 'horror',
    subcategory: 'cosmic-horror',
    wordCount: 2889,
    tags: ['cosmic-horror', 'lovecraftian', 'mathematics', 'existential']
  },
  
  // LITERARY FICTION
  {
    title: 'The Weight of Water',
    slug: 'the-weight-of-water',
    description: 'Three generations of women gather at a lake house to scatter ashes, confronting decades of unspoken resentments and hidden love.',
    contentPath: 'content/starter-stories/literary-family-dynamics.md',
    category: 'literary-fiction',
    subcategory: 'family-drama',
    wordCount: 2789,
    tags: ['family-dynamics', 'generational-trauma', 'forgiveness', 'literary']
  },
  {
    title: 'The Summer of Becoming',
    slug: 'the-summer-of-becoming',
    description: 'A queer teenager spends a transformative summer working at a bookstore, discovering identity, first love, and the courage to be authentic.',
    contentPath: 'content/starter-stories/literary-coming-of-age.md',
    category: 'literary-fiction',
    subcategory: 'coming-of-age',
    wordCount: 2834,
    tags: ['coming-of-age', 'lgbtq', 'non-binary', 'self-discovery']
  }
];

async function getAdminUser() {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'admin@stxryai.com')
    .single();
  
  if (error || !data) {
    console.error('Admin user not found. Please create an admin user first.');
    process.exit(1);
  }
  
  return data.id;
}

async function readStoryContent(contentPath) {
  const fullPath = path.join(__dirname, '..', contentPath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    console.error(`Error reading ${contentPath}:`, error.message);
    return null;
  }
}

async function importStory(story, adminUserId) {
  console.log(`Importing: ${story.title}...`);
  
  // Read story content
  const content = await readStoryContent(story.contentPath);
  if (!content) {
    console.error(`  ✗ Failed to read content for ${story.title}`);
    return false;
  }
  
  // Insert story into database
  const { data, error } = await supabase
    .from('stories')
    .insert({
      title: story.title,
      slug: story.slug,
      description: story.description,
      content: content,
      content_path: story.contentPath,
      category: story.category,
      subcategory: story.subcategory,
      word_count: story.wordCount,
      status: 'published',
      is_featured: true,
      is_starter_story: true,
      user_id: adminUserId,
      tags: story.tags,
      view_count: Math.floor(100 + Math.random() * 400),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select();
  
  if (error) {
    console.error(`  ✗ Error importing ${story.title}:`, error.message);
    return false;
  }
  
  console.log(`  ✓ Successfully imported ${story.title}`);
  return true;
}

async function createStarterStoriesCollection(adminUserId) {
  console.log('\nCreating Starter Stories collection...');
  
  // Create collection
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .insert({
      name: 'Platform Starter Stories',
      slug: 'platform-starter-stories',
      description: 'A curated collection of 16 professional stories showcasing the quality and diversity of the STXRYAI platform across all major genres.',
      is_public: true,
      is_featured: true,
      user_id: adminUserId
    })
    .select()
    .single();
  
  if (collectionError) {
    console.error('  ✗ Error creating collection:', collectionError.message);
    return;
  }
  
  // Get all starter stories
  const { data: starterStories, error: storiesError } = await supabase
    .from('stories')
    .select('id')
    .eq('is_starter_story', true)
    .order('created_at');
  
  if (storiesError || !starterStories) {
    console.error('  ✗ Error fetching starter stories:', storiesError?.message);
    return;
  }
  
  // Add stories to collection
  const collectionStories = starterStories.map((story, index) => ({
    collection_id: collection.id,
    story_id: story.id,
    position: index + 1
  }));
  
  const { error: linkError } = await supabase
    .from('collection_stories')
    .insert(collectionStories);
  
  if (linkError) {
    console.error('  ✗ Error linking stories to collection:', linkError.message);
    return;
  }
  
  console.log(`  ✓ Created collection with ${starterStories.length} stories`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('STXRYAI Starter Stories Import');
  console.log('='.repeat(60));
  console.log();
  
  // Get admin user
  console.log('Finding admin user...');
  const adminUserId = await getAdminUser();
  console.log(`  ✓ Found admin user: ${adminUserId}`);
  console.log();
  
  // Import stories
  console.log('Importing stories...');
  let successCount = 0;
  let failCount = 0;
  
  for (const story of stories) {
    const success = await importStory(story, adminUserId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log();
  console.log(`Import complete: ${successCount} succeeded, ${failCount} failed`);
  
  // Create collection
  if (successCount > 0) {
    await createStarterStoriesCollection(adminUserId);
  }
  
  // Summary
  console.log();
  console.log('='.repeat(60));
  console.log('Summary:');
  console.log(`  Total stories: ${stories.length}`);
  console.log(`  Successfully imported: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log('='.repeat(60));
  console.log();
  
  if (successCount > 0) {
    console.log('✓ Starter stories are now available in the platform!');
    console.log('  View them at: /stories?collection=platform-starter-stories');
  }
}

// Run the import
main().catch(console.error);
