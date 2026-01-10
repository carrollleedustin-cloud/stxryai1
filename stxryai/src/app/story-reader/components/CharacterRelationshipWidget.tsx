'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, MessageSquare, Info } from 'lucide-react';

export interface CharacterRelationship {
  id: string;
  name: string;
  avatar?: string;
  dynamic: string;
  affinity: number; // 0-100
  status:
    | 'Stranger'
    | 'Acquaintance'
    | 'Friend'
    | 'Ally'
    | 'Confidant'
    | 'Soulmate'
    | 'Rival'
    | 'Enemy';
  lastEncounter: string;
}

interface CharacterRelationshipWidgetProps {
  characters: CharacterRelationship[];
  theme?: 'void' | 'sepia' | 'light';
}

export function CharacterRelationshipWidget({
  characters,
  theme = 'void',
}: CharacterRelationshipWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Soulmate':
        return 'text-pink-500';
      case 'Ally':
        return 'text-blue-500';
      case 'Enemy':
        return 'text-red-500';
      case 'Rival':
        return 'text-orange-500';
      default:
        return 'text-spectral-cyan';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-sm font-ui tracking-widest uppercase flex items-center gap-2 ${theme === 'light' ? 'text-[#6b4423]/60' : 'text-text-ghost'}`}
        >
          <Users size={16} />
          Key Relationships
        </h3>
      </div>

      <div className="grid gap-3">
        {characters.map((char) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border transition-all ${
              theme === 'light'
                ? 'bg-[#f0ebe0] border-[#6b4423]/10'
                : 'bg-void-elevated border-membrane'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-membrane overflow-hidden">
                {char.avatar ? (
                  <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-literary">{char.name[0]}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-foreground truncate">{char.name}</h4>
                  <span
                    className={`text-[10px] font-bold uppercase ${getStatusColor(char.status)}`}
                  >
                    {char.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-1 italic">
                  "{char.dynamic}"
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Heart
                        size={10}
                        className={char.affinity > 50 ? 'text-red-500' : 'text-gray-400'}
                      />
                      Affinity
                    </span>
                    <span className="text-foreground font-mono">{char.affinity}%</span>
                  </div>
                  <div className="h-1 w-full bg-background rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${char.affinity}%` }}
                      className={`h-full bg-gradient-to-r from-primary to-secondary`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {characters.length === 0 && (
          <div className="text-center py-8 opacity-40 italic text-sm">
            No significant relationships developed yet.
          </div>
        )}
      </div>
    </div>
  );
}
