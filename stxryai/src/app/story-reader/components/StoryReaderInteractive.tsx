'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterRelationshipWidget, CharacterRelationship } from './CharacterRelationshipWidget';
import { PuzzleOverlay } from './PuzzleOverlay';
import { aiStoryAssistantService, AIPuzzle } from '@/services/aiStoryAssistantService';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { storyService } from '@/services/storyService';
import { userProgressService } from '@/services/userProgressService';
import { narrativeAIService } from '@/services/narrativeAIService';
import { aiCompanionService } from '@/services/aiCompanionService';
import usePetRewards from '@/hooks/usePetRewards';
import { PetGreeting } from '@/components/pet';
import type { StoryMode, CustomChoiceTier } from '@/services/storyCreationService';
// Revolutionary new components
import QuantumTextRenderer from '@/components/story-reader/QuantumTextRenderer';
import NeuralNetworkBackground from '@/components/story-reader/NeuralNetworkBackground';
import ImmersiveSoundscape from '@/components/story-reader/ImmersiveSoundscape';
import GestureControls from '@/components/story-reader/GestureControls';
import DynamicPacingIndicator from '@/components/story-reader/DynamicPacingIndicator';
import AICompanionPanel from '@/components/story-reader/AICompanionPanel';
import {
  ChevronLeft,
  Bookmark,
  Settings,
  Maximize2,
  Minimize2,
  Type,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  Share2,
  Send,
  Loader2,
  Bot,
  PawPrint,
  Wind,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react';
import { AuroraBackdrop, NoiseOverlay, GlassCard } from '@/components/void/AdvancedEffects';

/**
 * STORY READER INTERACTIVE
 * The heart of Stxryai - where stories come alive.
 * An immersive, distraction-free reading experience.
 */
export default function StoryReaderInteractive() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const { pet, hasPet, getDialogue, setShowPetPanel } = usePet();
  const { onChoiceMade, onChapterComplete, onStoryRead } = usePetRewards();
  const storyId = searchParams?.get('storyId') || searchParams?.get('id');

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [story, setStory] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [choices, setChoices] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [aiSegments, setAiSegments] = useState<string[]>([]);

  // AI Story Mode State
  const [storyMode, setStoryMode] = useState<StoryMode>('ai_choices');
  const [canUseCustomChoice, setCanUseCustomChoice] = useState(false);
  const [customChoiceInput, setCustomChoiceInput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [companionMessage, setCompanionMessage] = useState<string | null>(null);
  const [showCompanion, setShowCompanion] = useState(false);

  // Reader settings
  const [fontSize, setFontSize] = useState(20);
  const [focusMode, setFocusMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'void' | 'sepia' | 'light'>('void');
  const [activeParagraph, setActiveParagraph] = useState(0);
  const [zenMode, setZenMode] = useState(false);
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);

  // Character Relationships State
  const [characterRelationships, setCharacterRelationships] = useState<CharacterRelationship[]>([]);
  const [showRelationships, setShowRelationships] = useState(false);

  // Puzzle State
  const [currentPuzzle, setCurrentPuzzle] = useState<AIPuzzle | null>(null);
  const [showPuzzle, setShowPuzzle] = useState(false);

  // Revolutionary Features State
  const [enableQuantumText, setEnableQuantumText] = useState(true);
  const [showNeuralNetwork, setShowNeuralNetwork] = useState(true);
  const [soundscapeEnabled, setSoundscapeEnabled] = useState(false);
  const [gestureControlsEnabled, setGestureControlsEnabled] = useState(true);
  const [showPacingIndicator, setShowPacingIndicator] = useState(true);
  const [showAICompanion, setShowAICompanion] = useState(false);
  const [currentEmotionalState, setCurrentEmotionalState] = useState('neutral');
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [hoveredWord, setHoveredWord] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Current chapter
  const currentChapter = chapters[currentChapterIndex];
  const paragraphs = currentChapter?.content?.split('\n\n').filter((p: string) => p.trim()) || [];
  const progress = chapters.length > 0 ? ((currentChapterIndex + 1) / chapters.length) * 100 : 0;

  // Track scroll progress manually (avoids hydration issues)
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(Math.min(1, Math.max(0, progress || 0)));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [chapters]);

  // Load story data
  const loadStoryData = useCallback(async () => {
    if (!storyId || !user) return;

    try {
      setLoading(true);

      const [storyData, chaptersData, progressData, bookmarked] = await Promise.all([
        storyService.getStoryById(storyId),
        storyService.getStoryChapters(storyId),
        userProgressService.getUserProgress(user.id, storyId),
        userProgressService.isChapterBookmarked(user.id, ''),
      ]);

      // Mock relationships for now - in production this would come from persistentNarrativeEngine
      if (storyData) {
        setCharacterRelationships([
          {
            id: 'char-1',
            name: 'Lyra',
            dynamic: 'Mysterious Guide',
            affinity: 65,
            status: 'Friend',
            lastEncounter: 'Chapter 1',
          },
        ]);
      }

      setStory(storyData);
      setChapters(chaptersData || []);
      setIsBookmarked(bookmarked);

      // Set story mode from story data
      const mode = storyData?.story_mode || 'ai_choices';
      setStoryMode(mode as StoryMode);

      // Check custom choice access for infinite mode
      if (mode === 'ai_infinite' && user) {
        const canCustom = await aiCompanionService.canUseCustomChoices(storyId, user.id);
        setCanUseCustomChoice(canCustom);

        // Initialize companion session
        const session = await aiCompanionService.getOrCreateSession(storyId, user.id);
        if (session) {
          setSessionId(session.id);
          if (session.companionEnabled && session.totalChoicesMade === 0) {
            setCompanionMessage('Welcome, traveler. I shall be your guide through this tale...');
            setShowCompanion(true);
          }
        }
      }

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
      setError('Failed to load story. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [storyId, user]);

  useEffect(() => {
    if (storyId && user) {
      loadStoryData();
    }
  }, [storyId, user, loadStoryData]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isFullscreen) setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(controlsTimeoutRef.current);
    };
  }, [isFullscreen]);

  // Track active paragraph in focus mode
  useEffect(() => {
    const container = contentRef.current;
    if (!container || !focusMode) return;

    const handleScroll = () => {
      const paragraphElements = container.querySelectorAll('[data-paragraph]');
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      paragraphElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(centerY - elementCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveParagraph(closestIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [focusMode]);

  // Handlers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

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

  const handleChoiceSelect = async (choice: any) => {
    if (!user || !profile) return;

    // 10% chance to trigger a puzzle before proceeding
    if (Math.random() < 0.1 && !showPuzzle) {
      try {
        const puzzle = await aiStoryAssistantService.generatePuzzle(currentChapter.content);
        setCurrentPuzzle(puzzle);
        setShowPuzzle(true);
        // We'll proceed with the choice AFTER the puzzle is closed/solved
        return;
      } catch (err) {
        console.error('Failed to generate puzzle:', err);
      }
    }

    if (profile.daily_choices_used >= profile.daily_choice_limit) {
      alert('You have reached your daily choice limit. Upgrade to premium for unlimited choices!');
      return;
    }

    try {
      // Record choice in companion memory for AI infinite mode
      if (sessionId && storyMode === 'ai_infinite') {
        await aiCompanionService.recordChoice(sessionId, currentChapter.id, {
          type: 'preset',
          text: choice.choice_text,
          index: choices.indexOf(choice),
        });
      }

      // Award pet XP for making a choice
      if (storyId) {
        await onChoiceMade(storyId);
      }

      const nextChapterIndex = currentChapterIndex + 1;

      if (nextChapterIndex >= chapters.length) {
        // Story completed - award extra XP!
        if (storyId) {
          await onStoryRead(storyId, story?.genre);
        }
        await userProgressService.markStoryCompleted(user.id, story.id);
        router.push('/user-dashboard?completed=true');
        return;
      }

      const nextChapter = chapters[nextChapterIndex];

      // Award XP for chapter completion
      if (storyId) {
        await onChapterComplete(storyId);
      }

      await userProgressService.updateProgress(
        user.id,
        story.id,
        nextChapter.id,
        choice.id,
        Math.round(((nextChapterIndex + 1) / chapters.length) * 100)
      );

      const nextChoices = await storyService.getChapterChoices(nextChapter.id);
      setChoices(nextChoices || []);
      setCurrentChapterIndex(nextChapterIndex);

      // Scroll to top
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to save progress. Please try again.');
    }
  };

  // Handle custom choice submission (AI Infinite Mode - Premium Feature)
  const handleCustomChoice = async () => {
    if (!customChoiceInput.trim() || !user || !sessionId || isGeneratingAI) return;

    setIsGeneratingAI(true);
    setShowCompanion(false);

    try {
      // Record the custom choice
      await aiCompanionService.recordChoice(sessionId, currentChapter.id, {
        type: 'custom',
        text: customChoiceInput,
        customInput: customChoiceInput,
      });

      // Get choice history for context
      const history = await aiCompanionService.getChoiceHistory(sessionId, 5);
      const previousChoices = history.map((h) => h.choiceText);

      // Generate AI continuation
      const result = await aiCompanionService.generateStoryFromCustomChoice(
        story.id,
        sessionId,
        customChoiceInput,
        {
          currentChapterContent: currentChapter.content,
          storyTitle: story.title,
          genre: story.genre,
          previousChoices,
        }
      );

      if (result) {
        // Add AI-generated content as new segments
        setAiSegments([result.content]);

        // Update choices with AI-generated options
        const newChoices = result.choices.map((text, idx) => ({
          id: `ai-${Date.now()}-${idx}`,
          choice_text: text,
          is_ai_generated: true,
        }));
        setChoices(newChoices);

        // Show companion reaction
        setCompanionMessage("An interesting path you've chosen...");
        setShowCompanion(true);
      }

      setCustomChoiceInput('');
    } catch (err) {
      setError('Failed to generate story continuation. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Theme styles
  const themeStyles = {
    void: { bg: 'bg-void-absolute', text: 'text-text-secondary', accent: 'text-spectral-cyan' },
    sepia: { bg: 'bg-[#1a1814]', text: 'text-[#d4c5a9]', accent: 'text-[#c9a227]' },
    light: { bg: 'bg-[#f5f1e8]', text: 'text-[#2d2a24]', accent: 'text-[#6b4423]' },
  };
  const currentTheme = themeStyles[theme];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-void-absolute flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-membrane animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-spectral-cyan animate-spin" />
          </div>
          <p className="text-sm font-ui tracking-widest uppercase text-text-ghost">
            Entering Story
          </p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (!story || chapters.length === 0) {
    return (
      <div className="min-h-screen bg-void-absolute flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-void-mist flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-text-ghost" />
          </div>
          <h1 className="font-display text-2xl tracking-wide text-text-primary mb-4">
            Story Not Found
          </h1>
          <p className="font-prose text-text-tertiary mb-8">
            This story may have been removed or the link may be expired.
          </p>
          <button onClick={() => router.push('/story-library')} className="btn-spectral">
            Browse Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${currentTheme.bg} transition-colors duration-500 overflow-hidden relative`}
    >
      {/* Background Effects */}
      <AnimatePresence>
        {zenMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <AuroraBackdrop className="opacity-40" />
            <NoiseOverlay opacity={0.03} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revolutionary Features */}
      {showNeuralNetwork && (
        <NeuralNetworkBackground
          intensity={zenMode ? 0.8 : 0.4}
          colorScheme={theme === 'void' ? 'cyan' : theme === 'sepia' ? 'mixed' : 'violet'}
          readingProgress={progress}
          emotionalState={currentEmotionalState}
          particleCount={80}
        />
      )}

      <ImmersiveSoundscape
        isEnabled={soundscapeEnabled}
        volume={0.3}
        emotionalState={currentEmotionalState}
        readingSpeed={readingSpeed}
        chapterProgress={progress}
        theme={theme}
      />

      {gestureControlsEnabled && (
        <GestureControls
          onSwipeLeft={() => {
            const nextIndex = Math.min(currentChapterIndex + 1, chapters.length - 1);
            setCurrentChapterIndex(nextIndex);
            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSwipeRight={() => {
            const prevIndex = Math.max(currentChapterIndex - 1, 0);
            setCurrentChapterIndex(prevIndex);
            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSwipeUp={() => setZenMode(!zenMode)}
          onSwipeDown={() => setShowSettings(!showSettings)}
          onTap={(position) => {
            // Handle tap gestures
            console.log('Tap at:', position);
          }}
          onDoubleTap={() => setShowAICompanion(!showAICompanion)}
          onLongPress={(position) => {
            setHoveredWord({ word: 'Long press detected', position });
            setTimeout(() => setHoveredWord(null), 2000);
          }}
          sensitivity={1}
          enableHapticFeedback={true}
          showGestureHints={true}
        />
      )}

      {showPacingIndicator && (
        <DynamicPacingIndicator
          readingSpeed={readingSpeed}
          emotionalIntensity={
            currentEmotionalState === 'joy' || currentEmotionalState === 'anger'
              ? 0.8
              : currentEmotionalState === 'fear'
                ? 0.6
                : currentEmotionalState === 'sadness'
                  ? 0.3
                  : 0.5
          }
          chapterComplexity={0.5} // Could be calculated from chapter content
          userStamina={
            profile?.daily_choice_limit
              ? profile.daily_choices_used / profile.daily_choice_limit
              : 1
          }
          showSuggestions={true}
          theme={theme}
          position="floating"
        />
      )}

      <AICompanionPanel
        isVisible={showAICompanion}
        companionName="Aria"
        personality="wise"
        currentEmotion={currentEmotionalState}
        readingProgress={progress}
        onSendMessage={(message) => {
          console.log('User message:', message);
          // Could integrate with AI service here
        }}
        onCompanionResponse={(response) => {
          console.log('Companion response:', response);
        }}
        theme={theme}
      />

      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[2px] z-50 transition-all duration-100"
        style={{
          width: `${scrollProgress * 100}%`,
          background: 'linear-gradient(90deg, var(--spectral-cyan), var(--spectral-violet))',
          boxShadow: '0 0 20px rgba(0, 245, 212, 0.5)',
        }}
      />

      {/* Top Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-40"
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                background:
                  theme === 'light'
                    ? 'linear-gradient(180deg, rgba(245,241,232,0.95) 0%, rgba(245,241,232,0.8) 60%, transparent 100%)'
                    : 'linear-gradient(180deg, rgba(2,2,3,0.95) 0%, rgba(2,2,3,0.8) 60%, transparent 100%)',
              }}
            >
              <button
                onClick={() => router.push('/story-library')}
                className={`flex items-center gap-2 ${theme === 'light' ? 'text-[#6b4423]/60 hover:text-[#6b4423]' : 'text-text-tertiary hover:text-text-primary'} transition-colors`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-ui tracking-wide">Exit</span>
              </button>

              <div className="absolute left-1/2 -translate-x-1/2 text-center">
                <p
                  className={`text-xs font-ui tracking-widest uppercase ${theme === 'light' ? 'text-[#6b4423]/40' : 'text-text-ghost'}`}
                >
                  Chapter {currentChapterIndex + 1}
                </p>
                <h1 className={`font-literary text-lg italic ${currentTheme.text}`}>
                  {currentChapter?.title || story?.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {/* Pet Companion Toggle */}
                {hasPet && (
                  <button
                    onClick={() => setShowPetPanel(true)}
                    className={`p-2 rounded-lg transition-colors relative ${
                      theme === 'light'
                        ? 'text-spectral-rose hover:bg-spectral-rose/10'
                        : 'text-spectral-rose hover:bg-spectral-rose/10'
                    }`}
                    title={`${pet?.name} is here!`}
                  >
                    <PawPrint className="w-5 h-5" />
                    {/* Pulse indicator */}
                    <span className="absolute top-1 right-1 w-2 h-2 bg-spectral-rose rounded-full animate-pulse" />
                  </button>
                )}
                <button
                  onClick={() => setShowRelationships(!showRelationships)}
                  className={`p-2 rounded-lg transition-colors ${
                    showRelationships
                      ? 'text-spectral-violet bg-spectral-violet/10'
                      : theme === 'light'
                        ? 'text-[#6b4423]/60 hover:text-[#6b4423] hover:bg-[#6b4423]/5'
                        : 'text-text-tertiary hover:text-text-primary hover:bg-void-mist'
                  }`}
                  title="Relationships"
                >
                  <Users className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setZenMode(!zenMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    zenMode
                      ? 'text-spectral-cyan bg-spectral-cyan/10'
                      : theme === 'light'
                        ? 'text-[#6b4423]/60 hover:text-[#6b4423] hover:bg-[#6b4423]/5'
                        : 'text-text-tertiary hover:text-text-primary hover:bg-void-mist'
                  }`}
                  title="Zen Mode"
                >
                  {zenMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked
                      ? 'text-spectral-cyan bg-spectral-cyan/10'
                      : theme === 'light'
                        ? 'text-[#6b4423]/60 hover:text-[#6b4423] hover:bg-[#6b4423]/5'
                        : 'text-text-tertiary hover:text-text-primary hover:bg-void-mist'
                  }`}
                >
                  <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'text-[#6b4423]/60 hover:text-[#6b4423] hover:bg-[#6b4423]/5' : 'text-text-tertiary hover:text-text-primary hover:bg-void-mist'}`}
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'text-[#6b4423]/60 hover:text-[#6b4423] hover:bg-[#6b4423]/5' : 'text-text-tertiary hover:text-text-primary hover:bg-void-mist'}`}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Relationships Sidebar */}
      <AnimatePresence>
        {showRelationships && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRelationships(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 bottom-0 w-full max-w-sm z-[70] shadow-2xl p-6 overflow-y-auto ${
                theme === 'light' ? 'bg-[#f5f1e8]' : 'bg-void-absolute border-l border-membrane'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className={`font-display text-xl tracking-wide ${currentTheme.text}`}>
                  Narrative Intelligence
                </h2>
                <button
                  onClick={() => setShowRelationships(false)}
                  className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-[#6b4423]/5' : 'hover:bg-void-mist'}`}
                >
                  <ChevronLeft className="w-6 h-6 rotate-180" />
                </button>
              </div>

              <CharacterRelationshipWidget characters={characterRelationships} theme={theme} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-20 right-6 z-50 w-72"
            >
              <div
                className={`${theme === 'light' ? 'bg-[#f5f1e8] border-[#6b4423]/10' : 'void-glass-heavy'} rounded-2xl p-6 space-y-6 border border-membrane`}
              >
                <h3 className={`font-display text-sm tracking-wide ${currentTheme.text}`}>
                  Reading Settings
                </h3>

                {/* Font Size */}
                <div className="space-y-3">
                  <label
                    className={`text-xs tracking-wide uppercase flex items-center gap-2 ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
                  >
                    <Type className="w-4 h-4" />
                    Font Size
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${theme === 'light' ? 'bg-[#6b4423]/5 text-[#6b4423]/60' : 'bg-void-mist text-text-secondary'}`}
                    >
                      A
                    </button>
                    <input
                      type="range"
                      min="14"
                      max="28"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 accent-spectral-cyan"
                    />
                    <button
                      onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${theme === 'light' ? 'bg-[#6b4423]/5 text-[#6b4423]/60' : 'bg-void-mist text-text-secondary'}`}
                    >
                      A
                    </button>
                  </div>
                </div>

                {/* Theme */}
                <div className="space-y-3">
                  <label
                    className={`text-xs tracking-wide uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
                  >
                    Theme
                  </label>
                  <div className="flex gap-2">
                    {(['void', 'sepia', 'light'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs capitalize transition-all ${
                          theme === t
                            ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/30'
                            : theme === 'light'
                              ? 'bg-[#6b4423]/5 text-[#6b4423]/60'
                              : 'bg-void-mist text-text-tertiary'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus Mode */}
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs tracking-wide uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
                  >
                    Focus Mode
                  </label>
                  <button
                    onClick={() => setFocusMode(!focusMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${focusMode ? 'bg-spectral-cyan' : theme === 'light' ? 'bg-[#6b4423]/10' : 'bg-void-mist'}`}
                  >
                    <motion.div
                      animate={{ x: focusMode ? 26 : 2 }}
                      className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${theme === 'light' && !focusMode ? 'bg-[#6b4423]/40' : 'bg-text-primary'}`}
                    />
                  </button>
                </div>

                {/* Revolutionary Features */}
                <div className="border-t border-membrane/50 pt-4 space-y-4">
                  <h4
                    className={`text-xs font-bold tracking-widest uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-spectral-cyan'}`}
                  >
                    🚀 Advanced Features
                  </h4>

                  {/* Quantum Text */}
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-xs tracking-wide uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
                    >
                      Quantum Text
                    </label>
                    <button
                      onClick={() => setEnableQuantumText(!enableQuantumText)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${enableQuantumText ? 'bg-spectral-violet' : theme === 'light' ? 'bg-[#6b4423]/10' : 'bg-void-mist'}`}
                    >
                      <motion.div
                        animate={{ x: enableQuantumText ? 26 : 2 }}
                        className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${theme === 'light' && !enableQuantumText ? 'bg-[#6b4423]/40' : 'bg-text-primary'}`}
                      />
                    </button>
                  </div>

                  {/* Neural Network */}
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-xs tracking-wide uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
                    >
                      Neural Network
                    </label>
                    <button
                      onClick={() => setShowNeuralNetwork(!showNeuralNetwork)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${showNeuralNetwork ? 'bg-spectral-cyan' : theme === 'light' ? 'bg-[#6b4423]/10' : 'bg-void-mist'}`}
                    >
                      <motion.div
                        animate={{ x: showNeuralNetwork ? 26 : 2 }}
                        className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${theme === 'light' && !showNeuralNetwork ? 'bg-[#6b4423]/40' : 'bg-text-primary'}`}
                      />
                    </button>
                  </div>

                  {/* Immersive Sound */}
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-xs tracking-wide uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
                    >
                      Soundscape
                    </label>
                    <button
                      onClick={() => setSoundscapeEnabled(!soundscapeEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${soundscapeEnabled ? 'bg-spectral-rose' : theme === 'light' ? 'bg-[#6b4423]/10' : 'bg-void-mist'}`}
                    >
                      <motion.div
                        animate={{ x: soundscapeEnabled ? 26 : 2 }}
                        className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${theme === 'light' && !soundscapeEnabled ? 'bg-[#6b4423]/40' : 'bg-text-primary'}`}
                      />
                    </button>
                  </div>

                  {/* Gesture Controls */}
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-xs tracking-wide uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
                    >
                      Gestures
                    </label>
                    <button
                      onClick={() => setGestureControlsEnabled(!gestureControlsEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${gestureControlsEnabled ? 'bg-spectral-emerald' : theme === 'light' ? 'bg-[#6b4423]/10' : 'bg-void-mist'}`}
                    >
                      <motion.div
                        animate={{ x: gestureControlsEnabled ? 26 : 2 }}
                        className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${theme === 'light' && !gestureControlsEnabled ? 'bg-[#6b4423]/40' : 'bg-text-primary'}`}
                      />
                    </button>
                  </div>

                  {/* Pacing Indicator */}
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-xs tracking-wide uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
                    >
                      Pacing Guide
                    </label>
                    <button
                      onClick={() => setShowPacingIndicator(!showPacingIndicator)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${showPacingIndicator ? 'bg-plasma-orange' : theme === 'light' ? 'bg-[#6b4423]/10' : 'bg-void-mist'}`}
                    >
                      <motion.div
                        animate={{ x: showPacingIndicator ? 26 : 2 }}
                        className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${theme === 'light' && !showPacingIndicator ? 'bg-[#6b4423]/40' : 'bg-text-primary'}`}
                      />
                    </button>
                  </div>

                  {/* AI Companion */}
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-xs tracking-wide uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
                    >
                      AI Companion
                    </label>
                    <button
                      onClick={() => setShowAICompanion(!showAICompanion)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${showAICompanion ? 'bg-spectral-violet' : theme === 'light' ? 'bg-[#6b4423]/10' : 'bg-void-mist'}`}
                    >
                      <motion.div
                        animate={{ x: showAICompanion ? 26 : 2 }}
                        className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${theme === 'light' && !showAICompanion ? 'bg-[#6b4423]/40' : 'bg-text-primary'}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Puzzle Overlay */}
      {showPuzzle && currentPuzzle && (
        <PuzzleOverlay
          puzzle={currentPuzzle}
          onSolve={(xp) => {
            // Reward XP (could call a service here)
            console.log(`Earned ${xp} XP!`);
          }}
          onClose={() => {
            setShowPuzzle(false);
            // Optional: Auto-select choice after puzzle if needed,
            // but usually we want user to see the content again
          }}
        />
      )}

      {/* Main Content */}
      <main ref={contentRef} className="min-h-screen overflow-y-auto no-scrollbar">
        {/* Chapter Header */}
        <div className="pt-32 pb-16 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="mx-auto w-24 h-px mb-8 opacity-40"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme === 'light' ? '#6b4423' : 'var(--spectral-cyan)'}, transparent)`,
              }}
            />

            <p
              className={`font-display text-xs tracking-[0.3em] uppercase mb-4 ${currentTheme.accent}`}
            >
              Chapter {currentChapterIndex + 1}
            </p>

            <h1 className={`font-literary text-4xl md:text-5xl italic ${currentTheme.text}`}>
              {currentChapter?.title || 'Untitled'}
            </h1>

            <div
              className="mx-auto w-24 h-px mt-8 opacity-40"
              style={{
                background: `linear-gradient(90deg, transparent, ${theme === 'light' ? '#6b4423' : 'var(--spectral-cyan)'}, transparent)`,
              }}
            />
          </motion.div>
        </div>

        {/* Story Content */}
        <article className="max-w-2xl mx-auto px-6 pb-32">
          {enableQuantumText ? (
            <QuantumTextRenderer
              text={currentChapter?.content || 'No content available.'}
              fontSize={fontSize}
              theme={theme}
              onWordHover={(word, position) => {
                setHoveredWord({ word, position });
                // Analyze word for emotional content
                const emotionalWords = [
                  'love',
                  'hate',
                  'fear',
                  'joy',
                  'sad',
                  'angry',
                  'happy',
                  'scared',
                ];
                if (emotionalWords.some((emotion) => word.toLowerCase().includes(emotion))) {
                  setCurrentEmotionalState(word.toLowerCase());
                }
              }}
              onEmotionDetected={(emotion, intensity) => {
                setCurrentEmotionalState(emotion);
              }}
              enableParticleEffects={true}
              readingSpeed={readingSpeed}
            />
          ) : (
            paragraphs.map((paragraph: string, index: number) => (
              <motion.p
                key={index}
                data-paragraph={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: focusMode ? (index === activeParagraph ? 1 : 0.25) : 1,
                  y: 0,
                  scale: focusMode && index === activeParagraph ? 1.01 : 1,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`font-prose leading-[2.2] mb-8 transition-all duration-500 ${index === 0 ? '' : 'indent-8'} ${currentTheme.text}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {index === 0 ? (
                  <>
                    <span
                      className={`float-left font-literary text-6xl leading-none pr-3 pt-1 ${currentTheme.accent}`}
                      style={{
                        textShadow: theme !== 'light' ? '0 0 30px rgba(0, 245, 212, 0.3)' : 'none',
                      }}
                    >
                      {paragraph[0]}
                    </span>
                    {paragraph.slice(1)}
                  </>
                ) : (
                  paragraph
                )}
              </motion.p>
            ))
          )}

          {/* AI Resonance */}
          {aiSegments.length > 0 && (
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 pt-8 border-t border-membrane"
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-4 h-4 text-spectral-violet" />
                <span
                  className={`text-xs font-ui tracking-widest uppercase ${theme === 'light' ? 'text-[#6b4423]/40' : 'text-text-ghost'}`}
                >
                  AI Resonance
                </span>
              </div>
              {aiSegments.map((segment, idx) => (
                <p
                  key={idx}
                  className={`font-prose text-base italic leading-relaxed pl-6 border-l mb-4 ${theme === 'light' ? 'text-[#6b4423]/40 border-[#6b4423]/10' : 'text-text-ghost border-membrane'}`}
                >
                  {segment}
                </p>
              ))}
            </motion.aside>
          )}

          {/* Choices */}
          {choices.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-20 pt-12 border-t border-membrane"
            >
              <h2
                className={`font-display text-sm tracking-widest uppercase mb-8 text-center ${currentTheme.accent}`}
              >
                What will you do?
              </h2>

              <div className="space-y-4">
                {choices.map((choice: any, index: number) => (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    onClick={() => handleChoiceSelect(choice)}
                    className={`group w-full text-left p-6 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                      theme === 'light'
                        ? 'bg-[#f0ebe0] border-[#6b4423]/10 hover:border-[#6b4423]/30'
                        : 'bg-void-elevated border-membrane hover:border-spectral-cyan/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-ui transition-colors ${
                          theme === 'light'
                            ? 'bg-[#6b4423]/5 text-[#6b4423]/60 group-hover:bg-[#6b4423]/10 group-hover:text-[#6b4423]'
                            : 'bg-void-mist text-text-tertiary group-hover:bg-spectral-cyan/10 group-hover:text-spectral-cyan'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <p
                        className={`font-prose text-lg transition-colors ${
                          theme === 'light'
                            ? 'text-[#2d2a24]/80 group-hover:text-[#2d2a24]'
                            : 'text-text-secondary group-hover:text-text-primary'
                        }`}
                      >
                        {choice.choice_text}
                      </p>
                    </div>

                    {/* Hover line */}
                    <motion.div
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${theme === 'light' ? 'bg-[#6b4423]' : 'bg-spectral-cyan'}`}
                      initial={{ scaleY: 0 }}
                      whileHover={{ scaleY: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Custom Choice Input - Premium Feature for AI Infinite Mode */}
              {storyMode === 'ai_infinite' && canUseCustomChoice && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 pt-8 border-t border-membrane/50"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-spectral-violet/20 via-spectral-rose/10 to-spectral-cyan/20 rounded-2xl blur-lg opacity-50" />
                    <div
                      className={`relative rounded-2xl p-5 ${theme === 'light' ? 'bg-[#f0ebe0] border border-[#6b4423]/10' : 'bg-void-elevated/80 border border-spectral-violet/20'}`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-spectral-violet" />
                        <span
                          className={`text-xs font-ui tracking-widest uppercase ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-spectral-violet'}`}
                        >
                          Write Your Own Path
                        </span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-spectral-violet/20 text-spectral-violet">
                          Premium
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <textarea
                          value={customChoiceInput}
                          onChange={(e) => setCustomChoiceInput(e.target.value)}
                          placeholder="What do you want to do? The AI will continue the story based on your choice..."
                          disabled={isGeneratingAI}
                          className={`flex-1 min-h-[100px] px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-spectral-violet/50 ${
                            theme === 'light'
                              ? 'bg-white/50 border border-[#6b4423]/10 text-[#2d2a24] placeholder:text-[#6b4423]/40'
                              : 'bg-void-absolute/50 border border-membrane text-text-primary placeholder:text-text-ghost'
                          }`}
                          maxLength={500}
                        />
                        <button
                          onClick={handleCustomChoice}
                          disabled={!customChoiceInput.trim() || isGeneratingAI}
                          className="self-end px-4 py-3 rounded-xl bg-gradient-to-r from-spectral-violet to-spectral-rose text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-spectral-violet/20"
                        >
                          {isGeneratingAI ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <p
                        className={`mt-2 text-xs ${theme === 'light' ? 'text-[#6b4423]/40' : 'text-text-ghost'}`}
                      >
                        {customChoiceInput.length}/500 characters
                      </p>
                    </div>
                  </div>

                  {/* AI Generating Indicator */}
                  {isGeneratingAI && (
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-spectral-violet/30 animate-ping" />
                        <Loader2 className="w-5 h-5 text-spectral-violet animate-spin relative" />
                      </div>
                      <span className="text-sm text-spectral-violet animate-pulse">
                        Weaving your unique story thread...
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* AI Companion Message */}
              <AnimatePresence>
                {showCompanion && companionMessage && storyMode === 'ai_infinite' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="mt-8"
                  >
                    <div
                      className={`relative rounded-2xl p-5 ${theme === 'light' ? 'bg-cyan-50/50 border border-cyan-200/50' : 'bg-spectral-cyan/5 border border-spectral-cyan/20'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-cyan-100' : 'bg-spectral-cyan/10'}`}
                        >
                          <Bot
                            className={`w-5 h-5 ${theme === 'light' ? 'text-cyan-600' : 'text-spectral-cyan'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-xs font-ui tracking-wide uppercase mb-2 ${theme === 'light' ? 'text-cyan-600' : 'text-spectral-cyan'}`}
                          >
                            {story?.companion_name || 'Story Companion'}
                          </p>
                          <p
                            className={`font-prose italic ${theme === 'light' ? 'text-cyan-900/80' : 'text-text-secondary'}`}
                          >
                            "{companionMessage}"
                          </p>
                        </div>
                        <button
                          onClick={() => setShowCompanion(false)}
                          className={`text-xs ${theme === 'light' ? 'text-cyan-600/60 hover:text-cyan-600' : 'text-spectral-cyan/60 hover:text-spectral-cyan'}`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {/* Static Story Mode - No Choices */}
          {storyMode === 'static' && currentChapterIndex < chapters.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-20 pt-12 border-t border-membrane text-center"
            >
              <button
                onClick={() => {
                  const nextIndex = currentChapterIndex + 1;
                  setCurrentChapterIndex(nextIndex);
                  contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-[#6b4423] text-white hover:bg-[#5a3a1e]'
                    : 'bg-spectral-cyan/10 text-spectral-cyan border border-spectral-cyan/30 hover:bg-spectral-cyan/20'
                }`}
              >
                <span>Continue to Next Chapter</span>
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            </motion.div>
          )}
        </article>
      </main>

      {/* Bottom Progress */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div
              className={`rounded-full px-4 py-2 flex items-center gap-3 ${theme === 'light' ? 'bg-[#f5f1e8]/90 border border-[#6b4423]/10' : 'void-glass'}`}
            >
              <BookOpen
                className={`w-4 h-4 ${theme === 'light' ? 'text-[#6b4423]/40' : 'text-text-ghost'}`}
              />
              <span
                className={`text-xs font-ui tabular-nums ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-tertiary'}`}
              >
                {Math.round(progress)}% complete
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-spectral-rose/20 border border-spectral-rose/30 text-spectral-rose text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
