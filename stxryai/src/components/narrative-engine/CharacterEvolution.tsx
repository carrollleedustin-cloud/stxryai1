'use client';

/**
 * Character Evolution Component
 * Track character development, changes, relationships, and arcs across the series.
 * If someone loses an eye in Book One, they don't magically heal by Book Three.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Heart,
  Skull,
  Zap,
  Target,
  MessageCircle,
  GitBranch,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  Shield,
  Sparkles,
} from 'lucide-react';

interface CharacterEvolutionProps {
  seriesId: string;
  characterId?: string;
  onCharacterSelect?: (characterId: string) => void;
}

interface Character {
  id: string;
  name: string;
  aliases: string[];
  title?: string;
  role: 'protagonist' | 'antagonist' | 'deuteragonist' | 'supporting' | 'minor';
  status: 'active' | 'deceased' | 'missing' | 'retired' | 'transformed';
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
  canonLockLevel: 'suggestion' | 'soft' | 'hard' | 'immutable';
  lockedAttributes: string[];
}

interface CharacterEvent {
  id: string;
  eventType: 'physical' | 'psychological' | 'relational' | 'status' | 'ability';
  description: string;
  cause?: string;
  bookNumber: number;
  chapterNumber?: number;
  isPermanent: boolean;
  significanceLevel: number;
  previousState?: any;
  newState?: any;
}

interface Relationship {
  id: string;
  otherCharacterId: string;
  otherCharacterName: string;
  type: 'ally' | 'enemy' | 'family' | 'romantic' | 'mentor' | 'rival' | 'neutral';
  intensity: number;
  history?: string;
  currentDynamic?: string;
  tensionPoints: string[];
}

export default function CharacterEvolution({
  seriesId,
  characterId,
  onCharacterSelect,
}: CharacterEvolutionProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [events, setEvents] = useState<CharacterEvent[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    'timeline' | 'relationships' | 'traits' | 'dialogue'
  >('timeline');

  useEffect(() => {
    loadCharacters();
  }, [seriesId]);

  useEffect(() => {
    if (characterId) {
      loadCharacterDetail(characterId);
    }
  }, [characterId]);

  const loadCharacters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/narrative-engine/characters?seriesId=${seriesId}`);
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.characters || []);
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCharacterDetail = async (id: string) => {
    try {
      const [charResponse, eventsResponse, relsResponse] = await Promise.all([
        fetch(`/api/narrative-engine/characters/${id}`),
        fetch(`/api/narrative-engine/characters/${id}/events`),
        fetch(`/api/narrative-engine/characters/${id}/relationships`),
      ]);

      if (charResponse.ok) {
        const charData = await charResponse.json();
        setSelectedCharacter(charData);
      }
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }
      if (relsResponse.ok) {
        const relsData = await relsResponse.json();
        setRelationships(relsData.relationships || []);
      }
    } catch (error) {
      console.error('Failed to load character detail:', error);
    }
  };

  const handleCharacterClick = (char: Character) => {
    setSelectedCharacter(char);
    loadCharacterDetail(char.id);
    onCharacterSelect?.(char.id);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'protagonist':
        return 'from-amber-500 to-orange-500';
      case 'antagonist':
        return 'from-red-500 to-rose-500';
      case 'deuteragonist':
        return 'from-purple-500 to-pink-500';
      case 'supporting':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <User className="w-4 h-4 text-emerald-400" />;
      case 'deceased':
        return <Skull className="w-4 h-4 text-red-400" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'transformed':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'physical':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'psychological':
        return <Heart className="w-4 h-4 text-pink-400" />;
      case 'relational':
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      case 'status':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'ability':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Character List Sidebar */}
      <div className="w-80 border-r border-white/10 bg-black/20 overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Characters</h3>
          <p className="text-sm text-slate-400">{characters.length} total</p>
        </div>

        <div className="p-2">
          {/* Group by role */}
          {['protagonist', 'antagonist', 'deuteragonist', 'supporting', 'minor'].map((role) => {
            const roleChars = characters.filter((c) => c.role === role);
            if (roleChars.length === 0) return null;

            return (
              <div key={role} className="mb-4">
                <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {role}s ({roleChars.length})
                </div>
                {roleChars.map((char) => (
                  <motion.div
                    key={char.id}
                    onClick={() => handleCharacterClick(char)}
                    className={`p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                      selectedCharacter?.id === char.id
                        ? 'bg-purple-500/20 border border-purple-500/50'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(char.role)} flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {char.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate">{char.name}</span>
                          {char.canonLockLevel === 'immutable' && (
                            <Lock className="w-3 h-3 text-amber-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          {getStatusIcon(char.status)}
                          <span className="capitalize">{char.status}</span>
                          <span>•</span>
                          <span>Book {char.firstAppearsBook}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Detail */}
      <div className="flex-1 overflow-y-auto">
        {selectedCharacter ? (
          <div>
            {/* Character Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
              <div className="flex items-start gap-6">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getRoleColor(selectedCharacter.role)} flex items-center justify-center text-white font-bold text-3xl`}
                >
                  {selectedCharacter.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedCharacter.name}</h2>
                    {selectedCharacter.title && (
                      <span className="text-slate-400">"{selectedCharacter.title}"</span>
                    )}
                    {selectedCharacter.canonLockLevel === 'immutable' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Immutable
                      </span>
                    )}
                  </div>
                  {selectedCharacter.aliases.length > 0 && (
                    <p className="text-slate-400 text-sm mb-2">
                      Also known as: {selectedCharacter.aliases.join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full capitalize ${
                        selectedCharacter.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : selectedCharacter.status === 'deceased'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {selectedCharacter.status}
                    </span>
                    <span className="text-slate-400">
                      First appears: Book {selectedCharacter.firstAppearsBook}
                    </span>
                    {selectedCharacter.ageAtSeriesStart && (
                      <span className="text-slate-400">
                        Age: {selectedCharacter.ageAtSeriesStart} (at start)
                      </span>
                    )}
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Edit3 className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 p-4 border-b border-white/10">
              {[
                { id: 'timeline', label: 'Evolution Timeline', icon: Clock },
                { id: 'relationships', label: 'Relationships', icon: Heart },
                { id: 'traits', label: 'Personality & Traits', icon: Target },
                { id: 'dialogue', label: 'Voice & Dialogue', icon: MessageCircle },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </div>

            {/* Section Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeSection === 'timeline' && (
                  <EvolutionTimeline
                    key="timeline"
                    events={events}
                    characterName={selectedCharacter.name}
                  />
                )}
                {activeSection === 'relationships' && (
                  <RelationshipsView
                    key="relationships"
                    relationships={relationships}
                    characterName={selectedCharacter.name}
                  />
                )}
                {activeSection === 'traits' && (
                  <TraitsView key="traits" character={selectedCharacter} />
                )}
                {activeSection === 'dialogue' && (
                  <DialogueView key="dialogue" character={selectedCharacter} />
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-medium text-white mb-2">Select a Character</h3>
              <p className="text-slate-400">Choose a character to view their evolution</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Evolution Timeline Component
function EvolutionTimeline({
  events,
  characterName,
}: {
  events: CharacterEvent[];
  characterName: string;
}) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'physical':
        return <Zap className="w-4 h-4" />;
      case 'psychological':
        return <Heart className="w-4 h-4" />;
      case 'relational':
        return <GitBranch className="w-4 h-4" />;
      case 'status':
        return <Shield className="w-4 h-4" />;
      case 'ability':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string, isPermanent: boolean) => {
    if (isPermanent) {
      switch (type) {
        case 'physical':
          return 'border-amber-500 bg-amber-500/10';
        case 'psychological':
          return 'border-pink-500 bg-pink-500/10';
        case 'relational':
          return 'border-purple-500 bg-purple-500/10';
        case 'status':
          return 'border-blue-500 bg-blue-500/10';
        case 'ability':
          return 'border-emerald-500 bg-emerald-500/10';
        default:
          return 'border-slate-500 bg-slate-500/10';
      }
    }
    return 'border-white/20 bg-white/5';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Evolution Timeline</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {events.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

          <div className="space-y-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-16"
              >
                {/* Event dot */}
                <div
                  className={`absolute left-4 w-5 h-5 rounded-full border-2 ${getEventColor(event.eventType, event.isPermanent)} flex items-center justify-center`}
                >
                  {getEventIcon(event.eventType)}
                </div>

                <div
                  className={`p-4 rounded-xl border ${event.isPermanent ? getEventColor(event.eventType, true) : 'border-white/10 bg-white/5'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Book {event.bookNumber}
                        {event.chapterNumber ? `, Chapter ${event.chapterNumber}` : ''}
                      </span>
                      <h4 className="text-white font-medium mt-1">{event.description}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.isPermanent && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                          Permanent
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-400 text-xs font-medium capitalize">
                        {event.eventType}
                      </span>
                    </div>
                  </div>

                  {event.cause && (
                    <p className="text-sm text-slate-400 mb-2">Cause: {event.cause}</p>
                  )}

                  {/* State change visualization */}
                  {event.previousState && event.newState && (
                    <div className="mt-3 p-3 rounded-lg bg-black/20 flex items-center gap-4 text-sm">
                      <div className="text-slate-400">
                        <span className="text-xs text-slate-500 block mb-1">Before</span>
                        {JSON.stringify(event.previousState)}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                      <div className="text-white">
                        <span className="text-xs text-slate-500 block mb-1">After</span>
                        {JSON.stringify(event.newState)}
                      </div>
                    </div>
                  )}

                  {/* Significance meter */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Impact:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < event.significanceLevel ? 'bg-purple-500' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No events recorded yet.</p>
          <p className="text-slate-500 text-sm">
            Track injuries, transformations, and key moments.
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Relationships View Component
function RelationshipsView({
  relationships,
  characterName,
}: {
  relationships: Relationship[];
  characterName: string;
}) {
  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'ally':
        return 'text-emerald-400 bg-emerald-500/20';
      case 'enemy':
        return 'text-red-400 bg-red-500/20';
      case 'family':
        return 'text-amber-400 bg-amber-500/20';
      case 'romantic':
        return 'text-pink-400 bg-pink-500/20';
      case 'mentor':
        return 'text-purple-400 bg-purple-500/20';
      case 'rival':
        return 'text-orange-400 bg-orange-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Relationships</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
          <Plus className="w-4 h-4" />
          Add Relationship
        </button>
      </div>

      {relationships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relationships.map((rel) => (
            <div
              key={rel.id}
              className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {rel.otherCharacterName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{rel.otherCharacterName}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getRelationshipColor(rel.type)}`}
                    >
                      {rel.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Intensity meter */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Intensity</span>
                  <span className="text-xs text-slate-400">{rel.intensity}/10</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      rel.type === 'enemy'
                        ? 'bg-red-500'
                        : rel.type === 'romantic'
                          ? 'bg-pink-500'
                          : rel.type === 'ally'
                            ? 'bg-emerald-500'
                            : 'bg-purple-500'
                    }`}
                    style={{ width: `${rel.intensity * 10}%` }}
                  />
                </div>
              </div>

              {rel.currentDynamic && (
                <p className="text-sm text-slate-400 mb-2">{rel.currentDynamic}</p>
              )}

              {rel.tensionPoints.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs text-slate-500">Tension points:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rel.tensionPoints.map((point, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No relationships defined yet.</p>
        </div>
      )}
    </motion.div>
  );
}

// Traits View Component
function TraitsView({ character }: { character: Character }) {
  const sections = [
    { key: 'traits', label: 'Core Traits', color: 'purple' },
    { key: 'values', label: 'Values', color: 'emerald' },
    { key: 'fears', label: 'Fears', color: 'red' },
    { key: 'desires', label: 'Desires', color: 'amber' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <h3 className="text-lg font-semibold text-white mb-6">Personality & Traits</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.key} className="p-4 rounded-xl border border-white/10 bg-white/5">
            <h4 className={`text-${section.color}-400 font-medium mb-3`}>{section.label}</h4>
            <div className="flex flex-wrap gap-2">
              {(
                character.corePersonality[section.key as keyof typeof character.corePersonality] ||
                []
              ).map((item: string, i: number) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full bg-${section.color}-500/20 text-${section.color}-400 text-sm`}
                >
                  {item}
                </span>
              ))}
              {(
                character.corePersonality[section.key as keyof typeof character.corePersonality] ||
                []
              ).length === 0 && <span className="text-slate-500 text-sm">None defined</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Physical Description */}
      <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <h4 className="text-blue-400 font-medium mb-3">Physical Description</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {['height', 'build', 'hairColor', 'eyeColor'].map((key) => (
            <div key={key}>
              <span className="text-xs text-slate-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <p className="text-white">{(character.physicalDescription as any)[key] || '—'}</p>
            </div>
          ))}
        </div>
        {character.physicalDescription.distinguishingFeatures.length > 0 && (
          <div>
            <span className="text-xs text-slate-500">Distinguishing Features</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {character.physicalDescription.distinguishingFeatures.map((feature, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Dialogue View Component
function DialogueView({ character }: { character: Character }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <h3 className="text-lg font-semibold text-white mb-6">Voice & Dialogue</h3>

      <div className="space-y-6">
        {/* Dialogue Style */}
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <h4 className="text-pink-400 font-medium mb-3">Dialogue Style</h4>
          <p className="text-slate-300">{character.dialogueStyle || 'No style defined'}</p>
        </div>

        {/* Speech Patterns */}
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <h4 className="text-purple-400 font-medium mb-3">Speech Patterns</h4>
          {character.speechPatterns.length > 0 ? (
            <div className="space-y-2">
              {character.speechPatterns.map((pattern, i) => (
                <div key={i} className="p-3 rounded-lg bg-black/20 text-slate-300">
                  "{pattern}"
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No patterns defined</p>
          )}
        </div>

        {/* Locked Attributes */}
        {character.lockedAttributes.length > 0 && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-amber-400" />
              <h4 className="text-amber-400 font-medium">Locked Attributes</h4>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              These attributes are locked and will be enforced by the canon system.
            </p>
            <div className="flex flex-wrap gap-2">
              {character.lockedAttributes.map((attr, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm"
                >
                  {attr}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
