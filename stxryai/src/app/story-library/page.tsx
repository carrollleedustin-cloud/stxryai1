import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import StoryLibraryInteractive from './components/StoryLibraryInteractive';

export const metadata: Metadata = {
  title: 'Story Library - Stxryai',
  description:
    'Discover and explore thousands of AI-generated interactive stories across multiple genres including Horror, Sci-Fi, Fantasy, Romance, and Mystery.',
};

export default function StoryLibraryPage() {
  return (
    <>
      <Header />
      <StoryLibraryInteractive />
    </>
  );
}
