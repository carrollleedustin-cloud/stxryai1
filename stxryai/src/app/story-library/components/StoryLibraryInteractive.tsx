'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import StoryCard from './StoryCard';
import { storyService, FilterOptions } from '@/services/storyService';
import { useAuth } from '@/contexts/AuthContext';
import { StoryGridSkeleton } from '@/components/ui/Skeleton';
import { staggerContainer, slideUp } from '@/lib/animations/variants';
import { toast } from 'sonner';
import ThemeToggle from '@/components/common/ThemeToggle';
import NotificationBell from '@/components/ui/NotificationBell';
import UserMenu from '@/components/ui/UserMenu';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { Story } from '@/types/database';

const PAGE_SIZE = 9;

export default function StoryLibraryInteractive() {
  const router = useRouter();
  const { profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState<FilterOptions>({
    genres: [],
    minRating: 0,
    sortBy: 'relevance',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const loadStories = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const newStories = await storyService.getFilteredStories({
        ...filters,
        searchQuery,
        page: reset ? 1 : page,
        pageSize: PAGE_SIZE,
      });

      if (reset) {
        setStories(newStories);
      } else {
        setStories((prev) => [...prev, ...newStories]);
      }
      
      setHasMore(newStories.length === PAGE_SIZE);
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
  }, [filters, searchQuery, page]);

  useEffect(() => {
    loadStories(true);
  }, [filters, searchQuery]);
  
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterChange = (newFilters: Omit<FilterOptions, 'searchQuery' | 'page' | 'pageSize'>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleStoryClick = (storyId: string, isPremium: boolean) => {
    if (isPremium && profile?.tier === 'free') {
      toast.warning('This is a premium story. Please upgrade to read.');
      router.push('/pricing');
      return;
    }
    router.push(`/story-reader/${storyId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-foreground"
            >
              Story Library
            </motion.h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <SearchBar
          onSearch={handleSearch}
          isPremium={profile?.tier === 'premium'}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {(loading && page === 1) ? (
              <StoryGridSkeleton count={6} />
            ) : stories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-card/50 rounded-xl"
              >
                <h3 className="text-xl font-semibold text-foreground">No Stories Found</h3>
                <p className="text-muted-foreground text-lg mt-2">Try adjusting your search or filters.</p>
              </motion.div>
            ) : (
              <>
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
                {hasMore && (
                  <div className="mt-8 text-center">
                    <motion.button
                      onClick={handleLoadMore}
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load More Stories'}
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}