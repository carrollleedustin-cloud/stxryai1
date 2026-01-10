'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
}

/**
 * PARTICLE FIELD
 * Living, breathing particles that respond to mouse movement
 * Creates an immersive, otherworldly atmosphere
 */
export default function ParticleField({
  particleCount = 50,
  color = 'rgba(0, 245, 212, 0.4)',
  maxSize = 3,
  interactive = true,
}: {
  particleCount?: number;
  color?: string;
  maxSize?: number;
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * maxSize + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.5 + 0.1,
      angle: Math.random() * Math.PI * 2,
    }));

    const getColorWithOpacity = (baseColor: string, opacity: number): string => {
      // Handle rgba format
      if (baseColor.startsWith('rgba')) {
        const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
        }
      }
      // Handle rgb format
      if (baseColor.startsWith('rgb')) {
        const match = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
          return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
        }
      }
      // Default fallback
      return `rgba(0, 245, 212, ${opacity})`;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;

        // Mouse interaction
        if (interactive) {
          const dx = mousePos.x - particle.x;
          const dy = mousePos.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            const force = (150 - distance) / 150;
            particle.x -= dx * force * 0.02;
            particle.y -= dy * force * 0.02;
          }
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = getColorWithOpacity(color, particle.opacity);
        ctx.fill();

        // Draw glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 3
        );
        gradient.addColorStop(0, getColorWithOpacity(color, particle.opacity * 0.5));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw connections
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const lineOpacity = (1 - distance / 100) * 0.1;
            ctx.strokeStyle = getColorWithOpacity(color, lineOpacity);
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, color, maxSize, interactive, mousePos]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

/**
 * ANIMATED COUNTER
 * Numbers that count up with easing
 */
export function AnimatedCounter({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
}: {
  end: number | string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const numericEnd = typeof end === 'string' ? parseInt(end.replace(/\D/g, ''), 10) : end;
    if (isNaN(numericEnd)) {
      setCount(0);
      return;
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Easing function (ease-out-expo)
      const eased = 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * numericEnd));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [hasStarted, end, duration]);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return Math.floor(num / 1000) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

/**
 * TYPEWRITER TEXT
 * Text that types out character by character
 */
export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
        />
      )}
    </span>
  );
}

/**
 * FLOATING ELEMENTS
 * Elements that float with subtle animation
 */
export function FloatingElement({
  children,
  duration = 6,
  distance = 20,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        y: [-distance / 2, distance / 2, -distance / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * MAGNETIC BUTTON
 * Button that follows the cursor on hover
 */
export function MagneticButton({
  children,
  className = '',
  strength = 30,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    setPosition({
      x: deltaX * strength,
      y: deltaY * strength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/**
 * GLITCH TEXT
 * Text with a glitch effect
 */
export function GlitchText({ children, className = '' }: { children: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 text-spectral-cyan opacity-70"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
          transform: 'translate(-2px, 0)',
          animation: 'glitch-shift 2s ease-in-out infinite',
        }}
        aria-hidden="true"
      >
        {children}
      </span>
      <span
        className="absolute inset-0 text-plasma-pink opacity-70"
        style={{
          clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
          transform: 'translate(2px, 0)',
          animation: 'glitch-shift 2s ease-in-out infinite 0.1s',
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}

/**
 * REVEAL ON SCROLL
 * Reveals content as user scrolls
 */
export function ScrollReveal({
  children,
  className = '',
  threshold = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SHIMMER EFFECT
 * Loading shimmer effect
 */
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
}
