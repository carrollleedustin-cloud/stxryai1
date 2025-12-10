/**
 * Google AdSense Configuration and Utilities
 */

export const GOOGLE_ADSENSE_CONFIG = {
  // Get these from your Google AdSense account
  CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXXXXXXXXX',

  // Ad Slots for different placements
  AD_SLOTS: {
    HEADER_BANNER: process.env.NEXT_PUBLIC_ADSENSE_HEADER || '1234567890',
    FOOTER_BANNER: process.env.NEXT_PUBLIC_ADSENSE_FOOTER || '1234567891',
    SIDEBAR: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR || '1234567892',
    IN_CONTENT: process.env.NEXT_PUBLIC_ADSENSE_CONTENT || '1234567893',
    STORY_PAGE: process.env.NEXT_PUBLIC_ADSENSE_STORY || '1234567894',
  },

  // Ad Settings
  ENABLED: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true',
  TEST_MODE: process.env.NODE_ENV !== 'production',
};

/**
 * Load Google AdSense script
 */
export function loadAdSenseScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is undefined'));
      return;
    }

    // Check if already loaded
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CONFIG.CLIENT_ID}`;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load AdSense script'));

    document.head.appendChild(script);
  });
}

/**
 * Initialize AdSense
 */
export async function initializeAdSense() {
  if (!GOOGLE_ADSENSE_CONFIG.ENABLED) {
    console.log('AdSense disabled');
    return;
  }

  try {
    await loadAdSenseScript();
    console.log('AdSense initialized');
  } catch (error) {
    console.error('AdSense initialization failed:', error);
  }
}

/**
 * Check if user should see ads
 */
export function shouldShowAds(isPremium: boolean, userPreferences?: any): boolean {
  // Don't show ads to premium users
  if (isPremium) return false;

  // Don't show ads if disabled
  if (!GOOGLE_ADSENSE_CONFIG.ENABLED) return false;

  // Don't show ads in development unless testing
  if (process.env.NODE_ENV === 'development' && !GOOGLE_ADSENSE_CONFIG.TEST_MODE) {
    return false;
  }

  return true;
}

/**
 * Ad placement recommendations
 */
export const AD_PLACEMENTS = {
  HOMEPAGE: {
    header: true,
    sidebar: true,
    inContent: false,
    footer: true,
  },
  STORY_LIBRARY: {
    header: true,
    sidebar: true,
    inContent: true, // Between story cards
    footer: false,
  },
  STORY_READER: {
    header: false, // Don't distract while reading
    sidebar: false,
    inContent: true, // Between chapters
    footer: true,
  },
  DASHBOARD: {
    header: false,
    sidebar: true,
    inContent: false,
    footer: true,
  },
};

/**
 * Track ad impressions
 */
export function trackAdImpression(slotId: string, position: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ad_impression', {
      ad_slot: slotId,
      ad_position: position,
      event_category: 'advertising',
    });
  }
}

/**
 * Track ad clicks
 */
export function trackAdClick(slotId: string, position: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ad_click', {
      ad_slot: slotId,
      ad_position: position,
      event_category: 'advertising',
    });
  }
}

/**
 * Ad frequency capping
 * Prevents showing too many ads to the same user
 */
export class AdFrequencyCap {
  private static readonly STORAGE_KEY = 'ad_frequency_cap';
  private static readonly MAX_ADS_PER_SESSION = 10;
  private static readonly MAX_ADS_PER_PAGE = 3;

  static canShowAd(): boolean {
    if (typeof window === 'undefined') return false;

    const sessionData = this.getSessionData();

    // Check session limit
    if (sessionData.totalAds >= this.MAX_ADS_PER_SESSION) {
      return false;
    }

    // Check page limit
    if (sessionData.pageAds >= this.MAX_ADS_PER_PAGE) {
      return false;
    }

    return true;
  }

  static recordAdShown() {
    if (typeof window === 'undefined') return;

    const sessionData = this.getSessionData();
    sessionData.totalAds++;
    sessionData.pageAds++;

    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
  }

  static resetPageCount() {
    if (typeof window === 'undefined') return;

    const sessionData = this.getSessionData();
    sessionData.pageAds = 0;

    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
  }

  private static getSessionData(): { totalAds: number; pageAds: number } {
    if (typeof window === 'undefined') {
      return { totalAds: 0, pageAds: 0 };
    }

    const data = sessionStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : { totalAds: 0, pageAds: 0 };
  }
}
