'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Chapter {
  id: string;
  title: string;
  content: string;
  chapterNumber: number;
}

interface MobileReadingInterfaceProps {
  chapters: Chapter[];
  initialChapter?: number;
  onChapterChange?: (chapterNumber: number) => void;
  onClose?: () => void;
}

export default function MobileReadingInterface({
  chapters,
  initialChapter = 0,
  onChapterChange,
  onClose,
}: MobileReadingInterfaceProps) {
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [showControls, setShowControls] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [currentChapter]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;

    if (info.offset.x > threshold && currentChapter > 0) {
      setCurrentChapter((prev) => {
        const next = prev - 1;
        onChapterChange?.(next);
        return next;
      });
    } else if (info.offset.x < -threshold && currentChapter < chapters.length - 1) {
      setCurrentChapter((prev) => {
        const next = prev + 1;
        onChapterChange?.(next);
        return next;
      });
    }
  };

  const currentChapterData = chapters[currentChapter];

  const themeStyles = {
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-[#f4ecd8] text-[#5c4a3a]',
    light: 'bg-white text-gray-900',
  };

  return (
    <div className={`fixed inset-0 z-50 ${themeStyles[theme]} transition-colors`}>
      {/* Brightness Overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: 1 - brightness }}
      />

      {/* Top Controls */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: showControls ? 0 : -100 }}
        className={`absolute top-0 left-0 right-0 z-10 ${
          theme === 'dark' ? 'bg-black/90' : theme === 'sepia' ? 'bg-[#f4ecd8]/90' : 'bg-white/90'
        } backdrop-blur-sm border-b ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-300'
        } safe-area-inset-top`}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <span className="text-2xl">←</span>
          </button>

          <div className="flex-1 text-center px-4">
            <div className="font-semibold text-sm line-clamp-1">
              {currentChapterData.title}
            </div>
            <div className="text-xs opacity-70">
              Chapter {currentChapter + 1} of {chapters.length}
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <span className="text-2xl">⚙️</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className={`h-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-300'}`}>
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentChapter + 1) / chapters.length) * 100}%` }}
          />
        </div>
      </motion.div>

      {/* Content Area */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        style={{ x, opacity }}
        onDragEnd={handleDragEnd}
        onClick={() => setShowControls(!showControls)}
        className="h-full overflow-y-auto pt-24 pb-32 px-6 cursor-grab active:cursor-grabbing"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={currentChapter}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold mb-6">{currentChapterData.title}</h2>
            <div
              className="prose prose-lg max-w-none leading-relaxed"
              style={{ fontSize: `${fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: currentChapterData.content }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showControls ? 0 : 100 }}
        className={`absolute bottom-0 left-0 right-0 z-10 ${
          theme === 'dark' ? 'bg-black/90' : theme === 'sepia' ? 'bg-[#f4ecd8]/90' : 'bg-white/90'
        } backdrop-blur-sm border-t ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-300'
        } safe-area-inset-bottom`}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => {
              if (currentChapter > 0) {
                setCurrentChapter((prev) => {
                  const next = prev - 1;
                  onChapterChange?.(next);
                  return next;
                });
              }
            }}
            disabled={currentChapter === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentChapter === 0
                ? 'opacity-30 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 active:bg-white/30'
            }`}
          >
            ← Previous
          </button>

          <div className="text-sm font-medium">
            {currentChapter + 1} / {chapters.length}
          </div>

          <button
            onClick={() => {
              if (currentChapter < chapters.length - 1) {
                setCurrentChapter((prev) => {
                  const next = prev + 1;
                  onChapterChange?.(next);
                  return next;
                });
              }
            }}
            disabled={currentChapter === chapters.length - 1}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentChapter === chapters.length - 1
                ? 'opacity-30 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800'
            }`}
          >
            Next →
          </button>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: showSettings ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className={`absolute bottom-0 left-0 right-0 z-20 ${
          theme === 'dark' ? 'bg-gray-800' : theme === 'sepia' ? 'bg-[#e5dcc5]' : 'bg-gray-100'
        } rounded-t-3xl border-t ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-300'
        } shadow-2xl`}
      >
        <div className="p-6 safe-area-inset-bottom">
          {/* Handle */}
          <div className="w-12 h-1.5 bg-gray-500 rounded-full mx-auto mb-6" />

          <h3 className="text-xl font-bold mb-6">Reading Settings</h3>

          {/* Font Size */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">Font Size</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
              >
                A-
              </button>
              <input
                type="range"
                min="12"
                max="28"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1"
              />
              <button
                onClick={() => setFontSize((prev) => Math.min(28, prev + 2))}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
              >
                A+
              </button>
              <span className="text-sm font-mono w-12 text-center">{fontSize}px</span>
            </div>
          </div>

          {/* Theme */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-purple-600 bg-gray-900 text-white'
                    : 'border-gray-600 bg-gray-900 text-white opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">🌙</div>
                <div className="text-sm font-medium">Dark</div>
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'sepia'
                    ? 'border-amber-600 bg-[#f4ecd8] text-[#5c4a3a]'
                    : 'border-amber-400 bg-[#f4ecd8] text-[#5c4a3a] opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">📜</div>
                <div className="text-sm font-medium">Sepia</div>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-blue-600 bg-white text-gray-900'
                    : 'border-gray-400 bg-white text-gray-900 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">☀️</div>
                <div className="text-sm font-medium">Light</div>
              </button>
            </div>
          </div>

          {/* Brightness */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">Brightness</label>
            <div className="flex items-center gap-4">
              <span className="text-xl">🔅</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xl">🔆</span>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
