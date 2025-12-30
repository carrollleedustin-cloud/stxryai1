/**
 * Pet Personalization Service
 * Makes each pet unique based on user's reading and interaction patterns
 */

import { StoryPet, PetTraits, PetElement, PetPersonality, PetMood } from '@/types/pet';
import { supabase } from '@/lib/supabase/client';

export interface ReadingPattern {
  averageReadingSpeed: number; // words per minute
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  readingFrequency: 'binge' | 'consistent' | 'sporadic';
  favoriteGenres: string[];
  averageSessionLength: number; // minutes
  interactionFrequency: 'high' | 'medium' | 'low';
  prefersLongStories: boolean;
  prefersShortStories: boolean;
  exploresManyGenres: boolean;
  sticksToGenres: boolean;
}

/**
 * Analyze user's reading patterns from database
 */
export async function analyzeReadingPatterns(userId: string): Promise<ReadingPattern> {
  try {
    // Get user activity data
    const [progressData, activityData, storiesData] = await Promise.all([
      // Reading progress
      supabase
        .from('user_progress')
        .select('story_id, stories(id, genre, word_count), last_read_at, reading_time_minutes')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(100),
      
      // Activity logs
      supabase
        .from('user_activity')
        .select('activity_type, created_at, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200),
      
      // Stories read
      supabase
        .from('user_progress')
        .select('stories(id, genre, word_count)')
        .eq('user_id', userId)
        .eq('is_completed', true),
    ]);

    const progress = progressData.data || [];
    const activities = activityData.data || [];
    const completedStories = storiesData.data || [];

    // Calculate reading speed
    const totalWords = completedStories.reduce((sum: number, p: any) => 
      sum + (p.stories?.word_count || 0), 0);
    const totalMinutes = progress.reduce((sum: number, p: any) => 
      sum + (p.reading_time_minutes || 0), 0);
    const averageReadingSpeed = totalMinutes > 0 ? totalWords / totalMinutes : 200;

    // Determine preferred time of day
    const hourCounts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    activities.forEach((activity: any) => {
      const hour = new Date(activity.created_at).getHours();
      if (hour >= 5 && hour < 12) hourCounts.morning++;
      else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
      else if (hour >= 17 && hour < 22) hourCounts.evening++;
      else hourCounts.night++;
    });
    const preferredTimeOfDay = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as ReadingPattern['preferredTimeOfDay'] || 'afternoon';

    // Determine reading frequency
    const daysWithActivity = new Set(
      activities.map((a: any) => new Date(a.created_at).toDateString())
    ).size;
    const totalDays = activities.length > 0 
      ? Math.ceil((Date.now() - new Date(activities[activities.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 1;
    const activityRatio = daysWithActivity / Math.max(totalDays, 1);
    
    let readingFrequency: ReadingPattern['readingFrequency'] = 'sporadic';
    if (activityRatio > 0.7) readingFrequency = 'consistent';
    else if (activityRatio < 0.3 && activities.length > 10) readingFrequency = 'binge';

    // Get favorite genres
    const genreCounts: Record<string, number> = {};
    completedStories.forEach((p: any) => {
      const genre = p.stories?.genre;
      if (genre) genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    const favoriteGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);

    // Average session length
    const sessionLengths = progress
      .map((p: any) => p.reading_time_minutes)
      .filter((m: number) => m > 0);
    const averageSessionLength = sessionLengths.length > 0
      ? sessionLengths.reduce((a: number, b: number) => a + b, 0) / sessionLengths.length
      : 30;

    // Story length preference
    const wordCounts = completedStories.map((p: any) => p.stories?.word_count || 0);
    const avgWordCount = wordCounts.length > 0
      ? wordCounts.reduce((a: number, b: number) => a + b, 0) / wordCounts.length
      : 0;
    const prefersLongStories = avgWordCount > 50000;
    const prefersShortStories = avgWordCount < 10000;

    // Genre exploration
    const uniqueGenres = new Set(completedStories.map((p: any) => p.stories?.genre).filter(Boolean));
    const exploresManyGenres = uniqueGenres.size >= 5;
    const sticksToGenres = uniqueGenres.size <= 2 && completedStories.length > 5;

    // Interaction frequency
    const interactions = activities.filter((a: any) => 
      a.activity_type.includes('interaction') || a.activity_type.includes('pet')
    ).length;
    const interactionFrequency: ReadingPattern['interactionFrequency'] = 
      interactions > 50 ? 'high' : interactions > 20 ? 'medium' : 'low';

    return {
      averageReadingSpeed,
      preferredTimeOfDay,
      readingFrequency,
      favoriteGenres,
      averageSessionLength,
      interactionFrequency,
      prefersLongStories,
      prefersShortStories,
      exploresManyGenres,
      sticksToGenres,
    };
  } catch (error) {
    console.error('Error analyzing reading patterns:', error);
    // Return defaults
    return {
      averageReadingSpeed: 200,
      preferredTimeOfDay: 'afternoon',
      readingFrequency: 'consistent',
      favoriteGenres: [],
      averageSessionLength: 30,
      interactionFrequency: 'medium',
      prefersLongStories: false,
      prefersShortStories: false,
      exploresManyGenres: false,
      sticksToGenres: false,
    };
  }
}

/**
 * Update pet traits based on reading patterns
 */
export function updateTraitsFromPatterns(
  currentTraits: PetTraits,
  patterns: ReadingPattern,
  pet: StoryPet
): PetTraits {
  const newTraits = { ...currentTraits };

  // Color changes based on favorite genres
  if (patterns.favoriteGenres.length > 0) {
    const genreColors: Record<string, { primary: string; secondary: string; accent: string }> = {
      fantasy: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
      sci-fi: { primary: '#06b6d4', secondary: '#22d3ee', accent: '#67e8f9' },
      romance: { primary: '#ec4899', secondary: '#f472b6', accent: '#fbcfe8' },
      mystery: { primary: '#1e293b', secondary: '#334155', accent: '#64748b' },
      horror: { primary: '#7c2d12', secondary: '#9a3412', accent: '#c2410c' },
      adventure: { primary: '#059669', secondary: '#10b981', accent: '#34d399' },
      comedy: { primary: '#f59e0b', secondary: '#fbbf24', accent: '#fcd34d' },
      drama: { primary: '#6366f1', secondary: '#818cf8', accent: '#a5b4fc' },
    };

    const topGenre = patterns.favoriteGenres[0];
    const genreColor = genreColors[topGenre.toLowerCase()] || genreColors.fantasy;
    
    // Blend with existing colors (70% existing, 30% genre influence)
    newTraits.primaryColor = blendColors(currentTraits.primaryColor, genreColor.primary, 0.3);
    newTraits.secondaryColor = blendColors(currentTraits.secondaryColor, genreColor.secondary, 0.3);
    newTraits.accentColor = blendColors(currentTraits.accentColor, genreColor.accent, 0.3);
  }

  // Reading speed affects sparkle and glow
  if (patterns.averageReadingSpeed > 300) {
    // Fast reader - more energetic, brighter
    newTraits.sparkle = Math.min(100, newTraits.sparkle + 20);
    newTraits.glow = Math.min(100, newTraits.glow + 15);
  } else if (patterns.averageReadingSpeed < 150) {
    // Slow reader - more thoughtful, calmer
    newTraits.sparkle = Math.max(0, newTraits.sparkle - 10);
    newTraits.glow = Math.max(0, newTraits.glow - 5);
  }

  // Time of day affects particle type
  if (patterns.preferredTimeOfDay === 'night') {
    newTraits.particleType = newTraits.particleType === 'none' ? 'stars' : newTraits.particleType;
    newTraits.glow = Math.min(100, newTraits.glow + 10);
  } else if (patterns.preferredTimeOfDay === 'morning') {
    newTraits.particleType = newTraits.particleType === 'none' ? 'sparkles' : newTraits.particleType;
  }

  // Reading frequency affects size and roundness
  if (patterns.readingFrequency === 'binge') {
    // Binge readers - pets grow faster, more round
    newTraits.size = Math.min(100, newTraits.size + 10);
    newTraits.roundness = Math.min(100, newTraits.roundness + 15);
  } else if (patterns.readingFrequency === 'consistent') {
    // Consistent readers - balanced growth
    newTraits.size = Math.min(100, newTraits.size + 5);
  }

  // Genre exploration affects pattern
  if (patterns.exploresManyGenres) {
    newTraits.pattern = 'iridescent'; // Multi-colored for diverse readers
  } else if (patterns.sticksToGenres) {
    newTraits.pattern = 'solid'; // Solid color for focused readers
  }

  // Session length affects fluffiness
  if (patterns.averageSessionLength > 60) {
    // Long sessions - more comfortable, fluffy
    newTraits.fluffiness = Math.min(100, newTraits.fluffiness + 15);
  }

  // Interaction frequency affects aura
  if (patterns.interactionFrequency === 'high') {
    newTraits.auraType = newTraits.auraType === 'none' ? 'pulsing' : newTraits.auraType;
  }

  return newTraits;
}

/**
 * Calculate pet mood based on recent activity
 */
export function calculateDynamicMood(
  pet: StoryPet,
  patterns: ReadingPattern
): PetMood {
  const { stats, lastFed, lastInteraction } = pet;
  
  // Time since last interaction
  const hoursSinceInteraction = (Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60);
  const hoursSinceFed = (Date.now() - new Date(lastFed).getTime()) / (1000 * 60 * 60);

  // Recent activity
  const recentActivity = stats.daysActive > 0 ? stats.currentStreak / stats.daysActive : 0;

  // Determine mood
  if (hoursSinceFed > 48) return 'hungry';
  if (hoursSinceInteraction > 24) return 'bored';
  if (stats.happiness > 80 && recentActivity > 0.7) return 'excited';
  if (stats.happiness > 60) return 'happy';
  if (stats.energy < 30) return 'sleepy';
  if (stats.happiness < 40) return 'sad';
  if (patterns.readingFrequency === 'binge' && recentActivity > 0.5) return 'excited';
  
  return 'content';
}

/**
 * Blend two hex colors
 */
function blendColors(color1: string, color2: string, ratio: number): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Get visual effects based on reading patterns
 */
export function getVisualEffects(patterns: ReadingPattern): {
  particleIntensity: number;
  glowIntensity: number;
  animationSpeed: number;
  colorShift: number;
} {
  return {
    particleIntensity: patterns.interactionFrequency === 'high' ? 1.5 : 1,
    glowIntensity: patterns.averageReadingSpeed > 250 ? 1.3 : 1,
    animationSpeed: patterns.readingFrequency === 'binge' ? 1.2 : 1,
    colorShift: patterns.exploresManyGenres ? 0.2 : 0,
  };
}

