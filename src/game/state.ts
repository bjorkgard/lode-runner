// Game state management for Lode Runner

import type { GameStateData, Player, Enemy, Position } from './types';
import { GameState, AnimationState } from './types';
import { loadLevel } from './levels';

/**
 * Creates the initial game state for a new game.
 * Initializes with default values: 3 lives, Menu state, level 1.
 * 
 * @returns A new GameStateData object with initial values
 */
export function createInitialState(): GameStateData {
  const state: GameStateData = {
    currentLevel: 1,
    score: 0,
    highScore: 0,
    lives: 3,
    player: createPlayer({ x: 1, y: 14 }),
    enemies: [],
    tiles: [],
    holes: [],
    goldRemaining: 0,
    exitRevealed: false,
    levelTimer: 0,
    gameState: GameState.Menu
  };
  
  // Load level 1 to initialize tiles and entities
  loadLevel(state, 1);
  
  return state;
}

/**
 * Creates a player entity at the specified position.
 * Initializes with default values: 3 lives, idle animation, no movement.
 * 
 * @param pos - The starting position for the player
 * @returns A new Player object
 */
export function createPlayer(pos: Position): Player {
  return {
    pos: { ...pos },
    velocity: { x: 0, y: 0 },
    animation: new AnimationState('idle'),
    isOnGround: false,
    isOnLadder: false,
    isOnRope: false,
    lives: 3,
    isDead: false,
    isDigging: false,
    digDirection: null
  };
}

/**
 * Creates an enemy entity at the specified position.
 * Initializes with default values: run animation, no movement, not trapped.
 * 
 * @param pos - The starting position for the enemy
 * @returns A new Enemy object
 */
export function createEnemy(pos: Position): Enemy {
  return {
    pos: { ...pos },
    velocity: { x: 0, y: 0 },
    animation: new AnimationState('run'),
    isOnGround: false,
    isOnLadder: false,
    isOnRope: false,
    isTrapped: false,
    trapTimer: 0
  };
}

/**
 * Resets the current level to its initial state.
 * Reloads the level, resetting player and enemy positions, holes, and timers.
 * Does not affect score, lives, or high score.
 * 
 * @param state - The game state to reset
 */
export function resetLevel(state: GameStateData): void {
  // Reload the current level
  loadLevel(state, state.currentLevel);
}
