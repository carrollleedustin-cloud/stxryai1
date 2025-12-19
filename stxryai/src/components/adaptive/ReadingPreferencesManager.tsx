'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { adaptiveStorytellingService, type UserReadingPreferences } from '@/services/adaptiveStorytellingService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface ReadingPreferencesManagerProps {
  className?: string;
}

export function ReadingPreferencesManager({ className = '' }: ReadingPreferencesManagerProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserReadingPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    preferredPacing: 'medium' as 'slow' | 'medium' | 'fast',
    preferredNarrativeStyle: [] as string[],
    preferredGenreTags: [] as string[],
    preferredThemes: [] as string[],
    preferredTone: [] as string[],
    preferredChoiceFrequency: 'medium' as 'low' | 'medium' | 'high',
    preferredChoiceComplexity: 'medium' as 'simple' | 'medium' | 'complex',
    preferredBranchingDepth: 'medium' as 'shallow' | 'medium' | 'deep',
  });

  useEffect(() => {
    if (!user) return;
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await adaptiveStorytellingService.getUserPreferences(user.id);
      if (data) {
        setPreferences(data);
        setFormData({
          preferredPacing: data.preferredPacing,
          preferredNarrativeStyle: data.preferredNarrativeStyle,
          preferredGenreTags: data.preferredGenreTags,
          preferredThemes: data.preferredThemes,
          preferredTone: data.preferredTone,
          preferredChoiceFrequency: data.preferredChoiceFrequency,
          preferredChoiceComplexity: data.preferredChoiceComplexity,
          preferredBranchingDepth: data.preferredBranchingDepth,
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);
      await adaptiveStorytellingService.updatePreferences(user.id, formData);
      toast.success('Preferences saved! Stories will adapt to your preferences.');
      loadPreferences();
    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleArray = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter((v) => v !== value)
      : [...array, value];
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl h-64 ${className}`} />
    );
  }

  return (
    <div className={`bg-card border-2 border-border rounded-xl p-6 space-y-6 ${className}`}>
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Icon name="SparklesIcon" size={24} />
          Adaptive Storytelling Preferences
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customize how stories adapt to your reading style
        </p>
      </div>

      {/* Pacing */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Preferred Pacing
        </label>
        <div className="flex gap-2">
          {(['slow', 'medium', 'fast'] as const).map((pacing) => (
            <button
              key={pacing}
              onClick={() => setFormData({ ...formData, preferredPacing: pacing })}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                formData.preferredPacing === pacing
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {pacing}
            </button>
          ))}
        </div>
      </div>

      {/* Narrative Style */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Narrative Style
        </label>
        <div className="flex flex-wrap gap-2">
          {['first_person', 'third_person', 'dialogue_heavy', 'descriptive', 'action_focused'].map((style) => (
            <button
              key={style}
              onClick={() =>
                setFormData({
                  ...formData,
                  preferredNarrativeStyle: toggleArray(formData.preferredNarrativeStyle, style),
                })
              }
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                formData.preferredNarrativeStyle.includes(style)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {style.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Preferred Themes
        </label>
        <div className="flex flex-wrap gap-2">
          {['adventure', 'romance', 'mystery', 'fantasy', 'sci-fi', 'horror', 'comedy', 'drama'].map((theme) => (
            <button
              key={theme}
              onClick={() =>
                setFormData({
                  ...formData,
                  preferredThemes: toggleArray(formData.preferredThemes, theme),
                })
              }
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
                formData.preferredThemes.includes(theme)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Preferred Tone
        </label>
        <div className="flex flex-wrap gap-2">
          {['light', 'dark', 'humorous', 'serious', 'whimsical', 'gritty'].map((tone) => (
            <button
              key={tone}
              onClick={() =>
                setFormData({
                  ...formData,
                  preferredTone: toggleArray(formData.preferredTone, tone),
                })
              }
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
                formData.preferredTone.includes(tone)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Choice Frequency */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Choice Frequency
        </label>
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => setFormData({ ...formData, preferredChoiceFrequency: freq })}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                formData.preferredChoiceFrequency === freq
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      {/* Choice Complexity */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Choice Complexity
        </label>
        <div className="flex gap-2">
          {(['simple', 'medium', 'complex'] as const).map((complexity) => (
            <button
              key={complexity}
              onClick={() => setFormData({ ...formData, preferredChoiceComplexity: complexity })}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                formData.preferredChoiceComplexity === complexity
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {complexity}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        disabled={saving}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </motion.button>

      {preferences && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            AI is learning your preferences from your reading behavior. These settings help personalize your experience.
          </p>
        </div>
      )}
    </div>
  );
}

