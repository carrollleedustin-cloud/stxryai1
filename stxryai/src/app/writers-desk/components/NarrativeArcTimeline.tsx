'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { persistentNarrativeEngine } from '@/services/persistentNarrativeEngine';
import type { NarrativeArc, ArcStatus, ArcType } from '@/types/narrativeEngine';

interface NarrativeArcTimelineProps {
  seriesId: string;
  seriesTitle: string;
}

type ViewMode = 'timeline' | 'create' | 'detail';

const ARC_TYPES: { id: ArcType; name: string; icon: string; color: string }[] = [
  { id: 'character', name: 'Character Arc', icon: '👤', color: 'spectral-cyan' },
  { id: 'plot', name: 'Plot Arc', icon: '📖', color: 'spectral-violet' },
  { id: 'thematic', name: 'Thematic Arc', icon: '💡', color: 'spectral-gold' },
  { id: 'relationship', name: 'Relationship Arc', icon: '💕', color: 'pink-400' },
  { id: 'world', name: 'World Arc', icon: '🌍', color: 'green-400' },
];

const ARC_STATUSES: { id: ArcStatus; name: string; color: string }[] = [
  { id: 'setup', name: 'Setup', color: 'text-tertiary' },
  { id: 'rising', name: 'Rising Action', color: 'spectral-cyan' },
  { id: 'climax', name: 'Climax', color: 'spectral-gold' },
  { id: 'falling', name: 'Falling Action', color: 'spectral-violet' },
  { id: 'resolved', name: 'Resolved', color: 'green-400' },
  { id: 'abandoned', name: 'Abandoned', color: 'red-400' },
];

