'use client';

/**
 * StoryPet Display Component
 * Animated, interactive Tamagotchi-like companion that grows with the user.
 * Features procedural animations, particles, and mood-based expressions.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { getVisualEffects } from '@/services/petPersonalizationService';
import {
  StoryPet,
  PetBaseType,
  PetElement,
  PetEvolutionStage,
  PetMood,
  PetTraits,
} from '@/types/pet';
import { usePet } from '@/contexts/PetContext';
import { getVisualEffects } from '@/services/petPersonalizationService';
import PetAccessoryRenderer from './PetAccessoryRenderer';
import { useEffect, useState } from 'react';
import {
  Heart,
  Zap,
  Star,
  Sparkles,
  Gift,
  MessageCircle,
  Gamepad2,
  Cookie,
  Hand,
  ChevronUp,
  Crown,
  Volume2,
  VolumeX,
} from 'lucide-react';

// =============================================================================
// PARTICLE SYSTEM
// =============================================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  emoji?: string;
}

function ParticleEffect({ 
  type, 
  color, 
  active = true,
  intensity = 1,
}: { 
  type: PetTraits['particleType']; 
  color: string;
  active?: boolean;
  intensity?: number;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    if (!active || type === 'none') return;
    
    const emojis: Record<NonNullable<PetTraits['particleType']>, string> = {
      none: '',
      sparkles: '✨',
      flames: '🔥',
      bubbles: '💧',
      leaves: '🍃',
      snow: '❄️',
      stars: '⭐',
      hearts: '💖',
      lightning: '⚡',
    };
    
    const particleCount = Math.floor(15 * intensity);
    const intervalTime = Math.max(100, 300 / intensity);
    
    const interval = setInterval(() => {
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        x: 20 + Math.random() * 60,
        y: 80 + Math.random() * 20,
        size: (8 + Math.random() * 12) * intensity,
        opacity: (0.7 + Math.random() * 0.3) * Math.min(1, intensity),
        rotation: Math.random() * 360,
        emoji: emojis[type] || '✨',
      };
      
      setParticles(prev => [...prev.slice(-particleCount), newParticle]);
    }, intervalTime);
    
    return () => clearInterval(interval);
  }, [type, active, intensity]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              scale: 0,
              opacity: 0,
              rotate: particle.rotation,
            }}
            animate={{
              y: `${particle.y - 60}%`,
              scale: 1,
              opacity: particle.opacity,
              rotate: particle.rotation + 180,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 2,
              ease: 'easeOut',
            }}
            className="absolute text-lg"
            style={{ fontSize: particle.size }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// AURA EFFECT
// =============================================================================

function AuraEffect({ 
  type, 
  color,
  glowIntensity = 1,
  animationSpeed = 1,
}: { 
  type: PetTraits['auraType']; 
  color: string;
  glowIntensity?: number;
  animationSpeed?: number;
}) {
  if (type === 'none') return null;
  
  const auraVariants = {
    soft: {
      animate: {
        scale: [1, 1.1 * glowIntensity, 1],
        opacity: [0.3 * glowIntensity, 0.5 * glowIntensity, 0.3 * glowIntensity],
      },
      transition: {
        duration: 3 / animationSpeed,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    pulsing: {
      animate: {
        scale: [1, 1.3 * glowIntensity, 1],
        opacity: [0.4 * glowIntensity, 0.7 * glowIntensity, 0.4 * glowIntensity],
      },
      transition: {
        duration: 1.5 / animationSpeed,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    rainbow: {
      animate: {
        scale: [1, 1.2 * glowIntensity, 1],
        rotate: [0, 360],
        opacity: [0.5 * glowIntensity, 0.7 * glowIntensity, 0.5 * glowIntensity],
      },
      transition: {
        duration: 4 / animationSpeed,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    electric: {
      animate: {
        scale: [1, 1.15 * glowIntensity, 1, 1.1 * glowIntensity, 1],
        opacity: [0.5 * glowIntensity, 0.8 * glowIntensity, 0.3 * glowIntensity, 0.7 * glowIntensity, 0.5 * glowIntensity],
      },
      transition: {
        duration: 0.5 / animationSpeed,
        repeat: Infinity,
      },
    },
    cosmic: {
      animate: {
        scale: [1, 1.4 * glowIntensity, 1],
        opacity: [0.3 * glowIntensity, 0.6 * glowIntensity, 0.3 * glowIntensity],
        rotate: [0, 180, 360],
      },
      transition: {
        duration: 8 / animationSpeed,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };
  
  const variant = auraVariants[type] || auraVariants.soft;
  
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{
        background: type === 'rainbow'
          ? 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)'
          : `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        filter: 'blur(15px)',
      }}
      animate={variant.animate}
      transition={variant.transition}
    />
  );
}

// =============================================================================
// PET CREATURE BODY
// =============================================================================

interface PetBodyProps {
  pet: StoryPet;
  isInteracting: boolean;
  animation: 'idle' | 'happy' | 'excited' | 'sleepy' | 'eating' | 'playing';
}

function PetBody({ pet, isInteracting, animation }: PetBodyProps) {
  const { traits, baseType, evolutionStage, currentMood } = pet;
  
  // Get size multiplier based on evolution stage
  const sizeMultiplier = useMemo(() => {
    const sizes: Record<PetEvolutionStage, number> = {
      egg: 0.5,
      baby: 0.7,
      juvenile: 0.85,
      adult: 1,
      elder: 1.15,
      legendary: 1.3,
    };
    return sizes[evolutionStage];
  }, [evolutionStage]);
  
  // Body shape based on base type
  const getBodyShape = (type: PetBaseType): React.ReactNode => {
    const scale = sizeMultiplier * (traits.size / 100);
    const roundness = traits.roundness;
    
    // Enhanced visual effects based on traits
    const sparkleEffect = traits.sparkle > 70 ? {
      backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
      backgroundSize: '100% 100%',
    } : {};
    
    // Enhanced body styles with more visual appeal
    const bodyStyle: React.CSSProperties = {
      background: traits.pattern === 'gradient'
        ? `linear-gradient(135deg, ${traits.primaryColor} 0%, ${traits.secondaryColor} 50%, ${traits.accentColor} 100%)`
        : traits.pattern === 'galaxy'
        ? `radial-gradient(ellipse at 30% 30%, ${traits.primaryColor} 0%, ${traits.secondaryColor} 40%, ${traits.accentColor} 70%, ${traits.primaryColor} 100%)`
        : traits.pattern === 'iridescent'
        ? `linear-gradient(45deg, ${traits.primaryColor} 0%, ${traits.secondaryColor} 25%, ${traits.accentColor} 50%, ${traits.secondaryColor} 75%, ${traits.primaryColor} 100%)`
        : traits.pattern === 'spotted'
        ? `radial-gradient(circle at 20% 30%, ${traits.accentColor} 3px, transparent 3px),
           radial-gradient(circle at 80% 70%, ${traits.accentColor} 3px, transparent 3px),
           radial-gradient(circle at 50% 50%, ${traits.accentColor} 2px, transparent 2px),
           ${traits.primaryColor}`
        : traits.pattern === 'striped'
        ? `repeating-linear-gradient(45deg, ${traits.primaryColor} 0px, ${traits.primaryColor} 12px, ${traits.secondaryColor} 12px, ${traits.secondaryColor} 24px)`
        : traits.primaryColor,
      boxShadow: traits.glow > 50
        ? `0 0 ${traits.glow / 2}px ${traits.primaryColor}, 
           0 0 ${traits.glow}px ${traits.primaryColor}40,
           inset 0 0 ${traits.glow / 3}px ${traits.accentColor}60,
           0 4px 12px ${traits.primaryColor}20`
        : `0 2px 8px ${traits.primaryColor}20`,
      filter: traits.sparkle > 80 
        ? 'brightness(1.15) saturate(1.3) contrast(1.1)' 
        : traits.sparkle > 50
        ? 'brightness(1.05) saturate(1.1)'
        : 'none',
      ...sparkleEffect,
    };
    
    // Creature shapes using CSS
    const shapes: Record<PetBaseType, React.ReactNode> = {
      wisp: (
        <div
          className="relative"
          style={{
            width: 80 * scale,
            height: 80 * scale,
            borderRadius: '50%',
            ...bodyStyle,
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          {/* Wisp trail */}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2"
            style={{
              width: '60%',
              height: 40 * scale,
              background: `linear-gradient(to bottom, ${traits.primaryColor}80, transparent)`,
              borderRadius: '0 0 50% 50%',
              filter: 'blur(4px)',
            }}
          />
        </div>
      ),
      
      sprite: (
        <div className="relative" style={{ width: 70 * scale, height: 90 * scale }}>
          {/* Body */}
          <div
            style={{
              width: '100%',
              height: '70%',
              borderRadius: `${50 + roundness / 2}% ${50 + roundness / 2}% 40% 40%`,
              ...bodyStyle,
            }}
          />
          {/* Wings */}
          {traits.hasWings && (
            <>
              <motion.div
                className="absolute -left-6 top-4"
                style={{
                  width: 25 * scale,
                  height: 35 * scale,
                  background: `${traits.accentColor}80`,
                  borderRadius: '50% 10% 10% 50%',
                  transform: 'rotate(-20deg)',
                }}
                animate={{ rotate: [-20, -10, -20] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute -right-6 top-4"
                style={{
                  width: 25 * scale,
                  height: 35 * scale,
                  background: `${traits.accentColor}80`,
                  borderRadius: '10% 50% 50% 10%',
                  transform: 'rotate(20deg)',
                }}
                animate={{ rotate: [20, 10, 20] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </>
          )}
        </div>
      ),
      
      dragon: (
        <div className="relative" style={{ width: 100 * scale, height: 80 * scale }}>
          {/* Body */}
          <div
            style={{
              width: '100%',
              height: '80%',
              borderRadius: '40% 40% 50% 50%',
              ...bodyStyle,
            }}
          />
          {/* Horns */}
          {traits.hasHorns && (
            <>
              <div
                className="absolute -top-4 left-4"
                style={{
                  width: 10,
                  height: 20,
                  background: traits.accentColor,
                  borderRadius: '50% 50% 20% 20%',
                  transform: 'rotate(-20deg)',
                }}
              />
              <div
                className="absolute -top-4 right-4"
                style={{
                  width: 10,
                  height: 20,
                  background: traits.accentColor,
                  borderRadius: '50% 50% 20% 20%',
                  transform: 'rotate(20deg)',
                }}
              />
            </>
          )}
          {/* Tail */}
          {traits.hasTail && (
            <motion.div
              className="absolute -right-8 bottom-2"
              style={{
                width: 40 * scale,
                height: 15,
                background: traits.primaryColor,
                borderRadius: '10px 50% 50% 10px',
              }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      ),
      
      phoenix: (
        <div className="relative" style={{ width: 90 * scale, height: 100 * scale }}>
          {/* Body */}
          <div
            style={{
              width: '70%',
              height: '60%',
              margin: '20% auto',
              borderRadius: '50% 50% 40% 40%',
              ...bodyStyle,
            }}
          />
          {/* Wings */}
          <motion.div
            className="absolute left-0 top-1/4"
            style={{
              width: 35 * scale,
              height: 50 * scale,
              background: `linear-gradient(to right, ${traits.accentColor}, ${traits.primaryColor})`,
              borderRadius: '50% 20% 20% 50%',
              transformOrigin: 'right center',
            }}
            animate={{ rotate: [-15, 15, -15] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute right-0 top-1/4"
            style={{
              width: 35 * scale,
              height: 50 * scale,
              background: `linear-gradient(to left, ${traits.accentColor}, ${traits.primaryColor})`,
              borderRadius: '20% 50% 50% 20%',
              transformOrigin: 'left center',
            }}
            animate={{ rotate: [15, -15, 15] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Tail feathers */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: 30 * scale,
              height: 40 * scale,
              background: `linear-gradient(to bottom, ${traits.primaryColor}, ${traits.accentColor}, transparent)`,
              borderRadius: '20% 20% 50% 50%',
            }}
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      ),
      
      wolf: (
        <div className="relative" style={{ width: 90 * scale, height: 80 * scale }}>
          {/* Body */}
          <div
            style={{
              width: '100%',
              height: '70%',
              marginTop: '15%',
              borderRadius: '40% 40% 50% 50%',
              ...bodyStyle,
            }}
          />
          {/* Ears */}
          <div
            className="absolute -top-2 left-4"
            style={{
              width: 20,
              height: 30,
              background: traits.primaryColor,
              borderRadius: '50% 50% 20% 20%',
              transform: 'rotate(-10deg)',
            }}
          />
          <div
            className="absolute -top-2 right-4"
            style={{
              width: 20,
              height: 30,
              background: traits.primaryColor,
              borderRadius: '50% 50% 20% 20%',
              transform: 'rotate(10deg)',
            }}
          />
          {/* Tail */}
          {traits.hasTail && (
            <motion.div
              className="absolute -right-10 bottom-4"
              style={{
                width: 45 * scale,
                height: 20,
                background: traits.fluffiness > 50
                  ? `linear-gradient(to right, ${traits.primaryColor}, ${traits.secondaryColor})`
                  : traits.primaryColor,
                borderRadius: '10px 50% 50% 10px',
              }}
              animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      ),
      
      cat: (
        <div className="relative" style={{ width: 75 * scale, height: 70 * scale }}>
          {/* Body */}
          <div
            style={{
              width: '100%',
              height: '80%',
              marginTop: '10%',
              borderRadius: `${40 + roundness / 3}%`,
              ...bodyStyle,
            }}
          />
          {/* Ears */}
          <div
            className="absolute -top-1 left-3"
            style={{
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: `20px solid ${traits.primaryColor}`,
              transform: 'rotate(-10deg)',
            }}
          />
          <div
            className="absolute -top-1 right-3"
            style={{
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: `20px solid ${traits.primaryColor}`,
              transform: 'rotate(10deg)',
            }}
          />
          {/* Tail */}
          {traits.hasTail && (
            <motion.div
              className="absolute -right-12 bottom-6"
              style={{
                width: 50 * scale,
                height: 12,
                background: traits.primaryColor,
                borderRadius: '10px 50% 50% 10px',
                transformOrigin: 'left center',
              }}
              animate={{ rotate: [-20, 20, -20] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      ),
      
      owl: (
        <div className="relative" style={{ width: 70 * scale, height: 85 * scale }}>
          {/* Body */}
          <div
            style={{
              width: '100%',
              height: '75%',
              marginTop: '15%',
              borderRadius: '45% 45% 50% 50%',
              ...bodyStyle,
            }}
          />
          {/* Ear tufts */}
          <div
            className="absolute top-0 left-2"
            style={{
              width: 15,
              height: 25,
              background: traits.secondaryColor,
              borderRadius: '50% 20% 50% 50%',
              transform: 'rotate(-20deg)',
            }}
          />
          <div
            className="absolute top-0 right-2"
            style={{
              width: 15,
              height: 25,
              background: traits.secondaryColor,
              borderRadius: '20% 50% 50% 50%',
              transform: 'rotate(20deg)',
            }}
          />
          {/* Wings */}
          {traits.hasWings && (
            <>
              <div
                className="absolute left-0 top-1/3"
                style={{
                  width: 20 * scale,
                  height: 40 * scale,
                  background: traits.secondaryColor,
                  borderRadius: '50% 20% 30% 50%',
                }}
              />
              <div
                className="absolute right-0 top-1/3"
                style={{
                  width: 20 * scale,
                  height: 40 * scale,
                  background: traits.secondaryColor,
                  borderRadius: '20% 50% 50% 30%',
                }}
              />
            </>
          )}
        </div>
      ),
      
      fox: (
        <div className="relative" style={{ width: 80 * scale, height: 70 * scale }}>
          {/* Body */}
          <div
            style={{
              width: '100%',
              height: '75%',
              marginTop: '15%',
              borderRadius: '40% 40% 50% 50%',
              ...bodyStyle,
            }}
          />
          {/* Ears */}
          <div
            className="absolute -top-2 left-2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: `25px solid ${traits.primaryColor}`,
              transform: 'rotate(-15deg)',
            }}
          />
          <div
            className="absolute -top-2 right-2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: `25px solid ${traits.primaryColor}`,
              transform: 'rotate(15deg)',
            }}
          />
          {/* Fluffy tail */}
          {traits.hasTail && (
            <motion.div
              className="absolute -right-14 bottom-2"
              style={{
                width: 55 * scale,
                height: 25 * scale,
                background: `linear-gradient(to right, ${traits.primaryColor}, ${traits.secondaryColor})`,
                borderRadius: '20px 60% 60% 20px',
              }}
              animate={{ rotate: [-10, 15, -10] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      ),
      
      bunny: (
        <div className="relative" style={{ width: 65 * scale, height: 80 * scale }}>
          {/* Body */}
          <div
            style={{
              width: '100%',
              height: '60%',
              marginTop: '30%',
              borderRadius: `${45 + roundness / 2}%`,
              ...bodyStyle,
            }}
          />
          {/* Ears */}
          <motion.div
            className="absolute top-0 left-3"
            style={{
              width: 18,
              height: 40 * scale,
              background: traits.primaryColor,
              borderRadius: '50% 50% 40% 40%',
            }}
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-0 right-3"
            style={{
              width: 18,
              height: 40 * scale,
              background: traits.primaryColor,
              borderRadius: '50% 50% 40% 40%',
            }}
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          {/* Fluffy tail */}
          <div
            className="absolute -right-3 bottom-4"
            style={{
              width: 20 * scale,
              height: 20 * scale,
              background: traits.fluffiness > 60 ? traits.secondaryColor : traits.primaryColor,
              borderRadius: '50%',
            }}
          />
        </div>
      ),
      
      slime: (
        <motion.div
          className="relative"
          style={{
            width: 90 * scale,
            height: 70 * scale,
            borderRadius: `${60 + roundness / 2}% ${60 + roundness / 2}% ${40 + roundness / 3}% ${40 + roundness / 3}%`,
            ...bodyStyle,
          }}
          animate={{
            borderRadius: [
              `${60 + roundness / 2}% ${60 + roundness / 2}% ${40 + roundness / 3}% ${40 + roundness / 3}%`,
              `${55 + roundness / 2}% ${65 + roundness / 2}% ${45 + roundness / 3}% ${35 + roundness / 3}%`,
              `${60 + roundness / 2}% ${60 + roundness / 2}% ${40 + roundness / 3}% ${40 + roundness / 3}%`,
            ],
            scaleX: [1, 1.05, 1],
            scaleY: [1, 0.95, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ),
      
      crystal: (
        <div className="relative" style={{ width: 70 * scale, height: 90 * scale }}>
          {/* Main crystal */}
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              clipPath: 'polygon(50% 0%, 100% 35%, 100% 70%, 50% 100%, 0% 70%, 0% 35%)',
              ...bodyStyle,
            }}
            animate={{
              filter: [
                `brightness(1) saturate(1)`,
                `brightness(1.3) saturate(1.2)`,
                `brightness(1) saturate(1)`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Inner glow */}
          <div
            className="absolute top-1/4 left-1/4"
            style={{
              width: '50%',
              height: '50%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${traits.accentColor}60, transparent)`,
            }}
          />
        </div>
      ),
      
      shadow: (
        <motion.div
          className="relative"
          style={{
            width: 85 * scale,
            height: 85 * scale,
            borderRadius: '50%',
            ...bodyStyle,
            boxShadow: `0 0 30px ${traits.primaryColor}, inset 0 0 20px ${traits.accentColor}`,
          }}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              `0 0 30px ${traits.primaryColor}, inset 0 0 20px ${traits.accentColor}`,
              `0 0 50px ${traits.primaryColor}, inset 0 0 30px ${traits.accentColor}`,
              `0 0 30px ${traits.primaryColor}, inset 0 0 20px ${traits.accentColor}`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {/* Shadow tendrils */}
          <motion.div
            className="absolute bottom-0 left-1/4 w-2 h-16"
            style={{ background: `linear-gradient(to bottom, ${traits.primaryColor}, transparent)` }}
            animate={{ scaleY: [1, 1.3, 1], x: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-2 h-12"
            style={{ background: `linear-gradient(to bottom, ${traits.primaryColor}, transparent)` }}
            animate={{ scaleY: [1, 1.5, 1], x: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
      ),
    };
    
    return shapes[type] || shapes.wisp;
  };
  
  // Eye expressions based on mood
  const getEyes = (mood: PetMood): React.ReactNode => {
    const eyeSize = 12 * sizeMultiplier;
    const eyeSpacing = 20 * sizeMultiplier;
    
    const eyeStyles: Record<PetMood, { left: React.CSSProperties; right: React.CSSProperties; content?: string }> = {
      happy: {
        left: { borderRadius: '50% 50% 50% 50%', height: eyeSize * 0.7 },
        right: { borderRadius: '50% 50% 50% 50%', height: eyeSize * 0.7 },
      },
      excited: {
        left: { transform: 'scale(1.2)' },
        right: { transform: 'scale(1.2)' },
        content: '✨',
      },
      content: {
        left: { borderRadius: '50%' },
        right: { borderRadius: '50%' },
      },
      sleepy: {
        left: { height: eyeSize * 0.3, borderRadius: '50%' },
        right: { height: eyeSize * 0.3, borderRadius: '50%' },
      },
      hungry: {
        left: { height: eyeSize * 0.8 },
        right: { height: eyeSize * 0.8 },
      },
      bored: {
        left: { height: eyeSize * 0.5, transform: 'rotate(-5deg)' },
        right: { height: eyeSize * 0.5, transform: 'rotate(5deg)' },
      },
      curious: {
        left: { transform: 'scale(0.9)' },
        right: { transform: 'scale(1.1)' },
      },
      proud: {
        left: { height: eyeSize * 0.6, transform: 'rotate(-10deg)' },
        right: { height: eyeSize * 0.6, transform: 'rotate(10deg)' },
      },
      sad: {
        left: { height: eyeSize * 0.5, transform: 'rotate(10deg)' },
        right: { height: eyeSize * 0.5, transform: 'rotate(-10deg)' },
      },
    };
    
    const style = eyeStyles[mood] || eyeStyles.content;
    
    return (
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-4" style={{ gap: eyeSpacing }}>
        <motion.div
          className="relative"
          style={{
            width: eyeSize,
            height: eyeSize,
            background: traits.eyeColor,
            borderRadius: '50%',
            boxShadow: `0 0 5px ${traits.eyeColor}`,
            ...style.left,
          }}
          animate={animation === 'happy' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: animation === 'happy' ? Infinity : 0 }}
        >
          {/* Pupil */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: eyeSize * 0.4,
              height: eyeSize * 0.4,
              background: '#000',
              borderRadius: '50%',
            }}
          />
          {/* Shine */}
          <div
            className="absolute top-1/4 right-1/4"
            style={{
              width: eyeSize * 0.2,
              height: eyeSize * 0.2,
              background: '#fff',
              borderRadius: '50%',
            }}
          />
        </motion.div>
        
        <motion.div
          className="relative"
          style={{
            width: eyeSize,
            height: eyeSize,
            background: traits.eyeColor,
            borderRadius: '50%',
            boxShadow: `0 0 5px ${traits.eyeColor}`,
            ...style.right,
          }}
          animate={animation === 'happy' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: animation === 'happy' ? Infinity : 0, delay: 0.1 }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: eyeSize * 0.4,
              height: eyeSize * 0.4,
              background: '#000',
              borderRadius: '50%',
            }}
          />
          <div
            className="absolute top-1/4 right-1/4"
            style={{
              width: eyeSize * 0.2,
              height: eyeSize * 0.2,
              background: '#fff',
              borderRadius: '50%',
            }}
          />
        </motion.div>
        
        {style.content && (
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-sm">
            {style.content}
          </span>
        )}
      </div>
    );
  };
  
  // Halo for special pets
  const getHalo = (): React.ReactNode => {
    if (!traits.hasHalo) return null;
    
    return (
      <motion.div
        className="absolute -top-8 left-1/2 -translate-x-1/2"
        style={{
          width: 40 * sizeMultiplier,
          height: 10 * sizeMultiplier,
          background: `linear-gradient(90deg, transparent, ${traits.accentColor}, transparent)`,
          borderRadius: '50%',
          boxShadow: `0 0 15px ${traits.accentColor}`,
        }}
        animate={{ 
          opacity: [0.6, 1, 0.6],
          y: [0, -3, 0],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    );
  };
  
  // Main animation variants
  const bodyVariants = {
    idle: {
      y: [0, -5, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    happy: {
      y: [0, -10, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 0.5, repeat: Infinity },
    },
    excited: {
      y: [0, -15, 0, -10, 0],
      rotate: [0, -5, 5, -3, 0],
      transition: { duration: 0.8, repeat: Infinity },
    },
    sleepy: {
      y: [0, 2, 0],
      scale: [1, 0.98, 1],
      transition: { duration: 3, repeat: Infinity },
    },
    eating: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3, repeat: 3 },
    },
    playing: {
      rotate: [0, 10, -10, 0],
      y: [0, -8, 0],
      transition: { duration: 0.6, repeat: Infinity },
    },
  };
  
  // Markings overlay for pets with markings
  const getMarkings = (): React.ReactNode => {
    if (!traits.hasMarkings) return null;
    
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 40%, ${traits.accentColor}20 0%, transparent 40%),
                       radial-gradient(ellipse at 70% 60%, ${traits.secondaryColor}15 0%, transparent 35%)`,
          mixBlendMode: 'overlay',
        }}
      />
    );
  };

  return (
    <motion.div
      className="relative"
      variants={bodyVariants}
      animate={animation}
    >
      {getHalo()}
      {getBodyShape(baseType)}
      {getMarkings()}
      {getEyes(currentMood)}
      
      {/* Markings overlay */}
      {traits.hasMarkings && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: traits.pattern === 'spotted'
              ? `radial-gradient(circle at 30% 40%, ${traits.secondaryColor} 10%, transparent 10%), radial-gradient(circle at 70% 60%, ${traits.secondaryColor} 8%, transparent 8%)`
              : traits.pattern === 'striped'
              ? `repeating-linear-gradient(45deg, transparent, transparent 10px, ${traits.secondaryColor}40 10px, ${traits.secondaryColor}40 20px)`
              : 'none',
            borderRadius: 'inherit',
          }}
        />
      )}
      
      {/* Fluffiness indicator */}
      {traits.fluffiness > 70 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 ${traits.fluffiness / 5}px ${traits.secondaryColor}40`,
            borderRadius: 'inherit',
          }}
        />
      )}
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface StoryPetDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  showInteractions?: boolean;
  showStats?: boolean;
  className?: string;
}

export default function StoryPetDisplay({
  size = 'md',
  showInteractions = true,
  showStats = true,
  className = '',
}: StoryPetDisplayProps) {
  const { pet, petPet, feedPet, playWithPet, talkToPet, lastResponse } = usePet();
  
  const [animation, setAnimation] = useState<'idle' | 'happy' | 'excited' | 'sleepy' | 'eating' | 'playing'>('idle');
  const [isInteracting, setIsInteracting] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [dialogue, setDialogue] = useState('');
  const [visualEffects, setVisualEffects] = useState({
    particleIntensity: 1,
    glowIntensity: 1,
    animationSpeed: 1,
    colorShift: 0,
  });
  
  const sizeClasses = {
    sm: 'w-[72px] h-[72px]',      // 3x: 24*3 = 72
    md: 'w-[120px] h-[120px]',    // 3x: 40*3 = 120
    lg: 'w-[168px] h-[168px]',    // 3x: 56*3 = 168
  };

  // Get visual effects based on reading patterns (if pet exists)
  useEffect(() => {
    if (pet) {
      // Calculate patterns from pet stats
      const patterns = {
        averageReadingSpeed: pet.stats.wordsRead > 0 && pet.stats.daysActive > 0 
          ? pet.stats.wordsRead / (pet.stats.daysActive * 60) 
          : 200,
        preferredTimeOfDay: 'afternoon' as const,
        readingFrequency: pet.stats.currentStreak > 7 ? 'consistent' as const : 
                         pet.stats.storiesRead > 20 ? 'binge' as const : 'sporadic' as const,
        favoriteGenres: pet.stats.genresExplored,
        averageSessionLength: 30,
        interactionFrequency: pet.stats.happiness > 70 ? 'high' as const : 
                             pet.stats.happiness > 40 ? 'medium' as const : 'low' as const,
        prefersLongStories: false,
        prefersShortStories: false,
        exploresManyGenres: pet.stats.genresExplored.length >= 5,
        sticksToGenres: pet.stats.genresExplored.length <= 2 && pet.stats.storiesRead > 5,
      };
      setVisualEffects(getVisualEffects(patterns));
    }
  }, [pet]);
  
  // Update animation based on mood
  useEffect(() => {
    if (!pet) return;
    
    switch (pet.currentMood) {
      case 'excited':
        setAnimation('excited');
        break;
      case 'happy':
        setAnimation('happy');
        break;
      case 'sleepy':
        setAnimation('sleepy');
        break;
      default:
        setAnimation('idle');
    }
  }, [pet?.currentMood]);
  
  // Handle interactions
  const handleInteraction = async (type: 'pet' | 'feed' | 'play' | 'talk') => {
    if (isInteracting) return;
    
    setIsInteracting(true);
    
    const actions = {
      pet: { fn: petPet, anim: 'happy' as const },
      feed: { fn: feedPet, anim: 'eating' as const },
      play: { fn: playWithPet, anim: 'playing' as const },
      talk: { fn: talkToPet, anim: 'happy' as const },
    };
    
    const action = actions[type];
    setAnimation(action.anim);
    
    const response = await action.fn();
    if (response) {
      setDialogue(response);
      setShowDialogue(true);
      setTimeout(() => setShowDialogue(false), 3000);
    }
    
    setTimeout(() => {
      setAnimation('idle');
      setIsInteracting(false);
    }, 1500);
  };
  
  if (!pet) {
    return null;
  }
  
  return (
    <div className={`relative ${className}`}>
      {/* Pet Container */}
      <motion.div
        className={`relative ${sizeClasses[size]} flex items-center justify-center cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleInteraction('pet')}
      >
        {/* Background aura - with intensity from reading patterns */}
        <AuraEffect 
          type={pet.traits.auraType} 
          color={pet.traits.primaryColor}
          glowIntensity={visualEffects.glowIntensity}
          animationSpeed={visualEffects.animationSpeed}
        />
        
        {/* Particles - with intensity from reading patterns */}
        <ParticleEffect 
          type={pet.traits.particleType} 
          color={pet.traits.primaryColor}
          active={!isInteracting}
          intensity={visualEffects.particleIntensity}
        />
        
        {/* Pet body */}
        <PetBody 
          pet={pet} 
          isInteracting={isInteracting}
          animation={animation}
        />
        
        {/* Render equipped accessories */}
        <PetAccessoryRenderer 
          accessories={pet.accessories}
          traits={pet.traits}
          scale={size === 'sm' ? 0.6 : size === 'md' ? 1 : 1.4}
        />
        
        {/* Level indicator - 3x bigger */}
        {size !== 'sm' && (
          <div className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-white">
            <span className="text-xl font-bold text-white">{pet.stats.level}</span>
          </div>
        )}
        
        {/* Evolution badge for legendary - 3x bigger */}
        {pet.evolutionStage === 'legendary' && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-12 h-12 text-amber-400 drop-shadow-lg" />
          </motion.div>
        )}
      </motion.div>
      
      {/* Dialogue bubble - 3x bigger */}
      <AnimatePresence>
        {showDialogue && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-lg max-w-64 text-center z-10"
          >
            <p className="text-lg text-gray-800 dark:text-white">{dialogue}</p>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-gray-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pet name */}
      {size !== 'sm' && (
        <div className="text-center mt-2">
          <p className="font-bold text-white">{pet.name}</p>
          <p className="text-xs text-gray-400 capitalize">{pet.evolutionStage} {pet.baseType}</p>
        </div>
      )}
      
      {/* Stats bars */}
      {showStats && size !== 'sm' && (
        <div className="mt-6 space-y-4 w-full max-w-96">
          {/* XP bar - 3x bigger */}
          <div>
            <div className="flex justify-between text-lg mb-2">
              <span className="flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400" /> <span className="font-semibold">XP</span>
              </span>
              <span className="font-bold">{pet.stats.experience}/{pet.stats.experienceToNextLevel}</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${(pet.stats.experience / pet.stats.experienceToNextLevel) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Happiness - 3x bigger */}
          <div>
            <div className="flex justify-between text-lg mb-2">
              <span className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-400" /> <span className="font-semibold">Happy</span>
              </span>
              <span className="font-bold">{pet.stats.happiness}%</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-400 to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${pet.stats.happiness}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Energy - 3x bigger */}
          <div>
            <div className="flex justify-between text-lg mb-2">
              <span className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-cyan-400" /> <span className="font-semibold">Energy</span>
              </span>
              <span className="font-bold">{pet.stats.energy}%</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${pet.stats.energy}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Interaction buttons - 3x bigger */}
      {showInteractions && size !== 'sm' && (
        <div className="mt-6 flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleInteraction('pet')}
            className="p-4 bg-pink-500/20 rounded-xl border-2 border-pink-500/30 hover:bg-pink-500/30 transition-colors"
            title="Pet"
          >
            <Hand className="w-8 h-8 text-pink-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleInteraction('feed')}
            className="p-4 bg-amber-500/20 rounded-xl border-2 border-amber-500/30 hover:bg-amber-500/30 transition-colors"
            title="Feed"
          >
            <Cookie className="w-8 h-8 text-amber-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleInteraction('play')}
            className="p-4 bg-green-500/20 rounded-xl border-2 border-green-500/30 hover:bg-green-500/30 transition-colors"
            title="Play"
          >
            <Gamepad2 className="w-8 h-8 text-green-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleInteraction('talk')}
            className="p-4 bg-blue-500/20 rounded-xl border-2 border-blue-500/30 hover:bg-blue-500/30 transition-colors"
            title="Talk"
          >
            <MessageCircle className="w-8 h-8 text-blue-400" />
          </motion.button>
        </div>
      )}
      
      {/* CSS for float animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

