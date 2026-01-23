// Digging system for Lode Runner

import type { GameStateData, Hole, Position } from './types';
import { TileType } from './types';
import { HOLE_REGEN_TIME } from './constants';
import { getTileAt } from './physics';

/**
 * Updates all active holes in the game state.
 * Decrements regeneration timers and regenerates holes when timers expire.
 * Returns a new state object with updated holes and tiles.
 * Uses structural sharing to only copy modified tile rows.
 * 
 * @param state - Current game state containing holes and tiles
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New game state with updated holes
 */
export function updateDigging(state: GameStateData, deltaTime: number): GameStateData {
  const updatedHoles: Hole[] = [];
  const updatedHolePositions = new Set<string>();
  const tilesToUpdate = new Map<number, TileType[]>(); // Track only changed rows
  let updatedEnemies = state.enemies;
  let hasChanges = false;
  
  // Update each hole's regeneration timer
  for (let i = 0; i < state.holes.length; i++) {
    const hole = state.holes[i];
    const newTimer = hole.regenerationTimer - deltaTime;
    
    if (newTimer <= 0) {
      // Hole should regenerate
      hasChanges = true;
      
      // Only copy the row that needs updating
      if (!tilesToUpdate.has(hole.pos.y)) {
        tilesToUpdate.set(hole.pos.y, [...state.tiles[hole.pos.y]]);
      }
      tilesToUpdate.get(hole.pos.y)![hole.pos.x] = TileType.Brick;
      
      // Check for trapped enemies and eliminate them
      const remainingEnemies = updatedEnemies.filter(enemy => {
        const enemyTileX = Math.floor(enemy.pos.x);
        const enemyTileY = Math.floor(enemy.pos.y);
        
        // If enemy is in the hole position, eliminate it
        return !(enemyTileX === hole.pos.x && enemyTileY === hole.pos.y);
      });
      
      if (remainingEnemies.length !== updatedEnemies.length) {
        updatedEnemies = remainingEnemies;
      }
      
      // Don't add this hole to updatedHoles (it's removed)
    } else {
      // Hole still active, update timer
      updatedHoles.push({
        ...hole,
        regenerationTimer: newTimer
      });
      updatedHolePositions.add(`${hole.pos.x},${hole.pos.y}`);
    }
  }
  
  // Only create new tiles array if changes were made (structural sharing)
  const updatedTiles = hasChanges
    ? state.tiles.map((row, y) => tilesToUpdate.get(y) || row)
    : state.tiles;
  
  return {
    ...state,
    holes: updatedHoles,
    holePositions: updatedHolePositions,
    tiles: updatedTiles,
    enemies: updatedEnemies
  };
}

/**
 * Creates a hole in a brick tile at the specified direction from the player.
 * Returns a new state object with the hole added and tile changed to empty.
 * Does nothing if the target tile is not brick or if a hole already exists there.
 * Uses O(1) Set lookup for hole existence check.
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
  
  // Check if hole already exists at this position using O(1) Set lookup
  const posKey = `${digPos.x},${digPos.y}`;
  if (state.holePositions.has(posKey)) {
    return state; // Can't dig where hole already exists
  }
  
  // Create the hole - only copy the affected row (structural sharing)
  const updatedTiles = state.tiles.map((row, y) => 
    y === digPos.y ? [...row] : row
  );
  updatedTiles[digPos.y][digPos.x] = TileType.Empty;
  
  const newHole: Hole = {
    pos: digPos,
    regenerationTimer: HOLE_REGEN_TIME,
    maxRegenTime: HOLE_REGEN_TIME
  };
  
  // Update hole positions Set
  const updatedHolePositions = new Set(state.holePositions);
  updatedHolePositions.add(posKey);
  
  return {
    ...state,
    tiles: updatedTiles,
    holes: [...state.holes, newHole],
    holePositions: updatedHolePositions,
    player: {
      ...state.player,
      isDigging: true,
      digDirection: direction
    }
  };
}
