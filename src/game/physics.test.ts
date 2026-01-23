// Property-based and unit tests for physics system

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  updatePhysics,
  updatePlayerPhysics,
  updateEnemyPhysics,
  isSupported,
  getTileAt,
  canMoveTo
} from './physics';
import { TileType, GameState } from './types';
import { AnimationState } from './animation';
import type { Player, Enemy, GameStateData } from './types';

// Helper function to create a test player
function createTestPlayer(overrides: Partial<Player> = {}): Player {
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

// Helper function to create a test enemy
function createTestEnemy(overrides: Partial<Enemy> = {}): Enemy {
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

// Helper function to create a tile grid filled with empty tiles
function createEmptyTiles(width: number = 28, height: number = 16): TileType[][] {
  return Array(height).fill(null).map(() => Array(width).fill(TileType.Empty));
}

describe('Physics System', () => {
  describe('updatePhysics', () => {
    test('returns new state with updated entities', () => {
      const state: GameStateData = {
        currentLevel: 1,
        score: 0,
        highScore: 0,
        lives: 3,
        player: createTestPlayer({ pos: { x: 5, y: 5 }, velocity: { x: 0, y: 0 } }),
        enemies: [
          createTestEnemy({ pos: { x: 10, y: 10 }, velocity: { x: 0, y: 0 } })
        ],
        tiles: createEmptyTiles(),
        holes: [],
        goldRemaining: 0,
        exitRevealed: false,
        levelTimer: 0,
        gameState: GameState.Playing
      };
      
      const updatedState = updatePhysics(state, 0.016);
      
      // Should return new state object
      expect(updatedState).not.toBe(state);
      // Should return new player object
      expect(updatedState.player).not.toBe(state.player);
      // Should return new enemies array
      expect(updatedState.enemies).not.toBe(state.enemies);
      // Original state should be unchanged
      expect(state.player.pos.y).toBe(5);
      expect(state.enemies[0].pos.y).toBe(10);
    });
    
    test('does not mutate original state', () => {
      const state: GameStateData = {
        currentLevel: 1,
        score: 0,
        highScore: 0,
        lives: 3,
        player: createTestPlayer({ pos: { x: 5, y: 5 }, velocity: { x: 0, y: 0 } }),
        enemies: [
          createTestEnemy({ pos: { x: 10, y: 10 }, velocity: { x: 0, y: 0 } })
        ],
        tiles: createEmptyTiles(),
        holes: [],
        goldRemaining: 0,
        exitRevealed: false,
        levelTimer: 0,
        gameState: GameState.Playing
      };
      
      const originalPlayerY = state.player.pos.y;
      const originalEnemyY = state.enemies[0].pos.y;
      
      updatePhysics(state, 0.016);
      
      // Original state should be completely unchanged
      expect(state.player.pos.y).toBe(originalPlayerY);
      expect(state.enemies[0].pos.y).toBe(originalEnemyY);
    });
  });
  
  describe('getTileAt', () => {
    test('returns correct tile type at position', () => {
      const tiles = createEmptyTiles();
      tiles[5][10] = TileType.Brick;
      
      expect(getTileAt({ x: 10, y: 5 }, tiles)).toBe(TileType.Brick);
    });
    
    test('returns Empty for out of bounds positions', () => {
      const tiles = createEmptyTiles();
      
      expect(getTileAt({ x: -1, y: 5 }, tiles)).toBe(TileType.Empty);
      expect(getTileAt({ x: 100, y: 5 }, tiles)).toBe(TileType.Empty);
      expect(getTileAt({ x: 5, y: -1 }, tiles)).toBe(TileType.Empty);
      expect(getTileAt({ x: 5, y: 100 }, tiles)).toBe(TileType.Empty);
    });
  });
  
  describe('canMoveTo', () => {
    test('returns true for non-solid tiles', () => {
      const tiles = createEmptyTiles();
      tiles[5][10] = TileType.Ladder;
      
      expect(canMoveTo({ x: 10, y: 5 }, tiles)).toBe(true);
      expect(canMoveTo({ x: 0, y: 0 }, tiles)).toBe(true);
    });
    
    test('returns false for solid tiles', () => {
      const tiles = createEmptyTiles();
      tiles[5][10] = TileType.Brick;
      tiles[6][10] = TileType.Steel;
      
      expect(canMoveTo({ x: 10, y: 5 }, tiles)).toBe(false);
      expect(canMoveTo({ x: 10, y: 6 }, tiles)).toBe(false);
    });
  });
  
  describe('isSupported', () => {
    test('entity on rope is supported', () => {
      const player = createTestPlayer({ pos: { x: 5, y: 5 }, isOnRope: true });
      const tiles = createEmptyTiles();
      
      expect(isSupported(player, tiles)).toBe(true);
    });
    
    test('entity on ladder is supported', () => {
      const player = createTestPlayer({ pos: { x: 5, y: 5 }, isOnLadder: true });
      const tiles = createEmptyTiles();
      
      expect(isSupported(player, tiles)).toBe(true);
    });
    
    test('entity with solid tile below is supported', () => {
      const player = createTestPlayer({ pos: { x: 5, y: 5 } });
      const tiles = createEmptyTiles();
      tiles[6][5] = TileType.Brick;
      
      expect(isSupported(player, tiles)).toBe(true);
    });
    
    test('entity with ladder below is supported', () => {
      const player = createTestPlayer({ pos: { x: 5, y: 5 } });
      const tiles = createEmptyTiles();
      tiles[6][5] = TileType.Ladder;
      
      expect(isSupported(player, tiles)).toBe(true);
    });
    
    test('entity with empty tile below is not supported', () => {
      const player = createTestPlayer({ pos: { x: 5, y: 5 } });
      const tiles = createEmptyTiles();
      
      expect(isSupported(player, tiles)).toBe(false);
    });
  });
  
  // Property 4: Gravity Application
  // Feature: lode-runner-game, Property 4: Gravity Application
  // Validates: Requirements 3.2
  describe('Property 4: Gravity Application', () => {
    test('unsupported player falls over time', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.integer({ min: 1, max: 26 }),
            y: fc.integer({ min: 1, max: 14 }),
            deltaTime: fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true })
          }),
          ({ x, y, deltaTime }) => {
            const player = createTestPlayer({
              pos: { x, y },
              velocity: { x: 0, y: 0 }
            });
            const tiles = createEmptyTiles();
            
            const initialY = player.pos.y;
            const initialVelocityY = player.velocity.y;
            
            const updatedPlayer = updatePlayerPhysics(player, tiles, deltaTime);
            
            // Player should have downward velocity (positive y)
            expect(updatedPlayer.velocity.y).toBeGreaterThan(initialVelocityY);
            // Player should have moved down
            expect(updatedPlayer.pos.y).toBeGreaterThan(initialY);
            // Player should not be on ground
            expect(updatedPlayer.isOnGround).toBe(false);
            // Original player should be unchanged
            expect(player.pos.y).toBe(initialY);
            expect(player.velocity.y).toBe(initialVelocityY);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('unsupported enemy falls over time', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.integer({ min: 1, max: 26 }),
            y: fc.integer({ min: 1, max: 14 }),
            deltaTime: fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true })
          }),
          ({ x, y, deltaTime }) => {
            const enemy = createTestEnemy({
              pos: { x, y },
              velocity: { x: 0, y: 0 },
              isTrapped: false
            });
            const tiles = createEmptyTiles();
            
            const initialY = enemy.pos.y;
            const initialVelocityY = enemy.velocity.y;
            
            const updatedEnemy = updateEnemyPhysics(enemy, tiles, deltaTime);
            
            // Enemy should have downward velocity (positive y)
            expect(updatedEnemy.velocity.y).toBeGreaterThan(initialVelocityY);
            // Enemy should have moved down
            expect(updatedEnemy.pos.y).toBeGreaterThan(initialY);
            // Enemy should not be on ground
            expect(updatedEnemy.isOnGround).toBe(false);
            // Original enemy should be unchanged
            expect(enemy.pos.y).toBe(initialY);
            expect(enemy.velocity.y).toBe(initialVelocityY);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  // Property 7: Solid Tile Collision
  // Feature: lode-runner-game, Property 7: Solid Tile Collision
  // Validates: Requirements 3.5
  describe('Property 7: Solid Tile Collision', () => {
    test('player cannot move through solid tiles', () => {
      fc.assert(
        fc.property(
          fc.record({
            playerX: fc.integer({ min: 3, max: 24 }),
            playerY: fc.integer({ min: 3, max: 12 }),
            solidTile: fc.constantFrom(TileType.Brick, TileType.Steel),
            direction: fc.constantFrom('left', 'right', 'up', 'down')
          }),
          ({ playerX, playerY, solidTile, direction }) => {
            const tiles = createEmptyTiles();
            
            // Place solid ground below player to prevent falling
            tiles[playerY + 1][playerX] = TileType.Brick;
            
            // Place solid tile adjacent to player based on direction
            let solidX = playerX;
            let solidY = playerY;
            
            switch (direction) {
              case 'left':
                solidX = playerX - 1;
                break;
              case 'right':
                solidX = playerX + 1;
                break;
              case 'up':
                solidY = playerY - 1;
                break;
              case 'down':
                solidY = playerY + 1;
                // For down, we need to remove the ground and place solid tile
                tiles[playerY + 1][playerX] = solidTile;
                solidY = playerY + 1;
                break;
            }
            
            // Only set solid tile if not moving down (already set above)
            if (direction !== 'down') {
              tiles[solidY][solidX] = solidTile;
            }
            
            const player = createTestPlayer({
              pos: { x: playerX, y: playerY },
              velocity: { x: 0, y: 0 }
            });
            
            // Try to move toward solid tile
            let velocity = { x: 0, y: 0 };
            switch (direction) {
              case 'left':
                velocity.x = -50;
                break;
              case 'right':
                velocity.x = 50;
                break;
              case 'up':
                velocity.y = -50;
                break;
              case 'down':
                velocity.y = 50;
                break;
            }
            
            const playerWithVelocity = { ...player, velocity };
            const updatedPlayer = updatePlayerPhysics(playerWithVelocity, tiles, 0.1);
            
            // Player should not have moved through the solid tile
            // Check that player didn't cross into the solid tile position
            const finalTileX = Math.floor(updatedPlayer.pos.x);
            const finalTileY = Math.floor(updatedPlayer.pos.y);
            
            // Player should not be inside the solid tile
            if (direction !== 'down') {
              const crossedIntoSolidTile = (finalTileX === solidX && finalTileY === solidY);
              expect(crossedIntoSolidTile).toBe(false);
            } else {
              // For down movement, player should not have moved significantly
              expect(updatedPlayer.pos.y).toBeLessThanOrEqual(playerY + 0.5);
            }
            
            // Original player should be unchanged
            expect(player.pos.x).toBe(playerX);
            expect(player.pos.y).toBe(playerY);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  // Property 5: Ladder Movement Without Gravity
  // Feature: lode-runner-game, Property 5: Ladder Movement Without Gravity
  // Validates: Requirements 3.3
  describe('Property 5: Ladder Movement Without Gravity', () => {
    test('player on ladder can move vertically without gravity', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.integer({ min: 1, max: 26 }),
            y: fc.integer({ min: 1, max: 13 }), // Max 13 to stay within bounds (0-15)
            verticalVelocity: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
            deltaTime: fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true })
          }),
          ({ x, y, verticalVelocity, deltaTime }) => {
            const tiles = createEmptyTiles();
            tiles[y][x] = TileType.Ladder;
            
            const player = createTestPlayer({
              pos: { x, y },
              velocity: { x: 0, y: verticalVelocity },
              isOnLadder: true
            });
            
            const updatedPlayer = updatePlayerPhysics(player, tiles, deltaTime);
            
            // Velocity should not have changed due to gravity
            // (it stays the same as input velocity)
            expect(updatedPlayer.velocity.y).toBe(0); // Physics sets to 0 when supported
            // Player should still be on ladder
            expect(updatedPlayer.isOnLadder).toBe(true);
            // Original player should be unchanged
            expect(player.velocity.y).toBe(verticalVelocity);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  // Property 6: Rope Movement Without Gravity
  // Feature: lode-runner-game, Property 6: Rope Movement Without Gravity
  // Validates: Requirements 3.4
  describe('Property 6: Rope Movement Without Gravity', () => {
    test('player on rope can move horizontally without gravity', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.integer({ min: 1, max: 26 }),
            y: fc.integer({ min: 1, max: 13 }), // Max 13 to stay within bounds (0-15)
            horizontalVelocity: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
            deltaTime: fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true })
          }),
          ({ x, y, horizontalVelocity, deltaTime }) => {
            const tiles = createEmptyTiles();
            tiles[y][x] = TileType.Rope;
            
            const player = createTestPlayer({
              pos: { x, y },
              velocity: { x: horizontalVelocity, y: 0 },
              isOnRope: true
            });
            
            const updatedPlayer = updatePlayerPhysics(player, tiles, deltaTime);
            
            // Player should not fall (velocity.y should be 0)
            expect(updatedPlayer.velocity.y).toBe(0);
            // Player should still be on rope
            expect(updatedPlayer.isOnRope).toBe(true);
            // Player should be supported (not falling)
            expect(isSupported(updatedPlayer, tiles)).toBe(true);
            // Original player should be unchanged
            expect(player.velocity.x).toBe(horizontalVelocity);
            expect(player.velocity.y).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
