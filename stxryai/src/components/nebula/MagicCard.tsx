'use client';

import React, { ReactNode, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * MAGIC CARD - Kids Zone
 * Where imagination comes to life!
 * Cards that feel like holding magic in your hands.
 */

interface MagicCardProps {
  children: ReactNode;
  className?: string;
  color?: 'purple' | 'pink' | 'cyan' | 'gold' | 'rainbow';
  bouncy?: boolean;
  sparkles?: boolean;
  onClick?: () => void;
}

const COLOR_SCHEMES = {
  purple: {
    gradient: 'linear-gradient(135deg, rgba(155,93,229,0.25), rgba(200,182,255,0.15))',
    border: 'rgba(155,93,229,0.4)',
    glow: '0 0 40px rgba(155,93,229,0.4)',
    accent: '#9b5de5',
  },
  pink: {
    gradient: 'linear-gradient(135deg, rgba(241,91,181,0.25), rgba(255,173,173,0.15))',
    border: 'rgba(241,91,181,0.4)',
    glow: '0 0 40px rgba(241,91,181,0.4)',
    accent: '#f15bb5',
  },
  cyan: {
    gradient: 'linear-gradient(135deg, rgba(0,245,212,0.25), rgba(155,246,255,0.15))',
    border: 'rgba(0,245,212,0.4)',
    glow: '0 0 40px rgba(0,245,212,0.4)',
    accent: '#00f5d4',
  },
  gold: {
    gradient: 'linear-gradient(135deg, rgba(254,228,64,0.25), rgba(253,255,182,0.15))',
    border: 'rgba(254,228,64,0.4)',
    glow: '0 0 40px rgba(254,228,64,0.4)',
    accent: '#fee440',
  },
  rainbow: {
    gradient:
      'linear-gradient(135deg, rgba(155,93,229,0.2), rgba(241,91,181,0.2), rgba(0,245,212,0.2))',
    border: 'rgba(255,255,255,0.3)',
    glow: '0 0 30px rgba(155,93,229,0.3), 0 0 30px rgba(241,91,181,0.3)',
    accent: '#f15bb5',
  },
};

export function MagicCard({
  children,
  className = '',
  color = 'purple',
  bouncy = true,
  sparkles = true,
  onClick,
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  const scheme = COLOR_SCHEMES[color];

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        rotateX: bouncy ? rotateX : 0,
        rotateY: bouncy ? rotateY : 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={bouncy ? { scale: 1.03, y: -5 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Spinning rainbow border for rainbow variant */}
      {color === 'rainbow' && (
        <motion.div
          className="absolute inset-[-2px] rounded-[24px]"
          style={{
            background:
              'conic-gradient(from 0deg, #9b5de5, #f15bb5, #fee440, #00f5d4, #00bbf9, #9b5de5)',
            opacity: isHovered ? 0.8 : 0.4,
            filter: 'blur(2px)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Main card body */}
      <div
        className="relative rounded-[22px] p-6 overflow-hidden"
        style={{
          background: scheme.gradient,
          border: `2px solid ${scheme.border}`,
          boxShadow: isHovered ? scheme.glow : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${scheme.accent}20, transparent 70%)`,
          }}
        />

        {/* Sparkle effects */}
        {sparkles && isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl pointer-events-none"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 180],
                  y: [0, -20],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}

/**
 * MAGIC STORY CARD
 * Special card for displaying stories in Kids Zone
 */
interface MagicStoryCardProps {
  title: string;
  cover?: string;
  author?: string;
  ageRange?: string;
  duration?: string;
  isNew?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MagicStoryCard({
  title,
  cover,
  author,
  ageRange,
  duration,
  isNew = false,
  onClick,
  className = '',
}: MagicStoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative rounded-3xl overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Cover image or placeholder */}
      <div
        className="aspect-[3/4] w-full relative"
        style={{
          background: cover
            ? `url(${cover}) center/cover`
            : 'linear-gradient(135deg, #9b5de5, #f15bb5, #00f5d4)',
        }}
      >
        {/* NEW badge */}
        {isNew && (
          <motion.div
            className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #fee440, #ff8040)',
              color: '#000',
            }}
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            NEW! ⭐
          </motion.div>
        )}

        {/* Age badge */}
        {ageRange && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold bg-black/50 text-white">
            Ages {ageRange}
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8) 100%)',
          }}
        />

        {/* Title and info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3
            className="text-lg font-bold text-white mb-1 line-clamp-2"
            style={{ fontFamily: 'var(--font-kids)' }}
          >
            {title}
          </h3>
          {author && <p className="text-sm text-white/70">{author}</p>}
          {duration && <p className="text-xs text-white/50 mt-1">📚 {duration} read</p>}
        </div>

        {/* Play button on hover */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #9b5de5, #f15bb5)',
              boxShadow: '0 0 30px rgba(155,93,229,0.5)',
            }}
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="text-2xl ml-1">▶</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * MAGIC AVATAR CARD
 * For character/profile selection in Kids Zone
 */
interface MagicAvatarProps {
  name: string;
  avatar: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MagicAvatar({
  name,
  avatar,
  isSelected = false,
  onClick,
  className = '',
}: MagicAvatarProps) {
  return (
    <motion.button
      className={`relative flex flex-col items-center gap-2 ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Avatar ring */}
      <div className="relative">
        {/* Animated ring for selected state */}
        {isSelected && (
          <motion.div
            className="absolute -inset-1 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #9b5de5, #f15bb5, #fee440, #00f5d4, #9b5de5)',
              padding: '3px',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Avatar image */}
        <div
          className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white/20"
          style={{
            background: `url(${avatar}) center/cover`,
            boxShadow: isSelected ? '0 0 30px rgba(155,93,229,0.5)' : 'none',
          }}
        >
          {!avatar && (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* Check mark for selected */}
        {isSelected && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            ✓
          </motion.div>
        )}
      </div>

      {/* Name */}
      <span
        className="text-sm font-semibold"
        style={{
          fontFamily: 'var(--font-kids)',
          color: isSelected ? '#00f5d4' : '#ffffff',
        }}
      >
        {name}
      </span>
    </motion.button>
  );
}

export default MagicCard;
