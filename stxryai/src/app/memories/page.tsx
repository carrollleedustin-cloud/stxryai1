'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Sparkles, Star, Heart, Filter, Grid, List,
  Calendar, Award, Plus, ChevronDown, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  readingMemoriesService, 
  ReadingMemory, 
  MemoryCollection,
  AnniversaryReminder
} from '@/services/readingMemoriesService';
import { ReadingMemoryCard } from '@/components/memories/ReadingMemoryCard';

type FilterType = 'all' | 'choice' | 'quote' | 'character' | 'ending' | 'milestone' | 'emotion';
type ViewType = 'grid' | 'timeline';

export default function MemoriesPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<ReadingMemory[]>([]);
  const [collections, setCollections] = useState<MemoryCollection[]>([]);
  const [anniversaries, setAnniversaries] = useState<AnniversaryReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [view, setView] = useState<ViewType>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        const [memoriesData, collectionsData, anniversaryData] = await Promise.all([
          readingMemoriesService.getUserMemories(user.id, { limit: 50 }),
          readingMemoriesService.getUserCollections(user.id),
          readingMemoriesService.getAnniversaryReminders(user.id),
        ]);
        
        setMemories(memoriesData.memories);
        setCollections(collectionsData);
        setAnniversaries(anniversaryData);
      } catch (error) {
        console.error('Error loading memories:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleDelete = useCallback(async (memoryId: string) => {
    if (!user) return;
    const success = await readingMemoriesService.deleteMemory(memoryId, user.id);
    if (success) {
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    }
  }, [user]);

  const handleToggleVisibility = useCallback(async (memoryId: string, isPublic: boolean) => {
    if (!user) return;
    const success = await readingMemoriesService.updateMemoryVisibility(memoryId, user.id, isPublic);
    if (success) {
      setMemories(prev => prev.map(m => 
        m.id === memoryId ? { ...m, isPublic } : m
      ));
    }
  }, [user]);

  const filteredMemories = filter === 'all' 
    ? memories 
    : memories.filter(m => m.memoryType === filter);

  const filterOptions: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Memories', icon: Sparkles },
    { id: 'choice', label: 'Choices', icon: Star },
    { id: 'quote', label: 'Quotes', icon: BookOpen },
    { id: 'character', label: 'Characters', icon: Heart },
    { id: 'ending', label: 'Endings', icon: Award },
    { id: 'milestone', label: 'Milestones', icon: Star },
    { id: 'emotion', label: 'Emotions', icon: Heart },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-void-950 via-purple-950/10 to-void-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-void-950 via-purple-950/10 to-void-950 pb-20">
      {/* Header */}
      <header className="border-b border-white/10 bg-void-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-3 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-xl"
              >
                <BookOpen className="w-7 h-7 text-amber-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Reading Memories
                </h1>
                <p className="text-void-400 text-sm">
                  {memories.length} memorable moments captured
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    view === 'grid' ? 'bg-white/10 text-white' : 'text-void-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('timeline')}
                  className={`p-2 rounded-lg transition-colors ${
                    view === 'timeline' ? 'bg-white/10 text-white' : 'text-void-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  showFilters || filter !== 'all'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-white/5 text-void-400 hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-4">
                  {filterOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setFilter(option.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filter === option.id
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-white/5 text-void-400 hover:text-white'
                      }`}
                    >
                      <option.icon className="w-3 h-3" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8">
        {/* Anniversary reminders */}
        {anniversaries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-400" />
              Remember When...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anniversaries.slice(0, 2).map((reminder) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-4 border border-pink-500/20"
                >
                  <p className="text-sm text-pink-300 mb-2">{reminder.message}</p>
                  <ReadingMemoryCard
                    memory={reminder.memory}
                    variant="compact"
                    showActions={false}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Collections */}
        {collections.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              Collections
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  whileHover={{ scale: 1.02 }}
                  className="shrink-0 w-48 bg-white/5 rounded-xl p-4 border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
                >
                  <div className="w-full h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-3 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="font-medium text-white truncate">{collection.name}</p>
                  <p className="text-xs text-void-400">{collection.memoryIds.length} memories</p>
                </motion.div>
              ))}
              
              {/* Create collection button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="shrink-0 w-48 bg-white/5 rounded-xl p-4 border border-dashed border-white/20 cursor-pointer hover:border-purple-500/50 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <Plus className="w-8 h-8 text-void-400" />
                <p className="text-sm text-void-400">New Collection</p>
              </motion.button>
            </div>
          </div>
        )}

        {/* Memories */}
        {filteredMemories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center"
            >
              <BookOpen className="w-10 h-10 text-amber-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">No Memories Yet</h2>
            <p className="text-void-400 max-w-md mx-auto">
              {filter === 'all'
                ? 'Start reading to capture memorable moments automatically, or create memories manually from your favorite story moments.'
                : `No ${filter} memories found. Try a different filter or keep reading!`}
            </p>
          </motion.div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ReadingMemoryCard
                  memory={memory}
                  onDelete={handleDelete}
                  onToggleVisibility={handleToggleVisibility}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-amber-500/50" />
            
            <div className="space-y-4 pl-8">
              {filteredMemories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ReadingMemoryCard
                    memory={memory}
                    variant="timeline"
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
