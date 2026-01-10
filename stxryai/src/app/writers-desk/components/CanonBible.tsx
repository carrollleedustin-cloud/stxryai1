'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { persistentNarrativeEngine } from '@/services/persistentNarrativeEngine';
import type { CanonRule, CanonLockLevel } from '@/types/narrativeEngine';

interface CanonBibleProps {
  seriesId: string;
  seriesTitle: string;
}

type ViewMode = 'list' | 'create' | 'detail';

const RULE_CATEGORIES = [
  { id: 'character', name: 'Character Rules', icon: '👤', desc: 'Character-specific canon' },
  { id: 'world', name: 'World Rules', icon: '🌍', desc: 'Worldbuilding facts' },
  { id: 'plot', name: 'Plot Rules', icon: '📖', desc: 'Story progression rules' },
  { id: 'timeline', name: 'Timeline Rules', icon: '⏰', desc: 'Temporal constraints' },
  { id: 'relationship', name: 'Relationship Rules', icon: '💕', desc: 'Character dynamics' },
  { id: 'system', name: 'System Rules', icon: '⚙️', desc: 'Magic/tech rules' },
];

const RULE_TYPES = [
  { id: 'must', name: 'Must', desc: 'Required to happen', color: 'green-400' },
  { id: 'must_not', name: 'Must Not', desc: 'Cannot happen', color: 'red-400' },
  { id: 'should', name: 'Should', desc: 'Preferred', color: 'spectral-cyan' },
  { id: 'should_not', name: 'Should Not', desc: 'Avoid if possible', color: 'spectral-gold' },
  { id: 'may', name: 'May', desc: 'Optional', color: 'text-secondary' },
];

const LOCK_LEVELS: { id: CanonLockLevel; name: string; desc: string; color: string }[] = [
  { id: 'suggestion', name: 'Suggestion', desc: 'AI can override', color: 'text-tertiary' },
  { id: 'soft', name: 'Soft Lock', desc: 'AI warns before override', color: 'spectral-cyan' },
  { id: 'hard', name: 'Hard Lock', desc: 'AI cannot override', color: 'spectral-gold' },
  { id: 'immutable', name: 'Immutable', desc: 'Cannot be changed at all', color: 'red-400' },
];

