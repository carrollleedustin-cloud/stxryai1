'use client';

import React, { useState, useEffect } from 'react';
import { narrativeAIService } from '@/services/narrativeAIService';
import { useAuth } from '@/contexts/AuthContext';
import { PrismPanel } from '@/components/ui/prism/PrismPanel';

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
      slow: 'bg-secondary',
      balanced: 'bg-success',
      fast: 'bg-warning',
    };
    return colors[pacing] || colors.balanced;
  };

  const getEngagementColor = (level: string) => {
    const colors: Record<string, string> = {
      very_low: 'text-error',
      low: 'text-warning',
      medium: 'text-accent',
      high: 'text-success',
      very_high: 'text-secondary',
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
    <PrismPanel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-heading text-lg font-bold tracking-tight text-foreground">Pacing</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {getPacingDescription(pacingInfo.recommendedPacing, pacingInfo.adjustmentFactor)}
          </p>
        </div>
        <button
          onClick={() => setShowDetails((s) => !s)}
          className="rounded-full border border-border bg-background/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-background/50 transition-smooth"
          aria-expanded={showDetails}
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Current</span>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white ${getPacingColor(
            pacingInfo.recommendedPacing
          )}`}
        >
          <span aria-hidden="true">{getPacingIcon(pacingInfo.recommendedPacing)}</span>
          <span className="capitalize">{pacingInfo.recommendedPacing}</span>
        </span>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Engagement</span>
              <span className={`${getEngagementColor(pacingInfo.engagementLevel)} text-sm font-semibold capitalize`}>
                {pacingInfo.engagementLevel.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted/30 overflow-hidden">
              <div
                className={`h-full rounded-full ${getPacingColor(pacingInfo.recommendedPacing)} transition-smooth`}
                style={{ width: `${Math.min(100, pacingInfo.adjustmentFactor * 50)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/25 p-3">
            <p className="text-xs font-semibold text-muted-foreground">AI adjustment</p>
            <p className="mt-1 text-sm text-foreground/85">
              {pacingInfo.adjustmentFactor < 1.0
                ? 'The story will quicken—more momentum, tighter cuts.'
                : pacingInfo.adjustmentFactor > 1.0
                  ? 'The story will linger—richer texture, longer beats.'
                  : 'Balance is stable—no correction needed.'}
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground">
            🤖 AI adapts pacing from your reading patterns and choices.
          </p>
        </div>
      )}
    </PrismPanel>
  );
}
