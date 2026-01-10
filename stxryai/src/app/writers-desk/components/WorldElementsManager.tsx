'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { persistentNarrativeEngine } from '@/services/persistentNarrativeEngine';
import type { WorldElement } from '@/types/narrativeEngine';

interface WorldElementsManagerProps {
  seriesId: string;
  seriesTitle: string;
}

type ViewMode = 'grid' | 'create' | 'detail';
type ElementCategory =
  | 'all'
  | 'geography'
  | 'culture'
  | 'religion'
  | 'magic_system'
  | 'technology'
  | 'political'
  | 'economic'
  | 'historical'
  | 'myth'
  | 'custom';

const ELEMENT_TYPES = [
  { id: 'geography', name: 'Geography', icon: '🗺️', desc: 'Locations, regions, landmarks' },
  { id: 'culture', name: 'Culture', icon: '🎭', desc: 'Customs, traditions, societies' },
  { id: 'religion', name: 'Religion', icon: '🕯️', desc: 'Beliefs, deities, practices' },
  { id: 'magic_system', name: 'Magic System', icon: '✨', desc: 'Powers, rules, limitations' },
  { id: 'technology', name: 'Technology', icon: '⚙️', desc: 'Inventions, tools, systems' },
  { id: 'political', name: 'Political', icon: '👑', desc: 'Governments, laws, factions' },
  { id: 'economic', name: 'Economic', icon: '💰', desc: 'Trade, currency, resources' },
  { id: 'historical', name: 'Historical', icon: '📜', desc: 'Past events, legends, lore' },
  { id: 'myth', name: 'Mythology', icon: '🐉', desc: 'Myths, creatures, legends' },
  { id: 'custom', name: 'Custom', icon: '📝', desc: 'Other world elements' },
];

