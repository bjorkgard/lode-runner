# API Reference

## State Management API

Functions for managing game state (implemented):

### createInitialState

```typescript
/**
 * Creates the initial game state for a new game.
 * Initializes with default values: 3 lives, Menu state, level 1.
 * 
 * @returns A new GameStateData object with initial values
 */
createInitialState(): GameStateData
```

### createPlayer

```typescript
/**
 * Creates a player entity at the specified position.
 * Initializes with default values: 3 lives, idle animation, no movement.
 * 
 * @param pos - The starting position for the player
 * @returns A new Player object
 */
createPlayer(pos: Position): Player
```

### createEnemy

```typescript
/**
 * Creates an enemy entity at the specified position.
 * Initializes with default values: run animation, no movement, not trapped.
 * 
 * @param pos - The starting position for the enemy
 * @returns A new Enemy object
 */
createEnemy(pos: Position): Enemy
```

### resetLevel

```typescript
/**
 * Resets the current level to its initial state.
 * Reloads the level, resetting player and enemy positions, holes, and timers.
 * Does not affect score, lives, or high score.
 * 
 * @param state - The game state to reset
 */
resetLevel(state: GameStateData): void
```

## Game Engine API

The game engine will expose the following public methods (implementation in progress):

```typescript
class GameEngine {
  constructor(canvas: HTMLCanvasElement)
  
  // Lifecycle methods
  start(): void                    // Start game loop
  stop(): void                     // Stop game loop
  
  // Game control methods
  newGame(): void                  // Start new game from level 1
  pauseGame(): void                // Pause current game
  resumeGame(): void               // Resume paused game
  resetHighScore(): void           // Clear high score from storage
  
  // Callbacks for UI updates
  onScoreChange?: (score: number) => void
  onLivesChange?: (lives: number) => void
  onLevelChange?: (level: number) => void
  onGameStateChange?: (state: GameState) => void
}
```

## Level System API

Functions for managing game levels (implemented):

### loadLevel

```typescript
/**
 * Loads a level into the game state.
 * Initializes tiles, player position, enemies, and resets level-specific state.
 * 
 * @param state - The current game state to modify
 * @param levelNumber - The level number to load (1-100)
 */
loadLevel(state: GameStateData, levelNumber: number): void
```

### countGold

```typescript
/**
 * Counts the number of gold tiles in a tile grid.
 * Used to determine how much gold must be collected to complete a level.
 * 
 * @param tiles - 2D array of tile types
 * @returns The number of gold tiles found
 */
countGold(tiles: TileType[][]): number
```

### isValidLevel

```typescript
/**
 * Validates that a level has all required fields and valid data.
 * Checks for proper dimensions, tile data, and spawn positions.
 * 
 * @param level - The level to validate
 * @returns true if level is valid, false otherwise
 */
isValidLevel(level: Level): boolean
```

### getLevel

```typescript
/**
 * Gets a level by its number.
 * 
 * @param levelNumber - The level number (1-100)
 * @returns The level object, or undefined if not found
 */
getLevel(levelNumber: number): Level | undefined
```

### LEVELS

```typescript
// Array of all 100 game levels
const LEVELS: Level[]
```

## Error Handling API

Comprehensive error handling system for graceful degradation (implemented):

### Error Classes

```typescript
/**
 * Base class for all game-specific errors.
 * Extends Error with additional context for debugging and logging.
 */
class GameError extends Error {
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
  
  constructor(message: string, context?: Record<string, unknown>)
  
  /**
   * Converts error to a loggable object.
   * Useful for structured logging and debugging.
   */
  toJSON(): Record<string, unknown>
}

/**
 * Error thrown when attempting to load an invalid level.
 */
class LevelLoadError extends GameError {
  readonly levelNumber: number;
  
  constructor(levelNumber: number, reason: string, context?: Record<string, unknown>)
}

/**
 * Error thrown when level data validation fails.
 */
class LevelValidationError extends GameError {
  readonly levelNumber: number;
  readonly validationErrors: string[];
  
  constructor(levelNumber: number, validationErrors: string[])
}

/**
 * Error thrown when localStorage operations fail.
 */
class StorageError extends GameError {
  readonly operation: 'read' | 'write' | 'delete';
  readonly key: string;
  
  constructor(operation: 'read' | 'write' | 'delete', key: string, originalError?: Error)
}

/**
 * Error thrown when audio operations fail.
 */
class AudioError extends GameError {
  readonly audioFile?: string;
  
  constructor(message: string, audioFile?: string, originalError?: Error)
}

/**
 * Error thrown when sprite/asset loading fails.
 */
class AssetLoadError extends GameError {
  readonly assetPath: string;
  readonly assetType: 'sprite' | 'audio' | 'other';
  
  constructor(assetPath: string, assetType: 'sprite' | 'audio' | 'other', originalError?: Error)
}

/**
 * Error thrown when game state becomes invalid.
 */
class InvalidStateError extends GameError {
  readonly stateName: string;
  
  constructor(stateName: string, reason: string)
}
```

