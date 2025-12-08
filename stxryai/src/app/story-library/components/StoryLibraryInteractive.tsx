'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import StoryCard from './StoryCard';
import { storyService } from '@/services/storyService';
import { useAuth } from '@/contexts/AuthContext';
import { StoryGridSkeleton } from '@/components/ui/Skeleton';
import { staggerContainer, slideUp } from '@/lib/animations/variants';
import { toast } from '@/lib/utils/toast';
import ThemeToggle from '@/components/common/ThemeToggle';

interface FilterOptions {
  genres: string[];
  completionStatus: string[];
  minRating: number;
  contentMaturity: string[];
  sortBy: string;
}

export default function StoryLibraryInteractive() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    genres: [],
    completionStatus: ['All'],
    minRating: 0,
    contentMaturity: [],
    sortBy: 'relevance',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStories();
  }, [filters, searchQuery]);

  const loadStories = async () => {
    try {
      setLoading(true);
      
      // Convert FilterOptions to storyService filter format
      const serviceFilters = {
        genre: filters.genres.length > 0 ? filters.genres[0] : 'all',
        difficulty: 'all',
        isPremium: undefined as boolean | undefined,
        searchQuery: searchQuery,
      };
      
      const data = await storyService.getStories(serviceFilters);
      
      // Apply additional client-side filtering
      let filteredData = data || [];
      
      // Filter by genres if multiple selected
      if (filters.genres.length > 0) {
        filteredData = filteredData.filter((story: any) =>
          filters.genres.some((genre) => story.genre?.toLowerCase().includes(genre.toLowerCase()))
        );
      }
      
      // Filter by minimum rating
      if (filters.minRating > 0) {
        filteredData = filteredData.filter((story: any) => 
          (story.average_rating || 0) >= filters.minRating
        );
      }
      
      // Sort stories based on sortBy option
      switch (filters.sortBy) {
        case 'popular':
          filteredData.sort((a: any, b: any) => (b.total_reads || 0) - (a.total_reads || 0));
          break;
        case 'newest':
          filteredData.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          break;
        case 'rating':
          filteredData.sort((a: any, b: any) => 
            (b.average_rating || 0) - (a.average_rating || 0)
          );
          break;
        default:
          // relevance - keep original order
          break;
      }
      
      setStories(filteredData);
      setError('');
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch')) {
        setError('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
      } else {
        setError('Failed to load stories. Please try again.');
      }
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleStoryClick = (storyId: string, isPremium: boolean) => {
    if (isPremium && profile?.subscription_tier === 'free') {
      toast.warning('Premium Content', 'Please upgrade your subscription to access this story.');
      return;
    }
    router.push(`/story-reader?storyId=${storyId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-foreground"
            >
              Story Library
            </motion.h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/user-dashboard')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          isPremium={profile?.subscription_tier === 'premium'}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Story Grid */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <StoryGridSkeleton count={6} />
            ) : stories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <p className="text-muted-foreground text-lg">No stories found matching your criteria.</p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {stories.map((story) => (
                  <motion.div key={story.id} variants={slideUp}>
                    <StoryCard
                      story={story}
                      onClick={() => handleStoryClick(story.id, story.is_premium)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}