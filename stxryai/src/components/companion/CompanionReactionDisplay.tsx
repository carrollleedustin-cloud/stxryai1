'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MessageCircle, Star, Zap } from 'lucide-react';
import { 
  companionReactionsService, 
  StoryEvent, 
  CompanionReaction 
} from '@/services/companionReactionsService';
import { UserPet } from '@/services/petSystem2Service';

interface CompanionReactionDisplayProps {
  pet: UserPet;
  position?: 'bottom-right' | 'bottom-left' | 'sidebar';
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export function CompanionReactionDisplay({
  pet,
  position = 'bottom-right',
  minimized = false,
  onToggleMinimize,
}: CompanionReactionDisplayProps) {
  const [currentReaction, setCurrentReaction] = useState<CompanionReaction | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [rememberedPrompt, setRememberedPrompt] = useState<string | null>(null);

  // Position classes
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'sidebar': 'relative',
  };

  // Trigger a reaction
  const triggerReaction = useCallback((event: StoryEvent, context?: { emotionalIntensity?: number; isRareEvent?: boolean }) => {
    const reaction = companionReactionsService.generateReaction(
      event,
      pet.personalityTraits,
      context
    );

    setCurrentReaction(reaction);
    setShowMessage(true);

    // Hide message after duration
    setTimeout(() => {
      setShowMessage(false);
    }, reaction.duration);

    // Clear reaction after animation
    setTimeout(() => {
      setCurrentReaction(null);
    }, reaction.duration + 500);
  }, [pet.personalityTraits]);

  // Expose trigger method via window for story reader integration
  useEffect(() => {
    (window as any).triggerCompanionReaction = triggerReaction;
    return () => {
      delete (window as any).triggerCompanionReaction;
    };
  }, [triggerReaction]);

  // Load a "remember when" prompt occasionally
  useEffect(() => {
    const loadRememberPrompt = async () => {
      if (Math.random() < 0.1) { // 10% chance on load
        const prompt = await companionReactionsService.getRememberWhenPrompt(
          pet.id,
          pet.userId
        );
        if (prompt) {
          setRememberedPrompt(prompt);
          setTimeout(() => setRememberedPrompt(null), 10000);
        }
      }
    };
    loadRememberPrompt();
  }, [pet.id, pet.userId]);

