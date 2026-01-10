import { createClient } from '@/lib/supabase/client';
import { PersistentNarrativeEngine } from './persistentNarrativeEngine';
import { generateCompletion } from '@/lib/ai/client';

export interface WorldSummary {
  seriesId: string;
  overview: string;
  majorFactions: { name: string; description: string; influence: number }[];
  keyConflicts: { title: string; status: 'active' | 'resolved' | 'looming'; description: string }[];
  thematicAtmosphere: string;
}

export interface LoreEntry {
  id: string;
  title: string;
  category: 'mythology' | 'history' | 'culture' | 'technology' | 'magic' | 'other';
  content: string;
  relatedElements: string[]; // IDs of WorldElements
}

export class WorldExplorerService {
  private static instance: WorldExplorerService;
  private supabase = createClient();
  private narrativeEngine = new PersistentNarrativeEngine();

  private constructor() {}

  public static getInstance(): WorldExplorerService {
    if (!WorldExplorerService.instance) {
      WorldExplorerService.instance = new WorldExplorerService();
    }
    return WorldExplorerService.instance;
  }

  /**
   * Generates a comprehensive summary of the world based on existing elements and ripples
   */
  public async generateWorldSummary(seriesId: string): Promise<WorldSummary> {
    const characters = await this.narrativeEngine.getSeriesCharacters(seriesId);
    const elements = await this.narrativeEngine.getWorldElements(seriesId);
    const ripples = await this.narrativeEngine.getActiveRipples(seriesId);
    const series = await this.narrativeEngine.getSeries(seriesId);

    const prompt = `
      Based on the following series data, generate a comprehensive world summary:
      Series Title: ${series?.title}
      Description: ${series?.description}
      
      Characters: ${characters.map((c) => c.name).join(', ')}
      World Elements: ${elements.map((e) => e.name).join(', ')}
      Active Narrative Ripples: ${ripples.map((r) => r.description).join('; ')}

      Return a JSON object with:
      - overview: A 2-3 paragraph summary of the world's current state.
      - majorFactions: Array of { name, description, influence (1-10) }.
      - keyConflicts: Array of { title, status (active/resolved/looming), description }.
      - thematicAtmosphere: A few words describing the "vibe" (e.g., "Gritty Steampunk with hope").
    `;

    const response = await generateCompletion({
      messages: [
        { role: 'system', content: 'You are a master world-builder and lore-master.' },
        { role: 'user', content: prompt },
      ],
      jsonMode: true,
      tier: 'premium',
    });

    const data = JSON.parse(response.content);
    return {
      seriesId,
      ...data,
    };
  }

  /**
   * Generates a detailed lore entry for a specific topic or element
   */
  public async generateLoreEntry(seriesId: string, topic: string): Promise<LoreEntry> {
    const context = await this.narrativeEngine.compileGenerationContext(seriesId);

    const prompt = `
      Create a detailed lore entry for the topic: "${topic}" in the context of this world.
      
      Context:
      ${JSON.stringify(context)}

      The lore should feel "in-universe" and enrich the world building.
      Return a JSON object with:
      - title: Title of the lore entry.
      - category: One of [mythology, history, culture, technology, magic, other].
      - content: The detailed lore text (3-4 paragraphs).
      - relatedElements: Array of strings matching existing world element names or IDs.
    `;

    const response = await generateCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an archivist recording the history and secrets of a fictional world.',
        },
        { role: 'user', content: prompt },
      ],
      jsonMode: true,
      tier: 'regular',
    });

    const data = JSON.parse(response.content);
    return {
      id: `lore-${Date.now()}`,
      ...data,
    };
  }

  /**
   * Fetches existing world data to display in the explorer
   */
  public async getWorldData(seriesId: string) {
    const locations = await this.narrativeEngine.getWorldElements(seriesId, 'location');
    const items = await this.narrativeEngine.getWorldElements(seriesId, 'item');
    const factions = await this.narrativeEngine.getWorldElements(seriesId, 'faction');
    const characters = await this.narrativeEngine.getSeriesCharacters(seriesId);
    const ripples = await this.narrativeEngine.getActiveRipples(seriesId);

    return {
      locations,
      items,
      factions,
      characters,
      ripples,
    };
  }
}

export const worldExplorerService = WorldExplorerService.getInstance();
