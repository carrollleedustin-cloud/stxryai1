'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Book, Code, Zap, Users } from 'lucide-react';

export default function DocsPage() {
  const sections = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of using StxryAI',
      href: '/docs/getting-started',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Complete API documentation for developers',
      href: '/docs/api',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'AI Features',
      description: 'Guide to using AI-powered story creation',
      href: '/docs/ai-features',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'How to engage with the StxryAI community',
      href: '/docs/community',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-xl text-gray-300">
            Everything you need to know about using and building with StxryAI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={section.href}
                className="block bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-500/50 transition-all group"
              >
                <div
                  className={`w-16 h-16 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <section.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{section.title}</h3>
                <p className="text-gray-300">{section.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Documentation Coming Soon</h2>
          <p className="text-gray-300 mb-6">
            We're working on comprehensive documentation. In the meantime, check out our help center
            or contact support.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/help"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Help Center
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
            >
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
