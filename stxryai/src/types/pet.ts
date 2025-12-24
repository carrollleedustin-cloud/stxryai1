/**
 * StoryPet Types - Unique Tamagotchi-like Companion System
 * Each pet is procedurally generated based on user data, making every pet unique.
 */

// Base creature types that determine the fundamental shape
export type PetBaseType = 
  | 'wisp'      // Ethereal floating orb creature
  | 'sprite'    // Small fairy-like being
  | 'dragon'    // Scaled serpentine creature
  | 'phoenix'   // Bird of flame and light
  | 'wolf'      // Canine spirit guide
  | 'cat'       // Feline mystical companion
  | 'owl'       // Wise feathered friend
  | 'fox'       // Cunning trickster spirit
  | 'bunny'     // Fluffy companion creature
  | 'slime'     // Amorphous blob friend
  | 'crystal'   // Crystalline entity
  | 'shadow';   // Dark spectral being

// Element that influences colors and effects
export type PetElement = 
  | 'fire'      // Warm reds, oranges, ember particles
  | 'water'     // Cool blues, teals, bubble particles
  | 'earth'     // Greens, browns, leaf particles
  | 'air'       // Whites, sky blues, wind particles
  | 'lightning' // Yellows, electric, spark particles
  | 'ice'       // Light blues, whites, snowflake particles
  | 'nature'    // Greens, pinks, flower particles
  | 'shadow'    // Purples, blacks, smoke particles
  | 'light'     // Golds, whites, star particles
  | 'cosmic'    // Deep purples, galaxy effects
  | 'void';     // Black with spectral highlights

// Personality affects behavior animations and dialogue
export type PetPersonality = 
  | 'energetic'   // Bouncy, excited animations
  | 'calm'        // Slow, peaceful movements
  | 'curious'     // Looks around, investigates
  | 'playful'     // Silly expressions, games
  | 'wise'        // Thoughtful poses, sage advice
  | 'mischievous' // Sneaky, pranky behaviors
  | 'shy'         // Hides, blushes
  | 'brave'       // Confident poses
  | 'dreamy'      // Floaty, stargazing
  | 'loyal';      // Affectionate, protective

// Evolution stages based on activity
export type PetEvolutionStage = 
  | 'egg'         // Level 0-1: Just hatched
  | 'baby'        // Level 2-5: Small and cute
  | 'juvenile'    // Level 6-15: Growing up
  | 'adult'       // Level 16-30: Mature form
  | 'elder'       // Level 31-50: Wise and powerful
  | 'legendary';  // Level 51+: Maximum evolution

// Mood affects current animations and appearance
export type PetMood = 
  | 'happy'       // Bright colors, bouncy
  | 'excited'     // Extra particles, glowing
  | 'content'     // Relaxed, smiling
  | 'sleepy'      // Eyes drooping, yawning
  | 'hungry'      // Looking for attention
  | 'bored'       // Low energy, sighing
  | 'curious'     // Alert, looking around
  | 'proud'       // Puffed up, showing off
  | 'sad';        // Muted colors, droopy

// Traits that affect appearance - each pet has unique combination
export interface PetTraits {
  // Physical modifiers (0-100 scale)
  fluffiness: number;      // How fluffy/smooth
  sparkle: number;         // How much shimmer
  glow: number;            // Aura intensity
  size: number;            // Relative size
  roundness: number;       // Body shape roundness
  
  // Pattern traits
  hasWings: boolean;
  hasHorns: boolean;
  hasTail: boolean;
  hasHalo: boolean;
  hasMarkings: boolean;
  
  // Color modifiers (hex values)
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  eyeColor: string;
  
  // Pattern type
  pattern: 'solid' | 'gradient' | 'spotted' | 'striped' | 'galaxy' | 'iridescent';
  
  // Special effects
  particleType: 'none' | 'sparkles' | 'flames' | 'bubbles' | 'leaves' | 'snow' | 'stars' | 'hearts' | 'lightning';
  auraType: 'none' | 'soft' | 'pulsing' | 'rainbow' | 'electric' | 'cosmic';
}

// Accessory item pet can wear
export interface PetAccessory {
  id: string;
  name: string;
  type: 'hat' | 'collar' | 'wings' | 'glasses' | 'bow' | 'crown' | 'scarf' | 'aura';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  equipped: boolean;
  imageUrl?: string;
}

// Pet stats that grow with activity
export interface PetStats {
  // Core stats
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalExperience: number;
  
  // Activity-based stats
  storiesRead: number;
  choicesMade: number;
  storiesCreated: number;
  commentsWritten: number;
  daysActive: number;
  currentStreak: number;
  longestStreak: number;
  
  // Pet care stats (0-100)
  happiness: number;
  energy: number;
  
  // Special stats
  wordsRead: number;
  genresExplored: string[];
  favoritGenre?: string;
  rareAchievements: number;
}

// Memory of significant moments
export interface PetMemory {
  id: string;
  type: 'milestone' | 'favorite_story' | 'achievement' | 'evolution' | 'special_moment';
  title: string;
  description: string;
  date: string;
  relatedStoryId?: string;
  emotionalImpact: number; // -100 to 100
}

// The main Pet entity
export interface StoryPet {
  id: string;
  userId: string;
  
  // Identity
  name: string;
  baseType: PetBaseType;
  element: PetElement;
  personality: PetPersonality;
  evolutionStage: PetEvolutionStage;
  
  // Appearance
  traits: PetTraits;
  currentMood: PetMood;
  accessories: PetAccessory[];
  
  // Stats
  stats: PetStats;
  
  // Memory
  memories: PetMemory[];
  
  // Metadata
  bornAt: string;
  lastInteraction: string;
  lastFed: string; // When user last read a story
  
  // Unique seed for procedural generation
  geneticSeed: string;
  
  // Evolution history
  evolutionHistory: {
    stage: PetEvolutionStage;
    achievedAt: string;
    celebrationSeen: boolean;
  }[];
}

// Pet dialogue based on context
export interface PetDialogue {
  id: string;
  trigger: 'greeting' | 'reading_start' | 'reading_end' | 'choice_made' | 'milestone' | 'idle' | 'encouragement' | 'celebration';
  messages: string[];
  mood: PetMood;
  requiresLevel?: number;
  requiresPersonality?: PetPersonality[];
  requiresElement?: PetElement[];
}

// Pet interaction events
export interface PetInteraction {
  type: 'pet' | 'feed' | 'play' | 'talk' | 'gift';
  response: string;
  happinessChange: number;
  energyChange: number;
  experienceGained: number;
}

// Experience rewards for different activities
export const PET_EXPERIENCE_REWARDS = {
  storyRead: 50,
  chapterCompleted: 15,
  choiceMade: 5,
  storyCreated: 100,
  chapterPublished: 30,
  commentWritten: 10,
  dailyLogin: 25,
  streakDay: 10,
  achievementUnlocked: 75,
  ratingGiven: 15,
  friendMade: 50,
  challengeCompleted: 100,
} as const;

// Evolution level requirements
export const EVOLUTION_REQUIREMENTS: Record<PetEvolutionStage, number> = {
  egg: 0,
  baby: 1,
  juvenile: 6,
  adult: 16,
  elder: 31,
  legendary: 51,
};

// Helper function to determine evolution stage from level
export function getEvolutionStage(level: number): PetEvolutionStage {
  if (level >= 51) return 'legendary';
  if (level >= 31) return 'elder';
  if (level >= 16) return 'adult';
  if (level >= 6) return 'juvenile';
  if (level >= 1) return 'baby';
  return 'egg';
}

// Calculate XP needed for next level (exponential scaling)
export function calculateXpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level));
}

