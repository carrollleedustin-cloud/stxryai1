'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PrismPanel } from '@/components/ui/prism/PrismPanel';

interface ChoiceSelectorProps {
  choices: any[];
  onChoiceSelect: (choice: any) => void;
  // AI Infinite Story Mode props
  storyMode?: 'static' | 'ai_choices' | 'ai_infinite';
  canUseCustomChoice?: boolean;
  onCustomChoice?: (customText: string) => Promise<void>;
  isGeneratingAI?: boolean;
}

export default function ChoiceSelector({ 
  choices, 
  onChoiceSelect,
  storyMode = 'ai_choices',
  canUseCustomChoice = false,
  onCustomChoice,
  isGeneratingAI = false,
}: ChoiceSelectorProps) {
  const [customInput, setCustomInput] = useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  // Keyboard rhythm: 1–9 selects a choice (when not typing in an input).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (target as any)?.isContentEditable) return;

      if (e.key >= '1' && e.key <= '9') {
        const idx = Number(e.key) - 1;
        const choice = choices[idx];
        if (choice) {
          e.preventDefault();
          onChoiceSelect(choice);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [choices, onChoiceSelect]);

  const handleCustomSubmit = async () => {
    if (!customInput.trim() || !onCustomChoice) return;
    
    setIsSubmittingCustom(true);
    try {
      await onCustomChoice(customInput.trim());
      setCustomInput('');
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  return (
    <PrismPanel tone="card" className="mt-6 overflow-visible border-none bg-transparent shadow-none">
      <div className="flex items-end justify-between gap-4 px-2 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Choose your reality
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {storyMode === 'ai_infinite' && canUseCustomChoice ? (
              <>Pick an option or <span className="text-purple-400">write your own path</span></>
            ) : (
              <>Press <span className="font-mono text-foreground/80">1–9</span> to choose instantly.</>
            )}
          </p>
        </div>
        {storyMode === 'ai_infinite' && (
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 px-3 py-1.5 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-medium text-purple-300">Infinite Story</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-5 pt-5 md:px-8 md:pb-8">
        {/* Preset Choices */}
        <div className="grid gap-3">
        {choices.map((choice, index) => (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={choice.id}
            onClick={() => onChoiceSelect(choice)}
            disabled={isGeneratingAI || isSubmittingCustom}
            className="group relative w-full overflow-hidden rounded-2xl border border-border bg-background/35 p-5 text-left transition-smooth hover:bg-background/55 hover:shadow-elevation-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Hover gradient sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent -translate-x-full group-hover:animate-shimmer transition-transform" />
            
            <div className="flex items-start gap-6 relative z-10">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/40 font-mono text-lg font-bold text-violet-400 group-hover:scale-110 group-hover:border-violet-500/50 transition-all duration-300">
                {index + 1}
              </div>
              
              <div className="flex-1 space-y-2">
                <p className="text-lg font-medium text-slate-200 group-hover:text-white transition-colors">
                  {choice.choice_text}
                </p>
                {choice.consequence_text && (
                  <p className="text-sm italic text-slate-500 group-hover:text-violet-300/70 transition-colors">
                    Preview: {choice.consequence_text}
                  </p>
                )}
              </div>

              {/* Arrow Icon */}
              <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center h-full text-violet-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </motion.button>
        ))}
        </div>

        {/* Custom Choice Input for Premium Users in AI Infinite Mode */}
        {storyMode === 'ai_infinite' && canUseCustomChoice && onCustomChoice && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-50" />
              <div className="relative rounded-2xl border border-purple-500/30 bg-background/60 backdrop-blur-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">Write Your Own Path</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-purple-500/20 px-2 py-0.5 rounded-full">Premium</span>
                </div>
                <div className="flex gap-3">
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="What do you want to do? The AI will continue the story based on your choice..."
                    disabled={isGeneratingAI || isSubmittingCustom}
                    className="flex-1 min-h-[80px] px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none disabled:opacity-50"
                    maxLength={500}
                  />
                  <button
                    onClick={handleCustomSubmit}
                    disabled={!customInput.trim() || isGeneratingAI || isSubmittingCustom}
                    className="self-end px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium transition-all hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmittingCustom || isGeneratingAI ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {customInput.length}/500 characters • Press Enter to submit
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Generating Indicator */}
        {isGeneratingAI && (
          <div className="mt-4 flex items-center justify-center gap-3 py-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin relative" />
            </div>
            <span className="text-sm text-purple-300 animate-pulse">
              AI is crafting your unique story path...
            </span>
          </div>
        )}
      </div>
    </PrismPanel>
  );
}
