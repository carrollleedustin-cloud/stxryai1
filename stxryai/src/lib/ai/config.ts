// AI API Configuration

export type AIProvider = 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// Default configuration
export const DEFAULT_AI_CONFIG: Omit<AIConfig, 'apiKey'> = {
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4000,
  temperature: 0.7
};

// Model options for each provider
export const AI_MODELS = {
  openai: [
    'gpt-4-turbo-preview',
    'gpt-4',
    'gpt-3.5-turbo'
  ],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ]
};

// Get API key from environment
export function getAIApiKey(provider: AIProvider): string {
  const key = provider === 'openai'
    ? process.env.OPENAI_API_KEY
    : process.env.ANTHROPIC_API_KEY;

  if (!key) {
    throw new Error(`${provider.toUpperCase()} API key not configured`);
  }

  return key;
}

// Check if AI is configured
export function isAIConfigured(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

// Get active AI provider
export function getActiveProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  throw new Error('No AI provider configured');
}

// Get full AI configuration
export function getAIConfig(): AIConfig {
  const provider = getActiveProvider();
  return {
    ...DEFAULT_AI_CONFIG,
    provider,
    apiKey: getAIApiKey(provider),
    model: provider === 'anthropic'
      ? 'claude-3-5-sonnet-20241022'
      : 'gpt-4-turbo-preview'
  };
}
