'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import CommentSystem, { Comment } from '@/components/social/CommentSystem';
import { storyService } from '@/services/storyService';
import { commentService } from '@/services/commentService';
import { useAuth } from '@/contexts/AuthContext';

interface FloatingChatPanelProps {
  storyId: string;
  currentScene: number;
  isPremium: boolean;
}

const FloatingChatPanel = ({ storyId, currentScene, isPremium }: FloatingChatPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    if (!storyId) return;
    setIsLoading(true);
    try {
      const storyComments = await storyService.getStoryComments(storyId);
      setComments(storyComments as any);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  const handlePostComment = async (content: string, parentId?: string) => {
    await commentService.postComment(storyId, content, parentId);
    fetchComments();
  };

  const handleEditComment = async (commentId: string, content: string) => {
    await commentService.editComment(commentId, content);
    fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    await commentService.deleteComment(commentId);
    fetchComments();
  };

  const handleLikeComment = async (commentId: string) => {
    await commentService.likeComment(commentId);
    fetchComments();
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-[250] w-14 h-14 bg-primary rounded-full shadow-elevation-2 flex items-center justify-center hover:scale-110 transition-smooth border-2 border-primary/30"
        >
          <Icon name="ChatBubbleLeftRightIcon" size={24} className="text-primary-foreground" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-error rounded-full flex items-center justify-center text-xs font-bold text-error-foreground">
            {comments.length}
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[250] w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-card/95 backdrop-blur-glass border border-border rounded-lg shadow-elevation-2 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Story Chat</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-muted/50 transition-smooth"
              >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <CommentSystem
              storyId={storyId}
              comments={comments}
              currentUserId={user?.id}
              onPostComment={handlePostComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onLikeComment={handleLikeComment}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatPanel;