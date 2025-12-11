'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Stat {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  href?: string;
}

interface QuickStatsWidgetProps {
  stats?: Stat[];
  variant?: 'grid' | 'row';
}

const defaultStats: Stat[] = [
  {
    label: 'Stories Read',
    value: 0,
    icon: '📚',
    color: 'from-blue-500 to-cyan-500',
    href: '/story-library',
  },
  {
    label: 'Created',
    value: 0,
    icon: '✍️',
    color: 'from-purple-500 to-pink-500',
    href: '/dashboard',
  },
  {
    label: 'Reading Streak',
    value: '0 days',
    icon: '🔥',
    color: 'from-orange-500 to-red-500',
  },
  {
    label: 'Achievements',
    value: '0/50',
    icon: '🏆',
    color: 'from-yellow-500 to-orange-500',
    href: '/dashboard',
  },
];

export default function QuickStatsWidget({
  stats = defaultStats,
  variant = 'grid'
}: QuickStatsWidgetProps) {
  const containerClass = variant === 'grid'
    ? 'grid grid-cols-2 lg:grid-cols-4 gap-4'
    : 'flex overflow-x-auto gap-4 pb-2';

  return (
    <div className={containerClass}>
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer min-w-[160px]"
    >
      {/* Icon with gradient background */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}>
          {stat.icon}
        </div>

        {/* Change indicator */}
        {stat.change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            stat.change.type === 'increase'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {stat.change.type === 'increase' ? '↑' : '↓'}
            {stat.change.value}%
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-sm text-gray-400 mb-1">{stat.label}</div>

      {/* Value */}
      <div className="text-2xl font-bold text-white mb-2">
        {stat.value}
      </div>

      {/* Progress indicator (if applicable) */}
      {typeof stat.value === 'string' && stat.value.includes('/') && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(parseInt(stat.value.split('/')[0]) / parseInt(stat.value.split('/')[1])) * 100}%`
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${stat.color}`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );

  if (stat.href) {
    return <Link href={stat.href}>{content}</Link>;
  }

  return content;
}

// Compact version for smaller spaces
export function CompactStatsWidget({ stats = defaultStats }: { stats?: Stat[] }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span>📊</span>
        Quick Stats
      </h3>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
            <span className="text-sm font-bold text-white">{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Individual stat card for highlighting specific metrics
export function HighlightStatCard({
  stat,
  size = 'md'
}: {
  stat: Stat;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const iconSizes = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const valueSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${stat.color} rounded-2xl ${sizeClasses[size]} shadow-2xl`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconSizes[size]} rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center`}>
          {stat.icon}
        </div>
        {stat.change && (
          <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
            {stat.change.type === 'increase' ? '+' : '-'}{stat.change.value}%
          </div>
        )}
      </div>

      <div className="text-sm text-white/80 mb-2">{stat.label}</div>
      <div className={`${valueSizes[size]} font-bold text-white`}>
        {stat.value}
      </div>

      {stat.href && (
        <Link href={stat.href}>
          <button className="mt-4 text-sm text-white/90 hover:text-white flex items-center gap-1 font-medium">
            View Details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      )}
    </motion.div>
  );
}

// Animated counter for stat values
export function AnimatedStatCounter({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ textContent: '0' }}
        animate={{ textContent: value.toString() }}
        transition={{ duration, ease: 'easeOut' }}
      >
        {prefix}{value}{suffix}
      </motion.span>
    </motion.span>
  );
}
