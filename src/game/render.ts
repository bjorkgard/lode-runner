// Rendering system for Lode Runner game using Canvas 2D API

import type { GameStateData, Player, Enemy, Hole, SpriteSheet } from './types';
import { TileType } from './types';
import { TILE_SIZE } from './constants';
import { getSpriteSheets, getAnimations } from './sprites';
import { renderParticles } from './particles';

/**
 * Main rendering function that draws the entire game state to the canvas.
 * Disables image smoothing for pixel-perfect rendering.
 * 
 * Render order (back to front):
 * 1. Clear canvas (black background)
 * 2. Tiles (level layout)
 * 3. Holes (visual indication of regeneration)
 * 4. Particles (gold pickup effects)
 * 5. Enemies
 * 6. Player (always on top)
 * 
 * @param state - Current game state containing all entities and tiles
 * @param ctx - Canvas 2D rendering context to draw on
 */
export function renderGame(state: GameStateData, ctx: CanvasRenderingContext2D): void {
  const spriteSheets = getSpriteSheets();
  
  // Disable image smoothing for pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;
  
  // Clear canvas with black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Calculate scale factor to fit game world to canvas
  const scaleX = ctx.canvas.width / (state.tiles[0].length * TILE_SIZE);
  const scaleY = ctx.canvas.height / (state.tiles.length * TILE_SIZE);
  const scale = Math.min(scaleX, scaleY);
  
  // Apply scaling transform
  ctx.save();
  ctx.scale(scale, scale);
  
  // Render tiles
  renderTiles(state.tiles, ctx, spriteSheets);
  
  // Render holes (visual indication)
  renderHoles(state.holes, ctx);
  
  // Render gold particles
  renderParticles(ctx);
  
  // Render enemies
  for (const enemy of state.enemies) {
    renderEnemy(enemy, ctx, spriteSheets);
  }
  
  // Render player (always on top)
  renderPlayer(state.player, ctx, spriteSheets);
  
  // Restore transform
  ctx.restore();
}

/**
 * Renders all tiles in the level grid.
 * Skips empty tiles for performance.
 * Uses sprite sheets if available, otherwise falls back to colored rectangles.
 * 
 * @param tiles - 2D array of tile types defining the level layout
 * @param ctx - Canvas 2D rendering context
 * @param spriteSheets - Loaded sprite sheets, or null for fallback rendering
 */
export function renderTiles(
  tiles: TileType[][],
  ctx: CanvasRenderingContext2D,
  spriteSheets: ReturnType<typeof getSpriteSheets>
): void {
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const tile = tiles[y][x];
      
      // Skip empty tiles
      if (tile === TileType.Empty) continue;
      
      if (spriteSheets) {
        // Render using sprite sheet (frame index matches tile type)
        renderSprite(
          ctx,
          spriteSheets.tiles,
          tile,
          x * TILE_SIZE,
          y * TILE_SIZE
        );
      } else {
        // Fallback rendering with colored rectangles
        renderTileFallback(ctx, tile, x * TILE_SIZE, y * TILE_SIZE);
      }
    }
  }
}

/**
 * Renders the player character using sprite animation.
 * Uses current animation state to determine which frame to display.
 * Falls back to colored rectangle if sprites are unavailable.
 * 
 * @param player - Player entity with position and animation state
 * @param ctx - Canvas 2D rendering context
 * @param spriteSheets - Loaded sprite sheets, or null for fallback rendering
 */
