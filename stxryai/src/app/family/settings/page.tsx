'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Bell,
  Shield,
  Eye,
  Lock,
  Mail,
  Smartphone,
  Download,
  Trash2,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Globe,
  CreditCard,
  HelpCircle,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { NebulaBackground } from '@/components/nebula';

/**
 * FAMILY SETTINGS PAGE
 * Account settings, privacy, notifications, and more
 */

type ToggleSetting = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

type NotificationSettings = {
  dailyReports: boolean;
  weeklyDigest: boolean;
  achievementAlerts: boolean;
  screenTimeAlerts: boolean;
  newContentAlerts: boolean;
  securityAlerts: boolean;
};

type PrivacySettings = {
  shareProgress: boolean;
  allowFriendRequests: boolean;
  showOnLeaderboards: boolean;
  dataCollection: boolean;
};

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    dailyReports: true,
    weeklyDigest: true,
    achievementAlerts: true,
    screenTimeAlerts: true,
    newContentAlerts: false,
    securityAlerts: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    shareProgress: true,
    allowFriendRequests: false,
    showOnLeaderboards: false,
    dataCollection: true,
  });

  const [darkMode, setDarkMode] = useState(true);

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key: keyof PrivacySettings) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <motion.button
      onClick={onChange}
      className={`w-12 h-6 rounded-full p-1 transition-colors ${
        enabled ? 'bg-aurora-cyan' : 'bg-white/20'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-white"
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );

  const SettingRow = ({
    icon: Icon,
    label,
    description,
    enabled,
    onChange,
    color = 'cyan',
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
    color?: string;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            color === 'cyan'
              ? 'bg-aurora-cyan/10'
              : color === 'pink'
                ? 'bg-aurora-pink/10'
                : color === 'purple'
                  ? 'bg-aurora-violet/10'
                  : 'bg-white/10'
          }`}
        >
          <Icon
            className={`w-5 h-5 ${
              color === 'cyan'
                ? 'text-aurora-cyan'
                : color === 'pink'
                  ? 'text-aurora-pink'
                  : color === 'purple'
                    ? 'text-aurora-violet'
                    : 'text-white'
            }`}
          />
        </div>
        <div>
          <p className="text-white font-medium">{label}</p>
          <p className="text-sm text-white/50">{description}</p>
        </div>
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} />
    </div>
  );

  const LinkRow = ({
    icon: Icon,
    label,
    href,
    color = 'cyan',
    danger = false,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
    color?: string;
    danger?: boolean;
  }) => (
    <Link href={href}>
      <motion.div
        className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 cursor-pointer"
        whileHover={{ x: 4 }}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              danger
                ? 'bg-red-500/10'
                : color === 'cyan'
                  ? 'bg-aurora-cyan/10'
                  : color === 'pink'
                    ? 'bg-aurora-pink/10'
                    : color === 'purple'
                      ? 'bg-aurora-violet/10'
                      : 'bg-white/10'
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                danger
                  ? 'text-red-400'
                  : color === 'cyan'
                    ? 'text-aurora-cyan'
                    : color === 'pink'
                      ? 'text-aurora-pink'
                      : color === 'purple'
                        ? 'text-aurora-violet'
                        : 'text-white'
              }`}
            />
          </div>
          <p className={`font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
        </div>
        <ChevronRight className={`w-5 h-5 ${danger ? 'text-red-400/50' : 'text-white/30'}`} />
      </motion.div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-nebula-void relative">
      <NebulaBackground variant="subtle" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nebula-void/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-aurora-cyan">
                Stxryai
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/family"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/family/profiles"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Kids Profiles
                </Link>
                <Link
                  href="/family/controls"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Content Controls
                </Link>
                <Link
                  href="/family/activity"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Activity
                </Link>
                <Link
                  href="/family/settings"
                  className="text-sm text-aurora-cyan font-medium relative"
                >
                  Settings
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-aurora-cyan rounded-full" />
                </Link>
              </div>
            </div>
            <Link href="/kids-zone">
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Kids Zone
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-aurora-cyan mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Settings
          </h1>
          <p className="text-white/60">Manage your account and preferences</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-aurora-cyan" />
              Notifications
            </h2>

            <div className="space-y-1">
              <SettingRow
                icon={Mail}
                label="Daily Reports"
                description="Get daily reading summaries via email"
                enabled={notifications.dailyReports}
                onChange={() => toggleNotification('dailyReports')}
              />
              <SettingRow
                icon={Mail}
                label="Weekly Digest"
                description="Receive weekly progress reports"
                enabled={notifications.weeklyDigest}
                onChange={() => toggleNotification('weeklyDigest')}
                color="pink"
              />
              <SettingRow
                icon={Bell}
                label="Achievement Alerts"
                description="Get notified when your child earns badges"
                enabled={notifications.achievementAlerts}
                onChange={() => toggleNotification('achievementAlerts')}
                color="purple"
              />
              <SettingRow
                icon={Smartphone}
                label="Screen Time Alerts"
                description="Alerts when daily limits are reached"
                enabled={notifications.screenTimeAlerts}
                onChange={() => toggleNotification('screenTimeAlerts')}
              />
              <SettingRow
                icon={Bell}
                label="New Content"
                description="Get notified about new stories and games"
                enabled={notifications.newContentAlerts}
                onChange={() => toggleNotification('newContentAlerts')}
                color="pink"
              />
              <SettingRow
                icon={Shield}
                label="Security Alerts"
                description="Important security notifications"
                enabled={notifications.securityAlerts}
                onChange={() => toggleNotification('securityAlerts')}
                color="purple"
              />
            </div>
          </motion.section>

          {/* Privacy */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-aurora-cyan" />
              Privacy & Safety
            </h2>

            <div className="space-y-1">
              <SettingRow
                icon={Eye}
                label="Share Progress"
                description="Allow sharing reading progress with family"
                enabled={privacy.shareProgress}
                onChange={() => togglePrivacy('shareProgress')}
              />
              <SettingRow
                icon={MessageSquare}
                label="Friend Requests"
                description="Allow kids to receive friend requests"
                enabled={privacy.allowFriendRequests}
                onChange={() => togglePrivacy('allowFriendRequests')}
                color="pink"
              />
              <SettingRow
                icon={Globe}
                label="Leaderboards"
                description="Show kids on community leaderboards"
                enabled={privacy.showOnLeaderboards}
                onChange={() => togglePrivacy('showOnLeaderboards')}
                color="purple"
              />
              <SettingRow
                icon={Shield}
                label="Analytics"
                description="Help improve Stxryai with usage data"
                enabled={privacy.dataCollection}
                onChange={() => togglePrivacy('dataCollection')}
              />
            </div>
          </motion.section>

          {/* Appearance */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-aurora-cyan" />
              Appearance
            </h2>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-aurora-violet/10 flex items-center justify-center">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-aurora-violet" />
                  ) : (
                    <Sun className="w-5 h-5 text-aurora-gold" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-sm text-white/50">Toggle dark/light theme</p>
                </div>
              </div>
              <ToggleSwitch enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </div>
          </motion.section>

          {/* Account */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-aurora-cyan" />
              Account
            </h2>

            <div className="space-y-1">
              <LinkRow icon={Lock} label="Change Password" href="/family/settings/password" />
              <LinkRow
                icon={Mail}
                label="Email Preferences"
                href="/family/settings/email"
                color="pink"
              />
              <LinkRow
                icon={CreditCard}
                label="Subscription & Billing"
                href="/family/settings/billing"
                color="purple"
              />
              <LinkRow icon={Download} label="Download My Data" href="/family/settings/data" />
            </div>
          </motion.section>

          {/* Support */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-aurora-cyan" />
              Support
            </h2>

            <div className="space-y-1">
              <LinkRow icon={HelpCircle} label="Help Center" href="/help" />
              <LinkRow icon={MessageSquare} label="Contact Support" href="/support" color="pink" />
              <LinkRow icon={Shield} label="Privacy Policy" href="/privacy" color="purple" />
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20"
          >
            <h2 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" />
              Danger Zone
            </h2>

            <div className="space-y-1">
              <LinkRow icon={LogOut} label="Sign Out" href="/auth/logout" danger />
              <LinkRow icon={Trash2} label="Delete Account" href="/family/settings/delete" danger />
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
