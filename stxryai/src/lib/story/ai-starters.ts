/**
 * AI Story Starters
 * Pre-written prompts and ideas to jumpstart creativity
 */

export interface StoryStarter {
  id: string;
  title: string;
  genre: string;
  prompt: string;
  hook: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'challenging';
  estimatedLength: string;
}

export const storyStarters: StoryStarter[] = [
  // Fantasy
  {
    id: 'fantasy-1',
    title: 'The Last Dragon Keeper',
    genre: 'Fantasy',
    prompt:
      "You discover you're the last person who can speak to dragons. They need your help to prevent an ancient war.",
    hook: 'A forgotten language. An impossible bond. The fate of two species.',
    tags: ['Dragons', 'Magic', 'Ancient Prophecy', 'Chosen One'],
    difficulty: 'easy',
    estimatedLength: '10-12 chapters',
  },
  {
    id: 'fantasy-2',
    title: 'The Stolen Crown',
    genre: 'Fantasy',
    prompt:
      'The royal crown has been stolen, and you, a common thief, are framed for it. Clear your name or claim the throne.',
    hook: "Accused of a crime you didn't commit. Or did you?",
    tags: ['Royalty', 'Betrayal', 'Politics', 'Redemption'],
    difficulty: 'medium',
    estimatedLength: '12-15 chapters',
  },
  {
    id: 'fantasy-3',
    title: 'Mirror Worlds',
    genre: 'Fantasy',
    prompt:
      "Every choice creates a mirror world. You can see them all, and now they're starting to collide.",
    hook: 'Every decision has consequences. You see them all.',
    tags: ['Parallel Worlds', 'Choices', 'Consequences', 'Magic'],
    difficulty: 'challenging',
    estimatedLength: '15-20 chapters',
  },

  // Sci-Fi
  {
    id: 'scifi-1',
    title: 'The Last Message',
    genre: 'Science Fiction',
    prompt:
      'You receive a message from yourself, sent from 10 years in the future. It says: "Don\'t trust anyone. Especially not me."',
    hook: 'A warning from the future. A mystery in the present.',
    tags: ['Time Travel', 'Conspiracy', 'Trust', 'Mystery'],
    difficulty: 'easy',
    estimatedLength: '8-10 chapters',
  },
  {
    id: 'scifi-2',
    title: 'Colony Ship Aurora',
    genre: 'Science Fiction',
    prompt:
      'You wake from cryosleep to find the ship off-course and the crew missing. You have 48 hours before life support fails.',
    hook: 'Alone in space. Limited time. Impossible choices.',
    tags: ['Space', 'Survival', 'Mystery', 'Isolation'],
    difficulty: 'medium',
    estimatedLength: '10-12 chapters',
  },
  {
    id: 'scifi-3',
    title: 'The Simulation Glitch',
    genre: 'Science Fiction',
    prompt:
      'You discover reality is a simulation, but the administrators offer you a deal: forget what you know, or join their resistance.',
    hook: 'Reality is not real. What will you do with that knowledge?',
    tags: ['Simulation', 'Philosophy', 'Resistance', 'Choice'],
    difficulty: 'challenging',
    estimatedLength: '15-18 chapters',
  },

  // Mystery
  {
    id: 'mystery-1',
    title: 'The Vanishing Act',
    genre: 'Mystery',
    prompt:
      "A famous magician disappears during their final trick. The police think it's publicity. You know better.",
    hook: 'Some illusions are deadlier than others.',
    tags: ['Magic', 'Investigation', 'Deception', 'Performance'],
    difficulty: 'easy',
    estimatedLength: '8-10 chapters',
  },
  {
    id: 'mystery-2',
    title: 'Cold Case Chronicles',
    genre: 'Mystery',
    prompt:
      "Reopening a 20-year-old murder case, you discover the original detective's notes contain hidden messages.",
    hook: 'The past has secrets. Someone wants them buried.',
    tags: ['Cold Case', 'Detective', 'Secrets', 'Investigation'],
    difficulty: 'medium',
    estimatedLength: '12-15 chapters',
  },
  {
    id: 'mystery-3',
    title: 'The Locked Room Society',
    genre: 'Mystery',
    prompt:
      'Five strangers are invited to a dinner party. One by one, they reveal they all have a connection to an unsolved crime.',
    hook: 'No coincidences. Only carefully planned revenge.',
    tags: ['Dinner Party', 'Multiple Suspects', 'Revenge', 'Puzzle'],
    difficulty: 'challenging',
    estimatedLength: '10-12 chapters',
  },

  // Romance
  {
    id: 'romance-1',
    title: 'Second Chance Summer',
    genre: 'Romance',
    prompt:
      'Returning to your hometown after 10 years, you run into your high school sweetheart. They never left.',
    hook: 'Some loves deserve a second chance. But at what cost?',
    tags: ['Second Chance', 'Hometown', 'Past Love', 'Growth'],
    difficulty: 'easy',
    estimatedLength: '10-12 chapters',
  },
  {
    id: 'romance-2',
    title: 'The Fake Relationship',
    genre: 'Romance',
    prompt:
      "To inherit your grandmother's estate, you must be married. Your best friend volunteers to fake it. Feelings get real.",
    hook: "Pretending to be in love. Until you're not pretending anymore.",
    tags: ['Fake Dating', 'Friends to Lovers', 'Inheritance', 'Comedy'],
    difficulty: 'easy',
    estimatedLength: '12-15 chapters',
  },
  {
    id: 'romance-3',
    title: 'Love in Translation',
    genre: 'Romance',
    prompt:
      "You don't speak each other's languages, but somehow you understand everything that matters.",
    hook: 'When words fail, hearts speak.',
    tags: ['Language Barrier', 'Cultural Differences', 'Communication', 'Understanding'],
    difficulty: 'medium',
    estimatedLength: '10-12 chapters',
  },

  // Horror
  {
    id: 'horror-1',
    title: 'The House Remembers',
    genre: 'Horror',
    prompt:
      'Your childhood home is being demolished. But the house has memories it wants to keep. Violent memories.',
    hook: 'Some places never let you leave.',
    tags: ['Haunted House', 'Childhood', 'Memories', 'Supernatural'],
    difficulty: 'medium',
    estimatedLength: '8-10 chapters',
  },
  {
    id: 'horror-2',
    title: 'The Smile Virus',
    genre: 'Horror',
    prompt:
      'A new disease makes people smile constantly. But behind those smiles, something is very, very wrong.',
    hook: "They won't stop smiling. And they won't stop coming.",
    tags: ['Virus', 'Body Horror', 'Survival', 'Paranoia'],
    difficulty: 'challenging',
    estimatedLength: '10-12 chapters',
  },
  {
    id: 'horror-3',
    title: "Don't Open Your Eyes",
    genre: 'Horror',
    prompt: 'If you open your eyes at night, you see them. And if they see you, they take you.',
    hook: 'Darkness is your only protection.',
    tags: ['Creatures', 'Rules', 'Survival Horror', 'Psychological'],
    difficulty: 'medium',
    estimatedLength: '8-10 chapters',
  },

  // Thriller
  {
    id: 'thriller-1',
    title: 'The Perfect Witness',
    genre: 'Thriller',
    prompt:
      'You witness a murder, but when you try to report it, the victim is alive and has no memory of you.',
    hook: 'You saw it happen. But no one believes you.',
    tags: ['Witness', 'Gaslighting', 'Memory', 'Conspiracy'],
    difficulty: 'medium',
    estimatedLength: '12-15 chapters',
  },
  {
    id: 'thriller-2',
    title: '72 Hours',
    genre: 'Thriller',
    prompt:
      'Your phone shows a countdown: 72 hours. A text arrives: "You know what you did. Make it right, or everyone knows."',
    hook: 'Time is running out. So are your options.',
    tags: ['Blackmail', 'Race Against Time', 'Secrets', 'Suspense'],
    difficulty: 'easy',
    estimatedLength: '8-10 chapters',
  },
  {
    id: 'thriller-3',
    title: 'The Passenger',
    genre: 'Thriller',
    prompt:
      'You offer a stranger a ride in a storm. They know your name. Your address. Your secrets.',
    hook: 'Some strangers know you better than you know yourself.',
    tags: ['Suspense', 'Stranger Danger', 'Secrets', 'Psychological'],
    difficulty: 'medium',
    estimatedLength: '10-12 chapters',
  },

  // Adventure
  {
    id: 'adventure-1',
    title: 'The Hidden Island',
    genre: 'Adventure',
    prompt:
      "Your grandfather's journal reveals coordinates to an island that doesn't appear on any map.",
    hook: 'Some places are hidden for a reason.',
    tags: ['Exploration', 'Mystery', 'Family Legacy', 'Discovery'],
    difficulty: 'easy',
    estimatedLength: '10-12 chapters',
  },
  {
    id: 'adventure-2',
    title: 'Race Around the World',
    genre: 'Adventure',
    prompt:
      'You enter a competition to circumnavigate the globe using only $100 and no technology.',
    hook: 'No phones. No GPS. Just wit, luck, and determination.',
    tags: ['Competition', 'Travel', 'Survival', 'Challenge'],
    difficulty: 'medium',
    estimatedLength: '15-18 chapters',
  },
  {
    id: 'adventure-3',
    title: 'The Underground City',
    genre: 'Adventure',
    prompt: 'Beneath your city lies another, older city. And its inhabitants want it back.',
    hook: "History isn't always buried deep enough.",
    tags: ['Urban Exploration', 'Ancient Civilization', 'Conflict', 'Discovery'],
    difficulty: 'challenging',
    estimatedLength: '12-15 chapters',
  },

  // Drama
  {
    id: 'drama-1',
    title: 'The Letter',
    genre: 'Drama',
    prompt:
      'Your mother leaves you a letter to be opened after her death. It reveals you have a sibling you never knew about.',
    hook: 'Family secrets change everything.',
    tags: ['Family', 'Secrets', 'Identity', 'Relationships'],
    difficulty: 'medium',
    estimatedLength: '10-12 chapters',
  },
  {
    id: 'drama-2',
    title: 'The Last Performance',
    genre: 'Drama',
    prompt:
      "A legendary actor announces their retirement with one final show. You're chosen to co-star. They're impossible to work with.",
    hook: 'Legends are rarely what they seem.',
    tags: ['Theater', 'Mentorship', 'Art', 'Legacy'],
    difficulty: 'medium',
    estimatedLength: '8-10 chapters',
  },
  {
    id: 'drama-3',
    title: 'The Reunion',
    genre: 'Drama',
    prompt:
      "Your high school class reunion brings together five friends who haven't spoken in 20 years. For good reason.",
    hook: "Some friendships end for a reason. Time doesn't heal everything.",
    tags: ['Friendship', 'Past', 'Forgiveness', 'Growth'],
    difficulty: 'challenging',
    estimatedLength: '12-15 chapters',
  },
];

