/**
 * Access Control Utilities
 * Handles role-based access control and premium feature checks
 */

import { UserProfile } from '@/types/database';
import { SubscriptionTier } from '@/services/subscriptionService';

export type UserRole = 'user' | 'moderator' | 'admin' | 'owner';

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserProfile | null, role: UserRole): boolean {
  if (!user) return false;

  const roleHierarchy: Record<UserRole, number> = {
    user: 0,
    moderator: 1,
    admin: 2,
    owner: 3,
  };

  const userRole = (user.role || 'user') as UserRole;
  const requiredLevel = roleHierarchy[role];
  const userLevel = roleHierarchy[userRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if user has moderator or higher access
 */
export function isModeratorOrAbove(user: UserProfile | null): boolean {
  return hasRole(user, 'moderator');
}

/**
 * Check if user has admin or higher access
 */
export function isAdminOrAbove(user: UserProfile | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is owner
 */
export function isOwner(user: UserProfile | null): boolean {
  return hasRole(user, 'owner');
}

/**
 * Check if user has premium subscription
 */
export function hasPremiumAccess(user: UserProfile | null): boolean {
  if (!user) return false;

  const premiumTiers: SubscriptionTier[] = ['premium', 'creator_pro', 'enterprise'];
  return premiumTiers.includes(user.tier as SubscriptionTier);
}

/**
 * Check if user has access to a premium feature
 */
export function canAccessPremiumFeature(
  user: UserProfile | null,
  feature: string
): AccessCheckResult {
  if (!user) {
    return {
      allowed: false,
      reason: 'You must be logged in to access this feature',
    };
  }

  // Owners and admins get all features
  if (isAdminOrAbove(user)) {
    return { allowed: true };
  }

  // Check premium subscription
  if (!hasPremiumAccess(user)) {
    return {
      allowed: false,
      reason: 'This feature requires a premium subscription. Upgrade to unlock premium features.',
    };
  }

  return { allowed: true };
}

/**
 * Check if user can access admin/mod dashboard
 */
export function canAccessAdminDashboard(user: UserProfile | null): AccessCheckResult {
  if (!user) {
    return {
      allowed: false,
      reason: 'You must be logged in to access the admin dashboard',
    };
  }

  if (!isModeratorOrAbove(user)) {
    return {
      allowed: false,
      reason: 'You do not have permission to access the admin dashboard',
    };
  }

  return { allowed: true };
}

/**
 * Check if user can access owner dashboard
 */
export function canAccessOwnerDashboard(user: UserProfile | null): AccessCheckResult {
  if (!user) {
    return {
      allowed: false,
      reason: 'You must be logged in to access the owner dashboard',
    };
  }

  if (!isOwner(user)) {
    return {
      allowed: false,
      reason: 'Only owners can access this dashboard',
    };
  }

  return { allowed: true };
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    user: 'User',
    moderator: 'Moderator',
    admin: 'Admin',
    owner: 'Owner',
  };
  return names[role] || 'User';
}

/**
 * Get user's role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    user: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    moderator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    owner: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
  };
  return colors[role] || colors.user;
}
