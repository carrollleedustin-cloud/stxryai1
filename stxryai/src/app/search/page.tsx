'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, ParticleField } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import Icon from '@/components/ui/AppIcon';

// Mock search results
const MOCK_STORIES = [
  {
    id: '1',
    title: 'The Midnight Carnival',
    author: 'Alexandra Chen',
    cover: 'https://images.pexels.com/photos/1983046/pexels-photo-1983046.jpeg',
    genre: 'Horror',
    rating: 4.8,
    reads: 15420,
    description: 'Step into a carnival that only appears at midnight, where every attraction hides a terrifying secret...',
  },
  {
    id: '2',
    title: 'Echoes of Tomorrow',
    author: 'Marcus Rodriguez',
    cover: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
    genre: 'Sci-Fi',
    rating: 4.6,
    reads: 12890,
    description: 'In a world where memories can be shared, one scientist discovers echoes of a future that must never happen...',
  },
  {
    id: '3',
    title: 'The Last Kingdom',
    author: 'Emily Watson',
    cover: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg',
    genre: 'Fantasy',
    rating: 4.9,
    reads: 23450,
    description: 'A fallen prince must reclaim his throne in a world where magic comes at the ultimate price...',
  },
  {
    id: '4',
    title: 'Digital Dreams',
    author: 'Sarah Johnson',
    cover: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    genre: 'Cyberpunk',
    rating: 4.7,
    reads: 18760,
    description: 'In the neon-soaked streets of Neo Tokyo, a hacker uncovers a conspiracy that blurs the line between reality and simulation...',
  },
  {
    id: '5',
    title: 'Whispers in the Dark',
    author: 'David Kim',
    cover: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
    genre: 'Mystery',
    rating: 4.5,
    reads: 9870,
    description: 'A detective investigates a series of disappearances in a small town where everyone has something to hide...',
  },
  {
    id: '6',
    title: 'Heart of the Storm',
    author: 'Jessica Williams',
    cover: 'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg',
    genre: 'Romance',
    rating: 4.4,
    reads: 21340,
    description: 'Two storm chasers find love in the most unlikely places as they pursue the perfect storm across the plains...',
  },
];

