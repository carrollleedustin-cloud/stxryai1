/**
 * Story Soundtrack Service
 * Curated playlists, ambient sounds, and music cues for stories
 */

import { createClient } from '@/lib/supabase/client';

export interface StorySoundtrack {
  id: string;
  storyId: string;
  name: string | null;
  description: string | null;
  isDefault: boolean;
  platform: 'spotify' | 'apple_music' | 'youtube_music' | 'custom';
  playlistUrl: string | null;
  playlistId: string | null;
  trackCount: number;
  tracks?: SoundtrackTrack[];
}

export interface SoundtrackTrack {
  id: string;
  trackName: string;
  artist: string | null;
  platformTrackId: string | null;
  durationSeconds: number | null;
  previewUrl: string | null;
  orderIndex: number;
}

export interface AmbientSound {
  id: string;
  name: string;
  category: 'nature' | 'weather' | 'urban' | 'fantasy' | 'scifi' | 'horror' | 'calm';
  audioUrl: string;
  durationSeconds: number | null;
  isLoopable: boolean;
}

export interface ChapterMusicCue {
  id: string;
  chapterId: string;
  soundtrackId: string | null;
  trackId: string | null;
  cueType: 'chapter_start' | 'mood_change' | 'action' | 'emotional' | 'ending';
  triggerPosition: number | null;
  triggerText: string | null;
}

export interface UserSoundPreferences {
  musicEnabled: boolean;
  ambientEnabled: boolean;
  musicVolume: number;
  ambientVolume: number;
  autoPlayMusic: boolean;
  preferredPlatform: 'spotify' | 'apple_music' | 'youtube_music' | 'custom';
  connectedSpotify: boolean;
}

class StorySoundtrackService {
  private supabase = createClient();