### ErrorHandler

```typescript
/**
 * Global error handler for the game.
 * Provides centralized error logging, recovery, and user notification.
 */
class ErrorHandler {
  constructor(config?: Partial<ErrorHandlerConfig>)
  
  /**
   * Handles an error with appropriate logging and recovery.
   * 
   * @param error - The error to handle
   * @param severity - Severity level of the error
   * @param recoveryAction - Optional recovery function to attempt
   * @returns Result of recovery action, or undefined if no recovery
   */
  handle<T>(
    error: Error,
    severity?: ErrorSeverity,
    recoveryAction?: () => T
  ): T | undefined
  
  /**
   * Wraps a function with error handling.
   * Useful for wrapping event handlers and callbacks.
   * 
   * @param fn - Function to wrap
   * @param severity - Error severity if function throws
   * @param recoveryValue - Value to return if function throws
   * @returns Wrapped function that handles errors
   */
  wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    severity?: ErrorSeverity,
    recoveryValue?: ReturnType<T>
  ): T
  
  /**
   * Gets error statistics for debugging.
   */
  getErrorStats(): Record<string, number>
  
  /**
   * Clears error statistics.
   */
  clearErrorStats(): void
  
  /**
   * Updates error handler configuration.
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void
}

/**
 * Global error handler instance.
 * Can be configured at application startup.
 */
export const errorHandler: ErrorHandler
```

### Utility Functions

```typescript
/**
 * Utility function for safe async operations.
 * Wraps async functions with error handling.
 * 
 * @param fn - Async function to execute
 * @param severity - Error severity if function throws
 * @param defaultValue - Default value to return on error
 * @returns Promise resolving to function result or default value
 */
async function safeAsync<T>(
  fn: () => Promise<T>,
  severity?: ErrorSeverity,
  defaultValue?: T
): Promise<T | undefined>

/**
 * Utility function for safe synchronous operations.
 * Wraps functions with error handling.
 * 
 * @param fn - Function to execute
 * @param severity - Error severity if function throws
 * @param defaultValue - Default value to return on error
 * @returns Function result or default value
 */
function safe<T>(
  fn: () => T,
  severity?: ErrorSeverity,
  defaultValue?: T
): T | undefined
```

### Error Severity

```typescript
const ErrorSeverity = {
  /** Informational - no action needed */
  Info: 'info',
  /** Warning - degraded functionality but game continues */
  Warning: 'warning',
  /** Error - feature broken but game can continue */
  Error: 'error',
  /** Critical - game cannot continue */
  Critical: 'critical'
} as const;

type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];
```

### ErrorHandlerConfig

```typescript
interface ErrorHandlerConfig {
  /** Whether to log errors to console */
  logToConsole: boolean;
  /** Whether to show user-friendly error messages */
  showUserMessages: boolean;
  /** Custom error logger function */
  logger?: (error: GameError, severity: ErrorSeverity) => void;
  /** Custom user message handler */
  userMessageHandler?: (message: string, severity: ErrorSeverity) => void;
}
```

## Storage API

Functions for persisting game data (implementation in progress):

```typescript
// High score management
saveHighScore(score: number): void
loadHighScore(): number
resetHighScore(): void

// Audio settings
saveAudioSettings(settings: AudioSettings): void
loadAudioSettings(): AudioSettings
```

## Digging System API

Functions for managing hole creation and regeneration (implemented):

### updateDigging

```typescript
/**
 * Updates all active holes in the game state.
 * Decrements regeneration timers and regenerates holes when timers expire.
 * Returns a new state object with updated holes and tiles.
 * 
 * This function is called every frame during the game loop to manage hole lifecycle.
 * When a hole's timer expires, it restores the brick tile and eliminates any trapped enemies.
 * 
 * @param state - Current game state containing holes and tiles
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New game state with updated holes, tiles, and enemies
 * 
 * @example
 * const newState = updateDigging(currentState, 0.016); // ~60 FPS
 */
updateDigging(state: GameStateData, deltaTime: number): GameStateData
```

