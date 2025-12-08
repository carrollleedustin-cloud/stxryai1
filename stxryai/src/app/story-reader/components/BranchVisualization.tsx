'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface StoryNode {
  id: string;
  sceneNumber: number;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  branches: string[];
  impact: 'low' | 'medium' | 'high';
}

interface BranchVisualizationProps {
  storyNodes: StoryNode[];
  currentNodeId: string;
  isPremium: boolean;
  onNodeClick?: (nodeId: string) => void;
}

const BranchVisualization = ({
  storyNodes,
  currentNodeId,
  isPremium,
  onNodeClick,
}: BranchVisualizationProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getImpactColor = (impact: StoryNode['impact']) => {
    switch (impact) {
      case 'high':
        return 'border-error bg-error/20';
      case 'medium':
        return 'border-warning bg-warning/20';
      case 'low':
        return 'border-primary bg-primary/20';
    }
  };

  if (!isHydrated) {
    return null;
  }

  if (!isPremium) {
    return (
      <div className="relative group">
        <button
          disabled
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-muted/50 border border-border opacity-50 cursor-not-allowed"
        >
          <Icon name="MapIcon" size={18} />
          <span className="text-sm font-medium">Story Map</span>
          <Icon name="LockClosedIcon" size={16} />
        </button>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
          <div className="bg-card border border-border rounded-lg shadow-elevation-2 px-3 py-2 whitespace-nowrap">
            <p className="text-xs text-muted-foreground">Premium feature</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/30 transition-smooth"
      >
        <Icon name="MapIcon" size={18} className="text-accent" />
        <span className="text-sm font-medium text-accent">Story Map</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[290]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-4 md:inset-8 z-[300] bg-card/95 backdrop-blur-glass border border-border rounded-lg shadow-elevation-2 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon name="MapIcon" size={24} className="text-primary" />
                  <div>
                    <h2 className="text-xl font-heading font-bold text-foreground">
                      Story Branch Map
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Visualize your narrative journey
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-smooth"
                >
                  <Icon name="XMarkIcon" size={24} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-8">
              <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                  {storyNodes.map((node, index) => (
                    <div key={node.id} className="relative">
                      {index > 0 && (
                        <div className="absolute left-6 -top-8 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-transparent" />
                      )}

                      <div
                        className={`relative flex items-start space-x-4 p-4 rounded-lg border-2 transition-smooth ${
                          node.isCurrent
                            ? 'border-accent bg-accent/10 shadow-elevation-1'
                            : node.isCompleted
                            ? 'border-primary/30 bg-primary/5' :'border-border bg-card/50'
                        } ${onNodeClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                        onClick={() => onNodeClick?.(node.id)}
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${getImpactColor(
                            node.impact
                          )}`}
                        >
                          {node.isCompleted ? (
                            <Icon name="CheckIcon" size={20} className="text-success" />
                          ) : node.isCurrent ? (
                            <Icon name="MapPinIcon" size={20} className="text-accent" />
                          ) : (
                            <span className="text-sm font-bold text-foreground">
                              {node.sceneNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-base font-semibold text-foreground">
                              {node.title}
                            </h3>
                            {node.isCurrent && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-accent/20 text-accent rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Scene {node.sceneNumber}
                          </p>
                          {node.branches.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <Icon
                                name="ArrowsRightLeftIcon"
                                size={14}
                                className="text-muted-foreground"
                              />
                              <span className="text-xs text-muted-foreground">
                                {node.branches.length} branch
                                {node.branches.length !== 1 ? 'es' : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              node.impact === 'high' ?'bg-error/20 text-error'
                                : node.impact === 'medium' ?'bg-warning/20 text-warning' :'bg-primary/20 text-primary'
                            }`}
                          >
                            {node.impact} impact
                          </span>
                        </div>
                      </div>

                      {node.branches.length > 1 && (
                        <div className="ml-6 mt-4 space-y-2">
                          {node.branches.map((branch, branchIndex) => (
                            <div
                              key={branchIndex}
                              className="flex items-center space-x-2 text-sm text-muted-foreground"
                            >
                              <div className="w-4 h-0.5 bg-primary/30" />
                              <Icon name="ArrowRightIcon" size={14} />
                              <span>Branch {branchIndex + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                  <span className="text-muted-foreground">Low Impact</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-warning/20 border-2 border-warning" />
                  <span className="text-muted-foreground">Medium Impact</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-error/20 border-2 border-error" />
                  <span className="text-muted-foreground">High Impact</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BranchVisualization;