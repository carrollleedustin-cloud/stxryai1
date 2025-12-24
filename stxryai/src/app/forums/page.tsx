'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, StaggerContainer, StaggerItem } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import { socialService } from '@/services/socialService';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock data for forums
const MOCK_CATEGORIES = [
  { id: '1', name: 'General Discussion', description: 'Talk about anything related to interactive stories', icon: 'ChatBubbleLeftRightIcon', threads: 2456, posts: 18920, color: 'from-spectral-cyan to-blue-500' },
  { id: '2', name: 'Story Recommendations', description: 'Share and discover amazing stories', icon: 'BookmarkIcon', threads: 1234, posts: 8765, color: 'from-spectral-violet to-purple-500' },
  { id: '3', name: 'Writing Tips & Craft', description: 'Improve your storytelling skills', icon: 'PencilSquareIcon', threads: 892, posts: 5643, color: 'from-spectral-pink to-pink-500' },
  { id: '4', name: 'Feedback & Reviews', description: 'Get and give constructive feedback', icon: 'ChatBubbleBottomCenterTextIcon', threads: 1567, posts: 12340, color: 'from-yellow-400 to-orange-500' },
  { id: '5', name: 'Community Events', description: 'Challenges, marathons, and competitions', icon: 'CalendarDaysIcon', threads: 345, posts: 2890, color: 'from-green-400 to-emerald-500' },
  { id: '6', name: 'Bug Reports & Support', description: 'Get help and report issues', icon: 'WrenchScrewdriverIcon', threads: 456, posts: 1890, color: 'from-red-400 to-rose-500' },
];

