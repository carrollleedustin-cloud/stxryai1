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
    timeOnScene: 0
  });
  const [fontSize, setFontSize] = useState(16);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);

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
        userProgressService.isChapterBookmarked(user.id, chapters.length > 0 ? chapters[currentChapterIndex].id : '')
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
      }

      setError('');
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch')) {
        setError('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
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
  };

  const handleChoiceSelect = async (choice: any) => {
    if (!user || !profile) return;

    // Check daily limit
    if (profile.daily_choices_used >= profile.daily_choice_limit) {
      alert('You have reached your daily choice limit. Upgrade to premium for unlimited choices!');
      return;
    }

    if (user && currentStory?.id) {
      // Increment choice count
      setEngagementTracking(prev => ({
        ...prev,
        choiceCount: prev.choiceCount + 1
      }));

      // Record NPC memory if choice involves NPC interaction
      const npcs = await narrativeAIService.getStoryNPCs(currentStory.id);
      const relevantNPC = npcs.find(npc => 
        choice.choice_text?.toLowerCase().includes(npc.npc_name.toLowerCase())
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
          revealed_traits: [choice.choice_text?.toLowerCase().includes('brave') ? 'brave' : 'cautious']
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
    } catch (err: any) {
      setError('Failed to save progress. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!story || chapters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-center text-white">
          <p className="text-xl">Story not found or no chapters available.</p>
          <button
            onClick={() => router.push('/story-library')}
            className="mt-4 px-6 py-2 bg-white text-purple-900 rounded-lg hover:bg-gray-100"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isDistractionFree ? 'distraction-free' : ''}`}>
      {/* Main Story Content */}
      <div className={`lg:col-span-2 space-y-6 ${isDistractionFree ? 'lg:col-span-3' : ''}`}>
        <div className={`bg-gradient-to-br ${appTheme === 'dark' ? 'from-purple-900 via-indigo-900 to-blue-900' : 'from-white to-gray-50'} rounded-xl shadow-2xl`}>
          <ReadingControls
            currentTheme={appTheme}
            currentFontSize={fontSize}
            onThemeChange={setAppTheme}
            onFontSizeChange={setFontSize}
            onBookmark={handleBookmark}
            isBookmarked={isBookmarked}
            progress={(currentChapterIndex + 1) / chapters.length * 100}
            onToggleDistractionFree={toggleDistractionFree}
            isDistractionFree={isDistractionFree}
          />

          {error && (
            <div className="px-4 py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div className="px-4 py-8">
            <StoryContent
              chapter={currentChapter}
              chapterNumber={currentChapterIndex + 1}
              fontSize={fontSize}
            />

            {choices.length > 0 && (
              <div className="mt-8">
                <ChoiceSelector
                  choices={choices}
                  onChoiceSelect={handleChoiceSelect}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar with AI Features */}
      {!isDistractionFree && (
        <div className="space-y-6">
          {currentStory?.id && currentChapter && (
            <>
              <NPCInteractionPanel 
                storyId={currentStory.id} 
                currentChapter={currentChapter.chapter_number}
              />
              <DynamicPacingIndicator 
                storyId={currentStory.id}
                chapterId={currentChapter.id}
              />
            </>
          )}
          <BranchVisualization
            storyNodes={[]}
            currentNodeId=""
            isPremium={profile?.subscription_tier === 'premium'}
          />
          <FloatingChatPanel
            storyId={currentStory?.id || ''}
            currentScene={currentChapter?.id || ''}
            isPremium={profile?.subscription_tier === 'premium'}
          />
        </div>
      )}
    </div>
  );
}