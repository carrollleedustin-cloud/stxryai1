import type { Metadata } from 'next';
import { Suspense } from 'react';
import StoryReaderInteractive from './components/StoryReaderInteractive';

export const metadata: Metadata = {
  title: 'Story Reader - Stxryai',
  description:
    'Immerse yourself in AI-generated interactive fiction with real-time choice-driven narratives, social chat features, and personalized reading experience with premium themes.',
};

/**
 * STORY READER PAGE
 * The portal into infinite narratives.
 * No distractions. Just the void and the story.
 */
export default function StoryReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-void-absolute flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-membrane animate-ping opacity-20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-spectral-cyan animate-spin" />
            </div>
            <p className="text-sm font-ui tracking-widest uppercase text-text-ghost">
              Entering Story
            </p>
          </div>
        </div>
      }
    >
      <StoryReaderInteractive />
    </Suspense>
  );
}
