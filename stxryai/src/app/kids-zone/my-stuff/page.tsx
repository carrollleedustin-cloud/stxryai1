'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '@/components/nebula/MagicCard';
import { MagicButton } from '@/components/nebula/MagicButton';
import { MagicText } from '@/components/nebula/NebulaText';
import { MagicTopBar } from '@/components/nebula/MagicNav';

/**
 * KIDS ZONE - MY STUFF PAGE
 * Collectibles, achievements, rewards, and personalization!
 */

// ============================================
// BADGES & ACHIEVEMENTS
// ============================================
const allBadges = [
  // Reading Badges
  {
    id: 'first-story',
    emoji: '📖',
    name: 'First Story',
    desc: 'Read your first story!',
    category: 'reading',
    unlocked: true,
    date: '2024-12-20',
  },
  {
    id: 'bookworm',
    emoji: '📚',
    name: 'Bookworm',
    desc: 'Read 5 stories',
    category: 'reading',
    unlocked: true,
    date: '2024-12-21',
  },
  {
    id: 'story-lover',
    emoji: '❤️',
    name: 'Story Lover',
    desc: 'Read 10 stories',
    category: 'reading',
    unlocked: true,
    date: '2024-12-22',
  },
  {
    id: 'story-master',
    emoji: '👑',
    name: 'Story Master',
    desc: 'Read 25 stories',
    category: 'reading',
    unlocked: false,
  },
  {
    id: 'library-legend',
    emoji: '🏛️',
    name: 'Library Legend',
    desc: 'Read 50 stories',
    category: 'reading',
    unlocked: false,
  },
  {
    id: 'story-sage',
    emoji: '🧙',
    name: 'Story Sage',
    desc: 'Read 100 stories',
    category: 'reading',
    unlocked: false,
  },

  // Streak Badges
  {
    id: 'streak-3',
    emoji: '🔥',
    name: 'On Fire!',
    desc: '3 day reading streak',
    category: 'streak',
    unlocked: true,
    date: '2024-12-22',
  },
  {
    id: 'streak-7',
    emoji: '⚡',
    name: 'Week Warrior',
    desc: '7 day reading streak',
    category: 'streak',
    unlocked: false,
  },
  {
    id: 'streak-30',
    emoji: '💎',
    name: 'Diamond Reader',
    desc: '30 day reading streak',
    category: 'streak',
    unlocked: false,
  },

  // Game Badges
  {
    id: 'game-starter',
    emoji: '🎮',
    name: 'Game Starter',
    desc: 'Play your first game',
    category: 'games',
    unlocked: true,
    date: '2024-12-21',
  },
  {
    id: 'quiz-whiz',
    emoji: '🧠',
    name: 'Quiz Whiz',
    desc: 'Get 100% on a quiz',
    category: 'games',
    unlocked: true,
    date: '2024-12-22',
  },
  {
    id: 'memory-master',
    emoji: '🃏',
    name: 'Memory Master',
    desc: 'Win Memory Match in under 15 moves',
    category: 'games',
    unlocked: false,
  },
  {
    id: 'word-wizard',
    emoji: '🔤',
    name: 'Word Wizard',
    desc: 'Get 5 words in a row',
    category: 'games',
    unlocked: false,
  },

  // Special Badges
  {
    id: 'early-bird',
    emoji: '🐦',
    name: 'Early Bird',
    desc: 'Read a story before 8am',
    category: 'special',
    unlocked: false,
  },
  {
    id: 'night-owl',
    emoji: '🦉',
    name: 'Night Owl',
    desc: 'Read a story after 8pm',
    category: 'special',
    unlocked: true,
    date: '2024-12-22',
  },
  {
    id: 'explorer',
    emoji: '🗺️',
    name: 'Explorer',
    desc: 'Try all story categories',
    category: 'special',
    unlocked: false,
  },
  {
    id: 'artist',
    emoji: '🎨',
    name: 'Artist',
    desc: 'Complete 10 drawing prompts',
    category: 'special',
    unlocked: false,
  },
];

