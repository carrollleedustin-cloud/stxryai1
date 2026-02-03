/**
 * Audio Player Service
 * Persistent audio player for TTS narration with background playback support
 */

import { createClient } from '@/lib/supabase/client';

export interface AudioPlayerState {
  storyId: string | null;
  chapterId: string | null;
  positionSeconds: number;
  playbackSpeed: number;
  volume: number;
  isPlaying: boolean;
  voiceId: string;
}

export interface CharacterVoice {
  characterName: string;
  voiceId: string;
  voiceSettings: {
    speed: number;
    pitch: number;
  };
}

export interface SleepTimer {
  timerType: 'duration' | 'chapter_end' | 'story_end';
  durationMinutes: number | null;
  endTime: Date | null;
  isActive: boolean;
}

export type VoiceId = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface VoiceOption {
  id: VoiceId;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  style: string;
}

class AudioPlayerService {
  private supabase = createClient();

  // Available TTS voices
  readonly voices: VoiceOption[] = [
    { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced', gender: 'neutral', style: 'conversational' },
    { id: 'echo', name: 'Echo', description: 'Warm and engaging', gender: 'male', style: 'narrative' },
    { id: 'fable', name: 'Fable', description: 'Expressive and dynamic', gender: 'neutral', style: 'storytelling' },
    { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative', gender: 'male', style: 'dramatic' },
    { id: 'nova', name: 'Nova', description: 'Bright and energetic', gender: 'female', style: 'upbeat' },
    { id: 'shimmer', name: 'Shimmer', description: 'Soft and soothing', gender: 'female', style: 'calm' },
  ];

  /**
   * Get current player state for user
   */
  async getPlayerState(userId: string): Promise<AudioPlayerState | null> {
    try {
      const { data, error } = await this.supabase
        .from('audio_player_state')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching player state:', error);
        return null;
      }

      if (!data) {
        return {
          storyId: null,
          chapterId: null,
          positionSeconds: 0,
          playbackSpeed: 1.0,
          volume: 1.0,
          isPlaying: false,
          voiceId: 'alloy',
        };
      }

      return {
        storyId: data.story_id,
        chapterId: data.chapter_id,
        positionSeconds: data.position_seconds,
        playbackSpeed: data.playback_speed,
        volume: data.volume,
        isPlaying: data.is_playing,
        voiceId: data.voice_id,
      };
    } catch (error) {
      console.error('Error in getPlayerState:', error);
      return null;
    }
  }

  /**
   * Save player state
   */
  async savePlayerState(userId: string, state: Partial<AudioPlayerState>): Promise<void> {
    try {
      await this.supabase.from('audio_player_state').upsert({
        user_id: userId,
        story_id: state.storyId,
        chapter_id: state.chapterId,
        position_seconds: state.positionSeconds,
        playback_speed: state.playbackSpeed,
        volume: state.volume,
        is_playing: state.isPlaying,
        voice_id: state.voiceId,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving player state:', error);
    }
  }

  /**
   * Update playback position
   */
  async updatePosition(userId: string, positionSeconds: number): Promise<void> {
    try {
      await this.supabase
        .from('audio_player_state')
        .update({
          position_seconds: positionSeconds,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating position:', error);
    }
  }

  /**
   * Set playback speed
   */
  async setPlaybackSpeed(userId: string, speed: number): Promise<void> {
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));
    try {
      await this.supabase
        .from('audio_player_state')
        .update({
          playback_speed: clampedSpeed,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error setting playback speed:', error);
    }
  }

  /**
   * Set volume
   */
  async setVolume(userId: string, volume: number): Promise<void> {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    try {
      await this.supabase
        .from('audio_player_state')
        .update({
          volume: clampedVolume,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  /**
   * Set voice
   */
  async setVoice(userId: string, voiceId: VoiceId): Promise<void> {
    try {
      await this.supabase
        .from('audio_player_state')
        .update({
          voice_id: voiceId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error setting voice:', error);
    }
  }

  /**
   * Get character voices for a story
   */
  async getCharacterVoices(storyId: string): Promise<CharacterVoice[]> {
    try {
      const { data, error } = await this.supabase
        .from('story_character_voices')
        .select('*')
        .eq('story_id', storyId);

      if (error) {
        console.error('Error fetching character voices:', error);
        return [];
      }

      return (data || []).map((cv) => ({
        characterName: cv.character_name,
        voiceId: cv.voice_id,
        voiceSettings: cv.voice_settings || { speed: 1.0, pitch: 1.0 },
      }));
    } catch (error) {
      console.error('Error in getCharacterVoices:', error);
      return [];
    }
  }

  /**
   * Set character voice
   */
  async setCharacterVoice(
    storyId: string,
    characterName: string,
    voiceId: VoiceId,
    userId: string,
    settings?: { speed?: number; pitch?: number }
  ): Promise<void> {
    try {
      await this.supabase.from('story_character_voices').upsert({
        story_id: storyId,
        character_name: characterName,
        voice_id: voiceId,
        voice_settings: {
          speed: settings?.speed || 1.0,
          pitch: settings?.pitch || 1.0,
        },
        created_by: userId,
      });
    } catch (error) {
      console.error('Error setting character voice:', error);
    }
  }

  /**
   * Get sleep timer
   */
  async getSleepTimer(userId: string): Promise<SleepTimer | null> {
    try {
      const { data, error } = await this.supabase
        .from('audio_sleep_timers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sleep timer:', error);
        return null;
      }

      if (!data || !data.is_active) {
        return null;
      }

      return {
        timerType: data.timer_type,
        durationMinutes: data.duration_minutes,
        endTime: data.end_time ? new Date(data.end_time) : null,
        isActive: data.is_active,
      };
    } catch (error) {
      console.error('Error in getSleepTimer:', error);
      return null;
    }
  }

  /**
   * Set sleep timer
   */
  async setSleepTimer(
    userId: string,
    timerType: 'duration' | 'chapter_end' | 'story_end',
    durationMinutes?: number
  ): Promise<SleepTimer> {
    try {
      let endTime: Date | null = null;

      if (timerType === 'duration' && durationMinutes) {
        endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + durationMinutes);
      }

      await this.supabase.from('audio_sleep_timers').upsert({
        user_id: userId,
        timer_type: timerType,
        duration_minutes: durationMinutes || null,
        start_time: new Date().toISOString(),
        end_time: endTime?.toISOString() || null,
        is_active: true,
      });

      return {
        timerType,
        durationMinutes: durationMinutes || null,
        endTime,
        isActive: true,
      };
    } catch (error) {
      console.error('Error setting sleep timer:', error);
      return {
        timerType,
        durationMinutes: durationMinutes || null,
        endTime: null,
        isActive: false,
      };
    }
  }

  /**
   * Cancel sleep timer
   */
  async cancelSleepTimer(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('audio_sleep_timers')
        .update({ is_active: false })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error canceling sleep timer:', error);
    }
  }

  /**
   * Get cached audio URL
   */
  async getCachedAudio(contentHash: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('audio_cache')
        .select('audio_url')
        .eq('content_hash', contentHash)
        .single();

      if (error || !data) {
        return null;
      }

      // Update access count
      await this.supabase
        .from('audio_cache')
        .update({
          last_accessed_at: new Date().toISOString(),
          access_count: data.access_count + 1,
        })
        .eq('content_hash', contentHash);

      return data.audio_url;
    } catch (error) {
      console.error('Error getting cached audio:', error);
      return null;
    }
  }

  /**
   * Cache audio URL
   */
  async cacheAudio(
    contentHash: string,
    voiceId: string,
    audioUrl: string,
    durationSeconds: number,
    fileSizeBytes: number
  ): Promise<void> {
    try {
      await this.supabase.from('audio_cache').insert({
        content_hash: contentHash,
        voice_id: voiceId,
        audio_url: audioUrl,
        duration_seconds: durationSeconds,
        file_size_bytes: fileSizeBytes,
      });
    } catch (error) {
      // Ignore duplicate key errors
      if ((error as any)?.code !== '23505') {
        console.error('Error caching audio:', error);
      }
    }
  }

  /**
   * Generate content hash for caching
   */
  generateContentHash(text: string, voiceId: string): string {
    // Simple hash function for demo - use crypto in production
    const str = `${text}-${voiceId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  /**
   * Record playback session
   */
  async startPlaybackSession(
    userId: string,
    storyId: string,
    chapterId: string | null,
    voiceId: string
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('audio_playback_sessions')
        .insert({
          user_id: userId,
          story_id: storyId,
          chapter_id: chapterId,
          voice_id: voiceId,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error starting playback session:', error);
        return '';
      }

      return data.id;
    } catch (error) {
      console.error('Error in startPlaybackSession:', error);
      return '';
    }
  }

  /**
   * End playback session
   */
  async endPlaybackSession(
    sessionId: string,
    durationSeconds: number,
    positionSeconds: number
  ): Promise<void> {
    try {
      await this.supabase
        .from('audio_playback_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
          position_seconds: positionSeconds,
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error ending playback session:', error);
    }
  }

  /**
   * Get user's TTS preferences
   */
  async getTTSPreferences(userId: string): Promise<{
    defaultVoice: VoiceId;
    playbackSpeed: number;
    autoPlay: boolean;
    highlightText: boolean;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_tts_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching TTS preferences:', error);
      }

      return {
        defaultVoice: (data?.default_voice as VoiceId) || 'alloy',
        playbackSpeed: data?.playback_speed || 1.0,
        autoPlay: data?.auto_play || false,
        highlightText: data?.highlight_text ?? true,
      };
    } catch (error) {
      console.error('Error in getTTSPreferences:', error);
      return {
        defaultVoice: 'alloy',
        playbackSpeed: 1.0,
        autoPlay: false,
        highlightText: true,
      };
    }
  }

  /**
   * Update TTS preferences
   */
  async updateTTSPreferences(
    userId: string,
    preferences: Partial<{
      defaultVoice: VoiceId;
      playbackSpeed: number;
      autoPlay: boolean;
      highlightText: boolean;
    }>
  ): Promise<void> {
    try {
      await this.supabase.from('user_tts_preferences').upsert({
        user_id: userId,
        default_voice: preferences.defaultVoice,
        playback_speed: preferences.playbackSpeed,
        auto_play: preferences.autoPlay,
        highlight_text: preferences.highlightText,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating TTS preferences:', error);
    }
  }
}

export const audioPlayerService = new AudioPlayerService();
