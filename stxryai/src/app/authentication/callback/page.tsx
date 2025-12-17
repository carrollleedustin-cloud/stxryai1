'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase client not available');
        router.push('/authentication?error=config');
        return;
      }

      try {
        // Get the code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          // Exchange code for session
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Error exchanging code for session:', error);
            router.push('/authentication?error=auth_failed');
            return;
          }

          // Get the user session to verify
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            // Successfully authenticated, redirect to dashboard
            router.push('/user-dashboard');
          } else {
            router.push('/authentication?error=no_session');
          }
        } else {
          // No code in URL, check for error
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');

          console.error('OAuth error:', error, errorDescription);
          router.push(`/authentication?error=${error || 'unknown'}`);
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        router.push('/authentication?error=unexpected');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Completing sign in...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}
