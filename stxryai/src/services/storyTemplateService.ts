/**
 * Story Template Service
 * Provides pre-built story templates and structures for creators
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export type Genre = 'fantasy' | 'sci-fi' | 'mystery' | 'romance' | 'horror' | 'adventure' | 'thriller' | 'historical';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type StoryLength = 'short' | 'medium' | 'long' | 'epic';

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  genre: Genre;
  subGenre?: string;
  thumbnail: string;
  previewImage?: string;
  difficulty: Difficulty;
  estimatedLength: StoryLength;
  estimatedChapters: number;
  estimatedDuration: number; // minutes
  structure: TemplateStructure;
  characters: TemplateCharacter[];
  worldElements: TemplateWorldElement[];
  plotPoints: TemplatePlotPoint[];
  tags: string[];
  isPremium: boolean;
  usageCount: number;
  rating: number;
  createdBy: 'stxryai' | 'community';
  authorId?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateStructure {
  type: 'linear' | 'branching' | 'hub' | 'mystery' | 'romance_choice' | 'survival';
  description: string;
  chapterOutline: ChapterOutline[];
  endingCount: number;
  branchingPoints: number;
}

export interface ChapterOutline {
  title: string;
  summary: string;
  purpose: 'introduction' | 'rising_action' | 'climax' | 'falling_action' | 'resolution' | 'branch_point' | 'ending';
  suggestedWordCount: number;
  keyElements: string[];
  choices?: ChoiceOutline[];
}

export interface ChoiceOutline {
  description: string;
  consequence: string;
  leadTo: 'next' | 'branch' | 'ending' | 'death';
}

export interface TemplateCharacter {
  role: 'protagonist' | 'antagonist' | 'love_interest' | 'mentor' | 'sidekick' | 'villain' | 'supporting';
  name?: string;
  archetype: string;
  description: string;
  motivations: string[];
  traits: string[];
  relationships: CharacterRelationship[];
  arc?: string;
}

export interface CharacterRelationship {
  targetRole: string;
  type: 'ally' | 'enemy' | 'rival' | 'romantic' | 'family' | 'mentor' | 'unknown';
  description: string;
}

export interface TemplateWorldElement {
  type: 'setting' | 'magic_system' | 'technology' | 'culture' | 'history' | 'conflict' | 'organization';
  name: string;
  description: string;
  importance: 'critical' | 'major' | 'minor';
}

export interface TemplatePlotPoint {
  name: string;
  type: 'hook' | 'inciting_incident' | 'plot_twist' | 'midpoint' | 'dark_moment' | 'climax' | 'resolution';
  description: string;
  chapter: number;
  isMandatory: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templateCount: number;
  templates: StoryTemplate[];
}

export interface TemplateFilters {
  genre?: Genre;
  difficulty?: Difficulty;
  length?: StoryLength;
  structure?: TemplateStructure['type'];
  isPremium?: boolean;
  createdBy?: 'stxryai' | 'community';
  sortBy?: 'popular' | 'newest' | 'rating' | 'name';
}

// ========================================
// BUILT-IN TEMPLATES
// ========================================

const BUILT_IN_TEMPLATES: StoryTemplate[] = [
  // ===== FANTASY =====
  {
    id: 'fantasy-chosen-one',
    name: "The Chosen One's Journey",
    description: 'A classic hero\'s journey where an ordinary person discovers they have a special destiny.',
    genre: 'fantasy',
    subGenre: 'epic',
    thumbnail: '/templates/fantasy-chosen-one.jpg',
    difficulty: 'medium',
    estimatedLength: 'long',
    estimatedChapters: 12,
    estimatedDuration: 90,
    structure: {
      type: 'branching',
      description: 'Linear main story with branching decisions affecting relationships and ending',
      chapterOutline: [
        { title: 'Ordinary World', summary: 'Introduce the protagonist in their mundane life', purpose: 'introduction', suggestedWordCount: 1500, keyElements: ['protagonist daily life', 'hints of dissatisfaction', 'foreshadowing'] },
        { title: 'The Call', summary: 'A mysterious event disrupts the ordinary world', purpose: 'rising_action', suggestedWordCount: 2000, keyElements: ['inciting incident', 'initial refusal', 'mentor appears'] },
        { title: 'Crossing the Threshold', summary: 'The protagonist commits to the adventure', purpose: 'rising_action', suggestedWordCount: 1800, keyElements: ['point of no return', 'new world introduction'], choices: [{ description: 'Trust the mentor completely', consequence: 'Gain early advantage but miss hidden knowledge', leadTo: 'branch' }, { description: 'Maintain skepticism', consequence: 'Slower progress but better understanding', leadTo: 'next' }] },
        { title: 'Tests and Allies', summary: 'Face challenges and meet companions', purpose: 'rising_action', suggestedWordCount: 2500, keyElements: ['allies introduction', 'first challenges', 'skill development'] },
        { title: 'The Approach', summary: 'Prepare for the major ordeal', purpose: 'rising_action', suggestedWordCount: 2000, keyElements: ['training montage', 'stakes raised', 'enemy revealed'] },
        { title: 'The Ordeal', summary: 'Face the biggest challenge yet', purpose: 'climax', suggestedWordCount: 2500, keyElements: ['near death experience', 'transformation', 'sacrifice'] },
        { title: 'Reward', summary: 'Claim the prize of surviving the ordeal', purpose: 'falling_action', suggestedWordCount: 1500, keyElements: ['new power/knowledge', 'celebration', 'love scene optional'] },
        { title: 'The Road Back', summary: 'Begin the journey home with new challenges', purpose: 'falling_action', suggestedWordCount: 2000, keyElements: ['pursuit', 'using new skills', 'approaching climax'] },
        { title: 'Resurrection', summary: 'Final confrontation and transformation', purpose: 'climax', suggestedWordCount: 3000, keyElements: ['final battle', 'ultimate sacrifice', 'rebirth'], choices: [{ description: 'Sacrifice yourself to save others', consequence: 'Heroic death but legacy lives on', leadTo: 'ending' }, { description: 'Find another way', consequence: 'Survive but with consequences', leadTo: 'next' }] },
        { title: 'Return with Elixir', summary: 'Return transformed with the boon for the ordinary world', purpose: 'resolution', suggestedWordCount: 1500, keyElements: ['resolution', 'changed protagonist', 'new equilibrium'] },
      ],
      endingCount: 4,
      branchingPoints: 5,
    },
    characters: [
      { role: 'protagonist', archetype: 'Reluctant Hero', description: 'An ordinary person with hidden potential', motivations: ['desire for adventure', 'protecting loved ones', 'discovering identity'], traits: ['brave', 'compassionate', 'unsure of themselves'], relationships: [{ targetRole: 'mentor', type: 'mentor', description: 'Guidance and protection' }, { targetRole: 'love_interest', type: 'romantic', description: 'Developing romance' }], arc: 'From nobody to hero' },
      { role: 'mentor', archetype: 'Wise Guide', description: 'An experienced figure who guides the hero', motivations: ['passing on knowledge', 'redemption', 'protecting the world'], traits: ['wise', 'mysterious', 'protective'], relationships: [{ targetRole: 'protagonist', type: 'mentor', description: 'Teacher and protector' }] },
      { role: 'antagonist', archetype: 'Dark Lord', description: 'A powerful villain seeking domination', motivations: ['power', 'revenge', 'twisted vision of order'], traits: ['ruthless', 'intelligent', 'charismatic'], relationships: [{ targetRole: 'protagonist', type: 'enemy', description: 'Destined enemies' }] },
      { role: 'love_interest', archetype: 'Warrior Companion', description: 'A skilled ally who becomes more than a friend', motivations: ['duty', 'love', 'proving worth'], traits: ['strong', 'loyal', 'conflicted'], relationships: [{ targetRole: 'protagonist', type: 'romantic', description: 'Growing love' }] },
      { role: 'sidekick', archetype: 'Comic Relief', description: 'A loyal friend who provides support and humor', motivations: ['loyalty', 'adventure', 'proving themselves'], traits: ['funny', 'loyal', 'underestimated'], relationships: [{ targetRole: 'protagonist', type: 'ally', description: 'Best friend' }] },
    ],
    worldElements: [
      { type: 'magic_system', name: 'Ancient Power', description: 'A long-forgotten magical system connected to prophecy', importance: 'critical' },
      { type: 'setting', name: 'The Kingdom', description: 'A medieval-inspired realm with multiple regions', importance: 'major' },
      { type: 'conflict', name: 'The Darkness', description: 'An ancient evil awakening', importance: 'critical' },
      { type: 'organization', name: 'The Order', description: 'Ancient protectors with hidden knowledge', importance: 'major' },
    ],
    plotPoints: [
      { name: 'The Prophecy Revealed', type: 'inciting_incident', description: 'Hero learns of their destiny', chapter: 2, isMandatory: true },
      { name: 'Mentor\'s Secret', type: 'plot_twist', description: 'The mentor hides a dark connection to the villain', chapter: 5, isMandatory: false },
      { name: 'False Victory', type: 'midpoint', description: 'Heroes believe they\'ve won, but it\'s a trap', chapter: 6, isMandatory: true },
      { name: 'All Is Lost', type: 'dark_moment', description: 'Mentor dies or is captured, heroes scattered', chapter: 8, isMandatory: true },
      { name: 'Final Confrontation', type: 'climax', description: 'Epic battle against the villain', chapter: 9, isMandatory: true },
    ],
    tags: ['chosen one', 'hero journey', 'epic fantasy', 'prophecy', 'mentor', 'coming of age'],
    isPremium: false,
    usageCount: 15420,
    rating: 4.8,
    createdBy: 'stxryai',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },

  // ===== MYSTERY =====
  {
    id: 'mystery-detective',
    name: 'The Perfect Crime',
    description: 'A classic whodunit where the reader helps solve a seemingly impossible crime.',
    genre: 'mystery',
    subGenre: 'detective',
    thumbnail: '/templates/mystery-detective.jpg',
    difficulty: 'hard',
    estimatedLength: 'medium',
    estimatedChapters: 8,
    estimatedDuration: 60,
    structure: {
      type: 'mystery',
      description: 'Gather clues and interview suspects, with multiple solutions based on evidence collected',
      chapterOutline: [
        { title: 'The Crime Scene', summary: 'Discover the crime and initial evidence', purpose: 'introduction', suggestedWordCount: 2000, keyElements: ['crime discovery', 'initial clues', 'victim introduction'] },
        { title: 'The Suspects', summary: 'Meet all potential culprits', purpose: 'rising_action', suggestedWordCount: 2500, keyElements: ['suspect introductions', 'motives hinted', 'alibis presented'] },
        { title: 'First Investigation', summary: 'Begin gathering evidence', purpose: 'rising_action', suggestedWordCount: 2000, keyElements: ['clue gathering', 'interview choices'], choices: [{ description: 'Investigate the study', consequence: 'Find financial motive clue', leadTo: 'branch' }, { description: 'Search the garden', consequence: 'Find physical evidence', leadTo: 'branch' }] },
        { title: 'The Red Herring', summary: 'A false lead throws off the investigation', purpose: 'rising_action', suggestedWordCount: 1800, keyElements: ['misdirection', 'suspect accused', 'alibi confirmed'] },
        { title: 'Deep Secrets', summary: 'Uncover hidden relationships and motives', purpose: 'rising_action', suggestedWordCount: 2500, keyElements: ['secret revealed', 'new suspect', 'stakes raised'] },
        { title: 'The Missing Piece', summary: 'Find the crucial evidence that ties everything together', purpose: 'climax', suggestedWordCount: 2000, keyElements: ['breakthrough', 'confrontation'] },
        { title: 'Accusation', summary: 'Make the final accusation', purpose: 'climax', suggestedWordCount: 2500, keyElements: ['accusation scene', 'evidence presented'], choices: [{ description: 'Accuse the butler', consequence: 'Ending varies by evidence collected', leadTo: 'ending' }, { description: 'Accuse the wife', consequence: 'Ending varies by evidence collected', leadTo: 'ending' }, { description: 'Accuse the business partner', consequence: 'Ending varies by evidence collected', leadTo: 'ending' }] },
        { title: 'The Truth', summary: 'Resolution and revelation of the true culprit', purpose: 'resolution', suggestedWordCount: 1500, keyElements: ['solution revealed', 'detective explanation', 'justice served'] },
      ],
      endingCount: 6,
      branchingPoints: 8,
    },
    characters: [
      { role: 'protagonist', archetype: 'Brilliant Detective', description: 'A sharp-minded investigator with unique methods', motivations: ['truth', 'justice', 'intellectual challenge'], traits: ['observant', 'logical', 'eccentric'], relationships: [], arc: 'Uncover the truth despite obstacles' },
      { role: 'sidekick', archetype: 'Loyal Assistant', description: 'A reliable companion who aids the investigation', motivations: ['helping detective', 'learning', 'adventure'], traits: ['loyal', 'practical', 'brave'], relationships: [{ targetRole: 'protagonist', type: 'ally', description: 'Watson to their Holmes' }] },
      { role: 'antagonist', archetype: 'Hidden Killer', description: 'The true culprit hiding in plain sight', motivations: ['greed', 'revenge', 'desperation'], traits: ['deceptive', 'intelligent', 'charming'], relationships: [] },
    ],
    worldElements: [
      { type: 'setting', name: 'The Manor', description: 'An isolated estate where the crime occurred', importance: 'critical' },
      { type: 'conflict', name: 'The Murder', description: 'A wealthy individual found dead under suspicious circumstances', importance: 'critical' },
    ],
    plotPoints: [
      { name: 'Body Discovered', type: 'hook', description: 'The crime is revealed', chapter: 1, isMandatory: true },
      { name: 'False Accusation', type: 'plot_twist', description: 'An innocent is accused', chapter: 4, isMandatory: false },
      { name: 'Second Crime', type: 'midpoint', description: 'Another crime raises the stakes', chapter: 5, isMandatory: false },
      { name: 'Eureka Moment', type: 'climax', description: 'Detective pieces it all together', chapter: 6, isMandatory: true },
    ],
    tags: ['detective', 'whodunit', 'clues', 'murder mystery', 'investigation'],
    isPremium: false,
    usageCount: 8750,
    rating: 4.7,
    createdBy: 'stxryai',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },

  // ===== ROMANCE =====
  {
    id: 'romance-rivals-to-lovers',
    name: 'Rivals to Lovers',
    description: 'A slow-burn romance where two rivals discover unexpected feelings.',
    genre: 'romance',
    subGenre: 'contemporary',
    thumbnail: '/templates/romance-rivals.jpg',
    difficulty: 'easy',
    estimatedLength: 'medium',
    estimatedChapters: 10,
    estimatedDuration: 60,
    structure: {
      type: 'romance_choice',
      description: 'Relationship-focused choices that determine the romance path and ending',
      chapterOutline: [
        { title: 'First Impressions', summary: 'The rivals meet and clash', purpose: 'introduction', suggestedWordCount: 1500, keyElements: ['meet cute gone wrong', 'rivalry established', 'chemistry hints'] },
        { title: 'The Competition', summary: 'Stakes are raised in their rivalry', purpose: 'rising_action', suggestedWordCount: 1800, keyElements: ['competition introduced', 'forced proximity', 'grudging respect'] },
        { title: 'Unexpected Ally', summary: 'Forced to work together', purpose: 'rising_action', suggestedWordCount: 2000, keyElements: ['teamwork', 'walls lowering', 'vulnerability'], choices: [{ description: 'Open up about your past', consequence: 'Deeper emotional connection faster', leadTo: 'branch' }, { description: 'Keep your guard up', consequence: 'Slower burn, more tension', leadTo: 'next' }] },
        { title: 'Glimpses Beneath', summary: 'See each other\'s true selves', purpose: 'rising_action', suggestedWordCount: 2000, keyElements: ['backstory reveal', 'empathy grows', 'attraction acknowledged'] },
        { title: 'The Moment', summary: 'First romantic moment', purpose: 'midpoint', suggestedWordCount: 2500, keyElements: ['almost kiss', 'confession almost', 'interrupted'], choices: [{ description: 'Give in to the moment', consequence: 'Romantic progression, but complications', leadTo: 'branch' }, { description: 'Pull back', consequence: 'More angst but stronger eventual payoff', leadTo: 'next' }] },
        { title: 'Complications', summary: 'External forces threaten the connection', purpose: 'rising_action', suggestedWordCount: 2000, keyElements: ['misunderstanding', 'third party', 'career conflict'] },
        { title: 'The Fight', summary: 'Major conflict pushes them apart', purpose: 'dark_moment', suggestedWordCount: 1800, keyElements: ['big fight', 'separation', 'regret'] },
        { title: 'Realization', summary: 'Understand their true feelings', purpose: 'falling_action', suggestedWordCount: 1500, keyElements: ['self-reflection', 'advice from friend', 'decision made'] },
        { title: 'Grand Gesture', summary: 'Fight for the relationship', purpose: 'climax', suggestedWordCount: 2500, keyElements: ['public/private declaration', 'vulnerability', 'romantic climax'] },
        { title: 'Happily Ever After', summary: 'Resolution and future together', purpose: 'resolution', suggestedWordCount: 1500, keyElements: ['relationship confirmed', 'future glimpse', 'final kiss'] },
      ],
      endingCount: 4,
      branchingPoints: 6,
    },
    characters: [
      { role: 'protagonist', archetype: 'Ambitious Achiever', description: 'Driven and focused, with walls built high', motivations: ['success', 'proving worth', 'eventually love'], traits: ['competitive', 'guarded', 'secretly soft'], relationships: [{ targetRole: 'love_interest', type: 'rival', description: 'Rivals become lovers' }], arc: 'Learn to open heart while pursuing dreams' },
      { role: 'love_interest', archetype: 'Charming Rival', description: 'Equally ambitious but with a different approach', motivations: ['success', 'proving doubters wrong', 'connection'], traits: ['confident', 'teasing', 'secretly vulnerable'], relationships: [{ targetRole: 'protagonist', type: 'rival', description: 'Rivalry masks attraction' }], arc: 'Learn to be vulnerable' },
      { role: 'supporting', archetype: 'Best Friend', description: 'Supportive friend who sees the truth', motivations: ['friend happiness', 'comic relief'], traits: ['observant', 'supportive', 'meddling'], relationships: [{ targetRole: 'protagonist', type: 'ally', description: 'Voice of reason' }] },
    ],
    worldElements: [
      { type: 'setting', name: 'Competitive Environment', description: 'Workplace, school, or professional setting where rivalry thrives', importance: 'critical' },
      { type: 'conflict', name: 'The Prize', description: 'Whatever they\'re competing for', importance: 'major' },
    ],
    plotPoints: [
      { name: 'The Clash', type: 'inciting_incident', description: 'Rivalry officially begins', chapter: 1, isMandatory: true },
      { name: 'First Crack', type: 'midpoint', description: 'Walls start to fall', chapter: 5, isMandatory: true },
      { name: 'The Breakup', type: 'dark_moment', description: 'Everything falls apart', chapter: 7, isMandatory: true },
      { name: 'Declaration', type: 'climax', description: 'Love confessed', chapter: 9, isMandatory: true },
    ],
    tags: ['rivals to lovers', 'slow burn', 'workplace romance', 'enemies to lovers', 'romantic tension'],
    isPremium: false,
    usageCount: 12300,
    rating: 4.9,
    createdBy: 'stxryai',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },

  // ===== HORROR =====
  {
    id: 'horror-survival',
    name: 'Night of Survival',
    description: 'A tense survival horror where every decision could be your last.',
    genre: 'horror',
    subGenre: 'survival',
    thumbnail: '/templates/horror-survival.jpg',
    difficulty: 'hard',
    estimatedLength: 'medium',
    estimatedChapters: 8,
    estimatedDuration: 45,
    structure: {
      type: 'survival',
      description: 'High-stakes choices with permanent consequences, multiple death endings',
      chapterOutline: [
        { title: 'Isolation', summary: 'Characters find themselves trapped', purpose: 'introduction', suggestedWordCount: 1500, keyElements: ['setup', 'group introduction', 'first sign of danger'] },
        { title: 'First Blood', summary: 'First encounter with the threat', purpose: 'rising_action', suggestedWordCount: 2000, keyElements: ['first death', 'threat revealed', 'panic'], choices: [{ description: 'Investigate the noise', consequence: 'Gain information but risk death', leadTo: 'branch' }, { description: 'Hide and wait', consequence: 'Safer but miss crucial info', leadTo: 'next' }] },
        { title: 'Trust No One', summary: 'Group dynamics fracture under pressure', purpose: 'rising_action', suggestedWordCount: 1800, keyElements: ['paranoia', 'accusations', 'group splits'] },
        { title: 'The Hunt', summary: 'Actively pursued by the threat', purpose: 'rising_action', suggestedWordCount: 2500, keyElements: ['chase sequence', 'close calls', 'character death'] },
        { title: 'Discovery', summary: 'Learn the truth about the threat', purpose: 'midpoint', suggestedWordCount: 2000, keyElements: ['backstory', 'weakness found', 'hope'] },
        { title: 'Last Stand', summary: 'Make a final attempt to survive', purpose: 'climax', suggestedWordCount: 2500, keyElements: ['confrontation', 'sacrifice'], choices: [{ description: 'Sacrifice yourself for others', consequence: 'Heroic death ending', leadTo: 'ending' }, { description: 'Every person for themselves', consequence: 'Survive but at a cost', leadTo: 'branch' }] },
        { title: 'Dawn', summary: 'Survive until morning... or don\'t', purpose: 'resolution', suggestedWordCount: 1500, keyElements: ['final twist', 'survivor count', 'ambiguous ending'] },
      ],
      endingCount: 8,
      branchingPoints: 12,
    },
    characters: [
      { role: 'protagonist', archetype: 'Final Girl/Guy', description: 'The resourceful survivor', motivations: ['survival', 'protecting others', 'uncovering truth'], traits: ['resourceful', 'brave', 'determined'], relationships: [], arc: 'Discover inner strength through terror' },
      { role: 'antagonist', archetype: 'The Monster', description: 'The supernatural or human threat', motivations: ['hunting', 'revenge', 'hunger'], traits: ['relentless', 'terrifying', 'seemingly unstoppable'], relationships: [] },
      { role: 'supporting', archetype: 'The Skeptic', description: 'Doubts the danger until too late', motivations: ['rationality', 'control'], traits: ['logical', 'stubborn', 'doomed'], relationships: [] },
    ],
    worldElements: [
      { type: 'setting', name: 'Isolated Location', description: 'Cabin, island, mansion - somewhere with no escape', importance: 'critical' },
      { type: 'conflict', name: 'The Evil', description: 'Supernatural or human horror threatening the group', importance: 'critical' },
    ],
    plotPoints: [
      { name: 'Trapped', type: 'inciting_incident', description: 'No way out', chapter: 1, isMandatory: true },
      { name: 'First Death', type: 'plot_twist', description: 'Stakes become real', chapter: 2, isMandatory: true },
      { name: 'False Hope', type: 'midpoint', description: 'Escape seems possible', chapter: 5, isMandatory: false },
      { name: 'Final Girl/Guy Emerges', type: 'climax', description: 'Protagonist takes charge', chapter: 6, isMandatory: true },
    ],
    tags: ['survival horror', 'slasher', 'monster', 'gore', 'multiple deaths', 'tense'],
    isPremium: true,
    usageCount: 6540,
    rating: 4.6,
    createdBy: 'stxryai',
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
];

// ========================================
// TEMPLATE CATEGORIES
// ========================================

const TEMPLATE_CATEGORIES: Omit<TemplateCategory, 'templates'>[] = [
  { id: 'popular', name: 'Most Popular', description: 'Crowd favorites that readers love', icon: '🔥', templateCount: 0 },
  { id: 'beginner', name: 'Beginner Friendly', description: 'Perfect for new creators', icon: '🌱', templateCount: 0 },
  { id: 'branching', name: 'Complex Branching', description: 'Multi-path adventures with many endings', icon: '🌳', templateCount: 0 },
  { id: 'quick', name: 'Quick Stories', description: 'Short but impactful narratives', icon: '⚡', templateCount: 0 },
  { id: 'seasonal', name: 'Seasonal', description: 'Holiday and seasonal themes', icon: '🎄', templateCount: 0 },
];

// ========================================
// SERVICE CLASS
// ========================================

class StoryTemplateService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  /**
   * Get all templates with optional filtering
   */
  async getTemplates(filters?: TemplateFilters): Promise<StoryTemplate[]> {
    let templates = [...BUILT_IN_TEMPLATES];

    // Fetch community templates
    try {
      const supabase = this.getSupabase();
      const { data: communityTemplates } = await supabase
        .from('story_templates')
        .select('*')
        .eq('is_approved', true);

      if (communityTemplates) {
        templates = [...templates, ...communityTemplates.map(this.mapTemplate)];
      }
    } catch (error) {
      console.error('Error fetching community templates:', error);
    }

    // Apply filters
    if (filters) {
      if (filters.genre) {
        templates = templates.filter(t => t.genre === filters.genre);
      }
      if (filters.difficulty) {
        templates = templates.filter(t => t.difficulty === filters.difficulty);
      }
      if (filters.length) {
        templates = templates.filter(t => t.estimatedLength === filters.length);
      }
      if (filters.structure) {
        templates = templates.filter(t => t.structure.type === filters.structure);
      }
      if (filters.isPremium !== undefined) {
        templates = templates.filter(t => t.isPremium === filters.isPremium);
      }
      if (filters.createdBy) {
        templates = templates.filter(t => t.createdBy === filters.createdBy);
      }

      // Sorting
      switch (filters.sortBy) {
        case 'popular':
          templates.sort((a, b) => b.usageCount - a.usageCount);
          break;
        case 'newest':
          templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'rating':
          templates.sort((a, b) => b.rating - a.rating);
          break;
        case 'name':
          templates.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return templates;
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string): Promise<StoryTemplate | null> {
    // Check built-in first
    const builtIn = BUILT_IN_TEMPLATES.find(t => t.id === templateId);
    if (builtIn) return builtIn;

    // Check database
    try {
      const supabase = this.getSupabase();
      const { data } = await supabase
        .from('story_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      return data ? this.mapTemplate(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get template categories
   */
  async getCategories(): Promise<TemplateCategory[]> {
    const templates = await this.getTemplates();

    return TEMPLATE_CATEGORIES.map(category => {
      let categoryTemplates: StoryTemplate[] = [];

      switch (category.id) {
        case 'popular':
          categoryTemplates = [...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);
          break;
        case 'beginner':
          categoryTemplates = templates.filter(t => t.difficulty === 'easy');
          break;
        case 'branching':
          categoryTemplates = templates.filter(t => t.structure.branchingPoints >= 6);
          break;
        case 'quick':
          categoryTemplates = templates.filter(t => t.estimatedLength === 'short');
          break;
        case 'seasonal':
          categoryTemplates = templates.filter(t => t.tags.some(tag => 
            ['holiday', 'christmas', 'halloween', 'valentine'].includes(tag.toLowerCase())
          ));
          break;
      }

      return {
        ...category,
        templateCount: categoryTemplates.length,
        templates: categoryTemplates,
      };
    });
  }

  /**
   * Get templates by genre
   */
  async getTemplatesByGenre(genre: Genre): Promise<StoryTemplate[]> {
    return this.getTemplates({ genre, sortBy: 'popular' });
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string): Promise<StoryTemplate[]> {
    const templates = await this.getTemplates();
    const queryLower = query.toLowerCase();

    return templates.filter(t => 
      t.name.toLowerCase().includes(queryLower) ||
      t.description.toLowerCase().includes(queryLower) ||
      t.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Get recommended templates for user
   */
  async getRecommendedTemplates(userId: string): Promise<StoryTemplate[]> {
    const supabase = this.getSupabase();

    // Get user's previous story genres
    const { data: userStories } = await supabase
      .from('stories')
      .select('genre')
      .eq('author_id', userId);

    const genreCounts: Record<string, number> = {};
    (userStories || []).forEach(s => {
      genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
    });

    const preferredGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([genre]) => genre as Genre);

    // Get templates matching preferred genres
    const templates = await this.getTemplates({ sortBy: 'popular' });

    return templates
      .filter(t => preferredGenres.includes(t.genre) || preferredGenres.length === 0)
      .slice(0, 8);
  }

  /**
   * Use template (increment usage count)
   */
  async useTemplate(templateId: string): Promise<void> {
    const supabase = this.getSupabase();

    // Only update database templates
    await supabase
      .from('story_templates')
      .update({ usage_count: supabase.rpc('increment', { x: 1 }) })
      .eq('id', templateId);
  }

  /**
   * Create story from template
   */
  async createFromTemplate(
    templateId: string,
    userId: string,
    customizations: {
      title: string;
      description?: string;
      characterNames?: Record<string, string>;
    }
  ): Promise<{ storyId: string }> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const supabase = this.getSupabase();

    // Create the story
    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        title: customizations.title,
        description: customizations.description || template.description,
        author_id: userId,
        genre: template.genre,
        difficulty: template.difficulty,
        estimated_duration: template.estimatedDuration,
        template_id: templateId,
        is_published: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Create chapters from outline
    const chapters = template.structure.chapterOutline.map((outline, index) => ({
      story_id: story.id,
      title: outline.title,
      chapter_number: index + 1,
      content: `[Template: ${outline.summary}]\n\n<!-- Key elements: ${outline.keyElements.join(', ')} -->\n\n<!-- Suggested word count: ${outline.suggestedWordCount} -->`,
      is_published: false,
    }));

    await supabase.from('chapters').insert(chapters);

    // Track template usage
    await this.useTemplate(templateId);

    return { storyId: story.id };
  }

  /**
   * Submit community template
   */
  async submitCommunityTemplate(
    userId: string,
    template: Omit<StoryTemplate, 'id' | 'usageCount' | 'rating' | 'createdAt' | 'updatedAt'>
  ): Promise<{ templateId: string }> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('story_templates')
      .insert({
        ...template,
        author_id: userId,
        created_by: 'community',
        is_approved: false, // Needs review
        usage_count: 0,
        rating: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return { templateId: data.id };
  }

  private mapTemplate(data: any): StoryTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      genre: data.genre,
      subGenre: data.sub_genre,
      thumbnail: data.thumbnail,
      previewImage: data.preview_image,
      difficulty: data.difficulty,
      estimatedLength: data.estimated_length,
      estimatedChapters: data.estimated_chapters,
      estimatedDuration: data.estimated_duration,
      structure: data.structure,
      characters: data.characters,
      worldElements: data.world_elements,
      plotPoints: data.plot_points,
      tags: data.tags || [],
      isPremium: data.is_premium,
      usageCount: data.usage_count,
      rating: data.rating,
      createdBy: data.created_by,
      authorId: data.author_id,
      authorName: data.author_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const storyTemplateService = new StoryTemplateService();

