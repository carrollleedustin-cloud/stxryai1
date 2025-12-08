'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthTabs from './AuthTabs';
import OAuthButtons from './OAuthButtons';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import BenefitsPanel from './BenefitsPanel';
import TrustSignals from './TrustSignals';

const AuthenticationInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleOAuthClick = (provider: string) => {
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication is not configured yet`);
    }, 1500);
  };

  const handleLoginSubmit = (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (data.email === 'demo@stxryai.com' && data.password === 'Demo@123') {
        router.push('/user-dashboard');
      } else {
        setIsLoading(false);
        setError('Invalid email or password. Please try again.');
      }
    }, 1500);
  };

  const handleRegisterSubmit = (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    isAdult: boolean;
  }) => {
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      setActiveTab('login');
      setError('');
    }, 2000);
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
                  <OAuthButtons onOAuthClick={handleOAuthClick} isLoading={isLoading} />

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
                    <LoginForm
                      onSubmit={handleLoginSubmit}
                      isLoading={isLoading}
                      error={error}
                    />
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