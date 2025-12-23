'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterSheet, getZodiacEmoji } from '@/types/character-sheet';

/**
 * CHARACTER SHEET DISPLAY
 * A beautiful, mystical display of the user's astrological character sheet
 * Based on the detailed format with privacy options
 */

interface CharacterSheetDisplayProps {
  sheet: CharacterSheet;
  compact?: boolean;
  onEdit?: () => void;
  onPrivacyChange?: (settings: { hideLocation: boolean; hideBirthTime: boolean }) => void;
}

// Section component
const Section = ({ 
  title, 
  icon, 
  children, 
  delay = 0,
  color = 'cyan'
}: { 
  title: string; 
  icon: string; 
  children: React.ReactNode;
  delay?: number;
  color?: 'cyan' | 'pink' | 'gold' | 'purple' | 'green';
}) => {
  const colors = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/30',
    gold: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`p-5 rounded-2xl bg-gradient-to-br ${colors[color]} border backdrop-blur-sm`}
    >
      <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        {title}
      </h3>
      {children}
    </motion.div>
  );
};

// Trait badge
const TraitBadge = ({ children, type = 'neutral' }: { children: string; type?: 'strength' | 'weakness' | 'neutral' }) => {
  const colors = {
    strength: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    weakness: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    neutral: 'bg-white/10 text-white/70 border-white/20',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${colors[type]}`}>
      {children}
    </span>
  );
};

export function CharacterSheetDisplay({ sheet, compact = false, onEdit, onPrivacyChange }: CharacterSheetDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'love' | 'shadow' | 'aesthetic'>('overview');
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Handle privacy toggle
  const handlePrivacyToggle = (setting: 'hideLocation' | 'hideBirthTime') => {
    if (onPrivacyChange) {
      const newSettings = {
        ...sheet.privacySettings,
        [setting]: !sheet.privacySettings[setting],
      };
      onPrivacyChange(newSettings);
    }
  };

  // Get birth info display based on privacy settings
  const getBirthInfoDisplay = () => {
    const parts = [];
    parts.push(sheet.birthDate);
    if (!sheet.privacySettings?.hideBirthTime) {
      parts.push(`@ ${sheet.birthTime}`);
    }
    if (!sheet.privacySettings?.hideLocation) {
      parts.push(`| ${sheet.birthPlace}`);
    }
    return parts.join(' ');
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nebula-deep via-nebula-space to-nebula-twilight border border-white/10 p-6"
      >
        {/* Mystical background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center gap-2 mb-2">
              <span className="text-3xl">{getZodiacEmoji(sheet.coreAlignment.sunSign)}</span>
              <span className="text-3xl">{getZodiacEmoji(sheet.coreAlignment.moonSign)}</span>
              <span className="text-3xl">{getZodiacEmoji(sheet.coreAlignment.risingSign)}</span>
            </div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {sheet.personalityArchetype.title}
            </h2>
            <p className="text-sm text-white/60 italic mt-1">"{sheet.coreAlignment.tagline}"</p>
          </div>

          {/* Core Signs */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-xl bg-white/5">
              <p className="text-xs text-white/50">Sun</p>
              <p className="text-sm font-bold text-yellow-400">{sheet.coreAlignment.sunSign}</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/5">
              <p className="text-xs text-white/50">Moon</p>
              <p className="text-sm font-bold text-blue-300">{sheet.coreAlignment.moonSign}</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/5">
              <p className="text-xs text-white/50">Rising</p>
              <p className="text-sm font-bold text-purple-400">{sheet.coreAlignment.risingSign}</p>
            </div>
          </div>

          {/* View Full Sheet Button */}
          {onEdit && (
            <motion.button
              onClick={onEdit}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/10 text-white/70 text-sm hover:text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Full Character Sheet →
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden"
    >
      {/* Mystical background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 px-6 rounded-3xl bg-gradient-to-br from-nebula-deep/80 to-nebula-space/80 border border-white/10 backdrop-blur-xl"
        >
          <div className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="text-xs text-white/50">CHARACTER SHEET</span>
          </div>
          
          <h1 
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {sheet.name}
          </h1>
          
          <p className="text-sm text-white/50 mb-6">
            {getBirthInfoDisplay()}
          </p>

          {/* Privacy Toggle */}
          {onPrivacyChange && (
            <div className="mb-6">
              <button
                onClick={() => setShowPrivacy(!showPrivacy)}
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                🔒 Privacy Settings {showPrivacy ? '▲' : '▼'}
              </button>
              {showPrivacy && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 max-w-sm mx-auto"
                >
                  <label className="flex items-center justify-between py-2 cursor-pointer">
                    <span className="text-sm text-white/70">Hide location on profile</span>
                    <div 
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        sheet.privacySettings?.hideLocation ? 'bg-cyan-500' : 'bg-white/20'
                      }`}
                      onClick={() => handlePrivacyToggle('hideLocation')}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          sheet.privacySettings?.hideLocation ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </label>
                  <label className="flex items-center justify-between py-2 cursor-pointer">
                    <span className="text-sm text-white/70">Hide birth time on profile</span>
                    <div 
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        sheet.privacySettings?.hideBirthTime ? 'bg-cyan-500' : 'bg-white/20'
                      }`}
                      onClick={() => handlePrivacyToggle('hideBirthTime')}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          sheet.privacySettings?.hideBirthTime ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </label>
                </motion.div>
              )}
            </div>
          )}

          {/* Core Signs Display */}
          <div className="flex justify-center items-center gap-6 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/50 flex items-center justify-center mb-2 mx-auto">
                <span className="text-4xl">{getZodiacEmoji(sheet.coreAlignment.sunSign)}</span>
              </div>
              <p className="text-xs text-white/50">Sun Sign</p>
              <p className="text-sm font-bold text-yellow-400">{sheet.coreAlignment.sunSign}</p>
              {sheet.coreAlignment.sunDegree && (
                <p className="text-xs text-white/30">{sheet.coreAlignment.sunDegree}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border-2 border-blue-500/50 flex items-center justify-center mb-2 mx-auto">
                <span className="text-4xl">{getZodiacEmoji(sheet.coreAlignment.moonSign)}</span>
              </div>
              <p className="text-xs text-white/50">Moon Sign</p>
              <p className="text-sm font-bold text-blue-300">{sheet.coreAlignment.moonSign}</p>
              {sheet.coreAlignment.moonDegree && (
                <p className="text-xs text-white/30">{sheet.coreAlignment.moonDegree}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50 flex items-center justify-center mb-2 mx-auto">
                <span className="text-4xl">{getZodiacEmoji(sheet.coreAlignment.risingSign)}</span>
              </div>
              <p className="text-xs text-white/50">Rising Sign</p>
              <p className="text-sm font-bold text-purple-400">{sheet.coreAlignment.risingSign}</p>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-white/70 italic max-w-lg mx-auto"
          >
            "{sheet.coreAlignment.tagline}"
          </motion.p>
        </motion.header>

        {/* Personality Archetype */}
        <Section title="Personality Archetype" icon="🎭" delay={0.2} color="purple">
          <h4 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {sheet.personalityArchetype.title}
          </h4>
          <p className="text-white/70 mb-3">{sheet.personalityArchetype.essence}</p>
          <div className="inline-block px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-sm text-white/50">Mode of Operation: </span>
            <span className="text-sm font-medium text-purple-300">{sheet.personalityArchetype.modeOfOperation}</span>
          </div>
        </Section>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Strengths" icon="💪" delay={0.3} color="green">
            <div className="flex flex-wrap gap-2">
              {sheet.strengths?.map((strength, i) => (
                <motion.div
                  key={strength}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <TraitBadge type="strength">{strength}</TraitBadge>
                </motion.div>
              ))}
            </div>
          </Section>

          <Section title="Weaknesses" icon="🌑" delay={0.4} color="pink">
            <div className="flex flex-wrap gap-2">
              {sheet.weaknesses?.map((weakness, i) => (
                <motion.div
                  key={weakness}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <TraitBadge type="weakness">{weakness}</TraitBadge>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 py-2">
          {(['overview', 'love', 'shadow', 'aesthetic'] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab === 'overview' && '🌟 '}{tab === 'love' && '💕 '}{tab === 'shadow' && '🌙 '}{tab === 'aesthetic' && '🎨 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <Section title="Emotional World" icon="🌊" color="cyan">
                <p className="text-white/70 mb-3">{sheet.emotionalProfile?.moonDescription}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50">Archetype:</span>
                    <span className="font-medium text-cyan-300">{sheet.emotionalProfile?.emotionalArchetype}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50">Key Trait:</span>
                    <span className="text-white/70">{sheet.emotionalProfile?.keyTrait}</span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {sheet.emotionalProfile?.traits?.map((trait, i) => (
                    <p key={i} className="text-sm text-white/50">• {trait}</p>
                  ))}
                </div>
              </Section>

              <Section title="Vocation & Purpose" icon="⚡" color="gold">
                <p className="text-white/70 mb-3">{sheet.vocationProfile?.keyPlacements}</p>
                {sheet.vocationProfile?.jupiterPlacement && (
                  <p className="text-sm text-white/50 mb-2">{sheet.vocationProfile.jupiterPlacement}</p>
                )}
                <p className="text-sm text-white/50 mb-3">{sheet.vocationProfile?.northNode}</p>
                <div className="space-y-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Career Themes:</p>
                  {sheet.vocationProfile?.careerThemes?.map((theme, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <span className="text-sm text-white/70">{theme}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </motion.div>
          )}

          {activeTab === 'love' && (
            <motion.div
              key="love"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Section title="Love & Relationships" icon="💕" color="pink">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getZodiacEmoji(sheet.loveProfile?.venusSign || '')}</span>
                      <span className="text-lg font-bold text-pink-400">Venus in {sheet.loveProfile?.venusSign}</span>
                    </div>
                    <p className="text-white/70 text-sm">{sheet.loveProfile?.venusDescription}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getZodiacEmoji(sheet.loveProfile?.marsSign || '')}</span>
                      <span className="text-lg font-bold text-red-400">Mars in {sheet.loveProfile?.marsSign}</span>
                    </div>
                    <p className="text-white/70 text-sm">{sheet.loveProfile?.marsDescription}</p>
                  </div>
                </div>
                
                {sheet.loveProfile?.keyAspect && (
                  <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-white/50">Key Aspect:</p>
                    <p className="text-white/70">{sheet.loveProfile.keyAspect}</p>
                  </div>
                )}
                
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/50">Romantic Archetype:</p>
                  <p className="text-lg font-bold text-pink-300">{sheet.loveProfile?.romanticArchetype}</p>
                </div>

                <div className="mt-4 space-y-2">
                  {sheet.loveProfile?.traits?.map((trait, i) => (
                    <p key={i} className="text-sm text-white/60">• {trait}</p>
                  ))}
                </div>
              </Section>
            </motion.div>
          )}

          {activeTab === 'shadow' && (
            <motion.div
              key="shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Section title="Shadow & Depth" icon="🌙" color="purple">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getZodiacEmoji(sheet.shadowProfile?.plutoSign || '')}</span>
                      <span className="text-lg font-bold text-purple-400">Pluto in {sheet.shadowProfile?.plutoSign}</span>
                    </div>
                    <p className="text-white/70 text-sm">{sheet.shadowProfile?.plutoDescription}</p>
                  </div>
                  {sheet.shadowProfile?.lilithSign && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🌑</span>
                        <span className="text-lg font-bold text-indigo-400">Lilith in {sheet.shadowProfile.lilithSign}</span>
                      </div>
                      <p className="text-white/70 text-sm">{sheet.shadowProfile.lilithDescription}</p>
                    </div>
                  )}
                </div>
                
                {sheet.shadowProfile?.keyAspect && (
                  <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-white/50">Key Aspect:</p>
                    <p className="text-white/70">{sheet.shadowProfile.keyAspect}</p>
                  </div>
                )}
                
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/50">Shadow Archetype:</p>
                  <p className="text-lg font-bold text-purple-300">{sheet.shadowProfile?.shadowArchetype}</p>
                </div>

                <div className="mt-4 space-y-2">
                  {sheet.shadowProfile?.traits?.map((trait, i) => (
                    <p key={i} className="text-sm text-white/60">• {trait}</p>
                  ))}
                </div>
              </Section>
            </motion.div>
          )}

          {activeTab === 'aesthetic' && (
            <motion.div
              key="aesthetic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Section title="Aesthetic Vibes" icon="🎨" color="cyan">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Colors</p>
                    <div className="flex gap-2 flex-wrap">
                      {sheet.aestheticProfile?.colors?.map((color, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                          <div className="w-3 h-3 rounded-full" style={{ 
                            background: color.toLowerCase().includes('gray') || color.toLowerCase().includes('charcoal') ? '#4a5568' : 
                                        color.toLowerCase().includes('gold') || color.toLowerCase().includes('parchment') ? '#d4af37' : 
                                        color.toLowerCase().includes('blue') || color.toLowerCase().includes('lunar') ? '#3b82f6' : 
                                        color.toLowerCase().includes('white') || color.toLowerCase().includes('silver') ? '#e5e7eb' :
                                        color.toLowerCase().includes('red') || color.toLowerCase().includes('crimson') ? '#ef4444' : 
                                        color.toLowerCase().includes('green') ? '#22c55e' : 
                                        color.toLowerCase().includes('purple') ? '#a855f7' : '#9ca3af' 
                          }} />
                          <span className="text-xs text-white/70">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Symbols</p>
                    <div className="flex gap-2 flex-wrap">
                      {sheet.aestheticProfile?.symbols?.map((symbol, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Style</p>
                  <p className="text-white/70">{sheet.aestheticProfile?.style}</p>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Playlist Energy</p>
                  <p className="text-white/70 italic">"{sheet.aestheticProfile?.playlistEnergy}"</p>
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signature Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8 px-6 rounded-3xl bg-gradient-to-br from-nebula-deep/50 to-nebula-space/50 border border-white/10"
        >
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Signature Quote</p>
          <p 
            className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 italic"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {sheet.signatureQuote}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CharacterSheetDisplay;