export function renderPlayer(
  player: Player,
  ctx: CanvasRenderingContext2D,
  spriteSheets: ReturnType<typeof getSpriteSheets>
): void {
  if (spriteSheets) {
    const animations = getAnimations('player');
    const anim = animations[player.animation.currentAnimation];
    const frameIndex = anim.frames[player.animation.currentFrame];
    
    renderSprite(
      ctx,
      spriteSheets.player,
      frameIndex,
      player.pos.x * TILE_SIZE,
      player.pos.y * TILE_SIZE
    );
  } else {
    // Fallback rendering - blue rectangle for player
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(
      player.pos.x * TILE_SIZE,
      player.pos.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}

/**
 * Renders an enemy character using sprite animation.
 * Uses current animation state to determine which frame to display.
 * Falls back to colored rectangle if sprites are unavailable.
 * 
 * @param enemy - Enemy entity with position and animation state
 * @param ctx - Canvas 2D rendering context
 * @param spriteSheets - Loaded sprite sheets, or null for fallback rendering
 */
export function renderEnemy(
  enemy: Enemy,
  ctx: CanvasRenderingContext2D,
  spriteSheets: ReturnType<typeof getSpriteSheets>
): void {
  if (spriteSheets) {
    const animations = getAnimations('enemy');
    const anim = animations[enemy.animation.currentAnimation];
    const frameIndex = anim.frames[enemy.animation.currentFrame];
    
    renderSprite(
      ctx,
      spriteSheets.enemy,
      frameIndex,
      enemy.pos.x * TILE_SIZE,
      enemy.pos.y * TILE_SIZE
    );
  } else {
    // Fallback rendering - red rectangle for enemy
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(
      enemy.pos.x * TILE_SIZE,
      enemy.pos.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}

/**
 * Renders a single sprite from a sprite sheet.
 * Calculates source coordinates based on frame index and sheet layout.
 * 
 * Sprite sheets are organized in a grid where frames are laid out left-to-right,
 * top-to-bottom. The frame index determines which frame to draw.
 * 
 * @param ctx - Canvas 2D rendering context
 * @param sheet - Sprite sheet containing the frame to render
 * @param frameIndex - Index of the frame to render (0-based)
 * @param x - X position in pixels where sprite should be drawn
 * @param y - Y position in pixels where sprite should be drawn
 */
export function renderSprite(
  ctx: CanvasRenderingContext2D,
  sheet: SpriteSheet,
  frameIndex: number,
  x: number,
  y: number
): void {
  // Calculate frames per row based on image width
  const framesPerRow = Math.floor(sheet.image.width / sheet.frameWidth);
  
  // Calculate source coordinates in sprite sheet
  const srcX = (frameIndex % framesPerRow) * sheet.frameWidth;
  const srcY = Math.floor(frameIndex / framesPerRow) * sheet.frameHeight;
  
  // Draw sprite from sheet to canvas
  ctx.drawImage(
    sheet.image,
    srcX, srcY, sheet.frameWidth, sheet.frameHeight,  // Source rectangle
    x, y, TILE_SIZE, TILE_SIZE                        // Destination rectangle
  );
}

/**
 * Renders visual indication of holes and their regeneration progress.
 * Draws a semi-transparent brown overlay that becomes more opaque as the hole regenerates.
 * 
 * @param holes - Array of active holes with regeneration timers
 * @param ctx - Canvas 2D rendering context
 */
export function renderHoles(holes: Hole[], ctx: CanvasRenderingContext2D): void {
  for (const hole of holes) {
    // Calculate regeneration progress (0 = just dug, 1 = about to regenerate)
    const progress = 1 - (hole.regenerationTimer / hole.maxRegenTime);
    
    // Draw semi-transparent brown overlay (opacity increases with progress)
    ctx.fillStyle = `rgba(139, 69, 19, ${progress * 0.5})`;
    ctx.fillRect(
      hole.pos.x * TILE_SIZE,
      hole.pos.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}

/**
 * Fallback rendering for tiles when sprite sheets are unavailable.
 * Draws colored rectangles to represent different tile types.
 * 
 * @param ctx - Canvas 2D rendering context
 * @param tile - Type of tile to render
 * @param x - X position in pixels
 * @param y - Y position in pixels
 */
function renderTileFallback(
  ctx: CanvasRenderingContext2D,
  tile: TileType,
  x: number,
  y: number
): void {
  // Choose color based on tile type
  switch (tile) {
    case TileType.Brick:
      ctx.fillStyle = '#8B4513'; // Brown
      break;
    case TileType.Steel:
      ctx.fillStyle = '#808080'; // Gray
      break;
    case TileType.Ladder:
      ctx.fillStyle = '#FFFF00'; // Yellow
      break;
    case TileType.Rope:
      ctx.fillStyle = '#FFA500'; // Orange
      break;
    case TileType.Gold:
      ctx.fillStyle = '#FFD700'; // Gold
      break;
    case TileType.Exit:
      ctx.fillStyle = '#00FF00'; // Green
      break;
    default:
      ctx.fillStyle = '#000000'; // Black (empty)
  }
  
  // Draw filled rectangle
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  
  // Draw border for better visibility
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
}
