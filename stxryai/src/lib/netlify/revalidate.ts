/**
 * On-demand revalidation helpers for Netlify.
 * Use these in API routes to trigger ISR revalidation.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './isr';

/**
 * Revalidate a story and its related caches.
 */
export async function revalidateStory(storyId: string, authorId?: string) {
  // Revalidate the specific story
  revalidateTag(CACHE_TAGS.STORY(storyId));

  // Revalidate story lists
  revalidateTag(CACHE_TAGS.STORIES);
  revalidateTag(CACHE_TAGS.TRENDING_STORIES);
  revalidateTag(CACHE_TAGS.FEATURED_STORIES);

  // Revalidate author's stories if provided
  if (authorId) {
    revalidateTag(CACHE_TAGS.STORIES_BY_AUTHOR(authorId));
  }

  // Revalidate paths
  revalidatePath(`/story-reader?id=${storyId}`);
  revalidatePath('/story-library');
}

/**
 * Revalidate a user profile and related caches.
 */
export async function revalidateUser(userId: string) {
  revalidateTag(CACHE_TAGS.USER(userId));
  revalidateTag(CACHE_TAGS.USER_PROFILE(userId));
  revalidateTag(CACHE_TAGS.USER_ACHIEVEMENTS(userId));
  revalidateTag(CACHE_TAGS.STORIES_BY_AUTHOR(userId));

  revalidatePath(`/user-profile?id=${userId}`);
}

/**
 * Revalidate leaderboards.
 */
export async function revalidateLeaderboards() {
  revalidateTag(CACHE_TAGS.LEADERBOARDS);
  revalidateTag(CACHE_TAGS.GLOBAL_STATS);

  revalidatePath('/leaderboards');
}

/**
 * Revalidate all story-related caches.
 * Use sparingly - this is expensive.
 */
export async function revalidateAllStories() {
  revalidateTag(CACHE_TAGS.STORIES);
  revalidateTag(CACHE_TAGS.TRENDING_STORIES);
  revalidateTag(CACHE_TAGS.FEATURED_STORIES);
  revalidateTag(CACHE_TAGS.GENRES);
  revalidateTag(CACHE_TAGS.TAGS);

  revalidatePath('/story-library');
  revalidatePath('/');
}

/**
 * Create an API route handler for on-demand revalidation.
 * Requires a secret token for security.
 */
export function createRevalidationHandler(secret: string) {
  return async function handler(request: Request) {
    // Verify secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${secret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();
      const { type, id, authorId } = body;

      switch (type) {
        case 'story':
          if (!id) throw new Error('Story ID required');
          await revalidateStory(id, authorId);
          break;

        case 'user':
          if (!id) throw new Error('User ID required');
          await revalidateUser(id);
          break;

        case 'leaderboards':
          await revalidateLeaderboards();
          break;

        case 'all-stories':
          await revalidateAllStories();
          break;

        default:
          throw new Error(`Unknown revalidation type: ${type}`);
      }

      return new Response(JSON.stringify({ revalidated: true, type, id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Revalidation failed',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

/**
 * Netlify background function helper.
 * Wraps a function to run as a Netlify background function.
 */
export function createBackgroundHandler<T>(handler: (payload: T) => Promise<void>) {
  return async function backgroundHandler(request: Request) {
    try {
      const payload = await request.json();

      // Start background processing
      // Note: On Netlify, this will continue even after response is sent
      handler(payload as T).catch((error) => {
        console.error('Background handler error:', error);
      });

      return new Response(JSON.stringify({ status: 'processing' }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Failed to start background task',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}
