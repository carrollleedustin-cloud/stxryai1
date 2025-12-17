'use client';

import { motion } from 'framer-motion';
import { getLevelFromXP, getXPProgress, getXPToNextLevel } from '@/lib/gamification/xpSystem';

interface XPProgressBarProps {
  totalXP: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function XPProgressBar({
  totalXP,
  showDetails = true,
  size = 'md',
  animated = true,
}: XPProgressBarProps) {
  const currentLevel = getLevelFromXP(totalXP);
  const progress = getXPProgress(totalXP);
  const xpToNext = getXPToNextLevel(totalXP);
  const xpInLevel = totalXP - currentLevel.minXP;
  const xpNeeded = currentLevel.maxXP - currentLevel.minXP;

  const sizeClasses = {
    sm: 'h-2 text-xs',
    md: 'h-3 text-sm',
    lg: 'h-4 text-base',
  };

  return (
    <div className="space-y-2">
      {/* Level Badge and Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold shadow-lg"
          >
            <span className="mr-1">{currentLevel.badge}</span>
            Level {currentLevel.level}
          </motion.div>
          <span className="text-sm font-medium text-muted-foreground">{currentLevel.title}</span>
        </div>
        {showDetails && (
          <span className="text-xs text-muted-foreground">
            {xpToNext.toLocaleString()} XP to next level
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Background */}
        <div className={`w-full ${sizeClasses[size]} bg-muted rounded-full overflow-hidden`}>
          {/* Animated Progress Fill */}
          <motion.div
            initial={animated ? { width: 0 } : { width: `${progress * 100}%` }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* XP Numbers */}
        {showDetails && (
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{xpInLevel.toLocaleString()} XP</span>
            <span>{xpNeeded.toLocaleString()} XP</span>
          </div>
        )}
      </div>
    </div>
  );
}
