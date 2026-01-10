'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { streakService } from '@/services/streakService';
import { motion } from 'framer-motion';

interface ReadingCalendarHeatmapProps {
  className?: string;
  year?: number;
}

export function ReadingCalendarHeatmap({
  className = '',
  year = new Date().getFullYear(),
}: ReadingCalendarHeatmapProps) {
  const { user } = useAuth();
  const [heatmap, setHeatmap] = useState<Map<string, number>>(new Map());
  const [selectedYear, setSelectedYear] = useState(year);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadHeatmap = async () => {
      try {
        const data = await streakService.getCalendarHeatmap(user.id, selectedYear);
        setHeatmap(data);
      } catch (error) {
        console.error('Failed to load calendar heatmap:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHeatmap();
  }, [user, selectedYear]);

  // Generate calendar grid (52 weeks × 7 days)
  const getDateForCell = (week: number, day: number): string => {
    const startDate = new Date(selectedYear, 0, 1);
    // Find the first Sunday of the year (or before)
    const firstDay = startDate.getDay();
    const daysToSubtract = firstDay === 0 ? 0 : firstDay;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const dayOfYear = week * 7 + day;
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOfYear);

    // Only return dates within the year
    if (date.getFullYear() !== selectedYear) {
      return '';
    }

    return date.toISOString().split('T')[0];
  };

  const getIntensity = (date: string): number => {
    if (!date) return -1;
    const time = heatmap.get(date) || 0;
    if (time === 0) return 0;
    if (time < 15) return 1;
    if (time < 30) return 2;
    if (time < 60) return 3;
    return 4;
  };

  const getIntensityColor = (intensity: number): string => {
    const colors = [
      'bg-gray-100 dark:bg-gray-800', // 0 - No reading
      'bg-green-200 dark:bg-green-900', // 1 - < 15 min
      'bg-green-400 dark:bg-green-700', // 2 - 15-30 min
      'bg-green-600 dark:bg-green-500', // 3 - 30-60 min
      'bg-green-800 dark:bg-green-300', // 4 - > 60 min
    ];
    return colors[intensity] || colors[0];
  };

  const getIntensityLabel = (intensity: number): string => {
    const labels = ['No reading', 'Less than 15 min', '15-30 min', '30-60 min', 'More than 60 min'];
    return labels[intensity] || labels[0];
  };

  const weeks = Array.from({ length: 53 }, (_, i) => i); // 53 weeks to cover full year
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-foreground">Reading Activity</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-foreground text-sm"
        >
          {Array.from({ length: 3 }, (_, i) => selectedYear - 1 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2 flex-shrink-0">
          {days.map((day, index) => (
            <div
              key={day}
              className="h-3 text-xs text-muted-foreground flex items-center"
              style={{ minHeight: '12px' }}
            >
              {index === 0 || index === 3 ? day : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1 flex-1 min-w-0">
          {weeks.map((week) => (
            <div key={week} className="flex flex-col gap-1 flex-shrink-0">
              {days.map((day, dayIndex) => {
                const date = getDateForCell(week, dayIndex);
                const intensity = getIntensity(date);
                const readingTime = date ? heatmap.get(date) || 0 : 0;

                if (!date) {
                  return (
                    <div
                      key={`${week}-${dayIndex}`}
                      className="w-3 h-3 rounded"
                      style={{ minWidth: '12px', minHeight: '12px' }}
                    />
                  );
                }

                return (
                  <motion.div
                    key={`${week}-${dayIndex}`}
                    className={`w-3 h-3 rounded cursor-pointer transition-all ${getIntensityColor(
                      intensity
                    )} ${hoveredDate === date ? 'ring-2 ring-blue-500 scale-110' : ''}`}
                    style={{ minWidth: '12px', minHeight: '12px' }}
                    title={
                      date ? `${new Date(date).toLocaleDateString()}: ${readingTime} minutes` : ''
                    }
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    whileHover={{ scale: 1.2 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded ${getIntensityColor(i)}`}
              title={getIntensityLabel(i)}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Hover tooltip */}
      {hoveredDate && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          <strong>{new Date(hoveredDate).toLocaleDateString()}:</strong>{' '}
          {heatmap.get(hoveredDate) || 0} minutes of reading
        </div>
      )}
    </div>
  );
}
