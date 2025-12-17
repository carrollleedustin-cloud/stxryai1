'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface UserAccountMenuProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
    isPremium?: boolean;
  };
  notificationCount?: number;
  onLogout?: () => void;
}

const UserAccountMenu = ({ user, notificationCount = 0, onLogout }: UserAccountMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout?.();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-2 border-primary/20">
              <span className="text-base font-semibold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center text-xs font-bold text-error-foreground shadow-elevation-1 animate-pulse">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground">{user.name}</span>
            {user.isPremium && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-accent/20 text-accent rounded-full border border-accent/30">
                Premium
              </span>
            )}
          </div>
          {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
        </div>
        <Icon
          name="ChevronDownIcon"
          size={16}
          className={`text-muted-foreground transition-smooth ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[190]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-card/95 backdrop-blur-glass border border-border rounded-lg shadow-elevation-2 z-[200] overflow-hidden">
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-2 border-primary/30">
                    <span className="text-lg font-semibold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    {user.isPremium && (
                      <Icon name="SparklesIcon" size={16} className="text-accent flex-shrink-0" />
                    )}
                  </div>
                  {user.email && (
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="py-2">
              <Link
                href="/user-profile"
                className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-smooth"
                onClick={() => setIsOpen(false)}
              >
                <Icon name="UserIcon" size={18} />
                <div className="flex-1">
                  <span className="font-medium">My Profile</span>
                  <p className="text-xs text-muted-foreground">View and edit profile</p>
                </div>
              </Link>

              <Link
                href="/user-dashboard"
                className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-smooth"
                onClick={() => setIsOpen(false)}
              >
                <Icon name="ChartBarIcon" size={18} />
                <div className="flex-1">
                  <span className="font-medium">Reading Stats</span>
                  <p className="text-xs text-muted-foreground">Track your progress</p>
                </div>
              </Link>

              <Link
                href="/user-dashboard"
                className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-smooth"
                onClick={() => setIsOpen(false)}
              >
                <Icon name="Cog6ToothIcon" size={18} />
                <div className="flex-1">
                  <span className="font-medium">Settings</span>
                  <p className="text-xs text-muted-foreground">Preferences and privacy</p>
                </div>
              </Link>

              {!user.isPremium && (
                <>
                  <div className="border-t border-border my-2" />
                  <Link
                    href="/user-dashboard"
                    className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-accent/10 transition-smooth bg-gradient-to-r from-accent/5 to-transparent"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon name="SparklesIcon" size={18} className="text-accent" />
                    <div className="flex-1">
                      <span className="font-semibold text-accent">Upgrade to Premium</span>
                      <p className="text-xs text-muted-foreground">Unlock exclusive features</p>
                    </div>
                    <Icon name="ArrowRightIcon" size={16} className="text-accent" />
                  </Link>
                </>
              )}

              <div className="border-t border-border my-2" />

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-sm text-error hover:bg-error/10 transition-smooth w-full text-left"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={18} />
                <div className="flex-1">
                  <span className="font-medium">Logout</span>
                  <p className="text-xs text-muted-foreground">Sign out of your account</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserAccountMenu;
