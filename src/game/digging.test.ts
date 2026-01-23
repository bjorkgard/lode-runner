// Property-based and unit tests for digging system

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { updateDigging, digHole } from './digging';
import { TileType, GameState } from './types';
import type { GameStateData, Hole } from './types';
import { HOLE_REGEN_TIME } from './constants';
import {
  createTestPlayer,
  createTestEnemy,
  createTestState,
  createEmptyTiles,
  createTestHole
} from '../test/helpers';

describe('Digging System', () => {
  describe('digHole', () => {
    test('does not mutate original state', () => {
      const tiles = createEmptyTiles();
      tiles[6][4] = TileType.Brick; // Brick to the left-down
      
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 5, y: 5 } }),
        tiles
      });
      
      const originalHolesLength = state.holes.length;
      const originalTile = state.tiles[6][4];
      
      digHole(state, 'left');
      
      // Original state should be unchanged
      expect(state.holes.length).toBe(originalHolesLength);
      expect(state.tiles[6][4]).toBe(originalTile);
    });
    
    test('returns new state object when hole is created', () => {
      const tiles = createEmptyTiles();
      tiles[6][4] = TileType.Brick;
      
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 5, y: 5 } }),
        tiles
      });
      
      const newState = digHole(state, 'left');
      
      expect(newState).not.toBe(state);
      expect(newState.tiles).not.toBe(state.tiles);
      expect(newState.holes).not.toBe(state.holes);
    });
    
    test('digging into steel tile should not create hole', () => {
      const tiles = createEmptyTiles();
      tiles[6][6] = TileType.Steel;
      
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 5, y: 5 } }),
        tiles
      });
      
      const newState = digHole(state, 'right');
      
      expect(newState.holes).toHaveLength(0);
      expect(newState.tiles[6][6]).toBe(TileType.Steel);
    });
    
    test('digging into empty tile should not create hole', () => {
      const tiles = createEmptyTiles();
      // tiles[6][6] is already Empty
      
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 5, y: 5 } }),
        tiles
      });
      
      const newState = digHole(state, 'right');
      
      expect(newState.holes).toHaveLength(0);
    });
    
    test('cannot dig where hole already exists', () => {
      const tiles = createEmptyTiles();
      tiles[6][4] = TileType.Empty; // Already a hole
      
      const existingHole: Hole = {
        pos: { x: 4, y: 6 },
        regenerationTimer: 3,
        maxRegenTime: HOLE_REGEN_TIME
      };
      
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 5, y: 5 } }),
        tiles,
        holes: [existingHole]
      });
      
      const newState = digHole(state, 'left');
      
      expect(newState.holes).toHaveLength(1);
      expect(newState.holes[0]).toBe(existingHole);
    });
  });
  
  describe('updateDigging', () => {
    test('does not mutate original state', () => {
      const hole: Hole = {
        pos: { x: 5, y: 5 },
        regenerationTimer: 2,
        maxRegenTime: HOLE_REGEN_TIME
      };
      
      const state = createTestState({
        holes: [hole]
      });
      
      const originalTimer = state.holes[0].regenerationTimer;
      
      updateDigging(state, 0.5);
      
      // Original state should be unchanged
      expect(state.holes[0].regenerationTimer).toBe(originalTimer);
    });
    
    test('returns new state object', () => {
      const hole: Hole = {
        pos: { x: 5, y: 5 },
        regenerationTimer: 2,
        maxRegenTime: HOLE_REGEN_TIME
      };
      
      const state = createTestState({
        holes: [hole]
      });
      
      const newState = updateDigging(state, 0.5);
      
      expect(newState).not.toBe(state);
      expect(newState.holes).not.toBe(state.holes);
    });
    
    test('decrements hole regeneration timer', () => {
      const hole: Hole = {
        pos: { x: 5, y: 5 },
        regenerationTimer: 2,
        maxRegenTime: HOLE_REGEN_TIME
      };
      
      const state = createTestState({
        holes: [hole]
      });
      
      const newState = updateDigging(state, 0.5);
      
      expect(newState.holes[0].regenerationTimer).toBe(1.5);
    });
    
    test('hole regenerates after timer expires', () => {
      const tiles = createEmptyTiles();
      tiles[5][5] = TileType.Empty; // Hole location
      
      const hole: Hole = {
        pos: { x: 5, y: 5 },
        regenerationTimer: 0.1,
        maxRegenTime: HOLE_REGEN_TIME
      };
      
      const state = createTestState({
        holes: [hole],
        tiles
      });
      
      const newState = updateDigging(state, 0.2);
      
      expect(newState.holes).toHaveLength(0);
      expect(newState.tiles[5][5]).toBe(TileType.Brick);
    });
    
    test('trapped enemy is eliminated when hole regenerates', () => {
      const tiles = createEmptyTiles();
      tiles[5][5] = TileType.Empty; // Hole location
      
      const hole: Hole = {
        pos: { x: 5, y: 5 },
        regenerationTimer: 0.1,
        maxRegenTime: HOLE_REGEN_TIME
      };
      
      const enemy = createTestEnemy({
        pos: { x: 5, y: 5 }, // Enemy in hole
        isTrapped: true
      });
      
      const state = createTestState({
        holes: [hole],
        enemies: [enemy],
        tiles
      });
      
      const newState = updateDigging(state, 0.2);
      
      expect(newState.enemies).toHaveLength(0);
      expect(newState.tiles[5][5]).toBe(TileType.Brick);
    });
  });
  
  // Property 8: Dig Left Creates Hole
  // Feature: lode-runner-game, Property 8: Dig Left Creates Hole
  // Validates: Requirements 4.1
  describe('Property 8: Dig Left Creates Hole', () => {
    test('digging left creates hole at correct position', () => {
      fc.assert(
        fc.property(
          fc.record({
            playerX: fc.integer({ min: 2, max: 26 }), // Leave room for dig target
            playerY: fc.integer({ min: 1, max: 13 }) // Leave room below
          }),
          ({ playerX, playerY }) => {
            const tiles = createEmptyTiles();
            const digTargetX = playerX - 1;
            const digTargetY = playerY + 1;
            
            // Place brick at dig target position
            tiles[digTargetY][digTargetX] = TileType.Brick;
            
            const state = createTestState({
              player: createTestPlayer({ pos: { x: playerX, y: playerY } }),
              tiles
            });
            
            const newState = digHole(state, 'left');
            
            // Hole should be created
            expect(newState.holes).toHaveLength(1);
            expect(newState.holes[0].pos.x).toBe(digTargetX);
            expect(newState.holes[0].pos.y).toBe(digTargetY);
            
            // Tile should be empty
            expect(newState.tiles[digTargetY][digTargetX]).toBe(TileType.Empty);
            
            // Hole should have correct timer
            expect(newState.holes[0].regenerationTimer).toBe(HOLE_REGEN_TIME);
            expect(newState.holes[0].maxRegenTime).toBe(HOLE_REGEN_TIME);
            
            // Player should be marked as digging
            expect(newState.player.isDigging).toBe(true);
            expect(newState.player.digDirection).toBe('left');
            
            // Original state should be unchanged
            expect(state.holes).toHaveLength(0);
            expect(state.tiles[digTargetY][digTargetX]).toBe(TileType.Brick);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  // Property 9: Dig Right Creates Hole
  // Feature: lode-runner-game, Property 9: Dig Right Creates Hole
  // Validates: Requirements 4.2
  describe('Property 9: Dig Right Creates Hole', () => {
    test('digging right creates hole at correct position', () => {
      fc.assert(
        fc.property(
          fc.record({
            playerX: fc.integer({ min: 1, max: 25 }), // Leave room for dig target
            playerY: fc.integer({ min: 1, max: 13 }) // Leave room below
          }),
          ({ playerX, playerY }) => {
            const tiles = createEmptyTiles();
            const digTargetX = playerX + 1;
            const digTargetY = playerY + 1;
            
            // Place brick at dig target position
            tiles[digTargetY][digTargetX] = TileType.Brick;
            
            const state = createTestState({
              player: createTestPlayer({ pos: { x: playerX, y: playerY } }),
              tiles
            });
            
            const newState = digHole(state, 'right');
            
            // Hole should be created
            expect(newState.holes).toHaveLength(1);
            expect(newState.holes[0].pos.x).toBe(digTargetX);
            expect(newState.holes[0].pos.y).toBe(digTargetY);
            
            // Tile should be empty
            expect(newState.tiles[digTargetY][digTargetX]).toBe(TileType.Empty);
            
            // Hole should have correct timer
            expect(newState.holes[0].regenerationTimer).toBe(HOLE_REGEN_TIME);
            expect(newState.holes[0].maxRegenTime).toBe(HOLE_REGEN_TIME);
            
            // Player should be marked as digging
            expect(newState.player.isDigging).toBe(true);
            expect(newState.player.digDirection).toBe('right');
            
            // Original state should be unchanged
            expect(state.holes).toHaveLength(0);
            expect(state.tiles[digTargetY][digTargetX]).toBe(TileType.Brick);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  // Property 10: Non-Brick Dig Rejection
  // Feature: lode-runner-game, Property 10: Non-Brick Dig Rejection
  // Validates: Requirements 4.3
  describe('Property 10: Non-Brick Dig Rejection', () => {
    test('digging into non-brick tiles fails', () => {
      fc.assert(
        fc.property(
          fc.record({
            playerX: fc.integer({ min: 2, max: 25 }),
            playerY: fc.integer({ min: 1, max: 13 }),
            nonBrickTile: fc.constantFrom(
              TileType.Empty,
              TileType.Steel,
              TileType.Ladder,
              TileType.Rope,
              TileType.Gold,
              TileType.Exit
            ),
            direction: fc.constantFrom('left', 'right')
          }),
          ({ playerX, playerY, nonBrickTile, direction }) => {
            const tiles = createEmptyTiles();
            const digTargetX = direction === 'left' ? playerX - 1 : playerX + 1;
            const digTargetY = playerY + 1;
            
            // Place non-brick tile at dig target position
            tiles[digTargetY][digTargetX] = nonBrickTile;
            
            const state = createTestState({
              player: createTestPlayer({ pos: { x: playerX, y: playerY } }),
              tiles
            });
            
            const newState = digHole(state, direction);
            
            // No hole should be created
            expect(newState.holes).toHaveLength(0);
            
            // Tile should remain unchanged
            expect(newState.tiles[digTargetY][digTargetX]).toBe(nonBrickTile);
            
            // State should be unchanged (same reference)
            expect(newState).toBe(state);
            
            // Original state should be unchanged
            expect(state.holes).toHaveLength(0);
            expect(state.tiles[digTargetY][digTargetX]).toBe(nonBrickTile);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  // Property 12: Hole Regeneration Restores Brick
  // Feature: lode-runner-game, Property 12: Hole Regeneration Restores Brick
  // Validates: Requirements 4.5
  describe('Property 12: Hole Regeneration Restores Brick', () => {
    test('holes regenerate back to brick after timer expires', () => {
      fc.assert(
        fc.property(
          fc.record({
            holeX: fc.integer({ min: 1, max: 26 }),
            holeY: fc.integer({ min: 1, max: 14 }),
            initialTimer: fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }),
            deltaTime: fc.float({ min: Math.fround(0.5), max: Math.fround(2.0), noNaN: true })
          }),
          ({ holeX, holeY, initialTimer, deltaTime }) => {
            // Ensure deltaTime is greater than initialTimer so hole regenerates
            const effectiveDeltaTime = Math.max(deltaTime, initialTimer + 0.1);
            
            const tiles = createEmptyTiles();
            tiles[holeY][holeX] = TileType.Empty; // Hole location
            
            const hole: Hole = {
              pos: { x: holeX, y: holeY },
              regenerationTimer: initialTimer,
              maxRegenTime: HOLE_REGEN_TIME
            };
            
            const state = createTestState({
              holes: [hole],
              tiles
            });
            
            const newState = updateDigging(state, effectiveDeltaTime);
            
            // Hole should be removed
            expect(newState.holes).toHaveLength(0);
            
            // Tile should be restored to brick
            expect(newState.tiles[holeY][holeX]).toBe(TileType.Brick);
            
            // Original state should be unchanged
            expect(state.holes).toHaveLength(1);
            expect(state.tiles[holeY][holeX]).toBe(TileType.Empty);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  // Property 13: Trapped Enemy Elimination
  // Feature: lode-runner-game, Property 13: Trapped Enemy Elimination
  // Validates: Requirements 4.6
  describe('Property 13: Trapped Enemy Elimination', () => {
    test('enemies in regenerating holes are eliminated', () => {
      fc.assert(
        fc.property(
          fc.record({
            holeX: fc.integer({ min: 1, max: 26 }),
            holeY: fc.integer({ min: 1, max: 14 }),
            initialTimer: fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }),
            deltaTime: fc.float({ min: Math.fround(0.5), max: Math.fround(2.0), noNaN: true }),
            enemyOffsetX: fc.float({ min: Math.fround(0), max: Math.fround(0.9), noNaN: true }),
            enemyOffsetY: fc.float({ min: Math.fround(0), max: Math.fround(0.9), noNaN: true })
          }),
          ({ holeX, holeY, initialTimer, deltaTime, enemyOffsetX, enemyOffsetY }) => {
            // Ensure deltaTime is greater than initialTimer so hole regenerates
            const effectiveDeltaTime = Math.max(deltaTime, initialTimer + 0.1);
            
            const tiles = createEmptyTiles();
            tiles[holeY][holeX] = TileType.Empty; // Hole location
            
            const hole: Hole = {
              pos: { x: holeX, y: holeY },
              regenerationTimer: initialTimer,
              maxRegenTime: HOLE_REGEN_TIME
            };
            
            // Enemy positioned in the hole (with fractional offset)
            const enemy = createTestEnemy({
              pos: { x: holeX + enemyOffsetX, y: holeY + enemyOffsetY },
              isTrapped: true
            });
            
            const state = createTestState({
              holes: [hole],
              enemies: [enemy],
              tiles
            });
            
            const newState = updateDigging(state, effectiveDeltaTime);
            
            // Enemy should be eliminated
            expect(newState.enemies).toHaveLength(0);
            
            // Hole should be removed
            expect(newState.holes).toHaveLength(0);
            
            // Tile should be restored to brick
            expect(newState.tiles[holeY][holeX]).toBe(TileType.Brick);
            
            // Original state should be unchanged
            expect(state.enemies).toHaveLength(1);
            expect(state.holes).toHaveLength(1);
            expect(state.tiles[holeY][holeX]).toBe(TileType.Empty);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('enemies outside regenerating holes are not eliminated', () => {
      fc.assert(
        fc.property(
          fc.record({
            holeX: fc.integer({ min: 2, max: 25 }),
            holeY: fc.integer({ min: 2, max: 13 }),
            enemyOffsetX: fc.integer({ min: 2, max: 5 }), // Enemy far from hole
            enemyOffsetY: fc.integer({ min: 2, max: 5 }),
            initialTimer: fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }),
            deltaTime: fc.float({ min: Math.fround(0.5), max: Math.fround(2.0), noNaN: true })
          }),
          ({ holeX, holeY, enemyOffsetX, enemyOffsetY, initialTimer, deltaTime }) => {
            // Ensure deltaTime is greater than initialTimer so hole regenerates
            const effectiveDeltaTime = Math.max(deltaTime, initialTimer + 0.1);
            
            const tiles = createEmptyTiles();
            tiles[holeY][holeX] = TileType.Empty; // Hole location
            
            const hole: Hole = {
              pos: { x: holeX, y: holeY },
              regenerationTimer: initialTimer,
              maxRegenTime: HOLE_REGEN_TIME
            };
            
            // Enemy positioned away from the hole
            const enemy = createTestEnemy({
              pos: { x: holeX + enemyOffsetX, y: holeY + enemyOffsetY },
              isTrapped: false
            });
            
            const state = createTestState({
              holes: [hole],
              enemies: [enemy],
              tiles
            });
            
            const newState = updateDigging(state, effectiveDeltaTime);
            
            // Enemy should NOT be eliminated (it's not in the hole)
            expect(newState.enemies).toHaveLength(1);
            
            // Hole should be removed
            expect(newState.holes).toHaveLength(0);
            
            // Tile should be restored to brick
            expect(newState.tiles[holeY][holeX]).toBe(TileType.Brick);
            
            // Original state should be unchanged
            expect(state.enemies).toHaveLength(1);
            expect(state.holes).toHaveLength(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
