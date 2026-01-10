'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Sparkles,
  Github,
  Chrome,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import VoidBackground from '@/components/void/VoidBackground';
import SpectralButton from '@/components/void/SpectralButton';
import ParticleField from '@/components/void/ParticleField';

/**
 * MODERN AUTH PAGE
 * The gateway between worlds.
 * Where travelers become storytellers.
 */
const ModernAuthPage = () => {
  const router = useRouter();
  const { signIn, signUp, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'discord') => {
    try {
      setIsLoading(true);
      if (provider === 'google') {
        await authService.signInWithGoogle();
      } else if (provider === 'discord') {
        await authService.signInWithDiscord();
      } else if (provider === 'github') {
        await authService.signInWithGitHub();
      }
      // The redirect will happen automatically
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'signup' || mode === 'register') {
      setIsLogin(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/user-dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back!');

        // Get redirect URL from query params or default to dashboard
        const redirectUrl =
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('redirect') || '/user-dashboard'
            : '/user-dashboard';

        router.push(redirectUrl);
      } else {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (!acceptTerms) {
          toast.error('Please accept the terms and conditions');
          setIsLoading(false);
          return;
        }
        await signUp(email, password, username, displayName);
        toast.success('Account created! Please check your email.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = [
    'bg-spectral-rose',
    'bg-plasma-orange',
    'bg-spectral-amber',
    'bg-spectral-emerald',
    'bg-spectral-cyan',
  ];

  return (
    <VoidBackground variant="aurora">
      <ParticleField particleCount={40} color="rgba(123, 44, 191, 0.3)" />
      <div className="min-h-screen flex items-center justify-center p-6">
        {/* Background Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
            style={{
              background: 'var(--spectral-cyan)',
              animation: 'ambientOrb1 20s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
            style={{
              background: 'var(--spectral-violet)',
              animation: 'ambientOrb2 25s ease-in-out infinite 5s',
            }}
          />
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="fixed top-6 left-6 z-50 flex items-center gap-3 text-text-tertiary hover:text-text-primary transition-colors"
        >
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <path d="M18 2L4 10v16l14 8 14-8V10L18 2z" fill="url(#auth-logo-gradient)" />
            <path d="M18 10l-8 5v10l8 5 8-5V15l-8-5z" fill="var(--void-absolute)" />
            <defs>
              <linearGradient id="auth-logo-gradient" x1="4" y1="2" x2="32" y2="34">
                <stop stopColor="var(--spectral-cyan)" />
                <stop offset="1" stopColor="var(--spectral-violet)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-display text-sm tracking-widest">STXRY</span>
        </Link>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="void-glass-heavy rounded-3xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-spectral-cyan to-spectral-violet flex items-center justify-center"
                style={{ boxShadow: '0 0 40px rgba(0, 245, 212, 0.3)' }}
              >
                <Sparkles className="w-7 h-7 text-void-absolute" />
              </motion.div>

              <h1 className="font-display text-2xl md:text-3xl tracking-wide text-text-primary mb-2">
                {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
              </h1>
              <p className="font-prose text-text-tertiary">
                {isLogin
                  ? 'Enter your credentials to continue'
                  : 'Create your account to start exploring'}
              </p>
            </div>

            {/* Toggle */}
            <div className="relative flex bg-void-mist rounded-xl p-1 mb-8">
              <motion.div
                className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-spectral-cyan"
                animate={{ x: isLogin ? 0 : 'calc(100% + 8px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-sm font-ui tracking-wide uppercase relative z-10 transition-colors ${
                  isLogin ? 'text-void-absolute' : 'text-text-tertiary'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-sm font-ui tracking-wide uppercase relative z-10 transition-colors ${
                  !isLogin ? 'text-void-absolute' : 'text-text-tertiary'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Social Login */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-void-mist border border-membrane hover:border-text-ghost transition-all duration-300 text-text-secondary hover:text-text-primary group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-ui text-sm tracking-wide">Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-void-mist border border-membrane hover:border-text-ghost transition-all duration-300 text-text-secondary hover:text-text-primary group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="w-5 h-5" />
                <span className="font-ui text-sm tracking-wide">Continue with GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('discord')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-void-mist border border-membrane hover:border-text-ghost transition-all duration-300 text-text-secondary hover:text-text-primary group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path
                    d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                    fill="#5865F2"
                  />
                </svg>
                <span className="font-ui text-sm tracking-wide">Continue with Discord</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-membrane" />
              <span className="text-xs font-ui tracking-widest uppercase text-text-ghost">or</span>
              <div className="flex-1 h-px bg-membrane" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5 overflow-hidden"
                  >
                    {/* Display Name */}
                    <div>
                      <label className="block text-xs font-ui tracking-wide uppercase text-text-ghost mb-2">
                        Display Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-ghost" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="input-temporal pl-12"
                          placeholder="How should we call you?"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-xs font-ui tracking-wide uppercase text-text-ghost mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-ghost">
                          @
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) =>
                            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                          }
                          className="input-temporal pl-12"
                          placeholder="your_username"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-xs font-ui tracking-wide uppercase text-text-ghost mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-ghost" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-temporal pl-12"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-ui tracking-wide uppercase text-text-ghost mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-ghost" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-temporal pl-12 pr-12"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-ghost hover:text-text-tertiary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator - Only show during signup */}
                {!isLogin && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : 'bg-void-mist'
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs font-ui ${
                        passwordStrength <= 1
                          ? 'text-spectral-rose'
                          : passwordStrength <= 2
                            ? 'text-plasma-orange'
                            : passwordStrength <= 3
                              ? 'text-spectral-amber'
                              : 'text-spectral-emerald'
                      }`}
                    >
                      {passwordStrength > 0
                        ? strengthLabels[passwordStrength - 1]
                        : 'Enter a password'}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div>
                      <label className="block text-xs font-ui tracking-wide uppercase text-text-ghost mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-ghost" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input-temporal pl-12 pr-12"
                          placeholder="••••••••"
                          required={!isLogin}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-ghost hover:text-text-tertiary transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border transition-all ${
                            acceptTerms
                              ? 'bg-spectral-cyan border-spectral-cyan'
                              : 'border-membrane group-hover:border-text-ghost'
                          }`}
                        >
                          {acceptTerms && <Check className="w-5 h-5 text-void-absolute" />}
                        </div>
                      </div>
                      <span className="text-sm text-text-tertiary">
                        I agree to the{' '}
                        <Link href="/terms" className="text-spectral-cyan hover:underline">
                          Terms
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-spectral-cyan hover:underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot Password (Login only) */}
              {isLogin && (
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-text-ghost hover:text-spectral-cyan transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <SpectralButton
                type="submit"
                fullWidth
                loading={isLoading}
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </SpectralButton>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-text-ghost">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-spectral-cyan hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Glow effect */}
          <div
            className="absolute -inset-4 -z-10 rounded-[40px] blur-3xl opacity-20"
            style={{
              background: 'linear-gradient(135deg, var(--spectral-cyan), var(--spectral-violet))',
            }}
          />
        </motion.div>
      </div>
    </VoidBackground>
  );
};

export default ModernAuthPage;
