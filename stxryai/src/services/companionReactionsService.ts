/**
 * Companion Real-Time Reactions Service
 * Makes your pet companion react to story events, choices, and emotions in real-time
 */

import { createClient } from '@/lib/supabase/client';

export type StoryEvent = 
  | 'choice_made'
  | 'chapter_completed'
  | 'story_started'
  | 'story_finished'
  | 'dramatic_moment'
  | 'plot_twist'
  | 'character_death'
  | 'romance_scene'
  | 'battle_scene'
  | 'mystery_revealed'
  | 'sad_moment'
  | 'happy_ending'
  | 'cliffhanger'
  | 'achievement_unlocked'
  | 'rare_choice'
  | 'reading_streak';

export type CompanionReaction = {
  type: 'animation' | 'message' | 'mood_change' | 'special_effect';
  animation?: 'bounce' | 'spin' | 'shake' | 'glow' | 'cry' | 'cheer' | 'gasp' | 'sleep' | 'sparkle' | 'hearts';
  message?: string;
  mood?: string;
  effect?: 'particles' | 'confetti' | 'tears' | 'hearts' | 'stars' | 'lightning' | 'fire' | 'snow';
  duration: number;
  intensity: 'subtle' | 'normal' | 'intense';
};

export interface CompanionMemory {
  id: string;
  petId: string;
  userId: string;
  storyId: string;
  eventType: StoryEvent;
  context: {
    chapterId?: string;
    choiceId?: string;
    choiceText?: string;
    emotionalTone?: string;
    storyMoment?: string;
  };
  reaction: CompanionReaction;
  timestamp: string;
}

export interface CompanionOpinion {
  id: string;
  petId: string;
  userId: string;
  storyId: string;
  opinion: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'conflicted';
  confidence: number;
  reasoning: string;
  createdAt: string;
}

