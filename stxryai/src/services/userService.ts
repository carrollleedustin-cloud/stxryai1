import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types/database';
import { sanitizeForDatabase } from '@/lib/utils/sanitization';

/**
 * User service for user-related operations
 * Provides safe user search and profile management
 */
export const userService = {
  /**
   * Search users by username or display name
   * @param query - Search query (sanitized automatically)
   * @param limit - Maximum number of results (default: 5, max: 20)
   * @returns Array of matching user profiles
   */
  async searchUsers(query: string, limit = 5): Promise<UserProfile[]> {
    try {
      // Validate and sanitize inputs
      if (!query || typeof query !== 'string') {
        throw new Error('Search query is required and must be a string');
      }

      const sanitizedQuery = sanitizeForDatabase(query.trim());
      if (sanitizedQuery.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      // Limit the number of results for performance
      const safeLimit = Math.min(Math.max(limit, 1), 20);

      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, bio, created_at')
        .or(`username.ilike.%${sanitizedQuery}%,display_name.ilike.%${sanitizedQuery}%`)
        .limit(safeLimit);

      if (error) {
        console.error('Database error searching users:', error);
        throw new Error('Failed to search users. Please try again.');
      }

      return (data || []) as UserProfile[];
    } catch (error) {
      // Re-throw validation errors as-is
      if (
        error instanceof Error &&
        (error.message.includes('required') || error.message.includes('characters'))
      ) {
        throw error;
      }

      // Log unexpected errors
      console.error('Unexpected error in searchUsers:', error);
      throw new Error('An unexpected error occurred while searching users.');
    }
  },
};
