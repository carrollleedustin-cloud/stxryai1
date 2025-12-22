'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { storyService } from '@/services/storyService';
import { userProgressService } from '@/services/userProgressService';
import { narrativeAIService, type EngagementMetrics } from '@/services/narrativeAIService';
import StoryContent from './StoryContent';
import ChoiceSelector from './ChoiceSelector';
import ReadingControls from './ReadingControls';
import BranchVisualization from './BranchVisualization';
import FloatingChatPanel from './FloatingChatPanel';
import NPCInteractionPanel from './NPCInteractionPanel';
import DynamicPacingIndicator from './DynamicPacingIndicator';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoryReaderInteractive() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();
  const storyId = searchParams?.get('storyId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [story, setStory] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [choices, setChoices] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [currentStory, setCurrentStory] = useState<any>(null);
  const [engagementTracking, setEngagementTracking] = useState({
    sessionStart: Date.now(),
    choiceCount: 0,
    scrollDepth: 0,
    timeOnScene: 0,
  });
  const [fontSize, setFontSize] = useState(18); // Increased default font size
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [chapterStartTime, setChapterStartTime] = useState<number | null>(null);
  const [aiGeneratedSegments, setAiGeneratedSegments] = useState<string[]>([]);
  
  // Sidecar visibility state
  const [isSidecarOpen, setIsSidecarOpen] = useState(false);

  const handleScrollDepthChange = useCallback(
    (depth: number) => {
      setEngagementTracking((prev) => ({
        ...prev,
        scrollDepth: depth,
      }));
    },
    [setEngagementTracking]
  );

  const sendEngagementMetrics = useCallback(
    async (
      latestTracking: typeof engagementTracking,
      chapterId: string | undefined,
      currentChapterContent: string
    ) => {
      if (!user || !story?.id || !chapterId) return;

      const metricsToSend = {
        user_id: user.id,
        story_id: story.id,
        chapter_id: chapterId,
        time_on_scene: latestTracking.timeOnScene,
        choice_frequency: latestTracking.choiceCount, // Simple proxy for now
        choices_made_count: latestTracking.choiceCount,
        scroll_depth: latestTracking.scrollDepth,
      };

      const context = {
        storyId: story.id,
        userId: user.id,
        chapterId: chapterId,
        currentChapterContent: currentChapterContent,
      };

      const feedback = await narrativeAIService.sendEngagementMetricsAndGetFeedback(
        metricsToSend,
        context
      );
      if (feedback?.feedback) {
        setAiGeneratedSegments(feedback.feedback);
      }
    },
    [user, story, narrativeAIService, setAiGeneratedSegments]
  );

  // Calculate current chapter (moved up to avoid reference before declaration)
  const currentChapter = chapters[currentChapterIndex];

  const loadStoryData = useCallback(async () => {
    if (!storyId || !user) return;

    try {
      setLoading(true);
      const [storyData, chaptersData, progressData, bookmarked] = await Promise.all([
        storyService.getStoryById(storyId),
        storyService.getStoryChapters(storyId),
        userProgressService.getUserProgress(user.id, storyId),
        userProgressService.isChapterBookmarked(
          user.id,
          chapters.length > 0 ? chapters[currentChapterIndex].id : ''
        ),
      ]);

      setStory(storyData);
      setChapters(chaptersData || []);
      setProgress(progressData);
      setCurrentStory(storyData);
      setIsBookmarked(bookmarked);

      // Load choices for first/current chapter
      if (chaptersData && chaptersData.length > 0) {
        const currentChapter = progressData?.current_chapter_id
          ? chaptersData.find((c: any) => c.id === progressData.current_chapter_id)
          : chaptersData[0];

        const chapterIndex = chaptersData.findIndex((c: any) => c.id === currentChapter?.id);
        setCurrentChapterIndex(chapterIndex >= 0 ? chapterIndex : 0);

        if (currentChapter) {
          const choicesData = await storyService.getChapterChoices(currentChapter.id);
          setChoices(choicesData || []);
        }
        setChapterStartTime(Date.now()); // Set start time after chapter is loaded
      }

      setError('');
    } catch (err: any) {
      // Check for connection errors (handled by service layer now)
      if (
        err?.message?.includes('Cannot connect to database') ||
        err?.message?.includes('Supabase project') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('timed out')
      ) {
        setError(
          err.message || 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.'
        );
      } else {
        setError('Failed to load story. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [storyId, user, chapters, currentChapterIndex]);

  useEffect(() => {
    if (storyId && user) {
      loadStoryData();
    }
  }, [storyId, user, loadStoryData]);

  useEffect(() => {
    // This effect runs once when the component mounts.
    // The cleanup function runs when dependencies change or component unmounts.
    return () => {
      // Only record time if a chapter start time was previously set and the component is not in a loading state.
      // currentChapter is a dependency to ensure its value is fresh for the cleanup.
      if (chapterStartTime && currentChapter && !loading) {
        const timeSpent = Date.now() - chapterStartTime; // Time in milliseconds
        const finalEngagementTracking = {
          ...engagementTracking,
          timeOnScene: engagementTracking.timeOnScene + Math.round(timeSpent / 1000),
        };
        sendEngagementMetrics(finalEngagementTracking, currentChapter.id, currentChapter.content);
      }
    };
  }, [
    currentChapterIndex,
    chapterStartTime,
    loading,
    currentChapter,
    engagementTracking,
    sendEngagementMetrics,
  ]);

  // ... (rest of the component is the same)
  const handleBookmark = async () => {
    if (!user || !currentChapter) return;
    try {
      if (isBookmarked) {
        await userProgressService.removeBookmark(user.id, story.id, currentChapter.id);
      } else {
        await userProgressService.addBookmark(user.id, story.id, currentChapter.id);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to update bookmark', error);
    }
  };

  const toggleDistractionFree = () => {
    setIsDistractionFree(!isDistractionFree);
    setIsSidecarOpen(false); // Close sidecar when focusing
  };

  const handleChoiceSelect = async (choice: any) => {
    if (!user || !profile) return;

    // Check daily limit
    if (profile.daily_choices_used >= profile.daily_choice_limit) {
      alert('You have reached your daily choice limit. Upgrade to premium for unlimited choices!');
      return;
    }

    if (user && currentStory?.id && currentChapter) {
      // Increment choice count
      setEngagementTracking((prev) => ({
        ...prev,
        choiceCount: prev.choiceCount + 1,
      }));

      // Calculate time spent on current chapter
      if (chapterStartTime) {
        const timeSpent = Date.now() - chapterStartTime; // Time in milliseconds
        setEngagementTracking((prev) => ({
          ...prev,
          timeOnScene: prev.timeOnScene + Math.round(timeSpent / 1000), // Convert to seconds
        }));
      }

      // Send engagement metrics for the *previous* chapter before changing it
      sendEngagementMetrics(engagementTracking, currentChapter.id, currentChapter.content);

      // Record NPC memory if choice involves NPC interaction
      const npcs = await narrativeAIService.getStoryNPCs(currentStory.id || '');
      const relevantNPC = (npcs || []).find((npc: any) =>
        choice.choice_text?.toLowerCase().includes(npc.npc_name?.toLowerCase())
      );

      if (relevantNPC) {
        await narrativeAIService.recordNPCMemory({
          npc_id: relevantNPC.id!,
          user_id: user.id,
          story_id: currentStory.id,
          memory_type: 'choice',
          memory_content: `User chose: ${choice.choice_text}`,
          chapter_number: currentChapter?.chapter_number,
          importance_score: 0.7,
          relationship_delta: choice.choice_text?.toLowerCase().includes('help') ? 5 : 0,
          revealed_traits: [
            choice.choice_text?.toLowerCase().includes('brave') ? 'brave' : 'cautious',
          ],
        });
      }
    }

    try {
      // Find next chapter
      const nextChapterIndex = currentChapterIndex + 1;
      if (nextChapterIndex >= chapters.length) {
        // Story completed
        await userProgressService.markStoryCompleted(user.id, story.id);
        alert('Congratulations! You have completed this story!');
        router.push('/user-dashboard');
        return;
      }

      const nextChapter = chapters[nextChapterIndex];

      // Update progress
      await userProgressService.updateProgress(
        user.id,
        story.id,
        nextChapter.id,
        choice.id,
        Math.round(((nextChapterIndex + 1) / chapters.length) * 100)
      );

      // Load next chapter choices
      const nextChoices = await storyService.getChapterChoices(nextChapter.id);
      setChoices(nextChoices || []);
      setCurrentChapterIndex(nextChapterIndex);
      setChapterStartTime(Date.now()); // Reset for the new chapter
    } catch (err: any) {
      setError('Failed to save progress. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-8 w-8 animate-ping rounded-full bg-violet-500/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!story || chapters.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <p className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Reality Fracture
          </p>
          <p className="text-muted-foreground">
            The narrative thread you seek cannot be found.
          </p>
          <button
            onClick={() => router.push('/story-library')}
            className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-32">
       {/* Background Grid */}
       <div className="fixed inset-0 pointer-events-none z-[-1] holographic-grid opacity-30" />
       
       {/* Controls */}
       <ReadingControls
          currentTheme={appTheme}
          currentFontSize={fontSize}
          onThemeChange={setAppTheme}
          onFontSizeChange={setFontSize}
          onBookmark={handleBookmark}
          isBookmarked={isBookmarked}
          progress={((currentChapterIndex + 1) / chapters.length) * 100}
          onToggleDistractionFree={toggleDistractionFree}
          isDistractionFree={isDistractionFree}
        />

        <main className={`relative transition-all duration-700 ease-out mx-auto px-4 ${isDistractionFree ? 'max-w-3xl' : 'max-w-6xl grid lg:grid-cols-[1fr_350px] gap-8'}`}>
          
          {/* Main Content Lane */}
          <div className="space-y-12">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentChapter?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <StoryContent
                  chapter={currentChapter}
                  chapterNumber={currentChapterIndex + 1}
                  fontSize={fontSize}
                  onScrollDepthChange={handleScrollDepthChange}
                  aiSegments={aiGeneratedSegments}
                />
              </motion.div>
            </AnimatePresence>

            {choices.length > 0 && (
               <ChoiceSelector choices={choices} onChoiceSelect={handleChoiceSelect} />
            )}
          </div>

          {/* Sidecar (Collapsible/Floating in mobile, sticky in desktop) */}
          <AnimatePresence>
            {!isDistractionFree && (
              <motion.aside
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="hidden lg:block space-y-6 sticky top-28 h-fit"
              >
                {currentStory?.id && currentChapter && (
                  <>
                    <DynamicPacingIndicator storyId={currentStory.id} chapterId={currentChapter.id} />
                    <NPCInteractionPanel storyId={currentStory.id} currentChapter={currentChapter.chapter_number} />
                  </>
                )}

                <BranchVisualization storyNodes={[]} currentNodeId="" isPremium={profile?.subscription_tier === 'premium'} />
                <FloatingChatPanel
                  storyId={currentStory?.id || ''}
                  currentScene={currentChapter?.id}
                  isPremium={profile?.subscription_tier === 'premium'}
                />
              </motion.aside>
            )}
          </AnimatePresence>

        </main>
        
        {/* Mobile Toggle for Sidecar (if needed) - can add later */}
    </div>
  );
}
