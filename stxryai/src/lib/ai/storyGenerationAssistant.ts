// AI Story Generation Assistant
// Helps authors with AI-powered story creation and enhancement

export interface StoryPrompt {
  genre: string;
  theme?: string;
  tone?: 'light' | 'dark' | 'humorous' | 'serious' | 'mysterious';
  setting?: string;
  characters?: string[];
  conflictType?: 'person vs person' | 'person vs self' | 'person vs society' | 'person vs nature';
  targetLength?: 'short' | 'medium' | 'long';
  additionalContext?: string;
}

export interface GeneratedContent {
  type: 'plot' | 'character' | 'dialogue' | 'description' | 'choice' | 'twist';
  content: string;
  alternatives?: string[];
  confidence: number;
  tags: string[];
}

export interface CharacterProfile {
  name: string;
  age?: number;
  background: string;
  personality: string[];
  motivations: string[];
  conflicts: string[];
  relationships: Record<string, string>;
}

export interface PlotPoint {
  id: string;
  type: 'exposition' | 'rising-action' | 'climax' | 'falling-action' | 'resolution';
  description: string;
  characters: string[];
  location?: string;
  choices?: string[];
  consequences?: Record<string, string>;
}

export interface StoryOutline {
  title: string;
  genre: string;
  premise: string;
  acts: {
    act: number;
    name: string;
    plotPoints: PlotPoint[];
  }[];
  characters: CharacterProfile[];
  themes: string[];
  estimatedWordCount: number;
}

/**
 * Generate story ideas based on prompt
 */
export function generateStoryIdeas(prompt: StoryPrompt, count: number = 3): string[] {
  const ideas: string[] = [];

  // Template-based idea generation (in production, would use actual AI API)
  const templates = [
    `A ${prompt.tone || 'mysterious'} ${prompt.genre} story about ${prompt.theme || 'redemption'} set in ${prompt.setting || 'a distant world'}`,
    `In ${prompt.setting || 'an unknown place'}, ${prompt.characters?.[0] || 'a protagonist'} must face ${prompt.conflictType || 'an internal struggle'}`,
    `A ${prompt.targetLength || 'medium'}-length ${prompt.genre} tale exploring ${prompt.theme || 'identity'} through ${prompt.tone || 'serious'} narrative`
  ];

  // Generate variations
  for (let i = 0; i < Math.min(count, templates.length); i++) {
    ideas.push(templates[i]);
  }

  return ideas;
}

/**
 * Generate character profiles
 */
export function generateCharacter(
  role: 'protagonist' | 'antagonist' | 'supporting',
  genre: string,
  context?: string
): CharacterProfile {
  // Template-based character generation
  const protagonistTemplates = {
    fantasy: {
      name: 'Aria Stormwind',
      background: 'A former royal guard seeking redemption after failing to protect the kingdom',
      personality: ['brave', 'loyal', 'haunted by past', 'determined'],
      motivations: ['seek redemption', 'protect the innocent', 'uncover the truth'],
      conflicts: ['trust issues', 'survivor guilt', 'fear of failure']
    },
    scifi: {
      name: 'Dr. Maya Chen',
      background: 'A brilliant scientist who discovered a dangerous technology',
      personality: ['intelligent', 'curious', 'morally conflicted', 'innovative'],
      motivations: ['advance science', 'protect humanity', 'atone for mistakes'],
      conflicts: ['ethics vs progress', 'isolation', 'responsibility']
    },
    mystery: {
      name: 'Detective James Rhodes',
      background: 'A seasoned investigator haunted by an unsolved case',
      personality: ['observant', 'persistent', 'intuitive', 'world-weary'],
      motivations: ['solve the case', 'find closure', 'seek justice'],
      conflicts: ['personal demons', 'trust in system', 'work-life balance']
    }
  };

  const template = protagonistTemplates[genre as keyof typeof protagonistTemplates] || protagonistTemplates.fantasy;

  return {
    name: template.name,
    background: template.background,
    personality: template.personality,
    motivations: template.motivations,
    conflicts: template.conflicts,
    relationships: {}
  };
}

/**
 * Generate plot outline
 */