  // Animation variants based on reaction
  const getAnimationVariants = (animation?: string) => {
    switch (animation) {
      case 'bounce':
        return {
          animate: { y: [0, -15, 0], transition: { duration: 0.5, repeat: 2 } },
        };
      case 'spin':
        return {
          animate: { rotate: [0, 360], transition: { duration: 0.8 } },
        };
      case 'shake':
        return {
          animate: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4, repeat: 2 } },
        };
      case 'glow':
        return {
          animate: { scale: [1, 1.1, 1], opacity: [1, 0.8, 1], transition: { duration: 1, repeat: 2 } },
        };
      case 'cry':
        return {
          animate: { y: [0, 2, 0], transition: { duration: 0.3, repeat: 5 } },
        };
      case 'cheer':
        return {
          animate: { y: [0, -20, 0], rotate: [-5, 5, -5, 5, 0], transition: { duration: 0.6, repeat: 2 } },
        };
      case 'gasp':
        return {
          animate: { scale: [1, 1.3, 1], transition: { duration: 0.3 } },
        };
      case 'sparkle':
        return {
          animate: { scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'], transition: { duration: 0.5, repeat: 3 } },
        };
      case 'hearts':
        return {
          animate: { scale: [1, 1.2, 1], transition: { duration: 0.8, repeat: 2 } },
        };
      default:
        return {};
    }
  };

  // Particle effects
  const renderParticles = (effect?: string) => {
    if (!effect) return null;

    const particles = Array.from({ length: 10 }, (_, i) => i);
    
    const particleColors: Record<string, string[]> = {
      confetti: ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6'],
      tears: ['#60A5FA', '#93C5FD'],
      hearts: ['#F472B6', '#FB7185', '#EC4899'],
      stars: ['#FCD34D', '#FDE68A', '#F59E0B'],
      lightning: ['#FBBF24', '#FDE047', '#FFFFFF'],
      fire: ['#EF4444', '#F97316', '#FCD34D'],
      snow: ['#E0F2FE', '#BAE6FD', '#FFFFFF'],
    };

    const colors = particleColors[effect] || ['#8B5CF6'];

    return (
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {particles.map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: colors[i % colors.length],
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((i / particles.length) * Math.PI * 2) * 50,
              y: Math.sin((i / particles.length) * Math.PI * 2) * 50 - 30,
              opacity: 0,
              scale: effect === 'hearts' ? [1, 1.5, 0] : [1, 0.5, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
              ease: 'easeOut',
            }}
          >
            {effect === 'hearts' && '❤️'}
            {effect === 'stars' && '⭐'}
          </motion.div>
        ))}
      </div>
    );
  };

  if (minimized) {
    return (
      <motion.button
        onClick={onToggleMinimize}
        className={`${positionClasses[position]} z-40 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 flex items-center justify-center`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Heart className="w-6 h-6 text-white" fill="white" />
        {currentReaction && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </motion.button>
    );
  }

  return (
    <div className={`${positionClasses[position]} z-40`}>
      <motion.div
        className="relative bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Close/Minimize button */}
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-white/60 text-sm">−</span>
          </button>
        )}

        {/* Pet display */}
        <div className="relative flex items-center gap-3">
          {/* Pet avatar with reactions */}
          <motion.div
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 flex items-center justify-center"
            {...(currentReaction ? getAnimationVariants(currentReaction.animation) : {})}
          >
            {/* Pet face */}
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              {/* Eyes */}
              <div className="absolute top-3 left-3 w-2 h-2 bg-white rounded-full" />
              <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full" />
              {/* Mood-based expression */}
              <motion.div
                className="absolute bottom-3 w-4 h-1.5 bg-pink-300 rounded-full"
                animate={
                  currentReaction?.animation === 'cheer' || currentReaction?.animation === 'hearts'
                    ? { scaleX: [1, 1.3, 1] }
                    : currentReaction?.animation === 'cry'
                    ? { scaleY: [1, 0.5, 1] }
                    : {}
                }
              />
            </div>

            {/* Particle effects */}
            <AnimatePresence>
              {currentReaction?.effect && renderParticles(currentReaction.effect)}
            </AnimatePresence>
          </motion.div>

          {/* Pet info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {pet.customName || pet.species.displayName}
            </p>
            <p className="text-xs text-purple-300">
              Lv.{pet.level} • {pet.currentMood}
            </p>
          </div>
        </div>

        {/* Reaction message bubble */}
        <AnimatePresence>
          {showMessage && currentReaction?.message && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="mt-3 relative"
            >
              <div className="bg-white/10 rounded-xl px-3 py-2 text-sm text-white/90">
                <MessageCircle className="w-3 h-3 inline mr-1 text-purple-300" />
                {currentReaction.message}
              </div>
              {/* Speech bubble pointer */}
              <div className="absolute -top-1 left-4 w-2 h-2 bg-white/10 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remember when prompt */}
        <AnimatePresence>
          {rememberedPrompt && !showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2"
            >
              <Star className="w-3 h-3 inline mr-1 text-amber-400" />
              <span className="text-xs text-amber-200">{rememberedPrompt}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick interaction buttons */}
        <div className="mt-3 flex gap-2">
          <motion.button
            onClick={() => triggerReaction('achievement_unlocked', { emotionalIntensity: 90 })}
            className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 transition-colors flex items-center justify-center gap-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Heart className="w-3 h-3" /> Pet
          </motion.button>
          <motion.button
            onClick={() => triggerReaction('dramatic_moment', { emotionalIntensity: 70 })}
            className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70 transition-colors flex items-center justify-center gap-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="w-3 h-3" /> Excite
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default CompanionReactionDisplay;
