'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router?.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/35 backdrop-blur-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 4L8 12V28L20 36L32 28V12L20 4Z"
                fill="url(#header-logo-gradient)"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
              />
              <path d="M20 14L14 18V26L20 30L26 26V18L20 14Z" fill="var(--color-background)" />
              <defs>
                <linearGradient
                  id="header-logo-gradient"
                  x1="8"
                  y1="4"
                  x2="32"
                  y2="36"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="var(--color-primary)" />
                  <stop offset="1" stopColor="var(--color-secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">Stxryai</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/story-library"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Library
            </Link>
            <Link
              href="/community-hub"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Community
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/user-dashboard"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <Link href="/user-profile">
                    <span className="text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                      {profile?.display_name || 'User'}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/40 hover:bg-muted/40 transition-micro"
                  >
                    <Icon
                      name="ArrowLeftOnRectangleIcon"
                      size={18}
                      className="text-muted-foreground"
                    />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/authentication"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/authentication"
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
