/**
 * FONT UTILITIES
 * Provides font family names with system font fallbacks.
 * When custom fonts are not loaded, system fonts will be used.
 */

// Check if fonts are loaded (you can enhance this by checking actual font loading state)
const fontsLoaded = false; // Set to true when fonts are actually loaded

export const fonts = {
  regular: fontsLoaded ? 'Sora-Regular' : undefined,
  semiBold: fontsLoaded ? 'Sora-SemiBold' : undefined,
  bold: fontsLoaded ? 'Sora-Bold' : undefined,
  serifRegular: fontsLoaded ? 'Instrument-Regular' : undefined,
  serifItalic: fontsLoaded ? 'Instrument-Italic' : undefined,
  displayRegular: fontsLoaded ? 'Bricolage-Regular' : undefined,
  displayBold: fontsLoaded ? 'Bricolage-Bold' : undefined,
};

/**
 * Get font family with system fallback
 * Returns the custom font if loaded, otherwise returns undefined (uses system default)
 */
export function getFontFamily(fontName: keyof typeof fonts): string | undefined {
  return fonts[fontName];
}

/**
 * Font family presets for common use cases
 */
export const fontFamilies = {
  body: fonts.regular,
  heading: fonts.semiBold,
  bold: fonts.bold,
  serif: fonts.serifRegular,
  display: fonts.displayRegular,
};

