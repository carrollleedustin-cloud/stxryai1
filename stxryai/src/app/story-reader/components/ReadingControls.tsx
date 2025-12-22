'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useTheme } from '@/contexts/ThemeContext';
import { PrismPanel } from '@/components/ui/prism/PrismPanel';
import { motion } from 'framer-motion';

interface ReadingControlsProps {
  currentFontSize: number;
  onFontSizeChange: (size: number) => void;
  onBookmark: () => void;
  isBookmarked: boolean;
  progress: number;
  onToggleDistractionFree: () => void;
  isDistractionFree: boolean;
  currentTheme?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

const ReadingControls = ({
  currentFontSize,
  onFontSizeChange,
  onBookmark,
  isBookmarked,
  progress,
  onToggleDistractionFree,
  isDistractionFree,
  currentTheme,
  onThemeChange,
}: ReadingControlsProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null; // Don't render skeleton, just wait for hydration to avoid jump
  }

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-6 z-40 mb-8"
    >
      <PrismPanel tone="glass" className="mx-auto max-w-4xl backdrop-blur-xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-3 px-4 py-2 md:px-6">
          {/* Progress ring */}
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-10 flex-shrink-0">
              <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-mono font-bold text-white/80">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-white/10" />

            {/* Font sizing */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onFontSizeChange(Math.max(14, currentFontSize - 2))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Decrease font size"
              >
                <Icon name="MinusIcon" size={16} />
              </button>
              <span className="w-8 text-center text-xs font-mono font-medium text-white/80">
                {currentFontSize}
              </span>
              <button
                onClick={() => onFontSizeChange(Math.min(26, currentFontSize + 2))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Increase font size"
              >
                <Icon name="PlusIcon" size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark';
                if (typeof onThemeChange === 'function') {
                  onThemeChange(next);
                } else {
                  setTheme(next);
                }
              }}
              className="group flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-yellow-300 transition-colors"
              aria-label="Change theme"
            >
              <Icon
                name={theme === 'dark' ? 'SunIcon' : 'MoonIcon'}
                size={18}
                className="group-hover:drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]"
              />
            </button>
            
            <button
              onClick={onBookmark}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 ${
                isBookmarked
                  ? 'bg-fuchsia-500/20 text-fuchsia-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                  : 'text-white/60 hover:bg-white/10 hover:text-fuchsia-300'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Icon name="BookmarkIcon" size={18} variant={isBookmarked ? 'solid' : 'outline'} />
            </button>

            <button
              onClick={onToggleDistractionFree}
              className={`flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium transition-all duration-300 ${
                isDistractionFree
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon
                name={isDistractionFree ? 'ArrowsPointingInIcon' : 'ArrowsPointingOutIcon'}
                size={16}
              />
              <span className="hidden sm:inline">{isDistractionFree ? 'Exit Focus' : 'Focus'}</span>
            </button>
          </div>
        </div>
      </PrismPanel>
    </motion.div>
  );
};

export default ReadingControls;
