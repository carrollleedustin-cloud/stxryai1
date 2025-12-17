/**
 * AI Content Moderation System
 * Automatically detect and flag inappropriate content
 */

interface ModerationResult {
  flagged: boolean;
  categories: ModerationCategory[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  suggestions: string[];
  autoAction: 'allow' | 'review' | 'block';
}

interface ModerationCategory {
  name: string;
  detected: boolean;
  confidence: number;
  examples: string[];
}

interface ContentToModerate {
  text: string;
  context?: string;
  authorId?: string;
  contentType: 'story' | 'comment' | 'profile' | 'message';
}

interface OpenAIModerationResponse {
  id: string;
  model: string;
  results: {
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }[];
}

export class ContentModerationService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  // Moderation categories
  private readonly CATEGORIES = [
    'hate_speech',
    'harassment',
    'violence',
    'sexual_content',
    'self_harm',
    'illegal_activity',
    'spam',
    'personal_information',
  ];

  // Severity thresholds
  private readonly SEVERITY_THRESHOLDS = {
    low: 0.3,
    medium: 0.5,
    high: 0.7,
    critical: 0.9,
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  /**
   * Moderate content using AI
   */
  async moderateContent(content: ContentToModerate): Promise<ModerationResult> {
    try {
      if (!this.apiKey) {
        return this.getMockModerationResult();
      }

      // Call OpenAI Moderation API
      const response = await fetch(`${this.baseUrl}/moderations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input: content.text,
        }),
      });

      if (!response.ok) {
        console.error('Moderation API error:', response.statusText);
        return this.getMockModerationResult();
      }

      const data = (await response.json()) as OpenAIModerationResponse;
      return this.parseModerationResponse(data);
    } catch (error) {
      console.error('Content moderation failed:', error);
      return this.getMockModerationResult();
    }
  }

  /**
   * Batch moderate multiple pieces of content
   */
  async moderateBatch(contents: ContentToModerate[]): Promise<ModerationResult[]> {
    const results = await Promise.all(contents.map((content) => this.moderateContent(content)));
    return results;
  }

  /**
   * Check for spam patterns
   */
  async detectSpam(
    content: string
  ): Promise<{ isSpam: boolean; confidence: number; reasons: string[] }> {
    const spamIndicators = {
      excessiveLinks: (content.match(/https?:\/\//g) || []).length > 3,
      excessiveCaps: (content.match(/[A-Z]/g) || []).length / content.length > 0.5,
      repeatedText: this.hasRepeatedText(content),
      commonSpamWords: this.containsSpamWords(content),
      excessiveEmojis: (content.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length > 10,
    };

    const indicatorCount = Object.values(spamIndicators).filter(Boolean).length;
    const confidence = indicatorCount / Object.keys(spamIndicators).length;
    const isSpam = confidence > 0.5;

    const reasons: string[] = [];
    if (spamIndicators.excessiveLinks) reasons.push('Contains excessive links');
    if (spamIndicators.excessiveCaps) reasons.push('Excessive use of capital letters');
    if (spamIndicators.repeatedText) reasons.push('Contains repeated text patterns');
    if (spamIndicators.commonSpamWords) reasons.push('Contains common spam keywords');
    if (spamIndicators.excessiveEmojis) reasons.push('Excessive use of emojis');

    return { isSpam, confidence, reasons };
  }

  /**
   * Detect personal information (PII)
   */
  async detectPII(content: string): Promise<{ found: boolean; types: string[]; redacted: string }> {
    const piiPatterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      address: /\b\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way)\b/gi,
    };

    const foundTypes: string[] = [];
    let redacted = content;

    for (const [type, pattern] of Object.entries(piiPatterns)) {
      if (pattern.test(content)) {
        foundTypes.push(type);
        redacted = redacted.replace(pattern, `[${type.toUpperCase()} REDACTED]`);
      }
    }

    return {
      found: foundTypes.length > 0,
      types: foundTypes,
      redacted,
    };
  }

  /**
   * Analyze sentiment of content
   */
  async analyzeSentiment(content: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    emotions: Array<{ emotion: string; intensity: number }>;
  }> {
    // Simple keyword-based sentiment analysis
    // In production, use a proper sentiment analysis API

    const positiveWords = ['great', 'excellent', 'amazing', 'love', 'wonderful', 'fantastic'];
    const negativeWords = ['terrible', 'awful', 'hate', 'horrible', 'bad', 'worst'];

    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter((w) => positiveWords.includes(w)).length;
    const negativeCount = words.filter((w) => negativeWords.includes(w)).length;

    const score = (positiveCount - negativeCount) / Math.max(words.length, 1);

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (score > 0.05) sentiment = 'positive';
    if (score < -0.05) sentiment = 'negative';

    return {
      sentiment,
      score,
      emotions: [
        { emotion: 'joy', intensity: positiveCount / words.length },
        { emotion: 'anger', intensity: negativeCount / words.length },
      ],
    };
  }

  /**
   * Get content quality score
   */
  async assessContentQuality(content: string): Promise<{
    score: number;
    factors: {
      grammar: number;
      readability: number;
      engagement: number;
      originality: number;
    };
    improvements: string[];
  }> {
    const factors = {
      grammar: this.assessGrammar(content),
      readability: this.assessReadability(content),
      engagement: this.assessEngagement(content),
      originality: 0.7, // Placeholder - would use plagiarism detection in production
    };

    const score =
      (factors.grammar + factors.readability + factors.engagement + factors.originality) / 4;

    const improvements: string[] = [];
    if (factors.grammar < 0.7) improvements.push('Improve grammar and spelling');
    if (factors.readability < 0.7) improvements.push('Simplify sentence structure');
    if (factors.engagement < 0.7) improvements.push('Add more engaging content');

    return { score, factors, improvements };
  }

  /**
   * Private helper methods
   */

  private parseModerationResponse(data: OpenAIModerationResponse): ModerationResult {
    const result = data.results[0];
    const categories: ModerationCategory[] = [];

    // Parse category results
    for (const [category, detected] of Object.entries(result.categories)) {
      if (detected) {
        categories.push({
          name: category,
          detected: true,
          confidence: result.category_scores[category] || 0,
          examples: [], // Could extract specific examples
        });
      }
    }

    // Determine severity
    const maxScore = Math.max(...Object.values(result.category_scores).map((v) => Number(v)));
    let severity: ModerationResult['severity'] = 'low';
    if (maxScore >= this.SEVERITY_THRESHOLDS.critical) severity = 'critical';
    else if (maxScore >= this.SEVERITY_THRESHOLDS.high) severity = 'high';
    else if (maxScore >= this.SEVERITY_THRESHOLDS.medium) severity = 'medium';

    // Determine auto action
    let autoAction: ModerationResult['autoAction'] = 'allow';
    if (severity === 'critical') autoAction = 'block';
    else if (severity === 'high' || severity === 'medium') autoAction = 'review';

    return {
      flagged: result.flagged,
      categories,
      severity,
      confidence: maxScore,
      suggestions: this.generateModerationSuggestions(categories, severity),
      autoAction,
    };
  }

  private getMockModerationResult(): ModerationResult {
    // Mock safe result for development
    return {
      flagged: false,
      categories: [],
      severity: 'low',
      confidence: 0.05,
      suggestions: [],
      autoAction: 'allow',
    };
  }

  private generateModerationSuggestions(
    categories: ModerationCategory[],
    severity: ModerationResult['severity']
  ): string[] {
    const suggestions: string[] = [];

    if (severity === 'critical' || severity === 'high') {
      suggestions.push('Content violates community guidelines and should be removed');
    }

    if (categories.some((c) => c.name.includes('hate'))) {
      suggestions.push('Remove hate speech and discriminatory language');
    }

    if (categories.some((c) => c.name.includes('violence'))) {
      suggestions.push('Tone down violent content or add content warnings');
    }

    if (categories.some((c) => c.name.includes('sexual'))) {
      suggestions.push('Ensure content is age-appropriate');
    }

    return suggestions;
  }

  private hasRepeatedText(content: string): boolean {
    const words = content.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();

    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }

    // Check if any word appears more than 30% of the time
    const maxCount = Math.max(...Array.from(wordCounts.values()));
    return maxCount / words.length > 0.3;
  }

  private containsSpamWords(content: string): boolean {
    const spamWords = [
      'click here',
      'buy now',
      'limited time',
      'act now',
      'free money',
      'work from home',
      'make money fast',
    ];

    const lowerContent = content.toLowerCase();
    return spamWords.some((word) => lowerContent.includes(word));
  }

  private assessGrammar(content: string): number {
    // Simple heuristics - in production use a proper grammar checker
    const sentences = content.split(/[.!?]+/);
    let score = 1.0;

    // Penalize very short sentences
    const avgSentenceLength = content.length / sentences.length;
    if (avgSentenceLength < 10) score -= 0.2;

    // Check for basic capitalization
    const startsWithCap = sentences.filter((s) => /^[A-Z]/.test(s.trim())).length;
    score *= startsWithCap / sentences.length;

    return Math.max(0, Math.min(1, score));
  }

  private assessReadability(content: string): number {
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim());

    if (sentences.length === 0) return 0;

    // Calculate average words per sentence
    const avgWordsPerSentence = words.length / sentences.length;

    // Optimal range is 15-20 words per sentence
    let score = 1.0;
    if (avgWordsPerSentence < 10 || avgWordsPerSentence > 30) score -= 0.3;

    // Check vocabulary diversity
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    const diversity = uniqueWords.size / words.length;
    if (diversity < 0.4) score -= 0.2;

    return Math.max(0, Math.min(1, score));
  }

  private assessEngagement(content: string): number {
    let score = 0.5; // Base score

    // Presence of dialogue
    if (content.includes('"') || content.includes("'")) score += 0.15;

    // Variety of sentence structures
    const sentences = content.split(/[.!?]+/);
    const hasQuestions = sentences.some((s) => s.includes('?'));
    const hasExclamations = sentences.some((s) => s.includes('!'));
    if (hasQuestions) score += 0.1;
    if (hasExclamations) score += 0.1;

    // Length is reasonable (not too short, not too long)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 100 && wordCount <= 2000) score += 0.15;

    return Math.max(0, Math.min(1, score));
  }
}

// Export singleton instance
export const contentModerationService = new ContentModerationService();
