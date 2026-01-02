/**
 * Parent Dashboard & Literacy Tracking System
 * Comprehensive monitoring and progress tracking for children's literacy development
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ChildProfile {
  id: string;
  userId: string;
  parentId: string;
  name: string;
  age: number;
  gradeLevel: 'pre-k' | 'k' | '1' | '2' | '3' | '4' | '5';
  avatar: string;
  readingLevel: ReadingLevel;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  interests: string[];
  goals: LearningGoal[];
}

export interface ReadingLevel {
  current: string; // e.g., "2.5" for 2nd grade, 5th month
  lexileScore?: number;
  guidedReadingLevel?: string; // A-Z
  assessmentDate: Date;
  progress: 'below' | 'at' | 'above'; // grade level
}

export interface LiteracyProgress {
  childId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    wordsRead: number;
    storiesCompleted: number;
    readingTimeMinutes: number;
    vocabularyWordsLearned: number;
    comprehensionScore: number; // 0-100
    phonicsAccuracy: number; // 0-100
    fluencyScore: number; // words per minute
    engagementLevel: number; // 0-100
  };
  milestones: Milestone[];
  strengths: string[];
  areasForGrowth: string[];
}

export interface Milestone {
  id: string;
  childId: string;
  type: 'reading' | 'vocabulary' | 'comprehension' | 'writing' | 'phonics';
  title: string;
  description: string;
  achievedAt: Date;
  celebrationMessage: string;
}

export interface VocabularyProgress {
  childId: string;
  totalWordsLearned: number;
  wordsThisWeek: number;
  masteredWords: VocabularyWord[];
  learningWords: VocabularyWord[];
  difficultWords: VocabularyWord[];
  categories: {
    [category: string]: number; // count of words per category
  };
}

export interface VocabularyWord {
  word: string;
  definition: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  firstEncountered: Date;
  timesEncountered: number;
  masteryLevel: number; // 0-100
  contextSentences: string[];
  relatedWords: string[];
}

export interface ComprehensionAssessment {
  id: string;
  childId: string;
  storyId: string;
  completedAt: Date;
  questions: ComprehensionQuestion[];
  overallScore: number;
  skillBreakdown: {
    literalUnderstanding: number;
    inferentialThinking: number;
    criticalAnalysis: number;
    vocabularyInContext: number;
  };
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'sequencing';
  correctAnswer: string;
  childAnswer: string;
  isCorrect: boolean;
  skillTested: string;
}

export interface LearningGoal {
  id: string;
  childId: string;
  type: 'reading-time' | 'stories-completed' | 'vocabulary' | 'comprehension' | 'custom';
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: Date;
  status: 'active' | 'completed' | 'overdue';
  reward?: string;
}

export interface ReadingSession {
  id: string;
  childId: string;
  storyId: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  chaptersRead: number;
  wordsRead: number;
  pauseCount: number;
  helpRequested: number;
  comprehensionScore?: number;
  enjoymentRating?: number; // 1-5
  notes?: string;
}

export interface ParentInsight {
  id: string;
  childId: string;
  type: 'achievement' | 'concern' | 'recommendation' | 'milestone';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionable: boolean;
  suggestedActions?: string[];
  createdAt: Date;
  read: boolean;
}

export interface FamilyReadingStreak {
  familyId: string;
  currentStreak: number;
  longestStreak: number;
  lastReadingDate: Date;
  participants: {
    userId: string;
    contributionDays: number;
  }[];
  milestones: {
    days: number;
    unlockedAt: Date;
    reward: string;
  }[];
}

// ============================================================================
// LITERACY TRACKING
// ============================================================================

/**
 * Calculate literacy progress for a child
 */
export function calculateLiteracyProgress(
  sessions: ReadingSession[],
  assessments: ComprehensionAssessment[],
  vocabulary: VocabularyProgress,
  period: LiteracyProgress['period']
): LiteracyProgress['metrics'] {
  const totalWordsRead = sessions.reduce((sum, s) => sum + s.wordsRead, 0);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const storiesCompleted = new Set(sessions.map(s => s.storyId)).size;

  const avgComprehension = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length
    : 0;

  const avgEngagement = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.enjoymentRating || 3), 0) / sessions.length * 20
    : 0;

  // Calculate fluency (words per minute)
  const fluency = totalMinutes > 0 ? totalWordsRead / totalMinutes : 0;

  // Calculate phonics accuracy from assessments
  const phonicsAccuracy = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + a.skillBreakdown.vocabularyInContext, 0) / assessments.length
    : 0;

  return {
    wordsRead: totalWordsRead,
    storiesCompleted,
    readingTimeMinutes: totalMinutes,
    vocabularyWordsLearned: vocabulary.wordsThisWeek,
    comprehensionScore: Math.round(avgComprehension),
    phonicsAccuracy: Math.round(phonicsAccuracy),
    fluencyScore: Math.round(fluency),
    engagementLevel: Math.round(avgEngagement),
  };
}

