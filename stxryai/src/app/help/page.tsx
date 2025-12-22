'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground, { AmbientOrbs } from '@/components/void/VoidBackground';
import EtherealNav from '@/components/void/EtherealNav';
import SpectralButton from '@/components/void/SpectralButton';
import { TemporalHeading } from '@/components/void/VoidText';
import { StaggerContainer, StaggerItem } from '@/components/void/TemporalReveal';

interface FAQ {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

interface HelpCategory {
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories: HelpCategory[] = [
    {
      name: 'Getting Started',
      description: 'Learn the basics of Stxryai',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-spectral-cyan to-spectral-violet',
    },
    {
      name: 'Reading Stories',
      description: 'Navigate interactive fiction',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: 'from-spectral-violet to-spectral-rose',
    },
    {
      name: 'Creating Stories',
      description: 'Become a story author',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      gradient: 'from-spectral-rose to-amber-400',
    },
    {
      name: 'Account & Billing',
      description: 'Manage subscriptions and settings',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: 'from-amber-400 to-spectral-cyan',
    },
  ];

  const faqs: FAQ[] = [
    {
      question: 'What is Stxryai?',
      answer: 'Stxryai is an AI-powered interactive fiction platform where you can read and create stories that branch and evolve based on your choices. Every decision you make shapes the narrative, creating a unique reading experience every time.',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      question: 'How do I create a story?',
      answer: 'Navigate to the Story Creation Studio from the navigation bar. You can start by creating a new draft, adding chapters, and defining choices. Our AI assistant can help you brainstorm ideas, expand scenes, and create engaging branching narratives.',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      question: 'What are energy points?',
      answer: 'Energy points are used to make choices in stories and generate AI content. They regenerate over time—free users get 1 energy per 3 hours, while premium users regenerate faster. You can also purchase additional energy or upgrade to a higher tier for more generous limits.',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      question: 'How do I report inappropriate content?',
      answer: 'You can report stories, comments, or users by clicking the "Report" button next to the content. Our moderation team reviews all reports within 24 hours. We take community safety seriously and have strict content guidelines.',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      question: 'Can I collaborate with other authors?',
      answer: 'Yes! Creator Pro subscribers can invite collaborators to their stories. You can co-write chapters, share access to story branches, and work together in real-time with built-in version control.',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      question: 'How does the AI writing assistant work?',
      answer: 'Our AI analyzes your story context, characters, and style to generate suggestions that feel natural to your narrative. You can ask it to expand scenes, create dialogue, suggest plot twists, or help with writer\'s block. The AI learns from your writing to maintain consistency.',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ];

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <VoidBackground variant="subtle" />
      <AmbientOrbs />

      {/* Navigation */}
      <EtherealNav />

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <TemporalHeading level={1} className="text-5xl md:text-6xl mb-6">
              <span className="bg-gradient-to-r from-spectral-cyan via-white to-spectral-violet bg-clip-text text-transparent">
                Help Center
              </span>
            </TemporalHeading>
            <p className="text-xl text-ghost-400 max-w-2xl mx-auto mb-8">
              Find answers, learn the platform, and get the most out of your storytelling journey.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-spectral-cyan/20 via-spectral-violet/20 to-spectral-rose/20 rounded-xl blur-lg opacity-50" />
              <div className="relative flex items-center">
                <svg
                  className="absolute left-4 w-5 h-5 text-ghost-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for answers..."
                  className="w-full pl-12 pr-4 py-4 bg-void-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-ghost-500 focus:outline-none focus:border-spectral-cyan/50 focus:ring-1 focus:ring-spectral-cyan/30 transition-all duration-300"
                />
              </div>
            </div>
          </motion.div>

          {/* Help Categories */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {helpCategories.map((category, index) => (
              <StaggerItem key={index}>
                <motion.button
                  className="relative w-full text-left group"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Hover glow */}
                  <div className={`absolute -inset-px rounded-xl bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300`} />

                  <div className="relative bg-void-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-full group-hover:border-white/20 transition-all duration-300">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center text-void-black mb-4`}>
                      {category.icon}
                    </div>
                    <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-ghost-500">{category.description}</p>
                  </div>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center font-display">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <AnimatePresence>
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    {/* Glow on open */}
                    <motion.div
                      className="absolute -inset-px rounded-xl bg-gradient-to-r from-spectral-cyan/20 to-spectral-violet/20 blur-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: openFaq === index ? 0.5 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className={`relative bg-void-black/60 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'border-spectral-cyan/30' : 'border-white/10 hover:border-white/20'}`}>
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full flex items-center gap-4 p-6 text-left"
                      >
                        <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${openFaq === index ? 'bg-spectral-cyan/20 text-spectral-cyan' : 'bg-white/5 text-ghost-400'}`}>
                          {faq.icon}
                        </span>
                        <span className="flex-1 text-white font-medium">{faq.question}</span>
                        <motion.span
                          className="flex-shrink-0 text-ghost-400"
                          animate={{ rotate: openFaq === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {openFaq === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pl-20">
                              <p className="text-ghost-400 leading-relaxed">{faq.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredFaqs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <svg className="w-16 h-16 text-ghost-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-ghost-400">No results found for "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-spectral-cyan hover:text-spectral-violet transition-colors"
                  >
                    Clear search
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20"
          >
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-spectral-cyan/10 via-spectral-violet/10 to-spectral-rose/10 rounded-3xl blur-xl" />
              <div className="relative bg-void-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center">
                  <svg className="w-8 h-8 text-void-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-display">Still need help?</h3>
                <p className="text-ghost-400 mb-6">
                  Our support team is here to help. Reach out and we'll get back to you within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <SpectralButton variant="primary">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Support
                    </span>
                  </SpectralButton>
                  <Link href="https://discord.gg/stxryai" target="_blank">
                    <SpectralButton variant="secondary">
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
                        </svg>
                        Join Discord
                      </span>
                    </SpectralButton>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;
