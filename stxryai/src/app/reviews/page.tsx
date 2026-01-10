'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, StaggerContainer, StaggerItem } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

// Mock data
const MOCK_REVIEWS = [
  {
    id: '1',
    story: {
      id: 'story-1',
      title: 'The Midnight Carnival',
      cover: 'https://img.rocket.new/generatedImages/rocket_gen_img_1db6afbd8-1764938885435.png',
      genre: 'Horror',
    },
    author: {
      name: 'Alexandra Chen',
      username: 'darkstoryteller',
      avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f211366-1764756733705.png',
    },
    rating: 5,
    title: 'A masterpiece of horror storytelling',
    content:
      'This story completely captivated me from the first chapter. The way the choices branched out created a sense of genuine dread - I never knew what was lurking around the next corner. The atmosphere is incredibly immersive, and the writing quality is top-notch. Highly recommend for anyone who loves psychological horror.',
    likes: 234,
    comments: 45,
    date: '2024-12-20',
    helpful: 89,
    featured: true,
  },
  {
    id: '2',
    story: {
      id: 'story-2',
      title: 'Echoes of Tomorrow',
      cover: 'https://img.rocket.new/generatedImages/rocket_gen_img_183a032ac-1764646537259.png',
      genre: 'Sci-Fi',
    },
    author: {
      name: 'Marcus Rodriguez',
      username: 'scifiexplorer',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    },
    rating: 4,
    title: 'Thought-provoking sci-fi with great world-building',
    content:
      'The world-building in this story is exceptional. Each choice feels meaningful and the consequences are well thought out. My only minor criticism is that some branches feel shorter than others. Still, a solid sci-fi experience that makes you think about the future of humanity.',
    likes: 156,
    comments: 28,
    date: '2024-12-19',
    helpful: 67,
    featured: false,
  },
  {
    id: '3',
    story: {
      id: 'story-3',
      title: 'The Last Kingdom',
      cover: 'https://img.rocket.new/generatedImages/rocket_gen_img_138fc9e37-1764938880707.png',
      genre: 'Fantasy',
    },
    author: {
      name: 'Emily Watson',
      username: 'mysteryreader',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    },
    rating: 5,
    title: 'Epic fantasy that rivals published novels',
    content:
      "I've read many interactive stories, but this one stands out. The character development is incredible - by the end, I genuinely cared about the fate of the kingdom. The multiple endings give great replay value. This is the kind of story that makes you want to explore every possible path.",
    likes: 312,
    comments: 67,
    date: '2024-12-18',
    helpful: 124,
    featured: true,
  },
  {
    id: '4',
    story: {
      id: 'story-4',
      title: 'Whispers in the Dark',
      cover: 'https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg',
      genre: 'Mystery',
    },
    author: {
      name: 'David Kim',
      username: 'fantasyfan',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    },
    rating: 4,
    title: 'A clever mystery with satisfying twists',
    content:
      'The detective work in this story is engaging. I loved piecing together the clues and the branching paths actually affected how you could solve the mystery. The writing keeps you guessing until the very end. Would love to see more mysteries from this author.',
    likes: 98,
    comments: 19,
    date: '2024-12-17',
    helpful: 45,
    featured: false,
  },
  {
    id: '5',
    story: {
      id: 'story-5',
      title: 'Digital Dreams',
      cover: 'https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg',
      genre: 'Cyberpunk',
    },
    author: {
      name: 'Sarah Johnson',
      username: 'horrorfanatic',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    },
    rating: 5,
    title: 'Cyberpunk perfection - immersive and thrilling',
    content:
      'The neon-soaked world of Digital Dreams pulled me in completely. Every choice felt like it had weight, and the hacking minigames between chapters were a nice touch. The story explores themes of identity and technology in a way that feels relevant. A must-read for cyberpunk fans.',
    likes: 178,
    comments: 34,
    date: '2024-12-16',
    helpful: 78,
    featured: false,
  },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'rating-high', label: 'Highest Rated' },
  { value: 'rating-low', label: 'Lowest Rated' },
];

