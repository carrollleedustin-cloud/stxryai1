'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * MAGIC NAVIGATION - Kids Zone
 * A floating, bouncy navigation bar that kids will love!
 * Appears at the bottom on mobile for easy thumb reach.
 */

interface MagicNavItem {
  icon: ReactNode;
  label: string;
  href: string;
  color?: string;
}

interface MagicNavProps {
  items: MagicNavItem[];
  className?: string;
}

export function MagicNav({ items, className = '' }: MagicNavProps) {
  const pathname = usePathname();
  
  return (
    <motion.nav
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${className}`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-full"
        style={{
          background: 'rgba(26,26,46,0.95)',
          border: '2px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 60px rgba(155,93,229,0.2)',
        }}
      >
        {items.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className="relative flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="relative w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: isActive 
                      ? `linear-gradient(135deg, ${item.color || '#9b5de5'}, ${item.color ? item.color + '99' : '#f15bb5'})`
                      : 'rgba(255,255,255,0.05)',
                  }}
                  animate={isActive ? {
                    boxShadow: [
                      `0 0 20px ${item.color || '#9b5de5'}50`,
                      `0 0 40px ${item.color || '#9b5de5'}70`,
                      `0 0 20px ${item.color || '#9b5de5'}50`,
                    ],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  
                  {/* Active ring */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-[-3px] rounded-full"
                      style={{
                        border: '2px solid rgba(255,255,255,0.3)',
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    />
                  )}
                </motion.div>
                
                {/* Label (shows on hover or when active) */}
                <motion.span
                  className="absolute -bottom-6 text-[10px] font-bold whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-kids)',
                    color: isActive ? '#00f5d4' : 'rgba(255,255,255,0.5)',
                  }}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -5 }}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}

/**
 * MAGIC TOP BAR - Kids Zone Header
 */
interface MagicTopBarProps {
  title?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  showCoins?: number;
  className?: string;
}

export function MagicTopBar({
  title,
  leftAction,
  rightAction,
  showCoins,
  className = '',
}: MagicTopBarProps) {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(26,26,46,0.98) 0%, rgba(26,26,46,0.8) 70%, transparent 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left action */}
        <div className="w-20">
          {leftAction}
        </div>
        
        {/* Center title */}
        {title && (
          <motion.h1
            className="text-lg font-bold"
            style={{
              fontFamily: 'var(--font-kids)',
              background: 'linear-gradient(135deg, #9b5de5, #f15bb5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {title}
          </motion.h1>
        )}
        
        {/* Right action / coins */}
        <div className="w-20 flex justify-end">
          {showCoins !== undefined && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(254,228,64,0.2), rgba(255,128,64,0.2))',
                border: '2px solid rgba(254,228,64,0.3)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold text-[#fee440]">{showCoins}</span>
            </motion.div>
          )}
          {rightAction}
        </div>
      </div>
    </div>
  );
}

/**
 * MAGIC BREADCRUMB - Playful navigation trail
 */
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface MagicBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function MagicBreadcrumb({ items, className = '' }: MagicBreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link href={item.href}>
                <motion.span
                  className="flex items-center gap-1 text-sm"
                  style={{
                    fontFamily: 'var(--font-kids)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                  whileHover={{ color: '#00f5d4' }}
                >
                  {item.icon}
                  {item.label}
                </motion.span>
              </Link>
            ) : (
              <span
                className="flex items-center gap-1 text-sm font-semibold"
                style={{
                  fontFamily: 'var(--font-kids)',
                  color: '#00f5d4',
                }}
              >
                {item.icon}
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <motion.span
                className="text-white/30"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ›
              </motion.span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default MagicNav;


