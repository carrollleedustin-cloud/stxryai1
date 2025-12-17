'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useTheme } from '@/contexts/ThemeContext';

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
    return (
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="w-1/3 h-10 bg-muted/20 rounded-lg animate-pulse"></div>
        <div className="w-1/3 h-10 bg-muted/20 rounded-lg animate-pulse"></div>
        <div className="w-1/3 h-10 bg-muted/20 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border">
          <button
            onClick={() => onFontSizeChange(Math.max(14, currentFontSize - 2))}
            className="p-2 rounded hover:bg-muted/50 transition-smooth"
            aria-label="Decrease font size"
          >
            <Icon name="MinusIcon" size={18} className="text-foreground" />
          </button>
          <span className="px-3 text-sm font-medium text-foreground min-w-[3rem] text-center">
            {currentFontSize}px
          </span>
          <button
            onClick={() => onFontSizeChange(Math.min(24, currentFontSize + 2))}
            className="p-2 rounded hover:bg-muted/50 transition-smooth"
            aria-label="Increase font size"
          >
            <Icon name="PlusIcon" size={18} className="text-foreground" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              if (typeof onThemeChange === 'function') {
                onThemeChange(next);
              } else {
                setTheme(next);
              }
            }}
            className="p-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:bg-muted/50 transition-smooth"
            aria-label="Change theme"
          >
            <Icon
              name={theme === 'dark' ? 'SunIcon' : 'MoonIcon'}
              size={20}
              className="text-foreground"
            />
          </button>
          <button
            onClick={onBookmark}
            className={`p-2 rounded-lg border transition-smooth ${
              isBookmarked
                ? 'bg-accent/20 border-accent text-accent'
                : 'bg-card/50 backdrop-blur-sm border-border text-foreground hover:bg-muted/50'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Icon name="BookmarkIcon" size={20} variant={isBookmarked ? 'solid' : 'outline'} />
          </button>
          <button
            onClick={onToggleDistractionFree}
            className={`p-2 rounded-lg border transition-smooth ${
              isDistractionFree
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-card/50 backdrop-blur-sm border-border text-foreground hover:bg-muted/50'
            }`}
            aria-label={
              isDistractionFree ? 'Exit distraction-free mode' : 'Enter distraction-free mode'
            }
          >
            <Icon
              name={isDistractionFree ? 'ArrowsPointingInIcon' : 'ArrowsPointingOutIcon'}
              size={20}
            />
          </button>
        </div>
      </div>
      <div className="mt-4 h-1 bg-muted/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
        />
      </div>
    </div>
  );
};

export default ReadingControls;
