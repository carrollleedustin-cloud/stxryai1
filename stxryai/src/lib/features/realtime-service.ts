/**
 * Real-time Features Service
 * WebSocket-based real-time notifications, live updates, and collaborative features
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeEvent {
  type: 'notification' | 'update' | 'message' | 'presence' | 'achievement';
  payload: any;
  timestamp: Date;
  userId?: string;
}

interface PresenceState {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'reading' | 'writing';
  currentActivity?: string;
  lastSeen: Date;
}

interface LiveNotification {
  id: string;
  type: 'comment' | 'like' | 'follower' | 'achievement' | 'story_update';
  message: string;
  actionUrl?: string;
  read: boolean;
  timestamp: Date;
}

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventHandlers: Map<string, Set<(event: RealtimeEvent) => void>> = new Map();
  private presenceUsers: Map<string, PresenceState> = new Map();

  /**
   * Subscribe to user notifications
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: LiveNotification) => void
  ): () => void {
    const channelName = `notifications:${userId}`;

    // Create mock subscription for development
    const mockSubscription = this.createMockNotificationStream(userId, onNotification);

    return () => {
      // Cleanup
      if (mockSubscription) {
        clearInterval(mockSubscription);
      }
    };
  }

  /**
   * Subscribe to story updates
   */
  subscribeToStory(
    storyId: string,
    callbacks: {
      onChapterAdded?: (chapter: any) => void;
      onCommentAdded?: (comment: any) => void;
      onReaderJoined?: (reader: any) => void;
    }
  ): () => void {
    const channelName = `story:${storyId}`;

    // Mock implementation - replace with actual Supabase realtime
    const handlers = new Set<(event: RealtimeEvent) => void>();

    if (callbacks.onChapterAdded) {
      handlers.add((event) => {
        if (event.type === 'update' && event.payload.type === 'chapter_added') {
          callbacks.onChapterAdded!(event.payload.data);
        }
      });
    }

    if (callbacks.onCommentAdded) {
      handlers.add((event) => {
        if (event.type === 'update' && event.payload.type === 'comment_added') {
          callbacks.onCommentAdded!(event.payload.data);
        }
      });
    }

    this.eventHandlers.set(channelName, handlers);

    return () => {
      this.eventHandlers.delete(channelName);
    };
  }

  /**
   * Subscribe to user presence (online/offline status)
   */
  subscribeToPresence(
    roomId: string,
    onPresenceChange: (users: PresenceState[]) => void
  ): () => void {
    const channelName = `presence:${roomId}`;

    // Mock presence updates
    const mockInterval = setInterval(() => {
      const users = Array.from(this.presenceUsers.values());
      onPresenceChange(users);
    }, 5000);

    return () => {
      clearInterval(mockInterval);
    };
  }

  /**
   * Update user presence status
   */
  async updatePresence(userId: string, state: Partial<PresenceState>): Promise<void> {
    const existing = this.presenceUsers.get(userId) || {
      userId,
      username: 'User',
      status: 'online',
      lastSeen: new Date(),
    };

    this.presenceUsers.set(userId, {
      ...existing,
      ...state,
      lastSeen: new Date(),
    });
  }

  /**
   * Send real-time message to room
   */
  async sendMessage(roomId: string, message: any): Promise<void> {
    const event: RealtimeEvent = {
      type: 'message',
      payload: message,
      timestamp: new Date(),
    };

    this.broadcastEvent(roomId, event);
  }

  /**
   * Subscribe to collaborative writing session
   */
  subscribeToCollabSession(
    sessionId: string,
    callbacks: {
      onUserJoined?: (user: PresenceState) => void;
      onUserLeft?: (userId: string) => void;
      onTextChange?: (change: any) => void;
      onCursorMove?: (cursor: any) => void;
    }
  ): () => void {
    const channelName = `collab:${sessionId}`;

    // Mock collaborative editing
    const handlers = new Set<(event: RealtimeEvent) => void>();

    if (callbacks.onUserJoined) {
      handlers.add((event) => {
        if (event.type === 'presence' && event.payload.action === 'join') {
          callbacks.onUserJoined!(event.payload.user);
        }
      });
    }

    this.eventHandlers.set(channelName, handlers);

    return () => {
      this.eventHandlers.delete(channelName);
    };
  }

  /**
   * Broadcast typing indicator
   */
  async broadcastTyping(roomId: string, userId: string, isTyping: boolean): Promise<void> {
    const event: RealtimeEvent = {
      type: 'update',
      payload: { type: 'typing', userId, isTyping },
      timestamp: new Date(),
    };

    this.broadcastEvent(roomId, event);
  }

  /**
   * Subscribe to live story reading session
   */
  subscribeToReadingSession(
    storyId: string,
    callbacks: {
      onReaderProgress?: (progress: any) => void;
      onChoiceMade?: (choice: any) => void;
      onReaction?: (reaction: any) => void;
    }
  ): () => void {
    const channelName = `reading:${storyId}`;

    const handlers = new Set<(event: RealtimeEvent) => void>();

    if (callbacks.onChoiceMade) {
      handlers.add((event) => {
        if (event.type === 'update' && event.payload.type === 'choice') {
          callbacks.onChoiceMade!(event.payload.data);
        }
      });
    }

    this.eventHandlers.set(channelName, handlers);

    return () => {
      this.eventHandlers.delete(channelName);
    };
  }

  /**
   * Get current readers count for a story
   */
  async getCurrentReaders(storyId: string): Promise<number> {
    // Mock implementation - return random number for demo
    return Math.floor(Math.random() * 50) + 1;
  }

  /**
   * Private helper methods
   */

  private broadcastEvent(channelName: string, event: RealtimeEvent): void {
    const handlers = this.eventHandlers.get(channelName);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }
  }

  private createMockNotificationStream(
    userId: string,
    onNotification: (notification: LiveNotification) => void
  ): NodeJS.Timeout | null {
    // Simulate random notifications for development
    const mockNotifications: Omit<LiveNotification, 'id' | 'timestamp'>[] = [
      {
        type: 'comment',
        message: 'Someone commented on your story!',
        actionUrl: '/stories/123',
        read: false,
      },
      {
        type: 'follower',
        message: 'You have a new follower!',
        actionUrl: '/profile',
        read: false,
      },
      {
        type: 'achievement',
        message: 'Achievement unlocked: Bookworm!',
        read: false,
      },
    ];

    // Send a random notification every 30-60 seconds
    const interval = setInterval(
      () => {
        const randomNotif = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        onNotification({
          ...randomNotif,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
        });
      },
      Math.random() * 30000 + 30000
    );

    return interval;
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.channels.forEach((channel) => {
      // channel.unsubscribe();
    });
    this.channels.clear();
    this.eventHandlers.clear();
    this.presenceUsers.clear();
  }
}