export default function CanonBible({ seriesId, seriesTitle }: CanonBibleProps) {
  const { user } = useAuth();
  const [rules, setRules] = useState<CanonRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRule, setSelectedRule] = useState<CanonRule | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [createForm, setCreateForm] = useState({
    ruleCategory: 'character',
    ruleName: '',
    ruleDescription: '',
    ruleType: 'must' as 'must' | 'must_not' | 'should' | 'should_not' | 'may',
    lockLevel: 'hard' as CanonLockLevel,
    appliesFromBook: 1,
    appliesUntilBook: '',
    violationMessage: '',
    validExamples: '',
    invalidExamples: '',
  });

  useEffect(() => {
    fetchRules();
  }, [seriesId]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const result = await persistentNarrativeEngine.getCanonRules(seriesId);
      setRules(result);
    } catch (error) {
      console.error('Failed to fetch canon rules:', error);
    }
    setLoading(false);
  };

  const handleCreateRule = async () => {
    if (!user?.id || !createForm.ruleName.trim() || !createForm.ruleDescription.trim()) return;

    try {
      await persistentNarrativeEngine.createCanonRule({
        seriesId,
        authorId: user.id,
        ruleCategory: createForm.ruleCategory as CanonRule['ruleCategory'],
        ruleName: createForm.ruleName,
        ruleDescription: createForm.ruleDescription,
        ruleType: createForm.ruleType,
        lockLevel: createForm.lockLevel,
        appliesFromBook: createForm.appliesFromBook,
        appliesUntilBook: createForm.appliesUntilBook
          ? parseInt(createForm.appliesUntilBook)
          : undefined,
        violationMessage: createForm.violationMessage || undefined,
        validExamples: createForm.validExamples.split('\n').filter(Boolean),
        invalidExamples: createForm.invalidExamples.split('\n').filter(Boolean),
      });

      fetchRules();
      setViewMode('list');
      setCreateForm({
        ruleCategory: 'character',
        ruleName: '',
        ruleDescription: '',
        ruleType: 'must',
        lockLevel: 'hard',
        appliesFromBook: 1,
        appliesUntilBook: '',
        violationMessage: '',
        validExamples: '',
        invalidExamples: '',
      });
    } catch (error) {
      console.error('Failed to create canon rule:', error);
    }
  };

  const getCategoryInfo = (category: string) =>
    RULE_CATEGORIES.find((c) => c.id === category) || RULE_CATEGORIES[0];
  const getTypeInfo = (type: string) => RULE_TYPES.find((t) => t.id === type) || RULE_TYPES[0];
  const getLockInfo = (level: CanonLockLevel) =>
    LOCK_LEVELS.find((l) => l.id === level) || LOCK_LEVELS[2];

  const filteredRules = rules.filter((r) => {
    if (filterCategory !== 'all' && r.ruleCategory !== filterCategory) return false;
    if (
      searchTerm &&
      !r.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.ruleDescription.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const groupedRules = filteredRules.reduce(
    (acc, rule) => {
      const cat = rule.ruleCategory;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(rule);
      return acc;
    },
    {} as Record<string, CanonRule[]>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading canon rules...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Canon Bible</h2>
          <p className="text-text-secondary text-sm mt-1">
            {seriesTitle} • {rules.length} rule{rules.length !== 1 ? 's' : ''} defined
          </p>
        </div>
        <button
          onClick={() => setViewMode('create')}
          className="px-4 py-2 bg-spectral-cyan text-void-base rounded-lg font-medium hover:bg-spectral-cyan/80 transition-colors"
        >
          + New Rule
        </button>
      </div>

      {/* Explanation Box */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-spectral-cyan/10 to-spectral-violet/10 border border-spectral-cyan/20">
        <h3 className="font-semibold text-text-primary mb-2">📜 What is the Canon Bible?</h3>
        <p className="text-sm text-text-secondary">
          The Canon Bible is your source of truth for your series. Define rules that the AI must
          follow to maintain continuity. When you write or generate content, the AI will check
          against these rules to prevent contradictions and maintain narrative consistency.
        </p>
      </div>

      {/* Filters */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rules..."
            className="px-4 py-2 bg-void-depth border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan w-64"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-void-depth border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
          >
            <option value="all">All Categories</option>
            {RULE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
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
              <h3 className="text-xl font-bold text-text-primary">Create Canon Rule</h3>
              <button
                onClick={() => setViewMode('list')}
                className="text-text-tertiary hover:text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm text-text-tertiary mb-2">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {RULE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCreateForm({ ...createForm, ruleCategory: cat.id })}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          createForm.ruleCategory === cat.id
                            ? 'border-spectral-cyan bg-spectral-cyan/10'
                            : 'border-void-mist hover:border-spectral-cyan/50'
                        }`}
                      >
                        <div className="text-lg">{cat.icon}</div>
                        <div className="text-xs text-text-primary">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Rule Name *</label>
                  <input
                    type="text"
                    value={createForm.ruleName}
                    onChange={(e) => setCreateForm({ ...createForm, ruleName: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="e.g., Character Death Rule, Magic System Limit"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">
                    Rule Description *
                  </label>
                  <textarea
                    value={createForm.ruleDescription}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, ruleDescription: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none"
                    placeholder="Describe the rule in detail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Rule Type</label>
                    <select
                      value={createForm.ruleType}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          ruleType: e.target.value as typeof createForm.ruleType,
                        })
                      }
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    >
                      {RULE_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} - {type.desc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Lock Level</label>
                    <select
                      value={createForm.lockLevel}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          lockLevel: e.target.value as CanonLockLevel,
                        })
                      }
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    >
                      {LOCK_LEVELS.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name} - {level.desc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Applies From Book
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.appliesFromBook}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          appliesFromBook: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">
                      Until Book (optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={createForm.appliesUntilBook}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, appliesUntilBook: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="Forever"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Violation Message</label>
                  <input
                    type="text"
                    value={createForm.violationMessage}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, violationMessage: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="Message shown when rule is violated"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">
                    Valid Examples (one per line)
                  </label>
                  <textarea
                    value={createForm.validExamples}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, validExamples: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none font-mono text-sm"
                    placeholder="Aria used telekinesis to move the book&#10;The wizard cast a spell of protection"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">
                    Invalid Examples (one per line)
                  </label>
                  <textarea
                    value={createForm.invalidExamples}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, invalidExamples: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none font-mono text-sm"
                    placeholder="The farmer used magic to grow crops&#10;John flew without wings or spells"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-void-mist">
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                disabled={!createForm.ruleName.trim() || !createForm.ruleDescription.trim()}
                className="px-6 py-2 bg-spectral-cyan text-void-base rounded-lg font-medium hover:bg-spectral-cyan/80 transition-colors disabled:opacity-50"
              >
                Create Rule
              </button>
            </div>
          </motion.div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {Object.keys(groupedRules).length === 0 ? (
              <div className="text-center py-12 text-text-tertiary">
                {rules.length === 0 ? (
                  <div>
                    <p className="text-lg mb-2">No canon rules defined yet</p>
                    <p>Create rules to help the AI maintain consistency in your series!</p>
                  </div>
                ) : (
                  <p>No rules match your filters.</p>
                )}
              </div>
            ) : (
              Object.entries(groupedRules).map(([category, categoryRules]) => {
                const catInfo = getCategoryInfo(category);
                return (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{catInfo.icon}</span>
                      <h3 className="text-lg font-semibold text-text-primary">{catInfo.name}</h3>
                      <span className="text-sm text-text-tertiary">({categoryRules.length})</span>
                    </div>
                    <div className="space-y-3">
                      {categoryRules.map((rule, index) => {
                        const typeInfo = getTypeInfo(rule.ruleType);
                        const lockInfo = getLockInfo(rule.lockLevel);

                        return (
                          <motion.div
                            key={rule.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                              setSelectedRule(rule);
                              setViewMode('detail');
                            }}
                            className="p-4 rounded-xl bg-void-depth border border-void-mist hover:border-spectral-cyan/30 cursor-pointer transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-semibold text-text-primary">
                                    {rule.ruleName}
                                  </h4>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full bg-${typeInfo.color}/20 text-${typeInfo.color}`}
                                  >
                                    {typeInfo.name}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full bg-${lockInfo.color}/20 text-${lockInfo.color}`}
                                  >
                                    {lockInfo.name}
                                  </span>
                                </div>
                                <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                                  {rule.ruleDescription}
                                </p>
                              </div>
                              <div className="text-xs text-text-tertiary text-right ml-4">
                                {rule.appliesFromBook === 1 && !rule.appliesUntilBook ? (
                                  'All books'
                                ) : (
                                  <>
                                    Book {rule.appliesFromBook}
                                    {rule.appliesUntilBook ? `-${rule.appliesUntilBook}` : '+'}
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Detail View */}
        {viewMode === 'detail' && selectedRule && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-xl bg-void-depth border border-void-mist"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{getCategoryInfo(selectedRule.ruleCategory).icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">{selectedRule.ruleName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-sm px-2 py-0.5 rounded-full bg-${getTypeInfo(selectedRule.ruleType).color}/20 text-${getTypeInfo(selectedRule.ruleType).color}`}
                    >
                      {getTypeInfo(selectedRule.ruleType).name}
                    </span>
                    <span
                      className={`text-sm px-2 py-0.5 rounded-full bg-${getLockInfo(selectedRule.lockLevel).color}/20 text-${getLockInfo(selectedRule.lockLevel).color}`}
                    >
                      {getLockInfo(selectedRule.lockLevel).name}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedRule(null);
                  setViewMode('list');
                }}
                className="text-text-tertiary hover:text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-text-secondary mb-2">Rule Description</h4>
                <p className="text-text-primary">{selectedRule.ruleDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-text-secondary mb-2">Applies</h4>
                  <p className="text-text-primary">
                    Book {selectedRule.appliesFromBook}
                    {selectedRule.appliesUntilBook
                      ? ` to Book ${selectedRule.appliesUntilBook}`
                      : ' onwards'}
                  </p>
                </div>
                {selectedRule.violationMessage && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">
                      Violation Message
                    </h4>
                    <p className="text-red-400">{selectedRule.violationMessage}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedRule.validExamples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">
                      ✅ Valid Examples
                    </h4>
                    <ul className="space-y-2">
                      {selectedRule.validExamples.map((example, i) => (
                        <li
                          key={i}
                          className="text-sm text-green-400/80 p-2 bg-green-400/10 rounded"
                        >
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedRule.invalidExamples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">
                      ❌ Invalid Examples
                    </h4>
                    <ul className="space-y-2">
                      {selectedRule.invalidExamples.map((example, i) => (
                        <li key={i} className="text-sm text-red-400/80 p-2 bg-red-400/10 rounded">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-void-mist flex justify-end gap-3">
              <button className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                Delete Rule
              </button>
              <button className="px-4 py-2 text-sm bg-spectral-cyan/10 text-spectral-cyan rounded-lg hover:bg-spectral-cyan/20 transition-colors">
                Edit Rule
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
