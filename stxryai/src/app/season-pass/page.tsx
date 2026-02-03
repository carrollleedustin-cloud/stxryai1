'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Star, Gem, Gift, Lock, Check, ChevronRight, ChevronLeft,
  Sparkles, Award, Heart, Zap, Flame, Trophy, Coins, Rocket,
  Clock, Calendar, TrendingUp, Info
} from 'lucide-react';

interface SeasonReward {
  level: number;
  freeReward?: { type: string; name: string; icon: React.ElementType; rarity: string };
  premiumReward?: { type: string; name: string; icon: React.ElementType; rarity: string };
}

export default function SeasonPassPage() {
  const [currentLevel, setCurrentLevel] = useState(24);
  const [currentXP, setCurrentXP] = useState(6540);
  const [hasPremium, setHasPremium] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const maxLevel = 100;
  const xpPerLevel = 1000;
  const seasonEndDate = new Date('2024-03-31');
  const daysRemaining = Math.ceil((seasonEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Generate sample rewards
  const rewards: SeasonReward[] = Array.from({ length: maxLevel }, (_, i) => ({
    level: i + 1,
    freeReward: i % 3 === 0 ? {
      type: 'coins',
      name: `${(i + 1) * 50} Coins`,
      icon: Coins,
      rarity: 'common',
    } : i % 5 === 0 ? {
      type: 'badge',
      name: 'Reader Badge',
      icon: Award,
      rarity: 'uncommon',
    } : undefined,
    premiumReward: {
      type: i % 10 === 0 ? 'pet_skin' : i % 7 === 0 ? 'badge' : i % 4 === 0 ? 'icon' : 'coins',
      name: i % 10 === 0 ? 'Exclusive Pet Skin' : i % 7 === 0 ? 'Premium Badge' : i % 4 === 0 ? 'Profile Icon' : `${(i + 1) * 100} Coins`,
      icon: i % 10 === 0 ? Heart : i % 7 === 0 ? Award : i % 4 === 0 ? Star : Coins,
      rarity: i % 10 === 0 ? 'legendary' : i % 7 === 0 ? 'epic' : i % 4 === 0 ? 'rare' : 'common',
    },
  }));

  const progressPercentage = (currentXP % xpPerLevel) / xpPerLevel * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-void-950 via-purple-950/20 to-void-950 overflow-hidden">
      {/* Epic Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Parallax Stars */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)',
            top: '-200px',
            right: '-200px',
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            bottom: '-150px',
            left: '-150px',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-void-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative"
              >
                <div className="p-4 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-2xl">
                  <Trophy className="w-10 h-10 text-amber-400" />
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-amber-400/20 rounded-2xl blur-xl" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Season 1: Origins
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-void-400">
                    <Clock className="w-4 h-4" />
                    {daysRemaining} days remaining
                  </span>
                  <span className="flex items-center gap-1.5 text-void-400">
                    <TrendingUp className="w-4 h-4" />
                    Level {currentLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* XP Progress */}
              <div className="flex-1 lg:w-64">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-void-400">Level Progress</span>
                  <span className="text-sm text-white font-medium">
                    {currentXP % xpPerLevel}/{xpPerLevel} XP
                  </span>
                </div>
                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {!hasPremium && (
                <motion.button
                  onClick={() => setShowUpgradeModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25"
                >
                  <Crown className="w-5 h-5" />
                  Upgrade to Premium
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Track Display */}
        <div className="relative">
          {/* Track Background */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/5 rounded-full transform -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transform -translate-y-1/2"
            style={{ width: `${(currentLevel / maxLevel) * 100}%` }}
          />

          {/* Reward Track */}
          <div className="relative overflow-x-auto pb-4 -mx-6 px-6">
            <div className="flex gap-4" style={{ width: `${maxLevel * 100}px` }}>
              {rewards.map((reward, index) => (
                <RewardNode
                  key={reward.level}
                  reward={reward}
                  isUnlocked={reward.level <= currentLevel}
                  isCurrent={reward.level === currentLevel}
                  hasPremium={hasPremium}
                  onClick={() => setSelectedLevel(reward.level)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Level Grid View */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            All Rewards
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {rewards.slice(0, 50).map((reward) => (
              <RewardCard
                key={reward.level}
                reward={reward}
                isUnlocked={reward.level <= currentLevel}
                hasPremium={hasPremium}
                onClick={() => setSelectedLevel(reward.level)}
              />
            ))}
          </div>
          
          {/* Show More */}
          <div className="mt-6 text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-white/5 text-void-300 rounded-xl hover:bg-white/10 transition-colors"
            >
              Show All 100 Levels
            </motion.button>
          </div>
        </div>

        {/* Premium Benefits */}
        {!hasPremium && (
          <div className="mt-12 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-pink-500/10 rounded-3xl p-8 border border-amber-500/20">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Crown className="w-8 h-8 text-amber-400" />
                  Upgrade to Premium Pass
                </h2>
                <p className="text-void-400 mb-6">
                  Unlock exclusive rewards, premium skins, and bonus XP throughout the season!
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <BenefitItem icon={Gift} text="100+ Exclusive Rewards" />
                  <BenefitItem icon={Sparkles} text="Premium Pet Skins" />
                  <BenefitItem icon={Zap} text="2x XP Boost" />
                  <BenefitItem icon={Star} text="Exclusive Badges" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-void-400 text-sm">Season Pass Price</p>
                  <p className="text-4xl font-bold text-white">$9.99</p>
                </div>
                <motion.button
                  onClick={() => setShowUpgradeModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/25 text-lg"
                >
                  Get Premium Pass
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Reward Detail Modal */}
      <AnimatePresence>
        {selectedLevel !== null && (
          <RewardDetailModal
            reward={rewards.find(r => r.level === selectedLevel)!}
            isUnlocked={selectedLevel <= currentLevel}
            hasPremium={hasPremium}
            onClose={() => setSelectedLevel(null)}
            onClaim={() => {
              // Handle claim
              setSelectedLevel(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            onUpgrade={() => {
              setHasPremium(true);
              setShowUpgradeModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RewardNode({ reward, isUnlocked, isCurrent, hasPremium, onClick }: {
  reward: SeasonReward;
  isUnlocked: boolean;
  isCurrent: boolean;
  hasPremium: boolean;
  onClick: () => void;
}) {
  const rarityColors: Record<string, string> = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center cursor-pointer"
      style={{ minWidth: '80px' }}
    >
      {/* Level Number */}
      <div className={`text-xs font-medium mb-2 ${isUnlocked ? 'text-amber-400' : 'text-void-500'}`}>
        Lv.{reward.level}
      </div>

      {/* Free Reward */}
      <motion.div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-2 ${
          isUnlocked 
            ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/50' 
            : 'bg-white/5 border border-white/10'
        }`}
        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
      >
        {reward.freeReward ? (
          <reward.freeReward.icon 
            className="w-6 h-6" 
            style={{ color: isUnlocked ? rarityColors[reward.freeReward.rarity] : '#6B7280' }}
          />
        ) : (
          <div className="w-2 h-2 rounded-full bg-void-600" />
        )}
      </motion.div>

      {/* Premium Reward */}
      <motion.div
        className={`relative w-14 h-14 rounded-xl flex items-center justify-center ${
          isUnlocked && hasPremium
            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/50'
            : 'bg-white/5 border border-white/10'
        }`}
      >
        {reward.premiumReward && (
          <>
            <reward.premiumReward.icon
              className="w-6 h-6"
              style={{ color: isUnlocked && hasPremium ? rarityColors[reward.premiumReward.rarity] : '#6B7280' }}
            />
            {!hasPremium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Current Indicator */}
      {isCurrent && (
        <motion.div
          className="absolute -bottom-2 w-4 h-4 bg-amber-500 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

function RewardCard({ reward, isUnlocked, hasPremium, onClick }: {
  reward: SeasonReward;
  isUnlocked: boolean;
  hasPremium: boolean;
  onClick: () => void;
}) {
  const rarityColors: Record<string, string> = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-3 rounded-xl ${
        isUnlocked 
          ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30'
          : 'bg-white/5 border border-white/10'
      }`}
    >
      <div className="text-xs font-medium text-void-400 mb-2">Lv.{reward.level}</div>
      
      {reward.premiumReward && (
        <div className="flex items-center justify-center">
          <reward.premiumReward.icon
            className="w-8 h-8"
            style={{ color: isUnlocked ? rarityColors[reward.premiumReward.rarity] : '#4B5563' }}
          />
        </div>
      )}
      
      {isUnlocked && (
        <div className="absolute top-1 right-1">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      )}
      
      {!hasPremium && reward.premiumReward?.rarity !== 'common' && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
          <Crown className="w-3 h-3 text-white" />
        </div>
      )}
    </motion.button>
  );
}

function BenefitItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 text-void-300">
      <Icon className="w-5 h-5 text-amber-400" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function RewardDetailModal({ reward, isUnlocked, hasPremium, onClose, onClaim }: {
  reward: SeasonReward;
  isUnlocked: boolean;
  hasPremium: boolean;
  onClose: () => void;
  onClaim: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-void-900 rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">Level {reward.level} Rewards</h3>
        
        <div className="space-y-4">
          {reward.freeReward && (
            <div className={`p-4 rounded-xl ${isUnlocked ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <reward.freeReward.icon className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium">{reward.freeReward.name}</p>
                    <p className="text-xs text-void-400">Free Reward</p>
                  </div>
                </div>
                {isUnlocked ? (
                  <Check className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Lock className="w-5 h-5 text-void-500" />
                )}
              </div>
            </div>
          )}
          
          {reward.premiumReward && (
            <div className={`p-4 rounded-xl ${isUnlocked && hasPremium ? 'bg-amber-500/10' : 'bg-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <reward.premiumReward.icon className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-white font-medium">{reward.premiumReward.name}</p>
                    <p className="text-xs text-amber-400 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium Reward
                    </p>
                  </div>
                </div>
                {isUnlocked && hasPremium ? (
                  <Check className="w-6 h-6 text-amber-400" />
                ) : (
                  <Lock className="w-5 h-5 text-void-500" />
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex gap-3">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-white/5 text-white rounded-xl"
          >
            Close
          </motion.button>
          {isUnlocked && (
            <motion.button
              onClick={onClaim}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium"
            >
              Claim
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function UpgradeModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-gradient-to-br from-void-900 to-purple-950/50 rounded-3xl border border-amber-500/30 p-8"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Premium Season Pass</h2>
          <p className="text-void-400 mt-2">Unlock all premium rewards and bonuses</p>
        </div>

        <div className="space-y-3 mb-8">
          {[
            { icon: Gift, text: '100+ Exclusive Rewards' },
            { icon: Sparkles, text: 'Premium Pet Skins & Accessories' },
            { icon: Zap, text: '2x XP Boost All Season' },
            { icon: Star, text: 'Exclusive Profile Badges' },
            { icon: Heart, text: 'Special Pet Species Access' },
          ].map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
            >
              <Icon className="w-5 h-5 text-amber-400" />
              <span className="text-white">{text}</span>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-void-400 text-sm">One-time purchase</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            $9.99
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-white/5 text-white rounded-xl font-medium"
          >
            Maybe Later
          </motion.button>
          <motion.button
            onClick={onUpgrade}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/25"
          >
            Upgrade Now
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
