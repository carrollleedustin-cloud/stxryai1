'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Plus, 
  Play, 
  Pause, 
  Archive, 
  Edit, 
  Users, 
  BookOpen,
  MessageSquare,
  Trophy,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { globalStoryService, GlobalStory, GlobalStoryChapter, GlobalStoryStats, AIChoice } from '@/services/globalStoryService';

export default function AdminGlobalStoryPage() {
  const [stories, setStories] = useState<GlobalStory[]>([]);
  const [activeStory, setActiveStory] = useState<GlobalStory | null>(null);
  const [chapters, setChapters] = useState<GlobalStoryChapter[]>([]);
  const [stats, setStats] = useState<GlobalStoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  // Create story form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    theme: 'fantasy',
    startingPremise: '',
  });

  // Create chapter form
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [newChapter, setNewChapter] = useState({
    content: '',
    title: '',
    votingHours: 24,
    choices: [
      { index: 0, text: '', consequence: '' },
      { index: 1, text: '', consequence: '' },
      { index: 2, text: '', consequence: '' },
    ] as AIChoice[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allStories, active] = await Promise.all([
        globalStoryService.getAllStories(),
        globalStoryService.getActiveStory(),
      ]);

      setStories(allStories);
      setActiveStory(active);

      if (active) {
        const [chaptersData, statsData] = await Promise.all([
          globalStoryService.getChapters(active.id),
          globalStoryService.getStats(active.id),
        ]);
        setChapters(chaptersData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async () => {
    try {
      await globalStoryService.createStory(
        newStory.title,
        newStory.startingPremise,
        {
          description: newStory.description,
          theme: newStory.theme,
        }
      );
      setShowCreateForm(false);
      setNewStory({ title: '', description: '', theme: 'fantasy', startingPremise: '' });
      loadData();
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  const handleActivateStory = async (storyId: string) => {
    if (!confirm('This will end the current active story. Continue?')) return;
    
    try {
      await globalStoryService.activateStory(storyId);
      loadData();
    } catch (error) {
      console.error('Error activating story:', error);
    }
  };

  const handleArchiveStory = async (storyId: string) => {
    if (!confirm('Archive this story? It will no longer be accessible.')) return;
    
    try {
      await globalStoryService.archiveStory(storyId);
      loadData();
    } catch (error) {
      console.error('Error archiving story:', error);
    }
  };

  const handleCreateChapter = async () => {
    if (!activeStory) return;

    try {
      await globalStoryService.createChapter(
        activeStory.id,
        newChapter.content,
        newChapter.choices.filter(c => c.text.trim()),
        {
          title: newChapter.title,
          votingDurationHours: newChapter.votingHours,
        }
      );
      setShowChapterForm(false);
      setNewChapter({
        content: '',
        title: '',
        votingHours: 24,
        choices: [
          { index: 0, text: '', consequence: '' },
          { index: 1, text: '', consequence: '' },
          { index: 2, text: '', consequence: '' },
        ],
      });
      loadData();
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Global Community Story</h1>
              <p className="text-gray-400">Manage the story everyone contributes to</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Story
          </button>
        </div>

        {/* Active Story Stats */}
        {activeStory && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">Contributors</span>
              </div>
              <p className="text-2xl font-bold">{stats.uniqueContributors}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                <span className="text-gray-400">Total Actions</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalContributions}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400">Chapters</span>
              </div>
              <p className="text-2xl font-bold">{stats.chapterCount}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400">Current Chapter Actions</span>
              </div>
              <p className="text-2xl font-bold">{stats.currentChapterActions}</p>
            </div>
          </motion.div>
        )}

        {/* Active Story */}
        {activeStory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <h2 className="text-xl font-bold">Active Story: {activeStory.title}</h2>
              </div>
              <button
                onClick={() => setShowChapterForm(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Chapter
              </button>
            </div>

            <p className="text-gray-400 mb-4">{activeStory.description}</p>

            {/* Chapters */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold mb-2">Chapters</h3>
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="bg-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedChapter(
                      expandedChapter === chapter.id ? null : chapter.id
                    )}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">#{chapter.chapterNumber}</span>
                      <span className="font-medium">{chapter.title}</span>
                      {!chapter.votesTallied && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                          Voting Open
                        </span>
                      )}
                      {chapter.winningActionText && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          Winner Selected
                        </span>
                      )}
                    </div>
                    {expandedChapter === chapter.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedChapter === chapter.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <p className="text-gray-300 text-sm mb-3">{chapter.content.substring(0, 300)}...</p>
                        
                        {chapter.aiGeneratedChoices.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-400 mb-2">AI Choices:</p>
                            <div className="space-y-1">
                              {chapter.aiGeneratedChoices.map((choice, i) => (
                                <div key={i} className="text-sm bg-gray-800 rounded px-3 py-2">
                                  {i + 1}. {choice.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {chapter.winningActionText && (
                          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-sm text-green-400 font-medium">Winning Action:</p>
                            <p className="text-green-300">{chapter.winningActionText}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {chapters.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  No chapters yet. Create the first chapter to start the story!
                </p>
              )}
            </div>

            {/* Top Contributors */}
            {stats && stats.topContributors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Top Contributors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stats.topContributors.slice(0, 5).map((contributor, i) => (
                    <div
                      key={contributor.userId}
                      className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-1"
                    >
                      <span className="text-yellow-400 font-bold">#{i + 1}</span>
                      <span>{contributor.username}</span>
                      <span className="text-gray-400 text-sm">({contributor.contributions})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* All Stories */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">All Stories</h2>
          
          <div className="space-y-3">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(story.status)}`} />
                  <div>
                    <h3 className="font-medium">{story.title}</h3>
                    <p className="text-sm text-gray-400">
                      {story.chapterCount} chapters • {story.uniqueContributors} contributors
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded capitalize">
                    {story.status}
                  </span>

                  {story.status === 'draft' && (
                    <button
                      onClick={() => handleActivateStory(story.id)}
                      className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-colors"
                      title="Activate"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  {story.status !== 'archived' && (
                    <button
                      onClick={() => handleArchiveStory(story.id)}
                      className="p-2 text-gray-400 hover:bg-gray-600 rounded-lg transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {stories.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                No stories yet. Create your first global story!
              </p>
            )}
          </div>
        </div>

        {/* Create Story Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowCreateForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Create Global Story</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="The Community Chronicles"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={newStory.description}
                      onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                      rows={2}
                      placeholder="A story shaped by the entire community..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Theme</label>
                    <select
                      value={newStory.theme}
                      onChange={(e) => setNewStory({ ...newStory, theme: e.target.value })}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="fantasy">Fantasy</option>
                      <option value="sci-fi">Sci-Fi</option>
                      <option value="mystery">Mystery</option>
                      <option value="adventure">Adventure</option>
                      <option value="horror">Horror</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Starting Premise</label>
                    <textarea
                      value={newStory.startingPremise}
                      onChange={(e) => setNewStory({ ...newStory, startingPremise: e.target.value })}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                      rows={4}
                      placeholder="The story begins when..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateStory}
                      disabled={!newStory.title || !newStory.startingPremise}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Story
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Chapter Modal */}
        <AnimatePresence>
          {showChapterForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowChapterForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Add New Chapter</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Chapter Title</label>
                      <input
                        type="text"
                        value={newChapter.title}
                        onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                        className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Chapter 1: The Beginning"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Voting Duration (hours)</label>
                      <input
                        type="number"
                        value={newChapter.votingHours}
                        onChange={(e) => setNewChapter({ ...newChapter, votingHours: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                        min={1}
                        max={168}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Chapter Content</label>
                    <textarea
                      value={newChapter.content}
                      onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                      rows={8}
                      placeholder="Write the chapter content..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      AI-Generated Choice Options (optional)
                    </label>
                    <div className="space-y-2">
                      {newChapter.choices.map((choice, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-gray-500 mt-2">{i + 1}.</span>
                          <input
                            type="text"
                            value={choice.text}
                            onChange={(e) => {
                              const choices = [...newChapter.choices];
                              choices[i] = { ...choices[i], text: e.target.value };
                              setNewChapter({ ...newChapter, choices });
                            }}
                            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder={`Choice ${i + 1}...`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Users can also write their own custom actions
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowChapterForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateChapter}
                      disabled={!newChapter.content}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Chapter
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

