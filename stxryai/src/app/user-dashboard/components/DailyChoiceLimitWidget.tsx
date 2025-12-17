'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface DailyChoiceLimitWidgetProps {
  isPremium: boolean;
  choicesUsed: number;
  choicesLimit: number;
  resetTime: string;
}

const DailyChoiceLimitWidget = ({
  isPremium,
  choicesUsed,
  choicesLimit,
  resetTime,
}: DailyChoiceLimitWidgetProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const updateTimer = () => {
      const now = new Date();
      const reset = new Date(resetTime);
      const diff = reset.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilReset('Resetting...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [isHydrated, resetTime]);

  if (isPremium) {
    return (
      <div className="bg-gradient-to-br from-accent/20 to-warning/20 border border-accent/30 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-warning flex items-center justify-center">
            <Icon name="SparklesIcon" size={24} className="text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">Premium Active</h3>
            <p className="text-sm text-muted-foreground">Unlimited choices</p>
          </div>
        </div>
        <p className="text-sm text-foreground">
          Enjoy unlimited story choices and exclusive content as a premium member.
        </p>
      </div>
    );
  }

  const choicesRemaining = choicesLimit - choicesUsed;
  const progressPercentage = (choicesUsed / choicesLimit) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-foreground">Daily Choices</h3>
        <Icon name="ChatBubbleLeftRightIcon" size={24} className="text-primary" />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {choicesUsed} of {choicesLimit} used
          </span>
          <span className="text-sm font-semibold text-foreground">{choicesRemaining} left</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              progressPercentage >= 80
                ? 'bg-gradient-to-r from-error to-warning'
                : 'bg-gradient-to-r from-primary to-secondary'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {isHydrated && timeUntilReset && (
        <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
          <Icon name="ClockIcon" size={16} />
          <span>Resets in {timeUntilReset}</span>
        </div>
      )}

      {choicesRemaining <= 2 && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <Icon
              name="ExclamationTriangleIcon"
              size={18}
              className="text-accent flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-foreground">
              You're running low on choices! Upgrade to premium for unlimited access.
            </p>
          </div>
        </div>
      )}

      <Link
        href="/user-dashboard"
        className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-elevation-1 transition-smooth"
      >
        <Icon name="SparklesIcon" size={18} />
        <span className="font-medium">Upgrade to Premium</span>
      </Link>
    </div>
  );
};

export default DailyChoiceLimitWidget;
