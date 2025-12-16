import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Command } from 'cmdk';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from '@/components/ui/AppIcon';
import { storyService } from '@/services/storyService';
import { userService } from '@/services/userService';
import { Story, UserProfile } from '@/types/database';

// Custom hook for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth();
  
  const [storyResults, setStoryResults] = useState<Story[]>([]);
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setStoryResults([]);
      setUserResults([]);
    }
  }, [open]);

  useEffect(() => {
    async function fetchData() {
      if (debouncedSearch.length < 2) {
        setStoryResults([]);
        setUserResults([]);
        return;
      }

      setLoading(true);
      const [stories, users] = await Promise.all([
        storyService.getFilteredStories({ searchQuery: debouncedSearch, pageSize: 5 }),
        userService.searchUsers(debouncedSearch, 5),
      ]);
      setStoryResults(stories);
      setUserResults(users as UserProfile[]);
      setLoading(false);
    }
    fetchData();
  }, [debouncedSearch]);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigate = useCallback((path: string) => {
    router.push(path);
    setOpen(false);
  }, [router]);

  const toggleTheme = useCallback(() => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  }, [theme, setTheme]);

  if (!mounted) return null;

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />
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
                <div className="flex items-center border-b border-border px-4">
                  <Icon name="MagnifyingGlassIcon" size={20} className="text-muted-foreground" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search stories, users, or commands..."
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
                  
                  {loading && <div className="py-6 text-center text-muted-foreground">Searching...</div>}

                  {!loading && storyResults.length > 0 && (
                    <Command.Group
                      heading="Stories"
                      className="text-xs font-semibold text-muted-foreground px-2 py-2"
                    >
                      {storyResults.map(story => (
                        <CommandItem
                          key={story.id}
                          icon="BookOpenIcon"
                          onSelect={() => navigate(`/story-reader?storyId=${story.id}`)}
                        >
                          {story.title}
                        </CommandItem>
                      ))}
                    </Command.Group>
                  )}

                  {!loading && userResults.length > 0 && (
                    <Command.Group
                      heading="Users"
                      className="text-xs font-semibold text-muted-foreground px-2 py-2"
                    >
                      {userResults.map(user => (
                        <CommandItem
                          key={user.id}
                          icon="UserCircleIcon"
                          onSelect={() => navigate(`/user-profile/${user.id}`)}
                        >
                          {user.display_name} <span className="text-muted-foreground">@{user.username}</span>
                        </CommandItem>
                      ))}
                    </Command.Group>
                  )}

                  {!debouncedSearch && (
                    <>
                      {isAdmin && (
                        <Command.Group
                          heading="Admin"
                          className="text-xs font-semibold text-muted-foreground px-2 py-2"
                        >
                          <CommandItem icon="ShieldCheckIcon" onSelect={() => navigate('/admin')}>Admin Dashboard</CommandItem>
                          <CommandItem icon="FlagIcon" onSelect={() => navigate('/admin/reports')}>View Reports</CommandItem>
                        </Command.Group>
                      )}
                      <Command.Group
                        heading="Navigation"
                        className="text-xs font-semibold text-muted-foreground px-2 py-2"
                      >
                        <CommandItem icon="HomeIcon" onSelect={() => navigate('/')}>Home</CommandItem>
                        <CommandItem icon="BookOpenIcon" onSelect={() => navigate('/story-library')}>Story Library</CommandItem>
                        <CommandItem icon="UserCircleIcon" onSelect={() => navigate('/user-dashboard')}>Dashboard</CommandItem>
                        <CommandItem icon="Cog6ToothIcon" onSelect={() => navigate('/settings')}>Settings</CommandItem>
                      </Command.Group>
                      <Command.Group
                        heading="Actions"
                        className="text-xs font-semibold text-muted-foreground px-2 py-2"
                      >
                        <CommandItem icon="PencilSquareIcon" onSelect={() => navigate('/story-creation-studio')}>Create New Story</CommandItem>
                      </Command.Group>
                      <Command.Group
                        heading="Appearance"
                        className="text-xs font-semibold text-muted-foreground px-2 py-2"
                      >
                        <CommandItem
                          icon={theme === 'dark' ? 'MoonIcon' : theme === 'light' ? 'SunIcon' : 'ComputerDesktopIcon'}
                          onSelect={toggleTheme}
                        >
                          Toggle Theme ({theme})
                        </CommandItem>
                      </Command.Group>
                      <Command.Group
                        heading="Help & Support"
                        className="text-xs font-semibold text-muted-foreground px-2 py-2"
                      >
                        <CommandItem icon="QuestionMarkCircleIcon" onSelect={() => navigate('/help')}>Help Center</CommandItem>
                        <CommandItem icon="KeyIcon" onSelect={() => {}}>Keyboard Shortcuts</CommandItem>
                      </Command.Group>
                    </>
                  )}
                </Command.List>
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
