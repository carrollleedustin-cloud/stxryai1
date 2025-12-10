'use client';

/**
 * Banner Ad Component
 * Displays banner advertisements for free users
 * Supports Google AdSense and custom banner ads
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type BannerSize = 'leaderboard' | 'medium-rectangle' | 'large-rectangle' | 'mobile-banner' | 'wide-skyscraper';
export type BannerPosition = 'top' | 'bottom' | 'sidebar' | 'inline';

interface BannerAdProps {
  size?: BannerSize;
  position?: BannerPosition;
  adSlot?: string; // Google AdSense ad slot ID
  adClient?: string; // Google AdSense client ID
  showCloseButton?: boolean;
  isPremium?: boolean; // Don't show ads if user is premium
  customBanner?: {
    imageUrl: string;
    linkUrl: string;
    altText: string;
  };
  className?: string;
}

const bannerDimensions: Record<BannerSize, { width: number; height: number }> = {
  'leaderboard': { width: 728, height: 90 },
  'medium-rectangle': { width: 300, height: 250 },
  'large-rectangle': { width: 336, height: 280 },
  'mobile-banner': { width: 320, height: 50 },
  'wide-skyscraper': { width: 160, height: 600 }
};

export default function BannerAd({
  size = 'leaderboard',
  position = 'top',
  adSlot,
  adClient,
  showCloseButton = false,
  isPremium = false,
  customBanner,
  className = ''
}: BannerAdProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  const dimensions = bannerDimensions[size];

  // Don't render ads for premium users
  if (isPremium) {
    return null;
  }

  // Don't render if closed
  if (!isVisible) {
    return null;
  }

  useEffect(() => {
    // Load Google AdSense if configured
    if (adClient && adSlot && !customBanner) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoaded(true);
      } catch (error) {
        console.error('AdSense error:', error);
      }
    } else if (customBanner) {
      setIsLoaded(true);
    }
  }, [adClient, adSlot, customBanner]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const positionClasses: Record<BannerPosition, string> = {
    top: 'sticky top-0 z-40',
    bottom: 'sticky bottom-0 z-40',
    sidebar: '',
    inline: 'my-4'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          className={`${positionClasses[position]} ${className}`}
        >
          <div className="bg-muted/50 border-b border-border backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <div className="flex items-center justify-center gap-4">
                {/* Close Button */}
                {showCloseButton && (
                  <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close ad"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Ad Container */}
                <div
                  ref={adRef}
                  className="flex items-center justify-center"
                  style={{
                    minWidth: dimensions.width,
                    minHeight: dimensions.height
                  }}
                >
                  {customBanner ? (
                    // Custom Banner
                    <a
                      href={customBanner.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="block hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={customBanner.imageUrl}
                        alt={customBanner.altText}
                        width={dimensions.width}
                        height={dimensions.height}
                        className="rounded-lg"
                      />
                    </a>
                  ) : adClient && adSlot ? (
                    // Google AdSense
                    <ins
                      className="adsbygoogle"
                      style={{
                        display: 'inline-block',
                        width: dimensions.width,
                        height: dimensions.height
                      }}
                      data-ad-client={adClient}
                      data-ad-slot={adSlot}
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    />
                  ) : (
                    // Placeholder for premium upgrade CTA
                    <UpgradeBanner size={size} />
                  )}
                </div>

                {/* Ad Label */}
                <span className="text-xs text-muted-foreground">
                  Ad
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Upgrade CTA Banner (shown when no ad is configured)
 */
function UpgradeBanner({ size }: { size: BannerSize }) {
  const dimensions = bannerDimensions[size];

  return (
    <div
      className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-lg flex items-center justify-center p-4"
      style={{
        width: dimensions.width,
        height: dimensions.height
      }}
    >
      <div className="text-center">
        <h3 className="font-bold text-foreground mb-2">Remove Ads</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Upgrade to Premium for just $5/month
        </p>
        <a
          href="/premium"
          className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Go Premium
        </a>
      </div>
    </div>
  );
}

/**
 * Responsive Banner Ad
 * Automatically adjusts size based on screen width
 */
export function ResponsiveBannerAd(props: Omit<BannerAdProps, 'size'>) {
  const [size, setSize] = useState<BannerSize>('leaderboard');

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setSize('mobile-banner');
      } else if (width < 1024) {
        setSize('medium-rectangle');
      } else {
        setSize('leaderboard');
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return <BannerAd {...props} size={size} />;
}

/**
 * In-Content Ad
 * Automatically inserts between content sections
 */
export function InContentAd(props: Omit<BannerAdProps, 'position'>) {
  return (
    <div className="my-8">
      <BannerAd {...props} position="inline" size="medium-rectangle" />
    </div>
  );
}

/**
 * Sidebar Ad
 * Sticky ad for sidebars
 */
export function SidebarAd(props: Omit<BannerAdProps, 'position' | 'size'>) {
  return (
    <div className="sticky top-20">
      <BannerAd {...props} position="sidebar" size="medium-rectangle" />
    </div>
  );
}