// ============================================
// COLLECTIBLE CHARACTERS
// ============================================
const collectibles = [
  // Starter Characters
  {
    id: 'sunny',
    emoji: '☀️',
    name: 'Sunny',
    rarity: 'common',
    unlocked: true,
    desc: 'A cheerful sun friend!',
  },
  {
    id: 'cloudy',
    emoji: '☁️',
    name: 'Cloudy',
    rarity: 'common',
    unlocked: true,
    desc: 'Fluffy and friendly!',
  },
  {
    id: 'leafy',
    emoji: '🍃',
    name: 'Leafy',
    rarity: 'common',
    unlocked: true,
    desc: "Nature's little helper!",
  },
  {
    id: 'droplet',
    emoji: '💧',
    name: 'Droplet',
    rarity: 'common',
    unlocked: false,
    desc: 'A splash of fun!',
  },

  // Uncommon
  {
    id: 'flutter',
    emoji: '🦋',
    name: 'Flutter',
    rarity: 'uncommon',
    unlocked: true,
    desc: 'Beautiful butterfly!',
  },
  {
    id: 'twinkle',
    emoji: '✨',
    name: 'Twinkle',
    rarity: 'uncommon',
    unlocked: false,
    desc: 'Sparkly and magical!',
  },
  {
    id: 'bloom',
    emoji: '🌸',
    name: 'Bloom',
    rarity: 'uncommon',
    unlocked: false,
    desc: 'Sweet flower friend!',
  },
  {
    id: 'bubbles',
    emoji: '🫧',
    name: 'Bubbles',
    rarity: 'uncommon',
    unlocked: false,
    desc: 'Pop pop pop!',
  },

  // Rare
  {
    id: 'ember',
    emoji: '🔥',
    name: 'Ember',
    rarity: 'rare',
    unlocked: true,
    desc: 'Warm and cozy!',
  },
  {
    id: 'frost',
    emoji: '❄️',
    name: 'Frost',
    rarity: 'rare',
    unlocked: false,
    desc: 'Cool and calm!',
  },
  {
    id: 'storm',
    emoji: '⚡',
    name: 'Storm',
    rarity: 'rare',
    unlocked: false,
    desc: 'Electric energy!',
  },
  {
    id: 'moonbeam',
    emoji: '🌙',
    name: 'Moonbeam',
    rarity: 'rare',
    unlocked: false,
    desc: 'Gentle night light!',
  },

  // Epic
  {
    id: 'phoenix',
    emoji: '🐦‍🔥',
    name: 'Phoenix',
    rarity: 'epic',
    unlocked: false,
    desc: 'Rise from the ashes!',
  },
  {
    id: 'aurora',
    emoji: '🌈',
    name: 'Aurora',
    rarity: 'epic',
    unlocked: false,
    desc: 'Rainbow wonder!',
  },
  {
    id: 'cosmos',
    emoji: '🌌',
    name: 'Cosmos',
    rarity: 'epic',
    unlocked: false,
    desc: 'Infinite adventure!',
  },

  // Legendary
  {
    id: 'dragon',
    emoji: '🐉',
    name: 'Drakon',
    rarity: 'legendary',
    unlocked: false,
    desc: 'The legendary dragon!',
  },
  {
    id: 'unicorn',
    emoji: '🦄',
    name: 'Stardust',
    rarity: 'legendary',
    unlocked: false,
    desc: 'Magical unicorn!',
  },
];

// ============================================
// SHOP ITEMS
// ============================================
const shopItems = [
  {
    id: 'mystery-box',
    emoji: '📦',
    name: 'Mystery Box',
    cost: 100,
    type: 'collectible',
    desc: 'Random collectible inside!',
  },
  {
    id: 'rare-box',
    emoji: '🎁',
    name: 'Rare Box',
    cost: 250,
    type: 'collectible',
    desc: 'Guaranteed rare or better!',
  },
  {
    id: 'epic-box',
    emoji: '💎',
    name: 'Epic Box',
    cost: 500,
    type: 'collectible',
    desc: 'Guaranteed epic or better!',
  },
  {
    id: 'theme-space',
    emoji: '🚀',
    name: 'Space Theme',
    cost: 150,
    type: 'theme',
    desc: 'Cosmic background!',
  },
  {
    id: 'theme-ocean',
    emoji: '🌊',
    name: 'Ocean Theme',
    cost: 150,
    type: 'theme',
    desc: 'Deep sea vibes!',
  },
  {
    id: 'theme-forest',
    emoji: '🌲',
    name: 'Forest Theme',
    cost: 150,
    type: 'theme',
    desc: 'Nature escape!',
  },
];

const rarityColors = {
  common: {
    bg: 'from-gray-500/20 to-gray-600/20',
    border: 'border-gray-500/40',
    text: 'text-gray-400',
  },
  uncommon: {
    bg: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/40',
    text: 'text-green-400',
  },
  rare: {
    bg: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
  },
  epic: {
    bg: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/40',
    text: 'text-purple-400',
  },
  legendary: {
    bg: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
  },
};

// ============================================
// COMPONENTS
// ============================================

