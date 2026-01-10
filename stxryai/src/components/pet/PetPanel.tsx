'use client';

/**
 * Pet Panel
 * Floating panel that displays the pet companion in the UI.
 * Can be minimized/maximized and shows pet status.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePet } from '@/contexts/PetContext';
import StoryPetDisplay from './StoryPetDisplay';
import PetCreationWizard from './PetCreationWizard';
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  Settings,
  Book,
  Trophy,
  Flame,
  Heart,
  Star,
  Sparkles,
  Edit2,
  Check,
  Palette,
} from 'lucide-react';
import PetCustomizationPanel from './PetCustomizationPanel';

interface PetPanelProps {
  position?: 'bottom-right' | 'bottom-left' | 'sidebar';
  defaultMinimized?: boolean;
}

export default function PetPanel({
  position = 'bottom-right',
  defaultMinimized = false,
}: PetPanelProps) {
  const {
    pet,
    hasPet,
    loading,
    showPetPanel,
    setShowPetPanel,
    showEvolutionCelebration,
    dismissEvolutionCelebration,
    pendingEvolution,
    renamePet,
    getDialogue,
  } = usePet();

  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [showCreation, setShowCreation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [showCustomization, setShowCustomization] = useState(false);

  // Set greeting when pet loads
  useEffect(() => {
    if (pet) {
      setGreeting(getDialogue('greeting'));
    }
  }, [pet, getDialogue]);

  // Check if should prompt for pet creation
  useEffect(() => {
    if (!loading && !hasPet && showPetPanel) {
      setShowCreation(true);
    }
  }, [loading, hasPet, showPetPanel]);

  const handleRename = async () => {
    if (newName.trim() && newName !== pet?.name) {
      const success = await renamePet(newName.trim());
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    sidebar: 'relative',
  };

  // Don't render if loading or explicitly hidden
  if (loading || !showPetPanel) {
    return null;
  }

  // Show creation wizard if no pet
  if (!hasPet) {
    return showCreation ? (
      <PetCreationWizard
        onComplete={() => setShowCreation(false)}
        onCancel={() => {
          setShowCreation(false);
          setShowPetPanel(false);
        }}
      />
    ) : null;
  }

  if (!pet) return null;

  return (
    <>
      {/* Evolution Celebration Modal */}
      <AnimatePresence>
        {showEvolutionCelebration && pendingEvolution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void-absolute/90 backdrop-blur-xl"
            onClick={dismissEvolutionCelebration}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 20 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative bg-gradient-to-b from-void-elevated to-void-black border border-white/20 rounded-3xl p-8 max-w-md mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Celebration particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                    className="absolute text-xl"
                  >
                    {['🎉', '✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 5)]}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="mb-6"
              >
                <StoryPetDisplay size="lg" showInteractions={false} showStats={false} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-display text-white mb-2"
              >
                {pet.name} Evolved!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-spectral-cyan capitalize mb-4"
              >
                Now a {pendingEvolution} {pet.baseType}!
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-ghost-400 mb-6"
              >
                Your bond has grown stronger through countless adventures together!
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={dismissEvolutionCelebration}
                className="px-6 py-3 bg-gradient-to-r from-spectral-cyan to-spectral-violet text-white rounded-xl font-medium"
              >
                Amazing! ✨
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className={`${positionClasses[position]} z-40`}
      >
        <div className="bg-void-black/90 backdrop-blur-xl border-2 border-white/10 rounded-3xl shadow-2xl overflow-hidden min-w-[400px]">
          {/* Header - 3x bigger */}
          <div className="flex items-center justify-between px-6 py-4 bg-void-elevated/50 border-b-2 border-white/5">
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border-2 border-white/20"
                style={{ backgroundColor: pet.traits.primaryColor }}
              />
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    className="w-48 px-4 py-2 text-lg bg-void-black border-2 border-white/20 rounded-lg text-white"
                    autoFocus
                    maxLength={20}
                  />
                  <button onClick={handleRename} className="p-2 hover:bg-white/10 rounded-lg">
                    <Check className="w-6 h-6 text-green-400" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-bold text-white text-xl">{pet.name}</span>
                  <button
                    onClick={() => {
                      setNewName(pet.name);
                      setIsEditing(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg opacity-50 hover:opacity-100"
                  >
                    <Edit2 className="w-5 h-5 text-ghost-400" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustomization(true)}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
                title="Customize Pet"
              >
                <Palette className="w-6 h-6 text-ghost-400" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-6 h-6 text-ghost-400" />
                ) : (
                  <Minimize2 className="w-6 h-6 text-ghost-400" />
                )}
              </button>
              <button
                onClick={() => setShowPetPanel(false)}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-ghost-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {!isMinimized ? (
              <motion.div
                key="expanded"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-8">
                  {/* Pet display - 3x bigger */}
                  <div className="flex justify-center mb-8">
                    <StoryPetDisplay size="lg" showStats showInteractions />
                  </div>

                  {/* Greeting - 3x bigger */}
                  <div className="bg-void-elevated/50 rounded-xl p-6 mb-6">
                    <p className="text-xl text-ghost-300 italic text-center">"{greeting}"</p>
                  </div>

                  {/* Quick stats - 3x bigger */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-void-elevated/30 rounded-xl p-4">
                      <Book className="w-8 h-8 mx-auto mb-2 text-spectral-cyan" />
                      <p className="text-lg text-ghost-400 font-semibold">Stories</p>
                      <p className="text-2xl font-bold text-white">{pet.stats.storiesRead}</p>
                    </div>
                    <div className="bg-void-elevated/30 rounded-xl p-4">
                      <Flame className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                      <p className="text-lg text-ghost-400 font-semibold">Streak</p>
                      <p className="text-2xl font-bold text-white">{pet.stats.currentStreak}</p>
                    </div>
                    <div className="bg-void-elevated/30 rounded-xl p-4">
                      <Star className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                      <p className="text-lg text-ghost-400 font-semibold">Days</p>
                      <p className="text-2xl font-bold text-white">{pet.stats.daysActive}</p>
                    </div>
                  </div>

                  {/* Additional stats */}
                  <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                    <div className="bg-void-elevated/30 rounded-xl p-4">
                      <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                      <p className="text-lg text-ghost-400 font-semibold">Level</p>
                      <p className="text-2xl font-bold text-white">{pet.stats.level}</p>
                    </div>
                    <div className="bg-void-elevated/30 rounded-xl p-4">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                      <p className="text-lg text-ghost-400 font-semibold">XP</p>
                      <p className="text-2xl font-bold text-white">
                        {pet.stats.experience}/{pet.stats.experienceToNextLevel}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="minimized"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3"
              >
                <div className="flex items-center gap-4">
                  <StoryPetDisplay size="sm" showInteractions={false} showStats={false} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-ghost-400">Lv.{pet.stats.level}</span>
                      <span className="text-lg text-ghost-500 capitalize">
                        {pet.evolutionStage}
                      </span>
                    </div>
                    {/* Mini XP bar - 3x bigger */}
                    <div className="h-3 bg-void-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-spectral-cyan to-spectral-violet transition-all duration-500"
                        style={{
                          width: `${(pet.stats.experience / pet.stats.experienceToNextLevel) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Customization Panel */}
      <AnimatePresence>
        {showCustomization && <PetCustomizationPanel onClose={() => setShowCustomization(false)} />}
      </AnimatePresence>
    </>
  );
}
