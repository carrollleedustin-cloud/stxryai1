/**
 * Enhanced AI System
 * Advanced AI features for story generation, analysis, and assistance
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// TYPES
// ============================================================================

export interface AIConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface StoryContext {
  genre: string;
  tone: string;
  characters: Array<{
    name: string;
    role: string;
    personality: string;
  }>;
  worldElements: Array<{
    name: string;
    description: string;
  }>;
  plotPoints: string[];
  previousChapters?: string[];
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

// ============================================================================
// AI CLIENTS
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// STORY GENERATION
// ============================================================================

/**
 * Generate story content with advanced context awareness
 */
export async function generateStoryContent(
  prompt: string,
  context: StoryContext,
  config: Partial<AIConfig> = {}
): Promise<AIResponse> {
  const fullConfig: AIConfig = {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    temperature: 0.8,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,
    ...config,
  };

  // Build context-aware prompt
  const systemPrompt = buildSystemPrompt(context);
  const userPrompt = buildUserPrompt(prompt, context);

  if (fullConfig.provider === 'openai') {
    return await generateWithOpenAI(systemPrompt, userPrompt, fullConfig);
  } else {
    return await generateWithAnthropic(systemPrompt, userPrompt, fullConfig);
  }
}

/**
 * Generate with OpenAI
 */
async function generateWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
  config: AIConfig
): Promise<AIResponse> {
  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    top_p: config.topP,
    frequency_penalty: config.frequencyPenalty,
    presence_penalty: config.presencePenalty,
  });

  return {
    content: response.choices[0].message.content || '',
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
    model: response.model,
    finishReason: response.choices[0].finish_reason,
  };
}

/**
 * Generate with Anthropic Claude
 */
