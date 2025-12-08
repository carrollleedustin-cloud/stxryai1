import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AdSenseScript from "@/components/AdSenseScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StxryAI - Interactive Fiction Platform",
  description: "Create and experience AI-powered interactive stories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AdSenseScript />
        <AuthProvider>
          {children}
        </AuthProvider>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fstxryai2284back.builtwithrocket.new&_be=https%3A%2F%2Fapplication.rocket.new&_v=0.1.10" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.1" /></body>
    </html>
  );
}