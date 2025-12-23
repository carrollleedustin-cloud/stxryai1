'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard, MagicStoryCard, MagicAvatar } from '@/components/nebula/MagicCard';
import { MagicButton } from '@/components/nebula/MagicButton';
import { MagicText } from '@/components/nebula/NebulaText';
import { MagicTopBar } from '@/components/nebula/MagicNav';

/**
 * KIDS ZONE HOME PAGE
 * Where imagination comes to play!
 * A delightful, engaging experience for young readers.
 */

// Sample data
const featuredStories = [
  {
    id: '1',
    title: 'The Dragon Who Lost His Fire',
    cover: '',
    author: 'Sarah Wonder',
    ageRange: '5-8',
    duration: '10 min',
    isNew: true,
  },
  {
    id: '2',
    title: 'Princess Astro Goes to Space',
    cover: '',
    author: 'Mike Stars',
    ageRange: '4-7',
    duration: '8 min',
    isNew: false,
  },
  {
    id: '3',
    title: 'The Magical Garden',
    cover: '',
    author: 'Emma Green',
    ageRange: '6-9',
    duration: '12 min',
    isNew: true,
  },
  {
    id: '4',
    title: 'Robot Best Friends',
    cover: '',
    author: 'Tom Tech',
    ageRange: '5-8',
    duration: '15 min',
    isNew: false,
  },
];

const categories = [
  { emoji: '🐉', label: 'Dragons', color: '#ff6b6b' },
  { emoji: '🚀', label: 'Space', color: '#5f27cd' },
  { emoji: '🧚', label: 'Fairy Tales', color: '#f15bb5' },
  { emoji: '🦸', label: 'Heroes', color: '#00bbf9' },
  { emoji: '🐾', label: 'Animals', color: '#fee440' },
  { emoji: '🏰', label: 'Adventure', color: '#00f5d4' },
];

const achievements = [
  { emoji: '📖', label: 'First Story', unlocked: true },
  { emoji: '⭐', label: '5 Stories', unlocked: true },
  { emoji: '🏆', label: '10 Stories', unlocked: false },
  { emoji: '👑', label: 'Super Reader', unlocked: false },
];

export default function KidsZoneHomePage() {
  const [selectedAvatar] = useState('buddy');
  const [coins] = useState(150);
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top bar with coins */}
      <MagicTopBar 
        showCoins={coins}
        rightAction={
          <motion.button
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
              🧒
            </div>
          </motion.button>
        }
      />
      
      {/* Hero greeting */}
      <section className="mt-20 mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-kids)' }}
          >
            <MagicText>Hello Explorer!</MagicText>
          </h1>
          <p className="text-lg text-white/70">
            Ready for a new adventure? 🌟
          </p>
        </motion.div>
      </section>
      
      {/* Continue Reading */}
      <section className="mb-10">
        <MagicCard color="rainbow" sparkles>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
              📖
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/60 mb-1">Continue your story</p>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-kids)' }}>
                The Dragon Who Lost His Fire
              </h3>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #9b5de5, #f15bb5)' }}
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1">60% complete</p>
            </div>
            <MagicButton size="md" emoji="▶️">
              Play
            </MagicButton>
          </div>
        </MagicCard>
      </section>
      
      {/* Categories */}
      <section className="mb-10">
        <h2 
          className="text-2xl font-bold mb-4 text-white"
          style={{ fontFamily: 'var(--font-kids)' }}
        >
          Explore Stories 🔍
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.label}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl"
              style={{ background: `${cat.color}20`, border: `2px solid ${cat.color}40` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-semibold text-white">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </section>
      
      {/* Featured Stories */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-kids)' }}
          >
            New Stories ✨
          </h2>
          <motion.button
            className="text-sm text-cyan-400 font-semibold"
            whileHover={{ scale: 1.05 }}
          >
            See All →
          </motion.button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredStories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <MagicStoryCard
                title={story.title}
                author={story.author}
                ageRange={story.ageRange}
                duration={story.duration}
                isNew={story.isNew}
              />
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Achievements */}
      <section className="mb-10">
        <h2 
          className="text-2xl font-bold mb-4 text-white"
          style={{ fontFamily: 'var(--font-kids)' }}
        >
          My Achievements 🏆
        </h2>
        
        <MagicCard color="gold">
          <div className="grid grid-cols-4 gap-4">
            {achievements.map((ach, i) => (
              <motion.div
                key={ach.label}
                className="flex flex-col items-center gap-2 text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15, type: 'spring' }}
              >
                <div 
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                    ach.unlocked 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                      : 'bg-white/10 opacity-40'
                  }`}
                  style={{
                    boxShadow: ach.unlocked ? '0 0 20px rgba(254,228,64,0.5)' : 'none',
                  }}
                >
                  {ach.unlocked ? ach.emoji : '🔒'}
                </div>
                <span className="text-xs font-medium text-white/70">{ach.label}</span>
              </motion.div>
            ))}
          </div>
        </MagicCard>
      </section>
      
      {/* Daily Challenge */}
      <section className="mb-24">
        <MagicCard color="cyan">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎯
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-kids)' }}>
                Daily Challenge
              </h3>
              <p className="text-sm text-white/70">Read 2 stories today!</p>
              <p className="text-xs text-cyan-400 mt-1">Reward: 50 ⭐</p>
            </div>
            <MagicButton variant="secondary" size="sm">
              Start!
            </MagicButton>
          </div>
        </MagicCard>
      </section>
    </div>
  );
}