const MOCK_RECENT_THREADS = [
  { id: '1', title: 'What makes a great plot twist? Share your favorites!', category: 'General Discussion', author: { name: 'StoryMaster', avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f211366-1764756733705.png' }, replies: 156, views: 2340, lastActivity: '5 min ago', pinned: true, hot: true },
  { id: '2', title: 'December Reading Challenge: 10 Stories in 10 Days', category: 'Community Events', author: { name: 'BookClub', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' }, replies: 445, views: 8920, lastActivity: '12 min ago', pinned: true, hot: true },
  { id: '3', title: 'How to write compelling dialogue - A comprehensive guide', category: 'Writing Tips & Craft', author: { name: 'Wordsmith', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }, replies: 89, views: 1567, lastActivity: '25 min ago', pinned: false, hot: true },
  { id: '4', title: 'Looking for mystery recommendations!', category: 'Story Recommendations', author: { name: 'MysteryFan', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' }, replies: 67, views: 890, lastActivity: '1 hour ago', pinned: false, hot: false },
  { id: '5', title: 'The Midnight Carnival - Story Discussion (SPOILERS)', category: 'General Discussion', author: { name: 'HorrorLover', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }, replies: 234, views: 4521, lastActivity: '2 hours ago', pinned: false, hot: true },
  { id: '6', title: 'New feature request: Reading statistics export', category: 'Bug Reports & Support', author: { name: 'TechReader', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' }, replies: 23, views: 456, lastActivity: '3 hours ago', pinned: false, hot: false },
  { id: '7', title: 'Best sci-fi stories of 2024 - Community picks', category: 'Story Recommendations', author: { name: 'SciFiExplorer', avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg' }, replies: 178, views: 3890, lastActivity: '4 hours ago', pinned: false, hot: true },
  { id: '8', title: 'Character development tips for branching narratives', category: 'Writing Tips & Craft', author: { name: 'Novelist', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' }, replies: 45, views: 678, lastActivity: '5 hours ago', pinned: false, hot: false },
];

const ForumsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<'categories' | 'recent'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('');

  // Check for create parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === 'true' && user) {
      setShowNewThreadModal(true);
      // Clean up URL
      window.history.replaceState({}, '', '/forums');
    }
  }, [user]);

  const handleNewThread = () => {
    if (!user) {
      toast.error('Please sign in to create a thread');
      router.push('/authentication?redirect=/forums');
      return;
    }
    setShowNewThreadModal(true);
  };

  const handleSubmitThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim() || !newThreadCategory) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      toast.success('Thread created successfully!');
      setShowNewThreadModal(false);
      setNewThreadTitle('');
      setNewThreadContent('');
      setNewThreadCategory('');
    } catch (error) {
      toast.error('Failed to create thread');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredThreads = MOCK_RECENT_THREADS.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || thread.category === MOCK_CATEGORIES.find(c => c.id === selectedCategory)?.name;
    return matchesSearch && matchesCategory;
  });

  return (
    <VoidBackground variant="aurora">
      <EtherealNav />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <RevealOnScroll>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <TemporalHeading level={2} accent className="mb-2">
                  Forums
                </TemporalHeading>
                <p className="text-void-400">Join the conversation with fellow readers and writers</p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <SpectralButton variant="primary" size="md" onClick={handleNewThread}>
                  <Icon name="PlusIcon" size={16} className="mr-2" />
                  New Thread
                </SpectralButton>
              </div>
            </div>
          </RevealOnScroll>

          {/* Search & Filters */}
          <RevealOnScroll delay={0.1}>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-void-500" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-void-900/50 border border-void-700/50 rounded-xl text-void-200 placeholder-void-500 focus:border-spectral-cyan/50 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setActiveView('recent')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    activeView === 'recent'
                      ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/50'
                      : 'bg-void-900/50 text-void-400 border border-void-700/50 hover:border-spectral-cyan/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon name="ClockIcon" size={18} />
                  Recent
                </motion.button>
                <motion.button
                  onClick={() => setActiveView('categories')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    activeView === 'categories'
                      ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/50'
                      : 'bg-void-900/50 text-void-400 border border-void-700/50 hover:border-spectral-cyan/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon name="Squares2X2Icon" size={18} />
                  Categories
                </motion.button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeView === 'categories' ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RevealOnScroll delay={0.2}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_CATEGORIES.map((category) => (
                      <motion.div
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setActiveView('recent');
                        }}
                        className="cursor-pointer"
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <HolographicCard className="p-6 h-full">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                            <Icon name={category.icon} size={28} className="text-void-950" />
                          </div>
                          <h3 className="text-lg font-semibold text-void-100 mb-2">{category.name}</h3>
                          <p className="text-sm text-void-500 mb-4">{category.description}</p>
                          <div className="flex items-center gap-4 text-sm text-void-400">
                            <span className="flex items-center gap-1">
                              <Icon name="ChatBubbleLeftIcon" size={14} />
                              {category.threads.toLocaleString()} threads
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="DocumentTextIcon" size={14} />
                              {category.posts.toLocaleString()} posts
                            </span>
                          </div>
                        </HolographicCard>
                      </motion.div>
                    ))}
                  </div>
                </RevealOnScroll>
              </motion.div>
            ) : (
              <motion.div
                key="recent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category Filter Pills */}
                {selectedCategory && (
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm text-void-500">Filtering by:</span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-spectral-cyan/20 text-spectral-cyan text-sm border border-spectral-cyan/30">
                      {MOCK_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory(null)} className="hover:text-void-100">
                        <Icon name="XMarkIcon" size={14} />
                      </button>
                    </span>
                  </div>
                )}

                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-void-900/50 border-b border-void-700/50 text-void-400 text-sm font-medium">
                      <div className="col-span-6">Topic</div>
                      <div className="col-span-2 text-center">Replies</div>
                      <div className="col-span-2 text-center">Views</div>
                      <div className="col-span-2 text-right">Activity</div>
                    </div>

                    {/* Threads */}
                    <StaggerContainer className="divide-y divide-void-800/50">
                      {filteredThreads.map((thread) => (
                        <StaggerItem key={thread.id}>
                          <motion.div
                            className="p-4 md:p-6 hover:bg-void-900/30 transition-all cursor-pointer"
                            whileHover={{ x: 4 }}
                          >
                            <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                              {/* Topic */}
                              <div className="col-span-6 flex items-start gap-4">
                                <img
                                  src={thread.author.avatar}
                                  alt={thread.author.name}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    {thread.pinned && (
                                      <span className="px-2 py-0.5 rounded-full bg-spectral-violet/20 text-spectral-violet text-xs font-medium">
                                        📌 Pinned
                                      </span>
                                    )}
                                    {thread.hot && (
                                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                                        🔥 Hot
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded-full bg-void-800/50 text-void-400 text-xs">
                                      {thread.category}
                                    </span>
                                  </div>
                                  <h3 className="font-medium text-void-100 hover:text-spectral-cyan transition-colors line-clamp-2">
                                    {thread.title}
                                  </h3>
                                  <p className="text-sm text-void-500 mt-1">
                                    by <span className="text-void-300">@{thread.author.name}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Stats - Desktop */}
                              <div className="hidden md:flex md:col-span-2 md:justify-center">
                                <div className="flex items-center gap-1 text-void-400">
                                  <Icon name="ChatBubbleLeftIcon" size={14} />
                                  <span>{thread.replies}</span>
                                </div>
                              </div>

                              <div className="hidden md:flex md:col-span-2 md:justify-center">
                                <div className="flex items-center gap-1 text-void-400">
                                  <Icon name="EyeIcon" size={14} />
                                  <span>{thread.views.toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="hidden md:block md:col-span-2 md:text-right">
                                <span className="text-sm text-void-500">{thread.lastActivity}</span>
                              </div>

                              {/* Stats - Mobile */}
                              <div className="flex md:hidden items-center gap-4 mt-3 text-sm text-void-500">
                                <span className="flex items-center gap-1">
                                  <Icon name="ChatBubbleLeftIcon" size={14} />
                                  {thread.replies}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="EyeIcon" size={14} />
                                  {thread.views.toLocaleString()}
                                </span>
                                <span className="ml-auto">{thread.lastActivity}</span>
                              </div>
                            </div>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>

                    {filteredThreads.length === 0 && (
                      <div className="py-16 text-center">
                        <Icon name="MagnifyingGlassIcon" size={48} className="text-void-600 mx-auto mb-4" />
                        <p className="text-void-400">No threads found matching your search.</p>
                      </div>
                    )}

                    {/* Pagination */}
                    <div className="p-6 border-t border-void-800/50 flex items-center justify-between">
                      <p className="text-sm text-void-500">Showing 1-8 of {filteredThreads.length} threads</p>
                      <div className="flex items-center gap-2">
                        <SpectralButton variant="ghost" size="sm">Previous</SpectralButton>
                        <span className="px-3 py-1 rounded-lg bg-spectral-cyan/20 text-spectral-cyan text-sm">1</span>
                        <span className="px-3 py-1 rounded-lg text-void-400 hover:bg-void-800/50 cursor-pointer text-sm">2</span>
                        <span className="px-3 py-1 rounded-lg text-void-400 hover:bg-void-800/50 cursor-pointer text-sm">3</span>
                        <SpectralButton variant="ghost" size="sm">Next</SpectralButton>
                      </div>
                    </div>
                  </div>
                </GradientBorder>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* New Thread Modal */}
      <AnimatePresence>
        {showNewThreadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="absolute inset-0 bg-void-950/80 backdrop-blur-sm"
              onClick={() => setShowNewThreadModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl"
            >
              <GradientBorder>
                <div className="bg-void-950/95 backdrop-blur-xl rounded-2xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-void-100">Create New Thread</h2>
                    <button
                      onClick={() => setShowNewThreadModal(false)}
                      className="p-2 rounded-lg hover:bg-void-800/50 text-void-400 hover:text-void-200 transition-colors"
                    >
                      <Icon name="XMarkIcon" size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-void-300 mb-2">Category</label>
                      <select
                        value={newThreadCategory}
                        onChange={(e) => setNewThreadCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-void-900/50 border border-void-700/50 rounded-xl text-void-200 focus:border-spectral-cyan/50 focus:outline-none transition-colors"
                      >
                        <option value="">Select a category</option>
                        {MOCK_CATEGORIES.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-void-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        placeholder="Enter a descriptive title..."
                        className="w-full px-4 py-3 bg-void-900/50 border border-void-700/50 rounded-xl text-void-200 placeholder-void-500 focus:border-spectral-cyan/50 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-void-300 mb-2">Content</label>
                      <textarea
                        value={newThreadContent}
                        onChange={(e) => setNewThreadContent(e.target.value)}
                        placeholder="Write your post..."
                        rows={6}
                        className="w-full px-4 py-3 bg-void-900/50 border border-void-700/50 rounded-xl text-void-200 placeholder-void-500 focus:border-spectral-cyan/50 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <SpectralButton
                      variant="ghost"
                      onClick={() => setShowNewThreadModal(false)}
                    >
                      Cancel
                    </SpectralButton>
                    <SpectralButton
                      variant="primary"
                      onClick={handleSubmitThread}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create Thread'}
                    </SpectralButton>
                  </div>
                </div>
              </GradientBorder>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </VoidBackground>
  );
};

export default ForumsPage;
