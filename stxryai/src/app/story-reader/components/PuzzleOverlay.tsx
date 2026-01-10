'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Lightbulb, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { AIPuzzle } from '@/services/aiStoryAssistantService';

interface PuzzleOverlayProps {
  puzzle: AIPuzzle;
  onSolve: (xp: number) => void;
  onClose: () => void;
}

export function PuzzleOverlay({ puzzle, onSolve, onClose }: PuzzleOverlayProps) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    const correct = answer.toLowerCase().trim() === puzzle.answer.toLowerCase().trim();

    setTimeout(() => {
      setIsCorrect(correct);
      setIsSubmitting(false);
      if (correct) {
        onSolve(puzzle.rewardXP);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-card border-2 border-primary/20 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-primary/10 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
            <HelpCircle size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Narrative Puzzle</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  puzzle.difficulty === 'easy'
                    ? 'bg-green-500/20 text-green-500'
                    : puzzle.difficulty === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-red-500/20 text-red-500'
                }`}
              >
                {puzzle.difficulty}
              </span>
              • Earn {puzzle.rewardXP} XP
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="text-lg text-foreground font-medium leading-relaxed italic">
            "{puzzle.question}"
          </div>

          {isCorrect === null ? (
            <div className="space-y-4">
              {puzzle.options ? (
                <div className="grid grid-cols-1 gap-3">
                  {puzzle.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAnswer(opt)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        answer === opt
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 bg-background border-2 border-border rounded-xl focus:border-primary focus:ring-0 transition-colors"
                />
              )}

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => setShowHint(true)}
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  <Lightbulb size={16} />
                  Need a hint?
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isSubmitting}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Checking...' : 'Submit Answer'}
                </button>
              </div>

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-600 dark:text-yellow-400"
                  >
                    <strong>Hint:</strong> {puzzle.hint}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="py-10 flex flex-col items-center text-center space-y-4"
            >
              {isCorrect ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white mb-2">
                    <Trophy size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Brilliant!
                  </h4>
                  <p className="text-muted-foreground">
                    You've solved the puzzle and earned {puzzle.rewardXP} XP.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white mb-2">
                    <XCircle size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Not quite...
                  </h4>
                  <p className="text-muted-foreground">
                    The correct answer was:{' '}
                    <span className="font-bold text-foreground">{puzzle.answer}</span>
                  </p>
                </>
              )}
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-foreground text-background rounded-xl font-bold"
              >
                Continue Story
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
