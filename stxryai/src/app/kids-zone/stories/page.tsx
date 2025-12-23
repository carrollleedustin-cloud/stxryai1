'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard, MagicStoryCard } from '@/components/nebula/MagicCard';
import { MagicButton } from '@/components/nebula/MagicButton';
import { MagicText } from '@/components/nebula/NebulaText';
import { MagicTopBar } from '@/components/nebula/MagicNav';

/**
 * KIDS ZONE - STORIES PAGE
 * Browse and discover amazing stories!
 */

const allStories = [
  // Dragons
  { id: '1', title: 'The Dragon Who Lost His Fire', author: 'Sarah Wonder', ageRange: '5-8', duration: '10 min', category: 'dragons', isNew: true, isFeatured: true },
  { id: '2', title: 'Ember and the Crystal Cave', author: 'Tom Fire', ageRange: '6-9', duration: '15 min', category: 'dragons', isNew: false },
  { id: '3', title: 'The Friendly Dragon School', author: 'Lucy Flame', ageRange: '4-7', duration: '8 min', category: 'dragons', isNew: true },
  
  // Space
  { id: '4', title: 'Princess Astro Goes to Space', author: 'Mike Stars', ageRange: '4-7', duration: '8 min', category: 'space', isNew: false, isFeatured: true },
  { id: '5', title: 'The Moon Rabbit\'s Adventure', author: 'Luna Silver', ageRange: '5-8', duration: '12 min', category: 'space', isNew: true },
  { id: '6', title: 'Robot Friends on Mars', author: 'Zack Zero', ageRange: '6-9', duration: '14 min', category: 'space', isNew: false },
  
  // Fairy Tales
  { id: '7', title: 'The Magical Garden', author: 'Emma Green', ageRange: '6-9', duration: '12 min', category: 'fairytales', isNew: true },
  { id: '8', title: 'The Princess and the Unicorn', author: 'Rose Gold', ageRange: '4-7', duration: '10 min', category: 'fairytales', isNew: false },
  { id: '9', title: 'Fairy Forest Friends', author: 'Lily Wing', ageRange: '5-8', duration: '9 min', category: 'fairytales', isNew: false },
  
  // Heroes
  { id: '10', title: 'Super Sam Saves the Day', author: 'Max Power', ageRange: '5-8', duration: '11 min', category: 'heroes', isNew: true },
  { id: '11', title: 'The Brave Little Hero', author: 'Alex Strong', ageRange: '4-7', duration: '8 min', category: 'heroes', isNew: false },
  { id: '12', title: 'Captain Kindness', author: 'Joy Heart', ageRange: '6-9', duration: '13 min', category: 'heroes', isNew: true },
  
  // Animals
  { id: '13', title: 'The Curious Kitten', author: 'Paws Pet', ageRange: '3-6', duration: '6 min', category: 'animals', isNew: false },
  { id: '14', title: 'Bunny\'s Big Day', author: 'Hop Happy', ageRange: '4-7', duration: '7 min', category: 'animals', isNew: true },
  { id: '15', title: 'Jungle Friends Forever', author: 'Wild Will', ageRange: '5-8', duration: '12 min', category: 'animals', isNew: false },
  
  // Adventure
  { id: '16', title: 'Robot Best Friends', author: 'Tom Tech', ageRange: '5-8', duration: '15 min', category: 'adventure', isNew: false, isFeatured: true },
  { id: '17', title: 'The Treasure Map Mystery', author: 'Jack Quest', ageRange: '6-9', duration: '14 min', category: 'adventure', isNew: true },
  { id: '18', title: 'The Enchanted Treehouse', author: 'Oak Wood', ageRange: '5-8', duration: '11 min', category: 'adventure', isNew: false },
];

const categories = [
  { id: 'all', emoji: '✨', label: 'All Stories', color: '#9b5de5' },
  { id: 'dragons', emoji: '🐉', label: 'Dragons', color: '#ff6b6b' },
  { id: 'space', emoji: '🚀', label: 'Space', color: '#5f27cd' },
  { id: 'fairytales', emoji: '🧚', label: 'Fairy Tales', color: '#f15bb5' },
  { id: 'heroes', emoji: '🦸', label: 'Heroes', color: '#00bbf9' },
  { id: 'animals', emoji: '🐾', label: 'Animals', color: '#fee440' },
  { id: 'adventure', emoji: '🏰', label: 'Adventure', color: '#00f5d4' },
];

const sortOptions = [
  { id: 'newest', label: '✨ Newest' },
  { id: 'popular', label: '🔥 Popular' },
  { id: 'shortest', label: '⏱️ Quick Reads' },
  { id: 'longest', label: '📖 Long Stories' },
];

export default function KidsZoneStoriesPage() {
  const [coins] = useState(150);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = allStories
    .filter(story => {
      if (selectedCategory !== 'all' && story.category !== selectedCategory) return false;
      if (searchQuery && !story.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return a.isNew ? -1 : 1;
      if (sortBy === 'shortest') return parseInt(a.duration) - parseInt(b.duration);
      if (sortBy === 'longest') return parseInt(b.duration) - parseInt(a.duration);
      return 0;
    });

  const featuredStories = allStories.filter(s => s.isFeatured);

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <MagicTopBar showCoins={coins} />
      
      <div className="mt-20">
        {/* Header */}
        <section className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 
              className="text-4xl sm:text-5xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-kids)' }}
            >
              <MagicText>Story Library</MagicText>
            </h1>
            <p className="text-lg text-white/70">
              Discover amazing adventures! 📚
            </p>
          </motion.div>
        </section>

        {/* Search Bar */}
        <section className="mb-6">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search for stories..."
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </section>

        {/* Featured Stories */}
        {selectedCategory === 'all' && !searchQuery && (
          <section className="mb-10">
            <h2 
              className="text-2xl font-bold mb-4 text-white"
              style={{ fontFamily: 'var(--font-kids)' }}
            >
              ⭐ Featured Stories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredStories.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <MagicCard color="rainbow" sparkles>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl mb-3">
                        {categories.find(c => c.id === story.category)?.emoji}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-kids)' }}>
                        {story.title}
                      </h3>
                      <p className="text-sm text-white/50 mb-2">{story.author}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                          Ages {story.ageRange}
                        </span>
                        <span className="text-white/40">📚 {story.duration}</span>
                      </div>
                      <MagicButton size="sm" className="mt-3">
                        Read Now ▶️
                      </MagicButton>
                    </div>
                  </MagicCard>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                style={{
                  background: selectedCategory === cat.id ? cat.color : undefined,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="font-medium">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Sort Options */}
        <section className="mb-6">
          <div className="flex gap-2">
            {sortOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sortBy === option.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Stories Grid */}
        <section className="mb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + sortBy + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            >
              {filteredStories.length > 0 ? (
                filteredStories.map((story, i) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <MagicStoryCard
                      title={story.title}
                      author={story.author}
                      ageRange={story.ageRange}
                      duration={story.duration}
                      isNew={story.isNew}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-white mb-2">No stories found</h3>
                  <p className="text-white/50">Try a different search or category!</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

