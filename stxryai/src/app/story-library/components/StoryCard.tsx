'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { cardHover } from '@/lib/animations/variants';

interface StoryCardProps {
  story: any;
  onClick: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-card rounded-xl shadow-lg overflow-hidden cursor-pointer relative group"
      onClick={onClick}
    >
      {/* Image Container with Overlay */}
      <div className="relative h-48 overflow-hidden">
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <AppImage
            src={story.cover_image_url}
            alt={`Cover image for ${story.title}`}
            className="w-full h-48 object-cover"
          />
        </motion.div>

        {/* Gradient Overlay on Hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
        />

        {/* Premium Badge */}
        {story.is_premium && (
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
          >
            <Icon name="SparklesIcon" size={12} />
            Premium
          </motion.div>
        )}

        {/* Quick Actions (Show on Hover) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          className="absolute top-2 right-2 flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              // Add to wishlist functionality
            }}
            aria-label="Add to wishlist"
          >
            <Icon name="HeartIcon" size={16} className="text-red-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality
            }}
            aria-label="Share story"
          >
            <Icon name="ShareIcon" size={16} className="text-blue-500" />
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4">
        <motion.h3
          animate={{ color: isHovered ? 'hsl(var(--color-primary))' : undefined }}
          transition={{ duration: 0.2 }}
          className="text-lg font-bold text-foreground mb-2 line-clamp-1"
        >
          {story.title}
        </motion.h3>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {story.description}
        </p>

        {/* Tags */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {story.genre && (
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
            >
              {story.genre}
            </motion.span>
          )}
          {story.difficulty && (
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full"
            >
              {story.difficulty}
            </motion.span>
          )}
        </div>

        {/* Stats Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              ⭐ {story.rating?.toFixed(1) || '0.0'} ({story.review_count || 0})
            </span>
            <span className="flex items-center gap-1">
              👥 {story.play_count?.toLocaleString() || 0}
            </span>
          </div>
          {story.estimated_duration && (
            <span>⏱️ {story.estimated_duration} min</span>
          )}
        </div>

        {/* Progress Bar (if user has progress) */}
        {story.progress !== undefined && story.progress > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{story.progress}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${story.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Shimmer Effect on Hover */}
      <motion.div
        animate={{ x: isHovered ? ['0%', '200%'] : '0%' }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
      />
    </motion.div>
  );
}