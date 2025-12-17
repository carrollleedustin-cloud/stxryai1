'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { backdropVariant } from '@/lib/animations/variants';

interface UserMenuProps {
  className?: string;
}

export default function UserMenu({ className = '' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.push('/login');
  };

  const menuItems = [
    {
      icon: 'UserCircleIcon',
      label: 'Profile',
      description: 'View and edit your profile',
      onClick: () => {
        setIsOpen(false);
        router.push('/user-profile');
      },
    },
    {
      icon: 'ChartBarIcon',
      label: 'Dashboard',
      description: 'View your stats and progress',
      onClick: () => {
        setIsOpen(false);
        router.push('/user-dashboard');
      },
    },
    {
      icon: 'BookmarkIcon',
      label: 'Saved Stories',
      description: 'Your bookmarked content',
      onClick: () => {
        setIsOpen(false);
        // Navigate to saved stories
      },
    },
    {
      icon: 'Cog6ToothIcon',
      label: 'Settings',
      description: 'Preferences and account settings',
      onClick: () => {
        setIsOpen(false);
        router.push('/user-profile');
      },
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted transition-colors"
        aria-label="User menu"
      >
        {/* Avatar Circle */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {getInitials(profile?.display_name)}
          </div>

          {/* Online Status Indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
        </div>

        {/* Name & Subscription (Desktop Only) */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-foreground leading-none mb-1">
            {profile?.display_name || 'User'}
          </p>
          <p className="text-xs text-muted-foreground leading-none">
            {profile?.subscription_tier === 'premium' ? '⭐ Premium' : 'Free'}
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden md:block"
        >
          <Icon name="ChevronDownIcon" size={16} className="text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (mobile only) */}
            <motion.div
              variants={backdropVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-border bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {getInitials(profile?.display_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">
                      {profile?.display_name || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Subscription Badge */}
                {profile?.subscription_tier === 'premium' ? (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="mt-3 p-2 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2"
                  >
                    <Icon
                      name="SparklesIcon"
                      size={16}
                      className="text-yellow-600 dark:text-yellow-400"
                    />
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                      Premium Member
                    </span>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 w-full p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to upgrade page
                    }}
                  >
                    ⭐ Upgrade to Premium
                  </motion.button>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'hsl(var(--color-muted))' }}
                    onClick={item.onClick}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name={item.icon} size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
                  </motion.button>
                ))}
              </div>

              {/* Sign Out */}
              <div className="border-t border-border p-2">
                <motion.button
                  whileHover={{ backgroundColor: 'hsl(var(--color-destructive) / 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 flex items-center gap-3 text-left rounded-lg transition-colors"
                >
                  <Icon name="ArrowRightOnRectangleIcon" size={20} className="text-destructive" />
                  <span className="text-sm font-medium text-destructive">Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
