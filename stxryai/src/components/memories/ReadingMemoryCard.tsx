'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Quote, User, Flag, Star, Bookmark,
  Share2, Eye, EyeOff, Trash2, MoreHorizontal
} from 'lucide-react';
import { ReadingMemory, readingMemoriesService } from '@/services/readingMemoriesService';

interface ReadingMemoryCardProps {
  memory: ReadingMemory;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, isPublic: boolean) => void;
  showActions?: boolean;
  variant?: 'full' | 'compact' | 'timeline';
}

// Emotion icons
const emotionIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  joy: { icon: '✨', label: 'Joy' },
  sadness: { icon: '😢', label: 'Sadness' },
  excitement: { icon: '🎉', label: 'Excitement' },
  fear: { icon: '😨', label: 'Fear' },
  love: { icon: '💕', label: 'Love' },
  triumph: { icon: '🏆', label: 'Triumph' },
  loss: { icon: '💔', label: 'Loss' },
  wonder: { icon: '🌟', label: 'Wonder' },
};

// Memory type icons
const typeIcons: Record<string, React.ElementType> = {
  choice: Flag,
  quote: Quote,
  character: User,
  ending: Star,
  milestone: Star,
  emotion: Heart,
};

export function ReadingMemoryCard({
  memory,
  onDelete,
  onToggleVisibility,
  showActions = true,
  variant = 'full',
}: ReadingMemoryCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const TypeIcon = typeIcons[memory.memoryType] || Bookmark;
  const emotion = emotionIcons[memory.emotionalTone];

  const handleShare = () => {
    const { shareText, shareUrl } = readingMemoriesService.generateMemoryCard(memory);
    
    if (navigator.share) {
      navigator.share({
        title: memory.title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    }
  };

  const handleLike = async () => {
    if (!isLiked) {
      await readingMemoriesService.likeMemory(memory.id, memory.userId);
      setIsLiked(true);
    }
  };

  // Timeline variant (minimal)
  if (variant === 'timeline') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex gap-4 pl-8"
      >
        {/* Timeline dot */}
        <div
          className="absolute left-0 top-2 w-4 h-4 rounded-full border-2"
          style={{ 
            borderColor: memory.accentColor,
            backgroundColor: `${memory.accentColor}20`,
          }}
        />
        
        <div className="flex-1 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{emotion?.icon}</span>
            <span className="text-sm font-medium text-white">{memory.title}</span>
          </div>
          <p className="text-xs text-void-400">
            {memory.storyTitle} • {new Date(memory.capturedAt).toLocaleDateString()}
          </p>
          {memory.quoteText && (
            <p className="text-xs text-void-300 mt-2 italic border-l-2 pl-2" style={{ borderColor: memory.accentColor }}>
              "{memory.quoteText.substring(0, 100)}..."
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative rounded-xl p-3 cursor-pointer transition-all"
        style={{ 
          backgroundColor: `${memory.backgroundColor}15`,
          borderLeft: `3px solid ${memory.accentColor}`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${memory.accentColor}20` }}
          >
            <span className="text-xl">{emotion?.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{memory.title}</p>
            <p className="text-xs text-void-400 truncate">{memory.storyTitle}</p>
          </div>
          <span className="text-xs text-void-500">
            {new Date(memory.capturedAt).toLocaleDateString()}
          </span>
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${memory.backgroundColor}, ${memory.backgroundColor}80)`,
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: `${memory.accentColor}20` }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${memory.accentColor}30` }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl">{emotion?.icon}</span>
            </motion.div>
            <div>
              <h3 className="font-bold" style={{ color: memory.accentColor }}>
                {memory.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <TypeIcon className="w-3 h-3" style={{ color: memory.accentColor }} />
                <span className="text-xs text-gray-600">{emotion?.label}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">
                  {Math.round(memory.intensity)}% intensity
                </span>
              </div>
            </div>
          </div>

          {/* Actions menu */}
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-black/10 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10"
                >
                  <button
                    onClick={handleShare}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  {onToggleVisibility && (
                    <button
                      onClick={() => {
                        onToggleVisibility(memory.id, !memory.isPublic);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      {memory.isPublic ? (
                        <>
                          <EyeOff className="w-4 h-4" /> Make Private
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" /> Make Public
                        </>
                      )}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(memory.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-700 mb-4">{memory.description}</p>

        {/* Quote if present */}
        {memory.quoteText && (
          <div
            className="relative p-4 rounded-xl mb-4"
            style={{ backgroundColor: `${memory.accentColor}10` }}
          >
            <Quote 
              className="absolute top-2 left-2 w-6 h-6 opacity-20" 
              style={{ color: memory.accentColor }} 
            />
            <p className="text-sm italic text-gray-800 pl-6">
              "{memory.quoteText}"
            </p>
          </div>
        )}

        {/* Choice text if present */}
        {memory.choiceText && (
          <div className="flex items-center gap-2 p-3 bg-black/5 rounded-lg mb-4">
            <Flag className="w-4 h-4" style={{ color: memory.accentColor }} />
            <p className="text-sm text-gray-700">Choice: "{memory.choiceText}"</p>
          </div>
        )}

        {/* Character if present */}
        {memory.characterName && (
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4" style={{ color: memory.accentColor }} />
            <p className="text-sm text-gray-700">Character: {memory.characterName}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: `${memory.accentColor}20` }}>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            <span className="font-medium">{memory.storyTitle}</span>
            {memory.chapterTitle && (
              <span> • {memory.chapterTitle}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {memory.isPublic && (
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-pink-500 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
              {memory.likes + (isLiked ? 1 : 0)}
            </button>
          )}
          <span className="text-xs text-gray-400">
            {new Date(memory.capturedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="h-1" style={{ backgroundColor: `${memory.accentColor}20` }}>
        <div
          className="h-full"
          style={{ 
            width: `${memory.readingProgress}%`,
            backgroundColor: memory.accentColor,
          }}
        />
      </div>
    </motion.div>
  );
}

export default ReadingMemoryCard;
