import { z } from 'zod';

// Accessibility Settings Validation Schema
export const accessibilitySettingsSchema = z.object({
  fontSize: z.enum(['small', 'medium', 'large', 'extra-large']).default('medium'),
  fontFamily: z
    .enum(['default', 'dyslexic', 'serif', 'sans-serif', 'monospace'])
    .default('default'),
  lineHeight: z.enum(['compact', 'normal', 'relaxed', 'loose']).default('normal'),
  letterSpacing: z.enum(['normal', 'wide', 'wider']).default('normal'),
  wordSpacing: z.enum(['normal', 'wide', 'wider']).default('normal'),
  theme: z.enum(['light', 'dark', 'sepia', 'high-contrast', 'custom']).default('light'),
  customBackground: z.string().optional(),
  customText: z.string().optional(),
  reduceMotion: z.boolean().default(false),
  highlightCurrentLine: z.boolean().default(false),
  readingGuide: z.boolean().default(false),
  readingGuideColor: z.string().default('#ffeb3b'),
  textToSpeech: z.boolean().default(false),
  autoScroll: z.boolean().default(false),
  autoScrollSpeed: z.number().min(1).max(100).default(50),
  focusMode: z.boolean().default(false),
  hideImages: z.boolean().default(false),
  simplifyLayout: z.boolean().default(false),
});

// Text-to-Speech Settings Validation Schema
export const textToSpeechSettingsSchema = z.object({
  voice: z.string().default(''),
  rate: z.number().min(0.1).max(10).default(1.0),
  pitch: z.number().min(0).max(2).default(1.0),
  volume: z.number().min(0).max(1).default(1.0),
  highlightWords: z.boolean().default(true),
});

// Type exports
export type AccessibilitySettingsInput = z.input<typeof accessibilitySettingsSchema>;
export type AccessibilitySettingsValidated = z.output<typeof accessibilitySettingsSchema>;
export type TextToSpeechSettingsInput = z.input<typeof textToSpeechSettingsSchema>;
export type TextToSpeechSettingsValidated = z.output<typeof textToSpeechSettingsSchema>;
