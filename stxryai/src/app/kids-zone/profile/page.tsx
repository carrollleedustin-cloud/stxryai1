'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MagicCard } from '@/components/nebula/MagicCard';
import { MagicButton } from '@/components/nebula/MagicButton';
import { MagicText } from '@/components/nebula/NebulaText';
import { MagicTopBar } from '@/components/nebula/MagicNav';

/**
 * KIDS ZONE - PROFILE PAGE
 * Kid's personal profile with stats and customization
 */

const avatarOptions = [
  { id: 'girl', emoji: '👧', label: 'Girl' },
  { id: 'boy', emoji: '👦', label: 'Boy' },
  { id: 'child', emoji: '🧒', label: 'Child' },
  { id: 'superhero-f', emoji: '🦸‍♀️', label: 'Hero Girl' },
  { id: 'superhero-m', emoji: '🦸‍♂️', label: 'Hero Boy' },
  { id: 'fairy', emoji: '🧚‍♀️', label: 'Fairy' },
  { id: 'mermaid', emoji: '🧜‍♂️', label: 'Merman' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'bunny', emoji: '🐰', label: 'Bunny' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
];

const themeColors = [
  { id: 'purple', color: '#9b5de5', label: 'Purple Magic' },
  { id: 'pink', color: '#f15bb5', label: 'Pink Dream' },
  { id: 'blue', color: '#00bbf9', label: 'Ocean Blue' },
  { id: 'cyan', color: '#00f5d4', label: 'Mint Fresh' },
  { id: 'gold', color: '#fee440', label: 'Golden Sun' },
  { id: 'coral', color: '#ff6b6b', label: 'Coral Reef' },
];

const recentStories = [
  { id: '1', title: 'The Dragon Who Lost His Fire', progress: 100, emoji: '🐉' },
  { id: '2', title: 'Princess Astro Goes to Space', progress: 75, emoji: '🚀' },
  { id: '3', title: 'The Magical Garden', progress: 45, emoji: '🌸' },
  { id: '4', title: 'Robot Best Friends', progress: 20, emoji: '🤖' },
];

const achievements = [
  { emoji: '📖', label: 'First Story', unlocked: true },
  { emoji: '⭐', label: '5 Stories', unlocked: true },
  { emoji: '🔥', label: '3 Day Streak', unlocked: true },
  { emoji: '🧠', label: 'Quiz Whiz', unlocked: true },
  { emoji: '🏆', label: '10 Stories', unlocked: false },
  { emoji: '💎', label: 'Diamond Reader', unlocked: false },
];

export default function KidsZoneProfilePage() {
  const [coins] = useState(450);
  const [selectedAvatar, setSelectedAvatar] = useState('girl');
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [nickname, setNickname] = useState('Star Explorer');
  const [isEditingName, setIsEditingName] = useState(false);

  const stats = {
    storiesRead: 23,
    totalTime: '5h 30m',
    currentStreak: 3,
    badges: 7,
    coins: coins,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <MagicTopBar showCoins={coins} />

      <div className="mt-20 mb-24">
        {/* Profile Header */}
        <section className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative inline-block mb-4"
          >
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-6xl"
              style={{
                background: `linear-gradient(135deg, ${themeColors.find((t) => t.id === selectedTheme)?.color}40, ${themeColors.find((t) => t.id === selectedTheme)?.color}20)`,
                border: `4px solid ${themeColors.find((t) => t.id === selectedTheme)?.color}`,
              }}
            >
              {avatarOptions.find((a) => a.id === selectedAvatar)?.emoji}
            </div>
            <motion.div
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-xl border-4 border-nebula-deep"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⭐
            </motion.div>
          </motion.div>

          {isEditingName ? (
            <div className="flex items-center justify-center gap-2 mb-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="text-2xl font-bold text-center bg-transparent border-b-2 border-purple-500 text-white focus:outline-none"
                style={{ fontFamily: 'var(--font-kids)' }}
                autoFocus
              />
              <MagicButton size="sm" onClick={() => setIsEditingName(false)}>
                ✓
              </MagicButton>
            </div>
          ) : (
            <motion.button
              onClick={() => setIsEditingName(true)}
              className="mb-2"
              whileHover={{ scale: 1.05 }}
            >
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-kids)' }}>
                <MagicText>{nickname}</MagicText>
              </h1>
            </motion.button>
          )}
          <p className="text-white/60">Level 5 Story Explorer</p>
        </section>

        {/* Stats Grid */}
        <section className="mb-8">
          <div className="grid grid-cols-5 gap-3">
            {[
              { value: stats.storiesRead, label: 'Stories', emoji: '📚' },
              { value: stats.totalTime, label: 'Time', emoji: '⏱️' },
              { value: stats.currentStreak, label: 'Streak', emoji: '🔥' },
              { value: stats.badges, label: 'Badges', emoji: '🏆' },
              { value: stats.coins, label: 'Stars', emoji: '⭐' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-3 rounded-2xl bg-white/5"
              >
                <div className="text-2xl mb-1">{stat.emoji}</div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Avatar Selection */}
        <section className="mb-8">
          <MagicCard color="purple">
            <h2
              className="text-xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-kids)' }}
            >
              Choose Your Avatar 🎭
            </h2>
            <div className="grid grid-cols-6 gap-3">
              {avatarOptions.map((avatar) => (
                <motion.button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all ${
                    selectedAvatar === avatar.id
                      ? 'bg-purple-500/30 border-2 border-purple-500 ring-4 ring-purple-500/20'
                      : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {avatar.emoji}
                </motion.button>
              ))}
            </div>
          </MagicCard>
        </section>

        {/* Theme Selection */}
        <section className="mb-8">
          <MagicCard color="pink">
            <h2
              className="text-xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-kids)' }}
            >
              Pick Your Color 🎨
            </h2>
            <div className="flex gap-3 flex-wrap">
              {themeColors.map((theme) => (
                <motion.button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    selectedTheme === theme.id ? 'ring-4' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    background: theme.color,
                    borderColor: `${theme.color}40`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white font-medium text-sm">{theme.label}</span>
                  {selectedTheme === theme.id && <span>✓</span>}
                </motion.button>
              ))}
            </div>
          </MagicCard>
        </section>

        {/* Recent Stories */}
        <section className="mb-8">
          <MagicCard color="cyan">
            <h2
              className="text-xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-kids)' }}
            >
              My Stories 📖
            </h2>
            <div className="space-y-3">
              {recentStories.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                    {story.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{story.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${story.progress}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-xs text-white/50">{story.progress}%</span>
                    </div>
                  </div>
                  <MagicButton size="sm" variant={story.progress === 100 ? 'secondary' : 'primary'}>
                    {story.progress === 100 ? '✓ Done' : 'Continue'}
                  </MagicButton>
                </motion.div>
              ))}
            </div>
          </MagicCard>
        </section>

        {/* Achievements Preview */}
        <section className="mb-8">
          <MagicCard color="gold">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'var(--font-kids)' }}
              >
                My Badges 🏆
              </h2>
              <MagicButton size="sm" variant="secondary">
                See All →
              </MagicButton>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {achievements.map((ach, i) => (
                <motion.div
                  key={ach.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  className={`aspect-square rounded-xl flex items-center justify-center text-3xl ${
                    ach.unlocked
                      ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/40'
                      : 'bg-white/5 opacity-30'
                  }`}
                  style={{
                    boxShadow: ach.unlocked ? '0 0 20px rgba(254,228,64,0.3)' : 'none',
                  }}
                >
                  {ach.unlocked ? ach.emoji : '🔒'}
                </motion.div>
              ))}
            </div>
          </MagicCard>
        </section>
      </div>
    </div>
  );
}
