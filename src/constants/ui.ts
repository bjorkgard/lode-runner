/**
 * UI Constants for Lode Runner Game
 * 
 * This file contains all UI-related magic numbers extracted for maintainability.
 * Centralizing these values makes it easier to adjust the UI without hunting
 * through multiple files.
 */

/**
 * Canvas and viewport constants
 */
export const CANVAS = {
  /** Game world width in tiles */
  WORLD_WIDTH_TILES: 28,
  
  /** Game world height in tiles */
  WORLD_HEIGHT_TILES: 16,
  
  /** Minimum canvas width in pixels */
  MIN_WIDTH: 280,
  
  /** Minimum canvas height in pixels */
  MIN_HEIGHT: 160,
  
  /** Horizontal margin for canvas (left + right) */
  MARGIN_HORIZONTAL: 40,
  
  /** Vertical margin for canvas (top + bottom, includes HUD) */
  MARGIN_VERTICAL: 200,
  
  /** Calculated aspect ratio (28:16 = 1.75) */
  get ASPECT_RATIO() {
    return this.WORLD_WIDTH_TILES / this.WORLD_HEIGHT_TILES;
  }
} as const;

/**
 * Timer and update intervals
 */
export const TIMING = {
  /** Timer update interval in milliseconds for smooth display */
  TIMER_UPDATE_INTERVAL_MS: 100,
} as const;

/**
 * Player lives constants
 */
export const PLAYER = {
  /** Initial number of lives when starting a new game */
  INITIAL_LIVES: 3,
  
  /** Maximum number of lives to display in HUD */
  MAX_LIVES_DISPLAY: 3,
} as const;

/**
 * Level constants
 */
export const LEVELS = {
  /** Starting level number */
  FIRST_LEVEL: 1,
  
  /** Total number of levels in the game */
  TOTAL_LEVELS: 100,
} as const;

/**
 * Sprite dimensions
 */
export const SPRITES = {
  /** Width of each sprite frame in pixels */
  FRAME_WIDTH: 16,
  
  /** Height of each sprite frame in pixels */
  FRAME_HEIGHT: 16,
} as const;

/**
 * Particle system constants
 */
export const PARTICLES = {
  /** Size of the particle object pool */
  POOL_SIZE: 100,
  
  /** Minimum particle speed in pixels per second */
  MIN_SPEED: 50,
  
  /** Maximum particle speed in pixels per second */
  MAX_SPEED: 100,
  
  /** Calculated speed range */
  get SPEED_RANGE() {
    return this.MAX_SPEED - this.MIN_SPEED;
  }
} as const;

/**
 * Tile type enum values (for reference)
 */
export const TILE_TYPES = {
  EMPTY: 0,
  BRICK: 1,
  STEEL: 2,
  LADDER: 3,
  ROPE: 4,
  GOLD: 5,
  EXIT: 6,
} as const;

/**
 * Game state enum values (for reference)
 */
export const GAME_STATES = {
  MENU: 0,
  PLAYING: 1,
  PAUSED: 2,
  GAME_OVER: 3,
  VICTORY: 4,
} as const;
