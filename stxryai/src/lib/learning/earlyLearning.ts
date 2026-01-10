/**
 * Early Learning Integration System
 * Age-appropriate content, phonics games, and educational activities
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ContentTier {
  id: string;
  name: string;
  ageRange: [number, number];
  gradeLevel: 'pre-k' | 'k' | '1' | '2' | '3' | '4' | '5';
  readingLevel: string;
  skills: LearningSkill[];
  contentFeatures: string[];
  adaptiveDifficulty: boolean;
}

export interface LearningSkill {
  id: string;
  category:
    | 'phonics'
    | 'vocabulary'
    | 'comprehension'
    | 'fluency'
    | 'writing'
    | 'math'
    | 'science'
    | 'social-emotional';
  name: string;
  description: string;
  gradeLevel: string[];
  activities: LearningActivity[];
}

export interface LearningActivity {
  id: string;
  type: 'game' | 'quiz' | 'interactive' | 'creative' | 'assessment';
  title: string;
  description: string;
  duration: number; // minutes
  difficulty: 1 | 2 | 3 | 4 | 5;
  skillsTargeted: string[];
  rewards: {
    xp: number;
    currency: number;
  };
}

export interface PhonicsGame {
  id: string;
  type: 'letter-sound' | 'blending' | 'segmenting' | 'rhyming' | 'word-families';
  title: string;
  instructions: string;
  level: number;
  words: PhonicsWord[];
  timeLimit?: number;
  minAccuracy: number; // percentage to pass
}

export interface PhonicsWord {
  word: string;
  phonemes: string[]; // individual sounds
  syllables: string[];
  difficulty: number;
  imageUrl?: string;
  audioUrl?: string;
}

export interface VocabularyGame {
  id: string;
  type: 'matching' | 'context-clues' | 'synonyms' | 'antonyms' | 'word-builder' | 'picture-word';
  title: string;
  words: VocabularyItem[];
  level: number;
  theme?: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  partOfSpeech: string;
  exampleSentence: string;
  imageUrl?: string;
  audioUrl?: string;
  difficulty: number;
  culturalContext?: string;
}

export interface ComprehensionActivity {
  id: string;
  storyId: string;
  chapterId: string;
  type: 'story-choice' | 'prediction' | 'character-analysis' | 'sequencing' | 'main-idea';
  question: string;
  options: ComprehensionOption[];
  correctAnswer: string;
  explanation: string;
  skillLevel: string;
}

export interface ComprehensionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface MathConcept {
  id: string;
  concept: 'counting' | 'addition' | 'subtraction' | 'patterns' | 'shapes' | 'measurement';
  title: string;
  storyContext: string;
  problem: string;
  visualAid?: string;
  answer: number | string;
  gradeLevel: string[];
}

export interface ScienceConcept {
  id: string;
  concept: 'nature' | 'animals' | 'weather' | 'space' | 'body' | 'simple-machines';
  title: string;
  storyContext: string;
  question: string;
  explanation: string;
  interactiveElement?: string;
  gradeLevel: string[];
}

export interface SocialEmotionalScenario {
  id: string;
  skill:
    | 'empathy'
    | 'conflict-resolution'
    | 'self-awareness'
    | 'friendship'
    | 'responsibility'
    | 'resilience';
  title: string;
  scenario: string;
  characters: string[];
  choices: EmotionalChoice[];
  learningObjective: string;
  discussionPrompts: string[];
}

export interface EmotionalChoice {
  id: string;
  action: string;
  outcome: string;
  emotionalImpact: {
    character: string;
    emotion: string;
    explanation: string;
  }[];
  isPositive: boolean;
  teachingPoint: string;
}

export interface FineMotorActivity {
  id: string;
  type: 'drawing' | 'tracing' | 'coloring' | 'pattern-making' | 'story-illustration';
  title: string;
  instructions: string;
  template?: string;
  tools: ('pencil' | 'brush' | 'eraser' | 'colors' | 'shapes')[];
  ageAppropriate: string[];
}

// ============================================================================
// CONTENT TIERS
// ============================================================================

export const contentTiers: ContentTier[] = [
  {
    id: 'pre-k',
    name: 'Pre-Kindergarten',
    ageRange: [3, 5],
    gradeLevel: 'pre-k',
    readingLevel: 'Pre-A',
    skills: [],
    contentFeatures: [
      'Picture-heavy stories',
      'Simple vocabulary',
      'Interactive elements',
      'Audio narration',
      'Touch-and-learn activities',
    ],
    adaptiveDifficulty: true,
  },
  {
    id: 'kindergarten',
    name: 'Kindergarten',
    ageRange: [5, 6],
    gradeLevel: 'k',
    readingLevel: 'A-C',
    skills: [],
    contentFeatures: [
      'Sight word practice',
      'Letter recognition',
      'Phonemic awareness',
      'Simple sentences',
      'Predictable patterns',
    ],
    adaptiveDifficulty: true,
  },
  {
    id: 'grade-1',
    name: 'First Grade',
    ageRange: [6, 7],
    gradeLevel: '1',
    readingLevel: 'D-J',
    skills: [],
    contentFeatures: [
      'Phonics-based reading',
      'Short chapters',
      'Comprehension questions',
      'Vocabulary building',
      'Fluency practice',
    ],
    adaptiveDifficulty: true,
  },
  {
    id: 'grade-2',
    name: 'Second Grade',
    ageRange: [7, 8],
    gradeLevel: '2',
    readingLevel: 'K-M',
    skills: [],
    contentFeatures: [
      'Longer narratives',
      'Complex vocabulary',
      'Inferential questions',
      'Character analysis',
      'Story elements',
    ],
    adaptiveDifficulty: true,
  },
  {
    id: 'grade-3',
    name: 'Third Grade',
    ageRange: [8, 9],
    gradeLevel: '3',
    readingLevel: 'N-P',
    skills: [],
    contentFeatures: [
      'Chapter books',
      'Multiple perspectives',
      'Critical thinking',
      'Research skills',
      'Writing integration',
    ],
    adaptiveDifficulty: true,
  },
  {
    id: 'grade-4',
    name: 'Fourth Grade',
    ageRange: [9, 10],
    gradeLevel: '4',
    readingLevel: 'Q-S',
    skills: [],
    contentFeatures: [
      'Complex plots',
      'Academic vocabulary',
      'Text analysis',
      'Compare and contrast',
      'Argumentative thinking',
    ],
    adaptiveDifficulty: true,
  },
  {
    id: 'grade-5',
    name: 'Fifth Grade',
    ageRange: [10, 11],
    gradeLevel: '5',
    readingLevel: 'T-V',
    skills: [],
    contentFeatures: [
      'Advanced literature',
      'Synthesis skills',
      'Evaluation',
      'Research projects',
      'Creative writing',
    ],
    adaptiveDifficulty: true,
  },
];

// ============================================================================
// PHONICS GAMES
// ============================================================================

export const phonicsGames: PhonicsGame[] = [
  {
    id: 'letter-sounds-1',
    type: 'letter-sound',
    title: 'Letter Sound Match',
    instructions: 'Match each letter with its sound',
    level: 1,
    words: [
      { word: 'cat', phonemes: ['k', 'æ', 't'], syllables: ['cat'], difficulty: 1 },
      { word: 'dog', phonemes: ['d', 'ɔ', 'g'], syllables: ['dog'], difficulty: 1 },
      { word: 'sun', phonemes: ['s', 'ʌ', 'n'], syllables: ['sun'], difficulty: 1 },
    ],
    minAccuracy: 80,
  },
  {
    id: 'blending-1',
    type: 'blending',
    title: 'Sound Blending Adventure',
    instructions: 'Blend the sounds together to make words',
    level: 2,
    words: [
      { word: 'ship', phonemes: ['ʃ', 'ɪ', 'p'], syllables: ['ship'], difficulty: 2 },
      { word: 'frog', phonemes: ['f', 'r', 'ɔ', 'g'], syllables: ['frog'], difficulty: 2 },
      { word: 'tree', phonemes: ['t', 'r', 'i'], syllables: ['tree'], difficulty: 2 },
    ],
    minAccuracy: 75,
  },
  {
    id: 'rhyming-1',
    type: 'rhyming',
    title: 'Rhyme Time',
    instructions: 'Find words that rhyme',
    level: 1,
    words: [
      { word: 'cat', phonemes: ['k', 'æ', 't'], syllables: ['cat'], difficulty: 1 },
      { word: 'hat', phonemes: ['h', 'æ', 't'], syllables: ['hat'], difficulty: 1 },
      { word: 'mat', phonemes: ['m', 'æ', 't'], syllables: ['mat'], difficulty: 1 },
    ],
    minAccuracy: 80,
  },
  {
    id: 'word-families-1',
    type: 'word-families',
    title: 'Word Family Fun',
    instructions: 'Build words from the same family',
    level: 2,
    words: [
      { word: 'make', phonemes: ['m', 'eɪ', 'k'], syllables: ['make'], difficulty: 2 },
      { word: 'take', phonemes: ['t', 'eɪ', 'k'], syllables: ['take'], difficulty: 2 },
      { word: 'bake', phonemes: ['b', 'eɪ', 'k'], syllables: ['bake'], difficulty: 2 },
    ],
    minAccuracy: 75,
  },
];

// ============================================================================
// VOCABULARY GAMES
// ============================================================================

export const vocabularyGames: VocabularyGame[] = [
  {
    id: 'picture-word-1',
    type: 'picture-word',
    title: 'Picture Word Match',
    level: 1,
    words: [
      {
        word: 'brave',
        definition: 'Having courage; not afraid',
        partOfSpeech: 'adjective',
        exampleSentence: 'The brave hero saved the day.',
        difficulty: 1,
      },
      {
        word: 'curious',
        definition: 'Wanting to learn or know about something',
        partOfSpeech: 'adjective',
        exampleSentence: 'She was curious about the mysterious box.',
        difficulty: 1,
      },
    ],
  },
  {
    id: 'context-clues-1',
    type: 'context-clues',
    title: 'Context Detective',
    level: 2,
    words: [
      {
        word: 'determined',
        definition: 'Having made a firm decision; resolved',
        partOfSpeech: 'adjective',
        exampleSentence: 'She was determined to finish the race, no matter how tired she felt.',
        difficulty: 2,
      },
      {
        word: 'innovative',
        definition: 'Featuring new methods; creative',
        partOfSpeech: 'adjective',
        exampleSentence: 'The innovative scientist created a new invention.',
        difficulty: 3,
        culturalContext: 'Celebrates Black innovation and creativity',
      },
    ],
  },
];

// ============================================================================
// SOCIAL-EMOTIONAL SCENARIOS
// ============================================================================

export const socialEmotionalScenarios: SocialEmotionalScenario[] = [
  {
    id: 'empathy-1',
    skill: 'empathy',
    title: 'Understanding Others',
    scenario: 'Your friend looks sad because they lost their favorite toy. What do you do?',
    characters: ['You', 'Your Friend'],
    choices: [
      {
        id: 'choice-1',
        action: 'Ask them how they feel and listen',
        outcome: 'Your friend feels heard and appreciated',
        emotionalImpact: [
          {
            character: 'Your Friend',
            emotion: 'Comforted',
            explanation: 'They feel less alone with their sadness',
          },
        ],
        isPositive: true,
        teachingPoint: 'Listening and showing care helps others feel better',
      },
      {
        id: 'choice-2',
        action: "Tell them it's just a toy and not important",
        outcome: 'Your friend feels dismissed and more upset',
        emotionalImpact: [
          {
            character: 'Your Friend',
            emotion: 'Hurt',
            explanation: 'Their feelings were minimized',
          },
        ],
        isPositive: false,
        teachingPoint: "Everyone's feelings are valid and deserve respect",
      },
      {
        id: 'choice-3',
        action: 'Offer to help them look for the toy',
        outcome: 'Your friend feels supported and hopeful',
        emotionalImpact: [
          {
            character: 'Your Friend',
            emotion: 'Grateful',
            explanation: 'They appreciate your help and kindness',
          },
        ],
        isPositive: true,
        teachingPoint: 'Taking action to help shows true empathy',
      },
    ],
    learningObjective: "Understand and respond to others' emotions with kindness",
    discussionPrompts: [
      'How do you think your friend felt?',
      'What would you want someone to do if you were sad?',
      'Why is it important to listen to others?',
    ],
  },
  {
    id: 'conflict-resolution-1',
    skill: 'conflict-resolution',
    title: 'Solving Problems Together',
    scenario: 'Two friends both want to play with the same toy. How can they solve this?',
    characters: ['Friend 1', 'Friend 2'],
    choices: [
      {
        id: 'choice-1',
        action: 'Take turns playing with the toy',
        outcome: 'Both friends get to play and feel happy',
        emotionalImpact: [
          {
            character: 'Friend 1',
            emotion: 'Satisfied',
            explanation: "They get their turn and feel it's fair",
          },
          {
            character: 'Friend 2',
            emotion: 'Happy',
            explanation: 'They also get to play and appreciate the fairness',
          },
        ],
        isPositive: true,
        teachingPoint: 'Sharing and taking turns helps everyone',
      },
      {
        id: 'choice-2',
        action: 'Find a different toy to play with together',
        outcome: 'They discover a new fun activity',
        emotionalImpact: [
          {
            character: 'Friend 1',
            emotion: 'Excited',
            explanation: 'They found something new and fun',
          },
          {
            character: 'Friend 2',
            emotion: 'Creative',
            explanation: 'They enjoyed finding a solution together',
          },
        ],
        isPositive: true,
        teachingPoint: 'Sometimes the best solution is finding a new way',
      },
    ],
    learningObjective: 'Learn peaceful ways to resolve disagreements',
    discussionPrompts: [
      'What are other ways to solve this problem?',
      'How does it feel when someone shares with you?',
      'Why is it important to be fair?',
    ],
  },
  {
    id: 'self-awareness-1',
    skill: 'self-awareness',
    title: 'Knowing Your Feelings',
    scenario: "You didn't do well on a test. How do you feel and what can you do?",
    characters: ['You'],
    choices: [
      {
        id: 'choice-1',
        action: 'Recognize you feel disappointed and ask for help',
        outcome: 'You learn strategies to improve',
        emotionalImpact: [
          {
            character: 'You',
            emotion: 'Empowered',
            explanation: 'You took control of your learning',
          },
        ],
        isPositive: true,
        teachingPoint: "It's okay to feel disappointed and ask for help",
      },
      {
        id: 'choice-2',
        action: "Give up and think you can't do it",
        outcome: 'You miss the chance to grow',
        emotionalImpact: [
          {
            character: 'You',
            emotion: 'Defeated',
            explanation: 'Negative self-talk prevents growth',
          },
        ],
        isPositive: false,
        teachingPoint: 'Everyone can improve with practice and support',
      },
    ],
    learningObjective: 'Recognize emotions and respond constructively',
    discussionPrompts: [
      'What emotions did you notice?',
      'How can mistakes help us learn?',
      'Who can you ask for help when you need it?',
    ],
  },
];

// ============================================================================
// MATH & SCIENCE INTEGRATION
// ============================================================================

export const mathConcepts: MathConcept[] = [
  {
    id: 'counting-1',
    concept: 'counting',
    title: 'Counting Stars',
    storyContext: 'The characters look up at the night sky',
    problem: 'How many stars can you count?',
    answer: 10,
    gradeLevel: ['pre-k', 'k'],
  },
  {
    id: 'addition-1',
    concept: 'addition',
    title: 'Sharing Treats',
    storyContext: 'Friends share cookies at a party',
    problem: 'If you have 3 cookies and your friend gives you 2 more, how many do you have?',
    answer: 5,
    gradeLevel: ['k', '1'],
  },
  {
    id: 'patterns-1',
    concept: 'patterns',
    title: 'Pattern Dance',
    storyContext: 'Characters create a dance with repeating moves',
    problem: 'What comes next in the pattern: clap, stomp, clap, stomp, ?',
    answer: 'clap',
    gradeLevel: ['pre-k', 'k', '1'],
  },
];

export const scienceConcepts: ScienceConcept[] = [
  {
    id: 'nature-1',
    concept: 'nature',
    title: 'Plant Growth',
    storyContext: 'Characters plant a garden',
    question: 'What do plants need to grow?',
    explanation: 'Plants need sunlight, water, and soil to grow strong and healthy.',
    gradeLevel: ['k', '1', '2'],
  },
  {
    id: 'animals-1',
    concept: 'animals',
    title: 'Animal Habitats',
    storyContext: 'Exploring different environments',
    question: 'Where do different animals live?',
    explanation: 'Animals live in habitats that provide food, water, and shelter.',
    gradeLevel: ['1', '2', '3'],
  },
];

// ============================================================================
// FINE MOTOR ACTIVITIES
// ============================================================================

export const fineMotorActivities: FineMotorActivity[] = [
  {
    id: 'drawing-1',
    type: 'drawing',
    title: 'Draw Your Hero',
    instructions: 'Draw your favorite character from the story',
    tools: ['pencil', 'brush', 'colors'],
    ageAppropriate: ['pre-k', 'k', '1', '2'],
  },
  {
    id: 'story-illustration-1',
    type: 'story-illustration',
    title: 'Illustrate Your Story',
    instructions: 'Create pictures for your own story',
    tools: ['pencil', 'brush', 'colors', 'shapes'],
    ageAppropriate: ['k', '1', '2', '3', '4', '5'],
  },
  {
    id: 'pattern-making-1',
    type: 'pattern-making',
    title: 'Create Patterns',
    instructions: 'Make colorful patterns using shapes',
    tools: ['shapes', 'colors'],
    ageAppropriate: ['pre-k', 'k', '1'],
  },
];

// ============================================================================
// ADAPTIVE DIFFICULTY
// ============================================================================

/**
 * Adjust content difficulty based on performance
 */
