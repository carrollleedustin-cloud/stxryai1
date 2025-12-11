'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  coverImage?: string;
  genre: string;
  duration: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  stories: Story[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StoryCollectionsProps {
  collections?: Collection[];
  onCreateCollection?: (name: string, description: string) => void;
  onAddToCollection?: (collectionId: string, storyId: string) => void;
  onRemoveFromCollection?: (collectionId: string, storyId: string) => void;
  onDeleteCollection?: (collectionId: string) => void;
}

export default function StoryCollections({
  collections = [],
  onCreateCollection,
  onAddToCollection,
  onRemoveFromCollection,
  onDeleteCollection,
}: StoryCollectionsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">My Collections</h2>
          <p className="text-gray-400">Organize your favorite stories</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">➕</span>
            New Collection
          </div>
        </motion.button>
      </div>

      {/* Collections Grid */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
              onClick={() => setSelectedCollection(collection)}
              onDelete={onDeleteCollection}
            />
          ))}
        </div>
      ) : (
        <EmptyCollections onCreate={() => setShowCreateModal(true)} />
      )}

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateCollectionModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(name, description) => {
              onCreateCollection?.(name, description);
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Collection Detail View */}
      <AnimatePresence>
        {selectedCollection && (
          <CollectionDetailModal
            collection={selectedCollection}
            onClose={() => setSelectedCollection(null)}
            onRemoveStory={(storyId) => {
              onRemoveFromCollection?.(selectedCollection.id, storyId);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Collection Card Component
function CollectionCard({
  collection,
  index,
  onClick,
  onDelete,
}: {
  collection: Collection;
  index: number;
  onClick: () => void;
  onDelete?: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <div
        onClick={onClick}
        className={`bg-gradient-to-br ${collection.color} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
      >
        {/* Menu Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-all"
          >
            ⋮
          </button>

          {showMenu && (
            <div className="absolute top-10 right-0 bg-gray-900 rounded-lg shadow-xl border border-white/10 py-2 min-w-[150px] z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-all"
              >
                📖 View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Edit functionality
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-all"
              >
                ✏️ Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this collection?')) {
                    onDelete?.(collection.id);
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 transition-all"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className="text-6xl mb-4">{collection.icon}</div>

        {/* Name */}
        <h3 className="text-xl font-bold text-white mb-2">{collection.name}</h3>

        {/* Description */}
        <p className="text-white/80 text-sm mb-4 line-clamp-2">
          {collection.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-white/70 text-sm">
          <span>{collection.stories.length} stories</span>
          <span>{collection.isPublic ? '🌐 Public' : '🔒 Private'}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyCollections({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
      <div className="text-6xl mb-4">📚</div>
      <h3 className="text-xl font-semibold text-white mb-2">No Collections Yet</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Create collections to organize your favorite stories into playlists. Reading lists, favorites, or themed collections!
      </p>
      <button
        onClick={onCreate}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
      >
        Create Your First Collection
      </button>
    </div>
  );
}

// Create Collection Modal
function CreateCollectionModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📚');
  const [selectedColor, setSelectedColor] = useState('from-purple-600 to-pink-600');
  const [isPublic, setIsPublic] = useState(false);

  const icons = ['📚', '⭐', '❤️', '🔥', '✨', '🎭', '🎨', '🌟', '💎', '🏆', '🎯', '🌈'];
  const colors = [
    'from-purple-600 to-pink-600',
    'from-blue-600 to-cyan-600',
    'from-green-600 to-emerald-600',
    'from-orange-600 to-red-600',
    'from-yellow-600 to-orange-600',
    'from-indigo-600 to-purple-600',
  ];

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name, description);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Create Collection</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Collection Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Favorite Mysteries"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-600 focus:outline-none"
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of the best mystery stories..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-600 focus:outline-none resize-none"
              maxLength={200}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Choose an Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-full aspect-square rounded-lg text-2xl flex items-center justify-center transition-all ${
                    selectedIcon === icon
                      ? 'bg-purple-600 scale-110'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Choose a Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`h-12 rounded-lg bg-gradient-to-r ${color} transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-105'
                      : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <div className="font-medium text-white">Public Collection</div>
              <div className="text-sm text-gray-400">Allow others to discover this collection</div>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-14 h-7 rounded-full transition-all ${
                isPublic ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all ${
                isPublic ? 'left-8' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Collection
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Collection Detail Modal
function CollectionDetailModal({
  collection,
  onClose,
  onRemoveStory,
}: {
  collection: Collection;
  onClose: () => void;
  onRemoveStory: (storyId: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${collection.color} rounded-xl p-6 mb-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{collection.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{collection.name}</h3>
                <p className="text-white/80">{collection.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stories List */}
        <div className="flex-1 overflow-y-auto">
          {collection.stories.length > 0 ? (
            <div className="space-y-3">
              {collection.stories.map((story) => (
                <div
                  key={story.id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900 to-indigo-900 flex-shrink-0 overflow-hidden">
                    {story.coverImage ? (
                      <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{story.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <span>{story.genre}</span>
                      <span>•</span>
                      <span>{story.duration}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/story-reader?id=${story.id}`}>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all opacity-0 group-hover:opacity-100">
                        Read
                      </button>
                    </Link>
                    <button
                      onClick={() => onRemoveStory(story.id)}
                      className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📚</div>
              <p>No stories in this collection yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
