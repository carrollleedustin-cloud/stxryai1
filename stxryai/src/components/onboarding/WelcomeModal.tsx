'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
}

const welcomeSteps: WelcomeStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to StxryAI! 🎉',
    description: 'Create and experience interactive stories powered by AI. Your imagination is the only limit.',
    icon: '✨',
  },
  {
    id: 'explore',
    title: 'Discover Amazing Stories',
    description: 'Browse thousands of AI-powered interactive stories across every genre imaginable.',
    icon: '📚',
    action: {
      label: 'Explore Library',
      href: '/story-library',
    },
  },
  {
    id: 'create',
    title: 'Become a Creator',
    description: 'Use our AI-powered tools to create your own interactive stories in minutes. No writing experience needed!',
    icon: '✍️',
    action: {
      label: 'Create Your First Story',
      href: '/dashboard',
    },
  },
  {
    id: 'gamification',
    title: 'Earn Achievements & XP',
    description: 'Complete stories, make choices, and climb the leaderboard. Unlock achievements as you read and create!',
    icon: '🏆',
    action: {
      label: 'View Achievements',
      href: '/dashboard',
    },
  },
  {
    id: 'energy',
    title: 'Energy System',
    description: 'Free users get 25 energy daily. Premium users enjoy unlimited energy to read and create as much as you want!',
    icon: '⚡',
    action: {
      label: 'View Pricing',
      href: '/landing-page#pricing',
    },
  },
];

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export default function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = welcomeSteps.length;
  const step = welcomeSteps[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Mark onboarding as completed in localStorage
    localStorage.setItem('onboarding_completed', 'true');
    onClose();
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden pointer-events-auto"
            >
              {/* Progress Bar */}
              <div className="h-1 bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-8 md:p-12">
                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mb-8">
                  {welcomeSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'w-8 bg-gradient-to-r from-purple-600 to-pink-600'
                          : index < currentStep
                          ? 'w-2 bg-purple-400'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                      className="text-7xl mb-6"
                    >
                      {step.icon}
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {currentStep === 0 && userName ? `Welcome, ${userName}!` : step.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                      {step.description}
                    </p>

                    {/* Action Button (if available) */}
                    {step.action && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                      >
                        <Link
                          href={step.action.href}
                          onClick={handleComplete}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          {step.action.label}
                          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Navigation */}
              <div className="px-8 pb-8 flex items-center justify-between">
                {/* Previous Button */}
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentStep === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                >
                  Skip Tour
                </button>

                {/* Next/Finish Button */}
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {currentStep === totalSteps - 1 ? "Let's Go!" : 'Next'}
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manage welcome modal state
export function useWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');

    // Show modal if onboarding not completed
    if (!hasCompletedOnboarding) {
      // Delay slightly to allow page to load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setIsOpen(true);
  };

  return {
    isOpen,
    closeModal,
    resetOnboarding,
  };
}
