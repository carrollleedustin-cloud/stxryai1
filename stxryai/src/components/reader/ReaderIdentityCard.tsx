'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Sword, Heart, Brain, Flame, Eye, Compass, Sparkles, 
  MessageCircle, Moon, Award, ChevronRight, TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  readerIdentityService, 
  ReaderIdentity, 
  ReaderArchetype 
} from '@/services/readerIdentityService';

interface ReaderIdentityCardProps {
  variant?: 'full' | 'compact' | 'badge';
  showEvolution?: boolean;
  onViewDetails?: () => void;
}

// Archetype icons
const archetypeIcons: Record<ReaderArchetype, React.ElementType> = {
  'The Hero': Sword,
  'The Survivor': Shield,
  'The Romantic': Heart,
  'The Thinker': Brain,
  'The Rebel': Flame,
  'The Guardian': Shield,
  'The Seeker': Eye,
  'The Wildcard': Sparkles,
  'The Diplomat': MessageCircle,
  'The Shadow': Moon,
  'Undefined': Compass,
};

// Pattern bar component
function PatternBar({ 
  label, 
  value, 
  leftLabel, 
  rightLabel,
  color,
}: { 
  label: string; 
  value: number; 
  leftLabel: string;
  rightLabel: string;
  color: string;
}) {
  // Value is -100 to 100, we need to map to 0-100 for display
  const normalizedValue = (value + 100) / 2;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-void-500">{leftLabel}</span>
        <span className="text-void-400 font-medium">{label}</span>
        <span className="text-void-500">{rightLabel}</span>
      </div>
      <div className="h-2 bg-void-800 rounded-full overflow-hidden relative">
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-void-600 z-10" />
        {/* Value indicator */}
        <motion.div
          className="absolute top-0 bottom-0 rounded-full"
          style={{ 
            backgroundColor: color,
            left: normalizedValue < 50 ? `${normalizedValue}%` : '50%',
            right: normalizedValue >= 50 ? `${100 - normalizedValue}%` : '50%',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* Position dot */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 shadow-lg z-20"
          style={{ borderColor: color }}
          initial={{ left: '50%' }}
          animate={{ left: `${normalizedValue}%` }}
          transition={{ type: 'spring', damping: 20 }}
        />
      </div>
    </div>
  );
}

export function ReaderIdentityCard({
  variant = 'full',
  showEvolution = false,
  onViewDetails,
}: ReaderIdentityCardProps) {
  const { user } = useAuth();
  const [identity, setIdentity] = useState<ReaderIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTitleSelector, setShowTitleSelector] = useState(false);

  useEffect(() => {
    async function loadIdentity() {
      if (!user) return;
      
      try {
        const data = await readerIdentityService.getIdentity(user.id);
        setIdentity(data);
      } catch (error) {
        console.error('Error loading identity:', error);
      } finally {
        setLoading(false);
      }
    }

    loadIdentity();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
      </div>
    );
  }

  if (!identity) {
    return null;
  }

  const archetypeInfo = readerIdentityService.getArchetypeInfo(identity.primaryArchetype);
  const characterSheet = readerIdentityService.generateCharacterSheet(identity);
  const ArchetypeIcon = archetypeIcons[identity.primaryArchetype];

  // Compact badge variant
  if (variant === 'badge') {
    return (
      <motion.div
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r rounded-full"
        style={{ 
          background: `linear-gradient(135deg, ${archetypeInfo.color}20, ${archetypeInfo.color}10)`,
          borderColor: `${archetypeInfo.color}30`,
        }}
        whileHover={{ scale: 1.05 }}
      >
        <ArchetypeIcon className="w-4 h-4" style={{ color: archetypeInfo.color }} />
        <span className="text-sm font-medium text-white">{identity.primaryArchetype}</span>
        {identity.archetypeConfidence >= 70 && (
          <span className="text-xs text-white/60">({identity.archetypeConfidence}%)</span>
        )}
      </motion.div>
    );
  }

  // Compact card variant
  if (variant === 'compact') {
    return (
      <motion.div
        onClick={onViewDetails}
        className="bg-gradient-to-br from-white/5 to-white/0 rounded-xl p-4 border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${archetypeInfo.color}20` }}
          >
            <ArchetypeIcon className="w-6 h-6" style={{ color: archetypeInfo.color }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{identity.primaryArchetype}</p>
            <p className="text-xs text-void-400">
              {identity.totalChoicesMade} choices • {identity.storiesCompleted} stories
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-void-500" />
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div
        className="relative p-6 overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${archetypeInfo.color}20, transparent)` 
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <ArchetypeIcon
              key={i}
              className="absolute w-8 h-8"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                backgroundColor: archetypeInfo.color,
                boxShadow: `0 8px 32px ${archetypeInfo.color}40`,
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <ArchetypeIcon className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <p className="text-2xl font-bold text-white">{identity.primaryArchetype}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: archetypeInfo.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${identity.archetypeConfidence}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs text-void-400">{identity.archetypeConfidence}% certain</span>
              </div>
            </div>
          </div>

          {/* Title selector */}
          <div className="relative">
            <button
              onClick={() => setShowTitleSelector(!showTitleSelector)}
              className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white/70 transition-colors"
            >
              {identity.activeTitle || 'Select Title'} ▾
            </button>
            <AnimatePresence>
              {showTitleSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-void-800 rounded-lg border border-white/10 shadow-xl z-10 py-2"
                >
                  {identity.earnedTitles.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-void-400">No titles earned yet</p>
                  ) : (
                    identity.earnedTitles.map((title) => (
                      <button
                        key={title}
                        onClick={async () => {
                          await readerIdentityService.setActiveTitle(identity.userId, title);
                          setIdentity({ ...identity, activeTitle: title });
                          setShowTitleSelector(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                          identity.activeTitle === title ? 'text-purple-400' : 'text-white/70'
                        }`}
                      >
                        <Award className="w-3 h-3 inline mr-2" />
                        {title}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        <p className="relative mt-4 text-sm text-void-300 leading-relaxed">
          {characterSheet.summary}
        </p>
      </div>

      {/* Stats */}
      <div className="p-6 border-t border-white/5">
        <h4 className="text-xs font-semibold text-void-400 uppercase tracking-wider mb-4">
          Choice Patterns
        </h4>
        <div className="space-y-4">
          <PatternBar
            label="Bravery"
            value={identity.choicePatterns.bravery}
            leftLabel="Cautious"
            rightLabel="Brave"
            color="#F59E0B"
          />
          <PatternBar
            label="Morality"
            value={identity.choicePatterns.morality}
            leftLabel="Pragmatic"
            rightLabel="Virtuous"
            color="#8B5CF6"
          />
          <PatternBar
            label="Approach"
            value={identity.choicePatterns.logic}
            leftLabel="Emotional"
            rightLabel="Logical"
            color="#3B82F6"
          />
          <PatternBar
            label="Social"
            value={identity.choicePatterns.social}
            leftLabel="Lone Wolf"
            rightLabel="Team Player"
            color="#10B981"
          />
        </div>
      </div>

      {/* Traits and compatibility */}
      <div className="p-6 border-t border-white/5">
        <div className="grid grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <h4 className="text-xs font-semibold text-void-400 uppercase tracking-wider mb-2">
              Strengths
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {characterSheet.strengths.map((strength) => (
                <span
                  key={strength}
                  className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
          
          {/* Tendencies */}
          <div>
            <h4 className="text-xs font-semibold text-void-400 uppercase tracking-wider mb-2">
              Tendencies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {characterSheet.tendencies.map((tendency) => (
                <span
                  key={tendency}
                  className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full"
                >
                  {tendency}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Compatibility */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-void-400">{characterSheet.compatibilityNote}</p>
        </div>
      </div>

      {/* Journey stats */}
      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{identity.totalChoicesMade}</p>
            <p className="text-xs text-void-500">Choices</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{identity.storiesCompleted}</p>
            <p className="text-xs text-void-500">Stories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{identity.uniquePathsExplored}</p>
            <p className="text-xs text-void-500">Paths</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{identity.rareChoicesFound}</p>
            <p className="text-xs text-void-500">Rare Finds</p>
          </div>
        </div>
      </div>

      {/* Evolution timeline */}
      {showEvolution && identity.archetypeEvolution.length > 0 && (
        <div className="p-6 border-t border-white/5">
          <h4 className="text-xs font-semibold text-void-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Identity Evolution
          </h4>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/10" />
            
            <div className="space-y-4">
              {identity.archetypeEvolution.slice(-5).reverse().map((snapshot, index) => {
                const Icon = archetypeIcons[snapshot.archetype];
                return (
                  <motion.div
                    key={`${snapshot.archetype}-${snapshot.date}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4 pl-8"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-void-800 border-2 border-purple-500" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-white">{snapshot.archetype}</span>
                        <span className="text-xs text-void-500">
                          {new Date(snapshot.date).toLocaleDateString()}
                        </span>
                      </div>
                      {snapshot.triggerEvent && (
                        <p className="text-xs text-void-400 mt-1 truncate">
                          {snapshot.triggerEvent}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ReaderIdentityCard;
