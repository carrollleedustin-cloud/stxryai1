'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight,
  Sparkles,
  Infinity,
  Zap,
  BookOpen,
  Users,
  Wand2,
  MessageSquare,
  Star,
  ChevronDown,
  Play,
  Crown,
  Eye,
  Heart,
  Layers,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';
import VoidBackground, { AmbientOrbs } from '@/components/void/VoidBackground';
import { TemporalHeading } from '@/components/void/VoidText';
import TemporalReveal, {
  StaggerContainer,
  StaggerItem,
  ParallaxDepth,
} from '@/components/void/TemporalReveal';
import DimensionalCard from '@/components/void/DimensionalCard';
import SpectralButton from '@/components/void/SpectralButton';
import EtherealNav from '@/components/void/EtherealNav';
import ParticleField, {
  AnimatedCounter,
  TypewriterText,
  FloatingElement,
  MagneticButton,
  GlitchText,
} from '@/components/void/ParticleField';
import {
  HolographicCard,
  MorphingBlob,
  NeonText,
  ScrollProgressIndicator,
  RevealOnScroll,
  SplitTextAnimation,
  MagneticElement,
  FloatingItem,
  RippleButton,
} from '@/components/void/AdvancedEffects';
import FooterSection from './FooterSection';

/**
 * INTERACTIVE STORY PREVIEW
 * A live preview of the reading experience
 */
