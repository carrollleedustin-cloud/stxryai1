'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface RatingSystemProps {
  storyId: string;
  averageRating: number;
  totalRatings: number;
  userRating?: number;
  onRate: (rating: number) => Promise<void>;
  showDistribution?: boolean;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function RatingSystem({
  storyId,
  averageRating,
  totalRatings,
  userRating,
  onRate,
  showDistribution = true,
  ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
}: RatingSystemProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (rating: number) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onRate(rating);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPercentage = (count: number) => {
    if (totalRatings === 0) return 0;
    return (count / totalRatings) * 100;
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-6">
      {/* Overall Rating */}
      <div className="flex items-start gap-8 mb-6">
        {/* Left: Large Rating Display */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-5xl font-bold text-foreground mb-2"
          >
            {averageRating.toFixed(1)}
          </motion.div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name="StarIcon"
                size={20}
                variant={star <= Math.round(averageRating) ? 'solid' : 'outline'}
                className={
                  star <= Math.round(averageRating) ? 'text-accent' : 'text-muted-foreground'
                }
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {totalRatings.toLocaleString()} {totalRatings === 1 ? 'rating' : 'ratings'}
          </span>
        </div>

        {/* Right: Rating Distribution */}
        {showDistribution && (
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars as keyof typeof ratingDistribution];
              const percentage = getPercentage(count);

              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground w-8">{stars} ★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: (5 - stars) * 0.1 }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Rating Input */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          {userRating ? 'Your Rating' : 'Rate this story'}
        </h3>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= (hoveredRating || userRating || 0);
            const isHovered = star <= hoveredRating;

            return (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2, rotate: 360 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => handleRate(star)}
                disabled={isSubmitting}
                className="transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon
                  name="StarIcon"
                  size={32}
                  variant={isActive ? 'solid' : 'outline'}
                  className={`transition-colors ${
                    isHovered
                      ? 'text-yellow-400'
                      : isActive
                        ? 'text-accent'
                        : 'text-muted-foreground hover:text-accent'
                  }`}
                />
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {hoveredRating > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 text-sm text-muted-foreground"
            >
              {getRatingLabel(hoveredRating)}
            </motion.p>
          )}
        </AnimatePresence>

        {userRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Icon name="CheckCircleIcon" size={16} variant="solid" className="text-green-500" />
            You rated this story {userRating} {userRating === 1 ? 'star' : 'stars'}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function getRatingLabel(rating: number): string {
  switch (rating) {
    case 1:
      return 'Poor - Not what I expected';
    case 2:
      return 'Fair - Below average';
    case 3:
      return 'Good - Met expectations';
    case 4:
      return 'Very Good - Exceeded expectations';
    case 5:
      return 'Excellent - Absolutely loved it!';
    default:
      return '';
  }
}
