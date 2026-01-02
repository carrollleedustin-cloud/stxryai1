// Enhanced AI Configuration with OpenAI Focus
// Optimized for story generation and character sheet creation

export type AIProvider = 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// OpenAI models optimized for different tasks
export const OPENAI_MODELS = {
  // Best for complex reasoning and long-form content
  default: 'gpt-4o',
  // Faster, significantly cheaper alternative for simpler tasks
  fast: 'gpt-4o-mini',
  // Latest model with improved performance
  latest: 'gpt-4o',
};

// Anthropic models (fallback)
export const ANTHROPIC_MODELS = {
  default: 'claude-3-5-sonnet-20241022',
  fast: 'claude-3-5-haiku-20241022',
  latest: 'claude-3-5-sonnet-20241022',
};

// Task-specific configurations
export const TASK_CONFIGS = {
  characterSheet: {
    model: OPENAI_MODELS.default,
    maxTokens: 3000,
    temperature: 0.7,
    description: 'Generate detailed astrological character sheets',
  },
  storyGeneration: {
    model: OPENAI_MODELS.default,
    maxTokens: 2000,
    temperature: 0.8,
    description: 'Generate creative story content',
  },
  storyImprovement: {
    model: OPENAI_MODELS.default,
    maxTokens: 1500,
    temperature: 0.6,
    description: 'Improve and refine story content',
  },
  petDialogue: {
    model: OPENAI_MODELS.fast,
    maxTokens: 200,
    temperature: 0.9,
    description: 'Generate pet companion dialogue',
  },
  contentModeration: {
    model: OPENAI_MODELS.fast,
    maxTokens: 500,
    temperature: 0.3,
    description: 'Moderate user-generated content',
  },
};

// Default configuration (forced to OpenAI)
export const DEFAULT_AI_CONFIG: Omit<AIConfig, 'apiKey'> = {
  provider: 'openai',
  model: OPENAI_MODELS.default,
  maxTokens: 2000,
  temperature: 0.7,
};

// Model options for each provider
export const AI_MODELS = {
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
  ],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
  ],
};

// Get API key from environment
export function getAIApiKey(provider: AIProvider): string {
  const key = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY;

  if (!key) {
    throw new Error(`${provider.toUpperCase()} API key not configured. Please set ${provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY'} environment variable.`);
  }

  return key;
}

// Check if AI is configured
export function isAIConfigured(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

// Get active AI provider (prioritize OpenAI)
export function getActiveProvider(): AIProvider {
  // Force OpenAI as the active provider when available
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  // Default to OpenAI to honor product decision
  return 'openai';
}

// Get full AI configuration
export function getAIConfig(): AIConfig {
  const provider = getActiveProvider();
  return {
    ...DEFAULT_AI_CONFIG,
    provider,
    apiKey: getAIApiKey(provider),
    model: provider === 'openai' ? OPENAI_MODELS.default : ANTHROPIC_MODELS.default,
  };
}

// Get task-specific configuration
export function getTaskConfig(task: keyof typeof TASK_CONFIGS): AIConfig {
  const provider = getActiveProvider();
  const taskConfig = TASK_CONFIGS[task];
  
  return {
    provider,
    apiKey: getAIApiKey(provider),
    model: provider === 'openai' 
      ? taskConfig.model 
      : ANTHROPIC_MODELS.default,
    maxTokens: taskConfig.maxTokens,
    temperature: taskConfig.temperature,
  };
}

// Validate configuration
export function validateAIConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isAIConfigured()) {
    errors.push('No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.');
  }

  try {
    const config = getAIConfig();
    if (!config.apiKey) {
      errors.push('API key is empty or invalid.');
    }
    if (!config.model) {
      errors.push('Model is not specified.');
    }
    if (config.maxTokens < 100 || config.maxTokens > 4000) {
      errors.push('Max tokens should be between 100 and 4000.');
    }
    if (config.temperature < 0 || config.temperature > 2) {
      errors.push('Temperature should be between 0 and 2.');
    }
  } catch (error) {
    errors.push(`Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Get provider info for debugging
export function getProviderInfo(): {
  provider: AIProvider;
  model: string;
  configured: boolean;
  errors: string[];
} {
  const validation = validateAIConfig();
  const provider = getActiveProvider();
  const config = validation.valid ? getAIConfig() : null;

  return {
    provider,
    model: config?.model || 'unknown',
    configured: validation.valid,
    errors: validation.errors,
  };
}
