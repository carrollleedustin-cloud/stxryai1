'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Users,
  Clock,
  ChevronUp,
  ChevronDown,
  Send,
  Sparkles,
  Trophy,
  ThumbsUp,
  Check,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  globalStoryService,
  GlobalStory,
  GlobalStoryChapter,
  GlobalStoryAction,
  UserCooldownStatus,
} from '@/services/globalStoryService';

export default function GlobalStoryReader() {
  const { user } = useAuth();
  const [story, setStory] = useState<GlobalStory | null>(null);
  const [chapters, setChapters] = useState<GlobalStoryChapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<GlobalStoryChapter | null>(null);
  const [actions, setActions] = useState<GlobalStoryAction[]>([]);
  const [cooldownStatus, setCooldownStatus] = useState<UserCooldownStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Action input
  const [actionMode, setActionMode] = useState<'preset' | 'custom'>('preset');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [customAction, setCustomAction] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const activeStory = await globalStoryService.getActiveStory();
      if (!activeStory) {
        setStory(null);
        setLoading(false);
        return;
      }

      setStory(activeStory);

      const [chaptersData, currentChapterData] = await Promise.all([
        globalStoryService.getChapters(activeStory.id),
        globalStoryService.getCurrentChapter(activeStory.id),
      ]);

      setChapters(chaptersData);
      setCurrentChapter(currentChapterData);

      if (currentChapterData && user) {
        const [actionsData, cooldown] = await Promise.all([
          globalStoryService.getChapterActions(currentChapterData.id, user.id),
          globalStoryService.getUserCooldownStatus(user.id, activeStory.id),
        ]);
        setActions(actionsData);
        setCooldownStatus(cooldown);
      } else if (currentChapterData) {
        const actionsData = await globalStoryService.getChapterActions(currentChapterData.id);
        setActions(actionsData);
      }
    } catch (error) {
      console.error('Error loading global story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAction = async () => {
    if (!story || !currentChapter || !user || !cooldownStatus?.canAct) return;

    const actionText =
      actionMode === 'preset'
        ? currentChapter.aiGeneratedChoices[selectedChoice!]?.text
        : customAction;

    if (!actionText?.trim()) return;

    setSubmitting(true);
    try {
      await globalStoryService.submitAction(
        story.id,
        currentChapter.id,
        actionMode === 'preset' ? 'preset_choice' : 'custom_write',
        actionText,
        actionMode === 'preset' ? selectedChoice! : undefined
      );

      // Reset form and reload
      setSelectedChoice(null);
      setCustomAction('');
      loadData();
    } catch (error) {
      console.error('Error submitting action:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (actionId: string, hasVoted: boolean) => {
    if (!user) return;

    try {
      if (hasVoted) {
        await globalStoryService.unvoteAction(actionId);
      } else {
        await globalStoryService.voteForAction(actionId);
      }
      loadData();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Voting ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-400">No Active Global Story</h2>
        <p className="text-gray-500 mt-2">Check back soon for the next community adventure!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-4">
          <Globe className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300">Community Story</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
        <p className="text-gray-400">{story.description}</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <span className="flex items-center gap-2 text-blue-400">
            <Users className="w-4 h-4" />
            {story.uniqueContributors} contributors
          </span>
          <span className="flex items-center gap-2 text-green-400">
            <Sparkles className="w-4 h-4" />
            {story.totalContributions} actions
          </span>
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
        <div className="prose prose-invert max-w-none">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="mb-8">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">{chapter.title}</h3>
              <p className="whitespace-pre-wrap text-gray-300">{chapter.content}</p>
              {chapter.winningActionText && (
                <div className="mt-4 pl-4 border-l-2 border-green-500 text-green-400 italic">
                  → {chapter.winningActionText}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Chapter Voting */}
      {currentChapter && !currentChapter.votesTallied && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              What Happens Next?
            </h2>
            {currentChapter.votingEndsAt && (
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getTimeRemaining(currentChapter.votingEndsAt)}
              </span>
            )}
          </div>

          {/* User's Action Input */}
          {user && cooldownStatus?.canAct ? (
            <div className="mb-6 bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">Your turn! Choose or write an action:</p>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActionMode('preset')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    actionMode === 'preset'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Choose from Options
                </button>
                <button
                  onClick={() => setActionMode('custom')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    actionMode === 'custom'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Write Custom Action
                </button>
              </div>

              {actionMode === 'preset' ? (
                <div className="space-y-2 mb-4">
                  {currentChapter.aiGeneratedChoices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedChoice(i)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedChoice === i
                          ? 'bg-purple-600 ring-2 ring-purple-400'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-gray-400 mr-2">{i + 1}.</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="What do you want to happen next? Be creative!"
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-4"
                  rows={3}
                  maxLength={500}
                />
              )}

              <button
                onClick={handleSubmitAction}
                disabled={
                  submitting ||
                  (actionMode === 'preset' ? selectedChoice === null : !customAction.trim())
                }
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Action
                  </>
                )}
              </button>
            </div>
          ) : user && !cooldownStatus?.canAct ? (
            <div className="mb-6 bg-gray-800/50 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">You've already taken your action today!</p>
              {cooldownStatus?.nextActionAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Next action available: {new Date(cooldownStatus.nextActionAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-6 bg-gray-800/50 rounded-lg p-4 text-center">
              <p className="text-gray-400">Sign in to contribute to the story!</p>
            </div>
          )}

          {/* Community Actions */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Community Actions (vote for your favorite!)
            </h3>
            <div className="space-y-2">
              {actions.slice(0, 10).map((action, i) => (
                <div
                  key={action.id}
                  className={`flex items-center justify-between bg-gray-700/50 rounded-lg p-3 ${
                    action.isSelected ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-400">
                        @{action.username || 'Anonymous'}
                      </span>
                      {action.actionType === 'custom_write' && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                          Custom
                        </span>
                      )}
                      {action.isSelected && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Winner
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300">{action.actionText}</p>
                  </div>
                  <button
                    onClick={() => handleVote(action.id, action.hasUserVoted || false)}
                    disabled={!user || action.userId === user.id}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                      action.hasUserVoted
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{action.voteCount}</span>
                  </button>
                </div>
              ))}

              {actions.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No actions yet. Be the first to contribute!
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Info */}
      <div className="bg-gray-800/30 rounded-xl p-4 text-center text-sm text-gray-400">
        <p>
          Everyone gets <strong className="text-purple-400">one action every 24 hours</strong>. The
          most voted action shapes the story!
        </p>
      </div>
    </div>
  );
}
