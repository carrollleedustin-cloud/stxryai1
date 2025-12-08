'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

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
      { id: '1', title: 'The Midnight Chronicles', type: 'story' },
      { id: '2', title: 'Echoes of Tomorrow', type: 'story' },
      { id: '3', title: 'Sarah Mitchell', type: 'author' },
      { id: '4', title: 'Horror', type: 'genre' },
      { id: '5', title: 'Sci-Fi', type: 'genre' },
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

  const getTypeIcon = (type: SearchSuggestion['type']) => {
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

  const getTypeColor = (type: SearchSuggestion['type']) => {
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
      <div className="relative">
        <Icon
          name="MagnifyingGlassIcon"
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search stories, authors, or genres..."
          className="w-full pl-12 pr-12 py-3 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onSearch('');
              setSuggestions([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-smooth"
          >
            <Icon name="XMarkIcon" size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-elevation-2 z-[100] overflow-hidden">
          <div className="py-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSearch(suggestion.title)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-smooth text-left"
              >
                <Icon
                  name={getTypeIcon(suggestion.type)}
                  size={18}
                  className={getTypeColor(suggestion.type)}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">
                    {suggestion.title}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground capitalize">
                    {suggestion.type}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {isPremium && (
            <div className="border-t border-border px-4 py-2 bg-muted/30">
              <button className="flex items-center space-x-2 text-xs font-medium text-primary hover:text-secondary transition-smooth">
                <Icon name="BookmarkIcon" size={14} />
                <span>Save this search</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;