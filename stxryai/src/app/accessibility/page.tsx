'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, Ear, Hand, Brain, Keyboard, Monitor, Settings, Mail, ArrowRight } from 'lucide-react';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav } from '@/components/void';

const AccessibilityPage = () => {
  const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Visual Accessibility',
      description: 'Customizable font sizes, high contrast modes, and screen reader compatibility.',
      items: [
        'Adjustable text size and spacing',
        'High contrast color themes',
        'Screen reader optimized content',
        'Alt text for all images',
        'Clear visual focus indicators',
      ],
    },
    {
      icon: <Keyboard className="w-6 h-6" />,
      title: 'Keyboard Navigation',
      description: 'Full keyboard support for all interactive elements.',
      items: [
        'Tab navigation through all controls',
        'Keyboard shortcuts for common actions',
        'Skip navigation links',
        'Focus management in dialogs',
        'Arrow key navigation in menus',
      ],
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: 'Reading Experience',
      description: 'Customizable reading settings for comfortable story consumption.',
      items: [
        'Dyslexia-friendly font options',
        'Adjustable line height and width',
        'Reading progress indicators',
        'Text-to-speech compatibility',
        'Reduced motion options',
      ],
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Cognitive Accessibility',
      description: 'Features designed to support various cognitive needs.',
      items: [
        'Clear and consistent navigation',
        'Simple, readable language',
        'Progress saving and recovery',
        'Distraction-free reading mode',
        'Content warnings when appropriate',
      ],
    },
  ];

  const standards = [
    {
      title: 'WCAG 2.1 AA',
      description: 'We strive to meet Web Content Accessibility Guidelines 2.1 Level AA standards.',
    },
    {
      title: 'Section 508',
      description: 'Our platform is designed with Section 508 compliance in mind.',
    },
    {
      title: 'Ongoing Improvement',
      description: 'We continuously test and improve our accessibility features.',
    },
  ];

  return (
    <VoidBackground variant="subtle">
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
                Accessibility
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-6 tracking-wide">
                Stories for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-spectral-cyan to-spectral-violet">
                  Everyone
                </span>
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto font-prose leading-relaxed">
                We're committed to making StxryAI accessible to all users. 
                Everyone deserves to experience the magic of interactive storytelling.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="void-glass rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-spectral-cyan/10 flex items-center justify-center text-spectral-cyan">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-text-primary">{feature.title}</h3>
                      <p className="text-text-tertiary text-sm">{feature.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-text-secondary">
                        <div className="w-1.5 h-1.5 rounded-full bg-spectral-cyan" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Standards Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl text-text-primary text-center mb-12"
            >
              Our Commitment
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {standards.map((standard, index) => (
                <motion.div
                  key={standard.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="void-glass rounded-2xl p-6 text-center"
                >
                  <h3 className="font-display text-lg text-spectral-cyan mb-2">{standard.title}</h3>
                  <p className="text-text-tertiary text-sm">{standard.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Personalization Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="void-glass rounded-3xl p-8 md:p-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-spectral-cyan" />
                <h2 className="font-display text-2xl text-text-primary">Personalize Your Experience</h2>
              </div>
              <p className="text-text-secondary font-prose text-lg leading-relaxed mb-6">
                StxryAI offers extensive customization options to tailor your reading experience. 
                Access these settings from your profile or the reading interface:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-void-mist/50 rounded-xl p-4">
                  <h4 className="font-ui text-text-primary mb-2">Display Settings</h4>
                  <ul className="text-text-tertiary text-sm space-y-1">
                    <li>• Theme: Light, Dark, High Contrast</li>
                    <li>• Font Size: Small to Extra Large</li>
                    <li>• Font Family: Default, Dyslexia-friendly</li>
                    <li>• Line Spacing: Compact to Relaxed</li>
                  </ul>
                </div>
                <div className="bg-void-mist/50 rounded-xl p-4">
                  <h4 className="font-ui text-text-primary mb-2">Motion Settings</h4>
                  <ul className="text-text-tertiary text-sm space-y-1">
                    <li>• Reduce Motion: Minimize animations</li>
                    <li>• Auto-play: Control media playback</li>
                    <li>• Transitions: Instant or animated</li>
                    <li>• Focus Indicators: Enhanced visibility</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="void-glass-heavy rounded-3xl p-12"
            >
              <Mail className="w-12 h-12 text-spectral-cyan mx-auto mb-6" />
              <h2 className="font-display text-3xl text-text-primary mb-4">Accessibility Feedback</h2>
              <p className="text-text-secondary font-prose mb-8">
                We value your feedback on accessibility. If you encounter any barriers or have 
                suggestions for improvement, please let us know.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-spectral-cyan to-spectral-violet text-void-absolute font-ui tracking-wide hover:shadow-glow-cyan transition-all duration-300"
                >
                  Contact Support
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="mailto:accessibility@stxryai.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-membrane text-text-primary font-ui tracking-wide hover:border-spectral-cyan transition-all duration-300"
                >
                  Email: accessibility@stxryai.com
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </VoidBackground>
  );
};

export default AccessibilityPage;

