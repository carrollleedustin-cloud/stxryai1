'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, BookOpen, Sparkles, Heart, Globe, Shield, ArrowRight, Star } from 'lucide-react';
import VoidBackground from '@/components/void/VoidBackground';
import ParticleField from '@/components/void/ParticleField';
import { EtherealNav } from '@/components/void';

const AboutPage = () => {
  const team = [
    {
      name: 'StxryAI Team',
      role: 'Founders & Creators',
      bio: 'Passionate about bringing interactive fiction to everyone through the power of AI.',
    },
  ];

  const values = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Stories for Everyone',
      description:
        'We believe interactive fiction should be accessible to readers of all ages and backgrounds.',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered Creativity',
      description:
        'We harness cutting-edge AI to create unique, personalized storytelling experiences.',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Community First',
      description: 'Our platform is built around the amazing community of readers and writers.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Safe & Family-Friendly',
      description:
        'We maintain a safe environment with robust content moderation and family controls.',
    },
  ];

  const milestones = [
    { year: '2024', event: 'StxryAI platform launched' },
    { year: '2024', event: 'AI story generation introduced' },
    { year: '2024', event: 'Community features added' },
    { year: '2025', event: 'Premium features & mobile app' },
  ];

  return (
    <VoidBackground variant="subtle">
      <ParticleField particleCount={30} color="rgba(0, 245, 212, 0.15)" />
      <EtherealNav />

      <main className="relative min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-spectral-cyan/10 text-spectral-cyan text-sm font-ui tracking-wide mb-6">
                About Us
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-6 tracking-wide">
                Where Stories Come{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-spectral-cyan to-spectral-violet">
                  Alive
                </span>
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto font-prose leading-relaxed">
                StxryAI is an AI-powered interactive fiction platform that lets you explore infinite
                story possibilities. Every choice you make shapes a unique narrative crafted just
                for you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="void-glass rounded-3xl p-8 md:p-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-8 h-8 text-spectral-cyan" />
                <h2 className="font-display text-2xl text-text-primary">Our Mission</h2>
              </div>
              <p className="text-text-secondary font-prose text-lg leading-relaxed">
                We're on a mission to revolutionize storytelling by combining the art of narrative
                with the power of artificial intelligence. Our platform empowers readers to become
                active participants in their stories, making choices that genuinely matter and lead
                to unique outcomes. We believe that everyone has a story to explore, and we're here
                to help them find it.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl text-text-primary text-center mb-12"
            >
              What We Stand For
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="void-glass rounded-2xl p-6 hover:border-spectral-cyan/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-spectral-cyan/10 flex items-center justify-center text-spectral-cyan mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-display text-xl text-text-primary mb-2">{value.title}</h3>
                  <p className="text-text-tertiary font-prose">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl text-text-primary text-center mb-12"
            >
              Our Journey
            </motion.h2>

            <div className="relative">
              <div className="absolute left-1/2 -translate-x-px h-full w-0.5 bg-membrane" />

              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center gap-4 mb-8 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <span className="text-spectral-cyan font-ui text-sm">{milestone.year}</span>
                    <p className="text-text-primary font-prose">{milestone.event}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-spectral-cyan z-10 shadow-glow-cyan" />
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Stories Created', value: '10K+' },
                { label: 'Active Readers', value: '50K+' },
                { label: 'Choices Made', value: '1M+' },
                { label: 'Community Rating', value: '4.9' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="void-glass rounded-2xl p-6 text-center"
                >
                  <p className="text-3xl md:text-4xl font-display text-spectral-cyan mb-2">
                    {stat.value}
                  </p>
                  <p className="text-text-tertiary font-ui text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="void-glass-heavy rounded-3xl p-12"
            >
              <h2 className="font-display text-3xl text-text-primary mb-4">
                Ready to Start Your Story?
              </h2>
              <p className="text-text-secondary font-prose mb-8">
                Join thousands of readers exploring infinite narratives.
              </p>
              <Link
                href="/authentication?mode=signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-spectral-cyan to-spectral-violet text-void-absolute font-ui tracking-wide hover:shadow-glow-cyan transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </VoidBackground>
  );
};

export default AboutPage;
