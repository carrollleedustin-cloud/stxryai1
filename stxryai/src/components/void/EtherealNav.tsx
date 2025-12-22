'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

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
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
                  <path
                    d="M18 10l-8 5v10l8 5 8-5V15l-8-5z"
                    fill="var(--void-absolute)"
                  />
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
                      href="/user-dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-lg text-text-secondary"
                    >
                      Dashboard
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
                  <Link
                    href="/authentication"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <button className="btn-spectral w-full">
                      Get Started
                    </button>
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