### digHole

```typescript
/**
 * Creates a hole in a brick tile at the specified direction from the player.
 * Returns a new state object with the hole added and tile changed to empty.
 * Does nothing if the target tile is not brick or if a hole already exists there.
 * 
 * The dig position is calculated diagonally down-left or down-right from the player's
 * current position. Only brick tiles can be dug - steel, ladder, rope, and other tiles
 * are indestructible.
 * 
 * @param state - Current game state
 * @param direction - Direction to dig ('left' or 'right')
 * @returns New game state with hole created (or unchanged if dig failed)
 * 
 * @example
 * // Player presses dig-left key
 * const newState = digHole(currentState, 'left');
 * 
 * @example
 * // Player presses dig-right key
 * const newState = digHole(currentState, 'right');
 */
digHole(state: GameStateData, direction: 'left' | 'right'): GameStateData
```

## Physics System API

Functions for physics simulation and collision detection (implemented):

### updatePhysics

```typescript
/**
 * Updates physics for all entities in the game state.
 * Applies gravity, processes movement, and resolves collisions.
 * 
 * @param state - Current game state
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New game state with updated entity positions
 */
updatePhysics(state: GameStateData, deltaTime: number): GameStateData
```

### getTileAt

```typescript
/**
 * Gets the tile type at a specific position.
 * Returns Empty if position is out of bounds.
 * 
 * @param pos - Position to check (in tile coordinates)
 * @param tiles - 2D array of tile types
 * @returns The tile type at the position, or Empty if out of bounds
 */
getTileAt(pos: Position, tiles: TileType[][]): TileType
```

### isSupported

```typescript
/**
 * Checks if an entity is supported by a tile below it.
 * Entities are supported by solid tiles (brick, steel), ladders, or ropes.
 * 
 * @param entity - Entity to check
 * @param tiles - 2D array of tile types
 * @returns true if entity is supported, false otherwise
 */
isSupported(entity: Entity, tiles: TileType[][]): boolean
```

### canMoveTo

```typescript
/**
 * Checks if an entity can move to a specific position.
 * Movement is blocked by solid tiles (brick, steel).
 * 
 * @param pos - Target position (in tile coordinates)
 * @param tiles - 2D array of tile types
 * @returns true if position is accessible, false otherwise
 */
canMoveTo(pos: Position, tiles: TileType[][]): boolean
```

## AI System API

Functions for enemy AI and pathfinding (implemented):

### updateAI

```typescript
/**
 * Updates AI for all enemies in the game state.
 * Calculates chase directions and moves enemies toward the player.
 * Returns a new state object with updated enemy positions and velocities.
 * 
 * This function is called every frame during the game loop. It processes each enemy:
 * - Trapped enemies remain stationary
 * - Active enemies calculate chase direction toward player
 * - Enemies move in the calculated direction
 * - Checks if enemies fell into holes and marks them as trapped
 * 
 * @param state - Current game state containing all entities
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New game state with updated enemy AI
 * 
 * @example
 * const newState = updateAI(currentState, 0.016); // ~60 FPS
 */
updateAI(state: GameStateData, deltaTime: number): GameStateData
```

### calculateChaseDirection

```typescript
/**
 * Calculates the direction an enemy should move to chase the player.
 * Uses Manhattan distance heuristic - prioritizes horizontal movement over vertical.
 * 
 * This implements classic Lode Runner AI behavior where enemies prefer to move
 * horizontally toward the player before attempting vertical movement.
 * 
 * @param enemy - Enemy entity calculating chase direction
 * @param player - Player entity to chase
 * @param tiles - Current tile grid for pathfinding (unused in simple AI)
 * @returns Direction vector { x: -1/0/1, y: -1/0/1 }
 * 
 * @example
 * // Enemy to the left of player
 * const dir = calculateChaseDirection(enemy, player, tiles);
 * // Returns { x: 1, y: 0 } to move right
 */
calculateChaseDirection(
  enemy: Enemy,
  player: Player,
  tiles: TileType[][]
): { x: number; y: number }
```

### moveEnemy

