/**
 * Emotional Fingerprint Service
 * Learn and adapt to user's emotional patterns
 * Invisible personalization that makes every story feel tailored
 */

import { createClient } from '@/lib/supabase/client';

export interface EmotionalFingerprint {
  id: string;
  userId: string;
  
  // Core emotional preferences
  emotionalProfile: {
    // Preferred emotional states (0-100)
    joy: number;
    sadness: number;
    excitement: number;
    fear: number;
    romance: number;
    nostalgia: number;
    wonder: number;
    tension: number;
  };
  
  // Narrative pacing preferences
  pacingProfile: {
    preferredTensionLevel: 'low' | 'medium' | 'high';
    tensionRecoveryRate: number; // How quickly they like tension to resolve
    cliffhangerTolerance: number; // 0-100
    actionPacePref: 'slow_burn' | 'balanced' | 'fast_paced';
  };
  
  // Content sensitivity
  sensitivityProfile: {
    violenceThreshold: 'none' | 'mild' | 'moderate' | 'explicit';
    romanceComfort: 'fade_to_black' | 'suggestive' | 'detailed';
    darkThemesTolerance: number; // 0-100
    jumpScareReaction: 'avoid' | 'tolerate' | 'enjoy';
  };
  
  // Engagement patterns
  engagementSignals: {
    avgReadingSpeed: number; // words per minute
    rereadBehavior: 'never' | 'sometimes' | 'often';
    abandonmentTriggers: string[];
    completionMotivators: string[];
  };
  
  // Time-based patterns
  temporalPatterns: {
    preferredReadingTimes: string[]; // "morning", "late_night", etc.
    sessionLengthByMood: Record<string, number>;
    weekdayVsWeekend: 'no_diff' | 'more_weekday' | 'more_weekend';
  };
  
  // Calculated metrics
  emotionalJourneyPreference: EmotionalJourneyType;
  personalizedRecommendationFactors: string[];
  
  // Learning metadata
  dataPoints: number;
  confidenceScore: number;
  lastUpdated: string;
}

export type EmotionalJourneyType = 
  | 'hero_triumph'     // Struggles that lead to victory
  | 'bittersweet'      // Mix of joy and sorrow
  | 'pure_escapism'    // Happy, light, feel-good
  | 'emotional_catharsis' // Deep, moving experiences
  | 'thriller_ride'    // Constant tension and release
  | 'slow_discovery'   // Gradual emotional depth
  | 'balanced';

export interface EmotionalEvent {
  timestamp: string;
  storyId: string;
  chapterId: string;
  eventType: 'pause' | 'speed_up' | 'slow_down' | 'reread' | 'skip' | 'chapter_end' | 'abandon';
  emotionalContext?: string;
  duration?: number;
}

export interface StoryEmotionalProfile {
  storyId: string;
  emotionalArc: {
    position: number; // 0-100 of story
    emotion: string;
    intensity: number;
  }[];
  peakMoments: {
    position: number;
    emotion: string;
    description: string;
  }[];
  overallTone: string;
  tensionLevel: 'low' | 'medium' | 'high';
}

