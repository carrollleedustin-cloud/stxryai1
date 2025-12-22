'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import HolographicText from '@/components/futuristic/HolographicText';
import NeuralNetwork from '@/components/futuristic/NeuralNetwork';
import ParticleField from '@/components/futuristic/ParticleField';
import Floating3DCard from '@/components/futuristic/Floating3DCard';
import HolographicEffect from '@/components/futuristic/HolographicEffect';
import CustomCursor from '@/components/futuristic/CustomCursor';
import { ArrowRight, Sparkles, Zap, Infinity, Brain } from 'lucide-react';

const UltraFuturisticHero = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <CustomCursor />
      
      {/* Neural Network Background */}
      <div className="absolute inset-0 z-0">
        <NeuralNetwork nodeCount={30} connectionDistance={200} />
      </div>

      {/* Particle Field */}
      <ParticleField particleCount={80} />

      {/* Holographic Grid Overlay */}
      <div className="absolute inset-0 holographic-grid opacity-20" />

      {/* Hologram Scan Line */}
      <div className="hologram-scan-line" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl morph-blob"
          animate={{
            x: mousePosition.x * 0.3,
            y: mousePosition.y * 0.3,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl morph-blob"
          style={{ animationDelay: '2s' }}
          animate={{
            x: -mousePosition.x * 0.3,
            y: -mousePosition.y * 0.3,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl morph-blob"
          style={{ animationDelay: '4s' }}
          animate={{
            x: mousePosition.x * 0.2,
            y: mousePosition.y * 0.2,
          }}
        />
      </div>

      {/* Energy Waves */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="energy-wave" style={{ animationDelay: '0s' }} />
        <div className="energy-wave" style={{ animationDelay: '2s' }} />
        <div className="energy-wave" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 container-modern text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="space-y-8"
        >
          {/* Badge with Neural Pulse */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass border border-border/50 neural-pulse"
          >
            <Brain className="text-accent" size={20} />
            <span className="text-sm font-medium">AI Neural Network Active</span>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-accent"
            />
          </motion.div>

          {/* Holographic Main Title */}
          <div className="relative">
            <HolographicText
              text="INFINITE"
              size="xl"
              className="block mb-4"
            />
            <HolographicText
              text="STORIES"
              size="xl"
              className="block mb-4"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mt-4"
            >
              <Infinity className="text-6xl text-primary animate-spin-slow" />
              <HolographicText
                text="AI POWERED"
                size="lg"
              />
            </motion.div>
          </div>

          {/* Subtitle with Glitch Effect */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Where every choice creates a{' '}
            <span className="gradient-text font-bold">quantum reality</span>
            {' '}of infinite narrative possibilities
          </motion.p>

          {/* 3D Floating CTA Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <Floating3DCard intensity={20}>
              <HolographicEffect>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(user ? '/user-dashboard' : '/authentication?mode=signup')}
                  className="group relative px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-primary" />
                  <span className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-3">
                    <Zap className="group-hover:rotate-12 transition-transform" size={24} />
                    {user ? 'Enter Neural Network' : 'Activate Account'}
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                  </span>
                </motion.button>
              </HolographicEffect>
            </Floating3DCard>

            {!user && (
              <Floating3DCard intensity={20}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/authentication?mode=login')}
                  className="px-10 py-5 rounded-2xl font-bold text-lg glass border-2 border-primary/50 hover:border-primary transition-all"
                >
                  Neural Link
                </motion.button>
              </Floating3DCard>
            )}

            <Floating3DCard intensity={20}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/story-library')}
                className="px-10 py-5 rounded-2xl font-bold text-lg glass border-2 border-secondary/50 hover:border-secondary transition-all flex items-center gap-3"
              >
                <Sparkles size={20} />
                Explore Dimensions
              </motion.button>
            </Floating3DCard>
          </motion.div>

          {/* Quantum Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-5xl mx-auto"
          >
            {[
              { icon: Infinity, value: '∞', label: 'Infinite Stories', color: 'text-purple-400' },
              { icon: Brain, value: '50K+', label: 'Neural Nodes', color: 'text-pink-400' },
              { icon: Zap, value: '1M+', label: 'Quantum Choices', color: 'text-cyan-400' },
              { icon: Sparkles, value: '4.9', label: 'Reality Rating', color: 'text-yellow-400' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Floating3DCard key={index} intensity={10}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 rounded-2xl glass border border-border/30 text-center quantum-particle"
                  >
                    <Icon className={`mx-auto mb-3 ${stat.color}`} size={32} />
                    <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                </Floating3DCard>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Quantum Entanglement Lines */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="quantum-line"
            style={{
              left: `${(i + 1) * 10}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 100}px`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scaleX: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default UltraFuturisticHero;

