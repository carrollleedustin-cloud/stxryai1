import type { Metadata } from 'next';
import LandingPageInteractive from './landing-page/components/LandingPageInteractive';
import { createMetadata } from './metadata';

export const metadata: Metadata = createMetadata({
  title: 'Stxryai - AI-Powered Interactive Fiction Platform',
  description:
    'Experience AI-generated interactive stories where your choices shape infinite narrative possibilities. Join thousands of readers exploring unique story branches with real-time AI generation, social features, and unlimited creative freedom.',
});

export default function RootPage() {
  return <LandingPageInteractive />;
}
