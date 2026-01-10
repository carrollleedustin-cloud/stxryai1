'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Settings,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Sun,
  Moon,
  Type,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  ZoomIn,
  ZoomOut,
  Menu,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ReaderSettings {
  // Theme
  theme: 'light' | 'dark' | 'sepia' | 'high-contrast';

  // Typography
  fontFamily: 'serif' | 'sans-serif' | 'dyslexic';
  fontSize: number; // 12-24px
  lineHeight: number; // 1.4-2.0
  letterSpacing: number; // 0-2px
  textAlign: 'left' | 'center' | 'justify';

  // Layout
  maxWidth: number; // 600-900px
  padding: number; // 20-60px

  // Features
  distractionFree: boolean;
  showProgress: boolean;
  autoScroll: boolean;
  autoScrollSpeed: number; // 1-10
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  number: number;
}

interface ReaderProgress {
  currentChapter: number;
  scrollPosition: number;
  percentage: number;
  timeSpent: number;
  wordsRead: number;
}

interface EnhancedReaderInterfaceProps {
  story: {
    id: string;
    title: string;
    author: string;
    chapters: Chapter[];
  };
  initialChapter?: number;
  onProgressUpdate?: (progress: ReaderProgress) => void;
  onBookmark?: (chapterId: string, position: number) => void;
}

// ============================================================================
// THEME CONFIGURATIONS
// ============================================================================

const THEMES = {
  light: {
    background: '#ffffff',
    text: '#1a1a1a',
    secondary: '#666666',
    accent: '#6366f1',
  },
  dark: {
    background: '#1a1a1a',
    text: '#e5e5e5',
    secondary: '#a3a3a3',
    accent: '#818cf8',
  },
  sepia: {
    background: '#f4ecd8',
    text: '#5c4a3a',
    secondary: '#8b7355',
    accent: '#a0826d',
  },
  'high-contrast': {
    background: '#000000',
    text: '#ffffff',
    secondary: '#cccccc',
    accent: '#ffff00',
  },
};

