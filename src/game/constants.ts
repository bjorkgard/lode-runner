// Game constants for Lode Runner

/**
 * Size of a single tile in pixels.
 * All game entities and tiles are rendered at this size.
 */
export const TILE_SIZE = 16; // pixels

/**
 * Gravity acceleration applied to entities in pixels per second squared.
 * Entities fall at this rate when not supported by a tile.
 */
export const GRAVITY = 500; // pixels per second squared

/**
 * Player movement speed in pixels per second.
 * Applied to horizontal and vertical movement on ladders/ropes.
 */
export const PLAYER_SPEED = 100; // pixels per second

/**
 * Enemy movement speed in pixels per second.
 * Slightly slower than player to make game winnable.
 */
export const ENEMY_SPEED = 80; // pixels per second

/**
 * Time in seconds before a dug hole regenerates back to brick.
 * Enemies trapped in holes when they regenerate are eliminated.
 */
export const HOLE_REGEN_TIME = 5; // seconds

/**
 * Time in seconds to wait after player death before respawning.
 * Gives player time to see the death animation.
 */
export const DEATH_RESPAWN_DELAY = 2; // seconds

/**
 * Points awarded for collecting a single gold piece.
 */
export const GOLD_POINTS = 100; // points per gold

/**
 * Multiplier for time bonus calculation.
 * Bonus = (parTime - actualTime) * TIME_BONUS_MULTIPLIER
 */
export const TIME_BONUS_MULTIPLIER = 10; // points per second under par time

/**
 * Distance threshold in tile units for collision detection.
 * Entities within this distance are considered colliding.
 */
export const COLLISION_THRESHOLD = 0.5; // tile units

/**
 * Total number of levels in the game.
 * Completing level 100 triggers victory screen.
 */
export const MAX_LEVELS = 100;

/**
 * Version number for localStorage schema.
 * Increment when storage format changes to avoid conflicts.
 */
export const STORAGE_VERSION = 1;

/**
 * localStorage keys for persisting game data.
 * All keys are versioned to handle schema changes.
 */
export const STORAGE_KEYS = {
  /** Key for storing high score */
  highScore: `loderunner_highscore_v${STORAGE_VERSION}`,
  /** Key for storing audio settings (muted, volume) */
  audioSettings: `loderunner_audio_v${STORAGE_VERSION}`,
  /** Key for storing current level progress */
  currentLevel: `loderunner_level_v${STORAGE_VERSION}`
};
