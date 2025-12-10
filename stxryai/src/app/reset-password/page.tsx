import { Metadata } from 'next';
import ResetPasswordPage from './components/ResetPasswordPage';

export const metadata: Metadata = {
  title: 'Reset Password | StxryAI',
  description: 'Reset your StxryAI account password',
};

export default function ResetPassword() {
  return <ResetPasswordPage />;
}
