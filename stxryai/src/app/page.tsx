'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { 
  Sparkles, 
  BookOpen, 
  Feather, 
  Stars,
  Compass,
  Heart,
  Zap,
  Eye,
  Moon,
  Sun,
  ArrowRight,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';

// Particle system for magical atmosphere
const ParticleField = ({ count = 50 }: { count?: number }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Floating orb component
const FloatingOrb = ({ delay = 0, color = 'purple' }: { delay?: number; color?: string }) => {
  const colors: Record<string, string> = {
    purple: 'from-purple-500/20 to-violet-600/10',
    blue: 'from-blue-500/20 to-cyan-600/10',
    pink: 'from-pink-500/20 to-rose-600/10',
    gold: 'from-amber-500/20 to-yellow-600/10',
  };

  return (
    <motion.div
      className={`absolute w-64 h-64 rounded-full bg-gradient-radial ${colors[color]} blur-3xl`}
      animate={{
        x: [0, 50, -30, 0],
        y: [0, -30, 50, 0],
        scale: [1, 1.2, 0.9, 1],
      }}
      transition={{
        duration: 15,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

// Animated text reveal
const RevealText = ({ children, delay = 0 }: { children: string; delay?: number }) => {
  const words = children.split(' ');
  
  return (
    <span className="inline-flex flex-wrap">
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="mr-2"
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: delay + i * 0.1 }}
          viewport={{ once: true }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

// Interactive path choice card
const PathChoice = ({ 
  title, 
  description, 
  icon: Icon, 
  gradient,
  onClick 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType;
  gradient: string;
  onClick?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative cursor-pointer group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />
      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
        <motion.div
          className="mt-6 flex items-center text-white/70 group-hover:text-white transition-colors"
          animate={{ x: isHovered ? 10 : 0 }}
        >
          <span className="text-sm font-medium">Enter this path</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Pet preview component
const PetPreview = () => {
  const [mood, setMood] = useState<'happy' | 'curious' | 'sleepy'>('happy');
  const [isInteracting, setIsInteracting] = useState(false);

  const moods = {
    happy: { emoji: '✨', color: 'from-yellow-400 to-orange-500', message: 'Your companion sparkles with joy!' },
    curious: { emoji: '👀', color: 'from-blue-400 to-purple-500', message: 'Something catches their attention...' },
    sleepy: { emoji: '💤', color: 'from-indigo-400 to-violet-500', message: 'Time for a cozy nap...' },
  };

  const handlePet = () => {
    setIsInteracting(true);
    setMood('happy');
    setTimeout(() => setIsInteracting(false), 1000);
  };

  return (
    <motion.div
      className="relative cursor-pointer"
      onClick={handlePet}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${moods[mood].color} rounded-full blur-3xl opacity-30`} />
      <div className="relative w-48 h-48 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{
            y: isInteracting ? [-5, 5, -5] : [0, -5, 0],
            rotate: isInteracting ? [-5, 5, -5] : 0,
          }}
          transition={{ duration: isInteracting ? 0.3 : 2, repeat: isInteracting ? 3 : Infinity }}
          className="text-6xl"
        >
          {/* Inkblot pet representation */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-violet-800 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full absolute top-4 left-5 animate-pulse" />
              <div className="w-4 h-4 bg-white rounded-full absolute top-4 right-5 animate-pulse" />
              <motion.div
                className="absolute bottom-4 w-6 h-2 bg-pink-400 rounded-full"
                animate={{ scaleX: mood === 'happy' ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </div>
            {/* Floating particles around pet */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400/60 rounded-full"
                animate={{
                  x: [0, Math.cos(i * 72 * Math.PI / 180) * 40],
                  y: [0, Math.sin(i * 72 * Math.PI / 180) * 40],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
                style={{ left: '50%', top: '50%' }}
              />
            ))}
          </div>
        </motion.div>
      </div>
      <motion.p
        className="text-center mt-4 text-gray-400 text-sm"
        key={mood}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {moods[mood].message}
      </motion.p>
      <div className="flex justify-center gap-2 mt-3">
        {(['happy', 'curious', 'sleepy'] as const).map((m) => (
          <button
            key={m}
            onClick={(e) => { e.stopPropagation(); setMood(m); }}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              mood === m 
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' 
                : 'bg-gray-800/50 text-gray-500 border border-gray-700/50 hover:bg-gray-700/50'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// Live world stats component
const LiveStats = () => {
  const [stats, setStats] = useState({
    activeReaders: 1247,
    storiesWritten: 8942,
    choicesMade: 156789,
    worldsExplored: 423,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeReaders: prev.activeReaders + Math.floor(Math.random() * 3) - 1,
        storiesWritten: prev.storiesWritten + (Math.random() > 0.8 ? 1 : 0),
        choicesMade: prev.choicesMade + Math.floor(Math.random() * 5),
        worldsExplored: prev.worldsExplored + (Math.random() > 0.95 ? 1 : 0),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    { label: 'Active Readers', value: stats.activeReaders, icon: Eye, color: 'text-emerald-400' },
    { label: 'Stories Written', value: stats.storiesWritten, icon: BookOpen, color: 'text-blue-400' },
    { label: 'Choices Made', value: stats.choicesMade, icon: Compass, color: 'text-purple-400' },
    { label: 'Worlds Explored', value: stats.worldsExplored, icon: Stars, color: 'text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center"
        >
          <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
          <motion.div
            className="text-2xl font-bold text-white"
            key={stat.value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {stat.value.toLocaleString()}
          </motion.div>
          <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// Main landing page component
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Parallax transforms
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  // Mouse follow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={containerRef} 
      className="relative bg-[#0a0a0f] text-white overflow-x-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-blue-900/10" />
        <FloatingOrb delay={0} color="purple" />
        <FloatingOrb delay={3} color="blue" />
        <FloatingOrb delay={6} color="pink" />
        <ParticleField count={30} />
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
      </button>

      {/* ===== SECTION 1: OPENING SCENE ===== */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-screen flex items-center justify-center px-6"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={{ x: springX, y: springY }}
            className="w-[600px] h-[600px] bg-gradient-radial from-purple-600/20 via-violet-800/10 to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Floating title elements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Your Story
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Awaits
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Step into infinite narratives. Every choice reshapes reality.
            <br />
            <span className="text-purple-400">This is not a website. This is a universe.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/authentication">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(147, 51, 234, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full font-semibold text-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Enter the World
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
            <button
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-2 px-6 py-4 text-gray-400 hover:text-white transition-colors"
            >
              <Play className="w-5 h-5" />
              Watch the Vision
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-purple-400 rounded-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== SECTION 2: WORLD EXPLANATION ===== */}
      <section className="relative min-h-screen py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <RevealText>A Place Where Stories Breathe</RevealText>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              <RevealText delay={0.5}>
                StxryAI is not just a platform. It&apos;s a living ecosystem where narratives evolve, 
                characters remember, and your choices echo through digital eternity.
              </RevealText>
            </p>
          </motion.div>

          {/* Feature cards with holographic effect */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Feather,
                title: 'Write Boundlessly',
                description: 'AI-powered narrative assistance that understands context, character, and consequence.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Compass,
                title: 'Explore Infinitely',
                description: 'Dive into reader-driven stories where every choice creates a new branch of possibility.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: Heart,
                title: 'Connect Deeply',
                description: 'Form bonds with digital companions that grow, learn, and remember your journey.',
                gradient: 'from-rose-500 to-orange-500',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                <div className="relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: CHOOSE YOUR PATH ===== */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 via-transparent to-blue-900/5" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <RevealText>Choose Your Path</RevealText>
            </h2>
            <p className="text-gray-400 text-lg">
              <RevealText delay={0.3}>What calls to you?</RevealText>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <PathChoice
              icon={Feather}
              title="The Creator"
              description="Craft worlds from imagination. Let AI amplify your vision. Watch your stories come alive."
              gradient="from-violet-600 to-purple-600"
              onClick={() => setSelectedPath('creator')}
            />
            <PathChoice
              icon={BookOpen}
              title="The Explorer"
              description="Venture into infinite narratives. Make choices that matter. Discover endings no one has found."
              gradient="from-cyan-600 to-blue-600"
              onClick={() => setSelectedPath('explorer')}
            />
          </div>

          <AnimatePresence>
            {selectedPath && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 text-center"
              >
                <Link href="/authentication">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-black rounded-full font-semibold"
                  >
                    Begin as {selectedPath === 'creator' ? 'Creator' : 'Explorer'}
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ===== SECTION 4: MEET YOUR COMPANION ===== */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <RevealText>Meet Your Digital Companion</RevealText>
              </h2>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                Every reader receives a unique companion — a digital familiar that grows alongside your journey.
                They remember your choices, reflect your reading habits, and evolve into something truly yours.
              </p>
              <ul className="space-y-3 text-gray-300">
                {[
                  'Evolves through 5 unique stages',
                  'Reacts to your reading emotions',
                  'Unlocks rare abilities over time',
                  'Remembers every story you share',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <PetPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: LIVE WORLD STATS ===== */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <RevealText>The World Right Now</RevealText>
            </h2>
            <p className="text-gray-500">Live activity across the StxryAI universe</p>
          </motion.div>
          <LiveStats />
        </div>
      </section>

      {/* ===== SECTION 6: FUTURE VISION ===== */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div
              className="inline-block mb-8"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center">
                <Moon className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              <RevealText>This is Just the Beginning</RevealText>
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { title: 'Multiplayer Stories', desc: 'Co-write with friends in real-time', icon: '🎭' },
                { title: 'Voice Narration', desc: 'AI-generated audiobooks of your tales', icon: '🎙️' },
                { title: 'Story NFTs', desc: 'Own and trade unique narrative moments', icon: '💎' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 7: FINAL CTA ===== */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                Ready?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Your story is waiting. Your companion is waiting. 
              <br />
              <span className="text-white">The universe is waiting.</span>
            </p>

            <Link href="/authentication">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(147, 51, 234, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-5 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-size-200 animate-gradient rounded-full font-bold text-xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  Enter StxryAI
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </motion.button>
            </Link>

            <p className="mt-8 text-gray-600 text-sm">
              Free to start. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-xl">StxryAI</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-gray-600 text-sm">
            © 2024 StxryAI. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500">Video coming soon...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
