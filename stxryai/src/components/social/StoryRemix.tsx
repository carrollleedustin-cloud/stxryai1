'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface StoryRemixProps {
  originalStoryId: string;
  originalStoryTitle: string;
  onRemix: (remixData: RemixOptions) => Promise<void>;
}

interface RemixOptions {
  keepStructure: boolean;
  keepCharacters: boolean;
  keepSetting: boolean;
  newGenre?: string;
  newTone?: string;
  remixType: 'fork' | 'remix' | 'sequel' | 'prequel';
}

export function StoryRemix({ originalStoryId, originalStoryTitle, onRemix }: StoryRemixProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [options, setOptions] = useState<RemixOptions>({
    keepStructure: true,
    keepCharacters: false,
    keepSetting: false,
    remixType: 'remix',
  });

  const remixTypes = [
    { id: 'fork' as const, label: 'Fork', icon: '🔀', description: 'Create a parallel version' },
    { id: 'remix' as const, label: 'Remix', icon: '🎵', description: 'Mix and match elements' },
    { id: 'sequel' as const, label: 'Sequel', icon: '➡️', description: 'Continue the story' },
    { id: 'prequel' as const, label: 'Prequel', icon: '⬅️', description: 'Tell what happened before' },
  ];

  const handleRemix = async () => {
    setIsRemixing(true);
    try {
      await onRemix(options);
      setIsOpen(false);
    } catch (error) {
      console.error('Remix failed:', error);
    } finally {
      setIsRemixing(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center gap-2"
      >
        <Icon name="ArrowPathIcon" size={20} />
        Remix Story
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <span>🎵</span>
                    Remix Story
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Icon name="XMarkIcon" size={20} />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Original Story</p>
                  <p className="font-semibold text-foreground">{originalStoryTitle}</p>
                </div>

                {/* Remix Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Remix Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {remixTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        onClick={() => setOptions({ ...options, remixType: type.id })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          options.remixType === type.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-medium text-foreground">{type.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4 mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    What to Keep
                  </label>
                  {[
                    { key: 'keepStructure', label: 'Story Structure', description: 'Keep branching paths' },
                    { key: 'keepCharacters', label: 'Characters', description: 'Keep character names' },
                    { key: 'keepSetting', label: 'Setting', description: 'Keep world/location' },
                  ].map((option) => (
                    <label
                      key={option.key}
                      className="flex items-start gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={options[option.key as keyof RemixOptions] as boolean}
                        onChange={(e) =>
                          setOptions({ ...options, [option.key]: e.target.checked })
                        }
                        className="mt-1 w-4 h-4 rounded border-border"
                      />
                      <div>
                        <div className="font-medium text-foreground">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleRemix}
                    disabled={isRemixing}
                    whileHover={!isRemixing ? { scale: 1.02 } : {}}
                    whileTap={!isRemixing ? { scale: 0.98 } : {}}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {isRemixing ? 'Creating Remix...' : 'Create Remix'}
                  </motion.button>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 bg-muted text-foreground rounded-lg font-medium"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

