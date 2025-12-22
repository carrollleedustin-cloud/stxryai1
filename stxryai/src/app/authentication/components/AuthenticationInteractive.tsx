'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthTabs from './AuthTabs';
import OAuthButtons from './OAuthButtons';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import BenefitsPanel from './BenefitsPanel';
import TrustSignals from './TrustSignals';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

const AuthenticationInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
    
    // Check URL params for mode
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      if (mode === 'signup' || mode === 'register') {
        setActiveTab('register');
      } else if (mode === 'login' || mode === 'signin') {
        setActiveTab('login');
      }
    }
  }, []);

  // Redirect if already logged in (but only once to prevent loops)
  useEffect(() => {
    if (user && isHydrated) {
      // Small delay to prevent redirect loops
      const redirectTimer = setTimeout(() => {
        router.push('/user-dashboard');
      }, 200);
      return () => clearTimeout(redirectTimer);
    }
  }, [user, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleOAuthClick = async (provider: 'google' | 'discord') => {
    setIsLoading(true);
    setError('');
    try {
      if (provider === 'google') {
        await authService.signInWithGoogle();
      } else if (provider === 'discord') {
        await authService.signInWithDiscord();
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setIsLoading(true);
    setError('');
    try {
      await signIn(data.email, data.password);
      toast.success('Login successful!');
      // Wait a moment for auth state to propagate, then redirect
      // Using router.push instead of window.location to avoid full page reload flicker
      setTimeout(() => {
        router.push('/user-dashboard');
      }, 100);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleRegisterSubmit = async (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    displayName?: string;
  }) => {
    setIsLoading(true);
    setError('');

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(data.email, data.password, data.username, data.displayName);
      toast.success('Registration successful! Please check your email to confirm your account.');
      setActiveTab('login');
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="order-2 lg:order-1">
              <div className="sticky top-8">
                <BenefitsPanel />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="bg-card/50 backdrop-blur-glass border border-border rounded-2xl shadow-elevation-2 p-6 sm:p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg
                        width="56"
                        height="56"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transition-smooth hover:scale-105"
                      >
                        <path
                          d="M20 4L8 12V28L20 36L32 28V12L20 4Z"
                          fill="url(#auth-logo-gradient)"
                          stroke="var(--color-accent)"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M20 14L14 18V26L20 30L26 26V18L20 14Z"
                          fill="var(--color-background)"
                        />
                        <defs>
                          <linearGradient
                            id="auth-logo-gradient"
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
                    </div>
                  </div>

                  <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                <div className="space-y-6">
                  <OAuthButtons
                    onOAuthClick={(provider) => handleOAuthClick(provider as 'google' | 'discord')}
                    isLoading={isLoading}
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-4 bg-card text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {activeTab === 'login' ? (
                    <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} error={error} />
                  ) : (
                    <RegisterForm
                      onSubmit={handleRegisterSubmit}
                      isLoading={isLoading}
                      error={error}
                    />
                  )}
                </div>

                <div className="mt-8">
                  <TrustSignals />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationInteractive;
