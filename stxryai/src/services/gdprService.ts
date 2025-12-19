/**
 * GDPR Compliance Service
 * Handles data export, deletion, consent management, and privacy settings
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export interface UserConsent {
  id: string;
  userId: string;
  consentType: 'essential' | 'analytics' | 'marketing' | 'personalization' | 'third_party';
  consented: boolean;
  consentDate: string | null;
  consentVersion: string | null;
  withdrawn: boolean;
  withdrawnDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  exportFormat: 'json' | 'csv' | 'xml';
  includeTypes: string[];
  fileUrl: string | null;
  fileSizeBytes: number | null;
  expiresAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  deletionScope: 'full' | 'partial';
  excludeTypes: string[];
  requestedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  scheduledFor: string | null;
  verificationToken: string | null;
  verified: boolean;
  verifiedAt: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrivacySettings {
  id: string;
  userId: string;
  profileVisibility: 'public' | 'friends' | 'private';
  showReadingActivity: boolean;
  showAchievements: boolean;
  showFollowers: boolean;
  allowDataSharing: boolean;
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  showInSearch: boolean;
  showEmailInSearch: boolean;
  allowThirdPartySharing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CookiePreferences {
  id: string;
  userId: string | null;
  sessionId: string | null;
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDataExport {
  profile: any;
  stories: any[];
  comments: any[];
  readingProgress: any[];
  achievements: any[];
  bookmarks: any[];
  followers: any[];
  following: any[];
  preferences: any;
  consents: UserConsent[];
  metadata: {
    exportDate: string;
    userId: string;
    format: string;
  };
}

// ========================================
// SERVICE CLASS
// ========================================

class GDPRService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  // ==================== CONSENT MANAGEMENT ====================

  /**
   * Record user consent
   */
  async recordConsent(
    userId: string,
    consentType: UserConsent['consentType'],
    consented: boolean,
    consentVersion?: string
  ): Promise<UserConsent> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('user_consents')
      .upsert(
        {
          user_id: userId,
          consent_type: consentType,
          consented,
          consent_date: consented ? new Date().toISOString() : null,
          consent_version: consentVersion,
          withdrawn: !consented,
          withdrawn_date: !consented ? new Date().toISOString() : null,
        },
        {
          onConflict: 'user_id,consent_type',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error recording consent:', error);
      throw error;
    }

    return this.mapConsent(data);
  }

  /**
   * Get user consents
   */
  async getUserConsents(userId: string): Promise<UserConsent[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching consents:', error);
      throw error;
    }

    return (data || []).map(this.mapConsent);
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(
    userId: string,
    consentType: UserConsent['consentType']
  ): Promise<void> {
    const supabase = this.getSupabase();

    const { error } = await supabase
      .from('user_consents')
      .update({
        consented: false,
        withdrawn: true,
        withdrawn_date: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('consent_type', consentType);

    if (error) {
      console.error('Error withdrawing consent:', error);
      throw error;
    }
  }

  // ==================== DATA EXPORT ====================

  /**
   * Request data export
   */
  async requestDataExport(
    userId: string,
    options: {
      format?: 'json' | 'csv' | 'xml';
      includeTypes?: string[];
    } = {}
  ): Promise<DataExportRequest> {
    const supabase = this.getSupabase();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const { data, error } = await supabase
      .from('data_export_requests')
      .insert({
        user_id: userId,
        status: 'pending',
        export_format: options.format || 'json',
        include_types: options.includeTypes || ['all'],
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating export request:', error);
      throw error;
    }

    // Trigger export processing (would be handled by background job)
    // For now, we'll return the request

    return this.mapExportRequest(data);
  }

  /**
   * Get export request status
   */
  async getExportRequest(requestId: string): Promise<DataExportRequest | null> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching export request:', error);
      throw error;
    }

    return this.mapExportRequest(data);
  }

  /**
   * Get user's export requests
   */
  async getUserExportRequests(userId: string): Promise<DataExportRequest[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching export requests:', error);
      throw error;
    }

    return (data || []).map(this.mapExportRequest);
  }

  /**
   * Generate user data export (client-side helper)
   */
  async generateUserDataExport(userId: string): Promise<UserDataExport> {
    const supabase = this.getSupabase();

    // Fetch all user data
    const [
      { data: profile },
      { data: stories },
      { data: comments },
      { data: progress },
      { data: achievements },
      { data: bookmarks },
      { data: followers },
      { data: following },
      { data: preferences },
      { data: consents },
    ] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', userId).single(),
      supabase.from('stories').select('*').eq('user_id', userId),
      supabase.from('comments').select('*').eq('user_id', userId),
      supabase.from('user_progress').select('*').eq('user_id', userId),
      supabase.from('user_badges').select('*').eq('user_id', userId),
      supabase.from('bookmarks').select('*').eq('user_id', userId),
      supabase.from('follows').select('*').eq('follower_id', userId),
      supabase.from('follows').select('*').eq('following_id', userId),
      supabase.from('privacy_settings').select('*').eq('user_id', userId).single(),
      supabase.from('user_consents').select('*').eq('user_id', userId),
    ]);

    return {
      profile: profile || {},
      stories: stories || [],
      comments: comments || [],
      readingProgress: progress || [],
      achievements: achievements || [],
      bookmarks: bookmarks || [],
      followers: followers || [],
      following: following || [],
      preferences: preferences || {},
      consents: (consents || []).map(this.mapConsent),
      metadata: {
        exportDate: new Date().toISOString(),
        userId,
        format: 'json',
      },
    };
  }

  // ==================== DATA DELETION ====================

  /**
   * Request data deletion
   */
  async requestDataDeletion(
    userId: string,
    options: {
      scope?: 'full' | 'partial';
      excludeTypes?: string[];
      scheduledFor?: Date;
      reason?: string;
    } = {}
  ): Promise<DataDeletionRequest> {
    const supabase = this.getSupabase();

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    const { data, error } = await supabase
      .from('data_deletion_requests')
      .insert({
        user_id: userId,
        status: 'pending',
        deletion_scope: options.scope || 'full',
        exclude_types: options.excludeTypes || [],
        scheduled_for: options.scheduledFor?.toISOString() || null,
        verification_token: verificationToken,
        reason: options.reason,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deletion request:', error);
      throw error;
    }

    return this.mapDeletionRequest(data);
  }

  /**
   * Verify deletion request
   */
  async verifyDeletionRequest(
    requestId: string,
    token: string
  ): Promise<boolean> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('data_deletion_requests')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .eq('verification_token', token)
      .select()
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  }

  /**
   * Cancel deletion request
   */
  async cancelDeletionRequest(requestId: string): Promise<void> {
    const supabase = this.getSupabase();

    const { error } = await supabase
      .from('data_deletion_requests')
      .update({
        status: 'cancelled',
      })
      .eq('id', requestId);

    if (error) {
      console.error('Error cancelling deletion request:', error);
      throw error;
    }
  }

  // ==================== PRIVACY SETTINGS ====================

  /**
   * Get privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    const supabase = this.getSupabase();

    // Try to get existing settings
    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create default settings
      const { data: newData, error: createError } = await supabase.rpc(
        'create_default_privacy_settings',
        { p_user_id: userId }
      );

      if (createError) {
        console.error('Error creating privacy settings:', createError);
        throw createError;
      }

      return this.mapPrivacySettings(newData);
    }

    if (error) {
      console.error('Error fetching privacy settings:', error);
      throw error;
    }

    return this.mapPrivacySettings(data);
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    settings: Partial<PrivacySettings>
  ): Promise<PrivacySettings> {
    const supabase = this.getSupabase();

    const updateData: any = {};
    if (settings.profileVisibility !== undefined)
      updateData.profile_visibility = settings.profileVisibility;
    if (settings.showReadingActivity !== undefined)
      updateData.show_reading_activity = settings.showReadingActivity;
    if (settings.showAchievements !== undefined)
      updateData.show_achievements = settings.showAchievements;
    if (settings.showFollowers !== undefined)
      updateData.show_followers = settings.showFollowers;
    if (settings.allowDataSharing !== undefined)
      updateData.allow_data_sharing = settings.allowDataSharing;
    if (settings.allowAnalytics !== undefined)
      updateData.allow_analytics = settings.allowAnalytics;
    if (settings.allowPersonalization !== undefined)
      updateData.allow_personalization = settings.allowPersonalization;
    if (settings.showInSearch !== undefined)
      updateData.show_in_search = settings.showInSearch;
    if (settings.showEmailInSearch !== undefined)
      updateData.show_email_in_search = settings.showEmailInSearch;
    if (settings.allowThirdPartySharing !== undefined)
      updateData.allow_third_party_sharing = settings.allowThirdPartySharing;

    const { data, error } = await supabase
      .from('privacy_settings')
      .upsert(
        {
          user_id: userId,
          ...updateData,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }

    return this.mapPrivacySettings(data);
  }

  // ==================== COOKIE PREFERENCES ====================

  /**
   * Get or create cookie preferences
   */
  async getCookiePreferences(
    userId: string | null,
    sessionId: string | null
  ): Promise<CookiePreferences> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase.rpc('get_or_create_cookie_preferences', {
      p_user_id: userId,
      p_session_id: sessionId,
    });

    if (error) {
      console.error('Error getting cookie preferences:', error);
      throw error;
    }

    return this.mapCookiePreferences(data);
  }

  /**
   * Update cookie preferences
   */
  async updateCookiePreferences(
    userId: string | null,
    sessionId: string | null,
    preferences: Partial<CookiePreferences>
  ): Promise<CookiePreferences> {
    const supabase = this.getSupabase();

    const updateData: any = {};
    if (preferences.analytics !== undefined) updateData.analytics = preferences.analytics;
    if (preferences.marketing !== undefined) updateData.marketing = preferences.marketing;
    if (preferences.functional !== undefined) updateData.functional = preferences.functional;

    const { data, error } = await supabase
      .from('cookie_preferences')
      .upsert(
        {
          user_id: userId,
          session_id: sessionId,
          essential: true, // Always required
          ...updateData,
        },
        {
          onConflict: 'user_id,session_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating cookie preferences:', error);
      throw error;
    }

    return this.mapCookiePreferences(data);
  }

  // ==================== HELPER METHODS ====================

  private mapConsent(data: any): UserConsent {
    return {
      id: data.id,
      userId: data.user_id,
      consentType: data.consent_type,
      consented: data.consented,
      consentDate: data.consent_date,
      consentVersion: data.consent_version,
      withdrawn: data.withdrawn,
      withdrawnDate: data.withdrawn_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapExportRequest(data: any): DataExportRequest {
    return {
      id: data.id,
      userId: data.user_id,
      status: data.status,
      exportFormat: data.export_format,
      includeTypes: data.include_types || [],
      fileUrl: data.file_url,
      fileSizeBytes: data.file_size_bytes,
      expiresAt: data.expires_at,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapDeletionRequest(data: any): DataDeletionRequest {
    return {
      id: data.id,
      userId: data.user_id,
      status: data.status,
      deletionScope: data.deletion_scope,
      excludeTypes: data.exclude_types || [],
      requestedAt: data.requested_at,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      scheduledFor: data.scheduled_for,
      verificationToken: data.verification_token,
      verified: data.verified,
      verifiedAt: data.verified_at,
      reason: data.reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapPrivacySettings(data: any): PrivacySettings {
    return {
      id: data.id,
      userId: data.user_id,
      profileVisibility: data.profile_visibility || 'public',
      showReadingActivity: data.show_reading_activity ?? true,
      showAchievements: data.show_achievements ?? true,
      showFollowers: data.show_followers ?? true,
      allowDataSharing: data.allow_data_sharing ?? false,
      allowAnalytics: data.allow_analytics ?? true,
      allowPersonalization: data.allow_personalization ?? true,
      showInSearch: data.show_in_search ?? true,
      showEmailInSearch: data.show_email_in_search ?? false,
      allowThirdPartySharing: data.allow_third_party_sharing ?? false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCookiePreferences(data: any): CookiePreferences {
    return {
      id: data.id,
      userId: data.user_id,
      sessionId: data.session_id,
      essential: data.essential ?? true,
      analytics: data.analytics ?? false,
      marketing: data.marketing ?? false,
      functional: data.functional ?? false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// Export singleton instance
export const gdprService = new GDPRService();