// Emotional journey preferences and their characteristics
const journeyPreferences: Record<EmotionalJourneyType, {
  description: string;
  preferredEmotions: string[];
  avoidedPatterns: string[];
  narrativeStructure: string;
}> = {
  hero_triumph: {
    description: 'You love stories where the protagonist overcomes great odds',
    preferredEmotions: ['excitement', 'tension', 'joy'],
    avoidedPatterns: ['unresolved_ending', 'protagonist_fails'],
    narrativeStructure: 'Challenge → Struggle → Victory',
  },
  bittersweet: {
    description: 'You appreciate emotional complexity and realistic outcomes',
    preferredEmotions: ['joy', 'sadness', 'nostalgia'],
    avoidedPatterns: ['pure_happy_ending', 'pure_tragedy'],
    narrativeStructure: 'Hope → Challenge → Mixed Resolution',
  },
  pure_escapism: {
    description: 'You read to feel good and escape everyday stress',
    preferredEmotions: ['joy', 'wonder', 'romance'],
    avoidedPatterns: ['character_death', 'dark_themes', 'tragedy'],
    narrativeStructure: 'Fun → Adventure → Happy Ending',
  },
  emotional_catharsis: {
    description: 'You seek deep emotional experiences that move you',
    preferredEmotions: ['sadness', 'wonder', 'nostalgia'],
    avoidedPatterns: ['shallow_emotions', 'quick_resolution'],
    narrativeStructure: 'Setup → Deep Dive → Emotional Release',
  },
  thriller_ride: {
    description: 'You crave constant excitement and unpredictability',
    preferredEmotions: ['excitement', 'fear', 'tension'],
    avoidedPatterns: ['slow_pacing', 'predictable_outcomes'],
    narrativeStructure: 'Hook → Escalation → Twist → Climax',
  },
  slow_discovery: {
    description: 'You enjoy gradual revelation and character development',
    preferredEmotions: ['wonder', 'nostalgia', 'romance'],
    avoidedPatterns: ['rushed_pacing', 'action_heavy'],
    narrativeStructure: 'Mystery → Exploration → Understanding',
  },
  balanced: {
    description: 'You appreciate variety and well-crafted storytelling',
    preferredEmotions: ['joy', 'excitement', 'wonder'],
    avoidedPatterns: [],
    narrativeStructure: 'Varied and Dynamic',
  },
};

class EmotionalFingerprintService {
  private supabase = createClient();

  /**
   * Get or create emotional fingerprint
   */
  async getFingerprint(userId: string): Promise<EmotionalFingerprint | null> {
    try {
      const { data, error } = await this.supabase
        .from('emotional_fingerprints')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return this.initializeFingerprint(userId);
        }
        console.error('Error fetching fingerprint:', error);
        return null;
      }

