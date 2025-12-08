'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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

  useEffect(() => {
    if (storyId && user) {
      loadStoryData();
    }
  }, [storyId, user]);

  const loadStoryData = async () => {
    if (!storyId || !user) return;

    try {
      setLoading(true);
      const [storyData, chaptersData, progressData] = await Promise.all([
        storyService.getStoryById(storyId),
        storyService.getStoryChapters(storyId),
        userProgressService.getUserProgress(user.id, storyId),
      ]);

      setStory(storyData);
      setChapters(chaptersData || []);
      setProgress(progressData);
      setCurrentStory(storyData);

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
  };

  // Track engagement metrics
  useEffect(() => {
    if (!user || !currentStory?.id || !currentChapter?.id) return;

    const trackingInterval = setInterval(() => {
      const timeElapsed = Math.floor((Date.now() - engagementTracking.sessionStart) / 1000);
      const choiceFreq = engagementTracking.choiceCount / (timeElapsed / 60 || 1);

      narrativeAIService.trackEngagement({
        user_id: user.id,
        story_id: currentStory.id,
        chapter_id: currentChapter.id,
        time_on_scene: timeElapsed,
        choice_frequency: choiceFreq,
        choices_made_count: engagementTracking.choiceCount,
        scroll_depth: engagementTracking.scrollDepth,
      });

      setEngagementTracking(prev => ({
        ...prev,
        timeOnScene: timeElapsed
      }));
    }, 30000); // Track every 30 seconds

    return () => clearInterval(trackingInterval);
  }, [user, currentStory?.id, currentChapter?.id, engagementTracking.sessionStart, engagementTracking.choiceCount, engagementTracking.scrollDepth]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollDepth = (scrollTop + windowHeight) / documentHeight;
      
      setEngagementTracking(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollDepth)
      }));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset tracking on chapter change
  useEffect(() => {
    setEngagementTracking({
      sessionStart: Date.now(),
      choiceCount: 0,
      scrollDepth: 0,
      timeOnScene: 0
    });
  }, [currentChapter?.id]);

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

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Story Content */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-xl shadow-2xl">
          <ReadingControls
            storyTitle={story.title}
            currentChapter={currentChapterIndex + 1}
            totalChapters={chapters.length}
            onBack={() => router.push('/user-dashboard')}
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
        <BranchVisualization />
        <FloatingChatPanel />
      </div>
    </div>
  );
}