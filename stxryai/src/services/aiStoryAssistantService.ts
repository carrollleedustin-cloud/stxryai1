/**
 * AI Story Assistant Service
 * Provides AI-powered writing assistance: Plot Doctor, suggestions, idea generation
 */

import { createClient } from '@/lib/supabase/client';

export interface AIWritingSuggestion {
  id: string;
  userId: string;
  storyId?: string;
  chapterId?: string;
  suggestionType: 'plot' | 'character' | 'dialogue' | 'description' | 'pacing' | 'tone' | 'grammar' | 'style' | 'continuity' | 'conflict';
  originalText?: string;
  suggestedText?: string;
  suggestionContext?: string;
  aiModel: string;
  confidenceScore?: number;
  reasoning?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'modified' | 'dismissed';
  userFeedback?: string;
  appliedAt?: string;
  startPosition?: number;
  endPosition?: number;
  selectedText?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PlotDoctorAnalysis {
  id: string;
  userId: string;
  storyId: string;
  analysisType: 'full_story' | 'act' | 'chapter' | 'scene' | 'character_arc' | 'plot_hole';
  analyzedContent: string;
  issuesFound: any[];
  issueCount: number;
  severityLevel?: 'low' | 'medium' | 'high' | 'critical';
  suggestions: any[];
  suggestionCount: number;
  strengths: any[];
  strengthCount: number;
  overallScore?: number;
  overallFeedback?: string;
  aiModel: string;
  analysisParameters: Record<string, any>;
  tokensUsed?: number;
  userRating?: number;
  wasHelpful?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIIdeaGeneration {
  id: string;
  userId: string;
  generationType: 'story_concept' | 'character' | 'plot_twist' | 'world_building' | 'dialogue' | 'scene' | 'title' | 'synopsis';
  prompt?: string;
  constraints: Record<string, any>;
  generatedIdeas: any[];
  ideaCount: number;
  selectedIdeaIndex?: number;
  selectedIdea?: any;
  isUsed: boolean;
  usedInStoryId?: string;
  aiModel: string;
  generationParameters: Record<string, any>;
  tokensUsed?: number;
  userRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WritingAssistantSession {
  id: string;
  userId: string;
  storyId?: string;
  sessionType: 'plot_doctor' | 'writing_suggestions' | 'idea_generation' | 'general';
  sessionName?: string;
  currentContext?: string;
  conversationHistory: any[];
  activeSuggestions: string[];
  suggestionsGenerated: number;
  suggestionsAccepted: number;
  suggestionsRejected: number;
  timeSpentMinutes: number;
  isActive: boolean;
  startedAt: string;
  endedAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class AIStoryAssistantService {
  private supabase = createClient();

  // ========================================
  // WRITING SUGGESTIONS
  // ========================================

  /**
   * Generate writing suggestions for content
   */
  async generateSuggestions(
    userId: string,
    content: string,
    context: {
      storyId?: string;
      chapterId?: string;
      suggestionTypes?: AIWritingSuggestion['suggestionType'][];
    }
  ): Promise<AIWritingSuggestion[]> {
    // This would typically call an AI API
    // For now, we'll create placeholder suggestions
    const suggestions: Partial<AIWritingSuggestion>[] = [];

    // TODO: Integrate with OpenAI API for actual suggestions
    // For now, return empty array or mock data

    const { data, error } = await this.supabase
      .from('ai_writing_suggestions')
      .insert(
        suggestions.map((s) => ({
          user_id: userId,
          story_id: context.storyId,
          chapter_id: context.chapterId,
          suggestion_type: s.suggestionType,
          original_text: s.originalText,
          suggested_text: s.suggestedText,
          suggestion_context: s.suggestionContext,
          ai_model: 'gpt-4',
          confidence_score: s.confidenceScore,
          reasoning: s.reasoning,
          status: 'pending',
        }))
      )
      .select();

    if (error) throw error;
    return (data || []).map((item: any) => this.mapSuggestion(item));
  }

  /**
   * Get user's writing suggestions
   */
  async getUserSuggestions(
    userId: string,
    storyId?: string,
    status?: AIWritingSuggestion['status']
  ): Promise<AIWritingSuggestion[]> {
    let query = this.supabase
      .from('ai_writing_suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (storyId) {
      query = query.eq('story_id', storyId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapSuggestion(item));
  }

  /**
   * Accept a suggestion
   */
  async acceptSuggestion(suggestionId: string): Promise<AIWritingSuggestion> {
    const { data, error } = await this.supabase
      .from('ai_writing_suggestions')
      .update({
        status: 'accepted',
        applied_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSuggestion(data);
  }

  /**
   * Reject a suggestion
   */
  async rejectSuggestion(suggestionId: string, feedback?: string): Promise<AIWritingSuggestion> {
    const { data, error } = await this.supabase
      .from('ai_writing_suggestions')
      .update({
        status: 'rejected',
        user_feedback: feedback,
      })
      .eq('id', suggestionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSuggestion(data);
  }

  // ========================================
  // PLOT DOCTOR
  // ========================================

  /**
   * Run Plot Doctor analysis
   */
  async runPlotDoctorAnalysis(
    userId: string,
    storyId: string,
    analysisType: PlotDoctorAnalysis['analysisType'],
    content: string
  ): Promise<PlotDoctorAnalysis> {
    // TODO: Integrate with AI API for actual analysis
    // This would analyze the story for plot holes, inconsistencies, etc.

    const { data, error } = await this.supabase
      .from('plot_doctor_analyses')
      .insert({
        user_id: userId,
        story_id: storyId,
        analysis_type: analysisType,
        analyzed_content: content,
        issues_found: [],
        issue_count: 0,
        suggestions: [],
        suggestion_count: 0,
        strengths: [],
        strength_count: 0,
        ai_model: 'gpt-4',
        analysis_parameters: {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapPlotAnalysis(data);
  }

  /**
   * Get Plot Doctor analyses for a story
   */
  async getPlotAnalyses(
    userId: string,
    storyId: string
  ): Promise<PlotDoctorAnalysis[]> {
    const { data, error } = await this.supabase
      .from('plot_doctor_analyses')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapPlotAnalysis(item));
  }

  // ========================================
  // IDEA GENERATION
  // ========================================

  /**
   * Generate story ideas
   */
  async generateIdeas(
    userId: string,
    generationType: AIIdeaGeneration['generationType'],
    prompt?: string,
    constraints?: Record<string, any>
  ): Promise<AIIdeaGeneration> {
    // TODO: Integrate with AI API for actual idea generation

    const { data, error } = await this.supabase
      .from('ai_idea_generations')
      .insert({
        user_id: userId,
        generation_type: generationType,
        prompt,
        constraints: constraints || {},
        generated_ideas: [],
        idea_count: 0,
        ai_model: 'gpt-4',
        generation_parameters: {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapIdeaGeneration(data);
  }

  /**
   * Get user's generated ideas
   */
  async getUserIdeas(
    userId: string,
    generationType?: AIIdeaGeneration['generationType']
  ): Promise<AIIdeaGeneration[]> {
    let query = this.supabase
      .from('ai_idea_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (generationType) {
      query = query.eq('generation_type', generationType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapIdeaGeneration(item));
  }

  /**
   * Select and use an idea
   */
  async useIdea(
    ideaId: string,
    ideaIndex: number,
    storyId?: string
  ): Promise<AIIdeaGeneration> {
    const idea = await this.getIdea(ideaId);
    if (!idea) throw new Error('Idea not found');

    const selectedIdea = idea.generatedIdeas[ideaIndex];

    const { data, error } = await this.supabase
      .from('ai_idea_generations')
      .update({
        selected_idea_index: ideaIndex,
        selected_idea: selectedIdea,
        is_used: true,
        used_in_story_id: storyId,
      })
      .eq('id', ideaId)
      .select()
      .single();

    if (error) throw error;
    return this.mapIdeaGeneration(data);
  }

  /**
   * Get a single idea generation
   */
  async getIdea(ideaId: string): Promise<AIIdeaGeneration | null> {
    const { data, error } = await this.supabase
      .from('ai_idea_generations')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapIdeaGeneration(data);
  }

  // ========================================
  // WRITING ASSISTANT SESSIONS
  // ========================================

  /**
   * Start a writing assistant session
   */
  async startSession(
    userId: string,
    sessionType: WritingAssistantSession['sessionType'],
    storyId?: string,
    sessionName?: string
  ): Promise<WritingAssistantSession> {
    const { data, error } = await this.supabase
      .from('writing_assistant_sessions')
      .insert({
        user_id: userId,
        story_id: storyId,
        session_type: sessionType,
        session_name: sessionName,
        conversation_history: [],
        active_suggestions: [],
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapSession(data);
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(userId: string): Promise<WritingAssistantSession[]> {
    const { data, error } = await this.supabase
      .from('writing_assistant_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapSession(item));
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<WritingAssistantSession> {
    const { data, error } = await this.supabase
      .from('writing_assistant_sessions')
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSession(data);
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapSuggestion(data: any): AIWritingSuggestion {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      chapterId: data.chapter_id,
      suggestionType: data.suggestion_type,
      originalText: data.original_text,
      suggestedText: data.suggested_text,
      suggestionContext: data.suggestion_context,
      aiModel: data.ai_model,
      confidenceScore: data.confidence_score ? parseFloat(data.confidence_score) : undefined,
      reasoning: data.reasoning,
      status: data.status,
      userFeedback: data.user_feedback,
      appliedAt: data.applied_at,
      startPosition: data.start_position,
      endPosition: data.end_position,
      selectedText: data.selected_text,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapPlotAnalysis(data: any): PlotDoctorAnalysis {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      analysisType: data.analysis_type,
      analyzedContent: data.analyzed_content,
      issuesFound: data.issues_found || [],
      issueCount: data.issue_count || 0,
      severityLevel: data.severity_level,
      suggestions: data.suggestions || [],
      suggestionCount: data.suggestion_count || 0,
      strengths: data.strengths || [],
      strengthCount: data.strength_count || 0,
      overallScore: data.overall_score ? parseFloat(data.overall_score) : undefined,
      overallFeedback: data.overall_feedback,
      aiModel: data.ai_model,
      analysisParameters: data.analysis_parameters || {},
      tokensUsed: data.tokens_used,
      userRating: data.user_rating,
      wasHelpful: data.was_helpful,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapIdeaGeneration(data: any): AIIdeaGeneration {
    return {
      id: data.id,
      userId: data.user_id,
      generationType: data.generation_type,
      prompt: data.prompt,
      constraints: data.constraints || {},
      generatedIdeas: data.generated_ideas || [],
      ideaCount: data.idea_count || 0,
      selectedIdeaIndex: data.selected_idea_index,
      selectedIdea: data.selected_idea,
      isUsed: data.is_used,
      usedInStoryId: data.used_in_story_id,
      aiModel: data.ai_model,
      generationParameters: data.generation_parameters || {},
      tokensUsed: data.tokens_used,
      userRating: data.user_rating,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSession(data: any): WritingAssistantSession {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      sessionType: data.session_type,
      sessionName: data.session_name,
      currentContext: data.current_context,
      conversationHistory: data.conversation_history || [],
      activeSuggestions: data.active_suggestions || [],
      suggestionsGenerated: data.suggestions_generated || 0,
      suggestionsAccepted: data.suggestions_accepted || 0,
      suggestionsRejected: data.suggestions_rejected || 0,
      timeSpentMinutes: data.time_spent_minutes || 0,
      isActive: data.is_active,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const aiStoryAssistantService = new AIStoryAssistantService();

