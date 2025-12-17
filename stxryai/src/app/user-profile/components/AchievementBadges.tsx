'use client';

import Icon from '@/components/ui/AppIcon';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  totalAchievements: number;
}

const AchievementBadges = ({ achievements, totalAchievements }: AchievementBadgesProps) => {
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'from-slate-500 to-slate-600';
      case 'rare':
        return 'from-blue-500 to-blue-600';
      case 'epic':
        return 'from-purple-500 to-purple-600';
      case 'legendary':
        return 'from-amber-500 to-amber-600';
    }
  };

  const getRarityBorder = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'border-slate-500/30';
      case 'rare':
        return 'border-blue-500/30';
      case 'epic':
        return 'border-purple-500/30';
      case 'legendary':
        return 'border-amber-500/30';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="TrophyIcon" size={24} className="text-accent" />
          <h2 className="font-heading text-xl font-bold text-foreground">Achievements</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {achievements.length} / {totalAchievements}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-lg border-2 ${getRarityBorder(
              achievement.rarity
            )} bg-gradient-to-br ${getRarityColor(
              achievement.rarity
            )} bg-opacity-10 hover:scale-105 transition-smooth cursor-pointer group`}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(
                  achievement.rarity
                )} flex items-center justify-center shadow-elevation-1`}
              >
                <Icon name={achievement.icon as any} size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{achievement.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {achievement.description}
                </p>
              </div>
              {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                <div className="w-full">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getRarityColor(
                        achievement.rarity
                      )} transition-smooth`}
                      style={{
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievement.progress} / {achievement.maxProgress}
                  </p>
                </div>
              )}
              <span className="text-xs text-muted-foreground">{achievement.unlockedAt}</span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-smooth rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementBadges;
