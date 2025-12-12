'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';

interface StoryDemo {
  id: string;
  title: string;
  genre: string;
  excerpt: string;
  choices: string[];
  image: string;
  color: string;
}

export default function InteractiveShowcaseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [selectedStory, setSelectedStory] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const storyDemos: StoryDemo[] = [
    {
      id: '1',
      title: 'The Quantum Paradox',
      genre: 'Sci-Fi',
      excerpt: 'You stand before the quantum gateway, its swirling energy casting an otherworldly glow across the laboratory. Dr. Chen\'s voice crackles through your earpiece: "Once you step through, there\'s no coming back. Are you ready?"',
      choices: [
        'Step through the gateway without hesitation',
        'Ask Dr. Chen for more information first',
        'Check your equipment one more time',
      ],
      image: '/images/stories/scifi.jpg',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: '2',
      title: 'Crown of Shadows',
      genre: 'Fantasy',
      excerpt: 'The ancient throne room lies in ruins, but power still pulses through its stones. The Shadow Crown hovers before you, whispering promises of strength. Yet you remember the witch\'s warning about its terrible price.',
      choices: [
        'Claim the crown and embrace its power',
        'Destroy the crown to break its curse',
        'Leave the crown and search for another way',
      ],
      image: '/images/stories/fantasy.jpg',
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: '3',
      title: 'Last Call at Murphy\'s',
      genre: 'Mystery',
      excerpt: 'The rain hammers against the window as you nurse your whiskey. The stranger in the corner hasn\'t moved in an hour. Your detective instincts are screaming, but you\'re officially off duty.',
      choices: [
        'Approach the stranger casually',
        'Call it in to dispatch',
        'Wait and observe',
      ],
      image: '/images/stories/mystery.jpg',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const handleChoiceClick = (index: number) => {
    setSelectedChoice(index);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      setSelectedChoice(null);
    }, 3000);
  };

  const story = storyDemos[selectedStory];

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Experience Interactive Storytelling
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try a live demo and see how your choices shape unique story paths
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Story Display */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
              {/* Story Header */}
              <div className={`relative h-64 bg-gradient-to-br ${story.color}`}>
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <motion.div
                      className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {story.genre}
                    </motion.div>
                    <motion.h3
                      className="text-3xl font-bold text-white"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {story.title}
                    </motion.h3>
                  </div>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedStory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-foreground/90 leading-relaxed mb-8 text-lg">
                      {story.excerpt}
                    </p>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground mb-4">
                        What do you do?
                      </p>
                      {story.choices.map((choice, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleChoiceClick(index)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedChoice === index
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50 hover:bg-accent'
                          }`}
                          whileHover={{ x: 8 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                              selectedChoice === index
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border'
                            }`}>
                              {selectedChoice === index ? '✓' : index + 1}
                            </div>
                            <span className="flex-1">{choice}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Result Message */}
                    <AnimatePresence>
                      {showResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">✨</span>
                            <span className="font-semibold">AI is generating your unique path...</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Your choice creates a branching narrative unique to your playthrough
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Story Selector & Features */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Story Tabs */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Try Different Stories</h3>
              <div className="grid grid-cols-3 gap-3">
                {storyDemos.map((demo, index) => (
                  <motion.button
                    key={demo.id}
                    onClick={() => {
                      setSelectedStory(index);
                      setSelectedChoice(null);
                      setShowResult(false);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedStory === index
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/30'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`text-2xl mb-2`}>
                      {index === 0 ? '🚀' : index === 1 ? '⚔️' : '🔍'}
                    </div>
                    <div className="text-sm font-medium">{demo.genre}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">How It Works</h3>
              {[
                {
                  icon: '🎯',
                  title: 'Make Meaningful Choices',
                  description: 'Every decision creates unique story branches',
                },
                {
                  icon: '✨',
                  title: 'AI-Generated Content',
                  description: 'Stories adapt and evolve based on your choices',
                },
                {
                  icon: '🌟',
                  title: 'Infinite Possibilities',
                  description: 'No two playthroughs are ever the same',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <div className="text-3xl">{feature.icon}</div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
