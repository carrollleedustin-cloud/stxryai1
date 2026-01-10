'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav, TemporalHeading, ParticleField } from '@/components/void';
import { HolographicCard, RevealOnScroll, GradientBorder } from '@/components/void/AdvancedEffects';
import SpectralButton from '@/components/void/SpectralButton';
import Icon from '@/components/ui/AppIcon';

const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click "Begin" in the navigation bar and fill out the registration form. You can also sign up with Google, GitHub, or Discord for faster access.',
      },
      {
        question: 'Is StxryAI free to use?',
        answer:
          'Yes! StxryAI offers a free tier with access to all stories and basic features. Premium subscriptions unlock unlimited choices, ad-free reading, and exclusive content.',
      },
      {
        question: 'What devices can I use StxryAI on?',
        answer:
          'StxryAI works on any modern web browser - desktop, tablet, or mobile. Your reading progress syncs across all your devices.',
      },
    ],
  },
  {
    category: 'Reading & Stories',
    items: [
      {
        question: 'How do interactive stories work?',
        answer:
          "At key moments in each story, you'll be presented with choices that affect the narrative. Your decisions shape the story's direction, leading to different outcomes and endings.",
      },
      {
        question: 'Can I replay stories with different choices?',
        answer:
          'Absolutely! You can restart any story or use chapter bookmarks to explore different paths. Discovering all endings is part of the fun!',
      },
      {
        question: 'How do I save my reading progress?',
        answer:
          "Your progress is automatically saved as you read. Just make sure you're signed in to your account.",
      },
    ],
  },
  {
    category: 'Account & Premium',
    items: [
      {
        question: 'How do I upgrade to Premium?',
        answer:
          'Visit the Pricing page and select the plan that works for you. Premium gives you unlimited choices, no ads, exclusive stories, and early access to new features.',
      },
      {
        question: 'Can I cancel my subscription?',
        answer:
          "Yes, you can cancel anytime from your account settings. You'll keep access to premium features until the end of your billing period.",
      },
      {
        question: 'How do I reset my password?',
        answer:
          'Click "Forgot Password" on the sign-in page. We\'ll send you a link to reset your password via email.',
      },
    ],
  },
  {
    category: 'Technical Support',
    items: [
      {
        question: "The page isn't loading properly",
        answer:
          'Try clearing your browser cache and cookies, then refresh the page. If the issue persists, try a different browser or contact support.',
      },
      {
        question: "I'm having trouble with payments",
        answer:
          'Payment issues are usually resolved by trying a different payment method or clearing your browser data. If problems continue, contact support with your order details.',
      },
      {
        question: 'How do I report a bug?',
        answer:
          'Use the feedback form below or email support@stxry.ai with a description of the issue, your browser/device info, and screenshots if possible.',
      },
    ],
  },
];

const CONTACT_METHODS = [
  {
    icon: 'MailIcon',
    title: 'Email Support',
    description: 'Get help via email',
    contact: 'support@stxry.ai',
    color: 'text-spectral-cyan',
  },
  {
    icon: 'MessageCircleIcon',
    title: 'Community Forums',
    description: 'Ask the community',
    contact: 'Visit Forums',
    href: '/forums',
    color: 'text-purple-400',
  },
  {
    icon: 'TwitterIcon',
    title: 'Twitter/X',
    description: 'Follow for updates',
    contact: '@StxryAI',
    href: 'https://twitter.com/StxryAI',
    color: 'text-blue-400',
  },
  {
    icon: 'DiscIcon',
    title: 'Discord',
    description: 'Join our community',
    contact: 'Join Server',
    href: 'https://discord.gg/stxryai',
    color: 'text-indigo-400',
  },
];

