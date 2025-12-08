'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface QuickAccessWidgetProps {
  isPremium: boolean;
}

const QuickAccessWidget = ({ isPremium }: QuickAccessWidgetProps) => {
  const quickActions = [
    {
      id: 'library',
      label: 'Browse Library',
      icon: 'BookOpenIcon',
      href: '/story-library',
      color: 'from-primary to-secondary',
      description: 'Discover new stories',
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: 'UserIcon',
      href: '/user-profile',
      color: 'from-secondary to-purple-500',
      description: 'View your profile',
    },
    {
      id: 'social',
      label: 'Community',
      icon: 'UserGroupIcon',
      href: '/user-dashboard',
      color: 'from-accent to-warning',
      description: 'Connect with readers',
    },
    {
      id: 'premium',
      label: isPremium ? 'Premium Features' : 'Upgrade',
      icon: 'SparklesIcon',
      href: '/user-dashboard',
      color: 'from-accent to-warning',
      description: isPremium ? 'Exclusive content' : 'Unlock unlimited',
      isPremiumAction: true,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-semibold text-foreground">
          Quick Access
        </h2>
        <Icon name="BoltIcon" size={24} className="text-primary" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`group relative overflow-hidden rounded-lg p-4 border transition-smooth ${
              action.isPremiumAction && !isPremium
                ? 'border-accent/30 bg-gradient-to-br from-accent/10 to-warning/10 hover:shadow-elevation-1'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-smooth`}
              >
                <Icon
                  name={action.icon as any}
                  size={20}
                  className="text-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {action.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <Icon
                name="ChevronRightIcon"
                size={16}
                className="text-muted-foreground group-hover:text-primary transition-smooth flex-shrink-0"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessWidget;