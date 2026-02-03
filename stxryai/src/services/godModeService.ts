/**
 * God Mode Service
 * Owner-only controls for complete system management
 */

import { createClient } from '@/lib/supabase/client';
import { rbacService } from './rbacService';

export interface SystemConfig {
  key: string;
  value: any;
  description: string;
  isSensitive: boolean;
  lastModifiedBy: string | null;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  flagKey: string;
  displayName: string;
  description: string | null;
  isEnabled: boolean;
  enabledForRoles: string[];
  rolloutPercentage: number;
  config: Record<string, any>;
}

export interface EmergencyAction {
  id: string;
  actionType: string;
  initiatedBy: string;
  initiatedByName: string;
  reason: string;
  affectedUsers: number;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
}

export interface InventoryModification {
  userId: string;
  modifiedBy: string;
  modificationType: string;
  itemType: string | null;
  quantity: number | null;
  reason: string;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsersToday: number;
  totalStories: number;
  totalReads: number;
  premiumUsers: number;
  revenue30Days: number;
  storageUsedGB: number;
}

class GodModeService {
  private supabase = createClient();

  /**
   * Verify owner access
   */
  private async verifyOwner(userId: string): Promise<boolean> {
    return await rbacService.isOwner(userId);
  }

  // ============================================
  // SYSTEM CONFIGURATION
  // ============================================