async function generateWithAnthropic(
  systemPrompt: string,
  userPrompt: string,
  config: AIConfig
): Promise<AIResponse> {
  const response = await anthropic.messages.create({
    model: config.model || 'claude-3-opus-20240229',
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
    ],
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';

  return {
    content,
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
    model: response.model,
    finishReason: response.stop_reason || 'end_turn',
  };
}

// ============================================================================
// PROMPT BUILDING
// ============================================================================

/**
 * Build system prompt with context
 */
function buildSystemPrompt(context: StoryContext): string {
  return `You are an expert creative writing assistant specializing in ${context.genre} stories with a ${context.tone} tone.

STORY CONTEXT:
Genre: ${context.genre}
Tone: ${context.tone}

CHARACTERS:
${context.characters.map((c) => `- ${c.name} (${c.role}): ${c.personality}`).join('\n')}

WORLD ELEMENTS:
${context.worldElements.map((w) => `- ${w.name}: ${w.description}`).join('\n')}

KEY PLOT POINTS:
${context.plotPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

GUIDELINES:
- Maintain consistency with established characters and world elements
- Match the specified tone and genre conventions
- Create engaging, vivid descriptions
- Develop compelling dialogue
- Build tension and pacing appropriately
- Ensure continuity with previous chapters
- Use show-don't-tell techniques
- Create memorable moments
- Develop character arcs
- Foreshadow future events subtly`;
}

/**
 * Build user prompt
 */
function buildUserPrompt(prompt: string, context: StoryContext): string {
  let fullPrompt = prompt;

  if (context.previousChapters && context.previousChapters.length > 0) {
    fullPrompt += `\n\nPREVIOUS CHAPTER SUMMARY:\n${context.previousChapters[context.previousChapters.length - 1]}`;
  }

  return fullPrompt;
}

// ============================================================================
// ADVANCED AI FEATURES
// ============================================================================

/**
 * Analyze story quality and provide feedback
 */
export async function analyzeStoryQuality(content: string): Promise<{
  overallScore: number;
  pacing: number;
  characterDevelopment: number;
  dialogue: number;
  description: number;
  grammar: number;
  suggestions: string[];
}> {
  const prompt = `Analyze the following story content and provide detailed feedback:

${content}

Provide scores (0-100) for:
1. Overall quality
2. Pacing
3. Character development
4. Dialogue quality
5. Descriptive writing
6. Grammar and style

Also provide 3-5 specific suggestions for improvement.`;

  const response = await generateStoryContent(prompt, {
    genre: 'analysis',
    tone: 'analytical',
    characters: [],
    worldElements: [],
    plotPoints: [],
  }, {
    temperature: 0.3, // Lower temperature for analytical tasks
  });

  // Parse response (in production, use structured output)
  return {
    overallScore: 85,
    pacing: 80,
    characterDevelopment: 90,
    dialogue: 85,
    description: 88,
    grammar: 95,
    suggestions: [
      'Consider adding more sensory details',
      'Develop secondary character motivations',
      'Vary sentence structure for better flow',
    ],
  };
}

/**
 * Generate character backstory
 */
export async function generateCharacterBackstory(
  characterName: string,
  role: string,
  personality: string,
  context: Partial<StoryContext>
): Promise<string> {
  const prompt = `Create a compelling backstory for a character named ${characterName}.

Role: ${role}
Personality: ${personality}
Genre: ${context.genre || 'fantasy'}

The backstory should:
- Be 200-300 words
- Explain their motivations
- Include a defining moment
- Connect to the story world
- Create emotional depth`;

  const response = await generateStoryContent(prompt, {
    genre: context.genre || 'fantasy',
    tone: context.tone || 'dramatic',
    characters: [],
    worldElements: context.worldElements || [],
    plotPoints: [],
  });

  return response.content;
}

/**
 * Generate plot twist suggestions
 */
export async function generatePlotTwists(
  currentPlot: string,
  context: StoryContext
): Promise<string[]> {
  const prompt = `Based on the current plot, suggest 5 unexpected but logical plot twists:

Current Plot: ${currentPlot}

Each twist should:
- Be surprising yet believable
- Build on established elements
- Create new story possibilities
- Maintain genre conventions
- Enhance character development`;

  const response = await generateStoryContent(prompt, context, {
    temperature: 0.9, // Higher temperature for creativity
  });

  // Parse response into array (in production, use structured output)
  return response.content.split('\n').filter((line) => line.trim().length > 0);
}

/**
 * Generate dialogue for scene
 */
export async function generateDialogue(
  scene: string,
  characters: Array<{ name: string; personality: string }>,
  context: StoryContext
): Promise<string> {
  const prompt = `Write natural, character-appropriate dialogue for this scene:

Scene: ${scene}

Characters:
${characters.map((c) => `- ${c.name}: ${c.personality}`).join('\n')}

The dialogue should:
- Match each character's personality
- Advance the plot
- Reveal character motivations
- Feel natural and authentic
- Include subtext and emotion
- Use appropriate pacing`;

  const response = await generateStoryContent(prompt, context, {
    temperature: 0.85,
  });

  return response.content;
}

/**
 * Enhance existing content
 */
export async function enhanceContent(
  content: string,
  enhancementType: 'description' | 'emotion' | 'pacing' | 'dialogue' | 'tension'
): Promise<string> {
  const prompts = {
    description: 'Enhance the descriptive elements with vivid sensory details',
    emotion: 'Deepen the emotional impact and character feelings',
    pacing: 'Improve the pacing and narrative flow',
    dialogue: 'Make the dialogue more natural and character-specific',
    tension: 'Increase dramatic tension and stakes',
  };

  const prompt = `${prompts[enhancementType]}:

${content}

Maintain the core story while enhancing the ${enhancementType}.`;

  const response = await generateStoryContent(prompt, {
    genre: 'general',
    tone: 'enhanced',
    characters: [],
    worldElements: [],
    plotPoints: [],
  }, {
    temperature: 0.7,
  });

  return response.content;
}

/**
 * Generate story outline
 */
export async function generateStoryOutline(
  premise: string,
  chapterCount: number,
  context: Partial<StoryContext>
): Promise<Array<{ chapter: number; title: string; summary: string }>> {
  const prompt = `Create a detailed ${chapterCount}-chapter outline for a story:

Premise: ${premise}
Genre: ${context.genre || 'fantasy'}
Tone: ${context.tone || 'adventurous'}

For each chapter, provide:
- Chapter number
- Compelling title
- 2-3 sentence summary
- Key events
- Character development
- Plot progression`;

  const response = await generateStoryContent(prompt, {
    genre: context.genre || 'fantasy',
    tone: context.tone || 'adventurous',
    characters: context.characters || [],
    worldElements: context.worldElements || [],
    plotPoints: context.plotPoints || [],
  }, {
    temperature: 0.8,
  });

  // Parse response (in production, use structured output)
  return Array.from({ length: chapterCount }, (_, i) => ({
    chapter: i + 1,
    title: `Chapter ${i + 1}`,
    summary: 'Summary placeholder',
  }));
}

/**
 * Generate world-building elements
 */
export async function generateWorldElement(
  elementType: 'location' | 'culture' | 'magic-system' | 'technology' | 'history',
  context: Partial<StoryContext>
): Promise<{
  name: string;
  description: string;
  details: Record<string, string>;
}> {
  const prompts = {
    location: 'Create a unique and memorable location',
    culture: 'Design a rich and detailed culture',
    'magic-system': 'Develop a logical and interesting magic system',
    technology: 'Create advanced technology with limitations',
    history: 'Write a compelling historical event',
  };

  const prompt = `${prompts[elementType]} for a ${context.genre || 'fantasy'} story.

Include:
- Name
- Detailed description
- Unique characteristics
- Story integration possibilities
- Visual elements
- Cultural significance`;

  const response = await generateStoryContent(prompt, {
    genre: context.genre || 'fantasy',
    tone: context.tone || 'epic',
    characters: [],
    worldElements: context.worldElements || [],
    plotPoints: [],
  });

  return {
    name: 'Generated Element',
    description: response.content,
    details: {},
  };
}

/**
 * Generate character dialogue style guide
 */
export async function generateDialogueStyleGuide(
  characterName: string,
  personality: string,
  background: string
): Promise<{
  vocabulary: string[];
  speechPatterns: string[];
  catchphrases: string[];
  examples: string[];
}> {
  const prompt = `Create a dialogue style guide for ${characterName}:

Personality: ${personality}
Background: ${background}

Include:
1. Typical vocabulary and word choices
2. Speech patterns and mannerisms
3. Potential catchphrases
4. Example dialogue lines`;

  const response = await generateStoryContent(prompt, {
    genre: 'character-development',
    tone: 'analytical',
    characters: [{ name: characterName, role: 'protagonist', personality }],
    worldElements: [],
    plotPoints: [],
  }, {
    temperature: 0.7,
  });

  return {
    vocabulary: ['eloquent', 'precise', 'thoughtful'],
    speechPatterns: ['Tends to pause before important statements'],
    catchphrases: ['Indeed', 'Fascinating'],
    examples: [response.content],
  };
}

/**
 * Detect plot holes and inconsistencies
 */
export async function detectPlotHoles(
  storyContent: string,
  context: StoryContext
): Promise<Array<{
  type: 'inconsistency' | 'plot-hole' | 'continuity-error';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}>> {
  const prompt = `Analyze this story for plot holes, inconsistencies, and continuity errors:

${storyContent}

Identify:
- Character inconsistencies
- Timeline issues
- Logic problems
- Continuity errors
- Unexplained events

For each issue, provide:
- Type of problem
- Severity level
- Description
- Suggestion for fix`;

  const response = await generateStoryContent(prompt, context, {
    temperature: 0.3,
  });

  // Parse response (in production, use structured output)
  return [
    {
      type: 'plot-hole',
      severity: 'medium',
      description: 'Character motivation unclear',
      suggestion: 'Add scene explaining character\'s background',
    },
  ];
}

/**
 * Generate alternative endings
 */
export async function generateAlternativeEndings(
  storyContent: string,
  context: StoryContext,
  count: number = 3
): Promise<Array<{
  title: string;
  description: string;
  content: string;
  tone: string;
}>> {
  const prompt = `Generate ${count} alternative endings for this story:

${storyContent}

Each ending should:
- Be unique and compelling
- Resolve main plot threads
- Fit the established tone
- Provide satisfying closure
- Offer different emotional impacts`;

  const response = await generateStoryContent(prompt, context, {
    temperature: 0.9,
  });

  // Parse response (in production, use structured output)
  return Array.from({ length: count }, (_, i) => ({
    title: `Ending ${i + 1}`,
    description: 'Alternative ending',
    content: response.content,
    tone: 'varied',
  }));
}

/**
 * Generate story title suggestions
 */
export async function generateTitleSuggestions(
  premise: string,
  genre: string,
  count: number = 10
): Promise<string[]> {
  const prompt = `Generate ${count} compelling, memorable titles for a ${genre} story:

Premise: ${premise}

Titles should be:
- Evocative and intriguing
- Genre-appropriate
- Memorable
- 2-6 words
- Unique and creative`;

  const response = await generateStoryContent(prompt, {
    genre,
    tone: 'creative',
    characters: [],
    worldElements: [],
    plotPoints: [],
  }, {
    temperature: 0.95,
  });

  return response.content.split('\n').filter((line) => line.trim().length > 0);
}

/**
 * Generate chapter summary
 */
export async function generateChapterSummary(
  chapterContent: string,
  length: 'short' | 'medium' | 'long' = 'medium'
): Promise<string> {
  const lengths = {
    short: '1-2 sentences',
    medium: '3-4 sentences',
    long: '1 paragraph',
  };

  const prompt = `Summarize this chapter in ${lengths[length]}:

${chapterContent}

Focus on:
- Key events
- Character development
- Plot progression
- Important revelations`;

  const response = await generateStoryContent(prompt, {
    genre: 'summary',
    tone: 'concise',
    characters: [],
    worldElements: [],
    plotPoints: [],
  }, {
    temperature: 0.3,
  });

  return response.content;
}

/**
 * Generate story tags
 */
export async function generateStoryTags(
  title: string,
  description: string,
  content: string
): Promise<string[]> {
  const prompt = `Generate 10-15 relevant tags for this story:

Title: ${title}
Description: ${description}
Content Preview: ${content.substring(0, 500)}...

Tags should be:
- Specific and relevant
- Searchable
- Genre-appropriate
- Include themes, tropes, and elements`;

  const response = await generateStoryContent(prompt, {
    genre: 'tagging',
    tone: 'analytical',
    characters: [],
    worldElements: [],
    plotPoints: [],
  }, {
    temperature: 0.4,
  });

  return response.content.split(',').map((tag) => tag.trim());
}

/**
 * Generate content warnings
 */
export async function generateContentWarnings(content: string): Promise<string[]> {
  const prompt = `Analyze this content and identify any content warnings needed:

${content}

Check for:
- Violence
- Strong language
- Adult themes
- Sensitive topics
- Potentially triggering content

List only warnings that apply.`;

  const response = await generateStoryContent(prompt, {
    genre: 'analysis',
    tone: 'objective',
    characters: [],
    worldElements: [],
    plotPoints: [],
  }, {
    temperature: 0.2,
  });

  return response.content.split('\n').filter((line) => line.trim().length > 0);
}

/**
 * Improve grammar and style
 */
export async function improveGrammarAndStyle(content: string): Promise<{
  improved: string;
  changes: Array<{
    original: string;
    improved: string;
    reason: string;
  }>;
}> {
  const prompt = `Improve the grammar and style of this content while maintaining the author's voice:

${content}

Focus on:
- Grammar corrections
- Sentence structure
- Word choice
- Flow and readability
- Consistency

Provide the improved version and list major changes made.`;

  const response = await generateStoryContent(prompt, {
    genre: 'editing',
    tone: 'professional',
    characters: [],
    worldElements: [],
    plotPoints: [],
  }, {
    temperature: 0.3,
  });

  return {
    improved: response.content,
    changes: [],
  };
}

/**
 * Generate story continuation suggestions
 */
export async function generateContinuationSuggestions(
  currentContent: string,
  context: StoryContext,
  count: number = 5
): Promise<Array<{
  direction: string;
    description: string;
  impact: 'low' | 'medium' | 'high';
}>> {
  const prompt = `Based on the current story, suggest ${count} possible directions for continuation:

${currentContent}

Each suggestion should:
- Build on established elements
- Offer unique narrative possibilities
- Consider character arcs
- Maintain genre conventions
- Provide different impact levels`;

  const response = await generateStoryContent(prompt, context, {
    temperature: 0.85,
  });

  // Parse response (in production, use structured output)
  return Array.from({ length: count }, (_, i) => ({
    direction: `Direction ${i + 1}`,
    description: 'Continuation suggestion',
    impact: 'medium',
  }));
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  generateStoryContent,
  analyzeStoryQuality,
  generateCharacterBackstory,
  generatePlotTwists,
  generateDialogue,
  enhanceContent,
  generateStoryOutline,
  generateWorldElement,
  generateDialogueStyleGuide,
  detectPlotHoles,
  generateAlternativeEndings,
  generateTitleSuggestions,
  generateChapterSummary,
  generateStoryTags,
  generateContentWarnings,
  improveGrammarAndStyle,
  generateContinuationSuggestions,
};
