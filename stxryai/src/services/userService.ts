import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types/database';

export const userService = {
  async searchUsers(query: string, limit = 5): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching users:', error);
      throw error;
    }

    return data as UserProfile[];
  },
};
