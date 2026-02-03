/**
 * Writing Coach Service
 * AI-powered writing feedback, pacing analysis, character consistency, plot hole detection
 */

import { createClient } from '@/lib/supabase/client';
import { generateCompletion } from '@/lib/ai/client';

export interface WritingFeedback {
  id: string;
  feedbackType: 'grammar' | 'style' | 'pacing' | 'dialogue' | 'description' | 'plot' | 'character' | 'general';
  severity: 'suggestion' | 'minor' | 'moderate' | 'major';
  originalText: string | null;
  suggestion: string;
  explanation: string;
  positionStart: number | null;
  positionEnd: number | null;
  accepted: boolean | null;
}

export interface GenreAnalysis {
  analyzedGenre: string;
  genreFitScore: number;
  genreElements: string[];
  missingElements: string[];
  recommendations: string[];
}

export interface PacingAnalysis {
  pacingScore: number;
  pacingCurve: Array<{ position: number; intensity: number }>;
  slowSections: Array<{ start: number; end: number; suggestion: string }>;
  fastSections: Array<{ start: number; end: number; suggestion: string }>;
  recommendations: string[];
}

export interface CharacterConsistency {
  characterName: string;
  consistencyScore: number;
  personalityDrift: Array<{ chapter: string; issue: string }>;
  dialogueConsistency: number;
  issuesFound: string[];
}

export interface PlotHoleAnalysis {
  potentialHoles: Array<{ description: string; severity: string; location: string }>;
  timelineIssues: Array<{ description: string; chapters: string[] }>;
  continuityErrors: Array<{ description: string; location: string }>;
  unresolvedThreads: string[];
  severityScore: number;
}

class WritingCoachService {
  private supabase = createClient();

  /**
   * Start a writing coach session
   */
  async startSession(
    userId: string,
    storyId?: string,
    sessionType: 'general' | 'story_specific' | 'genre_focused' | 'style_improvement' = 'general'
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('writing_coach_sessions')
        .insert({
          user_id: userId,
          story_id: storyId,
          session_type: sessionType,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return '';
      }

      return data.id;
    } catch (error) {
      console.error('Error in startSession:', error);
      return '';
    }
  }

