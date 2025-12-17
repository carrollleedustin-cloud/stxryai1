'use client';

import React, { useState, useEffect } from 'react';
import { narrativeAIService } from '@/services/narrativeAIService';
import { useAuth } from '@/contexts/AuthContext';

interface DynamicPacingIndicatorProps {
  storyId: string;
  chapterId?: string;
}

export default function DynamicPacingIndicator({
  storyId,
  chapterId,
}: DynamicPacingIndicatorProps) {
  const { user } = useAuth();
  const [pacingInfo, setPacingInfo] = useState<{
    recommendedPacing: string;
    adjustmentFactor: number;
    engagementLevel: string;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user && storyId) {
      loadPacingInfo();
    }
  }, [user?.id, storyId, chapterId]);

  const loadPacingInfo = async () => {
    if (!user) return;
    const info = await narrativeAIService.getCurrentPacing(user.id, storyId, chapterId);
    setPacingInfo(info);
  };

  if (!user || !pacingInfo) {
    return null;
  }

  const getPacingColor = (pacing: string) => {
    const colors: Record<string, string> = {
      slow: 'bg-blue-500',
      balanced: 'bg-green-500',
      fast: 'bg-orange-500',
    };
    return colors[pacing] || colors.balanced;
  };

  const getEngagementColor = (level: string) => {
    const colors: Record<string, string> = {
      very_low: 'text-red-600',
      low: 'text-orange-600',
      medium: 'text-yellow-600',
      high: 'text-green-600',
      very_high: 'text-blue-600',
    };
    return colors[level] || colors.medium;
  };

  const getPacingIcon = (pacing: string) => {
    const icons: Record<string, string> = {
      slow: '🐢',
      balanced: '⚖️',
      fast: '🐆',
    };
    return icons[pacing] || icons.balanced;
  };

  const getPacingDescription = (pacing: string, factor: number) => {
    const descriptions: Record<string, string> = {
      slow: 'Rich descriptions and deeper character development ahead',
      balanced: 'A perfect mix of action and storytelling',
      fast: 'Action-packed scenes with frequent choices coming',
    };
    return descriptions[pacing] || descriptions.balanced;
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Compact View */}
      {!showDetails && (
        <button
          onClick={() => setShowDetails(true)}
          className={`${getPacingColor(pacingInfo.recommendedPacing)} text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform`}
          title="Show pacing details"
        >
          <span className="text-2xl">{getPacingIcon(pacingInfo.recommendedPacing)}</span>
        </button>
      )}

      {/* Detailed View */}
      {showDetails && (
        <div className="bg-white rounded-lg shadow-xl p-4 w-80 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Story Pacing</h4>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Pacing Status */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current Pacing</span>
              <span
                className={`${getPacingColor(pacingInfo.recommendedPacing)} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
              >
                {getPacingIcon(pacingInfo.recommendedPacing)}
                {pacingInfo.recommendedPacing}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {getPacingDescription(pacingInfo.recommendedPacing, pacingInfo.adjustmentFactor)}
            </p>
          </div>

          {/* Engagement Level */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Your Engagement</span>
              <span
                className={`${getEngagementColor(pacingInfo.engagementLevel)} font-medium text-sm capitalize`}
              >
                {pacingInfo.engagementLevel.replace('_', ' ')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${getPacingColor(pacingInfo.recommendedPacing)} h-2 rounded-full transition-all`}
                style={{ width: `${pacingInfo.adjustmentFactor * 50}%` }}
              ></div>
            </div>
          </div>

          {/* Adjustment Factor */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">AI Pacing Adjustment</p>
            <p className="text-sm font-medium text-gray-900">
              {pacingInfo.adjustmentFactor < 1.0
                ? 'Story will move faster based on your engagement'
                : pacingInfo.adjustmentFactor > 1.0
                  ? 'Story will slow down for richer details'
                  : 'Perfect pacing balance maintained'}
            </p>
          </div>

          {/* Info Note */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🤖 AI adapts the story pacing based on your reading patterns
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
