/**
 * Enhanced Pet Service with AI Integration
 * Manages the unique Tamagotchi-like companion system with improved AI dialogue
 */

import { supabase } from '@/lib/supabase/client';
import { generateText } from '@/lib/ai/client';
import { getTaskConfig } from '@/lib/ai/config';
import {
  StoryPet,
  PetBaseType,
  PetElement,
  PetPersonality,
  PetEvolutionStage,
  PetMood,
  PetTraits,
  PetStats,
  PetMemory,
  PetAccessory,
  PetInteraction,
  PetDialogue,
  PET_EXPERIENCE_REWARDS,
  getEvolutionStage,
  calculateXpToNextLevel,
} from '@/types/pet';
import {
  analyzeReadingPatterns,
  updateTraitsFromPatterns,
  calculateDynamicMood,
  getVisualEffects,
} from './petPersonalizationService';

// =============================================================================
// UNIQUE PET GENERATION
// =============================================================================

/**
 * Generate a unique genetic seed from user data
 */
function generateGeneticSeed(userId: string, email: string, createdAt: string): string {
  const combined = `${userId}-${email}-${createdAt}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Seeded random number generator
 */
function seededRandom(seed: string, index: number = 0): number {
  const seedValue = seed
    .split('')
    .reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1 + index), 0);
  const x = Math.sin(seedValue) * 10000;
  return x - Math.floor(x);
}

/**
 * Pick a random item from array using seeded random
 */
function seededPick<T>(array: T[], seed: string, index: number): T {
  return array[Math.floor(seededRandom(seed, index) * array.length)];
}

/**
 * Generate unique pet traits from seed
 */
function generateTraits(seed: string, element: PetElement, baseType: PetBaseType): PetTraits {
  const elementColors: Record<PetElement, { primary: string; secondary: string; accent: string }> =
    {
      fire: { primary: '#ff6b35', secondary: '#f7c59f', accent: '#ffd700' },
      water: { primary: '#00b4d8', secondary: '#90e0ef', accent: '#48cae4' },
      earth: { primary: '#606c38', secondary: '#dda15e', accent: '#bc6c25' },
      air: { primary: '#caf0f8', secondary: '#90e0ef', accent: '#00b4d8' },
      lightning: { primary: '#ffd60a', secondary: '#ffc300', accent: '#8338ec' },
      ice: { primary: '#a2d2ff', secondary: '#bde0fe', accent: '#cdb4db' },
      nature: { primary: '#80b918', secondary: '#d4e09b', accent: '#f19c79' },
      shadow: { primary: '#7b2cbf', secondary: '#9d4edd', accent: '#10002b' },
      light: { primary: '#ffd700', secondary: '#fff3b0', accent: '#ffbe0b' },
      cosmic: { primary: '#7209b7', secondary: '#3a0ca3', accent: '#4cc9f0' },
      void: { primary: '#1a1a2e', secondary: '#16213e', accent: '#7b2cbf' },
    };

  const colors = elementColors[element];

  return {
    fluffiness: Math.floor(seededRandom(seed, 1) * 100),
    sparkle: Math.floor(seededRandom(seed, 2) * 100),
    glow: Math.floor(seededRandom(seed, 3) * 100),
    size: 40 + Math.floor(seededRandom(seed, 4) * 60),
    roundness: Math.floor(seededRandom(seed, 5) * 100),

    hasWings: seededRandom(seed, 6) > 0.6 || baseType === 'dragon' || baseType === 'phoenix',
    hasHorns: seededRandom(seed, 7) > 0.7 || baseType === 'dragon',
    hasTail: seededRandom(seed, 8) > 0.4 && !['wisp', 'crystal', 'slime'].includes(baseType),
    hasHalo: seededRandom(seed, 9) > 0.85 || element === 'light',
    hasMarkings: seededRandom(seed, 10) > 0.5,

    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    eyeColor: `hsl(${Math.floor(seededRandom(seed, 11) * 360)}, 80%, 60%)`,

    pattern: seededPick(
      ['solid', 'gradient', 'spotted', 'striped', 'galaxy', 'iridescent'],
      seed,
      12
    ),
    particleType: seededPick(
      ['none', 'sparkles', 'flames', 'bubbles', 'leaves', 'snow', 'stars', 'hearts', 'lightning'],
      seed,
      13
    ),
    auraType: seededPick(['none', 'soft', 'pulsing', 'rainbow', 'electric', 'cosmic'], seed, 14),
  };
}

/**
 * Generate initial pet stats
 */
function generateInitialStats(): PetStats {
  return {
    level: 1,
    experience: 0,
    experienceToNextLevel: calculateXpToNextLevel(1),
    totalExperience: 0,
    storiesRead: 0,
    choicesMade: 0,
    storiesCreated: 0,
    commentsWritten: 0,
    daysActive: 1,
    currentStreak: 1,
    longestStreak: 1,
    happiness: 80,
    energy: 100,
    wordsRead: 0,
    genresExplored: [],
    rareAchievements: 0,
  };
}

/**
 * Generate the first memory for a new pet
 */
function generateBirthMemory(): PetMemory {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
    type: 'milestone',
    title: 'A New Beginning',
    description:
      'The moment we first met, a spark of magic connected us. Our story adventure begins!',
    date: new Date().toISOString(),
    emotionalImpact: 100,
  };
}

// =============================================================================
// ENHANCED PET SERVICE WITH AI
// =============================================================================

class EnhancedPetService {
  /**
   * Create a new pet for a user
   */
  async createPet(
    userId: string,
    email: string,
    userCreatedAt: string,
    petName: string
  ): Promise<StoryPet | null> {
    try {
      const geneticSeed = generateGeneticSeed(userId, email, userCreatedAt);

      const baseTypes: PetBaseType[] = [
        'wisp',
        'sprite',
        'dragon',
        'phoenix',
        'wolf',
        'cat',
        'owl',
        'fox',
        'bunny',
        'slime',
        'crystal',
        'shadow',
      ];
      const elements: PetElement[] = [
        'fire',
        'water',
        'earth',
        'air',
        'lightning',
        'ice',
        'nature',
        'shadow',
        'light',
        'cosmic',
        'void',
      ];
      const personalities: PetPersonality[] = [
        'energetic',
        'calm',
        'curious',
        'playful',
        'wise',
        'mischievous',
        'shy',
        'brave',
        'dreamy',
        'loyal',
      ];

      const baseType = seededPick(baseTypes, geneticSeed, 0);
      const element = seededPick(elements, geneticSeed, 1);
      const personality = seededPick(personalities, geneticSeed, 2);
      const traits = generateTraits(geneticSeed, element, baseType);

      const now = new Date().toISOString();

      const pet: StoryPet = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        userId,
        name: petName,
        baseType,
        element,
        personality,
        evolutionStage: 'baby',
        traits,
        currentMood: 'happy',
        accessories: [],
        stats: generateInitialStats(),
        memories: [generateBirthMemory()],
        bornAt: now,
        lastInteraction: now,
        lastFed: now,
        geneticSeed,
        evolutionHistory: [
          {
            stage: 'baby',
            achievedAt: now,
            celebrationSeen: false,
          },
        ],
      };

      // Store in database
      const { error } = await supabase.from('user_pets').insert({
        id: pet.id,
        user_id: userId,
        name: petName,
        base_type: baseType,
        element,
        personality,
        evolution_stage: 'baby',
        traits: pet.traits,
        current_mood: 'happy',
        accessories: [],
        stats: pet.stats,
        memories: pet.memories,
        born_at: now,
        last_interaction: now,
        last_fed: now,
        genetic_seed: geneticSeed,
        evolution_history: pet.evolutionHistory,
      });

      if (error) {
        console.error('Error creating pet in database:', error);
        return pet;
      }

      return pet;
    } catch (error) {
      console.error('Error creating pet:', error);
      return null;
    }
  }

  /**
   * Get user's pet
   */
  async getUserPet(userId: string): Promise<StoryPet | null> {
    try {
      const { data, error } = await supabase
        .from('user_pets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return await this.mapDatabasePet(data, userId);
    } catch (error) {
      console.error('Error getting pet:', error);
      return null;
    }
  }

  /**
   * Award experience to pet with AI-generated feedback
   */
  async awardExperience(
    userId: string,
    activityType: keyof typeof PET_EXPERIENCE_REWARDS,
    additionalData?: { storyId?: string; genre?: string }
  ): Promise<{ leveledUp: boolean; evolved: boolean; pet: StoryPet | null }> {
    try {
      const pet = await this.getUserPet(userId);
      if (!pet) return { leveledUp: false, evolved: false, pet: null };

      const xpGained = PET_EXPERIENCE_REWARDS[activityType];
      const newStats = { ...pet.stats };

      newStats.experience += xpGained;
      newStats.totalExperience += xpGained;

      // Update activity-specific stats
      switch (activityType) {
        case 'storyRead':
          newStats.storiesRead++;
          break;
        case 'choiceMade':
          newStats.choicesMade++;
          break;
        case 'storyCreated':
          newStats.storiesCreated++;
          break;
        case 'commentWritten':
          newStats.commentsWritten++;
          break;
      }

      if (additionalData?.genre && !newStats.genresExplored.includes(additionalData.genre)) {
        newStats.genresExplored.push(additionalData.genre);
      }

      newStats.happiness = Math.min(100, newStats.happiness + 5);

      let leveledUp = false;
      while (newStats.experience >= newStats.experienceToNextLevel) {
        newStats.experience -= newStats.experienceToNextLevel;
        newStats.level++;
        newStats.experienceToNextLevel = calculateXpToNextLevel(newStats.level);
        leveledUp = true;
      }

      const newEvolutionStage = getEvolutionStage(newStats.level);
      const evolved = newEvolutionStage !== pet.evolutionStage;

      const newMood = this.calculateMood(newStats);

      const newMemories = [...pet.memories];
      if (evolved) {
        newMemories.push({
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
          type: 'evolution',
          title: `Evolved to ${newEvolutionStage}!`,
          description: `Through countless adventures together, I've grown stronger and wiser. Thank you for being my companion!`,
          date: new Date().toISOString(),
          emotionalImpact: 100,
        });
      }

      const evolutionHistory = [...pet.evolutionHistory];
      if (evolved) {
        evolutionHistory.push({
          stage: newEvolutionStage,
          achievedAt: new Date().toISOString(),
          celebrationSeen: false,
        });
      }

      await supabase
        .from('user_pets')
        .update({
          stats: newStats,
          current_mood: newMood,
          evolution_stage: newEvolutionStage,
          memories: newMemories,
          evolution_history: evolutionHistory,
          last_interaction: new Date().toISOString(),
          last_fed: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return {
        leveledUp,
        evolved,
        pet: {
          ...pet,
          stats: newStats,
          currentMood: newMood,
          evolutionStage: newEvolutionStage,
          memories: newMemories,
          evolutionHistory,
        },
      };
    } catch (error) {
      console.error('Error awarding experience:', error);
      return { leveledUp: false, evolved: false, pet: null };
    }
  }

  /**
   * Interact with pet with AI-generated response
   */
  async interactWithPet(
    userId: string,
    interactionType: PetInteraction['type']
  ): Promise<PetInteraction | null> {
    try {
      const pet = await this.getUserPet(userId);
      if (!pet) return null;

      // Get AI-generated response
      const aiResponse = await this.generatePetResponse(pet, interactionType);

      const interactions: Record<PetInteraction['type'], Omit<PetInteraction, 'response'>> = {
        pet: {
          type: 'pet',
          happinessChange: 10,
          energyChange: 5,
          experienceGained: 2,
        },
        feed: {
          type: 'feed',
          happinessChange: 15,
          energyChange: 20,
          experienceGained: 5,
        },
        play: {
          type: 'play',
          happinessChange: 20,
          energyChange: -10,
          experienceGained: 10,
        },
        talk: {
          type: 'talk',
          happinessChange: 8,
          energyChange: 0,
          experienceGained: 3,
        },
        gift: {
          type: 'gift',
          happinessChange: 25,
          energyChange: 10,
          experienceGained: 15,
        },
      };

      const interaction = interactions[interactionType];

      const newStats = { ...pet.stats };
      newStats.happiness = Math.max(
        0,
        Math.min(100, newStats.happiness + interaction.happinessChange)
      );
      newStats.energy = Math.max(0, Math.min(100, newStats.energy + interaction.energyChange));
      newStats.experience += interaction.experienceGained;
      newStats.totalExperience += interaction.experienceGained;

      while (newStats.experience >= newStats.experienceToNextLevel) {
        newStats.experience -= newStats.experienceToNextLevel;
        newStats.level++;
        newStats.experienceToNextLevel = calculateXpToNextLevel(newStats.level);
      }

      const newMood = this.calculateMood(newStats);

      await supabase
        .from('user_pets')
        .update({
          stats: newStats,
          current_mood: newMood,
          evolution_stage: getEvolutionStage(newStats.level),
          last_interaction: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Store interaction in database
      await supabase.from('pet_interactions').insert({
        user_id: userId,
        pet_id: pet.id,
        interaction_type: interactionType,
        response: aiResponse,
        happiness_change: interaction.happinessChange,
        energy_change: interaction.energyChange,
        experience_gained: interaction.experienceGained,
      });

      return {
        ...interaction,
        response: aiResponse,
      };
    } catch (error) {
      console.error('Error interacting with pet:', error);
      return null;
    }
  }

  /**
   * Generate AI response for pet interaction
   */
  private async generatePetResponse(
    pet: StoryPet,
    interactionType: PetInteraction['type']
  ): Promise<string> {
    try {
      const config = getTaskConfig('petDialogue');

      const prompt = `You are a ${pet.personality} ${pet.baseType} companion with ${pet.element} element. 
Your name is ${pet.name}. You are at level ${pet.stats.level} and in ${pet.evolutionStage} stage.
Your current mood is ${pet.currentMood} and happiness is ${pet.stats.happiness}%.

The user just ${this.getInteractionDescription(interactionType)}.

Generate a short, personality-appropriate response (1-2 sentences max). Be playful and engaging.
Keep it under 100 characters.`;

      const response = await generateText(prompt, undefined, config.temperature);
      return response.trim();
    } catch (error) {
      console.error('Error generating pet response:', error);
      // Fallback to hardcoded response
      return this.getFallbackResponse(pet, interactionType);
    }
  }

  /**
   * Get interaction description for AI prompt
   */
  private getInteractionDescription(type: PetInteraction['type']): string {
    const descriptions: Record<PetInteraction['type'], string> = {
      pet: 'petted me gently',
      feed: 'gave me food',
      play: 'wanted to play',
      talk: 'talked to me',
      gift: 'gave me a gift',
    };
    return descriptions[type];
  }

  /**
   * Fallback response if AI generation fails
   */
  private getFallbackResponse(pet: StoryPet, type: PetInteraction['type']): string {
    const responses: Record<PetInteraction['type'], Record<PetPersonality, string>> = {
      pet: {
        energetic: '*bounces happily* That tickles!',
        calm: '*purrs softly* That feels nice...',
        curious: '*tilts head* What is that feeling?',
        playful: '*giggles* Hehe!',
        wise: '*nods appreciatively* Thank you, friend.',
        mischievous: '*pretends to bite* Gotcha!',
        shy: '*blushes* Oh my...',
        brave: '*stands proud* I appreciate this!',
        dreamy: '*floats contentedly* Like clouds...',
        loyal: '*nuzzles* I love you!',
      },
      feed: {
        energetic: 'FOOD! *chomps excitedly*',
        calm: '*gracefully eats* Delicious.',
        curious: '*sniffs* What flavor is this?',
        playful: '*plays with food first* Wheee!',
        wise: 'A thoughtful meal. Thank you.',
        mischievous: '*pretends to share, eats all*',
        shy: '*quietly eats* Thank you...',
        brave: '*eats heroically* Fuel for adventure!',
        dreamy: '*eats slowly* Like star dust...',
        loyal: 'You always take care of me!',
      },
      play: {
        energetic: 'YES! PLAYTIME! *zooms around*',
        calm: '*gentle play* This is fun.',
        curious: 'What game is this?',
        playful: '*laughs* This is the BEST!',
        wise: 'Strategy time! *thinks*',
        mischievous: '*cheats a little* Oops!',
        shy: '*nervously plays* Am I doing it right?',
        brave: 'A worthy opponent!',
        dreamy: '*plays in slow motion*',
        loyal: 'Playing with you is the best!',
      },
      talk: {
        energetic: 'Tell me EVERYTHING! So exciting!',
        calm: '*listens attentively* I understand.',
        curious: 'Really? Tell me more!',
        playful: '*makes silly faces while listening*',
        wise: '*nods sagely* Wisdom speaks.',
        mischievous: '*whispers secrets back*',
        shy: "*listens quietly* That's nice...",
        brave: 'A tale of adventure!',
        dreamy: '*drifts off imagining*',
        loyal: "I'll always listen to you!",
      },
      gift: {
        energetic: 'A PRESENT?! *explodes with joy*',
        calm: '*receives gracefully* How kind.',
        curious: '*examines gift carefully* What is it?',
        playful: '*plays with wrapping* The box is fun too!',
        wise: 'A meaningful gift. I am honored.',
        mischievous: '*already planning what to do with it*',
        shy: '*blushes deeply* For... for me?',
        brave: 'A token of friendship!',
        dreamy: '*gazes at it in wonder*',
        loyal: "I'll never let it go!",
      },
    };

    return responses[type][pet.personality] || 'Thank you!';
  }

  /**
   * Get pet dialogue
   */
  getDialogue(pet: StoryPet, trigger: PetDialogue['trigger']): string {
    const dialogues = this.getDialogueOptions(pet, trigger);
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }

  /**
   * Rename pet
   */
  async renamePet(userId: string, newName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_pets')
        .update({ name: newName })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error renaming pet:', error);
      return false;
    }
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  private async mapDatabasePet(data: any, userId?: string): Promise<StoryPet> {
    const pet: StoryPet = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      baseType: data.base_type,
      element: data.element,
      personality: data.personality,
      evolutionStage: data.evolution_stage,
      traits: data.traits,
      currentMood: data.current_mood,
      accessories: data.accessories || [],
      stats: data.stats,
      memories: data.memories || [],
      bornAt: data.born_at,
      lastInteraction: data.last_interaction,
      lastFed: data.last_fed,
      geneticSeed: data.genetic_seed,
      evolutionHistory: data.evolution_history || [],
    };

    // Personalize pet based on reading patterns if userId provided
    if (userId) {
      try {
        const patterns = await analyzeReadingPatterns(userId);
        const updatedTraits = updateTraitsFromPatterns(pet.traits, patterns, pet);
        const dynamicMood = calculateDynamicMood(pet, patterns);

        pet.traits = updatedTraits;
        pet.currentMood = dynamicMood;
      } catch (error) {
        console.error('Error personalizing pet:', error);
      }
    }

    return pet;
  }

  private calculateMood(stats: PetStats): PetMood {
    if (stats.happiness >= 90) return 'excited';
    if (stats.happiness >= 70) return 'happy';
    if (stats.happiness >= 50) return 'content';
    if (stats.happiness >= 30) return 'bored';
    if (stats.happiness >= 10) return 'hungry';
    return 'sad';
  }

  private getDialogueOptions(pet: StoryPet, trigger: PetDialogue['trigger']): string[] {
    const baseDialogues: Record<PetDialogue['trigger'], string[]> = {
      greeting: [
        `*${pet.name} appears!* Ready for stories?`,
        `Hello friend! What shall we read today?`,
        `*waves* I missed you!`,
        `Adventure awaits! Let's go!`,
      ],
      reading_start: [
        `Ooh, a new story! *settles in*`,
        `*eyes widen* This looks exciting!`,
        `Let's see where this takes us...`,
        `*gets cozy* I'm ready!`,
      ],
      reading_end: [
        `What a journey! *stretches*`,
        `*happy sigh* That was amazing...`,
        `Can we read another?`,
        `*reflects* I learned so much!`,
      ],
      choice_made: [
        `Interesting choice!`,
        `*nods* I would have picked that too!`,
        `Let's see what happens...`,
        `Bold move!`,
      ],
      milestone: [
        `*celebrates* We did it!`,
        `*proud* Look how far we've come!`,
        `*confetti appears* Achievement unlocked!`,
        `*happy dance* This is amazing!`,
      ],
      idle: [
        `*yawns* Wanna read something?`,
        `*looks around* It's quiet here...`,
        `*pokes you* Hey! Let's do something!`,
        `*practices tricks* Look what I learned!`,
      ],
      encouragement: [
        `You can do it! I believe in you!`,
        `*cheers* Keep going!`,
        `*motivational pose* You're amazing!`,
        `We're in this together!`,
      ],
      celebration: [
        `*throws confetti* YAYYY!`,
        `*does a flip* We're the best!`,
        `*glowing with pride* Incredible!`,
        `*party mode activated*`,
      ],
    };

    return baseDialogues[trigger];
  }
}

// Export singleton
export const petService = new EnhancedPetService();
