'use client';

import React, { useEffect, useRef } from 'react';

interface VoidBackgroundProps {
  variant?: 'default' | 'aurora' | 'cosmos' | 'minimal' | 'dense' | 'subtle';
  children?: React.ReactNode;
  className?: string;
}

/**
 * VOID BACKGROUND
 * The canvas upon which stories unfold.
 * Subtle, atmospheric, never competing with content.
 */
export default function VoidBackground({
  variant = 'default',
  children,
  className = '',
}: VoidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Particle system for cosmos variant
  useEffect(() => {
    if (variant !== 'cosmos') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Stars
    const stars: { x: number; y: number; size: number; opacity: number; pulse: number }[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach((star) => {
        star.pulse += 0.01;
        const currentOpacity = star.opacity * (0.7 + Math.sin(star.pulse) * 0.3);
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 212, ${currentOpacity})`;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [variant]);
  
  const variants = {
    default: (
      <>
        {/* Subtle gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[800px] h-[800px] -top-1/4 -left-1/4 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 245, 212, 0.08) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] -bottom-1/4 -right-1/4 opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(123, 44, 191, 0.08) 0%, transparent 70%)',
            }}
          />
        </div>
      </>
    ),
    aurora: (
      <>
        {/* Aurora waves - using CSS animations for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-x-0 -top-1/2 h-full animate-pulse"
            style={{
              background: `
                linear-gradient(
                  180deg,
                  transparent 0%,
                  rgba(0, 245, 212, 0.05) 20%,
                  rgba(123, 44, 191, 0.05) 50%,
                  rgba(255, 107, 53, 0.03) 80%,
                  transparent 100%
                )
              `,
              animation: 'auroraWave 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute inset-x-0 top-1/4 h-1/2"
            style={{
              background: `
                linear-gradient(
                  160deg,
                  transparent 0%,
                  rgba(123, 44, 191, 0.04) 30%,
                  rgba(0, 245, 212, 0.04) 70%,
                  transparent 100%
                )
              `,
              animation: 'auroraWave 10s ease-in-out infinite 2s',
            }}
          />
        </div>
      </>
    ),
    cosmos: (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />
    ),
    minimal: null,
    dense: (
      <>
        {/* Dense atmosphere with more visible gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[1000px] h-[1000px] -top-1/3 -left-1/3 opacity-40"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 245, 212, 0.12) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute w-[800px] h-[800px] top-1/4 right-1/4 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(123, 44, 191, 0.1) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] -bottom-1/4 -right-1/4 opacity-35"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 107, 53, 0.08) 0%, transparent 70%)',
            }}
          />
        </div>
      </>
    ),
    subtle: (
      <>
        {/* Very subtle, barely there */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] -top-1/4 -left-1/4 opacity-15"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 245, 212, 0.05) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] -bottom-1/4 -right-1/4 opacity-10"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(123, 44, 191, 0.04) 0%, transparent 70%)',
            }}
          />
        </div>
      </>
    ),
  };
  
  return (
    <div className={`relative bg-void-absolute min-h-screen ${className}`}>
      {/* Base noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Variant-specific background */}
      {variants[variant]}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * VIGNETTE OVERLAY
 * Subtle darkening at edges for focus
 */
export function VignetteOverlay({ intensity = 0.4 }: { intensity?: number }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{
        background: `radial-gradient(ellipse at center, transparent 0%, rgba(2, 2, 3, ${intensity}) 100%)`,
      }}
    />
  );
}

/**
 * AMBIENT ORBS
 * Floating light sources that breathe - using CSS for reliable infinite animations
 */
export function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(0, 245, 212, 0.08) 0%, transparent 70%)',
          animation: 'ambientOrb1 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(123, 44, 191, 0.06) 0%, transparent 70%)',
          animation: 'ambientOrb2 25s ease-in-out infinite 5s',
        }}
      />
    </div>
  );
}

