import type { Metadata } from 'next';
import StoryLibraryInteractive from './components/StoryLibraryInteractive';

export const metadata: Metadata = {
  title: 'Story Library - Stxryai',
  description:
    'Discover and explore thousands of AI-generated interactive stories across multiple genres including Horror, Sci-Fi, Fantasy, Romance, and Mystery.',
};

/**
 * STORY LIBRARY PAGE
 * The infinite archive of narratives.
 */
export default function StoryLibraryPage() {
  return <StoryLibraryInteractive />;
}
