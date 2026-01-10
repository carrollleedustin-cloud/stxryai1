/**
 * Accessibility Service
 * Provides customization for reading experience accessibility.
 */

import { supabase } from '@/lib/supabase/client';

// Types
export interface AccessibilitySettings {
  // Visual settings
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'default' | 'dyslexic' | 'serif' | 'sans-serif' | 'monospace';
  lineHeight: 'compact' | 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'normal' | 'wide' | 'wider';
  wordSpacing: 'normal' | 'wide' | 'wider';

  // Color settings
  theme: 'light' | 'dark' | 'sepia' | 'high-contrast' | 'custom';
  customBackground?: string;
  customText?: string;
  reduceMotion: boolean;

  // Reading aids
  highlightCurrentLine: boolean;
  readingGuide: boolean;
  readingGuideColor: string;
  textToSpeech: boolean;
  autoScroll: boolean;
  autoScrollSpeed: number;

  // Focus settings
  focusMode: boolean;
  hideImages: boolean;
  simplifyLayout: boolean;
}

export interface TextToSpeechSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  highlightWords: boolean;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSize: 'medium',
  fontFamily: 'default',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  theme: 'light',
  reduceMotion: false,
  highlightCurrentLine: false,
  readingGuide: false,
  readingGuideColor: '#ffeb3b',
  textToSpeech: false,
  autoScroll: false,
  autoScrollSpeed: 50,
  focusMode: false,
  hideImages: false,
  simplifyLayout: false,
};

export const DEFAULT_TTS_SETTINGS: TextToSpeechSettings = {
  voice: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  highlightWords: true,
};

// Font size mappings
export const FONT_SIZES = {
  small: '14px',
  medium: '16px',
  large: '20px',
  'extra-large': '24px',
};

// Line height mappings
export const LINE_HEIGHTS = {
  compact: 1.4,
  normal: 1.6,
  relaxed: 1.8,
  loose: 2.0,
};

// Letter spacing mappings
export const LETTER_SPACINGS = {
  normal: '0',
  wide: '0.05em',
  wider: '0.1em',
};

// Word spacing mappings
export const WORD_SPACINGS = {
  normal: '0',
  wide: '0.1em',
  wider: '0.2em',
};

// Theme color mappings
export const THEME_COLORS = {
  light: { background: '#ffffff', text: '#1a1a1a' },
  dark: { background: '#1a1a1a', text: '#f5f5f5' },
  sepia: { background: '#f4ecd8', text: '#5c4b37' },
  'high-contrast': { background: '#000000', text: '#ffffff' },
};

// Font family mappings
export const FONT_FAMILIES = {
  default: 'system-ui, -apple-system, sans-serif',
  dyslexic: 'OpenDyslexic, Comic Sans MS, sans-serif',
  serif: 'Georgia, Times New Roman, serif',
  'sans-serif': 'Arial, Helvetica, sans-serif',
  monospace: 'Courier New, monospace',
};

