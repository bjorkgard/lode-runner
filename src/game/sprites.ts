// Sprite loading and management system for Lode Runner

import type { SpriteSheet } from './types';
import { PLAYER_ANIMATIONS, ENEMY_ANIMATIONS } from './animation';
import type { Animation } from './animation';

/**
 * Collection of all loaded sprite sheets.
 * Null if sprites failed to load (triggers fallback rendering).
 */
export interface SpriteSheets {
  player: SpriteSheet;
  enemy: SpriteSheet;
  tiles: SpriteSheet;
}

/**
 * Global sprite sheets storage.
 * Set to null if loading fails to enable fallback rendering.
 */
let spriteSheets: SpriteSheets | null = null;

/**
 * Collection of all animation definitions.
 * Organized by entity type (player, enemy).
 */
export const ANIMATIONS = {
  player: PLAYER_ANIMATIONS,
  enemy: ENEMY_ANIMATIONS
} as const;

/**
 * Loads a single sprite sheet from a file path.
 * Creates an HTMLImageElement and waits for it to load.
 * 
 * @param path - Path to the sprite sheet image file
 * @param frameWidth - Width of a single frame in pixels
 * @param frameHeight - Height of a single frame in pixels
 * @returns Promise that resolves to a SpriteSheet object
 * @throws Error if image fails to load
 * 
 * @example
 * ```typescript
 * const playerSheet = await loadSpriteSheet('/assets/sprites/player.png', 16, 16);
 * ```
 */
export function loadSpriteSheet(
  path: string,
  frameWidth: number,
  frameHeight: number
): Promise<SpriteSheet> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        image: img,
        frameWidth,
        frameHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load sprite sheet: ${path}`));
    };
    
    img.src = path;
  });
}

/**
 * Loads all sprite sheets required for the game.
 * Attempts to load player, enemy, and tile sprite sheets.
 * 
 * If loading fails, sets spriteSheets to null to enable fallback rendering.
 * The game will continue to function with colored rectangles instead of sprites.
 * 
 * @returns Promise that resolves when all sprites are loaded (or fails gracefully)
 * 
 * @example
 * ```typescript
 * await loadSprites();
 * if (getSpriteSheets()) {
 *   // Sprites loaded successfully
 * } else {
 *   // Using fallback rendering
 * }
 * ```
 */
export async function loadSprites(): Promise<void> {
  try {
    const [player, enemy, tiles] = await Promise.all([
      loadSpriteSheet('/assets/sprites/player.png', 16, 16),
      loadSpriteSheet('/assets/sprites/enemy.png', 16, 16),
      loadSpriteSheet('/assets/sprites/tiles.png', 16, 16)
    ]);
    
    spriteSheets = { player, enemy, tiles };
  } catch (error) {
    console.error('Failed to load sprite sheets:', error);
    spriteSheets = null; // Trigger fallback rendering
  }
}

/**
 * Gets the currently loaded sprite sheets.
 * Returns null if sprites failed to load or haven't been loaded yet.
 * 
 * @returns The loaded sprite sheets, or null if unavailable
 * 
 * @example
 * ```typescript
 * const sheets = getSpriteSheets();
 * if (sheets) {
 *   renderSprite(ctx, sheets.player, 0, x, y);
 * } else {
 *   renderFallbackRect(ctx, x, y);
 * }
 * ```
 */
export function getSpriteSheets(): SpriteSheets | null {
  return spriteSheets;
}

/**
 * Resets the sprite sheets to null.
 * Useful for testing or forcing a reload.
 * 
 * @example
 * ```typescript
 * resetSpriteSheets();
 * await loadSprites(); // Reload sprites
 * ```
 */
export function resetSpriteSheets(): void {
  spriteSheets = null;
}

/**
 * Gets animation definitions for a specific entity type.
 * 
 * @param entityType - Type of entity ('player' or 'enemy')
 * @returns Record of animation names to Animation definitions
 * 
 * @example
 * ```typescript
 * const playerAnims = getAnimations('player');
 * const runAnim = playerAnims.run;
 * ```
 */
export function getAnimations(entityType: 'player' | 'enemy'): Record<string, Animation> {
  return ANIMATIONS[entityType];
}
