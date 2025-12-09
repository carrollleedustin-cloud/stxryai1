'use client';

import { motion } from 'framer-motion';
import { slideUp, staggerContainer } from '@/lib/animations/variants';
import Icon from '@/components/ui/AppIcon';

interface ReadingData {
  date: string;
  minutesRead: number;
  storiesRead: number;
  choicesMade: number;
}

interface ReadingAnalyticsProps {
  totalMinutesRead: number;
  totalStoriesCompleted: number;
  totalChoicesMade: number;
  averageSessionLength: number;
  longestStreak: number;
  currentStreak: number;
  favoriteGenre: string;
  readingData: ReadingData[];
  topAuthors: { name: string; storiesRead: number }[];
  timeOfDayPreference: 'morning' | 'afternoon' | 'evening' | 'night';
}

export default function ReadingAnalytics({
  totalMinutesRead,
  totalStoriesCompleted,
  totalChoicesMade,
  averageSessionLength,
  longestStreak,
  currentStreak,
  favoriteGenre,
  readingData,
  topAuthors,
  timeOfDayPreference
}: ReadingAnalyticsProps) {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const getTimeOfDayEmoji = (timeOfDay: string): string => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      case 'night': return '🌙';
      default: return '📖';
    }
  };

  const getTimeOfDayLabel = (timeOfDay: string): string => {
    switch (timeOfDay) {
      case 'morning': return 'Early Bird (6AM-12PM)';
      case 'afternoon': return 'Afternoon Reader (12PM-6PM)';
      case 'evening': return 'Evening Explorer (6PM-10PM)';
      case 'night': return 'Night Owl (10PM-6AM)';
      default: return 'Reader';
    }
  };

  const mainStats = [
    {
      icon: 'ClockIcon',
      label: 'Total Time Read',
      value: formatTime(totalMinutesRead),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: 'BookOpenIcon',
      label: 'Stories Completed',
      value: totalStoriesCompleted.toString(),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: 'BoltIcon',
      label: 'Choices Made',
      value: totalChoicesMade.toLocaleString(),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: 'ChartBarIcon',
      label: 'Avg Session',
      value: formatTime(averageSessionLength),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ];

  // Calculate max value for bar chart scaling
  const maxMinutes = Math.max(...readingData.map(d => d.minutesRead), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon name="ChartBarIcon" size={28} className="text-primary" />
          Reading Analytics
        </h2>
      </div>

      {/* Main Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {mainStats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={slideUp}
            whileHover={{ scale: 1.05, y: -4 }}
            className="bg-card border border-border rounded-xl p-4 shadow-lg"
          >
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
              <Icon name={stat.icon} size={24} className={stat.color} />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Reading Activity Chart */}
      <div className="bg-card border border-border rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon name="ChartBarIcon" size={20} className="text-primary" />
          Last 7 Days Activity
        </h3>
        <div className="space-y-3">
          {readingData.slice(-7).map((data, index) => {
            const percentage = (data.minutesRead / maxMinutes) * 100;
            const date = new Date(data.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div key={data.date} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{dayName}</span>
                  <span className="text-muted-foreground">{formatTime(data.minutesRead)}</span>
                </div>
                <div className="h-8 bg-muted rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end px-2"
                  >
                    {data.minutesRead > 0 && (
                      <span className="text-xs font-bold text-white">
                        {data.storiesRead} {data.storiesRead === 1 ? 'story' : 'stories'}
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Streak Card */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="FireIcon" size={20} className="text-orange-500" />
            Reading Streak
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {currentStreak} days
                </div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl"
              >
                🔥
              </motion.div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="text-xl font-bold text-foreground mb-1">
                {longestStreak} days
              </div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
            </div>
          </div>
        </div>

        {/* Reading Preferences */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="SparklesIcon" size={20} className="text-purple-500" />
            Reading Preferences
          </h3>
          <div className="space-y-4">
            {/* Favorite Genre */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl">📚</span>
              <div>
                <div className="text-sm text-muted-foreground">Favorite Genre</div>
                <div className="font-bold text-foreground">{favoriteGenre}</div>
              </div>
            </div>

            {/* Time Preference */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl">{getTimeOfDayEmoji(timeOfDayPreference)}</span>
              <div>
                <div className="text-sm text-muted-foreground">Reading Time</div>
                <div className="font-bold text-foreground">
                  {getTimeOfDayLabel(timeOfDayPreference)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Authors */}
      {topAuthors.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="UserGroupIcon" size={20} className="text-blue-500" />
            Top Authors
          </h3>
          <div className="space-y-3">
            {topAuthors.slice(0, 5).map((author, index) => (
              <motion.div
                key={author.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-foreground">{author.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {author.storiesRead} {author.storiesRead === 1 ? 'story' : 'stories'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}