import type { Metadata } from 'next';
import { Suspense } from 'react';
import StoryReaderInteractive from './components/StoryReaderInteractive';
import Header from '@/components/common/Header';

export const metadata: Metadata = {
  title: 'Story Reader - Stxryai',
  description:
    'Immerse yourself in AI-generated interactive fiction with real-time choice-driven narratives, social chat features, and personalized reading experience with premium themes.',
};

export default function StoryReaderPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <StoryReaderInteractive />
        </Suspense>
      </main>
    </div>
  );
}