/**
 * Get random story starters
 */
export function getRandomStarters(count: number = 3): StoryStarter[] {
  const shuffled = [...storyStarters].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get starters by genre
 */
export function getStartersByGenre(genre: string): StoryStarter[] {
  return storyStarters.filter((s) => s.genre.toLowerCase() === genre.toLowerCase());
}

/**
 * Get starters by difficulty
 */
export function getStartersByDifficulty(
  difficulty: 'easy' | 'medium' | 'challenging'
): StoryStarter[] {
  return storyStarters.filter((s) => s.difficulty === difficulty);
}

/**
 * Get starter by ID
 */
export function getStarterById(id: string): StoryStarter | undefined {
  return storyStarters.find((s) => s.id === id);
}

/**
 * Search starters
 */
export function searchStarters(query: string): StoryStarter[] {
  const lowercaseQuery = query.toLowerCase();
  return storyStarters.filter(
    (s) =>
      s.title.toLowerCase().includes(lowercaseQuery) ||
      s.prompt.toLowerCase().includes(lowercaseQuery) ||
      s.genre.toLowerCase().includes(lowercaseQuery) ||
      s.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
}

/**
 * Generate AI prompt from starter
 */
export function generatePromptFromStarter(starter: StoryStarter): string {
  return `Create an interactive story based on this concept:

Title: ${starter.title}
Genre: ${starter.genre}
Premise: ${starter.prompt}

Key Themes: ${starter.tags.join(', ')}
Difficulty Level: ${starter.difficulty}
Estimated Length: ${starter.estimatedLength}

Please create a compelling story outline with:
1. A strong opening that hooks the reader
2. Multiple branching paths based on reader choices
3. Complex characters with clear motivations
4. Unexpected twists and turns
5. Multiple possible endings based on choices made

Hook: ${starter.hook}`;
}