/**
 * Identify learning strengths
 */
export function identifyStrengths(
  metrics: LiteracyProgress['metrics'],
  assessments: ComprehensionAssessment[]
): string[] {
  const strengths: string[] = [];

  if (metrics.comprehensionScore >= 85) {
    strengths.push('Excellent reading comprehension');
  }

  if (metrics.fluencyScore >= 100) {
    strengths.push('Strong reading fluency');
  }

  if (metrics.vocabularyWordsLearned >= 20) {
    strengths.push('Rapid vocabulary acquisition');
  }

  if (metrics.engagementLevel >= 80) {
    strengths.push('High engagement with reading');
  }

  if (assessments.length > 0) {
    const avgInferential = assessments.reduce(
      (sum, a) => sum + a.skillBreakdown.inferentialThinking, 0
    ) / assessments.length;

    if (avgInferential >= 85) {
      strengths.push('Advanced inferential thinking');
    }

    const avgCritical = assessments.reduce(
      (sum, a) => sum + a.skillBreakdown.criticalAnalysis, 0
    ) / assessments.length;

    if (avgCritical >= 85) {
      strengths.push('Strong critical analysis skills');
    }
  }

  return strengths;
}

/**
 * Identify areas for growth
 */
export function identifyAreasForGrowth(
  metrics: LiteracyProgress['metrics'],
  assessments: ComprehensionAssessment[]
): string[] {
  const areas: string[] = [];

  if (metrics.comprehensionScore < 70) {
    areas.push('Reading comprehension needs support');
  }

  if (metrics.fluencyScore < 60) {
    areas.push('Reading fluency could be improved');
  }

  if (metrics.phonicsAccuracy < 75) {
    areas.push('Phonics skills need reinforcement');
  }

  if (metrics.readingTimeMinutes < 100) { // Less than ~15 min/day for a week
    areas.push('Increase daily reading time');
  }

  if (assessments.length > 0) {
    const avgLiteral = assessments.reduce(
      (sum, a) => sum + a.skillBreakdown.literalUnderstanding, 0
    ) / assessments.length;

    if (avgLiteral < 75) {
      areas.push('Literal comprehension needs practice');
    }
  }

  return areas;
}

/**
 * Generate parent insights
 */
export function generateParentInsights(
  child: ChildProfile,
  progress: LiteracyProgress,
  recentSessions: ReadingSession[]
): ParentInsight[] {
  const insights: ParentInsight[] = [];

  // Achievement insights
  if (progress.metrics.storiesCompleted >= 5) {
    insights.push({
      id: crypto.randomUUID(),
      childId: child.id,
      type: 'achievement',
      priority: 'medium',
      title: 'Reading Milestone Reached!',
      message: `${child.name} has completed ${progress.metrics.storiesCompleted} stories this ${progress.period}!`,
      actionable: false,
      createdAt: new Date(),
      read: false,
    });
  }

  // Vocabulary growth
  if (progress.metrics.vocabularyWordsLearned >= 15) {
    insights.push({
      id: crypto.randomUUID(),
      childId: child.id,
      type: 'achievement',
      priority: 'medium',
      title: 'Vocabulary Expansion',
      message: `${child.name} learned ${progress.metrics.vocabularyWordsLearned} new words!`,
      actionable: false,
      createdAt: new Date(),
      read: false,
    });
  }

  // Concern: Low engagement
  if (progress.metrics.engagementLevel < 50) {
    insights.push({
      id: crypto.randomUUID(),
      childId: child.id,
      type: 'concern',
      priority: 'high',
      title: 'Engagement Could Be Higher',
      message: `${child.name}'s engagement level is lower than usual. Consider trying stories that match their interests.`,
      actionable: true,
      suggestedActions: [
        'Explore stories about ' + child.interests.join(', '),
        'Try co-reading together',
        'Let them choose their own stories',
      ],
      createdAt: new Date(),
      read: false,
    });
  }

  // Recommendation: Reading time
  if (progress.metrics.readingTimeMinutes < 100 && progress.period === 'weekly') {
    insights.push({
      id: crypto.randomUUID(),
      childId: child.id,
      type: 'recommendation',
      priority: 'medium',
      title: 'Increase Reading Time',
      message: `${child.name} read for ${progress.metrics.readingTimeMinutes} minutes this week. Aim for 20 minutes daily.`,
      actionable: true,
      suggestedActions: [
        'Set a daily reading routine',
        'Create a cozy reading space',
        'Join family reading circles',
      ],
      createdAt: new Date(),
      read: false,
    });
  }

  // Milestone: Comprehension improvement
  if (progress.metrics.comprehensionScore >= 85) {
    insights.push({
      id: crypto.randomUUID(),
      childId: child.id,
      type: 'milestone',
      priority: 'high',
      title: 'Comprehension Excellence!',
      message: `${child.name} is showing excellent reading comprehension with a score of ${progress.metrics.comprehensionScore}%!`,
      actionable: false,
      createdAt: new Date(),
      read: false,
    });
  }

  return insights;
}

