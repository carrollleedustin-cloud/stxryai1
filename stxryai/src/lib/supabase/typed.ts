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
  payload:
    | Database['public']['Tables']['user_achievements']['Insert']
    | Database['public']['Tables']['user_achievements']['Insert'][]
) {
  const { data, error } = await (client as any).from('user_achievements').upsert(payload);
  return { data, error };
}

export async function insertNotification(
  payload:
    | Database['public']['Tables']['notifications']['Insert']
    | Database['public']['Tables']['notifications']['Insert'][]
) {
  const { data, error } = await (client as any).from('notifications').insert(payload);
  return { data, error };
}

export async function insertStory(
  payload:
    | Database['public']['Tables']['stories']['Insert']
    | Database['public']['Tables']['stories']['Insert'][]
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
  payload:
    | Database['public']['Tables']['chapters']['Insert']
    | Database['public']['Tables']['chapters']['Insert'][]
) {
  const { data, error } = await (client as any).from('chapters').insert(payload).select();
  return { data, error };
}

export async function updateChapterById(
  id: string,
  patch: Database['public']['Tables']['chapters']['Update']
) {
  const { data, error } = await (client as any)
    .from('chapters')
    .update(patch)
    .eq('id', id)
    .select();
  return { data, error };
}

export async function deleteChapterById(id: string) {
  const { data, error } = await (client as any).from('chapters').delete().eq('id', id);
  return { data, error };
}

export async function insertComment(
  payload:
    | Database['public']['Tables']['comments']['Insert']
    | Database['public']['Tables']['comments']['Insert'][]
) {
  const { data, error } = await (client as any).from('comments').insert(payload).select();
  return { data, error };
}

export async function updateCommentById(
  id: string,
  patch: Database['public']['Tables']['comments']['Update']
) {
  const { data, error } = await (client as any)
    .from('comments')
    .update(patch)
    .eq('id', id)
    .select();
  return { data, error };
}

export async function deleteCommentById(id: string) {
  const { data, error } = await (client as any).from('comments').delete().eq('id', id);
  return { data, error };
}
export async function upsertStoryReview(
  payload:
    | Database['public']['Tables']['ratings']['Insert']
    | Database['public']['Tables']['ratings']['Insert'][]
) {
  const { data, error } = await (client as any).from('story_reviews').upsert(payload).select();
  return { data, error };
}

export async function insertCollection(
  payload:
    | Database['public']['Tables']['collections']['Insert']
    | Database['public']['Tables']['collections']['Insert'][]
) {
  const { data, error } = await (client as any).from('collections').insert(payload).select();
  return { data, error };
}

export async function insertCollectionStory(
  payload:
    | Database['public']['Tables']['collection_stories']['Insert']
    | Database['public']['Tables']['collection_stories']['Insert'][]
) {
  const { data, error } = await (client as any).from('collection_stories').insert(payload).select();
  return { data, error };
}

export async function insertClubMember(
  payload:
    | Database['public']['Tables']['club_members']['Insert']
    | Database['public']['Tables']['club_members']['Insert'][]
) {
  const { data, error } = await (client as any).from('club_members').insert(payload).select();
  return { data, error };
}

export async function insertDiscussionForum(
  payload:
    | Database['public']['Tables']['discussion_forums']['Insert']
    | Database['public']['Tables']['discussion_forums']['Insert'][]
) {
  const { data, error } = await (client as any).from('discussion_forums').insert(payload).select();
  return { data, error };
}

export async function insertEventParticipant(
  payload:
    | Database['public']['Tables']['event_participants']['Insert']
    | Database['public']['Tables']['event_participants']['Insert'][]
) {
  const { data, error } = await (client as any).from('event_participants').insert(payload).select();
  return { data, error };
}

