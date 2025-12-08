'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ReadingProgressIndicatorProps {
  currentPage: number;
  totalPages: number;
  currentChapter?: string;
  showBranchVisualization?: boolean;
  isPremium?: boolean;
  onBranchClick?: () => void;
}

const ReadingProgressIndicator = ({
  currentPage,
  totalPages,
  currentChapter,
  showBranchVisualization = false,
  isPremium = false,
  onBranchClick,
}: ReadingProgressIndicatorProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const progressPercentage = Math.round((currentPage / totalPages) * 100);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[300] transition-smooth ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-card/95 backdrop-blur-glass border-t border-border shadow-elevation-2">
        <div className="relative h-1 bg-muted">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="BookOpenIcon" size={18} className="text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              {currentChapter && (
                <>
                  <div className="hidden sm:block w-px h-4 bg-border" />
                  <span className="hidden sm:block text-sm text-muted-foreground">
                    {currentChapter}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/30">
                  <span className="text-sm font-bold text-primary">
                    {progressPercentage}%
                  </span>
                </div>
              </div>

              {showBranchVisualization && isPremium && (
                <button
                  onClick={onBranchClick}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/30 transition-smooth"
                >
                  <Icon name="MapIcon" size={18} className="text-accent" />
                  <span className="hidden sm:inline text-sm font-medium text-accent">
                    Story Map
                  </span>
                </button>
              )}

              {showBranchVisualization && !isPremium && (
                <div className="relative group">
                  <button
                    disabled
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted/50 border border-border opacity-50 cursor-not-allowed"
                  >
                    <Icon name="LockClosedIcon" size={18} />
                    <span className="hidden sm:inline text-sm font-medium">
                      Story Map
                    </span>
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                    <div className="bg-card border border-border rounded-lg shadow-elevation-2 px-3 py-2 whitespace-nowrap">
                      <p className="text-xs text-muted-foreground">
                        Premium feature
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingProgressIndicator;