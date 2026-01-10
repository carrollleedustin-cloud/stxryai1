/**
 * Family Collaboration System
 * Multi-generational story co-creation and family engagement tools
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: 'parent' | 'grandparent' | 'child' | 'guardian' | 'sibling';
  displayName: string;
  avatar: string;
  age?: number;
  joinedAt: Date;
  permissions: FamilyPermissions;
}

export interface FamilyPermissions {
  canCreateStories: boolean;
  canEditStories: boolean;
  canPublishStories: boolean;
  canInviteMembers: boolean;
  canManageFamily: boolean;
  canViewProgress: boolean;
  canRecordVoice: boolean;
}

export interface FamilyCircle {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  members: FamilyMember[];
  inviteCode: string;
  settings: FamilySettings;
}

export interface FamilySettings {
  allowChildSoloCreation: boolean;
  requireAdultApproval: boolean;
  contentFiltering: 'strict' | 'moderate' | 'relaxed';
  readingTimeGoals: {
    daily: number; // minutes
    weekly: number;
  };
  screenTimeLimit?: number; // minutes per day
  allowExternalSharing: boolean;
}

export interface FamilyStorySession {
  id: string;
  familyId: string;
  storyId: string;
  type: 'co-creation' | 'reading-circle' | 'voice-recording';
  activeMembers: string[]; // user IDs
  startedAt: Date;
  endedAt?: Date;
  contributions: StoryContribution[];
}

export interface StoryContribution {
  id: string;
  sessionId: string;
  userId: string;
  type: 'text' | 'voice' | 'illustration' | 'choice';
  content: string;
  timestamp: Date;
  approved: boolean;
}

export interface VoiceRecording {
  id: string;
  storyId: string;
  chapterId: string;
  recordedBy: string;
  audioUrl: string;
  duration: number; // seconds
  createdAt: Date;
  isPublic: boolean;
}

export interface FamilyAchievement {
  id: string;
  familyId: string;
  type: 'collaborative-story' | 'reading-streak' | 'voice-recordings' | 'multi-gen-session';
  title: string;
  description: string;
  unlockedAt: Date;
  participants: string[]; // user IDs
  reward: {
    xp: number;
    currency: number;
    badge?: string;
  };
}

export interface IntergenerationalPrompt {
  id: string;
  category: 'family-history' | 'cultural-heritage' | 'life-lessons' | 'creative-fiction';
  prompt: string;
  questions: string[];
  suggestedRoles: {
    elder: string; // What the elder contributes
    parent: string; // What the parent contributes
    child: string; // What the child contributes
  };
}

// ============================================================================
// FAMILY CIRCLE MANAGEMENT
// ============================================================================

export class FamilyCollaborationManager {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new family circle
   */
  async createFamilyCircle(
    creatorId: string,
    name: string,
    description: string
  ): Promise<FamilyCircle> {
    const inviteCode = this.generateInviteCode();

    const familyCircle: FamilyCircle = {
      id: crypto.randomUUID(),
      name,
      description,
      createdBy: creatorId,
      createdAt: new Date(),
      members: [],
      inviteCode,
      settings: {
        allowChildSoloCreation: false,
        requireAdultApproval: true,
        contentFiltering: 'moderate',
        readingTimeGoals: {
          daily: 30,
          weekly: 210,
        },
        allowExternalSharing: false,
      },
    };

    const { data, error } = await this.supabase
      .from('family_circles')
      .insert(familyCircle)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Join family circle with invite code
   */
  async joinFamilyCircle(
    userId: string,
    inviteCode: string,
    role: FamilyMember['role'],
    displayName: string,
    age?: number
  ): Promise<FamilyMember> {
    // Find family by invite code
    const { data: family, error: familyError } = await this.supabase
      .from('family_circles')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (familyError) throw familyError;

    const member: FamilyMember = {
      id: crypto.randomUUID(),
      userId,
      familyId: family.id,
      role,
      displayName,
      avatar: '',
      age,
      joinedAt: new Date(),
      permissions: this.getDefaultPermissions(role),
    };

    const { data, error } = await this.supabase
      .from('family_members')
      .insert(member)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get default permissions based on role
   */
  private getDefaultPermissions(role: FamilyMember['role']): FamilyPermissions {
    switch (role) {
      case 'parent':
      case 'guardian':
        return {
          canCreateStories: true,
          canEditStories: true,
          canPublishStories: true,
          canInviteMembers: true,
          canManageFamily: true,
          canViewProgress: true,
          canRecordVoice: true,
        };
      case 'grandparent':
        return {
          canCreateStories: true,
          canEditStories: true,
          canPublishStories: false,
          canInviteMembers: true,
          canManageFamily: false,
          canViewProgress: true,
          canRecordVoice: true,
        };
      case 'child':
        return {
          canCreateStories: true,
          canEditStories: true,
          canPublishStories: false,
          canInviteMembers: false,
          canManageFamily: false,
          canViewProgress: false,
          canRecordVoice: true,
        };
      case 'sibling':
        return {
          canCreateStories: true,
          canEditStories: true,
          canPublishStories: false,
          canInviteMembers: false,
          canManageFamily: false,
          canViewProgress: false,
          canRecordVoice: true,
        };
      default:
        return {
          canCreateStories: false,
          canEditStories: false,
          canPublishStories: false,
          canInviteMembers: false,
          canManageFamily: false,
          canViewProgress: false,
          canRecordVoice: false,
        };
    }
  }

  /**
   * Generate unique invite code
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Start collaborative story session
   */
  async startStorySession(
    familyId: string,
    storyId: string,
    type: FamilyStorySession['type'],
    memberIds: string[]
  ): Promise<FamilyStorySession> {
    const session: FamilyStorySession = {
      id: crypto.randomUUID(),
      familyId,
      storyId,
      type,
      activeMembers: memberIds,
      startedAt: new Date(),
      contributions: [],
    };

    const { data, error } = await this.supabase
      .from('family_story_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add contribution to story session
   */
  async addContribution(
    sessionId: string,
    userId: string,
    type: StoryContribution['type'],
    content: string
  ): Promise<StoryContribution> {
    const contribution: StoryContribution = {
      id: crypto.randomUUID(),
      sessionId,
      userId,
      type,
      content,
      timestamp: new Date(),
      approved: false,
    };

    const { data, error } = await this.supabase
      .from('story_contributions')
      .insert(contribution)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Record voice narration
   */
  async recordVoiceNarration(
    storyId: string,
    chapterId: string,
    recordedBy: string,
    audioBlob: Blob
  ): Promise<VoiceRecording> {
    // Upload audio file
    const fileName = `voice-${storyId}-${chapterId}-${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('voice-recordings')
      .upload(fileName, audioBlob);

    if (uploadError) throw uploadError;

    const { data: urlData } = this.supabase.storage.from('voice-recordings').getPublicUrl(fileName);

    const recording: VoiceRecording = {
      id: crypto.randomUUID(),
      storyId,
      chapterId,
      recordedBy,
      audioUrl: urlData.publicUrl,
      duration: 0, // Calculate from blob
      createdAt: new Date(),
      isPublic: false,
    };

    const { data, error } = await this.supabase
      .from('voice_recordings')
      .insert(recording)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get family achievements
   */
  async getFamilyAchievements(familyId: string): Promise<FamilyAchievement[]> {
    const { data, error } = await this.supabase
      .from('family_achievements')
      .select('*')
      .eq('family_id', familyId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Award family achievement
   */
  async awardFamilyAchievement(
    familyId: string,
    type: FamilyAchievement['type'],
    title: string,
    description: string,
    participants: string[],
    reward: FamilyAchievement['reward']
  ): Promise<FamilyAchievement> {
    const achievement: FamilyAchievement = {
      id: crypto.randomUUID(),
      familyId,
      type,
      title,
      description,
      unlockedAt: new Date(),
      participants,
      reward,
    };

    const { data, error } = await this.supabase
      .from('family_achievements')
      .insert(achievement)
      .select()
      .single();

    if (error) throw error;

    // Award rewards to all participants
    for (const userId of participants) {
      await this.awardRewardToUser(userId, reward);
    }

    return data;
  }

  /**
   * Award reward to user
   */
  private async awardRewardToUser(
    userId: string,
    reward: FamilyAchievement['reward']
  ): Promise<void> {
    // Update user XP and currency
    const { error } = await this.supabase.rpc('add_user_rewards', {
      p_user_id: userId,
      p_xp: reward.xp,
      p_currency: reward.currency,
    });

    if (error) console.error('Error awarding reward:', error);
  }
}

// ============================================================================
// INTERGENERATIONAL STORY PROMPTS
// ============================================================================

export const intergenerationalPrompts: IntergenerationalPrompt[] = [
  {
    id: 'heritage-1',
    category: 'family-history',
    prompt: 'The Story of Our Family Name',
    questions: [
      'Where does our family name come from?',
      'What does it mean?',
      'What stories have been passed down about our ancestors?',
    ],
    suggestedRoles: {
      elder: 'Share the history and meaning of the family name',
      parent: 'Connect the past to present family traditions',
      child: 'Imagine what the family name will mean in the future',
    },
  },
  {
    id: 'heritage-2',
    category: 'cultural-heritage',
    prompt: 'Recipes and Traditions',
    questions: [
      'What special foods connect us to our heritage?',
      'What traditions do we celebrate?',
      'How have these traditions changed over time?',
    ],
    suggestedRoles: {
      elder: 'Describe traditional recipes and their origins',
      parent: 'Explain how traditions are practiced today',
      child: 'Create new traditions inspired by the old',
    },
  },
  {
    id: 'life-lessons-1',
    category: 'life-lessons',
    prompt: 'Overcoming Challenges',
    questions: [
      'What was a difficult time you faced?',
      'How did you overcome it?',
      'What did you learn?',
    ],
    suggestedRoles: {
      elder: 'Share wisdom from life experiences',
      parent: 'Relate lessons to current challenges',
      child: 'Imagine applying these lessons to future adventures',
    },
  },
  {
    id: 'creative-1',
    category: 'creative-fiction',
    prompt: 'The Family Time Machine',
    questions: [
      'If we could travel through time together, where would we go?',
      'What would we discover about our family history?',
      'What adventures would we have?',
    ],
    suggestedRoles: {
      elder: 'Set the historical context and family background',
      parent: 'Navigate the time travel adventure',
      child: 'Lead the exploration and discoveries',
    },
  },
  {
    id: 'creative-2',
    category: 'creative-fiction',
    prompt: 'Superhero Family',
    questions: [
      'What superpower would each family member have?',
      'What challenge would we face together?',
      'How would we use our powers to help our community?',
    ],
    suggestedRoles: {
      elder: 'Provide wisdom and strategic guidance',
      parent: 'Coordinate the team and plan the mission',
      child: 'Use creativity to solve unexpected problems',
    },
  },
  {
    id: 'heritage-3',
    category: 'cultural-heritage',
    prompt: 'Music and Dance of Our People',
    questions: [
      'What music and dances are part of our heritage?',
      'What stories do they tell?',
      'How do they make us feel connected?',
    ],
    suggestedRoles: {
      elder: 'Teach traditional songs and their meanings',
      parent: 'Show how music brings the family together',
      child: 'Create new rhythms inspired by tradition',
    },
  },
];

/**
 * Get random intergenerational prompt
 */
export function getRandomPrompt(
  category?: IntergenerationalPrompt['category']
): IntergenerationalPrompt {
  const filtered = category
    ? intergenerationalPrompts.filter((p) => p.category === category)
    : intergenerationalPrompts;

  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Get prompts by category
 */
export function getPromptsByCategory(
  category: IntergenerationalPrompt['category']
): IntergenerationalPrompt[] {
  return intergenerationalPrompts.filter((p) => p.category === category);
}

// ============================================================================
// FAMILY READING CIRCLES
// ============================================================================

export interface ReadingCircleSession {
  id: string;
  familyId: string;
  storyId: string;
  scheduledFor: Date;
  participants: string[];
  currentChapter: number;
  status: 'scheduled' | 'active' | 'completed';
  voiceRecordings: string[]; // recording IDs
  notes: ReadingNote[];
}

export interface ReadingNote {
  id: string;
  userId: string;
  chapterId: string;
  content: string;
  timestamp: Date;
  reactions: {
    userId: string;
    emoji: string;
  }[];
}

/**
 * Schedule reading circle session
 */
export async function scheduleReadingCircle(
  supabase: ReturnType<typeof createClient>,
  familyId: string,
  storyId: string,
  scheduledFor: Date,
  participants: string[]
): Promise<ReadingCircleSession> {
  const session: ReadingCircleSession = {
    id: crypto.randomUUID(),
    familyId,
    storyId,
    scheduledFor,
    participants,
    currentChapter: 1,
    status: 'scheduled',
    voiceRecordings: [],
    notes: [],
  };

  const { data, error } = await supabase
    .from('reading_circle_sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add reading note
 */
export async function addReadingNote(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  userId: string,
  chapterId: string,
  content: string
): Promise<ReadingNote> {
  const note: ReadingNote = {
    id: crypto.randomUUID(),
    userId,
    chapterId,
    content,
    timestamp: new Date(),
    reactions: [],
  };

  const { data, error } = await supabase
    .from('reading_notes')
    .insert({ ...note, session_id: sessionId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// EXPORT
// ============================================================================

export default FamilyCollaborationManager;
