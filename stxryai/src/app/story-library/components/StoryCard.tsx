'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AppImage from '@/components/ui/AppImage';
import { Story } from '@/types/database';
import Badge from '@/components/ui/Badge';
import {
  Flame,
  Book,
  Heart,
  Brain,
  Swords,
  Ghost,
  Rocket,
  Landmark,
  Zap,
  Star,
  Users,
  Clock,
} from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

const genreIcons = {
  Fantasy: <Swords size={14} />,
  'Sci-Fi': <Rocket size={14} />,
  Mystery: <Ghost size={14} />,
  Romance: <Heart size={14} />,
  Thriller: <Book size={14} />,
  Adventure: <Flame size={14} />,
  Horror: <Ghost size={14} />,
  Historical: <Landmark size={14} />,
};

export default function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className="bg-card rounded-2xl shadow-lg overflow-hidden cursor-pointer group relative flex flex-col h-full"
      whileHover="hover"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.15, rotate: 2 },
          }}
          transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <AppImage
            src={story.cover_image || '/assets/images/placeholder.png'}
            alt={`Cover for ${story.title}`}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {story.is_premium && (
          <Badge variant="premium" className="absolute top-3 left-3">
            <Zap size={14} className="mr-1" />
            Premium
          </Badge>
        )}

        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4 text-white"
          variants={{
            rest: { y: 20, opacity: 0 },
            hover: { y: 0, opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-bold line-clamp-1">{story.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <AppImage
              src={story.author.avatar_url}
              alt={story.author.display_name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs">{story.author.display_name}</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/60"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
        >
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold">
            Read Story
          </button>
        </motion.div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">
          {story.description}
        </p>

        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            {genreIcons[story.genre as keyof typeof genreIcons] || <Book size={14} />}
            {story.genre}
          </Badge>
          <Badge variant="secondary">{story.difficulty}</Badge>
          {story.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mt-auto">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Rating">
              <Star size={14} className="text-yellow-400" /> {story.rating?.toFixed(1) || 'N/A'}
            </span>
            <span className="flex items-center gap-1" title="Views">
              <Users size={14} /> {story.view_count?.toLocaleString() || 0}
            </span>
            {story.estimated_duration && (
              <span className="flex items-center gap-1" title="Estimated time to read">
                <Clock size={14} /> {story.estimated_duration} min
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
