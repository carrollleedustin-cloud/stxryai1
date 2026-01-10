'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { announcementService, Announcement } from '@/services/announcementService';

/**
 * ETHEREAL NAV
 * Navigation that hovers above the void.
 * Minimal, present, never intrusive.
 */
export default function EtherealNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(2, 2, 3, 0)', 'rgba(2, 2, 3, 0.95)']
  );
  const navBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(20px)']);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications/announcements
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        const announcements = await announcementService.getForUser(
          user.id,
          profile?.subscription_tier || 'free'
        );
        setNotifications(announcements);
        const unread = await announcementService.getUnreadCount(
          user.id,
          profile?.subscription_tier || 'free'
        );
        setUnreadCount(unread);
      }
    };
    fetchNotifications();
  }, [user, profile]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleMarkAsRead = async (id: string) => {
    if (user) {
      await announcementService.markAsRead(id, user.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readBy: [...n.readBy, user.id] } : n))
      );
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return '✨';
      case 'maintenance':
        return '🔧';
      case 'warning':
        return '⚠️';
      case 'urgent':
        return '🚨';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const navLinks = [
    { href: '/story-library', label: 'Library' },
    { href: '/community-hub', label: 'Community' },
    { href: '/pricing', label: 'Premium' },
  ];

  return (
    <>
      <motion.header
        style={{
          backgroundColor: navBackground,
          backdropFilter: navBlur,
          WebkitBackdropFilter: navBlur,
        }}
        className={`
          fixed top-0 left-0 right-0 z-50
          border-b transition-colors duration-500
          ${isScrolled ? 'border-membrane' : 'border-transparent'}
        `}
      >
        <nav className="container-void">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                {/* Logo Mark */}
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  className="relative z-10"
                >
                  <path
                    d="M18 2L4 10v16l14 8 14-8V10L18 2z"
                    fill="url(#logo-gradient)"
                    className="transition-all duration-500"
                  />
                  <path d="M18 10l-8 5v10l8 5 8-5V15l-8-5z" fill="var(--void-absolute)" />
                  <defs>
                    <linearGradient id="logo-gradient" x1="4" y1="2" x2="32" y2="34">
                      <stop stopColor="var(--spectral-cyan)" />
                      <stop offset="1" stopColor="var(--spectral-violet)" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Glow effect */}
                <div
                  className="absolute inset-0 blur-lg opacity-50 group-hover:opacity-80 transition-opacity"
                  style={{
                    background: 'radial-gradient(circle, var(--spectral-cyan) 0%, transparent 70%)',
                  }}
                />
              </motion.div>

              <span className="font-display text-lg tracking-widest text-text-primary group-hover:text-spectral-cyan transition-colors">
                STXRY
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative font-ui text-xs font-medium tracking-widest uppercase
                    py-2 transition-colors duration-300
                    ${pathname === link.href ? 'text-spectral-cyan' : 'text-text-tertiary hover:text-text-primary'}
                  `}
                >
                  {link.label}

                  {/* Active indicator */}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-spectral-cyan"
                      style={{ boxShadow: 'var(--glow-cyan)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Messages Link */}
                  <Link
                    href="/messages"
                    className="relative p-2 rounded-lg hover:bg-void-mist transition-colors"
                    title="Messages"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-text-tertiary hover:text-spectral-cyan transition-colors"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {/* Unread indicator would go here */}
                  </Link>

                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-lg hover:bg-void-mist transition-colors"
                      title="Notifications"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-text-tertiary hover:text-spectral-cyan transition-colors"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-spectral-rose rounded-full text-xs flex items-center justify-center text-void-absolute font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] overflow-hidden rounded-xl z-50"
                          style={{
                            background: 'rgba(10, 10, 14, 0.98)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(0, 245, 212, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          <div className="p-4 border-b border-membrane flex items-center justify-between">
                            <h3 className="font-semibold text-text-primary">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="text-xs text-spectral-cyan">
                                {unreadCount} unread
                              </span>
                            )}
                          </div>

                          <div className="overflow-y-auto max-h-[400px]">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center">
                                <div className="text-4xl mb-3">🔔</div>
                                <p className="text-text-secondary text-sm">No notifications yet</p>
                              </div>
                            ) : (
                              notifications.map((notification) => {
                                const isRead = notification.readBy.includes(user?.id || '');
                                return (
                                  <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => {
                                      if (!isRead) handleMarkAsRead(notification.id);
                                      if (notification.metadata?.linkUrl) {
                                        router.push(notification.metadata.linkUrl);
                                        setShowNotifications(false);
                                      }
                                    }}
                                    className={`
                                      p-4 border-b border-membrane/50 cursor-pointer transition-colors
                                      ${isRead ? 'bg-transparent' : 'bg-spectral-cyan/5'}
                                      hover:bg-void-mist
                                    `}
                                  >
                                    <div className="flex gap-3">
                                      <span className="text-xl flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <h4
                                            className={`text-sm font-medium ${isRead ? 'text-text-secondary' : 'text-text-primary'}`}
                                          >
                                            {notification.title}
                                          </h4>
                                          {!isRead && (
                                            <span className="w-2 h-2 rounded-full bg-spectral-cyan flex-shrink-0 mt-1" />
                                          )}
                                        </div>
                                        <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
                                          {notification.content}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <span className="text-xs text-text-tertiary">
                                            {formatTimeAgo(notification.createdAt)}
                                          </span>
                                          {notification.metadata?.linkUrl && (
                                            <span className="text-xs text-spectral-cyan">
                                              {notification.metadata.linkText || 'View'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })
                            )}
                          </div>

                          <div className="p-3 border-t border-membrane">
                            <Link
                              href="/notifications"
                              onClick={() => setShowNotifications(false)}
                              className="block w-full text-center py-2 text-sm text-spectral-cyan hover:text-spectral-violet transition-colors"
                            >
                              View All Notifications
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    href="/user-dashboard"
                    className="hidden md:block font-ui text-xs font-medium tracking-widest uppercase text-text-tertiary hover:text-spectral-cyan transition-colors"
                  >
                    Dashboard
                  </Link>

                  {/* User Menu */}
                  <div className="relative group">
                    <button className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-void-mist transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center text-void-absolute font-medium text-sm">
                        {profile?.display_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden md:block text-sm text-text-secondary">
                        {profile?.display_name || 'User'}
                      </span>
                    </button>

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="void-glass-heavy rounded-xl p-2">
                        <Link
                          href="/user-profile"
                          className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-void-mist transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/messages"
                          className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-void-mist transition-colors"
                        >
                          Messages
                        </Link>
                        <Link
                          href="/achievements"
                          className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-void-mist transition-colors"
                        >
                          Achievements
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-void-mist transition-colors"
                        >
                          Settings
                        </Link>
                        <div className="h-px bg-membrane my-2" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-spectral-rose hover:bg-void-mist transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/authentication"
                    className="hidden md:block font-ui text-xs font-medium tracking-widest uppercase text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    Sign In
                  </Link>

                  <Link href="/authentication?mode=signup">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-spectral py-2.5 px-5 text-xs"
                    >
                      Begin
                    </motion.button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative w-10 h-10 flex items-center justify-center"
              >
                <div className="relative w-6 h-4">
                  <motion.span
                    animate={{
                      rotate: isMobileMenuOpen ? 45 : 0,
                      y: isMobileMenuOpen ? 6 : 0,
                    }}
                    className="absolute left-0 top-0 w-full h-0.5 bg-text-primary rounded-full"
                  />
                  <motion.span
                    animate={{
                      opacity: isMobileMenuOpen ? 0 : 1,
                    }}
                    className="absolute left-0 top-1.5 w-full h-0.5 bg-text-primary rounded-full"
                  />
                  <motion.span
                    animate={{
                      rotate: isMobileMenuOpen ? -45 : 0,
                      y: isMobileMenuOpen ? -6 : 0,
                    }}
                    className="absolute left-0 bottom-0 w-full h-0.5 bg-text-primary rounded-full"
                  />
                </div>
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-void-absolute/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.nav
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="relative pt-24 px-6"
            >
              <div className="space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        block py-4 font-display text-2xl tracking-wider
                        ${pathname === link.href ? 'text-spectral-cyan' : 'text-text-secondary'}
                      `}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-membrane">
                {user ? (
                  <div className="space-y-4">
                    <Link
                      href="/messages"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-lg text-text-secondary"
                    >
                      <span>💬</span> Messages
                    </Link>
                    <Link
                      href="/user-dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-lg text-text-secondary"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/achievements"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-lg text-text-secondary"
                    >
                      Achievements
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-spectral-rose"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link href="/authentication" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="btn-spectral w-full">Get Started</button>
                  </Link>
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
