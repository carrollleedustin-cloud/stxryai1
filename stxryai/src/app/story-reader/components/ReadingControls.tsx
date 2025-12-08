'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ReadingControlsProps {
  currentTheme: 'midnight' | 'blood-moon' | 'deep-ocean' | 'void';
  currentFontSize: number;
  onThemeChange: (theme: 'midnight' | 'blood-moon' | 'deep-ocean' | 'void') => void;
  onFontSizeChange: (size: number) => void;
  onBookmark: () => void;
  isBookmarked: boolean;
}

const ReadingControls = ({
  currentTheme,
  currentFontSize,
  onThemeChange,
  onFontSizeChange,
  onBookmark,
  isBookmarked,
}: ReadingControlsProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const themes = [
    { id: 'midnight', name: 'Midnight', color: 'from-[#0a0a0f] to-[#1a1a2e]' },
    { id: 'blood-moon', name: 'Blood Moon', color: 'from-[#1a0a0f] to-[#2e1a1a]' },
    { id: 'deep-ocean', name: 'Deep Ocean', color: 'from-[#0a0f1a] to-[#1a1a2e]' },
    { id: 'void', name: 'Void', color: 'from-black to-[#0a0a0f]' },
  ] as const;

  if (!isHydrated) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-muted/20 rounded-lg animate-pulse"></div>
        <div className="w-10 h-10 bg-muted/20 rounded-lg animate-pulse"></div>
        <div className="w-10 h-10 bg-muted/20 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
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

      <div className="relative">
        <button
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          className="p-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:bg-muted/50 transition-smooth"
          aria-label="Change theme"
        >
          <Icon name="SwatchIcon" size={20} className="text-foreground" />
        </button>

        {showThemeMenu && (
          <>
            <div
              className="fixed inset-0 z-[190]"
              onClick={() => setShowThemeMenu(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-48 bg-card/95 backdrop-blur-glass border border-border rounded-lg shadow-elevation-2 z-[200] overflow-hidden">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onThemeChange(theme.id);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-smooth hover:bg-muted/50 ${
                    currentTheme === theme.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded bg-gradient-to-br ${theme.color} border border-border`} />
                    <span className="text-sm font-medium text-foreground">{theme.name}</span>
                    {currentTheme === theme.id && (
                      <Icon name="CheckIcon" size={16} className="text-primary ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onBookmark}
        className={`p-2 rounded-lg border transition-smooth ${
          isBookmarked
            ? 'bg-accent/20 border-accent text-accent' :'bg-card/50 backdrop-blur-sm border-border text-foreground hover:bg-muted/50'
        }`}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <Icon name="BookmarkIcon" size={20} variant={isBookmarked ? 'solid' : 'outline'} />
      </button>
    </div>
  );
};

export default ReadingControls;