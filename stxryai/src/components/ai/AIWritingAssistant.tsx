'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiStoryGenerator } from '@/lib/ai/story-generator';

interface AIWritingAssistantProps {
  currentContent: string;
  onApplySuggestion: (content: string) => void;
  onInsertContent: (content: string) => void;
}

type AssistantMode =
  | 'suggestions'
  | 'generate'
  | 'enhance'
  | 'dialogue'
  | 'alternatives'
  | 'outline';

export function AIWritingAssistant({
  currentContent,
  onApplySuggestion,
  onInsertContent,
}: AIWritingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>('suggestions');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleGetSuggestions = async () => {
    if (!currentContent.trim()) return;

    setIsLoading(true);
    try {
      const result = await aiStoryGenerator.getWritingSuggestions(currentContent);
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhance = async (type: 'expand' | 'condense' | 'dramatize' | 'clarify') => {
    if (!currentContent.trim()) return;

    setIsLoading(true);
    try {
      const result = await aiStoryGenerator.enhanceContent(currentContent, type);
      setGeneratedContent(result);
    } catch (error) {
      console.error('Failed to enhance content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDialogue = async (character: string, traits: string[], situation: string) => {
    setIsLoading(true);
    try {
      const result = await aiStoryGenerator.generateDialogue(
        character,
        traits,
        situation,
        'neutral'
      );
      setGeneratedContent(result);
    } catch (error) {
      console.error('Failed to generate dialogue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const modes = [
    { id: 'suggestions', icon: '💡', label: 'Suggestions' },
    { id: 'generate', icon: '✨', label: 'Generate' },
    { id: 'enhance', icon: '🎨', label: 'Enhance' },
    { id: 'dialogue', icon: '💬', label: 'Dialogue' },
    { id: 'alternatives', icon: '🔀', label: 'Alternatives' },
    { id: 'outline', icon: '📋', label: 'Outline' },
  ];

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white text-2xl z-50 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        🤖
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-gray-900 border-l border-white/10 shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Writing Assistant
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-3 gap-2">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as AssistantMode)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      mode === m.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xl mb-1">{m.icon}</div>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {mode === 'suggestions' && (
                <SuggestionsMode
                  currentContent={currentContent}
                  suggestions={suggestions}
                  isLoading={isLoading}
                  onGetSuggestions={handleGetSuggestions}
                  onApply={onApplySuggestion}
                />
              )}

              {mode === 'enhance' && (
                <EnhanceMode
                  isLoading={isLoading}
                  generatedContent={generatedContent}
                  onEnhance={handleEnhance}
                  onApply={onApplySuggestion}
                  onInsert={onInsertContent}
                />
              )}

              {mode === 'dialogue' && (
                <DialogueMode
                  isLoading={isLoading}
                  generatedContent={generatedContent}
                  onGenerate={handleGenerateDialogue}
                  onInsert={onInsertContent}
                />
              )}

              {mode === 'generate' && <GenerateMode onInsert={onInsertContent} />}
              {mode === 'alternatives' && (
                <AlternativesMode currentContent={currentContent} onInsert={onInsertContent} />
              )}
              {mode === 'outline' && <OutlineMode onInsert={onInsertContent} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Suggestions Mode Component
function SuggestionsMode({
  currentContent,
  suggestions,
  isLoading,
  onGetSuggestions,
  onApply,
}: any) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Get AI-powered suggestions to improve your writing.</p>

      <button
        onClick={onGetSuggestions}
        disabled={!currentContent.trim() || isLoading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Analyzing...' : 'Get Suggestions'}
      </button>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((suggestion: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-purple-400 uppercase">
                  {suggestion.type}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </span>
              </div>

              <div className="mb-2">
                <p className="text-sm text-gray-400 mb-1">Original:</p>
                <p className="text-sm text-gray-300 bg-white/5 p-2 rounded">
                  {suggestion.original}
                </p>
              </div>

              <div className="mb-2">
                <p className="text-sm text-gray-400 mb-1">Suggestion:</p>
                <p className="text-sm text-white bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-2 rounded border border-purple-500/20">
                  {suggestion.suggestion}
                </p>
              </div>

              <p className="text-xs text-gray-500 mb-3">{suggestion.reason}</p>

              <button
                onClick={() =>
                  onApply(currentContent.replace(suggestion.original, suggestion.suggestion))
                }
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm font-medium transition-colors"
              >
                Apply Suggestion
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Enhance Mode Component
function EnhanceMode({ isLoading, generatedContent, onEnhance, onApply, onInsert }: any) {
  const enhancements = [
    { id: 'expand', icon: '📝', label: 'Expand', desc: 'Add more detail' },
    { id: 'condense', icon: '📋', label: 'Condense', desc: 'Make it concise' },
    { id: 'dramatize', icon: '🎭', label: 'Dramatize', desc: 'Increase tension' },
    { id: 'clarify', icon: '💎', label: 'Clarify', desc: 'Improve clarity' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Choose how to enhance your content:</p>

      <div className="grid grid-cols-2 gap-3">
        {enhancements.map((e) => (
          <button
            key={e.id}
            onClick={() => onEnhance(e.id)}
            disabled={isLoading}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all disabled:opacity-50 text-left"
          >
            <div className="text-2xl mb-2">{e.icon}</div>
            <div className="text-sm font-medium text-white mb-1">{e.label}</div>
            <div className="text-xs text-gray-500">{e.desc}</div>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm">Enhancing content...</p>
        </div>
      )}

      {generatedContent && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20"
        >
          <p className="text-sm text-gray-300 mb-4 whitespace-pre-wrap">{generatedContent}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onApply(generatedContent)}
              className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-medium hover:opacity-90"
            >
              Replace Content
            </button>
            <button
              onClick={() => onInsert(generatedContent)}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-medium"
            >
              Insert Below
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Dialogue Mode Component
function DialogueMode({ isLoading, generatedContent, onGenerate, onInsert }: any) {
  const [character, setCharacter] = useState('');
  const [traits, setTraits] = useState('');
  const [situation, setSituation] = useState('');

  const handleGenerate = () => {
    if (character && situation) {
      const traitList = traits.split(',').map((t) => t.trim());
      onGenerate(character, traitList, situation);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Generate character dialogue based on context.</p>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Character Name</label>
        <input
          type="text"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          placeholder="e.g., Sarah"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Character Traits (comma-separated)
        </label>
        <input
          type="text"
          value={traits}
          onChange={(e) => setTraits(e.target.value)}
          placeholder="e.g., brave, sarcastic, cautious"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Situation</label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="Describe the situation and what the character is responding to..."
          rows={4}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!character || !situation || isLoading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Dialogue'}
      </button>

      {generatedContent && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20"
        >
          <p className="text-sm text-gray-300 mb-4 whitespace-pre-wrap">{generatedContent}</p>
          <button
            onClick={() => onInsert(generatedContent)}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-medium hover:opacity-90"
          >
            Insert Dialogue
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Placeholder components for other modes
function GenerateMode({ onInsert }: any) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Generate new content from scratch.</p>
      <div className="p-8 text-center bg-white/5 rounded-lg border border-white/10">
        <p className="text-gray-500">Coming soon...</p>
      </div>
    </div>
  );
}

function AlternativesMode({ currentContent, onInsert }: any) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Explore alternative story directions.</p>
      <div className="p-8 text-center bg-white/5 rounded-lg border border-white/10">
        <p className="text-gray-500">Coming soon...</p>
      </div>
    </div>
  );
}

function OutlineMode({ onInsert }: any) {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">Generate story outlines and structure.</p>
      <div className="p-8 text-center bg-white/5 rounded-lg border border-white/10">
        <p className="text-gray-500">Coming soon...</p>
      </div>
    </div>
  );
}
