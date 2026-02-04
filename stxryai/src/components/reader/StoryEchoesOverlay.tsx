'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, TrendingUp, Sparkles, Eye, 
  Clock, Zap, Heart, MessageSquare 
} from 'lucide-react';
import { 
  storyEchoesService, 
  ChoiceEcho, 
  GhostReader, 
  LiveActivity, 
  StoryMomentum 
} from '@/services/storyEchoesService';

interface StoryEchoesOverlayProps {
  storyId: string;
  chapterId: string;
  choicePointId?: string;
  currentProgress: number;
  userId: string;
  isChoiceVisible?: boolean;
}

// Ghost reader silhouette component
function GhostReaderIcon({ ghost }: { ghost: GhostReader }) {
  const silhouettes: Record<string, React.ReactNode> = {
    blob: (
      <div 
        className="w-6 h-6 rounded-full opacity-50"
        style={{ backgroundColor: ghost.color }}
      />
    ),
    human: (
      <div className="opacity-50" style={{ color: ghost.color }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="7" r="4" />
          <path d="M12 14c-4 0-7 2-7 5v2h14v-2c0-3-3-5-7-5z" />
        </svg>
      </div>
    ),
    creature: (
      <div 
        className="w-6 h-6 rounded-lg opacity-50 flex items-center justify-center text-xs"
        style={{ backgroundColor: ghost.color }}
      >
        👻
      </div>
    ),
    spark: (
      <motion.div
        className="w-4 h-4 rounded-full opacity-60"
        style={{ backgroundColor: ghost.color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="relative"
      title={ghost.isAhead ? 'Reading ahead...' : 'Following behind...'}
    >
      {silhouettes[ghost.silhouetteType]}
      {ghost.speed === 'fast' && (
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// Choice percentage bar
function ChoicePercentageBar({ echo }: { echo: ChoiceEcho }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-xs"
    >
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            echo.isRare 
              ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
              : echo.isPopular 
              ? 'bg-gradient-to-r from-blue-400 to-cyan-400'
              : 'bg-purple-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${echo.percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className={`font-medium ${echo.isRare ? 'text-amber-400' : 'text-white/60'}`}>
        {echo.percentage}%
      </span>
      {echo.isRare && (
        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px]">
          RARE
        </span>
      )}
      {echo.trend === 'rising' && (
        <TrendingUp className="w-3 h-3 text-emerald-400" />
      )}
    </motion.div>
  );
}

export function StoryEchoesOverlay({
  storyId,
  chapterId,
  choicePointId,
  currentProgress,
  userId,
  isChoiceVisible = false,
}: StoryEchoesOverlayProps) {
  const [choiceEchoes, setChoiceEchoes] = useState<ChoiceEcho[]>([]);
  const [ghostReaders, setGhostReaders] = useState<GhostReader[]>([]);
  const [recentActivity, setRecentActivity] = useState<LiveActivity[]>([]);
  const [momentum, setMomentum] = useState<StoryMomentum | null>(null);
  const [oppositeChoiceAlert, setOppositeChoiceAlert] = useState<string | null>(null);
  const [showGhosts, setShowGhosts] = useState(true);

  // Load choice echoes when at a choice point
  useEffect(() => {
    async function loadEchoes() {
      if (!isChoiceVisible || !choicePointId) return;
      
      const echoes = await storyEchoesService.getChoiceEchoes(storyId, chapterId, choicePointId);
      setChoiceEchoes(echoes);
    }

    loadEchoes();
  }, [storyId, chapterId, choicePointId, isChoiceVisible]);

  // Load ghost readers periodically
  useEffect(() => {
    async function loadGhosts() {
      const ghosts = await storyEchoesService.getGhostReaders(storyId, chapterId, currentProgress);
      setGhostReaders(ghosts);
    }

    loadGhosts();
    const interval = setInterval(loadGhosts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [storyId, chapterId, currentProgress]);

  // Update reading session
  useEffect(() => {
    storyEchoesService.updateReadingSession(userId, storyId, chapterId, currentProgress);
  }, [userId, storyId, chapterId, currentProgress]);

  // Load story momentum
  useEffect(() => {
    async function loadMomentum() {
      const data = await storyEchoesService.getStoryMomentum(storyId);
      setMomentum(data);
    }

    loadMomentum();
    const interval = setInterval(loadMomentum, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [storyId]);

  // Subscribe to live activity
  useEffect(() => {
    const handleActivity = (activity: LiveActivity) => {
      setRecentActivity(prev => [activity, ...prev].slice(0, 5));
    };

    const unsubscribe = storyEchoesService.subscribeToStoryActivity(storyId, handleActivity);
    return unsubscribe;
  }, [storyId]);

  // Handle choice made - check for opposite choices
  const handleChoiceMade = useCallback(async (choiceId: string) => {
    if (!choicePointId) return;

    const oppositeCheck = await storyEchoesService.checkOppositeChoice(
      userId,
      storyId,
      chapterId,
      choicePointId,
      choiceId
    );

    if (oppositeCheck?.happened) {
      setOppositeChoiceAlert(oppositeCheck.message);
      setTimeout(() => setOppositeChoiceAlert(null), 5000);
    }
  }, [userId, storyId, chapterId, choicePointId]);

  // Expose to window for story reader integration
  useEffect(() => {
    (window as any).handleStoryChoice = handleChoiceMade;
    return () => {
      delete (window as any).handleStoryChoice;
    };
  }, [handleChoiceMade]);

  return (
    <>
      {/* Ghost readers floating in margin */}
      <AnimatePresence>
        {showGhosts && ghostReaders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30"
          >
            <button
              onClick={() => setShowGhosts(!showGhosts)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              title={`${ghostReaders.length} others reading`}
            >
              <Users className="w-4 h-4 text-purple-400" />
            </button>
            
            <div className="flex flex-col gap-2">
              {ghostReaders.map((ghost) => (
                <GhostReaderIcon key={ghost.id} ghost={ghost} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choice echoes overlay */}
      <AnimatePresence>
        {isChoiceVisible && choiceEchoes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <p className="text-xs text-void-400 mb-3 flex items-center gap-2">
                <Eye className="w-3 h-3" />
                What others chose:
              </p>
              <div className="space-y-3">
                {choiceEchoes.map((echo) => (
                  <div key={echo.choiceId}>
                    <p className="text-sm text-white/80 mb-1 truncate">{echo.choiceText}</p>
                    <ChoicePercentageBar echo={echo} />
                  </div>
                ))}
              </div>
              {choiceEchoes.some(e => e.recentReaders > 0) && (
                <p className="text-xs text-void-500 mt-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {choiceEchoes.reduce((sum, e) => sum + e.recentReaders, 0)} people chose in the last 24h
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opposite choice alert */}
      <AnimatePresence>
        {oppositeChoiceAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg">
              <p className="text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {oppositeChoiceAlert}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story momentum indicator (top right) */}
      {momentum && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 right-4 z-30"
        >
          <div className="bg-black/60 backdrop-blur-xl rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                momentum.popularityTrend === 'hot' ? 'bg-red-500 animate-pulse' :
                momentum.popularityTrend === 'rising' ? 'bg-emerald-500' :
                momentum.popularityTrend === 'cooling' ? 'bg-blue-500' :
                'bg-gray-500'
              }`} />
              <span className="text-xs text-white/70">
                {momentum.currentReaders} reading now
              </span>
            </div>
            
            {/* Emotional pulse mini visualization */}
            <div className="flex gap-1">
              {Object.entries(momentum.emotionalPulse).map(([emotion, value]) => (
                <div
                  key={emotion}
                  className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden"
                  title={`${emotion}: ${value}`}
                >
                  <div
                    className={`h-full ${
                      emotion === 'joy' ? 'bg-yellow-400' :
                      emotion === 'sadness' ? 'bg-blue-400' :
                      emotion === 'excitement' ? 'bg-pink-400' :
                      'bg-purple-400'
                    }`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Live activity feed (minimal) */}
      <AnimatePresence>
        {recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 left-4 z-30"
          >
            <div className="max-w-xs">
              <AnimatePresence mode="popLayout">
                {recentActivity.slice(0, 3).map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="mb-2"
                  >
                    <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white/60 flex items-center gap-2">
                      {activity.type === 'choice' && <MessageSquare className="w-3 h-3 text-purple-400" />}
                      {activity.type === 'finishing' && <Heart className="w-3 h-3 text-pink-400" />}
                      {activity.type === 'emotional_moment' && <Sparkles className="w-3 h-3 text-amber-400" />}
                      <span className="truncate">
                        {activity.type === 'choice' 
                          ? `Someone chose: "${activity.choiceText?.substring(0, 20)}..."`
                          : activity.type === 'finishing'
                          ? 'Someone just finished!'
                          : 'Emotional moment detected'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default StoryEchoesOverlay;
