'use client';

import { Toaster } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export default function ToastProvider() {
  const { actualTheme } = useTheme();

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
