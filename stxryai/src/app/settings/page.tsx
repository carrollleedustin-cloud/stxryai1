import { Metadata } from 'next';
import SettingsPage from './components/SettingsPage';

export const metadata: Metadata = {
  title: 'Settings | StxryAI',
  description: 'Manage your account settings, preferences, and subscription',
};

export default function Settings() {
  return <SettingsPage />;
}
