'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Settings, 
  Bookmark, 
  ChevronLeft, 
  Moon, 
  Sun,
  Type,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ImmersiveReaderProps {
  title: string;
  chapterTitle?: string;
  chapterNumber: number;
  content: string;
  choices?: Array<{
    id: string;
    text: string;
    consequence?: string;
  }>;
  onChoiceSelect?: (choiceId: string) => void;
  onBookmark?: () => void;
  onBack?: () => void;
  isBookmarked?: boolean;
  progress?: number;
  aiSegments?: string[];
}

/**
 * IMMERSIVE READER
 * Where stories come alive. Where readers become travelers.
 * The text emerges from void, each word carrying weight and meaning.
 */
export default function ImmersiveReader({
  title,
  chapterTitle,
  chapterNumber,
  content,
  choices = [],
  onChoiceSelect,
  onBookmark,
  onBack,
  isBookmarked = false,
  progress = 0,
  aiSegments = [],
}: ImmersiveReaderProps) {
  const [fontSize, setFontSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(0);
  const [ambientSound, setAmbientSound] = useState(false);
  const [theme, setTheme] = useState<'void' | 'sepia' | 'light'>('void');
  const [showSettings, setShowSettings] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const [isMounted, setIsMounted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Handle mount state for hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Manual scroll progress tracking (more reliable than useScroll with ref)
  useEffect(() => {
    const container = contentRef.current;
    if (!container || !isMounted) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress || 0)));
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isMounted]);
  
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
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
  
  // Track active paragraph based on scroll
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
  
  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  // Theme styles
  const themeStyles = {
    void: {
      bg: 'bg-void-absolute',
      text: 'text-text-secondary',
      accent: 'text-spectral-cyan',
    },
    sepia: {
      bg: 'bg-[#1a1814]',
      text: 'text-[#d4c5a9]',
      accent: 'text-[#c9a227]',
    },
    light: {
      bg: 'bg-[#f5f1e8]',
      text: 'text-[#2d2a24]',
      accent: 'text-[#6b4423]',
    },
  };
  
  const currentTheme = themeStyles[theme];
  
  return (
    <div className={`relative min-h-screen ${currentTheme.bg} transition-colors duration-500`}>
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[2px] z-50 transition-all duration-100"
        style={{
          width: `${readingProgress}%`,
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
                background: 'linear-gradient(180deg, rgba(2,2,3,0.95) 0%, rgba(2,2,3,0.8) 60%, transparent 100%)',
              }}
            >
              {/* Back Button */}
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-ui tracking-wide">Exit</span>
              </button>
              
              {/* Title */}
              <div className="absolute left-1/2 -translate-x-1/2 text-center">
                <p className="text-xs font-ui tracking-widest text-text-ghost uppercase">
                  Chapter {chapterNumber}
                </p>
                <h1 className="font-literary text-lg text-text-secondary italic">
                  {chapterTitle || title}
                </h1>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked 
                      ? 'text-spectral-cyan bg-spectral-cyan/10' 
                      : 'text-text-tertiary hover:text-text-primary hover:bg-void-mist'
                  }`}
                >
                  <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-void-mist transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-void-mist transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 right-6 z-50 w-72"
          >
            <div className="void-glass-heavy rounded-2xl p-6 space-y-6">
              <h3 className="font-display text-sm tracking-wide text-text-primary">Reading Settings</h3>
              
              {/* Font Size */}
              <div className="space-y-3">
                <label className="text-xs text-text-tertiary tracking-wide uppercase flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Font Size
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                    className="w-8 h-8 rounded-lg bg-void-mist text-text-secondary hover:text-text-primary flex items-center justify-center"
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
                    className="w-8 h-8 rounded-lg bg-void-mist text-text-secondary hover:text-text-primary flex items-center justify-center text-lg"
                  >
                    A
                  </button>
                </div>
              </div>
              
              {/* Theme */}
              <div className="space-y-3">
                <label className="text-xs text-text-tertiary tracking-wide uppercase">Theme</label>
                <div className="flex gap-2">
                  {(['void', 'sepia', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs capitalize transition-all ${
                        theme === t 
                          ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/30' 
                          : 'bg-void-mist text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Focus Mode */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-text-tertiary tracking-wide uppercase">Focus Mode</label>
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    focusMode ? 'bg-spectral-cyan' : 'bg-void-mist'
                  }`}
                >
                  <motion.div
                    animate={{ x: focusMode ? 26 : 2 }}
                    className="w-5 h-5 rounded-full bg-text-primary shadow-md"
                  />
                </button>
              </div>
              
              {/* Ambient Sound */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-text-tertiary tracking-wide uppercase flex items-center gap-2">
                  {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  Ambient Sound
                </label>
                <button
                  onClick={() => setAmbientSound(!ambientSound)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    ambientSound ? 'bg-spectral-cyan' : 'bg-void-mist'
                  }`}
                >
                  <motion.div
                    animate={{ x: ambientSound ? 26 : 2 }}
                    className="w-5 h-5 rounded-full bg-text-primary shadow-md"
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main
        ref={contentRef}
        className="min-h-screen overflow-y-auto no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Chapter Header */}
        <div className="pt-32 pb-16 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Decorative line */}
            <div 
              className="mx-auto w-24 h-px mb-8 opacity-40"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--spectral-cyan), transparent)',
              }}
            />
            
            <p className={`font-display text-xs tracking-[0.3em] uppercase ${currentTheme.accent} mb-4`}>
              Chapter {chapterNumber}
            </p>
            
            <h1 className={`font-literary text-4xl md:text-5xl italic ${currentTheme.text}`}>
              {chapterTitle || 'Untitled'}
            </h1>
            
            <div 
              className="mx-auto w-24 h-px mt-8 opacity-40"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--spectral-cyan), transparent)',
              }}
            />
          </motion.div>
        </div>
        
        {/* Story Content */}
        <article className="max-w-2xl mx-auto px-6 pb-32">
          {paragraphs.map((paragraph, index) => (
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
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`
                font-prose leading-[2.2] mb-8
                transition-all duration-500
                ${index === 0 ? '' : 'indent-8'}
                ${currentTheme.text}
              `}
              style={{ fontSize: `${fontSize}px` }}
            >
              {/* First letter styling for first paragraph */}
              {index === 0 ? (
                <>
                  <span 
                    className={`float-left font-literary text-6xl leading-none pr-3 pt-1 ${currentTheme.accent}`}
                    style={{ textShadow: '0 0 30px rgba(0, 245, 212, 0.3)' }}
                  >
                    {paragraph[0]}
                  </span>
                  {paragraph.slice(1)}
                </>
              ) : (
                paragraph
              )}
            </motion.p>
          ))}
          
          {/* AI Resonance Section */}
          {aiSegments.length > 0 && (
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 pt-8 border-t border-membrane"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-spectral-violet animate-pulse" />
                <span className="text-xs font-ui tracking-widest uppercase text-text-ghost">
                  AI Resonance
                </span>
              </div>
              <div className="space-y-4">
                {aiSegments.map((segment, index) => (
                  <p
                    key={index}
                    className="font-prose text-base italic text-text-ghost leading-relaxed pl-6 border-l border-membrane"
                    style={{ fontSize: `${fontSize * 0.9}px` }}
                  >
                    {segment}
                  </p>
                ))}
              </div>
            </motion.aside>
          )}
          
          {/* Choices Section */}
          {choices.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-20 pt-12 border-t border-membrane"
            >
              <h2 className="font-display text-sm tracking-widest uppercase text-spectral-cyan mb-8 text-center">
                What will you do?
              </h2>
              
              <div className="space-y-4">
                {choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                    onClick={() => onChoiceSelect?.(choice.id)}
                    className="group w-full text-left p-6 rounded-xl bg-void-elevated border border-membrane hover:border-spectral-cyan/30 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-void-mist flex items-center justify-center text-xs font-ui text-text-tertiary group-hover:bg-spectral-cyan/10 group-hover:text-spectral-cyan transition-colors">
                        {index + 1}
                      </span>
                      <div>
                        <p className={`font-prose text-lg ${currentTheme.text} group-hover:text-text-primary transition-colors`}>
                          {choice.text}
                        </p>
                        {choice.consequence && (
                          <p className="mt-2 text-sm text-text-ghost italic">
                            {choice.consequence}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Hover indicator */}
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                      style={{ background: 'var(--spectral-cyan)' }}
                      initial={{ scaleY: 0 }}
                      whileHover={{ scaleY: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
        </article>
      </main>
      
      {/* Bottom Progress Indicator */}
      <div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        style={{ opacity: showControls ? 1 : 0, transition: 'opacity 0.3s' }}
      >
        <div className="void-glass rounded-full px-4 py-2 flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-text-ghost" />
          <span className="text-xs font-ui text-text-tertiary tabular-nums">
            {Math.round(readingProgress || progress)}% complete
          </span>
        </div>
      </div>
    </div>
  );
}

