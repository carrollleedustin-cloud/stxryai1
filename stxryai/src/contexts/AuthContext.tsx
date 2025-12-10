'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';

interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  subscription_tier?: string;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    // Safe subscription handling with null checks
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    try {
      const authListenerResult = authService.onAuthStateChange(async (session: any) => {
        if (session?.user) {
          setUser(session.user as User);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      
      // Safely extract subscription
      authSubscription = authListenerResult?.data?.subscription || null;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }

    return () => {
      if (authSubscription) {
        try {
          authSubscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth changes:', error);
        }
      }
    };
  }, []);

  async function checkUser() {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        setUser(session.user as User);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProfile(userId: string) {
    try {
      const profileData = await authService.getUserProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async function signIn(email: string, password: string) {
    const { user: authUser } = await authService.signIn({ email, password });
    if (authUser) {
      setUser(authUser as User);
      await loadUserProfile(authUser.id);
    }
  }

  async function signUp(email: string, password: string, username: string, displayName: string) {
    const { user: authUser } = await authService.signUp({
      email,
      password,
      username,
      displayName,
    });
    if (authUser) {
      setUser(authUser as User);

      // Try to load profile with retries (trigger might take a moment)
      let profileLoaded = false;
      let retries = 3;

      while (!profileLoaded && retries > 0) {
        const profile = await authService.getUserProfile(authUser.id);
        if (profile) {
          setProfile(profile);
          profileLoaded = true;
        } else {
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      if (!profileLoaded) {
        console.warn('Profile not loaded immediately after signup');
      }
    }
  }

  async function signOut() {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) {
      await loadUserProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}