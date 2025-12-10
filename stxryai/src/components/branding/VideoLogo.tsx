'use client';

/**
 * Video Logo Component
 * Animated logo intro/splash screen
 * Can be used as app loader or page transition
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoLogoProps {
  videoUrl?: string; // Custom video URL
  fallbackImage?: string; // Image fallback if video fails
  duration?: number; // Auto-hide after duration (ms)
  onComplete?: () => void; // Callback when animation completes
  showOnce?: boolean; // Only show once per session
  skipButton?: boolean; // Show skip button
  autoPlay?: boolean; // Auto-play video
  className?: string;
}

export default function VideoLogo({
  videoUrl = '/videos/logo-intro.mp4',
  fallbackImage = '/images/logo.png',
  duration = 3000,
  onComplete,
  showOnce = true,
  skipButton = true,
  autoPlay = true,
  className = ''
}: VideoLogoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if already shown this session
    if (showOnce && typeof window !== 'undefined') {
      const hasShown = sessionStorage.getItem('videoLogoShown');
      if (hasShown) {
        return;
      }
      sessionStorage.setItem('videoLogoShown', 'true');
    }

    // Show the logo
    setIsVisible(true);

    // Auto-hide after duration
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleComplete();
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, showOnce]);

  const handleComplete = () => {
    setIsVisible(false);
    if (onComplete) {
      setTimeout(onComplete, 300); // Wait for exit animation
    }
  };

  const handleSkip = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    handleComplete();
  };

  const handleVideoError = () => {
    console.warn('Video logo failed to load, using fallback image');
    setUseVideo(false);
  };

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(handleVideoError);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background ${className}`}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />

        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 max-w-lg w-full px-8"
        >
          {useVideo ? (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay={autoPlay}
              muted
              playsInline
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
              onEnded={handleComplete}
              className="w-full h-auto rounded-lg shadow-2xl"
              poster={fallbackImage}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={fallbackImage}
              alt="StxryAI Logo"
              className="w-full h-auto animate-pulse"
            />
          )}
        </motion.div>

        {/* Skip Button */}
        {skipButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={handleSkip}
            className="absolute bottom-8 right-8 px-6 py-3 bg-background/50 backdrop-blur-sm border border-border rounded-lg text-foreground hover:bg-background/80 transition-colors"
          >
            Skip Intro →
          </motion.button>
        )}

        {/* Progress Bar */}
        {duration > 0 && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
          >
            <div className="h-full bg-primary" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Animated Text Logo
 * Text-based animated logo alternative
 */
export function AnimatedTextLogo({
  text = 'StxryAI',
  subtitle = 'Interactive Fiction Platform',
  duration = 2000,
  onComplete,
  className = ''
}: {
  text?: string;
  subtitle?: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background ${className}`}
    >
      {/* Main Text */}
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-7xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent"
      >
        {text.split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            {char}
          </motion.span>
        ))}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-4 text-xl text-muted-foreground"
      >
        {subtitle}
      </motion.p>

      {/* Animated Underline */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-8 h-1 w-64 bg-gradient-to-r from-primary to-secondary rounded-full"
        style={{ transformOrigin: 'center' }}
      />
    </motion.div>
  );
}

/**
 * Loading Logo
 * Shows logo while app is loading
 */
export function LoadingLogo({
  size = 'large',
  showText = true,
  className = ''
}: {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Spinning Logo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={sizeClasses[size]}
      >
        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full opacity-80" />
      </motion.div>

      {/* Loading Text */}
      {showText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-4 text-muted-foreground"
        >
          Loading...
        </motion.p>
      )}
    </div>
  );
}

/**
 * Splash Screen with Logo
 * Full-page splash screen
 */
export function SplashScreen({
  logoUrl = '/images/logo.png',
  appName = 'StxryAI',
  tagline = 'Where Every Choice Tells a Story',
  minDuration = 2000,
  onComplete,
  className = ''
}: {
  logoUrl?: string;
  appName?: string;
  tagline?: string;
  minDuration?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      setTimeout(() => onComplete?.(), 500);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {!isReady && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 ${className}`}
        >
          {/* Logo */}
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            src={logoUrl}
            alt={appName}
            className="w-32 h-32 mb-8"
          />

          {/* App Name */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            {appName}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-2 text-lg text-muted-foreground"
          >
            {tagline}
          </motion.p>

          {/* Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <LoadingLogo size="small" showText={false} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
