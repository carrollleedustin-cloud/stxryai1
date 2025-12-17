// AI API Client
// Unified client for OpenAI and Anthropic APIs

import { getAIConfig, AIProvider } from './config';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AICompletionResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  options: AICompletionOptions,
  apiKey: string
): Promise<AICompletionResponse> {
  const config = getAIConfig();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || config.model,
      messages: options.messages,
      temperature: options.temperature ?? config.temperature,
      max_tokens: options.maxTokens ?? config.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const choice = data.choices[0];

  return {
    content: choice.message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
    model: data.model,
    finishReason: choice.finish_reason,
  };
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
  options: AICompletionOptions,
  apiKey: string
): Promise<AICompletionResponse> {
  const config = getAIConfig();

  // Convert messages to Anthropic format
  const systemMessage = options.messages.find((m) => m.role === 'system');
  const conversationMessages = options.messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.model || config.model,
      system: systemMessage?.content,
      messages: conversationMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options.temperature ?? config.temperature,
      max_tokens: options.maxTokens ?? config.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
    model: data.model,
    finishReason: data.stop_reason,
  };
}

/**
 * Generate AI completion
 */
export async function generateCompletion(
  options: AICompletionOptions
): Promise<AICompletionResponse> {
  const config = getAIConfig();

  if (config.provider === 'openai') {
    return callOpenAI(options, config.apiKey);
  } else {
    return callAnthropic(options, config.apiKey);
  }
}

/**
 * Generate a simple text completion
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  temperature?: number
): Promise<string> {
  const messages: AIMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await generateCompletion({
    messages,
    temperature,
  });

  return response.content;
}

/**
 * Generate with conversation history
 */
export async function generateWithHistory(
  newMessage: string,
  history: AIMessage[],
  systemPrompt?: string
): Promise<string> {
  const messages: AIMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push(...history);
  messages.push({ role: 'user', content: newMessage });

  const response = await generateCompletion({ messages });

  return response.content;
}

/**
 * Stream AI completion (for real-time generation)
 */
export async function* streamCompletion(
  options: AICompletionOptions
): AsyncGenerator<string, void, unknown> {
  const config = getAIConfig();

  if (config.provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || config.model,
        messages: options.messages,
        temperature: options.temperature ?? config.temperature,
        max_tokens: options.maxTokens ?? config.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } else {
    // Anthropic streaming
    const systemMessage = options.messages.find((m) => m.role === 'system');
    const conversationMessages = options.messages.filter((m) => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || config.model,
        system: systemMessage?.content,
        messages: conversationMessages,
        temperature: options.temperature ?? config.temperature,
        max_tokens: options.maxTokens ?? config.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          try {
            const json = JSON.parse(data);
            if (json.type === 'content_block_delta') {
              const content = json.delta?.text;
              if (content) yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

/**
 * Helper to check if AI is available
 */
export function isAIAvailable(): boolean {
  try {
    getAIConfig();
    return true;
  } catch {
    return false;
  }
}