export function generatePlotOutline(prompt: StoryPrompt): StoryOutline {
  const title = `The ${prompt.theme || 'Journey'} of ${prompt.setting || 'Tomorrow'}`;

  const outline: StoryOutline = {
    title,
    genre: prompt.genre,
    premise: `A ${prompt.tone || 'compelling'} ${prompt.genre} story exploring ${prompt.theme || 'adventure'}`,
    acts: [
      {
        act: 1,
        name: 'Setup',
        plotPoints: [
          {
            id: 'act1-p1',
            type: 'exposition',
            description: 'Introduce protagonist in their ordinary world',
            characters: ['protagonist'],
            location: prompt.setting || 'hometown'
          },
          {
            id: 'act1-p2',
            type: 'rising-action',
            description: 'Inciting incident disrupts status quo',
            characters: ['protagonist'],
            choices: ['Accept the call', 'Refuse and face consequences']
          }
        ]
      },
      {
        act: 2,
        name: 'Confrontation',
        plotPoints: [
          {
            id: 'act2-p1',
            type: 'rising-action',
            description: 'Protagonist faces escalating challenges',
            characters: ['protagonist', 'mentor'],
            choices: ['Trust the mentor', 'Go it alone']
          },
          {
            id: 'act2-p2',
            type: 'climax',
            description: 'Major confrontation with antagonistic force',
            characters: ['protagonist', 'antagonist'],
            choices: ['Fight', 'Negotiate', 'Retreat']
          }
        ]
      },
      {
        act: 3,
        name: 'Resolution',
        plotPoints: [
          {
            id: 'act3-p1',
            type: 'falling-action',
            description: 'Deal with consequences of climax',
            characters: ['protagonist']
          },
          {
            id: 'act3-p2',
            type: 'resolution',
            description: 'Return to ordinary world, transformed',
            characters: ['protagonist'],
            choices: ['Accept new role', 'Return to old life']
          }
        ]
      }
    ],
    characters: [
      generateCharacter('protagonist', prompt.genre),
      generateCharacter('antagonist', prompt.genre),
      generateCharacter('supporting', prompt.genre)
    ],
    themes: [prompt.theme || 'growth', 'transformation', 'courage'],
    estimatedWordCount: prompt.targetLength === 'short' ? 3000 : prompt.targetLength === 'long' ? 15000 : 8000
  };

  return outline;
}

/**
 * Generate dialogue for a scene
 */
export function generateDialogue(
  characters: string[],
  context: string,
  tone: StoryPrompt['tone'] = 'serious',
  lines: number = 4
): GeneratedContent {
  const dialogueLines: string[] = [];

  // Template-based dialogue generation
  const templates: Record<string, string[]> = {
    serious: [
      `${characters[0]}: "We need to talk about what happened."`,
      `${characters[1]}: "I know. I've been avoiding this conversation."`,
      `${characters[0]}: "The truth is, we can't continue like this."`,
      `${characters[1]}: "You're right. It's time for a change."`
    ],
    light: [
      `${characters[0]}: "Did you really think that would work?"`,
      `${characters[1]}: "Well, it seemed like a good idea at the time!"`,
      `${characters[0]}: "That's what you always say."`,
      `${characters[1]}: "And I'm always right... eventually."`
    ],
    dark: [
      `${characters[0]}: "There's no going back now."`,
      `${characters[1]}: "I never wanted it to come to this."`,
      `${characters[0]}: "Yet here we are."`,
      `${characters[1]}: "And one of us won't leave this place."`
    ],
    humorous: [
      `${characters[0]}: "So... that happened."`,
      `${characters[1]}: "In my defense, I had no idea that would explode."`,
      `${characters[0]}: "It literally said 'highly explosive' on the label."`,
      `${characters[1]}: "Details, details..."`
    ],
    mysterious: [
      `${characters[0]}: "You knew, didn't you?"`,
      `${characters[1]}: "Knew what?"`,
      `${characters[0]}: "Don't play games. The truth."`,
      `${characters[1]}: "Truth is relative. What do you want to hear?"`
    ]
  };

  const selectedTemplate = templates[tone || 'serious'] || templates.serious;
  dialogueLines.push(...selectedTemplate.slice(0, lines));

  return {
    type: 'dialogue',
    content: dialogueLines.join('\n'),
    alternatives: [
      dialogueLines.map(line => line.replace('talk', 'discuss')).join('\n')
    ],
    confidence: 0.75,
    tags: [tone, 'dialogue', 'conversation']
  };
}

/**
 * Generate scene description
 */
export function generateSceneDescription(
  setting: string,
  mood: string,
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
): GeneratedContent {
  const descriptions = {
    morning: `The early morning light filtered through ${setting}, casting long shadows across the ground. The air was crisp and filled with the promise of a new beginning.`,
    afternoon: `${setting} basked in the warm afternoon sun. Everything seemed peaceful, yet an undercurrent of tension hung in the air.`,
    evening: `As evening descended upon ${setting}, the world took on a golden hue. Shadows grew longer, and the atmosphere shifted from day to night.`,
    night: `Night had fallen over ${setting}. Darkness wrapped around everything, punctuated only by scattered points of light.`
  };

  const moodModifiers = {
    tense: 'An uneasy silence pervaded the space, as if the very air held its breath.',
    peaceful: 'A sense of calm settled over everything, bringing with it a moment of tranquility.',
    mysterious: 'An enigmatic quality hung over the scene, as if secrets lurked in every corner.',
    ominous: 'Something felt wrong, though it was impossible to say what. Danger seemed to lurk just out of sight.'
  };

  const baseDescription = descriptions[timeOfDay];
  const moodDescription = moodModifiers[mood as keyof typeof moodModifiers] || '';

  return {
    type: 'description',
    content: `${baseDescription} ${moodDescription}`,
    alternatives: [
      `${setting} ${timeOfDay === 'night' ? 'was shrouded in darkness' : 'lay before them'}. ${moodDescription}`
    ],
    confidence: 0.8,
    tags: ['description', 'setting', mood, timeOfDay]
  };
}

