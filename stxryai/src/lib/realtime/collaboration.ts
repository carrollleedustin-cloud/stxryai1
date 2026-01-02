/**
 * Real-Time Collaboration System
 * Enables collaborative story editing with presence awareness and conflict resolution
 */

import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface CollaboratorPresence {
  userId: string;
  username: string;
  avatar: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
  selection?: {
    start: number;
    end: number;
  };
  lastActive: Date;
}

export interface CollaborativeEdit {
  id: string;
  userId: string;
  storyId: string;
  chapterId: string;
  operation: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  timestamp: Date;
  version: number;
}

export interface ConflictResolution {
  localEdit: CollaborativeEdit;
  remoteEdit: CollaborativeEdit;
  resolved: CollaborativeEdit;
  strategy: 'local-wins' | 'remote-wins' | 'merge' | 'manual';
}

// ============================================================================
// COLLABORATION MANAGER
// ============================================================================

export class CollaborationManager {
  private supabase: ReturnType<typeof createClient>;
  private channel: RealtimeChannel | null = null;
  private presence: Map<string, CollaboratorPresence> = new Map();
  private editHistory: CollaborativeEdit[] = [];
  private currentVersion: number = 0;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Join collaboration session
   */
  async joinSession(
    storyId: string,
    chapterId: string,
    user: {
      id: string;
      username: string;
      avatar: string;
    }
  ): Promise<void> {
    const channelName = `story:${storyId}:chapter:${chapterId}`;

    this.channel = this.supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel!.presenceState();
        this.updatePresence(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        this.presence.delete(key);
      });

    // Track edits
    this.channel.on('broadcast', { event: 'edit' }, ({ payload }) => {
      this.handleRemoteEdit(payload as CollaborativeEdit);
    });

    // Subscribe to channel
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.channel!.track({
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          color: this.generateUserColor(user.id),
          lastActive: new Date(),
        });
      }
    });
  }

  /**
   * Leave collaboration session
   */
  async leaveSession(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.presence.clear();
    this.editHistory = [];
  }

  /**
   * Broadcast edit to collaborators
   */
  async broadcastEdit(edit: Omit<CollaborativeEdit, 'id' | 'timestamp' | 'version'>): Promise<void> {
    if (!this.channel) return;

    const fullEdit: CollaborativeEdit = {
      ...edit,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      version: ++this.currentVersion,
    };

    this.editHistory.push(fullEdit);

    await this.channel.send({
      type: 'broadcast',
      event: 'edit',
      payload: fullEdit,
    });
  }

  /**
   * Update cursor position
   */
  async updateCursor(x: number, y: number): Promise<void> {
    if (!this.channel) return;

    await this.channel.track({
      cursor: { x, y },
      lastActive: new Date(),
    });
  }

  /**
   * Update text selection
   */
  async updateSelection(start: number, end: number): Promise<void> {
    if (!this.channel) return;

    await this.channel.track({
      selection: { start, end },
      lastActive: new Date(),
    });
  }

  /**
   * Get active collaborators
   */
  getCollaborators(): CollaboratorPresence[] {
    return Array.from(this.presence.values());
  }

  /**
   * Handle remote edit
   */
  private handleRemoteEdit(edit: CollaborativeEdit): void {
    // Check for conflicts
    const conflict = this.detectConflict(edit);

    if (conflict) {
      const resolution = this.resolveConflict(conflict);
      console.log('Conflict resolved:', resolution);
      // Apply resolved edit
    } else {
      // No conflict, apply edit directly
      this.applyEdit(edit);
    }

    this.editHistory.push(edit);
  }

  /**
   * Detect edit conflicts
   */
  private detectConflict(remoteEdit: CollaborativeEdit): ConflictResolution | null {
    // Find local edits that might conflict
    const recentLocalEdits = this.editHistory.filter(
      (edit) =>
        edit.userId !== remoteEdit.userId &&
        edit.version > remoteEdit.version - 5 &&
        this.editsOverlap(edit, remoteEdit)
    );

    if (recentLocalEdits.length === 0) return null;

    // Return first conflict for resolution
    return {
      localEdit: recentLocalEdits[0],
      remoteEdit,
      resolved: remoteEdit, // Placeholder
      strategy: 'remote-wins', // Default strategy
    };
  }

  /**
   * Check if two edits overlap
   */
  private editsOverlap(edit1: CollaborativeEdit, edit2: CollaborativeEdit): boolean {
    if (edit1.chapterId !== edit2.chapterId) return false;

    const edit1End = edit1.position + edit1.content.length;
    const edit2End = edit2.position + edit2.content.length;

    return !(edit1End < edit2.position || edit2End < edit1.position);
  }

  /**
   * Resolve edit conflict
   */
  private resolveConflict(conflict: ConflictResolution): CollaborativeEdit {
    // Implement Operational Transformation (OT) or CRDT
    // For now, use simple last-write-wins
    return conflict.remoteEdit.timestamp > conflict.localEdit.timestamp
      ? conflict.remoteEdit
      : conflict.localEdit;
  }

  /**
   * Apply edit to document
   */
  private applyEdit(edit: CollaborativeEdit): void {
    // This should be implemented by the component using this manager
    console.log('Applying edit:', edit);
  }

  /**
   * Update presence state
   */
  private updatePresence(state: Record<string, any>): void {
    this.presence.clear();

    Object.entries(state).forEach(([key, presences]) => {
      const presence = (presences as any[])[0];
      if (presence) {
        this.presence.set(key, presence as CollaboratorPresence);
      }
    });
  }

  /**
   * Generate consistent color for user
   */
  private generateUserColor(userId: string): string {
    const colors = [
      '#ef4444', // red
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ];

    // Generate consistent index from userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }
}

// ============================================================================
// OPERATIONAL TRANSFORMATION (OT)
// ============================================================================

/**
 * Transform edit against another edit (simplified OT)
 */
export function transformEdit(
  edit: CollaborativeEdit,
  against: CollaborativeEdit
): CollaborativeEdit {
  if (edit.chapterId !== against.chapterId) return edit;

  const transformed = { ...edit };

  // If against edit is before this edit, adjust position
  if (against.position < edit.position) {
    if (against.operation === 'insert') {
      transformed.position += against.content.length;
    } else if (against.operation === 'delete') {
      transformed.position -= against.content.length;
    }
  }

  return transformed;
}

/**
 * Transform edit against multiple edits
 */
export function transformAgainstHistory(
  edit: CollaborativeEdit,
  history: CollaborativeEdit[]
): CollaborativeEdit {
  let transformed = edit;

  for (const historicalEdit of history) {
    if (historicalEdit.version > edit.version) {
      transformed = transformEdit(transformed, historicalEdit);
    }
  }

  return transformed;
}

// ============================================================================
// EXPORT
// ============================================================================

export default CollaborationManager;