export const accessibilityService = {
  /**
   * Get user's accessibility settings
   */
  async getUserSettings(userId: string): Promise<AccessibilitySettings> {
    try {
      const { data, error } = await supabase
        .from('user_accessibility_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching accessibility settings:', error);
        return DEFAULT_ACCESSIBILITY_SETTINGS;
      }

      if (!data) {
        return DEFAULT_ACCESSIBILITY_SETTINGS;
      }

      return {
        ...DEFAULT_ACCESSIBILITY_SETTINGS,
        ...data.settings,
      };
    } catch (error) {
      console.error('Unexpected error in getUserSettings:', error);
      return DEFAULT_ACCESSIBILITY_SETTINGS;
    }
  },

  /**
   * Save user's accessibility settings
   */
  async saveUserSettings(
    userId: string,
    settings: Partial<AccessibilitySettings>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_accessibility_settings').upsert({
        user_id: userId,
        settings: settings,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error saving accessibility settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in saveUserSettings:', error);
      return false;
    }
  },

  /**
   * Generate CSS variables from settings
   */
  generateCSSVariables(settings: AccessibilitySettings): Record<string, string> {
    const themeColors =
      settings.theme === 'custom'
        ? {
            background: settings.customBackground || THEME_COLORS.light.background,
            text: settings.customText || THEME_COLORS.light.text,
          }
        : THEME_COLORS[settings.theme] || THEME_COLORS.light;

    return {
      '--reading-font-size': FONT_SIZES[settings.fontSize],
      '--reading-font-family': FONT_FAMILIES[settings.fontFamily],
      '--reading-line-height': String(LINE_HEIGHTS[settings.lineHeight]),
      '--reading-letter-spacing': LETTER_SPACINGS[settings.letterSpacing],
      '--reading-word-spacing': WORD_SPACINGS[settings.wordSpacing],
      '--reading-background': themeColors.background,
      '--reading-text-color': themeColors.text,
      '--reading-guide-color': settings.readingGuideColor,
    };
  },

  /**
   * Apply settings to document
   */
  applySettingsToDocument(settings: AccessibilitySettings): void {
    const root = document.documentElement;
    const cssVars = this.generateCSSVariables(settings);

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, String(value));
    });

    // Apply reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply focus mode
    if (settings.focusMode) {
      root.classList.add('focus-mode');
    } else {
      root.classList.remove('focus-mode');
    }

    // Apply hide images
    if (settings.hideImages) {
      root.classList.add('hide-images');
    } else {
      root.classList.remove('hide-images');
    }
  },

  /**
   * Get available TTS voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }

    return window.speechSynthesis.getVoices();
  },

  /**
   * Speak text with TTS
   */
  speak(
    text: string,
    settings: TextToSpeechSettings,
    onWord?: (word: string, index: number) => void
  ): SpeechSynthesisUtterance | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    if (settings.voice) {
      const voice = this.getAvailableVoices().find((v) => v.name === settings.voice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Word boundary event for highlighting
    if (onWord && settings.highlightWords) {
      let charIndex = 0;
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const word = text.slice(event.charIndex, event.charIndex + event.charLength);
          onWord(word, charIndex++);
        }
      };
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  },

  /**
   * Stop TTS
   */
  stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  /**
   * Pause TTS
   */
  pauseSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  },

  /**
   * Resume TTS
   */
  resumeSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  },

  /**
   * Check if TTS is speaking
   */
  isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }
    return window.speechSynthesis.speaking;
  },

  /**
   * Calculate reading time based on settings
   */
  calculateReadingTime(wordCount: number, settings: AccessibilitySettings): number {
    // Base reading speed (words per minute)
    let wpm = 200;

    // Adjust for font size
    if (settings.fontSize === 'large') wpm *= 0.9;
    if (settings.fontSize === 'extra-large') wpm *= 0.8;

    // Adjust for dyslexic font
    if (settings.fontFamily === 'dyslexic') wpm *= 0.85;

    // Adjust for line height
    if (settings.lineHeight === 'loose') wpm *= 0.95;

    return Math.ceil(wordCount / wpm);
  },

  /**
   * Get keyboard shortcuts for accessibility features
   */
  getKeyboardShortcuts(): Array<{ key: string; description: string }> {
    return [
      { key: 'Alt + Plus', description: 'Increase font size' },
      { key: 'Alt + Minus', description: 'Decrease font size' },
      { key: 'Alt + T', description: 'Toggle theme (light/dark)' },
      { key: 'Alt + R', description: 'Toggle reading guide' },
      { key: 'Alt + S', description: 'Toggle text-to-speech' },
      { key: 'Alt + F', description: 'Toggle focus mode' },
      { key: 'Alt + M', description: 'Toggle reduce motion' },
      { key: 'Space', description: 'Pause/resume auto-scroll' },
      { key: 'Escape', description: 'Exit focus mode' },
    ];
  },

  /**
   * Check system preferences
   */
  getSystemPreferences(): {
    prefersReducedMotion: boolean;
    prefersDarkMode: boolean;
    prefersHighContrast: boolean;
  } {
    if (typeof window === 'undefined') {
      return {
        prefersReducedMotion: false,
        prefersDarkMode: false,
        prefersHighContrast: false,
      };
    }

    return {
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
    };
  },

  /**
   * Get recommended settings based on system preferences
   */
  getRecommendedSettings(): Partial<AccessibilitySettings> {
    const prefs = this.getSystemPreferences();
    const recommended: Partial<AccessibilitySettings> = {};

    if (prefs.prefersReducedMotion) {
      recommended.reduceMotion = true;
      recommended.autoScroll = false;
    }

    if (prefs.prefersDarkMode) {
      recommended.theme = 'dark';
    }

    if (prefs.prefersHighContrast) {
      recommended.theme = 'high-contrast';
    }

    return recommended;
  },
};

export default accessibilityService;