function StoryPreview() {
  const [currentChoice, setCurrentChoice] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  const storyParts = [
    {
      text: 'The ancient library stretched before you, its towering shelves disappearing into shadow. Dust motes danced in beams of pale moonlight filtering through stained glass windows. Something moved in the darkness ahead.',
      choices: ['Investigate the movement', 'Find another path'],
    },
    {
      text: "You step forward, heart pounding. The movement resolves into a figure—a woman in flowing robes, her eyes glowing with an ethereal light. She speaks: 'I've been waiting for you. The book you seek... it knows your name.'",
      choices: ['Ask about the book', 'Demand answers'],
    },
  ];

  useEffect(() => {
    if (currentChoice !== null) {
      const timer = setTimeout(() => {
        setStoryProgress(Math.min(storyProgress + 1, storyParts.length - 1));
        setCurrentChoice(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentChoice, storyProgress, storyParts.length]);

  const currentPart = storyParts[storyProgress];

  return (
    <div className="relative">
      <HolographicCard className="p-8" glowColor="spectral-violet">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {storyParts.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= storyProgress ? 'bg-spectral-cyan' : 'bg-void-elevated'
              }`}
            />
          ))}
        </div>

        {/* Story text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={storyProgress}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-literary text-xl text-white/90 leading-relaxed mb-8">
              {currentPart.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Choice buttons */}
        <div className="space-y-3">
          {currentPart.choices.map((choice, i) => (
            <motion.button
              key={`${storyProgress}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onClick={() => setCurrentChoice(i)}
              disabled={currentChoice !== null}
              className={`
                w-full p-4 rounded-xl text-left font-prose transition-all duration-300
                ${
                  currentChoice === i
                    ? 'bg-spectral-cyan/20 border-spectral-cyan text-spectral-cyan'
                    : 'bg-void-elevated/50 border-white/10 text-white/70 hover:bg-void-elevated hover:border-spectral-cyan/30 hover:text-white'
                }
                border disabled:opacity-50
              `}
            >
              <span className="flex items-center gap-3">
                <span className="text-spectral-cyan">→</span>
                {choice}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Hint text */}
        <p className="text-center text-xs text-ghost-500 mt-6">
          Make a choice to see how the story unfolds
        </p>
      </HolographicCard>

      {/* Decorative glow */}
      <div
        className="absolute -inset-8 -z-10 rounded-3xl blur-3xl opacity-20"
        style={{
          background: 'linear-gradient(135deg, var(--spectral-cyan), var(--spectral-violet))',
        }}
      />
    </div>
  );
}

/**
 * FLOATING FEATURE CARDS
 * Animated feature cards with depth effect
 */
function FeatureOrbit({
  features,
}: {
  features: Array<{ icon: React.ElementType; label: string }>;
}) {
  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      {features.map((feature, i) => {
        const angle = (i / features.length) * Math.PI * 2;
        const radius = 120;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={i}
            className="absolute"
            initial={{ x, y, opacity: 0 }}
            animate={{
              x,
              y,
              opacity: 1,
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.2,
            }}
          >
            <HolographicCard className="p-4 flex items-center gap-3" glowColor="spectral-cyan">
              <feature.icon className="w-5 h-5 text-spectral-cyan" />
              <span className="text-sm text-white font-ui">{feature.label}</span>
            </HolographicCard>
          </motion.div>
        );
      })}

      {/* Center orb */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-spectral-cyan/20 to-spectral-violet/20 flex items-center justify-center"
      >
        <BookOpen className="w-10 h-10 text-spectral-cyan" />
      </motion.div>
    </div>
  );
}

/**
 * STATS COUNTER WITH EFFECTS
 */
function EnhancedStatCard({
  icon: Icon,
  value,
  label,
  suffix = '',
  isInfinity = false,
  gradient,
  delay = 0,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  suffix?: string;
  isInfinity?: boolean;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <HolographicCard className="p-6 text-center" glowColor={gradient.split('-')[1]}>
        <FloatingItem duration={4 + delay} distance={8}>
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
          >
            <Icon className="w-5 h-5 text-void-black" />
          </div>
        </FloatingItem>

        <div className="font-display text-3xl text-white mb-2">
          {isInfinity ? (
            <NeonText color="spectral-cyan" intensity={0.5}>
              ∞
            </NeonText>
          ) : typeof value === 'number' ? (
            <AnimatedCounter end={value} duration={2.5} suffix={suffix} className="inline-block" />
          ) : (
            value
          )}
        </div>
        <div className="text-xs font-ui tracking-widest uppercase text-ghost-500">{label}</div>
      </HolographicCard>
    </motion.div>
  );
}

/**
 * THE LANDING PAGE
 * A journey from void to story.
 * Every scroll reveals new dimensions.
 * Every interaction invites deeper exploration.
 */
const LandingPageInteractive = () => {
  const router = useRouter();
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(true);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.95]);
  const heroY = useTransform(smoothProgress, [0, 0.15], [0, -50]);

  // Track mouse for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Feature orbit items
  const orbitFeatures = useMemo(
    () => [
      { icon: Wand2, label: 'AI Writing' },
      { icon: Sparkles, label: 'Dynamic' },
      { icon: Layers, label: 'Branching' },
      { icon: Users, label: 'Social' },
      { icon: Heart, label: 'Emotional' },
      { icon: Eye, label: 'Immersive' },
    ],
    []
  );

  return (
    <div className="bg-void-absolute min-h-screen">
      <VoidBackground variant="aurora" />
      <ParticleField particleCount={80} color="rgba(0, 245, 212, 0.25)" />
      <AmbientOrbs />
      <EtherealNav />
      <ScrollProgressIndicator />

      {/* ════════════════════════════════════════════════════════════════════════
          HERO SECTION - The Awakening
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Morphing Background Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            style={{
              x: mousePosition.x * 2,
              y: mousePosition.y * 2,
            }}
          >
            <MorphingBlob
              color="spectral-cyan"
              size={600}
              className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 opacity-20"
            />
            <MorphingBlob
              color="spectral-violet"
              size={500}
              speed={10}
              className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-15"
            />
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <MagneticElement strength={0.2}>
              <span className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-spectral-cyan/10 to-spectral-violet/10 border border-white/10 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spectral-cyan opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-spectral-cyan" />
                </span>
                <span className="text-xs font-ui tracking-widest uppercase text-white/80">
                  Next-Gen Interactive Fiction
                </span>
                <span className="px-2 py-0.5 rounded-full bg-spectral-violet/20 text-[10px] font-ui tracking-wide text-spectral-violet">
                  NEW
                </span>
              </span>
            </MagneticElement>
          </motion.div>

          {/* Main Title with Split Animation */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight mb-6"
          >
            <SplitTextAnimation
              text="INFINITE"
              className="block text-white"
              delay={0.5}
              stagger={0.04}
            />
            <span className="block mt-2">
              <SplitTextAnimation
                text="STORIES"
                className="bg-gradient-to-r from-spectral-cyan via-spectral-violet to-spectral-rose bg-clip-text text-transparent"
                delay={0.8}
                stagger={0.04}
              />
            </span>
          </motion.h1>

          {/* Subtitle with Typewriter Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="font-literary text-xl md:text-2xl lg:text-3xl text-ghost-400 italic max-w-3xl mx-auto mb-12"
          >
            <TypewriterText
              text="Where every choice fractures reality into new narratives."
              speed={40}
              className="block"
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticElement strength={0.15}>
              <SpectralButton
                onClick={() =>
                  router.push(user ? '/user-dashboard' : '/authentication?mode=signup')
                }
                size="lg"
                icon={<Zap className="w-5 h-5" />}
                className="text-lg px-8 py-4"
              >
                {user ? 'Enter Dashboard' : 'Begin Your Story'}
              </SpectralButton>
            </MagneticElement>

            {!user && (
              <MagneticElement strength={0.15}>
                <SpectralButton
                  variant="ghost"
                  onClick={() => router.push('/story-library')}
                  size="lg"
                  icon={<Play className="w-5 h-5" />}
                  className="text-lg"
                >
                  Watch Demo
                </SpectralButton>
              </MagneticElement>
            )}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20 max-w-4xl mx-auto"
          >
            <EnhancedStatCard
              icon={Infinity}
              value="∞"
              label="Story Branches"
              isInfinity
              gradient="from-spectral-cyan to-spectral-violet"
              delay={0}
            />
            <EnhancedStatCard
              icon={Users}
              value={50000}
              label="Readers"
              suffix="+"
              gradient="from-spectral-violet to-spectral-rose"
              delay={0.1}
            />
            <EnhancedStatCard
              icon={Sparkles}
              value={1000000}
              label="Choices Made"
              suffix="+"
              gradient="from-spectral-rose to-plasma-orange"
              delay={0.2}
            />
            <EnhancedStatCard
              icon={Star}
              value="4.9"
              label="Rating"
              gradient="from-plasma-orange to-spectral-amber"
              delay={0.3}
            />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-ghost-500"
          >
            <span className="text-xs font-ui tracking-widest uppercase">Scroll to Explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════════
          INTERACTIVE DEMO SECTION
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <RevealOnScroll direction="left">
              <span className="text-xs font-ui tracking-[0.3em] uppercase text-spectral-cyan mb-4 block">
                Live Preview
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-white mb-6">
                Experience The
                <span className="block text-spectral-violet">Magic</span>
              </h2>
              <p className="font-prose text-lg text-ghost-400 mb-8 leading-relaxed">
                Try it yourself. Every choice you make creates a new branch in the story. Watch as
                the AI weaves your decisions into a unique narrative experience.
              </p>

              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Wand2, label: 'AI-Generated' },
                  { icon: Layers, label: 'Branching Paths' },
                  { icon: Eye, label: 'Immersive' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                  >
                    <item.icon className="w-4 h-4 text-spectral-cyan" />
                    <span className="text-sm text-white/80">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </RevealOnScroll>

            {/* Right: Interactive Demo */}
            <RevealOnScroll direction="right" delay={0.2}>
              <StoryPreview />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          FEATURES SECTION - The Powers
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4">
          <RevealOnScroll className="text-center mb-20">
            <span className="text-xs font-ui tracking-[0.3em] uppercase text-spectral-violet mb-4 block">
              Capabilities
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-white mb-6">
              Beyond Reading
            </h2>
            <p className="font-prose text-lg text-ghost-400 max-w-2xl mx-auto">
              Experience stories that respond to your presence, adapt to your choices, and evolve
              with each reading.
            </p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wand2,
                title: 'AI Story Generation',
                description:
                  'Watch as artificial intelligence crafts unique narrative paths based on your decisions in real-time.',
                gradient: 'from-spectral-cyan to-spectral-violet',
              },
              {
                icon: Sparkles,
                title: 'Infinite Branches',
                description:
                  'Every choice creates new story threads. No two readers experience the same journey.',
                gradient: 'from-spectral-violet to-spectral-rose',
              },
              {
                icon: BookOpen,
                title: 'Immersive Reading',
                description:
                  'A distraction-free environment designed for deep literary immersion and focus.',
                gradient: 'from-spectral-rose to-plasma-orange',
              },
              {
                icon: Users,
                title: 'Social Discovery',
                description:
                  'Share your unique story paths with friends and explore narratives they have uncovered.',
                gradient: 'from-plasma-orange to-spectral-amber',
              },
              {
                icon: MessageSquare,
                title: 'AI Companions',
                description:
                  'Interact with intelligent characters who remember your choices and grow with your story.',
                gradient: 'from-spectral-amber to-spectral-emerald',
              },
              {
                icon: Zap,
                title: 'Dynamic Pacing',
                description:
                  'Stories that sense your reading rhythm and adapt their intensity accordingly.',
                gradient: 'from-spectral-emerald to-spectral-cyan',
              },
            ].map((feature, index) => (
              <RevealOnScroll key={index} delay={0.1 * index}>
                <HolographicCard
                  className="p-8 h-full"
                  glowColor={feature.gradient.split(' ')[1]?.replace('to-', '') || 'spectral-cyan'}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-void-black" />
                  </motion.div>
                  <h3 className="font-display text-xl tracking-wide text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="font-prose text-ghost-400 leading-relaxed">{feature.description}</p>
                </HolographicCard>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          TESTIMONIALS SECTION
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <RevealOnScroll className="text-center mb-16">
            <span className="text-xs font-ui tracking-[0.3em] uppercase text-spectral-rose mb-4 block">
              Reader Stories
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-white mb-6">
              What Voyagers Say
            </h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "I've never experienced storytelling like this. Every choice felt meaningful, every consequence real.",
                author: 'Sarah M.',
                role: 'Fantasy Reader',
                avatar: 'S',
                rating: 5,
              },
              {
                quote:
                  'The AI creates narratives so compelling, I forgot I was reading. I was living another life.',
                author: 'Marcus T.',
                role: 'Sci-Fi Enthusiast',
                avatar: 'M',
                rating: 5,
              },
              {
                quote:
                  'Stxryai redefined what interactive fiction can be. The immersion is unparalleled.',
                author: 'Elena K.',
                role: 'Horror Aficionado',
                avatar: 'E',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <RevealOnScroll key={index} delay={0.15 * index}>
                <HolographicCard className="p-8 h-full" glowColor="spectral-violet">
                  {/* Rating stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-spectral-amber fill-spectral-amber" />
                    ))}
                  </div>

                  <p className="font-literary text-lg text-ghost-300 italic mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center text-void-black font-display text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-ui text-sm text-white">{testimonial.author}</div>
                      <div className="text-xs text-ghost-500">{testimonial.role}</div>
                    </div>
                  </div>
                </HolographicCard>
              </RevealOnScroll>
            ))}
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16"
          >
            {[
              '100K+ Downloads',
              '4.9 App Store',
              'Featured in TechCrunch',
              'Top 10 Reading Apps',
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-ghost-500 text-sm font-ui">
                <Star className="w-4 h-4 text-spectral-amber" fill="currentColor" />
                <span>{badge}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          PRICING SECTION
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32">
        <div className="max-w-5xl mx-auto px-4">
          <RevealOnScroll className="text-center mb-16">
            <span className="text-xs font-ui tracking-[0.3em] uppercase text-spectral-amber mb-4 block">
              Membership
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-white mb-6">
              Choose Your Path
            </h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <RevealOnScroll delay={0.1}>
              <HolographicCard className="p-10 h-full" glowColor="spectral-emerald">
                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl tracking-wide text-white mb-3">Explorer</h3>
                  <div className="font-display text-6xl text-white mb-2">Free</div>
                  <p className="text-sm text-ghost-400">Forever</p>
                </div>

                <ul className="space-y-4 mb-10">
                  {[
                    'Access to curated stories',
                    '10 choices per day',
                    'Basic reading themes',
                    'Community access',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-ghost-300">
                      <span className="w-2 h-2 rounded-full bg-spectral-emerald" />
                      <span className="font-prose">{feature}</span>
                    </li>
                  ))}
                </ul>

                <SpectralButton variant="secondary" fullWidth href="/authentication?mode=signup">
                  Start Free
                </SpectralButton>
              </HolographicCard>
            </RevealOnScroll>

            {/* Premium Tier */}
            <RevealOnScroll delay={0.2}>
              <div className="relative">
                {/* Premium badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-spectral-violet to-spectral-rose text-white text-xs font-ui tracking-wide shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </span>
                </div>

                <HolographicCard className="p-10 h-full" glowColor="spectral-violet">
                  <div className="text-center mb-8">
                    <h3 className="font-display text-2xl tracking-wide text-white mb-3">Voyager</h3>
                    <div className="font-display text-6xl text-spectral-violet mb-2">
                      $9<span className="text-2xl text-ghost-400">/mo</span>
                    </div>
                    <p className="text-sm text-ghost-400">Billed monthly</p>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {[
                      'Unlimited story access',
                      'Unlimited choices',
                      'Premium reading themes',
                      'AI story generation',
                      'Exclusive content',
                      'Priority support',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-ghost-300">
                        <span className="w-2 h-2 rounded-full bg-spectral-violet" />
                        <span className="font-prose">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <SpectralButton variant="plasma" fullWidth href="/pricing">
                    Upgrade Now
                  </SpectralButton>
                </HolographicCard>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          CTA SECTION - The Invitation
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-40 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <MorphingBlob
            color="spectral-cyan"
            size={800}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <RevealOnScroll className="text-center">
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-white mb-8">
                Your Story Awaits
              </h2>
            </motion.div>
            <p className="font-prose text-xl text-ghost-400 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join thousands of readers who have discovered a new way to experience fiction. Every
              story is a universe. Every choice is a new beginning.
            </p>

            <MagneticElement strength={0.15}>
              <SpectralButton
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                href={user ? '/user-dashboard' : '/authentication?mode=signup'}
                className="text-lg px-10 py-5"
              >
                {user ? 'Continue Reading' : 'Create Free Account'}
              </SpectralButton>
            </MagneticElement>
          </RevealOnScroll>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default LandingPageInteractive;
