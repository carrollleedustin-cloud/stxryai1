'use client';

/**
 * Quick Start Wizard
 * Step-by-step guided story creation
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  storyTemplates,
  generateStoryFromTemplate,
  type StoryTemplate,
} from '@/lib/story/templates';

interface QuickStartWizardProps {
  onComplete: (storyData: any) => void;
  onCancel: () => void;
}

type WizardStep = 'choose-method' | 'select-template' | 'customize' | 'generating';

export default function QuickStartWizard({ onComplete, onCancel }: QuickStartWizardProps) {
  const [step, setStep] = useState<WizardStep>('choose-method');
  const [method, setMethod] = useState<'template' | 'ai-prompt' | 'blank'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [customization, setCustomization] = useState({
    genre: '',
    tone: 'balanced' as 'light' | 'balanced' | 'dark',
    length: 'medium' as 'short' | 'medium' | 'long',
    audience: 'general' as 'young-adult' | 'general' | 'mature',
  });

  // Step 1: Choose creation method
  const renderChooseMethod = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">How would you like to create your story?</h2>
        <p className="text-muted-foreground">Choose the method that works best for you</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Template Method */}
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setMethod('template');
            setStep('select-template');
          }}
          className={`p-6 rounded-lg border-2 text-left transition-all ${
            method === 'template'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-semibold mb-2">Use a Template</h3>
          <p className="text-sm text-muted-foreground">
            Start with a pre-built story structure. Perfect for beginners!
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded">
              Easiest
            </span>
            <span className="text-xs text-muted-foreground">8 templates</span>
          </div>
        </motion.button>

        {/* AI Prompt Method */}
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setMethod('ai-prompt');
            setStep('customize');
          }}
          className={`p-6 rounded-lg border-2 text-left transition-all ${
            method === 'ai-prompt'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
          <p className="text-sm text-muted-foreground">
            Describe your idea and let AI create the structure for you.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
              Recommended
            </span>
            <span className="text-xs text-muted-foreground">Most flexible</span>
          </div>
        </motion.button>

        {/* Blank Canvas Method */}
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setMethod('blank');
            setStep('customize');
          }}
          className={`p-6 rounded-lg border-2 text-left transition-all ${
            method === 'blank'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="text-4xl mb-3">🎨</div>
          <h3 className="text-lg font-semibold mb-2">Start from Scratch</h3>
          <p className="text-sm text-muted-foreground">
            Complete creative freedom. Build everything yourself.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
              Advanced
            </span>
            <span className="text-xs text-muted-foreground">Full control</span>
          </div>
        </motion.button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );

  // Step 2: Select template (only if method is 'template')
  const renderSelectTemplate = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose a Story Template</h2>
        <p className="text-muted-foreground">Pick a genre and structure that fits your vision</p>
      </div>

      {/* Difficulty Filter */}
      <div className="flex gap-2">
        <button className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
          Beginner
        </button>
        <button className="px-3 py-1 text-sm rounded-full hover:bg-muted">Intermediate</button>
        <button className="px-3 py-1 text-sm rounded-full hover:bg-muted">Advanced</button>
        <button className="px-3 py-1 text-sm rounded-full hover:bg-muted">All</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {storyTemplates.map((template) => (
          <motion.button
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedTemplate(template);
              setStoryTitle(`My ${template.name}`);
              setStep('customize');
            }}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{template.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{template.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      template.difficulty === 'beginner'
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : template.difficulty === 'intermediate'
                          ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                          : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {template.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>📖 {template.structure.chapters} chapters</span>
                  <span>⏱️ {template.estimatedTime}</span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep('choose-method')}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );

  // Step 3: Customize story
  const renderCustomize = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Customize Your Story</h2>
        <p className="text-muted-foreground">
          {method === 'template' && selectedTemplate
            ? `Personalizing: ${selectedTemplate.name}`
            : method === 'ai-prompt'
              ? 'Tell us about your story idea'
              : 'Set up your story basics'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Story Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Story Title</label>
          <input
            type="text"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            placeholder="Enter your story title..."
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* AI Prompt (only for AI method) */}
        {method === 'ai-prompt' && (
          <div>
            <label className="block text-sm font-medium mb-2">Story Idea</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe your story idea in a few sentences... e.g., 'A time traveler accidentally changes history and must fix it before reality collapses'"
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The more details you provide, the better the AI can help!
            </p>
          </div>
        )}

        {/* Genre (only for blank method) */}
        {method === 'blank' && (
          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select
              value={customization.genre}
              onChange={(e) => setCustomization({ ...customization, genre: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a genre...</option>
              <option value="fantasy">Fantasy</option>
              <option value="sci-fi">Science Fiction</option>
              <option value="mystery">Mystery</option>
              <option value="romance">Romance</option>
              <option value="horror">Horror</option>
              <option value="thriller">Thriller</option>
              <option value="adventure">Adventure</option>
              <option value="drama">Drama</option>
            </select>
          </div>
        )}

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium mb-2">Story Tone</label>
          <div className="grid grid-cols-3 gap-2">
            {['light', 'balanced', 'dark'].map((tone) => (
              <button
                key={tone}
                onClick={() => setCustomization({ ...customization, tone: tone as any })}
                className={`px-4 py-2 rounded-lg border-2 capitalize ${
                  customization.tone === tone
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div>
          <label className="block text-sm font-medium mb-2">Story Length</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCustomization({ ...customization, length: 'short' })}
              className={`px-4 py-2 rounded-lg border-2 ${
                customization.length === 'short'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium">Short</div>
              <div className="text-xs text-muted-foreground">5-8 chapters</div>
            </button>
            <button
              onClick={() => setCustomization({ ...customization, length: 'medium' })}
              className={`px-4 py-2 rounded-lg border-2 ${
                customization.length === 'medium'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium">Medium</div>
              <div className="text-xs text-muted-foreground">10-15 chapters</div>
            </button>
            <button
              onClick={() => setCustomization({ ...customization, length: 'long' })}
              className={`px-4 py-2 rounded-lg border-2 ${
                customization.length === 'long'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium">Long</div>
              <div className="text-xs text-muted-foreground">20+ chapters</div>
            </button>
          </div>
        </div>

        {/* Audience */}
        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <div className="grid grid-cols-3 gap-2">
            {['young-adult', 'general', 'mature'].map((audience) => (
              <button
                key={audience}
                onClick={() => setCustomization({ ...customization, audience: audience as any })}
                className={`px-4 py-2 rounded-lg border-2 capitalize ${
                  customization.audience === audience
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {audience.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setStep(method === 'template' ? 'select-template' : 'choose-method')}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Generate story data
              let storyData;
              if (method === 'template' && selectedTemplate) {
                storyData = generateStoryFromTemplate(selectedTemplate, storyTitle);
              } else {
                storyData = {
                  title: storyTitle,
                  genre: customization.genre || (selectedTemplate?.genre ?? 'General'),
                  description: aiPrompt || '',
                  tone: customization.tone,
                  length: customization.length,
                  audience: customization.audience,
                  aiPrompt: method === 'ai-prompt' ? aiPrompt : selectedTemplate?.starterPrompt,
                };
              }
              onComplete(storyData);
            }}
            disabled={!storyTitle.trim() || (method === 'ai-prompt' && !aiPrompt.trim())}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Story →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
      >
        <AnimatePresence mode="wait">
          {step === 'choose-method' && renderChooseMethod()}
          {step === 'select-template' && renderSelectTemplate()}
          {step === 'customize' && renderCustomize()}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
