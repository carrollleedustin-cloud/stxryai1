export type StoryMood = 'mysterious' | 'adventurous' | 'tense' | 'peaceful' | 'dark' | 'ethereal' | 'action' | 'melancholic';

export interface MoodProfile {
  mood: StoryMood;
  colors: string[]; // Gradient colors
  intensity: number; // 0-1
  label: string;
}

const MOOD_PROFILES: Record<StoryMood, MoodProfile> = {
  mysterious: {
    mood: 'mysterious',
    colors: ['#0f0f1a', '#2d1b4e', '#1a1a2e'],
    intensity: 0.6,
    label: 'Mysterious'
  },
  adventurous: {
    mood: 'adventurous',
    colors: ['#0a1a1a', '#1e4e3e', '#0f2a2a'],
    intensity: 0.7,
    label: 'Adventurous'
  },
  tense: {
    mood: 'tense',
    colors: ['#1a0f0f', '#4e1b1b', '#2e1a1a'],
    intensity: 0.8,
    label: 'Tense'
  },
  peaceful: {
    mood: 'peaceful',
    colors: ['#0f1a1f', '#1b3e4e', '#1a2e3a'],
    intensity: 0.4,
    label: 'Peaceful'
  },
  dark: {
    mood: 'dark',
    colors: ['#050505', '#1a1a1a', '#0a0a0a'],
    intensity: 0.9,
    label: 'Dark'
  },
  ethereal: {
    mood: 'ethereal',
    colors: ['#0f1a2e', '#1b4e8e', '#0f2a4e'],
    intensity: 0.5,
    label: 'Ethereal'
  },
  action: {
    mood: 'action',
    colors: ['#1a150f', '#5e3a1a', '#2e1a0f'],
    intensity: 0.85,
    label: 'Action'
  },
  melancholic: {
    mood: 'melancholic',
    colors: ['#0f0f14', '#1f1f2e', '#14141a'],
    intensity: 0.6,
    label: 'Melancholic'
  }
};

export class MobileMoodService {
  private static instance: MobileMoodService;

  private constructor() {}

  public static getInstance(): MobileMoodService {
    if (!MobileMoodService.instance) {
      MobileMoodService.instance = new MobileMoodService();
    }
    return MobileMoodService.instance;
  }

  /**
   * Analyzes text to determine the predominant mood.
   * In a full implementation, this would call an AI endpoint.
   * For now, it uses keyword matching for efficiency.
   */
  public analyzeMood(text: string): MoodProfile {
    const textLower = text.toLowerCase();
    
    const keywords: Record<StoryMood, string[]> = {
      tense: ['blood', 'danger', 'sharp', 'fear', 'suddenly', 'breathless', 'shadow', 'enemy', 'weapon'],
      mysterious: ['secret', 'unknown', 'whisper', 'hidden', 'riddle', 'strange', 'mystic', 'veil', 'glow'],
      adventurous: ['explore', 'journey', 'climb', 'horizon', 'discover', 'path', 'wind', 'wild', 'ship'],
      peaceful: ['soft', 'calm', 'rest', 'sleep', 'quiet', 'gentle', 'breeze', 'home', 'warm'],
      dark: ['night', 'death', 'void', 'cold', 'dead', 'empty', 'black', 'decay', 'horror'],
      ethereal: ['star', 'light', 'magic', 'dream', 'spirit', 'shimmer', 'infinite', 'celestial', 'float'],
      action: ['run', 'jump', 'strike', 'fast', 'blast', 'shatter', 'clash', 'roar', 'power'],
      melancholic: ['sad', 'lost', 'tears', 'gone', 'memory', 'old', 'rain', 'alone', 'broken']
    };

    let maxScore = 0;
    let detectedMood: StoryMood = 'mysterious';

    for (const [mood, words] of Object.entries(keywords)) {
      let score = 0;
      words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = textLower.match(regex);
        if (matches) score += matches.length;
      });

      if (score > maxScore) {
        maxScore = score;
        detectedMood = mood as StoryMood;
      }
    }

    return MOOD_PROFILES[detectedMood];
  }

  public getMoodProfile(mood: StoryMood): MoodProfile {
    return MOOD_PROFILES[mood];
  }
}

export const mobileMoodService = MobileMoodService.getInstance();
