// Unit tests for game state management

import { describe, test, expect } from 'vitest';
import { createInitialState, createPlayer, createEnemy, resetLevel } from './state';
import { GameState } from './types';

describe('State Initialization', () => {
  test('new game starts with 3 lives', () => {
    const state = createInitialState();
    
    expect(state.lives).toBe(3);
    expect(state.player.lives).toBe(3);
  });
  
  test('new game starts in Menu state', () => {
    const state = createInitialState();
    
    expect(state.gameState).toBe(GameState.Menu);
  });
  
  test('new game loads level 1', () => {
    const state = createInitialState();
    
    expect(state.currentLevel).toBe(1);
    expect(state.tiles).toBeDefined();
    expect(state.tiles.length).toBeGreaterThan(0);
    expect(state.goldRemaining).toBeGreaterThan(0);
  });
});

describe('createPlayer', () => {
  test('creates player at specified position', () => {
    const pos = { x: 5, y: 10 };
    const player = createPlayer(pos);
    
    expect(player.pos).toEqual(pos);
    expect(player.pos).not.toBe(pos); // Should be a copy
  });
  
  test('creates player with 3 lives', () => {
    const player = createPlayer({ x: 0, y: 0 });
    
    expect(player.lives).toBe(3);
  });
  
  test('creates player with zero velocity', () => {
    const player = createPlayer({ x: 0, y: 0 });
    
    expect(player.velocity.x).toBe(0);
    expect(player.velocity.y).toBe(0);
  });
  
  test('creates player that is not dead', () => {
    const player = createPlayer({ x: 0, y: 0 });
    
    expect(player.isDead).toBe(false);
  });
  
  test('creates player that is not digging', () => {
    const player = createPlayer({ x: 0, y: 0 });
    
    expect(player.isDigging).toBe(false);
    expect(player.digDirection).toBeNull();
  });
  
  test('creates player with animation state', () => {
    const player = createPlayer({ x: 0, y: 0 });
    
    expect(player.animation).toBeDefined();
    expect(player.animation.currentAnimation).toBe('idle');
  });
});

describe('createEnemy', () => {
  test('creates enemy at specified position', () => {
    const pos = { x: 8, y: 12 };
    const enemy = createEnemy(pos);
    
    expect(enemy.pos).toEqual(pos);
    expect(enemy.pos).not.toBe(pos); // Should be a copy
  });
  
  test('creates enemy with zero velocity', () => {
    const enemy = createEnemy({ x: 0, y: 0 });
    
    expect(enemy.velocity.x).toBe(0);
    expect(enemy.velocity.y).toBe(0);
  });
  
  test('creates enemy that is not trapped', () => {
    const enemy = createEnemy({ x: 0, y: 0 });
    
    expect(enemy.isTrapped).toBe(false);
    expect(enemy.trapTimer).toBe(0);
  });
  
  test('creates enemy with animation state', () => {
    const enemy = createEnemy({ x: 0, y: 0 });
    
    expect(enemy.animation).toBeDefined();
    expect(enemy.animation.currentAnimation).toBe('run');
  });
});

describe('resetLevel', () => {
  test('resets level to initial state', () => {
    let state = createInitialState();
    
    // Modify state
    state.player.pos = { x: 10, y: 10 };
    state.holes = [{ pos: { x: 5, y: 5 }, regenerationTimer: 3, maxRegenTime: 5 }];
    state.levelTimer = 45;
    state.goldRemaining = 0;
    state.exitRevealed = true;
    
    // Reset level
    state = resetLevel(state);
    
    // Check that level-specific state is reset
    expect(state.player.pos).not.toEqual({ x: 10, y: 10 });
    expect(state.holes).toHaveLength(0);
    expect(state.levelTimer).toBe(0);
    expect(state.goldRemaining).toBeGreaterThan(0);
    expect(state.exitRevealed).toBe(false);
  });
  
  test('resetLevel does not change score', () => {
    let state = createInitialState();
    state.score = 1000;
    
    state = resetLevel(state);
    
    expect(state.score).toBe(1000);
  });
  
  test('resetLevel does not change lives', () => {
    let state = createInitialState();
    state.lives = 2;
    state.player.lives = 2;
    
    state = resetLevel(state);
    
    expect(state.lives).toBe(2);
  });
  
  test('resetLevel does not change high score', () => {
    let state = createInitialState();
    state.highScore = 5000;
    
    state = resetLevel(state);
    
    expect(state.highScore).toBe(5000);
  });
  
  test('resetLevel does not change current level number', () => {
    let state = createInitialState();
    const originalLevel = state.currentLevel;
    
    state = resetLevel(state);
    
    expect(state.currentLevel).toBe(originalLevel);
  });
});
