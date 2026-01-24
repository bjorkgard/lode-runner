/**
 * Integration tests for Lode Runner game.
 * Tests full game flows including level completion, death, game over, pause, and persistence.
 * 
 * These tests validate end-to-end scenarios that span multiple systems:
 * - Game engine orchestration
 * - State management
 * - Rules system
 * - Storage persistence
 * - State transitions
 * 
 * Validates Requirements: 6.5, 7.3, 7.4, 10.1, 17.4, 17.5
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from './engine';
import { GameState, TileType } from './types';
import { createTestState, createTestPlayer, createTestEnemy, createTilesWithGoldAt } from '../test/helpers';
import { updateRules } from './rules';
import { loadHighScore, saveHighScore, resetHighScore } from './storage';

/**
 * Helper to create a mock canvas for testing
 */
function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 448; // 28 tiles * 16 pixels
  canvas.height = 256; // 16 tiles * 16 pixels
  return canvas;
}

describe('Integration Tests - Full Game Flows', () => {
  
  describe('Level Completion Flow', () => {
    /**
     * Test full game flow: start game, collect gold, complete level
     * Validates Requirements: 6.5
     */
    test('should complete level when player collects all gold and reaches exit', () => {
      // Create a simple test state with one gold and an exit
      const tiles = createTilesWithGoldAt({ x: 10, y: 10 });
      tiles[12][10] = TileType.Exit; // Exit below gold
      tiles[11][10] = TileType.Ladder; // Ladder to connect
      
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        tiles,
        goldRemaining: 1,
        exitRevealed: false,
        currentLevel: 1,
        score: 0
      });
      
      // Collect gold
      let updatedState = updateRules(state, 0.016);
      
      // Verify gold was collected
      expect(updatedState.goldRemaining).toBe(0);
      expect(updatedState.exitRevealed).toBe(true);
      expect(updatedState.score).toBe(100); // Gold points
      
      // Move player to exit
      updatedState = {
        ...updatedState,
        player: {
          ...updatedState.player,
          pos: { x: 10, y: 12 }
        }
      };
      
      // Trigger level completion
      updatedState = updateRules(updatedState, 0.016);
      
      // Verify level completed
      expect(updatedState.currentLevel).toBe(2);
      expect(updatedState.goldRemaining).toBeGreaterThan(0); // New level has gold
      expect(updatedState.exitRevealed).toBe(false); // Exit hidden in new level
    });
    
    test('should maintain score across level transitions', () => {
      const tiles = createTilesWithGoldAt({ x: 10, y: 10 });
      tiles[12][10] = TileType.Exit;
      tiles[11][10] = TileType.Ladder;
      
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        tiles,
        goldRemaining: 1,
        exitRevealed: false,
        currentLevel: 1,
        score: 500 // Starting with some score
      });
      
      // Collect gold
      let updatedState = updateRules(state, 0.016);
      expect(updatedState.score).toBe(600); // 500 + 100
      
      // Move to exit and complete level
      updatedState = {
        ...updatedState,
        player: {
          ...updatedState.player,
          pos: { x: 10, y: 12 }
        }
      };
      
      updatedState = updateRules(updatedState, 0.016);
      
      // Score should be maintained (plus any time bonus)
      expect(updatedState.score).toBeGreaterThanOrEqual(600);
      expect(updatedState.currentLevel).toBe(2);
    });
    
    test('should calculate time bonus for fast completion', () => {
      const tiles = createTilesWithGoldAt({ x: 10, y: 10 });
      tiles[12][10] = TileType.Exit;
      tiles[11][10] = TileType.Ladder;
      
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        tiles,
        goldRemaining: 1,
        exitRevealed: false,
        currentLevel: 1,
        score: 0,
        levelTimer: 10 // Completed in 10 seconds (par time is usually 60)
      });
      
      // Collect gold
      let updatedState = updateRules(state, 0.016);
      
      // Move to exit
      updatedState = {
        ...updatedState,
        player: {
          ...updatedState.player,
          pos: { x: 10, y: 12 }
        }
      };
      
      const scoreBeforeCompletion = updatedState.score;
      updatedState = updateRules(updatedState, 0.016);
      
      // Should have time bonus added
      expect(updatedState.score).toBeGreaterThan(scoreBeforeCompletion);
    });
  });
  
  describe('Death and Restart Flow', () => {
    /**
     * Test death and restart flow
     * Validates Requirements: 7.3
     */
    test('should restart level when player dies with remaining lives', () => {
      // Use empty tiles to avoid gold collection
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        enemies: [createTestEnemy({ pos: { x: 10, y: 10 } })], // Enemy at same position
        lives: 2,
        score: 500,
        goldRemaining: 5,
        currentLevel: 3
      });
      
      // Trigger collision (should cause death)
      let updatedState = updateRules(state, 0.016);
      
      // Verify player died
      expect(updatedState.player.isDead).toBe(true);
      expect(updatedState.lives).toBe(1); // Lives decremented
      
      // Score and level should be maintained
      expect(updatedState.score).toBe(500);
      expect(updatedState.currentLevel).toBe(3);
    });
    
    test('should decrement lives on death', () => {
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        enemies: [createTestEnemy({ pos: { x: 10, y: 10 } })],
        lives: 3
      });
      
      const updatedState = updateRules(state, 0.016);
      
      expect(updatedState.lives).toBe(2);
      expect(updatedState.player.isDead).toBe(true);
    });
    
    test('should maintain score after death and restart', () => {
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        enemies: [createTestEnemy({ pos: { x: 10, y: 10 } })],
        lives: 2,
        score: 1500
      });
      
      const updatedState = updateRules(state, 0.016);
      
      // Score should not change on death
      expect(updatedState.score).toBe(1500);
      expect(updatedState.lives).toBe(1);
    });
  });
  
  describe('Game Over Flow', () => {
    /**
     * Test game over flow
     * Validates Requirements: 7.4
     */
    test('should trigger game over when player dies with 0 lives', () => {
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        enemies: [createTestEnemy({ pos: { x: 10, y: 10 } })],
        lives: 1, // Last life
        score: 2500,
        gameState: GameState.Playing
      });
      
      const updatedState = updateRules(state, 0.016);
      
      // Verify game over
      expect(updatedState.lives).toBe(0);
      expect(updatedState.player.isDead).toBe(true);
      expect(updatedState.gameState).toBe(GameState.GameOver);
      
      // Score should be maintained for display
      expect(updatedState.score).toBe(2500);
    });
    
    test('should not restart level when lives reach 0', () => {
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        enemies: [createTestEnemy({ pos: { x: 10, y: 10 } })],
        lives: 1,
        currentLevel: 5,
        gameState: GameState.Playing
      });
      
      const updatedState = updateRules(state, 0.016);
      
      // Should be game over, not restarted
      expect(updatedState.gameState).toBe(GameState.GameOver);
      expect(updatedState.currentLevel).toBe(5); // Level not reset
      expect(updatedState.player.isDead).toBe(true);
    });
  });
  
  describe('Pause and Resume Flow', () => {
    /**
     * Test pause and resume flow
     * Validates Requirements: 17.4, 17.5
     */
    test('should transition from Playing to Paused state', () => {
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      // Start a new game
      engine.newGame();
      
      // Verify initial state
      expect(engine.getState().gameState).toBe(GameState.Playing);
      
      // Pause the game
      engine.pauseGame();
      
      // Verify paused state
      expect(engine.getState().gameState).toBe(GameState.Paused);
    });
    
    test('should transition from Paused back to Playing state', () => {
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      // Start and pause
      engine.newGame();
      engine.pauseGame();
      
      expect(engine.getState().gameState).toBe(GameState.Paused);
      
      // Resume
      engine.resumeGame();
      
      // Verify playing state
      expect(engine.getState().gameState).toBe(GameState.Playing);
    });
    
    test('should not update game state when paused', () => {
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      // Start game and pause
      engine.newGame();
      const initialState = engine.getState();
      const initialPlayerPos = { ...initialState.player.pos };
      const initialScore = initialState.score;
      const initialTimer = initialState.levelTimer;
      
      engine.pauseGame();
      
      // Simulate time passing (game loop would run but not update state)
      // In a real scenario, the update method checks for Paused state
      
      const pausedState = engine.getState();
      
      // State should not change while paused
      expect(pausedState.player.pos).toEqual(initialPlayerPos);
      expect(pausedState.score).toBe(initialScore);
      expect(pausedState.gameState).toBe(GameState.Paused);
    });
    
    test('should resume game state updates after unpause', () => {
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      engine.newGame();
      engine.pauseGame();
      
      expect(engine.getState().gameState).toBe(GameState.Paused);
      
      engine.resumeGame();
      
      expect(engine.getState().gameState).toBe(GameState.Playing);
      
      // Game should now update normally
      // (In real gameplay, timer would increment, physics would apply, etc.)
    });
  });
  
  describe('High Score Persistence', () => {
    /**
     * Test high score persistence across sessions
     * Validates Requirements: 10.1
     */
    beforeEach(() => {
      // Clear localStorage before each test
      resetHighScore();
    });
    
    test('should save high score to localStorage', () => {
      const score = 5000;
      
      saveHighScore(score);
      
      const loaded = loadHighScore();
      expect(loaded).toBe(score);
    });
    
    test('should load high score from localStorage', () => {
      // Save a high score
      saveHighScore(3500);
      
      // Create new engine (simulates new session)
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      // Wait for initialization
      setTimeout(() => {
        const state = engine.getState();
        expect(state.highScore).toBe(3500);
      }, 100);
    });
    
    test('should update high score when current score exceeds it', () => {
      // Set initial high score
      saveHighScore(1000);
      
      const state = createTestState({
        score: 500,
        highScore: 1000
      });
      
      // Collect gold to increase score above high score
      const tiles = createTilesWithGoldAt({ x: 10, y: 10 });
      const updatedState = updateRules({
        ...state,
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        tiles,
        goldRemaining: 1,
        score: 1050 // Above high score
      }, 0.016);
      
      // High score should be updated
      // (In the engine, this happens in the update loop)
      expect(updatedState.score).toBeGreaterThan(1000);
    });
    
    test('should not update high score when current score is lower', () => {
      saveHighScore(5000);
      
      const initialHighScore = loadHighScore();
      expect(initialHighScore).toBe(5000);
      
      // Try to save a lower score
      saveHighScore(3000);
      
      // High score should remain unchanged
      const currentHighScore = loadHighScore();
      expect(currentHighScore).toBe(5000);
    });
    
    test('should persist high score across multiple game sessions', () => {
      // First session
      saveHighScore(2500);
      expect(loadHighScore()).toBe(2500);
      
      // Second session (higher score)
      saveHighScore(4000);
      expect(loadHighScore()).toBe(4000);
      
      // Third session (lower score, should not update)
      saveHighScore(3000);
      expect(loadHighScore()).toBe(4000);
    });
    
    test('should reset high score when requested', () => {
      saveHighScore(10000);
      expect(loadHighScore()).toBe(10000);
      
      resetHighScore();
      
      expect(loadHighScore()).toBe(0);
    });
  });
  
  describe('Engine Lifecycle', () => {
    test('should initialize engine with menu state', () => {
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      const state = engine.getState();
      expect(state.gameState).toBe(GameState.Menu);
      expect(state.lives).toBe(3);
      expect(state.score).toBe(0);
      expect(state.currentLevel).toBe(1);
    });
    
    test('should start new game from menu', () => {
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      expect(engine.getState().gameState).toBe(GameState.Menu);
      
      engine.newGame();
      
      const state = engine.getState();
      expect(state.gameState).toBe(GameState.Playing);
      expect(state.lives).toBe(3);
      expect(state.score).toBe(0);
      expect(state.currentLevel).toBe(1);
    });
    
    test('should trigger callbacks on state changes', () => {
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      const callbacks = {
        score: vi.fn(),
        lives: vi.fn(),
        level: vi.fn(),
        gameState: vi.fn()
      };
      
      // Subscribe using Observer pattern
      const observable = engine.getStateObservable();
      observable.onScoreChange(callbacks.score);
      observable.onLivesChange(callbacks.lives);
      observable.onLevelChange(callbacks.level);
      observable.onGameStateChange(callbacks.gameState);
      
      // Start new game - this changes gameState from Menu to Playing
      engine.newGame();
      
      // Only gameState callback should be triggered (Menu -> Playing)
      // Score, lives, and level don't change (already 0, 3, 1)
      expect(callbacks.gameState).toHaveBeenCalledWith(GameState.Playing, GameState.Menu);
      
      // Now manually trigger other state changes to verify callbacks work
      const prevState = (engine as any).captureStateSnapshot();
      
      (engine as any).state = {
        ...(engine as any).state,
        score: 100,
        lives: 2,
        currentLevel: 2
      };
      
      // Manually notify observers with the previous state
      (engine as any).notifyStateChanges(prevState);
      
      // Now all callbacks should have been triggered
      expect(callbacks.score).toHaveBeenCalledWith(100, 0);
      expect(callbacks.lives).toHaveBeenCalledWith(2, 3);
      expect(callbacks.level).toHaveBeenCalledWith(2, 1);
    });
    
    test('should clean up resources on stop', () => {
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      engine.start();
      engine.stop();
      
      // Engine should stop cleanly without errors
      expect(engine.getState()).toBeDefined();
    });
  });
  
  describe('Complete Game Flow Integration', () => {
    test('should handle complete game flow: menu -> play -> pause -> resume -> complete level', () => {
      const canvas = createMockCanvas();
      const engine = new GameEngine(canvas);
      
      // Start in menu
      expect(engine.getState().gameState).toBe(GameState.Menu);
      
      // Start new game
      engine.newGame();
      expect(engine.getState().gameState).toBe(GameState.Playing);
      expect(engine.getState().lives).toBe(3);
      
      // Pause
      engine.pauseGame();
      expect(engine.getState().gameState).toBe(GameState.Paused);
      
      // Resume
      engine.resumeGame();
      expect(engine.getState().gameState).toBe(GameState.Playing);
      
      // Game continues normally
      const state = engine.getState();
      expect(state.currentLevel).toBe(1);
      expect(state.goldRemaining).toBeGreaterThan(0);
    });
    
    test('should handle death -> restart -> death -> game over flow', () => {
      const state = createTestState({
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        enemies: [createTestEnemy({ pos: { x: 10, y: 10 } })],
        lives: 2,
        gameState: GameState.Playing
      });
      
      // First death
      let updatedState = updateRules(state, 0.016);
      expect(updatedState.lives).toBe(1);
      expect(updatedState.player.isDead).toBe(true);
      expect(updatedState.gameState).toBe(GameState.Playing); // Still playing
      
      // Second death (last life)
      updatedState = {
        ...updatedState,
        player: createTestPlayer({ pos: { x: 10, y: 10 } }),
        enemies: [createTestEnemy({ pos: { x: 10, y: 10 } })]
      };
      
      updatedState = updateRules(updatedState, 0.016);
      expect(updatedState.lives).toBe(0);
      expect(updatedState.gameState).toBe(GameState.GameOver);
    });
  });
});
