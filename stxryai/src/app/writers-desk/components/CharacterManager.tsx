'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface Character {
  id: string;
  name: string;
  aliases: string[];
  title?: string;
  role: string;
  status: string;
  firstAppearsBook: number;
  ageAtSeriesStart?: number;
  corePersonality: {
    traits: string[];
    values: string[];
    fears: string[];
    desires: string[];
  };
  physicalDescription: {
    height?: string;
    build?: string;
    hairColor?: string;
    eyeColor?: string;
    distinguishingFeatures: string[];
  };
  dialogueStyle?: string;
  speechPatterns: string[];
  canonLockLevel: string;
  lockedAttributes: string[];
}

interface CharacterManagerProps {
  seriesId: string;
  seriesTitle: string;
}

type ViewMode = 'grid' | 'list' | 'create' | 'detail';

const CHARACTER_ROLES = [
  { id: 'protagonist', name: 'Protagonist', icon: '⭐', color: 'spectral-gold' },
  { id: 'antagonist', name: 'Antagonist', icon: '🎭', color: 'red-400' },
  { id: 'deuteragonist', name: 'Deuteragonist', icon: '🌟', color: 'spectral-cyan' },
  { id: 'supporting', name: 'Supporting', icon: '👤', color: 'spectral-violet' },
  { id: 'minor', name: 'Minor', icon: '👥', color: 'text-secondary' },
  { id: 'background', name: 'Background', icon: '🌫️', color: 'text-tertiary' },
];

const CHARACTER_STATUSES = [
  { id: 'active', name: 'Active', color: 'green-400' },
  { id: 'deceased', name: 'Deceased', color: 'red-400' },
  { id: 'missing', name: 'Missing', color: 'yellow-400' },
  { id: 'retired', name: 'Retired', color: 'text-tertiary' },
  { id: 'transformed', name: 'Transformed', color: 'spectral-violet' },
];

