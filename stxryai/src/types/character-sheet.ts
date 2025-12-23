/**
 * CHARACTER SHEET TYPES
 * Astrological birth chart data used for personalized storytelling
 * Format based on detailed astrological character sheets
 */

// Zodiac signs
export type ZodiacSign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' 
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' 
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

// Core alignment data
export interface CoreAlignment {
  sunSign: string;
  sunDegree?: string;
  moonSign: string;
  moonDegree?: string;
  risingSign: string;
  tagline: string;
}

// Personality archetype
export interface PersonalityArchetype {
  title: string;
  essence: string;
  modeOfOperation: string;
}

// Love and relationships
export interface LoveProfile {
  venusSign: string;
  venusDescription: string;
  marsSign: string;
  marsDescription: string;
  keyAspect?: string;
  romanticArchetype: string;
  traits: string[];
}

// Emotional world
export interface EmotionalProfile {
  moonDescription: string;
  keyTrait: string;
  emotionalArchetype: string;
  traits: string[];
}

// Vocation and purpose
export interface VocationProfile {
  keyPlacements: string;
  jupiterPlacement?: string;
  northNode: string;
  careerThemes: string[];
}

// Shadow and depth
export interface ShadowProfile {
  plutoSign: string;
  plutoDescription: string;
  lilithSign?: string;
  lilithDescription?: string;
  keyAspect?: string;
  shadowArchetype: string;
  traits: string[];
}

// Aesthetic vibes
export interface AestheticProfile {
  colors: string[];
  style: string;
  symbols: string[];
  playlistEnergy: string;
}

// Privacy settings
export interface PrivacySettings {
  hideLocation: boolean;
  hideBirthTime: boolean;
}

// Complete Character Sheet
export interface CharacterSheet {
  id: string;
  userId?: string;
  
  // Birth data
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  
  // Astrological data
  coreAlignment: CoreAlignment;
  personalityArchetype: PersonalityArchetype;
  strengths: string[];
  weaknesses: string[];
  loveProfile: LoveProfile;
  emotionalProfile: EmotionalProfile;
  vocationProfile: VocationProfile;
  shadowProfile: ShadowProfile;
  aestheticProfile: AestheticProfile;
  
  // Signature
  signatureQuote: string;
  
  // Privacy
  privacySettings: PrivacySettings;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Birth data input
export interface BirthDataInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthCity: string;
  birthState?: string;
  birthCountry: string;
  latitude?: number;
  longitude?: number;
}

// Zodiac sign data for UI display
export const ZODIAC_SIGNS: { sign: ZodiacSign; startDate: string; endDate: string; element: string; modality: string; symbol: string; emoji: string }[] = [
  { sign: 'Aries', startDate: '03-21', endDate: '04-19', element: 'Fire', modality: 'Cardinal', symbol: 'Ram', emoji: '♈' },
  { sign: 'Taurus', startDate: '04-20', endDate: '05-20', element: 'Earth', modality: 'Fixed', symbol: 'Bull', emoji: '♉' },
  { sign: 'Gemini', startDate: '05-21', endDate: '06-20', element: 'Air', modality: 'Mutable', symbol: 'Twins', emoji: '♊' },
  { sign: 'Cancer', startDate: '06-21', endDate: '07-22', element: 'Water', modality: 'Cardinal', symbol: 'Crab', emoji: '♋' },
  { sign: 'Leo', startDate: '07-23', endDate: '08-22', element: 'Fire', modality: 'Fixed', symbol: 'Lion', emoji: '♌' },
  { sign: 'Virgo', startDate: '08-23', endDate: '09-22', element: 'Earth', modality: 'Mutable', symbol: 'Maiden', emoji: '♍' },
  { sign: 'Libra', startDate: '09-23', endDate: '10-22', element: 'Air', modality: 'Cardinal', symbol: 'Scales', emoji: '♎' },
  { sign: 'Scorpio', startDate: '10-23', endDate: '11-21', element: 'Water', modality: 'Fixed', symbol: 'Scorpion', emoji: '♏' },
  { sign: 'Sagittarius', startDate: '11-22', endDate: '12-21', element: 'Fire', modality: 'Mutable', symbol: 'Archer', emoji: '♐' },
  { sign: 'Capricorn', startDate: '12-22', endDate: '01-19', element: 'Earth', modality: 'Cardinal', symbol: 'Goat', emoji: '♑' },
  { sign: 'Aquarius', startDate: '01-20', endDate: '02-18', element: 'Air', modality: 'Fixed', symbol: 'Water Bearer', emoji: '♒' },
  { sign: 'Pisces', startDate: '02-19', endDate: '03-20', element: 'Water', modality: 'Mutable', symbol: 'Fish', emoji: '♓' },
];

// Helper to get zodiac emoji
export function getZodiacEmoji(sign: string): string {
  return ZODIAC_SIGNS.find(z => z.sign.toLowerCase() === sign.toLowerCase())?.emoji || '✨';
}

// Helper to get zodiac data
export function getZodiacData(sign: string) {
  return ZODIAC_SIGNS.find(z => z.sign.toLowerCase() === sign.toLowerCase());
}
