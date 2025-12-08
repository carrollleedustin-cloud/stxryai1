'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { staggerContainer, slideUp } from '@/lib/animations/variants';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'story' | 'author' | 'genre';
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  isPremium: boolean;
}

const SearchBar = ({ onSearch, isPremium }: SearchBarProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const mockSuggestions: SearchSuggestion[] = [
      { id: '1', title: 'The Midnight Chronicles', type: 'story' as const },
      { id: '2', title: 'Echoes of Tomorrow', type: 'story' as const },
      { id: '3', title: 'Sarah Mitchell', type: 'author' as const },
      { id: '4', title: 'Horror', type: 'genre' as const },
      { id: '5', title: 'Sci-Fi', type: 'genre' as const },
    ].filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));

    setSuggestions(mockSuggestions);
  }, [query, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="w-full">
        <div className="relative">
          <div className="h-12 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const getTypeIcon = (type: 'story' | 'author' | 'genre'): string => {
    switch (type) {
      case 'story':
        return 'BookOpenIcon';
      case 'author':
        return 'UserIcon';
      case 'genre':
        return 'TagIcon';
      default:
        return 'MagnifyingGlassIcon';
    }
  };

  const getTypeColor = (type: 'story' | 'author' | 'genre'): string => {
    switch (type) {
      case 'story':
        return 'text-primary';
      case 'author':
        return 'text-secondary';
      case 'genre':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <motion.div
          animate={{
            scale: showSuggestions && query ? 1.05 : 1
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-4 top-1/2 -translate-y-1/2"
        >
          <Icon
            name="MagnifyingGlassIcon"
            size={20}
            className="text-muted-foreground"
          />
        </motion.div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search stories, authors, or genres..."
          className="w-full pl-12 pr-12 py-3 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
        />

        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setQuery('');
                onSearch('');
                setSuggestions([]);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <Icon name="XMarkIcon" size={16} className="text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl z-[100] overflow-hidden"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="py-2"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.id}
                  variants={slideUp}
                  whileHover={{ backgroundColor: 'hsl(var(--color-muted) / 0.5)', x: 4 }}
                  onClick={() => handleSearch(suggestion.title)}
                  className="w-full flex items-center space-x-3 px-4 py-3 transition-colors text-left"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      name={getTypeIcon(suggestion.type)}
                      size={18}
                      className={getTypeColor(suggestion.type)}
                    />
                  </motion.div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">
                      {suggestion.title}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground capitalize">
                      {suggestion.type}
                    </span>
                  </div>
                  <Icon name="ArrowRightIcon" size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </motion.div>

            {isPremium && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="border-t border-border px-4 py-2 bg-muted/30"
              >
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 text-xs font-medium text-primary hover:text-secondary transition-colors"
                >
                  <Icon name="BookmarkIcon" size={14} />
                  <span>Save this search</span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;