'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ReadingStatsPanelProps {
  stats: {
    storiesCompleted: number;
    choicesMade: number;
    readingStreak: number;
    totalReadingTime: number;
    achievements: Array<{
      id: string;
      name: string;
      icon: string;
      progress: number;
      total: number;
      unlocked: boolean;
    }>;
  };
}

const ReadingStatsPanel = ({ stats }: ReadingStatsPanelProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const formatReadingTime = (minutes: number): string => {
    if (!isHydrated) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-semibold text-foreground">Reading Statistics</h2>
        <Icon name="ChartBarIcon" size={24} className="text-primary" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="BookOpenIcon" size={20} className="text-primary" />
            <span className="text-sm text-muted-foreground">Stories</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.storiesCompleted}</p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-warning/10 rounded-lg p-4 border border-accent/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-accent" />
            <span className="text-sm text-muted-foreground">Choices</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.choicesMade}</p>
        </div>

        <div className="bg-gradient-to-br from-success/10 to-emerald-500/10 rounded-lg p-4 border border-success/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="FireIcon" size={20} className="text-success" />
            <span className="text-sm text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.readingStreak} days</p>
        </div>

        <div className="bg-gradient-to-br from-secondary/10 to-purple-500/10 rounded-lg p-4 border border-secondary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="ClockIcon" size={20} className="text-secondary" />
            <span className="text-sm text-muted-foreground">Time</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatReadingTime(stats.totalReadingTime)}
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {stats.achievements.slice(0, 3).map((achievement) => (
            <div key={achievement.id} className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achievement.unlocked ? 'bg-gradient-to-br from-accent to-warning' : 'bg-muted'
                }`}
              >
                <Icon
                  name={achievement.icon as any}
                  size={20}
                  className={
                    achievement.unlocked ? 'text-accent-foreground' : 'text-muted-foreground'
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{achievement.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{
                        width: `${(achievement.progress / achievement.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {achievement.progress}/{achievement.total}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadingStatsPanel;
