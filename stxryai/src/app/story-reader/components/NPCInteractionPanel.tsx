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
      hostile: 'text-red-600',
      rival: 'text-orange-600',
      neutral: 'text-gray-600',
      friendly: 'text-green-600',
      mentor: 'text-blue-600',
      romantic: 'text-pink-600',
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (npcs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">No NPCs available in this story yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">Story Characters</h3>

      {/* NPC List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {npcs.map((npc) => (
          <button
            key={npc.id}
            onClick={() => setSelectedNPC(npc)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              selectedNPC?.id === npc.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <h4 className="font-semibold text-lg text-gray-900">{npc.npc_name}</h4>
            {npc.npc_role && <p className="text-sm text-gray-600 capitalize">{npc.npc_role}</p>}
            {npc.personality_traits && npc.personality_traits.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {npc.personality_traits.slice(0, 3).map((trait, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
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
        <div className="border-t pt-6 space-y-6">
          <div>
            <h4 className="font-semibold text-xl text-gray-900 mb-3">{selectedNPC.npc_name}</h4>

            {/* Relationship Status */}
            {relationshipStatus && user && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Relationship</span>
                  <span
                    className={`text-lg font-bold ${getRelationshipColor(relationshipStatus.relationshipType)}`}
                  >
                    {getRelationshipIcon(relationshipStatus.relationshipType)}{' '}
                    {relationshipStatus.relationshipType}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((relationshipStatus.cumulativeScore + 30) * 100) / 60))}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">Score: {relationshipStatus.cumulativeScore}</p>
              </div>
            )}

            {/* Revealed Traits */}
            {relationshipStatus && relationshipStatus.revealedTraits.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {selectedNPC.npc_name} knows you are:
                </p>
                <div className="flex flex-wrap gap-2">
                  {relationshipStatus.revealedTraits.map((trait, idx) => (
                    <span
                      key={idx}
                      className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
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
                <p className="text-sm font-medium text-gray-700 mb-2">Personality</p>
                <div className="flex flex-wrap gap-1">
                  {selectedNPC.personality_traits?.map((trait, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              {selectedNPC.base_dialogue_style && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Speaking Style</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedNPC.base_dialogue_style}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Memory Timeline */}
          {npcMemories.length > 0 && user && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Shared Memories</h5>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {npcMemories.map((memory, idx) => (
                  <div
                    key={memory.id || idx}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-medium text-indigo-600 capitalize">
                        {memory.memory_type}
                      </span>
                      {memory.chapter_number && (
                        <span className="text-xs text-gray-500">
                          Chapter {memory.chapter_number}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{memory.memory_content}</p>
                    {memory.relationship_delta !== 0 && (
                      <span
                        className={`text-xs font-medium ${
                          (memory.relationship_delta || 0) > 0 ? 'text-green-600' : 'text-red-600'
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
            <p className="text-sm text-gray-500 text-center py-4">
              No interactions with {selectedNPC.npc_name} yet. Your choices will shape your
              relationship.
            </p>
          )}

          {!user && (
            <p className="text-sm text-gray-500 text-center py-4">
              Sign in to track your relationships with characters
            </p>
          )}
        </div>
      )}
    </div>
  );
}
