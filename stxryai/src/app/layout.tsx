import type { Metadata } from 'next';
import React from 'react';
import '@/styles/tailwind.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PetProvider } from '@/contexts/PetContext';
import ToastProvider from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { PetPanel, EvolutionCelebration } from '@/components/pet';
import { defaultMetadata } from './metadata';

/**
 * ROOT LAYOUT
 * The foundation upon which all pages rest.
 * Minimal providers, maximum performance.
 */
export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to font sources for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-ui antialiased bg-void-absolute text-text-primary min-h-screen">
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <PetProvider>
                <ToastProvider />
                {children}
                {/* Global Pet Companion Panel */}
                <PetPanel position="bottom-right" />
                {/* Evolution Celebration Modal */}
                <EvolutionCelebration />
              </PetProvider>
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
