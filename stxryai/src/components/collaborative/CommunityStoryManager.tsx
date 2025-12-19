'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { collaborativeCreationService, type CommunityStory, type StoryContribution, type StoryRemix, type StoryFork } from '@/services/collaborativeCreationService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface CommunityStoryManagerProps {
  storyId: string;
  className?: string;
}

export function CommunityStoryManager({ storyId, className = '' }: CommunityStoryManagerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'contributions' | 'remixes' | 'forks'>('overview');
  const [communityStory, setCommunityStory] = useState<CommunityStory | null>(null);
  const [contributions, setContributions] = useState<StoryContribution[]>([]);
  const [remixes, setRemixes] = useState<StoryRemix[]>([]);
  const [forks, setForks] = useState<StoryFork[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contributionText, setContributionText] = useState('');

  useEffect(() => {
    loadData();
  }, [storyId, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const community = await collaborativeCreationService.getCommunityStory(storyId);
      setCommunityStory(community);

      if (activeTab === 'contributions' && community) {
        const contribs = await collaborativeCreationService.getStoryContributions(community.id);
        setContributions(contribs);
      } else if (activeTab === 'remixes') {
        const remixData = await collaborativeCreationService.getStoryRemixes(storyId);
        setRemixes(remixData);
      } else if (activeTab === 'forks') {
        const forkData = await collaborativeCreationService.getStoryForks(storyId);
        setForks(forkData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunityStory = async () => {
    if (!user || submitting) return;

    try {
      setSubmitting(true);
      const community = await collaborativeCreationService.createCommunityStory(storyId, {
        storyType: 'community',
        isOpenForContributions: true,
        moderationLevel: 'moderate',
      });
      setCommunityStory(community);
      toast.success('Community story created!');
    } catch (error: any) {
      console.error('Failed to create community story:', error);
      toast.error(error.message || 'Failed to create community story');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitContribution = async () => {
    if (!user || !communityStory || !contributionText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await collaborativeCreationService.submitContribution(communityStory.id, user.id, {
        contributionType: 'chapter',
        contributionContent: contributionText,
        wordsAdded: contributionText.split(/\s+/).length,
        charactersAdded: contributionText.length,
      });
      setContributionText('');
      toast.success('Contribution submitted!');
      loadData();
    } catch (error: any) {
      console.error('Failed to submit contribution:', error);
      toast.error(error.message || 'Failed to submit contribution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (contributionId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return;

    try {
      await collaborativeCreationService.voteOnContribution(contributionId, user.id, voteType);
      toast.success('Vote recorded!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  };

  if (loading && !communityStory) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl h-64 ${className}`} />
    );
  }

  if (!communityStory) {
    return (
      <div className={`bg-card border-2 border-border rounded-xl p-6 text-center ${className}`}>
        <Icon name="UsersIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Make This a Community Story</h3>
        <p className="text-muted-foreground mb-6">
          Open this story for community contributions and collaboration
        </p>
        <motion.button
          onClick={handleCreateCommunityStory}
          disabled={submitting || !user}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Community Story'}
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon name="UsersIcon" size={28} />
          Community Story
        </h2>
        <p className="text-muted-foreground">
          {communityStory.contributorCount} contributors • {communityStory.chapterCount} chapters
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['overview', 'contributions', 'remixes', 'forks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border-2 border-border rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Contributors</div>
              <div className="text-2xl font-bold text-foreground">{communityStory.contributorCount}</div>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Chapters</div>
              <div className="text-2xl font-bold text-foreground">{communityStory.chapterCount}</div>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Rating</div>
              <div className="text-2xl font-bold text-foreground">
                {communityStory.communityRating.toFixed(1)}
              </div>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <div className="text-lg font-bold text-foreground capitalize">{communityStory.status}</div>
            </div>
          </div>

          {communityStory.contributionGuidelines && (
            <div className="bg-card border-2 border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">Contribution Guidelines</h3>
              <p className="text-foreground whitespace-pre-line">{communityStory.contributionGuidelines}</p>
            </div>
          )}

          {communityStory.isOpenForContributions && (
            <div className="bg-card border-2 border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Submit Contribution</h3>
              <textarea
                value={contributionText}
                onChange={(e) => setContributionText(e.target.value)}
                placeholder="Write your contribution here..."
                rows={8}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground resize-none mb-4"
              />
              <motion.button
                onClick={handleSubmitContribution}
                disabled={submitting || !contributionText.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Contribution'}
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Contributions Tab */}
      {activeTab === 'contributions' && (
        <div className="space-y-4">
          {contributions.length === 0 ? (
            <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
              <p className="text-muted-foreground">No contributions yet</p>
            </div>
          ) : (
            contributions.map((contribution, index) => (
              <motion.div
                key={contribution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium capitalize">
                        {contribution.contributionType}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        contribution.contributionStatus === 'approved'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : contribution.contributionStatus === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}>
                        {contribution.contributionStatus}
                      </span>
                    </div>
                    {contribution.contributionContent && (
                      <p className="text-foreground mb-2">{contribution.contributionContent}</p>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {contribution.wordsAdded} words • {contribution.communityVotes} votes
                    </div>
                  </div>
                </div>
                {user && contribution.contributionStatus === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(contribution.id, 'upvote')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium"
                    >
                      Upvote
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Remixes Tab */}
      {activeTab === 'remixes' && (
        <div className="space-y-4">
          {remixes.length === 0 ? (
            <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
              <p className="text-muted-foreground">No remixes yet</p>
            </div>
          ) : (
            remixes.map((remix, index) => (
              <motion.div
                key={remix.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium capitalize">
                        {remix.remixType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {remix.remixDescription && (
                      <p className="text-foreground">{remix.remixDescription}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Forks Tab */}
      {activeTab === 'forks' && (
        <div className="space-y-4">
          {forks.length === 0 ? (
            <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
              <p className="text-muted-foreground">No forks yet</p>
            </div>
          ) : (
            forks.map((fork, index) => (
              <motion.div
                key={fork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {fork.forkDescription && (
                      <p className="text-foreground mb-2">{fork.forkDescription}</p>
                    )}
                    {fork.forkReason && (
                      <p className="text-sm text-muted-foreground">Reason: {fork.forkReason}</p>
                    )}
                    {fork.divergencePoint && (
                      <p className="text-sm text-muted-foreground">
                        Diverged at chapter {fork.divergencePoint}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

