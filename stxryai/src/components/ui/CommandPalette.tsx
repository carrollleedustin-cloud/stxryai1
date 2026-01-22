'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  PenTool,
  Users,
  Settings,
  Home,
  TrendingUp,
  Star,
  MessageSquare,
  Bell,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react';

/**
 * COMMAND PALETTE
 * Quick navigation and search interface (Cmd/Ctrl + K)
 */

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings';
  keywords?: string[];
}

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-home',
      label: 'Go to Home',
      description: 'Return to homepage',
      icon: <Home className="w-4 h-4" />,
      action: () => router.push('/'),
      category: 'navigation',
      keywords: ['home', 'main', 'start'],
    },
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'Creator dashboard',
      icon: <PenTool className="w-4 h-4" />,
      action: () => router.push('/dashboard'),
      category: 'navigation',
      keywords: ['dashboard', 'create', 'stories'],
    },
    {
      id: 'nav-library',
      label: 'Go to Library',
      description: 'Browse stories',
      icon: <BookOpen className="w-4 h-4" />,
      action: () => router.push('/story-library'),
      category: 'navigation',
      keywords: ['library', 'stories', 'browse', 'read'],
    },
    {
      id: 'nav-kids',
      label: 'Go to Kids Zone',
      description: 'Child-friendly content',
      icon: <Star className="w-4 h-4" />,
      action: () => router.push('/kids-zone'),
      category: 'navigation',
      keywords: ['kids', 'children', 'young', 'family'],
    },
    {
      id: 'nav-family',
      label: 'Go to Family',
      description: 'Family management',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/family'),
      category: 'navigation',
      keywords: ['family', 'parents', 'children', 'profiles'],
    },
    {
      id: 'nav-education',
      label: 'Go to Education',
      description: 'Educational resources',
      icon: <GraduationCap className="w-4 h-4" />,
      action: () => router.push('/education'),
      category: 'navigation',
      keywords: ['education', 'teachers', 'classroom', 'learning'],
    },
    {
      id: 'nav-community',
      label: 'Go to Community',
      description: 'Connect with others',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/community-hub'),
      category: 'navigation',
      keywords: ['community', 'social', 'friends', 'chat'],
    },
    // Actions
    {
      id: 'action-new-story',
      label: 'Create New Story',
      description: 'Start writing',
      icon: <Sparkles className="w-4 h-4" />,
      action: () => router.push('/dashboard/create'),
      category: 'actions',
      keywords: ['create', 'new', 'story', 'write'],
    },
    {
      id: 'action-ai-assist',
      label: 'AI Story Assistant',
      description: 'Get AI help',
      icon: <Sparkles className="w-4 h-4" />,
      action: () => router.push('/dashboard/create?ai=true'),
      category: 'actions',
      keywords: ['ai', 'assistant', 'help', 'generate'],
    },
    {
      id: 'action-analytics',
      label: 'View Analytics',
      description: 'Story performance',
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => router.push('/dashboard/analytics'),
      category: 'actions',
      keywords: ['analytics', 'stats', 'performance', 'metrics'],
    },
    // Settings
    {
      id: 'settings-profile',
      label: 'Edit Profile',
      description: 'Update your profile',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/user-profile'),
      category: 'settings',
      keywords: ['profile', 'account', 'settings', 'edit'],
    },
    {
      id: 'settings-notifications',
      label: 'Notifications',
      description: 'Manage notifications',
      icon: <Bell className="w-4 h-4" />,
      action: () => router.push('/notifications'),
      category: 'settings',
      keywords: ['notifications', 'alerts', 'settings'],
    },
    {
      id: 'settings-preferences',
      label: 'Settings',
      description: 'App preferences',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/settings'),
      category: 'settings',
      keywords: ['settings', 'preferences', 'config'],
    },
  ];

  const filteredCommands = commands.filter((command) => {
    const searchLower = search.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords?.some((keyword) => keyword.includes(searchLower))
    );
  });

  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    actions: filteredCommands.filter((c) => c.category === 'actions'),
    settings: filteredCommands.filter((c) => c.category === 'settings'),
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open/close with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearch('');
        setSelectedIndex(0);
      }

      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
        setSelectedIndex(0);
      }

      // Navigate with arrow keys
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const command = filteredCommands[selectedIndex];
          if (command) {
            command.action();
            setIsOpen(false);
            setSearch('');
            setSelectedIndex(0);
          }
        }
      }
    },
    [isOpen, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleCommandClick = (command: Command) => {
    command.action();
    setIsOpen(false);
    setSearch('');
    setSelectedIndex(0);
  };

  return (
    <>
      {/* Keyboard Shortcut Hint */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-void-surface border border-membrane text-white/60 hover:text-white/80 hover:border-spectral-cyan/30 transition-all text-sm"
      >
        <Search className="w-4 h-4" />
        <span>Quick search</span>
        <kbd className="px-2 py-0.5 rounded bg-void-mist text-xs font-mono">⌘K</kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-void-absolute/80 backdrop-blur-sm z-50"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
            >
              <div className="bg-void-surface border border-membrane rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-membrane">
                  <Search className="w-5 h-5 text-white/40" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search commands..."
                    className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-void-mist transition-colors"
                  >
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>

                {/* Commands List */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {filteredCommands.length === 0 ? (
                    <div className="p-8 text-center text-white/40">
                      No commands found for "{search}"
                    </div>
                  ) : (
                    <>
                      {Object.entries(groupedCommands).map(([category, cmds]) => {
                        if (cmds.length === 0) return null;
                        return (
                          <div key={category} className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                              {category}
                            </div>
                            {cmds.map((command, index) => {
                              const globalIndex = filteredCommands.indexOf(command);
                              const isSelected = globalIndex === selectedIndex;
                              return (
                                <button
                                  key={command.id}
                                  onClick={() => handleCommandClick(command)}
                                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                                  className={`
                                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                                    ${
                                      isSelected
                                        ? 'bg-spectral-cyan/10 border border-spectral-cyan/30'
                                        : 'hover:bg-void-mist border border-transparent'
                                    }
                                  `}
                                >
                                  <div
                                    className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center
                                    ${isSelected ? 'bg-spectral-cyan/20 text-spectral-cyan' : 'bg-void-mist text-white/60'}
                                  `}
                                  >
                                    {command.icon}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="text-sm font-medium text-white">
                                      {command.label}
                                    </div>
                                    {command.description && (
                                      <div className="text-xs text-white/40">
                                        {command.description}
                                      </div>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <kbd className="px-2 py-1 rounded bg-void-mist text-xs font-mono text-white/60">
                                      ↵
                                    </kbd>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-membrane bg-void-absolute/50">
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-void-mist font-mono">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-void-mist font-mono">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-void-mist font-mono">esc</kbd>
                      Close
                    </span>
                  </div>
                  <div className="text-xs text-white/40">
                    {filteredCommands.length} commands
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