  /**
   * Get real-time writing feedback
   */
  async getWritingFeedback(
    sessionId: string,
    text: string,
    feedbackTypes?: WritingFeedback['feedbackType'][]
  ): Promise<WritingFeedback[]> {
    try {
      const types = feedbackTypes || ['grammar', 'style', 'pacing', 'dialogue'];
      
      const systemPrompt = `You are an expert writing coach. Analyze the provided text and give constructive feedback.

Return a JSON array of feedback items. Each item should have:
- feedbackType: one of ${types.join(', ')}
- severity: suggestion, minor, moderate, or major
- originalText: the problematic text (if applicable)
- suggestion: the improved version or suggestion
- explanation: why this change is recommended
- positionStart: character position where issue starts (null if general)
- positionEnd: character position where issue ends (null if general)

Focus on actionable, specific feedback. Limit to the 10 most important issues.

Return ONLY the JSON array, no other text.`;

      const response = await generateCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this text:\n\n${text}` },
        ],
        temperature: 0.3,
        maxTokens: 2000,
      });

      // Parse response
      let feedback: WritingFeedback[] = [];
      try {
        const cleaned = response.content.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        feedback = parsed.map((f: any, index: number) => ({
          id: `feedback_${index}`,
          feedbackType: f.feedbackType,
          severity: f.severity,
          originalText: f.originalText,
          suggestion: f.suggestion,
          explanation: f.explanation,
          positionStart: f.positionStart,
          positionEnd: f.positionEnd,
          accepted: null,
        }));
      } catch (parseError) {
        console.error('Error parsing feedback:', parseError);
      }

      // Save feedback to database
      for (const item of feedback) {
        await this.supabase.from('writing_feedback').insert({
          session_id: sessionId,
          feedback_type: item.feedbackType,
          severity: item.severity,
          original_text: item.originalText,
          suggestion: item.suggestion,
          explanation: item.explanation,
          position_start: item.positionStart,
          position_end: item.positionEnd,
        });
      }

      // Update session stats
      await this.supabase
        .from('writing_coach_sessions')
        .update({
          feedback_count: feedback.length,
          words_analyzed: text.split(/\s+/).length,
        })
        .eq('id', sessionId);

      return feedback;
    } catch (error) {
      console.error('Error in getWritingFeedback:', error);
      return [];
    }
  }

  /**
   * Analyze story genre fit
   */
  async analyzeGenre(storyId: string): Promise<GenreAnalysis | null> {
    try {
      // Get story content
      const { data: story } = await this.supabase
        .from('stories')
        .select('title, description, genre')
        .eq('id', storyId)
        .single();

      const { data: chapters } = await this.supabase
        .from('story_chapters')
        .select('content')
        .eq('story_id', storyId)
        .limit(5);

      if (!story || !chapters) {
        return null;
      }

      const content = chapters.map(c => c.content).join('\n\n').slice(0, 5000);

      const response = await generateCompletion({
        messages: [
          {
            role: 'system',
            content: `You are an expert in genre analysis. Analyze the story content and evaluate how well it fits the intended genre.

Return a JSON object with:
- analyzedGenre: the genre that best fits the content
- genreFitScore: 0-100 score for how well it matches the intended genre "${story.genre}"
- genreElements: array of genre elements that ARE present
- missingElements: array of expected genre elements that are MISSING
- recommendations: array of specific suggestions to strengthen the genre fit

Return ONLY the JSON object.`,
          },
          {
            role: 'user',
            content: `Story: ${story.title}\nIntended Genre: ${story.genre}\n\nContent:\n${content}`,
          },
        ],
        temperature: 0.4,
        maxTokens: 1000,
      });

      const parsed = JSON.parse(response.content.replace(/```json\n?|\n?```/g, '').trim());

      // Save analysis
      await this.supabase.from('genre_analysis').upsert({
        story_id: storyId,
        analyzed_genre: parsed.analyzedGenre,
        genre_fit_score: parsed.genreFitScore,
        genre_elements: parsed.genreElements,
        missing_elements: parsed.missingElements,
        recommendations: parsed.recommendations,
        analyzed_at: new Date().toISOString(),
      });

      return parsed;
    } catch (error) {
      console.error('Error in analyzeGenre:', error);
      return null;
    }
  }

  /**
   * Analyze story pacing
   */
  async analyzePacing(storyId: string, chapterId?: string): Promise<PacingAnalysis | null> {
    try {
      let content: string;
      let targetId: string;

      if (chapterId) {
        const { data: chapter } = await this.supabase
          .from('story_chapters')
          .select('content')
          .eq('id', chapterId)
          .single();
        content = chapter?.content || '';
        targetId = chapterId;
      } else {
        const { data: chapters } = await this.supabase
          .from('story_chapters')
          .select('content')
          .eq('story_id', storyId)
          .order('order_index');
        content = chapters?.map(c => c.content).join('\n\n') || '';
        targetId = storyId;
      }

      if (!content) {
        return null;
      }

      const response = await generateCompletion({
        messages: [
          {
            role: 'system',
            content: `You are an expert story pacing analyst. Analyze the narrative pacing.

Return a JSON object with:
- pacingScore: 0-100 overall pacing score
- pacingCurve: array of {position: 0-100, intensity: 0-100} showing story intensity
- slowSections: array of {start: position, end: position, suggestion: string}
- fastSections: array of {start: position, end: position, suggestion: string}
- recommendations: array of pacing improvement suggestions

Return ONLY the JSON object.`,
          },
          {
            role: 'user',
            content: `Analyze the pacing of this story:\n\n${content.slice(0, 8000)}`,
          },
        ],
        temperature: 0.4,
        maxTokens: 1500,
      });

      const parsed = JSON.parse(response.content.replace(/```json\n?|\n?```/g, '').trim());

      // Save analysis
      await this.supabase.from('pacing_analysis').insert({
        story_id: storyId,
        chapter_id: chapterId,
        pacing_score: parsed.pacingScore,
        pacing_curve: parsed.pacingCurve,
        slow_sections: parsed.slowSections,
        fast_sections: parsed.fastSections,
        recommendations: parsed.recommendations,
      });

      return parsed;
    } catch (error) {
      console.error('Error in analyzePacing:', error);
      return null;
    }
  }

  /**
   * Check character consistency
   */
  async checkCharacterConsistency(storyId: string, characterName: string): Promise<CharacterConsistency | null> {
    try {
      const { data: chapters } = await this.supabase
        .from('story_chapters')
        .select('title, content')
        .eq('story_id', storyId)
        .order('order_index');

      if (!chapters || chapters.length === 0) {
        return null;
      }

      const content = chapters
        .map((c, i) => `Chapter ${i + 1} - ${c.title}:\n${c.content}`)
        .join('\n\n---\n\n')
        .slice(0, 10000);

      const response = await generateCompletion({
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing character consistency in stories.

Analyze how consistently the character "${characterName}" is portrayed throughout the story.

Return a JSON object with:
- consistencyScore: 0-100 overall consistency
- personalityDrift: array of {chapter: string, issue: string} showing where character behaves inconsistently
- dialogueConsistency: 0-100 score for how consistent their dialogue/voice is
- issuesFound: array of specific consistency issues

Return ONLY the JSON object.`,
          },
          {
            role: 'user',
            content: `Analyze character "${characterName}" in this story:\n\n${content}`,
          },
        ],
        temperature: 0.4,
        maxTokens: 1500,
      });

      const parsed = JSON.parse(response.content.replace(/```json\n?|\n?```/g, '').trim());

      // Save analysis
      await this.supabase.from('character_consistency_checks').insert({
        story_id: storyId,
        character_name: characterName,
        consistency_score: parsed.consistencyScore,
        personality_drift: parsed.personalityDrift,
        dialogue_consistency: parsed.dialogueConsistency,
        issues_found: parsed.issuesFound,
      });

      return {
        characterName,
        ...parsed,
      };
    } catch (error) {
      console.error('Error in checkCharacterConsistency:', error);
      return null;
    }
  }

  /**
   * Detect plot holes
   */
  async detectPlotHoles(storyId: string): Promise<PlotHoleAnalysis | null> {
    try {
      const { data: story } = await this.supabase
        .from('stories')
        .select('title, description')
        .eq('id', storyId)
        .single();

      const { data: chapters } = await this.supabase
        .from('story_chapters')
        .select('title, content')
        .eq('story_id', storyId)
        .order('order_index');

      if (!chapters || chapters.length === 0) {
        return null;
      }

      const content = chapters
        .map((c, i) => `Chapter ${i + 1} - ${c.title}:\n${c.content}`)
        .join('\n\n---\n\n')
        .slice(0, 12000);

      const response = await generateCompletion({
        messages: [
          {
            role: 'system',
            content: `You are an expert story editor specializing in plot analysis.

Analyze the story for plot holes, timeline issues, and continuity errors.

Return a JSON object with:
- potentialHoles: array of {description: string, severity: "minor"|"moderate"|"major", location: string}
- timelineIssues: array of {description: string, chapters: [chapter names]}
- continuityErrors: array of {description: string, location: string}
- unresolvedThreads: array of plot threads that were introduced but not resolved
- severityScore: 0-100 (100 = no issues, 0 = many major issues)

Be thorough but fair. Minor inconsistencies are different from major plot holes.

Return ONLY the JSON object.`,
          },
          {
            role: 'user',
            content: `Story: ${story?.title}\nDescription: ${story?.description}\n\nContent:\n${content}`,
          },
        ],
        temperature: 0.4,
        maxTokens: 2000,
      });

      const parsed = JSON.parse(response.content.replace(/```json\n?|\n?```/g, '').trim());

      // Save analysis
      await this.supabase.from('plot_hole_analysis').upsert({
        story_id: storyId,
        potential_holes: parsed.potentialHoles,
        timeline_issues: parsed.timelineIssues,
        continuity_errors: parsed.continuityErrors,
        unresolved_threads: parsed.unresolvedThreads,
        severity_score: parsed.severityScore,
        analyzed_at: new Date().toISOString(),
      });

      return parsed;
    } catch (error) {
      console.error('Error in detectPlotHoles:', error);
      return null;
    }
  }

  /**
   * Get comprehensive story analysis
   */
  async getFullAnalysis(storyId: string): Promise<{
    genre: GenreAnalysis | null;
    pacing: PacingAnalysis | null;
    plotHoles: PlotHoleAnalysis | null;
  }> {
    const [genre, pacing, plotHoles] = await Promise.all([
      this.analyzeGenre(storyId),
      this.analyzePacing(storyId),
      this.detectPlotHoles(storyId),
    ]);

    return { genre, pacing, plotHoles };
  }

  /**
   * Accept or reject feedback
   */
  async respondToFeedback(feedbackId: string, accepted: boolean): Promise<void> {
    try {
      await this.supabase
        .from('writing_feedback')
        .update({ accepted })
        .eq('id', feedbackId);
    } catch (error) {
      console.error('Error responding to feedback:', error);
    }
  }

  /**
   * Get session history
   */
  async getSessionHistory(userId: string, limit: number = 10): Promise<Array<{
    id: string;
    storyId: string | null;
    sessionType: string;
    feedbackCount: number;
    wordsAnalyzed: number;
    startedAt: string;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('writing_coach_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching session history:', error);
        return [];
      }

      return (data || []).map(s => ({
        id: s.id,
        storyId: s.story_id,
        sessionType: s.session_type,
        feedbackCount: s.feedback_count,
        wordsAnalyzed: s.words_analyzed,
        startedAt: s.started_at,
      }));
    } catch (error) {
      console.error('Error in getSessionHistory:', error);
      return [];
    }
  }
}

export const writingCoachService = new WritingCoachService();
