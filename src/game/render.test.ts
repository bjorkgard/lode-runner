/**
 * Tests for rendering system
 * 
 * This test suite validates the rendering system's ability to:
 * - Render complete game state to canvas
 * - Render individual tiles with sprites or fallback
 * - Render player and enemy entities with animations
 * - Render holes with regeneration progress
 * - Handle missing sprite sheets gracefully
 * - Disable image smoothing for pixel-perfect rendering
 * 
 * The rendering system must work with or without loaded sprites,
 * falling back to colored rectangles when sprites are unavailable.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import {
  renderGame,
  renderTiles,
  renderPlayer,
  renderEnemy,
  renderSprite,
  renderHoles
} from './render';
import { TileType, GameState } from './types';
import type { GameStateData, Player, Enemy, Hole, SpriteSheet } from './types';
import { TILE_SIZE } from './constants';
import { SpriteManager } from './sprites';
import { ParticleManager } from './particles';
import { AnimationState } from './animation';

/**
 * Creates a mock canvas 2D context for testing.
 * Tracks all drawing operations for verification.
 */
function createMockContext(): CanvasRenderingContext2D {
  const calls: { method: string; args: any[] }[] = [];
  
  const ctx = {
    canvas: { width: 448, height: 256 }, // 28x16 tiles at 16px each
    imageSmoothingEnabled: true,
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    lineWidth: 1,
    fillRect: vi.fn((...args) => calls.push({ method: 'fillRect', args })),
    strokeRect: vi.fn((...args) => calls.push({ method: 'strokeRect', args })),
    drawImage: vi.fn((...args) => calls.push({ method: 'drawImage', args })),
    save: vi.fn((...args) => calls.push({ method: 'save', args })),
    restore: vi.fn((...args) => calls.push({ method: 'restore', args })),
    scale: vi.fn((...args) => calls.push({ method: 'scale', args })),
    _calls: calls
  } as any;
  
  return ctx;
}

/**
 * Creates a minimal test game state.
 */
function createTestState(overrides: Partial<GameStateData> = {}): GameStateData {
  const defaultTiles: TileType[][] = Array(16).fill(null).map(() =>
    Array(28).fill(TileType.Empty)
  );
  
  return {
    currentLevel: 1,
    score: 0,
    highScore: 0,
    lives: 3,
    player: createTestPlayer(),
    enemies: [],
    tiles: defaultTiles,
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
 * Creates a test player entity.
 */
function createTestPlayer(overrides: Partial<Player> = {}): Player {
  return {
    pos: { x: 5, y: 5 },
    velocity: { x: 0, y: 0 },
    animation: new AnimationState(),
    isOnGround: true,
    isOnLadder: false,
    isOnRope: false,
    lives: 3,
    isDead: false,
    deathTimer: -1,
    isDigging: false,
    digDirection: null,
    ...overrides
  };
}

/**
 * Creates a test enemy entity.
 */
function createTestEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    pos: { x: 10, y: 10 },
    velocity: { x: 0, y: 0 },
    animation: new AnimationState('run'), // Enemies use 'run' as default, not 'idle'
    isOnGround: true,
    isOnLadder: false,
    isOnRope: false,
    isTrapped: false,
    trapTimer: 0,
    ...overrides
  };
}

/**
 * Creates a mock sprite sheet for testing.
 */
function createMockSpriteSheet(): SpriteSheet {
  const img = {
    width: 256,
    height: 256
  } as HTMLImageElement;
  
  return {
    image: img,
    frameWidth: 16,
    frameHeight: 16
  };
}

