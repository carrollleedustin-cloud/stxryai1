import { getSupabaseClient, getIsSupabaseConfigured } from '@/lib/supabase/client';
import { updateUserById } from '@/lib/supabase/typed';

// Helper to check if Supabase is available
const ensureSupabaseConfigured = () => {
  if (!getIsSupabaseConfigured() || !getSupabaseClient()) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }
};

// Helper to safely get Supabase client
const getSupabase = () => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available');
  }
  return client;
};

export const authService = {
  async signUp({
    email,
    password,
    username,
    displayName,
  }: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) {
    ensureSupabaseConfigured();
    const supabase = getSupabase();

    // Validate inputs
    if (!email || !password || !username || !displayName) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUsername) {
      throw new Error('Username already taken. Please choose another.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: displayName,
        },
      },
    });

    if (error) {
      // Provide more specific error messages
      if (error.message.includes('User already registered')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      if (error.message.includes('invalid email')) {
        throw new Error('Please provide a valid email address.');
      }
      throw error;
    }

    // Wait a moment for the trigger to create the profile
    if (data.user) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return data;
  },

  async signIn({ email, password }: { email: string; password: string }) {
    ensureSupabaseConfigured();
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    ensureSupabaseConfigured();
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/authentication/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signInWithDiscord() {
    ensureSupabaseConfigured();
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/authentication/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    ensureSupabaseConfigured();
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    if (!getIsSupabaseConfigured()) {
      return { data: { user: null }, error: null };
    }
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data;
  },

  async getSession() {
    if (!getIsSupabaseConfigured()) {
      return null;
    }
    try {
      const supabase = getSupabase();
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (session: unknown) => void) {
    // Check if Supabase is configured before attempting to access client
    if (!getIsSupabaseConfigured()) {
      // Return consistent structure matching Supabase's return format
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.info('Supabase not configured - skipping unsubscribe');
            },
          },
        },
      };
    }

    try {
      const supabase = getSupabaseClient();

      // Additional null check after getting client
      if (!supabase) {
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                console.info('Supabase client unavailable - skipping unsubscribe');
              },
            },
          },
        };
      }

      const { data } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
        callback(session);
      });

      // Ensure consistent return structure
      return {
        data: {
          subscription: data?.subscription || {
            unsubscribe: () => {}
          }
        }
      };
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      // Return safe fallback structure
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.info('Error occurred - skipping unsubscribe');
            },
          },
        },
      };
    }
  },

  async getUserProfile(userId: string) {
    if (!getIsSupabaseConfigured()) {
      return null;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  },

  async updateUserProfile(userId: string, updates: { display_name?: string; username?: string; bio?: string }) {
    ensureSupabaseConfigured();
    const supabase = getSupabase();

    if (!userId || !updates) {
      throw new Error('User ID and updates are required');
    }

    const { data, error } = await updateUserById(userId, updates as any);
    if (error) {
      if (error.message && error.message.includes('duplicate key value violates unique constraint "users_username_key"')) {
        throw new Error('Username already taken. Please choose another.');
      }
      throw error;
    }
    return Array.isArray(data) ? data[0] : data;
  },

  async resetPassword(email: string) {
    ensureSupabaseConfigured();
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    ensureSupabaseConfigured();
    const supabase = getSupabase();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }
};