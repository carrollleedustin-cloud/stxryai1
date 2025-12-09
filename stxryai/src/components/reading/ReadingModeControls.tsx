'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface ReadingModeControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
  theme: 'light' | 'dark' | 'sepia';
  onThemeChange: (theme: 'light' | 'dark' | 'sepia') => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
}

export default function ReadingModeControls({
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  theme,
  onThemeChange,
  fontFamily,
  onFontFamilyChange
}: ReadingModeControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', bg: 'bg-white', text: 'text-black' },
    { value: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-white' },
    { value: 'sepia', label: 'Sepia', bg: 'bg-amber-50', text: 'text-amber-900' }
  ] as const;

  const fonts = [
    { value: 'serif', label: 'Serif', font: 'font-serif' },
    { value: 'sans', label: 'Sans', font: 'font-sans' },
    { value: 'mono', label: 'Mono', font: 'font-mono' },
    { value: 'dyslexic', label: 'Dyslexic', font: 'font-sans' }
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 bg-card border border-border rounded-2xl shadow-2xl p-6 min-w-[400px]"
          >
            {/* Font Size */}
            <div className="mb-6">
              <label className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Font Size</span>
                <span className="text-sm text-muted-foreground">{fontSize}px</span>
              </label>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
                  className="p-2 bg-muted rounded-lg hover:bg-muted/80"
                  aria-label="Decrease font size"
                >
                  <Icon name="MinusIcon" size={16} />
                </motion.button>
                <input
                  type="range"
                  min="12"
                  max="32"
                  step="2"
                  value={fontSize}
                  onChange={(e) => onFontSizeChange(Number(e.target.value))}
                  className="flex-1"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onFontSizeChange(Math.min(32, fontSize + 2))}
                  className="p-2 bg-muted rounded-lg hover:bg-muted/80"
                  aria-label="Increase font size"
                >
                  <Icon name="PlusIcon" size={16} />
                </motion.button>
              </div>
            </div>

            {/* Line Height */}
            <div className="mb-6">
              <label className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Line Height</span>
                <span className="text-sm text-muted-foreground">{lineHeight}</span>
              </label>
              <input
                type="range"
                min="1.2"
                max="2.4"
                step="0.2"
                value={lineHeight}
                onChange={(e) => onLineHeightChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Reading Theme */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground block mb-3">
                Reading Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => (
                  <motion.button
                    key={t.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onThemeChange(t.value)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      theme === t.value
                        ? 'border-primary'
                        : 'border-border'
                    } ${t.bg}`}
                  >
                    <div className={`text-sm font-medium ${t.text}`}>{t.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-3">
                Font Family
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map((f) => (
                  <motion.button
                    key={f.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onFontFamilyChange(f.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      fontFamily === f.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted'
                    }`}
                  >
                    <div className={`text-sm font-medium ${f.font}`}>{f.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground p-4 rounded-full shadow-2xl hover:shadow-primary/50 transition-shadow"
        aria-label="Reading settings"
      >
        <Icon name="AdjustmentsHorizontalIcon" size={24} />
      </motion.button>
    </div>
  );
}

/**
 * Reading progress bar
 */
export function ReadingProgressBar({ progress }: { progress: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
        className="h-full bg-primary"
      />
    </div>
  );
}

/**
 * Focus mode overlay (dims everything except content)
 */
export function FocusMode({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <AnimatePresence>
      {enabled && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black pointer-events-none z-40"
          />
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="fixed top-4 right-4 z-50 p-3 bg-card rounded-full shadow-lg"
            aria-label="Exit focus mode"
          >
            <Icon name="XMarkIcon" size={20} />
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}