const GENRES = ['All', 'Horror', 'Sci-Fi', 'Fantasy', 'Cyberpunk', 'Mystery', 'Romance', 'Thriller', 'Adventure'];

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'reads' | 'newest'>('relevance');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setSearchQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter and sort results
  const filteredResults = MOCK_STORIES.filter(story => {
    const matchesQuery = query === '' || 
      story.title.toLowerCase().includes(query.toLowerCase()) ||
      story.author.toLowerCase().includes(query.toLowerCase()) ||
      story.description.toLowerCase().includes(query.toLowerCase()) ||
      story.genre.toLowerCase().includes(query.toLowerCase());
    
    const matchesGenre = selectedGenre === 'All' || story.genre === selectedGenre;
    
    return matchesQuery && matchesGenre;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'reads':
        return b.reads - a.reads;
      default:
        return 0;
    }
  });

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-t-4 border-spectral-cyan border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl text-text-primary">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
      <VoidBackground variant="subtle" />
      <ParticleField particleCount={40} color="rgba(0, 245, 212, 0.2)" maxSize={2} />
      <EtherealNav />

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <RevealOnScroll>
          <div className="text-center mb-12">
            <TemporalHeading level={1} accent className="mb-4">
              Explore Stories
            </TemporalHeading>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto font-body">
              {query ? `Searching for "${query}"` : 'Discover your next adventure'}
            </p>
          </div>
        </RevealOnScroll>

        {/* Search Bar */}
        <RevealOnScroll threshold={0.1}>
          <form onSubmit={handleSearch} className="mb-8">
            <GradientBorder className="p-1 rounded-xl max-w-2xl mx-auto">
              <div className="flex items-center bg-void-100/50 rounded-xl overflow-hidden">
                <div className="flex-1 flex items-center px-4">
                  <Icon name="SearchIcon" className="text-text-secondary mr-3" size={22} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stories, authors, genres..."
                    className="w-full py-4 bg-transparent text-text-primary placeholder-text-secondary focus:outline-none text-lg"
                  />
                </div>
                <SpectralButton type="submit" variant="primary" className="m-2 px-6 py-3">
                  <Icon name="SearchIcon" className="mr-2" size={18} />
                  Search
                </SpectralButton>
              </div>
            </GradientBorder>
          </form>
        </RevealOnScroll>

        {/* Filters */}
        <RevealOnScroll threshold={0.1}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Genre Pills */}
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGenre === genre
                      ? 'bg-spectral-cyan text-void-900'
                      : 'bg-void-100/30 text-text-secondary hover:bg-void-100/50 border border-void-border'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 rounded-lg bg-void-100/30 border border-void-border text-text-primary focus:outline-none focus:border-spectral-cyan"
            >
              <option value="relevance">Most Relevant</option>
              <option value="rating">Highest Rated</option>
              <option value="reads">Most Read</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </RevealOnScroll>

        {/* Results Count */}
        <RevealOnScroll threshold={0.1}>
          <div className="mb-6 text-text-secondary">
            Found <span className="text-spectral-cyan font-bold">{filteredResults.length}</span> stories
            {query && <> matching "<span className="text-aurora">{query}</span>"</>}
          </div>
        </RevealOnScroll>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredResults.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                layout
              >
                <div 
                  className="h-full group cursor-pointer" 
                  onClick={() => router.push(`/story-reader?id=${story.id}`)}
                >
                  <HolographicCard className="h-full">
                    <div className="relative overflow-hidden rounded-t-xl">
                      <img
                        src={story.cover}
                        alt={story.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void-900/90 via-void-900/30 to-transparent" />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-spectral-cyan/20 backdrop-blur-sm border border-spectral-cyan/50 text-spectral-cyan text-xs font-medium">
                        {story.genre}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-xl font-bold text-white mb-1">{story.title}</h3>
                        <p className="text-sm text-white/80">by {story.author}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                        {story.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center text-amber-400">
                            <Icon name="StarIcon" className="mr-1" size={16} />
                            <span className="font-medium">{story.rating}</span>
                          </div>
                          <div className="flex items-center text-text-secondary">
                            <Icon name="EyeIcon" className="mr-1" size={16} />
                            <span>{(story.reads / 1000).toFixed(1)}K</span>
                          </div>
                        </div>
                        
                        <SpectralButton variant="secondary" className="px-4 py-2 text-sm">
                          <Icon name="BookOpenIcon" className="mr-1" size={14} />
                          Read
                        </SpectralButton>
                      </div>
                    </div>
                  </HolographicCard>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredResults.length === 0 && (
          <RevealOnScroll>
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-aurora mb-2">No Stories Found</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                We couldn't find any stories matching your search. Try different keywords or browse all stories.
              </p>
              <div className="flex justify-center gap-4">
                <SpectralButton onClick={() => { setSearchQuery(''); setSelectedGenre('All'); router.push('/search'); }}>
                  <Icon name="RefreshCwIcon" className="mr-2" size={18} />
                  Clear Filters
                </SpectralButton>
                <SpectralButton href="/story-library" variant="primary">
                  <Icon name="BookOpenIcon" className="mr-2" size={18} />
                  Browse Library
                </SpectralButton>
              </div>
            </div>
          </RevealOnScroll>
        )}

        {/* Load More */}
        {filteredResults.length > 0 && (
          <RevealOnScroll threshold={0.1}>
            <div className="text-center mt-12">
              <SpectralButton variant="secondary" className="px-8 py-3">
                <Icon name="PlusIcon" className="mr-2" size={18} />
                Load More Stories
              </SpectralButton>
            </div>
          </RevealOnScroll>
        )}

        {/* Suggestions */}
        <RevealOnScroll threshold={0.1}>
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-aurora mb-6 text-center">Popular Searches</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['Horror', 'Sci-Fi', 'Mystery', 'Fantasy', 'Cyberpunk', 'Romance', 'Thriller', 'Dark Fantasy', 'Space Opera', 'Detective'].map(term => (
                <button
                  key={term}
                  onClick={() => { setSearchQuery(term); router.push(`/search?q=${term}`); }}
                  className="px-4 py-2 rounded-full bg-void-100/30 border border-void-border text-text-secondary hover:text-spectral-cyan hover:border-spectral-cyan transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-spectral-cyan border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-xl text-text-primary">Loading...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
