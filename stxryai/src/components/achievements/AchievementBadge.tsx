'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  achievementId: string;
  name: string;
  category: string;
  rarity: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  unlocked?: boolean;
  className?: string;
}

// Custom SVG icons for different achievement categories
const AchievementIcons: Record<string, React.ReactNode> = {
  // Reading achievements
  'first-steps': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.2" />
      <path d="M30 50 L45 65 L70 35" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  ),
  'bookworm': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="25" y="20" width="50" height="60" rx="4" fill="currentColor" opacity="0.3" />
      <line x1="35" y1="30" x2="65" y2="30" stroke="currentColor" strokeWidth="3" />
      <line x1="35" y1="40" x2="65" y2="40" stroke="currentColor" strokeWidth="2" />
      <line x1="35" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="2" />
      <line x1="35" y1="60" x2="65" y2="60" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  'literary-scholar': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M30 30 L50 20 L70 30 L70 70 L50 80 L30 70 Z" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.5" />
      <text x="50" y="55" textAnchor="middle" fontSize="20" fill="currentColor" fontWeight="bold">S</text>
    </svg>
  ),
  'master-reader': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="35" fill="currentColor" opacity="0.2" />
      <path d="M50 20 L60 45 L85 45 L65 60 L75 85 L50 70 L25 85 L35 60 L15 45 L40 45 Z" fill="currentColor" />
    </svg>
  ),
  'speed-reader': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M50 20 L50 50 L70 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
      <path d="M20 20 L30 30 M80 20 L70 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  // Exploration achievements
  'path-finder': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="30" cy="30" r="8" fill="currentColor" />
      <circle cx="70" cy="30" r="8" fill="currentColor" />
      <circle cx="50" cy="70" r="8" fill="currentColor" />
      <path d="M30 30 Q50 50 70 30" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M30 30 Q50 50 50 70" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M70 30 Q50 50 50 70" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  ),
  'completionist': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="35" fill="currentColor" opacity="0.2" />
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M40 50 L47 57 L60 44" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  ),
  // Social achievements
  'social-butterfly': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <ellipse cx="50" cy="50" rx="35" ry="25" fill="currentColor" opacity="0.3" />
      <circle cx="35" cy="45" r="8" fill="currentColor" />
      <circle cx="50" cy="40" r="8" fill="currentColor" />
      <circle cx="65" cy="45" r="8" fill="currentColor" />
      <path d="M30 60 Q50 70 70 60" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  ),
  'influencer': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="30" fill="currentColor" opacity="0.3" />
      <path d="M50 20 L55 40 L75 40 L60 52 L65 72 L50 60 L35 72 L40 52 L25 40 L45 40 Z" fill="currentColor" />
    </svg>
  ),
  // Streak achievements
  'consistent-reader': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="50" r="20" fill="currentColor" />
      <path d="M40 50 L47 57 L60 44" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ),
  'dedicated': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M50 20 L60 45 L85 45 L65 60 L75 85 L50 70 L25 85 L35 60 L15 45 L40 45 Z" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="50" r="25" fill="currentColor" />
      <text x="50" y="60" textAnchor="middle" fontSize="24" fill="white" fontWeight="bold">30</text>
    </svg>
  ),
  // Creation achievements
  'storyteller': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="30" y="25" width="40" height="50" rx="4" fill="currentColor" opacity="0.3" />
      <line x1="40" y1="35" x2="60" y2="35" stroke="currentColor" strokeWidth="3" />
      <line x1="40" y1="45" x2="60" y2="45" stroke="currentColor" strokeWidth="2" />
      <line x1="40" y1="55" x2="60" y2="55" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="65" r="5" fill="currentColor" />
    </svg>
  ),
  // Special achievements
  'early-adopter': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M50 15 L60 40 L85 40 L65 55 L75 80 L50 65 L25 80 L35 55 L15 40 L40 40 Z" fill="currentColor" />
      <circle cx="50" cy="50" r="8" fill="white" />
    </svg>
  ),
  'genre-master': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="35" fill="currentColor" opacity="0.2" />
      <path d="M50 20 L55 45 L80 45 L60 60 L65 80 L50 70 L35 80 L40 60 L20 45 L45 45 Z" fill="currentColor" />
      <circle cx="50" cy="50" r="15" fill="white" opacity="0.9" />
      <text x="50" y="58" textAnchor="middle" fontSize="20" fill="currentColor" fontWeight="bold">G</text>
    </svg>
  ),
};

// Fallback icon
const DefaultIcon = (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="35" fill="currentColor" opacity="0.3" />
    <path d="M50 25 L60 50 L85 50 L65 65 L75 85 L50 70 L25 85 L35 65 L15 50 L40 50 Z" fill="currentColor" />
  </svg>
);

export default function AchievementBadge({
  achievementId,
  name,
  category,
  rarity,
  size = 'md',
  unlocked = true,
  className = '',
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
  };

  // Get icon based on achievement name/id
  const iconKey = achievementId.toLowerCase().replace(/\s+/g, '-');
  const CustomIcon = AchievementIcons[iconKey] || DefaultIcon;

  const rarityColors = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400',
    mythic: 'text-pink-400',
  };

  const colorClass = rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common;

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative`}
      whileHover={unlocked ? { scale: 1.1, rotate: 5 } : {}}
      animate={unlocked ? { 
        y: [0, -5, 0],
        rotate: [0, 2, -2, 0]
      } : {}}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse'
      }}
    >
      {/* Glow effect for unlocked achievements */}
      {unlocked && (
        <motion.div
          className={`absolute inset-0 ${colorClass} opacity-30 blur-xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}

      {/* Badge container */}
      <div className={`relative w-full h-full ${colorClass} ${!unlocked ? 'opacity-40 grayscale' : ''}`}>
        {CustomIcon}
      </div>

      {/* Lock overlay for locked achievements */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-1/2 h-1/2 text-gray-600">
            <rect x="35" y="45" width="30" height="35" rx="4" fill="currentColor" />
            <path d="M40 45 L40 35 A10 10 0 0 1 60 35 L60 45" stroke="currentColor" strokeWidth="4" fill="none" />
          </svg>
        </div>
      )}

      {/* Rarity border */}
      <div className={`absolute inset-0 border-4 ${colorClass} rounded-full opacity-50 ${unlocked ? '' : 'border-dashed'}`} />
    </motion.div>
  );
}