```typescript
/**
 * Moves an enemy in the specified direction.
 * Returns a new enemy object with updated velocity.
 * Does not mutate the input enemy object.
 * 
 * Validates that the target position is accessible before setting velocity.
 * If blocked by solid tiles, the enemy stops moving.
 * 
 * @param enemy - Enemy entity to move
 * @param direction - Direction vector { x: -1/0/1, y: -1/0/1 }
 * @param tiles - Current tile grid for collision checking
 * @param deltaTime - Time elapsed since last update (unused in velocity calculation)
 * @returns New enemy object with updated velocity
 * 
 * @example
 * const movedEnemy = moveEnemy(enemy, { x: 1, y: 0 }, tiles, deltaTime);
 */
moveEnemy(
  enemy: Enemy,
  direction: { x: number; y: number },
  tiles: TileType[][],
  deltaTime: number
): Enemy
```

### checkEnemyTrapped

```typescript
/**
 * Checks if an enemy has fallen into a hole and should be trapped.
 * Returns a new enemy object with isTrapped flag set if in a hole.
 * Does not mutate the input enemy object.
 * 
 * Trapped enemies cannot move and will be eliminated when the hole regenerates.
 * 
 * @param enemy - Enemy entity to check
 * @param holes - Array of all active holes
 * @returns New enemy object with updated trapped state
 * 
 * @example
 * const checkedEnemy = checkEnemyTrapped(enemy, state.holes);
 * if (checkedEnemy.isTrapped) {
 *   // Enemy is stuck in a hole
 * }
 */
checkEnemyTrapped(enemy: Enemy, holes: Hole[]): Enemy
```

## Game Rules API

Functions for game rules, win/loss conditions, and level progression (implemented):

### updateRules

```typescript
/**
 * Updates game rules and checks win/loss conditions.
 * Processes gold collection, player-enemy collisions, and level completion.
 * Returns a new state object with updated game state.
 * 
 * This function is called every frame during the game loop. It:
 * - Updates the level timer
 * - Checks for gold collection
 * - Checks for player-enemy collisions
 * - Checks for level completion
 * 
 * @param state - Current game state
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns New game state with updated rules
 * 
 * @example
 * const newState = updateRules(currentState, 0.016); // ~60 FPS
 */
updateRules(state: GameStateData, deltaTime: number): GameStateData
```

### checkGoldCollection

```typescript
/**
 * Checks if the player is on a gold tile and collects it.
 * Returns a new state object with gold removed, score increased, and gold count decremented.
 * Reveals the exit when all gold is collected.
 * 
 * @param state - Current game state
 * @returns New game state with gold collected (or unchanged if no gold)
 * 
 * @example
 * const newState = checkGoldCollection(currentState);
 * if (newState.goldRemaining === 0) {
 *   // All gold collected, exit revealed
 * }
 */
checkGoldCollection(state: GameStateData): GameStateData
```

### checkPlayerEnemyCollision

```typescript
/**
 * Checks if the player is colliding with any enemy.
 * Returns a new state object with player killed if collision detected.
 * 
 * Uses distance-based collision detection with COLLISION_THRESHOLD.
 * 
 * @param state - Current game state
 * @returns New game state with player killed (or unchanged)
 * 
 * @example
 * const newState = checkPlayerEnemyCollision(currentState);
 * if (newState.player.isDead) {
 *   // Player was killed by enemy
 * }
 */
checkPlayerEnemyCollision(state: GameStateData): GameStateData
```

### killPlayer

```typescript
/**
 * Kills the player and decrements lives.
 * Returns a new state object with player marked as dead and lives decremented.
 * Triggers game over state if lives reach 0.
 * 
 * @param state - Current game state
 * @returns New game state with player killed
 * 
 * @example
 * const newState = killPlayer(currentState);
 * if (newState.gameState === GameState.GameOver) {
 *   // Game over - no lives remaining
 * }
 */
killPlayer(state: GameStateData): GameStateData
```

### checkLevelCompletion

```typescript
/**
 * Checks if the player has reached the exit with all gold collected.
 * Returns a new state object with level completed if conditions are met.
 * 
 * Level completion requires:
 * - All gold collected (exitRevealed === true)
 * - Player on exit tile
 * 
 * @param state - Current game state
 * @returns New game state with level completed (or unchanged)
 * 
 * @example
 * const newState = checkLevelCompletion(currentState);
 * if (newState.currentLevel > currentState.currentLevel) {
 *   // Level completed, next level loaded
 * }
 */
checkLevelCompletion(state: GameStateData): GameStateData
```

