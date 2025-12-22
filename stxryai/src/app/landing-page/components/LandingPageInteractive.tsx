'use client';

import { useRouter } from 'next/navigation';
import SentientHero from '@/app/components/landing/SentientHero';
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
    router?.push('/authentication?mode=signup');
  };

  const handleSignIn = () => {
    router?.push('/authentication?mode=login');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--void-black)' }}>
      <SentientHero />
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