const ReviewsPage: React.FC = () => {
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const sortedReviews = [...MOCK_REVIEWS]
    .filter((review) => !filterRating || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.helpful - a.helpful;
        case 'likes':
          return b.likes - a.likes;
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="StarIcon"
            size={size === 'sm' ? 16 : 20}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-void-600'}
          />
        ))}
      </div>
    );
  };

  return (
    <VoidBackground variant="aurora">
      <EtherealNav />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <RevealOnScroll>
            <div className="text-center mb-12">
              <TemporalHeading level={2} accent className="mb-4">
                Community Reviews
              </TemporalHeading>
              <p className="text-xl text-void-400 max-w-2xl mx-auto">
                Discover what fellow readers think about the latest stories
              </p>
            </div>
          </RevealOnScroll>

          {/* Filters & Sort */}
          <RevealOnScroll delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => setFilterRating(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterRating === null
                      ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/50'
                      : 'bg-void-900/50 text-void-400 border border-void-700/50 hover:border-spectral-cyan/30'
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating === filterRating ? null : rating)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      filterRating === rating
                        ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/50'
                        : 'bg-void-900/50 text-void-400 border border-void-700/50 hover:border-spectral-cyan/30'
                    }`}
                  >
                    {rating}
                    <Icon name="StarIcon" size={14} className="text-yellow-400" />
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-void-900/50 border border-void-700/50 rounded-lg text-void-200 focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </RevealOnScroll>

          {/* Reviews List */}
          <StaggerContainer className="space-y-6">
            {sortedReviews.map((review) => (
              <StaggerItem key={review.id}>
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    {/* Featured Badge */}
                    {review.featured && (
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium border border-yellow-500/30">
                          <Icon name="SparklesIcon" size={14} />
                          Featured Review
                        </span>
                      </div>
                    )}

                    {/* Story Info */}
                    <div className="flex gap-4 mb-4">
                      <Link href={`/story-reader?id=${review.story.id}`}>
                        <motion.div
                          className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                        >
                          <img
                            src={review.story.cover}
                            alt={review.story.title}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      </Link>
                      <div className="flex-1">
                        <Link href={`/story-reader?id=${review.story.id}`}>
                          <h3 className="font-semibold text-void-100 hover:text-spectral-cyan transition-colors">
                            {review.story.title}
                          </h3>
                        </Link>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-spectral-cyan/10 text-spectral-cyan text-xs mt-1">
                          {review.story.genre}
                        </span>
                        <div className="mt-2 flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-void-400">({review.rating}/5)</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <h4 className="text-lg font-semibold text-void-100 mb-2">{review.title}</h4>
                    <p className="text-void-300 leading-relaxed mb-4">{review.content}</p>

                    {/* Author & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-void-800/50">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.author.avatar}
                          alt={review.author.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-void-200">{review.author.name}</p>
                          <p className="text-sm text-void-500">
                            @{review.author.username} • {review.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-sm text-void-400 hover:text-spectral-cyan transition-colors">
                          <Icon name="HandThumbUpIcon" size={18} />
                          <span>{review.helpful} helpful</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-void-400 hover:text-spectral-pink transition-colors">
                          <Icon name="HeartIcon" size={18} />
                          <span>{review.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-void-400 hover:text-spectral-violet transition-colors">
                          <Icon name="ChatBubbleLeftIcon" size={18} />
                          <span>{review.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </GradientBorder>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Load More */}
          <RevealOnScroll delay={0.2}>
            <div className="text-center mt-12">
              <SpectralButton variant="ghost" size="lg">
                Load More Reviews
                <Icon name="ChevronDownIcon" size={20} className="ml-2" />
              </SpectralButton>
            </div>
          </RevealOnScroll>

          {/* Write Review CTA */}
          <RevealOnScroll delay={0.3}>
            <div className="mt-16 text-center">
              <div className="max-w-xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-spectral-cyan/10 via-spectral-violet/10 to-spectral-pink/10 border border-spectral-cyan/20">
                <Icon
                  name="PencilSquareIcon"
                  size={48}
                  className="text-spectral-cyan mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold text-void-100 mb-2">Share Your Thoughts</h3>
                <p className="text-void-400 mb-6">
                  Read a great story recently? Help others discover amazing narratives by writing a
                  review.
                </p>
                <SpectralButton variant="primary" size="lg">
                  Write a Review
                </SpectralButton>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </main>
    </VoidBackground>
  );
};

export default ReviewsPage;
