'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import VoidBackground, { AmbientOrbs } from '@/components/void/VoidBackground';
import { TemporalHeading } from '@/components/void/VoidText';
import TemporalReveal, { StaggerContainer, StaggerItem, ParallaxDepth } from '@/components/void/TemporalReveal';
import DimensionalCard from '@/components/void/DimensionalCard';
import SpectralButton from '@/components/void/SpectralButton';
import EtherealNav from '@/components/void/EtherealNav';
import ParticleField, { AnimatedCounter, TypewriterText, FloatingElement, MagneticButton, GlitchText } from '@/components/void/ParticleField';
import FooterSection from './FooterSection';

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
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  
  // Track mouse for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <VoidBackground variant="aurora">
      <ParticleField particleCount={60} color="rgba(0, 245, 212, 0.3)" />
      <AmbientOrbs />
      <EtherealNav />
      
      {/* ════════════════════════════════════════════════════════════════════════
          HERO SECTION - The Awakening
          ════════════════════════════════════════════════════════════════════════ */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Orbs with Parallax */}
        <motion.div
          style={{
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
            style={{ background: 'var(--spectral-cyan)' }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15"
            style={{ background: 'var(--spectral-violet)' }}
          />
        </motion.div>
        
        {/* Hero Content */}
        <div className="relative z-10 container-void text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spectral-cyan/5 border border-spectral-cyan/20">
              <span className="w-2 h-2 rounded-full bg-spectral-cyan animate-pulse" />
              <span className="text-xs font-ui tracking-widest uppercase text-spectral-cyan">
                AI-Powered Interactive Fiction
              </span>
            </span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl tracking-[0.15em] uppercase mb-6"
          >
            <span className="block text-text-primary">Infinite</span>
            <span className="block mt-2 text-aurora bg-gradient-to-r from-spectral-cyan via-spectral-violet to-plasma-pink bg-clip-text text-transparent bg-[length:200%_auto] animate-[aurora-shift_8s_ease_infinite]">
              Stories
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="font-literary text-xl md:text-2xl text-text-tertiary italic max-w-2xl mx-auto mb-12"
          >
            Where every choice fractures reality into new narratives.
            <br />
            Your decisions shape worlds that never existed before.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <SpectralButton
              onClick={() => router.push(user ? '/user-dashboard' : '/authentication?mode=signup')}
              size="lg"
              icon={<Zap className="w-5 h-5" />}
            >
              {user ? 'Enter Dashboard' : 'Begin Your Story'}
            </SpectralButton>
            
            {!user && (
              <SpectralButton
                variant="ghost"
                onClick={() => router.push('/story-library')}
                size="lg"
                icon={<BookOpen className="w-5 h-5" />}
              >
                Explore Library
              </SpectralButton>
            )}
          </motion.div>
          
          {/* Stats - Animated Counters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto"
          >
            {[
              { icon: Infinity, value: '∞', label: 'Story Branches', isInfinity: true },
              { icon: Users, value: 50000, label: 'Readers', suffix: '+' },
              { icon: Sparkles, value: 1000000, label: 'Choices Made', suffix: '+' },
              { icon: Star, value: 4.9, label: 'Rating', prefix: '', isDecimal: true },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                className="text-center group"
              >
                <FloatingElement duration={4 + index} distance={6} delay={index * 0.3}>
                  <stat.icon className="w-6 h-6 mx-auto mb-3 text-spectral-cyan opacity-60 group-hover:opacity-100 transition-opacity" />
                </FloatingElement>
                <div className="font-display text-3xl tracking-wide text-text-primary mb-1">
                  {stat.isInfinity ? (
                    <GlitchText>∞</GlitchText>
                  ) : stat.isDecimal ? (
                    stat.value
                  ) : (
                    <AnimatedCounter 
                      end={stat.value} 
                      duration={2.5} 
                      suffix={stat.suffix || ''} 
                      prefix={stat.prefix || ''}
                      className="inline-block"
                    />
                  )}
                </div>
                <div className="text-xs font-ui tracking-widest uppercase text-text-ghost">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div
            className="flex flex-col items-center gap-2 text-text-ghost animate-bounce"
          >
            <span className="text-xs font-ui tracking-widest uppercase">Scroll to Explore</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </motion.div>
      </motion.section>
      
      {/* ════════════════════════════════════════════════════════════════════════
          FEATURES SECTION - The Powers
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative section-breathing">
        <div className="container-void">
          <TemporalReveal className="text-center mb-20">
            <span className="text-xs font-ui tracking-[0.3em] uppercase text-spectral-cyan mb-4 block">
              Capabilities
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-text-primary mb-6">
              Beyond Reading
            </h2>
            <p className="font-prose text-lg text-text-tertiary max-w-2xl mx-auto">
              Experience stories that respond to your presence, adapt to your choices, 
              and evolve with each reading.
            </p>
          </TemporalReveal>
          
          <StaggerContainer stagger={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wand2,
                title: 'AI Story Generation',
                description: 'Watch as artificial intelligence crafts unique narrative paths based on your decisions in real-time.',
                gradient: 'from-spectral-cyan to-spectral-violet',
              },
              {
                icon: Sparkles,
                title: 'Infinite Branches',
                description: 'Every choice creates new story threads. No two readers experience the same journey.',
                gradient: 'from-spectral-violet to-plasma-pink',
              },
              {
                icon: BookOpen,
                title: 'Immersive Reading',
                description: 'A distraction-free environment designed for deep literary immersion and focus.',
                gradient: 'from-plasma-pink to-plasma-orange',
              },
              {
                icon: Users,
                title: 'Social Discovery',
                description: 'Share your unique story paths with friends and explore narratives they have uncovered.',
                gradient: 'from-plasma-orange to-spectral-amber',
              },
              {
                icon: MessageSquare,
                title: 'AI Companions',
                description: 'Interact with intelligent characters who remember your choices and grow with your story.',
                gradient: 'from-spectral-amber to-spectral-emerald',
              },
              {
                icon: Zap,
                title: 'Dynamic Pacing',
                description: 'Stories that sense your reading rhythm and adapt their intensity accordingly.',
                gradient: 'from-spectral-emerald to-spectral-cyan',
              },
            ].map((feature, index) => (
              <StaggerItem key={index}>
                <DimensionalCard className="h-full p-8">
                  <div 
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                    style={{ boxShadow: '0 0 30px rgba(0, 245, 212, 0.2)' }}
                  >
                    <feature.icon className="w-6 h-6 text-void-absolute" />
                  </div>
                  <h3 className="font-display text-xl tracking-wide text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="font-prose text-text-tertiary leading-relaxed">
                    {feature.description}
                  </p>
                </DimensionalCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
      
      {/* ════════════════════════════════════════════════════════════════════════
          SHOWCASE SECTION - The Experience
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative section-breathing overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-1/2 left-0 w-full h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--spectral-cyan), transparent)',
              opacity: 0.1,
            }}
          />
        </div>
        
        <div className="container-void">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <TemporalReveal direction="left">
              <span className="text-xs font-ui tracking-[0.3em] uppercase text-spectral-violet mb-4 block">
                The Reader
              </span>
              <h2 className="font-display text-4xl md:text-5xl tracking-wide text-text-primary mb-6">
                An Interface That <br />
                <span className="text-aurora">Disappears</span>
              </h2>
              <p className="font-prose text-lg text-text-tertiary mb-8 leading-relaxed">
                We designed every pixel to fade into the background. 
                No distractions. No clutter. Just you and the story, 
                existing in the same space.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Focus mode that dims surrounding text',
                  'Customizable typography and themes',
                  'Ambient soundscapes for immersion',
                  'Gesture-based navigation',
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 text-text-secondary"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-spectral-cyan" />
                    <span className="font-prose">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </TemporalReveal>
            
            {/* Right: Visual */}
            <TemporalReveal direction="right" delay={0.2}>
              <div className="relative">
                {/* Reader mockup */}
                <div className="void-glass rounded-2xl p-8 relative">
                  {/* Decorative top bar */}
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-3 h-3 rounded-full bg-spectral-rose/50" />
                    <div className="w-3 h-3 rounded-full bg-spectral-amber/50" />
                    <div className="w-3 h-3 rounded-full bg-spectral-emerald/50" />
                  </div>
                  
                  {/* Mock content */}
                  <div className="space-y-4">
                    <p className="font-literary text-2xl text-text-primary leading-relaxed">
                      <span className="text-4xl float-left mr-3 text-spectral-cyan font-light">T</span>
                      he corridor stretched before her, shadows dancing 
                      at the edges of the flickering torchlight...
                    </p>
                    <p className="font-prose text-text-tertiary leading-relaxed opacity-60">
                      She knew that whatever choice she made next would 
                      change everything. There was no going back.
                    </p>
                  </div>
                  
                  {/* Choice buttons mock */}
                  <div className="mt-8 space-y-3">
                    <div className="p-4 rounded-lg bg-void-mist border border-membrane hover:border-spectral-cyan/30 transition-colors cursor-pointer">
                      <span className="text-text-secondary font-prose">→ Continue down the corridor</span>
                    </div>
                    <div className="p-4 rounded-lg bg-void-mist border border-membrane opacity-60">
                      <span className="text-text-ghost font-prose">→ Turn back and find another way</span>
                    </div>
                  </div>
                </div>
                
                {/* Glow effect */}
                <div 
                  className="absolute -inset-4 -z-10 rounded-3xl blur-3xl opacity-20"
                  style={{ background: 'linear-gradient(135deg, var(--spectral-cyan), var(--spectral-violet))' }}
                />
              </div>
            </TemporalReveal>
          </div>
        </div>
      </section>
      
      {/* ════════════════════════════════════════════════════════════════════════
          TESTIMONIALS SECTION - Social Proof
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative section-breathing overflow-hidden">
        <div className="container-void">
          <TemporalReveal className="text-center mb-16">
            <span className="text-xs font-ui tracking-[0.3em] uppercase text-spectral-rose mb-4 block">
              Reader Stories
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-text-primary mb-6">
              What Voyagers Say
            </h2>
          </TemporalReveal>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I've never experienced storytelling like this. Every choice felt meaningful, every consequence real.",
                author: "Sarah M.",
                role: "Fantasy Reader",
                avatar: "S",
              },
              {
                quote: "The AI creates narratives so compelling, I forgot I was reading. I was living another life.",
                author: "Marcus T.",
                role: "Sci-Fi Enthusiast",
                avatar: "M",
              },
              {
                quote: "Stxryai redefined what interactive fiction can be. The immersion is unparalleled.",
                author: "Elena K.",
                role: "Horror Aficionado",
                avatar: "E",
              },
            ].map((testimonial, index) => (
              <TemporalReveal key={index} delay={0.1 * index}>
                <DimensionalCard className="p-8 h-full relative">
                  {/* Quote marks */}
                  <div className="absolute top-4 right-4 text-6xl font-display text-spectral-cyan/10">
                    "
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <p className="font-literary text-lg text-text-secondary italic mb-6 leading-relaxed flex-grow">
                      "{testimonial.quote}"
                    </p>
                    
                    <div className="flex items-center gap-4 pt-4 border-t border-membrane">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center text-void-absolute font-display text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-ui text-sm text-text-primary">{testimonial.author}</div>
                        <div className="text-xs text-text-ghost">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </DimensionalCard>
              </TemporalReveal>
            ))}
          </div>
          
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16"
          >
            {['100K+ Downloads', '4.9 App Store', 'Featured in TechCrunch', 'Top 10 Reading Apps'].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-text-ghost text-sm font-ui">
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
      <section className="relative section-breathing">
        <div className="container-void">
          <TemporalReveal className="text-center mb-16">
            <span className="text-xs font-ui tracking-[0.3em] uppercase text-spectral-amber mb-4 block">
              Membership
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-text-primary mb-6">
              Choose Your Path
            </h2>
          </TemporalReveal>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <TemporalReveal delay={0.1}>
              <DimensionalCard className="p-8 h-full">
                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl tracking-wide text-text-primary mb-2">
                    Explorer
                  </h3>
                  <div className="font-display text-5xl text-text-primary mb-2">
                    Free
                  </div>
                  <p className="text-sm text-text-tertiary">Forever</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    'Access to curated stories',
                    '10 choices per day',
                    'Basic reading themes',
                    'Community access',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-spectral-emerald" />
                      <span className="font-prose text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <SpectralButton variant="secondary" fullWidth href="/authentication?mode=signup">
                  Start Free
                </SpectralButton>
              </DimensionalCard>
            </TemporalReveal>
            
            {/* Premium Tier */}
            <TemporalReveal delay={0.2}>
              <DimensionalCard 
                className="p-8 h-full relative"
                glowColor="rgba(123, 44, 191, 0.2)"
              >
                {/* Premium badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-plasma">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </span>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl tracking-wide text-text-primary mb-2">
                    Voyager
                  </h3>
                  <div className="font-display text-5xl text-spectral-violet mb-2">
                    $9<span className="text-2xl text-text-tertiary">/mo</span>
                  </div>
                  <p className="text-sm text-text-tertiary">Billed monthly</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    'Unlimited story access',
                    'Unlimited choices',
                    'Premium reading themes',
                    'AI story generation',
                    'Exclusive content',
                    'Priority support',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-spectral-violet" />
                      <span className="font-prose text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <SpectralButton variant="plasma" fullWidth href="/pricing">
                  Upgrade Now
                </SpectralButton>
              </DimensionalCard>
            </TemporalReveal>
          </div>
        </div>
      </section>
      
      {/* ════════════════════════════════════════════════════════════════════════
          CTA SECTION - The Invitation
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative section-breathing overflow-hidden">
        {/* Background effects - using CSS animations */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
            style={{ 
              background: 'var(--spectral-cyan)',
              animation: 'ambientOrb1 8s ease-in-out infinite',
              opacity: 0.15,
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ 
              background: 'var(--spectral-violet)',
              animation: 'ambientOrb2 10s ease-in-out infinite 2s',
              opacity: 0.12,
            }}
          />
        </div>
        
        <div className="container-void relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <TemporalReveal>
              <h2 className="font-display text-4xl md:text-6xl tracking-wide text-text-primary mb-8">
                Your Story Awaits
              </h2>
              <p className="font-prose text-xl text-text-tertiary mb-12 leading-relaxed">
                Join thousands of readers who have discovered a new way to experience fiction. 
                Every story is a universe. Every choice is a new beginning.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SpectralButton
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                  href={user ? '/user-dashboard' : '/authentication?mode=signup'}
                >
                  {user ? 'Continue Reading' : 'Create Free Account'}
                </SpectralButton>
              </div>
            </TemporalReveal>
          </div>
        </div>
      </section>
      
      <FooterSection />
    </VoidBackground>
  );
};

export default LandingPageInteractive;
