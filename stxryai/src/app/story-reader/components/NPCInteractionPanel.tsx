'use client';

import React, { useState, useEffect } from 'react';
import { narrativeAIService, type StoryNPC, type NPCMemory } from '@/services/narrativeAIService';
import { useAuth } from '@/contexts/AuthContext';

interface NPCInteractionPanelProps {
  storyId: string;
  currentChapter?: number;
}

export default function NPCInteractionPanel({ storyId, currentChapter }: NPCInteractionPanelProps) {
  const { user } = useAuth();
  const [npcs, setNpcs] = useState<StoryNPC[]>([]);
  const [selectedNPC, setSelectedNPC] = useState<StoryNPC | null>(null);
  const [npcMemories, setNpcMemories] = useState<NPCMemory[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState<{
    relationshipType: string;
    cumulativeScore: number;
    revealedTraits: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNPCs();
  }, [storyId]);

  useEffect(() => {
    if (selectedNPC && user) {
      loadNPCMemories();
      loadRelationshipStatus();
    }
  }, [selectedNPC?.id, user?.id]);

  const loadNPCs = async () => {
    setLoading(true);
    const data = await narrativeAIService.getStoryNPCs(storyId);
    setNpcs(data);
    setLoading(false);
  };

  const loadNPCMemories = async () => {
    if (!selectedNPC || !user) return;
    const memories = await narrativeAIService.getNPCMemories(selectedNPC.id!, user.id);
    setNpcMemories(memories);
  };

  const loadRelationshipStatus = async () => {
    if (!selectedNPC || !user) return;
    const status = await narrativeAIService.getNPCRelationshipStatus(selectedNPC.id!, user.id);
    setRelationshipStatus(status);
  };

  const getRelationshipColor = (type: string) => {
    const colors: Record<string, string> = {
      hostile: 'text-error',
      rival: 'text-warning',
      neutral: 'text-muted-foreground',
      friendly: 'text-success',
      mentor: 'text-secondary',
      romantic: 'text-accent',
    };
    return colors[type] || colors.neutral;
  };

  const getRelationshipIcon = (type: string) => {
    const icons: Record<string, string> = {
      hostile: '⚔️',
      rival: '🤺',
      neutral: '🤝',
      friendly: '😊',
      mentor: '🎓',
      romantic: '❤️',
    };
    return icons[type] || icons.neutral;
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-glass p-6 shadow-elevation-1">
        <div className="animate-pulse space-y-4">
          <div className="h-6 rounded bg-muted/30 w-1/3"></div>
          <div className="h-20 rounded bg-muted/20"></div>
        </div>
      </div>
    );
  }

  if (npcs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-glass p-6 shadow-elevation-1">
        <p className="text-muted-foreground text-center">
          No characters detected in this story yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-glass p-6 shadow-elevation-1 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Characters
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Who the story remembers you as.</p>
        </div>
      </div>

      {/* NPC List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {npcs.map((npc) => (
          <button
            key={npc.id}
            onClick={() => setSelectedNPC(npc)}
            className={`text-left p-4 rounded-2xl border transition-smooth ${
              selectedNPC?.id === npc.id
                ? 'border-primary/60 bg-primary/10 shadow-elevation-1'
                : 'border-border bg-background/20 hover:bg-background/35 hover:border-border/80'
            }`}
          >
            <h4 className="font-semibold text-lg text-foreground">{npc.npc_name}</h4>
            {npc.npc_role && (
              <p className="text-sm text-muted-foreground capitalize">{npc.npc_role}</p>
            )}
            {npc.personality_traits && npc.personality_traits.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {npc.personality_traits.slice(0, 3).map((trait, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-muted/20 text-muted-foreground px-2 py-1 rounded-full border border-border"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* NPC Details */}
      {selectedNPC && (
        <div className="border-t border-border/60 pt-6 space-y-6">
          <div>
            <h4 className="font-semibold text-xl text-foreground mb-3">{selectedNPC.npc_name}</h4>

            {/* Relationship Status */}
            {relationshipStatus && user && (
              <div className="rounded-2xl border border-border bg-background/25 p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground/80">Relationship</span>
                  <span
                    className={`text-lg font-bold ${getRelationshipColor(relationshipStatus.relationshipType)}`}
                  >
                    {getRelationshipIcon(relationshipStatus.relationshipType)}{' '}
                    {relationshipStatus.relationshipType}
                  </span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-smooth"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((relationshipStatus.cumulativeScore + 30) * 100) / 60))}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Score: {relationshipStatus.cumulativeScore}
                </p>
              </div>
            )}

            {/* Revealed Traits */}
            {relationshipStatus && relationshipStatus.revealedTraits.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground/80 mb-2">
                  {selectedNPC.npc_name} knows you are:
                </p>
                <div className="flex flex-wrap gap-2">
                  {relationshipStatus.revealedTraits.map((trait, idx) => (
                    <span
                      key={idx}
                      className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/30"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Personality & Knowledge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-foreground/80 mb-2">Personality</p>
                <div className="flex flex-wrap gap-1">
                  {selectedNPC.personality_traits?.map((trait, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-muted/20 text-muted-foreground px-2 py-1 rounded-full border border-border"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              {selectedNPC.base_dialogue_style && (
                <div>
                  <p className="text-sm font-medium text-foreground/80 mb-2">Speaking Style</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedNPC.base_dialogue_style}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Memory Timeline */}
          {npcMemories.length > 0 && user && (
            <div>
              <h5 className="font-medium text-foreground mb-3">Shared memories</h5>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-modern pr-2">
                {npcMemories.map((memory, idx) => (
                  <div
                    key={memory.id || idx}
                    className="bg-background/25 rounded-2xl p-3 border border-border"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-primary capitalize">
                        {memory.memory_type}
                      </span>
                      {memory.chapter_number && (
                        <span className="text-xs text-muted-foreground">
                          Chapter {memory.chapter_number}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/85">{memory.memory_content}</p>
                    {memory.relationship_delta !== 0 && (
                      <span
                        className={`text-xs font-medium ${
                          (memory.relationship_delta || 0) > 0 ? 'text-success' : 'text-error'
                        }`}
                      >
                        {(memory.relationship_delta || 0) > 0 ? '+' : ''}
                        {memory.relationship_delta}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {npcMemories.length === 0 && user && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No interactions with {selectedNPC.npc_name} yet. Your choices will shape your
              relationship.
            </p>
          )}

          {!user && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sign in to track your relationships with characters
            </p>
          )}
        </div>
      )}
    </div>
  );
}