/**
 * Track vocabulary mastery
 */
export function updateVocabularyMastery(
  word: VocabularyWord,
  wasCorrect: boolean
): VocabularyWord {
  const updated = { ...word };
  updated.timesEncountered++;

  if (wasCorrect) {
    updated.masteryLevel = Math.min(100, updated.masteryLevel + 10);
  } else {
    updated.masteryLevel = Math.max(0, updated.masteryLevel - 5);
  }

  return updated;
}

/**
 * Recommend next reading level
 */
export function recommendNextLevel(
  currentLevel: ReadingLevel,
  recentProgress: LiteracyProgress
): {
  shouldAdvance: boolean;
  recommendation: string;
  reasoning: string;
} {
  const metrics = recentProgress.metrics;

  // Criteria for advancing
  const highComprehension = metrics.comprehensionScore >= 85;
  const goodFluency = metrics.fluencyScore >= 80;
  const strongEngagement = metrics.engagementLevel >= 70;
  const sufficientPractice = metrics.storiesCompleted >= 5;

  const shouldAdvance = highComprehension && goodFluency && strongEngagement && sufficientPractice;

  if (shouldAdvance) {
    return {
      shouldAdvance: true,
      recommendation: 'Ready to advance to next reading level',
      reasoning: 'Showing consistent mastery across all literacy metrics',
    };
  } else if (!highComprehension) {
    return {
      shouldAdvance: false,
      recommendation: 'Continue at current level',
      reasoning: 'Focus on building comprehension skills before advancing',
    };
  } else if (!goodFluency) {
    return {
      shouldAdvance: false,
      recommendation: 'Continue at current level',
      reasoning: 'Practice reading fluency with current level materials',
    };
  } else {
    return {
      shouldAdvance: false,
      recommendation: 'Continue at current level',
      reasoning: 'Build confidence with more practice at this level',
    };
  }
}

/**
 * Generate progress report
 */
export function generateProgressReport(
  child: ChildProfile,
  weeklyProgress: LiteracyProgress,
  monthlyProgress: LiteracyProgress,
  vocabulary: VocabularyProgress
): {
  summary: string;
  highlights: string[];
  recommendations: string[];
  nextSteps: string[];
} {
  const highlights: string[] = [];
  const recommendations: string[] = [];

  // Analyze weekly progress
  if (weeklyProgress.metrics.storiesCompleted > 0) {
    highlights.push(`Read ${weeklyProgress.metrics.storiesCompleted} stories this week`);
  }

  if (weeklyProgress.metrics.vocabularyWordsLearned > 0) {
    highlights.push(`Learned ${weeklyProgress.metrics.vocabularyWordsLearned} new words`);
  }

  // Compare to monthly trends
  const weeklyAvg = monthlyProgress.metrics.readingTimeMinutes / 4;
  if (weeklyProgress.metrics.readingTimeMinutes > weeklyAvg * 1.2) {
    highlights.push('Reading time increased significantly');
  }

  // Generate recommendations
  if (weeklyProgress.strengths.length > 0) {
    recommendations.push(`Continue building on strengths: ${weeklyProgress.strengths.join(', ')}`);
  }

  if (weeklyProgress.areasForGrowth.length > 0) {
    recommendations.push(`Focus areas: ${weeklyProgress.areasForGrowth.join(', ')}`);
  }

  const summary = `${child.name} is making ${
    weeklyProgress.metrics.comprehensionScore >= 80 ? 'excellent' : 
    weeklyProgress.metrics.comprehensionScore >= 70 ? 'good' : 'steady'
  } progress in their literacy journey.`;

  const nextSteps = [
    'Continue daily reading practice',
    'Explore stories matching interests: ' + child.interests.slice(0, 2).join(', '),
    'Practice vocabulary words in context',
    'Engage in family reading activities',
  ];

  return {
    summary,
    highlights,
    recommendations,
    nextSteps,
  };
}

