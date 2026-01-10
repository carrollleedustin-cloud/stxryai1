'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Zap,
  Star,
  Trophy,
  Gift,
  Flame,
  Droplet,
  Wind,
  Mountain,
  X,
  Settings,
  ChevronRight,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Pet {
  id: string;
  name: string;
  type: PetType;
  element: PetElement;
  personality: PetPersonality;
  evolutionStage: EvolutionStage;
  level: number;
  xp: number;
  stats: PetStats;
  mood: PetMood;
  accessories: PetAccessory[];
  abilities: PetAbility[];
  traits: PetTrait[];
  appearance: PetAppearance;
}

type PetType = 'dragon' | 'phoenix' | 'unicorn' | 'griffin' | 'kitsune' | 'celestial';
type PetElement = 'fire' | 'water' | 'earth' | 'air' | 'light' | 'shadow' | 'cosmic';
type PetPersonality = 'playful' | 'wise' | 'brave' | 'gentle' | 'mischievous' | 'noble';
type EvolutionStage = 'egg' | 'hatchling' | 'juvenile' | 'adult' | 'elder' | 'legendary';
type PetMood = 'happy' | 'excited' | 'content' | 'sleepy' | 'hungry' | 'playful';

interface PetStats {
  happiness: number;
  energy: number;
  hunger: number;
  affection: number;
  intelligence: number;
  strength: number;
}

interface PetAccessory {
  id: string;
  name: string;
  type: 'hat' | 'collar' | 'wings' | 'aura' | 'particle';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect?: string;
}

interface PetAbility {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number;
  lastUsed?: Date;
}

interface PetTrait {
  id: string;
  name: string;
  description: string;
  bonus: string;
}

interface PetAppearance {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pattern: 'solid' | 'gradient' | 'spots' | 'stripes' | 'cosmic';
  glow: boolean;
  particles: boolean;
  size: 'small' | 'medium' | 'large';
}

// ============================================================================
// MODERN PET COMPONENT
// ============================================================================

