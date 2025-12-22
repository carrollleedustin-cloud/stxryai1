import type { Metadata } from 'next';
import ModernAuthPage from './components/ModernAuthPage';

export const metadata: Metadata = {
  title: 'Authentication - Stxryai',
  description:
    'Sign in or create an account to access AI-powered interactive stories, join reading communities, and unlock personalized narrative experiences on Stxryai.',
};

export default function AuthenticationPage() {
  return <ModernAuthPage />;
}
