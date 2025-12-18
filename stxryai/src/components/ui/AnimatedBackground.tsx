'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'gradient' | 'waves' | 'stars';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function AnimatedBackground({
  variant = 'particles',
  intensity = 'medium',
  className = '',
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (variant === 'particles' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const particleCount = intensity === 'low' ? 30 : intensity === 'medium' ? 50 : 80;
      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
      }> = [];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';

        particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fill();

          // Draw connections
          particles.forEach((other) => {
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.strokeStyle = `rgba(139, 92, 246, ${0.2 * (1 - distance / 100)})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          });
        });

        requestAnimationFrame(animate);
      };

      animate();

      const handleResize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [variant, intensity]);

  if (variant === 'particles') {
    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${className}`}
        style={{ zIndex: 0 }}
      />
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={`absolute inset-0 w-full h-full ${className}`} style={{ zIndex: 0 }}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>
    );
  }

  if (variant === 'waves') {
    return (
      <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`} style={{ zIndex: 0 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-0 w-full"
            style={{
              height: `${30 + i * 20}%`,
              background: `linear-gradient(to top, rgba(139, 92, 246, ${0.1 - i * 0.02}), transparent)`,
            }}
            animate={{
              x: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'stars') {
    return (
      <div className={`absolute inset-0 w-full h-full ${className}`} style={{ zIndex: 0 }}>
        {Array.from({ length: intensity === 'low' ? 20 : intensity === 'medium' ? 40 : 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}

