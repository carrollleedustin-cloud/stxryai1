'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { AdSenseProps } from '@/types/adsense';

const AdSense: React.FC<AdSenseProps> = ({ 
  adClient, 
  adSlot, 
  adFormat = 'auto', 
  adLayout, 
  adStyle = {}
}) => {
  const adRef = useRef<HTMLInsElement>(null);
  const [isAdInitialized, setIsAdInitialized] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique ID for this ad instance to prevent conflicts
  const adInstanceId = useMemo(
    () => `ads-${adSlot}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    [adSlot]
  );

  const checkElementDimensions = useCallback((): boolean => {
    if (!adRef.current) return false;
    
    const rect = adRef.current.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(adRef.current);
    const hasWidth = rect.width > 0 || parseFloat(computedStyle.width) > 0;
    const isVisible = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
    
    return hasWidth && isVisible;
  }, []);

  const cleanupTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  const initializeAd = useCallback((): void => {
    // Prevent multiple simultaneous initialization attempts
    if (isProcessing || isAdInitialized || hasError || !adRef?.current) {
      return;
    }

    // Check if AdSense script is available
    if (!window?.adsbygoogle) {
      console.warn('AdSense: Script not yet available');
      return;
    }

    const adElement = adRef.current;

    // Check if this specific element already has been processed by AdSense
    const hasExistingAd = 
      adElement?.getAttribute('data-adsbygoogle-status') || 
      adElement?.hasAttribute('data-ad-initialized') ||
      adElement?.querySelector('iframe'); // Check for iframe which indicates ad is loaded

    if (hasExistingAd) {
      console.log(`AdSense: Ad already exists for instance ${adInstanceId}`);
      setIsAdInitialized(true);
      return;
    }

    // Check element dimensions
    if (!checkElementDimensions()) {
      console.warn(`AdSense: Element ${adInstanceId} does not have proper dimensions`);
      setHasError(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Mark element as being initialized to prevent duplicates
      adElement.setAttribute('data-ad-initialized', 'true');
      adElement.setAttribute('data-ad-instance-id', adInstanceId);

      // Use IntersectionObserver for better performance and avoiding race conditions
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target === adElement && !isAdInitialized) {
              observerRef.current?.disconnect();
              
              try {
                // Double check that the element hasn't been processed yet
                const currentStatus = adElement.getAttribute('data-adsbygoogle-status');
                if (currentStatus && currentStatus !== 'none') {
                  console.log(`AdSense: Element ${adInstanceId} already processed with status: ${currentStatus}`);
                  setIsAdInitialized(true);
                  setIsProcessing(false);
                  return;
                }

                // Initialize the ad
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                setIsAdInitialized(true);
                setIsProcessing(false);
                setHasError(false);
                console.log(`AdSense: Successfully initialized ad instance ${adInstanceId}`);
              } catch (pushError) {
                console.error(`AdSense push error for instance ${adInstanceId}:`, pushError);
                setHasError(true);
                setIsProcessing(false);
                // Remove the initialization flag if failed
                adElement.removeAttribute('data-ad-initialized');
              }
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      );

      observerRef.current.observe(adElement);
    } catch (error) {
      console.error(`AdSense initialization error for instance ${adInstanceId}:`, error);
      setHasError(true);
      setIsProcessing(false);
      adElement.removeAttribute('data-ad-initialized');
    }
  }, [isProcessing, isAdInitialized, hasError, checkElementDimensions, adInstanceId]);

  useEffect(() => {
    // Cleanup any existing timers/observers
    cleanupTimers();

    // Wait for component to be properly mounted
    timeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined') {
        if (window.adsbygoogle) {
          initializeAd();
        } else {
          // Wait for AdSense script to load with timeout
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds max wait
          
          intervalRef.current = setInterval(() => {
            attempts++;
            if (window.adsbygoogle) {
              cleanupTimers();
              initializeAd();
            } else if (attempts >= maxAttempts) {
              console.error(`AdSense: Script failed to load within timeout for instance ${adInstanceId}`);
              cleanupTimers();
              setHasError(true);
            }
          }, 100);
        }
      }
    }, 100); // Reduced delay for better responsiveness

    return cleanupTimers;
  }, [initializeAd, cleanupTimers, adInstanceId]);

  // Reset state when key props change
  useEffect(() => {
    setIsAdInitialized(false);
    setHasError(false);
    setIsProcessing(false);
    cleanupTimers();
  }, [adSlot, adClient, cleanupTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, [cleanupTimers]);

  if (hasError) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <div className="text-gray-500 text-sm">Advertisement</div>
        <div className="text-xs text-gray-400 mt-1">Ad space temporarily unavailable</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100px] flex items-center justify-center">
      <ins
        ref={adRef}
        className="adsbygoogle block w-full"
        style={{ 
          display: 'block', 
          minHeight: '100px',
          minWidth: '300px',
          ...adStyle
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
        data-ad-instance-id={adInstanceId}
      />
    </div>
  );
};

export default AdSense;