export default function WorldElementsManager({ seriesId, seriesTitle }: WorldElementsManagerProps) {
  const { user } = useAuth();
  const [elements, setElements] = useState<WorldElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedElement, setSelectedElement] = useState<WorldElement | null>(null);
  const [filterType, setFilterType] = useState<ElementCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [createForm, setCreateForm] = useState({
    elementType: 'geography' as ElementCategory,
    name: '',
    aliases: '',
    shortDescription: '',
    fullDescription: '',
    visualDescription: '',
    category: '',
    tags: '',
    introducedInBook: 1,
    rules: '',
    constraints: '',
  });

  useEffect(() => {
    fetchElements();
  }, [seriesId]);

  const fetchElements = async () => {
    setLoading(true);
    try {
      const result = await persistentNarrativeEngine.getWorldElements(seriesId);
      setElements(result);
    } catch (error) {
      console.error('Failed to fetch world elements:', error);
    }
    setLoading(false);
  };

  const handleCreateElement = async () => {
    if (!user?.id || !createForm.name.trim() || createForm.elementType === 'all') return;

    try {
      await persistentNarrativeEngine.createWorldElement({
        seriesId,
        authorId: user.id,
        elementType: createForm.elementType as WorldElement['elementType'],
        name: createForm.name,
        aliases: createForm.aliases
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        shortDescription: createForm.shortDescription || undefined,
        fullDescription: createForm.fullDescription || undefined,
        visualDescription: createForm.visualDescription || undefined,
        category: createForm.category || undefined,
        tags: createForm.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        introducedInBook: createForm.introducedInBook,
        rules: {
          rules: createForm.rules.split('\n').filter(Boolean),
          constraints: createForm.constraints.split('\n').filter(Boolean),
          exceptions: [],
        },
      });

      fetchElements();
      setViewMode('grid');
      setCreateForm({
        elementType: 'geography',
        name: '',
        aliases: '',
        shortDescription: '',
        fullDescription: '',
        visualDescription: '',
        category: '',
        tags: '',
        introducedInBook: 1,
        rules: '',
        constraints: '',
      });
    } catch (error) {
      console.error('Failed to create world element:', error);
    }
  };

  const filteredElements = elements.filter((e) => {
    if (filterType !== 'all' && e.elementType !== filterType) return false;
    if (searchTerm && !e.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getTypeInfo = (type: string) =>
    ELEMENT_TYPES.find((t) => t.id === type) || ELEMENT_TYPES[9];

  const groupedElements = filteredElements.reduce(
    (acc, element) => {
      const type = element.elementType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(element);
      return acc;
    },
    {} as Record<string, WorldElement[]>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading world elements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Worldbuilding Archive</h2>
          <p className="text-text-secondary text-sm mt-1">
            {seriesTitle} • {elements.length} element{elements.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setViewMode('create')}
          className="px-4 py-2 bg-spectral-cyan text-void-base rounded-lg font-medium hover:bg-spectral-cyan/80 transition-colors"
        >
          + New Element
        </button>
      </div>

      {/* Filters */}
      {viewMode === 'grid' && (
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search elements..."
            className="px-4 py-2 bg-void-depth border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan w-64"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ElementCategory)}
            className="px-4 py-2 bg-void-depth border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
          >
            <option value="all">All Types</option>
            {ELEMENT_TYPES.map((type) => (
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
              <h3 className="text-xl font-bold text-text-primary">Create World Element</h3>
              <button
                onClick={() => setViewMode('grid')}
                className="text-text-tertiary hover:text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Element Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {ELEMENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() =>
                        setCreateForm({ ...createForm, elementType: type.id as ElementCategory })
                      }
                      className={`p-3 rounded-lg border text-center transition-all ${
                        createForm.elementType === type.id
                          ? 'border-spectral-cyan bg-spectral-cyan/10'
                          : 'border-void-mist hover:border-spectral-cyan/50'
                      }`}
                    >
                      <div className="text-xl mb-1">{type.icon}</div>
                      <div className="text-xs text-text-primary">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Name *</label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="The Shadowlands, The Council of Elders..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Aliases (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={createForm.aliases}
                      onChange={(e) => setCreateForm({ ...createForm, aliases: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="The Dark Realm, Land of Shadows"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={createForm.shortDescription}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, shortDescription: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="A brief, one-line description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-text-tertiary mb-1">Category</label>
                      <input
                        type="text"
                        value={createForm.category}
                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                        placeholder="Region, Kingdom..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-tertiary mb-1">
                        Introduced in Book
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={createForm.introducedInBook}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            introducedInBook: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={createForm.tags}
                      onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="dangerous, ancient, mysterious"
                    />
                  </div>
                </div>

                {/* Descriptions & Rules */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Full Description
                    </label>
                    <textarea
                      value={createForm.fullDescription}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, fullDescription: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none"
                      placeholder="Detailed description of this world element..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Visual Description
                    </label>
                    <textarea
                      value={createForm.visualDescription}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, visualDescription: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none"
                      placeholder="What does this look like?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Rules (one per line)
                    </label>
                    <textarea
                      value={createForm.rules}
                      onChange={(e) => setCreateForm({ ...createForm, rules: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none font-mono text-sm"
                      placeholder="Magic cannot be used here&#10;Only royalty may enter&#10;Time moves differently"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Constraints (one per line)
                    </label>
                    <textarea
                      value={createForm.constraints}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, constraints: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none font-mono text-sm"
                      placeholder="No mortal can survive more than 3 days&#10;Requires blood sacrifice to activate"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-void-mist">
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateElement}
                  disabled={!createForm.name.trim()}
                  className="px-6 py-2 bg-spectral-cyan text-void-base rounded-lg font-medium hover:bg-spectral-cyan/80 transition-colors disabled:opacity-50"
                >
                  Create Element
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {Object.keys(groupedElements).length === 0 ? (
              <div className="text-center py-12 text-text-tertiary">
                {elements.length === 0 ? (
                  <div>
                    <p className="text-lg mb-2">Your world is empty</p>
                    <p>Start building your world by creating your first element!</p>
                  </div>
                ) : (
                  <p>No elements match your filters.</p>
                )}
              </div>
            ) : (
              Object.entries(groupedElements).map(([type, typeElements]) => {
                const typeInfo = getTypeInfo(type);
                return (
                  <div key={type}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <h3 className="text-lg font-semibold text-text-primary">{typeInfo.name}</h3>
                      <span className="text-sm text-text-tertiary">({typeElements.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {typeElements.map((element, index) => (
                        <motion.div
                          key={element.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setSelectedElement(element);
                            setViewMode('detail');
                          }}
                          className="p-4 rounded-xl bg-void-depth border border-void-mist hover:border-spectral-cyan/30 cursor-pointer transition-all group"
                        >
                          <h4 className="font-semibold text-text-primary group-hover:text-spectral-cyan transition-colors">
                            {element.name}
                          </h4>
                          {element.shortDescription && (
                            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                              {element.shortDescription}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {element.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded bg-void-mist text-text-tertiary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 text-xs text-text-tertiary flex items-center justify-between">
                            <span>Book {element.introducedInBook || 1}</span>
                            {!element.isActive && <span className="text-red-400">Inactive</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Detail View */}
        {viewMode === 'detail' && selectedElement && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-xl bg-void-depth border border-void-mist"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{getTypeInfo(selectedElement.elementType).icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">{selectedElement.name}</h3>
                  <div className="text-sm text-text-secondary">
                    {getTypeInfo(selectedElement.elementType).name}
                    {selectedElement.category && ` • ${selectedElement.category}`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedElement(null);
                  setViewMode('grid');
                }}
                className="text-text-tertiary hover:text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {selectedElement.shortDescription && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Summary</h4>
                    <p className="text-text-primary">{selectedElement.shortDescription}</p>
                  </div>
                )}
                {selectedElement.fullDescription && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">
                      Full Description
                    </h4>
                    <p className="text-text-secondary whitespace-pre-wrap">
                      {selectedElement.fullDescription}
                    </p>
                  </div>
                )}
                {selectedElement.visualDescription && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">
                      Visual Description
                    </h4>
                    <p className="text-text-secondary italic">
                      {selectedElement.visualDescription}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedElement.rules.rules.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Rules</h4>
                    <ul className="space-y-1">
                      {selectedElement.rules.rules.map((rule, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="text-spectral-cyan">•</span> {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedElement.rules.constraints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Constraints</h4>
                    <ul className="space-y-1">
                      {selectedElement.rules.constraints.map((constraint, i) => (
                        <li key={i} className="text-sm text-red-400/80 flex items-start gap-2">
                          <span>⚠</span> {constraint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedElement.aliases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">
                      Also Known As
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedElement.aliases.map((alias) => (
                        <span
                          key={alias}
                          className="px-2 py-1 bg-void-mist rounded text-sm text-text-secondary"
                        >
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedElement.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedElement.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-spectral-violet/10 text-spectral-violet rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-void-mist flex items-center justify-between">
              <div className="text-xs text-text-tertiary">
                Canon Lock: {selectedElement.canonLockLevel} • Introduced: Book{' '}
                {selectedElement.introducedInBook || 1}
              </div>
              <button className="px-4 py-2 text-sm bg-spectral-cyan/10 text-spectral-cyan rounded-lg hover:bg-spectral-cyan/20 transition-colors">
                Edit Element
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
