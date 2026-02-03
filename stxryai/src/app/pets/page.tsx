'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Heart, Sparkles, Star, Zap, Moon, Sun, Cookie, Droplets,
  Brain, Sword, Wind, MessageCircle, Gem, Crown, Play,
  ChevronRight, Award, Gift, Palette, Music, Volume2, Settings,
  Info, TrendingUp, Activity
} from 'lucide-react';
import { petSystem2Service, UserPet, PetMood, PetSpecies } from '@/services/petSystem2Service';

export default function PetsPage() {
  const { user } = useAuth();
  
  const [pets, setPets] = useState<UserPet[]>([]);
  const [activePet, setActivePet] = useState<UserPet | null>(null);
  const [availableSpecies, setAvailableSpecies] = useState<PetSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [interactionCooldown, setInteractionCooldown] = useState(false);

  useEffect(() => {
    async function loadPets() {
      if (!user) return;

      try {
        const [userPets, species] = await Promise.all([
          petSystem2Service.getUserPets(user.id),
          petSystem2Service.getAvailableSpecies(),
        ]);

        setPets(userPets);
        setAvailableSpecies(species);
        
        if (userPets.length > 0) {
          setActivePet(userPets[0]);
        }
      } catch (error) {
        console.error('Error loading pets:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPets();
  }, [user]);

  const handleInteraction = useCallback(async (type: 'feed' | 'play' | 'pet') => {
    if (!activePet || !user || interactionCooldown) return;

    setInteractionCooldown(true);

    try {
      let result;
      switch (type) {
        case 'feed':
          result = await petSystem2Service.feedPet(activePet.id, user.id);
          break;
        case 'play':
          result = await petSystem2Service.playWithPet(activePet.id, user.id);
          break;
        case 'pet':
          result = await petSystem2Service.petPet(activePet.id, user.id);
          break;
      }

      // Refresh pet data
      const updatedPet = await petSystem2Service.getPet(activePet.id);
      if (updatedPet) {
        setActivePet(updatedPet);
        setPets(pets => pets.map(p => p.id === updatedPet.id ? updatedPet : p));
      }
    } catch (error) {
      console.error('Error during interaction:', error);
    } finally {
      setTimeout(() => setInteractionCooldown(false), 1000);
    }
  }, [activePet, user, interactionCooldown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-void-950 via-purple-950/20 to-void-950 flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <p className="text-void-400">Loading your companions...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-void-950 via-purple-950/10 to-void-950 overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, '-10%', '10%'],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-500/30" />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-void-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-3 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-xl"
              >
                <Heart className="w-7 h-7 text-pink-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Pet Companions
                </h1>
                <p className="text-void-400 text-sm">Your digital familiars await</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setShowAdoptModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-pink-500/25"
              >
                <Sparkles className="w-4 h-4" />
                Adopt New Pet
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {pets.length === 0 ? (
          <NoPetsState onAdopt={() => setShowAdoptModal(true)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pet Display Area */}
            <div className="lg:col-span-2 space-y-6">
              {activePet && (
                <>
                  {/* Main Pet Display */}
                  <PetDisplayArea pet={activePet} onInteraction={handleInteraction} cooldown={interactionCooldown} />
                  
                  {/* Stats Panel */}
                  <PetStatsPanel pet={activePet} />
                </>
              )}
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Pet Selector */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Your Companions ({pets.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pets.map((pet) => (
                    <PetSelectorCard
                      key={pet.id}
                      pet={pet}
                      isActive={activePet?.id === pet.id}
                      onClick={() => setActivePet(pet)}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              {activePet && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickActionButton icon={Palette} label="Customize" color="purple" />
                    <QuickActionButton icon={Gift} label="Inventory" color="amber" />
                    <QuickActionButton icon={TrendingUp} label="Training" color="blue" />
                    <QuickActionButton icon={Activity} label="Activities" color="green" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Adopt Modal */}
      <AnimatePresence>
        {showAdoptModal && (
          <AdoptModal
            species={availableSpecies}
            onClose={() => setShowAdoptModal(false)}
            onAdopt={async (speciesId, name) => {
              if (!user) return;
              const result = await petSystem2Service.adoptPet(user.id, speciesId, name);
              if (result.success && result.petId) {
                const newPet = await petSystem2Service.getPet(result.petId);
                if (newPet) {
                  setPets([...pets, newPet]);
                  setActivePet(newPet);
                }
              }
              setShowAdoptModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Pet Display Component - The main visual area
function PetDisplayArea({ pet, onInteraction, cooldown }: {
  pet: UserPet;
  onInteraction: (type: 'feed' | 'play' | 'pet') => void;
  cooldown: boolean;
}) {
  const moodInfo = petSystem2Service.getMoodInfo(pet.currentMood);
  const rarityColor = petSystem2Service.getRarityColor(pet.species.baseRarity);
  
  // Mouse tracking for pet eyes
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const eyeX = useTransform(mouseX, [-100, 100], [-5, 5]);
  const eyeY = useTransform(mouseY, [-100, 100], [-5, 5]);
  const springEyeX = useSpring(eyeX, { stiffness: 300, damping: 30 });
  const springEyeY = useSpring(eyeY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className="relative bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-3xl p-8 border border-white/10 overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      {/* Ambient Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles based on pet element */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: rarityColor,
              opacity: 0.3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Pet Info Header */}
      <div className="relative flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {pet.customName || pet.species.displayName}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl"
            >
              {moodInfo.emoji}
            </motion.span>
          </h2>
          <p className="text-void-400">
            Lv.{pet.level} {pet.species.displayName} • {moodInfo.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium capitalize"
            style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
          >
            {pet.species.baseRarity}
          </span>
          {pet.currentEvolutionStage > 1 && (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
              Stage {pet.currentEvolutionStage}
            </span>
          )}
        </div>
      </div>

      {/* Main Pet Display */}
      <div className="relative flex justify-center items-center py-12">
        {/* Pet Visual */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Pet Body - Stylized representation */}
          <motion.div
            className="w-48 h-48 rounded-full relative"
            style={{
              background: `linear-gradient(135deg, ${rarityColor}40, ${rarityColor}10)`,
              boxShadow: `0 0 60px ${rarityColor}30`,
            }}
            animate={{
              scale: pet.currentMood === 'ecstatic' ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {/* Eyes */}
            <div className="absolute top-16 left-14 flex gap-8">
              <motion.div
                className="relative w-8 h-8 bg-white rounded-full overflow-hidden"
                style={{ x: springEyeX, y: springEyeY }}
              >
                <motion.div
                  className="absolute w-4 h-4 bg-black rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    x: '-50%',
                    y: '-50%',
                  }}
                  animate={{
                    scale: pet.currentMood === 'happy' ? [1, 1.1, 1] : 1,
                  }}
                />
                <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-1 left-1" />
              </motion.div>
              <motion.div
                className="relative w-8 h-8 bg-white rounded-full overflow-hidden"
                style={{ x: springEyeX, y: springEyeY }}
              >
                <motion.div
                  className="absolute w-4 h-4 bg-black rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    x: '-50%',
                    y: '-50%',
                  }}
                />
                <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-1 left-1" />
              </motion.div>
            </div>

            {/* Mouth based on mood */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              {(pet.currentMood === 'happy' || pet.currentMood === 'ecstatic') && (
                <motion.div
                  className="w-12 h-6 border-b-4 border-black rounded-b-full"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
              {pet.currentMood === 'sad' && (
                <div className="w-8 h-4 border-t-4 border-black rounded-t-full" />
              )}
              {pet.currentMood === 'neutral' && (
                <div className="w-6 h-0.5 bg-black" />
              )}
            </div>

            {/* Special Effects */}
            {pet.currentMood === 'ecstatic' && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${Math.random() * 30}%`,
                    }}
                    animate={{
                      y: [-20, -40],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>

          {/* Pet Shadow */}
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/20 rounded-full blur-md"
            animate={{
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>

      {/* Interaction Buttons */}
      <div className="relative flex justify-center gap-4 mt-8">
        <InteractionButton
          icon={Cookie}
          label="Feed"
          color="amber"
          onClick={() => onInteraction('feed')}
          disabled={cooldown}
        />
        <InteractionButton
          icon={Play}
          label="Play"
          color="green"
          onClick={() => onInteraction('play')}
          disabled={cooldown}
        />
        <InteractionButton
          icon={Heart}
          label="Pet"
          color="pink"
          onClick={() => onInteraction('pet')}
          disabled={cooldown}
        />
      </div>
    </motion.div>
  );
}

function InteractionButton({ icon: Icon, label, color, onClick, disabled }: {
  icon: React.ElementType;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/25',
    green: 'from-emerald-500 to-green-500 shadow-emerald-500/25',
    pink: 'from-pink-500 to-rose-500 shadow-pink-500/25',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.1, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <Icon className="w-6 h-6 text-white" />
      <span className="text-sm font-medium text-white">{label}</span>
    </motion.button>
  );
}

// Stats Panel
function PetStatsPanel({ pet }: { pet: UserPet }) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-400" />
        Vital Stats
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBar icon={Heart} label="Happiness" value={pet.happiness} color="pink" />
        <StatBar icon={Zap} label="Energy" value={pet.energy} color="yellow" />
        <StatBar icon={Cookie} label="Hunger" value={pet.hunger} color="orange" />
        <StatBar icon={Droplets} label="Hygiene" value={pet.hygiene} color="blue" />
      </div>

      <h4 className="text-sm font-medium text-void-400 mb-3">Combat Stats</h4>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <MiniStat icon={Brain} label="INT" value={pet.stats.intelligence} />
        <MiniStat icon={Sword} label="STR" value={pet.stats.strength} />
        <MiniStat icon={Wind} label="AGI" value={pet.stats.agility} />
        <MiniStat icon={MessageCircle} label="CHA" value={pet.stats.charisma} />
        <MiniStat icon={Star} label="LCK" value={pet.stats.luck} />
      </div>

      {/* Experience Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-void-400">Experience</span>
          <span className="text-sm text-white font-medium">
            {pet.experiencePoints.toLocaleString()} XP
          </span>
        </div>
        <div className="h-3 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${(pet.experiencePoints % 1000) / 10}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

function StatBar({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    pink: 'from-pink-500 to-rose-500',
    yellow: 'from-yellow-500 to-amber-500',
    orange: 'from-orange-500 to-amber-500',
    blue: 'from-blue-500 to-cyan-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-void-400" />
          <span className="text-xs text-void-400">{label}</span>
        </div>
        <span className="text-sm font-medium text-white">{value}%</span>
      </div>
      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
      <Icon className="w-4 h-4 text-void-400 mb-1" />
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-xs text-void-500">{label}</span>
    </div>
  );
}

// Pet Selector Card
function PetSelectorCard({ pet, isActive, onClick }: {
  pet: UserPet;
  isActive: boolean;
  onClick: () => void;
}) {
  const moodInfo = petSystem2Service.getMoodInfo(pet.currentMood);
  const rarityColor = petSystem2Service.getRarityColor(pet.species.baseRarity);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-3 rounded-xl text-left transition-all ${
        isActive 
          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50' 
          : 'bg-white/5 border border-transparent hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ backgroundColor: `${rarityColor}20` }}
        >
          {moodInfo.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {pet.customName || pet.species.displayName}
          </p>
          <p className="text-xs text-void-400">Lv.{pet.level} • {moodInfo.description}</p>
        </div>
        {pet.isFavorite && (
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        )}
      </div>
    </motion.button>
  );
}

// Quick Action Button
function QuickActionButton({ icon: Icon, label, color }: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'hover:bg-purple-500/20 text-purple-400',
    amber: 'hover:bg-amber-500/20 text-amber-400',
    blue: 'hover:bg-blue-500/20 text-blue-400',
    green: 'hover:bg-green-500/20 text-green-400',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 ${colorClasses[color]} transition-colors`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs text-white">{label}</span>
    </motion.button>
  );
}

// No Pets State
function NoPetsState({ onAdopt }: { onAdopt: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-6"
      >
        <Heart className="w-16 h-16 text-pink-400" />
      </motion.div>
      <h2 className="text-2xl font-bold text-white mb-2">No Companions Yet</h2>
      <p className="text-void-400 mb-8 text-center max-w-md">
        Adopt your first digital companion to begin your journey. Each pet has unique traits, abilities, and can evolve!
      </p>
      <motion.button
        onClick={onAdopt}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-pink-500/25 text-lg"
      >
        <Sparkles className="w-5 h-5" />
        Adopt Your First Pet
      </motion.button>
    </motion.div>
  );
}

// Adopt Modal
function AdoptModal({ species, onClose, onAdopt }: {
  species: PetSpecies[];
  onClose: () => void;
  onAdopt: (speciesId: string, name?: string) => void;
}) {
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies | null>(null);
  const [customName, setCustomName] = useState('');

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
        className="w-full max-w-4xl bg-void-900 rounded-3xl border border-white/10 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-pink-400" />
            Adopt a Companion
          </h2>
          <p className="text-void-400 mt-1">Choose your new digital familiar</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {species.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => setSelectedSpecies(s)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedSpecies?.id === s.id
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-pink-500/50'
                  : 'bg-white/5 border-2 border-transparent hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ 
                    backgroundColor: `${petSystem2Service.getRarityColor(s.baseRarity)}20` 
                  }}
                >
                  🐾
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{s.displayName}</p>
                  <p className="text-xs text-void-400 line-clamp-2">{s.description}</p>
                  <span
                    className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs capitalize"
                    style={{
                      backgroundColor: `${petSystem2Service.getRarityColor(s.baseRarity)}20`,
                      color: petSystem2Service.getRarityColor(s.baseRarity),
                    }}
                  >
                    {s.baseRarity}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {selectedSpecies && (
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Give your pet a name (optional)"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-void-400 focus:outline-none focus:border-pink-500/50"
              />
              <motion.button
                onClick={() => onAdopt(selectedSpecies.id, customName || undefined)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium"
              >
                Adopt {selectedSpecies.displayName}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
