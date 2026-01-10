'use client';

/**
 * Series Manager Component
 * The command center for managing multi-book series with persistent narrative memory.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  Globe,
  Shield,
  GitBranch,
  Clock,
  AlertTriangle,
  Plus,
  ChevronRight,
  Layers,
  Sparkles,
  Target,
  Compass,
  Edit3,
  Eye,
  BarChart2,
} from 'lucide-react';

interface SeriesManagerProps {
  authorId: string;
  onSeriesSelect?: (seriesId: string) => void;
}

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
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  coverImageUrl?: string;
}

export default function SeriesManager({ authorId, onSeriesSelect }: SeriesManagerProps) {
  const [series, setSeries] = useState<SeriesOverview[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'books' | 'characters' | 'world' | 'arcs' | 'canon'
  >('overview');

  useEffect(() => {
    loadSeries();
  }, [authorId]);

  const loadSeries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/narrative-engine/series?authorId=${authorId}`);
      if (response.ok) {
        const data = await response.json();
        setSeries(data.series || []);
      }
    } catch (error) {
      console.error('Failed to load series:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeriesClick = (seriesId: string) => {
    setSelectedSeries(seriesId);
    onSeriesSelect?.(seriesId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'planning':
        return 'bg-amber-500';
      case 'on_hold':
        return 'bg-slate-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-slate-500';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'world', label: 'World', icon: Globe },
    { id: 'arcs', label: 'Arcs', icon: GitBranch },
    { id: 'canon', label: 'Canon', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Narrative Engine
              </h1>
              <p className="text-slate-400 mt-1">
                Persistent memory • Continuity enforcement • Multi-book architecture
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Series
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!selectedSeries ? (
          /* Series Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.map((s, index) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSeriesClick(s.id)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                  {/* Cover Image */}
                  <div className="relative h-40 overflow-hidden">
                    {s.coverImageUrl ? (
                      <img
                        src={s.coverImageUrl}
                        alt={s.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                        <Layers className="w-16 h-16 text-purple-500/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

                    {/* Status Badge */}
                    <div
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(s.status)}`}
                    >
                      {s.status}
                    </div>

                    {/* Violation Alert */}
                    {s.pendingViolations > 0 && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/90 text-white flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {s.pendingViolations}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        {s.genre}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {s.title}
                    </h3>

                    {s.description && (
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">{s.description}</p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        <span className="text-slate-300">
                          {s.bookCount}/{s.targetBooks} Books
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-pink-400" />
                        <span className="text-slate-300">{s.characterCount} Characters</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-amber-400" />
                        <span className="text-slate-300">{s.worldElementCount} Elements</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <GitBranch className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-300">{s.activeArcs} Arcs</span>
                      </div>
                    </div>

                    {/* Word Count */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Total Words</span>
                        <span className="text-sm font-medium text-slate-300">
                          {s.totalWordCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Empty State / Create New */}
            {series.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowCreateModal(true)}
                className="col-span-full cursor-pointer"
              >
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-purple-500/50 transition-colors">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500/50" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Create Your First Series
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Start building a multi-book universe with persistent characters and world state
                  </p>
                  <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium text-white transition-colors">
                    <Plus className="w-5 h-5 inline-block mr-2" />
                    New Series
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Series Detail View */
          <SeriesDetailView
            seriesId={selectedSeries}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onBack={() => setSelectedSeries(null)}
            tabs={tabs}
          />
        )}
      </div>

      {/* Create Series Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateSeriesModal
            authorId={authorId}
            onClose={() => setShowCreateModal(false)}
            onCreate={(newSeries) => {
              setSeries((prev) => [newSeries, ...prev]);
              setShowCreateModal(false);
              handleSeriesClick(newSeries.id);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Series Detail View Component
function SeriesDetailView({
  seriesId,
  activeTab,
  onTabChange,
  onBack,
  tabs,
}: {
  seriesId: string;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onBack: () => void;
  tabs: Array<{ id: string; label: string; icon: any }>;
}) {
  const [series, setSeries] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSeriesDetail();
  }, [seriesId]);

  const loadSeriesDetail = async () => {
    try {
      const response = await fetch(`/api/narrative-engine/series/${seriesId}`);
      if (response.ok) {
        const data = await response.json();
        setSeries(data);
      }
    } catch (error) {
      console.error('Failed to load series detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Back Button & Title */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-400 rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">{series?.title || 'Loading...'}</h2>
          <p className="text-slate-400">{series?.genre}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === 'overview' && <SeriesOverviewTab series={series} />}
          {activeTab === 'books' && <BooksTab seriesId={seriesId} />}
          {activeTab === 'characters' && <CharactersTab seriesId={seriesId} />}
          {activeTab === 'world' && <WorldTab seriesId={seriesId} />}
          {activeTab === 'arcs' && <ArcsTab seriesId={seriesId} />}
          {activeTab === 'canon' && <CanonTab seriesId={seriesId} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Tab Components
function SeriesOverviewTab({ series }: { series: any }) {
  if (!series) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Premise */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-3">Series Premise</h3>
          <p className="text-slate-300">{series.premise || 'No premise defined yet.'}</p>
        </div>

        {/* Themes */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-3">Themes & Motifs</h3>
          <div className="flex flex-wrap gap-2">
            {(series.primaryThemes || []).map((theme: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm"
              >
                {theme}
              </span>
            ))}
            {(series.secondaryThemes || []).map((theme: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-sm">
                {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Series Arc */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-3">Series Arc</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">
                Main Conflict
              </label>
              <p className="text-slate-300 mt-1">{series.mainConflict || 'Not defined'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">
                Planned Ending
              </label>
              <p className="text-slate-300 mt-1">{series.plannedEnding || 'Not defined'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Sidebar */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Books</span>
              <span className="text-white font-medium">
                {series.currentBookCount || 0}/{series.targetBookCount || 1}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Words</span>
              <span className="text-white font-medium">
                {(series.totalWordCount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Characters</span>
              <span className="text-white font-medium">{series.characterCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">World Elements</span>
              <span className="text-white font-medium">{series.worldElementCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tone</span>
              <span className="text-white capitalize">{series.tone || 'balanced'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pacing</span>
              <span className="text-white capitalize">{series.pacing || 'moderate'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Audience</span>
              <span className="text-white capitalize">{series.targetAudience || 'adult'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Rating</span>
              <span className="text-white capitalize">{series.contentRating || 'teen'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BooksTab({ seriesId }: { seriesId: string }) {
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, [seriesId]);

  const loadBooks = async () => {
    try {
      const response = await fetch(`/api/narrative-engine/series/${seriesId}/books`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-400">Loading books...</div>;
  }

  return (
    <div className="space-y-4">
      {books.map((book, index) => (
        <div
          key={book.id}
          className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {book.bookNumber}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">{book.title}</h4>
              <p className="text-slate-400 text-sm">
                {book.status} • {book.currentWordCount?.toLocaleString() || 0} words
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">
                {book.currentChapterCount || 0}/{book.targetChapterCount || 0} chapters
              </div>
              <div className="w-24 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{
                    width: `${(book.currentChapterCount / (book.targetChapterCount || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No books yet. Create your first book to get started.</p>
        </div>
      )}
    </div>
  );
}

function CharactersTab({ seriesId }: { seriesId: string }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
      <p>Character management coming soon</p>
    </div>
  );
}

