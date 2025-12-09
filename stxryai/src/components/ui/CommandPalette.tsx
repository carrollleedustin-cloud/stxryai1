'use client';

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from '@/components/ui/AppIcon';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Client-side only mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      // Close on escape
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [router]);

  const navigate = useCallback((path: string) => {
    router.push(path);
    setOpen(false);
    setSearch('');
  }, [router]);

  const toggleTheme = useCallback(() => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    setOpen(false);
  }, [theme, setTheme]);

  // Don't render until mounted on client
  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl"
            >
              <Command
                className="bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
                label="Command Menu"
              >
                {/* Search Input */}
                <div className="flex items-center border-b border-border px-4">
                  <Icon
                    name="MagnifyingGlassIcon"
                    size={20}
                    className="text-muted-foreground"
                  />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search stories, navigate, or run commands..."
                    className="w-full py-4 px-3 bg-transparent border-0 focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
                    ESC
                  </kbd>
                </div>

                <Command.List className="max-h-96 overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-muted-foreground">
                    No results found.
                  </Command.Empty>

                  {/* Navigation Group */}
                  <Command.Group
                    heading="Navigation"
                    className="text-xs font-semibold text-muted-foreground px-2 py-2"
                  >
                    <CommandItem
                      icon="HomeIcon"
                      onSelect={() => navigate('/landing-page')}
                      shortcut="⌘H"
                    >
                      Home
                    </CommandItem>
                    <CommandItem
                      icon="BookOpenIcon"
                      onSelect={() => navigate('/story-library')}
                      shortcut="⌘L"
                    >
                      Story Library
                    </CommandItem>
                    <CommandItem
                      icon="UserCircleIcon"
                      onSelect={() => navigate('/user-dashboard')}
                      shortcut="⌘D"
                    >
                      Dashboard
                    </CommandItem>
                    <CommandItem
                      icon="Cog6ToothIcon"
                      onSelect={() => navigate('/user-profile')}
                      shortcut="⌘,"
                    >
                      Settings
                    </CommandItem>
                  </Command.Group>

                  {/* Actions Group */}
                  <Command.Group
                    heading="Actions"
                    className="text-xs font-semibold text-muted-foreground px-2 py-2"
                  >
                    <CommandItem
                      icon="PencilSquareIcon"
                      onSelect={() => navigate('/story-creation-studio')}
                      shortcut="⌘N"
                    >
                      Create New Story
                    </CommandItem>
                    <CommandItem
                      icon="MagnifyingGlassIcon"
                      onSelect={() => navigate('/story-library')}
                      shortcut="⌘F"
                    >
                      Search Stories
                    </CommandItem>
                  </Command.Group>

                  {/* Appearance Group */}
                  <Command.Group
                    heading="Appearance"
                    className="text-xs font-semibold text-muted-foreground px-2 py-2"
                  >
                    <CommandItem
                      icon={theme === 'dark' ? 'MoonIcon' : theme === 'light' ? 'SunIcon' : 'ComputerDesktopIcon'}
                      onSelect={toggleTheme}
                      shortcut="⌘T"
                    >
                      Toggle Theme ({theme})
                    </CommandItem>
                  </Command.Group>

                  {/* Help Group */}
                  <Command.Group
                    heading="Help & Support"
                    className="text-xs font-semibold text-muted-foreground px-2 py-2"
                  >
                    <CommandItem
                      icon="QuestionMarkCircleIcon"
                      onSelect={() => navigate('/help')}
                    >
                      Help Center
                    </CommandItem>
                    <CommandItem
                      icon="KeyIcon"
                      onSelect={() => {}}
                    >
                      Keyboard Shortcuts
                    </CommandItem>
                  </Command.Group>
                </Command.List>

                {/* Footer */}
                <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded">ESC</kbd>
                    <span>Close</span>
                  </div>
                </div>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CommandItemProps {
  icon: string;
  children: React.ReactNode;
  onSelect: () => void;
  shortcut?: string;
}

function CommandItem({ icon, children, onSelect, shortcut }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted transition-colors data-[selected=true]:bg-muted"
    >
      <div className="flex items-center gap-3">
        <Icon name={icon} size={18} className="text-muted-foreground" />
        <span className="text-foreground text-sm">{children}</span>
      </div>
      {shortcut && (
        <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-muted-foreground bg-background rounded">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