function BadgeGrid() {
  const [filter, setFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', emoji: '🏆' },
    { id: 'reading', label: 'Reading', emoji: '📖' },
    { id: 'streak', label: 'Streaks', emoji: '🔥' },
    { id: 'games', label: 'Games', emoji: '🎮' },
    { id: 'special', label: 'Special', emoji: '⭐' },
  ];

  const filteredBadges =
    filter === 'all' ? allBadges : allBadges.filter((b) => b.category === filter);

  const unlockedCount = allBadges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/40">
          <span className="text-yellow-400 font-bold">
            🏆 {unlockedCount}/{allBadges.length} Unlocked
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              filter === cat.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cat.emoji} {cat.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {filteredBadges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="relative group"
          >
            <motion.div
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40'
                  : 'bg-white/5 border-2 border-white/10 opacity-40'
              }`}
              whileHover={{ scale: 1.05 }}
              style={{
                boxShadow: badge.unlocked ? '0 0 20px rgba(254,228,64,0.3)' : 'none',
              }}
            >
              <span className="text-3xl mb-1">{badge.unlocked ? badge.emoji : '🔒'}</span>
              <span className="text-[10px] text-center font-medium text-white/70 leading-tight">
                {badge.name}
              </span>
            </motion.div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-black/90 rounded-lg p-3 whitespace-nowrap">
                <p className="font-bold text-white text-sm">{badge.name}</p>
                <p className="text-white/60 text-xs">{badge.desc}</p>
                {badge.unlocked && badge.date && (
                  <p className="text-green-400 text-xs mt-1">✓ Unlocked {badge.date}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CollectiblesGrid() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<(typeof collectibles)[0] | null>(null);

  const rarities = [
    { id: 'all', label: 'All' },
    { id: 'common', label: 'Common' },
    { id: 'uncommon', label: 'Uncommon' },
    { id: 'rare', label: 'Rare' },
    { id: 'epic', label: 'Epic' },
    { id: 'legendary', label: 'Legendary' },
  ];

  const filteredCollectibles =
    filter === 'all' ? collectibles : collectibles.filter((c) => c.rarity === filter);

  const unlockedCount = collectibles.filter((c) => c.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40">
          <span className="text-purple-400 font-bold">
            ✨ {unlockedCount}/{collectibles.length} Collected
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {rarities.map((rarity) => (
          <motion.button
            key={rarity.id}
            onClick={() => setFilter(rarity.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              filter === rarity.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {rarity.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
        {filteredCollectibles.map((item, i) => {
          const colors = rarityColors[item.rarity as keyof typeof rarityColors];
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => item.unlocked && setSelectedItem(item)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all bg-gradient-to-br ${colors.bg} border-2 ${colors.border} ${
                !item.unlocked && 'opacity-30 grayscale'
              }`}
              whileHover={item.unlocked ? { scale: 1.1, rotate: 5 } : {}}
              whileTap={item.unlocked ? { scale: 0.95 } : {}}
            >
              <span className="text-4xl mb-1">{item.unlocked ? item.emoji : '❓'}</span>
              <span className={`text-[10px] font-bold ${colors.text}`}>
                {item.unlocked ? item.name : '???'}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Item Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="bg-nebula-space rounded-3xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {selectedItem.emoji}
              </motion.div>
              <h3
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-kids)' }}
              >
                {selectedItem.name}
              </h3>
              <p
                className={`text-sm font-bold mb-2 ${rarityColors[selectedItem.rarity as keyof typeof rarityColors].text}`}
              >
                {selectedItem.rarity.charAt(0).toUpperCase() + selectedItem.rarity.slice(1)}
              </p>
              <p className="text-white/60 mb-6">{selectedItem.desc}</p>
              <MagicButton onClick={() => setSelectedItem(null)}>Cool! 😎</MagicButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StarShop({ coins, onPurchase }: { coins: number; onPurchase: (cost: number) => void }) {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = (item: (typeof shopItems)[0]) => {
    if (coins < item.cost) return;
    setPurchasing(item.id);
    setTimeout(() => {
      onPurchase(item.cost);
      setPurchasing(null);
      // In real app, would give the item
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {shopItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 rounded-2xl p-4 border-2 border-white/10"
          >
            <motion.div
              className="text-5xl text-center mb-3"
              animate={purchasing === item.id ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1 }}
            >
              {item.emoji}
            </motion.div>
            <h4 className="font-bold text-white text-center mb-1">{item.name}</h4>
            <p className="text-xs text-white/50 text-center mb-3">{item.desc}</p>
            <MagicButton
              size="sm"
              variant={coins >= item.cost ? 'primary' : 'secondary'}
              onClick={() => handlePurchase(item)}
              disabled={coins < item.cost || purchasing !== null}
              className="w-full"
            >
              {purchasing === item.id ? '✨ Opening...' : `⭐ ${item.cost}`}
            </MagicButton>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

const tabs = [
  { id: 'badges', label: 'Badges', emoji: '🏆' },
  { id: 'collectibles', label: 'Friends', emoji: '✨' },
  { id: 'shop', label: 'Shop', emoji: '🛒' },
];

export default function MyStuffPage() {
  const [coins, setCoins] = useState(450);
  const [activeTab, setActiveTab] = useState('badges');

  const handlePurchase = (cost: number) => {
    setCoins((c) => c - cost);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <MagicTopBar showCoins={coins} />

      <div className="mt-20 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-kids)' }}
          >
            <MagicText>My Stuff</MagicText>
          </h1>
          <p className="text-lg text-white/70">Your collection of awesome things! 🎒</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl mr-2">{tab.emoji}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <MagicCard color="purple" className="mb-24">
          <AnimatePresence mode="wait">
            {activeTab === 'badges' && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <BadgeGrid />
              </motion.div>
            )}
            {activeTab === 'collectibles' && (
              <motion.div
                key="collectibles"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <CollectiblesGrid />
              </motion.div>
            )}
            {activeTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <StarShop coins={coins} onPurchase={handlePurchase} />
              </motion.div>
            )}
          </AnimatePresence>
        </MagicCard>
      </div>
    </div>
  );
}
