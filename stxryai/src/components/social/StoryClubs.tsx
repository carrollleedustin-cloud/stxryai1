'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { EmptyState } from '@/components/ui/EmptyState';

interface Club {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  memberCount: number;
  storyCount: number;
  isPublic: boolean;
  tags: string[];
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface StoryClubsProps {
  userId: string;
  onClubSelect?: (clubId: string) => void;
  onCreateClub?: () => void;
}

export function StoryClubs({ userId, onClubSelect, onCreateClub }: StoryClubsProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'joined' | 'public'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClubs();
  }, [userId, filter]);

  const loadClubs = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await clubService.getClubs(userId, filter);
      // setClubs(data);
      
      // Mock data for now
      setClubs([]);
    } catch (error) {
      console.error('Failed to load clubs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>👥</span>
            Story Clubs
          </h2>
          <p className="text-muted-foreground">Join reading groups and discuss stories together</p>
        </div>
        {onCreateClub && (
          <motion.button
            onClick={onCreateClub}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <Icon name="PlusIcon" size={20} />
            Create Club
          </motion.button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {(['all', 'joined', 'public'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Icon
            name="MagnifyingGlassIcon"
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clubs..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Clubs Found"
          description={
            searchQuery
              ? 'Try adjusting your search terms'
              : filter === 'joined'
                ? "You haven't joined any clubs yet"
                : 'No clubs match your criteria'
          }
          action={
            onCreateClub
              ? {
                  label: 'Create Your First Club',
                  onClick: onCreateClub,
                  variant: 'primary',
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClubs.map((club, index) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onClubSelect?.(club.id)}
              className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
            >
              {/* Cover Image */}
              {club.coverImage ? (
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={club.coverImage}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-xs font-medium">
                    {club.isPublic ? 'Public' : 'Private'}
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                  👥
                </div>
              )}

              <div className="p-4">
                <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {club.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{club.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {club.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Icon name="UsersIcon" size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{club.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="BookOpenIcon" size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{club.storyCount} stories</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

