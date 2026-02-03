/**
 * Role-Based Access Control (RBAC) Service
 * Hierarchical permission system for staff management
 */

import { createClient } from '@/lib/supabase/client';

export type StaffRole = 'user' | 'moderator' | 'admin' | 'owner';

export interface Permission {
  id: string;
  permissionKey: string;
  displayName: string;
  description: string | null;
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserRole {
  userId: string;
  role: StaffRole;
  grantedBy: string | null;
  grantedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface StaffMember {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  role: StaffRole;
  grantedAt: string;
  permissions: string[];
}

// Role hierarchy - higher index = more power
const ROLE_HIERARCHY: StaffRole[] = ['user', 'moderator', 'admin', 'owner'];

class RBACService {
  private supabase = createClient();
  private permissionCache: Map<string, string[]> = new Map();
  private cacheExpiry: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get user's role
   */
  async getUserRole(userId: string): Promise<StaffRole> {
    try {
      const { data, error } = await this.supabase
        .from('staff_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return 'user';
      }

      // Check expiration
      const roleData = await this.supabase
        .from('staff_roles')
        .select('expires_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (roleData.data?.expires_at && new Date(roleData.data.expires_at) < new Date()) {
        // Role expired, deactivate
        await this.supabase
          .from('staff_roles')
          .update({ is_active: false })
          .eq('user_id', userId);
        return 'user';
      }

      return data.role as StaffRole;
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'user';
    }
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(role: StaffRole): Promise<string[]> {
    // Check cache
    const cacheKey = `role_${role}`;
    if (this.permissionCache.has(cacheKey) && Date.now() < this.cacheExpiry) {
      return this.permissionCache.get(cacheKey)!;
    }

    try {
      const { data, error } = await this.supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions!role_permissions_permission_id_fkey (permission_key)
        `)
        .eq('role', role);

      if (error) {
        console.error('Error fetching role permissions:', error);
        return [];
      }

      const permissions = (data || []).map((rp) => (rp.permissions as any).permission_key);
      
      // Update cache
      this.permissionCache.set(cacheKey, permissions);
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return permissions;
    } catch (error) {
      console.error('Error in getRolePermissions:', error);
      return [];
    }
  }

  /**
   * Get user's permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const role = await this.getUserRole(userId);
    return this.getRolePermissions(role);
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: string, permissionKey: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    
    // Owner has all permissions
    if (role === 'owner') {
      return true;
    }

    const permissions = await this.getRolePermissions(role);
    return permissions.includes(permissionKey);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, permissionKeys: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissionKeys.some(key => permissions.includes(key));
  }

  /**
   * Check if user has all specified permissions
   */
  async hasAllPermissions(userId: string, permissionKeys: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissionKeys.every(key => permissions.includes(key));
  }

  /**
   * Check if user is staff (moderator or higher)
   */
  async isStaff(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf('moderator');
  }

  /**
   * Check if user is admin or higher
   */
  async isAdmin(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf('admin');
  }

  /**
   * Check if user is owner
   */
  async isOwner(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return role === 'owner';
  }

  /**
   * Check if user can manage another user's role
   */
  async canManageRole(actorId: string, targetRole: StaffRole): Promise<boolean> {
    const actorRole = await this.getUserRole(actorId);
    
    // Only owner can manage admins
    if (targetRole === 'admin' && actorRole !== 'owner') {
      return false;
    }

    // Must be higher in hierarchy to manage
    return ROLE_HIERARCHY.indexOf(actorRole) > ROLE_HIERARCHY.indexOf(targetRole);
  }

  /**
   * Grant role to user
   */
  async grantRole(
    granterId: string,
    targetUserId: string,
    role: StaffRole,
    expiresAt?: Date,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify granter can assign this role
      if (!(await this.canManageRole(granterId, role))) {
        return { success: false, error: 'Insufficient permissions to grant this role' };
      }

      // Check if target already has a role
      const { data: existing } = await this.supabase
        .from('staff_roles')
        .select('id, role')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .single();

      if (existing) {
        // Update existing role
        await this.supabase
          .from('staff_roles')
          .update({
            role,
            granted_by: granterId,
            granted_at: new Date().toISOString(),
            expires_at: expiresAt?.toISOString() || null,
            notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Create new role
        await this.supabase.from('staff_roles').insert({
          user_id: targetUserId,
          role,
          granted_by: granterId,
          expires_at: expiresAt?.toISOString() || null,
          notes,
        });
      }

      // Log action
      await this.logStaffAction(granterId, 'grant_role', 'user', targetUserId, targetUserId, 
        { role: existing?.role || null }, 
        { role }
      );

      return { success: true };
    } catch (error) {
      console.error('Error granting role:', error);
      return { success: false, error: 'Failed to grant role' };
    }
  }

  /**
   * Revoke role from user
   */
  async revokeRole(
    revokerId: string,
    targetUserId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const targetRole = await this.getUserRole(targetUserId);

      // Verify revoker can revoke this role
      if (!(await this.canManageRole(revokerId, targetRole))) {
        return { success: false, error: 'Insufficient permissions to revoke this role' };
      }

      await this.supabase
        .from('staff_roles')
        .update({
          is_active: false,
          notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', targetUserId)
        .eq('is_active', true);

      // Log action
      await this.logStaffAction(revokerId, 'revoke_role', 'user', targetUserId, targetUserId,
        { role: targetRole },
        { role: 'user' },
        reason
      );

      return { success: true };
    } catch (error) {
      console.error('Error revoking role:', error);
      return { success: false, error: 'Failed to revoke role' };
    }
  }

  /**
   * Get all staff members
   */
  async getStaffMembers(role?: StaffRole): Promise<StaffMember[]> {
    try {
      let query = this.supabase
        .from('staff_roles')
        .select(`
          user_id,
          role,
          granted_at,
          user_profiles!staff_roles_user_id_fkey (
            display_name, username, avatar_url
          )
        `)
        .eq('is_active', true)
        .neq('role', 'user');

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching staff members:', error);
        return [];
      }

      const members: StaffMember[] = [];
      for (const staff of data || []) {
        const profile = staff.user_profiles as any;
        const permissions = await this.getRolePermissions(staff.role);
        
        members.push({
          userId: staff.user_id,
          displayName: profile?.display_name || 'Unknown',
          username: profile?.username || '',
          avatarUrl: profile?.avatar_url,
          role: staff.role,
          grantedAt: staff.granted_at,
          permissions,
        });
      }

      return members;
    } catch (error) {
      console.error('Error in getStaffMembers:', error);
      return [];
    }
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await this.supabase
        .from('permissions')
        .select('*')
        .order('category')
        .order('display_name');

      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }

      return (data || []).map((p) => ({
        id: p.id,
        permissionKey: p.permission_key,
        displayName: p.display_name,
        description: p.description,
        category: p.category,
        riskLevel: p.risk_level,
      }));
    } catch (error) {
      console.error('Error in getAllPermissions:', error);
      return [];
    }
  }

  /**
   * Get permissions grouped by category
   */
  async getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
    const permissions = await this.getAllPermissions();
    const grouped: Record<string, Permission[]> = {};

    for (const permission of permissions) {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    }

    return grouped;
  }

  /**
   * Log staff action
   */
  async logStaffAction(
    staffUserId: string,
    actionType: string,
    targetType?: string,
    targetId?: string,
    targetUserId?: string,
    oldValue?: any,
    newValue?: any,
    reason?: string
  ): Promise<void> {
    try {
      await this.supabase.from('staff_audit_log').insert({
        staff_user_id: staffUserId,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        target_user_id: targetUserId,
        old_value: oldValue,
        new_value: newValue,
        reason,
      });
    } catch (error) {
      console.error('Error logging staff action:', error);
    }
  }

  /**
   * Get audit log
   */
  async getAuditLog(
    options?: {
      staffUserId?: string;
      targetUserId?: string;
      actionType?: string;
      limit?: number;
    }
  ): Promise<Array<{
    id: string;
    staffUserId: string;
    staffName: string;
    actionType: string;
    targetType: string | null;
    targetUserId: string | null;
    targetUserName: string | null;
    oldValue: any;
    newValue: any;
    reason: string | null;
    createdAt: string;
  }>> {
    try {
      let query = this.supabase
        .from('staff_audit_log')
        .select(`
          *,
          staff:user_profiles!staff_audit_log_staff_user_id_fkey (display_name),
          target:user_profiles!staff_audit_log_target_user_id_fkey (display_name)
        `)
        .order('created_at', { ascending: false });

      if (options?.staffUserId) {
        query = query.eq('staff_user_id', options.staffUserId);
      }
      if (options?.targetUserId) {
        query = query.eq('target_user_id', options.targetUserId);
      }
      if (options?.actionType) {
        query = query.eq('action_type', options.actionType);
      }

      query = query.limit(options?.limit || 100);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit log:', error);
        return [];
      }

      return (data || []).map((log) => ({
        id: log.id,
        staffUserId: log.staff_user_id,
        staffName: (log.staff as any)?.display_name || 'Unknown',
        actionType: log.action_type,
        targetType: log.target_type,
        targetUserId: log.target_user_id,
        targetUserName: (log.target as any)?.display_name || null,
        oldValue: log.old_value,
        newValue: log.new_value,
        reason: log.reason,
        createdAt: log.created_at,
      }));
    } catch (error) {
      console.error('Error in getAuditLog:', error);
      return [];
    }
  }

  /**
   * Clear permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
    this.cacheExpiry = 0;
  }

  /**
   * Get role display info
   */
  getRoleInfo(role: StaffRole): {
    name: string;
    color: string;
    icon: string;
    description: string;
  } {
    const roleInfo: Record<StaffRole, { name: string; color: string; icon: string; description: string }> = {
      user: {
        name: 'User',
        color: 'gray',
        icon: '👤',
        description: 'Standard platform user',
      },
      moderator: {
        name: 'Moderator',
        color: 'green',
        icon: '🛡️',
        description: 'Community moderator with limited powers',
      },
      admin: {
        name: 'Admin',
        color: 'blue',
        icon: '⚡',
        description: 'Platform administrator with extended access',
      },
      owner: {
        name: 'Owner',
        color: 'purple',
        icon: '👑',
        description: 'Platform owner with full system access',
      },
    };

    return roleInfo[role];
  }
}

export const rbacService = new RBACService();
