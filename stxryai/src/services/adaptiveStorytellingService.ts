/**
 * Adaptive Storytelling Service
 * Manages AI-powered story personalization, choice prediction, and dynamic adaptation
 */

import { createClient } from '@/lib/supabase/client';

export interface UserReadingPreferences {
  id: string;
  userId: string;
  preferredPacing: 'slow' | 'medium' | 'fast';
  preferredNarrativeStyle: string[];
  preferredGenreTags: string[];
  preferredContentRating: 'all' | 'pg' | 'pg13' | 'mature';
  preferredThemes: string[];
  preferredTone: string[];
  preferredChoiceFrequency: 'low' | 'medium' | 'high';
  preferredChoiceComplexity: 'simple' | 'medium' | 'complex';
  preferredBranchingDepth: 'shallow' | 'medium' | 'deep';
  aiPersonalityProfile: Record<string, any>;
  readingPatterns: Record<string, any>;
  engagementPatterns: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StoryAdaptation {
  id: string;
  userId: string;
  storyId: string;
  chapterId?: string;
  adaptationType: 'pacing' | 'tone' | 'complexity' | 'content' | 'narrative_style' | 'choice_prediction';
  originalContent?: string;
  adaptedContent?: string;
  adaptationReason?: string;
  aiModel: string;
  confidenceScore?: number;
  adaptationParameters: Record<string, any>;
  userFeedback?: 'positive' | 'neutral' | 'negative';
  userRating?: number;
  createdAt: string;
}

export interface ChoicePrediction {
  id: string;
  userId: string;
  storyId: string;
  chapterId: string;
  choiceId?: string;
  choiceText?: string;
  choiceOptions: any[];
  predictedChoiceIndex?: number;
  predictedChoiceText?: string;
  predictionConfidence?: number;
  actualChoiceIndex?: number;
  actualChoiceText?: string;
  wasCorrect?: boolean;
  modelVersion: string;
  predictionFeatures: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizedNarrativePath {
  id: string;
  userId: string;
  storyId: string;
  pathName?: string;
  pathDescription?: string;
  isActive: boolean;
  personalizationFactors: Record<string, any>;
  adaptationSummary?: string;
  currentChapterId?: string;
  pathProgress: number;
  engagementScore: number;
  completionLikelihood?: number;
  createdAt: string;
  updatedAt: string;
}

export class AdaptiveStorytellingService {
  private supabase = createClient();

  // ========================================
  // USER READING PREFERENCES
  // ========================================

