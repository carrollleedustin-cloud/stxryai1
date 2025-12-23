import { redirect } from 'next/navigation';

/**
 * Profile page redirects to user-profile
 */
export default function ProfilePage() {
  redirect('/user-profile');
}

