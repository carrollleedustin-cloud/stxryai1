'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import SeriesDashboard from './components/SeriesDashboard';
import SeriesCreationWizard from './components/SeriesCreationWizard';
import CharacterManager from './components/CharacterManager';
import WorldElementsManager from './components/WorldElementsManager';
import NarrativeArcTimeline from './components/NarrativeArcTimeline';
import CanonBible from './components/CanonBible';
import AIWritingStudio from './components/AIWritingStudio';

type DeskView = 'dashboard' | 'create-series' | 'characters' | 'world' | 'arcs' | 'canon' | 'write';

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

export default function WritersDeskPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<DeskView>('dashboard');
  const [series, setSeries] = useState<SeriesOverview[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/authentication');
    } else if (user) {
      fetchSeries();
    }
  }, [user, authLoading, router]);

  const fetchSeries = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/narrative-engine/series?authorId=${user.id}`);
      const data = await response.json();
      if (data.series) {
        setSeries(data.series);
        if (data.series.length > 0 && !selectedSeriesId) {
          setSelectedSeriesId(data.series[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch series:', error);
    }
    setLoading(false);
  };

  const handleSeriesCreated = (newSeries: SeriesOverview) => {
    setSeries(prev => [newSeries, ...prev]);
    setSelectedSeriesId(newSeries.id);
    setView('dashboard');
  };

  const selectedSeries = series.find(s => s.id === selectedSeriesId);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-void-base">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative w-16 h-16 mx-auto mb-4">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-spectral-cyan/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-spectral-violet/50"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-text-secondary font-mono">Initializing Writer&apos;s Desk...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const navItems: { id: DeskView; label: string; icon: string; requiresSeries?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'create-series', label: 'New Series', icon: '✨' },
    { id: 'characters', label: 'Characters', icon: '👥', requiresSeries: true },
    { id: 'world', label: 'World', icon: '🌍', requiresSeries: true },
    { id: 'arcs', label: 'Arcs', icon: '📈', requiresSeries: true },
    { id: 'canon', label: 'Canon Bible', icon: '📜', requiresSeries: true },
    { id: 'write', label: 'AI Studio', icon: '🤖', requiresSeries: true },
  ];

  return (
    <div className="min-h-screen bg-void-base">
      <Header />

      <div className="max-w-[1800px] mx-auto px-4 py-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-spectral-cyan via-spectral-violet to-spectral-gold bg-clip-text text-transparent">
            Writer&apos;s Desk
          </h1>
          <p className="text-text-secondary mt-1">
            Craft epic multi-book series with persistent characters, worldbuilding, and canon enforcement
          </p>
        </motion.div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 flex-shrink-0"
          >
            {/* Series Selector */}
            {series.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs text-text-tertiary uppercase tracking-wide mb-2">
                  Active Series
                </label>
                <select
                  value={selectedSeriesId || ''}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  className="w-full px-3 py-2 bg-void-depth border border-spectral-cyan/20 rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan/50 transition-colors"
                >
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.bookCount}/{s.targetBooks} books)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isDisabled = item.requiresSeries && !selectedSeriesId;
                return (
                  <button
                    key={item.id}
                    onClick={() => !isDisabled && setView(item.id)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      view === item.id
                        ? 'bg-gradient-to-r from-spectral-cyan/20 to-spectral-violet/20 border border-spectral-cyan/30 text-text-primary'
                        : isDisabled
                        ? 'text-text-tertiary opacity-50 cursor-not-allowed'
                        : 'hover:bg-void-mist text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {item.requiresSeries && !selectedSeriesId && (
                      <span className="text-xs text-text-tertiary ml-auto">Select series</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            {selectedSeries && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-void-depth rounded-lg border border-spectral-violet/20"
              >
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Series Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Words</span>
                    <span className="text-spectral-cyan font-mono">
                      {selectedSeries.totalWordCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Characters</span>
                    <span className="text-spectral-violet font-mono">
                      {selectedSeries.characterCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">World Elements</span>
                    <span className="text-spectral-gold font-mono">
                      {selectedSeries.worldElementCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Active Arcs</span>
                    <span className="text-green-400 font-mono">
                      {selectedSeries.activeArcs}
                    </span>
                  </div>
                  {selectedSeries.pendingViolations > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Canon Issues</span>
                      <span className="font-mono">{selectedSeries.pendingViolations}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {view === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SeriesDashboard
                    series={series}
                    selectedSeriesId={selectedSeriesId}
                    onSelectSeries={setSelectedSeriesId}
                    onCreateSeries={() => setView('create-series')}
                    onRefresh={fetchSeries}
                  />
                </motion.div>
              )}

              {view === 'create-series' && (
                <motion.div
                  key="create-series"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SeriesCreationWizard
                    onComplete={handleSeriesCreated}
                    onCancel={() => setView('dashboard')}
                  />
                </motion.div>
              )}

              {view === 'characters' && selectedSeriesId && (
                <motion.div
                  key="characters"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CharacterManager
                    seriesId={selectedSeriesId}
                    seriesTitle={selectedSeries?.title || ''}
                  />
                </motion.div>
              )}

              {view === 'world' && selectedSeriesId && (
                <motion.div
                  key="world"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <WorldElementsManager
                    seriesId={selectedSeriesId}
                    seriesTitle={selectedSeries?.title || ''}
                  />
                </motion.div>
              )}

              {view === 'arcs' && selectedSeriesId && (
                <motion.div
                  key="arcs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <NarrativeArcTimeline
                    seriesId={selectedSeriesId}
                    seriesTitle={selectedSeries?.title || ''}
                  />
                </motion.div>
              )}

              {view === 'canon' && selectedSeriesId && (
                <motion.div
                  key="canon"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CanonBible
                    seriesId={selectedSeriesId}
                    seriesTitle={selectedSeries?.title || ''}
                  />
                </motion.div>
              )}

              {view === 'write' && selectedSeriesId && (
                <motion.div
                  key="write"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AIWritingStudio
                    seriesId={selectedSeriesId}
                    seriesTitle={selectedSeries?.title || ''}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