  /**
   * Get all system config
   */
  async getSystemConfig(ownerId: string): Promise<SystemConfig[]> {
    if (!(await this.verifyOwner(ownerId))) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('system_config')
        .select('*')
        .order('config_key');

      if (error) {
        console.error('Error fetching system config:', error);
        return [];
      }

      return (data || []).map((c) => ({
        key: c.config_key,
        value: c.config_value,
        description: c.description,
        isSensitive: c.is_sensitive,
        lastModifiedBy: c.last_modified_by,
        updatedAt: c.updated_at,
      }));
    } catch (error) {
      console.error('Error in getSystemConfig:', error);
      return [];
    }
  }

  /**
   * Update system config
   */
  async updateSystemConfig(
    ownerId: string,
    key: string,
    value: any,
    reason?: string
  ): Promise<boolean> {
    if (!(await this.verifyOwner(ownerId))) {
      return false;
    }

    try {
      const { data: existing } = await this.supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', key)
        .single();

      await this.supabase.from('system_config').upsert({
        config_key: key,
        config_value: value,
        last_modified_by: ownerId,
        updated_at: new Date().toISOString(),
      });

      // Log action
      await rbacService.logStaffAction(
        ownerId,
        'update_system_config',
        'system_config',
        key,
        undefined,
        existing?.config_value,
        value,
        reason
      );

      return true;
    } catch (error) {
      console.error('Error updating system config:', error);
      return false;
    }
  }

  // ============================================
  // FEATURE FLAGS
  // ============================================

  /**
   * Get all feature flags
   */
  async getFeatureFlags(adminId: string): Promise<FeatureFlag[]> {
    if (!(await rbacService.hasPermission(adminId, 'manage_feature_flags'))) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('*')
        .order('flag_key');

      if (error) {
        console.error('Error fetching feature flags:', error);
        return [];
      }

      return (data || []).map((f) => ({
        id: f.id,
        flagKey: f.flag_key,
        displayName: f.display_name,
        description: f.description,
        isEnabled: f.is_enabled,
        enabledForRoles: f.enabled_for_roles || [],
        rolloutPercentage: f.rollout_percentage,
        config: f.config || {},
      }));
    } catch (error) {
      console.error('Error in getFeatureFlags:', error);
      return [];
    }
  }

  /**
   * Toggle feature flag
   */
  async toggleFeatureFlag(adminId: string, flagKey: string, enabled: boolean): Promise<boolean> {
    if (!(await rbacService.hasPermission(adminId, 'manage_feature_flags'))) {
      return false;
    }

    try {
      const { error } = await this.supabase
        .from('feature_flags')
        .update({
          is_enabled: enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('flag_key', flagKey);

      if (!error) {
        await rbacService.logStaffAction(
          adminId,
          `feature_flag_${enabled ? 'enable' : 'disable'}`,
          'feature_flag',
          flagKey
        );
      }

      return !error;
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      return false;
    }
  }

  /**
   * Create feature flag
   */
  async createFeatureFlag(
    ownerId: string,
    data: {
      flagKey: string;
      displayName: string;
      description?: string;
      isEnabled?: boolean;
      enabledForRoles?: string[];
      rolloutPercentage?: number;
    }
  ): Promise<boolean> {
    if (!(await this.verifyOwner(ownerId))) {
      return false;
    }

    try {
      const { error } = await this.supabase.from('feature_flags').insert({
        flag_key: data.flagKey,
        display_name: data.displayName,
        description: data.description,
        is_enabled: data.isEnabled ?? false,
        enabled_for_roles: data.enabledForRoles || [],
        rollout_percentage: data.rolloutPercentage || 0,
        created_by: ownerId,
      });

      return !error;
    } catch (error) {
      console.error('Error creating feature flag:', error);
      return false;
    }
  }

  // ============================================
  // EMERGENCY CONTROLS
  // ============================================

  /**
   * Activate maintenance mode
   */
  async activateMaintenanceMode(ownerId: string, reason: string, estimatedDuration?: number): Promise<boolean> {
    if (!(await this.verifyOwner(ownerId))) {
      return false;
    }

    try {
      // Create emergency action record
      await this.supabase.from('emergency_actions').insert({
        action_type: 'maintenance_mode',
        initiated_by: ownerId,
        reason,
        config: { estimated_duration_minutes: estimatedDuration },
        is_active: true,
      });

      // Update system config
      await this.updateSystemConfig(ownerId, 'maintenance_mode', true, reason);

      return true;
    } catch (error) {
      console.error('Error activating maintenance mode:', error);
      return false;
    }
  }

  /**
   * Deactivate maintenance mode
   */
  async deactivateMaintenanceMode(ownerId: string): Promise<boolean> {
    if (!(await this.verifyOwner(ownerId))) {
      return false;
    }

    try {
      // End active maintenance actions
      await this.supabase
        .from('emergency_actions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
        })
        .eq('action_type', 'maintenance_mode')
        .eq('is_active', true);

      // Update system config
      await this.updateSystemConfig(ownerId, 'maintenance_mode', false);

      return true;
    } catch (error) {
      console.error('Error deactivating maintenance mode:', error);
      return false;
    }
  }

  /**
   * Emergency lockdown
   */
  async emergencyLockdown(ownerId: string, reason: string): Promise<boolean> {
    if (!(await this.verifyOwner(ownerId))) {
      return false;
    }

    try {
      await this.supabase.from('emergency_actions').insert({
        action_type: 'lockdown',
        initiated_by: ownerId,
        reason,
        is_active: true,
      });

      // Disable key features
      await this.updateSystemConfig(ownerId, 'lockdown_active', true, reason);
      await this.updateSystemConfig(ownerId, 'allow_registrations', false, 'Lockdown');
      await this.updateSystemConfig(ownerId, 'allow_story_creation', false, 'Lockdown');

      return true;
    } catch (error) {
      console.error('Error activating lockdown:', error);
      return false;
    }
  }

  /**
   * Get emergency actions history
   */
  async getEmergencyActions(ownerId: string): Promise<EmergencyAction[]> {
    if (!(await this.verifyOwner(ownerId))) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('emergency_actions')
        .select(`
          *,
          initiator:user_profiles!emergency_actions_initiated_by_fkey (display_name)
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching emergency actions:', error);
        return [];
      }

      return (data || []).map((a) => ({
        id: a.id,
        actionType: a.action_type,
        initiatedBy: a.initiated_by,
        initiatedByName: (a.initiator as any)?.display_name || 'Unknown',
        reason: a.reason,
        affectedUsers: a.affected_users || 0,
        startedAt: a.started_at,
        endedAt: a.ended_at,
        isActive: a.is_active,
      }));
    } catch (error) {
      console.error('Error in getEmergencyActions:', error);
      return [];
    }
  }

  // ============================================
  // INVENTORY MANAGEMENT (GOD MODE)
  // ============================================

  /**
   * Modify user coins
   */
  async modifyUserCoins(
    ownerId: string,
    targetUserId: string,
    amount: number,
    reason: string
  ): Promise<boolean> {
    if (!(await rbacService.hasPermission(ownerId, 'edit_any_inventory'))) {
      return false;
    }

    try {
      // Get current balance
      const { data: wallet } = await this.supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', targetUserId)
        .single();

      const oldBalance = wallet?.balance || 0;
      const newBalance = Math.max(0, oldBalance + amount);

      // Update wallet
      await this.supabase.from('user_wallets').upsert({
        user_id: targetUserId,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      });

      // Log modification
      await this.supabase.from('inventory_modifications').insert({
        user_id: targetUserId,
        modified_by: ownerId,
        modification_type: amount > 0 ? 'add_coins' : 'remove_coins',
        quantity: Math.abs(amount),
        old_value: { balance: oldBalance },
        new_value: { balance: newBalance },
        reason,
      });

      await rbacService.logStaffAction(
        ownerId,
        amount > 0 ? 'add_coins' : 'remove_coins',
        'wallet',
        targetUserId,
        targetUserId,
        { balance: oldBalance },
        { balance: newBalance },
        reason
      );

      return true;
    } catch (error) {
      console.error('Error modifying user coins:', error);
      return false;
    }
  }

  /**
   * Grant badge to user
   */
  async grantBadge(
    ownerId: string,
    targetUserId: string,
    badgeId: string,
    reason: string
  ): Promise<boolean> {
    if (!(await rbacService.hasPermission(ownerId, 'edit_any_inventory'))) {
      return false;
    }

    try {
      await this.supabase.from('user_badges_enhanced').insert({
        user_id: targetUserId,
        badge_id: badgeId,
        earned_via: 'admin_grant',
        granted_by: ownerId,
      });

      await this.supabase.from('inventory_modifications').insert({
        user_id: targetUserId,
        modified_by: ownerId,
        modification_type: 'add_badge',
        item_type: 'badge',
        item_id: badgeId,
        reason,
      });

      return true;
    } catch (error) {
      console.error('Error granting badge:', error);
      return false;
    }
  }

  /**
   * Revoke badge from user
   */
  async revokeBadge(
    ownerId: string,
    targetUserId: string,
    badgeId: string,
    reason: string
  ): Promise<boolean> {
    if (!(await rbacService.hasPermission(ownerId, 'edit_any_inventory'))) {
      return false;
    }

    try {
      await this.supabase
        .from('user_badges_enhanced')
        .delete()
        .eq('user_id', targetUserId)
        .eq('badge_id', badgeId);

      await this.supabase.from('inventory_modifications').insert({
        user_id: targetUserId,
        modified_by: ownerId,
        modification_type: 'remove_badge',
        item_type: 'badge',
        item_id: badgeId,
        reason,
      });

      return true;
    } catch (error) {
      console.error('Error revoking badge:', error);
      return false;
    }
  }

  /**
   * Grant pet to user
   */
  async grantPet(
    ownerId: string,
    targetUserId: string,
    speciesId: string,
    customName?: string,
    reason?: string
  ): Promise<string | null> {
    if (!(await rbacService.hasPermission(ownerId, 'edit_any_inventory'))) {
      return null;
    }

    try {
      const { data: pet, error } = await this.supabase
        .from('user_pets')
        .insert({
          user_id: targetUserId,
          species_id: speciesId,
          custom_name: customName,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error granting pet:', error);
        return null;
      }

      await this.supabase.from('inventory_modifications').insert({
        user_id: targetUserId,
        modified_by: ownerId,
        modification_type: 'add_pet',
        item_type: 'pet',
        item_id: pet.id,
        reason: reason || 'Admin grant',
      });

      return pet.id;
    } catch (error) {
      console.error('Error in grantPet:', error);
      return null;
    }
  }

  // ============================================
  // MESSAGE AUDIT (OWNER ONLY)
  // ============================================

  /**
   * View all messages (audit mode)
   */
  async auditMessages(
    ownerId: string,
    options?: {
      conversationId?: string;
      userId?: string;
      limit?: number;
    }
  ): Promise<any[]> {
    if (!(await rbacService.hasPermission(ownerId, 'view_all_messages'))) {
      return [];
    }

    try {
      let query = this.supabase
        .from('direct_messages')
        .select(`
          *,
          sender:user_profiles!direct_messages_sender_id_fkey (display_name),
          receiver:user_profiles!direct_messages_receiver_id_fkey (display_name)
        `)
        .order('created_at', { ascending: false });

      if (options?.conversationId) {
        query = query.eq('conversation_id', options.conversationId);
      }
      if (options?.userId) {
        query = query.or(`sender_id.eq.${options.userId},receiver_id.eq.${options.userId}`);
      }

      query = query.limit(options?.limit || 100);

      const { data, error } = await query;

      if (error) {
        console.error('Error auditing messages:', error);
        return [];
      }

      // Log access
      await this.supabase.from('message_audit_access').insert({
        accessor_id: ownerId,
        conversation_id: options?.conversationId,
        access_reason: 'Audit mode access',
      });

      return data || [];
    } catch (error) {
      console.error('Error in auditMessages:', error);
      return [];
    }
  }

  // ============================================
  // PLATFORM ANALYTICS
  // ============================================

  /**
   * Get platform statistics
   */
  async getPlatformStats(adminId: string): Promise<PlatformStats> {
    if (!(await rbacService.hasPermission(adminId, 'view_full_analytics'))) {
      return {
        totalUsers: 0,
        activeUsersToday: 0,
        totalStories: 0,
        totalReads: 0,
        premiumUsers: 0,
        revenue30Days: 0,
        storageUsedGB: 0,
      };
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Total users
      const { count: totalUsers } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Active users today
      const { count: activeUsersToday } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', today.toISOString());

      // Total stories
      const { count: totalStories } = await this.supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Total reads (sum of play_count)
      const { data: readData } = await this.supabase
        .from('stories')
        .select('play_count');
      const totalReads = (readData || []).reduce((sum, s) => sum + (s.play_count || 0), 0);

      // Premium users
      const { count: premiumUsers } = await this.supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        totalUsers: totalUsers || 0,
        activeUsersToday: activeUsersToday || 0,
        totalStories: totalStories || 0,
        totalReads,
        premiumUsers: premiumUsers || 0,
        revenue30Days: 0, // Would need Stripe integration
        storageUsedGB: 0, // Would need storage API
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      return {
        totalUsers: 0,
        activeUsersToday: 0,
        totalStories: 0,
        totalReads: 0,
        premiumUsers: 0,
        revenue30Days: 0,
        storageUsedGB: 0,
      };
    }
  }

  // ============================================
  // BADGE & COSMETICS MANAGEMENT
  // ============================================

  /**
   * Create badge
   */
  async createBadge(
    ownerId: string,
    data: {
      badgeKey: string;
      displayName: string;
      description?: string;
      categoryId?: string;
      iconUrl?: string;
      rarity?: string;
      pointsValue?: number;
      requirements?: Record<string, any>;
      isSecret?: boolean;
      isLimited?: boolean;
    }
  ): Promise<string | null> {
    if (!(await rbacService.hasPermission(ownerId, 'manage_badges'))) {
      return null;
    }

    try {
      const { data: badge, error } = await this.supabase
        .from('badge_definitions')
        .insert({
          badge_key: data.badgeKey,
          display_name: data.displayName,
          description: data.description,
          category_id: data.categoryId,
          icon_url: data.iconUrl,
          rarity: data.rarity || 'common',
          points_value: data.pointsValue || 10,
          requirements: data.requirements || {},
          is_secret: data.isSecret || false,
          is_limited: data.isLimited || false,
          created_by: ownerId,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating badge:', error);
        return null;
      }

      return badge.id;
    } catch (error) {
      console.error('Error in createBadge:', error);
      return null;
    }
  }

  /**
   * Create icon
   */
  async createIcon(
    ownerId: string,
    data: {
      iconKey: string;
      displayName: string;
      imageUrl: string;
      category?: string;
      rarity?: string;
      priceCoins?: number;
    }
  ): Promise<string | null> {
    if (!(await rbacService.hasPermission(ownerId, 'manage_icons_banners'))) {
      return null;
    }

    try {
      const { data: icon, error } = await this.supabase
        .from('profile_icons')
        .insert({
          icon_key: data.iconKey,
          display_name: data.displayName,
          image_url: data.imageUrl,
          category: data.category || 'general',
          rarity: data.rarity || 'common',
          price_coins: data.priceCoins,
          created_by: ownerId,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating icon:', error);
        return null;
      }

      return icon.id;
    } catch (error) {
      console.error('Error in createIcon:', error);
      return null;
    }
  }

  /**
   * Create banner
   */
  async createBanner(
    ownerId: string,
    data: {
      bannerKey: string;
      displayName: string;
      imageUrl: string;
      category?: string;
      rarity?: string;
      priceCoins?: number;
    }
  ): Promise<string | null> {
    if (!(await rbacService.hasPermission(ownerId, 'manage_icons_banners'))) {
      return null;
    }

    try {
      const { data: banner, error } = await this.supabase
        .from('profile_banners')
        .insert({
          banner_key: data.bannerKey,
          display_name: data.displayName,
          image_url: data.imageUrl,
          category: data.category || 'general',
          rarity: data.rarity || 'common',
          price_coins: data.priceCoins,
          created_by: ownerId,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating banner:', error);
        return null;
      }

      return banner.id;
    } catch (error) {
      console.error('Error in createBanner:', error);
      return null;
    }
  }
}

export const godModeService = new GodModeService();
