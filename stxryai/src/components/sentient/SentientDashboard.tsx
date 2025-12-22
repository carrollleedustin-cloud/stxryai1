'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Zap, TrendingUp, Eye, ArrowRight } from 'lucide-react';

interface SentientDashboardProps {
  children?: React.ReactNode;
}

const SentientDashboard = ({ children }: SentientDashboardProps) => {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isWatching, setIsWatching] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsWatching(true);
    };

    const handleMouseLeave = () => setIsWatching(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const cards = [
    { icon: BookOpen, label: 'CONTINUE READING', path: '/story-library', color: 'var(--neon-cyan)' },
    { icon: Zap, label: 'CREATE STORY', path: '/story-creation-studio', color: 'var(--neon-magenta)' },
    { icon: TrendingUp, label: 'ANALYTICS', path: '/analytics', color: 'var(--neon-green)' },
    { icon: Eye, label: 'EXPLORE', path: '/explore', color: 'var(--neon-yellow)' },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen performance-engine"
      style={{ background: 'var(--void-black)', position: 'relative' }}
    >
      {/* Watching Indicator */}
      <AnimatePresence>
        {isWatching && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed top-8 right-8 z-50"
          >
            <div className="w-3 h-3 rounded-full bg-cyan-400" style={{ boxShadow: 'var(--glow-cyan)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        className="glass-void-heavy border-b border-cyan-500/20 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="sentient-container py-6">
          <div className="flex items-center justify-between">
            <motion.h1
              className="neon-text text-2xl font-mono"
              whileHover={{ scale: 1.05 }}
            >
              {profile?.display_name || user?.email || 'READER'}
            </motion.h1>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => router.push('/story-library')}
                className="glass-void predatory-hover px-4 py-2 rounded neon-border text-sm font-mono neon-text"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                LIBRARY
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="sentient-container void-space">
        {/* Quick Actions - Nonlinear Grid */}
        <motion.div
          className="nonlinear-grid mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          {cards.map((card, index) => {
            const Icon = card.icon;
            const stalkX = (mousePosition.x / window.innerWidth - 0.5) * 20;
            const stalkY = (mousePosition.y / window.innerHeight - 0.5) * 20;
            
            return (
              <motion.button
                key={index}
                onClick={() => router.push(card.path)}
                className="glass-void predatory-hover p-8 rounded-lg text-center ritual-motion"
                style={{
                  borderColor: card.color,
                  boxShadow: `0 0 20px ${card.color}40`,
                }}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  x: isWatching ? stalkX : 0,
                  y: isWatching ? stalkY : 0,
                }}
                whileHover={{
                  scale: 1.1,
                  rotateY: 5,
                  z: 50,
                }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.8,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <Icon className="mx-auto mb-4" size={48} style={{ color: card.color }} />
                <div className="neon-text font-mono text-sm" style={{ color: card.color }}>
                  {card.label}
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Children Content */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {children}
          </motion.div>
        )}
      </div>

      {/* Bleed Effect */}
      <motion.div
        className="bleed-effect fixed bottom-0 left-0 right-0 h-1"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

export default SentientDashboard;

