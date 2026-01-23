import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { LEVELS, loadLevel, countGold, isValidLevel, getLevel } from './levels';
import { TileType, GameState } from './types';
import { AnimationState } from './animation';
import type { GameStateData } from './types';

/**
 * Test suite for level data and loading system.
 * 
 * Tests the level definitions, loading functions, and validation logic.
 * Includes both unit tests for specific scenarios and property-based tests
 * for universal correctness properties.
 */
describe('Level System', () => {
  /**
   * Helper function to create a minimal game state for testing.
   */
  function createTestState(): GameStateData {
    return {
      currentLevel: 1,
      score: 0,
      highScore: 0,
      lives: 3,
      player: {
        pos: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        animation: new AnimationState('idle'),
        isOnGround: false,
        isOnLadder: false,
        isOnRope: false,
        lives: 3,
        isDead: false,
        isDigging: false,
        digDirection: null
      },
      enemies: [],
      tiles: [],
      holes: [],
      goldRemaining: 0,
      exitRevealed: false,
      levelTimer: 0,
      gameState: GameState.Menu
    };
  }

  describe('Level Data', () => {
    it('should have 100 levels defined', () => {
      expect(LEVELS).toHaveLength(100);
    });

    it('should have sequential level numbers', () => {
      LEVELS.forEach((level, index) => {
        expect(level.number).toBe(index + 1);
      });
    });

    it('should have consistent dimensions (28x16)', () => {
      LEVELS.forEach(level => {
        expect(level.width).toBe(28);
        expect(level.height).toBe(16);
        expect(level.tiles).toHaveLength(16);
        level.tiles.forEach(row => {
          expect(row).toHaveLength(28);
        });
      });
    });

    it('should have valid player start positions', () => {
      LEVELS.forEach(level => {
        expect(level.playerStart.x).toBeGreaterThanOrEqual(0);
        expect(level.playerStart.x).toBeLessThan(level.width);
        expect(level.playerStart.y).toBeGreaterThanOrEqual(0);
        expect(level.playerStart.y).toBeLessThan(level.height);
      });
    });

    it('should have valid enemy start positions', () => {
      LEVELS.forEach(level => {
        level.enemyStarts.forEach(enemyStart => {
          expect(enemyStart.x).toBeGreaterThanOrEqual(0);
          expect(enemyStart.x).toBeLessThan(level.width);
          expect(enemyStart.y).toBeGreaterThanOrEqual(0);
          expect(enemyStart.y).toBeLessThan(level.height);
        });
      });
    });

    it('should have positive par times', () => {
      LEVELS.forEach(level => {
        expect(level.parTime).toBeGreaterThan(0);
      });
    });
    
    it('should have increasing par times for placeholder levels', () => {
      // Check that placeholder levels (11-100) have gradually increasing par times
      for (let i = 11; i < 100; i++) {
        const currentLevel = LEVELS[i - 1];
        const nextLevel = LEVELS[i];
        expect(nextLevel.parTime).toBeGreaterThanOrEqual(currentLevel.parTime);
      }
    });
    
    it('should have increasing enemy counts for higher difficulty tiers', () => {
      // Levels 11-40 (tier 0): 2 enemies
      for (let i = 11; i <= 40; i++) {
        const level = LEVELS[i - 1];
        expect(level.enemyStarts.length).toBe(2);
      }
      
      // Levels 41-70 (tier 1): 3 enemies
      for (let i = 41; i <= 70; i++) {
        const level = LEVELS[i - 1];
        expect(level.enemyStarts.length).toBe(3);
      }
      
      // Levels 71-100 (tier 2): 4 enemies
      for (let i = 71; i <= 100; i++) {
        const level = LEVELS[i - 1];
        expect(level.enemyStarts.length).toBe(4);
      }
    });
    
    it('should have unique tile arrays for each level', () => {
      // Ensure deep copying works - modifying one level shouldn't affect others
      const level11 = LEVELS[10];
      const level12 = LEVELS[11];
      
      expect(level11.tiles).not.toBe(level12.tiles);
      expect(level11.tiles[0]).not.toBe(level12.tiles[0]);
    });
  });

  describe('countGold', () => {
    it('should count gold tiles correctly', () => {
      const tiles = [
        [TileType.Empty, TileType.Gold, TileType.Brick],
        [TileType.Gold, TileType.Ladder, TileType.Gold],
        [TileType.Steel, TileType.Empty, TileType.Empty]
      ];
      expect(countGold(tiles)).toBe(3);
    });

    it('should return 0 for tiles with no gold', () => {
      const tiles = [
        [TileType.Empty, TileType.Brick, TileType.Steel],
        [TileType.Ladder, TileType.Rope, TileType.Empty]
      ];
      expect(countGold(tiles)).toBe(0);
    });

    it('should handle empty tile array', () => {
      expect(countGold([])).toBe(0);
    });
  });

  describe('isValidLevel', () => {
    it('should validate correct level data', () => {
      const validLevel = LEVELS[0];
      expect(isValidLevel(validLevel)).toBe(true);
    });

    it('should reject level with missing number', () => {
      const invalidLevel = { ...LEVELS[0], number: undefined as unknown as number };
      expect(isValidLevel(invalidLevel)).toBe(false);
    });

    it('should reject level with invalid dimensions', () => {
      const invalidLevel = { ...LEVELS[0], width: 0 };
      expect(isValidLevel(invalidLevel)).toBe(false);
    });

    it('should reject level with mismatched tile dimensions', () => {
      const invalidLevel = {
        ...LEVELS[0],
        tiles: [[TileType.Empty]] // Wrong dimensions
      };
      expect(isValidLevel(invalidLevel)).toBe(false);
    });

    it('should reject level with out-of-bounds player start', () => {
      const invalidLevel = {
        ...LEVELS[0],
        playerStart: { x: 100, y: 100 }
      };
      expect(isValidLevel(invalidLevel)).toBe(false);
    });

    it('should reject level with out-of-bounds enemy start', () => {
      const invalidLevel = {
        ...LEVELS[0],
        enemyStarts: [{ x: -1, y: 5 }]
      };
      expect(isValidLevel(invalidLevel)).toBe(false);
    });

    it('should reject level with invalid par time', () => {
      const invalidLevel = { ...LEVELS[0], parTime: -10 };
      expect(isValidLevel(invalidLevel)).toBe(false);
    });
  });

  describe('getLevel', () => {
    it('should return level by number', () => {
      const level = getLevel(1);
      expect(level).toBeDefined();
      expect(level?.number).toBe(1);
    });

    it('should return undefined for invalid level number', () => {
      expect(getLevel(0)).toBeUndefined();
      expect(getLevel(101)).toBeUndefined();
      expect(getLevel(-5)).toBeUndefined();
    });
  });

  describe('loadLevel', () => {
    let state: GameStateData;

    beforeEach(() => {
      state = createTestState();
    });

    it('should load level 1 correctly', () => {
      loadLevel(state, 1);
      
      expect(state.currentLevel).toBe(1);
      expect(state.tiles).toHaveLength(16);
      expect(state.tiles[0]).toHaveLength(28);
      expect(state.player.pos).toEqual(LEVELS[0].playerStart);
      expect(state.enemies).toHaveLength(LEVELS[0].enemyStarts.length);
      expect(state.holes).toHaveLength(0);
      expect(state.exitRevealed).toBe(false);
      expect(state.levelTimer).toBe(0);
    });

    it('should deep copy tiles to avoid modifying original', () => {
      loadLevel(state, 1);
      
      // Modify loaded tiles
      state.tiles[0][0] = TileType.Empty;
      
      // Original should be unchanged
      expect(LEVELS[0].tiles[0][0]).not.toBe(TileType.Empty);
    });

    it('should reset player state when loading level', () => {
      state.player.velocity = { x: 5, y: 10 };
      state.player.isDead = true;
      state.player.isDigging = true;
      
      loadLevel(state, 1);
      
      expect(state.player.velocity).toEqual({ x: 0, y: 0 });
      expect(state.player.isDead).toBe(false);
      expect(state.player.isDigging).toBe(false);
      expect(state.player.digDirection).toBeNull();
    });

    it('should create enemies at correct positions', () => {
      loadLevel(state, 3); // Level 3 has 1 enemy
      
      expect(state.enemies).toHaveLength(1);
      expect(state.enemies[0].pos).toEqual(LEVELS[2].enemyStarts[0]);
      expect(state.enemies[0].velocity).toEqual({ x: 0, y: 0 });
      expect(state.enemies[0].isTrapped).toBe(false);
    });

    it('should count gold correctly', () => {
      loadLevel(state, 1);
      
      const expectedGold = countGold(LEVELS[0].tiles);
      expect(state.goldRemaining).toBe(expectedGold);
    });

    it('should handle invalid level number gracefully', () => {
      const originalLevel = state.currentLevel;
      
      // Should throw LevelLoadError for invalid level number
      expect(() => loadLevel(state, 0)).toThrow('Failed to load level 0');
      expect(() => loadLevel(state, 101)).toThrow('Failed to load level 101');
      
      // State should remain unchanged after error
      expect(state.currentLevel).toBe(originalLevel);
    });

    // Feature: lode-runner-game, Property 2: Level Data Integrity
    it('Property 2: loading any valid level produces correct tile grid, player position, and enemy positions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (levelNumber) => {
            const state = createTestState();
            const level = LEVELS[levelNumber - 1];
            
            loadLevel(state, levelNumber);
            
            // Verify level number is set correctly
            expect(state.currentLevel).toBe(levelNumber);
            
            // Verify tiles match level data (deep equality)
            expect(state.tiles).toHaveLength(level.height);
            for (let y = 0; y < level.height; y++) {
              expect(state.tiles[y]).toHaveLength(level.width);
              for (let x = 0; x < level.width; x++) {
                expect(state.tiles[y][x]).toBe(level.tiles[y][x]);
              }
            }
            
            // Verify player position matches level data
            expect(state.player.pos.x).toBe(level.playerStart.x);
            expect(state.player.pos.y).toBe(level.playerStart.y);
            
            // Verify enemy count and positions match level data
            expect(state.enemies).toHaveLength(level.enemyStarts.length);
            for (let i = 0; i < level.enemyStarts.length; i++) {
              expect(state.enemies[i].pos.x).toBe(level.enemyStarts[i].x);
              expect(state.enemies[i].pos.y).toBe(level.enemyStarts[i].y);
            }
            
            // Verify gold count is correct
            const expectedGold = countGold(level.tiles);
            expect(state.goldRemaining).toBe(expectedGold);
            
            // Verify level-specific state is reset
            expect(state.holes).toHaveLength(0);
            expect(state.exitRevealed).toBe(false);
            expect(state.levelTimer).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
