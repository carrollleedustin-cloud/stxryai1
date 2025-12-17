'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface StoryRecommendationCardProps {
  story: {
    id: string;
    title: string;
    coverImage: string;
    coverAlt: string;
    genre: string[];
    description: string;
    progress?: number;
    totalChoices: number;
    rating: number;
    isNew?: boolean;
    isPremium?: boolean;
  };
}

const StoryRecommendationCard = ({ story }: StoryRecommendationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/story-reader?id=${story.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-card border border-border rounded-lg overflow-hidden transition-smooth hover:shadow-elevation-2 hover:border-primary/50">
        {story.isNew && (
          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-md shadow-elevation-1">
            NEW
          </div>
        )}

        {story.isPremium && (
          <div className="absolute top-3 right-3 z-10 p-1.5 bg-primary/90 backdrop-blur-sm rounded-full">
            <Icon name="SparklesIcon" size={16} className="text-primary-foreground" />
          </div>
        )}

        <div className="relative h-64 overflow-hidden bg-muted">
          <AppImage
            src={story.coverImage}
            alt={story.coverAlt}
            className={`w-full h-full object-cover transition-smooth ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-heading font-semibold text-foreground line-clamp-2 flex-1">
              {story.title}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {story.genre.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md border border-primary/20"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{story.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Icon name="StarIcon" size={16} className="text-accent" variant="solid" />
                <span className="text-sm font-medium text-foreground">
                  {story.rating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="ChatBubbleLeftIcon" size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{story.totalChoices}</span>
              </div>
            </div>

            {story.progress !== undefined && story.progress > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                    style={{ width: `${story.progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-primary">{story.progress}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoryRecommendationCard;
