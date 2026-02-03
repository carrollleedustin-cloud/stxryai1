/**
 * Pet System 2.0 Service
 * Next-generation digital companions with evolution, moods, and RPG mechanics
 */

import { createClient } from '@/lib/supabase/client';

export interface PetSpecies {
  id: string;
  speciesKey: string;
  displayName: string;
  description: string | null;
  lore: string | null;
  baseRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  element: string | null;
  habitat: string | null;
  baseStats: PetStats;
  evolutionChain: EvolutionStage[];
  abilities: string[];
  modelConfig: PetModelConfig;
  isAvailable: boolean;
  isLimitedEdition: boolean;
}

export interface PetStats {
  happiness: number;
  energy: number;
  intelligence: number;
  strength: number;
  agility: number;
  charisma: number;
  luck: number;
}

export interface EvolutionStage {
  stageNumber: number;
  stageName: string;
  description: string | null;
  statMultiplier: number;
  requirements: {
    level: number;
    happiness: number;
    items?: string[];
  };
  visualChanges: Record<string, any>;
}

export interface PetModelConfig {
  modelType: 'sprite' | 'animated_sprite' | '3d_model';
  idleAnimation: string;
  sizeScale: number;
  particleEffects: string[];
  colorScheme: string[];
}

export interface UserPet {
  id: string;
  userId: string;
  species: PetSpecies;
  customName: string | null;
  nickname: string | null;
  
  // Level & Evolution
  level: number;
  experiencePoints: number;
  currentEvolutionStage: number;
  
  // Dynamic stats
  happiness: number;
  energy: number;
  hunger: number;
  hygiene: number;
  health: number;
  
  // Mood
  currentMood: PetMood;
  personalityTraits: string[];
  
  // RPG Stats
  stats: PetStats;
  
  // Customization
  equippedSkinId: string | null;
  equippedAccessoryIds: string[];
  colorOverrides: Record<string, string>;
  
  // Relationship
  bondLevel: number;
  totalInteractions: number;
  favoriteActivity: string | null;
  favoriteFood: string | null;
  
  // Milestones
  achievements: string[];
  titlesEarned: string[];
  activeTitle: string | null;
  
  // Timestamps
  bornAt: string;
  lastFedAt: string;
  lastPlayedAt: string;
  lastInteractionAt: string;
  
  // Status
  isActive: boolean;
  isFavorite: boolean;
}

export type PetMood = 
  | 'ecstatic' | 'happy' | 'content' | 'neutral' 
  | 'bored' | 'tired' | 'hungry' | 'sad' | 'sick';

export interface PetSkin {
  id: string;
  speciesId: string | null;
  skinKey: string;
  displayName: string;
  description: string | null;
  rarity: string;
  previewImageUrl: string | null;
  modelOverrides: Record<string, any>;
  particleEffects: string[];
  isLimited: boolean;
  priceCoins: number | null;
  pricePremium: number | null;
}

export interface PetAccessory {
  id: string;
  accessoryKey: string;
  displayName: string;
  accessoryType: string;
  rarity: string;
  statBonuses: Record<string, number>;
  priceCoins: number | null;
}

export interface PetInteraction {
  type: 'feed' | 'play' | 'pet' | 'train' | 'battle' | 'explore' | 'gift' | 'heal' | 'clean' | 'sleep' | 'wake' | 'evolve' | 'customize';
  statChanges: Partial<PetStats>;
  rewards: {
    xp: number;
    coins?: number;
    items?: string[];
  };
  moodEffect: number;
}

export interface PetActivity {
  id: string;
  activityKey: string;
  displayName: string;
  description: string | null;
  activityType: string;
  durationMinutes: number | null;
  energyCost: number;
  rewards: Record<string, any>;
}

class PetSystem2Service {
  private supabase = createClient();

  // Mood thresholds
  private moodThresholds = {
    ecstatic: { happiness: 90, energy: 70, hunger: 70, health: 90 },
    happy: { happiness: 70, energy: 50, hunger: 50, health: 70 },
    content: { happiness: 50, energy: 40, hunger: 40, health: 50 },
    neutral: { happiness: 30, energy: 30, hunger: 30, health: 30 },
    bored: { happiness: 20, energy: 60, hunger: 40, health: 50 },
    tired: { happiness: 30, energy: 20, hunger: 40, health: 50 },
    hungry: { happiness: 40, energy: 40, hunger: 20, health: 50 },
    sad: { happiness: 10, energy: 30, hunger: 30, health: 40 },
    sick: { happiness: 20, energy: 20, hunger: 30, health: 20 },
  };

