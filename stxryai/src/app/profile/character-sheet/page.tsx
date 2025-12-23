'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NebulaBackground } from '@/components/nebula/NebulaBackground';
import { MagicButton } from '@/components/nebula/MagicButton';
import { CharacterSheetDisplay, BirthChartWizard } from '@/components/character-sheet';
import { CharacterSheet, BirthDataInput } from '@/types/character-sheet';
import Link from 'next/link';

/**
 * CHARACTER SHEET PAGE
 * Users can create and view their personalized astrological character sheet
 * Powered by OpenAI for accurate birth chart calculations
 */

export default function CharacterSheetPage() {
  const [characterSheet, setCharacterSheet] = useState<CharacterSheet | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing character sheet from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('stxryai_character_sheet');
    if (saved) {
      try {
        setCharacterSheet(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse character sheet:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save character sheet to localStorage
  const saveCharacterSheet = (sheet: CharacterSheet) => {
    localStorage.setItem('stxryai_character_sheet', JSON.stringify(sheet));
    setCharacterSheet(sheet);
    setIsCreating(false);
    setIsGenerating(false);
  };

  // Handle wizard completion - call OpenAI API
  const handleWizardComplete = async (birthData: BirthDataInput) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/character-sheet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(birthData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate character sheet');
      }

      if (data.characterSheet) {
        saveCharacterSheet(data.characterSheet);
      } else {
        throw new Error('No character sheet returned');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate character sheet');
      setIsGenerating(false);
    }
  };

  // Handle privacy settings change
  const handlePrivacyChange = (settings: { hideLocation: boolean; hideBirthTime: boolean }) => {
    if (characterSheet) {
      const updatedSheet = {
        ...characterSheet,
        privacySettings: settings,
        updatedAt: new Date().toISOString(),
      };
      saveCharacterSheet(updatedSheet);
    }
  };

  // Delete character sheet
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your Character Sheet? This cannot be undone.')) {
      localStorage.removeItem('stxryai_character_sheet');
      setCharacterSheet(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <NebulaBackground variant="cosmos" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <NebulaBackground variant="cosmos" />
      
      <div className="relative z-10 px-4 py-8">
        {/* Navigation */}
        <nav className="max-w-6xl mx-auto flex items-center justify-between mb-8">
          <Link href="/">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                StxryAI
              </span>
            </motion.div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/user-profile">
              <motion.span
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                ← Back to Profile
              </motion.span>
            </Link>
          </div>
        </nav>

        <AnimatePresence mode="wait">
          {isCreating ? (
            // Wizard Mode
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-gradient-to-br from-nebula-deep/90 to-nebula-space/90 rounded-3xl border border-white/10 backdrop-blur-xl p-8">
                {isGenerating ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="w-20 h-20 mx-auto mb-6 relative"
                    >
                      <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 border-r-purple-500 rounded-full" />
                      <div className="absolute inset-2 border-4 border-transparent border-b-pink-500 border-l-yellow-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                      <span className="absolute inset-0 flex items-center justify-center text-3xl">✨</span>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      Consulting the Stars...
                    </h2>
                    <p className="text-white/60 max-w-sm mx-auto">
                      Our AI is calculating your precise planetary positions and crafting your unique character sheet.
                    </p>
                    <motion.div
                      className="mt-6 flex justify-center gap-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((emoji, i) => (
                        <motion.span
                          key={i}
                          className="text-xl"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                        >
                          {emoji}
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>
                ) : (
                  <BirthChartWizard
                    onComplete={handleWizardComplete}
                    onCancel={() => setIsCreating(false)}
                    initialData={characterSheet ? {
                      name: characterSheet.name,
                      birthDate: characterSheet.birthDate,
                      birthTime: characterSheet.birthTime,
                      birthCity: characterSheet.birthPlace.split(',')[0],
                      birthState: characterSheet.birthPlace.split(',')[1]?.trim(),
                      birthCountry: characterSheet.birthPlace.split(',').pop()?.trim() || '',
                    } : undefined}
                  />
                )}
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-center"
                  >
                    <p className="text-red-300 text-sm">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : characterSheet ? (
            // Display Character Sheet
            <motion.div
              key="display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mb-6">
                <MagicButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreating(true)}
                >
                  ✏️ Regenerate
                </MagicButton>
                <MagicButton
                  variant="secondary"
                  size="sm"
                  onClick={handleDelete}
                  className="!border-red-500/30 hover:!bg-red-500/10"
                >
                  🗑️ Delete
                </MagicButton>
              </div>
              
              <CharacterSheetDisplay 
                sheet={characterSheet} 
                onPrivacyChange={handlePrivacyChange}
              />
            </motion.div>
          ) : (
            // No Character Sheet - Create Prompt
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-gradient-to-br from-nebula-deep/80 to-nebula-space/80 rounded-3xl border border-white/10 backdrop-blur-xl p-12">
                {/* Animated Stars */}
                <div className="relative mb-8">
                  <motion.div
                    className="text-8xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    🌟
                  </motion.div>
                  <motion.div
                    className="absolute top-0 left-1/4 text-2xl"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    className="absolute top-2 right-1/4 text-xl"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  >
                    ⭐
                  </motion.div>
                </div>

                <h1 
                  className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Discover Your Cosmic Blueprint
                </h1>
                
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Create your personalized Character Sheet using AI-powered astrology. 
                  Our system calculates your precise birth chart and crafts a deeply personal cosmic profile.
                </p>

                <div className="space-y-4 text-left max-w-sm mx-auto mb-8">
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-lg">☀️</span>
                    <span>Accurate Sun, Moon & Rising calculations</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center text-lg">🎭</span>
                    <span>Unique personality archetype</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500/20 to-red-500/20 flex items-center justify-center text-lg">💕</span>
                    <span>Love & relationship profile</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-lg">🔒</span>
                    <span>Privacy controls for location</span>
                  </div>
                </div>

                <MagicButton
                  variant="primary"
                  size="lg"
                  onClick={() => setIsCreating(true)}
                >
                  ✨ Create Your Character Sheet
                </MagicButton>

                <p className="text-white/40 text-sm mt-6">
                  Your Character Sheet will personalize your storytelling experience.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
