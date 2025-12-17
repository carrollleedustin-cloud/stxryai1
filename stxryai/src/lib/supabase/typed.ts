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

export async function insertClubMember(payload: any) {
  const { data, error } = await (client as any).from('club_members').insert(payload).select();
  return { data, error };
}

export async function insertDiscussionForum(payload: any) {
  const { data, error } = await (client as any).from('discussion_forums').insert(payload).select();
  return { data, error };
}

export async function insertEventParticipant(payload: any) {
  const { data, error } = await (client as any).from('event_participants').insert(payload).select();
  return { data, error };
}

export async function insertDiscussionReply(payload: any) {
  const { data, error } = await (client as any).from('discussion_replies').insert(payload).select();
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
  insertClubMember,
  insertDiscussionForum,
  insertEventParticipant,
  insertDiscussionReply,
};

export async function updateReportedContentStatus(id: string, patch: any) {
  const { data, error } = await (client as any).from('reported_content').update(patch).eq('id', id).select();
  return { data, error };
}

// Personalization helpers
export async function insertUserUITheme(payload: any) {
  const { data, error } = await (client as any).from('user_ui_themes').insert(payload).select();
  return { data, error };
}

export async function updateUserUIThemeById(id: string, patch: any) {
  const { data, error } = await (client as any).from('user_ui_themes').update(patch).eq('id', id).select();
  return { data, error };
}

export async function deleteUserUIThemeById(id: string) {
  const { data, error } = await (client as any).from('user_ui_themes').delete().eq('id', id);
  return { data, error };
}

export async function insertCharacterRelationship(payload: any) {
  const { data, error } = await (client as any).from('character_relationships').insert(payload).select();
  return { data, error };
}

export async function updateCharacterRelationshipById(id: string, patch: any) {
  const { data, error } = await (client as any).from('character_relationships').update(patch).eq('id', id).select();
  return { data, error };
}

export async function upsertDiscoveryPreferences(payload: any) {
  const { data, error } = await (client as any).from('discovery_preferences').upsert(payload).select();
  return { data, error };
}

export async function insertReaderFeedback(payload: any) {
  const { data, error } = await (client as any).from('reader_feedback').insert(payload).select();
  return { data, error };
}

// Narrative AI helpers
export async function upsertUserEngagementMetrics(payload: any) {
  const { data, error } = await (client as any).from('user_engagement_metrics').upsert(payload).select();
  return { data, error };
}

export async function insertStoryNPC(payload: any) {
  const { data, error } = await (client as any).from('story_npcs').insert(payload).select();
  return { data, error };
}

export async function insertNPCMemory(payload: any) {
  const { data, error } = await (client as any).from('npc_user_memories').insert(payload).select();
  return { data, error };
}

export async function insertPacingAdjustment(payload: any) {
  const { data, error } = await (client as any).from('narrative_pacing_adjustments').insert(payload).select();
  return { data, error };
}

// User progress helpers
export async function upsertUserReadingProgress(payload: any) {
  const { data, error } = await (client as any).from('user_reading_progress').upsert(payload).select();
  return { data, error };
}

export async function updateUserReadingProgressByKeys(userId: string, storyId: string, patch: any) {
  const { data, error } = await (client as any)
    .from('user_reading_progress')
    .update(patch)
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .select();
  return { data, error };
}

export async function insertUserBadge(payload: any) {
  const { data, error } = await (client as any).from('user_badges').insert(payload).select();
  return { data, error };
}

export async function insertBookmark(payload: any) {
  const { data, error } = await (client as any).from('bookmarks').insert(payload).select();
  return { data, error };
}

export async function deleteBookmarkByKeys(userId: string, storyId: string, chapterId: string) {
  const { data, error } = await (client as any)
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .eq('chapter_id', chapterId);
  return { data, error };
}

export async function insertReportedContent(payload: any) {
  const { data, error } = await (client as any).from('reported_content').insert(payload).select();
  return { data, error };
}
