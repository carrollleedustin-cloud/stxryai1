'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * CONSTELLATION EFFECT
 * Interactive stars that connect based on proximity.
 * Creates a living star map that responds to mouse movement.
 */

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface ConstellationEffectProps {
  starCount?: number;
  connectionDistance?: number;
  mouseInfluence?: number;
  color?: string;
  className?: string;
}

export function ConstellationEffect({
  starCount = 80,
  connectionDistance = 150,
  mouseInfluence = 100,
  color = '#00ffd5',
  className = '',
}: ConstellationEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize or update stars
      if (starsRef.current.length === 0) {
        starsRef.current = Array.from({ length: starCount }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
        }));
      }
    };

    // Mouse handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stars = starsRef.current;
      const mouse = mouseRef.current;

      // Update and draw stars
      stars.forEach((star, i) => {
        // Mouse influence
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseInfluence) {
          const force = (mouseInfluence - dist) / mouseInfluence;
          star.vx -= (dx / dist) * force * 0.02;
          star.vy -= (dy / dist) * force * 0.02;
        }

        // Update position
        star.x += star.vx;
        star.y += star.vy;

        // Boundary bounce
        if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
        if (star.y < 0 || star.y > canvas.height) star.vy *= -1;

        // Keep stars in bounds
        star.x = Math.max(0, Math.min(canvas.width, star.x));
        star.y = Math.max(0, Math.min(canvas.height, star.y));

        // Damping
        star.vx *= 0.99;
        star.vy *= 0.99;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle =
          color +
          Math.floor(star.opacity * 255)
            .toString(16)
            .padStart(2, '0');
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < stars.length; j++) {
          const other = stars[j];
          const cdx = other.x - star.x;
          const cdy = other.y - star.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < connectionDistance) {
            const opacity = 1 - cdist / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle =
              color +
              Math.floor(opacity * 50)
                .toString(16)
                .padStart(2, '0');
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Draw mouse connection
        if (dist < connectionDistance * 1.5) {
          const opacity = 1 - dist / (connectionDistance * 1.5);
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle =
            color +
            Math.floor(opacity * 80)
              .toString(16)
              .padStart(2, '0');
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [starCount, connectionDistance, mouseInfluence, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}

export default ConstellationEffect;
