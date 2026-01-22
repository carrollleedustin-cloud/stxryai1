'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NebulaCard } from '@/components/nebula/NebulaCard';
import { NebulaButton } from '@/components/nebula/NebulaButton';
import { NebulaTitle, GlowText } from '@/components/nebula/NebulaText';
import { BookOpen, GraduationCap, Users, Target, TrendingUp, Award } from 'lucide-react';

/**
 * EDUCATION HUB
 * Educational resources, lesson plans, and learning tools for teachers and students
 */

interface EducationalResource {
  id: string;
  title: string;
  description: string;
  category: string;
  gradeLevel: string;
  duration: string;
  icon: string;
}

const educationalResources: EducationalResource[] = [
  {
    id: '1',
    title: 'Creative Writing Workshop',
    description: 'Interactive lessons on story structure, character development, and narrative techniques',
    category: 'Writing Skills',
    gradeLevel: '6-8',
    duration: '45 min',
    icon: '✍️',
  },
  {
    id: '2',
    title: 'Reading Comprehension',
    description: 'Engaging stories with built-in comprehension questions and vocabulary building',
    category: 'Reading',
    gradeLevel: '4-6',
    duration: '30 min',
    icon: '📖',
  },
  {
    id: '3',
    title: 'Digital Storytelling',
    description: 'Learn to create multimedia stories using AI tools and interactive elements',
    category: 'Technology',
    gradeLevel: '7-9',
    duration: '60 min',
    icon: '💻',
  },
  {
    id: '4',
    title: 'Literary Analysis',
    description: 'Explore themes, symbolism, and literary devices through interactive stories',
    category: 'Literature',
    gradeLevel: '9-12',
    duration: '50 min',
    icon: '🔍',
  },
];

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Curriculum-Aligned',
    description: 'Content aligned with Common Core and state standards',
    color: 'cyan',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Classroom Tools',
    description: 'Manage student accounts, track progress, and assign stories',
    color: 'violet',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Differentiated Learning',
    description: 'Adaptive content for various reading levels and learning styles',
    color: 'pink',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Progress Tracking',
    description: 'Detailed analytics on student engagement and comprehension',
    color: 'gold',
  },
];

export default function EducationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Writing Skills', 'Reading', 'Technology', 'Literature'];

  const filteredResources =
    selectedCategory === 'all'
      ? educationalResources
      : educationalResources.filter((r) => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-void-absolute">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-spectral-violet/10 via-transparent to-transparent" />
        <div className="container-void relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spectral-violet/10 border border-spectral-violet/20 mb-6">
              <GraduationCap className="w-5 h-5 text-spectral-violet" />
              <span className="text-sm font-medium text-spectral-violet">For Educators</span>
            </div>

            <NebulaTitle size="lg" gradient="aurora" className="mb-6">
              Transform Learning Through
              <br />
              <GlowText>Interactive Storytelling</GlowText>
            </NebulaTitle>

            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Engage students with AI-powered stories, comprehensive lesson plans, and tools designed
              for modern classrooms
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <NebulaButton size="lg" href="/authentication?mode=signup&type=educator">
                Get Started Free
              </NebulaButton>
              <NebulaButton size="lg" variant="ghost" href="/contact">
                Request Demo
              </NebulaButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container-void">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NebulaCard glowColor={feature.color as any} className="h-full">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${feature.color}-500/20`}
                  >
                    <div className={`text-${feature.color}-400`}>{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </NebulaCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Resources */}
      <section className="py-16">
        <div className="container-void">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Educational Resources</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Explore our library of curriculum-aligned content and interactive learning experiences
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${
                    selectedCategory === category
                      ? 'bg-spectral-cyan text-void-absolute'
                      : 'bg-void-surface text-white/70 hover:bg-void-mist'
                  }
                `}
              >
                {category === 'all' ? 'All Resources' : category}
              </button>
            ))}
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <NebulaCard hover3D className="h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{resource.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{resource.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-spectral-violet/20 text-spectral-violet">
                          {resource.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
                          Grade {resource.gradeLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-white/60 mb-4">{resource.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-white/40">⏱️ {resource.duration}</span>
                    <NebulaButton size="sm" variant="ghost">
                      Explore
                    </NebulaButton>
                  </div>
                </NebulaCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Educator Benefits */}
      <section className="py-16">
        <div className="container-void">
          <NebulaCard glowColor="violet" className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Built for Educators, Loved by Students
                </h2>
                <p className="text-white/70 mb-6">
                  Join thousands of teachers using StxryAI to make learning more engaging and
                  effective. Get access to premium features designed specifically for classroom use.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    'Unlimited student accounts',
                    'Classroom management dashboard',
                    'Progress tracking and analytics',
                    'Customizable lesson plans',
                    'Priority support',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Award className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-white/80">{benefit}</span>
                    </div>
                  ))}
                </div>

                <NebulaButton size="lg" href="/pricing?plan=educator">
                  View Educator Plans
                </NebulaButton>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-spectral-violet/20 to-spectral-cyan/20 border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎓</div>
                    <p className="text-2xl font-bold text-white mb-2">10,000+</p>
                    <p className="text-white/60">Educators Trust StxryAI</p>
                  </div>
                </div>
              </div>
            </div>
          </NebulaCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-void text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Classroom?</h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Start your free trial today and discover how interactive storytelling can engage your
            students like never before
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <NebulaButton size="lg" href="/authentication?mode=signup&type=educator">
              Start Free Trial
            </NebulaButton>
            <NebulaButton size="lg" variant="ghost" href="/contact">
              Contact Sales
            </NebulaButton>
          </div>
        </div>
      </section>
    </div>
  );
}