// Personality-based reaction modifiers
const personalityReactionMap: Record<string, Record<StoryEvent, Partial<CompanionReaction>>> = {
  playful: {
    choice_made: { animation: 'bounce', intensity: 'normal' },
    chapter_completed: { animation: 'spin', effect: 'confetti', intensity: 'intense' },
    dramatic_moment: { animation: 'gasp', intensity: 'intense' },
    romance_scene: { animation: 'hearts', effect: 'hearts', intensity: 'normal' },
    battle_scene: { animation: 'shake', effect: 'lightning', intensity: 'intense' },
    sad_moment: { animation: 'shake', intensity: 'subtle' },
    happy_ending: { animation: 'cheer', effect: 'confetti', intensity: 'intense' },
    plot_twist: { animation: 'gasp', effect: 'stars', intensity: 'intense' },
    character_death: { animation: 'cry', effect: 'tears', intensity: 'intense' },
    mystery_revealed: { animation: 'sparkle', effect: 'stars', intensity: 'normal' },
    story_started: { animation: 'bounce', intensity: 'normal' },
    story_finished: { animation: 'cheer', effect: 'confetti', intensity: 'intense' },
    cliffhanger: { animation: 'gasp', intensity: 'intense' },
    achievement_unlocked: { animation: 'sparkle', effect: 'confetti', intensity: 'intense' },
    rare_choice: { animation: 'glow', effect: 'stars', intensity: 'normal' },
    reading_streak: { animation: 'cheer', effect: 'confetti', intensity: 'normal' },
  },
  curious: {
    choice_made: { animation: 'sparkle', intensity: 'subtle' },
    chapter_completed: { animation: 'bounce', intensity: 'normal' },
    dramatic_moment: { animation: 'glow', intensity: 'normal' },
    plot_twist: { animation: 'spin', effect: 'stars', intensity: 'intense' },
    mystery_revealed: { animation: 'sparkle', effect: 'stars', intensity: 'intense' },
    story_started: { animation: 'sparkle', intensity: 'normal' },
    story_finished: { animation: 'glow', effect: 'stars', intensity: 'normal' },
    romance_scene: { animation: 'sparkle', intensity: 'subtle' },
    battle_scene: { animation: 'glow', effect: 'lightning', intensity: 'normal' },
    sad_moment: { animation: 'glow', intensity: 'subtle' },
    happy_ending: { animation: 'sparkle', effect: 'stars', intensity: 'normal' },
    character_death: { animation: 'glow', intensity: 'normal' },
    cliffhanger: { animation: 'spin', intensity: 'intense' },
    achievement_unlocked: { animation: 'sparkle', effect: 'stars', intensity: 'normal' },
    rare_choice: { animation: 'glow', effect: 'stars', intensity: 'intense' },
    reading_streak: { animation: 'sparkle', intensity: 'normal' },
  },
  loyal: {
    choice_made: { animation: 'bounce', intensity: 'subtle' },
    chapter_completed: { animation: 'hearts', intensity: 'normal' },
    dramatic_moment: { animation: 'shake', intensity: 'normal' },
    romance_scene: { animation: 'hearts', effect: 'hearts', intensity: 'intense' },
    battle_scene: { animation: 'shake', effect: 'fire', intensity: 'intense' },
    sad_moment: { animation: 'cry', effect: 'tears', intensity: 'intense' },
    happy_ending: { animation: 'hearts', effect: 'hearts', intensity: 'intense' },
    character_death: { animation: 'cry', effect: 'tears', intensity: 'intense' },
    plot_twist: { animation: 'gasp', intensity: 'normal' },
    mystery_revealed: { animation: 'bounce', intensity: 'normal' },
    story_started: { animation: 'hearts', intensity: 'normal' },
    story_finished: { animation: 'hearts', effect: 'hearts', intensity: 'intense' },
    cliffhanger: { animation: 'gasp', intensity: 'normal' },
    achievement_unlocked: { animation: 'cheer', effect: 'confetti', intensity: 'normal' },
    rare_choice: { animation: 'hearts', intensity: 'normal' },
    reading_streak: { animation: 'hearts', effect: 'hearts', intensity: 'normal' },
  },
  shy: {
    choice_made: { animation: 'glow', intensity: 'subtle' },
    chapter_completed: { animation: 'sparkle', intensity: 'subtle' },
    dramatic_moment: { animation: 'shake', intensity: 'subtle' },
    romance_scene: { animation: 'glow', intensity: 'subtle' },
    battle_scene: { animation: 'shake', intensity: 'subtle' },
    sad_moment: { animation: 'cry', intensity: 'subtle' },
    happy_ending: { animation: 'sparkle', intensity: 'normal' },
    character_death: { animation: 'cry', effect: 'tears', intensity: 'normal' },
    plot_twist: { animation: 'gasp', intensity: 'subtle' },
    mystery_revealed: { animation: 'sparkle', intensity: 'subtle' },
    story_started: { animation: 'glow', intensity: 'subtle' },
    story_finished: { animation: 'sparkle', intensity: 'normal' },
    cliffhanger: { animation: 'gasp', intensity: 'subtle' },
    achievement_unlocked: { animation: 'sparkle', intensity: 'normal' },
    rare_choice: { animation: 'glow', intensity: 'subtle' },
    reading_streak: { animation: 'sparkle', intensity: 'subtle' },
  },
};

