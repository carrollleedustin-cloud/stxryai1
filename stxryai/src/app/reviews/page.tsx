'use client';

import React from 'react';
import Header from '@/components/common/Header';

const ReviewsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Latest Reviews
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This feature is coming soon!
          </p>
        </div>
      </main>
    </div>
  );
};

export default ReviewsPage;
