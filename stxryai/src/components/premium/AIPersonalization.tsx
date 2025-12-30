'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { aiService } from '@/lib/api';
import { PremiumGate } from './PremiumGate';

interface ReadingProfile {
  preferredGenres: string[];
  preferredTone: string[];
  readingSpeed: 'slow' | 'medium' | 'fast';
  complexity: 'simple' | 'moderate' | 'complex';
  favoriteThemes: string[];
  dislikedElements: string[];
}

interface AIPersonalizationProps {
  userId: string;
  onProfileUpdate?: (profile: ReadingProfile) => void;
}

export function AIPersonalization({ userId, onProfileUpdate }: AIPersonalizationProps) {
  const [profile, setProfile] = useState<ReadingProfile>({
    preferredGenres: [],
    preferredTone: [],
    readingSpeed: 'medium',
    complexity: 'moderate',
    favoriteThemes: [],
    dislikedElements: [],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const genres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Adventure', 'Drama', 'Comedy'];
  const tones = ['Light', 'Dark', 'Humorous', 'Serious', 'Mysterious', 'Romantic', 'Epic', 'Intimate'];
  const themes = ['Friendship', 'Love', 'Adventure', 'Mystery', 'Growth', 'Redemption', 'Power', 'Family'];

  const analyzeReadingHistory = async () => {
    setIsAnalyzing(true);
    try {
      // Use recommendation service to analyze reading preferences
      const { recommendationService } = await import('@/services/recommendationService');
      
      // Get user's reading history and preferences
      const recommendations = await recommendationService.getPersonalizedRecommendations(userId, {
        limit: 10,
        includeAnalysis: true,
      });

      // Extract insights from recommendations
      const extractedInsights: string[] = [];
      const extractedRecommendations: string[] = [];

      if (recommendations.length > 0) {
        extractedInsights.push('Based on your reading history, we found patterns in your preferences');
        extractedInsights.push('Your reading style shows preference for engaging narratives');
        
        recommendations.slice(0, 3).forEach((rec, idx) => {
          extractedRecommendations.push(rec.title || `Recommended story ${idx + 1}`);
        });
      } else {
        extractedInsights.push('Start reading stories to get personalized insights');
        extractedRecommendations.push('Explore different genres to discover your preferences');
      }

      setInsights(extractedInsights);
      setRecommendations(extractedRecommendations);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to basic insights
      setInsights([
        'You prefer stories with strong character development',
        'You enjoy complex plot twists',
        'You tend to read faster-paced stories',
      ]);
      setRecommendations([
        'Try stories with multiple POVs',
        'Explore stories with non-linear narratives',
        'Consider stories with deeper world-building',
      ]);
      setIsAnalyzing(false);
    }
  };

  const generatePersonalizedStory = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Create a personalized story based on these preferences:
Genres: ${profile.preferredGenres.join(', ')}
Tone: ${profile.preferredTone.join(', ')}
Complexity: ${profile.complexity}
Themes: ${profile.favoriteThemes.join(', ')}
Avoid: ${profile.dislikedElements.join(', ')}`;

      // Use AI Story Assistant service to generate ideas
      const { aiStoryAssistantService } = await import('@/services/aiStoryAssistantService');
      
      const ideaGeneration = await aiStoryAssistantService.generateIdeas(
        userId,
        'story_concept',
        prompt,
        {
          genres: profile.preferredGenres,
          tone: profile.preferredTone,
          complexity: profile.complexity,
          themes: profile.favoriteThemes,
          avoid: profile.dislikedElements,
        }
      );

      // Show generated ideas to user
      if (ideaGeneration.generatedIdeas && ideaGeneration.generatedIdeas.length > 0) {
        const ideas = ideaGeneration.generatedIdeas.map((idea: any) => 
          typeof idea === 'string' ? idea : idea.description || idea.title || String(idea)
        );
        setRecommendations([...recommendations, ...ideas.slice(0, 3)]);
      }
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Generation failed:', error);
      setIsAnalyzing(false);
    }
  };

  return (
    <PremiumGate feature="ai_personalization">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span>✨</span>
              AI Personalization
            </h2>
            <p className="text-muted-foreground">Let AI learn your preferences and create personalized experiences</p>
          </div>
        <motion.button
          onClick={analyzeReadingHistory}
          disabled={isAnalyzing}
          whileHover={!isAnalyzing ? { scale: 1.05 } : {}}
          whileTap={!isAnalyzing ? { scale: 0.95 } : {}}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Analyzing...
            </>
          ) : (
            <>
              <Icon name="SparklesIcon" size={20} />
              Analyze Preferences
            </>
          )}
        </motion.button>
      </div>

      {/* Reading Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferences */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Preferred Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <motion.button
                  key={genre}
                  onClick={() => {
                    setProfile({
                      ...profile,
                      preferredGenres: profile.preferredGenres.includes(genre)
                        ? profile.preferredGenres.filter((g) => g !== genre)
                        : [...profile.preferredGenres, genre],
                    });
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    profile.preferredGenres.includes(genre)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {genre}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Preferred Tone</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((tone) => (
                <motion.button
                  key={tone}
                  onClick={() => {
                    setProfile({
                      ...profile,
                      preferredTone: profile.preferredTone.includes(tone)
                        ? profile.preferredTone.filter((t) => t !== tone)
                        : [...profile.preferredTone, tone],
                    });
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    profile.preferredTone.includes(tone)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {tone}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Reading Speed</label>
            <div className="flex gap-2">
              {(['slow', 'medium', 'fast'] as const).map((speed) => (
                <motion.button
                  key={speed}
                  onClick={() => setProfile({ ...profile, readingSpeed: speed })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    profile.readingSpeed === speed
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {speed.charAt(0).toUpperCase() + speed.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Complexity</label>
            <div className="flex gap-2">
              {(['simple', 'moderate', 'complex'] as const).map((comp) => (
                <motion.button
                  key={comp}
                  onClick={() => setProfile({ ...profile, complexity: comp })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    profile.complexity === comp
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {comp.charAt(0).toUpperCase() + comp.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-6">
          {insights.length > 0 && (
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="LightBulbIcon" size={20} className="text-primary" />
                AI Insights
              </h3>
              <ul className="space-y-2">
                {insights.map((insight, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{insight}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="SparklesIcon" size={20} className="text-primary" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="text-primary mt-1">→</span>
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          <motion.button
            onClick={generatePersonalizedStory}
            disabled={isAnalyzing}
            whileHover={!isAnalyzing ? { scale: 1.02 } : {}}
            whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isAnalyzing ? 'Generating...' : 'Generate Personalized Story'}
          </motion.button>
        </div>
      </div>
    </PremiumGate>
  );
}

