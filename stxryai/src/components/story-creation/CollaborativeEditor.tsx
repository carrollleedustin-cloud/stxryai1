'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
}

interface CollaborativeEditorProps {
  storyId: string;
  chapterId: string;
  content: string;
  onContentChange: (content: string) => void;
  collaborators: Collaborator[];
  currentUserId: string;
  onInvite?: () => void;
}

export function CollaborativeEditor({
  storyId,
  chapterId,
  content,
  onContentChange,
  collaborators,
  currentUserId,
  onInvite,
}: CollaborativeEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [isTyping, setIsTyping] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent);
    setIsTyping(true);

    // Debounce content updates
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onContentChange(newContent);
    }, 500);
  };

  const activeCollaborators = collaborators.filter((c) => c.id !== currentUserId);

  return (
    <div className="space-y-4">
      {/* Collaborator Bar */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Icon name="UsersIcon" size={20} className="text-primary" />
            <span className="font-medium text-foreground">
              {collaborators.length} {collaborators.length === 1 ? 'Collaborator' : 'Collaborators'}
            </span>
          </div>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 text-sm text-muted-foreground"
            >
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ●
              </motion.div>
              <span>Syncing...</span>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCollaborators.map((collab) => (
            <motion.div
              key={collab.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: collab.color }}
              >
                {collab.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {collab.name}
              </div>
            </motion.div>
          ))}
          {onInvite && (
            <motion.button
              onClick={onInvite}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Icon name="UserPlusIcon" size={16} />
              Invite
            </motion.button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full min-h-[400px] p-6 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm leading-relaxed"
          placeholder="Start writing your story... Collaborators can see your changes in real-time!"
        />
        
        {/* Cursor Indicators */}
        <AnimatePresence>
          {activeCollaborators.map((collab) => {
            if (!collab.cursor) return null;
            return (
              <motion.div
                key={collab.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${collab.cursor.column * 8}px`,
                  top: `${collab.cursor.line * 24}px`,
                }}
              >
                <div
                  className="w-0.5 h-5"
                  style={{ backgroundColor: collab.color }}
                />
                <div
                  className="absolute top-0 left-0 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
                  style={{ backgroundColor: collab.color }}
                >
                  {collab.name}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Real-time Status */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span>Connected</span>
          </div>
          <span>{localContent.length} characters</span>
          <span>{localContent.split('\n').length} lines</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="CloudArrowUpIcon" size={16} />
          <span>Auto-saved</span>
        </div>
      </div>
    </div>
  );
}

