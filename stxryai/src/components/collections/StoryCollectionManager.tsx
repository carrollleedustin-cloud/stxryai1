'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { EmptyState } from '@/components/ui/EmptyState';

interface Collection {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isPublic: boolean;
  storyCount: number;
  createdAt: string;
}

interface Story {
  id: string;
  title: string;
  coverImage?: string;
  genre: string;
  author: string;
}

interface StoryCollectionManagerProps {
  userId: string;
  onCollectionSelect?: (collectionId: string) => void;
}

export function StoryCollectionManager({
  userId,
  onCollectionSelect,
}: StoryCollectionManagerProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    icon: '📚',
    color: 'from-purple-500 to-pink-500',
    isPublic: true,
  });

  const icons = ['📚', '⭐', '🔥', '💖', '🎭', '🚀', '🧙', '👻', '💎', '🌟', '🎨', '📖'];
  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
  ];

  useEffect(() => {
    loadCollections();
  }, [userId]);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await collectionService.getUserCollections(userId);
      // setCollections(data);
      
      // Mock data for now
      setCollections([]);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) return;

    setIsCreating(true);
    try {
      // TODO: Replace with actual API call
      // const collection = await collectionService.createCollection(userId, newCollection);
      // setCollections([...collections, collection]);
      
      setShowCreateModal(false);
      setNewCollection({
        name: '',
        description: '',
        icon: '📚',
        color: 'from-purple-500 to-pink-500',
        isPublic: true,
      });
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
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
          <h2 className="text-2xl font-bold text-foreground">My Collections</h2>
          <p className="text-muted-foreground">Organize your favorite stories</p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center gap-2"
        >
          <Icon name="PlusIcon" size={20} />
          New Collection
        </motion.button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No Collections Yet"
          description="Create collections to organize your favorite stories. Share them with friends or keep them private!"
          action={{
            label: 'Create Your First Collection',
            onClick: () => setShowCreateModal(true),
            variant: 'primary',
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCollectionSelect?.(collection.id)}
              className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${collection.color} flex items-center justify-center text-3xl mb-4`}>
                {collection.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{collection.name}</h3>
              {collection.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {collection.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {collection.storyCount} {collection.storyCount === 1 ? 'story' : 'stories'}
                </span>
                <div className="flex items-center gap-2">
                  {collection.isPublic ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Icon name="GlobeAltIcon" size={16} />
                      Public
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="LockClosedIcon" size={16} />
                      Private
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-4">Create Collection</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Collection Name *
                    </label>
                    <input
                      type="text"
                      value={newCollection.name}
                      onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                      placeholder="My Favorite Stories"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={newCollection.description}
                      onChange={(e) =>
                        setNewCollection({ ...newCollection, description: e.target.value })
                      }
                      placeholder="What's this collection about?"
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Icon</label>
                    <div className="grid grid-cols-6 gap-2">
                      {icons.map((icon) => (
                        <motion.button
                          key={icon}
                          onClick={() => setNewCollection({ ...newCollection, icon })}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                            newCollection.icon === icon
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {icon}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                    <div className="grid grid-cols-3 gap-2">
                      {colors.map((color) => (
                        <motion.button
                          key={color}
                          onClick={() => setNewCollection({ ...newCollection, color })}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`h-12 rounded-lg bg-gradient-to-r ${color} border-2 transition-all ${
                            newCollection.color === color
                              ? 'border-foreground ring-2 ring-primary'
                              : 'border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={newCollection.isPublic}
                      onChange={(e) =>
                        setNewCollection({ ...newCollection, isPublic: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-border"
                    />
                    <label htmlFor="isPublic" className="text-sm text-foreground">
                      Make this collection public
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    onClick={handleCreateCollection}
                    disabled={!newCollection.name.trim() || isCreating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Collection'}
                  </motion.button>
                  <motion.button
                    onClick={() => setShowCreateModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

