'use client';

import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import { Library, Users, Target, Sparkles } from 'lucide-react';

interface LiveStat {
  label: string;
  value: number;
  target: number;
  suffix: string;
  icon: React.ElementType;
  color: string;
}

export default function LiveStatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const [stats, setStats] = useState<LiveStat[]>([
    {
      label: 'Stories Created',
      value: 0,
      target: 12847,
      suffix: '+',
      icon: Library,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Active Readers',
      value: 0,
      target: 58932,
      suffix: '+',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Choices Made Today',
      value: 0,
      target: 342567,
      suffix: '+',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'AI Generations',
      value: 0,
      target: 1247893,
      suffix: '+',
      icon: Sparkles,
      color: 'from-orange-500 to-red-500',
    },
  ]);

  // Animate counters when in view
  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
    const fps = 60;
    const frames = duration / (1000 / fps);

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / frames;

      setStats((prevStats) =>
        prevStats.map((stat) => ({
          ...stat,
          value: Math.floor(stat.target * easeOutCubic(progress)),
        }))
      );

      if (frame >= frames) {
        clearInterval(interval);
        setStats((prevStats) =>
          prevStats.map((stat) => ({
            ...stat,
            value: stat.target,
          }))
        );
      }
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isInView]);

  // Easing function for smooth animation
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-background via-background/50 to-background relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10" />
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500 rounded-full"
            initial={{
              x:
                typeof window !== 'undefined'
                  ? Math.random() * window.innerWidth
                  : Math.random() * 1200,
              y:
                typeof window !== 'undefined'
                  ? Math.random() * window.innerHeight
                  : Math.random() * 800,
            }}
            animate={{
              y: [null, Math.random() * -200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Join a Thriving Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time stats from our global community of storytellers and readers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="relative p-8 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 overflow-hidden">
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Icon */}
                <motion.div
                  className="text-6xl mb-4"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                >
                  <stat.icon aria-hidden="true" className="w-12 h-12 text-white" />
                </motion.div>

                {/* Number */}
                <div className="relative">
                  <motion.div
                    className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                    initial={{ scale: 0.5 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                  >
                    {formatNumber(stat.value)}
                    {stat.suffix}
                  </motion.div>

                  {/* Label */}
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>

                {/* Pulse Animation */}
                <motion.div
                  className={`absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-br ${stat.color} rounded-full opacity-20 blur-2xl`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