  // XP required per level
  private getXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  /**
   * Get all available pet species
   */
  async getAvailableSpecies(): Promise<PetSpecies[]> {
    try {
      const { data, error } = await this.supabase
        .from('pet_species')
        .select('*')
        .eq('is_available', true)
        .order('base_rarity');

      if (error) {
        console.error('Error fetching species:', error);
        return [];
      }

      return (data || []).map(this.mapSpecies);
    } catch (error) {
      console.error('Error in getAvailableSpecies:', error);
      return [];
    }
  }

  /**
   * Get user's pets
   */
  async getUserPets(userId: string): Promise<UserPet[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_pets')
        .select(`
          *,
          pet_species!user_pets_species_id_fkey (*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('is_favorite', { ascending: false })
        .order('display_order');

      if (error) {
        console.error('Error fetching user pets:', error);
        return [];
      }

      return (data || []).map((pet) => this.mapUserPet(pet, pet.pet_species));
    } catch (error) {
      console.error('Error in getUserPets:', error);
      return [];
    }
  }

  /**
   * Get single pet
   */
  async getPet(petId: string): Promise<UserPet | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_pets')
        .select(`
          *,
          pet_species!user_pets_species_id_fkey (*)
        `)
        .eq('id', petId)
        .single();

      if (error) {
        console.error('Error fetching pet:', error);
        return null;
      }

      // Update stats based on time passed
      await this.updatePetStats(petId);

      return this.mapUserPet(data, data.pet_species);
    } catch (error) {
      console.error('Error in getPet:', error);
      return null;
    }
  }

  /**
   * Adopt a new pet
   */
  async adoptPet(
    userId: string,
    speciesId: string,
    customName?: string
  ): Promise<{ success: boolean; petId?: string; error?: string }> {
    try {
      // Get species details
      const { data: species } = await this.supabase
        .from('pet_species')
        .select('*')
        .eq('id', speciesId)
        .eq('is_available', true)
        .single();

      if (!species) {
        return { success: false, error: 'Species not available' };
      }

      // Check unlock requirements if any
      if (species.unlock_requirements && Object.keys(species.unlock_requirements).length > 0) {
        // Verify requirements are met
        // This would check achievements, level, etc.
      }

      // Create pet
      const baseStats = species.base_stats as PetStats;
      const { data: pet, error } = await this.supabase
        .from('user_pets')
        .insert({
          user_id: userId,
          species_id: speciesId,
          custom_name: customName,
          happiness: baseStats.happiness || 50,
          energy: baseStats.energy || 100,
          intelligence: baseStats.intelligence || 10,
          strength: baseStats.strength || 10,
          agility: baseStats.agility || 10,
          charisma: baseStats.charisma || 10,
          luck: baseStats.luck || 10,
          current_mood: 'content',
          personality_traits: this.generatePersonalityTraits(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error adopting pet:', error);
        return { success: false, error: 'Failed to adopt pet' };
      }

      // Log interaction
      await this.logInteraction(pet.id, userId, 'adopt', {}, {}, {});

      return { success: true, petId: pet.id };
    } catch (error) {
      console.error('Error in adoptPet:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Generate random personality traits
   */
  private generatePersonalityTraits(): string[] {
    const possibleTraits = [
      'playful', 'curious', 'lazy', 'energetic', 'shy', 'bold',
      'friendly', 'mischievous', 'loyal', 'independent', 'affectionate',
      'clever', 'stubborn', 'gentle', 'adventurous', 'calm'
    ];
    
    const numTraits = 2 + Math.floor(Math.random() * 2); // 2-3 traits
    const traits: string[] = [];
    
    while (traits.length < numTraits) {
      const trait = possibleTraits[Math.floor(Math.random() * possibleTraits.length)];
      if (!traits.includes(trait)) {
        traits.push(trait);
      }
    }
    
    return traits;
  }

  /**
   * Feed pet
   */
  async feedPet(petId: string, userId: string, foodType?: string): Promise<PetInteraction> {
    const interaction: PetInteraction = {
      type: 'feed',
      statChanges: {
        happiness: 5,
        energy: 10,
      },
      rewards: {
        xp: 15,
      },
      moodEffect: 5,
    };

    // Premium food gives better stats
    if (foodType === 'premium') {
      interaction.statChanges.happiness = 10;
      interaction.statChanges.energy = 20;
      interaction.rewards.xp = 30;
    }

    await this.applyInteraction(petId, userId, interaction);
    
    // Update last fed time
    await this.supabase
      .from('user_pets')
      .update({
        hunger: 100,
        last_fed_at: new Date().toISOString(),
      })
      .eq('id', petId);

    return interaction;
  }

  /**
   * Play with pet
   */
  async playWithPet(petId: string, userId: string, activityType?: string): Promise<PetInteraction> {
    const interaction: PetInteraction = {
      type: 'play',
      statChanges: {
        happiness: 15,
        agility: 1,
      },
      rewards: {
        xp: 25,
        coins: 5,
      },
      moodEffect: 10,
    };

    // Deplete some energy
    const pet = await this.getPet(petId);
    if (pet && pet.energy < 20) {
      interaction.statChanges.happiness = 5;
      interaction.moodEffect = 2;
    }

    await this.applyInteraction(petId, userId, interaction);
    
    // Update last played time and decrease energy
    await this.supabase
      .from('user_pets')
      .update({
        energy: Math.max(0, (pet?.energy || 50) - 15),
        last_played_at: new Date().toISOString(),
      })
      .eq('id', petId);

    return interaction;
  }

  /**
   * Pet your pet (affection)
   */
  async petPet(petId: string, userId: string): Promise<PetInteraction> {
    const interaction: PetInteraction = {
      type: 'pet',
      statChanges: {
        happiness: 8,
        charisma: 0.5,
      },
      rewards: {
        xp: 10,
      },
      moodEffect: 8,
    };

    await this.applyInteraction(petId, userId, interaction);
    return interaction;
  }

  /**
   * Train pet (increase stats)
   */
  async trainPet(
    petId: string,
    userId: string,
    statToTrain: keyof PetStats
  ): Promise<PetInteraction> {
    const interaction: PetInteraction = {
      type: 'train',
      statChanges: {
        [statToTrain]: 2,
        happiness: -5,
      },
      rewards: {
        xp: 40,
      },
      moodEffect: -3,
    };

    // Training costs energy
    const pet = await this.getPet(petId);
    if (pet && pet.energy < 30) {
      return {
        ...interaction,
        statChanges: {},
        rewards: { xp: 0 },
        moodEffect: -5,
      };
    }

    await this.applyInteraction(petId, userId, interaction);
    
    await this.supabase
      .from('user_pets')
      .update({
        energy: Math.max(0, (pet?.energy || 50) - 20),
      })
      .eq('id', petId);

    return interaction;
  }

  /**
   * Apply interaction effects
   */
  private async applyInteraction(
    petId: string,
    userId: string,
    interaction: PetInteraction
  ): Promise<void> {
    try {
      const pet = await this.getPet(petId);
      if (!pet) return;

      // Calculate new values
      const updates: Record<string, any> = {};
      
      for (const [stat, change] of Object.entries(interaction.statChanges)) {
        if (['happiness', 'energy', 'hunger', 'hygiene', 'health'].includes(stat)) {
          const currentValue = (pet as any)[stat] || 50;
          updates[stat] = Math.max(0, Math.min(100, currentValue + (change || 0)));
        } else if (['intelligence', 'strength', 'agility', 'charisma', 'luck'].includes(stat)) {
          const currentValue = pet.stats[stat as keyof PetStats] || 10;
          updates[stat] = Math.max(1, currentValue + (change || 0));
        }
      }

      // Add XP
      const newXP = pet.experiencePoints + interaction.rewards.xp;
      const currentLevel = pet.level;
      const newLevel = this.calculateLevel(newXP);
      
      updates.experience_points = newXP;
      if (newLevel > currentLevel) {
        updates.level = newLevel;
      }

      // Update interaction count and timestamp
      updates.total_interactions = pet.totalInteractions + 1;
      updates.last_interaction_at = new Date().toISOString();

      // Calculate new mood
      updates.current_mood = this.calculateMood({
        happiness: updates.happiness || pet.happiness,
        energy: updates.energy || pet.energy,
        hunger: pet.hunger,
        health: pet.health,
      });

      // Calculate bond level increase
      if (pet.totalInteractions % 50 === 49) {
        updates.bond_level = Math.min(10, pet.bondLevel + 1);
      }

      await this.supabase
        .from('user_pets')
        .update(updates)
        .eq('id', petId);

      // Log interaction
      await this.logInteraction(
        petId,
        userId,
        interaction.type,
        {},
        interaction.statChanges,
        interaction.rewards
      );
    } catch (error) {
      console.error('Error applying interaction:', error);
    }
  }

  /**
   * Calculate level from XP
   */
  private calculateLevel(xp: number): number {
    let level = 1;
    let xpRequired = this.getXPForLevel(level);
    let totalXP = 0;

    while (xp >= totalXP + xpRequired) {
      totalXP += xpRequired;
      level++;
      xpRequired = this.getXPForLevel(level);
    }

    return level;
  }

  /**
   * Calculate mood based on stats
   */
  private calculateMood(stats: {
    happiness: number;
    energy: number;
    hunger: number;
    health: number;
  }): PetMood {
    const { happiness, energy, hunger, health } = stats;

    if (health < 30) return 'sick';
    if (hunger < 20) return 'hungry';
    if (energy < 20) return 'tired';
    if (happiness < 15) return 'sad';
    if (happiness < 30 && energy > 50) return 'bored';
    if (happiness >= 90 && energy >= 70 && hunger >= 70) return 'ecstatic';
    if (happiness >= 70 && energy >= 50) return 'happy';
    if (happiness >= 50) return 'content';
    return 'neutral';
  }

  /**
   * Update pet stats based on time passed
   */
  private async updatePetStats(petId: string): Promise<void> {
    try {
      const { data: pet } = await this.supabase
        .from('user_pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (!pet) return;

      const now = new Date();
      const lastInteraction = new Date(pet.last_interaction_at);
      const hoursPassed = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

      if (hoursPassed < 0.5) return; // Only update if 30+ minutes passed

      // Decay rates per hour
      const decayRates = {
        happiness: -2,
        energy: -1,
        hunger: -3,
        hygiene: -1,
      };

      const updates: Record<string, any> = {};
      
      for (const [stat, rate] of Object.entries(decayRates)) {
        const currentValue = (pet as any)[stat] || 50;
        const decay = rate * Math.min(hoursPassed, 24); // Cap at 24 hours of decay
        updates[stat] = Math.max(0, Math.min(100, currentValue + decay));
      }

      // Energy slowly recovers if not interacted with
      if (hoursPassed > 8) {
        updates.energy = Math.min(100, (pet.energy || 50) + 20);
      }

      // Recalculate mood
      updates.current_mood = this.calculateMood({
        happiness: updates.happiness,
        energy: updates.energy,
        hunger: updates.hunger,
        health: pet.health,
      });

      await this.supabase
        .from('user_pets')
        .update(updates)
        .eq('id', petId);
    } catch (error) {
      console.error('Error updating pet stats:', error);
    }
  }

  /**
   * Check and handle evolution
   */
  async checkEvolution(petId: string, userId: string): Promise<{
    canEvolve: boolean;
    nextStage?: EvolutionStage;
    missingRequirements?: string[];
  }> {
    try {
      const pet = await this.getPet(petId);
      if (!pet) return { canEvolve: false };

      const { data: stages } = await this.supabase
        .from('pet_evolution_stages')
        .select('*')
        .eq('species_id', pet.species.id)
        .gt('stage_number', pet.currentEvolutionStage)
        .order('stage_number')
        .limit(1);

      if (!stages || stages.length === 0) {
        return { canEvolve: false }; // Max evolution reached
      }

      const nextStage = stages[0];
      const requirements = nextStage.evolution_requirements;
      const missingRequirements: string[] = [];

      if (pet.level < requirements.level) {
        missingRequirements.push(`Reach level ${requirements.level}`);
      }
      if (pet.happiness < requirements.happiness) {
        missingRequirements.push(`Achieve ${requirements.happiness}% happiness`);
      }
      // Check required items...

      return {
        canEvolve: missingRequirements.length === 0,
        nextStage: {
          stageNumber: nextStage.stage_number,
          stageName: nextStage.stage_name,
          description: nextStage.description,
          statMultiplier: nextStage.stat_multiplier,
          requirements,
          visualChanges: nextStage.visual_changes,
        },
        missingRequirements: missingRequirements.length > 0 ? missingRequirements : undefined,
      };
    } catch (error) {
      console.error('Error checking evolution:', error);
      return { canEvolve: false };
    }
  }

  /**
   * Evolve pet
   */
  async evolvePet(petId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const evolutionCheck = await this.checkEvolution(petId, userId);
      
      if (!evolutionCheck.canEvolve) {
        return { 
          success: false, 
          error: `Missing requirements: ${evolutionCheck.missingRequirements?.join(', ')}` 
        };
      }

      const pet = await this.getPet(petId);
      if (!pet) return { success: false, error: 'Pet not found' };

      const nextStage = evolutionCheck.nextStage!;

      // Apply stat multiplier
      const statMultiplier = nextStage.statMultiplier;
      const newStats = {
        intelligence: Math.floor(pet.stats.intelligence * statMultiplier),
        strength: Math.floor(pet.stats.strength * statMultiplier),
        agility: Math.floor(pet.stats.agility * statMultiplier),
        charisma: Math.floor(pet.stats.charisma * statMultiplier),
        luck: Math.floor(pet.stats.luck * statMultiplier),
      };

      await this.supabase
        .from('user_pets')
        .update({
          current_evolution_stage: nextStage.stageNumber,
          ...newStats,
          happiness: 100, // Evolution makes them happy!
          titles_earned: [...pet.titlesEarned, `${nextStage.stageName} Form`],
        })
        .eq('id', petId);

      // Log the evolution
      await this.logInteraction(petId, userId, 'evolve', {}, {}, { evolution_stage: nextStage.stageNumber });

      return { success: true };
    } catch (error) {
      console.error('Error evolving pet:', error);
      return { success: false, error: 'Evolution failed' };
    }
  }

  /**
   * Equip skin
   */
  async equipSkin(petId: string, userId: string, skinId: string): Promise<boolean> {
    try {
      // Verify ownership
      const { data: ownership } = await this.supabase
        .from('user_pet_skins')
        .select('id')
        .eq('user_id', userId)
        .eq('skin_id', skinId)
        .single();

      if (!ownership) return false;

      await this.supabase
        .from('user_pets')
        .update({ equipped_skin_id: skinId })
        .eq('id', petId)
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Error equipping skin:', error);
      return false;
    }
  }

  /**
   * Equip accessory
   */
  async equipAccessory(petId: string, userId: string, accessoryId: string): Promise<boolean> {
    try {
      // Verify ownership
      const { data: ownership } = await this.supabase
        .from('user_pet_accessories')
        .select('id')
        .eq('user_id', userId)
        .eq('accessory_id', accessoryId)
        .single();

      if (!ownership) return false;

      const pet = await this.getPet(petId);
      if (!pet) return false;

      const newAccessories = [...pet.equippedAccessoryIds, accessoryId];

      await this.supabase
        .from('user_pets')
        .update({ equipped_accessory_ids: newAccessories })
        .eq('id', petId)
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Error equipping accessory:', error);
      return false;
    }
  }

  /**
   * Get pet skins for shop
   */
  async getAvailableSkins(speciesId?: string): Promise<PetSkin[]> {
    try {
      let query = this.supabase
        .from('pet_skins')
        .select('*')
        .order('rarity');

      if (speciesId) {
        query = query.or(`species_id.eq.${speciesId},species_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching skins:', error);
        return [];
      }

      return (data || []).map((s) => ({
        id: s.id,
        speciesId: s.species_id,
        skinKey: s.skin_key,
        displayName: s.display_name,
        description: s.description,
        rarity: s.rarity,
        previewImageUrl: s.preview_image_url,
        modelOverrides: s.model_overrides,
        particleEffects: s.particle_effects || [],
        isLimited: s.is_limited,
        priceCoins: s.price_coins,
        pricePremium: s.price_premium,
      }));
    } catch (error) {
      console.error('Error in getAvailableSkins:', error);
      return [];
    }
  }

  /**
   * Log pet interaction
   */
  private async logInteraction(
    petId: string,
    userId: string,
    interactionType: string,
    details: Record<string, any>,
    statChanges: Record<string, any>,
    rewards: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.from('pet_interactions').insert({
        pet_id: petId,
        user_id: userId,
        interaction_type: interactionType,
        details,
        stat_changes: statChanges,
        rewards_earned: rewards,
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  /**
   * Get pet activities
   */
  async getActivities(): Promise<PetActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('pet_activities')
        .select('*')
        .order('activity_type');

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return (data || []).map((a) => ({
        id: a.id,
        activityKey: a.activity_key,
        displayName: a.display_name,
        description: a.description,
        activityType: a.activity_type,
        durationMinutes: a.duration_minutes,
        energyCost: a.energy_cost,
        rewards: a.rewards,
      }));
    } catch (error) {
      console.error('Error in getActivities:', error);
      return [];
    }
  }

  /**
   * Get mood emoji and description
   */
  getMoodInfo(mood: PetMood): { emoji: string; description: string; color: string } {
    const moodInfo: Record<PetMood, { emoji: string; description: string; color: string }> = {
      ecstatic: { emoji: '🤩', description: 'Absolutely thriving!', color: '#FFD700' },
      happy: { emoji: '😊', description: 'Feeling great!', color: '#90EE90' },
      content: { emoji: '😌', description: 'All is well', color: '#87CEEB' },
      neutral: { emoji: '😐', description: 'Just okay', color: '#D3D3D3' },
      bored: { emoji: '😒', description: 'Wants attention', color: '#DEB887' },
      tired: { emoji: '😴', description: 'Needs rest', color: '#9370DB' },
      hungry: { emoji: '🥺', description: 'Needs food!', color: '#FFA500' },
      sad: { emoji: '😢', description: 'Feeling down', color: '#6495ED' },
      sick: { emoji: '🤒', description: 'Not feeling well', color: '#FF6B6B' },
    };

    return moodInfo[mood] || moodInfo.neutral;
  }

  /**
   * Get rarity color
   */
  getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: '#9CA3AF',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
      mythic: '#EF4444',
      exclusive: '#EC4899',
    };
    return colors[rarity] || colors.common;
  }

  private mapSpecies(data: any): PetSpecies {
    return {
      id: data.id,
      speciesKey: data.species_key,
      displayName: data.display_name,
      description: data.description,
      lore: data.lore,
      baseRarity: data.base_rarity,
      element: data.element,
      habitat: data.habitat,
      baseStats: data.base_stats,
      evolutionChain: data.evolution_chain || [],
      abilities: data.abilities || [],
      modelConfig: data.model_config,
      isAvailable: data.is_available,
      isLimitedEdition: data.is_limited_edition,
    };
  }

  private mapUserPet(data: any, species: any): UserPet {
    return {
      id: data.id,
      userId: data.user_id,
      species: this.mapSpecies(species),
      customName: data.custom_name,
      nickname: data.nickname,
      level: data.level,
      experiencePoints: data.experience_points,
      currentEvolutionStage: data.current_evolution_stage,
      happiness: data.happiness,
      energy: data.energy,
      hunger: data.hunger,
      hygiene: data.hygiene,
      health: data.health,
      currentMood: data.current_mood,
      personalityTraits: data.personality_traits || [],
      stats: {
        happiness: data.happiness,
        energy: data.energy,
        intelligence: data.intelligence,
        strength: data.strength,
        agility: data.agility,
        charisma: data.charisma,
        luck: data.luck,
      },
      equippedSkinId: data.equipped_skin_id,
      equippedAccessoryIds: data.equipped_accessory_ids || [],
      colorOverrides: data.color_overrides || {},
      bondLevel: data.bond_level,
      totalInteractions: data.total_interactions,
      favoriteActivity: data.favorite_activity,
      favoriteFood: data.favorite_food,
      achievements: data.achievements || [],
      titlesEarned: data.titles_earned || [],
      activeTitle: data.active_title,
      bornAt: data.born_at,
      lastFedAt: data.last_fed_at,
      lastPlayedAt: data.last_played_at,
      lastInteractionAt: data.last_interaction_at,
      isActive: data.is_active,
      isFavorite: data.is_favorite,
    };
  }
}

export const petSystem2Service = new PetSystem2Service();
