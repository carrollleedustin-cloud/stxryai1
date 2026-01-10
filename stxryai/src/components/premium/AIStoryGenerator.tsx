'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';
import { AIStreamingProgress } from '@/components/ai/AIStreamingProgress';
import { PremiumGate } from './PremiumGate';

interface GenerationOptions {
  genre: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  complexity: 'simple' | 'moderate' | 'complex';
  includeChoices: boolean;
  choiceCount: number;
  customPrompt?: string;
}

interface AIStoryGeneratorProps {
  onStoryGenerated?: (story: { title: string; content: string; choices?: string[] }) => void;
}

export function AIStoryGenerator({ onStoryGenerated }: AIStoryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedStory, setGeneratedStory] = useState<{
    title: string;
    content: string;
    choices?: string[];
  } | null>(null);
  const [options, setOptions] = useState<GenerationOptions>({
    genre: 'fantasy',
    tone: 'epic',
    length: 'medium',
    complexity: 'moderate',
    includeChoices: true,
    choiceCount: 3,
  });

  const genres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Adventure'];
  const tones = ['Epic', 'Dark', 'Light', 'Mysterious', 'Romantic', 'Humorous'];
  const lengths = [
    { id: 'short' as const, label: 'Short', words: '500-1000' },
    { id: 'medium' as const, label: 'Medium', words: '1000-2000' },
    { id: 'long' as const, label: 'Long', words: '2000-5000' },
  ];

  const generateStory = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedStory(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 300);

    try {
      const prompt = buildPrompt();
      const result = await aiService.generateStoryContent(
        {
          prompt,
          genre: options.genre,
          tone: options.tone,
        },
        { temperature: 0.8 }
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && typeof result.data === 'string') {
        const story = {
          title: extractTitle(result.data) || 'Generated Story',
          content: result.data,
          choices: options.includeChoices ? generateChoices(result.data) : undefined,
        };
        setGeneratedStory(story);
        onStoryGenerated?.(story);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const buildPrompt = (): string => {
    let prompt = `Create a ${options.length} ${options.genre} story with a ${options.tone} tone. `;
    prompt += `Complexity level: ${options.complexity}. `;
    if (options.includeChoices) {
      prompt += `Include ${options.choiceCount} story choices at the end. `;
    }
    if (options.customPrompt) {
      prompt += `Additional requirements: ${options.customPrompt}`;
    }
    return prompt;
  };

  const extractTitle = (content: string): string | null => {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1] : null;
  };

  const generateChoices = (content: string): string[] => {
    // TODO: Use AI to generate contextual choices
    return ['Continue the journey', 'Turn back', 'Explore the side path'];
  };

  return (
    <PremiumGate feature="ai_story_generator">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Icon name="SparklesIcon" size={24} className="text-primary" />
              AI Story Generator
            </h2>
            <p className="text-muted-foreground">Generate complete stories with AI</p>
          </div>
          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold rounded-full">
            PREMIUM
          </span>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Genre</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <motion.button
                  key={genre}
                  onClick={() => setOptions({ ...options, genre: genre.toLowerCase() })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    options.genre === genre.toLowerCase()
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
            <label className="block text-sm font-medium text-foreground mb-3">Tone</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((tone) => (
                <motion.button
                  key={tone}
                  onClick={() => setOptions({ ...options, tone: tone.toLowerCase() })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    options.tone === tone.toLowerCase()
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
            <label className="block text-sm font-medium text-foreground mb-3">Length</label>
            <div className="flex gap-2">
              {lengths.map((length) => (
                <motion.button
                  key={length.id}
                  onClick={() => setOptions({ ...options, length: length.id })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    options.length === length.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  <div>{length.label}</div>
                  <div className="text-xs opacity-75">{length.words} words</div>
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
                  onClick={() => setOptions({ ...options, complexity: comp })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    options.complexity === comp
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

        {/* Generate Button */}
        <motion.button
          onClick={generateStory}
          disabled={isGenerating}
          whileHover={!isGenerating ? { scale: 1.02 } : {}}
          whileTap={!isGenerating ? { scale: 0.98 } : {}}
          className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-3`}
        >
          {isGenerating ? (
            <>
              <motion.div
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Generating Story...</span>
            </>
          ) : (
            <>
              <Icon name="SparklesIcon" size={24} />
              <span>Generate Story</span>
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
                message="AI is crafting your story..."
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Story */}
        <AnimatePresence>
          {generatedStory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
            >
              <h3 className="text-2xl font-bold text-foreground mb-4">{generatedStory.title}</h3>
              <div className="prose dark:prose-invert max-w-none mb-4">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {generatedStory.content}
                </p>
              </div>
              {generatedStory.choices && (
                <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-foreground mb-2">Story Choices:</h4>
                  <ul className="space-y-2">
                    {generatedStory.choices.map((choice, idx) => (
                      <li key={idx} className="text-foreground">
                        • {choice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumGate>
  );
}
