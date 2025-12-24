'use client';

/**
 * Evolution Celebration Component
 * A beautiful, cinematic celebration when a pet evolves.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePet } from '@/contexts/PetContext';
import StoryPetDisplay from './StoryPetDisplay';
import { Star, Sparkles, Crown, Flame, Zap } from 'lucide-react';

interface EvolutionCelebrationProps {
  onComplete?: () => void;
}

export default function EvolutionCelebration({ onComplete }: EvolutionCelebrationProps) {
  const { pet, showEvolutionCelebration, dismissEvolutionCelebration, pendingEvolution } = usePet();
  const [stage, setStage] = useState<'reveal' | 'celebrate' | 'stats'>('reveal');
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);
  
  // Generate confetti on mount
  useEffect(() => {
    if (showEvolutionCelebration) {
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7', '#ec4899'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 2,
      }));
      setConfetti(newConfetti);
      
      // Progress through stages
      const timer1 = setTimeout(() => setStage('celebrate'), 2000);
      const timer2 = setTimeout(() => setStage('stats'), 4000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [showEvolutionCelebration]);
  
  const handleDismiss = () => {
    dismissEvolutionCelebration();
    onComplete?.();
    setStage('reveal');
  };
  
  if (!showEvolutionCelebration || !pet || !pendingEvolution) return null;
  
  const evolutionEmoji: Record<string, string> = {
    egg: '🥚',
    baby: '✨',
    juvenile: '🌟',
    adult: '⭐',
    elder: '👑',
    legendary: '🏆',
  };
  
  const evolutionTitle: Record<string, string> = {
    egg: 'Hatched!',
    baby: 'Growing Stronger!',
    juvenile: 'Maturing!',
    adult: 'Fully Grown!',
    elder: 'Wise Elder!',
    legendary: 'LEGENDARY!',
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={handleDismiss}
      >
        {/* Darkened background */}
        <motion.div 
          className="absolute inset-0 bg-void-absolute/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                left: `${particle.x}%`,
                backgroundColor: particle.color,
                boxShadow: `0 0 6px ${particle.color}`,
              }}
              initial={{ y: '-10%', opacity: 0 }}
              animate={{ 
                y: '110%', 
                opacity: [0, 1, 1, 0],
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 4 + Math.random() * 2,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </div>
        
        {/* Radial light burst */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${pet.traits.primaryColor}40 0%, transparent 50%)`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Main content */}
        <motion.div
          className="relative z-10 text-center max-w-lg mx-4"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          {/* Evolution badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
            style={{
              background: `linear-gradient(135deg, ${pet.traits.primaryColor}, ${pet.traits.secondaryColor})`,
              boxShadow: `0 0 60px ${pet.traits.primaryColor}80`,
            }}
          >
            <span className="text-5xl">{evolutionEmoji[pendingEvolution]}</span>
          </motion.div>
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-display text-4xl md:text-5xl text-white mb-2"
          >
            {pet.name}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-bold mb-8"
            style={{ color: pet.traits.primaryColor }}
          >
            {evolutionTitle[pendingEvolution]}
          </motion.p>
          
          {/* Pet display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center mb-8"
          >
            <StoryPetDisplay size="lg" showInteractions={false} showStats={false} />
          </motion.div>
          
          {/* Evolution info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-void-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6"
          >
            <p className="text-lg text-ghost-300 mb-4">
              Through countless adventures together, your bond has grown stronger!
            </p>
            
            <div className="flex justify-center gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-xl font-bold text-white">{pet.stats.level}</span>
                </div>
                <p className="text-xs text-ghost-500">Level</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xl font-bold text-white">{pet.stats.currentStreak}</span>
                </div>
                <p className="text-xs text-ghost-500">Streak</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-xl font-bold text-white">{pet.stats.storiesRead}</span>
                </div>
                <p className="text-xs text-ghost-500">Stories</p>
              </div>
            </div>
          </motion.div>
          
          {/* Continue button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDismiss}
            className="px-8 py-4 rounded-xl font-bold text-lg text-white"
            style={{
              background: `linear-gradient(135deg, ${pet.traits.primaryColor}, ${pet.traits.secondaryColor})`,
              boxShadow: `0 4px 20px ${pet.traits.primaryColor}60`,
            }}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Continue Adventure
              <Sparkles className="w-5 h-5" />
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

