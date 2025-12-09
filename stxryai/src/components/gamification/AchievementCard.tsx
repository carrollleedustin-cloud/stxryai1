'use client';

import { motion } from 'framer-motion';
import { Achievement, getRarityColor, getRarityLabel, checkAchievementProgress } from '@/lib/gamification/achievements';
import Icon from '@/components/ui/AppIcon';

interface AchievementCardProps {
  achievement: Achievement;
  userStats: Record<string, number>;
  unlocked?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AchievementCard({
  achievement,
  userStats,
  unlocked,
  showProgress = true,
  size = 'md'
}: AchievementCardProps) {
  const progress = checkAchievementProgress(achievement, userStats);
  const isUnlocked = unlocked ?? progress.unlocked;

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  const iconSizes = {
    sm: 32,
    md: 48,
    lg: 64
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${sizeClasses[size]} bg-card border border-border rounded-xl shadow-lg transition-all ${
        isUnlocked ? 'opacity-100' : 'opacity-60 grayscale'
      }`}
    >
      <div className="flex gap-4">
        {/* Achievement Icon */}
        <motion.div
          animate={isUnlocked ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: isUnlocked ? Infinity : 0, repeatDelay: 3 }}
          className={`flex-shrink-0 flex items-center justify-center rounded-full ${
            isUnlocked
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
              : 'bg-muted'
          }`}
          style={{
            width: iconSizes[size],
            height: iconSizes[size],
            fontSize: iconSizes[size] * 0.6
          }}
        >
          {achievement.icon}
        </motion.div>

        {/* Achievement Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-foreground truncate">
              {achievement.name}
            </h3>
            {isUnlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-green-500 flex-shrink-0" />
              </motion.div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {achievement.description}
          </p>

          {/* Rarity and XP */}
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs font-semibold ${getRarityColor(achievement.rarity)}`}>
              {getRarityLabel(achievement.rarity)}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="SparklesIcon" size={12} />
              +{achievement.xpReward} XP
            </span>
          </div>

          {/* Progress Bar */}
          {showProgress && !isUnlocked && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {progress.current} / {progress.required}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}