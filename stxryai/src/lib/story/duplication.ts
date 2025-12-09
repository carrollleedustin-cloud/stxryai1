/**
 * Story Duplication & Cloning
 * Utilities for duplicating and remixing existing stories
 */

export interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  tags: string[];
  chapters?: Chapter[];
  characters?: Character[];
  settings?: Setting[];
  author_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  choices?: Choice[];
  [key: string]: any;
}

export interface Choice {
  id: string;
  text: string;
  nextChapterId: string;
  [key: string]: any;
}

export interface Character {
  name: string;
  description: string;
  traits: string[];
  [key: string]: any;
}

export interface Setting {
  name: string;
  description: string;
  [key: string]: any;
}

/**
 * Duplicate an entire story
 */
export function duplicateStory(
  originalStory: Story,
  options: {
    newTitle?: string;
    keepChapters?: boolean;
    keepCharacters?: boolean;
    keepSettings?: boolean;
    addSuffix?: boolean;
  } = {}
): Story {
  const {
    newTitle,
    keepChapters = true,
    keepCharacters = true,
    keepSettings = true,
    addSuffix = true
  } = options;

  // Generate new title
  const title = newTitle || (addSuffix ? `${originalStory.title} (Copy)` : originalStory.title);

  // Clone the story
  const duplicatedStory: Story = {
    ...originalStory,
    id: generateNewId(),
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Remove author reference for clones (they become new stories)
    author_id: undefined
  };

  // Clone chapters if requested
  if (keepChapters && originalStory.chapters) {
    duplicatedStory.chapters = originalStory.chapters.map(chapter => ({
      ...chapter,
      id: generateNewId(),
      story_id: duplicatedStory.id
    }));
  } else {
    duplicatedStory.chapters = [];
  }

  // Clone characters if requested
  if (keepCharacters && originalStory.characters) {
    duplicatedStory.characters = originalStory.characters.map(char => ({ ...char }));
  } else {
    duplicatedStory.characters = [];
  }

  // Clone settings if requested
  if (keepSettings && originalStory.settings) {
    duplicatedStory.settings = originalStory.settings.map(setting => ({ ...setting }));
  } else {
    duplicatedStory.settings = [];
  }

  return duplicatedStory;
}

/**
 * Create a story remix (keep structure, clear content)
 */
