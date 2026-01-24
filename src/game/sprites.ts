// Sprite loading and management system for Lode Runner

import type { SpriteSheet } from './types';
import { PLAYER_ANIMATIONS, ENEMY_ANIMATIONS } from './animation';
import type { Animation } from './animation';
import { SPRITES } from '../constants/ui';

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
 * Collection of all animation definitions.
 * Organized by entity type (player, enemy).
 */
export const ANIMATIONS = {
  player: PLAYER_ANIMATIONS,
  enemy: ENEMY_ANIMATIONS
} as const;

/**
 * Sprite manager class that handles sprite sheet loading and management.
 * Encapsulates sprite state and provides methods for sprite access.
 * 
 * Benefits of class-based approach:
 * - Easier to test (can create isolated instances)
 * - No module-level state pollution
 * - Better for hot module replacement
 * - Proper encapsulation of sprite resources
 */
export class SpriteManager {
  private spriteSheets: SpriteSheets | null = null;
  
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
   * const playerSheet = await spriteManager.loadSpriteSheet('/assets/sprites/player.png', 16, 16);
   * ```
   */
  private loadSpriteSheet(
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
   * await spriteManager.init();
   * if (spriteManager.getSpriteSheets()) {
   *   // Sprites loaded successfully
   * } else {
   *   // Using fallback rendering
   * }
   * ```
   */
  async init(): Promise<void> {
    try {
      const [player, enemy, tiles] = await Promise.all([
        this.loadSpriteSheet('/assets/sprites/player.png', SPRITES.FRAME_WIDTH, SPRITES.FRAME_HEIGHT),
        this.loadSpriteSheet('/assets/sprites/enemy.png', SPRITES.FRAME_WIDTH, SPRITES.FRAME_HEIGHT),
        this.loadSpriteSheet('/assets/sprites/tiles.png', SPRITES.FRAME_WIDTH, SPRITES.FRAME_HEIGHT)
      ]);
      
      this.spriteSheets = { player, enemy, tiles };
    } catch (error) {
      console.error('Failed to load sprite sheets:', error);
      this.spriteSheets = null; // Trigger fallback rendering
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
   * const sheets = spriteManager.getSpriteSheets();
   * if (sheets) {
   *   renderSprite(ctx, sheets.player, 0, x, y);
   * } else {
   *   renderFallbackRect(ctx, x, y);
   * }
   * ```
   */
  getSpriteSheets(): SpriteSheets | null {
    return this.spriteSheets;
  }
  
  /**
   * Resets the sprite sheets to null.
   * Useful for testing or forcing a reload.
   * 
   * @example
   * ```typescript
   * spriteManager.reset();
   * await spriteManager.init(); // Reload sprites
   * ```
   */
  reset(): void {
    this.spriteSheets = null;
  }
  
  /**
   * Gets animation definitions for a specific entity type.
   * 
   * @param entityType - Type of entity ('player' or 'enemy')
   * @returns Record of animation names to Animation definitions
   * 
   * @example
   * ```typescript
   * const playerAnims = spriteManager.getAnimations('player');
   * const runAnim = playerAnims.run;
   * ```
   */
  getAnimations(entityType: 'player' | 'enemy'): Record<string, Animation> {
    return ANIMATIONS[entityType];
  }
}
