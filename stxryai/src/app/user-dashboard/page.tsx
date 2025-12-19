import type { Metadata } from 'next';
import DashboardWrapper from './components/DashboardWrapper';

export const metadata: Metadata = {
  title: 'Dashboard - Stxryai',
  description:
    'Your personalized story dashboard with AI-curated recommendations, reading progress, and social activity updates.',
};

export default function UserDashboardPage() {
  return <DashboardWrapper />;
}