export function remixStory(originalStory: Story, newTitle: string): Story {
  const remixedStory: Story = {
    ...originalStory,
    id: generateNewId(),
    title: newTitle,
    description: `A remix of: ${originalStory.title}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_id: undefined
  };

  // Keep structure but clear content
  if (originalStory.chapters) {
    remixedStory.chapters = originalStory.chapters.map(chapter => ({
      id: generateNewId(),
      title: chapter.title,
      content: '', // Clear content for user to fill
      order: chapter.order,
      choices: chapter.choices?.map(choice => ({
        ...choice,
        id: generateNewId()
      }))
    }));
  }

  // Keep character names but clear details
  if (originalStory.characters) {
    remixedStory.characters = originalStory.characters.map(char => ({
      name: char.name,
      description: '',
      traits: []
    }));
  }

  // Keep setting names but clear details
  if (originalStory.settings) {
    remixedStory.settings = originalStory.settings.map(setting => ({
      name: setting.name,
      description: ''
    }));
  }

  return remixedStory;
}

/**
 * Clone story structure only
 */
export function cloneStoryStructure(originalStory: Story): Story {
  return {
    id: generateNewId(),
    title: `New Story (based on ${originalStory.title})`,
    description: '',
    genre: originalStory.genre,
    tags: [...originalStory.tags],
    chapters: originalStory.chapters?.map(chapter => ({
      id: generateNewId(),
      title: `Chapter ${chapter.order}`,
      content: '',
      order: chapter.order,
      choices: chapter.choices?.map((choice, idx) => ({
        id: generateNewId(),
        text: `Choice ${idx + 1}`,
        nextChapterId: ''
      }))
    })) || [],
    characters: [],
    settings: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Create a template from a story
 */
export function createTemplateFromStory(story: Story): {
  name: string;
  description: string;
  structure: any;
  outline: string[];
} {
  return {
    name: story.title,
    description: story.description,
    structure: {
      chapters: story.chapters?.length || 0,
      choicesPerChapter: calculateAverageChoices(story.chapters || []),
      averageLength: calculateAverageLength(story.chapters || [])
    },
    outline: story.chapters?.map(ch => ch.title) || []
  };
}

/**
 * Duplicate specific chapters
 */
export function duplicateChapters(
  chapters: Chapter[],
  chapterIds: string[]
): Chapter[] {
  return chapters
    .filter(ch => chapterIds.includes(ch.id))
    .map(ch => ({
      ...ch,
      id: generateNewId(),
      title: `${ch.title} (Copy)`
    }));
}

/**
 * Merge two stories
 */
export function mergeStories(
  story1: Story,
  story2: Story,
  mergeTitle: string
): Story {
  return {
    id: generateNewId(),
    title: mergeTitle,
    description: `Merged from: ${story1.title} and ${story2.title}`,
    genre: story1.genre, // Take genre from first story
    tags: Array.from(new Set([...story1.tags, ...story2.tags])), // Combine unique tags
    chapters: [
      ...(story1.chapters || []).map((ch, idx) => ({
        ...ch,
        id: generateNewId(),
        order: idx
      })),
      ...(story2.chapters || []).map((ch, idx) => ({
        ...ch,
        id: generateNewId(),
        order: (story1.chapters?.length || 0) + idx
      }))
    ],
    characters: [
      ...(story1.characters || []),
      ...(story2.characters || [])
    ],
    settings: [
      ...(story1.settings || []),
      ...(story2.settings || [])
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Create a branching variant (alternate timeline)
 */
export function createBranchingVariant(
  originalStory: Story,
  branchFromChapter: number,
  variantTitle: string
): Story {
  const branchedStory = duplicateStory(originalStory, {
    newTitle: variantTitle,
    addSuffix: false
  });

  // Keep only chapters up to the branch point
  if (branchedStory.chapters) {
    branchedStory.chapters = branchedStory.chapters
      .filter(ch => ch.order <= branchFromChapter)
      .map(ch => ({ ...ch, id: generateNewId() }));
  }

  branchedStory.description = `Branched from "${originalStory.title}" at Chapter ${branchFromChapter}`;

  return branchedStory;
}

/**
 * Export story as JSON for backup/sharing
 */
export function exportStory(story: Story): string {
  return JSON.stringify(story, null, 2);
}

/**
 * Import story from JSON
 */
export function importStory(jsonString: string): Story {
  try {
    const story = JSON.parse(jsonString);

    // Assign new IDs to prevent conflicts
    story.id = generateNewId();
    story.created_at = new Date().toISOString();
    story.updated_at = new Date().toISOString();

    if (story.chapters) {
      story.chapters = story.chapters.map((ch: Chapter) => ({
        ...ch,
        id: generateNewId()
      }));
    }

    return story;
  } catch (error) {
    throw new Error('Invalid story JSON format');
  }
}

/**
 * Compare two stories
 */
export function compareStories(story1: Story, story2: Story): {
  titleDiff: boolean;
  chapterCountDiff: boolean;
  contentSimilarity: number;
  structureDiff: string[];
} {
  const differences: string[] = [];

  if ((story1.chapters?.length || 0) !== (story2.chapters?.length || 0)) {
    differences.push('Different chapter counts');
  }

  if (story1.genre !== story2.genre) {
    differences.push('Different genres');
  }

  if ((story1.characters?.length || 0) !== (story2.characters?.length || 0)) {
    differences.push('Different character counts');
  }

  return {
    titleDiff: story1.title !== story2.title,
    chapterCountDiff: (story1.chapters?.length || 0) !== (story2.chapters?.length || 0),
    contentSimilarity: calculateContentSimilarity(story1, story2),
    structureDiff: differences
  };
}

// Helper functions

function generateNewId(): string {
  return `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateAverageChoices(chapters: Chapter[]): number {
  if (chapters.length === 0) return 0;
  const totalChoices = chapters.reduce((sum, ch) => sum + (ch.choices?.length || 0), 0);
  return Math.round(totalChoices / chapters.length);
}

function calculateAverageLength(chapters: Chapter[]): 'short' | 'medium' | 'long' {
  if (chapters.length === 0) return 'medium';
  const avgWords = chapters.reduce((sum, ch) => {
    const wordCount = ch.content?.split(/\s+/).length || 0;
    return sum + wordCount;
  }, 0) / chapters.length;

  if (avgWords < 300) return 'short';
  if (avgWords < 600) return 'medium';
  return 'long';
}

function calculateContentSimilarity(story1: Story, story2: Story): number {
  // Simple similarity check based on shared tags
  const tags1 = new Set(story1.tags);
  const tags2 = new Set(story2.tags);
  const intersection = new Set(Array.from(tags1).filter(x => tags2.has(x)));
  const union = new Set([...story1.tags, ...story2.tags]);

  return union.size === 0 ? 0 : Math.round((intersection.size / union.size) * 100);
}
