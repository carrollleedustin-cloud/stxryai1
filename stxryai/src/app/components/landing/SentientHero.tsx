'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, Zap, Infinity, Brain, Eye } from 'lucide-react';

const SentientHero = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isWatching, setIsWatching] = useState(false);
  const [textFragments, setTextFragments] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const mainText = "INFINITE STORIES";
  const subText = "WHERE EVERY CHOICE FRACTURES REALITY";

  useEffect(() => {
    setTextFragments(mainText.split(''));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsWatching(true);
    const handleMouseLeave = () => setIsWatching(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Calculate stalk effect for text
  const getStalkOffset = (index: number, total: number) => {
    if (!isWatching) return { x: 0, y: 0 };
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (mousePosition.x - centerX) / window.innerWidth;
    const deltaY = (mousePosition.y - centerY) / window.innerHeight;
    
    const intensity = 10;
    const stagger = (index - total / 2) * 0.1;
    
    return {
      x: deltaX * intensity + stagger,
      y: deltaY * intensity + stagger,
    };
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden performance-engine"
    >
      {/* Data Stream Background */}
      <div className="data-stream" />

      {/* Watching Eye */}
      <AnimatePresence>
        {isWatching && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed top-8 right-8 z-50"
          >
            <Eye className="w-8 h-8 text-cyan-400" style={{ filter: 'drop-shadow(var(--glow-cyan))' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 text-center sentient-container"
      >
        {/* Main Title - Fractured Text */}
        <motion.h1
          className="text-8xl md:text-9xl font-mono mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          {textFragments.map((char, index) => {
            const stalk = getStalkOffset(index, textFragments.length);
            const isSpace = char === ' ';
            
            return (
              <motion.span
                key={index}
                className="inline-block word-fracture neon-text"
                initial={{ 
                  opacity: 0, 
                  y: 50,
                  rotateX: -90,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  x: stalk.x,
                  y: stalk.y,
                }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.8,
                  ease: [0.23, 1, 0.32, 1],
                }}
                whileHover={{
                  scale: 1.2,
                  rotateZ: Math.random() * 10 - 5,
                  textShadow: 'var(--glow-magenta)',
                  transition: { duration: 0.2 },
                }}
                style={{
                  marginRight: isSpace ? '0.5em' : '0.1em',
                  color: `hsl(${180 + Math.sin(index) * 30}, 100%, ${60 + Math.sin(index * 0.5) * 20}%)`,
                }}
              >
                {isSpace ? '\u00A0' : char}
              </motion.span>
            );
          })}
        </motion.h1>

        {/* Subtitle - Breathing Text */}
        <motion.p
          className="text-2xl md:text-3xl neon-text-magenta breathing-text mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {subText}
        </motion.p>

        {/* CTA Buttons - Predatory */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.button
            onClick={() => router.push(user ? '/user-dashboard' : '/authentication?mode=signup')}
            className="glass-void predatory-hover px-10 py-5 rounded-lg neon-border group relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center gap-3 neon-text text-lg font-mono">
              <Zap className="group-hover:rotate-12 transition-transform" size={24} />
              {user ? 'ENTER NETWORK' : 'ACTIVATE'}
              <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
            </span>
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent)',
              }}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.button>

          {!user && (
            <motion.button
              onClick={() => router.push('/authentication?mode=login')}
              className="glass-void predatory-hover px-10 py-5 rounded-lg neon-border-magenta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="neon-text-magenta text-lg font-mono">NEURAL LINK</span>
            </motion.button>
          )}
        </motion.div>

        {/* Stats - Adaptive Display */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {[
            { icon: Infinity, value: '∞', label: 'STORIES', color: 'var(--neon-cyan)' },
            { icon: Brain, value: '50K+', label: 'NODES', color: 'var(--neon-magenta)' },
            { icon: Zap, value: '1M+', label: 'CHOICES', color: 'var(--neon-green)' },
            { icon: Sparkles, value: '4.9', label: 'RATING', color: 'var(--neon-yellow)' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="glass-void rounded-lg p-6 text-center ritual-motion"
                whileHover={{ scale: 1.1, y: -5 }}
                style={{
                  borderColor: stat.color,
                  boxShadow: `0 0 20px ${stat.color}40`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 + index * 0.1 }}
              >
                <Icon className="mx-auto mb-3" size={32} style={{ color: stat.color }} />
                <div className="text-4xl font-mono mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs neon-text opacity-70">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Bleed Effect Bottom */}
      <motion.div
        className="bleed-effect fixed bottom-0 left-0 right-0 h-1"
        animate={{
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </section>
  );
};

export default SentientHero;

