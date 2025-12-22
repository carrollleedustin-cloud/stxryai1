'use client';

import React, { useEffect } from 'react';

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
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-glass shadow-elevation-2">
      <div className="flex items-start justify-between gap-4 px-6 pt-6 md:px-10 md:pt-8">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Choose your reality
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Press <span className="font-mono text-foreground/80">1–9</span> to choose instantly.
          </p>
        </div>
      </div>

      <div className="px-4 pb-5 pt-5 md:px-8 md:pb-8">
        <div className="grid gap-3">
        {choices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={() => onChoiceSelect(choice)}
            className="group relative w-full overflow-hidden rounded-2xl border border-border bg-background/35 p-5 text-left transition-smooth hover:bg-background/55 hover:shadow-elevation-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-smooth group-hover:opacity-100"
              style={{
                background:
                  'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(236, 72, 153, 0.10) 45%, rgba(6, 182, 212, 0.12) 100%)',
              }}
            />
            <div className="flex items-start gap-4">
              <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background/50">
                <span className="font-mono text-sm font-semibold text-foreground/90">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="relative z-10 text-base font-semibold text-foreground md:text-lg">
                  {choice.choice_text}
                </p>
                {choice.consequence_text && (
                  <p className="relative z-10 mt-2 text-sm italic text-muted-foreground opacity-80 transition-smooth group-hover:opacity-100">
                    {choice.consequence_text}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
        </div>
      </div>
    </section>
  );
}
