'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Briefcase, MapPin, Clock } from 'lucide-react';

export default function CareersPage() {
  const positions = [
    {
      title: 'Senior Full-Stack Developer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Engineering',
    },
    {
      title: 'AI/ML Engineer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Engineering',
    },
    {
      title: 'Content Moderator',
      location: 'Remote',
      type: 'Part-time',
      department: 'Community',
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Careers</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join us in revolutionizing interactive storytelling. We're building the future of
            narrative experiences.
          </p>
        </motion.div>

        <div className="space-y-6 mb-16">
          {positions.map((position, index) => (
            <motion.div
              key={position.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{position.title}</h3>
                  <div className="flex flex-wrap gap-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {position.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {position.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {position.department}
                    </div>
                  </div>
                </div>
                <Link
                  href="/contact?subject=Job Application"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all whitespace-nowrap"
                >
                  Apply Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Don't see a role that fits?</h2>
          <p className="text-gray-300 mb-6">
            We're always looking for talented people. Send us your resume and we'll keep you in mind
            for future opportunities.
          </p>
          <Link
            href="/contact?subject=General Inquiry"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
