import { CSSProperties } from 'react';

export interface AdSenseProps {
  adClient: string;
  adSlot: string;
  adFormat?: string;
  adLayout?: string;
  adStyle?: CSSProperties;
}

// Extend the Window interface to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export {};