import { createClient } from '@/lib/supabase/client';

export interface BingoTile {
  id: string;
  label: string;
  description: string;
  type: 'read' | 'create' | 'share' | 'social' | 'special';
  target: number;
  current: number;
  completed: boolean;
  xpReward: number;
}

export interface BingoBoard {
  id: string;
  userId: string;
  tiles: BingoTile[];
  createdAt: string;
  expiresAt: string;
  bonusClaimed: boolean;
}

export class BingoService {
  private static instance: BingoService;
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): BingoService {
    if (!BingoService.instance) {
      BingoService.instance = new BingoService();
    }
    return BingoService.instance;
  }

  /**
   * Generates a new 3x3 or 4x4 bingo board for the user
   */
  public generateBoard(userId: string, size: 3 | 4 = 3): BingoBoard {
    const tiles: BingoTile[] = [];
    const tilePool: Omit<BingoTile, 'id' | 'current' | 'completed'>[] = [
      {
        label: 'Read a Story',
        description: 'Complete 1 story',
        type: 'read',
        target: 1,
        xpReward: 50,
      },
      {
        label: 'Quick Creator',
        description: 'Start a new draft',
        type: 'create',
        target: 1,
        xpReward: 30,
      },
      {
        label: 'Word Smith',
        description: 'Write 500 words',
        type: 'create',
        target: 500,
        xpReward: 100,
      },
      {
        label: 'Social Butterfly',
        description: 'Share a story link',
        type: 'share',
        target: 1,
        xpReward: 40,
      },
      {
        label: 'Feedback Loop',
        description: 'Post 2 comments',
        type: 'social',
        target: 2,
        xpReward: 60,
      },
      {
        label: 'Pathfinder',
        description: 'Make 10 choices',
        type: 'read',
        target: 10,
        xpReward: 50,
      },
      {
        label: 'Deep Reader',
        description: 'Read for 15 minutes',
        type: 'read',
        target: 15,
        xpReward: 80,
      },
      {
        label: 'Trendsetter',
        description: 'Get 5 likes on your story',
        type: 'social',
        target: 5,
        xpReward: 150,
      },
      {
        label: 'Diverse Tastes',
        description: 'Read stories from 2 genres',
        type: 'read',
        target: 2,
        xpReward: 70,
      },
      {
        label: 'Daily Habit',
        description: 'Log in 2 days in a row',
        type: 'special',
        target: 2,
        xpReward: 50,
      },
      {
        label: 'Cover Artist',
        description: 'Generate a story cover',
        type: 'create',
        target: 1,
        xpReward: 40,
      },
      {
        label: 'Conversation Starter',
        description: 'Reply to a comment',
        type: 'social',
        target: 1,
        xpReward: 30,
      },
      { label: 'Critique', description: 'Rate 3 stories', type: 'read', target: 3, xpReward: 40 },
      {
        label: 'Marathoner',
        description: 'Read 3 stories in one session',
        type: 'read',
        target: 3,
        xpReward: 120,
      },
      {
        label: 'Niche Explorer',
        description: 'Read a story with < 100 views',
        type: 'read',
        target: 1,
        xpReward: 60,
      },
      {
        label: 'Early Adopter',
        description: 'Follow a new creator',
        type: 'social',
        target: 1,
        xpReward: 30,
      },
      {
        label: 'Group Story',
        description: 'Contribute to a collaborative story',
        type: 'social',
        target: 1,
        xpReward: 100,
      },
      {
        label: 'Story Gift',
        description: 'Gift a story access to a friend',
        type: 'social',
        target: 1,
        xpReward: 150,
      },
      {
        label: 'Guild Member',
        description: 'Join or create a story club',
        type: 'social',
        target: 1,
        xpReward: 50,
      },
      {
        label: 'Fan Favorite',
        description: 'Get shared 3 times by others',
        type: 'special',
        target: 3,
        xpReward: 200,
      },
    ];

    // Randomly pick tiles for the board
    const shuffled = [...tilePool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, size * size);

    for (let i = 0; i < selected.length; i++) {
      tiles.push({
        ...selected[i],
        id: `tile-${i}`,
        current: 0,
        completed: false,
      });
    }

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 7); // Boards last for a week

    return {
      id: `bingo-${userId}-${now.getTime()}`,
      userId,
      tiles,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      bonusClaimed: false,
    };
  }

  /**
   * Updates progress on a specific tile type
   */
  public updateTileProgress(
    board: BingoBoard,
    type: BingoTile['type'],
    amount: number = 1
  ): BingoBoard {
    const updatedTiles = board.tiles.map((tile) => {
      if (tile.type === type && !tile.completed) {
        const newCurrent = tile.current + amount;
        return {
          ...tile,
          current: newCurrent,
          completed: newCurrent >= tile.target,
        };
      }
      return tile;
    });

    return {
      ...board,
      tiles: updatedTiles,
    };
  }

  /**
   * Checks for completed rows, columns, or diagonals
   */
  public checkBingo(board: BingoBoard): boolean {
    const size = Math.sqrt(board.tiles.length);
    const grid: boolean[][] = [];

    for (let i = 0; i < size; i++) {
      grid[i] = [];
      for (let j = 0; j < size; j++) {
        grid[i][j] = board.tiles[i * size + j].completed;
      }
    }

    // Check rows
    for (let i = 0; i < size; i++) {
      if (grid[i].every((val) => val)) return true;
    }

    // Check columns
    for (let j = 0; j < size; j++) {
      let colComplete = true;
      for (let i = 0; i < size; i++) {
        if (!grid[i][j]) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) return true;
    }

    // Check diagonals
    let diag1Complete = true;
    let diag2Complete = true;
    for (let i = 0; i < size; i++) {
      if (!grid[i][i]) diag1Complete = false;
      if (!grid[i][size - 1 - i]) diag2Complete = false;
    }

    return diag1Complete || diag2Complete;
  }
}

export const bingoService = BingoService.getInstance();
