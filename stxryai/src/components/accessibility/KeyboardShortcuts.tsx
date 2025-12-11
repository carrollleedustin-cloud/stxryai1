'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'reading' | 'creation' | 'general';
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['G', 'H'], description: 'Go to Home', category: 'navigation' },
  { keys: ['G', 'L'], description: 'Go to Library', category: 'navigation' },
  { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'navigation' },
  { keys: ['G', 'P'], description: 'Go to Profile', category: 'navigation' },
  { keys: ['/'], description: 'Focus Search', category: 'navigation' },

  // Reading
  { keys: ['→'], description: 'Next Chapter', category: 'reading' },
  { keys: ['←'], description: 'Previous Chapter', category: 'reading' },
  { keys: ['B'], description: 'Bookmark', category: 'reading' },
  { keys: ['F'], description: 'Toggle Focus Mode', category: 'reading' },
  { keys: ['S'], description: 'Share Story', category: 'reading' },

  // Creation
  { keys: ['N'], description: 'New Story', category: 'creation' },
  { keys: ['Ctrl', 'S'], description: 'Save Draft', category: 'creation' },
  { keys: ['Ctrl', 'P'], description: 'Preview', category: 'creation' },

  // General
  { keys: ['?'], description: 'Show Shortcuts', category: 'general' },
  { keys: ['Esc'], description: 'Close Modal', category: 'general' },
  { keys: ['Ctrl', 'K'], description: 'Command Palette', category: 'general' },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const categories = [
    { id: 'navigation', label: 'Navigation', icon: '🧭' },
    { id: 'reading', label: 'Reading', icon: '📖' },
    { id: 'creation', label: 'Creation', icon: '✍️' },
    { id: 'general', label: 'General', icon: '⚙️' },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center text-xl"
        title="Keyboard Shortcuts (?)"
      >
        ⌨️
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Keyboard Shortcuts</h3>
                  <p className="text-gray-400 text-sm">Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs">?</kbd> anytime to toggle</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <div key={category.id}>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.label}
                    </h4>
                    <div className="space-y-2">
                      {shortcuts
                        .filter((s) => s.category === category.id)
                        .map((shortcut, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                          >
                            <span className="text-gray-300 text-sm">{shortcut.description}</span>
                            <div className="flex gap-1">
                              {shortcut.keys.map((key, j) => (
                                <kbd
                                  key={j}
                                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm font-mono"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
