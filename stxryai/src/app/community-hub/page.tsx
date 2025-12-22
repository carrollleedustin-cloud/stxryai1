'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, StaggerContainer, StaggerItem, AnimatedCounter, ParticleField } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import { socialService } from '@/services/socialService';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

// Mock data
const MOCK_TRENDING_DISCUSSIONS = [
  { id: '1', title: 'What makes a great plot twist?', author: 'storyteller99', replies: 156, views: 2340, category: 'Writing Tips', hot: true },
  { id: '2', title: 'The future of interactive fiction', author: 'futurist', replies: 89, views: 1567, category: 'Discussion', hot: true },
  { id: '3', title: 'Best horror stories on the platform?', author: 'horrorlover', replies: 234, views: 4521, category: 'Recommendations', hot: false },
  { id: '4', title: 'How to build compelling characters', author: 'novelist', replies: 67, views: 890, category: 'Writing Tips', hot: false },
  { id: '5', title: 'Monthly reading challenge - December', author: 'bookclub', replies: 445, views: 8920, category: 'Events', hot: true },
];

const MOCK_UPCOMING_EVENTS = [
  { id: '1', title: 'Horror Writing Workshop', date: '2024-12-28', time: '7:00 PM EST', host: 'Master of Darkness', participants: 45, cover: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg' },
  { id: '2', title: 'New Year Reading Marathon', date: '2024-12-31', time: '12:00 AM EST', host: 'Book Lovers Club', participants: 234, cover: 'https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg' },
  { id: '3', title: 'Sci-Fi Story Discussion', date: '2025-01-05', time: '3:00 PM EST', host: 'Sci-Fi Explorers', participants: 67, cover: 'https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg' },
];

const MOCK_FEATURED_CLUBS = [
  { id: '1', name: 'Dark Fiction Society', members: 2456, description: 'For lovers of horror, thriller, and dark fantasy', cover: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg', activity: 'Very Active' },
  { id: '2', name: 'Sci-Fi Explorers', members: 1892, description: 'Exploring the boundaries of science fiction', cover: 'https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg', activity: 'Active' },
  { id: '3', name: 'Fantasy Realm', members: 3210, description: 'Epic adventures in magical worlds', cover: 'https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg', activity: 'Very Active' },
  { id: '4', name: 'Mystery Masters', members: 1567, description: 'Unraveling the best mystery stories', cover: 'https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg', activity: 'Active' },
];

const MOCK_ACTIVE_USERS = [
  { id: '1', name: 'Alexandra', avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f211366-1764756733705.png', status: 'Reading: The Midnight Carnival' },
  { id: '2', name: 'Marcus', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', status: 'In a reading session' },
  { id: '3', name: 'Emily', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', status: 'Just finished a story!' },
  { id: '4', name: 'David', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg', status: 'Browsing the library' },
  { id: '5', name: 'Sarah', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', status: 'Writing a review' },
];

const CommunityHubPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [discussions, setDiscussions] = useState(MOCK_TRENDING_DISCUSSIONS);
  const [events, setEvents] = useState(MOCK_UPCOMING_EVENTS);
  const [clubs, setClubs] = useState(MOCK_FEATURED_CLUBS);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [discussionsData, eventsData, clubsData] = await Promise.all([
          socialService.getTrendingDiscussions(10),
          socialService.getUpcomingEvents(5),
          socialService.discoverClubs(10),
        ]);
        // Use backend data if available, otherwise keep mock data
        if (discussionsData && discussionsData.length > 0) setDiscussions(discussionsData as any);
        if (eventsData && eventsData.length > 0) setEvents(eventsData as any);
        if (clubsData && clubsData.length > 0) setClubs(clubsData as any);
      } catch (error) {
        console.error('Error fetching community data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const communityStats = {
    totalMembers: 15847,
    activeNow: 423,
    discussions: 12450,
    events: 89,
  };

  return (
    <VoidBackground variant="aurora">
      <ParticleField color="rgba(123, 44, 191, 0.5)" particleCount={40} />
      <EtherealNav />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <RevealOnScroll>
        <div className="text-center mb-12">
              <TemporalHeading level={1} accent className="mb-4">
                Community Hub
              </TemporalHeading>
              <p className="text-xl text-void-400 max-w-2xl mx-auto">
                Connect with fellow readers, join discussions, and discover amazing stories together.
          </p>
        </div>
          </RevealOnScroll>

          {/* Stats Bar */}
          <RevealOnScroll delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <HolographicCard className="p-4 text-center">
                <div className="text-2xl font-bold text-spectral-cyan mb-1">
                  <AnimatedCounter end={communityStats.totalMembers} />
                </div>
                <p className="text-sm text-void-500">Total Members</p>
              </HolographicCard>
              <HolographicCard className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <AnimatedCounter end={communityStats.activeNow} />
                </div>
                <p className="text-sm text-void-500">Online Now</p>
              </HolographicCard>
              <HolographicCard className="p-4 text-center">
                <div className="text-2xl font-bold text-spectral-violet mb-1">
                  <AnimatedCounter end={communityStats.discussions} />
                </div>
                <p className="text-sm text-void-500">Discussions</p>
              </HolographicCard>
              <HolographicCard className="p-4 text-center">
                <div className="text-2xl font-bold text-spectral-pink mb-1">
                  <AnimatedCounter end={communityStats.events} />
                </div>
                <p className="text-sm text-void-500">Upcoming Events</p>
              </HolographicCard>
            </div>
          </RevealOnScroll>

          {/* Quick Links */}
          <RevealOnScroll delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <Link href="/forums">
                <motion.div
                  className="p-6 rounded-xl bg-gradient-to-br from-spectral-cyan/10 to-spectral-cyan/5 border border-spectral-cyan/30 hover:border-spectral-cyan/50 transition-all text-center"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-spectral-cyan/20 flex items-center justify-center">
                    <Icon name="ChatBubbleLeftRightIcon" size={28} className="text-spectral-cyan" />
                  </div>
                  <h3 className="font-semibold text-void-100 mb-1">Forums</h3>
                  <p className="text-sm text-void-500">Join discussions</p>
                </motion.div>
              </Link>

              <Link href="/leaderboards">
                <motion.div
                  className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 hover:border-yellow-500/50 transition-all text-center"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Icon name="TrophyIcon" size={28} className="text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-void-100 mb-1">Leaderboards</h3>
                  <p className="text-sm text-void-500">View rankings</p>
                </motion.div>
              </Link>

              <Link href="/clubs">
                <motion.div
                  className="p-6 rounded-xl bg-gradient-to-br from-spectral-violet/10 to-spectral-violet/5 border border-spectral-violet/30 hover:border-spectral-violet/50 transition-all text-center"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-spectral-violet/20 flex items-center justify-center">
                    <Icon name="UserGroupIcon" size={28} className="text-spectral-violet" />
                  </div>
                  <h3 className="font-semibold text-void-100 mb-1">Reading Clubs</h3>
                  <p className="text-sm text-void-500">Find your tribe</p>
                </motion.div>
              </Link>

              <Link href="/reviews">
                <motion.div
                  className="p-6 rounded-xl bg-gradient-to-br from-spectral-pink/10 to-spectral-pink/5 border border-spectral-pink/30 hover:border-spectral-pink/50 transition-all text-center"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-spectral-pink/20 flex items-center justify-center">
                    <Icon name="StarIcon" size={28} className="text-spectral-pink" />
                  </div>
                  <h3 className="font-semibold text-void-100 mb-1">Reviews</h3>
                  <p className="text-sm text-void-500">Share thoughts</p>
                </motion.div>
              </Link>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left 2 Columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Trending Discussions */}
              <RevealOnScroll delay={0.3}>
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-void-100 flex items-center gap-2">
                        <Icon name="FireIcon" size={24} className="text-orange-400" />
                        Trending Discussions
                      </h2>
                      <Link href="/forums">
                        <SpectralButton variant="ghost" size="sm">
                          View All
                          <Icon name="ArrowRightIcon" size={16} className="ml-1" />
                        </SpectralButton>
                      </Link>
                    </div>
                    <StaggerContainer className="space-y-3">
                      {discussions.map((discussion: any) => (
                        <StaggerItem key={discussion.id}>
                          <motion.div
                            className="p-4 rounded-lg bg-void-900/50 border border-void-800/50 hover:border-spectral-cyan/30 transition-all cursor-pointer"
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {discussion.hot && (
                                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                                      🔥 Hot
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-full bg-spectral-cyan/10 text-spectral-cyan text-xs">
                                    {discussion.category}
                                  </span>
                                </div>
                                <h3 className="font-medium text-void-100 hover:text-spectral-cyan transition-colors">
                                  {discussion.title}
                                </h3>
                                <p className="text-sm text-void-500 mt-1">
                                  by @{discussion.author}
                                </p>
                              </div>
                              <div className="text-right text-sm text-void-500">
                                <div className="flex items-center gap-1">
                                  <Icon name="ChatBubbleLeftIcon" size={14} />
                                  {discussion.replies}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Icon name="EyeIcon" size={14} />
                                  {discussion.views}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
              </div>
                </GradientBorder>
              </RevealOnScroll>

              {/* Featured Clubs */}
              <RevealOnScroll delay={0.4}>
                <GradientBorder>
                  <div className="bg-void-950/80 backdrop-blur-xl rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-void-100 flex items-center gap-2">
                        <Icon name="UserGroupIcon" size={24} className="text-spectral-violet" />
                        Featured Clubs
                      </h2>
                      <Link href="/clubs">
                        <SpectralButton variant="ghost" size="sm">
                          Explore All
                          <Icon name="ArrowRightIcon" size={16} className="ml-1" />
                        </SpectralButton>
            </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {clubs.map((club: any) => (
                        <motion.div
                          key={club.id}
                          className="relative overflow-hidden rounded-xl border border-void-800/50 hover:border-spectral-violet/50 transition-all group"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="aspect-[2/1] relative">
                            <img
                              src={club.cover}
                              alt={club.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/50 to-transparent" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-semibold text-void-100 group-hover:text-spectral-violet transition-colors">
                              {club.name}
                            </h3>
                            <p className="text-sm text-void-400 line-clamp-1">{club.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-void-500">
                                {club.members?.toLocaleString() || club.member_count?.toLocaleString()} members
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                                {club.activity || 'Active'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </GradientBorder>
              </RevealOnScroll>
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-8">
              {/* Upcoming Events */}
              <RevealOnScroll delay={0.3}>
                <HolographicCard className="p-6">
                  <h3 className="text-lg font-semibold text-void-100 mb-6 flex items-center gap-2">
                    <Icon name="CalendarIcon" size={20} className="text-spectral-pink" />
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    {events.map((event: any) => (
                      <motion.div
                        key={event.id}
                        className="p-3 rounded-lg bg-void-900/50 border border-void-800/50 hover:border-spectral-pink/30 transition-all cursor-pointer"
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-void-100 truncate">{event.title}</h4>
                            <p className="text-sm text-void-500">{event.date} at {event.time}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-void-500">
                              <Icon name="UserIcon" size={12} />
                              {event.participants} attending
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <SpectralButton variant="ghost" size="sm" className="w-full mt-4">
                    View Calendar
                  </SpectralButton>
                </HolographicCard>
              </RevealOnScroll>

              {/* Active Now */}
              <RevealOnScroll delay={0.4}>
                <HolographicCard className="p-6">
                  <h3 className="text-lg font-semibold text-void-100 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Active Now
                  </h3>
                  <div className="space-y-3">
                    {MOCK_ACTIVE_USERS.map((user) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-void-950" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-void-200 text-sm">{user.name}</p>
                          <p className="text-xs text-void-500 truncate">{user.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-void-800/50 text-center">
                    <p className="text-sm text-void-500">
                      <span className="text-spectral-cyan font-semibold">+418</span> more online
                    </p>
                  </div>
                </HolographicCard>
              </RevealOnScroll>

              {/* Create Post CTA */}
              <RevealOnScroll delay={0.5}>
                <div className="p-6 rounded-xl bg-gradient-to-br from-spectral-cyan/10 via-spectral-violet/10 to-spectral-pink/10 border border-spectral-cyan/20">
                  <h3 className="font-semibold text-void-100 mb-2">Join the Conversation</h3>
                  <p className="text-sm text-void-400 mb-4">
                    Share your thoughts, ask questions, or start a discussion with the community.
                  </p>
                  <SpectralButton variant="primary" size="md" className="w-full">
                    <Icon name="PlusIcon" size={16} className="mr-2" />
                    Create Post
                  </SpectralButton>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </main>
    </VoidBackground>
  );
};

export default CommunityHubPage;
