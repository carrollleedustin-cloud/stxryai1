import { supabase } from './supabase';

export interface MobileNarrativeContext {
  characters: any[];
  worldElements: any[];
  activeRipples: any[];
}

export class MobileNarrativeService {
  private static instance: MobileNarrativeService;

  private constructor() {}

  public static getInstance(): MobileNarrativeService {
    if (!MobileNarrativeService.instance) {
      MobileNarrativeService.instance = new MobileNarrativeService();
    }
    return MobileNarrativeService.instance;
  }

  /**
   * Fetches full narrative context for a story
   */
  public async getStoryContext(seriesId: string): Promise<MobileNarrativeContext> {
    try {
      const [characters, worldElements, ripples] = await Promise.all([
        supabase
          .from('characters')
          .select('*')
          .eq('series_id', seriesId),
        supabase
          .from('world_elements')
          .select('*')
          .eq('series_id', seriesId),
        supabase
          .from('world_ripples')
          .select('*')
          .eq('series_id', seriesId)
          .eq('is_active', true)
      ]);

      return {
        characters: characters.data || [],
        worldElements: worldElements.data || [],
        activeRipples: ripples.data || []
      };
    } catch (error) {
      console.error('Error fetching mobile narrative context:', error);
      return {
        characters: [],
        worldElements: [],
        activeRipples: []
      };
    }
  }
}

export const mobileNarrativeService = MobileNarrativeService.getInstance();
