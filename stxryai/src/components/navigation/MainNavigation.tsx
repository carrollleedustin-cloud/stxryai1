'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { rbacService, StaffRole } from '@/services/rbacService';
import {
  Home, BookOpen, Feather, User, Settings, Heart, Trophy,
  Shield, Crown, Zap, Users, Bell, Search, Menu, X,
  MessageSquare, Award, Calendar, Gift, Sparkles, ChevronDown,
  Library, Compass, PenTool, Globe, Star, Flame
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  children?: NavItem[];
  roles?: StaffRole[];
}

const mainNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Library', href: '/story-library', icon: BookOpen },
  { label: 'Explore', href: '/search', icon: Compass },
  {
    label: 'Create',
    href: '/dashboard/create',
    icon: PenTool,
    children: [
      { label: 'Story Editor', href: '/dashboard/create', icon: Feather },
      { label: 'Writers Desk', href: '/writers-desk', icon: PenTool },
      { label: 'World Hub', href: '/world-hub', icon: Globe },
    ],
  },
  {
    label: 'Community',
    href: '/community-hub',
    icon: Users,
    children: [
      { label: 'Community Hub', href: '/community-hub', icon: Users },
      { label: 'Book Clubs', href: '/clubs', icon: Library },
      { label: 'Leaderboards', href: '/leaderboards', icon: Trophy },
      { label: 'Forums', href: '/forums', icon: MessageSquare },
    ],
  },
];

const userNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/user-dashboard', icon: Home },
  { label: 'My Profile', href: '/user-profile', icon: User },
  { label: 'My Identity', href: '/my-identity', icon: Compass },
  { label: 'Memories', href: '/memories', icon: BookOpen },
  { label: 'Pets', href: '/pets', icon: Heart },
  { label: 'Season Pass', href: '/season-pass', icon: Trophy },
  { label: 'Achievements', href: '/achievements', icon: Award },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const staffNavItems: NavItem[] = [
  { label: 'Staff Hub', href: '/admin', icon: Shield, roles: ['moderator', 'admin', 'owner'] },
  { label: 'Mod Tools', href: '/admin/mod-dashboard', icon: Shield, roles: ['moderator', 'admin', 'owner'] },
  { label: 'Admin Panel', href: '/admin', icon: Zap, roles: ['admin', 'owner'] },
  { label: 'God Mode', href: '/admin/owner-dashboard', icon: Crown, roles: ['owner'] },
];

export function MainNavigation() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [userRole, setUserRole] = useState<StaffRole>('user');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    async function loadRole() {
      if (user) {
        const role = await rbacService.getUserRole(user.id);
        setUserRole(role);
      }
    }
    loadRole();
  }, [user]);

  const isStaff = ['moderator', 'admin', 'owner'].includes(userRole);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-void-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 5 }}
              className="p-2 bg-gradient-to-br from-spectral-cyan/30 to-purple-500/30 rounded-xl"
            >
              <BookOpen className="w-6 h-6 text-spectral-cyan" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-spectral-cyan to-purple-400 bg-clip-text text-transparent">
              StxryAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                isActive={pathname === item.href || (item.children && item.children.some(c => pathname === c.href))}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-void-300"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {user ? (
              <>
                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 text-void-300"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                      {notificationCount}
                    </span>
                  )}
                </motion.button>

                {/* User Menu */}
                <UserMenu
                  profile={profile}
                  userRole={userRole}
                  isStaff={isStaff}
                  staffItems={staffNavItems.filter(item => 
                    !item.roles || item.roles.includes(userRole)
                  )}
                />
              </>
            ) : (
              <Link href="/authentication">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-spectral-cyan to-purple-500 text-white rounded-lg font-medium"
                >
                  Sign In
                </motion.button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-void-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            mainItems={mainNavItems}
            userItems={user ? userNavItems : []}
            staffItems={isStaff ? staffNavItems.filter(item => 
              !item.roles || item.roles.includes(userRole)
            ) : []}
            pathname={pathname}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavItemComponent({ item, isActive, activeDropdown, setActiveDropdown }: {
  item: NavItem;
  isActive: boolean;
  activeDropdown: string | null;
  setActiveDropdown: (key: string | null) => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isOpen = activeDropdown === item.label;

  if (hasChildren) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setActiveDropdown(isOpen ? null : item.label)}
          whileHover={{ scale: 1.02 }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-white/10 text-white'
              : 'text-void-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-48 bg-void-800 border border-white/10 rounded-xl shadow-xl overflow-hidden"
            >
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setActiveDropdown(null)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-void-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <child.icon className="w-4 h-4" />
                  {child.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-void-300 hover:text-white hover:bg-white/5'
        }`}
      >
        <item.icon className="w-4 h-4" />
        {item.label}
        {item.badge && (
          <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
            {item.badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
}

function UserMenu({ profile, userRole, isStaff, staffItems }: {
  profile: any;
  userRole: StaffRole;
  isStaff: boolean;
  staffItems: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const roleInfo = rbacService.getRoleInfo(userRole);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
          userRole === 'owner' 
            ? 'from-purple-500 to-pink-500' 
            : userRole === 'admin'
            ? 'from-blue-500 to-cyan-500'
            : userRole === 'moderator'
            ? 'from-emerald-500 to-green-500'
            : 'from-spectral-cyan to-purple-500'
        } flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">
            {profile?.display_name?.[0] || 'U'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-void-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-64 bg-void-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <p className="font-medium text-white">{profile?.display_name}</p>
              <p className="text-sm text-void-400">@{profile?.username}</p>
              {isStaff && (
                <span className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                  userRole === 'owner' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : userRole === 'admin'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {roleInfo.icon} {roleInfo.name}
                </span>
              )}
            </div>

            {/* User Navigation */}
            <div className="p-2">
              {userNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-void-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Staff Navigation */}
            {isStaff && staffItems.length > 0 && (
              <>
                <div className="px-4 py-2 border-t border-white/10">
                  <p className="text-xs text-void-500 uppercase tracking-wider">Staff Tools</p>
                </div>
                <div className="p-2">
                  {staffItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        item.label === 'God Mode'
                          ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                          : 'text-void-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Sign Out */}
            <div className="p-2 border-t border-white/10">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMenu({ mainItems, userItems, staffItems, pathname, onClose }: {
  mainItems: NavItem[];
  userItems: NavItem[];
  staffItems: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="lg:hidden bg-void-900 border-b border-white/10"
    >
      <div className="px-4 py-4 space-y-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  pathname === item.href
                    ? 'bg-white/10 text-white'
                    : 'text-void-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
              {item.children && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                        pathname === child.href
                          ? 'bg-white/10 text-white'
                          : 'text-void-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <child.icon className="w-4 h-4" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Items */}
        {userItems.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-1">
            {userItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  pathname === item.href
                    ? 'bg-white/10 text-white'
                    : 'text-void-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Staff Items */}
        {staffItems.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-1">
            <p className="px-4 text-xs text-void-500 uppercase tracking-wider mb-2">Staff Tools</p>
            {staffItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  item.label === 'God Mode'
                    ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                    : pathname === item.href
                    ? 'bg-white/10 text-white'
                    : 'text-void-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MainNavigation;
