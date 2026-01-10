/**
 * Messaging Service
 * Manages direct messages, group chats, and real-time communication
 */

import { createClient } from '@/lib/supabase/client';

export interface Conversation {
  id: string;
  conversationType: 'direct' | 'group';
  conversationName?: string;
  participants: string[];
  lastMessageId?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  createdBy?: string;
  groupAvatarUrl?: string;
  groupDescription?: string;
  isArchived: boolean;
  isMuted: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'link' | 'system';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  replyToId?: string;
  replyPreview?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  readBy: string[];
  readAt: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  isMuted: boolean;
  muteUntil?: string;
  lastReadMessageId?: string;
  lastReadAt?: string;
  unreadCount: number;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypingIndicator {
  id: string;
  conversationId: string;
  userId: string;
  isTyping: boolean;
  startedAt: string;
  createdAt: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'thumbs_up' | 'thumbs_down';
  emoji?: string;
  createdAt: string;
}

export class MessagingService {
  private supabase = createClient();

  // ========================================
  // CONVERSATIONS
  // ========================================

  /**
   * Get or create direct conversation
   */
  async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<Conversation> {
    const { data, error } = await this.supabase.rpc('get_or_create_direct_conversation', {
      p_user1_id: userId1,
      p_user2_id: userId2,
    });

    if (error) throw error;

    const conversation = await this.getConversation(data);
    if (!conversation) throw new Error('Failed to create conversation');

    return conversation;
  }

  /**
   * Create a group conversation
   */
  async createGroupConversation(
    creatorId: string,
    participants: string[],
    name?: string,
    description?: string
  ): Promise<Conversation> {
    const allParticipants = [...new Set([creatorId, ...participants])];

    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        conversation_type: 'group',
        conversation_name: name || 'Group Chat',
        participants: allParticipants,
        created_by: creatorId,
        group_description: description,
      })
      .select()
      .single();

    if (error) throw error;

    // Create participant records
    await Promise.all(
      allParticipants.map((userId) =>
        this.supabase.from('conversation_participants').insert({
          conversation_id: data.id,
          user_id: userId,
          role: userId === creatorId ? 'admin' : 'member',
        })
      )
    );

    return this.mapConversation(data);
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .contains('participants', [userId])
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapConversation(item));
  }

  /**
   * Get a conversation
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapConversation(data);
  }

  /**
   * Get conversation participants
   */
  async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const { data, error } = await this.supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_active', true);

    if (error) throw error;
    return (data || []).map((item: any) => this.mapParticipant(item));
  }

  // ========================================
  // MESSAGES
  // ========================================

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    message: Partial<Message>
  ): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: message.content || '',
        message_type: message.messageType || 'text',
        media_url: message.mediaUrl,
        file_name: message.fileName,
        file_size: message.fileSize,
        file_type: message.fileType,
        reply_to_id: message.replyToId,
        reply_preview: message.replyPreview,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapMessage(data);
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(
    conversationId: string,
    options?: {
      limit?: number;
      before?: string; // message ID to paginate before
    }
  ): Promise<Message[]> {
    let query = this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (options?.before) {
      query = query.lt('id', options.before);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    } else {
      query = query.limit(50);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).reverse().map((item: any) => this.mapMessage(item));
  }

  /**
   * Mark messages as read
   */
  async markMessagesRead(conversationId: string, userId: string, messageId: string): Promise<void> {
    const { error } = await this.supabase.rpc('mark_messages_read', {
      p_conversation_id: conversationId,
      p_user_id: userId,
      p_message_id: messageId,
    });

    if (error) throw error;
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, content: string): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return this.mapMessage(data);
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: '[Message deleted]',
      })
      .eq('id', messageId);

    if (error) throw error;
  }

  // ========================================
  // TYPING INDICATORS
  // ========================================

  /**
   * Set typing indicator
   */
  async setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    if (isTyping) {
      const { error } = await this.supabase.from('typing_indicators').upsert(
        {
          conversation_id: conversationId,
          user_id: userId,
          is_typing: true,
          started_at: new Date().toISOString(),
        },
        {
          onConflict: 'conversation_id,user_id',
        }
      );

      if (error) throw error;
    } else {
      const { error } = await this.supabase
        .from('typing_indicators')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
    }
  }

  /**
   * Get typing indicators for a conversation
   */
  async getTypingIndicators(conversationId: string): Promise<TypingIndicator[]> {
    const { data, error } = await this.supabase
      .from('typing_indicators')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_typing', true);

    if (error) throw error;
    return (data || []).map((item: any) => this.mapTypingIndicator(item));
  }

  // ========================================
  // REACTIONS
  // ========================================

  /**
   * Add reaction to a message
   */
  async addReaction(
    messageId: string,
    userId: string,
    reactionType: MessageReaction['reactionType'],
    emoji?: string
  ): Promise<MessageReaction> {
    const { data, error } = await this.supabase
      .from('message_reactions')
      .upsert(
        {
          message_id: messageId,
          user_id: userId,
          reaction_type: reactionType,
          emoji,
        },
        {
          onConflict: 'message_id,user_id,reaction_type',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return this.mapReaction(data);
  }

  /**
   * Remove reaction
   */
  async removeReaction(
    messageId: string,
    userId: string,
    reactionType: MessageReaction['reactionType']
  ): Promise<void> {
    const { error } = await this.supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType);

    if (error) throw error;
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapConversation(data: any): Conversation {
    return {
      id: data.id,
      conversationType: data.conversation_type,
      conversationName: data.conversation_name,
      participants: data.participants || [],
      lastMessageId: data.last_message_id,
      lastMessageAt: data.last_message_at,
      lastMessagePreview: data.last_message_preview,
      createdBy: data.created_by,
      groupAvatarUrl: data.group_avatar_url,
      groupDescription: data.group_description,
      isArchived: data.is_archived,
      isMuted: data.is_muted,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapMessage(data: any): Message {
    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      content: data.content,
      messageType: data.message_type,
      mediaUrl: data.media_url,
      fileName: data.file_name,
      fileSize: data.file_size,
      fileType: data.file_type,
      replyToId: data.reply_to_id,
      replyPreview: data.reply_preview,
      isEdited: data.is_edited,
      editedAt: data.edited_at,
      isDeleted: data.is_deleted,
      deletedAt: data.deleted_at,
      readBy: data.read_by || [],
      readAt: data.read_at || [],
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapParticipant(data: any): ConversationParticipant {
    return {
      id: data.id,
      conversationId: data.conversation_id,
      userId: data.user_id,
      role: data.role,
      isMuted: data.is_muted,
      muteUntil: data.mute_until,
      lastReadMessageId: data.last_read_message_id,
      lastReadAt: data.last_read_at,
      unreadCount: data.unread_count || 0,
      joinedAt: data.joined_at,
      leftAt: data.left_at,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapTypingIndicator(data: any): TypingIndicator {
    return {
      id: data.id,
      conversationId: data.conversation_id,
      userId: data.user_id,
      isTyping: data.is_typing,
      startedAt: data.started_at,
      createdAt: data.created_at,
    };
  }

  private mapReaction(data: any): MessageReaction {
    return {
      id: data.id,
      messageId: data.message_id,
      userId: data.user_id,
      reactionType: data.reaction_type,
      emoji: data.emoji,
      createdAt: data.created_at,
    };
  }
}

export const messagingService = new MessagingService();
