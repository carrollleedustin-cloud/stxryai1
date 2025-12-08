'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import StoryCard from './StoryCard';
import { storyService } from '@/services/storyService';
import { useAuth } from '@/contexts/AuthContext';

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
      alert('This is a premium story. Please upgrade your subscription to access it.');
      return;
    }
    router.push(`/story-reader?storyId=${storyId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Story Library</h1>
            <button
              onClick={() => router.push('/user-dashboard')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Dashboard
            </button>
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
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No stories found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onClick={() => handleStoryClick(story.id, story.is_premium)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}