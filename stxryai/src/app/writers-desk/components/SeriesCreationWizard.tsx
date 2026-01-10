'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface SeriesOverview {
  id: string;
  title: string;
  description?: string;
  genre: string;
  bookCount: number;
  targetBooks: number;
  characterCount: number;
  worldElementCount: number;
  activeArcs: number;
  pendingViolations: number;
  totalWordCount: number;
  status: string;
  coverImageUrl?: string;
}

interface SeriesCreationWizardProps {
  onComplete: (series: SeriesOverview) => void;
  onCancel: () => void;
}

type WizardStep = 'basics' | 'themes' | 'structure' | 'tone' | 'review';

const GENRES = [
  { id: 'fantasy', name: 'Fantasy', icon: '🐉', desc: 'Magic, mythical creatures, epic quests' },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    icon: '🚀',
    desc: 'Future technology, space, alternate realities',
  },
  { id: 'mystery', name: 'Mystery', icon: '🔍', desc: 'Crime, investigation, suspense' },
  { id: 'romance', name: 'Romance', icon: '💕', desc: 'Love, relationships, emotional journeys' },
  {
    id: 'thriller',
    name: 'Thriller',
    icon: '🎭',
    desc: 'High stakes, danger, psychological tension',
  },
  { id: 'horror', name: 'Horror', icon: '👻', desc: 'Fear, supernatural, dark themes' },
  { id: 'adventure', name: 'Adventure', icon: '⚔️', desc: 'Exploration, action, discovery' },
  {
    id: 'historical',
    name: 'Historical',
    icon: '🏛️',
    desc: 'Past eras, real events, period drama',
  },
];

const TONES = [
  { id: 'dark', name: 'Dark', desc: 'Gritty, serious, morally complex' },
  { id: 'light', name: 'Light', desc: 'Hopeful, humorous, uplifting' },
  { id: 'balanced', name: 'Balanced', desc: 'Mix of light and dark elements' },
  { id: 'epic', name: 'Epic', desc: 'Grand scale, sweeping narrative' },
  { id: 'intimate', name: 'Intimate', desc: 'Character-focused, personal' },
];

const PACING = [
  { id: 'slow', name: 'Slow Burn', desc: 'Gradual build-up, detailed exploration' },
  { id: 'moderate', name: 'Moderate', desc: 'Balanced pacing, steady progression' },
  { id: 'fast', name: 'Fast-Paced', desc: 'Quick action, constant momentum' },
];

const AUDIENCES = [
  { id: 'young_adult', name: 'Young Adult', desc: 'Ages 12-18' },
  { id: 'adult', name: 'Adult', desc: 'Ages 18+' },
  { id: 'all_ages', name: 'All Ages', desc: 'Family friendly' },
];

