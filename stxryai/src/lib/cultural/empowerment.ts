/**
 * Cultural Empowerment & Representation System
 * Celebrating Black excellence, heritage, and diverse representation
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CulturalContent {
  id: string;
  type: 'story' | 'biography' | 'historical-event' | 'cultural-tradition' | 'achievement';
  title: string;
  description: string;
  category: CulturalCategory;
  ageAppropriate: string[];
  culturalContext: string;
  learningObjectives: string[];
  discussionPrompts: string[];
  resources: string[];
}

export type CulturalCategory =
  | 'black-excellence'
  | 'historical-achievements'
  | 'cultural-traditions'
  | 'diaspora-stories'
  | 'innovation'
  | 'arts-culture'
  | 'leadership'
  | 'everyday-heroes'
  | 'afrofuturism'
  | 'family-heritage';

export interface CharacterCustomization {
  skinTones: SkinTone[];
  hairTextures: HairTexture[];
  hairStyles: HairStyle[];
  culturalAttire: CulturalAttire[];
  accessories: Accessory[];
  bodyTypes: BodyType[];
}

export interface SkinTone {
  id: string;
  name: string;
  hexColor: string;
  description: string;
  culturalContext?: string;
}

export interface HairTexture {
  id: string;
  name: string;
  type: '1a-straight' | '2a-wavy' | '3a-curly' | '3b-curly' | '3c-curly' | '4a-coily' | '4b-coily' | '4c-coily';
  description: string;
  careInfo?: string;
}

export interface HairStyle {
  id: string;
  name: string;
  texture: string[];
  culturalSignificance?: string;
  imageUrl: string;
  ageAppropriate: string[];
}

export interface CulturalAttire {
  id: string;
  name: string;
  origin: string;
  description: string;
  culturalContext: string;
  imageUrl: string;
  occasion?: string;
}

export interface Accessory {
  id: string;
  name: string;
  type: 'jewelry' | 'headwear' | 'clothing' | 'symbolic';
  culturalSignificance?: string;
  imageUrl: string;
}

export interface BodyType {
  id: string;
  name: string;
  description: string;
  inclusive: boolean;
}

export interface BlackExcellenceStory {
  id: string;
  personName: string;
  field: 'science' | 'arts' | 'sports' | 'politics' | 'education' | 'business' | 'activism' | 'innovation';
  era: string;
  achievement: string;
  biography: string;
  impact: string;
  inspirationalQuote?: string;
  imageUrl?: string;
  ageAppropriate: string[];
  interactiveElements: string[];
}

export interface CulturalCelebration {
  id: string;
  name: string;
  date: string; // MM-DD format or special
  type: 'juneteenth' | 'kwanzaa' | 'black-history-month' | 'cultural-festival' | 'heritage-day';
  description: string;
  history: string;
  traditions: string[];
  activities: CelebrationActivity[];
  stories: string[]; // story IDs
  specialContent: string[];
}

export interface CelebrationActivity {
  id: string;
  title: string;
  description: string;
  type: 'craft' | 'recipe' | 'game' | 'story' | 'music' | 'dance';
  instructions: string[];
  materials?: string[];
  culturalContext: string;
}

export interface AfrofuturismTheme {
  id: string;
  title: string;
  description: string;
  setting: string;
  themes: string[];
  characters: AfrofuturistCharacter[];
  technology: string[];
  culturalElements: string[];
  inspirationalMessage: string;
}

export interface AfrofuturistCharacter {
  name: string;
  role: string;
  powers?: string[];
  background: string;
  culturalConnection: string;
}

export interface HeritageStoryTemplate {
  id: string;
  title: string;
  type: 'family-history' | 'ancestor-story' | 'migration-journey' | 'tradition-origin' | 'name-meaning';
  prompts: HeritagePrompt[];
  structure: StoryStructure;
  guidedQuestions: string[];
  generationalRoles: {
    elder: string;
    parent: string;
    child: string;
  };
}

export interface HeritagePrompt {
  section: string;
  question: string;
  examples: string[];
  tips: string[];
}

export interface StoryStructure {
  beginning: string;
  middle: string;
  end: string;
  culturalElements: string[];
}

export interface IdentityAffirmation {
  id: string;
  category: 'self-love' | 'cultural-pride' | 'resilience' | 'excellence' | 'community';
  message: string;
  context: string;
  ageAppropriate: string[];
  visualElement?: string;
}

// ============================================================================
// CHARACTER CUSTOMIZATION
// ============================================================================

export const skinTones: SkinTone[] = [
  {
    id: 'tone-1',
    name: 'Deep Ebony',
    hexColor: '#3D2817',
    description: 'Rich, deep brown tone',
    culturalContext: 'Celebrating the beauty of deep skin tones',
  },
  {
    id: 'tone-2',
    name: 'Mahogany',
    hexColor: '#5C3317',
    description: 'Warm mahogany brown',
    culturalContext: 'Beautiful reddish-brown undertones',
  },
  {
    id: 'tone-3',
    name: 'Chestnut',
    hexColor: '#7B3F00',
    description: 'Medium-deep brown',
    culturalContext: 'Rich chestnut coloring',
  },
  {
    id: 'tone-4',
    name: 'Caramel',
    hexColor: '#A0522D',
    description: 'Warm caramel tone',
    culturalContext: 'Golden brown undertones',
  },
  {
    id: 'tone-5',
    name: 'Honey',
    hexColor: '#C68642',
    description: 'Light honey brown',
    culturalContext: 'Warm honey coloring',
  },
  {
    id: 'tone-6',
    name: 'Amber',
    hexColor: '#D2691E',
    description: 'Golden amber tone',
    culturalContext: 'Radiant golden undertones',
  },
];

export const hairTextures: HairTexture[] = [
  {
    id: 'texture-4c',
    name: 'Coily 4C',
    type: '4c-coily',
    description: 'Tightly coiled, dense texture',
    careInfo: 'Thrives with moisture and protective styling',
  },
  {
    id: 'texture-4b',
    name: 'Coily 4B',
    type: '4b-coily',
    description: 'Z-pattern coils',
    careInfo: 'Beautiful with twist-outs and braid-outs',
  },
  {
    id: 'texture-4a',
    name: 'Coily 4A',
    type: '4a-coily',
    description: 'Defined S-pattern coils',
    careInfo: 'Loves moisture and gentle detangling',
  },
  {
    id: 'texture-3c',
    name: 'Curly 3C',
    type: '3c-curly',
    description: 'Tight corkscrew curls',
    careInfo: 'Defined curls with proper hydration',
  },
  {
    id: 'texture-3b',
    name: 'Curly 3B',
    type: '3b-curly',
    description: 'Springy ringlet curls',
    careInfo: 'Bouncy curls with curl-defining products',
  },
  {
    id: 'texture-3a',
    name: 'Curly 3A',
    type: '3a-curly',
    description: 'Loose spiral curls',
    careInfo: 'Soft curls with light styling',
  },
];

export const hairStyles: HairStyle[] = [
  {
    id: 'style-afro',
    name: 'Natural Afro',
    texture: ['4a-coily', '4b-coily', '4c-coily'],
    culturalSignificance: 'Symbol of Black pride and natural beauty',
    imageUrl: '/assets/hair/afro.png',
    ageAppropriate: ['all'],
  },
  {
    id: 'style-braids',
    name: 'Box Braids',
    texture: ['all'],
    culturalSignificance: 'Traditional protective style with African roots',
    imageUrl: '/assets/hair/box-braids.png',
    ageAppropriate: ['all'],
  },
  {
    id: 'style-cornrows',
    name: 'Cornrows',
    texture: ['all'],
    culturalSignificance: 'Ancient African braiding technique',
    imageUrl: '/assets/hair/cornrows.png',
    ageAppropriate: ['all'],
  },
  {
    id: 'style-twists',
    name: 'Two-Strand Twists',
    texture: ['3a-curly', '3b-curly', '3c-curly', '4a-coily', '4b-coily', '4c-coily'],
    culturalSignificance: 'Versatile protective style',
    imageUrl: '/assets/hair/twists.png',
    ageAppropriate: ['all'],
  },
  {
    id: 'style-locs',
    name: 'Locs',
    texture: ['all'],
    culturalSignificance: 'Spiritual and cultural significance across African diaspora',
    imageUrl: '/assets/hair/locs.png',
    ageAppropriate: ['all'],
  },
  {
    id: 'style-puffs',
    name: 'Puff',
    texture: ['3a-curly', '3b-curly', '3c-curly', '4a-coily', '4b-coily', '4c-coily'],
    culturalSignificance: 'Celebrating natural texture',
    imageUrl: '/assets/hair/puff.png',
    ageAppropriate: ['all'],
  },
];

export const culturalAttire: CulturalAttire[] = [
  {
    id: 'attire-dashiki',
    name: 'Dashiki',
    origin: 'West Africa',
    description: 'Colorful garment with intricate patterns',
    culturalContext: 'Traditional West African clothing symbolizing African heritage',
    imageUrl: '/assets/attire/dashiki.png',
    occasion: 'Celebrations and cultural events',
  },
  {
    id: 'attire-kente',
    name: 'Kente Cloth',
    origin: 'Ghana',
    description: 'Woven cloth with symbolic patterns',
    culturalContext: 'Each pattern and color has specific meaning in Akan culture',
    imageUrl: '/assets/attire/kente.png',
    occasion: 'Special ceremonies and celebrations',
  },
  {
    id: 'attire-ankara',
    name: 'Ankara Print',
    origin: 'West Africa',
    description: 'Vibrant wax print fabric',
    culturalContext: 'Popular across African diaspora, represents cultural pride',
    imageUrl: '/assets/attire/ankara.png',
    occasion: 'Everyday wear and special occasions',
  },
  {
    id: 'attire-agbada',
    name: 'Agbada',
    origin: 'West Africa',
    description: 'Flowing robe with wide sleeves',
    culturalContext: 'Traditional formal wear symbolizing prestige',
    imageUrl: '/assets/attire/agbada.png',
    occasion: 'Formal events and celebrations',
  },
];

// ============================================================================
// BLACK EXCELLENCE STORIES
// ============================================================================

export const blackExcellenceStories: BlackExcellenceStory[] = [
  {
    id: 'mae-jemison',
    personName: 'Dr. Mae Jemison',
    field: 'science',
    era: '1956-Present',
    achievement: 'First African American woman in space',
    biography: 'Dr. Mae Jemison is a physician, engineer, and NASA astronaut who made history in 1992 as the first African American woman to travel to space aboard the Space Shuttle Endeavour.',
    impact: 'Inspired countless young people, especially girls of color, to pursue careers in STEM fields',
    inspirationalQuote: 'Never be limited by other people\'s limited imaginations.',
    ageAppropriate: ['k', '1', '2', '3', '4', '5'],
    interactiveElements: ['space-mission-game', 'stem-activities', 'career-exploration'],
  },
  {
    id: 'katherine-johnson',
    personName: 'Katherine Johnson',
    field: 'science',
    era: '1918-2020',
    achievement: 'NASA mathematician whose calculations were critical to space missions',
    biography: 'Katherine Johnson was a brilliant mathematician whose precise calculations of orbital mechanics were essential to the success of early U.S. space missions, including the Apollo 11 moon landing.',
    impact: 'Her work was crucial to space exploration and she broke barriers for women and African Americans in STEM',
    inspirationalQuote: 'I counted everything. I counted the steps to the road, the steps up to church, the number of dishes and silverware I washed.',
    ageAppropriate: ['2', '3', '4', '5'],
    interactiveElements: ['math-challenges', 'space-calculations', 'biography-timeline'],
  },
  {
    id: 'langston-hughes',
    personName: 'Langston Hughes',
    field: 'arts',
    era: '1901-1967',
    achievement: 'Pioneering poet of the Harlem Renaissance',
    biography: 'Langston Hughes was a poet, novelist, and playwright who became one of the most important voices of the Harlem Renaissance, celebrating Black culture and experiences.',
    impact: 'His poetry gave voice to the African American experience and influenced generations of writers',
    inspirationalQuote: 'Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.',
    ageAppropriate: ['3', '4', '5'],
    interactiveElements: ['poetry-writing', 'harlem-renaissance-exploration', 'creative-expression'],
  },
  {
    id: 'harriet-tubman',
    personName: 'Harriet Tubman',
    field: 'activism',
    era: '1822-1913',
    achievement: 'Conductor of the Underground Railroad, freed hundreds from slavery',
    biography: 'Harriet Tubman escaped slavery and then risked her life repeatedly to lead hundreds of enslaved people to freedom through the Underground Railroad. She was also a Union spy during the Civil War.',
    impact: 'Symbol of courage and freedom, her bravery saved countless lives',
    inspirationalQuote: 'I freed a thousand slaves. I could have freed a thousand more if only they knew they were slaves.',
    ageAppropriate: ['2', '3', '4', '5'],
    interactiveElements: ['history-timeline', 'courage-scenarios', 'freedom-journey'],
  },
  {
    id: 'george-washington-carver',
    personName: 'George Washington Carver',
    field: 'science',
    era: '1864-1943',
    achievement: 'Agricultural scientist and inventor',
    biography: 'George Washington Carver was a brilliant scientist who revolutionized agriculture in the South. He developed hundreds of products from peanuts, sweet potatoes, and soybeans.',
    impact: 'His innovations helped farmers and promoted sustainable agriculture',
    inspirationalQuote: 'Education is the key to unlock the golden door of freedom.',
    ageAppropriate: ['1', '2', '3', '4', '5'],
    interactiveElements: ['science-experiments', 'plant-growing', 'innovation-challenges'],
  },
  {
    id: 'maya-angelou',
    personName: 'Maya Angelou',
    field: 'arts',
    era: '1928-2014',
    achievement: 'Poet, author, and civil rights activist',
    biography: 'Maya Angelou was a celebrated poet, memoirist, and civil rights activist whose powerful words inspired millions around the world.',
    impact: 'Her autobiographies and poetry gave voice to the Black experience and inspired social change',
    inspirationalQuote: 'There is no greater agony than bearing an untold story inside you.',
    ageAppropriate: ['3', '4', '5'],
    interactiveElements: ['poetry-creation', 'storytelling', 'self-expression'],
  },
];

// ============================================================================
// CULTURAL CELEBRATIONS
// ============================================================================

export const culturalCelebrations: CulturalCelebration[] = [
  {
    id: 'juneteenth',
    name: 'Juneteenth',
    date: '06-19',
    type: 'juneteenth',
    description: 'Celebration of the end of slavery in the United States',
    history: 'On June 19, 1865, enslaved people in Texas learned they were free, two years after the Emancipation Proclamation.',
    traditions: ['Family gatherings', 'Reading of the Emancipation Proclamation', 'Red food and drinks', 'Music and dance', 'Education and reflection'],
    activities: [
      {
        id: 'juneteenth-story',
        title: 'Freedom Story',
        description: 'Create a story about freedom and celebration',
        type: 'story',
        instructions: ['Think about what freedom means', 'Imagine a celebration', 'Include family and community'],
        culturalContext: 'Honoring the journey to freedom',
      },
      {
        id: 'juneteenth-craft',
        title: 'Freedom Flag',
        description: 'Design a flag representing freedom',
        type: 'craft',
        instructions: ['Use red, white, and blue', 'Add symbols of freedom', 'Share what it means to you'],
        materials: ['Paper', 'Markers', 'Crayons'],
        culturalContext: 'The Juneteenth flag symbolizes freedom and new beginnings',
      },
    ],
    stories: ['freedom-journey', 'celebration-day', 'family-reunion'],
    specialContent: ['Historical timeline', 'Freedom songs', 'Community stories'],
  },
  {
    id: 'kwanzaa',
    name: 'Kwanzaa',
    date: '12-26',
    type: 'kwanzaa',
    description: 'Week-long celebration of African American culture and heritage',
    history: 'Created in 1966 by Dr. Maulana Karenga to celebrate African American culture, family, and community.',
    traditions: ['Lighting the Kinara', 'Seven Principles (Nguzo Saba)', 'Gift giving', 'Feast (Karamu)', 'Storytelling'],
    activities: [
      {
        id: 'kwanzaa-principles',
        title: 'Seven Principles Stories',
        description: 'Create stories about each Kwanzaa principle',
        type: 'story',
        instructions: ['Choose a principle', 'Show it in action', 'Include family or community'],
        culturalContext: 'The Nguzo Saba guide community values',
      },
      {
        id: 'kwanzaa-kinara',
        title: 'Make a Kinara',
        description: 'Create your own Kinara (candle holder)',
        type: 'craft',
        instructions: ['Use seven candles: 3 red, 3 green, 1 black', 'Decorate with African patterns', 'Learn what each candle represents'],
        materials: ['Paper', 'Markers', 'Craft supplies'],
        culturalContext: 'The Kinara represents African ancestry',
      },
    ],
    stories: ['unity-story', 'self-determination', 'collective-work'],
    specialContent: ['Nguzo Saba lessons', 'African folktales', 'Family activities'],
  },
  {
    id: 'black-history-month',
    name: 'Black History Month',
    date: '02-01',
    type: 'black-history-month',
    description: 'Month-long celebration of Black history and achievements',
    history: 'Started as Negro History Week in 1926 by Carter G. Woodson, expanded to a month in 1976.',
    traditions: ['Learning about Black history', 'Celebrating achievements', 'Community events', 'Educational programs'],
    activities: [
      {
        id: 'bhm-biography',
        title: 'Hero Biography',
        description: 'Research and write about a Black hero',
        type: 'story',
        instructions: ['Choose a historical figure', 'Learn about their achievements', 'Share their story'],
        culturalContext: 'Honoring those who paved the way',
      },
      {
        id: 'bhm-timeline',
        title: 'History Timeline',
        description: 'Create a timeline of important events',
        type: 'craft',
        instructions: ['Research key events', 'Illustrate each event', 'Present to family'],
        materials: ['Paper', 'Markers', 'Photos or drawings'],
        culturalContext: 'Understanding our shared history',
      },
    ],
    stories: ['historical-heroes', 'civil-rights-journey', 'modern-changemakers'],
    specialContent: ['Daily historical facts', 'Biography series', 'Achievement spotlights'],
  },
];

// ============================================================================
// AFROFUTURISM THEMES
// ============================================================================

export const afrofuturismThemes: AfrofuturismTheme[] = [
  {
    id: 'afro-tech-city',
    title: 'The Technologically Advanced Kingdom',
    description: 'A futuristic African kingdom where ancient wisdom meets advanced technology',
    setting: 'A gleaming city with buildings inspired by traditional African architecture, powered by sustainable energy',
    themes: ['Innovation', 'Cultural pride', 'Environmental stewardship', 'Community'],
    characters: [
      {
        name: 'Princess Amara',
        role: 'Young inventor and leader',
        powers: ['Technological genius', 'Connects with ancestral wisdom'],
        background: 'Combines traditional knowledge with modern innovation',
        culturalConnection: 'Honors ancestors while building the future',
      },
      {
        name: 'Elder Kofi',
        role: 'Wisdom keeper and scientist',
        background: 'Bridges ancient knowledge and future technology',
        culturalConnection: 'Teaches that innovation builds on tradition',
      },
    ],
    technology: ['Solar-powered cities', 'Holographic storytelling', 'Sustainable transportation', 'Advanced medicine'],
    culturalElements: ['Traditional patterns in modern design', 'Ancestral wisdom guides innovation', 'Community-centered technology'],
    inspirationalMessage: 'The future is built on the strength of our past and the creativity of our present',
  },
  {
    id: 'space-explorers',
    title: 'The Cosmic Griots',
    description: 'Black space explorers who travel the galaxy sharing stories and knowledge',
    setting: 'Spacecraft designed with African aesthetics, traveling between worlds',
    themes: ['Exploration', 'Storytelling', 'Unity', 'Discovery'],
    characters: [
      {
        name: 'Captain Zuri',
        role: 'Spaceship captain and griot',
        powers: ['Navigation', 'Storytelling that bridges cultures'],
        background: 'Carries stories from Earth to share across the universe',
        culturalConnection: 'Modern griot spreading African wisdom to the stars',
      },
    ],
    technology: ['Faster-than-light travel', 'Universal translators', 'Holographic libraries'],
    culturalElements: ['Oral tradition in space', 'African patterns in ship design', 'Community across galaxies'],
    inspirationalMessage: 'Our stories and culture can light up the entire universe',
  },
];

// ============================================================================
// HERITAGE STORY TEMPLATES
// ============================================================================

export const heritageTemplates: HeritageStoryTemplate[] = [
  {
    id: 'family-name-story',
    title: 'The Story of Our Name',
    type: 'name-meaning',
    prompts: [
      {
        section: 'Beginning',
        question: 'Where does our family name come from?',
        examples: ['African origins', 'Changed during migration', 'Chosen for its meaning'],
        tips: ['Ask elders about the name history', 'Research the name\'s origins', 'Consider what it means to your family'],
      },
      {
        section: 'Middle',
        question: 'What stories are connected to our name?',
        examples: ['Family legends', 'Historical events', 'Personal meanings'],
        tips: ['Share family stories', 'Include different generations\' perspectives'],
      },
      {
        section: 'End',
        question: 'What does our name mean for the future?',
        examples: ['Pride in heritage', 'Carrying forward legacy', 'Creating new meanings'],
        tips: ['Think about what you want to pass on', 'Imagine future generations'],
      },
    ],
    structure: {
      beginning: 'Introduce the family name and its origins',
      middle: 'Share stories and meanings connected to the name',
      end: 'Reflect on what the name means for your family\'s future',
      culturalElements: ['Heritage', 'Identity', 'Continuity', 'Pride'],
    },
    guidedQuestions: [
      'What does our name mean?',
      'Who in our family has this name?',
      'What stories do we tell about our name?',
      'How does our name connect us to our heritage?',
    ],
    generationalRoles: {
      elder: 'Share the history and original meaning of the name',
      parent: 'Connect past and present meanings',
      child: 'Imagine what the name will mean in the future',
    },
  },
  {
    id: 'migration-journey',
    title: 'Our Family\'s Journey',
    type: 'migration-journey',
    prompts: [
      {
        section: 'Beginning',
        question: 'Where did our family come from?',
        examples: ['African countries', 'Caribbean islands', 'Southern states', 'Other regions'],
        tips: ['Map the journey', 'Include multiple generations'],
      },
      {
        section: 'Middle',
        question: 'What challenges and triumphs did we experience?',
        examples: ['Overcoming obstacles', 'Building new communities', 'Maintaining traditions'],
        tips: ['Honor the struggles', 'Celebrate the victories'],
      },
      {
        section: 'End',
        question: 'How has the journey shaped who we are?',
        examples: ['Values we hold', 'Traditions we keep', 'Strength we carry'],
        tips: ['Reflect on resilience', 'Celebrate heritage'],
      },
    ],
    structure: {
      beginning: 'Describe where the family journey began',
      middle: 'Share the experiences along the way',
      end: 'Reflect on how the journey continues',
      culturalElements: ['Resilience', 'Heritage', 'Family bonds', 'Cultural identity'],
    },
    guidedQuestions: [
      'Where did our ancestors live?',
      'Why did they move?',
      'What did they bring with them?',
      'What traditions did they keep?',
    ],
    generationalRoles: {
      elder: 'Share memories and stories from the journey',
      parent: 'Connect past experiences to present life',
      child: 'Imagine continuing the family legacy',
    },
  },
];

// ============================================================================
// IDENTITY AFFIRMATIONS
// ============================================================================

export const identityAffirmations: IdentityAffirmation[] = [
  {
    id: 'affirmation-1',
    category: 'self-love',
    message: 'My skin is beautiful in all its shades',
    context: 'Celebrating diverse skin tones',
    ageAppropriate: ['pre-k', 'k', '1', '2', '3', '4', '5'],
  },
  {
    id: 'affirmation-2',
    category: 'cultural-pride',
    message: 'My heritage is rich with stories of strength and brilliance',
    context: 'Honoring cultural heritage',
    ageAppropriate: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'affirmation-3',
    category: 'excellence',
    message: 'I can achieve anything I dream of',
    context: 'Encouraging ambition and self-belief',
    ageAppropriate: ['pre-k', 'k', '1', '2', '3', '4', '5'],
  },
  {
    id: 'affirmation-4',
    category: 'resilience',
    message: 'I am strong like my ancestors',
    context: 'Drawing strength from heritage',
    ageAppropriate: ['k', '1', '2', '3', '4', '5'],
  },
  {
    id: 'affirmation-5',
    category: 'community',
    message: 'Together, we lift each other up',
    context: 'Emphasizing community support',
    ageAppropriate: ['pre-k', 'k', '1', '2', '3', '4', '5'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get celebration by date
 */
