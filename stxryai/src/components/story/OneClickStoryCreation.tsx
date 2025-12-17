'use client';

/**
 * One-Click Story Creation
 * Instantly create stories from prompts with minimal input
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  storyStarters,
  getRandomStarters,
  generatePromptFromStarter,
  type StoryStarter,
} from '@/lib/story/ai-starters';

interface OneClickStoryCreationProps {
  onCreateStory: (storyData: any) => void;
  className?: string;
}

export default function OneClickStoryCreation({
  onCreateStory,
  className = '',
}: OneClickStoryCreationProps) {
  const [selectedStarter, setSelectedStarter] = useState<StoryStarter | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleQuickCreate = async (starter: StoryStarter) => {
    setSelectedStarter(starter);
    setIsCreating(true);

    // Simulate AI generation (in real app, this would call your AI service)
    setTimeout(() => {
      const storyData = {
        title: starter.title,
        genre: starter.genre,
        description: starter.prompt,
        hook: starter.hook,
        tags: starter.tags,
        difficulty: starter.difficulty,
        estimatedChapters: parseInt(starter.estimatedLength.split('-')[0]),
        aiPrompt: generatePromptFromStarter(starter),
        isQuickCreated: true,
        createdAt: new Date().toISOString(),
      };

      onCreateStory(storyData);
      setIsCreating(false);
      setSelectedStarter(null);
    }, 1500);
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">⚡ Quick Start</h2>
        <p className="text-muted-foreground">
          One-click story creation. Pick a prompt and start writing instantly!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {getRandomStarters(6).map((starter) => (
          <motion.div key={starter.id} whileHover={{ scale: 1.02, y: -4 }} className="relative">
            <div className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all bg-card">
              {/* Genre Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                  {starter.genre}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    starter.difficulty === 'easy'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : starter.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}
                >
                  {starter.difficulty}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-semibold mb-2 line-clamp-1">{starter.title}</h3>

              {/* Hook */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 italic">
                "{starter.hook}"
              </p>

              {/* Prompt */}
              <p className="text-sm mb-4 line-clamp-3">{starter.prompt}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {starter.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Create Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickCreate(starter)}
                disabled={isCreating && selectedStarter?.id === starter.id}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating && selectedStarter?.id === starter.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    Creating...
                  </span>
                ) : (
                  '⚡ Create Instantly'
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Browse All Button */}
      <div className="mt-6 text-center">
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Browse all {storyStarters.length} story starters →
        </button>
      </div>
    </div>
  );
}

/**
 * Prompt Input Component
 * Quick text input for custom story ideas
 */
export function QuickPromptInput({
  onSubmit,
  className = '',
}: {
  onSubmit: (prompt: string) => void;
  className?: string;
}) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate generation
    setTimeout(() => {
      onSubmit(prompt);
      setPrompt('');
      setIsGenerating(false);
    }, 1000);
  };

  const examplePrompts = [
    'A detective who can read memories from objects',
    'Time travelers competing in a race through history',
    'A chef who cooks magical meals with real effects',
    'Siblings who discover their dreams are connected',
  ];

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">💭 Have Your Own Idea?</h3>
        <p className="text-sm text-muted-foreground">
          Describe your story in one sentence and let AI do the rest
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A wizard who lost their magic must solve mysteries using logic..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary resize-none"
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {prompt.length} / 500
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
                Generating...
              </span>
            ) : (
              '✨ Generate Story'
            )}
          </motion.button>

          <button
            type="button"
            onClick={() =>
              setPrompt(examplePrompts[Math.floor(Math.random() * examplePrompts.length)])
            }
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Try an example
          </button>
        </div>
      </form>

      {/* Example Prompts */}
      <div className="mt-6">
        <p className="text-xs text-muted-foreground mb-2">Need inspiration?</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(example)}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Story From Title Component
 * Generate complete story from just a title
 */
export function StoryFromTitle({
  onCreate,
  className = '',
}: {
  onCreate: (title: string) => void;
  className?: string;
}) {
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      onCreate(title);
      setTitle('');
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">🎯 Just Have a Title?</h3>
        <p className="text-sm text-muted-foreground">
          AI will generate the entire story concept, plot, and structure
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Enter your story title..."
          className="flex-1 px-4 py-2 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          disabled={!title.trim() || isGenerating}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isGenerating ? 'Generating...' : '→ Create'}
        </motion.button>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        💡 Examples: "The Last Guardian", "Shadows of Tomorrow", "Coffee Shop Chronicles"
      </p>
    </div>
  );
}
