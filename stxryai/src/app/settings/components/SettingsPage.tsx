'use client';

/**
 * Comprehensive User Settings Page
 * Account, Preferences, Subscription, Privacy, Notifications
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import GlobalNav from '@/components/common/GlobalNav';
import { authService } from '@/services/authService';
import { UserProfile } from '@/types/database';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type SettingsTab = 'account' | 'preferences' | 'subscription' | 'privacy' | 'notifications';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const { user, profile, refreshProfile, loading } = useAuth();

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'subscription', label: 'Subscription', icon: '💳' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/authentication?redirect=/settings');
    return null;
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <GlobalNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              {activeTab === 'account' && (
                <AccountSettings user={user} profile={profile} refreshProfile={refreshProfile} />
              )}
              {activeTab === 'preferences' && <PreferencesSettings />}
              {activeTab === 'subscription' && <SubscriptionSettings profile={profile} />}
              {activeTab === 'privacy' && <PrivacySettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountSettings({
  user,
  profile,
  refreshProfile,
}: {
  user: any;
  profile: UserProfile;
  refreshProfile: () => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
  });

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    toast.loading('Saving changes...');

    try {
      await authService.updateUserProfile(user.id, {
        display_name: formData.display_name,
        username: formData.username,
        bio: formData.bio,
      });
      await refreshProfile();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    toast.loading('Uploading photo...');

    try {
      await authService.uploadAvatar(user.id, file);
      await refreshProfile();
      toast.dismiss();
      toast.success('Profile photo updated!');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Account Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Update your account details and profile information
        </p>
      </div>

      {/* Profile Picture */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={formData.display_name || 'Profile'} 
              className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
              {formData.display_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <button 
            onClick={handleAvatarClick}
            disabled={isUploadingAvatar}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            JPG, GIF, PNG or WebP. Max size 2MB.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            disabled={!isEditing || isLoading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={!isEditing || isLoading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Email cannot be changed. Contact support if you need assistance.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={!isEditing || isLoading}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

function PreferencesSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Preferences</h2>
        <p className="text-gray-600 dark:text-gray-400">Customize your reading experience</p>
      </div>

      {/* Reading Preferences */}
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Auto-save Progress</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically save your reading progress
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Mature Content</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Show stories with mature content
            </p>
          </div>
          <input type="checkbox" className="w-5 h-5" />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive story updates via email
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Analytics</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Help us improve with anonymous usage data
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>
      </div>

      <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
        Save Preferences
      </button>
    </div>
  );
}

function SubscriptionSettings({ profile }: { profile: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const tier = profile?.subscription_tier || profile?.tier || 'free';
  const userId = profile?.id;

  const handleUpgrade = async (targetTier: 'premium' | 'pro') => {
    if (!userId) {
      toast.error('Please log in to upgrade');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tier: targetTier,
          period: 'monthly',
          successUrl: `${window.location.origin}/settings?subscription=success`,
          cancelUrl: `${window.location.origin}/settings?subscription=canceled`,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          returnUrl: `${window.location.origin}/settings`,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open subscription portal.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTierDisplayName = (t: string) => {
    switch (t) {
      case 'creator_pro':
      case 'pro':
        return 'Creator Pro';
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  const getTierPrice = (t: string) => {
    switch (t) {
      case 'creator_pro':
      case 'pro':
        return '$15';
      case 'premium':
        return '$7.14';
      case 'enterprise':
        return 'Custom';
      default:
        return '$0';
    }
  };

  const isPaidTier = tier !== 'free';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Subscription</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your subscription plan</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {getTierDisplayName(tier)}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-purple-600">
              {getTierPrice(tier)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">/month</p>
          </div>
        </div>
        
        {isPaidTier && (
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Manage Subscription →'}
          </button>
        )}
      </div>

      {/* Energy Status */}
      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">⚡ Energy Status</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {['creator_pro', 'pro', 'enterprise'].includes(tier)
                ? 'Unlimited Energy'
                : tier === 'premium'
                  ? '100 Energy (refills 2x faster)'
                  : '20 Energy (refills slowly)'}
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      {!['creator_pro', 'pro', 'enterprise'].includes(tier) && (
        <div className="space-y-3">
          <p className="font-medium text-gray-900 dark:text-white">Upgrade Your Plan</p>
          {tier === 'free' && (
            <>
              <button 
                onClick={() => handleUpgrade('premium')}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Upgrade to Premium - $7.14/month'}
              </button>
              <button 
                onClick={() => handleUpgrade('pro')}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Upgrade to Creator Pro - $15/month'}
              </button>
            </>
          )}
          {tier === 'premium' && (
            <button 
              onClick={() => handleUpgrade('pro')}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Upgrade to Creator Pro - $15/month'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy & Security
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Control your privacy and security settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Profile Visibility</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Make your profile public</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Show Reading Activity</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Let friends see what you're reading
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="py-3">
          <button className="text-purple-600 hover:text-purple-700 font-medium">
            Change Password →
          </button>
        </div>

        <div className="py-3">
          <button className="text-red-600 hover:text-red-700 font-medium">Delete Account →</button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage how you receive notifications</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive push notifications on this device
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Story Updates</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              New chapters from followed authors
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Social Activity</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comments, likes, and mentions
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Marketing Emails</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Promotional content and special offers
            </p>
          </div>
          <input type="checkbox" className="w-5 h-5" />
        </div>
      </div>

      <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
        Save Notification Settings
      </button>
    </div>
  );
}
