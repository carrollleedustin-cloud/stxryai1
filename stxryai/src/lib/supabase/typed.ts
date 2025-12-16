import { createClient } from './server';
import type { Database } from './database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

const client = createClient() as unknown as SupabaseClient<Database>;

// Typed helpers for common mutations to avoid casting at call sites
export async function updateUserById(
  id: string,
  patch: Database['public']['Tables']['users']['Update']
) {
  const { data, error } = await (client as any).from('users').update(patch).eq('id', id);
  return { data, error };
}

export async function upsertUserAchievement(
  payload: Database['public']['Tables']['user_achievements']['Insert']
) {
  const { data, error } = await (client as any).from('user_achievements').upsert(payload);
  return { data, error };
}

export async function insertNotification(
  payload: Database['public']['Tables']['notifications']['Insert']
) {
  const { data, error } = await (client as any).from('notifications').insert(payload);
  return { data, error };
}

export async function insertStory(
  payload: Database['public']['Tables']['stories']['Insert']
) {
  const { data, error } = await (client as any).from('stories').insert(payload).select();
  return { data, error };
}

export async function updateStoryById(
  id: string,
  patch: Database['public']['Tables']['stories']['Update']
) {
  const { data, error } = await (client as any).from('stories').update(patch).eq('id', id).select();
  return { data, error };
}

export async function insertChapter(
  payload: Database['public']['Tables']['chapters']['Insert']
) {
  const { data, error } = await (client as any).from('chapters').insert(payload).select();
  return { data, error };
}

export async function updateChapterById(
  id: string,
  patch: Database['public']['Tables']['chapters']['Update']
) {
  const { data, error } = await (client as any).from('chapters').update(patch).eq('id', id).select();
  return { data, error };
}

export async function deleteChapterById(id: string) {
  const { data, error } = await (client as any).from('chapters').delete().eq('id', id);
  return { data, error };
}

export async function insertComment(
  payload: Database['public']['Tables']['comments']['Insert']
) {
  const { data, error } = await (client as any).from('comments').insert(payload).select();
  return { data, error };
}

export async function updateCommentById(
  id: string,
  patch: Database['public']['Tables']['comments']['Update']
) {
  const { data, error } = await (client as any).from('comments').update(patch).eq('id', id).select();
  return { data, error };
}

export async function deleteCommentById(id: string) {
  const { data, error } = await (client as any).from('comments').delete().eq('id', id);
  return { data, error };
}
export async function upsertStoryReview(
  payload: Database['public']['Tables']['ratings']['Insert']
) {
  const { data, error } = await (client as any).from('story_reviews').upsert(payload).select();
  return { data, error };
}

export async function insertCollection(
  payload: Database['public']['Tables']['collections']['Insert']
) {
  const { data, error } = await (client as any).from('collections').insert(payload).select();
  return { data, error };
}

export async function insertCollectionStory(
  payload: Database['public']['Tables']['collection_stories']['Insert']
) {
  const { data, error } = await (client as any).from('collection_stories').insert(payload).select();
  return { data, error };
}

export default {
  updateUserById,
  upsertUserAchievement,
  insertNotification,
  insertStory,
  updateStoryById,
  insertChapter,
  updateChapterById,
  insertComment,
  upsertStoryReview,
  insertCollection,
  insertCollectionStory,
};
