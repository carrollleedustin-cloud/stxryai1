'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { slideUp, staggerContainer } from '@/lib/animations/variants';
import type { FilterOptions as ServiceFilterOptions } from '@/services/storyService';

export interface FilterOptions extends ServiceFilterOptions {
  completionStatus: string[];
  contentMaturity: string[];
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
  const sortOptions: { value: ServiceFilterOptions['sortBy']; label: string }[] = [
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

  const handleSortChange = (sortBy: ServiceFilterOptions['sortBy']) => {
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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={slideUp} className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Icon name="AdjustmentsHorizontalIcon" size={20} className="text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded-full"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {isMobile && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-muted/50 rounded-lg transition-smooth"
          >
            <Icon name="XMarkIcon" size={20} />
          </motion.button>
        )}
      </motion.div>

      <motion.div variants={slideUp}>
        <label className="block text-sm font-medium text-foreground mb-3">
          Sort By
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sortOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSortChange(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                localFilters.sortBy === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={slideUp}>
        <label className="block text-sm font-medium text-foreground mb-3">
          Genres
        </label>
        <div className="flex flex-wrap gap-2">
          {availableGenres.map((genre) => (
            <motion.button
              key={genre}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleGenreToggle(genre)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-smooth ${
                localFilters.genres?.includes(genre)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {genre}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={slideUp}>
        <label className="block text-sm font-medium text-foreground mb-3">
          Minimum Rating
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <motion.button
              key={rating}
              whileHover={{ scale: 1.2, rotate: rating <= localFilters.minRating ? 0 : 360 }}
              whileTap={{ scale: 0.9 }}
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
            </motion.button>
          ))}
          <AnimatePresence>
            {localFilters.minRating > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRatingChange(0)}
                className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-smooth"
              >
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-smooth"
          >
            <Icon name="XMarkIcon" size={16} />
            <span className="text-sm font-medium">Clear All Filters</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[150]"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-80 max-w-[90vw] bg-card border-l border-border shadow-elevation-2 z-[160] overflow-y-auto"
            >
              <div className="p-6">{content}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {content}
    </div>
  );
};

export default FilterPanel;