const FONT_FAMILIES = {
  serif: "'Playfair Display', Georgia, serif",
  'sans-serif': "'Inter', -apple-system, sans-serif",
  dyslexic: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
};

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'light',
  fontFamily: 'serif',
  fontSize: 18,
  lineHeight: 1.6,
  letterSpacing: 0,
  textAlign: 'left',
  maxWidth: 700,
  padding: 40,
  distractionFree: false,
  showProgress: true,
  autoScroll: false,
  autoScrollSpeed: 5,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EnhancedReaderInterface({
  story,
  initialChapter = 0,
  onProgressUpdate,
  onBookmark,
}: EnhancedReaderInterfaceProps) {
  // State
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [progress, setProgress] = useState<ReaderProgress>({
    currentChapter: initialChapter,
    scrollPosition: 0,
    percentage: 0,
    timeSpent: 0,
    wordsRead: 0,
  });

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            goToPreviousChapter();
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            goToNextChapter();
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleDistractionFree();
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSettings(!showSettings);
          }
          break;
        case 't':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowTOC(!showTOC);
          }
          break;
        case 'b':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleBookmark();
          }
          break;
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            increaseFontSize();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            decreaseFontSize();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSettings, showTOC, currentChapter]);

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

      const newProgress = {
        ...progress,
        scrollPosition: scrollTop,
        percentage: Math.min(scrollPercentage, 100),
        timeSpent: Date.now() - startTimeRef.current,
      };

      setProgress(newProgress);
      onProgressUpdate?.(newProgress);
    };

    const contentElement = contentRef.current;
    contentElement?.addEventListener('scroll', handleScroll);

    return () => contentElement?.removeEventListener('scroll', handleScroll);
  }, [progress, onProgressUpdate]);

  // ============================================================================
  // AUTO SCROLL
  // ============================================================================

  useEffect(() => {
    if (settings.autoScroll && contentRef.current) {
      autoScrollIntervalRef.current = setInterval(() => {
        if (contentRef.current) {
          contentRef.current.scrollBy({
            top: settings.autoScrollSpeed,
            behavior: 'smooth',
          });
        }
      }, 50);
    } else if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [settings.autoScroll, settings.autoScrollSpeed]);

  // ============================================================================
  // NAVIGATION FUNCTIONS
  // ============================================================================

  const goToPreviousChapter = useCallback(() => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentChapter]);

  const goToNextChapter = useCallback(() => {
    if (currentChapter < story.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentChapter, story.chapters.length]);

  const goToChapter = useCallback((chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    setShowTOC(false);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ============================================================================
  // SETTINGS FUNCTIONS
  // ============================================================================

  const toggleDistractionFree = () => {
    setSettings({ ...settings, distractionFree: !settings.distractionFree });
  };

  const increaseFontSize = () => {
    setSettings({
      ...settings,
      fontSize: Math.min(settings.fontSize + 1, 24),
    });
  };

  const decreaseFontSize = () => {
    setSettings({
      ...settings,
      fontSize: Math.max(settings.fontSize - 1, 12),
    });
  };

  const cycleTheme = () => {
    const themes: Array<ReaderSettings['theme']> = ['light', 'dark', 'sepia', 'high-contrast'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setSettings({ ...settings, theme: themes[nextIndex] });
  };

  const handleBookmark = () => {
    const chapter = story.chapters[currentChapter];
    onBookmark?.(chapter.id, progress.scrollPosition);
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const currentTheme = THEMES[settings.theme];
  const currentChapterData = story.chapters[currentChapter];
  const totalChapters = story.chapters.length;
  const overallProgress = ((currentChapter + 1) / totalChapters) * 100;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
        fontFamily: FONT_FAMILIES[settings.fontFamily],
      }}
    >
      {/* Header - Hidden in distraction-free mode */}
      <AnimatePresence>
        {!settings.distractionFree && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
            style={{
              backgroundColor: `${currentTheme.background}cc`,
              borderColor: `${currentTheme.text}20`,
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              {/* Left: Story info */}
              <div className="flex items-center gap-4">
                <BookOpen size={24} style={{ color: currentTheme.accent }} />
                <div>
                  <h1 className="font-bold text-lg">{story.title}</h1>
                  <p className="text-sm" style={{ color: currentTheme.secondary }}>
                    by {story.author}
                  </p>
                </div>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTOC(!showTOC)}
                  className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-current transition-colors"
                  title="Table of Contents (Ctrl+T)"
                >
                  <Menu size={20} />
                </button>
                <button
                  onClick={handleBookmark}
                  className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-current transition-colors"
                  title="Bookmark (Ctrl+B)"
                >
                  <Bookmark size={20} />
                </button>
                <button
                  onClick={cycleTheme}
                  className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-current transition-colors"
                  title="Change Theme"
                >
                  {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-current transition-colors"
                  title="Settings (Ctrl+S)"
                >
                  <Settings size={20} />
                </button>
                <button
                  onClick={toggleDistractionFree}
                  className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-current transition-colors"
                  title="Distraction-Free Mode (Ctrl+F)"
                >
                  {settings.distractionFree ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {settings.showProgress && (
              <div className="h-1 w-full" style={{ backgroundColor: `${currentTheme.text}10` }}>
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: currentTheme.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        ref={contentRef}
        className="h-full overflow-y-auto"
        style={{
          paddingTop: settings.distractionFree ? 0 : '100px',
          paddingBottom: settings.distractionFree ? 0 : '80px',
        }}
      >
        <article
          className="mx-auto transition-all duration-300"
          style={{
            maxWidth: `${settings.maxWidth}px`,
            padding: `${settings.padding}px`,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing: `${settings.letterSpacing}px`,
            textAlign: settings.textAlign,
          }}
        >
          {/* Chapter title */}
          <h2 className="text-3xl font-bold mb-8" style={{ color: currentTheme.accent }}>
            Chapter {currentChapterData.number}: {currentChapterData.title}
          </h2>

          {/* Chapter content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: currentChapterData.content }}
          />
        </article>
      </div>

      {/* Navigation buttons - Hidden in distraction-free mode */}
      <AnimatePresence>
        {!settings.distractionFree && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t"
            style={{
              backgroundColor: `${currentTheme.background}cc`,
              borderColor: `${currentTheme.text}20`,
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <button
                onClick={goToPreviousChapter}
                disabled={currentChapter === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-10 hover:bg-current transition-colors"
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <div className="text-center">
                <p className="text-sm" style={{ color: currentTheme.secondary }}>
                  Chapter {currentChapter + 1} of {totalChapters}
                </p>
                <p className="text-xs" style={{ color: currentTheme.secondary }}>
                  {Math.round(progress.percentage)}% complete
                </p>
              </div>

              <button
                onClick={goToNextChapter}
                disabled={currentChapter === totalChapters - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-10 hover:bg-current transition-colors"
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed top-0 right-0 bottom-0 w-96 z-50 shadow-2xl overflow-y-auto"
            style={{
              backgroundColor: currentTheme.background,
              borderLeft: `1px solid ${currentTheme.text}20`,
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Reader Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-current"
                >
                  ✕
                </button>
              </div>

              {/* Theme selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['light', 'dark', 'sepia', 'high-contrast'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setSettings({ ...settings, theme })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        settings.theme === theme ? 'border-current' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: THEMES[theme].background,
                        color: THEMES[theme].text,
                      }}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font family */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fontFamily: e.target.value as ReaderSettings['fontFamily'],
                    })
                  }
                  className="w-full p-2 rounded-lg border"
                  style={{
                    backgroundColor: currentTheme.background,
                    borderColor: `${currentTheme.text}20`,
                  }}
                >
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans-serif</option>
                  <option value="dyslexic">Dyslexic-friendly</option>
                </select>
              </div>

              {/* Font size */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Font Size: {settings.fontSize}px
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={decreaseFontSize}
                    className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-current"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) =>
                      setSettings({ ...settings, fontSize: parseInt(e.target.value) })
                    }
                    className="flex-1"
                  />
                  <button
                    onClick={increaseFontSize}
                    className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-current"
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>
              </div>

              {/* Line height */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Line Height: {settings.lineHeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="1.4"
                  max="2.0"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) =>
                    setSettings({ ...settings, lineHeight: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Text alignment */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Text Alignment</label>
                <div className="flex gap-2">
                  {(['left', 'center', 'justify'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => setSettings({ ...settings, textAlign: align })}
                      className={`p-2 rounded-lg ${
                        settings.textAlign === align ? 'bg-opacity-20 bg-current' : ''
                      }`}
                    >
                      {align === 'left' && <AlignLeft size={20} />}
                      {align === 'center' && <AlignCenter size={20} />}
                      {align === 'justify' && <AlignJustify size={20} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span>Show Progress</span>
                  <input
                    type="checkbox"
                    checked={settings.showProgress}
                    onChange={(e) => setSettings({ ...settings, showProgress: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span>Auto Scroll</span>
                  <input
                    type="checkbox"
                    checked={settings.autoScroll}
                    onChange={(e) => setSettings({ ...settings, autoScroll: e.target.checked })}
                    className="w-5 h-5"
                  />
                </label>

                {settings.autoScroll && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Auto Scroll Speed: {settings.autoScrollSpeed}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.autoScrollSpeed}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          autoScrollSpeed: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table of Contents */}
      <AnimatePresence>
        {showTOC && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            className="fixed top-0 left-0 bottom-0 w-96 z-50 shadow-2xl overflow-y-auto"
            style={{
              backgroundColor: currentTheme.background,
              borderRight: `1px solid ${currentTheme.text}20`,
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Table of Contents</h3>
                <button
                  onClick={() => setShowTOC(false)}
                  className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-current"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {story.chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => goToChapter(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentChapter
                        ? 'bg-opacity-20 bg-current'
                        : 'hover:bg-opacity-10 hover:bg-current'
                    }`}
                  >
                    <div className="font-medium">Chapter {chapter.number}</div>
                    <div className="text-sm" style={{ color: currentTheme.secondary }}>
                      {chapter.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Distraction-free mode hint */}
      <AnimatePresence>
        {settings.distractionFree && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 right-4 z-50 p-3 rounded-lg backdrop-blur-md text-sm"
            style={{
              backgroundColor: `${currentTheme.background}cc`,
              border: `1px solid ${currentTheme.text}20`,
            }}
          >
            Press <kbd className="px-2 py-1 rounded bg-opacity-20 bg-current">Ctrl+F</kbd> to exit
            distraction-free mode
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
