'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '@/lib/api';

interface StoryIdea {
  title: string;
  premise: string;
  characters: string[];
  setting: string;
  conflict: string;
  themes: string[];
}

interface GeneratorOptions {
  genre: string;
  tone: string;
  complexity: 'simple' | 'medium' | 'complex';
  narrativeStyle: string;
}

export default function StoryIdeaGenerator() {
  const [options, setOptions] = useState<GeneratorOptions>({
    genre: 'fantasy',
    tone: 'adventurous',
    complexity: 'medium',
    narrativeStyle: 'action-driven',
  });
  const [idea, setIdea] = useState<StoryIdea | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genres = [
    { id: 'childrens-adventure', name: 'Children\'s Adventure', icon: '🌟', desc: 'Fun stories for kids 3-8' },
    { id: 'childrens-educational', name: 'Children\'s Learning', icon: '📚', desc: 'Educational for kids 5-10' },
    { id: 'middle-grade', name: 'Middle Grade', icon: '🎒', desc: 'Ages 8-12 adventures' },
    { id: 'fantasy', name: 'Fantasy', icon: '🧙', desc: 'Magic and mythical worlds' },
    { id: 'scifi', name: 'Sci-Fi', icon: '🚀', desc: 'Future tech and space' },
    { id: 'mystery', name: 'Mystery', icon: '🔍', desc: 'Puzzles and investigation' },
    { id: 'romance', name: 'Romance', icon: '💖', desc: 'Love and relationships' },
    { id: 'horror', name: 'Horror', icon: '👻', desc: 'Fear and suspense' },
    { id: 'thriller', name: 'Thriller', icon: '🎯', desc: 'High stakes action' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃', desc: 'Tech dystopia' },
    { id: 'steampunk', name: 'Steampunk', icon: '⚙️', desc: 'Victorian tech' },
    { id: 'historical', name: 'Historical', icon: '📜', desc: 'Past eras and events' },
    { id: 'western', name: 'Western', icon: '🤠', desc: 'Frontier adventures' },
    { id: 'postapocalyptic', name: 'Post-Apocalyptic', icon: '☢️', desc: 'Survival after disaster' },
    { id: 'superhero', name: 'Superhero', icon: '🦸', desc: 'Powers and heroics' },
  ];

  const tones = [
    { id: 'dark', name: 'Dark', emoji: '🌑', desc: 'Grim and intense' },
    { id: 'lighthearted', name: 'Lighthearted', emoji: '☀️', desc: 'Fun and upbeat' },
    { id: 'serious', name: 'Serious', emoji: '📚', desc: 'Thoughtful and deep' },
    { id: 'humorous', name: 'Humorous', emoji: '😄', desc: 'Witty and comedic' },
    { id: 'adventurous', name: 'Adventurous', emoji: '⚔️', desc: 'Exciting quests' },
    { id: 'mysterious', name: 'Mysterious', emoji: '❓', desc: 'Enigmatic and cryptic' },
    { id: 'romantic', name: 'Romantic', emoji: '💕', desc: 'Passionate emotions' },
    { id: 'gritty', name: 'Gritty', emoji: '🔥', desc: 'Raw and realistic' },
    { id: 'whimsical', name: 'Whimsical', emoji: '✨', desc: 'Playful fantasy' },
  ];

  const narrativeStyles = [
    { id: 'action-driven', name: 'Action-Driven', emoji: '💥', desc: 'Fast-paced events' },
    { id: 'character-focused', name: 'Character-Focused', emoji: '👤', desc: 'Deep psychology' },
    { id: 'atmospheric', name: 'Atmospheric', emoji: '🌫️', desc: 'Mood and setting' },
    { id: 'dialogue-heavy', name: 'Dialogue-Heavy', emoji: '💬', desc: 'Character interactions' },
    { id: 'philosophical', name: 'Philosophical', emoji: '🤔', desc: 'Big questions' },
    { id: 'cinematic', name: 'Cinematic', emoji: '🎬', desc: 'Visual storytelling' },
    { id: 'poetic', name: 'Poetic', emoji: '📖', desc: 'Lyrical prose' },
    { id: 'minimalist', name: 'Minimalist', emoji: '⬜', desc: 'Sparse and direct' },
  ];

  const complexityLevels = [
    { id: 'simple', name: 'Simple', description: 'Straightforward plot, few characters' },
    { id: 'medium', name: 'Medium', description: 'Balanced complexity with subplots' },
    { id: 'complex', name: 'Complex', description: 'Multiple storylines and characters' },
  ];

  const generateIdea = async () => {
    setIsGenerating(true);
    setError(null);
    setIdea(null);

    try {
      const prompt = `Generate a unique, compelling interactive story idea with the following specifications:

Genre: ${options.genre}
Tone: ${options.tone}
Complexity: ${options.complexity}
Narrative Style: ${options.narrativeStyle}

Create an original story concept that:
- Fits perfectly within the ${options.genre} genre with authentic tropes and elements
- Maintains a ${options.tone} tone throughout
- Uses ${options.narrativeStyle} storytelling techniques
- Has ${options.complexity} level plot complexity
- Works well for interactive, choice-driven storytelling
- Features morally complex decisions and branching paths
- Includes memorable, multi-dimensional characters

Provide the response ONLY as valid JSON in this exact format:
{
  "title": "Compelling story title that captures the essence",
  "premise": "2-3 sentence story premise that hooks readers immediately and explains the core conflict",
  "characters": ["Protagonist: Name - Brief role/description", "Antagonist: Name - Brief role/description", "Key Ally: Name - Brief role/description"],
  "setting": "Detailed setting description including time period, location, and atmosphere",
  "conflict": "The central conflict or problem that drives the story, with stakes clearly explained",
  "themes": ["Primary Theme", "Secondary Theme", "Tertiary Theme"]
}

Make it unique, engaging, and perfect for interactive storytelling!`;

      const result = await aiService.generateStoryContent(
        {
          prompt,
          genre: options.genre,
          tone: options.tone,
          narrativeStyle: options.narrativeStyle,
        },
        {
          temperature: 0.9,
          cache: false,
        }
      );

      if (result.success && typeof result.data === 'string') {
        try {
          const parsedIdea = JSON.parse(result.data);
          setIdea(parsedIdea);
        } catch (parseError) {
          setError('Failed to parse AI response. Please try again.');
        }
      } else if ('error' in result) {
        setError(result.error || 'Failed to generate story idea');
      } else {
        setError('Failed to generate story idea');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Story idea generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">AI Story Idea Generator</h2>
        <p className="text-muted-foreground">
          Let AI spark your creativity with unique story concepts
        </p>
      </div>

      {/* Genre Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold">Genre</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {genres.map((genre) => (
            <motion.button
              key={genre.id}
              onClick={() => setOptions({ ...options, genre: genre.id })}
              className={`p-4 rounded-xl border-2 transition-all ${
                options.genre === genre.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-3xl mb-2">{genre.icon}</div>
              <div className="text-sm font-medium">{genre.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tone Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold">Tone</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tones.map((tone) => (
            <motion.button
              key={tone.id}
              onClick={() => setOptions({ ...options, tone: tone.id })}
              className={`p-4 rounded-xl border-2 transition-all ${
                options.tone === tone.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">{tone.emoji}</div>
              <div className="text-sm font-medium">{tone.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Narrative Style Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold">Narrative Style</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {narrativeStyles.map((style) => (
            <motion.button
              key={style.id}
              onClick={() => setOptions({ ...options, narrativeStyle: style.id })}
              className={`p-4 rounded-xl border-2 transition-all ${
                options.narrativeStyle === style.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">{style.emoji}</div>
              <div className="text-sm font-medium">{style.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{style.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Complexity Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold">Complexity</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {complexityLevels.map((level) => (
            <motion.button
              key={level.id}
              onClick={() => setOptions({ ...options, complexity: level.id as any })}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                options.complexity === level.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold mb-1">{level.name}</div>
              <div className="text-sm text-muted-foreground">{level.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        onClick={generateIdea}
        disabled={isGenerating}
        className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all ${
          isGenerating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        whileHover={!isGenerating ? { scale: 1.02 } : {}}
        whileTap={!isGenerating ? { scale: 0.98 } : {}}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-3">
            <motion.div
              className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Generating Your Story Idea...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>✨</span>
            <span>Generate Story Idea</span>
          </div>
        )}
      </motion.button>

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

      {/* Generated Idea Display */}
      <AnimatePresence>
        {idea && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6 p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{idea.title}</h3>
              <motion.button
                onClick={generateIdea}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Regenerate
              </motion.button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>📖</span> Premise
                </h4>
                <p className="text-foreground/90 leading-relaxed">{idea.premise}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>🏞️</span> Setting
                </h4>
                <p className="text-foreground/90">{idea.setting}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>⚔️</span> Conflict
                </h4>
                <p className="text-foreground/90">{idea.conflict}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>👥</span> Characters
                </h4>
                <div className="flex flex-wrap gap-2">
                  {idea.characters.map((character, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-card border border-border rounded-full text-sm"
                    >
                      {character}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>🎭</span> Themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {idea.themes.map((theme, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <motion.button
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Writing This Story →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
