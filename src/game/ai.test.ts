// Tests for Enemy AI system

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { updateAI, calculateChaseDirection, moveEnemy, checkEnemyTrapped } from './ai';
import type { GameStateData, Enemy, Player, Hole } from './types';
import { TileType, GameState } from './types';
import { AnimationState } from './animation';
import { ENEMY_SPEED } from './constants';

/**
 * Helper function to create a test game state with specified properties.
 */
function createTestState(overrides: Partial<GameStateData> = {}): GameStateData {
  return {
    currentLevel: 1,
    score: 0,
    highScore: 0,
    lives: 3,
    player: {
      pos: { x: 5, y: 5 },
      velocity: { x: 0, y: 0 },
      animation: new AnimationState('idle'),
      isOnGround: true,
      isOnLadder: false,
      isOnRope: false,
      lives: 3,
      isDead: false,
      isDigging: false,
      digDirection: null
    },
    enemies: [],
    tiles: Array(16).fill(null).map(() => Array(28).fill(TileType.Empty)),
    holes: [],
    goldRemaining: 0,
    exitRevealed: false,
    levelTimer: 0,
    gameState: GameState.Playing,
    ...overrides
  };
}

/**
 * Helper function to create a test enemy with specified properties.
 */
function createTestEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    pos: { x: 10, y: 10 },
    velocity: { x: 0, y: 0 },
    animation: new AnimationState('run'),
    isOnGround: true,
    isOnLadder: false,
    isOnRope: false,
    isTrapped: false,
    trapTimer: 0,
    ...overrides
  };
}

/**
 * Helper function to create a test player with specified properties.
 */
