# StxryAI - AI Features & Advanced Functionality Documentation

## Overview

This document covers all AI-powered features and advanced functionality implemented in the StxryAI platform. These features leverage cutting-edge AI technology to enhance story creation, discovery, and engagement.

---

## Table of Contents

1. [AI Story Generation](#ai-story-generation)
2. [AI Writing Assistant](#ai-writing-assistant)
3. [Recommendation Engine](#recommendation-engine)
4. [Content Moderation](#content-moderation)
5. [Image Generation](#image-generation)
6. [Gamification System](#gamification-system)
7. [Real-time Features](#real-time-features)
8. [Collaborative Writing](#collaborative-writing)

---

## AI Story Generation

### Location
`src/lib/ai/story-generator.ts`

### Features

#### 1. Complete Story Generation
```typescript
import { aiStoryGenerator } from '@/lib/ai/story-generator';

const story = await aiStoryGenerator.generateStory({
  genre: 'sci-fi',
  theme: 'time travel',
  characters: ['Alex', 'Dr. Chen'],
  setting: 'futuristic city',
  tone: 'mysterious',
  length: 'medium',
  difficulty: 'medium'
});
```

**Returns:**
- Title and description
- 3-5 chapters with branching paths
- 3-4 meaningful choices per chapter
- Metadata (genre, read time, difficulty, tags)

#### 2. Chapter Continuation
```typescript
const nextChapter = await aiStoryGenerator.generateChapter({
  storyContext: 'Brief summary of story so far...',
  currentChapter: 'Current chapter content',
  previousChoices: ['Choice 1', 'Choice 2'],
  direction: 'Increase tension' // optional
});
```

#### 3. Writing Suggestions
```typescript
const suggestions = await aiStoryGenerator.getWritingSuggestions(
  content,
  ['grammar', 'style', 'pacing'] // optional focus areas
);
```

Returns array of suggestions with:
- Type (grammar, style, plot, character, pacing)
- Original text
- Suggested improvement
- Reason for suggestion
- Confidence score

#### 4. Content Enhancement
```typescript
// Expand content
const expanded = await aiStoryGenerator.enhanceContent(content, 'expand');

// Make more concise
const condensed = await aiStoryGenerator.enhanceContent(content, 'condense');

// Increase drama
const dramatized = await aiStoryGenerator.enhanceContent(content, 'dramatize');

// Improve clarity
const clarified = await aiStoryGenerator.enhanceContent(content, 'clarify');
```

#### 5. Character Dialogue Generation
```typescript
const dialogue = await aiStoryGenerator.generateDialogue(
  'Sarah',
  ['brave', 'sarcastic', 'cautious'],
  'She discovers the secret door',
  'tense'
);
```

#### 6. Alternative Story Paths
```typescript
const alternatives = await aiStoryGenerator.generateAlternatives(
  currentPath,
  3 // number of alternatives
);
```

#### 7. Story Outline Generation
```typescript
const outline = await aiStoryGenerator.generateOutline(
  'A detective solving a mystery in a cyberpunk city',
  8 // target chapters
);
```

### Configuration

Set your OpenAI API key in `.env.local`:
```env
OPENAI_API_KEY=sk-...
```

### Mock Mode

The service automatically falls back to mock data when no API key is provided, perfect for development and testing.

---

## AI Writing Assistant

### Location
`src/components/ai/AIWritingAssistant.tsx`

### Features

#### Floating AI Assistant Panel
A sleek, always-accessible AI writing companion that slides in from the right side of the screen.

#### 6 Modes:

1. **Suggestions Mode** 💡
   - Get AI-powered writing improvements
   - Grammar, style, plot, character, and pacing suggestions
   - One-click application of suggestions

2. **Generate Mode** ✨
   - Generate new content from scratch
   - Coming soon

3. **Enhance Mode** 🎨
   - Expand: Add more detail and depth
   - Condense: Make more concise
   - Dramatize: Increase tension
   - Clarify: Improve readability

4. **Dialogue Mode** 💬
   - Generate character dialogue
   - Input character name, traits, and situation
   - Get contextual, character-appropriate dialogue

5. **Alternatives Mode** 🔀
   - Explore alternative story directions
   - Coming soon

6. **Outline Mode** 📋
   - Generate story structure
   - Coming soon

### Usage

```tsx
import { AIWritingAssistant } from '@/components/ai/AIWritingAssistant';

<AIWritingAssistant
  currentContent={editorContent}
  onApplySuggestion={(newContent) => setEditorContent(newContent)}
  onInsertContent={(content) => insertAtCursor(content)}
/>
```

### UI Features
- Floating toggle button (bottom-right)
- Slide-in panel animation
- Mode switcher with icons
- Real-time loading states
- Preview before applying
- Replace or insert options

---

## Recommendation Engine

### Location
`src/lib/ai/recommendation-engine.ts`

### Features

#### 1. Personalized Recommendations
```typescript
import { recommendationEngine } from '@/lib/ai/recommendation-engine';

const recommendations = await recommendationEngine.getRecommendations(
  userProfile,
  availableStories,
  10 // count
);
```

**Scoring Factors:**
- Genre match (30%)
- Difficulty match (15%)
- Story rating (20%)
- Popularity (15%)
- Diversity (10%)
- Freshness (10%)

**Returns:**
- Story ID
- Match score (0-1)
- Reasons for recommendation
- Detailed match factors

#### 2. Similar Stories
```typescript
const similar = await recommendationEngine.getSimilarStories(
  referenceStory,
  allStories,
  5 // count
);
```

#### 3. Trending Stories
```typescript
const trending = await recommendationEngine.getTrendingStories(
  stories,
  recentActivityMap,
  7 // time window in days
);
```

#### 4. Discovery Recommendations
Help users explore new genres they haven't tried:
```typescript
const discovery = await recommendationEngine.getDiscoveryRecommendations(
  userProfile,
  stories,
  5
);
```

#### 5. Continue Reading
```typescript
const continueReading = await recommendationEngine.getContinueReading(
  userProfile,
  stories,
  progressDataMap
);
```

#### 6. Collaborative Filtering
Find users with similar tastes:
```typescript
const similarUsers = await recommendationEngine.findSimilarUsers(
  targetUser,
  allUsers,
  10
);
```

#### 7. "Because You Read X"
```typescript
const related = await recommendationEngine.getBecauseYouRead(
  referenceStoryId,
  allStories,
  5
);
```

### User Profile Structure
```typescript
interface UserProfile {
  userId: string;
  readingHistory: string[];
  completedStories: string[];
  favoriteGenres: string[];
  averageRating: number;
  readingSpeed: number; // words per minute
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  interactionPatterns: {
    timeOfDay: string[];
    sessionDuration: number;
    choicePatterns: string[];
  };
}
```

---

## Content Moderation

### Location
`src/lib/ai/content-moderation.ts`

### Features

#### 1. AI Content Moderation
```typescript
import { contentModerationService } from '@/lib/ai/content-moderation';

const result = await contentModerationService.moderateContent({
  text: contentToCheck,
  context: 'Additional context',
  authorId: 'user123',
  contentType: 'story' // or 'comment', 'profile', 'message'
});
```

**Returns:**
- Flagged (boolean)
- Categories detected
- Severity (low, medium, high, critical)
- Confidence score
- Suggestions for improvement
- Auto-action (allow, review, block)

**Categories Checked:**
- Hate speech
- Harassment
- Violence
- Sexual content
- Self-harm
- Illegal activity
- Spam
- Personal information (PII)

#### 2. Spam Detection
```typescript
const spamCheck = await contentModerationService.detectSpam(content);
// Returns: { isSpam, confidence, reasons }
```

Checks for:
- Excessive links
- Excessive capital letters
- Repeated text patterns
- Common spam keywords
- Excessive emojis

#### 3. PII Detection
```typescript
const piiCheck = await contentModerationService.detectPII(content);
// Returns: { found, types, redacted }
```

Detects and redacts:
- Email addresses
- Phone numbers
- Social security numbers
- Credit card numbers
- Physical addresses

#### 4. Sentiment Analysis
```typescript
const sentiment = await contentModerationService.analyzeSentiment(content);
// Returns: { sentiment, score, emotions }
```

#### 5. Content Quality Assessment
```typescript
const quality = await contentModerationService.assessContentQuality(content);
// Returns: { score, factors, improvements }
```

Factors assessed:
- Grammar
- Readability
- Engagement
- Originality

#### 6. Batch Moderation
```typescript
const results = await contentModerationService.moderateBatch([
  { text: 'content1', contentType: 'comment' },
  { text: 'content2', contentType: 'story' }
]);
```

### Auto-Actions

Based on severity:
- **Low**: Allow
- **Medium**: Review required
- **High**: Review required
- **Critical**: Automatic block

---

## Image Generation

### Location
`src/lib/ai/image-generation.ts`

### Features

#### 1. Story Cover Generation
```typescript
import { aiImageGenerator } from '@/lib/ai/image-generation';

const cover = await aiImageGenerator.generateStoryCover({
  storyTitle: 'The Quantum Paradox',
  genre: 'sci-fi',
  theme: 'time travel',
  mood: 'mysterious',
  keyElements: ['scientist', 'laboratory', 'glowing portal']
});
```

**Automatically:**
- Selects appropriate art style based on genre
- Uses 9:16 aspect ratio (vertical book cover)
- Optimizes prompt for book cover design
- Generates HD quality images

#### 2. Scene Illustrations
```typescript
const scene = await aiImageGenerator.generateSceneIllustration(
  'A futuristic city at sunset with flying cars',
  'digital-art'
);
```

#### 3. Character Portraits
```typescript
const portrait = await aiImageGenerator.generateCharacterPortrait(
  'Young woman with silver hair, cyberpunk aesthetic, confident expression',
  'anime'
);
```

#### 4. Cover Variations
```typescript
const variations = await aiImageGenerator.generateCoverVariations(
  coverRequest,
  4 // number of variations
);
```

#### 5. Image Upscaling
```typescript
const upscaled = await aiImageGenerator.upscaleImage(imageUrl, 2);
```

### Available Styles
- `realistic` - Photorealistic, highly detailed
- `anime` - Anime/manga style
- `digital-art` - Digital painting, concept art
- `oil-painting` - Classical oil painting
- `watercolor` - Watercolor painting
- `comic` - Comic book style

### Aspect Ratios
- `1:1` - Square (1024x1024)
- `16:9` - Landscape (1792x1024)
- `9:16` - Portrait/Cover (1024x1792)
- `4:3` - Standard (1024x768)

### Configuration

Supports two providers:

**OpenAI DALL-E 3:**
```env
OPENAI_API_KEY=sk-...
```

**Stability AI (Coming Soon):**
```env
STABILITY_API_KEY=sk-...
```

### Mock Mode
Falls back to placeholder images when no API key is provided.

---

## Gamification System

### Location
`src/lib/features/gamification-engine.ts`

### Features

#### 1. XP and Leveling
```typescript
import { gamificationEngine } from '@/lib/features/gamification-engine';

// Award XP
const result = gamificationEngine.awardXP(
  playerProgress,
  500,
  'Completed a story'
);

if (result.leveledUp) {
  console.log(`Level up! Now level ${result.newLevel}`);
  console.log(`Unlocked achievements:`, result.unlockedAchievements);
}
```

**XP Curve:**
- Level 1: 100 XP
- Level 2: 150 XP
- Level 3: 225 XP
- Exponential growth (base × level^1.5)

#### 2. Daily Streaks
```typescript
const updated = gamificationEngine.updateStreak(playerProgress);
console.log(`Current streak: ${updated.streakDays} days`);
```

Streak rules:
- Increments on consecutive days
- Resets if a day is missed
- Tracks last active date automatically

#### 3. Daily Challenges
```typescript
const dailyChallenges = gamificationEngine.generateDailyChallenge(
  new Date(),
  playerLevel
);
```

Typical challenges:
- Read 3 chapters (50 XP)
- Make 10 story choices (30 XP)
- Rate a story (20 XP)

Rewards scale with player level.

#### 4. Quests
```typescript
const availableQuests = gamificationEngine.getAvailableQuests(playerProgress);
```

**Quest Types:**
- **Daily**: Reset every 24 hours
- **Weekly**: Reset every week
- **Story**: Tied to specific stories
- **Special**: Limited-time events

**Quest Rewards:**
- XP
- Badges
- Titles
- Energy
- Premium days
- Cosmetics

#### 5. Achievements
```typescript
const newAchievements = gamificationEngine.checkAchievements(playerProgress);
```

**Rarity Tiers:**
- Common: Easy to obtain
- Uncommon: Requires effort
- Rare: Significant accomplishment
- Epic: Major milestone
- Legendary: Extremely difficult

**Categories:**
- Reader achievements
- Creator achievements
- Social achievements
- Special achievements

**Example Achievements:**
- First Steps: Read your first story
- Bookworm: Read 50 stories
- Creator's Debut: Publish your first story
- Rising Star: Reach level 10
- Dedicated Reader: 7-day reading streak
- Marathon Reader: Read for 1000 minutes

#### 6. Leaderboards
```typescript
const leaderboard = gamificationEngine.getLeaderboard(
  allPlayers,
  'level', // or 'xp', 'streak', 'stories_read'
  'weekly' // or 'daily', 'monthly', 'alltime'
);
```

Returns ranked list with:
- Rank position
- Player data
- Score for selected metric

### Player Progress Structure
```typescript
interface PlayerProgress {
  userId: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  streakDays: number;
  lastActiveDate: Date;
  achievementsUnlocked: string[];
  activeQuests: string[];
  completedQuests: string[];
  statistics: {
    storiesRead: number;
    storiesCreated: number;
    totalReadingTime: number;
    chaptersCompleted: number;
    choicesMade: number;
    commentsPosted: number;
    storiesRated: number;
    followersGained: number;
  };
}
```

---

## Real-time Features

### Location
`src/lib/features/realtime-service.ts`

### Features

#### 1. Live Notifications
```typescript
import { realtimeService } from '@/lib/features/realtime-service';

const unsubscribe = realtimeService.subscribeToNotifications(
  userId,
  (notification) => {
    console.log('New notification:', notification);
    showToast(notification.message);
  }
);

// Cleanup when component unmounts
unsubscribe();
```

**Notification Types:**
- Comments on your stories
- New followers
- Story likes/ratings
- Achievement unlocks
- Story updates from followed creators

#### 2. Story Updates
```typescript
const unsubscribe = realtimeService.subscribeToStory(storyId, {
  onChapterAdded: (chapter) => console.log('New chapter:', chapter),
  onCommentAdded: (comment) => console.log('New comment:', comment),
  onReaderJoined: (reader) => console.log('Reader joined:', reader)
});
```

#### 3. User Presence
```typescript
// Subscribe to presence updates
realtimeService.subscribeToPresence('story-123', (users) => {
  console.log(`${users.length} users online`);
  users.forEach(user => {
    console.log(`${user.username} is ${user.status}`);
  });
});

// Update your own presence
realtimeService.updatePresence(userId, {
  status: 'reading',
  currentActivity: 'Chapter 5'
});
```

**Status Options:**
- `online` - Active on the platform
- `away` - Inactive but logged in
- `reading` - Currently reading
- `writing` - Currently writing

#### 4. Live Reading Sessions
```typescript
realtimeService.subscribeToReadingSession(storyId, {
  onReaderProgress: (progress) => console.log('Progress:', progress),
  onChoiceMade: (choice) => console.log('Choice made:', choice),
  onReaction: (reaction) => console.log('Reaction:', reaction)
});
```

#### 5. Typing Indicators
```typescript
// Broadcast typing status
realtimeService.broadcastTyping(roomId, userId, true);

// Stop typing
realtimeService.broadcastTyping(roomId, userId, false);
```

#### 6. Real-time Messages
```typescript
realtimeService.sendMessage('room-123', {
  userId,
  text: 'Hello everyone!',
  timestamp: new Date()
});
```

#### 7. Current Readers Count
```typescript
const count = await realtimeService.getCurrentReaders(storyId);
console.log(`${count} people reading now`);
```

---

## Collaborative Writing

### Location
`src/lib/features/realtime-service.ts` (CollaborativeWritingService)

### Features

#### 1. Create Collaborative Session
```typescript
import { collaborativeWritingService } from '@/lib/features/realtime-service';

const sessionId = await collaborativeWritingService.createSession(
  storyId,
  creatorId,
  {
    canEdit: true,
    canComment: true,
    canInvite: false,
    requireApproval: true
  }
);
```

#### 2. Join Session
```typescript
const joined = await collaborativeWritingService.joinSession(sessionId, userId);
```

#### 3. Share Edits
```typescript
await collaborativeWritingService.shareEdit(sessionId, userId, {
  type: 'insert',
  position: 125,
  content: 'Additional text here'
});
```

**Edit Types:**
- `insert` - Add new text
- `delete` - Remove text
- `replace` - Replace existing text

#### 4. Get Participants
```typescript
const participants = collaborativeWritingService.getParticipants(sessionId);
```

**Participant Roles:**
- `owner` - Full control, can manage permissions
- `editor` - Can make changes
- `contributor` - Limited editing rights
- `viewer` - Read-only access

#### 5. Collaborative Session Subscription
```typescript
realtimeService.subscribeToCollabSession(sessionId, {
  onUserJoined: (user) => console.log(`${user.username} joined`),
  onUserLeft: (userId) => console.log(`User left`),
  onTextChange: (change) => applyChange(change),
  onCursorMove: (cursor) => showCursor(cursor)
});
```

### Permissions Configuration
```typescript
interface CollabPermissions {
  canEdit: boolean;          // Can modify content
  canComment: boolean;        // Can add comments
  canInvite: boolean;        // Can invite others
  requireApproval: boolean;  // Edits need approval
}
```

---

## Integration Examples

### Complete Story Creation Flow

```typescript
import { aiStoryGenerator } from '@/lib/ai/story-generator';
import { aiImageGenerator } from '@/lib/ai/image-generation';
import { contentModerationService } from '@/lib/ai/content-moderation';
import { gamificationEngine } from '@/lib/features/gamification-engine';

// 1. Generate story
const story = await aiStoryGenerator.generateStory({
  genre: 'fantasy',
  theme: 'adventure',
  length: 'medium'
});

// 2. Moderate content
const modResult = await contentModerationService.moderateContent({
  text: story.chapters[0].content,
  contentType: 'story'
});

if (modResult.autoAction === 'block') {
  throw new Error('Content violates guidelines');
}

// 3. Generate cover image
const cover = await aiImageGenerator.generateStoryCover({
  storyTitle: story.title,
  genre: story.metadata.genre,
  theme: 'adventure',
  mood: 'exciting',
  keyElements: ['hero', 'dragon', 'castle']
});

// 4. Award XP for creating story
const xpResult = gamificationEngine.awardXP(
  playerProgress,
  1000,
  'Published first story'
);

// 5. Check for achievement unlocks
if (xpResult.unlockedAchievements.length > 0) {
  showAchievementNotification(xpResult.unlockedAchievements[0]);
}
```

### Complete Reading Flow with Recommendations

```typescript
import { recommendationEngine } from '@/lib/ai/recommendation-engine';
import { realtimeService } from '@/lib/features/realtime-service';
import { gamificationEngine } from '@/lib/features/gamification-engine';

// 1. Get personalized recommendations
const recommendations = await recommendationEngine.getRecommendations(
  userProfile,
  allStories,
  10
);

// 2. User starts reading
const unsubscribe = realtimeService.subscribeToStory(storyId, {
  onChapterAdded: (chapter) => notifyNewChapter(chapter)
});

// 3. Track progress and award XP
const xpResult = gamificationEngine.awardXP(
  playerProgress,
  50,
  'Completed chapter'
);

// 4. Update daily challenge progress
const updatedChallenges = updateChallengeProgress(
  dailyChallenges,
  'read_chapter'
);

// 5. Get similar stories for "Read next"
const similar = await recommendationEngine.getSimilarStories(
  currentStory,
  allStories,
  5
);
```

---

## Best Practices

### 1. API Key Management
- Store all API keys in `.env.local`
- Never commit API keys to version control
- Use environment-specific keys (dev/prod)
- Rotate keys regularly

### 2. Rate Limiting
- Implement rate limiting for AI API calls
- Cache AI-generated content when possible
- Use batch operations for moderation
- Monitor API usage and costs

### 3. Error Handling
```typescript
try {
  const result = await aiStoryGenerator.generateStory(prompt);
  // Handle success
} catch (error) {
  console.error('AI generation failed:', error);
  // Fall back to manual creation
  showFallbackUI();
}
```

### 4. Performance Optimization
- Load AI features on-demand
- Use lazy loading for heavy components
- Implement loading states
- Cache frequently accessed data

### 5. User Experience
- Always show loading indicators
- Provide preview before applying changes
- Allow undo/redo for AI suggestions
- Give users control over AI features

---

## Future Enhancements

### Planned Features

1. **Voice Narration**
   - Text-to-speech for stories
   - Multiple voice options
   - Adjustable speed and pitch

2. **Advanced Analytics**
   - Reader engagement insights
   - Story performance predictions
   - Optimization suggestions

3. **Multiplayer Reading**
   - Read stories together in real-time
   - Shared choices
   - Group chat while reading

4. **AI Story Companion**
   - Interactive AI character in stories
   - Dynamic responses based on player choices
   - Personality learning

5. **Translation**
   - Automatic story translation
   - Multi-language support
   - Cultural adaptation

---

## Troubleshooting

### AI Generation Not Working
1. Check API key is set correctly
2. Verify internet connection
3. Check OpenAI API status
4. Review API usage limits
5. Check browser console for errors

### Real-time Features Not Updating
1. Verify WebSocket connection
2. Check Supabase project status
3. Review browser network tab
4. Clear browser cache
5. Check user permissions

### Image Generation Failing
1. Verify DALL-E API access
2. Check content policy compliance
3. Review prompt length
4. Check API quota
5. Try with different prompts

---

## Support & Resources

- **OpenAI Documentation**: https://platform.openai.com/docs
- **Supabase Realtime**: https://supabase.com/docs/guides/realtime
- **DALL-E Guide**: https://platform.openai.com/docs/guides/images

---

*Generated with Claude Code*
*Last Updated: 2025-12-11*
