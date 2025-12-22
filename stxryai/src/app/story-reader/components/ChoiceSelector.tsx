'use client';

import React, { useEffect } from 'react';
import { PrismButton } from '@/components/ui/prism/PrismButton';
import { PrismText } from '@/components/ui/prism/PrismText';
import { PrismPanel } from '@/components/ui/prism/PrismPanel';
import { motion } from 'framer-motion';

interface ChoiceSelectorProps {
  choices: any[];
  onChoiceSelect: (choice: any) => void;
}

export default function ChoiceSelector({ choices, onChoiceSelect }: ChoiceSelectorProps) {
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

  return (
    <PrismPanel tone="card" className="mt-6 overflow-visible border-none bg-transparent shadow-none">
      <div className="flex items-end justify-between gap-4 px-2 mb-6">
        <div>
          <PrismText variant="h2" gradient="secondary" className="text-2xl md:text-3xl">
            Choose Your Path
          </PrismText>
          <p className="mt-2 text-sm text-slate-400 font-mono">
            Press <span className="text-cyan-400">[1–9]</span> to decide.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {choices.map((choice, index) => (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={choice.id}
            onClick={() => onChoiceSelect(choice)}
            className="group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-left transition-all duration-500 hover:border-violet-500/40 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
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
    </PrismPanel>
  );
}