export default function ModernPetSystem() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'customize'>('stats');
  const [isInteracting, setIsInteracting] = useState(false);
  const controls = useAnimation();

  // Initialize pet
  useEffect(() => {
    // Load pet from database or create new one
    const defaultPet: Pet = {
      id: 'pet-1',
      name: 'Lumina',
      type: 'dragon',
      element: 'cosmic',
      personality: 'wise',
      evolutionStage: 'adult',
      level: 15,
      xp: 2500,
      stats: {
        happiness: 95,
        energy: 80,
        hunger: 60,
        affection: 90,
        intelligence: 85,
        strength: 75,
      },
      mood: 'content',
      accessories: [
        {
          id: 'acc-1',
          name: 'Cosmic Crown',
          type: 'hat',
          rarity: 'legendary',
          effect: '+10% XP gain',
        },
      ],
      abilities: [
        {
          id: 'ability-1',
          name: 'Inspiration Burst',
          description: 'Grants temporary writing speed boost',
          icon: '✨',
          cooldown: 3600000, // 1 hour
        },
        {
          id: 'ability-2',
          name: 'Story Insight',
          description: 'Provides AI-powered story suggestions',
          icon: '🔮',
          cooldown: 7200000, // 2 hours
        },
      ],
      traits: [
        {
          id: 'trait-1',
          name: 'Cosmic Wisdom',
          description: 'Born from stardust',
          bonus: '+15% AI quality',
        },
      ],
      appearance: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#ec4899',
        accentColor: '#fbbf24',
        pattern: 'cosmic',
        glow: true,
        particles: true,
        size: 'medium',
      },
    };

    setPet(defaultPet);
  }, []);

  // Idle animations
  useEffect(() => {
    const animate = async () => {
      await controls.start({
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      });
    };

    animate();
  }, [controls]);

  // Handle pet interaction
  const handleInteraction = async (type: 'pet' | 'feed' | 'play') => {
    setIsInteracting(true);

    // Animate based on interaction
    switch (type) {
      case 'pet':
        await controls.start({
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0],
          transition: { duration: 0.5 },
        });
        break;
      case 'feed':
        await controls.start({
          y: [0, -20, 0],
          transition: { duration: 0.6 },
        });
        break;
      case 'play':
        await controls.start({
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          transition: { duration: 1 },
        });
        break;
    }

    // Update stats
    if (pet) {
      setPet({
        ...pet,
        stats: {
          ...pet.stats,
          happiness: Math.min(pet.stats.happiness + 5, 100),
          affection: Math.min(pet.stats.affection + 3, 100),
        },
      });
    }

    setIsInteracting(false);
  };

  if (!pet) return null;

  return (
    <>
      {/* Floating Pet Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pet Container with Modern Glassmorphism */}
        <div className="relative">
          {/* Glow Effect */}
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${pet.appearance.primaryColor}, ${pet.appearance.secondaryColor})`,
            }}
          />

          {/* Main Pet Display */}
          <motion.div
            animate={controls}
            className="relative w-24 h-24 rounded-full backdrop-blur-md border-2 flex items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${pet.appearance.primaryColor}40, ${pet.appearance.secondaryColor}40)`,
              borderColor: `${pet.appearance.accentColor}80`,
              boxShadow: `0 8px 32px ${pet.appearance.primaryColor}40`,
            }}
          >
            {/* Cosmic Background Pattern */}
            {pet.appearance.pattern === 'cosmic' && (
              <div className="absolute inset-0 opacity-30">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Pet Icon/Avatar */}
            <div className="relative z-10 text-4xl">{getPetIcon(pet.type, pet.element)}</div>

            {/* Particle Effects */}
            {pet.appearance.particles && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: pet.appearance.accentColor,
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 60],
                      y: [0, (Math.random() - 0.5) * 60],
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Level Badge */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {pet.level}
            </div>

            {/* Mood Indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <div className="text-lg">{getMoodEmoji(pet.mood)}</div>
            </div>
          </motion.div>
        </div>
      </motion.button>

      {/* Pet Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${pet.appearance.primaryColor}20, ${pet.appearance.secondaryColor}20)`,
                backdropFilter: 'blur(20px)',
                border: `2px solid ${pet.appearance.accentColor}40`,
              }}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>

                <div className="flex items-center gap-4">
                  {/* Pet Display */}
                  <motion.div
                    animate={controls}
                    className="w-32 h-32 rounded-2xl backdrop-blur-md border-2 flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${pet.appearance.primaryColor}, ${pet.appearance.secondaryColor})`,
                      borderColor: pet.appearance.accentColor,
                      boxShadow: `0 0 40px ${pet.appearance.primaryColor}60`,
                    }}
                  >
                    <div className="text-6xl">{getPetIcon(pet.type, pet.element)}</div>

                    {/* Glow Effect */}
                    {pet.appearance.glow && (
                      <div
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: `radial-gradient(circle, ${pet.appearance.accentColor}40, transparent)`,
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Pet Info */}
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-1">{pet.name}</h2>
                    <p className="text-white/70 mb-2">
                      Level {pet.level} {getEvolutionStageName(pet.evolutionStage)}{' '}
                      {getPetTypeName(pet.type)}
                    </p>

                    {/* XP Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-white/60">
                        <span>
                          XP: {pet.xp} / {getXPForNextLevel(pet.level)}
                        </span>
                        <span>{Math.floor((pet.xp / getXPForNextLevel(pet.level)) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${pet.appearance.primaryColor}, ${pet.appearance.accentColor})`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(pet.xp / getXPForNextLevel(pet.level)) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {(['stats', 'abilities', 'customize'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-white border-b-2'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                    style={{
                      borderColor: activeTab === tab ? pet.appearance.accentColor : 'transparent',
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    {/* Stats Grid */}
                    {Object.entries(pet.stats).map(([stat, value]) => (
                      <div key={stat}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/80 capitalize flex items-center gap-2">
                            {getStatIcon(stat)}
                            {stat}
                          </span>
                          <span className="text-white font-medium">{value}/100</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: getStatGradient(stat, pet.appearance),
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Traits */}
                    <div className="mt-6">
                      <h3 className="text-white font-semibold mb-3">Traits</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {pet.traits.map((trait) => (
                          <div
                            key={trait.id}
                            className="p-3 rounded-xl backdrop-blur-md border border-white/10"
                            style={{
                              background: `${pet.appearance.primaryColor}20`,
                            }}
                          >
                            <div className="font-medium text-white">{trait.name}</div>
                            <div className="text-xs text-white/60">{trait.description}</div>
                            <div className="text-xs text-green-400 mt-1">{trait.bonus}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'abilities' && (
                  <div className="space-y-3">
                    {pet.abilities.map((ability) => {
                      const isOnCooldown =
                        ability.lastUsed &&
                        Date.now() - ability.lastUsed.getTime() < ability.cooldown;

                      return (
                        <motion.button
                          key={ability.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isOnCooldown}
                          className="w-full p-4 rounded-xl backdrop-blur-md border border-white/10 text-left transition-all disabled:opacity-50"
                          style={{
                            background: `${pet.appearance.primaryColor}20`,
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{ability.icon}</div>
                            <div className="flex-1">
                              <div className="font-semibold text-white">{ability.name}</div>
                              <div className="text-sm text-white/70 mt-1">
                                {ability.description}
                              </div>
                              {isOnCooldown && (
                                <div className="text-xs text-orange-400 mt-2">
                                  Cooldown: {formatCooldown(ability.cooldown)}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="text-white/40" size={20} />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'customize' && (
                  <div className="space-y-6">
                    {/* Accessories */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Accessories</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {pet.accessories.map((accessory) => (
                          <div
                            key={accessory.id}
                            className="p-3 rounded-xl backdrop-blur-md border border-white/10"
                            style={{
                              background: `${getRarityColor(accessory.rarity)}20`,
                              borderColor: `${getRarityColor(accessory.rarity)}40`,
                            }}
                          >
                            <div className="font-medium text-white text-sm">{accessory.name}</div>
                            <div className="text-xs text-white/60 mt-1">{accessory.type}</div>
                            {accessory.effect && (
                              <div className="text-xs text-green-400 mt-1">{accessory.effect}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Color Customization */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Colors</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Primary</label>
                          <input
                            type="color"
                            value={pet.appearance.primaryColor}
                            onChange={(e) =>
                              setPet({
                                ...pet,
                                appearance: { ...pet.appearance, primaryColor: e.target.value },
                              })
                            }
                            className="w-full h-10 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Secondary</label>
                          <input
                            type="color"
                            value={pet.appearance.secondaryColor}
                            onChange={(e) =>
                              setPet({
                                ...pet,
                                appearance: { ...pet.appearance, secondaryColor: e.target.value },
                              })
                            }
                            className="w-full h-10 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Accent</label>
                          <input
                            type="color"
                            value={pet.appearance.accentColor}
                            onChange={(e) =>
                              setPet({
                                ...pet,
                                appearance: { ...pet.appearance, accentColor: e.target.value },
                              })
                            }
                            className="w-full h-10 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interaction Buttons */}
              <div className="p-6 border-t border-white/10 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInteraction('pet')}
                  disabled={isInteracting}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-white backdrop-blur-md border border-white/20 transition-all"
                  style={{
                    background: `${pet.appearance.primaryColor}40`,
                  }}
                >
                  <Heart className="inline mr-2" size={18} />
                  Pet
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInteraction('feed')}
                  disabled={isInteracting}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-white backdrop-blur-md border border-white/20 transition-all"
                  style={{
                    background: `${pet.appearance.secondaryColor}40`,
                  }}
                >
                  <Sparkles className="inline mr-2" size={18} />
                  Feed
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInteraction('play')}
                  disabled={isInteracting}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-white backdrop-blur-md border border-white/20 transition-all"
                  style={{
                    background: `${pet.appearance.accentColor}40`,
                  }}
                >
                  <Zap className="inline mr-2" size={18} />
                  Play
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPetIcon(type: PetType, element: PetElement): string {
  const icons: Record<PetType, string> = {
    dragon: '🐉',
    phoenix: '🔥',
    unicorn: '🦄',
    griffin: '🦅',
    kitsune: '🦊',
    celestial: '⭐',
  };

  return icons[type];
}

function getMoodEmoji(mood: PetMood): string {
  const emojis: Record<PetMood, string> = {
    happy: '😊',
    excited: '🤩',
    content: '😌',
    sleepy: '😴',
    hungry: '🍖',
    playful: '🎮',
  };

  return emojis[mood];
}

function getStatIcon(stat: string): JSX.Element {
  const icons: Record<string, JSX.Element> = {
    happiness: <Heart size={16} />,
    energy: <Zap size={16} />,
    hunger: <Sparkles size={16} />,
    affection: <Heart size={16} />,
    intelligence: <Star size={16} />,
    strength: <Trophy size={16} />,
  };

  return icons[stat] || <Star size={16} />;
}

function getStatGradient(stat: string, appearance: PetAppearance): string {
  const gradients: Record<string, string> = {
    happiness: `linear-gradient(90deg, #ec4899, #f472b6)`,
    energy: `linear-gradient(90deg, #eab308, #fbbf24)`,
    hunger: `linear-gradient(90deg, #f97316, #fb923c)`,
    affection: `linear-gradient(90deg, #ef4444, #f87171)`,
    intelligence: `linear-gradient(90deg, #8b5cf6, #a78bfa)`,
    strength: `linear-gradient(90deg, #3b82f6, #60a5fa)`,
  };

  return (
    gradients[stat] ||
    `linear-gradient(90deg, ${appearance.primaryColor}, ${appearance.accentColor})`
  );
}

function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
  };

  return colors[rarity] || '#9ca3af';
}

function getPetTypeName(type: PetType): string {
  const names: Record<PetType, string> = {
    dragon: 'Dragon',
    phoenix: 'Phoenix',
    unicorn: 'Unicorn',
    griffin: 'Griffin',
    kitsune: 'Kitsune',
    celestial: 'Celestial Being',
  };

  return names[type];
}

function getEvolutionStageName(stage: EvolutionStage): string {
  const names: Record<EvolutionStage, string> = {
    egg: 'Egg',
    hatchling: 'Hatchling',
    juvenile: 'Juvenile',
    adult: 'Adult',
    elder: 'Elder',
    legendary: 'Legendary',
  };

  return names[stage];
}

function getXPForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level));
}

function formatCooldown(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
