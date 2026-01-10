'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface Story {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  readCount: number;
  chapterCount: number;
  completionRate?: number;
  averageReadingTime?: number;
}

interface StoryComparisonProps {
  stories: Story[];
  onStorySelect?: (storyId: string) => void;
}

export function StoryComparison({ stories, onStorySelect }: StoryComparisonProps) {
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'table'>('table');

  const toggleStory = (storyId: string) => {
    setSelectedStories((prev) =>
      prev.includes(storyId) ? prev.filter((id) => id !== storyId) : [...prev, storyId]
    );
  };

  const comparisonStories = stories.filter((s) => selectedStories.includes(s.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>⚖️</span>
            Compare Stories
          </h2>
          <p className="text-muted-foreground">Select up to 3 stories to compare</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setComparisonMode('table')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              comparisonMode === 'table'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setComparisonMode('side-by-side')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              comparisonMode === 'side-by-side'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Side by Side
          </button>
        </div>
      </div>

      {/* Story Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => {
          const isSelected = selectedStories.includes(story.id);
          const canSelect = !isSelected && selectedStories.length < 3;

          return (
            <motion.div
              key={story.id}
              onClick={() => canSelect && toggleStory(story.id)}
              whileHover={canSelect ? { scale: 1.02, y: -4 } : {}}
              whileTap={canSelect ? { scale: 0.98 } : {}}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : canSelect
                    ? 'border-border hover:border-primary/50'
                    : 'border-border opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground line-clamp-2">{story.title}</h3>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Icon name="CheckIcon" size={16} className="text-primary-foreground" />
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">by {story.author}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{story.genre}</span>
                <span>⭐ {story.rating}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison View */}
      <AnimatePresence>
        {comparisonStories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
          >
            {comparisonMode === 'table' ? (
              <ComparisonTable stories={comparisonStories} onStorySelect={onStorySelect} />
            ) : (
              <SideBySideComparison stories={comparisonStories} onStorySelect={onStorySelect} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ComparisonTable({
  stories,
  onStorySelect,
}: {
  stories: Story[];
  onStorySelect?: (storyId: string) => void;
}) {
  const metrics = [
    { label: 'Rating', getValue: (s: Story) => s.rating.toFixed(1) },
    { label: 'Reads', getValue: (s: Story) => s.readCount.toLocaleString() },
    { label: 'Chapters', getValue: (s: Story) => s.chapterCount },
    { label: 'Completion Rate', getValue: (s: Story) => `${s.completionRate || 0}%` },
    { label: 'Avg. Reading Time', getValue: (s: Story) => `${s.averageReadingTime || 0} min` },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Metric</th>
              {stories.map((story) => (
                <th
                  key={story.id}
                  className="px-4 py-3 text-left font-semibold text-foreground cursor-pointer hover:text-primary"
                  onClick={() => onStorySelect?.(story.id)}
                >
                  {story.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, idx) => (
              <tr key={metric.label} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/50'}>
                <td className="px-4 py-3 font-medium text-foreground">{metric.label}</td>
                {stories.map((story) => (
                  <td key={story.id} className="px-4 py-3 text-muted-foreground">
                    {metric.getValue(story)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SideBySideComparison({
  stories,
  onStorySelect,
}: {
  stories: Story[];
  onStorySelect?: (storyId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stories.map((story) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => onStorySelect?.(story.id)}
          className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
        >
          <h3 className="text-xl font-bold text-foreground mb-4">{story.title}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rating</span>
              <span className="font-medium text-foreground">⭐ {story.rating.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reads</span>
              <span className="font-medium text-foreground">
                {story.readCount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chapters</span>
              <span className="font-medium text-foreground">{story.chapterCount}</span>
            </div>
            {story.completionRate !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium text-foreground">{story.completionRate}%</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
