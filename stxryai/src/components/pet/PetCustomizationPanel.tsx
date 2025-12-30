'use client';

/**
 * Pet Customization Panel
 * Allows users to customize their pet's appearance with accessories and colors
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePet } from '@/contexts/PetContext';
import StoryPetDisplay from './StoryPetDisplay';
import { X, Palette, Sparkles, Crown, Wand2, Star, Gift } from 'lucide-react';
import { PetAccessory } from '@/types/pet';

export default function PetCustomizationPanel({ onClose }: { onClose: () => void }) {
  const { pet, hasPet } = usePet();
  const [selectedCategory, setSelectedCategory] = useState<'accessories' | 'colors' | 'effects'>('accessories');
  const [availableAccessories, setAvailableAccessories] = useState<PetAccessory[]>([]);

  useEffect(() => {
    if (pet) {
      // Generate available accessories based on pet level and achievements
      const accessories: PetAccessory[] = [
        // Common accessories (always available)
        { id: '1', name: 'Reading Glasses', type: 'glasses', rarity: 'common', unlockedAt: new Date().toISOString(), equipped: false },
        { id: '2', name: 'Book Collar', type: 'collar', rarity: 'common', unlockedAt: new Date().toISOString(), equipped: false },
        
        // Level-based unlocks
        ...(pet.stats.level >= 5 ? [{
          id: '3', name: 'Scholar Hat', type: 'hat', rarity: 'rare', unlockedAt: new Date().toISOString(), equipped: false
        }] : []),
        
        ...(pet.stats.level >= 10 ? [{
          id: '4', name: 'Storyteller Crown', type: 'crown', rarity: 'epic', unlockedAt: new Date().toISOString(), equipped: false
        }] : []),
        
        // Achievement-based unlocks
        ...(pet.stats.storiesRead >= 10 ? [{
          id: '5', name: 'Bookworm Scarf', type: 'scarf', rarity: 'rare', unlockedAt: new Date().toISOString(), equipped: false
        }] : []),
        
        ...(pet.stats.currentStreak >= 7 ? [{
          id: '6', name: 'Streak Aura', type: 'aura', rarity: 'epic', unlockedAt: new Date().toISOString(), equipped: false
        }] : []),
        
        // Genre-based unlocks
        ...(pet.stats.genresExplored.length >= 5 ? [{
          id: '7', name: 'Explorer Wings', type: 'wings', rarity: 'rare', unlockedAt: new Date().toISOString(), equipped: false
        }] : []),
        
        // Legendary unlocks
        ...(pet.evolutionStage === 'legendary' ? [{
          id: '8', name: 'Legendary Crown', type: 'crown', rarity: 'legendary', unlockedAt: new Date().toISOString(), equipped: false
        }] : []),
      ];
      
      setAvailableAccessories(accessories);
    }
  }, [pet]);

  if (!hasPet || !pet) return null;

  const equippedAccessories = pet.accessories.filter(a => a.equipped);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-void-900/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-void-black border-2 border-white/20 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Customize {pet.name}</h2>
            <p className="text-ghost-400">Make your companion uniquely yours!</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-ghost-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pet Preview */}
          <div className="lg:col-span-1">
            <div className="bg-void-elevated/50 rounded-2xl p-8 flex flex-col items-center">
              <StoryPetDisplay size="lg" showStats={false} showInteractions={false} />
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-white">{pet.name}</p>
                <p className="text-sm text-ghost-400 capitalize">
                  Lv.{pet.stats.level} {pet.evolutionStage} {pet.baseType}
                </p>
              </div>
              
              {/* Equipped Accessories */}
              {equippedAccessories.length > 0 && (
                <div className="mt-6 w-full">
                  <p className="text-sm text-ghost-400 mb-3">Equipped:</p>
                  <div className="space-y-2">
                    {equippedAccessories.map(acc => (
                      <div key={acc.id} className="bg-void-black/50 rounded-lg p-2 text-sm text-white">
                        {acc.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customization Options */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory('accessories')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === 'accessories'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-void-elevated text-ghost-400 hover:bg-void-elevated/80'
                }`}
              >
                <Crown className="w-5 h-5 inline mr-2" />
                Accessories
              </button>
              <button
                onClick={() => setSelectedCategory('colors')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === 'colors'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-void-elevated text-ghost-400 hover:bg-void-elevated/80'
                }`}
              >
                <Palette className="w-5 h-5 inline mr-2" />
                Colors
              </button>
              <button
                onClick={() => setSelectedCategory('effects')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === 'effects'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-void-elevated text-ghost-400 hover:bg-void-elevated/80'
                }`}
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                Effects
              </button>
            </div>

            {/* Accessories */}
            {selectedCategory === 'accessories' && (
              <div className="grid grid-cols-2 gap-4">
                {availableAccessories.map(accessory => {
                  const isEquipped = pet.accessories.some(a => a.id === accessory.id && a.equipped);
                  const rarityColors = {
                    common: 'border-gray-500 bg-gray-500/20',
                    rare: 'border-blue-500 bg-blue-500/20',
                    epic: 'border-purple-500 bg-purple-500/20',
                    legendary: 'border-amber-500 bg-amber-500/20',
                  };

                  return (
                    <motion.div
                      key={accessory.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-xl border-2 ${
                        rarityColors[accessory.rarity]
                      } ${isEquipped ? 'ring-2 ring-white' : ''} cursor-pointer`}
                      onClick={() => {
                        // TODO: Toggle accessory
                        console.log('Toggle accessory:', accessory.id);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{accessory.name}</span>
                        {isEquipped && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-xs text-ghost-400 capitalize mb-2">{accessory.type} • {accessory.rarity}</p>
                      {accessory.rarity === 'legendary' && (
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <Gift className="w-3 h-3" />
                          <span>Legendary Unlock</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Colors */}
            {selectedCategory === 'colors' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-3">Primary Color</label>
                  <div className="grid grid-cols-8 gap-3">
                    {['#ff6b35', '#00b4d8', '#606c38', '#caf0f8', '#ffd60a', '#a2d2ff', '#80b918', '#7b2cbf'].map(color => (
                      <button
                        key={color}
                        className="w-12 h-12 rounded-xl border-2 border-white/20 hover:border-white/50 transition-all"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          // TODO: Update primary color
                          console.log('Update color:', color);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-3">Secondary Color</label>
                  <div className="grid grid-cols-8 gap-3">
                    {['#f7c59f', '#90e0ef', '#dda15e', '#90e0ef', '#ffc300', '#bde0fe', '#d4e09b', '#9d4edd'].map(color => (
                      <button
                        key={color}
                        className="w-12 h-12 rounded-xl border-2 border-white/20 hover:border-white/50 transition-all"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          // TODO: Update secondary color
                          console.log('Update color:', color);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Effects */}
            {selectedCategory === 'effects' && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Sparkles', icon: Sparkles, unlocked: true },
                  { name: 'Rainbow Aura', icon: Wand2, unlocked: pet.stats.level >= 5 },
                  { name: 'Cosmic Glow', icon: Star, unlocked: pet.stats.level >= 10 },
                ].map(effect => (
                  <motion.div
                    key={effect.name}
                    whileHover={{ scale: 1.05 }}
                    className={`p-4 rounded-xl border-2 ${
                      effect.unlocked
                        ? 'border-purple-500 bg-purple-500/20 cursor-pointer'
                        : 'border-gray-700 bg-gray-700/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <effect.icon className="w-8 h-8 text-white mb-2" />
                    <p className="font-semibold text-white">{effect.name}</p>
                    {!effect.unlocked && (
                      <p className="text-xs text-ghost-400 mt-1">Unlock at level {effect.name === 'Rainbow Aura' ? 5 : 10}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