// Context-aware companion messages
const companionMessages: Record<StoryEvent, string[]> = {
  choice_made: [
    "Ooh, interesting choice!",
    "I wonder what happens next...",
    "Bold move!",
    "I thought you'd pick that!",
    "Hmm, I might have chosen differently...",
  ],
  chapter_completed: [
    "Great chapter! What's next?",
    "That was intense!",
    "I need a moment to process that...",
    "Keep reading! I want to know more!",
    "Another chapter conquered!",
  ],
  story_started: [
    "A new adventure begins!",
    "Ooh, this looks exciting!",
    "Let's see where this takes us!",
    "I'm ready for this journey!",
    "New story, new possibilities!",
  ],
  story_finished: [
    "What a journey that was!",
    "I'll remember this story forever...",
    "The end... but what an end!",
    "We did it together!",
    "Time to find our next adventure!",
  ],
  dramatic_moment: [
    "Oh no, oh no, oh no...",
    "This is getting intense!",
    "I can't look... but I can't look away!",
    "What's going to happen?!",
    "*holds breath*",
  ],
  plot_twist: [
    "WHAT?! I did NOT see that coming!",
    "Wait, WHAT?!",
    "My brain just exploded!",
    "Everything I knew was a lie!",
    "Plot twist of the century!",
  ],
  character_death: [
    "No... not them... 😢",
    "*sniff* They were so young...",
    "I'm not crying, you're crying!",
    "This hurts...",
    "Gone but never forgotten...",
  ],
  romance_scene: [
    "Aww, how sweet! 💕",
    "They're so cute together!",
    "Love is in the air~",
    "Finally! I've been waiting for this!",
    "*happy squeaking noises*",
  ],
  battle_scene: [
    "Let's go! We've got this!",
    "Watch out behind you!",
    "Epic battle mode: ACTIVATED!",
    "Fight! Fight! Fight!",
    "*cheering intensifies*",
  ],
  mystery_revealed: [
    "I KNEW IT!",
    "The pieces are coming together!",
    "So THAT'S what was going on!",
    "Mystery: SOLVED!",
    "My detective skills are tingling!",
  ],
  sad_moment: [
    "Oh no... this is so sad...",
    "I need a tissue...",
    "*sad companion noises*",
    "My heart hurts...",
    "It's okay to feel sad...",
  ],
  happy_ending: [
    "YES! The best ending!",
    "Happiness achieved! 🎉",
    "I'm so happy right now!",
    "Everything worked out!",
    "This is what I was hoping for!",
  ],
  cliffhanger: [
    "WHAT?! It can't end there!",
    "No! I need to know what happens!",
    "That's just cruel...",
    "Quick! Next chapter!",
    "HOW could they leave us hanging?!",
  ],
  achievement_unlocked: [
    "Achievement unlocked! You rock!",
    "Look at you go!",
    "We're making progress!",
    "Another one for the collection!",
    "So proud of you!",
  ],
  rare_choice: [
    "Whoa, almost no one picks that!",
    "A path less traveled!",
    "You're one of the few!",
    "Bold and unique!",
    "Rare choice detected!",
  ],
  reading_streak: [
    "You're on fire! 🔥",
    "Streak maintained!",
    "Consistency is key!",
    "Keep it going!",
    "We're unstoppable!",
  ],
};

class CompanionReactionsService {
  private supabase = createClient();

  /**
   * Generate a reaction based on story event and companion personality
   */
  generateReaction(
    event: StoryEvent,
    personality: string[],
    context?: { emotionalIntensity?: number; isRareEvent?: boolean }
  ): CompanionReaction {
    // Find the most relevant personality trait for reactions
    const primaryTrait = personality.find(t => personalityReactionMap[t]) || 'playful';
    const baseReaction = personalityReactionMap[primaryTrait]?.[event] || {
      animation: 'bounce',
      intensity: 'normal' as const,
    };

    // Select a contextual message
    const messages = companionMessages[event] || [];
    const message = messages[Math.floor(Math.random() * messages.length)];

    // Adjust intensity based on context
    let intensity = baseReaction.intensity || 'normal';
    if (context?.emotionalIntensity && context.emotionalIntensity > 0.8) {
      intensity = 'intense';
    } else if (context?.isRareEvent) {
      intensity = 'intense';
    }

    // Calculate duration based on intensity
    const durationMap = { subtle: 1500, normal: 2500, intense: 4000 };

    return {
      type: 'animation',
      animation: baseReaction.animation,
      message,
      effect: baseReaction.effect,
      duration: durationMap[intensity],
      intensity,
    };
  }

