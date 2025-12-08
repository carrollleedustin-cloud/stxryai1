import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Validate configuration
  if (!supabaseUrl?.startsWith('http') || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Supabase configuration incomplete. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Export singleton client instance
export const supabase = createClient();