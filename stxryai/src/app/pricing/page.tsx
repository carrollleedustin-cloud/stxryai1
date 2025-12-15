'use client';

import React from 'react';
import Header from '@/components/common/Header';
import PricingSection from '@/app/components/landing/PricingSection';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PricingSection />
      </main>
    </div>
  );
};

export default PricingPage;
