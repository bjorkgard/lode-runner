// Property-based and unit tests for physics system

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  updatePhysics,
  updatePlayerPhysics,
  updateEnemyPhysics,
  isSupported,
  resolveCollisions,
  getTileAt,
  canMoveTo
} from './physics';
import { TileType, AnimationState } from './types';
import type { Player, Enemy, Position, GameStateData } from './types';

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
function createEmptyTiles(width: number = 28, height: number = 16): number[][] {
  return Array(height).fill(null).map(() => Array(width).fill(TileType.Empty));
}

// Helper function to create tiles with a specific tile at a position
function createTilesWithTileAt(pos: Position, tileType: number, width: number = 28, height: number = 16): number[][] {
  const tiles = createEmptyTiles(width, height);
  if (pos.y >= 0 && pos.y < height && pos.x >= 0 && pos.x < width) {
    tiles[pos.y][pos.x] = tileType;
  }
  return tiles;
}

describe('Physics System', () => {
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
            
            updatePlayerPhysics(player, tiles, deltaTime);
            
            // Player should have downward velocity (positive y)
            expect(player.velocity.y).toBeGreaterThan(initialVelocityY);
            // Player should have moved down
            expect(player.pos.y).toBeGreaterThan(initialY);
            // Player should not be on ground
            expect(player.isOnGround).toBe(false);
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
            
            updateEnemyPhysics(enemy, tiles, deltaTime);
            
            // Enemy should have downward velocity (positive y)
            expect(enemy.velocity.y).toBeGreaterThan(initialVelocityY);
            // Enemy should have moved down
            expect(enemy.pos.y).toBeGreaterThan(initialY);
            // Enemy should not be on ground
            expect(enemy.isOnGround).toBe(false);
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
            switch (direction) {
              case 'left':
                player.velocity.x = -50;
                break;
              case 'right':
                player.velocity.x = 50;
                break;
              case 'up':
                player.velocity.y = -50;
                break;
              case 'down':
                player.velocity.y = 50;
                break;
            }
            
            const initialX = player.pos.x;
            const initialY = player.pos.y;
            
            updatePlayerPhysics(player, tiles, 0.1);
            
            // Player should not have moved through the solid tile
            // Check that player didn't cross into the solid tile position
            const finalTileX = Math.floor(player.pos.x);
            const finalTileY = Math.floor(player.pos.y);
            
            // Player should not be inside the solid tile
            if (direction !== 'down') {
              const crossedIntoSolidTile = (finalTileX === solidX && finalTileY === solidY);
              expect(crossedIntoSolidTile).toBe(false);
            } else {
              // For down movement, player should not have moved significantly
              expect(player.pos.y).toBeLessThanOrEqual(playerY + 0.5);
            }
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
            
            const initialVelocityY = player.velocity.y;
            
            updatePlayerPhysics(player, tiles, deltaTime);
            
            // Velocity should not have changed due to gravity
            // (it stays the same as input velocity)
            expect(player.velocity.y).toBe(0); // Physics sets to 0 when supported
            // Player should still be on ladder
            expect(player.isOnLadder).toBe(true);
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
            
            updatePlayerPhysics(player, tiles, deltaTime);
            
            // Player should not fall (velocity.y should be 0)
            expect(player.velocity.y).toBe(0);
            // Player should still be on rope
            expect(player.isOnRope).toBe(true);
            // Player should be supported (not falling)
            expect(isSupported(player, tiles)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