/**
 * Calculate family reading streak
 */
export function updateFamilyStreak(
  streak: FamilyReadingStreak,
  readingDate: Date,
  userId: string
): FamilyReadingStreak {
  const lastDate = new Date(streak.lastReadingDate);
  const daysSince = Math.floor(
    (readingDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const updated = { ...streak };

  if (daysSince === 1) {
    // Consecutive day
    updated.currentStreak++;
    updated.longestStreak = Math.max(updated.currentStreak, updated.longestStreak);
  } else if (daysSince === 0) {
    // Same day, just update participant
  } else {
    // Streak broken
    updated.currentStreak = 1;
  }

  updated.lastReadingDate = readingDate;

  // Update participant contribution
  const participant = updated.participants.find(p => p.userId === userId);
  if (participant) {
    participant.contributionDays++;
  } else {
    updated.participants.push({
      userId,
      contributionDays: 1,
    });
  }

  // Check for milestone unlocks
  const milestoneThresholds = [7, 14, 30, 60, 100, 365];
  for (const threshold of milestoneThresholds) {
    if (updated.currentStreak === threshold) {
      updated.milestones.push({
        days: threshold,
        unlockedAt: readingDate,
        reward: `${threshold}-Day Reading Streak Badge`,
      });
    }
  }

  return updated;
}

/**
 * Get age-appropriate content recommendations
 */
export function getContentRecommendations(child: ChildProfile): {
  difficulty: string;
  themes: string[];
  contentTypes: string[];
  learningFocus: string[];
} {
  const recommendations = {
    'pre-k': {
      difficulty: 'Picture books with simple words',
      themes: ['Colors', 'Shapes', 'Animals', 'Family', 'Emotions'],
      contentTypes: ['Interactive stories', 'Rhyming books', 'Counting stories'],
      learningFocus: ['Letter recognition', 'Phonemic awareness', 'Vocabulary building'],
    },
    'k': {
      difficulty: 'Early readers with sight words',
      themes: ['Friendship', 'School', 'Nature', 'Community helpers', 'Celebrations'],
      contentTypes: ['Predictable text', 'Pattern books', 'Simple narratives'],
      learningFocus: ['Phonics', 'Sight words', 'Basic comprehension'],
    },
    '1': {
      difficulty: 'Beginning chapter books',
      themes: ['Adventure', 'Problem-solving', 'Kindness', 'Courage', 'Discovery'],
      contentTypes: ['Short chapters', 'Series books', 'Illustrated stories'],
      learningFocus: ['Fluency', 'Comprehension strategies', 'Vocabulary expansion'],
    },
    '2': {
      difficulty: 'Transitional readers',
      themes: ['Mystery', 'Fantasy', 'Historical figures', 'Science', 'Culture'],
      contentTypes: ['Chapter books', 'Graphic novels', 'Non-fiction'],
      learningFocus: ['Inferential thinking', 'Context clues', 'Story elements'],
    },
    '3': {
      difficulty: 'Intermediate readers',
      themes: ['Complex plots', 'Character development', 'Social issues', 'Innovation'],
      contentTypes: ['Novels', 'Biographies', 'Informational texts'],
      learningFocus: ['Critical thinking', 'Analysis', 'Advanced vocabulary'],
    },
    '4': {
      difficulty: 'Advanced readers',
      themes: ['Multiple perspectives', 'Historical events', 'Scientific concepts', 'Leadership'],
      contentTypes: ['Complex narratives', 'Research-based texts', 'Argumentative texts'],
      learningFocus: ['Synthesis', 'Evaluation', 'Academic vocabulary'],
    },
    '5': {
      difficulty: 'Proficient readers',
      themes: ['Abstract concepts', 'Global issues', 'Philosophy', 'Innovation'],
      contentTypes: ['Young adult literature', 'Technical texts', 'Literary analysis'],
      learningFocus: ['Advanced analysis', 'Argumentation', 'Research skills'],
    },
  };

  return recommendations[child.gradeLevel] || recommendations['k'];
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  calculateLiteracyProgress,
  identifyStrengths,
  identifyAreasForGrowth,
  generateParentInsights,
  updateVocabularyMastery,
  recommendNextLevel,
  generateProgressReport,
  updateFamilyStreak,
  getContentRecommendations,
};
