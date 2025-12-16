// app/forgot-password/page.tsx
import { redirect } from 'next/navigation';

export default function ForgotPasswordRedirect() {
  redirect('/reset-password');
}
