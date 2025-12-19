/**
 * Enhanced Content Moderation Service
 * Integrates OpenAI Moderation API and Google Perspective API
 */

import { getSupabaseClient } from '@/lib/supabase/client';
import { contentModerationService } from '@/lib/ai/content-moderation';

// ========================================
// TYPES
// ========================================

export interface ModerationResult {
  flagged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  autoAction: 'allow' | 'review' | 'block';
  categories: Record<string, {
    detected: boolean;
    confidence: number;
  }>;
  sources: {
    openai?: {
      flagged: boolean;
      categories: Record<string, number>;
    };
    perspective?: {
      toxicity: number;
      severeToxicity: number;
      identityAttack: number;
      threat: number;
      profanity: number;
      insult: number;
    };
  };
  suggestions: string[];
  moderationLogId?: string;
}

export interface ContentToModerate {
  text: string;
  contentId: string;
  contentType: 'story' | 'comment' | 'profile' | 'message' | 'chapter';
  authorId?: string;
  context?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ModerationStats {
  date: string;
  contentType: string;
  totalChecked: number;
  flaggedCount: number;
  blockedCount: number;
  reviewedCount: number;
  falsePositiveCount: number;
  categoryCounts: Record<string, number>;
}

// ========================================
// SERVICE CLASS
// ========================================

class EnhancedModerationService {
  private perspectiveApiKey: string;
  private perspectiveApiUrl: string = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

  constructor() {
    this.perspectiveApiKey = process.env.NEXT_PUBLIC_PERSPECTIVE_API_KEY || '';
  }

  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  // ==================== PERSPECTIVE API ====================

  /**
   * Analyze content using Google Perspective API
   */
  private async analyzeWithPerspective(text: string): Promise<{
    toxicity: number;
    severeToxicity: number;
    identityAttack: number;
    threat: number;
    profanity: number;
    insult: number;
  } | null> {
    if (!this.perspectiveApiKey) {
      console.warn('Perspective API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.perspectiveApiUrl}?key=${this.perspectiveApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: { text },
            requestedAttributes: {
              TOXICITY: {},
              SEVERE_TOXICITY: {},
              IDENTITY_ATTACK: {},
              THREAT: {},
              PROFANITY: {},
              INSULT: {},
            },
            languages: ['en'],
          }),
        }
      );

      if (!response.ok) {
        console.error('Perspective API error:', response.statusText);
        return null;
      }

      const data = await response.json();
      const attributes = data.attributeScores || {};

