'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { challengeService, type MonthlyChallenge, type CommunityCompetition, type CompetitionLeaderboardEntry } from '@/services/challengeService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface EnhancedReadingChallengesProps {
  className?: string;
}

export function EnhancedReadingChallenges({ className = '' }: EnhancedReadingChallengesProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'monthly' | 'competitions' | 'weekly'>('monthly');
  const [monthlyChallenges, setMonthlyChallenges] = useState<MonthlyChallenge[]>([]);
  const [competitions, setCompetitions] = useState<CommunityCompetition[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<string, CompetitionLeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [userParticipations, setUserParticipations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [monthly, comps] = await Promise.all([
        challengeService.getCurrentMonthlyChallenges(),
        challengeService.getActiveCompetitions(),
      ]);

      setMonthlyChallenges(monthly);
      setCompetitions(comps);

      // Load user progress for monthly challenges
      const progressMap: Record<string, number> = {};
      for (const challenge of monthly) {
        try {
          const userChallenge = await challengeService.getOrCreateUserMonthlyChallenge(user.id, challenge.id);
          progressMap[challenge.id] = userChallenge.progress;
        } catch (error) {
          console.error('Failed to load challenge progress:', error);
        }
      }
      setUserProgress(progressMap);

      // Load user participations
      const participationMap: Record<string, boolean> = {};
      for (const comp of comps) {
        try {
          const participation = await challengeService.getUserParticipation(user.id, comp.id);
          participationMap[comp.id] = !!participation;
        } catch (error) {
          console.error('Failed to load participation:', error);
        }
      }
      setUserParticipations(participationMap);

      // Load leaderboards for active competitions
      const leaderboardMap: Record<string, CompetitionLeaderboardEntry[]> = {};
      for (const comp of comps.filter(c => c.status === 'active')) {
        try {
          const leaderboard = await challengeService.getCompetitionLeaderboard(comp.id, 10);
          leaderboardMap[comp.id] = leaderboard;
        } catch (error) {
          console.error('Failed to load leaderboard:', error);
        }
      }
      setLeaderboards(leaderboardMap);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCompetition = async (competitionId: string) => {
    if (!user) return;

    try {
      await challengeService.joinCompetition(user.id, competitionId);
      setUserParticipations({ ...userParticipations, [competitionId]: true });
      toast.success('Joined competition!');
      loadData();
    } catch (error: any) {
      console.error('Failed to join competition:', error);
      toast.error(error.message || 'Failed to join competition');
    }
  };

  const handleClaimReward = async (challengeId: string) => {
    if (!user) return;

    try {
      await challengeService.claimMonthlyChallengeReward(user.id, challengeId);
      toast.success('Reward claimed!');
      loadData();
    } catch (error: any) {
      console.error('Failed to claim reward:', error);
      toast.error(error.message || 'Failed to claim reward');
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>🏆</span>
            Reading Challenges & Competitions
          </h2>
          <p className="text-muted-foreground">Complete challenges and compete with the community</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'monthly'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Monthly Challenges ({monthlyChallenges.length})
        </button>
        <button
          onClick={() => setActiveTab('competitions')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'competitions'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Competitions ({competitions.length})
        </button>
      </div>

      {/* Monthly Challenges Tab */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {monthlyChallenges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No monthly challenges available. Check back soon!</p>
            </div>
          ) : (
            monthlyChallenges.map((challenge, index) => {
              const progress = userProgress[challenge.id] || 0;
              const goal = (challenge.challengeData.goal || challenge.challengeData.target || 100) as number;
              const percentage = Math.min(100, (progress / goal) * 100);
              const isComplete = progress >= goal;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-card border-2 rounded-xl p-6 ${
                    isComplete
                      ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                      : challenge.isFeatured
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">🗓️</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-foreground">{challenge.title}</h3>
                          {challenge.isFeatured && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold rounded-full">
                              FEATURED
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            challenge.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            challenge.difficulty === 'hard' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {challenge.difficulty.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                      </div>
                    </div>
                    {isComplete && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-3xl"
                      >
                        ✅
                      </motion.div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {progress} / {goal}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${
                          isComplete
                            ? 'from-green-500 to-emerald-500'
                            : percentage >= 75
                            ? 'from-blue-500 to-cyan-500'
                            : percentage >= 50
                            ? 'from-yellow-500 to-orange-500'
                            : 'from-gray-400 to-gray-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Icon name="SparklesIcon" size={16} className="text-yellow-500" />
                        <span className="text-sm font-medium text-foreground">
                          +{challenge.rewardXp} XP
                        </span>
                      </div>
                      {challenge.rewardBadge && (
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{challenge.rewardBadge}</span>
                          <span className="text-sm text-muted-foreground">Badge</span>
                        </div>
                      )}
                      {challenge.rewardTitle && (
                        <div className="flex items-center gap-1">
                          <Icon name="TrophyIcon" size={16} className="text-yellow-500" />
                          <span className="text-sm text-muted-foreground">{challenge.rewardTitle}</span>
                        </div>
                      )}
                    </div>
                    {isComplete && (
                      <motion.button
                        onClick={() => handleClaimReward(challenge.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium text-sm"
                      >
                        Claim Reward
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Competitions Tab */}
      {activeTab === 'competitions' && (
        <div className="space-y-4">
          {competitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active competitions. Check back soon!</p>
            </div>
          ) : (
            competitions.map((competition, index) => {
              const isParticipating = userParticipations[competition.id] || false;
              const leaderboard = leaderboards[competition.id] || [];
              const userRank = leaderboard.findIndex(entry => entry.userId === user?.id) + 1;

              return (
                <motion.div
                  key={competition.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border-2 rounded-xl p-6 border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {competition.coverImageUrl ? (
                        <img
                          src={competition.coverImageUrl}
                          alt={competition.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                          🏆
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-foreground">{competition.title}</h3>
                          {competition.isOfficial && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                              OFFICIAL
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            competition.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            competition.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {competition.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{competition.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>👥 {competition.participantCount} participants</span>
                          <span>📅 Ends {new Date(competition.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard Preview */}
                  {leaderboard.length > 0 && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h4 className="text-sm font-bold text-foreground mb-2">Top Participants</h4>
                      <div className="space-y-2">
                        {leaderboard.slice(0, 5).map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-muted-foreground">#{entry.rank}</span>
                              <span className="text-foreground">{entry.userDisplayName || 'Anonymous'}</span>
                            </div>
                            <span className="font-medium text-foreground">{entry.score} pts</span>
                          </div>
                        ))}
                        {userRank > 0 && userRank > 5 && (
                          <div className="pt-2 border-t border-border text-sm text-muted-foreground">
                            Your rank: #{userRank}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Join/View Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Icon name="TrophyIcon" size={16} className="text-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                          {competition.competitionType} competition
                        </span>
                      </div>
                    </div>
                    {!isParticipating && competition.status === 'active' && (
                      <motion.button
                        onClick={() => handleJoinCompetition(competition.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm"
                      >
                        Join Competition
                      </motion.button>
                    )}
                    {isParticipating && (
                      <motion.button
                        onClick={() => {/* Navigate to competition detail page */}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium text-sm"
                      >
                        View Progress
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


