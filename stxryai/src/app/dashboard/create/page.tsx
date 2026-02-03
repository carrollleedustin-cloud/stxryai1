'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { NebulaCard } from '@/components/nebula/NebulaCard';
import { NebulaButton } from '@/components/nebula/NebulaButton';
import { NebulaTitle } from '@/components/nebula/NebulaText';
import {
  createStoryDraft,
  addChapter,
  addChoicesToChapter,
  type StoryMetadata,
  type StoryNode,
  type ChoiceNode,
} from '@/services/storyCreationService';
import EnhancedAIAssistant from '@/components/ai/EnhancedAIAssistant';
import StoryIdeaGenerator from '@/components/ai/StoryIdeaGenerator';
import { Sparkles, BookOpen, GitBranch, Eye, ArrowLeft } from 'lucide-react';

/**
 * STORY CREATION PAGE
 * Streamlined story creation interface within the unified dashboard
 */

type EditorMode = 'metadata' | 'chapters' | 'choices' | 'preview' | 'ai-tools';

// Wrapper component to handle useSearchParams with Suspense
function CreateStoryContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showAI = searchParams.get('ai') === 'true';

  const [mode, setMode] = useState<EditorMode>(showAI ? 'ai-tools' : 'metadata');
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Story metadata state
  const [metadata, setMetadata] = useState<StoryMetadata>({
    title: '',
    description: '',
    genre: 'fantasy',
    difficulty: 'easy',
    coverImageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
    isPremium: false,
    estimatedDuration: 30,
    storyMode: 'ai_choices',
    customChoiceTier: 'none',
    enableAICompanion: false,
  });

  // Chapters and choices state
  const [chapters, setChapters] = useState<StoryNode[]>([]);
  const [currentChapter, setCurrentChapter] = useState<StoryNode | null>(null);
  const [chapterContent, setChapterContent] = useState({
    title: '',
    content: '',
    chapterNumber: 1,
  });
  const [choices, setChoices] = useState<Omit<ChoiceNode, 'id'>[]>([
    { choiceText: '', consequenceText: '', choiceOrder: 1, nextChapterId: undefined },
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/authentication');
    }
  }, [user, authLoading, router]);

  const handleCreateNewStory = async () => {
    if (!user?.id) return;
    if (!metadata.title || !metadata.description) {
      setError('Please provide story title and description');
      return;
    }

    setLoading(true);
    const result = await createStoryDraft(metadata, user.id);

    if (result.success && result.story) {
      setCurrentStoryId(result.story.id);
      setSuccessMessage('Story draft created successfully!');
      setMode('chapters');
    } else {
      setError('Failed to create story draft');
    }
    setLoading(false);
  };

  const handleAddChapter = async () => {
    if (!currentStoryId) return;
    if (!chapterContent.title || !chapterContent.content) {
      setError('Please provide chapter title and content');
      return;
    }

    setLoading(true);
    const result = await addChapter(currentStoryId, chapterContent);

    if (result.success && result.chapter) {
      const newChapter: StoryNode = {
        id: result.chapter.id,
        chapterId: result.chapter.id,
        title: result.chapter.title,
        content: result.chapter.content,
        chapterNumber: result.chapter.chapter_number,
        choices: [],
      };

      setChapters([...chapters, newChapter]);
      setCurrentChapter(newChapter);
      setSuccessMessage('Chapter added successfully!');
      setMode('choices');

      setChapterContent({
        title: '',
        content: '',
        chapterNumber: chapters.length + 2,
      });
    } else {
      setError('Failed to add chapter');
    }
    setLoading(false);
  };

  const handleAddChoices = async () => {
    if (!currentChapter?.chapterId) return;

    const validChoices = choices.filter((c) => c.choiceText.trim() !== '');
    if (validChoices.length === 0) {
      setError('Please add at least one choice');
      return;
    }

    setLoading(true);
    const result = await addChoicesToChapter(currentChapter.chapterId, validChoices);

    if (result.success) {
      setSuccessMessage('Choices added successfully!');
      setChoices([
        { choiceText: '', consequenceText: '', choiceOrder: 1, nextChapterId: undefined },
      ]);
      setMode('chapters');
    } else {
      setError('Failed to add choices');
    }
    setLoading(false);
  };

  const addChoiceField = () => {
    setChoices([
      ...choices,
      {
        choiceText: '',
        consequenceText: '',
        choiceOrder: choices.length + 1,
        nextChapterId: undefined,
      },
    ]);
  };

  const updateChoice = (index: number, field: keyof Omit<ChoiceNode, 'id'>, value: string) => {
    const updated = [...choices];
    updated[index] = { ...updated[index], [field]: value };
    setChoices(updated);
  };

  const tabs = [
    { id: 'metadata', label: 'Story Details', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ai-tools', label: 'AI Tools', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'chapters', label: 'Chapters', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'choices', label: 'Choices', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-void-absolute flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spectral-cyan mx-auto mb-4"></div>
          <p className="text-white/60">Loading story creator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-absolute">
      <div className="container-void py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <NebulaButton
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              href="/dashboard"
            >
              Back
            </NebulaButton>
            <div>
              <NebulaTitle size="md" gradient="aurora">
                Create New Story
              </NebulaTitle>
              <p className="text-white/60 mt-1">
                Build your interactive narrative with AI assistance
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <NebulaCard glowColor="pink" className="p-4 border-l-4 border-spectral-rose">
              <p className="text-spectral-rose">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-spectral-rose/70 hover:text-spectral-rose text-sm mt-2 underline"
              >
                Dismiss
              </button>
            </NebulaCard>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <NebulaCard glowColor="cyan" className="p-4 border-l-4 border-green-500">
              <p className="text-green-400">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-400/70 hover:text-green-400 text-sm mt-2 underline"
              >
                Dismiss
              </button>
            </NebulaCard>
          </motion.div>
        )}

        {/* Mode Tabs */}
        <div className="mb-6">
          <div className="flex overflow-x-auto gap-2 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as EditorMode)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                  ${
                    mode === tab.id
                      ? 'bg-spectral-cyan text-void-absolute'
                      : 'bg-void-surface text-white/70 hover:bg-void-mist'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {mode === 'metadata' && (
              <NebulaCard>
                <h2 className="text-xl font-semibold text-white mb-6">Story Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Story Title *
                    </label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                      placeholder="Enter your story title"
                      className="w-full px-4 py-3 bg-void-surface border border-membrane rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-spectral-cyan focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={metadata.description}
                      onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                      placeholder="Describe your story..."
                      rows={4}
                      className="w-full px-4 py-3 bg-void-surface border border-membrane rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-spectral-cyan focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Genre</label>
                      <select
                        value={metadata.genre}
                        onChange={(e) => setMetadata({ ...metadata, genre: e.target.value as any })}
                        className="w-full px-4 py-3 bg-void-surface border border-membrane rounded-lg text-white focus:ring-2 focus:ring-spectral-cyan focus:border-transparent transition-all"
                      >
                        <option value="fantasy">Fantasy</option>
                        <option value="sci-fi">Sci-Fi</option>
                        <option value="mystery">Mystery</option>
                        <option value="romance">Romance</option>
                        <option value="horror">Horror</option>
                        <option value="adventure">Adventure</option>
                        <option value="thriller">Thriller</option>
                        <option value="historical">Historical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={metadata.difficulty}
                        onChange={(e) =>
                          setMetadata({ ...metadata, difficulty: e.target.value as any })
                        }
                        className="w-full px-4 py-3 bg-void-surface border border-membrane rounded-lg text-white focus:ring-2 focus:ring-spectral-cyan focus:border-transparent transition-all"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <NebulaButton
                      onClick={handleCreateNewStory}
                      disabled={loading || !metadata.title || !metadata.description}
                      fullWidth
                    >
                      {loading ? 'Creating...' : 'Create Story Draft'}
                    </NebulaButton>
                  </div>
                </div>
              </NebulaCard>
            )}

            {mode === 'ai-tools' && (
              <div className="space-y-6">
                <NebulaCard>
                  <h2 className="text-xl font-semibold text-white mb-4">AI Story Assistant</h2>
                  <EnhancedAIAssistant />
                </NebulaCard>

                <NebulaCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Story Idea Generator</h2>
                  <StoryIdeaGenerator />
                </NebulaCard>
              </div>
            )}

            {mode === 'chapters' && (
              <NebulaCard>
                <h2 className="text-xl font-semibold text-white mb-6">Add Chapter</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Chapter Title *
                    </label>
                    <input
                      type="text"
                      value={chapterContent.title}
                      onChange={(e) =>
                        setChapterContent({ ...chapterContent, title: e.target.value })
                      }
                      placeholder="Enter chapter title"
                      className="w-full px-4 py-3 bg-void-surface border border-membrane rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-spectral-cyan focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Chapter Content *
                    </label>
                    <textarea
                      value={chapterContent.content}
                      onChange={(e) =>
                        setChapterContent({ ...chapterContent, content: e.target.value })
                      }
                      placeholder="Write your chapter content..."
                      rows={12}
                      className="w-full px-4 py-3 bg-void-surface border border-membrane rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-spectral-cyan focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div className="pt-4">
                    <NebulaButton
                      onClick={handleAddChapter}
                      disabled={loading || !chapterContent.title || !chapterContent.content}
                      fullWidth
                    >
                      {loading ? 'Adding...' : 'Add Chapter'}
                    </NebulaButton>
                  </div>
                </div>
              </NebulaCard>
            )}

            {mode === 'choices' && (
              <NebulaCard>
                <h2 className="text-xl font-semibold text-white mb-6">Add Choices</h2>

                <div className="space-y-4">
                  {choices.map((choice, index) => (
                    <div key={index} className="p-4 bg-void-surface rounded-lg border border-membrane">
                      <h3 className="text-sm font-medium text-white/70 mb-3">
                        Choice {index + 1}
                      </h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={choice.choiceText}
                          onChange={(e) => updateChoice(index, 'choiceText', e.target.value)}
                          placeholder="Choice text"
                          className="w-full px-4 py-2 bg-void-absolute border border-membrane rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-spectral-cyan focus:border-transparent transition-all"
                        />
                        <textarea
                          value={choice.consequenceText}
                          onChange={(e) => updateChoice(index, 'consequenceText', e.target.value)}
                          placeholder="Consequence text (optional)"
                          rows={2}
                          className="w-full px-4 py-2 bg-void-absolute border border-membrane rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-spectral-cyan focus:border-transparent transition-all resize-none"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <NebulaButton variant="ghost" onClick={addChoiceField} fullWidth>
                      Add Another Choice
                    </NebulaButton>
                    <NebulaButton
                      onClick={handleAddChoices}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? 'Saving...' : 'Save Choices'}
                    </NebulaButton>
                  </div>
                </div>
              </NebulaCard>
            )}

            {mode === 'preview' && (
              <NebulaCard>
                <h2 className="text-xl font-semibold text-white mb-6">Story Preview</h2>
                <p className="text-white/60">Preview functionality coming soon...</p>
              </NebulaCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NebulaCard glowColor="violet">
              <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Chapters</span>
                  <span className="text-white font-medium">{chapters.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Status</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">
                    Draft
                  </span>
                </div>
              </div>
            </NebulaCard>

            <NebulaCard glowColor="cyan">
              <h3 className="text-lg font-semibold text-white mb-4">Tips</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li>• Start with a compelling opening</li>
                <li>• Keep chapters concise and engaging</li>
                <li>• Offer meaningful choices to readers</li>
                <li>• Use AI tools for inspiration</li>
              </ul>
            </NebulaCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function CreateStoryLoading() {
  return (
    <div className="min-h-screen bg-void-absolute flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spectral-cyan mx-auto mb-4"></div>
        <p className="text-white/60">Loading story creator...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function CreateStoryPage() {
  return (
    <Suspense fallback={<CreateStoryLoading />}>
      <CreateStoryContent />
    </Suspense>
  );
}