export function adjustDifficulty(currentLevel: number, recentScores: number[]): number {
  if (recentScores.length < 3) return currentLevel;

  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  if (avgScore >= 90 && currentLevel < 5) {
    return currentLevel + 1; // Increase difficulty
  } else if (avgScore < 60 && currentLevel > 1) {
    return currentLevel - 1; // Decrease difficulty
  }

  return currentLevel;
}

/**
 * Get appropriate content for child
 */
export function getAppropriateContent(
  age: number,
  gradeLevel: string,
  performanceHistory: number[]
): ContentTier {
  const tier = contentTiers.find((t) => t.gradeLevel === gradeLevel);

  if (!tier) {
    return contentTiers[0]; // Default to pre-k
  }

  return tier;
}

/**
 * Generate personalized learning path
 */
export function generateLearningPath(
  childAge: number,
  gradeLevel: string,
  strengths: string[],
  areasForGrowth: string[]
): LearningActivity[] {
  const activities: LearningActivity[] = [];

  // Add activities based on areas for growth
  if (areasForGrowth.includes('phonics')) {
    activities.push({
      id: 'phonics-practice',
      type: 'game',
      title: 'Phonics Adventure',
      description: 'Practice letter sounds and blending',
      duration: 15,
      difficulty: 2,
      skillsTargeted: ['phonics', 'reading'],
      rewards: { xp: 100, currency: 50 },
    });
  }

  if (areasForGrowth.includes('vocabulary')) {
    activities.push({
      id: 'vocab-builder',
      type: 'interactive',
      title: 'Word Explorer',
      description: 'Learn new words in context',
      duration: 10,
      difficulty: 2,
      skillsTargeted: ['vocabulary', 'comprehension'],
      rewards: { xp: 75, currency: 40 },
    });
  }

  // Add enrichment based on strengths
  if (strengths.includes('comprehension')) {
    activities.push({
      id: 'advanced-reading',
      type: 'quiz',
      title: 'Story Analysis',
      description: 'Dive deeper into story themes',
      duration: 20,
      difficulty: 4,
      skillsTargeted: ['comprehension', 'critical-thinking'],
      rewards: { xp: 150, currency: 75 },
    });
  }

  return activities;
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  contentTiers,
  phonicsGames,
  vocabularyGames,
  socialEmotionalScenarios,
  mathConcepts,
  scienceConcepts,
  fineMotorActivities,
  adjustDifficulty,
  getAppropriateContent,
  generateLearningPath,
};
