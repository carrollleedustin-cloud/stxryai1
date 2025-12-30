'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: 'The Future of Interactive Storytelling',
      excerpt: 'Explore how AI is revolutionizing the way we create and consume stories.',
      author: 'StxryAI Team',
      date: '2024-12-15',
      category: 'Technology',
    },
    {
      id: 2,
      title: 'Getting Started with Story Creation',
      excerpt: 'A beginner\'s guide to creating your first interactive story on StxryAI.',
      author: 'StxryAI Team',
      date: '2024-12-10',
      category: 'Tutorial',
    },
    {
      id: 3,
      title: 'Community Spotlight: Top Stories This Month',
      excerpt: 'Discover the most engaging stories created by our community.',
      author: 'StxryAI Team',
      date: '2024-12-05',
      category: 'Community',
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Blog</h1>
          <p className="text-xl text-gray-300">Stories, updates, and insights from the StxryAI team</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full mb-4">
                {post.category}
              </span>
              <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>
              <p className="text-gray-300 mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString()}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">More blog posts coming soon!</p>
          <Link
            href="/story-library"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Explore Stories
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

