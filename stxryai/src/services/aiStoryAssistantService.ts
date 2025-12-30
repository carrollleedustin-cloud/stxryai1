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
    const suggestionTypes = context.suggestionTypes || ['plot', 'character', 'dialogue', 'description', 'pacing', 'tone', 'style'];
    
    // Check if AI is configured
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.warn('AI API key not configured - returning empty suggestions');
      return [];
    }

    try {
      // Import AI client
      const { generateCompletion } = await import('@/lib/ai/client');
      
      const systemPrompt = `You are an expert writing assistant. Analyze the provided text and generate specific, actionable writing suggestions. 
Focus on: ${suggestionTypes.join(', ')}. For each suggestion, provide:
1. The type of suggestion
2. The original text (if applicable)
3. Suggested improvement
4. Brief reasoning
5. Confidence score (0-1)

Return suggestions as a JSON array.`;

      const userPrompt = `Analyze this text and provide writing suggestions:\n\n${content}\n\nFocus on: ${suggestionTypes.join(', ')}`;

      const response = await generateCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Parse AI response
      let parsedSuggestions: any[] = [];
      try {
        // Try to extract JSON from response
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedSuggestions = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: create suggestions from text analysis
          parsedSuggestions = [{
            suggestionType: 'style',
            originalText: content.substring(0, 100),
            suggestedText: content.substring(0, 100),
            suggestionContext: 'AI analysis',
            confidenceScore: 0.7,
            reasoning: response.content.substring(0, 200),
          }];
        }
      } catch (parseError) {
        console.error('Failed to parse AI suggestions:', parseError);
        // Return empty array if parsing fails
        return [];
      }

      // Map to our format
      const suggestions: Partial<AIWritingSuggestion>[] = parsedSuggestions.map((s: any, index: number) => ({
        suggestionType: s.suggestionType || suggestionTypes[index % suggestionTypes.length],
        originalText: s.originalText || content.substring(0, 100),
        suggestedText: s.suggestedText || s.suggestion,
        suggestionContext: s.suggestionContext || s.context || 'AI-generated suggestion',
        confidenceScore: s.confidenceScore || 0.7,
        reasoning: s.reasoning || s.explanation || 'AI analysis',
      }));

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
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // Return empty array on error rather than throwing
      return [];
    }
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
    // Check if AI is configured
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('AI API key not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
    }

    try {
      // Import AI client
      const { generateCompletion } = await import('@/lib/ai/client');
      
      const systemPrompt = `You are an expert story analyst (Plot Doctor). Analyze the provided story content for:
- Plot holes and inconsistencies
- Character development issues
- Pacing problems
- Narrative structure issues
- Strengths and well-executed elements

Return a JSON object with:
{
  "issues": [{"type": "...", "severity": "low|medium|high|critical", "description": "...", "location": "..."}],
  "suggestions": [{"type": "...", "description": "...", "impact": "..."}],
  "strengths": [{"aspect": "...", "description": "..."}],
  "overallScore": 0-100,
  "overallFeedback": "..."
}`;

      const userPrompt = `Analyze this ${analysisType} for plot issues, inconsistencies, and provide feedback:\n\n${content}`;

      const response = await generateCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5, // Lower temperature for more consistent analysis
        maxTokens: 3000,
      });

      // Parse AI response
      let analysisResult: any = {
        issues: [],
        suggestions: [],
        strengths: [],
        overallScore: 70,
        overallFeedback: 'Analysis completed',
      };

      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback parsing
          analysisResult.overallFeedback = response.content;
        }
      } catch (parseError) {
        console.error('Failed to parse plot analysis:', parseError);
        analysisResult.overallFeedback = response.content;
      }

      const { data, error } = await this.supabase
        .from('plot_doctor_analyses')
        .insert({
          user_id: userId,
          story_id: storyId,
          analysis_type: analysisType,
          analyzed_content: content,
          issues_found: analysisResult.issues || [],
          issue_count: (analysisResult.issues || []).length,
          suggestions: analysisResult.suggestions || [],
          suggestion_count: (analysisResult.suggestions || []).length,
          strengths: analysisResult.strengths || [],
          strength_count: (analysisResult.strengths || []).length,
          overall_score: analysisResult.overallScore,
          overall_feedback: analysisResult.overallFeedback,
          severity_level: (analysisResult.issues || []).some((i: any) => i.severity === 'critical' || i.severity === 'high') 
            ? 'high' 
            : (analysisResult.issues || []).length > 0 ? 'medium' : 'low',
          ai_model: 'gpt-4',
          analysis_parameters: {},
          tokens_used: response.usage.totalTokens,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapPlotAnalysis(data);
    } catch (error) {
      console.error('Error running plot doctor analysis:', error);
      throw error;
    }
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
    // Check if AI is configured
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('AI API key not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
    }

    try {
      // Import AI client
      const { generateCompletion } = await import('@/lib/ai/client');
      
      const typePrompts: Record<string, string> = {
        story_concept: 'Generate creative story concepts',
        character: 'Generate interesting character ideas',
        plot_twist: 'Generate unexpected plot twists',
        world_building: 'Generate world-building elements',
        dialogue: 'Generate engaging dialogue examples',
        scene: 'Generate compelling scene ideas',
        title: 'Generate story titles',
        synopsis: 'Generate story synopses',
      };

      const systemPrompt = `You are a creative writing assistant. Generate ${typePrompts[generationType] || 'creative ideas'}.
${constraints ? `Constraints: ${JSON.stringify(constraints)}` : ''}

Return a JSON array of ideas, each with:
- title/name
- description
- key elements
- potential use cases`;

      const userPrompt = prompt || `Generate 5 ${generationType.replace('_', ' ')} ideas`;

      const response = await generateCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9, // Higher temperature for more creative ideas
        maxTokens: 2000,
      });

      // Parse AI response
      let generatedIdeas: any[] = [];
      try {
        const jsonMatch = response.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          generatedIdeas = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: split by lines or create single idea
          const lines = response.content.split('\n').filter(l => l.trim());
          generatedIdeas = lines.slice(0, 5).map((line, i) => ({
            title: `Idea ${i + 1}`,
            description: line.trim(),
            keyElements: [],
            potentialUseCases: [],
          }));
        }
      } catch (parseError) {
        console.error('Failed to parse idea generation:', parseError);
        // Create fallback ideas
        generatedIdeas = [{
          title: 'Generated Idea',
          description: response.content.substring(0, 500),
          keyElements: [],
          potentialUseCases: [],
        }];
      }

      const { data, error } = await this.supabase
        .from('ai_idea_generations')
        .insert({
          user_id: userId,
          generation_type: generationType,
          prompt,
          constraints: constraints || {},
          generated_ideas: generatedIdeas,
          idea_count: generatedIdeas.length,
          ai_model: 'gpt-4',
          generation_parameters: {
            temperature: 0.9,
            maxTokens: 2000,
          },
          tokens_used: response.usage.totalTokens,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapIdeaGeneration(data);
    } catch (error) {
      console.error('Error generating ideas:', error);
      throw error;
    }
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

