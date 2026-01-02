'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, StaggerContainer, StaggerItem, ParticleField } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import { enhancedSocialService } from '@/services/enhancedSocialService';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Club data type
interface Club {
  id: string;
  name: string;
  description: string;
  cover_image_url?: string;
  member_count?: number;
  category: string;
  activity?: string;
  is_private?: boolean;
  tags?: string[];
  online?: number;
  featured?: boolean;
  recentActivity?: string;
  members?: number;
  isPrivate?: boolean;
  cover?: string;
}

// Mock data for clubs (fallback)
const MOCK_CLUBS: Club[] = [
  { 
    id: '1', 
    name: 'Dark Fiction Society', 
    description: 'For lovers of horror, thriller, and dark fantasy. We explore the shadows of storytelling together.',
    cover: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg',
    members: 2456,
    online: 89,
    category: 'Horror',
    activity: 'Very Active',
    isPrivate: false,
    tags: ['Horror', 'Thriller', 'Dark Fantasy'],
    recentActivity: '5 min ago',
    featured: true
  },
  { 
    id: '2', 
    name: 'Sci-Fi Explorers', 
    description: 'Exploring the boundaries of science fiction narratives. From space operas to cyberpunk.',
    cover: 'https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg',
    members: 1892,
    online: 56,
    category: 'Sci-Fi',
    activity: 'Active',
    isPrivate: false,
    tags: ['Sci-Fi', 'Space Opera', 'Cyberpunk'],
    recentActivity: '15 min ago',
    featured: true
  },
  { 
    id: '3', 
    name: 'Fantasy Realm', 
    description: 'Epic adventures in magical worlds. Dragons, wizards, and everything in between.',
    cover: 'https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg',
    members: 3210,
    online: 124,
    category: 'Fantasy',
    activity: 'Very Active',
    isPrivate: false,
    tags: ['Fantasy', 'Epic', 'Magic'],
    recentActivity: '2 min ago',
    featured: true
  },
  { 
    id: '4', 
    name: 'Mystery Masters', 
    description: 'Unraveling the best mystery stories. Join us in solving puzzles and discovering whodunits.',
    cover: 'https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg',
    members: 1567,
    online: 45,
    category: 'Mystery',
    activity: 'Active',
    isPrivate: false,
    tags: ['Mystery', 'Detective', 'Crime'],
    recentActivity: '30 min ago',
    featured: false
  },
  { 
    id: '5', 
    name: 'Romance Readers', 
    description: 'For those who love a good love story. From sweet to steamy, we read it all.',
    cover: 'https://images.pexels.com/photos/2832041/pexels-photo-2832041.jpeg',
    members: 2890,
    online: 98,
    category: 'Romance',
    activity: 'Very Active',
    isPrivate: false,
    tags: ['Romance', 'Love', 'Drama'],
    recentActivity: '8 min ago',
    featured: false
  },
  { 
    id: '6', 
    name: 'Writers Workshop', 
    description: 'A private club for aspiring writers to share work and get feedback.',
    cover: 'https://images.pexels.com/photos/2832042/pexels-photo-2832042.jpeg',
    members: 456,
    online: 23,
    category: 'Writing',
    activity: 'Active',
    isPrivate: true,
    tags: ['Writing', 'Feedback', 'Craft'],
    recentActivity: '1 hour ago',
    featured: false
  },
  { 
    id: '7', 
    name: 'Adventure Seekers', 
    description: 'For fans of action-packed adventures and thrilling journeys.',
    cover: 'https://images.pexels.com/photos/2832043/pexels-photo-2832043.jpeg',
    members: 1234,
    online: 67,
    category: 'Adventure',
    activity: 'Active',
    isPrivate: false,
    tags: ['Adventure', 'Action', 'Journey'],
    recentActivity: '20 min ago',
    featured: false
  },
  { 
    id: '8', 
    name: 'Historical Fiction Fans', 
    description: 'Journey through time with historical fiction enthusiasts.',
    cover: 'https://images.pexels.com/photos/2832044/pexels-photo-2832044.jpeg',
    members: 987,
    online: 34,
    category: 'Historical',
    activity: 'Moderate',
    isPrivate: false,
    tags: ['Historical', 'Drama', 'Period'],
    recentActivity: '2 hours ago',
    featured: false
  },
];

const CATEGORIES = ['All', 'Horror', 'Sci-Fi', 'Fantasy', 'Mystery', 'Romance', 'Writing', 'Adventure', 'Historical'];

const ClubsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'members' | 'activity' | 'recent'>('members');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubCategory, setClubCategory] = useState('Horror');
  const [isPrivate, setIsPrivate] = useState(false);
  const [clubs, setClubs] = useState<Club[]>(MOCK_CLUBS);

  useEffect(() => {
    loadClubs();
  }, [selectedCategory, searchQuery]);

  const loadClubs = async () => {
    try {
      const result = await enhancedSocialService.getClubs({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        limit: 50,
      });
      if (result.clubs) {
        setClubs(result.clubs);
      }
    } catch (error) {
      console.error('Failed to load clubs:', error);
      // Fall back to mock data
      setClubs(MOCK_CLUBS);
    }
  };

  const handleCreateClub = () => {
    if (!user) {
      toast.error('Please sign in to create a club');
      router.push('/authentication?redirect=/clubs');
      return;
    }
    setShowCreateModal(true);
  };

  const handleJoinClub = async (clubId: string) => {
    if (!user) {
      toast.error('Please sign in to join a club');
      router.push('/authentication?redirect=/clubs');
      return;
    }
    try {
      await enhancedSocialService.joinClub(clubId);
      toast.success('Successfully joined the club!');
      await loadClubs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join club');
    }
  };

  const handleSubmitClub = async () => {
    if (!clubName.trim() || !clubDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    try {
      await enhancedSocialService.createClub({
        name: clubName,
        description: clubDescription,
        category: clubCategory,
        is_private: isPrivate,
        tags: [clubCategory],
        created_by: user?.id || '',
      });
      toast.success('Club created successfully!');
      setShowCreateModal(false);
      setClubName('');
      setClubDescription('');
      setClubCategory('Horror');
      setIsPrivate(false);
      await loadClubs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create club');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClubs = clubs.sort((a, b) => {
    if (sortBy === 'members') return (b.member_count || 0) - (a.member_count || 0);
    if (sortBy === 'activity') return (b.online || 0) - (a.online || 0);
    return 0;
  });

  const featuredClubs = clubs.filter(club => club.featured);

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'Very Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-void-500/20 text-void-400 border-void-500/30';
    }
  };

  return (
    <VoidBackground variant="aurora">
      <ParticleField color="rgba(123, 44, 191, 0.4)" particleCount={35} />
      <EtherealNav />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <RevealOnScroll>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <TemporalHeading level={2} accent className="mb-2">
                  Reading Clubs
                </TemporalHeading>
                <p className="text-void-400">Find your tribe and read together</p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <SpectralButton variant="primary" size="md" onClick={handleCreateClub}>
                  <Icon name="PlusIcon" size={16} className="mr-2" />
                  Create Club
                </SpectralButton>
              </div>
            </div>
          </RevealOnScroll>

          {/* Featured Clubs */}
          <RevealOnScroll delay={0.1}>
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-void-100 mb-6 flex items-center gap-2">
                <Icon name="SparklesIcon" size={24} className="text-yellow-400" />
                Featured Clubs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredClubs.map((club, index) => (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <GradientBorder>
                      <div className="relative overflow-hidden rounded-xl bg-void-950/80 backdrop-blur-xl">
                        <div className="aspect-[16/9] relative">
                          <img
                            src={club.cover}
                            alt={club.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/50 to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium border border-yellow-500/30">
                              ⭐ Featured
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full bg-void-950/80 text-green-400 text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              {club.online} online
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-semibold text-void-100 mb-2 group-hover:text-spectral-cyan transition-colors">
                            {club.name}
                          </h3>
                          <p className="text-sm text-void-400 line-clamp-2 mb-4">{club.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-void-500">
                              {club.members.toLocaleString()} members
                            </span>
                            <SpectralButton variant="ghost" size="sm" onClick={() => handleJoinClub(club.id)}>
                              Join
                              <Icon name="ArrowRightIcon" size={14} className="ml-1" />
                            </SpectralButton>
                          </div>
                        </div>
                      </div>
                    </GradientBorder>
                  </motion.div>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          {/* Search & Filters */}
          <RevealOnScroll delay={0.2}>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-void-500" />
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-void-900/50 border border-void-700/50 rounded-xl text-void-200 placeholder-void-500 focus:border-spectral-cyan/50 focus:outline-none transition-colors"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-void-900/50 border border-void-700/50 rounded-xl text-void-200 focus:outline-none"
                >
                  <option value="members">Most Members</option>
                  <option value="activity">Most Active</option>
                  <option value="recent">Recently Active</option>
                </select>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-spectral-cyan/20 text-spectral-cyan border border-spectral-cyan/50'
                        : 'bg-void-900/50 text-void-400 border border-void-700/50 hover:border-spectral-cyan/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          {/* All Clubs Grid */}
          <RevealOnScroll delay={0.3}>
            <h2 className="text-xl font-semibold text-void-100 mb-6 flex items-center gap-2">
              <Icon name="UserGroupIcon" size={24} className="text-spectral-violet" />
              All Clubs ({filteredClubs.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClubs.map((club, index) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group cursor-pointer"
                  whileHover={{ y: -4 }}
                >
                  <HolographicCard className="h-full overflow-hidden">
                    <div className="aspect-[4/3] relative overflow-hidden rounded-t-xl">
                      <img
                        src={club.cover}
                        alt={club.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void-950 to-transparent" />
                      {club.isPrivate && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 rounded-full bg-void-950/80 text-void-300 text-xs flex items-center gap-1">
                            <Icon name="LockClosedIcon" size={12} />
                            Private
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded-full bg-void-950/80 text-green-400 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          {club.online}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-void-100 truncate group-hover:text-spectral-cyan transition-colors">
                          {club.name}
                        </h3>
                      </div>
                      <p className="text-sm text-void-500 line-clamp-2 mb-3">{club.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {club.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-void-800/50 text-void-400 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-void-800/50">
                        <div className="text-sm text-void-500">
                          {club.members.toLocaleString()} members
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getActivityColor(club.activity)}`}>
                          {club.activity}
                        </span>
                      </div>
                    </div>
                  </HolographicCard>
                </motion.div>
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="py-16 text-center">
                <Icon name="UserGroupIcon" size={48} className="text-void-600 mx-auto mb-4" />
                <p className="text-void-400 mb-4">No clubs found matching your criteria.</p>
                <SpectralButton variant="primary" size="md" onClick={handleCreateClub}>
                  Create a Club
                </SpectralButton>
              </div>
            )}
          </RevealOnScroll>

          {/* Create Club CTA */}
          <RevealOnScroll delay={0.4}>
            <div className="mt-16 text-center">
              <div className="max-w-xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-spectral-cyan/10 via-spectral-violet/10 to-spectral-pink/10 border border-spectral-cyan/20">
                <Icon name="SparklesIcon" size={48} className="text-spectral-cyan mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-void-100 mb-2">Start Your Own Club</h3>
                <p className="text-void-400 mb-6">
                  Can't find the perfect club? Create your own and build a community around your favorite genres and stories.
                </p>
                <SpectralButton variant="primary" size="lg" onClick={handleCreateClub}>
                  <Icon name="PlusIcon" size={20} className="mr-2" />
                  Create Club
                </SpectralButton>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </main>

      {/* Create Club Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-950/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="w-full max-w-lg bg-void-900 border border-void-700/50 rounded-2xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-void-100">Create a Reading Club</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-void-400 hover:text-void-100">
                  <Icon name="XMarkIcon" size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-void-300 mb-2">Club Name</label>
                  <input
                    type="text"
                    placeholder="Enter club name..."
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full px-4 py-3 bg-void-950/50 border border-void-700/50 rounded-lg text-void-200 placeholder-void-500 focus:border-spectral-cyan/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-void-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe your club..."
                    rows={3}
                    value={clubDescription}
                    onChange={(e) => setClubDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-void-950/50 border border-void-700/50 rounded-lg text-void-200 placeholder-void-500 focus:border-spectral-cyan/50 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-void-300 mb-2">Category</label>
                  <select 
                    value={clubCategory}
                    onChange={(e) => setClubCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-void-950/50 border border-void-700/50 rounded-lg text-void-200 focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="private" 
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded bg-void-800 border-void-700" 
                  />
                  <label htmlFor="private" className="text-sm text-void-300">Make this club private (invite only)</label>
                </div>
                <div className="flex gap-3 mt-6">
                  <SpectralButton variant="ghost" size="md" className="flex-1" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </SpectralButton>
                  <SpectralButton 
                    variant="primary" 
                    size="md" 
                    className="flex-1" 
                    onClick={handleSubmitClub}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Club'}
                  </SpectralButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </VoidBackground>
  );
};

export default ClubsPage;
