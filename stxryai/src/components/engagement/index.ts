/**
 * Engagement Components
 *
 * Components for user retention and engagement features:
 * - Reading Streaks
 * - Daily Challenges
 * - Activity Feed
 * - Milestone Celebrations
 * - Push Notifications
 */

// Activity Feed
export { ActivityFeed } from './ActivityFeed';
export type { default as ActivityFeedDefault } from './ActivityFeed';

// Daily Challenges
export { DailyChallenges } from './DailyChallenges';
export type { default as DailyChallengesDefault } from './DailyChallenges';

// Milestone Celebrations
export { MilestoneCelebration, MilestoneProgress } from './MilestoneCelebration';
export type { default as MilestoneCelebrationDefault } from './MilestoneCelebration';

// Re-export services for convenience
export { activityFeedService } from '@/services/activityFeedService';
export { dailyChallengeService } from '@/services/dailyChallengeService';
export { milestoneCelebrationService } from '@/services/milestoneCelebrationService';
export { pushNotificationService } from '@/services/pushNotificationService';
export { streakService } from '@/services/streakService';