export default function SeriesCreationWizard({ onComplete, onCancel }: SeriesCreationWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<WizardStep>('basics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    premise: '',
    genre: '',
    subgenres: [] as string[],
    targetBookCount: 3,
    primaryThemes: [] as string[],
    secondaryThemes: [] as string[],
    mainConflict: '',
    plannedEnding: '',
    tone: 'balanced',
    pacing: 'moderate',
    targetAudience: 'adult',
    contentRating: 'teen',
  });

  const [customTheme, setCustomTheme] = useState('');

  const steps: WizardStep[] = ['basics', 'themes', 'structure', 'tone', 'review'];
  const currentStepIndex = steps.indexOf(step);

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addTheme = (type: 'primary' | 'secondary') => {
    if (!customTheme.trim()) return;
    const key = type === 'primary' ? 'primaryThemes' : 'secondaryThemes';
    if (!formData[key].includes(customTheme.trim())) {
      updateField(key, [...formData[key], customTheme.trim()]);
    }
    setCustomTheme('');
  };

  const removeTheme = (type: 'primary' | 'secondary', theme: string) => {
    const key = type === 'primary' ? 'primaryThemes' : 'secondaryThemes';
    updateField(
      key,
      formData[key].filter((t) => t !== theme)
    );
  };

  const canProceed = () => {
    switch (step) {
      case 'basics':
        return formData.title.trim() && formData.genre;
      case 'themes':
        return true; // Themes are optional
      case 'structure':
        return formData.targetBookCount >= 1;
      case 'tone':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/narrative-engine/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create series');
      }

      const newSeries = await response.json();

      onComplete({
        id: newSeries.id,
        title: newSeries.title,
        description: newSeries.description,
        genre: newSeries.genre,
        bookCount: 0,
        targetBooks: newSeries.targetBookCount,
        characterCount: 0,
        worldElementCount: 0,
        activeArcs: 0,
        pendingViolations: 0,
        totalWordCount: 0,
        status: 'planning',
        coverImageUrl: newSeries.coverImageUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((s, i) => (
            <div key={s} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i <= currentStepIndex
                    ? 'bg-spectral-cyan text-void-base'
                    : 'bg-void-mist text-text-tertiary'
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded transition-colors ${
                    i < currentStepIndex ? 'bg-spectral-cyan' : 'bg-void-mist'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>Basics</span>
          <span>Themes</span>
          <span>Structure</span>
          <span>Tone</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 'basics' && (
          <motion.div
            key="basics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Let&apos;s Create Your Series
              </h2>
              <p className="text-text-secondary">
                Start with the basics - you can always add more detail later.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Series Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="The Chronicles of..."
                className="w-full px-4 py-3 bg-void-depth border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="A brief description of your series for readers..."
                rows={3}
                className="w-full px-4 py-3 bg-void-depth border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Primary Genre *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => updateField('genre', genre.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.genre === genre.id
                        ? 'border-spectral-cyan bg-spectral-cyan/10'
                        : 'border-void-mist hover:border-spectral-cyan/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{genre.icon}</div>
                    <div className="font-medium text-text-primary text-sm">{genre.name}</div>
                    <div className="text-xs text-text-tertiary mt-1 line-clamp-1">{genre.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Series Premise
              </label>
              <textarea
                value={formData.premise}
                onChange={(e) => updateField('premise', e.target.value)}
                placeholder="The core concept that drives your series. What makes it unique?"
                rows={4}
                className="w-full px-4 py-3 bg-void-depth border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan transition-colors resize-none"
              />
            </div>
          </motion.div>
        )}

        {step === 'themes' && (
          <motion.div
            key="themes"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Themes & Motifs</h2>
              <p className="text-text-secondary">
                Define the recurring themes that will weave through your series.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Primary Themes
              </label>
              <p className="text-xs text-text-tertiary mb-3">
                The main ideas your series explores (e.g., redemption, love, power)
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTheme('primary')}
                  placeholder="Add a theme..."
                  className="flex-1 px-3 py-2 bg-void-depth border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan"
                />
                <button
                  onClick={() => addTheme('primary')}
                  className="px-4 py-2 bg-spectral-cyan text-void-base rounded-lg hover:bg-spectral-cyan/80 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.primaryThemes.map((theme) => (
                  <span
                    key={theme}
                    className="px-3 py-1 bg-spectral-violet/20 text-spectral-violet rounded-full text-sm flex items-center gap-2"
                  >
                    {theme}
                    <button
                      onClick={() => removeTheme('primary', theme)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {formData.primaryThemes.length === 0 && (
                  <span className="text-text-tertiary text-sm italic">No themes added yet</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Main Conflict
              </label>
              <textarea
                value={formData.mainConflict}
                onChange={(e) => updateField('mainConflict', e.target.value)}
                placeholder="The central struggle that spans the entire series..."
                rows={3}
                className="w-full px-4 py-3 bg-void-depth border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Planned Ending (Optional, Spoiler Protected)
              </label>
              <textarea
                value={formData.plannedEnding}
                onChange={(e) => updateField('plannedEnding', e.target.value)}
                placeholder="How you envision the series concluding..."
                rows={3}
                className="w-full px-4 py-3 bg-void-depth border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan transition-colors resize-none"
              />
              <p className="text-xs text-text-tertiary mt-1">
                This is only visible to you and helps the AI maintain narrative consistency.
              </p>
            </div>
          </motion.div>
        )}

        {step === 'structure' && (
          <motion.div
            key="structure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Series Structure</h2>
              <p className="text-text-secondary">Plan the scope and organization of your series.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Planned Number of Books
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={formData.targetBookCount}
                  onChange={(e) => updateField('targetBookCount', parseInt(e.target.value))}
                  className="flex-1 accent-spectral-cyan"
                />
                <span className="w-12 text-center text-xl font-bold text-spectral-cyan">
                  {formData.targetBookCount}
                </span>
              </div>
              <div className="flex justify-between text-xs text-text-tertiary mt-1">
                <span>Standalone</span>
                <span>Trilogy</span>
                <span>Long Series</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-void-depth border border-void-mist">
              <h3 className="font-medium text-text-primary mb-3">
                What you get with the Narrative Engine:
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Persistent character tracking across all books
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Worldbuilding archive with locations, systems, and factions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Canon enforcement to prevent continuity errors
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  AI that knows your entire story context
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Narrative arc tracking across the series
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {step === 'tone' && (
          <motion.div
            key="tone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Tone & Audience</h2>
              <p className="text-text-secondary">
                Set the mood and target readership for your series.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Overall Tone
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => updateField('tone', tone.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.tone === tone.id
                        ? 'border-spectral-cyan bg-spectral-cyan/10'
                        : 'border-void-mist hover:border-spectral-cyan/50'
                    }`}
                  >
                    <div className="font-medium text-text-primary">{tone.name}</div>
                    <div className="text-xs text-text-tertiary mt-1">{tone.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">Pacing</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PACING.map((pace) => (
                  <button
                    key={pace.id}
                    onClick={() => updateField('pacing', pace.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.pacing === pace.id
                        ? 'border-spectral-violet bg-spectral-violet/10'
                        : 'border-void-mist hover:border-spectral-violet/50'
                    }`}
                  >
                    <div className="font-medium text-text-primary">{pace.name}</div>
                    <div className="text-xs text-text-tertiary mt-1">{pace.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Target Audience
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AUDIENCES.map((audience) => (
                  <button
                    key={audience.id}
                    onClick={() => updateField('targetAudience', audience.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.targetAudience === audience.id
                        ? 'border-spectral-gold bg-spectral-gold/10'
                        : 'border-void-mist hover:border-spectral-gold/50'
                    }`}
                  >
                    <div className="font-medium text-text-primary">{audience.name}</div>
                    <div className="text-xs text-text-tertiary mt-1">{audience.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Review Your Series</h2>
              <p className="text-text-secondary">
                Everything looks good? Let&apos;s bring your series to life!
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-spectral-cyan/10 to-spectral-violet/10 border border-spectral-cyan/30">
              <h3 className="text-xl font-bold text-text-primary mb-4">{formData.title}</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-tertiary">Genre:</span>
                  <span className="ml-2 text-text-primary capitalize">{formData.genre}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Planned Books:</span>
                  <span className="ml-2 text-text-primary">{formData.targetBookCount}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Tone:</span>
                  <span className="ml-2 text-text-primary capitalize">{formData.tone}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Pacing:</span>
                  <span className="ml-2 text-text-primary capitalize">{formData.pacing}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Audience:</span>
                  <span className="ml-2 text-text-primary capitalize">
                    {formData.targetAudience.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {formData.description && (
                <div className="mt-4 pt-4 border-t border-spectral-cyan/20">
                  <p className="text-text-secondary">{formData.description}</p>
                </div>
              )}

              {formData.primaryThemes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-spectral-cyan/20">
                  <span className="text-text-tertiary text-sm">Themes: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.primaryThemes.map((theme) => (
                      <span
                        key={theme}
                        className="px-2 py-1 bg-spectral-violet/20 text-spectral-violet rounded text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                {error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-void-mist">
        <button
          onClick={step === 'basics' ? onCancel : handleBack}
          className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors"
        >
          {step === 'basics' ? 'Cancel' : '← Back'}
        </button>

        {step === 'review' ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-spectral-cyan to-spectral-violet rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-spectral-cyan/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : '✨ Create Series'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-3 bg-spectral-cyan text-void-base rounded-lg font-medium hover:bg-spectral-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}
