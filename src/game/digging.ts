// Digging system for Lode Runner

import type { GameStateData, Hole, Position } from './types';
import { TileType } from './types';
import { HOLE_REGEN_TIME } from './constants';
import { getTileAt } from './physics';

/**
 * Updates all active holes in the game state.
 * Decrements regeneration timers and regenerates holes when timers expire.
 * Returns a new state object with updated holes and tiles.
 * 
 * @param state - Current game state containing holes and tiles
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New game state with updated holes
 */
export function updateDigging(state: GameStateData, deltaTime: number): GameStateData {
  const updatedHoles: Hole[] = [];
  let updatedTiles = state.tiles.map(row => [...row]); // Deep copy tiles
  let updatedEnemies = [...state.enemies];
  
  // Update each hole's regeneration timer
  for (let i = 0; i < state.holes.length; i++) {
    const hole = state.holes[i];
    const newTimer = hole.regenerationTimer - deltaTime;
    
    if (newTimer <= 0) {
      // Hole should regenerate
      const result = regenerateHole(state, hole, updatedTiles, updatedEnemies);
      updatedTiles = result.tiles;
      updatedEnemies = result.enemies;
      // Don't add this hole to updatedHoles (it's removed)
    } else {
      // Hole still active, update timer
      updatedHoles.push({
        ...hole,
        regenerationTimer: newTimer
      });
    }
  }
  
  return {
    ...state,
    holes: updatedHoles,
    tiles: updatedTiles,
    enemies: updatedEnemies
  };
}

/**
 * Creates a hole in a brick tile at the specified direction from the player.
 * Returns a new state object with the hole added and tile changed to empty.
 * Does nothing if the target tile is not brick or if a hole already exists there.
 * 
 * @param state - Current game state
 * @param direction - Direction to dig ('left' or 'right')
 * @returns New game state with hole created (or unchanged if dig failed)
 */
export function digHole(state: GameStateData, direction: 'left' | 'right'): GameStateData {
  const player = state.player;
  
  // Calculate dig position (diagonally down-left or down-right)
  const digPos: Position = {
    x: Math.floor(player.pos.x) + (direction === 'left' ? -1 : 1),
    y: Math.floor(player.pos.y) + 1
  };
  
  // Check if target tile is brick
  const tile = getTileAt(digPos, state.tiles);
  if (tile !== TileType.Brick) {
    return state; // Can only dig brick tiles
  }
  
  // Check if hole already exists at this position
  const holeExists = state.holes.some(
    h => h.pos.x === digPos.x && h.pos.y === digPos.y
  );
  if (holeExists) {
    return state; // Can't dig where hole already exists
  }
  
  // Create the hole
  const updatedTiles = state.tiles.map(row => [...row]); // Deep copy
  updatedTiles[digPos.y][digPos.x] = TileType.Empty;
  
  const newHole: Hole = {
    pos: digPos,
    regenerationTimer: HOLE_REGEN_TIME,
    maxRegenTime: HOLE_REGEN_TIME
  };
  
  return {
    ...state,
    tiles: updatedTiles,
    holes: [...state.holes, newHole],
    player: {
      ...state.player,
      isDigging: true,
      digDirection: direction
    }
  };
}

/**
 * Regenerates a hole back to a brick tile.
 * Eliminates any enemies trapped in the hole position.
 * Returns updated tiles and enemies arrays.
 * 
 * @param state - Current game state
 * @param hole - Hole to regenerate
 * @param tiles - Current tile grid (will be modified)
 * @param enemies - Current enemies array (will be modified)
 * @returns Object with updated tiles and enemies arrays
 */
function regenerateHole(
  state: GameStateData,
  hole: Hole,
  tiles: TileType[][],
  enemies: typeof state.enemies
): { tiles: TileType[][]; enemies: typeof state.enemies } {
  // Restore brick tile
  tiles[hole.pos.y][hole.pos.x] = TileType.Brick;
  
  // Check for trapped enemies and eliminate them
  const updatedEnemies = enemies.filter(enemy => {
    const enemyTileX = Math.floor(enemy.pos.x);
    const enemyTileY = Math.floor(enemy.pos.y);
    
    // If enemy is in the hole position, eliminate it
    if (enemyTileX === hole.pos.x && enemyTileY === hole.pos.y) {
      return false; // Remove this enemy
    }
    
    return true; // Keep this enemy
  });
  
  return {
    tiles,
    enemies: updatedEnemies
  };
}
