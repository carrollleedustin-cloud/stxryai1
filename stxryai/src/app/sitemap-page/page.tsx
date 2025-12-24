'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Home, BookOpen, Users, CreditCard, HelpCircle, Shield, FileText, 
  Cookie, User, Settings, PenTool, Trophy, MessageSquare, Star,
  Map, Compass
} from 'lucide-react';
import VoidBackground from '@/components/void/VoidBackground';
import { EtherealNav } from '@/components/void';

const SitemapPage = () => {
  const sections = [
    {
      title: 'Main Pages',
      icon: <Home className="w-5 h-5" />,
      links: [
        { href: '/', label: 'Home' },
        { href: '/story-library', label: 'Story Library' },
        { href: '/community-hub', label: 'Community Hub' },
        { href: '/pricing', label: 'Pricing' },
      ],
    },
    {
      title: 'User Account',
      icon: <User className="w-5 h-5" />,
      links: [
        { href: '/authentication', label: 'Sign In / Sign Up' },
        { href: '/user-dashboard', label: 'Dashboard' },
        { href: '/user-profile', label: 'Profile' },
        { href: '/settings', label: 'Settings' },
        { href: '/notifications', label: 'Notifications' },
        { href: '/messages', label: 'Messages' },
      ],
    },
    {
      title: 'Story Features',
      icon: <BookOpen className="w-5 h-5" />,
      links: [
        { href: '/story-library', label: 'Browse Stories' },
        { href: '/story-creation-studio', label: 'Create Story' },
        { href: '/writers-desk', label: "Writer's Desk" },
        { href: '/search', label: 'Search Stories' },
      ],
    },
    {
      title: 'Community',
      icon: <Users className="w-5 h-5" />,
      links: [
        { href: '/community-hub', label: 'Community Hub' },
        { href: '/forums', label: 'Forums' },
        { href: '/clubs', label: 'Reading Clubs' },
        { href: '/leaderboards', label: 'Leaderboards' },
        { href: '/achievements', label: 'Achievements' },
        { href: '/reviews', label: 'Reviews' },
      ],
    },
    {
      title: 'Family Features',
      icon: <Shield className="w-5 h-5" />,
      links: [
        { href: '/family', label: 'Family Dashboard' },
        { href: '/family/controls', label: 'Parental Controls' },
        { href: '/family/profiles', label: 'Child Profiles' },
        { href: '/kids-zone', label: 'Kids Zone' },
      ],
    },
    {
      title: 'Help & Support',
      icon: <HelpCircle className="w-5 h-5" />,
      links: [
        { href: '/help', label: 'Help Center' },
        { href: '/support', label: 'Contact Support' },
        { href: '/about', label: 'About Us' },
      ],
    },
    {
      title: 'Legal',
      icon: <FileText className="w-5 h-5" />,
      links: [
        { href: '/terms', label: 'Terms of Service' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/cookies', label: 'Cookie Policy' },
        { href: '/accessibility', label: 'Accessibility' },
      ],
    },
  ];

  return (
    <VoidBackground variant="subtle">
      <EtherealNav />
      
      <main className="relative min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-spectral-cyan/10 flex items-center justify-center text-spectral-cyan mx-auto mb-6">
                <Map className="w-8 h-8" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-text-primary mb-4 tracking-wide">
                Sitemap
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto font-prose">
                Navigate through all the pages and features of StxryAI.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sitemap Grid */}
        <section className="py-12 px-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="void-glass rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-spectral-cyan/10 flex items-center justify-center text-spectral-cyan">
                      {section.icon}
                    </div>
                    <h2 className="font-display text-lg text-text-primary">{section.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-2 text-text-secondary hover:text-spectral-cyan transition-colors py-1 group"
                        >
                          <Compass className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </VoidBackground>
  );
};

export default SitemapPage;

