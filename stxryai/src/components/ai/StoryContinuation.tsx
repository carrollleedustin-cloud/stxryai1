'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '@/lib/api';
import { AIStreamingProgress } from './AIStreamingProgress';
import Icon from '@/components/ui/AppIcon';

interface StoryContinuationProps {
  storyContext: string;
  currentChapter: string;
  previousChoices: string[];
  genre?: string;
  tone?: string;
  onContinue: (content: string) => void;
  onInsert?: (content: string) => void;
}

export function StoryContinuation({
  storyContext,
  currentChapter,
  previousChoices,
  genre,
  tone,
  onContinue,
  onInsert,
}: StoryContinuationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [continuationType, setContinuationType] = useState<
    'next-scene' | 'expand' | 'dialogue' | 'action'
  >('next-scene');

  const continuationTypes = [
    {
      id: 'next-scene' as const,
      label: 'Next Scene',
      icon: '➡️',
      description: 'Continue the story naturally',
    },
    {
      id: 'expand' as const,
      label: 'Expand',
      icon: '📖',
      description: 'Add more detail to current scene',
    },
    {
      id: 'dialogue' as const,
      label: 'Add Dialogue',
      icon: '💬',
      description: 'Generate character dialogue',
    },
    {
      id: 'action' as const,
      label: 'Action Scene',
      icon: '⚔️',
      description: 'Create an action sequence',
    },
  ];

  const generateContinuation = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedContent('');

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 300);

    try {
      const prompt = buildContinuationPrompt();
      const result = await aiService.generateStoryContent(
        {
          prompt,
          genre,
          tone,
          context: storyContext,
        },
        {
          temperature: 0.8,
          cache: false,
        }
      );

      if (result.success && typeof result.data === 'string') {
        setGeneratedContent(result.data);
        setProgress(100);
      } else if ('error' in result) {
        setError(result.error || 'Failed to generate continuation');
      } else {
        setError('Failed to generate continuation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Story continuation error:', err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const buildContinuationPrompt = (): string => {
    const basePrompt = `Continue this interactive story. Here's the context:

Story So Far: ${storyContext}

Current Chapter: ${currentChapter}

Previous Choices Made: ${previousChoices.join(', ')}

${genre ? `Genre: ${genre}` : ''}
${tone ? `Tone: ${tone}` : ''}

`;

    switch (continuationType) {
      case 'next-scene':
        return `${basePrompt}Write the next scene that naturally follows from the current chapter. Maintain consistency with the story's tone and style.`;
      case 'expand':
        return `${basePrompt}Expand the current scene with more detail, description, and depth. Add sensory details and character development.`;
      case 'dialogue':
        return `${basePrompt}Add compelling dialogue between characters that advances the plot and reveals character personalities.`;
      case 'action':
        return `${basePrompt}Create an exciting action sequence that raises the stakes and moves the story forward.`;
      default:
        return basePrompt;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span>✨</span>
          AI Story Continuation
        </h3>
      </div>

      {/* Continuation Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {continuationTypes.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => setContinuationType(type.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              continuationType === type.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-1">{type.icon}</div>
            <div className="text-sm font-medium text-foreground">{type.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
          </motion.button>
        ))}
      </div>

      {/* Generate Button */}
      <motion.button
        onClick={generateContinuation}
        disabled={isGenerating}
        whileHover={!isGenerating ? { scale: 1.02 } : {}}
        whileTap={!isGenerating ? { scale: 0.98 } : {}}
        className={`w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 ${
          isGenerating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isGenerating ? (
          <>
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Icon name="SparklesIcon" size={20} />
            <span>Generate Continuation</span>
          </>
        )}
      </motion.button>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AIStreamingProgress
              isStreaming={isGenerating}
              progress={progress}
              message={`Generating ${continuationType.replace('-', ' ')}...`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Generated Content</h4>
              <div className="flex gap-2">
                {onInsert && (
                  <motion.button
                    onClick={() => onInsert(generatedContent)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                  >
                    Insert
                  </motion.button>
                )}
                <motion.button
                  onClick={() => onContinue(generatedContent)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium"
                >
                  Use This
                </motion.button>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {generatedContent}
              </p>
            </div>
            <motion.button
              onClick={generateContinuation}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              🔄 Generate Another
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
