/**
 * AI Response Cache
 * Caches AI-generated content to reduce API costs and improve response times
 */

import { queryCache, generateCacheKey } from './queryCache';

// ========================================
// TYPES
// ========================================

export interface CachedAIResponse {
  content: string;
  model: string;
  promptHash: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  timestamp: number;
  expiresAt: number;
  metadata?: Record<string, unknown>;
}

export interface AIPromptContext {
  type: 'story_continuation' | 'character_dialogue' | 'world_building' | 'choice_generation' | 'summary' | 'suggestion';
  seriesId?: string;
  bookId?: string;
  chapterId?: string;
  characterId?: string;
  genre?: string;
  tone?: string;
  additionalContext?: string;
}

export interface CacheConfig {
  enabled: boolean;
  ttlByType: Record<AIPromptContext['type'], number>; // TTL in milliseconds
  maxEntries: number;
  similarityThreshold: number; // 0-1, how similar prompts need to be
}

// ========================================
// DEFAULT CONFIG
// ========================================

const DEFAULT_CONFIG: CacheConfig = {
  enabled: true,
  ttlByType: {
    story_continuation: 5 * 60 * 1000,     // 5 minutes - unique per context
    character_dialogue: 10 * 60 * 1000,     // 10 minutes - voice is consistent
    world_building: 30 * 60 * 1000,         // 30 minutes - rarely changes
    choice_generation: 2 * 60 * 1000,       // 2 minutes - choices should vary
    summary: 60 * 60 * 1000,                // 1 hour - summaries are stable
    suggestion: 15 * 60 * 1000,             // 15 minutes
  },
  maxEntries: 1000,
  similarityThreshold: 0.95,
};

// ========================================
// CACHE IMPLEMENTATION
// ========================================

class AIResponseCache {
  private config: CacheConfig;
  private promptHashes: Map<string, string> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    tokensSaved: 0,
    costSaved: 0, // Approximate USD saved
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a hash for the prompt to use as cache key
   */
  private hashPrompt(prompt: string, context: AIPromptContext): string {
    // Normalize the prompt
    const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Create a deterministic key from prompt + context
    const contextKey = [
      context.type,
      context.seriesId,
      context.bookId,
      context.chapterId,
      context.characterId,
      context.genre,
      context.tone,
    ].filter(Boolean).join(':');

    // Simple hash function for browser compatibility
    let hash = 0;
    const str = normalized + contextKey;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `ai:${context.type}:${Math.abs(hash).toString(36)}`;
  }

  /**
   * Check if a cached response exists and is valid
   */
  get(prompt: string, context: AIPromptContext): CachedAIResponse | null {
    if (!this.config.enabled) return null;

    const key = this.hashPrompt(prompt, context);
    const cached = queryCache.get<CachedAIResponse>(key);

    if (cached && cached.expiresAt > Date.now()) {
      this.stats.hits++;
      this.stats.tokensSaved += cached.tokens.total;
      this.stats.costSaved += this.estimateCost(cached.tokens);
      return cached;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Store an AI response in cache
   */
  set(
    prompt: string,
    context: AIPromptContext,
    response: string,
    model: string,
    tokens: CachedAIResponse['tokens'],
    metadata?: Record<string, unknown>
  ): void {
    if (!this.config.enabled) return;

    const key = this.hashPrompt(prompt, context);
    const ttl = this.config.ttlByType[context.type];
    
    const cached: CachedAIResponse = {
      content: response,
      model,
      promptHash: key,
      tokens,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      metadata,
    };

    queryCache.set(key, cached, ttl);
    this.promptHashes.set(key, prompt.substring(0, 100)); // Store truncated prompt for debugging
  }

  /**
   * Find similar cached responses
   */
  findSimilar(prompt: string, context: AIPromptContext): CachedAIResponse[] {
    const key = this.hashPrompt(prompt, context);
    const basePrefix = `ai:${context.type}:`;
    
    // Get all keys with same type prefix
    const similar: CachedAIResponse[] = [];
    
    // This would require extending queryCache with getAllByPrefix
    // For now, we do exact match only
    const cached = queryCache.get<CachedAIResponse>(key);
    if (cached) similar.push(cached);
    
    return similar;
  }

  /**
   * Invalidate cache for a specific context
   */
  invalidate(context: Partial<AIPromptContext>): void {
    const patterns: string[] = [];
    
    if (context.type) patterns.push(`ai:${context.type}:`);
    if (context.seriesId) patterns.push(context.seriesId);
    if (context.characterId) patterns.push(context.characterId);
    
    // Invalidate matching patterns
    patterns.forEach(pattern => {
      queryCache.invalidatePattern(pattern);
    });
  }

  /**
   * Clear all AI response cache
   */
  clear(): void {
    queryCache.invalidatePattern('ai:');
    this.promptHashes.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    tokensSaved: number;
    costSaved: number;
    estimatedMonthlySavings: number;
  } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    // Extrapolate monthly savings based on current rate
    const uptimeHours = 1; // Assume 1 hour of data
    const estimatedMonthlySavings = (this.stats.costSaved / uptimeHours) * 24 * 30;
    
    return {
      ...this.stats,
      hitRate,
      estimatedMonthlySavings,
    };
  }

  /**
   * Estimate cost for tokens (based on GPT-4 pricing)
   */
  private estimateCost(tokens: CachedAIResponse['tokens']): number {
    const PROMPT_COST_PER_1K = 0.03;    // $0.03 per 1K prompt tokens
    const COMPLETION_COST_PER_1K = 0.06; // $0.06 per 1K completion tokens
    
    return (
      (tokens.prompt / 1000) * PROMPT_COST_PER_1K +
      (tokens.completion / 1000) * COMPLETION_COST_PER_1K
    );
  }

  /**
   * Configure cache settings
   */
  configure(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enable/disable caching
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Check if caching is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// ========================================
// EXPORTS
// ========================================

export const aiResponseCache = new AIResponseCache();

/**
 * Decorator/wrapper for caching AI responses
 */
export async function withAICache<T>(
  prompt: string,
  context: AIPromptContext,
  generateFn: () => Promise<{
    content: string;
    model: string;
    tokens: CachedAIResponse['tokens'];
  }>,
  metadata?: Record<string, unknown>
): Promise<{ content: string; fromCache: boolean; tokens?: CachedAIResponse['tokens'] }> {
  // Check cache first
  const cached = aiResponseCache.get(prompt, context);
  if (cached) {
    return {
      content: cached.content,
      fromCache: true,
      tokens: cached.tokens,
    };
  }

  // Generate new response
  const result = await generateFn();

  // Cache the result
  aiResponseCache.set(prompt, context, result.content, result.model, result.tokens, metadata);

  return {
    content: result.content,
    fromCache: false,
    tokens: result.tokens,
  };
}

/**
 * Generate cache key for specific use cases
 */
export const aiCacheKeys = {
  storyContext: (seriesId: string, bookId?: string, chapterId?: string) =>
    generateCacheKey('ai:story', seriesId, bookId, chapterId),
  
  characterVoice: (characterId: string, mood?: string) =>
    generateCacheKey('ai:character', characterId, mood),
  
  worldElement: (seriesId: string, elementType: string, elementId?: string) =>
    generateCacheKey('ai:world', seriesId, elementType, elementId),
  
  choiceGeneration: (chapterId: string, choiceCount: number) =>
    generateCacheKey('ai:choices', chapterId, choiceCount.toString()),
};

