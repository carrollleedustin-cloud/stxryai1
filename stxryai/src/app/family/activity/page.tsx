'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  Star,
  Target,
  Award,
  BarChart3,
  Activity,
  ChevronDown,
  Download,
  Filter,
} from 'lucide-react';
import { NebulaBackground } from '@/components/nebula';

/**
 * FAMILY ACTIVITY REPORTS PAGE
 * Detailed insights into children's reading activities
 */

// Sample data for activity
const kidsData = [
  {
    id: '1',
    name: 'Emma',
    avatar: '👧',
    age: 7,
    color: '#f15bb5',
  },
  {
    id: '2',
    name: 'Liam',
    avatar: '👦',
    age: 10,
    color: '#00bbf9',
  },
];

const weeklyReadingData = [
  { day: 'Mon', emma: 25, liam: 35 },
  { day: 'Tue', emma: 40, liam: 20 },
  { day: 'Wed', emma: 30, liam: 45 },
  { day: 'Thu', emma: 45, liam: 30 },
  { day: 'Fri', emma: 55, liam: 40 },
  { day: 'Sat', emma: 60, liam: 50 },
  { day: 'Sun', emma: 35, liam: 25 },
];

const recentActivity = [
  { kid: 'Emma', action: 'Read "The Dragon Who Lost His Fire"', time: '2 hours ago', type: 'story', duration: '12 min' },
  { kid: 'Liam', action: 'Completed Story Quiz', time: '3 hours ago', type: 'game', score: '5/5' },
  { kid: 'Emma', action: 'Earned "Bookworm" badge', time: '5 hours ago', type: 'achievement' },
  { kid: 'Liam', action: 'Read "Robot Best Friends"', time: 'Yesterday', type: 'story', duration: '15 min' },
  { kid: 'Emma', action: 'Played Memory Match', time: 'Yesterday', type: 'game', score: '14 moves' },
  { kid: 'Liam', action: 'Earned "Quiz Whiz" badge', time: 'Yesterday', type: 'achievement' },
  { kid: 'Emma', action: 'Read "Princess Astro Goes to Space"', time: '2 days ago', type: 'story', duration: '8 min' },
  { kid: 'Liam', action: 'Read "The Magical Garden"', time: '2 days ago', type: 'story', duration: '12 min' },
];

const monthlyStats = {
  totalReadingTime: '18h 45m',
  storiesCompleted: 32,
  gamesPlayed: 48,
  badgesEarned: 7,
  avgSessionLength: '22 min',
  favoriteCategory: 'Dragons',
  longestStreak: 5,
  vocabularyGrowth: '+124 words',
};

const categoryBreakdown = [
  { name: 'Dragons', count: 12, color: '#ff6b6b' },
  { name: 'Space', count: 8, color: '#5f27cd' },
  { name: 'Fairy Tales', count: 6, color: '#f15bb5' },
  { name: 'Animals', count: 4, color: '#fee440' },
  { name: 'Heroes', count: 2, color: '#00bbf9' },
];

const learningInsights = [
  { title: 'Reading Speed', value: '+15%', subtitle: 'improvement this month', positive: true },
  { title: 'Comprehension', value: '92%', subtitle: 'quiz accuracy', positive: true },
  { title: 'Vocabulary', value: '+124', subtitle: 'new words learned', positive: true },
  { title: 'Focus Time', value: '22 min', subtitle: 'avg session length', positive: true },
];

export default function ActivityReportsPage() {
  const [selectedKid, setSelectedKid] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('week');

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
                <Link href="/family/controls" className="text-sm text-white/60 hover:text-white transition-colors">
                  Content Controls
                </Link>
                <Link href="/family/activity" className="text-sm text-aurora-cyan font-medium relative">
                  Activity
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-aurora-cyan rounded-full" />
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
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-aurora-cyan mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Activity Reports
            </h1>
            <p className="text-white/60">Track your children&apos;s learning journey</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Kid Filter */}
            <div className="relative">
              <select
                value={selectedKid}
                onChange={(e) => setSelectedKid(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-aurora-cyan"
              >
                <option value="all">All Kids</option>
                {kidsData.map(kid => (
                  <option key={kid.id} value={kid.id}>{kid.avatar} {kid.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
            
            {/* Time Range */}
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-aurora-cyan"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
            
            {/* Export Button */}
            <motion.button
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Clock, label: 'Total Reading Time', value: monthlyStats.totalReadingTime, color: 'cyan' },
            { icon: BookOpen, label: 'Stories Completed', value: monthlyStats.storiesCompleted, color: 'pink' },
            { icon: Target, label: 'Games Played', value: monthlyStats.gamesPlayed, color: 'purple' },
            { icon: Award, label: 'Badges Earned', value: monthlyStats.badgesEarned, color: 'gold' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <stat.icon className={`w-5 h-5 mb-2 ${
                stat.color === 'cyan' ? 'text-aurora-cyan' :
                stat.color === 'pink' ? 'text-aurora-pink' :
                stat.color === 'purple' ? 'text-aurora-violet' :
                'text-aurora-gold'
              }`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Reading Time Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-aurora-cyan" />
                Reading Time
              </h2>
              <div className="flex items-center gap-4 text-xs">
                {kidsData.map(kid => (
                  <div key={kid.id} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: kid.color }} />
                    <span className="text-white/60">{kid.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-48 gap-2">
              {weeklyReadingData.map((day, i) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-40">
                    <motion.div
                      className="flex-1 rounded-t-lg"
                      style={{ backgroundColor: '#f15bb5' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.emma / 60) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                    <motion.div
                      className="flex-1 rounded-t-lg"
                      style={{ backgroundColor: '#00bbf9' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.liam / 60) * 100}%` }}
                      transition={{ delay: i * 0.1 + 0.05, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-white/40">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Insights */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-aurora-cyan" />
              Learning Insights
            </h2>
            
            <div className="space-y-4">
              {learningInsights.map((insight, i) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div>
                    <p className="text-sm text-white/60">{insight.title}</p>
                    <p className="text-xs text-white/40">{insight.subtitle}</p>
                  </div>
                  <span className={`text-lg font-bold ${insight.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {insight.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-aurora-cyan" />
              Favorite Categories
            </h2>
            
            <div className="space-y-3">
              {categoryBreakdown.map((cat, i) => {
                const maxCount = Math.max(...categoryBreakdown.map(c => c.count));
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{cat.name}</span>
                      <span className="text-xs text-white/40">{cat.count} stories</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.count / maxCount) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-aurora-cyan" />
              Recent Activity
            </h2>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {recentActivity.map((activity, i) => {
                const kid = kidsData.find(k => k.name === activity.kid);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${kid?.color}30` }}
                    >
                      {kid?.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/40">{activity.time}</span>
                        {activity.duration && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                            {activity.duration}
                          </span>
                        )}
                        {activity.score && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                            {activity.score}
                          </span>
                        )}
                        {activity.type === 'achievement' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                            🏆 Achievement
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-aurora-violet/20 to-aurora-cyan/20 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-aurora-cyan" />
            <h2 className="text-lg font-bold text-white">Monthly Summary</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl font-bold text-white">{monthlyStats.avgSessionLength}</p>
              <p className="text-xs text-white/50">Avg Session Length</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{monthlyStats.favoriteCategory}</p>
              <p className="text-xs text-white/50">Favorite Category</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{monthlyStats.longestStreak} days</p>
              <p className="text-xs text-white/50">Longest Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{monthlyStats.vocabularyGrowth}</p>
              <p className="text-xs text-white/50">Vocabulary Growth</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

