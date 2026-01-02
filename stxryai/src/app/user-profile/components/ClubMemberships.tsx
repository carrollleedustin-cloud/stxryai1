'use client';

import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

interface Club {
  id: string;
  name: string;
  description: string;
  logo: string;
  memberCount: number;
  role: 'member' | 'moderator' | 'admin';
  joinedDate: string;
  activityLevel: number;
}

interface ClubMembershipsProps {
  clubs: Club[];
}

const ClubMemberships = ({ clubs }: ClubMembershipsProps) => {
  const getRoleBadge = (role: Club['role']) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-accent/20 text-accent rounded-full border border-accent/30">
            Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-secondary/20 text-secondary rounded-full border border-secondary/30">
            Moderator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="UserGroupIcon" size={24} className="text-accent" />
          <h2 className="font-heading text-xl font-bold text-foreground">Club Memberships</h2>
          <span className="px-2 py-1 text-xs font-semibold bg-accent/20 text-accent rounded-full">
            {clubs.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.id}`}
            className="flex items-start space-x-4 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-smooth group"
          >
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
              <AppImage
                src={club.logo}
                alt={`Logo for ${club.name} reading club with book themed design`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-smooth">
                  {club.name}
                </h3>
                {getRoleBadge(club.role)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{club.description}</p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="UsersIcon" size={14} />
                  <span>{club.memberCount.toLocaleString()} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-full ${
                          i < club.activityLevel ? 'bg-success' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">Activity</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">Joined {club.joinedDate}</p>
            </div>

            <Icon
              name="ChevronRightIcon"
              size={20}
              className="text-muted-foreground group-hover:text-primary transition-smooth flex-shrink-0"
            />
          </Link>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className="text-center py-8">
          <Icon name="UserGroupIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            You haven&apos;t joined any clubs yet
          </p>
          <Link
            href="/community-hub"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-smooth"
          >
            <Icon name="PlusIcon" size={18} />
            <span className="font-medium">Explore Clubs</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ClubMemberships;
