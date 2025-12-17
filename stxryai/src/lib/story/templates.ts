/**
 * Story Templates
 * Pre-built templates to make story creation easier
 */

export interface StoryTemplate {
  id: string;
  name: string;
  genre: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  structure: {
    chapters: number;
    choicesPerChapter: number;
    averageLength: string;
  };
  starterPrompt: string;
  outline: string[];
  characters: string[];
  settings: string[];
  themes: string[];
  sampleFirstChapter?: string;
}

export const storyTemplates: StoryTemplate[] = [
  {
    id: 'mystery-detective',
    name: 'Detective Mystery',
    genre: 'Mystery',
    description: 'Classic whodunit with clues, suspects, and a thrilling investigation',
    icon: '🔍',
    difficulty: 'beginner',
    estimatedTime: '15-20 minutes',
    structure: {
      chapters: 8,
      choicesPerChapter: 3,
      averageLength: 'medium',
    },
    starterPrompt:
      'Write a detective mystery where a valuable artifact has been stolen from a museum. The detective must interview suspects and gather clues.',
    outline: [
      'The Crime: Discovery of the stolen artifact',
      'The Investigation Begins: Meet the suspects',
      'Gathering Clues: Find evidence at the crime scene',
      'Interview Witnesses: Question potential suspects',
      'A New Lead: Uncover a hidden connection',
      'The Twist: Everything you thought was wrong',
      'The Confrontation: Accuse the culprit',
      'The Resolution: Reveal how it was done',
    ],
    characters: [
      'Detective',
      'Museum Curator',
      'Security Guard',
      'Art Dealer',
      'Wealthy Collector',
    ],
    settings: ['Museum', 'Crime Scene', 'Police Station', "Suspect's Home"],
    themes: ['Justice', 'Deception', 'Truth', 'Investigation'],
  },
  {
    id: 'fantasy-quest',
    name: 'Fantasy Quest',
    genre: 'Fantasy',
    description: 'Epic adventure with magic, creatures, and heroic choices',
    icon: '⚔️',
    difficulty: 'beginner',
    estimatedTime: '20-25 minutes',
    structure: {
      chapters: 10,
      choicesPerChapter: 4,
      averageLength: 'medium',
    },
    starterPrompt:
      'Create a fantasy quest where a young hero must retrieve a magical artifact to save their kingdom from an ancient evil.',
    outline: [
      'The Call to Adventure: Learn about the threat',
      'Gathering Allies: Meet your companions',
      'The Journey Begins: Leave the village',
      'First Trial: Face a magical creature',
      'The Enchanted Forest: Navigate dangers',
      'Ancient Ruins: Discover secrets of the past',
      'The Guardian: Prove your worth',
      'Betrayal: An ally shows their true colors',
      'The Final Battle: Confront the evil',
      'Return Home: The kingdom is saved',
    ],
    characters: ['Hero', 'Wise Mentor', 'Rogue Thief', 'Powerful Mage', 'Dark Villain'],
    settings: ['Village', 'Enchanted Forest', 'Ancient Ruins', 'Dark Castle'],
    themes: ['Courage', 'Friendship', 'Sacrifice', 'Good vs Evil'],
  },
  {
    id: 'romance-modern',
    name: 'Modern Romance',
    genre: 'Romance',
    description: 'Contemporary love story with relationship choices and emotional depth',
    icon: '💕',
    difficulty: 'beginner',
    estimatedTime: '15-20 minutes',
    structure: {
      chapters: 12,
      choicesPerChapter: 3,
      averageLength: 'short',
    },
    starterPrompt:
      'Write a modern romance about two people who meet by chance and must decide if love is worth the risk.',
    outline: [
      'The Meet-Cute: An unexpected encounter',
      'First Impressions: Getting to know each other',
      'The First Date: Sparks or awkwardness?',
      'Growing Closer: Shared interests and laughs',
      'The Complication: Past relationships surface',
      'Misunderstanding: Communication breakdown',
      'Distance: Time apart brings clarity',
      'The Grand Gesture: One must take a risk',
      'Reconciliation: Honest conversations',
      'The Choice: Together or apart?',
      'New Beginning: Building a future',
      'Happily Ever After: Love prevails',
    ],
    characters: ['Protagonist', 'Love Interest', 'Best Friend', 'Ex-Partner', 'Supportive Parent'],
    settings: ['Coffee Shop', 'Park', 'Workplace', 'Home', 'Restaurant'],
    themes: ['Love', 'Trust', 'Vulnerability', 'Second Chances'],
  },
  {
    id: 'scifi-space',
    name: 'Space Exploration',
    genre: 'Science Fiction',
    description: 'Futuristic adventure exploring unknown worlds and alien civilizations',
    icon: '🚀',
    difficulty: 'intermediate',
    estimatedTime: '25-30 minutes',
    structure: {
      chapters: 12,
      choicesPerChapter: 4,
      averageLength: 'long',
    },
    starterPrompt:
      'Create a sci-fi story about a space crew discovering an alien signal from an uncharted planet.',
    outline: [
      'The Signal: Mysterious transmission detected',
      'Mission Briefing: Assemble the crew',
      'Launch: Departure from Earth',
      'Space Travel: Life aboard the ship',
      'Arrival: First look at the alien planet',
      'First Contact: Meeting alien life',
      'Discovery: Ancient alien technology',
      'The Dilemma: Ethical choices about interference',
      'Crisis: System malfunction or alien threat',
      'Sacrifice: Someone must make a hard choice',
      'Resolution: Solve the crisis',
      'Return Journey: Changed forever',
    ],
    characters: ['Captain', 'Scientist', 'Engineer', 'Pilot', 'Alien Entity'],
    settings: ['Spaceship', 'Alien Planet', 'Space Station', 'Ancient Ruins'],
    themes: ['Exploration', 'Discovery', 'Ethics', 'Survival'],
  },
  {
    id: 'horror-survival',
    name: 'Survival Horror',
    genre: 'Horror',
    description: 'Terrifying choices in a fight for survival against dark forces',
    icon: '👻',
    difficulty: 'intermediate',
    estimatedTime: '20-25 minutes',
    structure: {
      chapters: 10,
      choicesPerChapter: 3,
      averageLength: 'medium',
    },
    starterPrompt:
      'Write a horror story where a group of people must survive a night in a haunted location.',
    outline: [
      'The Setup: Arrive at the haunted location',
      'First Signs: Something is wrong',
      'Split Up: The group separates (bad idea)',
      'The Entity: First encounter with horror',
      'Panic: Characters react to danger',
      'Discovery: Learn the dark history',
      'Casualties: Not everyone will survive',
      'The Ritual: Find a way to fight back',
      'Final Confrontation: Face the horror',
      'Escape or Doom: Will anyone survive?',
    ],
    characters: ['Survivor', 'Skeptic', 'Believer', 'The Entity', 'Victim'],
    settings: ['Abandoned House', 'Dark Forest', 'Basement', 'Attic'],
    themes: ['Fear', 'Survival', 'Regret', 'Supernatural'],
  },
  {
    id: 'thriller-espionage',
    name: 'Spy Thriller',
    genre: 'Thriller',
    description: 'High-stakes espionage with twists, betrayals, and action',
    icon: '🕵️',
    difficulty: 'advanced',
    estimatedTime: '30-35 minutes',
    structure: {
      chapters: 15,
      choicesPerChapter: 4,
      averageLength: 'long',
    },
    starterPrompt:
      'Create a spy thriller where an agent must prevent a global catastrophe while dealing with betrayal within their own agency.',
    outline: [
      'The Mission: Assignment briefing',
      'Infiltration: Go undercover',
      'Intel Gathering: Collect information',
      'First Contact: Meet the target',
      'Trust Issues: Who can you trust?',
      'Action Sequence: Chase or fight',
      'The Mole: Betrayal revealed',
      'On the Run: Become the hunted',
      'Hidden Ally: Unexpected help',
      'Uncovering the Plot: Connect the dots',
      'Race Against Time: The clock is ticking',
      'Double Cross: Another twist',
      'Final Showdown: Stop the villain',
      'Escape: Get out alive',
      'Aftermath: The cost of victory',
    ],
    characters: ['Agent', 'Handler', 'Villain', 'Double Agent', 'Informant'],
    settings: ['Embassy', 'Safe House', 'Foreign City', 'Secret Facility'],
    themes: ['Loyalty', 'Deception', 'Sacrifice', 'Justice'],
  },
  {
    id: 'adventure-treasure',
    name: 'Treasure Hunt',
    genre: 'Adventure',
    description: 'Globe-trotting adventure seeking legendary treasure',
    icon: '🗺️',
    difficulty: 'beginner',
    estimatedTime: '20-25 minutes',
    structure: {
      chapters: 10,
      choicesPerChapter: 4,
      averageLength: 'medium',
    },
    starterPrompt:
      'Write an adventure about treasure hunters racing to find a legendary artifact before rivals do.',
    outline: [
      'The Map: Discover the first clue',
      'The Team: Assemble your crew',
      'First Location: Jungle or desert',
      'Rival Appears: Competition arrives',
      'Ancient Puzzle: Solve a riddle',
      'Trap: Avoid deadly mechanisms',
      'Betrayal: Someone wants it all',
      'Lost City: Find the hidden location',
      'The Treasure: It was real all along',
      'The Choice: Keep it or preserve history?',
    ],
    characters: ['Treasure Hunter', 'Historian', 'Rival Hunter', 'Local Guide', 'Funder'],
    settings: ['Jungle', 'Desert', 'Ruins', 'Cave', 'Museum'],
    themes: ['Adventure', 'Greed', 'History', 'Friendship'],
  },
  {
    id: 'drama-family',
    name: 'Family Drama',
    genre: 'Drama',
    description: 'Emotional story about family relationships and difficult choices',
    icon: '🏠',
    difficulty: 'intermediate',
    estimatedTime: '15-20 minutes',
    structure: {
      chapters: 8,
      choicesPerChapter: 3,
      averageLength: 'medium',
    },
    starterPrompt:
      'Create a family drama about siblings dealing with a difficult family secret that comes to light.',
    outline: [
      'The Secret: Something is revealed',
      'Shock and Denial: Initial reactions',
      'Confrontation: Family members clash',
      'Different Perspectives: Everyone has their truth',
      'Past Revealed: Flashbacks to understand',
      'Difficult Choices: What to do now?',
      'Reconciliation Attempts: Can they forgive?',
      'Resolution: Find a way forward together',
    ],
    characters: ['Eldest Sibling', 'Middle Child', 'Youngest', 'Parent', 'Extended Family'],
    settings: ['Family Home', 'Hospital', 'Restaurant', 'Childhood Place'],
    themes: ['Forgiveness', 'Truth', 'Family', 'Healing'],
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): StoryTemplate | undefined {
  return storyTemplates.find((t) => t.id === id);
}

/**
 * Get templates by genre
 */
export function getTemplatesByGenre(genre: string): StoryTemplate[] {
  return storyTemplates.filter((t) => t.genre.toLowerCase() === genre.toLowerCase());
}

/**
 * Get templates by difficulty
 */
export function getTemplatesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): StoryTemplate[] {
  return storyTemplates.filter((t) => t.difficulty === difficulty);
}

/**
 * Generate story from template
 */
export function generateStoryFromTemplate(template: StoryTemplate, customTitle?: string) {
  return {
    title: customTitle || `My ${template.name}`,
    genre: template.genre,
    description: template.description,
    tags: template.themes,
    outline: template.outline,
    characters: template.characters.map((name) => ({
      name,
      description: '',
      traits: [],
    })),
    settings: template.settings.map((location) => ({
      name: location,
      description: '',
    })),
    estimatedChapters: template.structure.chapters,
    aiPrompt: template.starterPrompt,
  };
}
