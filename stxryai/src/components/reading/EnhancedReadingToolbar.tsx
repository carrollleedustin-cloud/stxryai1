'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ReadingToolbarProps {
  onBookmark?: () => void;
  onShare?: () => void;
  onComment?: () => void;
  onSettings?: () => void;
  currentChapter?: number;
  totalChapters?: number;
  progress?: number; // 0-100
  isBookmarked?: boolean;
  commentCount?: number;
}

export default function EnhancedReadingToolbar({
  onBookmark,
  onShare,
  onComment,
  onSettings,
  currentChapter = 1,
  totalChapters = 10,
  progress = 0,
  isBookmarked = false,
  commentCount = 0,
}: ReadingToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  return (
    <>
      {/* Fixed Toolbar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-white/10"
      >
        <div className="container mx-auto px-4 py-3">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Chapter {currentChapter} of {totalChapters}</span>
              <button
                onClick={() => setShowProgress(!showProgress)}
                className="hover:text-white transition-colors"
              >
                {Math.round(progress)}% Complete
              </button>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            {/* Left Actions */}
            <div className="flex items-center gap-2">
              {/* Bookmark */}
              <ToolbarButton
                icon={isBookmarked ? '🔖' : '📑'}
                label="Bookmark"
                onClick={onBookmark}
                active={isBookmarked}
              />

              {/* Comments */}
              <ToolbarButton
                icon="💬"
                label="Comments"
                badge={commentCount}
                onClick={onComment}
              />

              {/* Share */}
              <ToolbarButton
                icon="📤"
                label="Share"
                onClick={onShare}
              />
            </div>

            {/* Center - Quick Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <span>📚</span>
                <span>{totalChapters} chapters</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⏱️</span>
                <span>{Math.round((totalChapters - currentChapter) * 5)} min left</span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Text Size */}
              <ToolbarButton
                icon="🔤"
                label="Text Size"
                onClick={() => setShowSettings(true)}
              />

              {/* Settings */}
              <ToolbarButton
                icon="⚙️"
                label="Settings"
                onClick={onSettings}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Panel */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-2xl max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Reading Progress</h3>
              <button
                onClick={() => setShowProgress(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Chapter List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...Array(totalChapters)].map((_, i) => {
                const chapterNum = i + 1;
                const isComplete = chapterNum < currentChapter;
                const isCurrent = chapterNum === currentChapter;

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-purple-600/20 border border-purple-600/30'
                        : isComplete
                        ? 'bg-white/5'
                        : 'bg-white/5 opacity-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCurrent
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : isComplete
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {isComplete ? '✓' : chapterNum}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                        Chapter {chapterNum}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isComplete ? 'Completed' : isCurrent ? 'Reading now' : 'Not started'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <ReadingSettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// Toolbar Button Component
function ToolbarButton({
  icon,
  label,
  badge,
  onClick,
  active,
}: {
  icon: string;
  label: string;
  badge?: number;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
        active
          ? 'bg-purple-600/20 text-purple-400'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs hidden sm:block">{label}</span>

      {badge !== undefined && badge > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </motion.button>
  );
}

// Reading Settings Panel
function ReadingSettingsPanel({ onClose }: { onClose: () => void }) {
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('dark');
  const [fontFamily, setFontFamily] = useState('serif');

  const themes = [
    { id: 'light', label: 'Light', bg: 'bg-white', text: 'text-gray-900' },
    { id: 'sepia', label: 'Sepia', bg: 'bg-amber-50', text: 'text-amber-900' },
    { id: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-gray-100' },
  ];

  const fonts = [
    { id: 'serif', label: 'Serif', font: 'font-serif' },
    { id: 'sans', label: 'Sans', font: 'font-sans' },
    { id: 'mono', label: 'Mono', font: 'font-mono' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Reading Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="32"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          {/* Line Height */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Line Height: {lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.2"
              max="2.4"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme === t.id
                      ? 'border-purple-600'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-full h-8 rounded ${t.bg} mb-2`} />
                  <div className="text-xs text-white">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Font Family
            </label>
            <div className="grid grid-cols-3 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    fontFamily === f.id
                      ? 'border-purple-600 bg-purple-600/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`text-sm text-white ${f.font}`}>Aa</div>
                  <div className="text-xs text-gray-400 mt-1">{f.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-gray-400 mb-2">Preview</div>
            <p
              className="text-white"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                fontFamily: fontFamily === 'serif' ? 'serif' : fontFamily === 'sans' ? 'sans-serif' : 'monospace',
              }}
            >
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFontSize(16);
                setLineHeight(1.6);
                setTheme('dark');
                setFontFamily('serif');
              }}
              className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