/**
 * Collaborative Writing Service
 * Enable multiple users to write stories together in real-time
 */
export class CollaborativeWritingService {
  private activeSessions: Map<string, CollabSession> = new Map();

  /**
   * Create a collaborative writing session
   */
  async createSession(
    storyId: string,
    creatorId: string,
    permissions: CollabPermissions
  ): Promise<string> {
    const sessionId = this.generateSessionId();

    const session: CollabSession = {
      id: sessionId,
      storyId,
      creatorId,
      participants: [{ userId: creatorId, role: 'owner', joinedAt: new Date() }],
      permissions,
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.activeSessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Join a collaborative session
   */
  async joinSession(sessionId: string, userId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    const existing = session.participants.find((p) => p.userId === userId);
    if (existing) return true;

    session.participants.push({
      userId,
      role: 'contributor',
      joinedAt: new Date(),
    });

    return true;
  }

  /**
   * Share edit with collaborators
   */
  async shareEdit(
    sessionId: string,
    userId: string,
    edit: TextEdit
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.lastActivity = new Date();

    // In production, this would broadcast to all participants via WebSocket
    console.log(`User ${userId} made edit in session ${sessionId}:`, edit);
  }

  /**
   * Get session participants
   */
  getParticipants(sessionId: string): Participant[] {
    const session = this.activeSessions.get(sessionId);
    return session?.participants || [];
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

interface CollabSession {
  id: string;
  storyId: string;
  creatorId: string;
  participants: Participant[];
  permissions: CollabPermissions;
  createdAt: Date;
  lastActivity: Date;
}

interface Participant {
  userId: string;
  role: 'owner' | 'editor' | 'contributor' | 'viewer';
  joinedAt: Date;
}

interface CollabPermissions {
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  requireApproval: boolean;
}

interface TextEdit {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number;
}

// Export singleton instances
export const realtimeService = new RealtimeService();
export const collaborativeWritingService = new CollaborativeWritingService();
