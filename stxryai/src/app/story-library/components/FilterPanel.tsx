'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterOptions {
  genres: string[];
  completionStatus: string[];
  minRating: number;
  contentMaturity: string[];
  sortBy: string;
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const FilterPanel = ({
  filters,
  onFilterChange,
  isMobile = false,
  isOpen = true,
  onClose,
}: FilterPanelProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(() => ({
    genres: filters?.genres || [],
    completionStatus: filters?.completionStatus || ['All'],
    minRating: filters?.minRating || 0,
    contentMaturity: filters?.contentMaturity || [],
    sortBy: filters?.sortBy || 'relevance',
  }));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Update local filters when parent filters change
  useEffect(() => {
    if (filters) {
      setLocalFilters({
        genres: filters.genres || [],
        completionStatus: filters.completionStatus || ['All'],
        minRating: filters.minRating || 0,
        contentMaturity: filters.contentMaturity || [],
        sortBy: filters.sortBy || 'relevance',
      });
    }
  }, [filters]);

  if (!isHydrated) {
    return (
      <div className={`${isMobile ? 'fixed inset-0 z-[150]' : 'w-full'}`}>
        <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-muted rounded mb-4" />
          <div className="space-y-3">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const availableGenres = [
    'Horror',
    'Sci-Fi',
    'Fantasy',
    'Romance',
    'Mystery',
    'Adult/18+',
    'Thriller',
    'Adventure',
  ];

  const completionOptions = ['All', 'In Progress', 'Completed', 'New'];
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const handleGenreToggle = (genre: string) => {
    const newGenres = localFilters.genres?.includes(genre)
      ? localFilters.genres.filter((g) => g !== genre)
      : [...(localFilters.genres || []), genre];
    
    const updated = { ...localFilters, genres: newGenres };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleRatingChange = (rating: number) => {
    const updated = { ...localFilters, minRating: rating };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleSortChange = (sortBy: string) => {
    const updated = { ...localFilters, sortBy };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleClearFilters = () => {
    const cleared: FilterOptions = {
      genres: [],
      completionStatus: ['All'],
      minRating: 0,
      contentMaturity: [],
      sortBy: 'relevance',
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount =
    (localFilters.genres?.length || 0) +
    (localFilters.minRating > 0 ? 1 : 0) +
    (localFilters.sortBy !== 'relevance' ? 1 : 0);

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="AdjustmentsHorizontalIcon" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/50 rounded-lg transition-smooth"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Sort By
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                localFilters.sortBy === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Genres
        </label>
        <div className="flex flex-wrap gap-2">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreToggle(genre)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-smooth ${
                localFilters.genres?.includes(genre)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Minimum Rating
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className="transition-smooth"
            >
              <Icon
                name="StarIcon"
                size={24}
                variant={rating <= localFilters.minRating ? 'solid' : 'outline'}
                className={
                  rating <= localFilters.minRating
                    ? 'text-accent' :'text-muted-foreground hover:text-accent'
                }
              />
            </button>
          ))}
          {localFilters.minRating > 0 && (
            <button
              onClick={() => handleRatingChange(0)}
              className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-smooth"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={handleClearFilters}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-smooth"
        >
          <Icon name="XMarkIcon" size={16} />
          <span className="text-sm font-medium">Clear All Filters</span>
        </button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[150]"
              onClick={onClose}
            />
            <div className="fixed inset-y-0 right-0 w-80 max-w-[90vw] bg-card border-l border-border shadow-elevation-2 z-[160] overflow-y-auto">
              <div className="p-6">{content}</div>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {content}
    </div>
  );
};

export default FilterPanel;