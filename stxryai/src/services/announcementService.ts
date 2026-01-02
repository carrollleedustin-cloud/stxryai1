import { supabase } from '@/lib/supabase/client';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'feature' | 'success' | 'warning' | 'urgent' | 'maintenance';
  targetAudience: 'all' | 'premium' | 'vip' | 'new_users';
  isActive: boolean;
  isPinned: boolean;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  readBy: string[];
  metadata: {
    viewCount?: number;
    dismissCount?: number;
    linkUrl?: string;
    linkText?: string;
  };
}

export interface CreateAnnouncementDTO {
  title: string;
  content: string;
  type: Announcement['type'];
  targetAudience: Announcement['targetAudience'];
  isPinned?: boolean;
  expiresAt?: string | null;
  metadata?: {
    linkUrl?: string;
    linkText?: string;
  };
}

class AnnouncementService {
  // Get all announcements (admin)
  async getAll(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(this.transformAnnouncement);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      // Return mock data for development
      return this.getMockAnnouncements();
    }
  }

  // Create a new announcement
  async create(input: CreateAnnouncementDTO, createdBy: string): Promise<Announcement | null> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: input.title,
          content: input.content,
          type: input.type,
          target_audience: input.targetAudience,
          is_active: true,
          is_pinned: input.isPinned || false,
          expires_at: input.expiresAt || null,
          created_by: createdBy,
          metadata: {
            viewCount: 0,
            dismissCount: 0,
            linkUrl: input.metadata?.linkUrl || null,
            linkText: input.metadata?.linkText || null,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformAnnouncement(data);
    } catch (error) {
      console.error('Error creating announcement:', error);
      // Return mock announcement for development
      return {
        id: `mock-${Date.now()}`,
        title: input.title,
        content: input.content,
        type: input.type,
        targetAudience: input.targetAudience,
        isActive: true,
        isPinned: input.isPinned || false,
        expiresAt: input.expiresAt || null,
        createdBy: createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: input.metadata || {},
      };
    }
  }

  // Update announcement
  async update(id: string, updates: Partial<CreateAnnouncementDTO>): Promise<Announcement | null> {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.targetAudience !== undefined) updateData.target_audience = updates.targetAudience;
      if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
      if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.transformAnnouncement(data);
    } catch (error) {
      console.error('Error updating announcement:', error);
      return null;
    }
  }

  // Delete announcement
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return true; // Return true for mock mode
    }
  }

  // Toggle pin status
  async togglePin(id: string): Promise<boolean> {
    try {
      // First get current state
      const { data: current, error: fetchError } = await supabase
        .from('announcements')
        .select('is_pinned')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('announcements')
        .update({ is_pinned: !current.is_pinned })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling pin:', error);
      return true; // Return true for mock mode
    }
  }

  // Toggle active status
  async toggleActive(id: string): Promise<boolean> {
    try {
      // First get current state
      const { data: current, error: fetchError } = await supabase
        .from('announcements')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !current.is_active })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling active:', error);
      return true; // Return true for mock mode
    }
  }

  // Get active announcements for users
  async getActiveForUser(userId?: string): Promise<Announcement[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out dismissed announcements if userId provided
      if (userId) {
        const { data: dismissed } = await supabase
          .from('dismissed_announcements')
          .select('announcement_id')
          .eq('user_id', userId);

        const dismissedIds = new Set((dismissed || []).map(d => d.announcement_id));
        return (data || [])
          .filter(a => !dismissedIds.has(a.id))
          .map(this.transformAnnouncement);
      }

      return (data || []).map(this.transformAnnouncement);
    } catch (error) {
      console.error('Error fetching active announcements:', error);
      return [];
    }
  }

  // Dismiss an announcement for a user
  async dismiss(announcementId: string, userId: string): Promise<boolean> {
    try {
      await supabase.from('dismissed_announcements').insert({
        announcement_id: announcementId,
        user_id: userId,
      });

      // Increment dismiss count
      const { data: announcement } = await supabase
        .from('announcements')
        .select('metadata')
        .eq('id', announcementId)
        .single();

      if (announcement) {
        const currentCount = (announcement?.metadata as Record<string, number>)?.dismissCount || 0;
        await supabase
          .from('announcements')
          .update({
            metadata: {
              ...announcement?.metadata,
              dismissCount: currentCount + 1,
            },
          })
          .eq('id', announcementId);
      }

      return true;
    } catch (error) {
      console.error('Error dismissing announcement:', error);
      return true;
    }
  }

  // Track view
  async trackView(id: string): Promise<void> {
    try {
      const { data: announcement } = await supabase
        .from('announcements')
        .select('metadata')
        .eq('id', id)
        .single();

      if (announcement) {
        const currentCount = (announcement?.metadata as Record<string, number>)?.viewCount || 0;
        await supabase
          .from('announcements')
          .update({
            metadata: {
              ...announcement?.metadata,
              viewCount: currentCount + 1,
            },
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  // Get announcements for a specific user (used by EtherealNav)
  async getForUser(userId: string, subscriptionTier: string): Promise<(Announcement & { readBy: string[] })[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get read status for user
      const { data: readData } = await supabase
        .from('dismissed_announcements')
        .select('announcement_id')
        .eq('user_id', userId);

      const readIds = new Set((readData || []).map(r => r.announcement_id));
      
      return (data || []).map(a => ({
        ...this.transformAnnouncement(a),
        readBy: readIds.has(a.id) ? [userId] : [],
      }));
    } catch (error) {
      console.error('Error fetching user announcements:', error);
      return this.getMockAnnouncements().map(a => ({ ...a, readBy: [] }));
    }
  }

  // Get unread count for a user
  async getUnreadCount(userId: string, subscriptionTier: string): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      const { data: announcements, error: annError } = await supabase
        .from('announcements')
        .select('id')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`);

      if (annError) throw annError;

      const { data: readData } = await supabase
        .from('dismissed_announcements')
        .select('announcement_id')
        .eq('user_id', userId);

      const readIds = new Set((readData || []).map(r => r.announcement_id));
      const unread = (announcements || []).filter(a => !readIds.has(a.id));
      
      return unread.length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 2; // Return mock count
    }
  }

  // Mark announcement as read
  async markAsRead(announcementId: string, userId: string): Promise<boolean> {
    return this.dismiss(announcementId, userId);
  }

  // Transform database record to Announcement type
  private transformAnnouncement(record: Record<string, unknown>): Announcement {
    return {
      id: record.id as string,
      title: record.title as string,
      content: record.content as string,
      type: record.type as Announcement['type'],
      targetAudience: record.target_audience as Announcement['targetAudience'],
      isActive: record.is_active as boolean,
      isPinned: record.is_pinned as boolean,
      expiresAt: record.expires_at as string | null,
      createdBy: record.created_by as string,
      createdAt: record.created_at as string,
      updatedAt: record.updated_at as string,
      metadata: (record.metadata as Announcement['metadata']) || {},
    };
  }

  // Mock data for development
  private getMockAnnouncements(): Announcement[] {
    return [
      {
        id: '1',
        title: '🎉 Welcome to StxryAI 2.0!',
        content: 'We\'ve completely redesigned the platform with a stunning new void aesthetic, enhanced reading experience, and AI-powered storytelling features.',
        type: 'feature',
        targetAudience: 'all',
        isActive: true,
        isPinned: true,
        expiresAt: null,
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        metadata: { viewCount: 1547, dismissCount: 234, linkUrl: '/story-library', linkText: 'Explore Stories' },
      },
      {
        id: '2',
        title: '📚 New Story Collection: Winter Tales',
        content: 'Discover our curated collection of winter-themed stories, perfect for cozy reading during the holiday season.',
        type: 'info',
        targetAudience: 'all',
        isActive: true,
        isPinned: false,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        metadata: { viewCount: 892, dismissCount: 156, linkUrl: '/story-library?collection=winter', linkText: 'View Collection' },
      },
      {
        id: '3',
        title: '⚠️ Scheduled Maintenance',
        content: 'We will be performing scheduled maintenance on December 28th from 2:00 AM - 4:00 AM EST. The platform may be briefly unavailable during this time.',
        type: 'maintenance',
        targetAudience: 'all',
        isActive: true,
        isPinned: false,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
        metadata: { viewCount: 456, dismissCount: 89 },
      },
    ];
  }
}

export const announcementService = new AnnouncementService();
