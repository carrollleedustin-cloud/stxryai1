import type { Metadata } from 'next';
import DashboardInteractive from './components/DashboardInteractive';

export const metadata: Metadata = {
  title: 'Dashboard - Stxryai',
  description: 'Your personalized story dashboard with AI-curated recommendations, reading progress, and social activity updates.'
};

export default function UserDashboardPage() {
  return (
    <DashboardInteractive />);
}