  /**
   * Get soundtrack for story
   */
  async getStorySoundtrack(storyId: string, includesTracks: boolean = true): Promise<StorySoundtrack | null> {
    try {
      const { data, error } = await this.supabase
        .from('story_soundtracks')
        .select('*')
        .eq('story_id', storyId)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching soundtrack:', error);
        return null;
      }

      if (!data) return null;

      const soundtrack = this.mapSoundtrack(data);

      if (includesTracks) {
        soundtrack.tracks = await this.getSoundtrackTracks(soundtrack.id);
      }

      return soundtrack;
    } catch (error) {
      console.error('Error in getStorySoundtrack:', error);
      return null;
    }
  }

  /**
   * Get all soundtracks for story
   */
  async getAllStorySoundtracks(storyId: string): Promise<StorySoundtrack[]> {
    try {
      const { data, error } = await this.supabase
        .from('story_soundtracks')
        .select('*')
        .eq('story_id', storyId)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Error fetching soundtracks:', error);
        return [];
      }

      return (data || []).map(this.mapSoundtrack);
    } catch (error) {
      console.error('Error in getAllStorySoundtracks:', error);
      return [];
    }
  }

  /**
   * Get soundtrack tracks
   */
  async getSoundtrackTracks(soundtrackId: string): Promise<SoundtrackTrack[]> {
    try {
      const { data, error } = await this.supabase
        .from('soundtrack_tracks')
        .select('*')
        .eq('soundtrack_id', soundtrackId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching tracks:', error);
        return [];
      }

      return (data || []).map(t => ({
        id: t.id,
        trackName: t.track_name,
        artist: t.artist,
        platformTrackId: t.platform_track_id,
        durationSeconds: t.duration_seconds,
        previewUrl: t.preview_url,
        orderIndex: t.order_index,
      }));
    } catch (error) {
      console.error('Error in getSoundtrackTracks:', error);
      return [];
    }
  }

  /**
   * Create soundtrack for story
   */
  async createSoundtrack(
    storyId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      platform?: StorySoundtrack['platform'];
      playlistUrl?: string;
      playlistId?: string;
    }
  ): Promise<StorySoundtrack | null> {
    try {
      // Check if there's an existing default
      const { data: existing } = await this.supabase
        .from('story_soundtracks')
        .select('id')
        .eq('story_id', storyId)
        .eq('is_default', true)
        .single();

      const { data: soundtrack, error } = await this.supabase
        .from('story_soundtracks')
        .insert({
          story_id: storyId,
          created_by: userId,
          name: data.name || 'Soundtrack',
          description: data.description,
          platform: data.platform || 'custom',
          playlist_url: data.playlistUrl,
          playlist_id: data.playlistId,
          is_default: !existing,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating soundtrack:', error);
        return null;
      }

      return this.mapSoundtrack(soundtrack);
    } catch (error) {
      console.error('Error in createSoundtrack:', error);
      return null;
    }
  }

  /**
   * Add track to soundtrack
   */
  async addTrack(
    soundtrackId: string,
    trackData: {
      trackName: string;
      artist?: string;
      platformTrackId?: string;
      durationSeconds?: number;
      previewUrl?: string;
    }
  ): Promise<SoundtrackTrack | null> {
    try {
      // Get current max order
      const { data: maxOrder } = await this.supabase
        .from('soundtrack_tracks')
        .select('order_index')
        .eq('soundtrack_id', soundtrackId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const newOrder = (maxOrder?.order_index || -1) + 1;

      const { data: track, error } = await this.supabase
        .from('soundtrack_tracks')
        .insert({
          soundtrack_id: soundtrackId,
          track_name: trackData.trackName,
          artist: trackData.artist,
          platform_track_id: trackData.platformTrackId,
          duration_seconds: trackData.durationSeconds,
          preview_url: trackData.previewUrl,
          order_index: newOrder,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding track:', error);
        return null;
      }

      // Update track count
      await this.supabase.rpc('increment_soundtrack_track_count', { soundtrack_id: soundtrackId });

      return {
        id: track.id,
        trackName: track.track_name,
        artist: track.artist,
        platformTrackId: track.platform_track_id,
        durationSeconds: track.duration_seconds,
        previewUrl: track.preview_url,
        orderIndex: track.order_index,
      };
    } catch (error) {
      console.error('Error in addTrack:', error);
      return null;
    }
  }

  /**
   * Get ambient sounds
   */
  async getAmbientSounds(category?: AmbientSound['category']): Promise<AmbientSound[]> {
    try {
      let query = this.supabase.from('ambient_sounds').select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching ambient sounds:', error);
        return [];
      }

      return (data || []).map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        audioUrl: s.audio_url,
        durationSeconds: s.duration_seconds,
        isLoopable: s.is_loopable,
      }));
    } catch (error) {
      console.error('Error in getAmbientSounds:', error);
      return [];
    }
  }

  /**
   * Get ambient sounds for chapter
   */
  async getChapterAmbientSounds(chapterId: string): Promise<Array<AmbientSound & { volume: number }>> {
    try {
      const { data, error } = await this.supabase
        .from('chapter_ambient_sounds')
        .select(`
          volume,
          ambient_sounds!chapter_ambient_sounds_ambient_sound_id_fkey (*)
        `)
        .eq('chapter_id', chapterId);

      if (error) {
        console.error('Error fetching chapter sounds:', error);
        return [];
      }

      return (data || []).map(d => {
        const sound = d.ambient_sounds as any;
        return {
          id: sound.id,
          name: sound.name,
          category: sound.category,
          audioUrl: sound.audio_url,
          durationSeconds: sound.duration_seconds,
          isLoopable: sound.is_loopable,
          volume: d.volume,
        };
      });
    } catch (error) {
      console.error('Error in getChapterAmbientSounds:', error);
      return [];
    }
  }

  /**
   * Set chapter ambient sound
   */
  async setChapterAmbientSound(
    chapterId: string,
    ambientSoundId: string,
    volume: number = 0.5
  ): Promise<boolean> {
    try {
      await this.supabase.from('chapter_ambient_sounds').upsert({
        chapter_id: chapterId,
        ambient_sound_id: ambientSoundId,
        volume,
      });

      return true;
    } catch (error) {
      console.error('Error setting chapter sound:', error);
      return false;
    }
  }

  /**
   * Get music cues for chapter
   */
  async getChapterMusicCues(chapterId: string): Promise<ChapterMusicCue[]> {
    try {
      const { data, error } = await this.supabase
        .from('chapter_music_cues')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('trigger_position', { ascending: true, nullsFirst: true });

      if (error) {
        console.error('Error fetching music cues:', error);
        return [];
      }

      return (data || []).map(c => ({
        id: c.id,
        chapterId: c.chapter_id,
        soundtrackId: c.soundtrack_id,
        trackId: c.track_id,
        cueType: c.cue_type,
        triggerPosition: c.trigger_position,
        triggerText: c.trigger_text,
      }));
    } catch (error) {
      console.error('Error in getChapterMusicCues:', error);
      return [];
    }
  }

  /**
   * Add music cue
   */
  async addMusicCue(
    chapterId: string,
    data: {
      soundtrackId?: string;
      trackId?: string;
      cueType: ChapterMusicCue['cueType'];
      triggerPosition?: number;
      triggerText?: string;
    }
  ): Promise<ChapterMusicCue | null> {
    try {
      const { data: cue, error } = await this.supabase
        .from('chapter_music_cues')
        .insert({
          chapter_id: chapterId,
          soundtrack_id: data.soundtrackId,
          track_id: data.trackId,
          cue_type: data.cueType,
          trigger_position: data.triggerPosition,
          trigger_text: data.triggerText,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding music cue:', error);
        return null;
      }

      return {
        id: cue.id,
        chapterId: cue.chapter_id,
        soundtrackId: cue.soundtrack_id,
        trackId: cue.track_id,
        cueType: cue.cue_type,
        triggerPosition: cue.trigger_position,
        triggerText: cue.trigger_text,
      };
    } catch (error) {
      console.error('Error in addMusicCue:', error);
      return null;
    }
  }

  /**
   * Get user sound preferences
   */
  async getUserSoundPreferences(userId: string): Promise<UserSoundPreferences> {
    try {
      const { data, error } = await this.supabase
        .from('user_sound_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sound preferences:', error);
      }

      if (!data) {
        return {
          musicEnabled: true,
          ambientEnabled: true,
          musicVolume: 0.7,
          ambientVolume: 0.5,
          autoPlayMusic: false,
          preferredPlatform: 'spotify',
          connectedSpotify: false,
        };
      }

      return {
        musicEnabled: data.music_enabled,
        ambientEnabled: data.ambient_enabled,
        musicVolume: data.music_volume,
        ambientVolume: data.ambient_volume,
        autoPlayMusic: data.auto_play_music,
        preferredPlatform: data.preferred_platform,
        connectedSpotify: data.connected_spotify,
      };
    } catch (error) {
      console.error('Error in getUserSoundPreferences:', error);
      return {
        musicEnabled: true,
        ambientEnabled: true,
        musicVolume: 0.7,
        ambientVolume: 0.5,
        autoPlayMusic: false,
        preferredPlatform: 'spotify',
        connectedSpotify: false,
      };
    }
  }

  /**
   * Update user sound preferences
   */
  async updateUserSoundPreferences(
    userId: string,
    preferences: Partial<UserSoundPreferences>
  ): Promise<boolean> {
    try {
      await this.supabase.from('user_sound_preferences').upsert({
        user_id: userId,
        music_enabled: preferences.musicEnabled,
        ambient_enabled: preferences.ambientEnabled,
        music_volume: preferences.musicVolume,
        ambient_volume: preferences.ambientVolume,
        auto_play_music: preferences.autoPlayMusic,
        preferred_platform: preferences.preferredPlatform,
        connected_spotify: preferences.connectedSpotify,
      });

      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }

  /**
   * Get recommended soundtracks by genre
   */
  async getRecommendedSoundtracks(genre: string, limit: number = 5): Promise<StorySoundtrack[]> {
    try {
      // Get stories in this genre with soundtracks
      const { data: stories } = await this.supabase
        .from('stories')
        .select('id')
        .eq('genre', genre)
        .eq('is_published', true)
        .limit(20);

      if (!stories || stories.length === 0) {
        return [];
      }

      const storyIds = stories.map(s => s.id);

      const { data, error } = await this.supabase
        .from('story_soundtracks')
        .select('*')
        .in('story_id', storyIds)
        .limit(limit);

      if (error) {
        console.error('Error fetching recommended soundtracks:', error);
        return [];
      }

      return (data || []).map(this.mapSoundtrack);
    } catch (error) {
      console.error('Error in getRecommendedSoundtracks:', error);
      return [];
    }
  }

  private mapSoundtrack(data: any): StorySoundtrack {
    return {
      id: data.id,
      storyId: data.story_id,
      name: data.name,
      description: data.description,
      isDefault: data.is_default,
      platform: data.platform,
      playlistUrl: data.playlist_url,
      playlistId: data.playlist_id,
      trackCount: data.track_count,
    };
  }
}

export const storySoundtrackService = new StorySoundtrackService();
