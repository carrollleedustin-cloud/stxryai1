import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import StoryLibraryInteractive from './components/StoryLibraryInteractive';

export const metadata: Metadata = {
  title: 'Story Library - Stxryai',
  description: 'Discover and explore thousands of AI-generated interactive stories across multiple genres including Horror, Sci-Fi, Fantasy, Romance, and Mystery.',
};

export default function StoryLibraryPage() {
  const mockUser = {
    name: 'Alex Thompson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    isPremium: false,
  };

  return (
    <>
      <Header user={mockUser} notificationCount={3} />
      <StoryLibraryInteractive />
    </>
  );
}