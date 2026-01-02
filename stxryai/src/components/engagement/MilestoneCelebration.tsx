'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  milestoneCelebrationService, 
  CelebrationEvent,
  Milestone 
} from '@/services/milestoneCelebrationService';

// ========================================
// TYPES
// ========================================

interface MilestoneCelebrationProps {
  className?: string;
  onClose?: () => void;
  onClaimReward?: (milestoneId: string) => void;
}

interface ParticleProps {
  type: 'confetti' | 'fireworks' | 'sparkle' | 'glow' | 'legendary';
  delay: number;
}

// ========================================
// CELEBRATION ANIMATIONS
// ========================================

const CONFETTI_COLORS = ['#00F5D4', '#B794F6', '#F687B3', '#68D391', '#F6E05E', '#FC8181'];

function Particle({ type, delay }: ParticleProps) {
  const randomX = Math.random() * 100;
  const randomDuration = 2 + Math.random() * 2;
  const randomSize = type === 'confetti' ? 8 + Math.random() * 8 : 4 + Math.random() * 4;
  const randomColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  const randomRotation = Math.random() * 360;

  if (type === 'confetti') {
    return (
      <motion.div
        className="absolute"
        style={{
          left: `${randomX}%`,
          top: '-20px',
          width: randomSize,
          height: randomSize * 0.6,
          backgroundColor: randomColor,
          borderRadius: '2px',
        }}
        initial={{ y: 0, rotate: 0, opacity: 1 }}
        animate={{
          y: '120vh',
          rotate: randomRotation + 720,
          opacity: [1, 1, 0],
          x: [0, (Math.random() - 0.5) * 200],
        }}
        transition={{
          duration: randomDuration,
          delay,
          ease: [0.1, 0.8, 0.2, 1],
        }}
      />
    );
  }

  if (type === 'sparkle') {
    return (
      <motion.div
        className="absolute"
        style={{
          left: `${randomX}%`,
          top: `${Math.random() * 100}%`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.5, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.5,
          delay,
          repeat: 2,
          repeatDelay: Math.random() * 0.5,
        }}
      >
        <svg width={randomSize * 3} height={randomSize * 3} viewBox="0 0 24 24" fill={randomColor}>
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </motion.div>
    );
  }

  // Fireworks
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${20 + Math.random() * 60}%`,
        bottom: '10%',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 2, 2.5],
        opacity: [0, 1, 0],
        y: [0, -(100 + Math.random() * 200)],
      }}
      transition={{
        duration: 1.5,
        delay,
        times: [0, 0.3, 1],
      }}
    >
      {/* Burst effect */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: 4,
            height: 4,
            backgroundColor: randomColor,
            borderRadius: '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos((i * Math.PI * 2) / 8) * 50,
            y: Math.sin((i * Math.PI * 2) / 8) * 50,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            delay: delay + 0.3,
          }}
        />
      ))}
    </motion.div>
  );
}

function CelebrationBackground({ type }: { type: CelebrationEvent['animationType'] }) {
  const particleCount = type === 'epic' ? 100 : type === 'fireworks' ? 30 : 50;
  const particleType = type === 'fireworks' || type === 'epic' ? 'fireworks' : type === 'sparkle' || type === 'glow' ? 'sparkle' : 'confetti';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(particleCount)].map((_, i) => (
        <Particle 
          key={i} 
          type={particleType}
          delay={i * 0.02} 
        />
      ))}
      
      {/* Glow effect for epic celebrations */}
      {(type === 'epic' || type === 'glow') && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(183, 148, 246, 0.3), transparent 70%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.4] }}
          transition={{ duration: 2 }}
        />
      )}
    </div>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export function MilestoneCelebration({ 
  className = '',
  onClose,
  onClaimReward,
}: MilestoneCelebrationProps) {
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationEvent | null>(null);
  const [queue, setQueue] = useState<CelebrationEvent[]>([]);

  // Subscribe to celebration events
  useEffect(() => {
    const unsubscribe = milestoneCelebrationService.onCelebration((event) => {
      if (currentCelebration) {
        setQueue(prev => [...prev, event]);
      } else {
        setCurrentCelebration(event);
      }
    });

    // Check for pending celebrations on mount
    const pending = milestoneCelebrationService.getPendingCelebrations();
    if (pending.length > 0) {
      setCurrentCelebration(pending[0]);
      setQueue(pending.slice(1));
    }

    return () => unsubscribe();
  }, [currentCelebration]);

  const handleClose = useCallback(() => {
    // Show next celebration or close
    if (queue.length > 0) {
      setCurrentCelebration(queue[0]);
      setQueue(prev => prev.slice(1));
    } else {
      setCurrentCelebration(null);
      onClose?.();
    }
  }, [queue, onClose]);

  const handleClaimReward = useCallback(async () => {
    if (currentCelebration) {
      onClaimReward?.(currentCelebration.milestone.id);
      handleClose();
    }
  }, [currentCelebration, onClaimReward, handleClose]);

  if (!currentCelebration) return null;

  const { milestone, animationType } = currentCelebration;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-void-950/80 backdrop-blur-sm"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Celebration effects */}
        <CelebrationBackground type={animationType} />

        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-md mx-4"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className={`
            rounded-2xl overflow-hidden
            ${animationType === 'epic' 
              ? 'bg-gradient-to-br from-yellow-500/20 via-void-900 to-purple-500/20 border-2 border-yellow-500/50'
              : animationType === 'fireworks'
                ? 'bg-gradient-to-br from-pink-500/20 via-void-900 to-cyan-500/20 border border-pink-500/30'
                : 'bg-void-900 border border-void-700'
            }
          `}>
            {/* Icon */}
            <div className="pt-8 pb-4 text-center">
              <motion.div
                className="inline-block text-7xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, delay: 0.2 }}
              >
                {milestone.icon}
              </motion.div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 text-center">
              <motion.h2
                className={`text-2xl font-bold mb-2 ${
                  animationType === 'epic' ? 'text-yellow-400' :
                  animationType === 'legendary' ? 'text-purple-400' :
                  'text-void-100'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {milestone.title}
              </motion.h2>

              <motion.p
                className="text-void-400 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {milestone.description}
              </motion.p>

              {/* Rewards */}
              <motion.div
                className="flex items-center justify-center gap-4 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="px-4 py-2 rounded-lg bg-spectral-cyan/20 border border-spectral-cyan/30">
                  <span className="text-spectral-cyan font-bold">+{milestone.xpReward} XP</span>
                </div>
                {milestone.badgeId && (
                  <div className="px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                    <span className="text-yellow-400 font-bold">🏅 New Badge!</span>
                  </div>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 rounded-xl bg-void-800 text-void-300 hover:bg-void-700 transition-colors"
                >
                  Close
                </button>
                <motion.button
                  onClick={handleClaimReward}
                  className={`
                    flex-1 px-4 py-3 rounded-xl font-semibold transition-all
                    ${animationType === 'epic'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-void-950 hover:from-yellow-400 hover:to-orange-400'
                      : 'bg-gradient-to-r from-spectral-cyan to-spectral-violet text-void-950 hover:from-spectral-cyan/90 hover:to-spectral-violet/90'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Claim Reward
                </motion.button>
              </motion.div>

              {/* Queue indicator */}
              {queue.length > 0 && (
                <motion.p
                  className="mt-4 text-sm text-void-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  +{queue.length} more milestone{queue.length > 1 ? 's' : ''} to celebrate!
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ========================================
// MILESTONE PROGRESS COMPONENT
// ========================================

interface MilestoneProgressProps {
  milestone: Milestone;
  currentValue: number;
  className?: string;
}

export function MilestoneProgress({ milestone, currentValue, className = '' }: MilestoneProgressProps) {
  const progress = Math.min(100, (currentValue / milestone.value) * 100);
  const isComplete = currentValue >= milestone.value;

  return (
    <div className={`p-3 rounded-lg bg-void-800/50 border border-void-700/50 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center text-xl
          ${isComplete ? 'bg-green-500/20' : 'bg-void-700'}
        `}>
          {isComplete ? '✓' : milestone.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isComplete ? 'text-green-400' : 'text-void-200'}`}>
            {milestone.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-void-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  isComplete ? 'bg-green-500' : 'bg-spectral-cyan'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-void-500">
              {currentValue}/{milestone.value}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-spectral-cyan">+{milestone.xpReward} XP</span>
        </div>
      </div>
    </div>
  );
}

export default MilestoneCelebration;

