// Enemy AI system for Lode Runner

import type { GameStateData, Enemy, Player, Position, Hole } from './types';
import { TileType } from './types';
import { ENEMY_SPEED } from './constants';
import { canMoveTo } from './physics';

/**
 * Updates AI for all enemies in the game state.
 * Calculates chase directions and moves enemies toward the player.
 * Returns a new state object with updated enemy positions and velocities.
 * 
 * @param state - Current game state containing all entities
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New game state with updated enemy AI
 */
export function updateAI(state: GameStateData, deltaTime: number): GameStateData {
  const updatedEnemies = state.enemies.map(enemy => {
    // Trapped enemies don't move
    if (enemy.isTrapped) {
      return enemy;
    }
    
    // Calculate direction to chase player
    const direction = calculateChaseDirection(enemy, state.player, state.tiles);
    
    // Move enemy in that direction
    const movedEnemy = moveEnemy(enemy, direction, state.tiles, deltaTime);
    
    // Check if enemy fell into a hole
    return checkEnemyTrapped(movedEnemy, state.holes);
  });
  
  return {
    ...state,
    enemies: updatedEnemies
  };
}

/**
 * Calculates the direction an enemy should move to chase the player.
 * Uses Manhattan distance heuristic - prioritizes horizontal movement over vertical.
 * 
 * @param enemy - Enemy entity calculating chase direction
 * @param player - Player entity to chase
 * @param _tiles - Current tile grid for pathfinding (unused in simple AI)
 * @returns Direction vector { x: -1/0/1, y: -1/0/1 }
 */
export function calculateChaseDirection(
  enemy: Enemy,
  player: Player,
  _tiles: TileType[][]
): { x: number; y: number } {
  const dx = player.pos.x - enemy.pos.x;
  const dy = player.pos.y - enemy.pos.y;
  
  // Prioritize horizontal movement (classic Lode Runner AI behavior)
  if (Math.abs(dx) > Math.abs(dy)) {
    // Move horizontally toward player
    return { x: Math.sign(dx), y: 0 };
  } else {
    // Move vertically toward player
    return { x: 0, y: Math.sign(dy) };
  }
}

/**
 * Moves an enemy in the specified direction.
 * Returns a new enemy object with updated velocity.
 * Does not mutate the input enemy object.
 * 
 * @param enemy - Enemy entity to move
 * @param direction - Direction vector { x: -1/0/1, y: -1/0/1 }
 * @param tiles - Current tile grid for collision checking
 * @param _deltaTime - Time elapsed since last update (unused in velocity calculation)
 * @returns New enemy object with updated velocity
 */
export function moveEnemy(
  enemy: Enemy,
  direction: { x: number; y: number },
  tiles: TileType[][],
  _deltaTime: number
): Enemy {
  // Calculate target position
  const targetPos: Position = {
    x: enemy.pos.x + direction.x,
    y: enemy.pos.y + direction.y
  };
  
  // Check if move is valid
  if (canMoveTo(targetPos, tiles)) {
    // Set velocity in the direction
    return {
      ...enemy,
      velocity: {
        x: direction.x * ENEMY_SPEED,
        y: direction.y * ENEMY_SPEED
      }
    };
  }
  
  // Can't move in that direction, stop
  return {
    ...enemy,
    velocity: { x: 0, y: 0 }
  };
}

/**
 * Checks if an enemy has fallen into a hole and should be trapped.
 * Returns a new enemy object with isTrapped flag set if in a hole.
 * Does not mutate the input enemy object.
 * 
 * @param enemy - Enemy entity to check
 * @param holes - Array of all active holes
 * @returns New enemy object with updated trapped state
 */
export function checkEnemyTrapped(enemy: Enemy, holes: Hole[]): Enemy {
  const enemyTilePos: Position = {
    x: Math.floor(enemy.pos.x),
    y: Math.floor(enemy.pos.y)
  };
  
  // Check if enemy is in any hole
  for (const hole of holes) {
    if (hole.pos.x === enemyTilePos.x && hole.pos.y === enemyTilePos.y) {
      return {
        ...enemy,
        isTrapped: true,
        velocity: { x: 0, y: 0 }
      };
    }
  }
  
  // Not in a hole
  return enemy;
}
