import { supabase } from './supabase';

export interface PlayerProgress {
  userId: string;
  level: number;
  currentXP: number;
  streakDays: number;
  lastActiveDate: string;
}

export class MobileGamificationService {
  private static instance: MobileGamificationService;

  private constructor() {}

  public static getInstance(): MobileGamificationService {
    if (!MobileGamificationService.instance) {
      MobileGamificationService.instance = new MobileGamificationService();
    }
    return MobileGamificationService.instance;
  }

  /**
   * Mock getting user progress
   */
  public async getProgress(userId: string): Promise<PlayerProgress> {
    // In production, fetch from Supabase
    return {
      userId,
      level: 12,
      currentXP: 450,
      streakDays: 5,
      lastActiveDate: new Date().toISOString(),
    };
  }

  /**
   * Updates streak if user hasn't been active today
   */
  public async updateStreak(userId: string): Promise<number> {
    const progress = await this.getProgress(userId);
    const lastActive = new Date(progress.lastActiveDate);
    const today = new Date();
    
    // Simple streak logic
    if (lastActive.toDateString() !== today.toDateString()) {
      return progress.streakDays + 1;
    }
    return progress.streakDays;
  }
}

export const mobileGamificationService = MobileGamificationService.getInstance();
