'use client';

import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface Chapter {
  id: string;
  title: string;
  number: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface ReadingProgressProps {
  currentChapter: number;
  totalChapters: number;
  chapters?: Chapter[];
  completionPercentage: number;
  estimatedTimeRemaining?: number;
  wordsRead: number;
  totalWords: number;
  onChapterSelect?: (chapterId: string) => void;
  compact?: boolean;
}

export default function ReadingProgress({
  currentChapter,
  totalChapters,
  chapters = [],
  completionPercentage,
  estimatedTimeRemaining,
  wordsRead,
  totalWords,
  onChapterSelect,
  compact = false,
}: ReadingProgressProps) {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (compact) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Chapter {currentChapter} of {totalChapters}
          </span>
          <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Icon name="BookOpenIcon" size={24} className="text-primary" />
          Reading Progress
        </h3>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-lg"
        >
          {completionPercentage}%
        </motion.div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            Chapter {currentChapter} of {totalChapters}
          </span>
          {estimatedTimeRemaining && (
            <span className="flex items-center gap-1">
              <Icon name="ClockIcon" size={14} />
              {formatTime(estimatedTimeRemaining)} remaining
            </span>
          )}
        </div>
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="DocumentTextIcon" size={16} className="text-blue-500" />
            <span className="text-xs text-muted-foreground">Words Read</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {wordsRead.toLocaleString()}
            <span className="text-sm text-muted-foreground ml-1">
              / {totalWords.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="ChartBarIcon" size={16} className="text-purple-500" />
            <span className="text-xs text-muted-foreground">Chapters</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {currentChapter}
            <span className="text-sm text-muted-foreground ml-1">/ {totalChapters}</span>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      {chapters.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="ListBulletIcon" size={16} />
            Chapters
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {chapters.map((chapter) => (
              <motion.button
                key={chapter.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChapterSelect?.(chapter.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  chapter.isCurrent
                    ? 'bg-primary/10 border-2 border-primary'
                    : chapter.isCompleted
                      ? 'bg-muted/50 border border-border hover:bg-muted'
                      : 'bg-card border border-border hover:bg-muted/30'
                }`}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {chapter.isCompleted ? (
                    <Icon
                      name="CheckCircleIcon"
                      size={20}
                      variant="solid"
                      className="text-green-500"
                    />
                  ) : chapter.isCurrent ? (
                    <Icon
                      name="PlayCircleIcon"
                      size={20}
                      variant="solid"
                      className="text-primary"
                    />
                  ) : (
                    <Icon name="CircleStackIcon" size={20} className="text-muted-foreground" />
                  )}
                </div>

                {/* Chapter Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">Chapter {chapter.number}</span>
                    {chapter.isCurrent && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                        Reading
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{chapter.title}</p>
                </div>

                {/* Chevron */}
                <Icon
                  name="ChevronRightIcon"
                  size={16}
                  className="text-muted-foreground flex-shrink-0"
                />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