export default function CharacterManager({ seriesId, seriesTitle }: CharacterManagerProps) {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    aliases: '',
    title: '',
    characterRole: 'supporting',
    backstory: '',
    motivation: '',
    fatalFlaw: '',
    ageAtSeriesStart: '',
    dialogueStyle: '',
    traits: '',
    values: '',
    fears: '',
    desires: '',
    height: '',
    build: '',
    hairColor: '',
    eyeColor: '',
    distinguishingFeatures: '',
    speechPatterns: '',
  });

  useEffect(() => {
    fetchCharacters();
  }, [seriesId]);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/narrative-engine/characters?seriesId=${seriesId}`);
      const data = await response.json();
      if (data.characters) {
        setCharacters(data.characters);
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
    setLoading(false);
  };

  const handleCreateCharacter = async () => {
    if (!user?.id || !createForm.name.trim()) return;

    try {
      const response = await fetch('/api/narrative-engine/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesId,
          authorId: user.id,
          name: createForm.name,
          aliases: createForm.aliases.split(',').map(a => a.trim()).filter(Boolean),
          title: createForm.title || undefined,
          characterRole: createForm.characterRole,
          backstory: createForm.backstory || undefined,
          motivation: createForm.motivation || undefined,
          fatalFlaw: createForm.fatalFlaw || undefined,
          ageAtSeriesStart: createForm.ageAtSeriesStart ? parseInt(createForm.ageAtSeriesStart) : undefined,
          dialogueStyle: createForm.dialogueStyle || undefined,
          corePersonality: {
            traits: createForm.traits.split(',').map(t => t.trim()).filter(Boolean),
            values: createForm.values.split(',').map(v => v.trim()).filter(Boolean),
            fears: createForm.fears.split(',').map(f => f.trim()).filter(Boolean),
            desires: createForm.desires.split(',').map(d => d.trim()).filter(Boolean),
          },
          physicalDescription: {
            height: createForm.height || undefined,
            build: createForm.build || undefined,
            hairColor: createForm.hairColor || undefined,
            eyeColor: createForm.eyeColor || undefined,
            distinguishingFeatures: createForm.distinguishingFeatures.split(',').map(f => f.trim()).filter(Boolean),
          },
          speechPatterns: createForm.speechPatterns.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        fetchCharacters();
        setViewMode('grid');
        setCreateForm({
          name: '', aliases: '', title: '', characterRole: 'supporting',
          backstory: '', motivation: '', fatalFlaw: '', ageAtSeriesStart: '',
          dialogueStyle: '', traits: '', values: '', fears: '', desires: '',
          height: '', build: '', hairColor: '', eyeColor: '',
          distinguishingFeatures: '', speechPatterns: '',
        });
      }
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  const filteredCharacters = characters.filter(c => {
    if (filterRole !== 'all' && c.role !== filterRole) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getRoleInfo = (role: string) => CHARACTER_ROLES.find(r => r.id === role) || CHARACTER_ROLES[3];
  const getStatusInfo = (status: string) => CHARACTER_STATUSES.find(s => s.id === status) || CHARACTER_STATUSES[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Characters</h2>
          <p className="text-text-secondary text-sm mt-1">
            {seriesTitle} • {characters.length} character{characters.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setViewMode('create')}
          className="px-4 py-2 bg-spectral-cyan text-void-base rounded-lg font-medium hover:bg-spectral-cyan/80 transition-colors"
        >
          + New Character
        </button>
      </div>

      {/* Filters */}
      {viewMode !== 'create' && viewMode !== 'detail' && (
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search characters..."
            className="px-4 py-2 bg-void-depth border border-void-mist rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-spectral-cyan w-64"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-void-depth border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
          >
            <option value="all">All Roles</option>
            {CHARACTER_ROLES.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-spectral-cyan/20 text-spectral-cyan' : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              ▦
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-spectral-cyan/20 text-spectral-cyan' : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              ☰
            </button>
          </div>
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
              <h3 className="text-xl font-bold text-text-primary">Create New Character</h3>
              <button
                onClick={() => setViewMode('grid')}
                className="text-text-tertiary hover:text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-secondary">Basic Information</h4>
                
                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="Character name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Aliases (comma-separated)</label>
                  <input
                    type="text"
                    value={createForm.aliases}
                    onChange={(e) => setCreateForm({ ...createForm, aliases: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="The Shadow, Lord of Shadows"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Title</label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="Dr., Lord, Captain"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Age at Series Start</label>
                    <input
                      type="number"
                      value={createForm.ageAtSeriesStart}
                      onChange={(e) => setCreateForm({ ...createForm, ageAtSeriesStart: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Role</label>
                  <select
                    value={createForm.characterRole}
                    onChange={(e) => setCreateForm({ ...createForm, characterRole: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                  >
                    {CHARACTER_ROLES.map(role => (
                      <option key={role.id} value={role.id}>{role.icon} {role.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Personality */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-secondary">Personality & Psychology</h4>
                
                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Traits (comma-separated)</label>
                  <input
                    type="text"
                    value={createForm.traits}
                    onChange={(e) => setCreateForm({ ...createForm, traits: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="brave, stubborn, loyal"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Values</label>
                  <input
                    type="text"
                    value={createForm.values}
                    onChange={(e) => setCreateForm({ ...createForm, values: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="honor, family, freedom"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Fears</label>
                  <input
                    type="text"
                    value={createForm.fears}
                    onChange={(e) => setCreateForm({ ...createForm, fears: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="abandonment, failure, darkness"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Desires</label>
                  <input
                    type="text"
                    value={createForm.desires}
                    onChange={(e) => setCreateForm({ ...createForm, desires: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="redemption, love, power"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Fatal Flaw</label>
                  <input
                    type="text"
                    value={createForm.fatalFlaw}
                    onChange={(e) => setCreateForm({ ...createForm, fatalFlaw: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="Pride, inability to trust"
                  />
                </div>
              </div>

              {/* Physical & Voice */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-secondary">Physical Description</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Height</label>
                    <input
                      type="text"
                      value={createForm.height}
                      onChange={(e) => setCreateForm({ ...createForm, height: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder='tall, 6\'2"'
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Build</label>
                    <input
                      type="text"
                      value={createForm.build}
                      onChange={(e) => setCreateForm({ ...createForm, build: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="athletic, slender"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Hair</label>
                    <input
                      type="text"
                      value={createForm.hairColor}
                      onChange={(e) => setCreateForm({ ...createForm, hairColor: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="black, long"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-tertiary mb-1">Eyes</label>
                    <input
                      type="text"
                      value={createForm.eyeColor}
                      onChange={(e) => setCreateForm({ ...createForm, eyeColor: e.target.value })}
                      className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                      placeholder="blue, piercing"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Distinguishing Features</label>
                  <input
                    type="text"
                    value={createForm.distinguishingFeatures}
                    onChange={(e) => setCreateForm({ ...createForm, distinguishingFeatures: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="scar on left cheek, silver ring"
                  />
                </div>
              </div>

              {/* Voice & Narrative */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-secondary">Voice & Background</h4>
                
                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Dialogue Style</label>
                  <input
                    type="text"
                    value={createForm.dialogueStyle}
                    onChange={(e) => setCreateForm({ ...createForm, dialogueStyle: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="formal, witty, terse"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Speech Patterns</label>
                  <input
                    type="text"
                    value={createForm.speechPatterns}
                    onChange={(e) => setCreateForm({ ...createForm, speechPatterns: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="uses archaic words, speaks slowly"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Backstory</label>
                  <textarea
                    value={createForm.backstory}
                    onChange={(e) => setCreateForm({ ...createForm, backstory: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan resize-none"
                    placeholder="Character's history before the story begins..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary mb-1">Motivation</label>
                  <input
                    type="text"
                    value={createForm.motivation}
                    onChange={(e) => setCreateForm({ ...createForm, motivation: e.target.value })}
                    className="w-full px-3 py-2 bg-void-base border border-void-mist rounded-lg text-text-primary focus:outline-none focus:border-spectral-cyan"
                    placeholder="What drives this character?"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-void-mist">
              <button
                onClick={() => setViewMode('grid')}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCharacter}
                disabled={!createForm.name.trim()}
                className="px-6 py-2 bg-spectral-cyan text-void-base rounded-lg font-medium hover:bg-spectral-cyan/80 transition-colors disabled:opacity-50"
              >
                Create Character
              </button>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredCharacters.length === 0 ? (
              <div className="col-span-full text-center py-12 text-text-tertiary">
                {characters.length === 0 ? (
                  <p>No characters yet. Create your first character to get started!</p>
                ) : (
                  <p>No characters match your filters.</p>
                )}
              </div>
            ) : (
              filteredCharacters.map((character, index) => {
                const roleInfo = getRoleInfo(character.role);
                const statusInfo = getStatusInfo(character.status);
                
                return (
                  <motion.div
                    key={character.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedCharacter(character);
                      setViewMode('detail');
                    }}
                    className="p-4 rounded-xl bg-void-depth border border-void-mist hover:border-spectral-cyan/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-spectral-cyan/30 to-spectral-violet/30 flex items-center justify-center text-xl">
                        {roleInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary group-hover:text-spectral-cyan transition-colors truncate">
                          {character.title ? `${character.title} ` : ''}{character.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-${roleInfo.color}/20 text-${roleInfo.color}`}>
                            {roleInfo.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-${statusInfo.color}/20 text-${statusInfo.color}`}>
                            {statusInfo.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {character.corePersonality.traits.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {character.corePersonality.traits.slice(0, 3).map((trait) => (
                          <span key={trait} className="text-xs px-2 py-0.5 rounded bg-void-mist text-text-tertiary">
                            {trait}
                          </span>
                        ))}
                        {character.corePersonality.traits.length > 3 && (
                          <span className="text-xs text-text-tertiary">
                            +{character.corePersonality.traits.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-text-tertiary">
                      First appears: Book {character.firstAppearsBook}
                      {character.ageAtSeriesStart && ` • Age ${character.ageAtSeriesStart}`}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Detail View */}
        {viewMode === 'detail' && selectedCharacter && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-xl bg-void-depth border border-void-mist"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spectral-cyan/30 to-spectral-violet/30 flex items-center justify-center text-2xl">
                  {getRoleInfo(selectedCharacter.role).icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">
                    {selectedCharacter.title ? `${selectedCharacter.title} ` : ''}{selectedCharacter.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-text-secondary">{getRoleInfo(selectedCharacter.role).name}</span>
                    <span className="text-text-tertiary">•</span>
                    <span className={`text-sm text-${getStatusInfo(selectedCharacter.status).color}`}>
                      {getStatusInfo(selectedCharacter.status).name}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCharacter(null);
                  setViewMode('grid');
                }}
                className="text-text-tertiary hover:text-text-secondary"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-text-secondary mb-2">Personality Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.corePersonality.traits.map((trait) => (
                      <span key={trait} className="px-3 py-1 rounded-full bg-spectral-cyan/10 text-spectral-cyan text-sm">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-secondary mb-2">Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.corePersonality.values.map((value) => (
                      <span key={value} className="px-3 py-1 rounded-full bg-spectral-violet/10 text-spectral-violet text-sm">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-secondary mb-2">Fears & Desires</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-text-tertiary">Fears:</span>
                      <ul className="mt-1 text-sm text-text-secondary">
                        {selectedCharacter.corePersonality.fears.map((fear) => (
                          <li key={fear}>• {fear}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-xs text-text-tertiary">Desires:</span>
                      <ul className="mt-1 text-sm text-text-secondary">
                        {selectedCharacter.corePersonality.desires.map((desire) => (
                          <li key={desire}>• {desire}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-text-secondary mb-2">Physical Description</h4>
                  <div className="text-sm text-text-secondary space-y-1">
                    {selectedCharacter.physicalDescription.height && (
                      <p><span className="text-text-tertiary">Height:</span> {selectedCharacter.physicalDescription.height}</p>
                    )}
                    {selectedCharacter.physicalDescription.build && (
                      <p><span className="text-text-tertiary">Build:</span> {selectedCharacter.physicalDescription.build}</p>
                    )}
                    {selectedCharacter.physicalDescription.hairColor && (
                      <p><span className="text-text-tertiary">Hair:</span> {selectedCharacter.physicalDescription.hairColor}</p>
                    )}
                    {selectedCharacter.physicalDescription.eyeColor && (
                      <p><span className="text-text-tertiary">Eyes:</span> {selectedCharacter.physicalDescription.eyeColor}</p>
                    )}
                  </div>
                </div>

                {selectedCharacter.physicalDescription.distinguishingFeatures.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Distinguishing Features</h4>
                    <ul className="text-sm text-text-secondary">
                      {selectedCharacter.physicalDescription.distinguishingFeatures.map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCharacter.dialogueStyle && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Dialogue Style</h4>
                    <p className="text-sm text-text-secondary">{selectedCharacter.dialogueStyle}</p>
                  </div>
                )}

                {selectedCharacter.speechPatterns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Speech Patterns</h4>
                    <ul className="text-sm text-text-secondary">
                      {selectedCharacter.speechPatterns.map((pattern) => (
                        <li key={pattern}>• {pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-void-mist flex items-center justify-between">
              <div className="text-xs text-text-tertiary">
                Canon Lock: {selectedCharacter.canonLockLevel}
                {selectedCharacter.lockedAttributes.length > 0 && (
                  <> • Locked: {selectedCharacter.lockedAttributes.join(', ')}</>
                )}
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm text-text-secondary hover:text-spectral-cyan transition-colors">
                  View Timeline
                </button>
                <button className="px-4 py-2 text-sm bg-spectral-cyan/10 text-spectral-cyan rounded-lg hover:bg-spectral-cyan/20 transition-colors">
                  Edit Character
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

