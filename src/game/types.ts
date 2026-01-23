// Core type definitions for Lode Runner game

import type { Animation, AnimationState } from './animation';

// Re-export animation types for convenience
export type { Animation, AnimationState };

/**
 * Represents the different types of tiles in the game world.
 * Each tile type has unique collision and interaction properties.
 * 
 * Using const assertion pattern for type-safe enum-like behavior
 * that's compatible with Vite's erasableSyntaxOnly mode.
 */
export const TileType = {
  /** Empty space - no collision, player can fall through */
  Empty: 0,
  /** Brick tile - solid, diggable, regenerates after being dug */
  Brick: 1,
  /** Steel tile - solid, non-diggable, permanent structure */
  Steel: 2,
  /** Ladder tile - climbable, allows vertical movement */
  Ladder: 3,
  /** Rope tile - traversable, allows horizontal movement without falling */
  Rope: 4,
  /** Gold tile - collectible, awards points when picked up */
  Gold: 5,
  /** Exit tile - level completion point, revealed after all gold collected */
  Exit: 6
} as const;

/**
 * Type representing a tile type value.
 * Provides type safety for tile type values throughout the codebase.
 */
export type TileType = typeof TileType[keyof typeof TileType];

/**
 * Represents the current state of the game application.
 * Controls which UI screens are shown and whether game logic updates.
 * 
 * Using const assertion pattern for type-safe enum-like behavior
 * that's compatible with Vite's erasableSyntaxOnly mode.
 */
export const GameState = {
  /** Main menu screen - game not started */
  Menu: 0,
  /** Active gameplay - game logic updating */
  Playing: 1,
  /** Game paused - game logic frozen, pause menu shown */
  Paused: 2,
  /** Game over screen - all lives lost */
  GameOver: 3,
  /** Victory screen - all 100 levels completed */
  Victory: 4
} as const;

/**
 * Type representing a game state value.
 * Provides type safety for game state values throughout the codebase.
 */
export type GameState = typeof GameState[keyof typeof GameState];

/**
 * Represents a position in the game world using tile coordinates.
 * The game world is a 2D grid where each tile is TILE_SIZE pixels.
 */
export interface Position {
  /** Horizontal position in tile coordinates (0 = leftmost) */
  x: number;
  /** Vertical position in tile coordinates (0 = topmost) */
  y: number;
}

/**
 * Base interface for all moving entities in the game (player and enemies).
 * Contains common properties for position, movement, animation, and tile state.
 */
export interface Entity {
  /** Current position in tile coordinates */
  pos: Position;
  /** Current velocity in pixels per second */
  velocity: { x: number; y: number };
  /** Current animation state for sprite rendering */
  animation: AnimationState;
  /** Whether entity is standing on solid ground */
  isOnGround: boolean;
  /** Whether entity is currently on a ladder tile */
  isOnLadder: boolean;
  /** Whether entity is currently on a rope tile */
  isOnRope: boolean;
}

/**
 * Represents the player character with additional player-specific state.
 * Extends Entity with lives, death state, and digging actions.
 */
export interface Player extends Entity {
  /** Number of remaining lives (starts at 3) */
  lives: number;
  /** Whether player is currently dead (triggers respawn or game over) */
  isDead: boolean;
  /** Whether player is currently performing a dig action */
  isDigging: boolean;
  /** Direction of current dig action, or null if not digging */
  digDirection: 'left' | 'right' | null;
}

/**
 * Represents an enemy character with AI-controlled behavior.
 * Extends Entity with trap state for hole mechanics.
 */
export interface Enemy extends Entity {
  /** Whether enemy is trapped in a hole (cannot move) */
  isTrapped: boolean;
  /** Timer for how long enemy has been trapped (unused currently) */
  trapTimer: number;
}

/**
 * Represents a temporary hole dug in a brick tile.
 * Holes regenerate back to brick after a timer expires.
 */
export interface Hole {
  /** Position of the hole in tile coordinates */
  pos: Position;
  /** Time remaining until hole regenerates (in seconds) */
  regenerationTimer: number;
  /** Maximum regeneration time for this hole (typically HOLE_REGEN_TIME) */
  maxRegenTime: number;
}

/**
 * Represents a single game level with layout and spawn information.
 * Contains all data needed to initialize and play a level.
 */
export interface Level {
  /** Level number (1-100) */
  number: number;
  /** Width of level in tiles */
  width: number;
  /** Height of level in tiles */
  height: number;
  /** 2D array of tile types defining the level layout */
  tiles: TileType[][];
  /** Starting position for player when level begins */
  playerStart: Position;
  /** Starting positions for all enemies in this level */
  enemyStarts: Position[];
  /** Target completion time in seconds (for time bonus calculation) */
  parTime: number;
}

/**
 * Complete game state containing all runtime data.
 * This is the single source of truth for the game engine.
 */
export interface GameStateData {
  /** Current level number (1-100) */
  currentLevel: number;
  /** Current score accumulated across all levels */
  score: number;
  /** Highest score ever achieved (persisted to localStorage) */
  highScore: number;
  /** Number of remaining lives */
  lives: number;
  /** Player entity state */
  player: Player;
  /** Array of all active enemy entities */
  enemies: Enemy[];
  /** Current tile grid (modified during gameplay for holes) */
  tiles: TileType[][];
  /** Array of all active holes with regeneration timers */
  holes: Hole[];
  /** Set of hole positions for O(1) lookup (format: "x,y") */
  holePositions: Set<string>;
  /** Number of gold pieces remaining in current level */
  goldRemaining: number;
  /** Whether exit ladder has been revealed (all gold collected) */
  exitRevealed: boolean;
  /** Time elapsed in current level (in seconds) */
  levelTimer: number;
  /** Current game state (Menu, Playing, Paused, etc.) */
  gameState: GameState;
}

/**
 * Represents a single particle in the particle effect system.
 * Used for visual effects like gold pickup bursts.
 */
export interface Particle {
  /** Current position in pixel coordinates (not tile coordinates) */
  pos: { x: number; y: number };
  /** Current velocity in pixels per second */
  velocity: { x: number; y: number };
  /** Time particle has been alive (in seconds) */
  life: number;
  /** Maximum lifetime before particle is removed (in seconds) */
  maxLife: number;
  /** Color of particle (CSS color string) */
  color: string;
}

/**
 * Audio settings for the game sound system.
 * Persisted to localStorage for user preferences.
 */
export interface AudioSettings {
  /** Whether all sound effects are muted */
  muted: boolean;
  /** Volume level from 0.0 (silent) to 1.0 (full volume) */
  volume: number;
}

/**
 * Current state of all input controls.
 * Updated by keyboard and touch input handlers.
 */
export interface InputState {
  /** Move left (Arrow Left or A key) */
  left: boolean;
  /** Move right (Arrow Right or D key) */
  right: boolean;
  /** Move up (Arrow Up or W key) */
  up: boolean;
  /** Move down (Arrow Down or S key) */
  down: boolean;
  /** Dig hole to the left (Z or Q key) */
  digLeft: boolean;
  /** Dig hole to the right (X or E key) */
  digRight: boolean;
  /** Toggle pause (P or Escape key) */
  pause: boolean;
}

/**
 * Represents a loaded sprite sheet image with frame dimensions.
 * Used by the rendering system to draw animated sprites.
 */
export interface SpriteSheet {
  /** Loaded image element containing all sprite frames */
  image: HTMLImageElement;
  /** Width of a single frame in pixels */
  frameWidth: number;
  /** Height of a single frame in pixels */
  frameHeight: number;
}
