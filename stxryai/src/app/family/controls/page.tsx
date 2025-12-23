'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  Clock,
  Filter,
  Volume2,
  Eye,
  Lock,
  Calendar,
  Sun,
  Moon,
  ChevronDown,
  Check,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Gamepad2,
  Users,
} from 'lucide-react';
import { NebulaBackground } from '@/components/nebula';

/**
 * FAMILY CONTENT CONTROLS PAGE
 * Screen time limits, content filtering, and parental controls
 */

const kidsData = [
  { id: '1', name: 'Emma', avatar: '👧', age: 7, color: '#f15bb5' },
  { id: '2', name: 'Liam', avatar: '👦', age: 10, color: '#00bbf9' },
];

const contentCategories = [
  { id: 'dragons', label: 'Dragons & Fantasy', emoji: '🐉', enabled: true },
  { id: 'space', label: 'Space & Sci-Fi', emoji: '🚀', enabled: true },
  { id: 'fairytales', label: 'Fairy Tales', emoji: '🧚', enabled: true },
  { id: 'heroes', label: 'Superheroes', emoji: '🦸', enabled: true },
  { id: 'animals', label: 'Animals & Nature', emoji: '🐾', enabled: true },
  { id: 'adventure', label: 'Adventure', emoji: '🏰', enabled: true },
  { id: 'mystery', label: 'Mystery', emoji: '🔍', enabled: false },
  { id: 'spooky', label: 'Spooky Stories', emoji: '👻', enabled: false },
];

const ageRatings = [
  { id: 'all', label: 'All Ages', desc: 'Content suitable for all ages', color: 'green' },
  { id: '5+', label: 'Ages 5+', desc: 'Simple themes, no conflict', color: 'green' },
  { id: '7+', label: 'Ages 7+', desc: 'Mild adventure, simple problems', color: 'cyan' },
  { id: '9+', label: 'Ages 9+', desc: 'More complex themes', color: 'yellow' },
  { id: '12+', label: 'Ages 12+', desc: 'Teen-appropriate content', color: 'orange' },
];

