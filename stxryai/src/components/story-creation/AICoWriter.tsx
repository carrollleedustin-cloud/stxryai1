'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';
import { AIStreamingProgress } from '@/components/ai/AIStreamingProgress';

interface AICoWriterProps {
  currentContent: string;
  context: {
    genre?: string;
    tone?: string;
    characters?: string[];
    previousChapters?: string[];
  };
  onSuggestionAccept: (suggestion: string) => void;
  onSuggestionInsert: (suggestion: string, position: number) => void;
}

type SuggestionType =
  | 'continue'
  | 'enhance'
  | 'dialogue'
  | 'description'
  | 'conflict'
  | 'resolution';

export function AICoWriter({
  currentContent,
  context,
  onSuggestionAccept,
  onSuggestionInsert,
}: AICoWriterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<SuggestionType>('continue');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const suggestionTypes: Array<{
    id: SuggestionType;
    label: string;
    icon: string;
    description: string;
  }> = [
    { id: 'continue', label: 'Continue', icon: '➡️', description: 'Continue the story naturally' },
    { id: 'enhance', label: 'Enhance', icon: '✨', description: 'Add more detail and depth' },
    { id: 'dialogue', label: 'Dialogue', icon: '💬', description: 'Generate character dialogue' },
    { id: 'description', label: 'Description', icon: '🎨', description: 'Add vivid descriptions' },
    { id: 'conflict', label: 'Conflict', icon: '⚔️', description: 'Introduce tension or conflict' },
    { id: 'resolution', label: 'Resolution', icon: '🎯', description: 'Resolve current conflict' },
  ];

  const generateSuggestion = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setSuggestions([]);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      const prompt = buildPrompt(selectedType);
      const result = await aiService.generateStoryContent(
        {
          prompt,
          genre: context.genre,
          tone: context.tone,
          context: currentContent,
        },
        { temperature: 0.8 }
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && typeof result.data === 'string') {
        // Generate multiple variations
        const variations = [result.data];
        setSuggestions(variations);
      } else if ('error' in result) {
        setError(result.error || 'Failed to generate suggestion');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('An unexpected error occurred');
      console.error('AI Co-Writer error:', err);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const buildPrompt = (type: SuggestionType): string => {
    const baseContext = `Current story content:\n${currentContent}\n\n`;
    const genreContext = context.genre ? `Genre: ${context.genre}\n` : '';
    const toneContext = context.tone ? `Tone: ${context.tone}\n` : '';
    const characterContext = context.characters?.length
      ? `Characters: ${context.characters.join(', ')}\n`
      : '';

    switch (type) {
      case 'continue':
        return `${baseContext}${genreContext}${toneContext}${characterContext}Continue the story naturally from where it left off. Maintain consistency with the style and tone.`;
      case 'enhance':
        return `${baseContext}${genreContext}${toneContext}Enhance the current passage with more vivid descriptions, sensory details, and emotional depth.`;
      case 'dialogue':
        return `${baseContext}${genreContext}${toneContext}${characterContext}Add compelling dialogue between characters that reveals personality and advances the plot.`;
      case 'description':
        return `${baseContext}${genreContext}${toneContext}Add rich, vivid descriptions of the setting, atmosphere, or characters. Use sensory details.`;
      case 'conflict':
        return `${baseContext}${genreContext}${toneContext}Introduce tension, conflict, or a challenge that raises the stakes.`;
      case 'resolution':
        return `${baseContext}${genreContext}${toneContext}Resolve the current conflict or tension in a satisfying way.`;
      default:
        return baseContext;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Icon name="SparklesIcon" size={24} className="text-primary" />
          AI Co-Writer
        </h3>
      </div>

      {/* Suggestion Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {suggestionTypes.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              selectedType === type.id
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
        onClick={generateSuggestion}
        disabled={isGenerating || !currentContent.trim()}
        whileHover={!isGenerating ? { scale: 1.02 } : {}}
        whileTap={!isGenerating ? { scale: 0.98 } : {}}
        className={`w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 ${
          isGenerating || !currentContent.trim() ? 'opacity-50 cursor-not-allowed' : ''
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
            <span>Generate Suggestion</span>
          </>
        )}
      </motion.button>

      {/* Progress */}
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
              message={`Generating ${selectedType} suggestion...`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
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

      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Suggestion {index + 1}</h4>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => onSuggestionInsert(suggestion, currentContent.length)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                    >
                      Insert
                    </motion.button>
                    <motion.button
                      onClick={() => onSuggestionAccept(suggestion)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium"
                    >
                      Use This
                    </motion.button>
                  </div>
                </div>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
