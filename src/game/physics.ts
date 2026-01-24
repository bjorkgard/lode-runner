// Physics and movement system for Lode Runner

import type { GameStateData, Entity, Player, Enemy, Position } from './types';
import { TileType } from './types';
import { GRAVITY } from './constants';

/**
 * Updates physics for all entities in the game state.
 * Returns a new state object with updated entity positions and velocities.
 * 
 * @param state - Current game state containing all entities
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New game state with updated physics
 */
export function updatePhysics(state: GameStateData, deltaTime: number): GameStateData {
  const updatedPlayer = updatePlayerPhysics(state.player, state.tiles, deltaTime);
  
  const updatedEnemies = state.enemies.map(enemy => 
    updateEnemyPhysics(enemy, state.tiles, deltaTime)
  );
  
  return {
    ...state,
    player: updatedPlayer,
    enemies: updatedEnemies
  };
}

/**
 * Core physics update logic shared by all entities.
 * Calculates new position, velocity, and state flags based on gravity and collisions.
 * 
 * @param entity - Entity to update (player or enemy)
 * @param tiles - Current tile grid for collision detection
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns Object with updated position, velocity, and state flags
 */
function updateEntityPhysicsCore(
  entity: Entity,
  tiles: TileType[][],
  deltaTime: number
): {
  pos: Position;
  velocity: { x: number; y: number };
  isOnLadder: boolean;
  isOnRope: boolean;
  isOnGround: boolean;
} {
  // Update tile state flags first
  const isOnLadder = getTileAt(entity.pos, tiles) === TileType.Ladder;
  const isOnRope = getTileAt(entity.pos, tiles) === TileType.Rope;
  
  // Create entity with updated flags for support check
  const entityWithFlags: Entity = {
    ...entity,
    isOnLadder,
    isOnRope
  };
  
  // Calculate new velocity based on support
  let newVelocity = { ...entity.velocity };
  let isOnGround = false;
  
  if (!isSupported(entityWithFlags, tiles)) {
    newVelocity.y += GRAVITY * deltaTime;
    isOnGround = false;
  } else {
    newVelocity.y = 0;
    isOnGround = true;
  }
  
  // Calculate new position
  const newPos = {
    x: entity.pos.x + newVelocity.x * deltaTime,
    y: entity.pos.y + newVelocity.y * deltaTime
  };
  
  // Resolve collisions and get adjusted position and velocity
  const resolved = resolveCollisions(
    { ...entity, pos: newPos, velocity: newVelocity, isOnLadder, isOnRope, isOnGround },
    tiles
  );
  
  return {
    pos: resolved.pos,
    velocity: resolved.velocity,
    isOnLadder,
    isOnRope,
    isOnGround
  };
}

/**
 * Updates physics for the player entity.
 * Returns a new player object with updated position, velocity, and state flags.
 * Does not mutate the input player object.
 * 
 * @param player - Player entity to update
 * @param tiles - Current tile grid for collision detection
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New player object with updated physics
 */
export function updatePlayerPhysics(
  player: Player,
  tiles: TileType[][],
  deltaTime: number
): Player {
  const updated = updateEntityPhysicsCore(player, tiles, deltaTime);
  
  return {
    ...player,
    ...updated
  };
}

/**
 * Updates physics for an enemy entity.
 * Returns a new enemy object with updated position, velocity, and state flags.
 * Trapped enemies do not move. Does not mutate the input enemy object.
 * 
 * @param enemy - Enemy entity to update
 * @param tiles - Current tile grid for collision detection
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New enemy object with updated physics
 */
export function updateEnemyPhysics(
  enemy: Enemy,
  tiles: TileType[][],
  deltaTime: number
): Enemy {
  // Trapped enemies don't move
  if (enemy.isTrapped) {
    return {
      ...enemy,
      velocity: { x: 0, y: 0 }
    };
  }
  
  const updated = updateEntityPhysicsCore(enemy, tiles, deltaTime);
  
  return {
    ...enemy,
    ...updated
  };
}

/**
 * Checks if an entity is supported by a tile below it.
 * An entity is supported if standing on solid tile, ladder, or on a rope.
 * 
 * @param entity - Entity to check for support
 * @param tiles - Current tile grid
 * @returns true if entity is supported, false if it should fall
 */
