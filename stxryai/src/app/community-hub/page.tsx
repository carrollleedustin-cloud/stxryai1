'use client';

import React from 'react';
import Header from '@/components/common/Header';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const CommunityHubPage: React.FC = () => {
  const communityLinks = [
    {
      title: 'Discussion Forums',
      description: 'Join conversations about your favorite stories, genres, and characters.',
      href: '/forums',
      icon: 'ChatBubbleLeftRightIcon'
    },
    {
      title: 'Leaderboards',
      description: 'See who is leading the charts in reading streaks, achievements, and more.',
      href: '/leaderboards',
      icon: 'TrophyIcon'
    },
    {
      title: 'Reading Clubs',
      description: 'Find or create a club with readers who share your interests.',
      href: '/clubs',
      icon: 'UserGroupIcon'
    },
    {
      title: 'Latest Reviews',
      description: 'Read what others are saying about the latest stories.',
      href: '/reviews',
      icon: 'StarIcon'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Community Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow readers, share your experiences, and discover new stories together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {communityLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name={link.icon} size={32} className="text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">{link.title}</h2>
                <p className="text-muted-foreground">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CommunityHubPage;
