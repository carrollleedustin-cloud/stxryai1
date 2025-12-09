'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export default function ToastProvider() {
  const { actualTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted on client
  if (!mounted) {
    return null;
  }

  return (
    <Toaster
      theme={actualTheme}
      position="top-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'var(--color-card)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-border)'
        },
        className: 'toast-custom',
        duration: 4000
      }}
    />
  );
}