export default function ContentControlsPage() {
  const [selectedKid, setSelectedKid] = useState(kidsData[0]);
  const [categories, setCategories] = useState(contentCategories);
  const [maxAgeRating, setMaxAgeRating] = useState('7+');
  const [screenTime, setScreenTime] = useState({
    weekday: 60,
    weekend: 90,
    bedtime: '20:00',
    wakeTime: '07:00',
  });
  const [restrictions, setRestrictions] = useState({
    requirePin: true,
    limitGames: false,
    limitSocial: true,
    autoLogout: true,
  });

  const toggleCategory = (id: string) => {
    setCategories(prev => 
      prev.map(cat => cat.id === id ? { ...cat, enabled: !cat.enabled } : cat)
    );
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <motion.button
      onClick={onChange}
      className={`w-12 h-6 rounded-full p-1 transition-colors ${
        enabled ? 'bg-aurora-cyan' : 'bg-white/20'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-white"
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-nebula-void relative">
      <NebulaBackground variant="subtle" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nebula-void/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-aurora-cyan">
                Stxryai
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/family" className="text-sm text-white/60 hover:text-white transition-colors">
                  Overview
                </Link>
                <Link href="/family/profiles" className="text-sm text-white/60 hover:text-white transition-colors">
                  Kids Profiles
                </Link>
                <Link href="/family/controls" className="text-sm text-aurora-cyan font-medium relative">
                  Content Controls
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-aurora-cyan rounded-full" />
                </Link>
                <Link href="/family/activity" className="text-sm text-white/60 hover:text-white transition-colors">
                  Activity
                </Link>
                <Link href="/family/settings" className="text-sm text-white/60 hover:text-white transition-colors">
                  Settings
                </Link>
              </div>
            </div>
            <Link href="/kids-zone">
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Kids Zone
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-aurora-cyan mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Content Controls
            </h1>
            <p className="text-white/60">Manage screen time and content filters</p>
          </div>
          
          {/* Kid Selector */}
          <div className="flex items-center gap-3">
            {kidsData.map(kid => (
              <motion.button
                key={kid.id}
                onClick={() => setSelectedKid(kid)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  selectedKid.id === kid.id
                    ? 'bg-white/10 border-2'
                    : 'bg-white/5 border-2 border-transparent'
                }`}
                style={{
                  borderColor: selectedKid.id === kid.id ? kid.color : 'transparent',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">{kid.avatar}</span>
                <span className="text-white font-medium">{kid.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Screen Time */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-aurora-cyan" />
              Screen Time Limits
            </h2>
            
            {/* Weekday Limit */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <span className="text-white">Weekday Limit</span>
                </div>
                <span className="text-aurora-cyan font-bold">{screenTime.weekday} min</span>
              </div>
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={screenTime.weekday}
                onChange={(e) => setScreenTime(prev => ({ ...prev, weekday: parseInt(e.target.value) }))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-aurora-cyan"
              />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>15 min</span>
                <span>3 hours</span>
              </div>
            </div>

            {/* Weekend Limit */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-white/40" />
                  <span className="text-white">Weekend Limit</span>
                </div>
                <span className="text-aurora-pink font-bold">{screenTime.weekend} min</span>
              </div>
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={screenTime.weekend}
                onChange={(e) => setScreenTime(prev => ({ ...prev, weekend: parseInt(e.target.value) }))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-aurora-pink"
              />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>15 min</span>
                <span>4 hours</span>
              </div>
            </div>

            {/* Bedtime */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                  <Moon className="w-4 h-4" />
                  Bedtime
                </label>
                <input
                  type="time"
                  value={screenTime.bedtime}
                  onChange={(e) => setScreenTime(prev => ({ ...prev, bedtime: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                  <Sun className="w-4 h-4" />
                  Wake Time
                </label>
                <input
                  type="time"
                  value={screenTime.wakeTime}
                  onChange={(e) => setScreenTime(prev => ({ ...prev, wakeTime: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-aurora-cyan"
                />
              </div>
            </div>

            <p className="text-xs text-white/40 mt-4 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              App will be locked outside allowed hours
            </p>
          </motion.section>

          {/* Age Rating */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-aurora-cyan" />
              Age-Appropriate Content
            </h2>
            
            <div className="space-y-3">
              {ageRatings.map((rating) => (
                <motion.button
                  key={rating.id}
                  onClick={() => setMaxAgeRating(rating.id)}
                  className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                    maxAgeRating === rating.id
                      ? 'bg-white/10 border-2 border-aurora-cyan'
                      : 'bg-white/5 border-2 border-transparent hover:border-white/10'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      rating.color === 'green' ? 'bg-green-500/20 text-green-400' :
                      rating.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                      rating.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {rating.id === 'all' ? '✓' : rating.label.split(' ')[1]}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">{rating.label}</p>
                      <p className="text-xs text-white/50">{rating.desc}</p>
                    </div>
                  </div>
                  {maxAgeRating === rating.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-aurora-cyan flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-black" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Content Categories */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 lg:col-span-2"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-aurora-cyan" />
              Story Categories
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    cat.enabled
                      ? 'bg-white/10 border-2 border-aurora-cyan'
                      : 'bg-white/5 border-2 border-transparent opacity-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="text-sm text-white font-medium">{cat.label}</span>
                  {cat.enabled ? (
                    <span className="text-xs text-green-400">✓ Allowed</span>
                  ) : (
                    <span className="text-xs text-red-400">✗ Blocked</span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Additional Restrictions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 lg:col-span-2"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-aurora-cyan" />
              Additional Restrictions
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-aurora-violet" />
                  <div>
                    <p className="text-white font-medium">Require PIN</p>
                    <p className="text-xs text-white/50">PIN needed to exit Kids Zone</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={restrictions.requirePin}
                  onChange={() => setRestrictions(prev => ({ ...prev, requirePin: !prev.requirePin }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 text-aurora-pink" />
                  <div>
                    <p className="text-white font-medium">Limit Games</p>
                    <p className="text-xs text-white/50">Prioritize reading over games</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={restrictions.limitGames}
                  onChange={() => setRestrictions(prev => ({ ...prev, limitGames: !prev.limitGames }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-aurora-cyan" />
                  <div>
                    <p className="text-white font-medium">Limit Social</p>
                    <p className="text-xs text-white/50">Disable community features</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={restrictions.limitSocial}
                  onChange={() => setRestrictions(prev => ({ ...prev, limitSocial: !prev.limitSocial }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-aurora-gold" />
                  <div>
                    <p className="text-white font-medium">Auto Logout</p>
                    <p className="text-xs text-white/50">Logout when time limit reached</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={restrictions.autoLogout}
                  onChange={() => setRestrictions(prev => ({ ...prev, autoLogout: !prev.autoLogout }))}
                />
              </div>
            </div>
          </motion.section>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-end"
        >
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-aurora-cyan to-aurora-violet rounded-xl text-white font-bold flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-5 h-5" />
            Save Changes
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}

