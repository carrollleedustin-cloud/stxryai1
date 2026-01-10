'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SeriesOverview {
  id: string;
  title: string;
  description?: string;
  genre: string;
  bookCount: number;
  targetBooks: number;
  characterCount: number;
  worldElementCount: number;
  activeArcs: number;
  pendingViolations: number;
  totalWordCount: number;
  status: string;
  coverImageUrl?: string;
}

interface SeriesDashboardProps {
  series: SeriesOverview[];
  selectedSeriesId: string | null;
  onSelectSeries: (id: string) => void;
  onCreateSeries: () => void;
  onRefresh: () => void;
}

export default function SeriesDashboard({
  series,
  selectedSeriesId,
  onSelectSeries,
  onCreateSeries,
  onRefresh,
}: SeriesDashboardProps) {
  const selectedSeries = series.find((s) => s.id === selectedSeriesId);

  if (series.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Welcome to Your Writer&apos;s Desk
          </h2>
          <p className="text-text-secondary mb-8">
            Create your first story series to unlock powerful features like persistent characters,
            worldbuilding archives, canon enforcement, and AI-assisted writing with full context
            awareness.
          </p>
          <button
            onClick={onCreateSeries}
            className="px-8 py-4 bg-gradient-to-r from-spectral-cyan to-spectral-violet rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-spectral-cyan/20 transition-all"
          >
            ✨ Create Your First Series
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Series Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {series.map((s, index) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectSeries(s.id)}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              s.id === selectedSeriesId
                ? 'bg-gradient-to-br from-spectral-cyan/10 to-spectral-violet/10 border-spectral-cyan/40'
                : 'bg-void-depth border-void-mist hover:border-spectral-cyan/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 rounded-lg bg-void-mist overflow-hidden flex-shrink-0">
                {s.coverImageUrl ? (
                  <img src={s.coverImageUrl} alt={s.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">📖</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">{s.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-spectral-violet/20 text-spectral-violet">
                    {s.genre}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : s.status === 'completed'
                          ? 'bg-spectral-gold/20 text-spectral-gold'
                          : 'bg-void-mist text-text-tertiary'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-text-tertiary">
                  <div>
                    📚 {s.bookCount}/{s.targetBooks} books
                  </div>
                  <div>👥 {s.characterCount} chars</div>
                  <div>🌍 {s.worldElementCount} elements</div>
                  <div>📈 {s.activeArcs} arcs</div>
                </div>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-xs text-spectral-cyan font-mono">
                    {s.totalWordCount.toLocaleString()} words
                  </span>
                  {s.pendingViolations > 0 && (
                    <span className="text-xs text-red-400">
                      ⚠️ {s.pendingViolations} canon issues
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Create New Series Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: series.length * 0.1 }}
          onClick={onCreateSeries}
          className="p-5 rounded-xl border-2 border-dashed border-spectral-cyan/30 hover:border-spectral-cyan/50 hover:bg-spectral-cyan/5 transition-all flex flex-col items-center justify-center min-h-[140px]"
        >
          <span className="text-3xl mb-2">✨</span>
          <span className="text-text-secondary font-medium">Create New Series</span>
        </motion.button>
      </div>

      {/* Selected Series Detail */}
      {selectedSeries && (
        <motion.div
          key={selectedSeries.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              {selectedSeries.title} - Quick Actions
            </h2>
            <button
              onClick={onRefresh}
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: '📝',
                label: 'Continue Writing',
                desc: 'Pick up where you left off',
                action: 'write',
              },
              {
                icon: '👤',
                label: 'Add Character',
                desc: 'Create a new persistent character',
                action: 'character',
              },
              {
                icon: '🗺️',
                label: 'New Location',
                desc: 'Add to your worldbuilding',
                action: 'location',
              },
              {
                icon: '📊',
                label: 'View Timeline',
                desc: 'See your story events',
                action: 'timeline',
              },
            ].map((item, i) => (
              <motion.button
                key={item.action}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg bg-void-depth border border-void-mist hover:border-spectral-cyan/30 text-left transition-all group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="font-medium text-text-primary text-sm">{item.label}</div>
                <div className="text-xs text-text-tertiary mt-1">{item.desc}</div>
              </motion.button>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mt-6 p-4 rounded-lg bg-void-depth border border-void-mist">
            <h3 className="font-semibold text-text-secondary mb-3">Recent Activity</h3>
            <div className="space-y-2 text-sm text-text-tertiary">
              <p className="italic">
                Activity tracking will appear here as you work on your series...
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
