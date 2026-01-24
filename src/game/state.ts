// Game state management for Lode Runner

import type { GameStateData, Player, Enemy, Position } from './types';
import { GameState } from './types';
import { AnimationState } from './animation';
import { loadLevel } from './levels';

/**
 * Creates the initial game state for a new game.
 * Initializes with default values: 3 lives, Menu state, level 1.
 * 
 * @returns A new GameStateData object with initial values
 */
export function createInitialState(): GameStateData {
  const baseState: GameStateData = {
    currentLevel: 1,
    score: 0,
    highScore: 0,
    lives: 3,
    player: createPlayer({ x: 1, y: 14 }),
    enemies: [],
    tiles: [],
    holes: [],
    holePositions: new Set(),
    goldRemaining: 0,
    exitRevealed: false,
    levelTimer: 0,
    gameState: GameState.Menu
  };
  
  // Load level 1 to initialize tiles and entities
  return loadLevel(baseState, 1);
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
    deathTimer: -1,
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
 * Returns a new state object without modifying the input.
 * 
 * @param state - The game state to reset
 * @returns New game state with level reset
 */
export function resetLevel(state: GameStateData): GameStateData {
  // Reload the current level
  return loadLevel(state, state.currentLevel);
}
