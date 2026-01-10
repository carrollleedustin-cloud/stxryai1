'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Admin Layout - Client-side authorization wrapper
 *
 * Note: Server-side authorization is handled in middleware.ts
 * This provides a secondary client-side check and loading state.
 */

interface AdminProfile {
  role?: 'user' | 'moderator' | 'admin' | 'owner';
  is_admin?: boolean;
}

function isAuthorized(profile: AdminProfile | null): boolean {
  if (!profile) return false;
  return (
    profile.is_admin === true ||
    profile.role === 'admin' ||
    profile.role === 'moderator' ||
    profile.role === 'owner'
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, user } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !isAuthorized(profile as AdminProfile)) {
        router.replace('/');
      } else {
        setAuthChecked(true);
      }
    }
  }, [profile, loading, user, router]);

  // Show loading state while checking auth
  if (loading || !authChecked) {
    return (
      <div className="flex justify-center items-center h-screen bg-void-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-spectral-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-void-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Double-check authorization (middleware should have already blocked unauthorized access)
  if (!isAuthorized(profile as AdminProfile)) {
    return null; // Will redirect in useEffect
  }

  // Render children - the admin pages handle their own full-page layouts
  return <>{children}</>;
}
