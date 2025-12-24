'use client';

/**
 * Pet Creation Wizard
 * Beautiful, immersive experience for creating your unique companion.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePet } from '@/contexts/PetContext';
import {
  Sparkles,
  Wand2,
  Heart,
  Star,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface PetCreationWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function PetCreationWizard({ onComplete, onCancel }: PetCreationWizardProps) {
  const { createPet, hasPet } = usePet();
  
  const [step, setStep] = useState(0);
  const [petName, setPetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');
  
  // Magical name suggestions based on reading themes
  const nameSuggestions = [
    'Nova', 'Luna', 'Ember', 'Sage', 'Echo',
    'Pixel', 'Whisper', 'Comet', 'Zephyr', 'Blaze',
    'Stardust', 'Nimbus', 'Glimmer', 'Frost', 'Nebula',
  ];
  
  // Animation for floating particles
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const emojis = ['✨', '⭐', '💫', '🌟', '✦', '★'];
      setParticles(prev => [
        ...prev.slice(-20),
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: 100 + Math.random() * 20,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        },
      ]);
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleCreate = useCallback(async () => {
    if (!petName.trim()) {
      setError('Please give your companion a name!');
      return;
    }
    
    setIsCreating(true);
    setError('');
    
    try {
      const success = await createPet(petName.trim());
      if (success) {
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else {
        setError('Something went wrong. Please try again!');
      }
    } catch (err) {
      setError('Failed to create companion. Please try again!');
    } finally {
      setIsCreating(false);
    }
  }, [petName, createPet, onComplete]);
  
  if (hasPet) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-void-absolute/95 backdrop-blur-xl"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ x: `${particle.x}%`, y: `${particle.y}%`, opacity: 0, scale: 0 }}
              animate={{ y: `${particle.y - 80}%`, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 3, ease: 'easeOut' }}
              className="absolute text-xl"
            >
              {particle.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Main card */}
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-void-elevated to-void-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Glowing top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-spectral-cyan via-spectral-violet to-spectral-rose" />
        
        {/* Content */}
        <div className="p-8 relative">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key="creation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-spectral-cyan/20 to-spectral-violet/20 border border-white/10 mb-4"
                  >
                    <Wand2 className="w-10 h-10 text-spectral-violet" />
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-display text-white mb-2"
                  >
                    Summon Your Companion
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-ghost-400"
                  >
                    A unique friend awaits, born from your story essence
                  </motion.p>
                </div>
                
                {/* Name input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <label className="block text-sm font-medium text-ghost-300 mb-2">
                    Give your companion a name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={petName}
                      onChange={e => {
                        setPetName(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter a magical name..."
                      maxLength={20}
                      className="w-full px-4 py-3 bg-void-black/50 border border-white/10 rounded-xl text-white placeholder-ghost-500 focus:outline-none focus:border-spectral-cyan/50 focus:ring-2 focus:ring-spectral-cyan/20 transition-all"
                    />
                    <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-spectral-cyan/50" />
                  </div>
                  
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>
                
                {/* Name suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <p className="text-xs text-ghost-500 mb-2">Or choose a suggested name:</p>
                  <div className="flex flex-wrap gap-2">
                    {nameSuggestions.slice(0, 10).map((name, i) => (
                      <motion.button
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPetName(name)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          petName === name
                            ? 'bg-spectral-cyan text-void-black'
                            : 'bg-void-elevated text-ghost-300 hover:bg-void-surface border border-white/5'
                        }`}
                      >
                        {name}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
                
                {/* Info card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-spectral-violet/10 border border-spectral-violet/20 rounded-xl p-4 mb-6"
                >
                  <div className="flex gap-3">
                    <Star className="w-5 h-5 text-spectral-violet shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white font-medium mb-1">Your pet will be unique!</p>
                      <p className="text-xs text-ghost-400">
                        Based on your account, your companion will have a one-of-a-kind appearance, 
                        personality, and element. It will grow and evolve as you read and interact!
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex gap-3"
                >
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="flex-1 py-3 px-4 rounded-xl text-ghost-400 hover:text-white hover:bg-void-elevated transition-all"
                    >
                      Maybe Later
                    </button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    disabled={isCreating || !petName.trim()}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-spectral-cyan to-spectral-violet text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Summoning...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Summon {petName || 'Companion'}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-spectral-cyan to-spectral-violet mb-6"
                >
                  <Heart className="w-12 h-12 text-white" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-display text-white mb-2"
                >
                  {petName} Has Arrived!
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-ghost-400"
                >
                  Your unique companion is ready for adventure!
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 flex justify-center"
                >
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                      >
                        <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