export default function SupportPage() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden">
      <VoidBackground variant="subtle" />
      <ParticleField particleCount={40} color="rgba(168, 85, 247, 0.2)" maxSize={2} />
      <EtherealNav />

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <TemporalHeading level={1} accent className="mb-4">
              Support Center
            </TemporalHeading>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto font-body">
              Need help? We're here for you. Browse our FAQ or reach out directly.
            </p>
          </div>
        </RevealOnScroll>

        {/* Contact Methods */}
        <RevealOnScroll threshold={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {CONTACT_METHODS.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <HolographicCard className="p-6 text-center h-full">
                  <Icon name={method.icon} className={`${method.color} mx-auto mb-3`} size={32} />
                  <h3 className="text-lg font-bold text-aurora mb-1">{method.title}</h3>
                  <p className="text-sm text-text-secondary mb-3">{method.description}</p>
                  {method.href ? (
                    <a
                      href={method.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${method.color} hover:underline text-sm font-medium`}
                    >
                      {method.contact}
                    </a>
                  ) : (
                    <span className={`${method.color} text-sm font-medium`}>{method.contact}</span>
                  )}
                </HolographicCard>
              </motion.div>
            ))}
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <RevealOnScroll threshold={0.1}>
              <h2 className="text-3xl font-bold text-aurora mb-8 flex items-center">
                <Icon name="HelpCircleIcon" className="mr-3 text-spectral-cyan" size={28} />
                Frequently Asked Questions
              </h2>
            </RevealOnScroll>

            {FAQ_ITEMS.map((category, catIndex) => (
              <RevealOnScroll key={category.category} threshold={0.1}>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => {
                      const faqId = `${catIndex}-${itemIndex}`;
                      const isOpen = openFAQ === faqId;

                      return (
                        <motion.div
                          key={faqId}
                          className="rounded-xl border border-void-border bg-void-100/20 overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenFAQ(isOpen ? null : faqId)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-void-100/30 transition-colors"
                          >
                            <span className="font-medium text-text-primary">{item.question}</span>
                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                              <Icon
                                name="ChevronDownIcon"
                                className="text-spectral-cyan"
                                size={20}
                              />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-6 pb-4 text-text-secondary">{item.answer}</div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <RevealOnScroll threshold={0.1}>
              <GradientBorder className="p-1 rounded-xl sticky top-24">
                <div className="bg-void-100/30 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-aurora mb-6 flex items-center">
                    <Icon name="SendIcon" className="mr-3 text-spectral-cyan" size={24} />
                    Contact Us
                  </h2>

                  {submitSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="text-5xl mb-4">✅</div>
                      <h3 className="text-xl font-bold text-green-400 mb-2">Message Sent!</h3>
                      <p className="text-text-secondary">We'll get back to you within 24 hours.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-void-100/50 border border-void-border text-text-primary focus:outline-none focus:border-spectral-cyan"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-void-100/50 border border-void-border text-text-primary focus:outline-none focus:border-spectral-cyan"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Subject</label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-void-100/50 border border-void-border text-text-primary focus:outline-none focus:border-spectral-cyan"
                        >
                          <option value="">Select a topic</option>
                          <option value="account">Account Issues</option>
                          <option value="billing">Billing & Payments</option>
                          <option value="technical">Technical Problem</option>
                          <option value="content">Content Report</option>
                          <option value="feedback">Feedback & Suggestions</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-2">Message</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg bg-void-100/50 border border-void-border text-text-primary focus:outline-none focus:border-spectral-cyan resize-none"
                          placeholder="How can we help?"
                        />
                      </div>
                      <SpectralButton
                        type="submit"
                        variant="primary"
                        className="w-full py-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-t-2 border-void-900 border-t-transparent rounded-full mr-2"
                            />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Icon name="SendIcon" className="mr-2" size={18} />
                            Send Message
                          </>
                        )}
                      </SpectralButton>
                    </form>
                  )}
                </div>
              </GradientBorder>
            </RevealOnScroll>
          </div>
        </div>

        {/* Additional Resources */}
        <RevealOnScroll threshold={0.1}>
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-aurora mb-6">Need More Help?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <SpectralButton href="/help" variant="secondary">
                <Icon name="BookOpenIcon" className="mr-2" size={18} />
                User Guide
              </SpectralButton>
              <SpectralButton href="/terms" variant="secondary">
                <Icon name="FileTextIcon" className="mr-2" size={18} />
                Terms of Service
              </SpectralButton>
              <SpectralButton href="/privacy" variant="secondary">
                <Icon name="ShieldIcon" className="mr-2" size={18} />
                Privacy Policy
              </SpectralButton>
            </div>
          </div>
        </RevealOnScroll>
      </main>
    </div>
  );
}
