'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * NEBULA NAVIGATION
 * A navigation that floats through dimensions.
 * Always there, never intrusive.
 */

interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface NebulaNavProps {
  items: NavItem[];
  logo?: ReactNode;
  cta?: {
    label: string;
    href: string;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

export function NebulaNav({ items, logo, cta, className = '' }: NebulaNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
  const navBlur = useTransform(scrollY, [0, 100], [20, 40]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 ${className}`}
        style={{
          backdropFilter: `blur(${navBlur}px)`,
          WebkitBackdropFilter: `blur(${navBlur}px)`,
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: isScrolled
              ? 'rgba(3,3,10,0.95)'
              : 'linear-gradient(180deg, rgba(3,3,10,0.9) 0%, rgba(3,3,10,0.6) 70%, transparent 100%)',
            opacity: navOpacity,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center">
              {logo || (
                <motion.div
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #00ffd5, #8020ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  Stxryai
                </motion.div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className="relative px-4 py-2 rounded-lg"
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <span
                        className="text-sm font-medium tracking-wide uppercase"
                        style={{
                          color: isActive ? '#00ffd5' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {item.label}
                      </span>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00ffd5]"
                          layoutId="activeNav"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          style={{
                            boxShadow: '0 0 10px rgba(0,255,213,0.8)',
                          }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* CTA Button */}
            {cta && (
              <Link href={cta.href} className="hidden md:block">
                <motion.button
                  className="px-6 py-2.5 rounded-lg font-medium text-sm tracking-wide"
                  style={{
                    background:
                      cta.variant === 'secondary'
                        ? 'linear-gradient(135deg, #8020ff, #c020ff)'
                        : '#00ffd5',
                    color: cta.variant === 'secondary' ? '#ffffff' : '#000000',
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow:
                      cta.variant === 'secondary'
                        ? '0 0 30px rgba(128,32,255,0.4)'
                        : '0 0 30px rgba(0,255,213,0.4)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cta.label}
                </motion.button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden relative z-10 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <motion.span
                className="w-6 h-0.5 bg-white rounded-full"
                animate={{
                  rotate: mobileOpen ? 45 : 0,
                  y: mobileOpen ? 4 : 0,
                }}
              />
              <motion.span
                className="w-6 h-0.5 bg-white rounded-full"
                animate={{
                  opacity: mobileOpen ? 0 : 1,
                  scaleX: mobileOpen ? 0 : 1,
                }}
              />
              <motion.span
                className="w-6 h-0.5 bg-white rounded-full"
                animate={{
                  rotate: mobileOpen ? -45 : 0,
                  y: mobileOpen ? -4 : 0,
                }}
              />
            </motion.button>
          </div>
        </div>

        {/* Border glow when scrolled */}
        {isScrolled && (
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,255,213,0.3), transparent)',
            }}
          />
        )}
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              className="absolute inset-x-4 top-24 bg-[#0c0c1e] rounded-2xl border border-white/10 overflow-hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="p-4 space-y-2">
                {items.map((item, index) => {
                  const isActive = pathname === item.href;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={item.href}>
                        <div
                          className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{
                            background: isActive ? 'rgba(0,255,213,0.1)' : 'transparent',
                            borderLeft: isActive ? '3px solid #00ffd5' : '3px solid transparent',
                          }}
                        >
                          {item.icon && <span className="text-xl">{item.icon}</span>}
                          <span
                            className="font-medium"
                            style={{
                              color: isActive ? '#00ffd5' : 'rgba(255,255,255,0.8)',
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                {cta && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: items.length * 0.05 }}
                    className="pt-4 border-t border-white/10"
                  >
                    <Link href={cta.href}>
                      <div
                        className="flex items-center justify-center px-4 py-3 rounded-xl font-medium"
                        style={{
                          background: '#00ffd5',
                          color: '#000000',
                        }}
                      >
                        {cta.label}
                      </div>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default NebulaNav;