### completeLevel

```typescript
/**
 * Completes the current level and loads the next one.
 * Returns a new state object with next level loaded and time bonus added to score.
 * Triggers victory state if all 100 levels completed.
 * 
 * Time bonus calculation:
 * bonus = max(0, (parTime - actualTime) * TIME_BONUS_MULTIPLIER)
 * 
 * @param state - Current game state
 * @returns New game state with next level loaded
 * 
 * @example
 * const newState = completeLevel(currentState);
 * if (newState.gameState === GameState.Victory) {
 *   // All 100 levels completed!
 * }
 */
completeLevel(state: GameStateData): GameStateData
```

### restartLevel

```typescript
/**
 * Restarts the current level from the beginning.
 * Returns a new state object with level reloaded.
 * Used when player dies with remaining lives.
 * 
 * @param state - Current game state
 * @returns New game state with level restarted
 * 
 * @example
 * const newState = restartLevel(currentState);
 * // Player and enemies back at start positions
 */
restartLevel(state: GameStateData): GameStateData
```

## Input API

Functions for handling user input (implementation in progress):

```typescript
// Initialize input handlers
initInput(): void

// Touch input (for mobile controls)
setTouchInput(direction: string, pressed: boolean): void
```

## Type Definitions
// High score management
saveHighScore(score: number): void
loadHighScore(): number
resetHighScore(): void

// Audio settings
saveAudioSettings(settings: AudioSettings): void
loadAudioSettings(): AudioSettings
```

## Input API

Functions for handling user input (implementation in progress):

```typescript
// Initialize input handlers
initInput(): void

// Touch input (for mobile controls)
setTouchInput(direction: string, pressed: boolean): void
```

## Type Definitions

### Enums

```typescript
// Tile types in the game world
enum TileType {
  Empty = 0,
  Brick = 1,
  Steel = 2,
  Ladder = 3,
  Rope = 4,
  Gold = 5,
  Exit = 6
}

// Game state
enum GameState {
  Menu = 0,
  Playing = 1,
  Paused = 2,
  GameOver = 3,
  Victory = 4
}
```

### Interfaces

```typescript
// Position in tile coordinates
interface Position {
  x: number;
  y: number;
}

// Base entity (player and enemies)
interface Entity {
  pos: Position;
  velocity: { x: number; y: number };
  animation: AnimationState;
  isOnGround: boolean;
  isOnLadder: boolean;
  isOnRope: boolean;
}

// Player state
interface Player extends Entity {
  lives: number;
  isDead: boolean;
  isDigging: boolean;
  digDirection: 'left' | 'right' | null;
}

// Enemy state
interface Enemy extends Entity {
  isTrapped: boolean;
  trapTimer: number;
}

// Dug hole
interface Hole {
  pos: Position;
  regenerationTimer: number;
  maxRegenTime: number;
}

// Level definition
interface Level {
  number: number;
  width: number;
  height: number;
  tiles: TileType[][];
  playerStart: Position;
  enemyStarts: Position[];
  parTime: number;
}

// Complete game state
interface GameStateData {
  currentLevel: number;
  score: number;
  highScore: number;
  lives: number;
  player: Player;
  enemies: Enemy[];
  tiles: TileType[][];
  holes: Hole[];
  goldRemaining: number;
  exitRevealed: boolean;
  levelTimer: number;
  gameState: GameState;
}

// Particle effect
interface Particle {
  pos: { x: number; y: number };
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
  color: string;
}

// Audio settings
interface AudioSettings {
  muted: boolean;
  volume: number;
}

// Input state
interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  digLeft: boolean;
  digRight: boolean;
  pause: boolean;
}

// Sprite sheet
interface SpriteSheet {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
}

// Animation definition
interface Animation {
  frames: number[];
  frameRate: number;
  loop: boolean;
}
```

### Classes

```typescript
/**
 * Manages entity animation state.
 */
class AnimationState {
  currentAnimation: string;
  currentFrame: number;
  frameTimer: number;
  
  constructor(initialAnimation: string = 'idle')
  
  /**
   * Updates the animation state based on elapsed time.
   */
  update(deltaTime: number, animations: Record<string, Animation>): void
  
  /**
   * Changes to a different animation.
   */
  setAnimation(name: string): void
}
```
