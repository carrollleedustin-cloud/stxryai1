'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { persistentNarrativeEngine } from '@/services/persistentNarrativeEngine';
import type { 
  GenerationContext, 
  PersistentCharacter, 
  NarrativeArc,
  CanonRule,
  SeriesBook 
} from '@/types/narrativeEngine';

interface AIWritingStudioProps {
  seriesId: string;
  seriesTitle: string;
}

type GenerationType = 'continuation' | 'dialogue' | 'description' | 'action' | 'chapter_outline';

interface ContextSummary {
  activeCharacters: Array<{ id: string; name: string; role: string; status: string }>;
  activeArcs: Array<{ id: string; name: string; status: string; completion: number }>;
  applicableRules: number;
  worldElements: number;
}

export default function AIWritingStudio({ seriesId, seriesTitle }: AIWritingStudioProps) {
  const { user } = useAuth();
  const [books, setBooks] = useState<SeriesBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [characters, setCharacters] = useState<PersistentCharacter[]>([]);
  const [context, setContext] = useState<GenerationContext | null>(null);
  const [contextSummary, setContextSummary] = useState<ContextSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Writing state
  const [content, setContent] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generationType, setGenerationType] = useState<GenerationType>('continuation');
  const [prompt, setPrompt] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [canonViolations, setCanonViolations] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveKey = `ai-writing-studio-${seriesId}-${selectedBookId}`;
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.content) setContent(parsed.content);
        if (parsed.prompt) setPrompt(parsed.prompt);
        if (parsed.generationType) setGenerationType(parsed.generationType);
        if (parsed.selectedCharacters) setSelectedCharacters(parsed.selectedCharacters);
      } catch (error) {
        console.error('Failed to load auto-saved data:', error);
      }
    }
  }, [seriesId, selectedBookId]);

  useEffect(() => {
    const autoSaveKey = `ai-writing-studio-${seriesId}-${selectedBookId}`;
    const autoSave = () => {
      const data = {
        content,
        prompt,
        generationType,
        selectedCharacters,
        timestamp: Date.now(),
      };
      localStorage.setItem(autoSaveKey, JSON.stringify(data));
    };

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds

    // Save on beforeunload
    const handleBeforeUnload = () => autoSave();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [content, prompt, generationType, selectedCharacters, seriesId, selectedBookId]);

  useEffect(() => {
    fetchBooks();
    fetchCharacters();
  }, [seriesId]);

  useEffect(() => {
    if (selectedBookId) {
      fetchContext();
    }
  }, [selectedBookId]);

  const fetchBooks = async () => {
    try {
      const result = await persistentNarrativeEngine.getSeriesBooks(seriesId);
      setBooks(result);
      if (result.length > 0) {
        setSelectedBookId(result[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
    setLoading(false);
  };

  const fetchCharacters = async () => {
    try {
      const result = await persistentNarrativeEngine.getSeriesCharacters(seriesId);
      setCharacters(result);
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
  };

  const fetchContext = async () => {
    if (!selectedBookId) return;
    try {
      const ctx = await persistentNarrativeEngine.compileGenerationContext(seriesId, selectedBookId);
      setContext(ctx);
      setContextSummary({
        activeCharacters: ctx.activeCharacters,
        activeArcs: ctx.activeArcs,
        applicableRules: ctx.canonRules.length,
        worldElements: Object.keys(ctx.worldState).length,
      });
    } catch (error) {
      console.error('Failed to fetch context:', error);
      // Context compilation might fail if tables don't exist yet
      setContextSummary(null);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && generationType !== 'continuation') return;
    
    setGenerating(true);
    setCanonViolations([]);

    try {
      // Build the generation request with full context
      const characterContext = selectedCharacters.length > 0
        ? characters.filter(c => selectedCharacters.includes(c.id))
            .map(c => `${c.name} (${c.characterRole}): ${c.dialogueStyle || 'standard speech'}, traits: ${c.corePersonality.traits?.join(', ') || 'none'}`)
            .join('\n')
        : '';

      const systemPrompt = buildSystemPrompt();
      const userPrompt = buildUserPrompt(characterContext);

      // For now, simulate AI generation (replace with actual AI call)
      const mockGeneration = await simulateAIGeneration(userPrompt, systemPrompt);
      
      setGeneratedContent(mockGeneration.content);
      if (mockGeneration.violations.length > 0) {
        setCanonViolations(mockGeneration.violations);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const buildSystemPrompt = (): string => {
    let systemPrompt = `You are a creative writing assistant helping to write "${seriesTitle}". 
You have access to the full context of this story series and must maintain consistency with established canon.

`;

    if (context) {
      systemPrompt += `ACTIVE CHARACTERS:\n`;
      context.activeCharacters.forEach(char => {
        systemPrompt += `- ${char.name} (${char.role}, ${char.status})\n`;
      });

      systemPrompt += `\nACTIVE STORY ARCS:\n`;
      context.activeArcs.forEach(arc => {
        systemPrompt += `- ${arc.name} (${arc.status}, ${arc.completion}% complete)\n`;
      });

      if (context.canonRules.length > 0) {
        systemPrompt += `\nCANON RULES TO FOLLOW:\n`;
        context.canonRules.forEach(rule => {
          systemPrompt += `- [${rule.ruleType?.toUpperCase()}] ${rule.ruleDescription}\n`;
        });
      }

      if (context.toneGuidance) {
        systemPrompt += `\nTONE: ${context.toneGuidance}\n`;
      }
      if (context.pacingGuidance) {
        systemPrompt += `PACING: ${context.pacingGuidance}\n`;
      }
    }

    return systemPrompt;
  };

  const buildUserPrompt = (characterContext: string): string => {
    let userPrompt = '';

    switch (generationType) {
      case 'continuation':
        userPrompt = `Continue this story naturally:\n\n${content}\n\n`;
        if (prompt) userPrompt += `Direction: ${prompt}\n`;
        break;
      case 'dialogue':
        userPrompt = `Write a dialogue scene:\n\nContext: ${content}\n\nScene: ${prompt}\n`;
        if (characterContext) userPrompt += `\nCharacters involved:\n${characterContext}`;
        break;
      case 'description':
        userPrompt = `Write a vivid description:\n\nContext: ${content}\n\nDescribe: ${prompt}\n`;
        break;
      case 'action':
        userPrompt = `Write an action sequence:\n\nContext: ${content}\n\nAction: ${prompt}\n`;
        if (characterContext) userPrompt += `\nCharacters involved:\n${characterContext}`;
        break;
      case 'chapter_outline':
        userPrompt = `Create a chapter outline:\n\nStory so far: ${content}\n\nChapter focus: ${prompt}\n`;
        break;
    }

    return userPrompt;
  };

  const simulateAIGeneration = async (userPrompt: string, systemPrompt: string): Promise<{
    content: string;
    violations: string[];
  }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // This is a placeholder - replace with actual AI API call
    const mockContent = `[AI-Generated Content]

Based on your prompt: "${prompt || 'Continue the story'}"

${generationType === 'dialogue' ? `
"I didn't expect to find you here," said the first character, their voice barely above a whisper.

"Sometimes the unexpected is exactly what we need," came the reply, weighted with meaning.
` : ''}

${generationType === 'description' ? `
The ancient library stretched before them, its towering shelves reaching toward a ceiling lost in shadow. Dust motes danced in the few beams of light that filtered through cracked stained glass windows, illuminating leather-bound tomes that held secrets older than memory itself.
` : ''}

${generationType === 'action' ? `
She ducked beneath the swinging blade, feeling the whistle of steel mere inches above her head. In one fluid motion, she rolled forward, came up on her feet, and drove her own weapon toward her opponent's exposed flank.
` : ''}

${generationType === 'continuation' ? `
The moment stretched between them like a taut wire, neither willing to be the first to speak. Finally, it was the stranger who broke the silence.

"You've been searching for something," they said, their eyes reflecting the dim light. "I can help you find it—but the cost may be more than you're willing to pay."
` : ''}

${generationType === 'chapter_outline' ? `
**Chapter Outline**

1. Opening: Establish the current tension and stakes
2. Rising Action: The protagonist discovers a crucial piece of information
3. Complication: An unexpected ally arrives with news that changes everything
4. Climax: Confrontation with the immediate threat
5. Resolution: The chapter ends with a new question emerging
` : ''}

---
*This is a preview. In production, this would be generated by your AI provider with full series context.*`;

    return {
      content: mockContent,
      violations: [], // Would be populated by canon checking
    };
  };

  const insertGenerated = () => {
    setContent(prev => prev + (prev ? '\n\n' : '') + generatedContent);
    setGeneratedContent('');
  };

  const GENERATION_TYPES: { id: GenerationType; name: string; icon: string; desc: string }[] = [
    { id: 'continuation', name: 'Continue', icon: '✍️', desc: 'Continue the story naturally' },
    { id: 'dialogue', name: 'Dialogue', icon: '💬', desc: 'Write character dialogue' },
    { id: 'description', name: 'Description', icon: '🎨', desc: 'Describe a scene or character' },
    { id: 'action', name: 'Action', icon: '⚔️', desc: 'Write an action sequence' },
    { id: 'chapter_outline', name: 'Outline', icon: '📋', desc: 'Plan a chapter structure' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading AI Writing Studio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">AI Writing Studio</h2>
          <p className="text-text-secondary text-sm mt-1">
            {seriesTitle} • Canon-Aware AI Assistance
          </p>
        </div>
        {books.length > 0 && (
          <select
            value={selectedBookId || ''}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="px-4 py-2 bg-void-depth border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
          >
            {books.map(book => (
              <option key={book.id} value={book.id}>
                Book {book.bookNumber}: {book.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Context Summary */}
      {contextSummary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-void-depth border border-void-mist">
            <div className="text-2xl font-bold text-spectral-cyan">
              {contextSummary.activeCharacters.length}
            </div>
            <div className="text-xs text-text-tertiary">Active Characters</div>
          </div>
          <div className="p-4 rounded-lg bg-void-depth border border-void-mist">
            <div className="text-2xl font-bold text-spectral-violet">
              {contextSummary.activeArcs.length}
            </div>
            <div className="text-xs text-text-tertiary">Active Arcs</div>
          </div>
          <div className="p-4 rounded-lg bg-void-depth border border-void-mist">
            <div className="text-2xl font-bold text-spectral-gold">
              {contextSummary.applicableRules}
            </div>
            <div className="text-xs text-text-tertiary">Canon Rules</div>
          </div>
          <div className="p-4 rounded-lg bg-void-depth border border-void-mist">
            <div className="text-2xl font-bold text-green-400">
              {contextSummary.worldElements}
            </div>
            <div className="text-xs text-text-tertiary">World Elements</div>
          </div>
        </div>
      )}

      {/* No books warning */}
      {books.length === 0 && (
        <div className="p-6 rounded-lg bg-spectral-gold/10 border border-spectral-gold/30 text-center">
          <p className="text-spectral-gold mb-2">No books in this series yet</p>
          <p className="text-sm text-text-secondary">
            Create a book in your series to start using the AI Writing Studio with full context awareness.
          </p>
        </div>
      )}

      {/* Main Writing Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Writing Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-void-depth border border-void-mist">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Your Content</h3>
              <span className="text-xs text-text-tertiary">
                {content.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing or paste your existing content here. The AI will use this as context for generation..."
              className="w-full h-64 px-4 py-3 bg-void-base border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan resize-none font-serif text-lg leading-relaxed"
            />
          </div>

          {/* Generation Controls */}
          <div className="p-4 rounded-xl bg-void-depth border border-void-mist">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold text-text-primary">Generate</h3>
              <div className="flex gap-1">
                {GENERATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setGenerationType(type.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      generationType === type.id
                        ? 'bg-spectral-cyan text-void-base'
                        : 'text-text-secondary hover:text-text-primary hover:bg-void-mist'
                    }`}
                    title={type.desc}
                  >
                    {type.icon} {type.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  generationType === 'continuation' 
                    ? 'Optional: direction for continuation...'
                    : `What should the ${generationType} include?`
                }
                className="flex-1 px-4 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={generating || (!prompt.trim() && generationType !== 'continuation')}
                className="px-6 py-2 bg-gradient-to-r from-spectral-cyan to-spectral-violet text-white rounded-lg font-medium hover:shadow-lg hover:shadow-spectral-cyan/20 transition-all disabled:opacity-50"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⚡
                    </motion.span>
                    Generating...
                  </span>
                ) : (
                  '✨ Generate'
                )}
              </button>
            </div>
          </div>

          {/* Generated Content */}
          <AnimatePresence>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 rounded-xl bg-gradient-to-br from-spectral-cyan/10 to-spectral-violet/10 border border-spectral-cyan/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-primary">Generated Content</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGeneratedContent('')}
                      className="px-3 py-1 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={insertGenerated}
                      className="px-3 py-1 text-sm bg-spectral-cyan text-void-base rounded hover:bg-spectral-cyan/80 transition-colors"
                    >
                      Insert ↓
                    </button>
                  </div>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-serif text-text-secondary leading-relaxed bg-transparent p-0 m-0">
                    {generatedContent}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canon Violations */}
          {canonViolations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
            >
              <h4 className="font-semibold text-red-400 mb-2">⚠️ Potential Canon Violations</h4>
              <ul className="space-y-1">
                {canonViolations.map((violation, i) => (
                  <li key={i} className="text-sm text-red-400/80">• {violation}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Context Panel */}
        <div className="space-y-4">
          {/* Character Selection */}
          <div className="p-4 rounded-xl bg-void-depth border border-void-mist">
            <h3 className="font-semibold text-text-primary mb-3">Characters in Scene</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {characters.length === 0 ? (
                <p className="text-sm text-text-tertiary">No characters defined yet</p>
              ) : (
                characters.map((char) => (
                  <label
                    key={char.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedCharacters.includes(char.id)
                        ? 'bg-spectral-cyan/10 border border-spectral-cyan/30'
                        : 'hover:bg-void-mist'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCharacters.includes(char.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCharacters([...selectedCharacters, char.id]);
                        } else {
                          setSelectedCharacters(selectedCharacters.filter(id => id !== char.id));
                        }
                      }}
                      className="rounded border-void-mist text-spectral-cyan focus:ring-spectral-cyan"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary text-sm truncate">
                        {char.name}
                      </div>
                      <div className="text-xs text-text-tertiary">{char.characterRole}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      char.currentStatus === 'active' ? 'bg-green-400/20 text-green-400' :
                      char.currentStatus === 'deceased' ? 'bg-red-400/20 text-red-400' :
                      'bg-void-mist text-text-tertiary'
                    }`}>
                      {char.currentStatus}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Active Arcs */}
          {contextSummary && contextSummary.activeArcs.length > 0 && (
            <div className="p-4 rounded-xl bg-void-depth border border-void-mist">
              <h3 className="font-semibold text-text-primary mb-3">Active Story Arcs</h3>
              <div className="space-y-2">
                {contextSummary.activeArcs.slice(0, 5).map((arc) => (
                  <div key={arc.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">{arc.name}</span>
                      <span className="text-xs text-spectral-cyan">{arc.completion}%</span>
                    </div>
                    <div className="mt-1 h-1 bg-void-mist rounded-full overflow-hidden">
                      <div
                        className="h-full bg-spectral-cyan rounded-full"
                        style={{ width: `${arc.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Context Info */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-spectral-violet/10 to-spectral-cyan/10 border border-spectral-violet/20">
            <h4 className="font-semibold text-text-primary mb-2">🧠 Canon-Aware AI</h4>
            <p className="text-xs text-text-secondary">
              The AI has access to your entire series context including characters, 
              world elements, active arcs, and canon rules. It will maintain consistency 
              and warn you of potential violations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

