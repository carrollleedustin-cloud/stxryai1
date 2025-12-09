'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface DayActivity {
  date: string;
  count: number;
  minutesRead: number;
}

interface ActivityHeatmapProps {
  activities: DayActivity[];
  year?: number;
  showLegend?: boolean;
}

export default function ActivityHeatmap({
  activities,
  year = new Date().getFullYear(),
  showLegend = true
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  // Create a map for quick lookup
  const activityMap = new Map(activities.map(a => [a.date, a]));

  // Generate all weeks of the year
  const weeks: DayActivity[][] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  let currentDate = new Date(startDate);
  let currentWeek: DayActivity[] = [];

  // Pad to start on Sunday
  const startDay = currentDate.getDay();
  for (let i = 0; i < startDay; i++) {
    currentWeek.push({ date: '', count: 0, minutesRead: 0 });
  }

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const activity = activityMap.get(dateStr) || { date: dateStr, count: 0, minutesRead: 0 };
    currentWeek.push(activity);

    if (currentDate.getDay() === 6) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', count: 0, minutesRead: 0 });
    }
    weeks.push(currentWeek);
  }

  // Calculate intensity levels
  const maxCount = Math.max(...activities.map(a => a.count), 1);

  const getIntensityColor = (count: number): string => {
    if (count === 0) return 'bg-muted';
    const intensity = count / maxCount;
    if (intensity > 0.75) return 'bg-green-600';
    if (intensity > 0.5) return 'bg-green-500';
    if (intensity > 0.25) return 'bg-green-400';
    return 'bg-green-300';
  };

  const handleMouseEnter = (day: DayActivity, e: React.MouseEvent) => {
    if (day.date) {
      setHoveredDay(day);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setHoveredPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const totalDaysActive = activities.filter(a => a.count > 0).length;
  const totalMinutes = activities.reduce((sum, a) => sum + a.minutesRead, 0);

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Icon name="CalendarIcon" size={20} className="text-primary" />
            Activity Heatmap - {year}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {totalDaysActive} days active • {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m total
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month Labels */}
          <div className="flex gap-0.5 mb-2 ml-8">
            {months.map((month, idx) => (
              <div
                key={month}
                className="text-xs text-muted-foreground"
                style={{ width: `${(weeks.length / 12) * 12}px`, textAlign: 'center' }}
              >
                {idx % 2 === 0 ? month : ''}
              </div>
            ))}
          </div>

          {/* Days and Cells */}
          <div className="flex gap-2">
            {/* Day Labels */}
            <div className="flex flex-col gap-0.5">
              {days.map((day, idx) => (
                <div
                  key={day}
                  className="h-3 flex items-center text-xs text-muted-foreground"
                >
                  {idx % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.map((day, dayIdx) => (
                    <motion.div
                      key={`${weekIdx}-${dayIdx}`}
                      whileHover={day.date ? { scale: 1.5 } : {}}
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseLeave={handleMouseLeave}
                      className={`w-3 h-3 rounded-sm transition-colors ${
                        day.date ? getIntensityColor(day.count) : 'bg-transparent'
                      } ${day.date ? 'cursor-pointer' : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex items-center gap-2 mt-6 justify-end">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-green-300" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-green-600" />
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      )}

      {/* Tooltip */}
      {hoveredDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            position: 'fixed',
            left: hoveredPosition.x,
            top: hoveredPosition.y - 80,
            transform: 'translateX(-50%)',
            zIndex: 100
          }}
          className="px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl pointer-events-none"
        >
          <div className="font-semibold">{formatDate(hoveredDay.date)}</div>
          <div className="text-xs opacity-90">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'}
            {hoveredDay.minutesRead > 0 && ` • ${Math.floor(hoveredDay.minutesRead)}m read`}
          </div>
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgb(17, 24, 39)'
            }}
          />
        </motion.div>
      )}
    </div>
  );
}