/**
 * Text-to-Speech Service
 * Manages TTS voices, audio generation, and playback
 */

import { createClient } from '@/lib/supabase/client';

export interface TTSVoice {
  id: string;
  voiceName: string;
  voiceId: string;
  provider: 'openai' | 'elevenlabs' | 'google' | 'amazon' | 'azure';
  gender?: 'male' | 'female' | 'neutral';
  languageCode: string;
  accent?: string;
  ageRange?: string;
  qualityTier: 'standard' | 'premium' | 'ultra';
  isPremium: boolean;
  isCharacterVoice: boolean;
  speed: number;
  pitch: number;
  stability: number;
  similarityBoost: number;
  sampleAudioUrl?: string;
  description?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterVoice {
  id: string;
  storyId: string;
  characterName: string;
  voiceId: string;
  customSpeed?: number;
  customPitch?: number;
  customStability?: number;
  customSimilarityBoost?: number;
  voiceDescription?: string;
  emotionMappings: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AudioGeneration {
  id: string;
  userId?: string;
  storyId?: string;
  chapterId?: string;
  textContent: string;
  voiceId: string;
  characterName?: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  audioFileSizeBytes?: number;
  audioFormat: 'mp3' | 'wav' | 'ogg' | 'm4a';
  speed: number;
  pitch: number;
  stability: number;
  similarityBoost: number;
  generationStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  provider: string;
  providerJobId?: string;
  providerCost?: number;
  qualityScore?: number;
  userRating?: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AudioPlaybackSession {
  id: string;
  userId: string;
  storyId: string;
  chapterId?: string;
  currentAudioId?: string;
  playbackPositionSeconds: number;
  isPlaying: boolean;
  playbackSpeed: number;
  sessionStartedAt: string;
  lastPlayedAt?: string;
  totalListenTimeSeconds: number;
  autoPlayNext: boolean;
  backgroundPlayback: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserTTSPreferences {
  id: string;
  userId: string;
  defaultVoiceId?: string;
  defaultSpeed: number;
  defaultPitch: number;
  autoPlayEnabled: boolean;
  backgroundPlaybackEnabled: boolean;
  skipSilence: boolean;
  preferredQualityTier: 'standard' | 'premium' | 'ultra';
  useCharacterVoices: boolean;
  premiumVoicesEnabled: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class TTSService {
  private supabase = createClient();

  // ========================================
  // VOICES
  // ========================================

  /**
   * Get available voices
   */
  async getVoices(options?: {
    provider?: TTSVoice['provider'];
    isPremium?: boolean;
    isCharacterVoice?: boolean;
    qualityTier?: TTSVoice['qualityTier'];
  }): Promise<TTSVoice[]> {
    let query = this.supabase
      .from('tts_voices')
      .select('*')
      .order('voice_name', { ascending: true });

    if (options?.provider) {
      query = query.eq('provider', options.provider);
    }
    if (options?.isPremium !== undefined) {
      query = query.eq('is_premium', options.isPremium);
    }
    if (options?.isCharacterVoice !== undefined) {
      query = query.eq('is_character_voice', options.isCharacterVoice);
    }
    if (options?.qualityTier) {
      query = query.eq('quality_tier', options.qualityTier);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapVoice(item));
  }

  /**
   * Get a single voice
   */
  async getVoice(voiceId: string): Promise<TTSVoice | null> {
    const { data, error } = await this.supabase
      .from('tts_voices')
      .select('*')
      .eq('id', voiceId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapVoice(data);
  }

  // ========================================
  // CHARACTER VOICES
  // ========================================

  /**
   * Assign a voice to a character
   */
  async assignCharacterVoice(
    storyId: string,
    characterName: string,
    voiceId: string,
    settings?: Partial<CharacterVoice>
  ): Promise<CharacterVoice> {
    const { data, error } = await this.supabase
      .from('character_voices')
      .upsert({
        story_id: storyId,
        character_name: characterName,
        voice_id: voiceId,
        custom_speed: settings?.customSpeed,
        custom_pitch: settings?.customPitch,
        custom_stability: settings?.customStability,
        custom_similarity_boost: settings?.customSimilarityBoost,
        voice_description: settings?.voiceDescription,
        emotion_mappings: settings?.emotionMappings || {},
      }, {
        onConflict: 'story_id,character_name',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapCharacterVoice(data);
  }

  /**
   * Get character voices for a story
   */
  async getStoryCharacterVoices(storyId: string): Promise<CharacterVoice[]> {
    const { data, error } = await this.supabase
      .from('character_voices')
      .select('*')
      .eq('story_id', storyId);

    if (error) throw error;
    return (data || []).map((item: any) => this.mapCharacterVoice(item));
  }

  // ========================================
  // AUDIO GENERATION
  // ========================================

  /**
   * Generate audio from text
   */
  async generateAudio(
    text: string,
    voiceId: string,
    options?: {
      userId?: string;
      storyId?: string;
      chapterId?: string;
      characterName?: string;
      speed?: number;
      pitch?: number;
      stability?: number;
      similarityBoost?: number;
    }
  ): Promise<AudioGeneration> {
    // TODO: Integrate with actual TTS API (OpenAI, ElevenLabs, etc.)
    // For now, create a placeholder record

    const { data, error } = await this.supabase
      .from('audio_generations')
      .insert({
        user_id: options?.userId,
        story_id: options?.storyId,
        chapter_id: options?.chapterId,
        text_content: text,
        voice_id: voiceId,
        character_name: options?.characterName,
        speed: options?.speed || 1.0,
        pitch: options?.pitch || 1.0,
        stability: options?.stability || 0.5,
        similarity_boost: options?.similarityBoost || 0.5,
        generation_status: 'pending',
        provider: 'openai', // Would be determined by voice provider
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapAudioGeneration(data);
  }

  /**
   * Get user's audio generations
   */
  async getUserAudioGenerations(
    userId: string,
    storyId?: string
  ): Promise<AudioGeneration[]> {
    let query = this.supabase
      .from('audio_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (storyId) {
      query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapAudioGeneration(item));
  }

  // ========================================
  // PLAYBACK SESSIONS
  // ========================================

  /**
   * Start or get playback session
   */
  async getOrCreatePlaybackSession(
    userId: string,
    storyId: string,
    chapterId?: string
  ): Promise<AudioPlaybackSession> {
    const { data: existing } = await this.supabase
      .from('audio_playback_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .eq('is_playing', true)
      .single();

    if (existing) {
      return this.mapPlaybackSession(existing);
    }

    const { data, error } = await this.supabase
      .from('audio_playback_sessions')
      .insert({
        user_id: userId,
        story_id: storyId,
        chapter_id: chapterId,
        is_playing: false,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapPlaybackSession(data);
  }

  /**
   * Update playback position
   */
  async updatePlaybackPosition(
    sessionId: string,
    positionSeconds: number,
    isPlaying: boolean
  ): Promise<AudioPlaybackSession> {
    const { data, error } = await this.supabase
      .from('audio_playback_sessions')
      .update({
        playback_position_seconds: positionSeconds,
        is_playing: isPlaying,
        last_played_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapPlaybackSession(data);
  }

  // ========================================
  // USER PREFERENCES
  // ========================================

  /**
   * Get user TTS preferences
   */
  async getUserPreferences(userId: string): Promise<UserTTSPreferences | null> {
    const { data, error } = await this.supabase
      .from('user_tts_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapPreferences(data);
  }

  /**
   * Update user TTS preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<UserTTSPreferences>
  ): Promise<UserTTSPreferences> {
    const { data, error } = await this.supabase
      .from('user_tts_preferences')
      .upsert({
        user_id: userId,
        default_voice_id: preferences.defaultVoiceId,
        default_speed: preferences.defaultSpeed,
        default_pitch: preferences.defaultPitch,
        auto_play_enabled: preferences.autoPlayEnabled,
        background_playback_enabled: preferences.backgroundPlaybackEnabled,
        skip_silence: preferences.skipSilence,
        preferred_quality_tier: preferences.preferredQualityTier,
        use_character_voices: preferences.useCharacterVoices,
        premium_voices_enabled: preferences.premiumVoicesEnabled,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapPreferences(data);
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapVoice(data: any): TTSVoice {
    return {
      id: data.id,
      voiceName: data.voice_name,
      voiceId: data.voice_id,
      provider: data.provider,
      gender: data.gender,
      languageCode: data.language_code,
      accent: data.accent,
      ageRange: data.age_range,
      qualityTier: data.quality_tier,
      isPremium: data.is_premium,
      isCharacterVoice: data.is_character_voice,
      speed: parseFloat(data.speed || '1.0'),
      pitch: parseFloat(data.pitch || '1.0'),
      stability: parseFloat(data.stability || '0.5'),
      similarityBoost: parseFloat(data.similarity_boost || '0.5'),
      sampleAudioUrl: data.sample_audio_url,
      description: data.description,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapCharacterVoice(data: any): CharacterVoice {
    return {
      id: data.id,
      storyId: data.story_id,
      characterName: data.character_name,
      voiceId: data.voice_id,
      customSpeed: data.custom_speed ? parseFloat(data.custom_speed) : undefined,
      customPitch: data.custom_pitch ? parseFloat(data.custom_pitch) : undefined,
      customStability: data.custom_stability ? parseFloat(data.custom_stability) : undefined,
      customSimilarityBoost: data.custom_similarity_boost ? parseFloat(data.custom_similarity_boost) : undefined,
      voiceDescription: data.voice_description,
      emotionMappings: data.emotion_mappings || {},
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapAudioGeneration(data: any): AudioGeneration {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      chapterId: data.chapter_id,
      textContent: data.text_content,
      voiceId: data.voice_id,
      characterName: data.character_name,
      audioUrl: data.audio_url,
      audioDurationSeconds: data.audio_duration_seconds ? parseFloat(data.audio_duration_seconds) : undefined,
      audioFileSizeBytes: data.audio_file_size_bytes,
      audioFormat: data.audio_format,
      speed: parseFloat(data.speed || '1.0'),
      pitch: parseFloat(data.pitch || '1.0'),
      stability: parseFloat(data.stability || '0.5'),
      similarityBoost: parseFloat(data.similarity_boost || '0.5'),
      generationStatus: data.generation_status,
      errorMessage: data.error_message,
      provider: data.provider,
      providerJobId: data.provider_job_id,
      providerCost: data.provider_cost ? parseFloat(data.provider_cost) : undefined,
      qualityScore: data.quality_score ? parseFloat(data.quality_score) : undefined,
      userRating: data.user_rating,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapPlaybackSession(data: any): AudioPlaybackSession {
    return {
      id: data.id,
      userId: data.user_id,
      storyId: data.story_id,
      chapterId: data.chapter_id,
      currentAudioId: data.current_audio_id,
      playbackPositionSeconds: parseFloat(data.playback_position_seconds || '0'),
      isPlaying: data.is_playing,
      playbackSpeed: parseFloat(data.playback_speed || '1.0'),
      sessionStartedAt: data.session_started_at,
      lastPlayedAt: data.last_played_at,
      totalListenTimeSeconds: parseFloat(data.total_listen_time_seconds || '0'),
      autoPlayNext: data.auto_play_next,
      backgroundPlayback: data.background_playback,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapPreferences(data: any): UserTTSPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      defaultVoiceId: data.default_voice_id,
      defaultSpeed: parseFloat(data.default_speed || '1.0'),
      defaultPitch: parseFloat(data.default_pitch || '1.0'),
      autoPlayEnabled: data.auto_play_enabled,
      backgroundPlaybackEnabled: data.background_playback_enabled,
      skipSilence: data.skip_silence,
      preferredQualityTier: data.preferred_quality_tier,
      useCharacterVoices: data.use_character_voices,
      premiumVoicesEnabled: data.premium_voices_enabled,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const ttsService = new TTSService();

