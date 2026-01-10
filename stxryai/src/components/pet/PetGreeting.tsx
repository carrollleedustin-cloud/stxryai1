'use client';

/**
 * Pet Greeting Component
 * Shows contextual pet messages throughout the app.
 * Non-intrusive, encouraging, and personalized.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePet } from '@/contexts/PetContext';
import { X } from 'lucide-react';

interface PetGreetingProps {
  trigger?: 'reading' | 'creating' | 'achievement' | 'idle' | 'milestone';
  autoShow?: boolean;
  autoHideDelay?: number;
  className?: string;
}

export default function PetGreeting({
  trigger = 'idle',
  autoShow = true,
  autoHideDelay = 5000,
  className = '',
}: PetGreetingProps) {
  const { pet, hasPet, getDialogue } = usePet();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!hasPet || !pet || !autoShow) return;

    // Set appropriate message based on trigger
    const triggerMap: Record<
      string,
      | 'greeting'
      | 'reading_start'
      | 'reading_end'
      | 'choice_made'
      | 'milestone'
      | 'idle'
      | 'encouragement'
      | 'celebration'
    > = {
      reading: 'reading_start',
      creating: 'encouragement',
      achievement: 'celebration',
      idle: 'idle',
      milestone: 'milestone',
    };

    const dialogueTrigger = triggerMap[trigger] || 'greeting';
    const newMessage = getDialogue(dialogueTrigger);

    if (newMessage) {
      setMessage(newMessage);
      setIsVisible(true);

      if (autoHideDelay > 0) {
        const timer = setTimeout(() => setIsVisible(false), autoHideDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [hasPet, pet, trigger, autoShow, autoHideDelay, getDialogue]);

  if (!hasPet || !pet) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className={`relative bg-void-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl ${className}`}
        >
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3 text-ghost-500" />
          </button>

          <div className="flex items-center gap-3">
            {/* Mini pet avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${pet.traits.primaryColor}40, ${pet.traits.secondaryColor}40)`,
                boxShadow: `0 0 15px ${pet.traits.primaryColor}30`,
              }}
            >
              <motion.span
                className="text-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {pet.baseType === 'dragon'
                  ? '🐲'
                  : pet.baseType === 'cat'
                    ? '🐱'
                    : pet.baseType === 'wolf'
                      ? '🐺'
                      : pet.baseType === 'fox'
                        ? '🦊'
                        : pet.baseType === 'bunny'
                          ? '🐰'
                          : pet.baseType === 'owl'
                            ? '🦉'
                            : pet.baseType === 'phoenix'
                              ? '🔥'
                              : pet.baseType === 'crystal'
                                ? '💎'
                                : pet.baseType === 'slime'
                                  ? '🫧'
                                  : pet.baseType === 'shadow'
                                    ? '👻'
                                    : pet.baseType === 'wisp'
                                      ? '✨'
                                      : '🌟'}
              </motion.span>
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ghost-300 mb-0.5">{pet.name}</p>
              <p className="text-sm text-white">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
