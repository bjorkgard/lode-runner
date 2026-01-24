// Tests for game engine orchestration

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { GameEngine } from './engine';
import { GameState } from './types';
import type { GameStateData } from './types';

// Mock canvas for testing
function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
}

describe('GameEngine', () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;
  
  beforeEach(() => {
    canvas = createMockCanvas();
    engine = new GameEngine(canvas);
  });
  
  afterEach(() => {
    engine.stop();
  });
  
  describe('Property 1: Paused State Immutability', () => {
    // Feature: lode-runner-game, Property 1: Paused State Immutability
    // Validates: Requirements 1.4
    test('paused game does not update state', () => {
      fc.assert(
        fc.property(
          fc.record({
            playerX: fc.float({ min: Math.fround(1), max: Math.fround(26) }),
            playerY: fc.float({ min: Math.fround(1), max: Math.fround(14) }),
            enemyX: fc.float({ min: Math.fround(1), max: Math.fround(26) }),
            enemyY: fc.float({ min: Math.fround(1), max: Math.fround(14) }),
            score: fc.integer({ min: 0, max: 100000 }),
            lives: fc.integer({ min: 1, max: 3 }),
            goldRemaining: fc.integer({ min: 0, max: 50 }),
            updateDuration: fc.float({ min: Math.fround(0.016), max: Math.fround(1.0) }) // 1 frame to 1 second
          }),
          ({ playerX, playerY, enemyX, enemyY, score, lives, goldRemaining, updateDuration }) => {
            // Get initial state and set to Paused
            const state = engine.getState();
            const pausedState: GameStateData = {
              ...state,
              gameState: GameState.Paused,
              player: {
                ...state.player,
                pos: { x: playerX, y: playerY },
                velocity: { x: 100, y: 50 } // Non-zero velocity
              },
              enemies: [{
                ...state.enemies[0] || state.player,
                pos: { x: enemyX, y: enemyY },
                velocity: { x: 80, y: 30 } // Non-zero velocity
              }],
              score,
              lives,
              goldRemaining,
              levelTimer: 10.5
            };
            
            // Manually set the paused state
            (engine as any).state = pausedState;
            
            // Capture state before update
            const beforeState = engine.getState();
            const beforePlayerPos = { ...beforeState.player.pos };
            const beforeEnemyPos = beforeState.enemies.length > 0 
              ? { ...beforeState.enemies[0].pos } 
              : null;
            const beforeScore = beforeState.score;
            const beforeLives = beforeState.lives;
            const beforeGold = beforeState.goldRemaining;
            const beforeTimer = beforeState.levelTimer;
            
            // Update the engine (simulating game loop)
            (engine as any).update(updateDuration);
            
            // Get state after update
            const afterState = engine.getState();
            
            // Verify state is unchanged
            expect(afterState.player.pos.x).toBe(beforePlayerPos.x);
            expect(afterState.player.pos.y).toBe(beforePlayerPos.y);
            
            if (beforeEnemyPos && afterState.enemies.length > 0) {
              expect(afterState.enemies[0].pos.x).toBe(beforeEnemyPos.x);
              expect(afterState.enemies[0].pos.y).toBe(beforeEnemyPos.y);
            }
            
            expect(afterState.score).toBe(beforeScore);
            expect(afterState.lives).toBe(beforeLives);
            expect(afterState.goldRemaining).toBe(beforeGold);
            expect(afterState.levelTimer).toBe(beforeTimer);
            expect(afterState.gameState).toBe(GameState.Paused);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('State Transitions', () => {
    test('pause state transition', () => {
      // Start a new game (Playing state)
      engine.newGame();
      expect(engine.getState().gameState).toBe(GameState.Playing);
      
      // Pause the game
      engine.pauseGame();
      expect(engine.getState().gameState).toBe(GameState.Paused);
      
      // Pausing again should have no effect
      engine.pauseGame();
      expect(engine.getState().gameState).toBe(GameState.Paused);
    });
    
    test('resume state transition', () => {
      // Start a new game and pause it
      engine.newGame();
      engine.pauseGame();
      expect(engine.getState().gameState).toBe(GameState.Paused);
      
      // Resume the game
      engine.resumeGame();
      expect(engine.getState().gameState).toBe(GameState.Playing);
      
      // Resuming again should have no effect
      engine.resumeGame();
      expect(engine.getState().gameState).toBe(GameState.Playing);
    });
    
    test('new game state transition', () => {
      // Initial state should be Menu
      expect(engine.getState().gameState).toBe(GameState.Menu);
      
      // Start a new game
      engine.newGame();
      expect(engine.getState().gameState).toBe(GameState.Playing);
      expect(engine.getState().lives).toBe(3);
      expect(engine.getState().score).toBe(0);
      expect(engine.getState().currentLevel).toBe(1);
    });
    
    test('pause only works from Playing state', () => {
      // Menu state - pause should have no effect
      expect(engine.getState().gameState).toBe(GameState.Menu);
      engine.pauseGame();
      expect(engine.getState().gameState).toBe(GameState.Menu);
      
      // GameOver state - pause should have no effect
      (engine as any).state = {
        ...engine.getState(),
        gameState: GameState.GameOver
      };
      engine.pauseGame();
      expect(engine.getState().gameState).toBe(GameState.GameOver);
    });
    
    test('resume only works from Paused state', () => {
      // Menu state - resume should have no effect
      expect(engine.getState().gameState).toBe(GameState.Menu);
      engine.resumeGame();
      expect(engine.getState().gameState).toBe(GameState.Menu);
      
      // Playing state - resume should have no effect
      engine.newGame();
      expect(engine.getState().gameState).toBe(GameState.Playing);
      engine.resumeGame();
      expect(engine.getState().gameState).toBe(GameState.Playing);
    });
  });
  
  describe('Public Methods', () => {
    test('resetHighScore clears high score', () => {
      // Set a high score
      (engine as any).state = {
        ...engine.getState(),
        highScore: 10000
      };
      expect(engine.getState().highScore).toBe(10000);
      
      // Reset high score
      engine.resetHighScore();
      expect(engine.getState().highScore).toBe(0);
    });
    
    test('handleTouchInput forwards to input system', () => {
      // This test verifies the method exists and doesn't throw
      expect(() => {
        engine.handleTouchInput('left', true);
        engine.handleTouchInput('left', false);
        engine.handleTouchInput('digRight', true);
        engine.handleTouchInput('digRight', false);
      }).not.toThrow();
    });
    
    test('start and stop control game loop', () => {
      // Start the engine
      engine.start();
      expect((engine as any).animationFrameId).not.toBeNull();
      
      // Stop the engine
      engine.stop();
      expect((engine as any).animationFrameId).toBeNull();
      
      // Starting again should work
      engine.start();
      expect((engine as any).animationFrameId).not.toBeNull();
      
      // Clean up
      engine.stop();
    });
  });
  
  describe('Callbacks', () => {
    test('onScoreChange callback is triggered on newGame', () => {
      const callback = vi.fn();
      engine.onScoreChange = callback;
      
      // Start a new game (score resets to 0)
      engine.newGame();
      expect(callback).toHaveBeenCalledWith(0);
    });
    
    test('onLivesChange callback is triggered on newGame', () => {
      const callback = vi.fn();
      engine.onLivesChange = callback;
      
      // Start a new game (lives set to 3)
      engine.newGame();
      expect(callback).toHaveBeenCalledWith(3);
    });
    
    test('onLevelChange callback is triggered on newGame', () => {
      const callback = vi.fn();
      engine.onLevelChange = callback;
      
      // Start a new game (level 1)
      engine.newGame();
      expect(callback).toHaveBeenCalledWith(1);
    });
    
    test('onGameStateChange callback is triggered when game state changes', () => {
      const callback = vi.fn();
      engine.onGameStateChange = callback;
      
      // Start a new game (Menu -> Playing)
      engine.newGame();
      expect(callback).toHaveBeenCalledWith(GameState.Playing);
      
      // Pause the game (Playing -> Paused)
      engine.pauseGame();
      expect(callback).toHaveBeenCalledWith(GameState.Paused);
      
      // Resume the game (Paused -> Playing)
      engine.resumeGame();
      expect(callback).toHaveBeenCalledWith(GameState.Playing);
    });
  });
});
