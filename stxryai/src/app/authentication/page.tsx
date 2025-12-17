import type { Metadata } from 'next';
import AuthenticationInteractive from './components/AuthenticationInteractive';

export const metadata: Metadata = {
  title: 'Authentication - Stxryai',
  description:
    'Sign in or create an account to access AI-powered interactive stories, join reading communities, and unlock personalized narrative experiences on Stxryai.',
};

export default function AuthenticationPage() {
  return <AuthenticationInteractive />;
}