export async function insertDiscussionReply(
  payload:
    | Database['public']['Tables']['discussion_replies']['Insert']
    | Database['public']['Tables']['discussion_replies']['Insert'][]
) {
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

export async function updateReportedContentStatus(
  id: string,
  patch: Database['public']['Tables']['reported_content']['Update']
) {
  const { data, error } = await (client as any)
    .from('reported_content')
    .update(patch)
    .eq('id', id)
    .select();
  return { data, error };
}

// Personalization helpers
export async function insertUserUITheme(
  payload:
    | Database['public']['Tables']['user_ui_themes']['Insert']
    | Database['public']['Tables']['user_ui_themes']['Insert'][]
) {
  const { data, error } = await (client as any).from('user_ui_themes').insert(payload).select();
  return { data, error };
}

export async function updateUserUIThemeById(
  id: string,
  patch: Database['public']['Tables']['user_ui_themes']['Update']
) {
  const { data, error } = await (client as any)
    .from('user_ui_themes')
    .update(patch)
    .eq('id', id)
    .select();
  return { data, error };
}

export async function deleteUserUIThemeById(id: string) {
  const { data, error } = await (client as any).from('user_ui_themes').delete().eq('id', id);
  return { data, error };
}

export async function insertCharacterRelationship(
  payload:
    | Database['public']['Tables']['character_relationships']['Insert']
    | Database['public']['Tables']['character_relationships']['Insert'][]
) {
  const { data, error } = await (client as any)
    .from('character_relationships')
    .insert(payload)
    .select();
  return { data, error };
}

export async function updateCharacterRelationshipById(
  id: string,
  patch: Database['public']['Tables']['character_relationships']['Update']
) {
  const { data, error } = await (client as any)
    .from('character_relationships')
    .update(patch)
    .eq('id', id)
    .select();
  return { data, error };
}

export async function upsertDiscoveryPreferences(
  payload:
    | Database['public']['Tables']['discovery_preferences']['Insert']
    | Database['public']['Tables']['discovery_preferences']['Insert'][]
) {
  const { data, error } = await (client as any)
    .from('discovery_preferences')
    .upsert(payload)
    .select();
  return { data, error };
}

export async function insertReaderFeedback(
  payload:
    | Database['public']['Tables']['reader_feedback']['Insert']
    | Database['public']['Tables']['reader_feedback']['Insert'][]
) {
  const { data, error } = await (client as any).from('reader_feedback').insert(payload).select();
  return { data, error };
}

// Narrative AI helpers
export async function upsertUserEngagementMetrics(
  payload:
    | Database['public']['Tables']['user_engagement_metrics']['Insert']
    | Database['public']['Tables']['user_engagement_metrics']['Insert'][]
) {
  const { data, error } = await (client as any)
    .from('user_engagement_metrics')
    .upsert(payload)
    .select();
  return { data, error };
}

export async function insertStoryNPC(
  payload:
    | Database['public']['Tables']['story_npcs']['Insert']
    | Database['public']['Tables']['story_npcs']['Insert'][]
) {
  const { data, error } = await (client as any).from('story_npcs').insert(payload).select();
  return { data, error };
}

export async function insertNPCMemory(
  payload:
    | Database['public']['Tables']['npc_user_memories']['Insert']
    | Database['public']['Tables']['npc_user_memories']['Insert'][]
) {
  const { data, error } = await (client as any).from('npc_user_memories').insert(payload).select();
  return { data, error };
}

export async function insertPacingAdjustment(
  payload:
    | Database['public']['Tables']['narrative_pacing_adjustments']['Insert']
    | Database['public']['Tables']['narrative_pacing_adjustments']['Insert'][]
) {
  const { data, error } = await (client as any)
    .from('narrative_pacing_adjustments')
    .insert(payload)
    .select();
  return { data, error };
}

// User progress helpers
export async function upsertUserReadingProgress(
  payload:
    | Database['public']['Tables']['user_progress']['Insert']
    | Database['public']['Tables']['user_progress']['Insert'][]
) {
  const { data, error } = await (client as any).from('user_progress').upsert(payload).select();
  return { data, error };
}

export async function updateUserReadingProgressByKeys(
  userId: string,
  storyId: string,
  patch: Database['public']['Tables']['user_progress']['Update']
) {
  const { data, error } = await (client as any)
    .from('user_progress')
    .update(patch)
    .eq('user_id', userId)
    .eq('story_id', storyId)
    .select();
  return { data, error };
}

export async function insertUserBadge(
  payload: Database['public']['Tables']['user_badges']['Insert']
) {
  const { data, error } = await (client as any).from('user_badges').insert(payload).select();
  return { data, error };
}

export async function insertBookmark(payload: Database['public']['Tables']['bookmarks']['Insert']) {
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

export async function insertReportedContent(
  payload: Database['public']['Tables']['reported_content']['Insert']
) {
  const { data, error } = await (client as any).from('reported_content').insert(payload).select();
  return { data, error };
}

// Activity / social / reading list helpers
export async function insertUserActivity(
  payload:
    | Database['public']['Tables']['user_activities']['Insert']
    | Database['public']['Tables']['user_activities']['Insert'][]
) {
  const { data, error } = await (client as any).from('user_activities').insert(payload).select();
  return { data, error };
}

export async function insertUserFriendship(
  payload: Database['public']['Tables']['user_friendships']['Insert']
) {
  const { data, error } = await (client as any).from('user_friendships').insert(payload).select();
  return { data, error };
}

export async function updateUserFriendshipById(
  id: string,
  patch: Database['public']['Tables']['user_friendships']['Update']
) {
  const { data, error } = await (client as any)
    .from('user_friendships')
    .update(patch)
    .eq('id', id)
    .select();
  return { data, error };
}

export async function insertReadingList(
  payload: Database['public']['Tables']['user_reading_lists']['Insert']
) {
  const { data, error } = await (client as any).from('user_reading_lists').insert(payload).select();
  return { data, error };
}

export async function insertReadingListItem(
  payload: Database['public']['Tables']['reading_list_items']['Insert']
) {
  const { data, error } = await (client as any).from('reading_list_items').insert(payload).select();
  return { data, error };
}

export async function deleteReadingListItemByKeys(listId: string, storyId: string) {
  const { data, error } = await (client as any)
    .from('reading_list_items')
    .delete()
    .eq('list_id', listId)
    .eq('story_id', storyId);
  return { data, error };
}

// AI / enhancement helpers
export async function insertAIPromptTemplate(
  payload:
    | Database['public']['Tables']['ai_prompt_templates']['Insert']
    | Database['public']['Tables']['ai_prompt_templates']['Insert'][]
) {
  const { data, error } = await (client as any)
    .from('ai_prompt_templates')
    .insert(payload)
    .select();
  return { data, error };
}

export async function updateAIPromptTemplateById(
  id: string,
  patch: Database['public']['Tables']['ai_prompt_templates']['Update']
) {
  const { data, error } = await (client as any)
    .from('ai_prompt_templates')
    .update(patch)
    .eq('id', id)
    .select();
  return { data, error };
}

export async function insertDynamicPromptChain(
  payload:
    | Database['public']['Tables']['dynamic_prompt_chains']['Insert']
    | Database['public']['Tables']['dynamic_prompt_chains']['Insert'][]
) {
  const { data, error } = await (client as any)
    .from('dynamic_prompt_chains')
    .insert(payload)
    .select();
  return { data, error };
}

export async function insertProceduralContent(
  payload:
    | Database['public']['Tables']['procedural_content']['Insert']
    | Database['public']['Tables']['procedural_content']['Insert'][]
) {
  const { data, error } = await (client as any).from('procedural_content').insert(payload).select();
  return { data, error };
}

export async function insertReadingJourneyRecap(
  payload:
    | Database['public']['Tables']['reading_journey_recaps']['Insert']
    | Database['public']['Tables']['reading_journey_recaps']['Insert'][]
) {
  const { data, error } = await (client as any)
    .from('reading_journey_recaps')
    .insert(payload)
    .select();
  return { data, error };
}

export async function insertStoryTranslation(
  payload:
    | Database['public']['Tables']['story_translations']['Insert']
    | Database['public']['Tables']['story_translations']['Insert'][]
) {
  const { data, error } = await (client as any).from('story_translations').insert(payload).select();
  return { data, error };
}

export async function insertGlossaryEntry(
  payload:
    | Database['public']['Tables']['story_glossary']['Insert']
    | Database['public']['Tables']['story_glossary']['Insert'][]
) {
  const { data, error } = await (client as any).from('story_glossary').insert(payload).select();
  return { data, error };
}

export async function insertWritingPrompt(
  payload:
    | Database['public']['Tables']['writing_prompts']['Insert']
    | Database['public']['Tables']['writing_prompts']['Insert'][]
) {
  const { data, error } = await (client as any).from('writing_prompts').insert(payload).select();
  return { data, error };
}
