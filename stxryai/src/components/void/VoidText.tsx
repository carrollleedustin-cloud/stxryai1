'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation, Variants } from 'framer-motion';

interface VoidTextProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  variant?: 'display' | 'prose' | 'whisper' | 'spectral';
  delay?: number;
  className?: string;
  splitBy?: 'letter' | 'word' | 'line';
  stagger?: number;
  once?: boolean;
}

/**
 * VOID TEXT
 * Typography that emerges from absolute darkness.
 * Each character carries weight, each word has gravity.
 */
export default function VoidText({
  children,
  as: Component = 'p',
  variant = 'prose',
  delay = 0,
  className = '',
  splitBy = 'word',
  stagger = 0.05,
  once = true,
}: VoidTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-10% 0px -10% 0px' });
  const controls = useAnimation();
  
  const variantStyles: Record<string, string> = {
    display: 'font-display text-4xl md:text-6xl lg:text-7xl tracking-vast text-text-primary',
    prose: 'font-prose text-lg md:text-xl leading-relaxed text-text-secondary',
    whisper: 'font-literary text-base italic text-text-tertiary tracking-wide',
    spectral: 'font-display text-2xl md:text-3xl tracking-wide text-spectral-glow',
  };
  
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };
  
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);
  
  const splitText = () => {
    switch (splitBy) {
      case 'letter':
        return children.split('').map((char, i) => (
          <motion.span
            key={i}
            variants={itemVariants}
            className="inline-block"
            style={{ 
              display: char === ' ' ? 'inline' : 'inline-block',
              whiteSpace: char === ' ' ? 'pre' : 'normal',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ));
      case 'word':
        return children.split(' ').map((word, i, arr) => (
          <motion.span
            key={i}
            variants={itemVariants}
            className="inline-block"
          >
            {word}{i < arr.length - 1 ? '\u00A0' : ''}
          </motion.span>
        ));
      case 'line':
        return (
          <motion.span variants={itemVariants} className="inline-block">
            {children}
          </motion.span>
        );
      default:
        return children;
    }
  };
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={`${variantStyles[variant]} ${className}`}
    >
      {splitText()}
    </motion.div>
  );
}

/**
 * TEMPORAL HEADING
 * A specialized heading component with dramatic reveal
 */
export function TemporalHeading({
  children,
  level = 1,
  accent = false,
  className = '',
}: {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  accent?: boolean;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });
  
  const sizeClasses = {
    1: 'text-5xl md:text-7xl lg:text-8xl',
    2: 'text-3xl md:text-5xl lg:text-6xl',
    3: 'text-2xl md:text-3xl lg:text-4xl',
  };

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // If children is a string, split and animate each character
  // Otherwise, render children directly with simple fade animation
  const renderContent = () => {
    if (typeof children === 'string') {
      return children.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 100, rotateX: -90 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{
            duration: 1,
            delay: i * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block origin-bottom"
          style={{ 
            display: char === ' ' ? 'inline' : 'inline-block',
            transformStyle: 'preserve-3d',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ));
    }
    
    // For React nodes, just render them
    return children;
  };
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`
        font-display font-medium tracking-vast
        ${sizeClasses[level]}
        ${accent ? 'text-aurora' : 'text-text-primary'}
        ${className}
      `}
    >
      {renderContent()}
    </motion.div>
  );
}

/**
 * GHOST TEXT
 * Text that exists on multiple opacity layers
 */
export function GhostText({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* Ghost layer - behind */}
      <span 
        className="absolute inset-0 text-spectral-cyan opacity-20 blur-sm select-none"
        aria-hidden="true"
        style={{ transform: 'translate(-2px, -2px)' }}
      >
        {children}
      </span>
      
      {/* Primary layer */}
      <span className="relative">
        {children}
      </span>
      
      {/* Glow layer - in front */}
      <span 
        className="absolute inset-0 text-spectral-cyan opacity-10 blur-md select-none mix-blend-screen"
        aria-hidden="true"
        style={{ transform: 'translate(1px, 1px)' }}
      >
        {children}
      </span>
    </span>
  );
}

