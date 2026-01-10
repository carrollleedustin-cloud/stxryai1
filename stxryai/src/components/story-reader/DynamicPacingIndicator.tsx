'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DYNAMIC PACING INDICATOR
 * Real-time reading rhythm analysis and pacing suggestions
 */
interface DynamicPacingIndicatorProps {
  readingSpeed?: number;
  emotionalIntensity?: number;
  chapterComplexity?: number;
  userStamina?: number;
  showSuggestions?: boolean;
  theme?: 'void' | 'sepia' | 'light';
  position?: 'top-right' | 'bottom-right' | 'floating';
}

interface PacingData {
  currentSpeed: number;
  optimalSpeed: number;
  rhythm: 'slow' | 'steady' | 'fast' | 'erratic';
  suggestion: string;
  intensity: number;
}

export const DynamicPacingIndicator: React.FC<DynamicPacingIndicatorProps> = ({
  readingSpeed = 1,
  emotionalIntensity = 0.5,
  chapterComplexity = 0.5,
  userStamina = 1,
  showSuggestions = true,
  theme = 'void',
  position = 'floating',
}) => {
  const [pacingData, setPacingData] = useState<PacingData>({
    currentSpeed: readingSpeed,
    optimalSpeed: 1,
    rhythm: 'steady',
    suggestion: 'Perfect pacing',
    intensity: 0.5,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const animationRef = useRef<number>();
  const lastSpeedRef = useRef(readingSpeed);

  // Calculate optimal pacing based on content
  useEffect(() => {
    const calculateOptimalPacing = () => {
      // Base optimal speed on emotional intensity and complexity
      let optimalSpeed = 1;

      if (emotionalIntensity > 0.7) {
        optimalSpeed = 0.8; // Slow down for intense emotions
      } else if (emotionalIntensity < 0.3) {
        optimalSpeed = 1.2; // Speed up for calm sections
      }

      if (chapterComplexity > 0.7) {
        optimalSpeed *= 0.9; // Slow down for complex content
      }

      // Adjust for user stamina
      optimalSpeed *= userStamina;

      // Determine rhythm
      const speedDiff = Math.abs(readingSpeed - lastSpeedRef.current);
      let rhythm: PacingData['rhythm'] = 'steady';

      if (speedDiff > 0.3) {
        rhythm = 'erratic';
      } else if (readingSpeed > optimalSpeed * 1.2) {
        rhythm = 'fast';
      } else if (readingSpeed < optimalSpeed * 0.8) {
        rhythm = 'slow';
      }

      // Generate suggestion
      let suggestion = 'Perfect pacing';
      if (rhythm === 'fast') {
        suggestion =
          emotionalIntensity > 0.6
            ? 'Take a breath, intense moment ahead'
            : 'Consider slowing down to savor the details';
      } else if (rhythm === 'slow') {
        suggestion =
          chapterComplexity < 0.4
            ? 'You might enjoy picking up the pace'
            : 'Good, complex content deserves attention';
      } else if (rhythm === 'erratic') {
        suggestion = 'Try to find a comfortable rhythm';
      }

      setPacingData({
        currentSpeed: readingSpeed,
        optimalSpeed,
        rhythm,
        suggestion,
        intensity: emotionalIntensity,
      });

      lastSpeedRef.current = readingSpeed;
    };

    calculateOptimalPacing();
  }, [readingSpeed, emotionalIntensity, chapterComplexity, userStamina]);

  // Pulse animation for intensity
  useEffect(() => {
    const animate = () => {
      setPulseIntensity((prev) => {
        const target = pacingData.intensity;
        const diff = target - prev;
        return prev + diff * 0.05; // Smooth interpolation
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pacingData.intensity]);

  // Auto-hide/show based on activity
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 5000);
    setIsVisible(true);

    return () => clearTimeout(timer);
  }, [readingSpeed, emotionalIntensity]);

  // Color schemes
  const colors = {
    void: {
      primary: 'rgba(0, 245, 212, 0.8)',
      secondary: 'rgba(0, 245, 212, 0.4)',
      background: 'rgba(2, 2, 3, 0.9)',
      text: 'text-spectral-cyan',
    },
    sepia: {
      primary: 'rgba(201, 162, 39, 0.8)',
      secondary: 'rgba(201, 162, 39, 0.4)',
      background: 'rgba(26, 24, 20, 0.9)',
      text: 'text-spectral-amber',
    },
    light: {
      primary: 'rgba(107, 68, 35, 0.8)',
      secondary: 'rgba(107, 68, 35, 0.4)',
      background: 'rgba(245, 241, 232, 0.9)',
      text: 'text-amber-800',
    },
  };

  const currentColors = colors[theme];

  // Position styles
  const positionStyles = {
    'top-right': 'fixed top-20 right-6 z-40',
    'bottom-right': 'fixed bottom-20 right-6 z-40',
    floating: 'fixed top-1/2 right-6 transform -translate-y-1/2 z-40',
  };

  const getRhythmIcon = () => {
    switch (pacingData.rhythm) {
      case 'slow':
        return '🐌';
      case 'fast':
        return '🐆';
      case 'erratic':
        return '🌪️';
      default:
        return '⚖️';
    }
  };

  const getIntensityBars = () => {
    const bars = [];
    for (let i = 0; i < 5; i++) {
      const isActive = i < Math.ceil(pulseIntensity * 5);
      bars.push(
        <motion.div
          key={i}
          className={`w-1 rounded-full ${isActive ? 'bg-current' : 'bg-current/20'}`}
          animate={{
            height: isActive ? [8, 12, 8] : 8,
            opacity: isActive ? 1 : 0.3,
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            repeat: isActive ? Infinity : 0,
          }}
        />
      );
    }
    return bars;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`${positionStyles[position]} ${currentColors.text}`}
        >
          <div
            className="backdrop-blur-md rounded-2xl p-4 border shadow-2xl"
            style={{
              background: currentColors.background,
              borderColor: currentColors.secondary,
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${currentColors.primary}20`,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{
                  rotate: pacingData.rhythm === 'erratic' ? [0, 5, -5, 0] : 0,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: pacingData.rhythm === 'erratic' ? 0.5 : 2,
                  repeat: Infinity,
                }}
                className="text-2xl"
              >
                {getRhythmIcon()}
              </motion.div>
              <div>
                <div className="text-xs font-ui tracking-widest uppercase opacity-70">
                  Reading Rhythm
                </div>
                <div className="text-sm font-medium capitalize">{pacingData.rhythm}</div>
              </div>
            </div>

            {/* Speed indicator */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Speed</span>
                <span>{(pacingData.currentSpeed * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: currentColors.primary }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pacingData.currentSpeed * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
                {/* Optimal speed marker */}
                <div
                  className="absolute top-0 w-0.5 h-full bg-white/60"
                  style={{ left: `${Math.min(pacingData.optimalSpeed * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Emotional intensity bars */}
            <div className="flex items-end gap-1 mb-3">{getIntensityBars()}</div>

            {/* Suggestion */}
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs opacity-80 leading-relaxed"
              >
                {pacingData.suggestion}
              </motion.div>
            )}

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{
                boxShadow: [
                  `0 0 0 0 ${currentColors.primary}00`,
                  `0 0 0 4px ${currentColors.primary}20`,
                  `0 0 0 0 ${currentColors.primary}00`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DynamicPacingIndicator;
