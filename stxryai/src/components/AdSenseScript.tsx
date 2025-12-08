'use client';

import Script from 'next/script';
import React, { useEffect, useState } from 'react';

const AdSenseScript: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until client-side mount to prevent hydration issues
  if (!isMounted || !adsenseClient) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default AdSenseScript;