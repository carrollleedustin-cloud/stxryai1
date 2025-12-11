'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState } from 'react';

interface Story {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: string;
  rating: number;
  reads: number;
  chapters: number;
  isPremium?: boolean;
}

interface MobileStoryCardProps {
  story: Story;
  onSwipeLeft?: (story: Story) => void; // Add to library
  onSwipeRight?: (story: Story) => void; // Skip/Dismiss
  onTap?: (story: Story) => void;
  variant?: 'swipeable' | 'standard';
}

export default function MobileStoryCard({
  story,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  variant = 'standard',
}: MobileStoryCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.x > threshold) {
      setExitX(200);
      onSwipeRight?.(story);
    } else if (info.offset.x < -threshold) {
      setExitX(-200);
      onSwipeLeft?.(story);
    }
  };

  if (variant === 'standard') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onTap?.(story)}
        className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 active:bg-white/10 transition-colors"
      >
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600"
            style={{
              backgroundImage: story.coverImage ? `url(${story.coverImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Premium Badge */}
          {story.isPremium && (
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-xs font-bold shadow-lg">
              ⭐ Premium
            </div>
          )}

          {/* Genre Badge */}
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
            {story.genre}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
              {story.title}
            </h3>
            <p className="text-white/80 text-sm mb-3">by {story.author}</p>

            <div className="flex items-center gap-3 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>{story.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>👁️</span>
                <span>{formatNumber(story.reads)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📖</span>
                <span>{story.chapters} ch</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Swipeable variant (Tinder-style)
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="relative h-full bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Swipe Indicators */}
        <motion.div
          style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          className="absolute top-8 left-8 z-10 px-6 py-3 bg-green-500 text-white font-bold text-xl rounded-xl rotate-[-15deg] shadow-xl"
        >
          📚 SAVE
        </motion.div>

        <motion.div
          style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          className="absolute top-8 right-8 z-10 px-6 py-3 bg-red-500 text-white font-bold text-xl rounded-xl rotate-[15deg] shadow-xl"
        >
          ➡️ SKIP
        </motion.div>

        {/* Cover Image */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600"
          style={{
            backgroundImage: story.coverImage ? `url(${story.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          {story.isPremium && (
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-sm font-bold mb-4">
              ⭐ Premium Story
            </div>
          )}

          <h2 className="text-white font-bold text-3xl mb-2 line-clamp-2">
            {story.title}
          </h2>
          <p className="text-white/90 text-xl mb-4">by {story.author}</p>

          <div className="flex items-center gap-2 mb-6">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
              {story.genre}
            </span>
          </div>

          <div className="flex items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-lg font-semibold">{story.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              <span className="text-lg">{formatNumber(story.reads)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <span className="text-lg">{story.chapters} chapters</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Format large numbers (1234 -> 1.2K)
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Swipeable Card Stack Component
interface MobileStoryStackProps {
  stories: Story[];
  onSwipeLeft?: (story: Story) => void;
  onSwipeRight?: (story: Story) => void;
}

export function MobileStoryStack({
  stories,
  onSwipeLeft,
  onSwipeRight,
}: MobileStoryStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (callback?: (story: Story) => void) => {
    if (currentIndex < stories.length) {
      callback?.(stories[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (currentIndex >= stories.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
          <p className="text-gray-400">Check back later for more stories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Show next 3 cards stacked */}
      {stories.slice(currentIndex, currentIndex + 3).map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ scale: 1 - index * 0.05, y: index * 10 }}
          animate={{ scale: 1 - index * 0.05, y: index * 10 }}
          className="absolute inset-0"
          style={{ zIndex: 3 - index }}
        >
          {index === 0 ? (
            <MobileStoryCard
              story={story}
              variant="swipeable"
              onSwipeLeft={() => handleSwipe(onSwipeLeft)}
              onSwipeRight={() => handleSwipe(onSwipeRight)}
            />
          ) : (
            <div className="h-full bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
