// Game rules and win/loss conditions for Lode Runner

import type { GameStateData } from './types';
import { TileType, GameState } from './types';
import { GOLD_POINTS, TIME_BONUS_MULTIPLIER, COLLISION_THRESHOLD, MAX_LEVELS } from './constants';
import { getTileAt } from './physics';
import { loadLevel, getLevel } from './levels';

/**
 * Updates all game rules and checks win/loss conditions.
 * Checks for gold collection, player-enemy collisions, and level completion.
 * Returns a new state object with updated game state.
 * 
 * @param state - Current game state
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New game state with updated rules
 */
export function updateRules(state: GameStateData, deltaTime: number): GameStateData {
  // Update level timer
  let updatedState = {
    ...state,
    levelTimer: state.levelTimer + deltaTime
  };
  
  // Check gold collection
  updatedState = checkGoldCollection(updatedState);
  
  // Check player-enemy collision
  updatedState = checkPlayerEnemyCollision(updatedState);
  
  // Check level completion
  updatedState = checkLevelCompletion(updatedState);
  
  return updatedState;
}

/**
 * Checks if the player is on a gold tile and collects it.
 * Updates score, removes gold tile, and reveals exit if all gold collected.
 * Returns a new state object with updated gold state.
 * Uses structural sharing to only copy the affected tile row.
 * 
 * @param state - Current game state
 * @returns New game state with gold collected (or unchanged if no gold)
 */
export function checkGoldCollection(state: GameStateData): GameStateData {
  const playerTilePos = {
    x: Math.floor(state.player.pos.x),
    y: Math.floor(state.player.pos.y)
  };
  
  const tile = getTileAt(playerTilePos, state.tiles);
  
  if (tile === TileType.Gold) {
    // Collect gold - only copy the affected row (structural sharing)
    const updatedTiles = state.tiles.map((row, y) => 
      y === playerTilePos.y ? [...row] : row
    );
    updatedTiles[playerTilePos.y][playerTilePos.x] = TileType.Empty;
    
    const newGoldRemaining = state.goldRemaining - 1;
    const newScore = state.score + GOLD_POINTS;
    
    // Reveal exit if all gold collected
    const exitRevealed = newGoldRemaining === 0;
    
    return {
      ...state,
      tiles: updatedTiles,
      goldRemaining: newGoldRemaining,
      score: newScore,
      exitRevealed
    };
  }
  
  return state;
}

/**
 * Checks if the player collides with any enemy.
 * If collision detected, kills the player.
 * Returns a new state object with player killed (or unchanged if no collision).
 * 
 * @param state - Current game state
 * @returns New game state with player killed (or unchanged)
 */
export function checkPlayerEnemyCollision(state: GameStateData): GameStateData {
  const player = state.player;
  
  // Don't check collision if player is already dead
  if (player.isDead) {
    return state;
  }
  
  for (const enemy of state.enemies) {
    const distance = Math.sqrt(
      Math.pow(player.pos.x - enemy.pos.x, 2) +
      Math.pow(player.pos.y - enemy.pos.y, 2)
    );
    
    if (distance < COLLISION_THRESHOLD) {
      return killPlayer(state);
    }
  }
  
  return state;
}

/**
 * Kills the player and decrements lives.
 * If lives remain, starts death timer for respawn.
 * If no lives remain, triggers game over.
 * Returns a new state object with player killed.
 * 
 * @param state - Current game state
 * @returns New game state with player killed
 */
export function killPlayer(state: GameStateData): GameStateData {
  const newLives = state.lives - 1;
  
  if (newLives > 0) {
    // Player has lives remaining, start death timer for respawn
    return {
      ...state,
      player: {
        ...state.player,
        isDead: true,
        deathTimer: 0 // Start death timer
      },
      lives: newLives
    };
  } else {
    // No lives remaining, game over
    return {
      ...state,
      player: {
        ...state.player,
        isDead: true,
        deathTimer: 0
      },
      lives: 0,
      gameState: GameState.GameOver
    };
  }
}

/**
 * Checks if the player has reached the exit with all gold collected.
 * If so, completes the level and loads the next one.
 * Returns a new state object with level completed (or unchanged).
 * 
 * @param state - Current game state
 * @returns New game state with level completed (or unchanged)
 */
export function checkLevelCompletion(state: GameStateData): GameStateData {
  if (!state.exitRevealed) {
    return state; // Exit not revealed yet
  }
  
  const playerTilePos = {
    x: Math.floor(state.player.pos.x),
    y: Math.floor(state.player.pos.y)
  };
  
  const tile = getTileAt(playerTilePos, state.tiles);
  
  if (tile === TileType.Exit) {
    return completeLevel(state);
  }
  
  return state;
}

/**
 * Completes the current level and loads the next one.
 * Calculates time bonus and adds to score.
 * If all levels completed, triggers victory.
 * Returns a new state object with next level loaded.
 * 
 * @param state - Current game state
 * @returns New game state with next level loaded
 */
export function completeLevel(state: GameStateData): GameStateData {
  // Calculate time bonus
  const level = getLevel(state.currentLevel);
  let newScore = state.score;
  
  if (level) {
    const timeBonus = Math.max(0, (level.parTime - state.levelTimer) * TIME_BONUS_MULTIPLIER);
    newScore += timeBonus;
  }
  
  // Check if all levels completed
  if (state.currentLevel >= MAX_LEVELS) {
    // Victory!
    return {
      ...state,
      score: newScore,
      gameState: GameState.Victory
    };
  }
  
  // Load next level
  const nextLevel = state.currentLevel + 1;
  const stateWithScore = {
    ...state,
    score: newScore
  };
  
  return loadLevel(stateWithScore, nextLevel);
}

/**
 * Restarts the current level.
 * Reloads the level, resetting player and enemy positions, holes, and timers.
 * Does not affect score, lives, or high score.
 * Returns a new state object with level restarted.
 * 
 * @param state - Current game state
 * @returns New game state with level restarted
 */
export function restartLevel(state: GameStateData): GameStateData {
  return loadLevel(state, state.currentLevel);
}
