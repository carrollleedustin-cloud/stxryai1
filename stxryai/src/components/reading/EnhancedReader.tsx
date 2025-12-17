'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGenreStyle, animationKeyframes, type GenreStyle } from '@/lib/reading/genreStyles';

interface EnhancedReaderProps {
  content: string;
  genre: string;
  narratorText?: string;
  title?: string;
  onSettingsChange?: (settings: ReadingSettings) => void;
}

export interface ReadingSettings {
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  width: 'narrow' | 'medium' | 'wide';
  theme: 'auto' | 'light' | 'dark';
}

const fontSizeMultipliers = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  xl: 1.25,
};

const lineSpacingValues = {
  compact: 0.9,
  normal: 1,
  relaxed: 1.1,
};

const widthValues = {
  narrow: '600px',
  medium: '800px',
  wide: '1000px',
};

export default function EnhancedReader({
  content,
  genre,
  narratorText,
  title,
  onSettingsChange,
}: EnhancedReaderProps) {
  const [settings, setSettings] = useState<ReadingSettings>({
    fontSize: 'medium',
    lineSpacing: 'normal',
    width: 'medium',
    theme: 'auto',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [genreStyle, setGenreStyle] = useState<GenreStyle>(getGenreStyle(genre));
  const [isReading, setIsReading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGenreStyle(getGenreStyle(genre));
  }, [genre]);

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings]);

  const updateSettings = (key: keyof ReadingSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Text-to-speech functionality
  const speakContent = () => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => setIsReading(false);
        utterance.onerror = () => setIsReading(false);

        window.speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    }
  };

  const baseFontSize = parseFloat(genreStyle.fontSize.base);
  const adjustedFontSize = baseFontSize * fontSizeMultipliers[settings.fontSize];
  const adjustedLineHeight =
    parseFloat(genreStyle.lineHeight) * lineSpacingValues[settings.lineSpacing];

  const containerStyle = {
    fontFamily: genreStyle.fontFamily,
    fontSize: `${adjustedFontSize}rem`,
    lineHeight: adjustedLineHeight,
    fontWeight: genreStyle.fontWeight.normal,
    letterSpacing: genreStyle.letterSpacing,
    color: genreStyle.textColor,
    backgroundColor: genreStyle.backgroundColor,
    maxWidth: widthValues[settings.width],
  };

  return (
    <>
      {/* Inject animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: animationKeyframes }} />

      <div className="relative">
        {/* Reading Settings Panel */}
        <div className="sticky top-4 z-20 mb-6 flex justify-end">
          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{
              backgroundColor: genreStyle.accentColor,
              color: genreStyle.backgroundColor,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </motion.button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 rounded-2xl shadow-xl"
              style={{
                backgroundColor: genreStyle.backgroundColor,
                border: `2px solid ${genreStyle.borderColor}`,
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: genreStyle.textColor }}>
                Reading Preferences
              </h3>

              <div className="space-y-4">
                {/* Font Size */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: genreStyle.textColor }}
                  >
                    Font Size
                  </label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSettings('fontSize', size)}
                        className="px-4 py-2 rounded-lg transition-all"
                        style={{
                          backgroundColor:
                            settings.fontSize === size ? genreStyle.accentColor : 'transparent',
                          color:
                            settings.fontSize === size
                              ? genreStyle.backgroundColor
                              : genreStyle.textColor,
                          border: `1px solid ${genreStyle.borderColor}`,
                        }}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line Spacing */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: genreStyle.textColor }}
                  >
                    Line Spacing
                  </label>
                  <div className="flex gap-2">
                    {(['compact', 'normal', 'relaxed'] as const).map((spacing) => (
                      <button
                        key={spacing}
                        onClick={() => updateSettings('lineSpacing', spacing)}
                        className="px-4 py-2 rounded-lg transition-all"
                        style={{
                          backgroundColor:
                            settings.lineSpacing === spacing
                              ? genreStyle.accentColor
                              : 'transparent',
                          color:
                            settings.lineSpacing === spacing
                              ? genreStyle.backgroundColor
                              : genreStyle.textColor,
                          border: `1px solid ${genreStyle.borderColor}`,
                        }}
                      >
                        {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: genreStyle.textColor }}
                  >
                    Reading Width
                  </label>
                  <div className="flex gap-2">
                    {(['narrow', 'medium', 'wide'] as const).map((width) => (
                      <button
                        key={width}
                        onClick={() => updateSettings('width', width)}
                        className="px-4 py-2 rounded-lg transition-all"
                        style={{
                          backgroundColor:
                            settings.width === width ? genreStyle.accentColor : 'transparent',
                          color:
                            settings.width === width
                              ? genreStyle.backgroundColor
                              : genreStyle.textColor,
                          border: `1px solid ${genreStyle.borderColor}`,
                        }}
                      >
                        {width.charAt(0).toUpperCase() + width.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text-to-Speech */}
                <div>
                  <button
                    onClick={speakContent}
                    className="w-full px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: isReading ? genreStyle.accentColor : 'transparent',
                      color: isReading ? genreStyle.backgroundColor : genreStyle.textColor,
                      border: `1px solid ${genreStyle.borderColor}`,
                    }}
                  >
                    {isReading ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                          />
                        </svg>
                        Stop Narration
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Listen to Narration
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reader Content */}
        <motion.div
          className="mx-auto p-8 rounded-2xl shadow-2xl relative overflow-hidden"
          style={{
            ...containerStyle,
            backgroundImage: genreStyle.backgroundPattern,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          {title && (
            <motion.h1
              className="mb-8 text-center"
              style={{
                fontSize: genreStyle.fontSize.title,
                fontWeight: genreStyle.fontWeight.bold,
                color: genreStyle.accentColor,
                textShadow: genreStyle.textShadow,
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>
          )}

          {/* Narrator Text */}
          {narratorText && (
            <motion.div
              className="mb-6 rounded-lg"
              style={{
                ...genreStyle.narratorStyle,
                fontSize: genreStyle.fontSize.narrator,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{genreStyle.narratorStyle.icon}</span>
                <p className="flex-1">{narratorText}</p>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div
            ref={contentRef}
            className="prose prose-lg max-w-none"
            style={{
              textShadow: genreStyle.textShadow,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {content.split('\n\n').map((paragraph, index) => (
              <motion.p
                key={index}
                className="mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>

          {/* Genre Indicator */}
          <div
            className="mt-8 pt-6 border-t-2 flex items-center justify-center gap-2 text-sm opacity-60"
            style={{ borderColor: genreStyle.borderColor }}
          >
            <span>{genreStyle.narratorStyle.icon}</span>
            <span style={{ color: genreStyle.textColor }}>
              {genre
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
