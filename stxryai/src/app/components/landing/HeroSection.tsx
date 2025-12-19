'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

interface HeroSectionProps {
  onStartReading?: () => void;
}

const HeroSection = ({ onStartReading }: HeroSectionProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentChoice, setCurrentChoice] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const choices = [
    'Enter the abandoned mansion...',
    'Follow the mysterious stranger...',
    'Investigate the strange noise...',
    'Open the ancient book...',
  ];

  useEffect(() => {
    if (!isHydrated) return;
    const interval = setInterval(() => {
      setCurrentChoice((prev) => (prev + 1) % choices.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHydrated, choices.length]);

  const handleGetStarted = () => {
    if (user) {
      router.push('/user-dashboard');
    } else {
      router.push('/authentication?mode=signup');
    }
  };

  const handleLogin = () => {
    router.push('/authentication?mode=login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  } as const;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="particles" intensity="medium" className="absolute inset-0" />

      {/* Gradient Orbs with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
            scale: [1, 1.1, 1],
          }}
          transition={{
            x: { type: 'spring', stiffness: 50, damping: 20 },
            y: { type: 'spring', stiffness: 50, damping: 20 },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 0.5,
            y: -mousePosition.y * 0.5,
            scale: [1, 1.2, 1],
          }}
          transition={{
            x: { type: 'spring', stiffness: 50, damping: 20 },
            y: { type: 'spring', stiffness: 50, damping: 20 },
            scale: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      </div>

      {/* Floating Particles */}
      {isHydrated && typeof window !== 'undefined' && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                opacity: 0,
              }}
              animate={{
                y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
                x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-sm">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Icon name="SparklesIcon" size={24} className="text-purple-400" />
              </motion.div>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI-Powered Interactive Fiction
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-heading text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="block text-foreground">Your Choices Shape</span>
            <motion.span
              className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              Infinite Stories
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            Experience AI-generated interactive fiction where every decision creates a unique
            narrative path. Join thousands of readers exploring limitless story possibilities.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-2xl overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Icon name="ArrowRightIcon" size={24} />
                </motion.div>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
            </motion.button>

            {!user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="w-full sm:w-auto px-10 py-5 bg-card/80 backdrop-blur-sm border-2 border-purple-500/50 text-foreground rounded-xl font-bold text-lg hover:bg-purple-500/10 hover:border-purple-500 transition-all shadow-lg"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Icon name="UserCircleIcon" size={24} />
                  <span>Sign In</span>
                </span>
              </motion.button>
            )}

            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/story-library')}
                className="w-full sm:w-auto px-10 py-5 bg-card/80 backdrop-blur-sm border-2 border-blue-500/50 text-foreground rounded-xl font-bold text-lg hover:bg-blue-500/10 hover:border-blue-500 transition-all shadow-lg"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Icon name="BookOpenIcon" size={24} />
                  <span>Explore Stories</span>
                </span>
              </motion.button>
            )}
          </motion.div>

          {/* Live Story Preview */}
          {isHydrated && (
            <motion.div
              variants={itemVariants}
              className="max-w-3xl mx-auto"
            >
              <motion.div
                className="glassmorphism rounded-2xl p-8 border border-purple-500/30 shadow-2xl backdrop-blur-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-3 h-3 bg-green-400 rounded-full"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <p className="text-sm font-semibold text-green-400">Live Story Preview</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Try it now</span>
                </div>

                <motion.p
                  className="text-lg text-foreground mb-8 italic leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  "The door creaks open, revealing a dimly lit corridor. Shadows dance on the walls
                  as you step inside. Your heart races as you hear a whisper from the darkness..."
                </motion.p>

                <div className="space-y-3">
                  <AnimatePresence mode="wait">
                    {choices.map((choice, index) => (
                      <motion.button
                        key={`${choice}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: index === currentChoice ? 1 : 0.5,
                          x: 0,
                          scale: index === currentChoice ? 1.02 : 1,
                        }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.05, x: 10 }}
                        className={`w-full px-6 py-4 rounded-xl text-left transition-all ${
                          index === currentChoice
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500 text-foreground shadow-lg'
                            : 'bg-muted/30 border border-border/50 text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{choice}</span>
                          {index === currentChoice && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                            >
                              <Icon name="ChevronRightIcon" size={16} className="text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-6 h-10 border-2 border-purple-500/50 rounded-full flex justify-center p-2"
              whileHover={{ borderColor: 'rgba(139, 92, 246, 1)' }}
            >
              <motion.div
                className="w-1.5 h-1.5 bg-purple-500 rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
