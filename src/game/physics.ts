// Physics and movement system for Lode Runner

import type { GameStateData, Entity, Player, Enemy, Position, TileType } from './types';
import { TileType as TileTypeEnum } from './types';
import { GRAVITY, PLAYER_SPEED, ENEMY_SPEED, TILE_SIZE } from './constants';

/**
 * Updates physics for all entities in the game state.
 * Applies gravity, movement, and collision detection to player and enemies.
 * 
 * @param state - Current game state containing all entities
 * @param deltaTime - Time elapsed since last update (in seconds)
 */
export function updatePhysics(state: GameStateData, deltaTime: number): void {
  updatePlayerPhysics(state.player, state.tiles, deltaTime);
  
  for (const enemy of state.enemies) {
    updateEnemyPhysics(enemy, state.tiles, deltaTime);
  }
}

/**
 * Updates physics for the player entity.
 * Applies gravity when unsupported, updates position based on velocity,
 * resolves collisions with tiles, and updates state flags.
 * 
 * @param player - Player entity to update
 * @param tiles - Current tile grid for collision detection
 * @param deltaTime - Time elapsed since last update (in seconds)
 */
export function updatePlayerPhysics(
  player: Player,
  tiles: TileType[][],
  deltaTime: number
): void {
  // Update tile state flags first
  player.isOnLadder = getTileAt(player.pos, tiles) === TileTypeEnum.Ladder;
  player.isOnRope = getTileAt(player.pos, tiles) === TileTypeEnum.Rope;
  
  // Apply gravity if not supported
  if (!isSupported(player, tiles)) {
    player.velocity.y += GRAVITY * deltaTime;
    player.isOnGround = false;
  } else {
    player.velocity.y = 0;
    player.isOnGround = true;
  }
  
  // Apply velocity to position
  player.pos.x += player.velocity.x * deltaTime;
  player.pos.y += player.velocity.y * deltaTime;
  
  // Collision detection and resolution
  resolveCollisions(player, tiles);
}

/**
 * Updates physics for an enemy entity.
 * Similar to player physics but enemies cannot be controlled by input.
 * Trapped enemies do not move.
 * 
 * @param enemy - Enemy entity to update
 * @param tiles - Current tile grid for collision detection
 * @param deltaTime - Time elapsed since last update (in seconds)
 */
export function updateEnemyPhysics(
  enemy: Enemy,
  tiles: TileType[][],
  deltaTime: number
): void {
  // Trapped enemies don't move
  if (enemy.isTrapped) {
    enemy.velocity.x = 0;
    enemy.velocity.y = 0;
    return;
  }
  
  // Update tile state flags
  enemy.isOnLadder = getTileAt(enemy.pos, tiles) === TileTypeEnum.Ladder;
  enemy.isOnRope = getTileAt(enemy.pos, tiles) === TileTypeEnum.Rope;
  
  // Apply gravity if not supported
  if (!isSupported(enemy, tiles)) {
    enemy.velocity.y += GRAVITY * deltaTime;
    enemy.isOnGround = false;
  } else {
    enemy.velocity.y = 0;
    enemy.isOnGround = true;
  }
  
  // Apply velocity to position
  enemy.pos.x += enemy.velocity.x * deltaTime;
  enemy.pos.y += enemy.velocity.y * deltaTime;
  
  // Collision detection and resolution
  resolveCollisions(enemy, tiles);
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
    tileBelow === TileTypeEnum.Brick ||
    tileBelow === TileTypeEnum.Steel ||
    tileBelow === TileTypeEnum.Ladder
  );
}

/**
 * Resolves collisions between an entity and solid tiles.
 * Prevents entity from moving through brick and steel tiles.
 * Adjusts entity position to stay outside solid tiles.
 * 
 * @param entity - Entity to check and resolve collisions for
 * @param tiles - Current tile grid
 */
export function resolveCollisions(entity: Entity, tiles: TileType[][]): void {
  const tileX = Math.floor(entity.pos.x);
  const tileY = Math.floor(entity.pos.y);
  
  // Check current tile
  const currentTile = getTileAt({ x: tileX, y: tileY }, tiles);
  
  // If inside a solid tile, push entity out
  if (currentTile === TileTypeEnum.Brick || currentTile === TileTypeEnum.Steel) {
    // Determine which direction to push based on velocity
    if (entity.velocity.x > 0) {
      // Moving right, push left
      entity.pos.x = tileX;
    } else if (entity.velocity.x < 0) {
      // Moving left, push right
      entity.pos.x = tileX + 1;
    }
    
    if (entity.velocity.y > 0) {
      // Moving down, push up
      entity.pos.y = tileY;
    } else if (entity.velocity.y < 0) {
      // Moving up, push down
      entity.pos.y = tileY + 1;
    }
    
    // Stop movement into solid tile
    entity.velocity.x = 0;
    entity.velocity.y = 0;
  }
  
  // Check adjacent tiles for horizontal movement
  if (entity.velocity.x !== 0) {
    const checkX = entity.velocity.x > 0 ? Math.ceil(entity.pos.x) : Math.floor(entity.pos.x);
    const adjacentTile = getTileAt({ x: checkX, y: tileY }, tiles);
    
    if (adjacentTile === TileTypeEnum.Brick || adjacentTile === TileTypeEnum.Steel) {
      // Snap to tile boundary
      if (entity.velocity.x > 0) {
        entity.pos.x = checkX - 0.01; // Just before the solid tile
      } else {
        entity.pos.x = checkX + 1.01; // Just after the solid tile
      }
      entity.velocity.x = 0;
    }
  }
  
  // Check adjacent tiles for vertical movement
  if (entity.velocity.y !== 0) {
    const checkY = entity.velocity.y > 0 ? Math.ceil(entity.pos.y) : Math.floor(entity.pos.y);
    const adjacentTile = getTileAt({ x: tileX, y: checkY }, tiles);
    
    if (adjacentTile === TileTypeEnum.Brick || adjacentTile === TileTypeEnum.Steel) {
      // Snap to tile boundary
      if (entity.velocity.y > 0) {
        entity.pos.y = checkY - 0.01; // Just above the solid tile
      } else {
        entity.pos.y = checkY + 1.01; // Just below the solid tile
      }
      entity.velocity.y = 0;
    }
  }
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
    return TileTypeEnum.Empty;
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
  return tile !== TileTypeEnum.Brick && tile !== TileTypeEnum.Steel;
}
