import { bingoService, BingoBoard } from './bingoService';

// Mocking Supabase client for testing
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(),
  }),
}));

describe('BingoService', () => {
  const userId = 'test-user-123';

  it('should generate a 3x3 board by default', () => {
    const board = bingoService.generateBoard(userId);
    expect(board.tiles.length).toBe(9);
    expect(board.userId).toBe(userId);
    expect(board.bonusClaimed).toBe(false);
  });

  it('should generate a 4x4 board when requested', () => {
    const board = bingoService.generateBoard(userId, 4);
    expect(board.tiles.length).toBe(16);
  });

  it('should update tile progress', () => {
    let board = bingoService.generateBoard(userId);
    // Find a 'read' type tile
    const readTileIndex = board.tiles.findIndex((t) => t.type === 'read');
    const initialTile = board.tiles[readTileIndex];

    board = bingoService.updateTileProgress(board, 'read', 1);

    expect(board.tiles[readTileIndex].current).toBe(initialTile.current + 1);
  });

  it('should mark tile as completed when target is reached', () => {
    let board = bingoService.generateBoard(userId);
    const tile = board.tiles[0];

    board = bingoService.updateTileProgress(board, tile.type, tile.target);

    expect(board.tiles[0].completed).toBe(true);
  });

  it('should detect bingo on a full row', () => {
    const board = bingoService.generateBoard(userId, 3);
    // Manually complete first row
    board.tiles[0].completed = true;
    board.tiles[1].completed = true;
    board.tiles[2].completed = true;

    expect(bingoService.checkBingo(board)).toBe(true);
  });

  it('should detect bingo on a full column', () => {
    const board = bingoService.generateBoard(userId, 3);
    // Manually complete first column
    board.tiles[0].completed = true;
    board.tiles[3].completed = true;
    board.tiles[6].completed = true;

    expect(bingoService.checkBingo(board)).toBe(true);
  });

  it('should detect bingo on a diagonal', () => {
    const board = bingoService.generateBoard(userId, 3);
    // Manually complete main diagonal
    board.tiles[0].completed = true;
    board.tiles[4].completed = true;
    board.tiles[8].completed = true;

    expect(bingoService.checkBingo(board)).toBe(true);
  });

  it('should return false if no bingo is present', () => {
    const board = bingoService.generateBoard(userId, 3);
    board.tiles[0].completed = true;
    board.tiles[1].completed = true;
    // Missing tile 2 for a row

    expect(bingoService.checkBingo(board)).toBe(false);
  });
});
