'use client';

import React, { ReactNode } from 'react';
import { NebulaBackground } from '@/components/nebula/NebulaBackground';
import { NebulaNav } from '@/components/nebula/NebulaNav';
import '@/styles/nebula.css';

/**
 * FAMILY MANAGEMENT LAYOUT
 * For parents to manage their family's StxryAI experience.
 * Clean, professional, but still magical.
 */

interface FamilyLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'Overview', href: '/family' },
  { label: 'Kids Profiles', href: '/family/profiles' },
  { label: 'Content Controls', href: '/family/controls' },
  { label: 'Activity', href: '/family/activity' },
  { label: 'Settings', href: '/family/settings' },
];

export default function FamilyLayout({ children }: FamilyLayoutProps) {
  return (
    <div className="min-h-screen nebula-theme">
      <NebulaBackground variant="cosmos" particleCount={40} />
      
      <NebulaNav 
        items={navItems}
        cta={{ label: 'Kids Zone', href: '/kids-zone', variant: 'secondary' }}
      />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}


