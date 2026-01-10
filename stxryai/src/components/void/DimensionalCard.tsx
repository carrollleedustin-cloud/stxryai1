'use client';

import React, { useRef, ReactNode, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

interface DimensionalCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  enableTilt?: boolean;
  enableGlow?: boolean;
  onClick?: () => void;
}

/**
 * DIMENSIONAL CARD
 * A surface that responds to your presence.
 * Tilts, glows, and breathes as you interact.
 */
export default function DimensionalCard({
  children,
  className = '',
  glowColor = 'rgba(0, 245, 212, 0.15)',
  enableTilt = true,
  enableGlow = true,
  onClick,
}: DimensionalCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !enableTilt) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    const maxRotation = 8;
    rotateX.set((y / (rect.height / 2)) * -maxRotation);
    rotateY.set((x / (rect.width / 2)) * maxRotation);

    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  const glowBackground = useMotionTemplate`
    radial-gradient(
      400px circle at ${mouseX}px ${mouseY}px,
      ${glowColor},
      transparent 70%
    )
  `;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformPerspective: 1000,
      }}
      className={`
        relative overflow-hidden
        bg-void-elevated
        border border-membrane
        rounded-2xl
        transition-colors duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${isHovered ? 'border-membrane-active' : ''}
        ${className}
      `}
    >
      {/* Glow effect layer */}
      {enableGlow && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: glowBackground,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
        }}
      />

      {/* Top highlight edge */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/**
 * FLOATING CARD
 * A card that hovers in space with subtle animation
 */
export function FloatingCard({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 1,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`
        relative
        bg-void-surface
        border border-membrane
        rounded-2xl
        p-6
        ${className}
      `}
    >
      {/* Ambient glow */}
      <div
        className="absolute -inset-px rounded-2xl opacity-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(0, 245, 212, 0.2) 0%, transparent 50%, rgba(123, 44, 191, 0.1) 100%)',
        }}
      />

      <div className="relative">{children}</div>
    </motion.div>
  );
}

/**
 * STORY CARD
 * Specialized card for displaying stories
 */
export function StoryCard({
  title,
  author,
  excerpt,
  coverImage,
  genre,
  readTime,
  onClick,
  className = '',
}: {
  title: string;
  author: string;
  excerpt?: string;
  coverImage?: string;
  genre?: string;
  readTime?: string;
  onClick?: () => void;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <DimensionalCard onClick={onClick} enableTilt enableGlow className={`group ${className}`}>
      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-48 overflow-hidden rounded-t-2xl -mx-px -mt-px">
          <motion.img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void-elevated via-transparent to-transparent" />

          {/* Genre badge */}
          {genre && <span className="absolute top-4 left-4 badge-spectral">{genre}</span>}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-display text-xl tracking-wide text-text-primary mb-2 group-hover:text-spectral transition-colors duration-300">
          {title}
        </h3>

        {/* Author */}
        <p className="text-sm text-text-tertiary mb-3">
          by <span className="text-spectral-cyan">{author}</span>
        </p>

        {/* Excerpt */}
        {excerpt && (
          <p className="font-prose text-sm text-text-ghost line-clamp-2 mb-4">{excerpt}</p>
        )}

        {/* Meta */}
        {readTime && (
          <div className="flex items-center gap-2 text-xs text-text-whisper">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{readTime}</span>
          </div>
        )}
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--spectral-cyan), transparent)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </DimensionalCard>
  );
}