  /**
   * Record a companion reaction to a story event
   */
  async recordReaction(
    petId: string,
    userId: string,
    storyId: string,
    event: StoryEvent,
    reaction: CompanionReaction,
    context: CompanionMemory['context']
  ): Promise<CompanionMemory | null> {
    try {
      const { data, error } = await this.supabase
        .from('companion_memories')
        .insert({
          pet_id: petId,
          user_id: userId,
          story_id: storyId,
          event_type: event,
          context,
          reaction,
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording reaction:', error);
        return null;
      }

      return this.mapMemory(data);
    } catch (error) {
      console.error('Error in recordReaction:', error);
      return null;
    }
  }

  /**
   * Get companion's memories of a specific story
   */
  async getStoryMemories(petId: string, storyId: string): Promise<CompanionMemory[]> {
    try {
      const { data, error } = await this.supabase
        .from('companion_memories')
        .select('*')
        .eq('pet_id', petId)
        .eq('story_id', storyId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching memories:', error);
        return [];
      }

      return (data || []).map(this.mapMemory);
    } catch (error) {
      console.error('Error in getStoryMemories:', error);
      return [];
    }
  }

  /**
   * Generate a companion opinion about a story or choice
   */
  async generateOpinion(
    petId: string,
    userId: string,
    storyId: string,
    context: { choiceText?: string; storyMoment?: string; genre?: string },
    personality: string[]
  ): Promise<CompanionOpinion | null> {
    // Generate opinion based on personality
    const opinions = this.generatePersonalityBasedOpinion(personality, context);
    
    try {
      const { data, error } = await this.supabase
        .from('companion_opinions')
        .insert({
          pet_id: petId,
          user_id: userId,
          story_id: storyId,
          opinion: opinions.text,
          sentiment: opinions.sentiment,
          confidence: opinions.confidence,
          reasoning: opinions.reasoning,
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing opinion:', error);
        return null;
      }

      return this.mapOpinion(data);
    } catch (error) {
      console.error('Error in generateOpinion:', error);
      return null;
    }
  }

  /**
   * Get companion's opinions about a story
   */
  async getStoryOpinions(petId: string, storyId: string): Promise<CompanionOpinion[]> {
    try {
      const { data, error } = await this.supabase
        .from('companion_opinions')
        .select('*')
        .eq('pet_id', petId)
        .eq('story_id', storyId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching opinions:', error);
        return [];
      }

      return (data || []).map(this.mapOpinion);
    } catch (error) {
      console.error('Error in getStoryOpinions:', error);
      return [];
    }
  }

  /**
   * Generate personality-based opinion
   */
  private generatePersonalityBasedOpinion(
    personality: string[],
    context: { choiceText?: string; storyMoment?: string; genre?: string }
  ): { text: string; sentiment: 'positive' | 'neutral' | 'negative' | 'conflicted'; confidence: number; reasoning: string } {
    const hasPlayful = personality.includes('playful');
    const hasCurious = personality.includes('curious');
    const hasLoyal = personality.includes('loyal');
    const hasBold = personality.includes('bold') || personality.includes('adventurous');
    const hasShy = personality.includes('shy') || personality.includes('gentle');

    // Default opinion templates
    const templates = {
      playful: [
        { text: "This is so much fun! I love the energy!", sentiment: 'positive' as const, reasoning: "Playful nature appreciates excitement" },
        { text: "Hehe, that was unexpected! I like surprises!", sentiment: 'positive' as const, reasoning: "Enjoys unpredictability" },
      ],
      curious: [
        { text: "Fascinating... I wonder what's really going on here.", sentiment: 'neutral' as const, reasoning: "Always questioning and analyzing" },
        { text: "There's more to this than meets the eye!", sentiment: 'positive' as const, reasoning: "Loves uncovering deeper meaning" },
      ],
      loyal: [
        { text: "I trust your judgment on this one.", sentiment: 'positive' as const, reasoning: "Loyal support of your decisions" },
        { text: "Whatever you choose, I'm with you!", sentiment: 'positive' as const, reasoning: "Unwavering companionship" },
      ],
      bold: [
        { text: "Now THIS is what I call adventure!", sentiment: 'positive' as const, reasoning: "Embraces action and risk" },
        { text: "Let's take the exciting path!", sentiment: 'positive' as const, reasoning: "Prefers bold choices" },
      ],
      shy: [
        { text: "Maybe we should be careful here...", sentiment: 'conflicted' as const, reasoning: "Cautious by nature" },
        { text: "I'm a little nervous, but I trust you.", sentiment: 'neutral' as const, reasoning: "Reserved but supportive" },
      ],
    };

    // Select based on personality
    let selected;
    if (hasPlayful) selected = templates.playful[Math.floor(Math.random() * templates.playful.length)];
    else if (hasCurious) selected = templates.curious[Math.floor(Math.random() * templates.curious.length)];
    else if (hasLoyal) selected = templates.loyal[Math.floor(Math.random() * templates.loyal.length)];
    else if (hasBold) selected = templates.bold[Math.floor(Math.random() * templates.bold.length)];
    else if (hasShy) selected = templates.shy[Math.floor(Math.random() * templates.shy.length)];
    else selected = templates.playful[0];

    return {
      ...selected,
      confidence: 0.7 + Math.random() * 0.3,
    };
  }

  /**
   * Get a "what would you do?" companion prompt
   */
  getCompanionChoiceHint(
    personality: string[],
    choices: { id: string; text: string }[]
  ): { preferredChoiceId: string; hint: string } | null {
    if (choices.length === 0) return null;

    // Simulate personality-based preference
    const hasAdventurous = personality.includes('adventurous') || personality.includes('bold');
    const hasCautious = personality.includes('shy') || personality.includes('gentle');
    const hasCurious = personality.includes('curious');

    // Simple heuristic: look for keywords
    const adventurousKeywords = ['attack', 'fight', 'charge', 'confront', 'brave', 'risk'];
    const cautiousKeywords = ['hide', 'wait', 'careful', 'retreat', 'safe', 'quiet'];
    const curiousKeywords = ['investigate', 'explore', 'discover', 'search', 'examine'];

    let preferredChoice = choices[0];
    let hint = "I'd go with the first option...";

    for (const choice of choices) {
      const lowerText = choice.text.toLowerCase();
      
      if (hasAdventurous && adventurousKeywords.some(k => lowerText.includes(k))) {
        preferredChoice = choice;
        hint = "Ooh, that one sounds exciting! Let's be bold!";
        break;
      }
      if (hasCautious && cautiousKeywords.some(k => lowerText.includes(k))) {
        preferredChoice = choice;
        hint = "Maybe we should play it safe here...";
        break;
      }
      if (hasCurious && curiousKeywords.some(k => lowerText.includes(k))) {
        preferredChoice = choice;
        hint = "That one! I want to know more!";
        break;
      }
    }

    return {
      preferredChoiceId: preferredChoice.id,
      hint,
    };
  }

  /**
   * Generate a "remember when" prompt for nostalgia
   */
  async getRememberWhenPrompt(petId: string, userId: string): Promise<string | null> {
    try {
      const { data: memories } = await this.supabase
        .from('companion_memories')
        .select('*, stories:story_id(title)')
        .eq('pet_id', petId)
        .in('event_type', ['plot_twist', 'character_death', 'happy_ending', 'romance_scene', 'mystery_revealed'])
        .order('timestamp', { ascending: false })
        .limit(20);

      if (!memories || memories.length === 0) return null;

      // Pick a random memorable moment
      const memory = memories[Math.floor(Math.random() * memories.length)];
      const storyTitle = (memory as any).stories?.title || 'that story';

      const prompts: Record<string, string[]> = {
        plot_twist: [
          `Remember when that huge twist happened in "${storyTitle}"? I'm still shocked!`,
          `That twist in "${storyTitle}" - I didn't see it coming at all!`,
        ],
        character_death: [
          `I still think about that sad moment in "${storyTitle}"... 😢`,
          `"${storyTitle}" really got us in the feels, didn't it?`,
        ],
        happy_ending: [
          `The ending of "${storyTitle}" was so satisfying!`,
          `I loved how "${storyTitle}" wrapped up. So good!`,
        ],
        romance_scene: [
          `That romantic moment in "${storyTitle}"... so sweet! 💕`,
          `"${storyTitle}" had such beautiful romance scenes!`,
        ],
        mystery_revealed: [
          `When we finally solved the mystery in "${storyTitle}"! What a moment!`,
          `I felt so smart when we figured out "${storyTitle}"!`,
        ],
      };

      const eventPrompts = prompts[memory.event_type] || [`Remember "${storyTitle}"? Good times!`];
      return eventPrompts[Math.floor(Math.random() * eventPrompts.length)];
    } catch (error) {
      console.error('Error getting remember prompt:', error);
      return null;
    }
  }

  private mapMemory(data: any): CompanionMemory {
    return {
      id: data.id,
      petId: data.pet_id,
      userId: data.user_id,
      storyId: data.story_id,
      eventType: data.event_type,
      context: data.context || {},
      reaction: data.reaction,
      timestamp: data.timestamp || data.created_at,
    };
  }

  private mapOpinion(data: any): CompanionOpinion {
    return {
      id: data.id,
      petId: data.pet_id,
      userId: data.user_id,
      storyId: data.story_id,
      opinion: data.opinion,
      sentiment: data.sentiment,
      confidence: data.confidence,
      reasoning: data.reasoning,
      createdAt: data.created_at,
    };
  }
}

export const companionReactionsService = new CompanionReactionsService();
