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
    <div className="sticky top-16 z-30 border-b border-border bg-background/35 backdrop-blur-glass">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        {/* Progress ring */}
        <div className="flex items-center gap-3">
          <div
            className="relative h-10 w-10 rounded-full border border-border bg-background/40"
            aria-label={`Progress ${Math.round(progress)}%`}
            title={`Progress ${Math.round(progress)}%`}
            style={{
              background: `conic-gradient(var(--color-primary) ${progress}%, rgba(255,255,255,0.08) 0)`,
            }}
          >
            <div className="absolute inset-[3px] rounded-full bg-background/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[10px] font-semibold text-foreground/80">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Font sizing */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-card/40 px-2 py-1">
            <button
              onClick={() => onFontSizeChange(Math.max(14, currentFontSize - 2))}
              className="touch-target flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted/40 transition-micro"
              aria-label="Decrease font size"
            >
              <Icon name="MinusIcon" size={18} className="text-foreground" />
            </button>
            <span className="min-w-[3.25rem] text-center text-xs font-semibold text-foreground/80">
              {currentFontSize}px
            </span>
            <button
              onClick={() => onFontSizeChange(Math.min(26, currentFontSize + 2))}
              className="touch-target flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted/40 transition-micro"
              aria-label="Increase font size"
            >
              <Icon name="PlusIcon" size={18} className="text-foreground" />
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
            className="touch-target flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/40 hover:bg-muted/40 transition-micro"
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
            className={`touch-target flex h-10 w-10 items-center justify-center rounded-full border transition-micro ${
              isBookmarked
                ? 'bg-accent/20 border-accent/60 text-accent'
                : 'bg-card/40 border-border text-foreground hover:bg-muted/40'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Icon name="BookmarkIcon" size={20} variant={isBookmarked ? 'solid' : 'outline'} />
          </button>
          <button
            onClick={onToggleDistractionFree}
            className={`touch-target flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-micro ${
              isDistractionFree
                ? 'bg-primary/18 border-primary/60 text-primary'
                : 'bg-card/40 border-border text-foreground hover:bg-muted/40'
            }`}
            aria-label={isDistractionFree ? 'Exit focus mode' : 'Enter focus mode'}
          >
            <Icon
              name={isDistractionFree ? 'ArrowsPointingInIcon' : 'ArrowsPointingOutIcon'}
              size={18}
            />
            <span className="hidden sm:inline">{isDistractionFree ? 'Exit focus' : 'Focus'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingControls;