export function getCelebrationByDate(date: Date): CulturalCelebration | null {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${month}-${day}`;

  return culturalCelebrations.find(c => c.date === dateString) || null;
}

/**
 * Get age-appropriate excellence stories
 */
export function getExcellenceStoriesForAge(gradeLevel: string): BlackExcellenceStory[] {
  return blackExcellenceStories.filter(story => 
    story.ageAppropriate.includes(gradeLevel)
  );
}

/**
 * Get random affirmation
 */
export function getRandomAffirmation(gradeLevel: string): IdentityAffirmation {
  const appropriate = identityAffirmations.filter(a => 
    a.ageAppropriate.includes(gradeLevel)
  );
  return appropriate[Math.floor(Math.random() * appropriate.length)];
}

/**
 * Get heritage template by type
 */
export function getHeritageTemplate(type: HeritageStoryTemplate['type']): HeritageStoryTemplate | undefined {
  return heritageTemplates.find(t => t.type === type);
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  skinTones,
  hairTextures,
  hairStyles,
  culturalAttire,
  blackExcellenceStories,
  culturalCelebrations,
  afrofuturismThemes,
  heritageTemplates,
  identityAffirmations,
  getCelebrationByDate,
  getExcellenceStoriesForAge,
  getRandomAffirmation,
  getHeritageTemplate,
};
