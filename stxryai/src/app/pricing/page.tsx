'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import VoidBackground, { AmbientOrbs } from '@/components/void/VoidBackground';
import EtherealNav from '@/components/void/EtherealNav';
import SpectralButton from '@/components/void/SpectralButton';
import { TemporalHeading } from '@/components/void/VoidText';
import { StaggerContainer, StaggerItem } from '@/components/void/TemporalReveal';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
  icon: React.ReactNode;
  gradient: string;
}

const PricingPage: React.FC = () => {
  const pricingTiers: PricingTier[] = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for casual readers exploring interactive fiction',
      features: [
        '20 Energy (refills slowly)',
        '1 energy per 3 hours',
        'Access to public stories',
        'Basic community features',
        'Reading statistics',
        'Story bookmarks',
        'Mobile app access',
      ],
      ctaText: 'Start Free',
      ctaLink: '/authentication',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      gradient: 'from-ghost-400 to-ghost-600',
    },
    {
      name: 'Premium',
      price: '$7.14',
      description: 'Unlimited access for dedicated story enthusiasts',
      features: [
        '100 Energy (refills 2x faster)',
        'Exclusive premium stories',
        'Ad-free experience',
        'Custom choice writing',
        'AI story suggestions',
        'Reading mode customization',
        'Download stories offline',
        'Priority support',
        'Advanced reading analytics',
        'Story collections & playlists',
      ],
      isPopular: true,
      ctaText: 'Start Premium Trial',
      ctaLink: '/authentication',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      gradient: 'from-spectral-cyan to-spectral-violet',
    },
    {
      name: 'Creator Pro',
      price: '$15',
      description: 'For authors and professional storytellers',
      features: [
        'Unlimited Energy (no limits!)',
        'Everything in Premium',
        'AI writing assistant',
        'Advanced story creation tools',
        'Unlimited story publishing',
        'Co-authoring & collaboration',
        'Creator analytics dashboard',
        'Version control & branching',
        'Custom story themes & styling',
        'Monetization tools',
        'API access for integrations',
        'White-label options',
      ],
      ctaText: 'Become a Creator',
      ctaLink: '/authentication',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      gradient: 'from-spectral-violet to-spectral-rose',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <VoidBackground variant="dense" />
      <AmbientOrbs />
      
      {/* Navigation */}
      <EtherealNav />

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <TemporalHeading level={1} className="text-5xl md:text-6xl mb-6">
              Choose Your
              <span className="block mt-2 bg-gradient-to-r from-spectral-cyan via-spectral-violet to-spectral-rose bg-clip-text text-transparent">
                Story Journey
              </span>
            </TemporalHeading>
            <p className="text-xl text-ghost-400 max-w-2xl mx-auto">
              Start free and upgrade anytime. All plans include our core interactive fiction experience.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {pricingTiers.map((tier, index) => (
              <StaggerItem key={index}>
                <motion.div
                  className={`relative group ${tier.isPopular ? 'lg:-mt-4 lg:mb-4' : ''}`}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  {/* Popular Badge */}
                  {tier.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="px-4 py-1.5 bg-gradient-to-r from-spectral-cyan to-spectral-violet text-void-black rounded-full text-sm font-bold shadow-lg shadow-spectral-cyan/30 whitespace-nowrap"
                      >
                        ✨ Most Popular
                      </motion.span>
                    </div>
                  )}

                  {/* Card Glow */}
                  <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${tier.gradient} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500`} />
                  
                  {/* Card */}
                  <div className={`relative bg-void-black/80 backdrop-blur-xl rounded-2xl border ${tier.isPopular ? 'border-spectral-cyan/50' : 'border-white/10'} p-8 transition-all duration-500 h-full`}>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-void-black mb-6`}>
                      {tier.icon}
                    </div>

                    {/* Tier Name & Price */}
                    <h3 className="text-2xl font-bold text-white mb-2 font-display">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-5xl font-bold bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                        {tier.price}
                      </span>
                      <span className="text-ghost-500 text-sm">/month</span>
                    </div>
                    <p className="text-sm text-ghost-400 mb-8">{tier.description}</p>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <svg
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.isPopular ? 'text-spectral-cyan' : 'text-spectral-violet'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-ghost-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Link href={tier.ctaLink}>
                      <SpectralButton
                        variant={tier.isPopular ? 'primary' : 'secondary'}
                        className="w-full justify-center"
                      >
                        {tier.ctaText}
                      </SpectralButton>
                    </Link>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Bottom Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-4 flex-wrap justify-center text-sm text-ghost-500">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                14-day money-back guarantee
              </span>
              <span className="hidden sm:inline text-ghost-700">•</span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-spectral-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel anytime
              </span>
              <span className="hidden sm:inline text-ghost-700">•</span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-spectral-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure payment via Stripe
              </span>
            </div>
          </motion.div>

          {/* FAQ Section Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-20 text-center"
          >
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-spectral-cyan/10 via-spectral-violet/10 to-spectral-rose/10 rounded-2xl blur-xl" />
              <div className="relative bg-void-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-white mb-3">Have questions?</h3>
                <p className="text-ghost-400 mb-6">
                  Check out our FAQ or reach out to our support team.
                </p>
                <Link href="/help">
                  <SpectralButton variant="ghost">
                    <span className="flex items-center gap-2">
                      Visit Help Center
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </SpectralButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
