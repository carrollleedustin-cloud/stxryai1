'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { EmptyState } from '@/components/ui/EmptyState';

interface Recommendation {
  id: string;
  storyId: string;
  title: string;
  coverImage?: string;
  author: string;
  genre: string;
  rating: number;
  reason: string;
  confidence: number;
  matchFactors: string[];
}

interface SmartRecommendationsProps {
  userId: string;
  onStoryClick: (storyId: string) => void;
  limit?: number;
}

export function SmartRecommendations({
  userId,
  onStoryClick,
  limit = 6,
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual AI recommendation service
      // const data = await recommendationService.getSmartRecommendations(userId, limit);
      // setRecommendations(data);
      
      // Mock data for now
      setRecommendations([]);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon="💡"
        title="No Recommendations Yet"
        description="Start reading stories to get personalized recommendations based on your preferences!"
        action={{
          label: 'Browse Stories',
          onClick: () => onStoryClick(''),
          variant: 'primary',
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>✨</span>
            Recommended For You
          </h2>
          <p className="text-muted-foreground">AI-powered suggestions based on your reading history</p>
        </div>
        <motion.button
          onClick={loadRecommendations}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium flex items-center gap-2"
        >
          <Icon name="ArrowPathIcon" size={20} />
          Refresh
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onStoryClick(rec.storyId)}
            className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
          >
            {/* Cover Image */}
            {rec.coverImage ? (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={rec.coverImage}
                  alt={rec.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-xs font-medium">
                  {Math.round(rec.confidence * 100)}% match
                </div>
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                📚
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {rec.title}
                </h3>
                <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0 ml-2">
                  <Icon name="StarIcon" size={16} variant="solid" />
                  <span className="text-sm font-medium">{rec.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{rec.reason}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {rec.matchFactors.slice(0, 2).map((factor, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{rec.genre}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

