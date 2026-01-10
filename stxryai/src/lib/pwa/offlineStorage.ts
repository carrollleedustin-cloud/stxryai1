/**
 * Offline Storage Service for PWA
 * Enables offline reading by caching stories in IndexedDB.
 */

const DB_NAME = 'stxryai-offline';
const DB_VERSION = 1;
const STORES = {
  STORIES: 'offline-stories',
  PROGRESS: 'offline-progress',
  QUEUE: 'sync-queue',
} as const;

interface OfflineStory {
  id: string;
  title: string;
  description: string;
  content: string;
  cover_image_url?: string;
  genre: string;
  chapters: OfflineChapter[];
  downloaded_at: string;
  expires_at: string;
  size_bytes: number;
}

interface OfflineChapter {
  id: string;
  title: string;
  content: string;
  order: number;
  choices?: OfflineChoice[];
}

interface OfflineChoice {
  id: string;
  text: string;
  next_chapter_id: string;
}

interface OfflineProgress {
  story_id: string;
  chapter_id: string;
  progress_percentage: number;
  last_read_at: string;
  synced: boolean;
}

interface SyncQueueItem {
  id: string;
  type: 'progress' | 'rating' | 'bookmark';
  data: Record<string, unknown>;
  created_at: string;
  retries: number;
}

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;

  constructor() {
    this.dbReady = this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not available');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Stories store
        if (!db.objectStoreNames.contains(STORES.STORIES)) {
          const storyStore = db.createObjectStore(STORES.STORIES, {
            keyPath: 'id',
          });
          storyStore.createIndex('downloaded_at', 'downloaded_at');
          storyStore.createIndex('expires_at', 'expires_at');
        }

        // Progress store
        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          const progressStore = db.createObjectStore(STORES.PROGRESS, {
            keyPath: 'story_id',
          });
          progressStore.createIndex('synced', 'synced');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.QUEUE)) {
          const queueStore = db.createObjectStore(STORES.QUEUE, {
            keyPath: 'id',
          });
          queueStore.createIndex('type', 'type');
          queueStore.createIndex('created_at', 'created_at');
        }
      };
    });
  }

  private async ensureDb(): Promise<IDBDatabase> {
    await this.dbReady;
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }
    return this.db;
  }

  /**
   * Download a story for offline reading
   */
  async downloadStory(
    story: Omit<OfflineStory, 'downloaded_at' | 'expires_at' | 'size_bytes'>
  ): Promise<boolean> {
    try {
      const db = await this.ensureDb();

      const offlineStory: OfflineStory = {
        ...story,
        downloaded_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        size_bytes: new Blob([JSON.stringify(story)]).size,
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.STORIES, 'readwrite');
        const store = transaction.objectStore(STORES.STORIES);
        const request = store.put(offlineStory);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error downloading story:', error);
      return false;
    }
  }

  /**
   * Get an offline story
   */
  async getOfflineStory(storyId: string): Promise<OfflineStory | null> {
    try {
      const db = await this.ensureDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.STORIES, 'readonly');
        const store = transaction.objectStore(STORES.STORIES);
        const request = store.get(storyId);

        request.onsuccess = () => {
          const story = request.result as OfflineStory | undefined;
          if (story && new Date(story.expires_at) > new Date()) {
            resolve(story);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting offline story:', error);
      return null;
    }
  }

  /**
   * Get all downloaded stories
   */
  async getAllOfflineStories(): Promise<OfflineStory[]> {
    try {
      const db = await this.ensureDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.STORIES, 'readonly');
        const store = transaction.objectStore(STORES.STORIES);
        const request = store.getAll();

        request.onsuccess = () => {
          const stories = (request.result as OfflineStory[]).filter(
            (s) => new Date(s.expires_at) > new Date()
          );
          resolve(stories);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all offline stories:', error);
      return [];
    }
  }

  /**
   * Remove an offline story
   */
  async removeOfflineStory(storyId: string): Promise<boolean> {
    try {
      const db = await this.ensureDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.STORIES, 'readwrite');
        const store = transaction.objectStore(STORES.STORIES);
        const request = store.delete(storyId);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error removing offline story:', error);
      return false;
    }
  }

  /**
   * Save reading progress offline
   */
  async saveProgressOffline(progress: OfflineProgress): Promise<boolean> {
    try {
      const db = await this.ensureDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.PROGRESS, 'readwrite');
        const store = transaction.objectStore(STORES.PROGRESS);
        const request = store.put({ ...progress, synced: false });

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving progress offline:', error);
      return false;
    }
  }

  /**
   * Get offline progress for a story
   */
  async getOfflineProgress(storyId: string): Promise<OfflineProgress | null> {
    try {
      const db = await this.ensureDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.PROGRESS, 'readonly');
        const store = transaction.objectStore(STORES.PROGRESS);
        const request = store.get(storyId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting offline progress:', error);
      return null;
    }
  }

  /**
   * Get all unsynced progress
   */
  async getUnsyncedProgress(): Promise<OfflineProgress[]> {
    try {
      const db = await this.ensureDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.PROGRESS, 'readonly');
        const store = transaction.objectStore(STORES.PROGRESS);
        const index = store.index('synced');
        const request = index.getAll(IDBKeyRange.only(false));

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting unsynced progress:', error);
      return [];
    }
  }

  /**
   * Mark progress as synced
   */
  async markProgressSynced(storyId: string): Promise<void> {
    try {
      const db = await this.ensureDb();
      const progress = await this.getOfflineProgress(storyId);

      if (progress) {
        const transaction = db.transaction(STORES.PROGRESS, 'readwrite');
        const store = transaction.objectStore(STORES.PROGRESS);
        store.put({ ...progress, synced: true });
      }
    } catch (error) {
      console.error('Error marking progress synced:', error);
    }
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(type: SyncQueueItem['type'], data: Record<string, unknown>): Promise<void> {
    try {
      const db = await this.ensureDb();

      const item: SyncQueueItem = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        data,
        created_at: new Date().toISOString(),
        retries: 0,
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.QUEUE, 'readwrite');
        const store = transaction.objectStore(STORES.QUEUE);
        const request = store.add(item);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  /**
   * Get all items in sync queue
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const db = await this.ensureDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.QUEUE, 'readonly');
        const store = transaction.objectStore(STORES.QUEUE);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(itemId: string): Promise<void> {
    try {
      const db = await this.ensureDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.QUEUE, 'readwrite');
        const store = transaction.objectStore(STORES.QUEUE);
        const request = store.delete(itemId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error removing from sync queue:', error);
    }
  }

  /**
   * Get total offline storage used
   */
  async getStorageUsed(): Promise<number> {
    const stories = await this.getAllOfflineStories();
    return stories.reduce((total, story) => total + story.size_bytes, 0);
  }

  /**
   * Clear expired stories
   */
  async clearExpiredStories(): Promise<number> {
    try {
      const stories = await this.getAllOfflineStories();
      const now = new Date();
      let cleared = 0;

      for (const story of stories) {
        if (new Date(story.expires_at) <= now) {
          await this.removeOfflineStory(story.id);
          cleared++;
        }
      }

      return cleared;
    } catch (error) {
      console.error('Error clearing expired stories:', error);
      return 0;
    }
  }

  /**
   * Check if a story is available offline
   */
  async isStoryAvailableOffline(storyId: string): Promise<boolean> {
    const story = await this.getOfflineStory(storyId);
    return story !== null;
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();

// Export types
export type { OfflineStory, OfflineChapter, OfflineChoice, OfflineProgress, SyncQueueItem };
