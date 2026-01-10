'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PenTool, Sparkles, Share2, TrendingUp } from 'lucide-react';

export default function CreatorGuidePage() {
  const steps = [
    {
      icon: PenTool,
      title: 'Start Creating',
      description:
        'Use our intuitive story creation studio to build your interactive narrative. Add choices, branches, and multiple endings.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Sparkles,
      title: 'AI Assistance',
      description:
        'Leverage AI to generate content, improve your writing, and create engaging plot twists. Our AI learns your style.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Share2,
      title: 'Publish & Share',
      description:
        'Publish your story to the library and share it with the community. Get feedback and build your audience.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Audience',
      description:
        'Track analytics, engage with readers, and monetize your stories. Build a following of dedicated readers.',
      color: 'from-orange-500 to-red-500',
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Creator Guide</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to know to create amazing interactive stories on StxryAI
          </p>
        </motion.div>

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Create?</h2>
            <p className="text-gray-300 mb-6">
              Start building your first interactive story today. Our creation tools make it easy,
              even for beginners.
            </p>
            <Link
              href="/story-creation-studio"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Start Creating
            </Link>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-gray-300 mb-6">
              Check out our help center or contact our support team for assistance.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/help"
                className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
