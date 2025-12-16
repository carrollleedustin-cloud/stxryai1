'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService, type AIServiceOptions } from '@/lib/api';
import type { ErrorResponse } from '@/lib/api/error-handler';

interface Suggestion {
  id: string;
  type: 'improve' | 'continue' | 'rewrite' | 'expand';
  content: string;
  confidence: number;
}

interface AssistantMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  suggestionType: 'improve' | 'continue' | 'rewrite' | 'expand';
}

export default function EnhancedAIAssistant({
  initialText = '',
  onTextChange,
}: {
  initialText?: string;
  onTextChange?: (text: string) => void;
}) {
  const [text, setText] = useState(initialText);
  const [selectedMode, setSelectedMode] = useState<AssistantMode | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modes: AssistantMode[] = [
    {
      id: 'improve',
      name: 'Improve',
      description: 'Enhance clarity, flow, and impact',
      icon: '✨',
      color: 'from-purple-500 to-pink-500',
      suggestionType: 'improve',
    },
    {
      id: 'continue',
      name: 'Continue',
      description: 'Continue the story naturally',
      icon: '➡️',
      color: 'from-blue-500 to-cyan-500',
      suggestionType: 'continue',
    },
    {
      id: 'rewrite',
      name: 'Rewrite',
      description: 'Rewrite for better engagement',
      icon: '🔄',
      color: 'from-green-500 to-emerald-500',
      suggestionType: 'rewrite',
    },
    {
      id: 'expand',
      name: 'Expand',
      description: 'Add more detail and depth',
      icon: '📝',
      color: 'from-orange-500 to-red-500',
      suggestionType: 'expand',
    },
  ];

  const handleGenerateSuggestions = async (mode: AssistantMode) => {
    if (!text.trim()) {
      setError('Please enter some text first');
      return;
    }

    setSelectedMode(mode);
    setIsGenerating(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await aiService.generateWritingSuggestions(
        text,
        mode.suggestionType,
        {
          temperature: 0.7,
          cache: true,
        }
      );

      if (result.success) {
        const newSuggestion: Suggestion = {
          id: Date.now().toString(),
          type: mode.suggestionType,
          content: result.data,
          confidence: 0.9,
        };
        setSuggestions([newSuggestion]);
      } else {
        const errorResponse = result as ErrorResponse;
        setError(errorResponse.error || 'Failed to generate suggestions');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('AI suggestion error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestion = (suggestion: Suggestion) => {
    const newText = suggestion.type === 'continue'
      ? text + '\n\n' + suggestion.content
      : suggestion.content;

    setText(newText);
    onTextChange?.(newText);
    setSuggestions([]);
    setSelectedMode(null);
  };

  return (
    <div className="space-y-6">
      {/* Text Input Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing your story here..."
          className="w-full min-h-[300px] p-6 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-foreground"
        />
        <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
          {text.length} characters
        </div>
      </div>

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

      {/* AI Mode Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            onClick={() => handleGenerateSuggestions(mode)}
            disabled={isGenerating}
            className={`relative p-6 bg-card border-2 rounded-xl transition-all overflow-hidden group ${
              selectedMode?.id === mode.id
                ? 'border-primary'
                : 'border-border hover:border-primary/50'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={!isGenerating ? { scale: 1.02, y: -4 } : {}}
            whileTap={!isGenerating ? { scale: 0.98 } : {}}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

            {/* Content */}
            <div className="relative">
              <div className="text-4xl mb-3">{mode.icon}</div>
              <h3 className="text-lg font-bold mb-1">{mode.name}</h3>
              <p className="text-sm text-muted-foreground">{mode.description}</p>
            </div>

            {/* Loading Indicator */}
            {isGenerating && selectedMode?.id === mode.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
                <motion.div
                  className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Suggestions Display */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h3 className="text-xl font-bold">AI Suggestion</h3>
            </div>

            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl"
              >
                {/* Confidence Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary/20 rounded-full text-xs font-medium">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </div>

                {/* Suggestion Content */}
                <div className="mb-4 pr-24">
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {suggestion.content}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Apply Suggestion
                  </motion.button>
                  <motion.button
                    onClick={() => setSuggestions([])}
                    className="px-6 py-2 bg-card border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Dismiss
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {!isGenerating && suggestions.length === 0 && text.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-muted/50 border border-border rounded-lg"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold mb-1">Pro Tip</h4>
              <p className="text-sm text-muted-foreground">
                Select an AI mode above to get personalized suggestions for your writing. Each mode offers different enhancements to help you craft better stories.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