  /**
   * Get or create user reading preferences
   */
  async getUserPreferences(userId: string): Promise<UserReadingPreferences | null> {
    const { data, error } = await this.supabase
      .from('user_reading_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapPreferences(data);
  }

  /**
   * Update user reading preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<UserReadingPreferences>
  ): Promise<UserReadingPreferences> {
    const { data, error } = await this.supabase
      .from('user_reading_preferences')
      .upsert({
        user_id: userId,
        preferred_pacing: preferences.preferredPacing,
        preferred_narrative_style: preferences.preferredNarrativeStyle,
        preferred_genre_tags: preferences.preferredGenreTags,
        preferred_content_rating: preferences.preferredContentRating,
        preferred_themes: preferences.preferredThemes,
        preferred_tone: preferences.preferredTone,
        preferred_choice_frequency: preferences.preferredChoiceFrequency,
        preferred_choice_complexity: preferences.preferredChoiceComplexity,
        preferred_branching_depth: preferences.preferredBranchingDepth,
        ai_personality_profile: preferences.aiPersonalityProfile,
        reading_patterns: preferences.readingPatterns,
        engagement_patterns: preferences.engagementPatterns,
        metadata: preferences.metadata,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapPreferences(data);
  }

  /**
   * Get user reading profile (for AI)
   */
  async getUserReadingProfile(userId: string): Promise<any> {
    const { data, error } = await this.supabase.rpc('get_user_reading_profile', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  // ========================================
  // STORY ADAPTATIONS
  // ========================================

  /**
   * Log a story adaptation
   */
  async logAdaptation(
    userId: string,
    storyId: string,
    adaptation: Partial<StoryAdaptation>
  ): Promise<StoryAdaptation> {
    const { data, error } = await this.supabase
      .from('story_adaptation_log')
      .insert({
        user_id: userId,
        story_id: storyId,
        chapter_id: adaptation.chapterId,
        adaptation_type: adaptation.adaptationType,
        original_content: adaptation.originalContent,
        adapted_content: adaptation.adaptedContent,
        adaptation_reason: adaptation.adaptationReason,
        ai_model: adaptation.aiModel || 'gpt-4',
        confidence_score: adaptation.confidenceScore,
        adaptation_parameters: adaptation.adaptationParameters || {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapAdaptation(data);
  }

  /**
   * Get user's adaptation history
   */
  async getUserAdaptations(
    userId: string,
    storyId?: string
  ): Promise<StoryAdaptation[]> {
    let query = this.supabase
      .from('story_adaptation_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapAdaptation(item));
  }

  /**
   * Provide feedback on an adaptation
   */
  async provideAdaptationFeedback(
    adaptationId: string,
    feedback: 'positive' | 'neutral' | 'negative',
    rating?: number
  ): Promise<StoryAdaptation> {
    const { data, error } = await this.supabase
      .from('story_adaptation_log')
      .update({
        user_feedback: feedback,
        user_rating: rating,
      })
      .eq('id', adaptationId)
      .select()
      .single();

    if (error) throw error;
    return this.mapAdaptation(data);
  }

  // ========================================
  // CHOICE PREDICTIONS
  // ========================================

  /**
   * Create a choice prediction
   */
  async createChoicePrediction(
    userId: string,
    storyId: string,
    chapterId: string,
    prediction: Partial<ChoicePrediction>
  ): Promise<ChoicePrediction> {
    const { data, error } = await this.supabase
      .from('choice_predictions')
      .insert({
        user_id: userId,
        story_id: storyId,
        chapter_id: chapterId,
        choice_id: prediction.choiceId,
        choice_text: prediction.choiceText,
        choice_options: prediction.choiceOptions || [],
        predicted_choice_index: prediction.predictedChoiceIndex,
        predicted_choice_text: prediction.predictedChoiceText,
        prediction_confidence: prediction.predictionConfidence,
        model_version: prediction.modelVersion || 'v1',
        prediction_features: prediction.predictionFeatures || {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapChoicePrediction(data);
  }

  /**
   * Update prediction with actual choice
   */
  async updatePredictionWithActualChoice(
    predictionId: string,
    actualChoiceIndex: number,
    actualChoiceText: string
  ): Promise<ChoicePrediction> {
    const { data, error } = await this.supabase
      .from('choice_predictions')
      .update({
        actual_choice_index: actualChoiceIndex,
        actual_choice_text: actualChoiceText,
      })
      .eq('id', predictionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapChoicePrediction(data);
  }

  /**
   * Get prediction accuracy for user
   */
  async getPredictionAccuracy(
    userId: string,
    storyId?: string
  ): Promise<{
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
  }> {
    let query = this.supabase
      .from('choice_predictions')
      .select('was_correct')
      .eq('user_id', userId)
      .not('was_correct', 'is', null);

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const predictions = data || [];
    const total = predictions.length;
    const correct = predictions.filter((p: any) => p.was_correct === true).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return {
      totalPredictions: total,
      correctPredictions: correct,
      accuracy,
    };
  }

  // ========================================
  // PERSONALIZED NARRATIVE PATHS
  // ========================================

  /**
   * Get or create personalized narrative path
   */
  async getPersonalizedPath(
    userId: string,
    storyId: string
  ): Promise<PersonalizedNarrativePath | null> {
    const { data, error } = await this.supabase
      .from('personalized_narrative_paths')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapNarrativePath(data);
  }

  /**
   * Create a new personalized path
   */
  async createPersonalizedPath(
    userId: string,
    storyId: string,
    path: Partial<PersonalizedNarrativePath>
  ): Promise<PersonalizedNarrativePath> {
    const { data, error } = await this.supabase
      .from('personalized_narrative_paths')
      .insert({
        user_id: userId,
        story_id: storyId,
        path_name: path.pathName,
        path_description: path.pathDescription,
        personalization_factors: path.personalizationFactors || {},
        adaptation_summary: path.adaptationSummary,
        current_chapter_id: path.currentChapterId,
        path_progress: path.pathProgress || 0,
        engagement_score: path.engagementScore || 0,
        completion_likelihood: path.completionLikelihood,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapNarrativePath(data);
  }

  /**
   * Update personalized path progress
   */
  async updatePathProgress(
    pathId: string,
    updates: Partial<PersonalizedNarrativePath>
  ): Promise<PersonalizedNarrativePath> {
    const { data, error } = await this.supabase
      .from('personalized_narrative_paths')
      .update({
        current_chapter_id: updates.currentChapterId,
        path_progress: updates.pathProgress,
        engagement_score: updates.engagementScore,
        completion_likelihood: updates.completionLikelihood,
      })
      .eq('id', pathId)
      .select()
      .single();

    if (error) throw error;
    return this.mapNarrativePath(data);
  }

  // ========================================
  // ADAPTATION EFFECTIVENESS
  // ========================================

  /**
   * Calculate adaptation effectiveness
   */
  async getAdaptationEffectiveness(
    userId: string,
    storyId: string,
    periodDays: number = 30
  ): Promise<number> {
    const { data, error } = await this.supabase.rpc('calculate_adaptation_effectiveness', {
      p_user_id: userId,
      p_story_id: storyId,
      p_period_days: periodDays,
    });

    if (error) throw error;
    return parseFloat(data || '0.5');
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapPreferences(data: any): UserReadingPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      preferredPacing: data.preferred_pacing,
      preferredNarrativeStyle: data.preferred_narrative_style || [],
      preferredGenreTags: data.preferred_genre_tags || [],
      preferredContentRating: data.preferred_content_rating,
      preferredThemes: data.preferred_themes || [],
      preferredTone: data.preferred_tone || [],
      preferredChoiceFrequency: data.preferred_choice_frequency,
      preferredChoiceComplexity: data.preferred_choice_complexity,
      preferredBranchingDepth: data.preferred_branching_depth,
      aiPersonalityProfile: data.ai_personality_profile || {},
      readingPatterns: data.reading_patterns || {},
      engagementPatterns: data.engagement_patterns || {},
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapAdaptation(data: any): StoryAdaptation {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      chapterId: data.chapter_id,
      adaptationType: data.adaptation_type,
      originalContent: data.original_content,
      adaptedContent: data.adapted_content,
      adaptationReason: data.adaptation_reason,
      aiModel: data.ai_model,
      confidenceScore: data.confidence_score ? parseFloat(data.confidence_score) : undefined,
      adaptationParameters: data.adaptation_parameters || {},
      userFeedback: data.user_feedback,
      userRating: data.user_rating,
      createdAt: data.created_at,
    };
  }

  private mapChoicePrediction(data: any): ChoicePrediction {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      chapterId: data.chapter_id,
      choiceId: data.choice_id,
      choiceText: data.choice_text,
      choiceOptions: data.choice_options || [],
      predictedChoiceIndex: data.predicted_choice_index,
      predictedChoiceText: data.predicted_choice_text,
      predictionConfidence: data.prediction_confidence ? parseFloat(data.prediction_confidence) : undefined,
      actualChoiceIndex: data.actual_choice_index,
      actualChoiceText: data.actual_choice_text,
      wasCorrect: data.was_correct,
      modelVersion: data.model_version,
      predictionFeatures: data.prediction_features || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapNarrativePath(data: any): PersonalizedNarrativePath {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      pathName: data.path_name,
      pathDescription: data.path_description,
      isActive: data.is_active,
      personalizationFactors: data.personalization_factors || {},
      adaptationSummary: data.adaptation_summary,
      currentChapterId: data.current_chapter_id,
      pathProgress: parseFloat(data.path_progress || '0'),
      engagementScore: parseFloat(data.engagement_score || '0'),
      completionLikelihood: data.completion_likelihood ? parseFloat(data.completion_likelihood) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const adaptiveStorytellingService = new AdaptiveStorytellingService();

