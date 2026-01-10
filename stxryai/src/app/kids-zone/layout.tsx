'use client';

import React, { ReactNode } from 'react';
import { NebulaBackground } from '@/components/nebula/NebulaBackground';
import { MagicNav } from '@/components/nebula/MagicNav';
import '@/styles/nebula.css';

/**
 * KIDS ZONE LAYOUT
 * A magical, safe space for young readers.
 * Everything is designed for delight and wonder.
 */

interface KidsZoneLayoutProps {
  children: ReactNode;
}

const kidsNavItems = [
  { icon: '🏠', label: 'Home', href: '/kids-zone', color: '#9b5de5' },
  { icon: '📚', label: 'Stories', href: '/kids-zone/stories', color: '#f15bb5' },
  { icon: '🎮', label: 'Games', href: '/kids-zone/games', color: '#00f5d4' },
  { icon: '⭐', label: 'My Stuff', href: '/kids-zone/my-stuff', color: '#fee440' },
  { icon: '👤', label: 'Profile', href: '/kids-zone/profile', color: '#00bbf9' },
];

export default function KidsZoneLayout({ children }: KidsZoneLayoutProps) {
  return (
    <div className="min-h-screen kids-theme">
      {/* Magical background */}
      <NebulaBackground variant="kids" particleCount={60} />

      {/* Floating stars decoration */}
      <div className="floating-stars" />

      {/* Main content */}
      <main className="relative z-10 pb-32 pt-4">{children}</main>

      {/* Bottom navigation */}
      <MagicNav items={kidsNavItems} />
    </div>
  );
}
