// Tests for game rules and win/loss conditions

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { checkGoldCollection, checkPlayerEnemyCollision, killPlayer, checkLevelCompletion, restartLevel } from './rules';
import { createPlayer, createEnemy } from './state';
import { TileType, GameState } from './types';
import { GOLD_POINTS, COLLISION_THRESHOLD } from './constants';
import { createTestState, createTilesWithGoldAt, createTilesWithExitAt } from '../test/helpers';

describe('Gold Collection', () => {
  // Feature: lode-runner-game, Property 18: Gold Collection
  test('Property 18: collecting gold removes tile, increases score, and decrements count', () => {
    fc.assert(
      fc.property(
        fc.record({
          playerX: fc.integer({ min: 1, max: 26 }),
          playerY: fc.integer({ min: 1, max: 14 }),
          initialScore: fc.integer({ min: 0, max: 100000 }),
          goldCount: fc.integer({ min: 1, max: 50 })
        }),
        ({ playerX, playerY, initialScore, goldCount }) => {
          const playerPos = { x: playerX, y: playerY };
          const state = createTestState({
            player: createPlayer(playerPos),
            score: initialScore,
            goldRemaining: goldCount,
            tiles: createTilesWithGoldAt(playerPos)
          });
          
          const newState = checkGoldCollection(state);
          
          // Gold tile should be removed
          expect(newState.tiles[playerY][playerX]).toBe(TileType.Empty);
          
          // Score should increase by GOLD_POINTS
          expect(newState.score).toBe(initialScore + GOLD_POINTS);
          
          // Gold count should decrement
          expect(newState.goldRemaining).toBe(goldCount - 1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('collecting gold on non-gold tile does not change state', () => {
    const state = createTestState({
      player: createPlayer({ x: 5, y: 5 }),
      score: 1000,
      goldRemaining: 5,
      tiles: Array(16).fill(null).map(() => Array(28).fill(TileType.Empty))
    });
    
    const newState = checkGoldCollection(state);
    
    expect(newState.score).toBe(1000);
    expect(newState.goldRemaining).toBe(5);
  });
});

describe('Exit Revelation', () => {
  // Feature: lode-runner-game, Property 19: Exit Revelation
  test('Property 19: collecting all gold reveals exit', () => {
    fc.assert(
      fc.property(
        fc.record({
          playerX: fc.integer({ min: 1, max: 26 }),
          playerY: fc.integer({ min: 1, max: 14 }),
          initialScore: fc.integer({ min: 0, max: 100000 })
        }),
        ({ playerX, playerY, initialScore }) => {
          const playerPos = { x: playerX, y: playerY };
          const state = createTestState({
            player: createPlayer(playerPos),
            score: initialScore,
            goldRemaining: 1, // Last gold piece
            exitRevealed: false,
            tiles: createTilesWithGoldAt(playerPos)
          });
          
          const newState = checkGoldCollection(state);
          
          // Exit should be revealed
          expect(newState.exitRevealed).toBe(true);
          
          // Gold count should be 0
          expect(newState.goldRemaining).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('exit not revealed when gold remains', () => {
    const playerPos = { x: 5, y: 5 };
    const state = createTestState({
      player: createPlayer(playerPos),
      goldRemaining: 2, // More than 1 gold remaining
      exitRevealed: false,
      tiles: createTilesWithGoldAt(playerPos)
    });
    
    const newState = checkGoldCollection(state);
    
    expect(newState.exitRevealed).toBe(false);
    expect(newState.goldRemaining).toBe(1);
  });
});

describe('Level Completion', () => {
  // Feature: lode-runner-game, Property 20: Level Completion
  test('Property 20: reaching exit with all gold completes level', () => {
    fc.assert(
      fc.property(
        fc.record({
          playerX: fc.integer({ min: 1, max: 26 }),
          playerY: fc.integer({ min: 1, max: 14 }),
          currentLevel: fc.integer({ min: 1, max: 99 }), // Not the last level
          initialScore: fc.integer({ min: 0, max: 100000 })
        }),
        ({ playerX, playerY, currentLevel, initialScore }) => {
          const playerPos = { x: playerX, y: playerY };
          const state = createTestState({
            player: createPlayer(playerPos),
            currentLevel,
            score: initialScore,
            goldRemaining: 0,
            exitRevealed: true,
            tiles: createTilesWithExitAt(playerPos)
          });
          
          const newState = checkLevelCompletion(state);
          
          // Level should advance
          expect(newState.currentLevel).toBe(currentLevel + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('exit not accessible when not revealed', () => {
    const playerPos = { x: 5, y: 5 };
    const state = createTestState({
      player: createPlayer(playerPos),
      currentLevel: 1,
      goldRemaining: 1,
      exitRevealed: false,
      tiles: createTilesWithExitAt(playerPos)
    });
    
    const newState = checkLevelCompletion(state);
    
    // Level should not advance
    expect(newState.currentLevel).toBe(1);
  });
  
  test('completing level 100 triggers victory', () => {
    const playerPos = { x: 5, y: 5 };
    const state = createTestState({
      player: createPlayer(playerPos),
      currentLevel: 100,
      goldRemaining: 0,
      exitRevealed: true,
      gameState: GameState.Playing,
      tiles: createTilesWithExitAt(playerPos)
    });
    
    const newState = checkLevelCompletion(state);
    
    expect(newState.gameState).toBe(GameState.Victory);
  });
});

describe('Player-Enemy Collision', () => {
  // Feature: lode-runner-game, Property 17: Player-Enemy Collision Death
  test('Property 17: player-enemy collision causes death', () => {
    fc.assert(
      fc.property(
        fc.record({
          playerX: fc.double({ min: 5, max: 10, noNaN: true }),
          playerY: fc.double({ min: 5, max: 10, noNaN: true }),
          lives: fc.integer({ min: 1, max: 3 })
        }),
        ({ playerX, playerY, lives }) => {
          // Place enemy very close to player (within collision threshold)
          const enemyX = playerX + COLLISION_THRESHOLD * 0.5;
          const enemyY = playerY;
          
          const state = createTestState({
            player: createPlayer({ x: playerX, y: playerY }),
            enemies: [createEnemy({ x: enemyX, y: enemyY })],
            lives
          });
          
          const newState = checkPlayerEnemyCollision(state);
          
          // Player should be dead
          expect(newState.player.isDead).toBe(true);
          
          // Lives should decrement
          expect(newState.lives).toBe(lives - 1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('no collision when enemy is far away', () => {
    const state = createTestState({
      player: createPlayer({ x: 5, y: 5 }),
      enemies: [createEnemy({ x: 15, y: 15 })],
      lives: 3
    });
    
    const newState = checkPlayerEnemyCollision(state);
    
    expect(newState.player.isDead).toBe(false);
    expect(newState.lives).toBe(3);
  });
});

describe('Death and Lives', () => {
  // Feature: lode-runner-game, Property 21: Death Decrements Lives
  test('Property 21: death reduces lives by 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        (lives) => {
          const state = createTestState({
            lives,
            player: createPlayer({ x: 5, y: 5 })
          });
          
          const newState = killPlayer(state);
          
          // Lives should decrement by 1
          expect(newState.lives).toBe(lives - 1);
          
          // Player should be dead
          expect(newState.player.isDead).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: lode-runner-game, Property 22: Death With Lives Restarts Level
  test('Property 22: death with lives > 0 restarts level', () => {
    fc.assert(
      fc.property(
        fc.record({
          lives: fc.integer({ min: 2, max: 3 }), // At least 2 lives so 1 remains after death
          currentLevel: fc.integer({ min: 1, max: 10 })
        }),
        ({ lives, currentLevel }) => {
          const state = createTestState({
            lives,
            currentLevel,
            player: createPlayer({ x: 5, y: 5 }),
            gameState: GameState.Playing
          });
          
          const newState = killPlayer(state);
          
          // Player should be dead
          expect(newState.player.isDead).toBe(true);
          
          // Lives should decrement
          expect(newState.lives).toBe(lives - 1);
          
          // Game state should still be Playing (not GameOver)
          expect(newState.gameState).toBe(GameState.Playing);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('death with 0 lives triggers GameOver state', () => {
    const state = createTestState({
      lives: 1, // Last life
      player: createPlayer({ x: 5, y: 5 }),
      gameState: GameState.Playing
    });
    
    const newState = killPlayer(state);
    
    expect(newState.lives).toBe(0);
    expect(newState.player.isDead).toBe(true);
    expect(newState.gameState).toBe(GameState.GameOver);
  });
});

describe('Restart Level', () => {
  test('restartLevel reloads current level', () => {
    const state = createTestState({
      currentLevel: 2,
      score: 5000,
      lives: 2,
      levelTimer: 45.5
    });
    
    const newState = restartLevel(state);
    
    // Level should remain the same
    expect(newState.currentLevel).toBe(2);
    
    // Score and lives should be preserved
    expect(newState.score).toBe(5000);
    expect(newState.lives).toBe(2);
    
    // Level timer should be reset
    expect(newState.levelTimer).toBe(0);
  });
});
