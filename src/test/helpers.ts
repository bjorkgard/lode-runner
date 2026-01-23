/**
 * Shared test utilities for Lode Runner game tests.
 * Provides common helper functions to create test fixtures and reduce duplication.
 * 
 * @module test/helpers
 */

import { AnimationState } from '../game/animation';
import { TileType, GameState } from '../game/types';
import type { Player, Enemy, GameStateData, Hole } from '../game/types';

/**
 * Creates a test player entity with default or overridden properties.
 * Useful for setting up test scenarios without repeating boilerplate.
 * 
 * @param overrides - Partial player properties to override defaults
 * @returns A complete Player object
 * 
 * @example
 * ```typescript
 * const player = createTestPlayer({ pos: { x: 10, y: 5 }, lives: 2 });
 * ```
 */
export function createTestPlayer(overrides: Partial<Player> = {}): Player {
  return {
    pos: { x: 5, y: 5 },
    velocity: { x: 0, y: 0 },
    animation: new AnimationState('idle'),
    isOnGround: false,
    isOnLadder: false,
    isOnRope: false,
    lives: 3,
    isDead: false,
    isDigging: false,
    digDirection: null,
    ...overrides
  };
}

/**
 * Creates a test enemy entity with default or overridden properties.
 * 
 * @param overrides - Partial enemy properties to override defaults
 * @returns A complete Enemy object
 * 
 * @example
 * ```typescript
 * const enemy = createTestEnemy({ pos: { x: 15, y: 10 }, isTrapped: true });
 * ```
 */
export function createTestEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    pos: { x: 10, y: 10 },
    velocity: { x: 0, y: 0 },
    animation: new AnimationState('run'),
    isOnGround: false,
    isOnLadder: false,
    isOnRope: false,
    isTrapped: false,
    trapTimer: 0,
    ...overrides
  };
}

/**
 * Creates a tile grid filled with empty tiles.
 * Useful for creating clean test environments.
 * 
 * @param width - Width of the tile grid (default: 28)
 * @param height - Height of the tile grid (default: 16)
 * @returns A 2D array of TileType.Empty
 * 
 * @example
 * ```typescript
 * const tiles = createEmptyTiles();
 * tiles[5][10] = TileType.Brick; // Add a brick at position (10, 5)
 * ```
 */
export function createEmptyTiles(width: number = 28, height: number = 16): TileType[][] {
  return Array(height).fill(null).map(() => Array(width).fill(TileType.Empty));
}

/**
 * Creates a tile grid with borders (steel tiles around the edges).
 * Useful for testing scenarios that require boundaries.
 * 
 * @param width - Width of the tile grid (default: 28)
 * @param height - Height of the tile grid (default: 16)
 * @returns A 2D array with steel borders and empty interior
 * 
 * @example
 * ```typescript
 * const tiles = createBorderedTiles();
 * // Tiles[0][x] and tiles[15][x] are steel (top/bottom borders)
 * // Tiles[y][0] and tiles[y][27] are steel (left/right borders)
 * ```
 */
export function createBorderedTiles(width: number = 28, height: number = 16): TileType[][] {
  const tiles = createEmptyTiles(width, height);
  
  // Add steel borders
  for (let x = 0; x < width; x++) {
    tiles[0][x] = TileType.Steel;
    tiles[height - 1][x] = TileType.Steel;
  }
  for (let y = 0; y < height; y++) {
    tiles[y][0] = TileType.Steel;
    tiles[y][width - 1] = TileType.Steel;
  }
  
  return tiles;
}

/**
 * Creates a test hole with default or overridden properties.
 * 
 * @param overrides - Partial hole properties to override defaults
 * @returns A complete Hole object
 * 
 * @example
 * ```typescript
 * const hole = createTestHole({ pos: { x: 5, y: 6 }, regenerationTimer: 2.5 });
 * ```
 */
export function createTestHole(overrides: Partial<Hole> = {}): Hole {
  return {
    pos: { x: 5, y: 5 },
    regenerationTimer: 5,
    maxRegenTime: 5,
    ...overrides
  };
}

/**
 * Creates a minimal game state for testing with default or overridden properties.
 * Provides a complete GameStateData object with sensible defaults.
 * 
 * @param overrides - Partial game state properties to override defaults
 * @returns A complete GameStateData object
 * 
 * @example
 * ```typescript
 * const state = createTestState({
 *   player: createTestPlayer({ pos: { x: 10, y: 5 } }),
 *   enemies: [createTestEnemy()],
 *   tiles: createBorderedTiles()
 * });
 * ```
 */
export function createTestState(overrides: Partial<GameStateData> = {}): GameStateData {
  return {
    currentLevel: 1,
    score: 0,
    highScore: 0,
    lives: 3,
    player: createTestPlayer(),
    enemies: [],
    tiles: createEmptyTiles(),
    holes: [],
    holePositions: new Set(),
    goldRemaining: 0,
    exitRevealed: false,
    levelTimer: 0,
    gameState: GameState.Playing,
    ...overrides
  };
}

/**
 * Creates a tile grid with gold at a specific position.
 * Useful for testing gold collection scenarios.
 * 
 * @param pos - Position where gold should be placed
 * @param bordered - Whether to add steel borders (default: true)
 * @returns A 2D tile array with gold at the specified position
 * 
 * @example
 * ```typescript
 * const tiles = createTilesWithGoldAt({ x: 10, y: 5 });
 * // tiles[5][10] === TileType.Gold
 * ```
 */
export function createTilesWithGoldAt(
  pos: { x: number; y: number },
  bordered: boolean = true
): TileType[][] {
  const tiles = bordered ? createBorderedTiles() : createEmptyTiles();
  
  if (pos.y >= 0 && pos.y < tiles.length && pos.x >= 0 && pos.x < tiles[0].length) {
    tiles[pos.y][pos.x] = TileType.Gold;
  }
  
  return tiles;
}

/**
 * Creates a tile grid with an exit at a specific position.
 * Useful for testing level completion scenarios.
 * 
 * @param pos - Position where exit should be placed
 * @param bordered - Whether to add steel borders (default: true)
 * @returns A 2D tile array with exit at the specified position
 * 
 * @example
 * ```typescript
 * const tiles = createTilesWithExitAt({ x: 10, y: 5 });
 * // tiles[5][10] === TileType.Exit
 * ```
 */
export function createTilesWithExitAt(
  pos: { x: number; y: number },
  bordered: boolean = true
): TileType[][] {
  const tiles = bordered ? createBorderedTiles() : createEmptyTiles();
  
  if (pos.y >= 0 && pos.y < tiles.length && pos.x >= 0 && pos.x < tiles[0].length) {
    tiles[pos.y][pos.x] = TileType.Exit;
  }
  
  return tiles;
}

/**
 * Creates a tile grid with a brick at a specific position.
 * Useful for testing digging scenarios.
 * 
 * @param pos - Position where brick should be placed
 * @returns A 2D tile array with brick at the specified position
 * 
 * @example
 * ```typescript
 * const tiles = createTilesWithBrickAt({ x: 10, y: 5 });
 * // tiles[5][10] === TileType.Brick
 * ```
 */
export function createTilesWithBrickAt(pos: { x: number; y: number }): TileType[][] {
  const tiles = createEmptyTiles();
  
  if (pos.y >= 0 && pos.y < tiles.length && pos.x >= 0 && pos.x < tiles[0].length) {
    tiles[pos.y][pos.x] = TileType.Brick;
  }
  
  return tiles;
}
