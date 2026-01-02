'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, StaggerContainer, StaggerItem } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import Icon from '@/components/ui/AppIcon';
import { clubChallengeService, ClubChallenge } from '@/services/clubChallengeService';
import { communityService } from '@/services/communityService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ClubDetailPage() {
  const { clubId } = useParams() as { clubId: string };
  const { user } = useAuth();
  const router = useRouter();
  
  const [club, setClub] = useState<any>(null);
  const [challenges, setChallenges] = useState<ClubChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'members'>('overview');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [clubData, challengeData] = await Promise.all([
          communityService.getClubById(clubId),
          clubChallengeService.getClubChallenges(clubId)
        ]);
        
        setClub(clubData);
        setChallenges(challengeData);
      } catch (error) {
        console.error('Error fetching club details:', error);
        toast.error('Failed to load club details');
      } finally {
        setLoading(false);
      }
    }

    if (clubId) fetchData();
  }, [clubId]);

  if (loading) {
    return (
      <VoidBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spectral-cyan"></div>
        </div>
      </VoidBackground>
    );
  }

  if (!club) {
    return (
      <VoidBackground>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl text-void-100 mb-4">Club not found</h1>
          <SpectralButton variant="primary" onClick={() => router.push('/clubs')}>
            Back to Clubs
          </SpectralButton>
        </div>
      </VoidBackground>
    );
  }

  return (
    <VoidBackground>
      <EtherealNav />
      
      <main className="pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Club Header */}
          <div className="relative rounded-3xl overflow-hidden mb-8 h-64 md:h-80">
            <img 
              src={club.cover_image || 'https://images.unsplash.com/photo-1514894780063-5881f71e8ce8?q=80&w=2070&auto=format&fit=crop'} 
              alt={club.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between w-full gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-spectral-cyan/20 border border-spectral-cyan/30 text-spectral-cyan text-xs font-medium uppercase tracking-wider">
                    {club.category}
                  </span>
                  {club.is_private && (
                    <span className="flex items-center gap-1 text-void-400 text-xs">
                      <Icon name="LockClosedIcon" size={12} />
                      Private
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-void-100 mb-2">{club.name}</h1>
                <p className="text-void-300 max-w-2xl">{club.description}</p>
              </div>
              <div className="flex gap-3">
                <SpectralButton variant="primary" size="lg">
                  Join Club
                </SpectralButton>
                <SpectralButton variant="ghost" size="lg">
                  <Icon name="ShareIcon" size={20} />
                </SpectralButton>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-void-800 mb-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: 'Squares2X2Icon' },
              { id: 'challenges', label: 'Challenges', icon: 'TrophyIcon' },
              { id: 'members', label: 'Members', icon: 'UserGroupIcon' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-spectral-cyan text-spectral-cyan bg-spectral-cyan/5' 
                    : 'border-transparent text-void-400 hover:text-void-100 hover:bg-void-800/30'
                }`}
              >
                <Icon name={tab.icon as any} size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <section>
                      <h3 className="text-xl font-semibold text-void-100 mb-4 flex items-center gap-2">
                        <Icon name="InformationCircleIcon" size={24} className="text-spectral-cyan" />
                        About the Club
                      </h3>
                      <div className="p-6 rounded-2xl bg-void-900/50 border border-void-800 text-void-300 leading-relaxed">
                        {club.description}
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-void-100 flex items-center gap-2">
                          <Icon name="FireIcon" size={24} className="text-spectral-pink" />
                          Active Challenges
                        </h3>
                        <SpectralButton variant="ghost" size="sm" onClick={() => setActiveTab('challenges')}>
                          View All
                        </SpectralButton>
                      </div>
                      <div className="grid gap-4">
                        {challenges.filter(c => c.status === 'active').slice(0, 2).map((challenge) => (
                          <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))}
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === 'challenges' && (
                  <motion.div
                    key="challenges"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-void-100">Club Challenges</h3>
                      <SpectralButton variant="primary" size="sm">
                        <Icon name="PlusIcon" size={16} className="mr-1" />
                        New Challenge
                      </SpectralButton>
                    </div>
                    <div className="grid gap-6">
                      {challenges.map((challenge) => (
                        <ChallengeCard key={challenge.id} challenge={challenge} showDetails />
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'members' && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-2xl font-bold text-void-100 mb-6">Club Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Member list would go here */}
                      {[1, 2, 3, 4, 5].map((m) => (
                        <div key={m} className="p-4 rounded-xl bg-void-900/50 border border-void-800 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-spectral-violet/20 border border-spectral-violet/30 flex items-center justify-center text-spectral-violet">
                            <Icon name="UserIcon" size={24} />
                          </div>
                          <div>
                            <p className="text-void-100 font-medium">Club Member {m}</p>
                            <p className="text-xs text-void-500">Member since Dec 2025</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <section className="p-6 rounded-2xl bg-void-900/80 border border-void-700/50">
                <h3 className="text-lg font-semibold text-void-100 mb-4">Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-void-400 text-sm">Members</span>
                    <span className="text-void-100 font-mono">{club.member_count || 124}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-void-400 text-sm">Founded</span>
                    <span className="text-void-100 font-mono">2 months ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-void-400 text-sm">Activity Level</span>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">High</span>
                  </div>
                </div>
              </section>

              <section className="p-6 rounded-2xl bg-gradient-to-br from-spectral-cyan/10 to-spectral-violet/10 border border-spectral-cyan/20">
                <h3 className="text-lg font-semibold text-void-100 mb-2">Club Goal</h3>
                <p className="text-xs text-void-400 mb-4">Collective progress towards a permanent reward.</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-void-300">Total Words Written</span>
                    <span className="text-spectral-cyan font-bold">754,230 / 1M</span>
                  </div>
                  <div className="w-full h-2 bg-void-950 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-spectral-cyan" 
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <p className="text-[10px] text-void-500 italic mt-2">Reward: Custom Club Badge</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </VoidBackground>
  );
}

function ChallengeCard({ challenge, showDetails = false }: { challenge: ClubChallenge, showDetails?: boolean }) {
  const progress = (challenge.current_value / challenge.target_value) * 100;
  
  return (
    <div className="p-6 rounded-2xl bg-void-900/50 border border-void-800 group hover:border-spectral-cyan/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${challenge.status === 'active' ? 'bg-spectral-cyan' : 'bg-green-400'} animate-pulse`} />
            <span className="text-[10px] uppercase font-bold tracking-widest text-void-400">
              {challenge.status}
            </span>
          </div>
          <h4 className="text-lg font-bold text-void-100 group-hover:text-spectral-cyan transition-colors">
            {challenge.title}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-spectral-pink font-bold">+{challenge.reward_xp} XP</span>
        </div>
      </div>
      
      <p className="text-sm text-void-400 mb-6">{challenge.description}</p>
      
      <div className="space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-void-300 font-medium">Club Progress</span>
          <span className="text-void-100 font-mono">
            {challenge.current_value.toLocaleString()} / {challenge.target_value.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-void-950 rounded-full overflow-hidden p-0.5">
          <motion.div 
            className="h-full bg-gradient-to-r from-spectral-cyan to-spectral-violet rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-void-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full border border-void-950 bg-void-800 flex items-center justify-center text-[8px]">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-void-400">12 members contributing</span>
          </div>
          <span className="text-void-500">Ends in 4 days</span>
        </div>
      )}
    </div>
  );
}