export default function NarrativeArcTimeline({ seriesId, seriesTitle }: NarrativeArcTimelineProps) {
  const { user } = useAuth();
  const [arcs, setArcs] = useState<NarrativeArc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedArc, setSelectedArc] = useState<NarrativeArc | null>(null);
  const [filterType, setFilterType] = useState<ArcType | 'all'>('all');

  const [createForm, setCreateForm] = useState({
    arcName: '',
    arcType: 'plot' as ArcType,
    arcDescription: '',
    startsInBook: 1,
    endsInBook: '',
    themes: '',
    setupPoints: '',
  });

  useEffect(() => {
    fetchArcs();
  }, [seriesId]);

  const fetchArcs = async () => {
    setLoading(true);
    try {
      const result = await persistentNarrativeEngine.getNarrativeArcs(seriesId);
      setArcs(result);
    } catch (error) {
      console.error('Failed to fetch arcs:', error);
    }
    setLoading(false);
  };

  const handleCreateArc = async () => {
    if (!user?.id || !createForm.arcName.trim()) return;

    try {
      await persistentNarrativeEngine.createNarrativeArc({
        seriesId,
        authorId: user.id,
        arcName: createForm.arcName,
        arcType: createForm.arcType,
        arcDescription: createForm.arcDescription || undefined,
        startsInBook: createForm.startsInBook,
        endsInBook: createForm.endsInBook ? parseInt(createForm.endsInBook) : undefined,
        themes: createForm.themes
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        setupPoints: createForm.setupPoints.split('\n').filter(Boolean),
      });

      fetchArcs();
      setViewMode('timeline');
      setCreateForm({
        arcName: '',
        arcType: 'plot',
        arcDescription: '',
        startsInBook: 1,
        endsInBook: '',
        themes: '',
        setupPoints: '',
      });
    } catch (error) {
      console.error('Failed to create arc:', error);
    }
  };

  const getTypeInfo = (type: ArcType) => ARC_TYPES.find((t) => t.id === type) || ARC_TYPES[1];
  const getStatusInfo = (status: ArcStatus) =>
    ARC_STATUSES.find((s) => s.id === status) || ARC_STATUSES[0];

  const filteredArcs = arcs.filter((a) => filterType === 'all' || a.arcType === filterType);

  // Group arcs by starting book for timeline view
  const maxBook = Math.max(
    ...arcs.map((a) => Math.max(a.startsInBook, a.endsInBook || a.startsInBook)),
    3
  );
  const books = Array.from({ length: maxBook }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading narrative arcs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Narrative Arcs</h2>
          <p className="text-text-secondary text-sm mt-1">
            {seriesTitle} • {arcs.length} arc{arcs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setViewMode('create')}
          className="px-4 py-2 bg-spectral-cyan text-void-base rounded-lg font-medium hover:bg-spectral-cyan/80 transition-colors"
        >
          + New Arc
        </button>
      </div>

      {/* Filters */}
      {viewMode === 'timeline' && (
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ArcType | 'all')}
            className="px-4 py-2 bg-void-depth border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
          >
            <option value="all">All Arc Types</option>
            {ARC_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Create Form */}
        {viewMode === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-xl bg-void-depth border border-void-mist"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">Create Narrative Arc</h3>
              <button
                onClick={() => setViewMode('timeline')}
                className="text-text-tertiary hover:text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Arc Name *</label>
                  <input
                    type="text"
                    value={createForm.arcName}
                    onChange={(e) => setCreateForm({ ...createForm, arcName: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="The Hero's Journey, The Betrayal..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-2">Arc Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ARC_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setCreateForm({ ...createForm, arcType: type.id })}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          createForm.arcType === type.id
                            ? `border-${type.color} bg-${type.color}/10`
                            : 'border-void-mist hover:border-spectral-cyan/50'
                        }`}
                      >
                        <div className="text-lg mb-1">{type.icon}</div>
                        <div className="text-xs text-text-primary">{type.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Starts in Book</label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.startsInBook}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          startsInBook: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Ends in Book (optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.endsInBook}
                      onChange={(e) => setCreateForm({ ...createForm, endsInBook: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="Ongoing"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">
                    Themes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={createForm.themes}
                    onChange={(e) => setCreateForm({ ...createForm, themes: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="redemption, sacrifice, loyalty"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Description</label>
                  <textarea
                    value={createForm.arcDescription}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, arcDescription: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none"
                    placeholder="Describe the overall arc and its significance..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">
                    Setup Points (one per line)
                  </label>
                  <textarea
                    value={createForm.setupPoints}
                    onChange={(e) => setCreateForm({ ...createForm, setupPoints: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none font-mono text-sm"
                    placeholder="Hero receives the call&#10;Mentor appears&#10;First challenge faced"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-void-mist">
              <button
                onClick={() => setViewMode('timeline')}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateArc}
                disabled={!createForm.arcName.trim()}
                className="px-6 py-2 bg-spectral-cyan text-void-base rounded-lg font-medium hover:bg-spectral-cyan/80 transition-colors disabled:opacity-50"
              >
                Create Arc
              </button>
            </div>
          </motion.div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {arcs.length === 0 ? (
              <div className="text-center py-12 text-text-tertiary">
                <p className="text-lg mb-2">No narrative arcs yet</p>
                <p>Create your first arc to track story progression across books!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Timeline Header */}
                <div className="flex">
                  <div className="w-48 flex-shrink-0" />
                  <div
                    className="flex-1 grid"
                    style={{ gridTemplateColumns: `repeat(${maxBook}, 1fr)` }}
                  >
                    {books.map((book) => (
                      <div
                        key={book}
                        className="text-center text-sm font-medium text-text-secondary py-2 border-l border-void-mist"
                      >
                        Book {book}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arc Rows */}
                {filteredArcs.map((arc, index) => {
                  const typeInfo = getTypeInfo(arc.arcType);
                  const statusInfo = getStatusInfo(arc.arcStatus);
                  const startCol = arc.startsInBook;
                  const endCol = arc.endsInBook || maxBook;
                  const span = endCol - startCol + 1;

                  return (
                    <motion.div
                      key={arc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-stretch"
                    >
                      {/* Arc Label */}
                      <div
                        onClick={() => {
                          setSelectedArc(arc);
                          setViewMode('detail');
                        }}
                        className="w-48 flex-shrink-0 p-3 bg-void-depth border border-void-mist rounded-l-lg cursor-pointer hover:border-spectral-cyan/30 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{typeInfo.icon}</span>
                          <div className="min-w-0">
                            <div className="font-medium text-text-primary text-sm truncate">
                              {arc.arcName}
                            </div>
                            <div className={`text-xs text-${statusInfo.color}`}>
                              {statusInfo.name}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div
                        className="flex-1 grid relative"
                        style={{ gridTemplateColumns: `repeat(${maxBook}, 1fr)` }}
                      >
                        {books.map((book) => (
                          <div key={book} className="border-l border-void-mist min-h-[60px]" />
                        ))}
                        <div
                          className={`absolute top-2 bottom-2 rounded-full bg-gradient-to-r from-${typeInfo.color}/50 to-${typeInfo.color}/30 border border-${typeInfo.color}/50`}
                          style={{
                            left: `${((startCol - 1) / maxBook) * 100}%`,
                            width: `${(span / maxBook) * 100}%`,
                          }}
                        >
                          <div className="flex items-center justify-between h-full px-3">
                            <span className="text-xs text-text-primary truncate">
                              {arc.arcName}
                            </span>
                            <span className="text-xs text-text-tertiary">
                              {arc.completionPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="mt-8 p-4 bg-void-depth rounded-lg border border-void-mist">
              <h4 className="text-sm font-semibold text-text-secondary mb-3">Arc Types</h4>
              <div className="flex flex-wrap gap-4">
                {ARC_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span className="text-sm text-text-secondary">{type.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Detail View */}
        {viewMode === 'detail' && selectedArc && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-xl bg-void-depth border border-void-mist"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{getTypeInfo(selectedArc.arcType).icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">{selectedArc.arcName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-text-secondary">
                      {getTypeInfo(selectedArc.arcType).name}
                    </span>
                    <span className="text-text-tertiary">•</span>
                    <span className={`text-sm text-${getStatusInfo(selectedArc.arcStatus).color}`}>
                      {getStatusInfo(selectedArc.arcStatus).name}
                    </span>
                    <span className="text-text-tertiary">•</span>
                    <span className="text-sm text-spectral-cyan">
                      {selectedArc.completionPercentage}% complete
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedArc(null);
                  setViewMode('timeline');
                }}
                className="text-text-tertiary hover:text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-text-secondary mb-2">Timeline</h4>
                  <p className="text-text-primary">
                    Book {selectedArc.startsInBook}
                    {selectedArc.endsInBook ? ` → Book ${selectedArc.endsInBook}` : ' (ongoing)'}
                  </p>
                </div>

                {selectedArc.arcDescription && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Description</h4>
                    <p className="text-text-secondary">{selectedArc.arcDescription}</p>
                  </div>
                )}

                {selectedArc.themes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArc.themes.map((theme) => (
                        <span
                          key={theme}
                          className="px-3 py-1 bg-spectral-violet/10 text-spectral-violet rounded-full text-sm"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedArc.setupPoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Setup Points</h4>
                    <ul className="space-y-1">
                      {selectedArc.setupPoints.map((point, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="text-spectral-cyan">•</span> {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedArc.risingActionPoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">
                      Rising Action
                    </h4>
                    <ul className="space-y-1">
                      {selectedArc.risingActionPoints.map((point, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="text-spectral-gold">↗</span> {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedArc.climaxPoint && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Climax</h4>
                    <p className="text-spectral-gold">{selectedArc.climaxPoint}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-void-mist flex justify-end">
              <button className="px-4 py-2 text-sm bg-spectral-cyan/10 text-spectral-cyan rounded-lg hover:bg-spectral-cyan/20 transition-colors">
                Edit Arc
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
