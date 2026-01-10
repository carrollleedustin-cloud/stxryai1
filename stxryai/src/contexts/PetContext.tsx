'use client';

/**
 * Pet Context
 * Global state management for the StoryPet companion system.
 * Provides pet data and actions throughout the application.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { petService } from '@/services/petService';
import { StoryPet, PetInteraction, PET_EXPERIENCE_REWARDS } from '@/types/pet';

// =============================================================================
// TYPES
// =============================================================================

interface PetContextType {
  // Pet data
  pet: StoryPet | null;
  loading: boolean;
  error: string | null;

  // Creation
  createPet: (name: string) => Promise<boolean>;
  hasPet: boolean;

  // Interactions
  petPet: () => Promise<string | null>;
  feedPet: () => Promise<string | null>;
  playWithPet: () => Promise<string | null>;
  talkToPet: () => Promise<string | null>;
  giftPet: () => Promise<string | null>;

  // Experience & Evolution
  awardExperience: (
    activityType: keyof typeof PET_EXPERIENCE_REWARDS,
    additionalData?: { storyId?: string; genre?: string }
  ) => Promise<{ leveledUp: boolean; evolved: boolean }>;

  // Dialogue
  getDialogue: (
    trigger:
      | 'greeting'
      | 'reading_start'
      | 'reading_end'
      | 'choice_made'
      | 'milestone'
      | 'idle'
      | 'encouragement'
      | 'celebration'
  ) => string;

  // Management
  renamePet: (newName: string) => Promise<boolean>;
  refreshPet: () => Promise<void>;

  // UI State
  showPetPanel: boolean;
  setShowPetPanel: (show: boolean) => void;
  showEvolutionCelebration: boolean;
  dismissEvolutionCelebration: () => void;
  pendingEvolution: string | null;

  // Last interaction response
  lastResponse: string | null;
}

// =============================================================================
// CONTEXT
// =============================================================================

const PetContext = createContext<PetContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface PetProviderProps {
  children: ReactNode;
}

export function PetProvider({ children }: PetProviderProps) {
  const { user, profile } = useAuth();

  const [pet, setPet] = useState<StoryPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPetPanel, setShowPetPanel] = useState(false);
  const [showEvolutionCelebration, setShowEvolutionCelebration] = useState(false);
  const [pendingEvolution, setPendingEvolution] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  // Load pet on mount and user change
  useEffect(() => {
    const loadPet = async () => {
      if (!user) {
        setPet(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userPet = await petService.getUserPet(user.id);
        setPet(userPet);

        // Check for unseen evolution celebrations
        if (userPet) {
          const unseenEvolution = userPet.evolutionHistory.find((e) => !e.celebrationSeen);
          if (unseenEvolution) {
            setPendingEvolution(unseenEvolution.stage);
            setShowEvolutionCelebration(true);
          }
        }
      } catch (err) {
        console.error('Error loading pet:', err);
        setError('Failed to load your companion');
      } finally {
        setLoading(false);
      }
    };

    loadPet();
  }, [user]);

  // Create a new pet
  const createPet = useCallback(
    async (name: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const newPet = await petService.createPet(
          user.id,
          user.email || '',
          user.created_at || new Date().toISOString(),
          name
        );

        if (newPet) {
          setPet(newPet);
          setLastResponse(
            `*${name} appears!* Hello, new friend! I'm so excited to go on adventures with you!`
          );
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error creating pet:', err);
        setError('Failed to create companion');
        return false;
      }
    },
    [user]
  );

  // Interact with pet
  const handleInteraction = useCallback(
    async (type: PetInteraction['type']): Promise<string | null> => {
      if (!user || !pet) return null;

      try {
        const interaction = await petService.interactWithPet(user.id, type);
        if (interaction) {
          setLastResponse(interaction.response);
          await refreshPet();
          return interaction.response;
        }
        return null;
      } catch (err) {
        console.error('Error interacting with pet:', err);
        return null;
      }
    },
    [user, pet]
  );

  const petPet = useCallback(() => handleInteraction('pet'), [handleInteraction]);
  const feedPet = useCallback(() => handleInteraction('feed'), [handleInteraction]);
  const playWithPet = useCallback(() => handleInteraction('play'), [handleInteraction]);
  const talkToPet = useCallback(() => handleInteraction('talk'), [handleInteraction]);
  const giftPet = useCallback(() => handleInteraction('gift'), [handleInteraction]);

  // Award experience
  const awardExperience = useCallback(
    async (
      activityType: keyof typeof PET_EXPERIENCE_REWARDS,
      additionalData?: { storyId?: string; genre?: string }
    ): Promise<{ leveledUp: boolean; evolved: boolean }> => {
      if (!user) return { leveledUp: false, evolved: false };

      try {
        const result = await petService.awardExperience(user.id, activityType, additionalData);

        if (result.pet) {
          setPet(result.pet);
        }

        if (result.evolved) {
          setPendingEvolution(result.pet?.evolutionStage || null);
          setShowEvolutionCelebration(true);
        }

        return { leveledUp: result.leveledUp, evolved: result.evolved };
      } catch (err) {
        console.error('Error awarding experience:', err);
        return { leveledUp: false, evolved: false };
      }
    },
    [user]
  );

  // Get dialogue
  const getDialogue = useCallback(
    (
      trigger:
        | 'greeting'
        | 'reading_start'
        | 'reading_end'
        | 'choice_made'
        | 'milestone'
        | 'idle'
        | 'encouragement'
        | 'celebration'
    ): string => {
      if (!pet) return '';
      return petService.getDialogue(pet, trigger);
    },
    [pet]
  );

  // Rename pet
  const renamePet = useCallback(
    async (newName: string): Promise<boolean> => {
      if (!user || !pet) return false;

      try {
        const success = await petService.renamePet(user.id, newName);
        if (success) {
          setPet({ ...pet, name: newName });
          setLastResponse(`*nods happily* I love my new name! Call me ${newName}!`);
        }
        return success;
      } catch (err) {
        console.error('Error renaming pet:', err);
        return false;
      }
    },
    [user, pet]
  );

  // Refresh pet data
  const refreshPet = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const userPet = await petService.getUserPet(user.id);
      if (userPet) {
        setPet(userPet);
      }
    } catch (err) {
      console.error('Error refreshing pet:', err);
    }
  }, [user]);

  // Dismiss evolution celebration
  const dismissEvolutionCelebration = useCallback(() => {
    setShowEvolutionCelebration(false);
    setPendingEvolution(null);
    if (user) {
      // Persist celebration seen and refresh pet state
      petService
        .markLatestEvolutionCelebrationSeen(user.id)
        .then(() => refreshPet())
        .catch((err) => console.error('Failed to mark celebration as seen:', err));
    }
  }, [user, refreshPet]);

  const value: PetContextType = {
    pet,
    loading,
    error,
    createPet,
    hasPet: !!pet,
    petPet,
    feedPet,
    playWithPet,
    talkToPet,
    giftPet,
    awardExperience,
    getDialogue,
    renamePet,
    refreshPet,
    showPetPanel,
    setShowPetPanel,
    showEvolutionCelebration,
    dismissEvolutionCelebration,
    pendingEvolution,
    lastResponse,
  };

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function usePet() {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
}
