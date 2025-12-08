'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdSense from './AdSense';

interface FreeUserAdProps {
  slotId: string;
  format?: string;
  className?: string;
}

const FreeUserAd: React.FC<FreeUserAdProps> = ({ slotId, format = 'auto', className = '' }) => {
  const { user } = useAuth();
  const [shouldShowAd, setShouldShowAd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscriptionTier = async () => {
      try {
        // Only show ads for free tier users
        if (user?.subscription_tier === 'free') {
          setShouldShowAd(true);
        } else {
          setShouldShowAd(false);
        }
      } catch (error) {
        console.error('Error checking subscription tier:', error);
        // Default to showing ad if error occurs
        setShouldShowAd(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      checkSubscriptionTier();
    } else {
      // Show ads for non-authenticated users
      setShouldShowAd(true);
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!shouldShowAd) {
    return null;
  }

  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (!adsenseClient) {
    console.warn('AdSense client ID not configured');
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
      <AdSense
        adClient={adsenseClient}
        adSlot={slotId}
        adFormat={format}
        adStyle={{ display: 'block' }}
      />
    </div>
  );
};

export default FreeUserAd;