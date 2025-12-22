import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '@/styles/index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AdSenseScript from '@/components/AdSenseScript';
import ToastProvider from '@/components/ui/Toast';
import CommandPalette from '@/components/ui/CommandPalette';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import CustomCursor from '@/components/futuristic/CustomCursor';
import { defaultMetadata } from './metadata';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AdSenseScript />
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider />
            <CommandPalette />
            <CustomCursor />
            <MobileNavigation />
            {children}
          </ThemeProvider>
        </AuthProvider>

        <script
          type="module"
          async
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fstxryai2284back.builtwithrocket.new&_be=https%3A%2F%2Fapplication.rocket.new&_v=0.1.10"
        />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.1" />
      </body>
    </html>
  );
}