      return {
        toxicity: attributes.TOXICITY?.summaryScore?.value || 0,
        severeToxicity: attributes.SEVERE_TOXICITY?.summaryScore?.value || 0,
        identityAttack: attributes.IDENTITY_ATTACK?.summaryScore?.value || 0,
        threat: attributes.THREAT?.summaryScore?.value || 0,
        profanity: attributes.PROFANITY?.summaryScore?.value || 0,
        insult: attributes.INSULT?.summaryScore?.value || 0,
      };
    } catch (error) {
      console.error('Perspective API request failed:', error);
      return null;
    }
  }

  // ==================== HYBRID MODERATION ====================

  /**
   * Moderate content using both OpenAI and Perspective API
   */
  async moderateContent(content: ContentToModerate): Promise<ModerationResult> {
    const startTime = Date.now();

    // Run both moderation checks in parallel
    const [openaiResult, perspectiveResult] = await Promise.all([
      contentModerationService.moderateContent({
        text: content.text,
        context: content.context,
        authorId: content.authorId,
        contentType: content.contentType,
      }),
      this.analyzeWithPerspective(content.text),
    ]);

    // Combine results
    const result = this.combineResults(openaiResult, perspectiveResult);

    // Log moderation result
    const logId = await this.logModerationResult(content, result, Date.now() - startTime);

    // Add to queue if flagged
    if (result.flagged && result.autoAction !== 'allow') {
      await this.addToModerationQueue(content, result.severity);
    }

    // Update statistics
    await this.updateStatistics(content.contentType, result);

    return {
      ...result,
      moderationLogId: logId,
    };
  }

  /**
   * Combine OpenAI and Perspective API results
   */
  private combineResults(
    openaiResult: any,
    perspectiveResult: any
  ): ModerationResult {
    const categories: Record<string, { detected: boolean; confidence: number }> = {};
    let maxConfidence = 0;
    let flagged = false;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Process OpenAI categories
    if (openaiResult.categories) {
      openaiResult.categories.forEach((cat: any) => {
        categories[cat.name] = {
          detected: cat.detected,
          confidence: cat.confidence,
        };
        if (cat.detected && cat.confidence > maxConfidence) {
          maxConfidence = cat.confidence;
          flagged = true;
        }
      });
    }

    // Process Perspective API results
    if (perspectiveResult) {
      const perspectiveCategories = {
        toxicity: perspectiveResult.toxicity,
        severe_toxicity: perspectiveResult.severeToxicity,
        identity_attack: perspectiveResult.identityAttack,
        threat: perspectiveResult.threat,
        profanity: perspectiveResult.profanity,
        insult: perspectiveResult.insult,
      };

      Object.entries(perspectiveCategories).forEach(([name, score]) => {
        const scoreNum = score as number;
        if (scoreNum > 0.5) {
          // Perspective threshold
          categories[name] = {
            detected: true,
            confidence: scoreNum,
          };
          if (scoreNum > maxConfidence) {
            maxConfidence = scoreNum;
            flagged = true;
          }
        }
      });
    }

    // Determine severity
    if (maxConfidence >= 0.9) severity = 'critical';
    else if (maxConfidence >= 0.7) severity = 'high';
    else if (maxConfidence >= 0.5) severity = 'medium';
    else if (maxConfidence >= 0.3) severity = 'low';

    // Determine auto action
    let autoAction: 'allow' | 'review' | 'block' = 'allow';
    if (severity === 'critical' || (severity === 'high' && maxConfidence > 0.8)) {
      autoAction = 'block';
    } else if (flagged) {
      autoAction = 'review';
    }

    // Generate suggestions
    const suggestions: string[] = [];
    if (categories.toxicity?.detected) {
      suggestions.push('Content contains toxic language. Please revise to be more respectful.');
    }
    if (categories.hate_speech?.detected || categories.identity_attack?.detected) {
      suggestions.push('Content contains hate speech or identity attacks. This violates our community guidelines.');
    }
    if (categories.violence?.detected || categories.threat?.detected) {
      suggestions.push('Content contains violent language or threats. This is not allowed.');
    }
    if (categories.sexual_content?.detected) {
      suggestions.push('Content contains sexual content. Please ensure it is age-appropriate.');
    }
    if (categories.spam?.detected) {
      suggestions.push('Content appears to be spam. Please provide meaningful content.');
    }

    return {
      flagged,
      severity,
      confidence: maxConfidence,
      autoAction,
      categories,
      sources: {
        openai: openaiResult.flagged
          ? {
              flagged: openaiResult.flagged,
              categories: openaiResult.categories?.reduce(
                (acc: Record<string, number>, cat: any) => {
                  acc[cat.name] = cat.confidence;
                  return acc;
                },
                {}
              ) || {},
            }
          : undefined,
        perspective: perspectiveResult || undefined,
      },
      suggestions,
    };
  }

  // ==================== LOGGING ====================

  /**
   * Log moderation result to database
   */
  private async logModerationResult(
    content: ContentToModerate,
    result: ModerationResult,
    processingTimeMs: number
  ): Promise<string | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('ai_moderation_logs')
      .insert({
        content_id: content.contentId,
        content_type: content.contentType,
        content_text: content.text.substring(0, 10000), // Limit text length
        author_id: content.authorId,
        flagged: result.flagged,
        severity: result.severity,
        confidence: result.confidence,
        auto_action: result.autoAction,
        detected_categories: result.categories,
        category_scores: result.sources.openai?.categories || {},
        moderation_source: result.sources.perspective ? 'hybrid' : 'openai',
        status: result.autoAction === 'block' ? 'action_taken' : 'pending',
        metadata: {
          processingTimeMs,
          context: content.context,
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error logging moderation result:', error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Add content to moderation queue
   */
  private async addToModerationQueue(
    content: ContentToModerate,
    severity: ModerationResult['severity']
  ): Promise<void> {
    const supabase = this.getSupabase();

    const priorityMap: Record<string, string> = {
      critical: 'urgent',
      high: 'high',
      medium: 'normal',
      low: 'low',
    };

    const { error } = await supabase.rpc('add_to_moderation_queue', {
      p_content_id: content.contentId,
      p_content_type: content.contentType,
      p_priority: priorityMap[severity] || 'normal',
    });

    if (error) {
      console.error('Error adding to moderation queue:', error);
    }
  }

  /**
   * Update moderation statistics
   */
  private async updateStatistics(
    contentType: string,
    result: ModerationResult
  ): Promise<void> {
    const supabase = this.getSupabase();
    const today = new Date().toISOString().split('T')[0];

    const categoryCounts: Record<string, number> = {};
    Object.entries(result.categories).forEach(([name, data]) => {
      if (data.detected) {
        categoryCounts[name] = (categoryCounts[name] || 0) + 1;
      }
    });

    const { error } = await supabase.rpc('update_moderation_stats', {
      p_date: today,
      p_content_type: contentType,
      p_flagged: result.flagged,
      p_blocked: result.autoAction === 'block',
      p_reviewed: false,
      p_false_positive: false,
      p_category_counts: categoryCounts,
    });

    if (error) {
      console.error('Error updating moderation statistics:', error);
    }
  }

  // ==================== QUEUE MANAGEMENT ====================

  /**
   * Get items from moderation queue
   */
  async getModerationQueue(
    limit: number = 50,
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  ): Promise<any[]> {
    const supabase = this.getSupabase();

    let query = supabase
      .from('moderation_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching moderation queue:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Mark queue item as processed
   */
  async markQueueItemProcessed(queueId: string, success: boolean = true): Promise<void> {
    const supabase = this.getSupabase();

    const { error } = await supabase
      .from('moderation_queue')
      .update({
        status: success ? 'completed' : 'failed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', queueId);

    if (error) {
      console.error('Error updating queue item:', error);
      throw error;
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Get moderation statistics
   */
  async getModerationStats(
    startDate: string,
    endDate: string,
    contentType?: string
  ): Promise<ModerationStats[]> {
    const supabase = this.getSupabase();

    let query = supabase
      .from('moderation_statistics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching moderation stats:', error);
      throw error;
    }

    return (data || []).map((stat) => ({
      date: stat.date,
      contentType: stat.content_type,
      totalChecked: stat.total_checked,
      flaggedCount: stat.flagged_count,
      blockedCount: stat.blocked_count,
      reviewedCount: stat.reviewed_count,
      falsePositiveCount: stat.false_positive_count,
      categoryCounts: stat.category_counts || {},
    }));
  }
}

// Export singleton instance
export const enhancedModerationService = new EnhancedModerationService();