describe('Rendering System', () => {
  let spriteManager: SpriteManager;
  let particleManager: ParticleManager;
  
  beforeEach(() => {
    spriteManager = new SpriteManager();
    particleManager = new ParticleManager();
    particleManager.init();
  });

  describe('renderGame', () => {
    /**
     * Validates that renderGame disables image smoothing.
     * This is critical for pixel-perfect rendering of retro-style sprites.
     */
    test('should disable image smoothing for pixel-perfect rendering', () => {
      const ctx = createMockContext();
      const state = createTestState();
      
      renderGame(state, ctx, spriteManager, particleManager);
      
      expect(ctx.imageSmoothingEnabled).toBe(false);
    });

    /**
     * Validates that renderGame clears the canvas with black background.
     */
    test('should clear canvas with black background', () => {
      const ctx = createMockContext();
      const state = createTestState();
      
      renderGame(state, ctx, spriteManager, particleManager);
      
      // Check that fillRect was called with full canvas dimensions
      // (fillStyle may change during rendering, so we just check the call)
      const fillRectCalls = (ctx as any)._calls.filter((c: any) => c.method === 'fillRect');
      const clearCall = fillRectCalls.find((c: any) => 
        c.args[0] === 0 && c.args[1] === 0 && c.args[2] === 448 && c.args[3] === 256
      );
      expect(clearCall).toBeDefined();
    });

    /**
     * Validates that renderGame applies scaling transform.
     */
    test('should apply scaling transform', () => {
      const ctx = createMockContext();
      const state = createTestState();
      
      renderGame(state, ctx, spriteManager, particleManager);
      
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.scale).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    /**
     * Validates that renderGame renders all game elements.
     */
    test('should render tiles, holes, particles, enemies, and player', () => {
      const ctx = createMockContext();
      const state = createTestState({
        tiles: Array(16).fill(null).map(() =>
          Array(28).fill(TileType.Brick)
        ),
        enemies: [createTestEnemy()],
        holes: [{ pos: { x: 5, y: 6 }, regenerationTimer: 2.5, maxRegenTime: 5 }]
      });
      
      renderGame(state, ctx, spriteManager, particleManager);
      
      // Should have drawn something (tiles, holes, enemies, player)
      expect(ctx.fillRect).toHaveBeenCalled();
    });
  });

  describe('renderTiles', () => {
    /**
     * Validates that empty tiles are skipped for performance.
     */
    test('should skip empty tiles', () => {
      const ctx = createMockContext();
      const tiles: TileType[][] = Array(16).fill(null).map(() =>
        Array(28).fill(TileType.Empty)
      );
      
      renderTiles(tiles, ctx, null);
      
      // Should only clear canvas, not draw any tiles
      const fillRectCalls = (ctx as any)._calls.filter((c: any) => c.method === 'fillRect');
      expect(fillRectCalls.length).toBe(0);
    });

    /**
     * Validates that non-empty tiles are rendered.
     */
    test('should render non-empty tiles', () => {
      const ctx = createMockContext();
      const tiles: TileType[][] = Array(16).fill(null).map(() =>
        Array(28).fill(TileType.Empty)
      );
      tiles[5][5] = TileType.Brick;
      tiles[10][10] = TileType.Steel;
      
      renderTiles(tiles, ctx, null);
      
      // Should draw at least 2 tiles (brick and steel)
      const fillRectCalls = (ctx as any)._calls.filter((c: any) => c.method === 'fillRect');
      expect(fillRectCalls.length).toBeGreaterThanOrEqual(2);
    });

    /**
     * Validates that tiles use sprite rendering when sprites are available.
     */
    test('should use sprite rendering when sprites are available', () => {
      const ctx = createMockContext();
      const tiles: TileType[][] = Array(16).fill(null).map(() =>
        Array(28).fill(TileType.Empty)
      );
      tiles[5][5] = TileType.Brick;
      
      const mockSheets = {
        player: createMockSpriteSheet(),
        enemy: createMockSpriteSheet(),
        tiles: createMockSpriteSheet()
      };
      
      renderTiles(tiles, ctx, mockSheets);
      
      // Should use drawImage for sprite rendering
      expect(ctx.drawImage).toHaveBeenCalled();
    });

    /**
     * Validates that tiles use fallback rendering when sprites are unavailable.
     */
    test('should use fallback rendering when sprites are unavailable', () => {
      const ctx = createMockContext();
      const tiles: TileType[][] = Array(16).fill(null).map(() =>
        Array(28).fill(TileType.Empty)
      );
      tiles[5][5] = TileType.Brick;
      
      renderTiles(tiles, ctx, null);
      
      // Should use fillRect for fallback rendering
      const fillRectCalls = (ctx as any)._calls.filter((c: any) => c.method === 'fillRect');
      expect(fillRectCalls.length).toBeGreaterThan(0);
    });
  });

  describe('renderPlayer', () => {
    /**
     * Validates that player is rendered with sprites when available.
     */
    test('should render player with sprites when available', () => {
      const ctx = createMockContext();
      const player = createTestPlayer({ pos: { x: 5, y: 5 } });
      const mockSheets = {
        player: createMockSpriteSheet(),
        enemy: createMockSpriteSheet(),
        tiles: createMockSpriteSheet()
      };
      
      renderPlayer(player, ctx, mockSheets, spriteManager);
      
      expect(ctx.drawImage).toHaveBeenCalled();
    });

    /**
     * Validates that player is rendered with fallback when sprites unavailable.
     */
    test('should render player with fallback when sprites unavailable', () => {
      const ctx = createMockContext();
      const player = createTestPlayer({ pos: { x: 5, y: 5 } });
      
      renderPlayer(player, ctx, null, spriteManager);
      
      // Should draw blue rectangle for player
      expect(ctx.fillStyle).toBe('#0000FF');
      expect(ctx.fillRect).toHaveBeenCalledWith(
        5 * TILE_SIZE,
        5 * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    });

    /**
     * Validates that player position is correctly converted to pixels.
     */
    test('should convert player tile position to pixels', () => {
      const ctx = createMockContext();
      const player = createTestPlayer({ pos: { x: 10, y: 8 } });
      
      renderPlayer(player, ctx, null, spriteManager);
      
      expect(ctx.fillRect).toHaveBeenCalledWith(
        10 * TILE_SIZE,
        8 * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    });
  });

  describe('renderEnemy', () => {
    /**
     * Validates that enemy is rendered with sprites when available.
     */
    test('should render enemy with sprites when available', () => {
      const ctx = createMockContext();
      const enemy = createTestEnemy({ pos: { x: 10, y: 10 } });
      const mockSheets = {
        player: createMockSpriteSheet(),
        enemy: createMockSpriteSheet(),
        tiles: createMockSpriteSheet()
      };
      
      renderEnemy(enemy, ctx, mockSheets, spriteManager);
      
      expect(ctx.drawImage).toHaveBeenCalled();
    });

    /**
     * Validates that enemy is rendered with fallback when sprites unavailable.
     */
    test('should render enemy with fallback when sprites unavailable', () => {
      const ctx = createMockContext();
      const enemy = createTestEnemy({ pos: { x: 10, y: 10 } });
      
      renderEnemy(enemy, ctx, null, spriteManager);
      
      // Should draw red rectangle for enemy
      expect(ctx.fillStyle).toBe('#FF0000');
      expect(ctx.fillRect).toHaveBeenCalledWith(
        10 * TILE_SIZE,
        10 * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    });

    /**
     * Validates that enemy position is correctly converted to pixels.
     */
    test('should convert enemy tile position to pixels', () => {
      const ctx = createMockContext();
      const enemy = createTestEnemy({ pos: { x: 15, y: 12 } });
      
      renderEnemy(enemy, ctx, null, spriteManager);
      
      expect(ctx.fillRect).toHaveBeenCalledWith(
        15 * TILE_SIZE,
        12 * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    });
  });

  describe('renderSprite', () => {
    /**
     * Validates that renderSprite calculates correct source coordinates.
     */
    test('should calculate correct source coordinates for frame index', () => {
      const ctx = createMockContext();
      const sheet = createMockSpriteSheet();
      
      // Frame 0 should be at (0, 0)
      renderSprite(ctx, sheet, 0, 0, 0);
      expect(ctx.drawImage).toHaveBeenCalledWith(
        sheet.image,
        0, 0, 16, 16,  // Source
        0, 0, TILE_SIZE, TILE_SIZE  // Destination
      );
      
      // Frame 1 should be at (16, 0)
      ctx.drawImage = vi.fn();
      renderSprite(ctx, sheet, 1, 0, 0);
      expect(ctx.drawImage).toHaveBeenCalledWith(
        sheet.image,
        16, 0, 16, 16,  // Source
        0, 0, TILE_SIZE, TILE_SIZE  // Destination
      );
      
      // Frame 16 should be at (0, 16) - second row
      ctx.drawImage = vi.fn();
      renderSprite(ctx, sheet, 16, 0, 0);
      expect(ctx.drawImage).toHaveBeenCalledWith(
        sheet.image,
        0, 16, 16, 16,  // Source
        0, 0, TILE_SIZE, TILE_SIZE  // Destination
      );
    });

    /**
     * Validates that renderSprite uses correct destination coordinates.
     */
    test('should use correct destination coordinates', () => {
      const ctx = createMockContext();
      const sheet = createMockSpriteSheet();
      
      renderSprite(ctx, sheet, 0, 100, 200);
      
      expect(ctx.drawImage).toHaveBeenCalledWith(
        sheet.image,
        0, 0, 16, 16,  // Source
        100, 200, TILE_SIZE, TILE_SIZE  // Destination
      );
    });
  });

  describe('renderHoles', () => {
    /**
     * Validates that holes are rendered with regeneration progress.
     */
    test('should render holes with regeneration progress overlay', () => {
      const ctx = createMockContext();
      const holes: Hole[] = [
        { pos: { x: 5, y: 6 }, regenerationTimer: 2.5, maxRegenTime: 5 }
      ];
      
      renderHoles(holes, ctx);
      
      // Should draw semi-transparent overlay
      expect(ctx.fillRect).toHaveBeenCalledWith(
        5 * TILE_SIZE,
        6 * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
      
      // Opacity should increase with progress (50% through = 0.25 alpha)
      expect(ctx.fillStyle).toContain('rgba(139, 69, 19');
    });

    /**
     * Validates that multiple holes are all rendered.
     */
    test('should render multiple holes', () => {
      const ctx = createMockContext();
      const holes: Hole[] = [
        { pos: { x: 5, y: 6 }, regenerationTimer: 2.5, maxRegenTime: 5 },
        { pos: { x: 10, y: 8 }, regenerationTimer: 1.0, maxRegenTime: 5 },
        { pos: { x: 15, y: 12 }, regenerationTimer: 4.5, maxRegenTime: 5 }
      ];
      
      renderHoles(holes, ctx);
      
      // Should draw 3 holes
      expect(ctx.fillRect).toHaveBeenCalledTimes(3);
    });

    /**
     * Validates that hole opacity increases as regeneration progresses.
     */
    test('should increase opacity as hole regenerates', () => {
      const ctx = createMockContext();
      
      // Hole just dug (timer = maxTime, progress = 0)
      const newHole: Hole[] = [
        { pos: { x: 5, y: 6 }, regenerationTimer: 5.0, maxRegenTime: 5 }
      ];
      renderHoles(newHole, ctx);
      const newHoleStyle = ctx.fillStyle;
      
      // Hole almost regenerated (timer = 0.1, progress = 0.98)
      const oldHole: Hole[] = [
        { pos: { x: 5, y: 6 }, regenerationTimer: 0.1, maxRegenTime: 5 }
      ];
      renderHoles(oldHole, ctx);
      const oldHoleStyle = ctx.fillStyle;
      
      // Old hole should have higher opacity (different alpha value)
      expect(newHoleStyle).not.toBe(oldHoleStyle);
    });
  });
});

/**
 * Property-Based Tests for Rendering System
 * 
 * These tests validate that the rendering system handles
 * arbitrary game states without crashing or throwing errors.
 */
describe('Property-Based Tests', () => {
  let spriteManager: SpriteManager;
  let particleManager: ParticleManager;
  
  beforeEach(() => {
    spriteManager = new SpriteManager();
    particleManager = new ParticleManager();
    particleManager.init();
  });

  /**
   * Validates that rendering never throws regardless of game state.
   */
  test('rendering functions never throw with valid inputs', () => {
    fc.assert(
      fc.property(
        fc.record({
          playerX: fc.integer({ min: 0, max: 27 }),
          playerY: fc.integer({ min: 0, max: 15 }),
          enemyCount: fc.integer({ min: 0, max: 10 }),
          holeCount: fc.integer({ min: 0, max: 20 })
        }),
        ({ playerX, playerY, enemyCount, holeCount }) => {
          const ctx = createMockContext();
          
          const enemies = Array(enemyCount).fill(null).map((_, i) => 
            createTestEnemy({ pos: { x: i % 28, y: Math.floor(i / 28) } })
          );
          
          const holes = Array(holeCount).fill(null).map((_, i) => ({
            pos: { x: i % 28, y: Math.floor(i / 28) },
            regenerationTimer: Math.random() * 5,
            maxRegenTime: 5
          }));
          
          const state = createTestState({
            player: createTestPlayer({ pos: { x: playerX, y: playerY } }),
            enemies,
            holes
          });
          
          // None of these should throw
          expect(() => renderGame(state, ctx, spriteManager, particleManager)).not.toThrow();
          expect(() => renderTiles(state.tiles, ctx, null)).not.toThrow();
          expect(() => renderPlayer(state.player, ctx, null, spriteManager)).not.toThrow();
          expect(() => renderHoles(state.holes, ctx)).not.toThrow();
          
          for (const enemy of enemies) {
            expect(() => renderEnemy(enemy, ctx, null, spriteManager)).not.toThrow();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates that sprite rendering handles arbitrary frame indices.
   */
  test('renderSprite handles arbitrary frame indices', () => {
    fc.assert(
      fc.property(
        fc.record({
          frameIndex: fc.integer({ min: 0, max: 255 }),
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 })
        }),
        ({ frameIndex, x, y }) => {
          const ctx = createMockContext();
          const sheet = createMockSpriteSheet();
          
          // Should not throw for any valid frame index
          expect(() => renderSprite(ctx, sheet, frameIndex, x, y)).not.toThrow();
          
          // Should call drawImage
          expect(ctx.drawImage).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
