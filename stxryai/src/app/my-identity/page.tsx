'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, BookOpen, Compass, Star, Heart, Brain, 
  Flame, Shield, Eye, Sparkles, Moon, MessageCircle,
  TrendingUp, Award, ChevronDown, Activity, Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  readerIdentityService, 
  ReaderIdentity, 
  ReaderArchetype 
} from '@/services/readerIdentityService';
import { 
  emotionalFingerprintService, 
  EmotionalFingerprint 
} from '@/services/emotionalFingerprintService';
import { ReaderIdentityCard } from '@/components/reader/ReaderIdentityCard';

// Archetype icons mapping
const archetypeIcons: Record<ReaderArchetype, React.ElementType> = {
  'The Hero': Shield,
  'The Survivor': Compass,
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

export default function MyIdentityPage() {
  const { user } = useAuth();
  const [identity, setIdentity] = useState<ReaderIdentity | null>(null);
  const [fingerprint, setFingerprint] = useState<EmotionalFingerprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'identity' | 'emotional' | 'journey'>('identity');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        const [identityData, fingerprintData] = await Promise.all([
          readerIdentityService.getIdentity(user.id),
          emotionalFingerprintService.getFingerprint(user.id),
        ]);
        
        setIdentity(identityData);
        setFingerprint(fingerprintData);
      } catch (error) {
        console.error('Error loading identity data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-void-950 via-purple-950/10 to-void-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  const visualization = fingerprint 
    ? emotionalFingerprintService.generateEmotionalVisualization(fingerprint)
    : null;

  const journeyInfo = fingerprint
    ? emotionalFingerprintService.getJourneyInfo(fingerprint.emotionalJourneyPreference)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-void-950 via-purple-950/10 to-void-950 pb-20">
      {/* Header */}
      <header className="border-b border-white/10 bg-void-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl"
            >
              <User className="w-7 h-7 text-purple-400" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Reader Identity
              </h1>
              <p className="text-void-400 text-sm">Discover who you are through your choices</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="max-w-4xl mx-auto px-6 mt-6">
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
          {[
            { id: 'identity', label: 'Archetype', icon: User },
            { id: 'emotional', label: 'Emotional Profile', icon: Heart },
            { id: 'journey', label: 'Journey Preference', icon: Compass },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-void-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'identity' && identity && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <ReaderIdentityCard showEvolution />

              {/* All archetypes grid */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">All Archetypes</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {readerIdentityService.getAllArchetypes().map(({ archetype, info }) => {
                    const Icon = archetypeIcons[archetype];
                    const isActive = identity?.primaryArchetype === archetype;
                    
                    return (
                      <motion.div
                        key={archetype}
                        whileHover={{ scale: 1.05 }}
                        className={`relative p-3 rounded-xl text-center cursor-pointer transition-all ${
                          isActive 
                            ? 'ring-2' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        style={isActive ? { 
                          backgroundColor: `${info.color}20`,
                          ringColor: info.color,
                        } : {}}
                      >
                        <div
                          className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: `${info.color}30` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: info.color }} />
                        </div>
                        <p className="text-xs font-medium text-white">{archetype}</p>
                        {isActive && (
                          <div className="absolute -top-1 -right-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'emotional' && visualization && fingerprint && (
            <motion.div
              key="emotional"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Emotional radar */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">Emotional Profile</h3>
                
                {/* Simple bar visualization */}
                <div className="space-y-4">
                  {visualization.radarData.map((item) => (
                    <div key={item.emotion}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-void-400">{item.emotion}</span>
                        <span className="text-sm text-white">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-void-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dominant emotion */}
                <div className="mt-6 p-4 bg-purple-500/10 rounded-xl">
                  <p className="text-sm text-purple-300">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Your dominant emotion is <strong className="text-purple-400">{visualization.dominantEmotion}</strong>
                    {' '}with a <strong>{visualization.emotionalRange}</strong> emotional range.
                  </p>
                </div>
              </div>

              {/* Insights */}
              {visualization.insights.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Insights</h3>
                  <div className="space-y-3">
                    {visualization.insights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <p className="text-sm text-void-300">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence score */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Learning Progress</h3>
                  <span className="text-sm text-void-400">{fingerprint.dataPoints} data points</span>
                </div>
                <div className="h-4 bg-void-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${fingerprint.confidenceScore}%` }}
                  />
                </div>
                <p className="text-xs text-void-500 mt-2">
                  {fingerprint.confidenceScore < 30
                    ? 'Keep reading! We\'re still learning about you.'
                    : fingerprint.confidenceScore < 70
                    ? 'Getting to know you better with each story.'
                    : 'We have a strong understanding of your preferences!'}
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'journey' && journeyInfo && fingerprint && (
            <motion.div
              key="journey"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Journey type card */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/30 flex items-center justify-center">
                    <Compass className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {fingerprint.emotionalJourneyPreference.replace(/_/g, ' ')}
                    </h2>
                    <p className="text-sm text-void-400">Your preferred narrative journey</p>
                  </div>
                </div>
                <p className="text-void-300">{journeyInfo.description}</p>
              </div>

              {/* Narrative structure */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Your Ideal Story Arc</h3>
                <div className="flex items-center justify-center gap-2 text-center">
                  {journeyInfo.narrativeStructure.split(' → ').map((phase, i, arr) => (
                    <React.Fragment key={i}>
                      <div className="px-4 py-2 bg-purple-500/20 rounded-lg">
                        <p className="text-sm text-purple-300">{phase}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <ChevronDown className="w-4 h-4 text-void-500 rotate-[-90deg]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h4 className="text-sm font-semibold text-void-400 uppercase tracking-wider mb-3">
                    You Love
                  </h4>
                  <div className="space-y-2">
                    {journeyInfo.preferredEmotions.map((emotion) => (
                      <div
                        key={emotion}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg"
                      >
                        <Heart className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-300 capitalize">{emotion}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h4 className="text-sm font-semibold text-void-400 uppercase tracking-wider mb-3">
                    Patterns to Avoid
                  </h4>
                  <div className="space-y-2">
                    {journeyInfo.avoidedPatterns.length > 0 ? (
                      journeyInfo.avoidedPatterns.map((pattern) => (
                        <div
                          key={pattern}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-lg"
                        >
                          <Activity className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-300 capitalize">
                            {pattern.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-void-400">You're open to all patterns!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pacing preferences */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Pacing Preferences</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`w-full h-2 rounded-full mb-2 ${
                      fingerprint.pacingProfile.preferredTensionLevel === 'low' 
                        ? 'bg-emerald-500' 
                        : fingerprint.pacingProfile.preferredTensionLevel === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`} />
                    <p className="text-xs text-void-400">Tension Level</p>
                    <p className="text-sm text-white capitalize">
                      {fingerprint.pacingProfile.preferredTensionLevel}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-2 bg-void-700 rounded-full mb-2 overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${fingerprint.pacingProfile.cliffhangerTolerance}%` }}
                      />
                    </div>
                    <p className="text-xs text-void-400">Cliffhanger Tolerance</p>
                    <p className="text-sm text-white">{fingerprint.pacingProfile.cliffhangerTolerance}%</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-full py-1 px-2 rounded-full text-xs mb-2 ${
                      fingerprint.pacingProfile.actionPacePref === 'slow_burn'
                        ? 'bg-blue-500/20 text-blue-400'
                        : fingerprint.pacingProfile.actionPacePref === 'balanced'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {fingerprint.pacingProfile.actionPacePref.replace('_', ' ')}
                    </div>
                    <p className="text-xs text-void-400">Action Pace</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
