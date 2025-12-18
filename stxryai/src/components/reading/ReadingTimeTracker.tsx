'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface ReadingTimeTrackerProps {
  storyId: string;
  chapterId: string;
  onTimeUpdate?: (seconds: number) => void;
  showDisplay?: boolean;
  className?: string;
}

export function ReadingTimeTracker({
  storyId,
  chapterId,
  onTimeUpdate,
  showDisplay = true,
  className = '',
}: ReadingTimeTrackerProps) {
  const [readingTime, setReadingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Start tracking when component mounts
    setIsActive(true);
    startTimeRef.current = Date.now();

    // Update every second
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setReadingTime(elapsed);
        onTimeUpdate?.(elapsed);
      }
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [storyId, chapterId, onTimeUpdate]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedReadingTime = Math.ceil(readingTime / 60); // minutes

  if (!showDisplay) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg ${className}`}
    >
      <Icon name="ClockIcon" size={16} className="text-muted-foreground" />
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Reading: </span>
          <span className="font-medium text-foreground">{formatTime(readingTime)}</span>
        </div>
        {estimatedReadingTime > 0 && (
          <div>
            <span className="text-muted-foreground">Est. time: </span>
            <span className="font-medium text-foreground">{estimatedReadingTime} min</span>
          </div>
        )}
      </div>
      {isActive && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-green-500 rounded-full"
        />
      )}
    </motion.div>
  );
}

