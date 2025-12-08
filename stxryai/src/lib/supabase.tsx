import { createBrowserClient } from '@supabase/ssr';

// Lazy initialization to ensure environment variables are loaded
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;
let isConfigured = false;

// Initialize Supabase client lazily
function initializeSupabase() {
  if (supabaseClient !== null) {
    return { client: supabaseClient, configured: isConfigured };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Validate configuration
  const isValidConfig = supabaseUrl?.startsWith('http') && supabaseAnonKey?.length > 0;
  isConfigured = isValidConfig;

  if (isValidConfig) {
    try {
      supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Supabase is not configured. Please check your environment variables.');
    }
  }

  return { client: supabaseClient, configured: isConfigured };
}

// Getter function for Supabase client with lazy initialization
export function getSupabaseClient() {
  const { client } = initializeSupabase();
  return client;
}

// Export validation flag
export function getIsSupabaseConfigured() {
  const { configured } = initializeSupabase();
  return configured;
}

// Export for backward compatibility (but initialize on access)
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (client === null) {
      throw new Error('Supabase client is not configured. Please check your environment variables.');
    }
    return client[prop as keyof typeof client];
  }
});

export const isSupabaseConfigured = getIsSupabaseConfigured();