function createTestPlayer(overrides: Partial<Player> = {}): Player {
  return {
    pos: { x: 5, y: 5 },
    velocity: { x: 0, y: 0 },
    animation: new AnimationState('idle'),
    isOnGround: true,
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
 * Helper function to create an empty tile grid.
 */
function createEmptyTiles(): TileType[][] {
  return Array(16).fill(null).map(() => Array(28).fill(TileType.Empty));
}

describe('Enemy AI System', () => {
  describe('calculateChaseDirection', () => {
    test('should return horizontal direction when horizontal distance is greater', () => {
      const enemy = createTestEnemy({ pos: { x: 5, y: 5 } });
      const player = createTestPlayer({ pos: { x: 10, y: 6 } });
      const tiles = createEmptyTiles();
      
      const direction = calculateChaseDirection(enemy, player, tiles);
      
      expect(direction.x).toBe(1); // Move right toward player
      expect(direction.y).toBe(0);
    });
    
    test('should return vertical direction when vertical distance is greater', () => {
      const enemy = createTestEnemy({ pos: { x: 5, y: 5 } });
      const player = createTestPlayer({ pos: { x: 6, y: 10 } });
      const tiles = createEmptyTiles();
      
      const direction = calculateChaseDirection(enemy, player, tiles);
      
      expect(direction.x).toBe(0);
      expect(direction.y).toBe(1); // Move down toward player
    });
    
    test('should move left when player is to the left', () => {
      const enemy = createTestEnemy({ pos: { x: 10, y: 5 } });
      const player = createTestPlayer({ pos: { x: 3, y: 5 } });
      const tiles = createEmptyTiles();
      
      const direction = calculateChaseDirection(enemy, player, tiles);
      
      expect(direction.x).toBe(-1); // Move left toward player
      expect(direction.y).toBe(0);
    });
    
    test('should move up when player is above', () => {
      const enemy = createTestEnemy({ pos: { x: 5, y: 10 } });
      const player = createTestPlayer({ pos: { x: 5, y: 3 } });
      const tiles = createEmptyTiles();
      
      const direction = calculateChaseDirection(enemy, player, tiles);
      
      expect(direction.x).toBe(0);
      expect(direction.y).toBe(-1); // Move up toward player
    });
  });
  
  describe('moveEnemy', () => {
    test('should set velocity when move is valid', () => {
      const enemy = createTestEnemy({ pos: { x: 5, y: 5 } });
      const direction = { x: 1, y: 0 };
      const tiles = createEmptyTiles();
      
      const movedEnemy = moveEnemy(enemy, direction, tiles, 0.016);
      
      expect(movedEnemy.velocity.x).toBe(ENEMY_SPEED);
      expect(movedEnemy.velocity.y).toBe(0);
    });
    
    test('should stop when move is blocked by solid tile', () => {
      const enemy = createTestEnemy({ pos: { x: 5, y: 5 } });
      const direction = { x: 1, y: 0 };
      const tiles = createEmptyTiles();
      tiles[5][6] = TileType.Brick; // Block the path
      
      const movedEnemy = moveEnemy(enemy, direction, tiles, 0.016);
      
      expect(movedEnemy.velocity.x).toBe(0);
      expect(movedEnemy.velocity.y).toBe(0);
    });
    
    test('should not mutate original enemy', () => {
      const enemy = createTestEnemy({ pos: { x: 5, y: 5 } });
      const originalVelocity = { ...enemy.velocity };
      const direction = { x: 1, y: 0 };
      const tiles = createEmptyTiles();
      
      moveEnemy(enemy, direction, tiles, 0.016);
      
      expect(enemy.velocity).toEqual(originalVelocity);
    });
  });
  
  describe('checkEnemyTrapped', () => {
    test('should mark enemy as trapped when in a hole', () => {
      const enemy = createTestEnemy({ pos: { x: 5.5, y: 5.5 }, isTrapped: false });
      const holes: Hole[] = [
        { pos: { x: 5, y: 5 }, regenerationTimer: 3, maxRegenTime: 5 }
      ];
      
      const trappedEnemy = checkEnemyTrapped(enemy, holes);
      
      expect(trappedEnemy.isTrapped).toBe(true);
      expect(trappedEnemy.velocity.x).toBe(0);
      expect(trappedEnemy.velocity.y).toBe(0);
    });
    
    test('should not mark enemy as trapped when not in a hole', () => {
      const enemy = createTestEnemy({ pos: { x: 5.5, y: 5.5 }, isTrapped: false });
      const holes: Hole[] = [
        { pos: { x: 10, y: 10 }, regenerationTimer: 3, maxRegenTime: 5 }
      ];
      
      const checkedEnemy = checkEnemyTrapped(enemy, holes);
      
      expect(checkedEnemy.isTrapped).toBe(false);
    });
    
    test('should not mutate original enemy', () => {
      const enemy = createTestEnemy({ pos: { x: 5.5, y: 5.5 }, isTrapped: false });
      const originalTrapped = enemy.isTrapped;
      const holes: Hole[] = [
        { pos: { x: 5, y: 5 }, regenerationTimer: 3, maxRegenTime: 5 }
      ];
      
      checkEnemyTrapped(enemy, holes);
      
      expect(enemy.isTrapped).toBe(originalTrapped);
    });
  });
  
  describe('updateAI', () => {
    test('should not move trapped enemies', () => {
      const trappedEnemy = createTestEnemy({
        pos: { x: 5, y: 5 },
        isTrapped: true,
        velocity: { x: 0, y: 0 }
      });
      
      const state = createTestState({
        enemies: [trappedEnemy],
        player: createTestPlayer({ pos: { x: 10, y: 10 } })
      });
      
      const updatedState = updateAI(state, 0.016);
      
      expect(updatedState.enemies[0].velocity.x).toBe(0);
      expect(updatedState.enemies[0].velocity.y).toBe(0);
    });
    
    test('should update multiple enemies independently', () => {
      const enemy1 = createTestEnemy({ pos: { x: 3, y: 5 } });
      const enemy2 = createTestEnemy({ pos: { x: 15, y: 5 } });
      
      const state = createTestState({
        enemies: [enemy1, enemy2],
        player: createTestPlayer({ pos: { x: 10, y: 5 } })
      });
      
      const updatedState = updateAI(state, 0.016);
      
      // Enemy1 should move right (toward player)
      expect(updatedState.enemies[0].velocity.x).toBeGreaterThan(0);
      
      // Enemy2 should move left (toward player)
      expect(updatedState.enemies[1].velocity.x).toBeLessThan(0);
    });
  });
});

// Property-Based Tests

describe('Enemy AI Properties', () => {
  // Feature: lode-runner-game, Property 14: Enemy Chase Behavior
  test('Property 14: enemies move toward player over time', () => {
    fc.assert(
      fc.property(
        fc.record({
          enemyPos: fc.record({
            x: fc.integer(0, 27),
            y: fc.integer(0, 15)
          }),
          playerPos: fc.record({
            x: fc.integer(0, 27),
            y: fc.integer(0, 15)
          })
        }),
        ({ enemyPos, playerPos }) => {
          // Skip if enemy and player are at same position
          if (enemyPos.x === playerPos.x && enemyPos.y === playerPos.y) {
            return true;
          }
          
          const enemy = createTestEnemy({ pos: { x: enemyPos.x, y: enemyPos.y } });
          const player = createTestPlayer({ pos: { x: playerPos.x, y: playerPos.y } });
          const tiles = createEmptyTiles();
          
          // Calculate initial distance
          const initialDistance = Math.abs(enemy.pos.x - player.pos.x) + 
                                  Math.abs(enemy.pos.y - player.pos.y);
          
          // Calculate chase direction
          const direction = calculateChaseDirection(enemy, player, tiles);
          
          // Verify direction moves toward player (reduces distance)
          const newEnemyPos = {
            x: enemy.pos.x + direction.x,
            y: enemy.pos.y + direction.y
          };
          
          const newDistance = Math.abs(newEnemyPos.x - player.pos.x) + 
                              Math.abs(newEnemyPos.y - player.pos.y);
          
          // Direction should reduce Manhattan distance to player
          expect(newDistance).toBeLessThanOrEqual(initialDistance);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: lode-runner-game, Property 16: Enemy Trapping in Holes
  test('Property 16: enemies in holes become trapped', () => {
    fc.assert(
      fc.property(
        fc.record({
          enemyPos: fc.record({
            x: fc.integer(0, 27),
            y: fc.integer(0, 15)
          }),
          holePos: fc.record({
            x: fc.integer(0, 27),
            y: fc.integer(0, 15)
          }),
          regenTimer: fc.float({ min: Math.fround(0.1), max: Math.fround(5.0) })
        }),
        ({ enemyPos, holePos, regenTimer }) => {
          // Create enemy at position
          const enemy = createTestEnemy({
            pos: { x: enemyPos.x + 0.5, y: enemyPos.y + 0.5 },
            isTrapped: false,
            velocity: { x: 50, y: 0 }
          });
          
          // Create hole at position
          const holes: Hole[] = [
            {
              pos: holePos,
              regenerationTimer: regenTimer,
              maxRegenTime: 5
            }
          ];
          
          // Check if enemy should be trapped
          const checkedEnemy = checkEnemyTrapped(enemy, holes);
          
          // If enemy tile position matches hole position, should be trapped
          const enemyTileX = Math.floor(enemy.pos.x);
          const enemyTileY = Math.floor(enemy.pos.y);
          
          if (enemyTileX === holePos.x && enemyTileY === holePos.y) {
            expect(checkedEnemy.isTrapped).toBe(true);
            expect(checkedEnemy.velocity.x).toBe(0);
            expect(checkedEnemy.velocity.y).toBe(0);
          } else {
            expect(checkedEnemy.isTrapped).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
