'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
}

interface Relationship {
  from: string;
  to: string;
  type: 'friend' | 'enemy' | 'romance' | 'family' | 'mentor' | 'rival';
  strength: number; // 0-100
}

interface CharacterRelationshipMapProps {
  characters: Character[];
  relationships: Relationship[];
  onCharacterAdd?: (character: Omit<Character, 'id'>) => void;
  onRelationshipAdd?: (relationship: Omit<Relationship, 'id'>) => void;
  onCharacterUpdate?: (id: string, updates: Partial<Character>) => void;
}

export function CharacterRelationshipMap({
  characters,
  relationships,
  onCharacterAdd,
  onRelationshipAdd,
  onCharacterUpdate,
}: CharacterRelationshipMapProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);

  const relationshipColors = {
    friend: 'from-green-400 to-green-600',
    enemy: 'from-red-400 to-red-600',
    romance: 'from-pink-400 to-pink-600',
    family: 'from-blue-400 to-blue-600',
    mentor: 'from-purple-400 to-purple-600',
    rival: 'from-orange-400 to-orange-600',
  };

  const relationshipIcons = {
    friend: '🤝',
    enemy: '⚔️',
    romance: '💕',
    family: '👨‍👩‍👧‍👦',
    mentor: '🎓',
    rival: '🏆',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span>👥</span>
          Character Relationship Map
        </h3>
        <div className="flex gap-2">
          {onCharacterAdd && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Icon name="PlusIcon" size={16} />
              Add Character
            </motion.button>
          )}
          {onRelationshipAdd && (
            <motion.button
              onClick={() => setIsAddingRelationship(!isAddingRelationship)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Icon name="LinkIcon" size={16} />
              Add Relationship
            </motion.button>
          )}
        </div>
      </div>

      {/* Character List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setSelectedCharacter(character.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedCharacter === character.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: character.color }}
              >
                {character.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground truncate">{character.name}</h4>
                <p className="text-xs text-muted-foreground mb-1">{character.role}</p>
                <p className="text-sm text-foreground line-clamp-2">{character.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Relationship Visualization */}
      {relationships.length > 0 && (
        <div className="p-6 bg-card border border-border rounded-xl">
          <h4 className="font-bold text-foreground mb-4">Relationships</h4>
          <div className="space-y-3">
            {relationships.map((rel, idx) => {
              const fromChar = characters.find((c) => c.id === rel.from);
              const toChar = characters.find((c) => c.id === rel.to);
              if (!fromChar || !toChar) return null;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: fromChar.color }}
                    >
                      {fromChar.name.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">{fromChar.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{relationshipIcons[rel.type]}</span>
                    <div
                      className={`w-16 h-1 rounded-full bg-gradient-to-r ${relationshipColors[rel.type]}`}
                      style={{ width: `${rel.strength}%` }}
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {rel.strength}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-medium text-foreground">{toChar.name}</span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: toChar.color }}
                    >
                      {toChar.name.charAt(0)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Character Details */}
      {selectedCharacter && (
        <CharacterDetails
          character={characters.find((c) => c.id === selectedCharacter)!}
          relationships={relationships.filter(
            (r) => r.from === selectedCharacter || r.to === selectedCharacter
          )}
          characters={characters}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </div>
  );
}

function CharacterDetails({
  character,
  relationships,
  characters,
  onClose,
}: {
  character: Character;
  relationships: Relationship[];
  characters: Character[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-card border border-border rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold text-foreground">{character.name}</h4>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
          <Icon name="XMarkIcon" size={20} />
        </button>
      </div>
      <p className="text-muted-foreground mb-4">{character.description}</p>
      {relationships.length > 0 && (
        <div>
          <h5 className="font-semibold text-foreground mb-2">Relationships</h5>
          <div className="space-y-2">
            {relationships.map((rel, idx) => {
              const otherChar = characters.find(
                (c) => c.id === (rel.from === character.id ? rel.to : rel.from)
              );
              if (!otherChar) return null;
              return (
                <div key={idx} className="text-sm">
                  <span className="font-medium text-foreground">{otherChar.name}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    - {rel.type} ({rel.strength}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
