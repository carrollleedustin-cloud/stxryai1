'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Sparkles, Users, Zap } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: BookOpen,
      title: 'Explore Stories',
      description:
        'Browse our library of interactive stories across all genres. Each story adapts to your choices.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Sparkles,
      title: 'Make Choices',
      description:
        'At key moments, choose your path. Your decisions shape the narrative and lead to unique endings.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Create Your Own',
      description:
        'Use our AI-powered creation tools to build your own interactive stories and share them with the community.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Personalized Experience',
      description:
        "AI learns your preferences and recommends stories you'll love. Your reading journey is uniquely yours.",
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">How It Works</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover how StxryAI brings interactive storytelling to life with AI-powered narratives
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
            >
              <div
                className={`w-16 h-16 rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-center mb-6`}
              >
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/story-library"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Start Reading
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
