'use client';

import { useRouter } from 'next/navigation';
import HeroSection from './HeroSection';
import LiveStatsSection from './LiveStatsSection';
import InteractiveShowcaseSection from './InteractiveShowcaseSection';
import TrendingStoriesSection from './TrendingStoriesSection';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import TrustSignalsSection from './TrustSignalsSection';
import CTASection from './CTASection';
import FooterSection from './FooterSection';

const LandingPageInteractive = () => {
  const router = useRouter();

  const handleStartReading = () => {
    router?.push('/authentication');
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onStartReading={handleStartReading} />
      <LiveStatsSection />
      <InteractiveShowcaseSection />
      <TrendingStoriesSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <TrustSignalsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default LandingPageInteractive;
