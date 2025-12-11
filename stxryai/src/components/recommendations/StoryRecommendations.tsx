'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  genre: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rating: number;
  readCount: number;
  duration: string;
  tags: string[];
  isPremium?: boolean;
  matchScore?: number; // 0-100 how well it matches user preferences
  matchReason?: string;
}

interface RecommendationSection {
  title: string;
  description: string;
  icon: string;
  stories: Story[];
  color: string;
}

interface StoryRecommendationsProps {
  sections?: RecommendationSection[];
  variant?: 'full' | 'compact';
}

const defaultSections: RecommendationSection[] = [
  {
    title: 'Recommended For You',
    description: 'Based on your reading history',
    icon: '✨',
    color: 'from-purple-600 to-pink-600',
    stories: [],
  },
  {
    title: 'Continue Reading',
    description: 'Pick up where you left off',
    icon: '📖',
    color: 'from-blue-600 to-cyan-600',
    stories: [],
  },
  {
    title: 'Trending Now',
    description: 'Popular stories this week',
    icon: '🔥',
    color: 'from-orange-600 to-red-600',
    stories: [],
  },
];

export default function StoryRecommendations({
  sections = defaultSections,
  variant = 'full'
}: StoryRecommendationsProps) {
  const [activeSection, setActiveSection] = useState(0);

  if (variant === 'compact') {
    return <CompactRecommendations sections={sections} />;
  }

  return (
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => (
        <motion.div
          key={sectionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-2xl`}>
                {section.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                <p className="text-sm text-gray-400">{section.description}</p>
              </div>
            </div>
            <Link href="/story-library">
              <button className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                See All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>

          {/* Stories Grid */}
          {section.stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.stories.slice(0, 3).map((story, index) => (
                <RecommendedStoryCard
                  key={story.id}
                  story={story}
                  index={index}
                  sectionColor={section.color}
                />
              ))}
            </div>
          ) : (
            <EmptyRecommendations sectionTitle={section.title} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function RecommendedStoryCard({
  story,
  index,
  sectionColor
}: {
  story: Story;
  index: number;
  sectionColor: string;
}) {
  const difficultyColors = {
    easy: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    hard: 'text-red-400 bg-red-400/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Match Score Badge */}
      {story.matchScore && story.matchScore > 80 && (
        <div className="absolute top-4 right-4 z-10">
          <div className={`px-3 py-1 bg-gradient-to-r ${sectionColor} text-white text-xs font-bold rounded-full shadow-lg`}>
            {story.matchScore}% Match
          </div>
        </div>
      )}

      {/* Premium Badge */}
      {story.isPremium && (
        <div className="absolute top-4 left-4 z-10">
          <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
            <span>✨</span>
            Premium
          </div>
        </div>
      )}

      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
        {story.coverImage ? (
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📖
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
          {story.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {story.description}
        </p>

        {/* Match Reason */}
        {story.matchReason && (
          <div className="mb-4 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-xs text-purple-300">
              <span className="font-semibold">Why?</span> {story.matchReason}
            </p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 ${difficultyColors[story.difficulty]} text-xs font-medium rounded-full`}>
            {story.difficulty}
          </span>
          <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full">
            {story.genre}
          </span>
          {story.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              ⭐ {story.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              👁️ {story.readCount >= 1000 ? `${(story.readCount / 1000).toFixed(1)}K` : story.readCount}
            </span>
          </div>
          <span>🕐 {story.duration}</span>
        </div>

        {/* Action Button */}
        <Link href={`/story-reader?id=${story.id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full px-4 py-2.5 bg-gradient-to-r ${sectionColor} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200`}
          >
            Start Reading
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

function CompactRecommendations({ sections }: { sections: RecommendationSection[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const activeSection = sections[activeTab];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === index
                ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.title}
          </button>
        ))}
      </div>

      {/* Stories List */}
      <div className="space-y-3">
        {activeSection.stories.length > 0 ? (
          activeSection.stories.slice(0, 4).map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900 to-indigo-900 flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden">
                {story.coverImage ? (
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  '📖'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-1 truncate">{story.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-1">{story.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">⭐ {story.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">• {story.duration}</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-sm">No recommendations yet</p>
          </div>
        )}
      </div>

      {activeSection.stories.length > 4 && (
        <Link href="/story-library">
          <button className="w-full mt-4 px-4 py-2 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200">
            View All
          </button>
        </Link>
      )}
    </div>
  );
}

function EmptyRecommendations({ sectionTitle }: { sectionTitle: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
      <div className="text-6xl mb-4">📚</div>
      <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Yet</h3>
      <p className="text-gray-400 mb-6">
        {sectionTitle === 'Continue Reading'
          ? 'Start reading some stories to see them here!'
          : 'Read more stories to get personalized recommendations.'}
      </p>
      <Link href="/story-library">
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg">
          Explore Library
        </button>
      </Link>
    </div>
  );
}
