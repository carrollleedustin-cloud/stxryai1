import type { Metadata } from 'next';
import '@/styles/tailwind.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ToastProvider from '@/components/ui/Toast';
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
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
