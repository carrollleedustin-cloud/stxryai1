'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface ModernBackgroundProps {
  variant?: 'gradient' | 'particles' | 'waves' | 'mesh' | 'aurora' | 'cosmic';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  className?: string;
}

// ============================================================================
// MODERN BACKGROUND COMPONENT
// ============================================================================

export default function ModernBackground({
  variant = 'gradient',
  intensity = 'medium',
  animated = true,
  className = '',
}: ModernBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (variant === 'particles' && canvasRef.current) {
      initializeParticles(canvasRef.current, intensity);
    }
  }, [variant, intensity]);

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {variant === 'gradient' && <GradientBackground animated={animated} intensity={intensity} />}
      {variant === 'particles' && <canvas ref={canvasRef} className="w-full h-full" />}
      {variant === 'waves' && <WavesBackground animated={animated} intensity={intensity} />}
      {variant === 'mesh' && <MeshBackground animated={animated} intensity={intensity} />}
      {variant === 'aurora' && <AuroraBackground animated={animated} intensity={intensity} />}
      {variant === 'cosmic' && <CosmicBackground animated={animated} intensity={intensity} />}
    </div>
  );
}

// ============================================================================
// GRADIENT BACKGROUND
// ============================================================================

function GradientBackground({ animated, intensity }: { animated: boolean; intensity: string }) {
  const getIntensityOpacity = () => {
    switch (intensity) {
      case 'low':
        return 0.3;
      case 'medium':
        return 0.5;
      case 'high':
        return 0.7;
      default:
        return 0.5;
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(139, 92, 246, ${getIntensityOpacity()}) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(236, 72, 153, ${getIntensityOpacity()}) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(59, 130, 246, ${getIntensityOpacity()}) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)
        `,
      }}
      animate={
        animated
          ? {
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }
          : {}
      }
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

// ============================================================================
// WAVES BACKGROUND
// ============================================================================

function WavesBackground({ animated, intensity }: { animated: boolean; intensity: string }) {
  return (
    <div className="absolute inset-0">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent, rgba(139, 92, 246, ${0.1 * (i + 1)}) 50%, transparent)`,
            transform: `translateY(${i * 20}%)`,
          }}
          animate={
            animated
              ? {
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                }
              : {}
          }
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// MESH BACKGROUND
// ============================================================================

function MeshBackground({ animated, intensity }: { animated: boolean; intensity: string }) {
  return (
    <div className="absolute inset-0">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mesh-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="mesh-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Mesh grid */}
        <motion.g
          animate={
            animated
              ? {
                  opacity: [0.3, 0.6, 0.3],
                }
              : {}
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {[...Array(10)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${i * 10}%`}
              x2="100%"
              y2={`${i * 10}%`}
              stroke="url(#mesh-gradient-1)"
              strokeWidth="1"
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${i * 10}%`}
              y1="0"
              x2={`${i * 10}%`}
              y2="100%"
              stroke="url(#mesh-gradient-2)"
              strokeWidth="1"
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}

// ============================================================================
// AURORA BACKGROUND
// ============================================================================

function AuroraBackground({ animated, intensity }: { animated: boolean; intensity: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full"
          style={{
            background: `radial-gradient(ellipse at ${30 + i * 20}% ${40 + i * 10}%, 
              rgba(139, 92, 246, 0.4), 
              rgba(236, 72, 153, 0.3), 
              transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={
            animated
              ? {
                  x: ['-10%', '10%', '-10%'],
                  y: ['-10%', '10%', '-10%'],
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// COSMIC BACKGROUND
// ============================================================================

function CosmicBackground({ animated, intensity }: { animated: boolean; intensity: string }) {
  const starCount = intensity === 'low' ? 50 : intensity === 'medium' ? 100 : 200;

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black">
      {/* Stars */}
      {[...Array(starCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={
            animated
              ? {
                  opacity: [0.2, 1, 0.2],
                  scale: [0.5, 1.5, 0.5],
                }
              : {}
          }
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Nebula clouds */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`nebula-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            left: `${Math.random() * 80}%`,
            top: `${Math.random() * 80}%`,
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)`,
            filter: 'blur(40px)',
          }}
          animate={
            animated
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }
              : {}
          }
          transition={{
            duration: 10 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// PARTICLES INITIALIZATION
// ============================================================================

function initializeParticles(canvas: HTMLCanvasElement, intensity: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particleCount = intensity === 'low' ? 50 : intensity === 'medium' ? 100 : 200;
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
  }> = [];

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      color: `rgba(139, 92, 246, ${Math.random() * 0.5 + 0.3})`,
    });
  }

  // Animation loop
  function animate() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();

      // Draw connections
      particles.forEach((other) => {
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          const opacity = 0.2 * (1 - distance / 100);
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    requestAnimationFrame(animate);
  }

  animate();

  // Handle resize
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}
