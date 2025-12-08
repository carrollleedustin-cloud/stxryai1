'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router?.push('/landing-page');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/landing-page" className="text-2xl font-bold text-purple-600">
            StxryAI
          </Link>

          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <Link href="/user-dashboard" className="text-gray-700 hover:text-purple-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/story-library" className="text-gray-700 hover:text-purple-600 transition-colors">
                  Library
                </Link>
                <Link href="/user-profile" className="text-gray-700 hover:text-purple-600 transition-colors">
                  Profile
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {profile?.display_name || 'User'}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/story-library" className="text-gray-700 hover:text-purple-600 transition-colors">
                  Browse Stories
                </Link>
                <Link
                  href="/authentication"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}