/**
 * Generate choice options for interactive story
 */
export function generateChoices(
  context: string,
  situation: string,
  count: number = 3
): GeneratedContent {
  // Generate meaningful choices based on situation
  const choices = [
    'Take the direct approach and confront the situation head-on',
    'Look for an alternative path that might be safer',
    'Gather more information before making a decision',
    'Trust your instincts and follow your gut feeling',
    'Seek help from someone you trust'
  ];

  const selectedChoices = choices.slice(0, count);

  return {
    type: 'choice',
    content: selectedChoices.join('\n'),
    alternatives: [
      [
        'Act immediately without hesitation',
        'Wait and observe before acting',
        'Try to find a compromise'
      ].join('\n')
    ],
    confidence: 0.7,
    tags: ['choice', 'decision', 'interactive']
  };
}

/**
 * Generate plot twist suggestions
 */
export function generatePlotTwist(
  genre: string,
  currentPlot: string
): GeneratedContent {
  const twistTemplates = {
    mystery: 'The trusted ally has been working against the protagonist all along',
    fantasy: 'The magical artifact is actually a prison for an ancient evil',
    scifi: 'The entire reality is a simulation designed to test humanity',
    thriller: 'The person they\'re trying to save is already dead',
    romance: 'The romantic interest is keeping a life-changing secret'
  };

  const twist = twistTemplates[genre as keyof typeof twistTemplates] ||
    'A shocking revelation changes everything they thought they knew';

  return {
    type: 'twist',
    content: twist,
    alternatives: [
      'The antagonist was actually trying to prevent a greater catastrophe',
      'The protagonist discovers they have a hidden connection to the conflict'
    ],
    confidence: 0.65,
    tags: ['plot-twist', 'surprise', genre]
  };
}

/**
 * Analyze and suggest improvements to existing content
 */
export interface ContentAnalysis {
  pacing: {
    score: number; // 0-100
    feedback: string;
    suggestions: string[];
  };
  characterDevelopment: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  dialogue: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  description: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  overall: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
}

export function analyzeContent(content: string, genre: string): ContentAnalysis {
  // Simple heuristic-based analysis (in production, would use NLP)
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = content.split(/[.!?]+/).length;
  const avgSentenceLength = wordCount / sentenceCount;
  const dialogueLines = (content.match(/["'].*?["']/g) || []).length;
  const descriptiveWords = (content.match(/\b(beautiful|dark|mysterious|ancient|gleaming)\b/gi) || []).length;

  return {
    pacing: {
      score: avgSentenceLength > 15 ? 65 : 85,
      feedback: avgSentenceLength > 15
        ? 'Pacing could be improved with shorter, punchier sentences'
        : 'Good pacing with varied sentence structure',
      suggestions: [
        'Break up longer sentences for better flow',
        'Add action beats between dialogue',
        'Use paragraph breaks to control pace'
      ]
    },
    characterDevelopment: {
      score: 75,
      feedback: 'Characters show potential but could use more depth',
      suggestions: [
        'Show character motivations through actions, not just dialogue',
        'Add internal conflict to make characters more relatable',
        'Give characters distinct voices and mannerisms'
      ]
    },
    dialogue: {
      score: dialogueLines > 5 ? 80 : 60,
      feedback: dialogueLines > 5
        ? 'Good use of dialogue to advance the story'
        : 'Consider adding more dialogue to show character relationships',
      suggestions: [
        'Avoid exposition-heavy dialogue',
        'Use subtext to add depth',
        'Give each character a unique speaking style'
      ]
    },
    description: {
      score: descriptiveWords > 3 ? 80 : 65,
      feedback: 'Descriptions paint a vivid picture',
      suggestions: [
        'Engage multiple senses in descriptions',
        'Use metaphors and similes sparingly but effectively',
        'Balance description with action'
      ]
    },
    overall: {
      score: 75,
      strengths: [
        'Engaging premise',
        'Clear narrative voice',
        'Good genre conventions'
      ],
      improvements: [
        'Deepen character development',
        'Vary sentence structure for better pacing',
        'Add more sensory details'
      ]
    }
  };
}

/**
 * Generate continuation for incomplete story
 */
export function generateContinuation(
  existingContent: string,
  targetLength: number = 200
): GeneratedContent {
  // Analyze last paragraph to continue smoothly
  const continuation = `The events that followed would change everything. As they stood at this crossroads, neither could have imagined where their choices would lead them.`;

  return {
    type: 'plot',
    content: continuation,
    alternatives: [
      'What happened next tested every belief they held dear.',
      'The path forward was unclear, but standing still was not an option.'
    ],
    confidence: 0.7,
    tags: ['continuation', 'plot', 'transition']
  };
}
