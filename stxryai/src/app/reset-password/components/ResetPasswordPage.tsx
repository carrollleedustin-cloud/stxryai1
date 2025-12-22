'use client';

/**
 * Password Reset Flow - Void Design System
 * Request password reset and set new password
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/services/authService';
import VoidBackground, { AmbientOrbs } from '@/components/void/VoidBackground';
import SpectralButton from '@/components/void/SpectralButton';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<'request' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.resetPassword(email);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Void Background */}
      <VoidBackground variant="dense" />
      <AmbientOrbs />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-spectral-cyan/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
      >
        {/* Glass Card */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-spectral-cyan/20 via-spectral-violet/20 to-spectral-cyan/20 rounded-2xl blur-xl opacity-50" />
          
          {/* Card content */}
          <div className="relative bg-void-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl shadow-void-black/50">
            <AnimatePresence mode="wait">
              {step === 'request' ? (
                <motion.div
                  key="request"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header */}
                  <div className="text-center mb-8">
                    <Link href="/landing-page" className="inline-block group">
                      <motion.div 
                        className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 relative overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-spectral-cyan via-spectral-violet to-spectral-rose opacity-80" />
                        
                        {/* Icon */}
                        <svg className="w-8 h-8 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                      </motion.div>
                    </Link>
                    
                    <h1 className="text-3xl font-bold text-white mb-2 font-display tracking-tight">
                      <span className="bg-gradient-to-r from-spectral-cyan via-white to-spectral-violet bg-clip-text text-transparent">
                        Reset Password
                      </span>
                    </h1>
                    <p className="text-ghost-500 text-sm">
                      Enter your email to receive a reset link
                    </p>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-6 p-4 bg-spectral-rose/10 border border-spectral-rose/30 rounded-lg overflow-hidden"
                      >
                        <div className="flex items-start">
                          <svg
                            className="w-5 h-5 text-spectral-rose flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="ml-3 text-sm text-spectral-rose">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-ghost-400 mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          required
                          className="w-full px-4 py-3 bg-void-black/60 border border-white/10 rounded-lg text-white placeholder-ghost-600 focus:outline-none focus:border-spectral-cyan/50 focus:ring-1 focus:ring-spectral-cyan/30 transition-all duration-300"
                          placeholder="you@example.com"
                        />
                        
                        {/* Focus glow */}
                        <motion.div
                          className="absolute inset-0 -z-10 rounded-lg bg-spectral-cyan/20 blur-md"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isFocused ? 0.5 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    <SpectralButton
                      type="submit"
                      variant="primary"
                      className="w-full justify-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Reset Link
                        </span>
                      )}
                    </SpectralButton>
                  </form>

                  {/* Back to Login */}
                  <div className="mt-6 text-center">
                    <Link
                      href="/authentication"
                      className="text-sm text-ghost-400 hover:text-spectral-cyan transition-colors duration-300 inline-flex items-center gap-1 group"
                    >
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: -3 }}
                      >
                        ←
                      </motion.span>
                      Back to Sign In
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Success State */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', duration: 0.7, bounce: 0.5 }}
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 relative"
                    >
                      {/* Success ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-spectral-cyan opacity-20" />
                      <div className="absolute inset-1 rounded-full bg-void-black" />
                      
                      <motion.svg
                        className="w-10 h-10 text-green-400 relative z-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <motion.path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        />
                      </motion.svg>
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-3 font-display">
                      Check Your Email
                    </h2>
                    <p className="text-ghost-400 mb-2">
                      We've sent a password reset link to:
                    </p>
                    <p className="text-spectral-cyan font-medium mb-6 font-mono text-sm bg-spectral-cyan/10 py-2 px-4 rounded-lg inline-block">
                      {email}
                    </p>
                    <p className="text-sm text-ghost-500 mb-8">
                      Click the link in the email to reset your password. If you don't see it, check
                      your spam folder.
                    </p>

                    <Link href="/authentication">
                      <SpectralButton variant="primary" className="w-full justify-center mb-4">
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Back to Sign In
                        </span>
                      </SpectralButton>
                    </Link>

                    <button
                      onClick={() => {
                        setStep('request');
                        setEmail('');
                        setError('');
                      }}
                      className="text-sm text-ghost-500 hover:text-spectral-violet transition-colors duration-300"
                    >
                      Didn't receive the email? Try again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Help Text */}
        <motion.p 
          className="text-center mt-6 text-sm text-ghost-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Need help?{' '}
          <Link href="/help" className="text-spectral-cyan hover:text-spectral-violet transition-colors duration-300 hover:underline">
            Contact Support
          </Link>
        </motion.p>
      </motion.div>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.5);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
