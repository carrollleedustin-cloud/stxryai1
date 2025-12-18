'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'creation' | 'reading' | 'social';
  color: string;
}

interface QuickActionsProps {
  onAction?: (actionId: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      id: 'new-story',
      label: 'New Story',
      icon: '✨',
      shortcut: 'N',
      action: () => {
        router.push('/story-creation-studio');
        setIsOpen(false);
      },
      category: 'creation',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'library',
      label: 'Story Library',
      icon: '📚',
      shortcut: 'L',
      action: () => {
        router.push('/story-library');
        setIsOpen(false);
      },
      category: 'navigation',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      shortcut: 'D',
      action: () => {
        router.push('/user-dashboard');
        setIsOpen(false);
      },
      category: 'navigation',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'search',
      label: 'Search',
      icon: '🔍',
      shortcut: '/',
      action: () => {
        router.push('/search');
        setIsOpen(false);
      },
      category: 'navigation',
      color: 'from-gray-500 to-gray-700',
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: '⭐',
      shortcut: 'C',
      action: () => {
        router.push('/user-dashboard?tab=collections');
        setIsOpen(false);
      },
      category: 'navigation',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'challenges',
      label: 'Challenges',
      icon: '🏆',
      shortcut: 'H',
      action: () => {
        router.push('/user-dashboard?tab=challenges');
        setIsOpen(false);
      },
      category: 'social',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open quick actions with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        return;
      }

      // Handle individual shortcuts when modal is open
      if (isOpen) {
        const action = actions.find((a) => a.shortcut?.toUpperCase() === e.key.toUpperCase());
        if (action) {
          e.preventDefault();
          action.action();
          onAction?.(action.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, actions, onAction]);

  const categories = ['all', 'navigation', 'creation', 'reading', 'social'] as const;
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('all');

  const filteredActions =
    selectedCategory === 'all'
      ? actions
      : actions.filter((a) => a.category === selectedCategory);

  return (
    <>
      {/* Quick Actions Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center z-50"
        aria-label="Quick Actions"
      >
        <Icon name="BoltIcon" size={24} />
      </motion.button>

      {/* Quick Actions Modal */}
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
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Icon name="BoltIcon" size={24} className="text-primary" />
                    Quick Actions
                  </h2>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Icon name="XMarkIcon" size={20} />
                  </motion.button>
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search actions or press a key..."
                  autoFocus
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {/* Category Filter */}
                <div className="flex gap-2 mt-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions List */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredActions.map((action, index) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        action.action();
                        onAction?.(action.id);
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 p-4 bg-muted hover:bg-muted/80 rounded-lg transition-all text-left group"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl flex-shrink-0`}
                      >
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{action.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {action.category}
                        </div>
                      </div>
                      {action.shortcut && (
                        <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono text-muted-foreground group-hover:text-foreground">
                          {action.shortcut}
                        </kbd>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-muted/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Press <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">Esc</kbd> to close</span>
                  <span>Use <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">⌘K</kbd> to open</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