function WorldTab({ seriesId }: { seriesId: string }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <Globe className="w-12 h-12 mx-auto mb-4 text-slate-600" />
      <p>World building archive coming soon</p>
    </div>
  );
}

function ArcsTab({ seriesId }: { seriesId: string }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <GitBranch className="w-12 h-12 mx-auto mb-4 text-slate-600" />
      <p>Narrative arcs management coming soon</p>
    </div>
  );
}

function CanonTab({ seriesId }: { seriesId: string }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <Shield className="w-12 h-12 mx-auto mb-4 text-slate-600" />
      <p>Canon enforcement rules coming soon</p>
    </div>
  );
}

// Create Series Modal
function CreateSeriesModal({
  authorId,
  onClose,
  onCreate,
}: {
  authorId: string;
  onClose: () => void;
  onCreate: (series: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    premise: '',
    genre: 'fantasy',
    targetBookCount: 3,
    tone: 'balanced',
    pacing: 'moderate',
    targetAudience: 'adult',
    contentRating: 'teen',
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/narrative-engine/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, authorId }),
      });

      if (response.ok) {
        const newSeries = await response.json();
        onCreate(newSeries);
      }
    } catch (error) {
      console.error('Failed to create series:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Create New Series</h2>
          <p className="text-slate-400 mt-1">Start a new multi-book narrative universe</p>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Series Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              placeholder="The Chronicles of..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 h-24 resize-none"
              placeholder="A brief description of your series..."
            />
          </div>

          {/* Premise */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Series Premise</label>
            <textarea
              value={formData.premise}
              onChange={(e) => setFormData({ ...formData, premise: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 h-32 resize-none"
              placeholder="The overarching concept that drives the entire series..."
            />
          </div>

          {/* Genre & Books */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="fantasy">Fantasy</option>
                <option value="sci-fi">Science Fiction</option>
                <option value="mystery">Mystery</option>
                <option value="romance">Romance</option>
                <option value="thriller">Thriller</option>
                <option value="horror">Horror</option>
                <option value="historical">Historical Fiction</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Books</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.targetBookCount}
                onChange={(e) =>
                  setFormData({ ...formData, targetBookCount: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Tone & Pacing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="dark">Dark</option>
                <option value="serious">Serious</option>
                <option value="balanced">Balanced</option>
                <option value="lighthearted">Lighthearted</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pacing</label>
              <select
                value={formData.pacing}
                onChange={(e) => setFormData({ ...formData, pacing: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                <option value="slow">Slow & Methodical</option>
                <option value="moderate">Moderate</option>
                <option value="fast">Fast-Paced</option>
                <option value="variable">Variable</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!formData.title || isCreating}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isCreating ? 'Creating...' : 'Create Series'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
