'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface TrendingStory {
  id: string;
  title: string;
  author: string;
  genre: string;
  reads: number;
  rating: number;
  thumbnail: string;
  gradient: string;
  tags: string[];
  excerpt: string;
}

export default function TrendingStoriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const trendingStories: TrendingStory[] = [
    {
      id: '1',
      title: 'Echoes of Tomorrow',
      author: 'Sarah Chen',
      genre: 'Sci-Fi',
      reads: 125000,
      rating: 4.8,
      thumbnail: '/images/stories/scifi-1.jpg',
      gradient: 'from-cyan-500 via-blue-500 to-purple-600',
      tags: ['Time Travel', 'AI', 'Thriller'],
      excerpt: 'When a quantum physicist discovers messages from the future, she must decide whether to prevent a catastrophe or preserve the timeline.',
    },
    {
      id: '2',
      title: 'The Last Dragonkeep',
      author: 'Marcus Thor',
      genre: 'Fantasy',
      reads: 98000,
      rating: 4.9,
      thumbnail: '/images/stories/fantasy-1.jpg',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      tags: ['Dragons', 'Magic', 'Adventure'],
      excerpt: 'A forgotten heir must unite the dragon clans before an ancient evil rises to consume the realm.',
    },
    {
      id: '3',
      title: 'Neon Shadows',
      author: 'Kai Rodriguez',
      genre: 'Cyberpunk',
      reads: 156000,
      rating: 4.7,
      thumbnail: '/images/stories/cyberpunk-1.jpg',
      gradient: 'from-pink-500 via-purple-500 to-indigo-600',
      tags: ['Cyberpunk', 'Noir', 'Hacking'],
      excerpt: 'In a city where memories can be bought and sold, a rogue hacker uncovers a conspiracy that could rewrite reality itself.',
    },
    {
      id: '4',
      title: 'Hearts in the Highlands',
      author: 'Emma Blake',
      genre: 'Romance',
      reads: 203000,
      rating: 4.6,
      thumbnail: '/images/stories/romance-1.jpg',
      gradient: 'from-rose-400 via-pink-400 to-red-500',
      tags: ['Romance', 'Historical', 'Drama'],
      excerpt: 'A modern doctor finds herself trapped in 18th century Scotland, where she must choose between returning home or fighting for true love.',
    },
    {
      id: '5',
      title: 'The Silent Witness',
      author: 'Detective James Miller',
      genre: 'Mystery',
      reads: 87000,
      rating: 4.8,
      thumbnail: '/images/stories/mystery-1.jpg',
      gradient: 'from-gray-600 via-slate-700 to-zinc-800',
      tags: ['Mystery', 'Crime', 'Suspense'],
      excerpt: 'A mute witness to a murder holds the key to solving the city\'s most baffling case, if only she could tell her story.',
    },
  ];

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % trendingStories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, trendingStories.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % trendingStories.length);
    setAutoPlay(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + trendingStories.length) % trendingStories.length);
    setAutoPlay(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const currentStory = trendingStories[currentIndex];

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-background/80 to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trending Stories
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the most popular interactive stories loved by our community
          </p>
        </motion.div>

        {/* Main Featured Story */}
        <div className="relative mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Story Image/Gradient */}
                <div className={`relative h-96 md:h-auto bg-gradient-to-br ${currentStory.gradient}`}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center">
                      <motion.div
                        className="text-8xl md:text-9xl mb-4"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 0.8 }}
                      >
                        {currentStory.genre === 'Sci-Fi' ? '🚀' :
                         currentStory.genre === 'Fantasy' ? '🐉' :
                         currentStory.genre === 'Cyberpunk' ? '🌃' :
                         currentStory.genre === 'Romance' ? '💖' : '🔍'}
                      </motion.div>
                      <motion.div
                        className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        #{currentIndex + 1} Trending in {currentStory.genre}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Story Details */}
                <div className="p-8 md:p-12 flex flex-col justify-between">
                  <div>
                    <motion.h3
                      className="text-3xl md:text-4xl font-bold mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {currentStory.title}
                    </motion.h3>

                    <motion.p
                      className="text-muted-foreground mb-6 flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span>by</span>
                      <span className="font-semibold text-foreground">{currentStory.author}</span>
                    </motion.p>

                    <motion.p
                      className="text-foreground/90 leading-relaxed mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {currentStory.excerpt}
                    </motion.p>

                    {/* Tags */}
                    <motion.div
                      className="flex flex-wrap gap-2 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {currentStory.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                      className="flex items-center gap-6 mb-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📖</span>
                        <div>
                          <div className="text-lg font-bold">{formatNumber(currentStory.reads)}</div>
                          <div className="text-xs text-muted-foreground">Reads</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <div>
                          <div className="text-lg font-bold">{currentStory.rating}</div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Link href={`/story/${currentStory.id}`}>
                      <motion.button
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Start Reading →
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
          >
            →
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="flex justify-center gap-3 overflow-x-auto pb-4">
          {trendingStories.map((story, index) => (
            <motion.button
              key={story.id}
              onClick={() => {
                setCurrentIndex(index);
                setAutoPlay(false);
              }}
              className={`flex-shrink-0 transition-all ${
                currentIndex === index
                  ? 'ring-4 ring-primary scale-110'
                  : 'opacity-50 hover:opacity-100'
              }`}
              whileHover={{ scale: currentIndex === index ? 1.1 : 1.05 }}
            >
              <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${story.gradient} flex items-center justify-center text-3xl`}>
                {story.genre === 'Sci-Fi' ? '🚀' :
                 story.genre === 'Fantasy' ? '🐉' :
                 story.genre === 'Cyberpunk' ? '🌃' :
                 story.genre === 'Romance' ? '💖' : '🔍'}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {trendingStories.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                currentIndex === index ? 'w-8 bg-primary' : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