export function isSupported(entity: Entity, tiles: TileType[][]): boolean {
  // On rope means supported (can hang)
  if (entity.isOnRope) {
    return true;
  }
  
  // On ladder means supported (can stand on ladder)
  if (entity.isOnLadder) {
    return true;
  }
  
  // Check tile below entity
  const belowPos: Position = {
    x: entity.pos.x,
    y: entity.pos.y + 1
  };
  
  const tileBelow = getTileAt(belowPos, tiles);
  
  // Supported by solid tiles or ladder
  return (
    tileBelow === TileType.Brick ||
    tileBelow === TileType.Steel ||
    tileBelow === TileType.Ladder
  );
}

/**
 * Collision epsilon for tile boundary snapping.
 * Small offset to prevent entity from being exactly on tile boundary.
 */
const COLLISION_EPSILON = 0.01;

/**
 * Resolves collisions between an entity and solid tiles.
 * Returns a new entity with adjusted position and velocity.
 * Does not mutate the input entity.
 * 
 * @param entity - Entity to check and resolve collisions for
 * @param tiles - Current tile grid
 * @returns Object with resolved position and velocity
 */
export function resolveCollisions(
  entity: Entity,
  tiles: TileType[][]
): { pos: Position; velocity: { x: number; y: number } } {
  let pos = { ...entity.pos };
  let velocity = { ...entity.velocity };
  
  const tileX = Math.floor(pos.x);
  const tileY = Math.floor(pos.y);
  
  // Check current tile
  const currentTile = getTileAt({ x: tileX, y: tileY }, tiles);
  
  // If inside a solid tile, push entity out
  if (currentTile === TileType.Brick || currentTile === TileType.Steel) {
    // Determine which direction to push based on velocity
    if (velocity.x > 0) {
      // Moving right, push left
      pos.x = tileX;
    } else if (velocity.x < 0) {
      // Moving left, push right
      pos.x = tileX + 1;
    }
    
    if (velocity.y > 0) {
      // Moving down, push up
      pos.y = tileY;
    } else if (velocity.y < 0) {
      // Moving up, push down
      pos.y = tileY + 1;
    }
    
    // Stop movement into solid tile
    velocity.x = 0;
    velocity.y = 0;
  }
  
  // Check adjacent tiles for horizontal movement
  if (velocity.x !== 0) {
    const checkX = velocity.x > 0 ? Math.ceil(pos.x) : Math.floor(pos.x);
    const adjacentTile = getTileAt({ x: checkX, y: tileY }, tiles);
    
    if (adjacentTile === TileType.Brick || adjacentTile === TileType.Steel) {
      // Snap to tile boundary
      if (velocity.x > 0) {
        pos.x = checkX - COLLISION_EPSILON; // Just before the solid tile
      } else {
        pos.x = checkX + 1 + COLLISION_EPSILON; // Just after the solid tile
      }
      velocity.x = 0;
    }
  }
  
  // Check adjacent tiles for vertical movement
  if (velocity.y !== 0) {
    const checkY = velocity.y > 0 ? Math.ceil(pos.y) : Math.floor(pos.y);
    const adjacentTile = getTileAt({ x: tileX, y: checkY }, tiles);
    
    if (adjacentTile === TileType.Brick || adjacentTile === TileType.Steel) {
      // Snap to tile boundary
      if (velocity.y > 0) {
        pos.y = checkY - COLLISION_EPSILON; // Just above the solid tile
      } else {
        pos.y = checkY + 1 + COLLISION_EPSILON; // Just below the solid tile
      }
      velocity.y = 0;
    }
  }
  
  return { pos, velocity };
}

/**
 * Gets the tile type at a specific position.
 * Returns Empty if position is out of bounds.
 * 
 * @param pos - Position in tile coordinates
 * @param tiles - Current tile grid
 * @returns TileType at the position, or Empty if out of bounds
 */
export function getTileAt(pos: Position, tiles: TileType[][]): TileType {
  const x = Math.floor(pos.x);
  const y = Math.floor(pos.y);
  
  // Check bounds
  if (y < 0 || y >= tiles.length || x < 0 || x >= tiles[0].length) {
    return TileType.Empty;
  }
  
  return tiles[y][x];
}

/**
 * Checks if an entity can move to a specific position.
 * A position is valid if it's not a solid tile (brick or steel).
 * 
 * @param pos - Target position in tile coordinates
 * @param tiles - Current tile grid
 * @returns true if position is traversable, false if blocked
 */
export function canMoveTo(pos: Position, tiles: TileType[][]): boolean {
  const tile = getTileAt(pos, tiles);
  
  // Cannot move into solid tiles
  return tile !== TileType.Brick && tile !== TileType.Steel;
}
