'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SearchFilters {
  genres: string[];
  difficulty: ('easy' | 'medium' | 'hard')[];
  duration: { min: number; max: number };
  rating: { min: number; max: number };
  isPremium: boolean | null;
  sortBy: 'relevance' | 'popularity' | 'rating' | 'recent' | 'trending';
  tags: string[];
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  author: {
    username: string;
    displayName: string;
  };
  genre: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rating: number;
  reviews: number;
  duration: string;
  isPremium: boolean;
  tags: string[];
  views: number;
}

interface AdvancedSearchProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  results?: SearchResult[];
  isLoading?: boolean;
}

const availableGenres = [
  'Sci-Fi', 'Fantasy', 'Mystery', 'Romance', 'Horror',
  'Thriller', 'Adventure', 'Historical', 'Comedy', 'Drama'
];

const popularTags = [
  'AI', 'Magic', 'Time Travel', 'Detective', 'Dragons',
  'Space', 'Medieval', 'Post-Apocalyptic', 'Supernatural', 'Cyberpunk'
];

export default function AdvancedSearch({
  onSearch,
  results = [],
  isLoading = false,
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    genres: [],
    difficulty: [],
    duration: { min: 0, max: 120 },
    rating: { min: 0, max: 5 },
    isPremium: null,
    sortBy: 'relevance',
    tags: [],
  });

  const handleSearch = () => {
    onSearch?.(query, filters);
  };

  const toggleGenre = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const toggleDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    setFilters(prev => ({
      ...prev,
      difficulty: prev.difficulty.includes(difficulty)
        ? prev.difficulty.filter(d => d !== difficulty)
        : [...prev.difficulty, difficulty]
    }));
  };

  const resetFilters = () => {
    setFilters({
      genres: [],
      difficulty: [],
      duration: { min: 0, max: 120 },
      rating: { min: 0, max: 5 },
      isPremium: null,
      sortBy: 'relevance',
      tags: [],
    });
  };

  const activeFilterCount =
    filters.genres.length +
    filters.difficulty.length +
    filters.tags.length +
    (filters.isPremium !== null ? 1 : 0);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for stories, authors, or tags..."
            className="w-full px-6 py-4 pl-14 pr-32 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-600 focus:outline-none text-lg"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl">
            🔍
          </div>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                showFilters
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Filters
              {activeFilterCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </div>
              )}
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Search
            </motion.button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6">
              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {['relevance', 'popularity', 'rating', 'recent', 'trending'].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setFilters(prev => ({ ...prev, sortBy: sort as any }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.sortBy === sort
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {availableGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filters.genres.includes(genre)
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => toggleDifficulty(diff as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.difficulty.includes(diff as any)
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Popular Tags</label>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filters.tags.includes(tag)
                          ? 'bg-pink-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Minimum Rating: {filters.rating.min} ⭐
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.rating.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    rating: { ...prev.rating, min: parseFloat(e.target.value) }
                  }))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Duration: {filters.duration.min} - {filters.duration.max} min
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={filters.duration.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      duration: { ...prev.duration, min: parseInt(e.target.value) }
                    }))}
                    className="flex-1 accent-purple-600"
                  />
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={filters.duration.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      duration: { ...prev.duration, max: parseInt(e.target.value) }
                    }))}
                    className="flex-1 accent-purple-600"
                  />
                </div>
              </div>

              {/* Premium Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Content Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, isPremium: null }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.isPremium === null
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, isPremium: false }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.isPremium === false
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Free Only
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, isPremium: true }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.isPremium === true
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Premium Only
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <div>
        {isLoading ? (
          <SearchLoadingSkeleton />
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
              </h3>
            </div>
            <div className="space-y-4">
              {results.map((result, index) => (
                <SearchResultCard key={result.id} result={result} index={index} />
              ))}
            </div>
          </div>
        ) : query ? (
          <EmptySearchResults query={query} />
        ) : null}
      </div>
    </div>
  );
}

// Search Result Card
function SearchResultCard({ result, index }: { result: SearchResult; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:bg-white/10 group"
    >
      <div className="flex gap-4">
        {/* Cover Image */}
        <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
          {result.coverImage ? (
            <img src={result.coverImage} alt={result.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
              {result.title}
            </h3>
            {result.isPremium && (
              <span className="px-2 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                ✨ Premium
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-2">
            by <span className="text-gray-300 font-medium">{result.author.displayName}</span>
          </p>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {result.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              result.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
              result.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
              'bg-red-600/20 text-red-400'
            }`}>
              {result.difficulty}
            </span>
            <span className="px-2 py-1 bg-white/10 text-gray-300 rounded-full text-xs">
              {result.genre}
            </span>
            {result.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>⭐ {result.rating.toFixed(1)} ({result.reviews})</span>
            <span>👁️ {result.views.toLocaleString()}</span>
            <span>🕐 {result.duration}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Empty Search Results
function EmptySearchResults({ query }: { query: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
      <p className="text-gray-400 mb-6">
        No stories found for "{query}". Try different keywords or adjust your filters.
      </p>
    </div>
  );
}

// Loading Skeleton
function SearchLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-24 h-32 bg-white/10 rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-white/10 rounded w-2/3" />
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
