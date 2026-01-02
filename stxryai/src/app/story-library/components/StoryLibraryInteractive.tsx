'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { storyService } from '@/services/storyService';
import { useAuth } from '@/contexts/AuthContext';
import VoidBackground from '@/components/void/VoidBackground';
import EtherealNav from '@/components/void/EtherealNav';
import DimensionalCard from '@/components/void/DimensionalCard';
import SpectralButton from '@/components/void/SpectralButton';
import TemporalReveal, { StaggerContainer, StaggerItem } from '@/components/void/TemporalReveal';
import ParticleField from '@/components/void/ParticleField';
import { Story } from '@/types/database';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Star, 
  Users,
  Sparkles,
  ChevronDown,
  X,
  Loader2,
} from 'lucide-react';

const PAGE_SIZE = 12;

const GENRES = [
  'All',
  'Fantasy',
  'Sci-Fi',
  'Horror',
  'Romance',
  'Mystery',
  'Adventure',
  'Thriller',
];

/**
 * STORY LIBRARY
 * The infinite archive of narratives.
 * Where every story awaits its reader.
 */
export default function StoryLibraryInteractive() {
  const router = useRouter();
  const { profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');

  const loadStories = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const filters = {
        genres: selectedGenre !== 'All' ? [selectedGenre] : [],
        searchQuery,
        page: reset ? 1 : page,
        pageSize: PAGE_SIZE,
        sortBy,
        completionStatus: ['All'],
        minRating: 0,
        contentMaturity: [],
      };
      
      const newStories = await storyService.getFilteredStories(filters);

      if (reset) {
        setStories(newStories);
      } else {
        setStories((prev) => [...prev, ...newStories]);
      }

      setHasMore(newStories.length === PAGE_SIZE);
      setError('');
    } catch (err: any) {
      setError('Failed to load stories. Please try again.');
      if (reset) setStories([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGenre, searchQuery, page, sortBy]);

  useEffect(() => {
    setPage(1);
    loadStories(true);
  }, [selectedGenre, searchQuery, sortBy]);

  useEffect(() => {
    if (page > 1) {
      loadStories(false);
    }
  }, [page]);

  const handleStoryClick = (storyId: string, isPremium: boolean) => {
    if (isPremium && profile?.subscription_tier !== 'premium') {
      router.push('/pricing');
    } else {
      router.push(`/story-reader?storyId=${storyId}`);
    }
  };

  return (
    <VoidBackground variant="default">
      <ParticleField particleCount={30} color="rgba(0, 245, 212, 0.2)" />
      <EtherealNav />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-void">
          {/* Header */}
          <TemporalReveal className="text-center mb-12">
            <span className="text-xs font-ui tracking-[0.3em] uppercase text-spectral-cyan mb-4 block">
              The Archive
            </span>
            <h1 className="font-display text-4xl md:text-6xl tracking-wide text-text-primary mb-4">
              Story Library
            </h1>
            <p className="font-prose text-lg text-text-tertiary max-w-2xl mx-auto">
              Discover infinite narratives waiting to be explored. Every story branches into countless possibilities.
            </p>
          </TemporalReveal>
          
          {/* Search & Filters */}
          <TemporalReveal delay={0.1} className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-ghost" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories..."
                  className="input-temporal pl-12 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-ghost hover:text-text-tertiary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Genre Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`
                      px-4 py-2 rounded-lg text-xs font-ui tracking-wide uppercase whitespace-nowrap
                      transition-all duration-200
                      ${selectedGenre === genre 
                        ? 'bg-spectral-cyan text-void-absolute' 
                        : 'bg-void-mist text-text-tertiary hover:text-text-primary hover:bg-void-whisper'
                      }
                    `}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-void-mist border border-membrane rounded-lg px-4 py-2.5 pr-10 text-sm text-text-secondary focus:outline-none focus:border-spectral-cyan cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-ghost pointer-events-none" />
              </div>
            </div>
          </TemporalReveal>
          
          {/* Error State */}
          {error && (
            <TemporalReveal>
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-spectral-rose/10 flex items-center justify-center">
                  <X className="w-8 h-8 text-spectral-rose" />
                </div>
                <p className="text-text-tertiary mb-4">{error}</p>
                <SpectralButton onClick={() => loadStories(true)}>
                  Try Again
                </SpectralButton>
              </div>
            </TemporalReveal>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <div className="void-glass rounded-2xl overflow-hidden h-[320px] relative">
                    {/* Cover skeleton */}
                    <div className="h-40 bg-void-mist relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                    </div>
                    
                    {/* Content skeleton */}
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-void-mist rounded w-3/4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                      </div>
                      <div className="h-3 bg-void-mist rounded w-1/2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                      </div>
                      <div className="h-3 bg-void-mist rounded w-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                      </div>
                      <div className="h-3 bg-void-mist rounded w-2/3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                      </div>
                      <div className="flex gap-4 mt-4">
                        <div className="h-3 bg-void-mist rounded w-12 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        </div>
                        <div className="h-3 bg-void-mist rounded w-12 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        </div>
                        <div className="h-3 bg-void-mist rounded w-12 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Stories Grid */}
          {!loading && !error && (
            <>
              {stories.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {stories.map((story, index) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                    >
                      <DimensionalCard
                        onClick={() => handleStoryClick(story.id, story.is_premium || false)}
                        className="h-full group"
                      >
                        {/* Cover Image */}
                        <div className="relative h-40 overflow-hidden rounded-t-2xl -mx-px -mt-px">
                          {story.cover_image ? (
                            <img
                              src={story.cover_image}
                              alt={story.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-spectral-cyan/20 to-spectral-violet/20 flex items-center justify-center">
                              <BookOpen className="w-10 h-10 text-text-ghost" />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-void-elevated via-transparent to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            {story.genre && (
                              <span className="px-2 py-1 rounded text-[10px] font-ui tracking-wide uppercase bg-void-glass-heavy text-spectral-cyan">
                                {story.genre}
                              </span>
                            )}
                            {story.is_premium && (
                              <span className="px-2 py-1 rounded text-[10px] font-ui tracking-wide uppercase bg-spectral-amber/20 text-spectral-amber flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5">
                          <h3 className="font-display text-lg tracking-wide text-text-primary mb-2 line-clamp-1 group-hover:text-spectral-cyan transition-colors">
                            {story.title}
                          </h3>
                          
                          <p className="text-sm text-text-tertiary mb-1">
                            by <span className="text-spectral-cyan">{story.author?.display_name || 'Unknown'}</span>
                          </p>
                          
                          {story.description && (
                            <p className="font-prose text-xs text-text-ghost line-clamp-2 mb-4">
                              {story.description}
                            </p>
                          )}
                          
                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-text-ghost">
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-spectral-amber" />
                              {story.rating?.toFixed(1) || '—'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {story.read_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {story.estimated_duration || '?'} min
                            </span>
                          </div>
                        </div>
                      </DimensionalCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-void-mist flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-text-ghost" />
                  </div>
                  <h3 className="font-display text-xl text-text-primary mb-2">No stories found</h3>
                  <p className="text-text-tertiary mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new stories'}
                  </p>
                  {searchQuery && (
                    <SpectralButton variant="secondary" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </SpectralButton>
                  )}
                </div>
              )}
              
              {/* Load More */}
              {hasMore && stories.length > 0 && (
                <div className="text-center mt-12">
                  <SpectralButton
                    variant="secondary"
                    onClick={() => setPage(p => p + 1)}
                    loading={loadingMore}
                    icon={loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  >
                    Load More Stories
                  </SpectralButton>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </VoidBackground>
  );
}
