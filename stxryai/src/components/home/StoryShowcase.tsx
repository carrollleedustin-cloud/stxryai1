'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Story {
  id: number;
  title: string;
  author: string;
  genre: string;
  banner: string;
  description: string;
  rating: number;
  readers: string;
  chapters: number;
}

export function StoryShowcase() {
  const [activeStory, setActiveStory] = useState(0);
  const [hoveredStory, setHoveredStory] = useState<number | null>(null);

  const stories: Story[] = [
    {
      id: 1,
      title: 'The Quantum Paradox',
      author: 'Alex Chen',
      genre: 'Sci-Fi',
      banner: '/1.jpg',
      description: 'A mind-bending journey through time and space where reality itself is at stake.',
      rating: 4.8,
      readers: '12.5K',
      chapters: 24,
    },
    {
      id: 2,
      title: 'Shadows of Eternity',
      author: 'Sarah Night',
      genre: 'Fantasy',
      banner: '/2.jpg',
      description:
        'Enter a world of magic and mystery where ancient powers awaken from their slumber.',
      rating: 4.9,
      readers: '18.2K',
      chapters: 32,
    },
    {
      id: 3,
      title: 'Neon Dreams',
      author: 'Marcus Volt',
      genre: 'Cyberpunk',
      banner: '/3.jpg',
      description: 'In a dystopian future, one hacker discovers the truth behind the simulation.',
      rating: 4.7,
      readers: '9.8K',
      chapters: 20,
    },
    {
      id: 4,
      title: 'The Last Summoner',
      author: 'Luna Star',
      genre: 'Adventure',
      banner: '/4.jpg',
      description:
        'When all magic fades, one final summoner must restore balance to the realm.',
      rating: 4.6,
      readers: '14.1K',
      chapters: 28,
    },
    {
      id: 5,
      title: 'Crimson Eclipse',
      author: 'Victoria Dark',
      genre: 'Mystery',
      banner: '/5.jpg',
      description: 'A detective races against time to solve murders that defy all logic.',
      rating: 4.8,
      readers: '11.3K',
      chapters: 18,
    },
    {
      id: 6,
      title: 'Stellar Horizon',
      author: 'James Cosmos',
      genre: 'Space Opera',
      banner: '/6.jpg',
      description:
        'Explore the galaxy in an epic tale of war, diplomacy, and cosmic discoveries.',
      rating: 4.9,
      readers: '22.7K',
      chapters: 40,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % stories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Featured Stories
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Immerse yourself in the most captivating interactive adventures
          </p>
        </motion.div>

        {/* Featured Story Carousel */}
        <div className="relative mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStory}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="relative h-[600px] rounded-3xl overflow-hidden group cursor-pointer"
              onClick={() =>
                (window.location.href = `/stories/${stories[activeStory].id}`)
              }
            >
              {/* Banner Image */}
              <Image
                src={stories[activeStory].banner}
                alt={stories[activeStory].title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-pink-900/40" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-2 bg-purple-600/80 backdrop-blur-sm rounded-full text-sm font-bold">
                      {stories[activeStory].genre}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-xl">⭐</span>
                      <span className="text-white font-bold">
                        {stories[activeStory].rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span>👥</span>
                      <span>{stories[activeStory].readers} readers</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span>📖</span>
                      <span>{stories[activeStory].chapters} chapters</span>
                    </div>
                  </div>

                  <h3 className="text-5xl font-black text-white mb-4">
                    {stories[activeStory].title}
                  </h3>

                  <p className="text-xl text-gray-300 mb-2">
                    by {stories[activeStory].author}
                  </p>

                  <p className="text-lg text-gray-400 mb-8 max-w-3xl">
                    {stories[activeStory].description}
                  </p>

                  <motion.button
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Reading →
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <div className="absolute bottom-8 right-8 flex gap-2 z-20">
            {stories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStory(idx)}
                className={`h-2 rounded-full transition-all ${
                  activeStory === idx ? 'w-12 bg-purple-500' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.slice(0, 6).map((story, idx) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onHoverStart={() => setHoveredStory(story.id)}
              onHoverEnd={() => setHoveredStory(null)}
              className="group cursor-pointer"
            >
              <div className="relative h-80 rounded-2xl overflow-hidden mb-4">
                <Image
                  src={story.banner}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Hover Overlay */}
                <AnimatePresence>
                  {hoveredStory === story.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/50 to-transparent flex items-end p-6"
                    >
                      <div>
                        <p className="text-white text-sm mb-4">{story.description}</p>
                        <button className="px-6 py-2 bg-white text-purple-900 font-bold rounded-full hover:bg-gray-100 transition-colors">
                          Read Now
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Genre Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-purple-600/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                    {story.genre}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-white text-sm font-bold">{story.rating}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {story.title}
              </h3>

              <p className="text-gray-400 text-sm mb-2">by {story.author}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>👥 {story.readers}</span>
                <span>📖 {story.chapters} chapters</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link href="/browse">
            <motion.button
              className="px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse All Stories →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
