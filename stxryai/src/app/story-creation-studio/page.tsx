'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import {
  createStoryDraft,
  addChapter,
  addChoicesToChapter,
  getStoryForEditing,
  publishStory,
  getUserDrafts,
  type StoryMetadata,
  type StoryNode,
  type ChoiceNode,
} from '@/services/storyCreationService';
import EnhancedAIAssistant from '@/components/ai/EnhancedAIAssistant';
import StoryIdeaGenerator from '@/components/ai/StoryIdeaGenerator';

type EditorMode = 'metadata' | 'chapters' | 'choices' | 'preview' | 'ai-tools';

export default function StoryCreationStudioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<EditorMode>('metadata');
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
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
    // AI Autonomy Settings
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
    } else if (user) {
      loadUserDrafts();
    }
  }, [user, authLoading, router]);

  const loadUserDrafts = async () => {
    if (!user?.id) return;
    const result = await getUserDrafts(user.id);
    if (result.success && result.drafts) {
      setDrafts(result.drafts);
    }
  };

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
      loadUserDrafts();
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

      // Reset chapter form
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

  const handlePublishStory = async () => {
    if (!currentStoryId) return;
    if (chapters.length === 0) {
      setError('Add at least one chapter before publishing');
      return;
    }

    setLoading(true);
    const result = await publishStory(currentStoryId);

    if (result.success) {
      setSuccessMessage('Story published successfully! 🎉');
      setTimeout(() => router.push('/story-library'), 2000);
    } else {
      setError('Failed to publish story');
    }
    setLoading(false);
  };

  const handleLoadDraft = async (draftId: string) => {
    setLoading(true);
    const result = await getStoryForEditing(draftId);

    if (result.success && result.story && result.chapters) {
      setCurrentStoryId(draftId);
      const story = result.story;
      setMetadata({
        id: story.id,
        title: story.title || '',
        description: story.description || '',
        genre: (story.genre as any) || 'fantasy',
        difficulty: (story.difficulty as any) || 'easy',
        coverImageUrl: story.cover_image || '',
        isPremium: story.is_premium || false,
        estimatedDuration: story.estimated_duration || 30,
        storyMode: (story.story_mode as any) || 'ai_choices',
        customChoiceTier: (story.custom_choice_tier as any) || 'none',
        enableAICompanion: story.enable_ai_companion || false,
      });

      const loadedChapters: StoryNode[] = result.chapters.map((ch: any) => ({
        id: ch.id,
        chapterId: ch.id,
        title: ch.title,
        content: ch.content,
        chapterNumber: ch.chapter_number,
        choices: ch.story_choices || [],
      }));

      setChapters(loadedChapters);
      setMode('chapters');
    } else {
      setError('Failed to load draft');
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

  const getChapterTitle = (chapterId: string | undefined) => {
    if (!chapterId) return 'End of story';
    const chapter = chapters.find((c) => c.id === chapterId);
    return chapter ? `${chapter.chapterNumber}. ${chapter.title}` : 'Unknown Chapter';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading story creation studio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Writer's Desk Promo Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-1">
          <div className="relative rounded-xl bg-gray-900/95 p-6 md:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10 rounded-xl" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                    New: Writer's Desk for Series Authors
                  </h2>
                  <p className="text-sm text-gray-300 max-w-xl">
                    Building a multi-book series? The Writer's Desk offers persistent character
                    management, world-building archives, canon enforcement, and AI that knows your
                    entire story universe.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/writers-desk')}
                className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl 
                         hover:from-violet-400 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl
                         hover:scale-105 transform flex items-center gap-2"
              >
                <span>Open Writer's Desk</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Studio Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Story Creation Studio</h1>
            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              Standalone Stories
            </span>
          </div>
          <p className="text-gray-600">
            Create interactive fiction with AI assistance and branching narratives. For multi-book
            series with persistent characters, use the Writer's Desk.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800 text-sm mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-8">
            {[
              { id: 'metadata', label: 'Story Details', icon: '📝' },
              { id: 'ai-tools', label: 'AI Tools', icon: '✨' },
              { id: 'chapters', label: 'Chapters', icon: '📚' },
              { id: 'choices', label: 'Choices', icon: '🔀' },
              { id: 'preview', label: 'Preview & Publish', icon: '👁️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as EditorMode)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  mode === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Story Metadata Mode */}
        {mode === 'metadata' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Story Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    placeholder="Enter your story title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    placeholder="Describe your story..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                    <select
                      value={metadata.genre}
                      onChange={(e) => setMetadata({ ...metadata, genre: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={metadata.difficulty}
                      onChange={(e) =>
                        setMetadata({ ...metadata, difficulty: e.target.value as any })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (min)
                    </label>
                    <input
                      type="number"
                      value={metadata.estimatedDuration}
                      onChange={(e) =>
                        setMetadata({ ...metadata, estimatedDuration: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Premium Content
                    </label>
                    <div className="flex items-center h-full">
                      <input
                        type="checkbox"
                        checked={metadata.isPremium}
                        onChange={(e) => setMetadata({ ...metadata, isPremium: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Make this a premium story
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={metadata.coverImageUrl}
                    onChange={(e) => setMetadata({ ...metadata, coverImageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* AI Autonomy Settings */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>✨</span> Story Mode & AI Settings
                  </h3>

                  {/* Story Mode Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      How should your story work?
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        {
                          value: 'static',
                          label: 'Static Story',
                          desc: 'You write everything. Readers follow your exact narrative.',
                          icon: '📖',
                        },
                        {
                          value: 'ai_choices',
                          label: 'AI Choices',
                          desc: 'AI generates choices at chapter ends. Readers pick from options.',
                          icon: '🔀',
                        },
                        {
                          value: 'ai_infinite',
                          label: 'Infinite AI Story',
                          desc: 'Full AI branching with companion memory. Premium users can write custom choices.',
                          icon: '♾️',
                        },
                      ].map((mode) => (
                        <label
                          key={mode.value}
                          className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            metadata.storyMode === mode.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="storyMode"
                            value={mode.value}
                            checked={metadata.storyMode === mode.value}
                            onChange={(e) =>
                              setMetadata({ ...metadata, storyMode: e.target.value as any })
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span>{mode.icon}</span>
                              <span className="font-medium text-gray-900">{mode.label}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{mode.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Custom Choice Tier (only for ai_infinite mode) */}
                  {metadata.storyMode === 'ai_infinite' && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Who can write custom choices?
                      </label>
                      <select
                        value={metadata.customChoiceTier}
                        onChange={(e) =>
                          setMetadata({ ...metadata, customChoiceTier: e.target.value as any })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="none">No one (preset choices only)</option>
                        <option value="premium">Premium subscribers</option>
                        <option value="pro">Pro subscribers</option>
                        <option value="all">Everyone</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Custom choices let readers type their own path instead of picking from
                        options.
                      </p>
                    </div>
                  )}

                  {/* AI Companion (only for ai_infinite mode) */}
                  {metadata.storyMode === 'ai_infinite' && (
                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <label className="font-medium text-gray-900 flex items-center gap-2">
                            <span>🤖</span> AI Story Companion
                          </label>
                          <p className="text-xs text-gray-500">
                            A character that remembers reader choices and grows with the story
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={metadata.enableAICompanion}
                          onChange={(e) =>
                            setMetadata({ ...metadata, enableAICompanion: e.target.checked })
                          }
                          className="h-5 w-5 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                        />
                      </div>

                      {metadata.enableAICompanion && (
                        <div className="space-y-3 pt-3 border-t border-cyan-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Companion Name
                            </label>
                            <input
                              type="text"
                              value={metadata.companionName || ''}
                              onChange={(e) =>
                                setMetadata({ ...metadata, companionName: e.target.value })
                              }
                              placeholder="e.g., Luna, Sage, Echo..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Personality Type
                            </label>
                            <select
                              value={metadata.companionPersonality || ''}
                              onChange={(e) =>
                                setMetadata({ ...metadata, companionPersonality: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                            >
                              <option value="">Select personality...</option>
                              <option value="guide">Wise Guide - Offers hints and wisdom</option>
                              <option value="friend">
                                Friendly Companion - Supportive and encouraging
                              </option>
                              <option value="mentor">Mentor - Challenges reader to grow</option>
                              <option value="trickster">
                                Trickster - Playful and unpredictable
                              </option>
                              <option value="mystery">Mysterious - Cryptic and enigmatic</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreateNewStory}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  {loading ? 'Creating...' : 'Create Story Draft'}
                </button>
              </div>
            </div>

            {/* Drafts Sidebar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Drafts</h2>

              <div className="space-y-3">
                {drafts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No drafts yet. Create your first story!
                  </p>
                ) : (
                  drafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => handleLoadDraft(draft.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-1">{draft.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {draft.genre} • {draft.total_chapters} chapters
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(draft.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Tools Mode */}
        {mode === 'ai-tools' && (
          <div className="space-y-8">
            {/* Story Idea Generator */}
            <div className="bg-white rounded-lg shadow p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Story Idea Generator</h2>
                <p className="text-gray-600">
                  Need inspiration? Let AI generate complete story concepts for you
                </p>
              </div>
              <StoryIdeaGenerator />
            </div>

            {/* AI Writing Assistant */}
            <div className="bg-white rounded-lg shadow p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Writing Assistant</h2>
                <p className="text-gray-600">
                  Get AI-powered suggestions to improve, continue, rewrite, or expand your story
                </p>
              </div>
              <EnhancedAIAssistant
                initialText={chapterContent.content}
                onTextChange={(text) => setChapterContent({ ...chapterContent, content: text })}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('metadata')}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="font-medium text-gray-900">Create New Story</div>
                  <div className="text-sm text-gray-600">Start with story details</div>
                </button>
                <button
                  onClick={() => setMode('chapters')}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left"
                >
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-medium text-gray-900">Write Chapters</div>
                  <div className="text-sm text-gray-600">Add content to your story</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chapters Mode */}
        {mode === 'chapters' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chapter Editor */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Chapter</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter {chapterContent.chapterNumber} Title *
                  </label>
                  <input
                    type="text"
                    value={chapterContent.title}
                    onChange={(e) =>
                      setChapterContent({ ...chapterContent, title: e.target.value })
                    }
                    placeholder="Enter chapter title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Content *
                  </label>
                  <textarea
                    value={chapterContent.content}
                    onChange={(e) =>
                      setChapterContent({ ...chapterContent, content: e.target.value })
                    }
                    placeholder="Write your chapter content here..."
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {chapterContent.content.length} characters
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddChapter}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                  >
                    {loading ? 'Adding...' : 'Add Chapter & Continue to Choices'}
                  </button>
                  <button
                    onClick={() => setMode('preview')}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* AI Assistant Link */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">✨</span> AI Writing Assistant
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get AI-powered suggestions to improve, continue, rewrite, or expand your story
                </p>
                <button
                  onClick={() => setMode('ai-tools')}
                  className="text-sm bg-white px-4 py-2 rounded border border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all font-medium"
                >
                  Open AI Tools →
                </button>
              </div>
            </div>

            {/* Chapter List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Story Structure</h2>

              <div className="space-y-2">
                {chapters.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No chapters yet. Add your first chapter!
                  </p>
                ) : (
                  chapters.map((chapter, index) => (
                    <div key={chapter.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {index + 1}. {chapter.title}
                          </h3>
                          <div className="text-xs text-gray-500 mt-2 space-y-1">
                            {chapter.choices?.map((choice) => (
                              <div key={choice.id} className="flex items-center">
                                <span className="mr-1">-&gt;</span>
                                <span className="italic">"{choice.choiceText}"</span>
                                <span className="mx-1"> leads to </span>
                                <span className="font-semibold text-blue-600">
                                  {getChapterTitle(choice.nextChapterId)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">
                          Ch {chapter.chapterNumber}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Choices Mode */}
        {mode === 'choices' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Choices</h2>
              {currentChapter && (
                <p className="text-sm text-gray-600 mb-6">
                  Adding choices for: <span className="font-medium">{currentChapter.title}</span>
                </p>
              )}

              <div className="space-y-4">
                {choices.map((choice, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Choice {index + 1}</h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Choice Text *</label>
                        <input
                          type="text"
                          value={choice.choiceText}
                          onChange={(e) => updateChoice(index, 'choiceText', e.target.value)}
                          placeholder="What action can the reader take?"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Consequence Text (Optional)
                        </label>
                        <input
                          type="text"
                          value={choice.consequenceText}
                          onChange={(e) => updateChoice(index, 'consequenceText', e.target.value)}
                          placeholder="What happens as a result?"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Leads to Chapter</label>
                        <select
                          value={choice.nextChapterId || ''}
                          onChange={(e) => updateChoice(index, 'nextChapterId', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">-- Select a chapter --</option>
                          {chapters.map((chap) => (
                            <option key={chap.id} value={chap.id}>
                              {chap.chapterNumber}. {chap.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addChoiceField}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  + Add Another Choice
                </button>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleAddChoices}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                  >
                    {loading ? 'Saving...' : 'Save Choices'}
                  </button>
                  <button
                    onClick={() => setMode('chapters')}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back to Chapters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {mode === 'preview' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{metadata.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  {metadata.genre}
                </span>
                <span>{metadata.difficulty}</span>
                <span>~{metadata.estimatedDuration} min read</span>
                {metadata.isPremium && <span className="text-yellow-600">⭐ Premium</span>}
              </div>

              <p className="text-gray-700 mb-8">{metadata.description}</p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Story Structure</h3>
                  <p className="text-gray-600 mb-4">Total Chapters: {chapters.length}</p>

                  {chapters.map((chapter, index) => (
                    <div key={chapter.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Chapter {index + 1}: {chapter.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{chapter.content}</p>
                      <div className="text-xs text-gray-500 mt-2 space-y-1">
                        {chapter.choices?.map((choice) => (
                          <div key={choice.id} className="flex items-center">
                            <span className="mr-1">-&gt;</span>
                            <span className="italic">"{choice.choiceText}"</span>
                            <span className="mx-1"> leads to </span>
                            <span className="font-semibold text-blue-600">
                              {getChapterTitle(choice.nextChapterId)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePublishStory}
                    disabled={loading || chapters.length === 0}
                    className="w-full bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-bold text-lg"
                  >
                    {loading ? 'Publishing...' : '🚀 Publish Story'}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Your story will be available in the Story Library
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