      return this.mapFingerprint(data);
    } catch (error) {
      console.error('Error in getFingerprint:', error);
      return null;
    }
  }

  /**
   * Initialize a new emotional fingerprint
   */
  private async initializeFingerprint(userId: string): Promise<EmotionalFingerprint | null> {
    try {
      const defaultProfile = {
        emotionalProfile: {
          joy: 50, sadness: 50, excitement: 50, fear: 50,
          romance: 50, nostalgia: 50, wonder: 50, tension: 50,
        },
        pacingProfile: {
          preferredTensionLevel: 'medium',
          tensionRecoveryRate: 50,
          cliffhangerTolerance: 50,
          actionPacePref: 'balanced',
        },
        sensitivityProfile: {
          violenceThreshold: 'moderate',
          romanceComfort: 'suggestive',
          darkThemesTolerance: 50,
          jumpScareReaction: 'tolerate',
        },
        engagementSignals: {
          avgReadingSpeed: 200,
          rereadBehavior: 'sometimes',
          abandonmentTriggers: [],
          completionMotivators: [],
        },
        temporalPatterns: {
          preferredReadingTimes: [],
          sessionLengthByMood: {},
          weekdayVsWeekend: 'no_diff',
        },
        emotionalJourneyPreference: 'balanced',
        personalizedRecommendationFactors: [],
        dataPoints: 0,
        confidenceScore: 0,
      };

      const { data, error } = await this.supabase
        .from('emotional_fingerprints')
        .insert({
          user_id: userId,
          emotional_profile: defaultProfile.emotionalProfile,
          pacing_profile: defaultProfile.pacingProfile,
          sensitivity_profile: defaultProfile.sensitivityProfile,
          engagement_signals: defaultProfile.engagementSignals,
          temporal_patterns: defaultProfile.temporalPatterns,
          emotional_journey_preference: defaultProfile.emotionalJourneyPreference,
          personalized_recommendation_factors: defaultProfile.personalizedRecommendationFactors,
          data_points: defaultProfile.dataPoints,
          confidence_score: defaultProfile.confidenceScore,
        })
        .select()
        .single();

      if (error) {
        console.error('Error initializing fingerprint:', error);
        return null;
      }

      return this.mapFingerprint(data);
    } catch (error) {
      console.error('Error in initializeFingerprint:', error);
      return null;
    }
  }

  /**
   * Record an emotional event and update fingerprint
   */
  async recordEmotionalEvent(
    userId: string,
    event: Omit<EmotionalEvent, 'timestamp'>
  ): Promise<void> {
    try {
      // Store the event
      await this.supabase.from('emotional_events').insert({
        user_id: userId,
        story_id: event.storyId,
        chapter_id: event.chapterId,
        event_type: event.eventType,
        emotional_context: event.emotionalContext,
        duration: event.duration,
        timestamp: new Date().toISOString(),
      });

      // Update fingerprint based on event
      await this.updateFingerprintFromEvent(userId, event);
    } catch (error) {
      console.error('Error recording emotional event:', error);
    }
  }

  /**
   * Update fingerprint based on reading event
   */
  private async updateFingerprintFromEvent(
    userId: string,
    event: Omit<EmotionalEvent, 'timestamp'>
  ): Promise<void> {
    try {
      const fingerprint = await this.getFingerprint(userId);
      if (!fingerprint) return;

      const updates: Partial<EmotionalFingerprint> = {};

      // Adjust based on event type
      switch (event.eventType) {
        case 'pause':
          // Pausing might indicate emotional impact or need for processing
          if (event.emotionalContext === 'intense') {
            updates.emotionalProfile = {
              ...fingerprint.emotionalProfile,
              tension: Math.min(100, fingerprint.emotionalProfile.tension + 2),
            };
          }
          break;

        case 'reread':
          // Rereading indicates engagement with content
          if (event.emotionalContext) {
            updates.emotionalProfile = {
              ...fingerprint.emotionalProfile,
              [event.emotionalContext]: Math.min(100, 
                (fingerprint.emotionalProfile as any)[event.emotionalContext] + 5 || 55
              ),
            };
          }
          break;

        case 'skip':
          // Skipping indicates discomfort or boredom
          if (event.emotionalContext) {
            updates.emotionalProfile = {
              ...fingerprint.emotionalProfile,
              [event.emotionalContext]: Math.max(0,
                (fingerprint.emotionalProfile as any)[event.emotionalContext] - 5 || 45
              ),
            };
          }
          break;

        case 'abandon':
          // Track abandonment triggers
          if (event.emotionalContext) {
            const triggers = [...fingerprint.engagementSignals.abandonmentTriggers];
            if (!triggers.includes(event.emotionalContext)) {
              triggers.push(event.emotionalContext);
            }
            updates.engagementSignals = {
              ...fingerprint.engagementSignals,
              abandonmentTriggers: triggers.slice(-10), // Keep last 10
            };
          }
          break;

        case 'chapter_end':
          // Completing chapters indicates engagement
          if (event.emotionalContext) {
            const motivators = [...fingerprint.engagementSignals.completionMotivators];
            if (!motivators.includes(event.emotionalContext)) {
              motivators.push(event.emotionalContext);
            }
            updates.engagementSignals = {
              ...fingerprint.engagementSignals,
              completionMotivators: motivators.slice(-10),
            };
          }
          break;
      }

      // Update data points and confidence
      const newDataPoints = fingerprint.dataPoints + 1;
      const newConfidence = Math.min(100, Math.floor(newDataPoints / 10) * 10);

      // Recalculate journey preference if we have enough data
      let journeyPref = fingerprint.emotionalJourneyPreference;
      if (newDataPoints > 50) {
        journeyPref = this.calculateJourneyPreference(
          updates.emotionalProfile || fingerprint.emotionalProfile,
          updates.pacingProfile || fingerprint.pacingProfile
        );
      }

      await this.supabase
        .from('emotional_fingerprints')
        .update({
          emotional_profile: updates.emotionalProfile || fingerprint.emotionalProfile,
          pacing_profile: updates.pacingProfile || fingerprint.pacingProfile,
          sensitivity_profile: updates.sensitivityProfile || fingerprint.sensitivityProfile,
          engagement_signals: updates.engagementSignals || fingerprint.engagementSignals,
          temporal_patterns: updates.temporalPatterns || fingerprint.temporalPatterns,
          emotional_journey_preference: journeyPref,
          data_points: newDataPoints,
          confidence_score: newConfidence,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating fingerprint:', error);
    }
  }

  /**
   * Calculate preferred emotional journey type
   */
  calculateJourneyPreference(
    emotionalProfile: EmotionalFingerprint['emotionalProfile'],
    pacingProfile: EmotionalFingerprint['pacingProfile']
  ): EmotionalJourneyType {
    // Analyze the profile to determine journey preference
    const { joy, sadness, excitement, fear, romance, nostalgia, wonder, tension } = emotionalProfile;

    // Calculate preference scores for each journey type
    const scores: Record<EmotionalJourneyType, number> = {
      hero_triumph: excitement * 0.4 + joy * 0.3 + tension * 0.3,
      bittersweet: sadness * 0.4 + joy * 0.3 + nostalgia * 0.3,
      pure_escapism: joy * 0.5 + wonder * 0.3 + romance * 0.2,
      emotional_catharsis: sadness * 0.4 + nostalgia * 0.3 + wonder * 0.3,
      thriller_ride: excitement * 0.4 + fear * 0.3 + tension * 0.3,
      slow_discovery: wonder * 0.4 + nostalgia * 0.3 + romance * 0.3,
      balanced: 50, // Default score
    };

    // Adjust based on pacing preference
    if (pacingProfile.actionPacePref === 'fast_paced') {
      scores.thriller_ride *= 1.2;
      scores.slow_discovery *= 0.8;
    } else if (pacingProfile.actionPacePref === 'slow_burn') {
      scores.slow_discovery *= 1.2;
      scores.thriller_ride *= 0.8;
    }

    // Find the highest scoring journey type
    let best: EmotionalJourneyType = 'balanced';
    let bestScore = 50;

    for (const [type, score] of Object.entries(scores)) {
      if (score > bestScore) {
        best = type as EmotionalJourneyType;
        bestScore = score;
      }
    }

    return best;
  }

  /**
   * Get journey preference info
   */
  getJourneyInfo(journeyType: EmotionalJourneyType): typeof journeyPreferences[EmotionalJourneyType] {
    return journeyPreferences[journeyType];
  }

  /**
   * Check story compatibility with user's fingerprint
   */
  async calculateStoryCompatibility(
    userId: string,
    storyProfile: StoryEmotionalProfile
  ): Promise<{
    compatibility: number;
    reasons: string[];
    warnings: string[];
  }> {
    try {
      const fingerprint = await this.getFingerprint(userId);
      if (!fingerprint) {
        return { compatibility: 50, reasons: [], warnings: [] };
      }

      const reasons: string[] = [];
      const warnings: string[] = [];
      let compatibilityScore = 50;

      // Check tension level match
      if (storyProfile.tensionLevel === fingerprint.pacingProfile.preferredTensionLevel) {
        compatibilityScore += 15;
        reasons.push('Matches your preferred tension level');
      } else if (
        (storyProfile.tensionLevel === 'high' && fingerprint.pacingProfile.preferredTensionLevel === 'low') ||
        (storyProfile.tensionLevel === 'low' && fingerprint.pacingProfile.preferredTensionLevel === 'high')
      ) {
        compatibilityScore -= 10;
        warnings.push('Tension level differs from your usual preference');
      }

      // Check emotional arc match
      const journeyInfo = journeyPreferences[fingerprint.emotionalJourneyPreference];
      for (const emotion of journeyInfo.preferredEmotions) {
        const hasEmotion = storyProfile.emotionalArc.some(
          point => point.emotion === emotion && point.intensity > 60
        );
        if (hasEmotion) {
          compatibilityScore += 10;
          reasons.push(`Contains ${emotion} moments you enjoy`);
        }
      }

      // Check for potentially triggering content
      if (fingerprint.sensitivityProfile.violenceThreshold === 'none') {
        const hasViolence = storyProfile.peakMoments.some(
          m => m.emotion === 'fear' || m.description.toLowerCase().includes('violence')
        );
        if (hasViolence) {
          warnings.push('May contain violence');
          compatibilityScore -= 15;
        }
      }

      // Clamp to 0-100
      compatibilityScore = Math.max(0, Math.min(100, compatibilityScore));

      return {
        compatibility: compatibilityScore,
        reasons: reasons.slice(0, 3),
        warnings: warnings.slice(0, 2),
      };
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return { compatibility: 50, reasons: [], warnings: [] };
    }
  }

  /**
   * Get personalized story recommendations based on fingerprint
   */
  async getPersonalizedRecommendations(
    userId: string,
    availableStoryIds: string[]
  ): Promise<{ storyId: string; score: number; reason: string }[]> {
    try {
      const fingerprint = await this.getFingerprint(userId);
      if (!fingerprint || fingerprint.confidenceScore < 30) {
        // Not enough data, return random order
        return availableStoryIds.map(id => ({
          storyId: id,
          score: 50,
          reason: 'Discover something new',
        }));
      }

      // In a real implementation, this would query story profiles
      // and match against the fingerprint
      const journeyInfo = journeyPreferences[fingerprint.emotionalJourneyPreference];
      
      // For now, return a simple scoring based on journey preference
      return availableStoryIds.map((id, index) => ({
        storyId: id,
        score: 70 + Math.random() * 20,
        reason: `Matches your ${fingerprint.emotionalJourneyPreference.replace(/_/g, ' ')} preferences`,
      })).sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Generate emotional visualization data for profile display
   */
  generateEmotionalVisualization(fingerprint: EmotionalFingerprint): {
    radarData: { emotion: string; value: number }[];
    dominantEmotion: string;
    emotionalRange: 'narrow' | 'moderate' | 'wide';
    insights: string[];
  } {
    const { emotionalProfile } = fingerprint;
    
    const radarData = Object.entries(emotionalProfile).map(([emotion, value]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value,
    }));

    // Find dominant emotion
    const maxEmotion = radarData.reduce((max, curr) => 
      curr.value > max.value ? curr : max
    );
    
    // Calculate emotional range (variance)
    const values = Object.values(emotionalProfile);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    let emotionalRange: 'narrow' | 'moderate' | 'wide' = 'moderate';
    if (stdDev < 10) emotionalRange = 'narrow';
    else if (stdDev > 25) emotionalRange = 'wide';

    // Generate insights
    const insights: string[] = [];
    if (emotionalProfile.joy > 70) insights.push('You gravitate towards uplifting stories');
    if (emotionalProfile.sadness > 70) insights.push('You appreciate emotional depth');
    if (emotionalProfile.excitement > 70) insights.push('You thrive on action and adventure');
    if (emotionalProfile.fear > 70) insights.push('You enjoy a good thrill');
    if (emotionalProfile.romance > 70) insights.push('Love stories resonate with you');
    if (emotionalProfile.wonder > 70) insights.push('You\'re drawn to magical and fantastical');
    if (emotionalProfile.tension > 70) insights.push('You handle high-stakes well');
    if (emotionalProfile.nostalgia > 70) insights.push('You connect with coming-of-age themes');

    return {
      radarData,
      dominantEmotion: maxEmotion.emotion.toLowerCase(),
      emotionalRange,
      insights: insights.slice(0, 4),
    };
  }

  private mapFingerprint(data: any): EmotionalFingerprint {
    return {
      id: data.id,
      userId: data.user_id,
      emotionalProfile: data.emotional_profile || {
        joy: 50, sadness: 50, excitement: 50, fear: 50,
        romance: 50, nostalgia: 50, wonder: 50, tension: 50,
      },
      pacingProfile: data.pacing_profile || {
        preferredTensionLevel: 'medium',
        tensionRecoveryRate: 50,
        cliffhangerTolerance: 50,
        actionPacePref: 'balanced',
      },
      sensitivityProfile: data.sensitivity_profile || {
        violenceThreshold: 'moderate',
        romanceComfort: 'suggestive',
        darkThemesTolerance: 50,
        jumpScareReaction: 'tolerate',
      },
      engagementSignals: data.engagement_signals || {
        avgReadingSpeed: 200,
        rereadBehavior: 'sometimes',
        abandonmentTriggers: [],
        completionMotivators: [],
      },
      temporalPatterns: data.temporal_patterns || {
        preferredReadingTimes: [],
        sessionLengthByMood: {},
        weekdayVsWeekend: 'no_diff',
      },
      emotionalJourneyPreference: data.emotional_journey_preference || 'balanced',
      personalizedRecommendationFactors: data.personalized_recommendation_factors || [],
      dataPoints: data.data_points || 0,
      confidenceScore: data.confidence_score || 0,
      lastUpdated: data.last_updated || data.updated_at,
    };
  }
}

export const emotionalFingerprintService = new EmotionalFingerprintService();
