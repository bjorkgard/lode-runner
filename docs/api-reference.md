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

Functions for persisting game data to localStorage (implemented):

### saveHighScore

```typescript
/**
 * Saves the high score to localStorage if it's higher than the current stored value.
 * Includes error handling for localStorage failures (quota exceeded, disabled, etc.).
 * 
 * @param score - The score to potentially save as the new high score
 * 
 * @example
 * saveHighScore(5000); // Saves if higher than current high score
 */
saveHighScore(score: number): void
```

### loadHighScore

```typescript
/**
 * Loads the high score from localStorage.
 * Returns 0 if no high score is stored or if loading fails.
 * 
 * @returns The stored high score, or 0 if not found or on error
 * 
 * @example
 * const highScore = loadHighScore(); // Returns stored value or 0
 */
loadHighScore(): number
```

### resetHighScore

```typescript
/**
 * Resets the high score by removing it from localStorage.
 * Includes error handling for localStorage failures.
 * 
 * @example
 * resetHighScore(); // Clears high score from storage
 */
resetHighScore(): void
```

### saveAudioSettings

```typescript
/**
 * Saves audio settings (muted state and volume) to localStorage.
 * Includes error handling for localStorage failures.
 * 
 * @param settings - The audio settings to persist
 * 
 * @example
 * saveAudioSettings({ muted: false, volume: 0.7 });
 */
saveAudioSettings(settings: AudioSettings): void
```

### loadAudioSettings

```typescript
/**
 * Loads audio settings from localStorage.
 * Returns default settings (unmuted, 70% volume) if not found or on error.
 * 
 * @returns The stored audio settings, or default settings if not found or on error
 * 
 * @example
 * const settings = loadAudioSettings(); // Returns stored or default settings
 */
loadAudioSettings(): AudioSettings
```

## Sprite System API

Functions for loading and managing sprite sheets and animations (implemented):

### loadSpriteSheet

```typescript
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
 * const playerSheet = await loadSpriteSheet('/assets/sprites/player.png', 16, 16);
 */
loadSpriteSheet(
  path: string,
  frameWidth: number,
  frameHeight: number
): Promise<SpriteSheet>
```

### loadSprites

```typescript
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
 * await loadSprites();
 * if (getSpriteSheets()) {
 *   // Sprites loaded successfully
 * } else {
 *   // Using fallback rendering
 * }
 */
loadSprites(): Promise<void>
```

### getSpriteSheets

```typescript
/**
 * Gets the currently loaded sprite sheets.
 * Returns null if sprites failed to load or haven't been loaded yet.
 * 
 * @returns The loaded sprite sheets, or null if unavailable
 * 
 * @example
 * const sheets = getSpriteSheets();
 * if (sheets) {
 *   renderSprite(ctx, sheets.player, 0, x, y);
 * } else {
 *   renderFallbackRect(ctx, x, y);
 * }
 */
getSpriteSheets(): SpriteSheets | null
```

### resetSpriteSheets

```typescript
/**
 * Resets the sprite sheets to null.
 * Useful for testing or forcing a reload.
 * 
 * @example
 * resetSpriteSheets();
 * await loadSprites(); // Reload sprites
 */
resetSpriteSheets(): void
```

### getAnimations

```typescript
/**
 * Gets animation definitions for a specific entity type.
 * 
 * @param entityType - Type of entity ('player' or 'enemy')
 * @returns Record of animation names to Animation definitions
 * 
 * @example
 * const playerAnims = getAnimations('player');
 * const runAnim = playerAnims.run;
 */
getAnimations(entityType: 'player' | 'enemy'): Record<string, Animation>
```

### ANIMATIONS

```typescript
/**
 * Collection of all animation definitions.
 * Organized by entity type (player, enemy).
 */
const ANIMATIONS: {
  player: {
    idle: Animation;
    run: Animation;
    climb: Animation;
    fall: Animation;
    dig: Animation;
  };
  enemy: {
    run: Animation;
    climb: Animation;
    fall: Animation;
    trapped: Animation;
  };
}
```

### SpriteSheets Interface

```typescript
/**
 * Collection of all loaded sprite sheets.
 * Null if sprites failed to load (triggers fallback rendering).
 */
interface SpriteSheets {
  player: SpriteSheet;
  enemy: SpriteSheet;
  tiles: SpriteSheet;
}
```

## Audio System API

Functions for managing sound effects and volume control (implemented):

### initAudio

```typescript
/**
 * Initializes the audio system by loading all sound effects and audio settings.
 * This should be called once at game startup.
 * Includes error handling for audio load failures - game continues without audio if loading fails.
 * 
 * @returns Promise that resolves when audio initialization is complete
 * 
 * @example
 * await initAudio();
 * // Audio system ready (or gracefully degraded if loading failed)
 */
initAudio(): Promise<void>
```

### playSound

```typescript
/**
 * Plays a sound effect by name.
 * Does nothing if audio is not loaded or if audio is muted.
 * Uses audio cloning to allow overlapping sounds.
 * 
 * @param soundName - Name of the sound to play ('dig', 'goldPickup', 'death', 'levelComplete', 'uiClick')
 * 
 * @example
 * playSound('dig'); // Plays dig sound effect
 * playSound('goldPickup'); // Plays gold collection sound
 */
playSound(soundName: 'dig' | 'goldPickup' | 'death' | 'levelComplete' | 'uiClick'): void
```

### setMuted

```typescript
/**
 * Sets the muted state of the audio system.
 * When muted, no sounds will play.
 * Persists the setting to localStorage.
 * 
 * @param muted - True to mute audio, false to unmute
 * 
 * @example
 * setMuted(true); // Mute all audio
 * setMuted(false); // Unmute audio
 */
setMuted(muted: boolean): void
```

### setVolume

```typescript
/**
 * Sets the volume level for all audio.
 * Volume is clamped to the range [0, 1].
 * Updates all loaded audio elements and persists the setting to localStorage.
 * 
 * @param volume - Volume level from 0.0 (silent) to 1.0 (full volume)
 * 
 * @example
 * setVolume(0.7); // Set volume to 70%
 * setVolume(0.0); // Silent (but not muted)
 * setVolume(1.0); // Full volume
 */
setVolume(volume: number): void
```

### toggleMute

```typescript
/**
 * Toggles the muted state of the audio system.
 * If currently muted, unmutes. If currently unmuted, mutes.
 * 
 * @example
 * toggleMute(); // Flip mute state
 */
toggleMute(): void
```

### getAudioSettings

```typescript
/**
 * Gets the current audio settings.
 * Useful for UI components that need to display current audio state.
 * 
 * @returns Current audio settings (muted state and volume)
 * 
 * @example
 * const settings = getAudioSettings();
 * console.log(`Muted: ${settings.muted}, Volume: ${settings.volume}`);
 */
getAudioSettings(): AudioSettings
```

## Input API

Functions for handling user input (implemented):

### initInput

```typescript
/**
 * Initializes the input system by attaching keyboard event listeners.
 * Should be called once during game initialization.
 * 
 * @example
 * initInput(); // Call once at game start
 */
initInput(): void
```

### handleKeyDown

```typescript
/**
 * Handles keyboard key down events.
 * Maps keyboard keys to input state flags and prevents default browser behavior.
 * 
 * Supported keys:
 * - Arrow keys / WASD: Directional movement
 * - Z/Q: Dig left
 * - X/E: Dig right
 * - P/Escape: Pause toggle
 * 
 * @param event - The keyboard event
 * 
 * @example
 * window.addEventListener('keydown', handleKeyDown);
 */
handleKeyDown(event: KeyboardEvent): void
```

### handleKeyUp

```typescript
/**
 * Handles keyboard key up events.
 * Clears input state flags when keys are released.
 * 
 * @param event - The keyboard event
 * 
 * @example
 * window.addEventListener('keyup', handleKeyUp);
 */
handleKeyUp(event: KeyboardEvent): void
```

### updateInput

```typescript
/**
 * Updates game state based on current input state.
 * Handles player movement, digging actions, and pause toggle.
 * Returns a new state object with input-driven changes applied.
 * 
 * Movement rules:
 * - Horizontal movement: Always applied when left/right pressed
 * - Vertical movement on ladders: Up/down keys move player vertically
 * - Digging: Only triggers on button press (not held)
 * - Pause: Only triggers on button press (not held)
 * 
 * @param state - Current game state
 * @param deltaTime - Time elapsed since last update (unused, for consistency)
 * @returns New game state with input applied
 * 
 * @example
 * const newState = updateInput(currentState, 0.016); // ~60 FPS
 */
updateInput(state: GameStateData, deltaTime: number): GameStateData
```

### setTouchInput

```typescript
/**
 * Sets touch input state for mobile controls.
 * Allows external components to simulate keyboard input via touch.
 * 
 * @param direction - The input direction to set ('left', 'right', 'up', 'down', 'digLeft', 'digRight')
 * @param pressed - Whether the input is pressed (true) or released (false)
 * 
 * @example
 * // Touch button pressed
 * setTouchInput('left', true);
 * 
 * // Touch button released
 * setTouchInput('left', false);
 */
setTouchInput(direction: string, pressed: boolean): void
```

### togglePause

```typescript
/**
 * Toggles the game pause state.
 * Transitions between Playing and Paused states.
 * Returns a new state object with updated game state.
 * 
 * @param state - Current game state
 * @returns New game state with pause toggled
 * 
 * @example
 * const newState = togglePause(currentState);
 */
togglePause(state: GameStateData): GameStateData
```

### getCurrentInput

```typescript
/**
 * Gets the current input state for testing purposes.
 * 
 * @returns Current input state
 * 
 * @example
 * const input = getCurrentInput();
 * console.log(input.left); // true if left key pressed
 */
getCurrentInput(): InputState
```

### resetInput

```typescript
/**
 * Resets the input state to all false values.
 * Useful for testing and cleanup.
 * 
 * @example
 * resetInput(); // Clears all input flags
 */
resetInput(): void
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

## Rendering System API

Functions for rendering the game using Canvas 2D API (implemented):

### renderGame

```typescript
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
 * 
 * @example
 * renderGame(gameState, canvasContext);
 */
renderGame(state: GameStateData, ctx: CanvasRenderingContext2D): void
```

### renderTiles

```typescript
/**
 * Renders all tiles in the level grid.
 * Skips empty tiles for performance.
 * Uses sprite sheets if available, otherwise falls back to colored rectangles.
 * 
 * @param tiles - 2D array of tile types defining the level layout
 * @param ctx - Canvas 2D rendering context
 * @param spriteSheets - Loaded sprite sheets, or null for fallback rendering
 * 
 * @example
 * renderTiles(state.tiles, ctx, getSpriteSheets());
 */
renderTiles(
  tiles: TileType[][],
  ctx: CanvasRenderingContext2D,
  spriteSheets: SpriteSheets | null
): void
```

### renderPlayer

```typescript
/**
 * Renders the player character using sprite animation.
 * Uses current animation state to determine which frame to display.
 * Falls back to colored rectangle if sprites are unavailable.
 * 
 * @param player - Player entity with position and animation state
 * @param ctx - Canvas 2D rendering context
 * @param spriteSheets - Loaded sprite sheets, or null for fallback rendering
 * 
 * @example
 * renderPlayer(state.player, ctx, getSpriteSheets());
 */
renderPlayer(
  player: Player,
  ctx: CanvasRenderingContext2D,
  spriteSheets: SpriteSheets | null
): void
```

### renderEnemy

```typescript
/**
 * Renders an enemy character using sprite animation.
 * Uses current animation state to determine which frame to display.
 * Falls back to colored rectangle if sprites are unavailable.
 * 
 * @param enemy - Enemy entity with position and animation state
 * @param ctx - Canvas 2D rendering context
 * @param spriteSheets - Loaded sprite sheets, or null for fallback rendering
 * 
 * @example
 * renderEnemy(enemy, ctx, getSpriteSheets());
 */
renderEnemy(
  enemy: Enemy,
  ctx: CanvasRenderingContext2D,
  spriteSheets: SpriteSheets | null
): void
```

### renderSprite

```typescript
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
 * 
 * @example
 * renderSprite(ctx, spriteSheet, 0, 100, 100);
 */
renderSprite(
  ctx: CanvasRenderingContext2D,
  sheet: SpriteSheet,
  frameIndex: number,
  x: number,
  y: number
): void
```

### renderHoles

```typescript
/**
 * Renders visual indication of holes and their regeneration progress.
 * Draws a semi-transparent brown overlay that becomes more opaque as the hole regenerates.
 * 
 * @param holes - Array of active holes with regeneration timers
 * @param ctx - Canvas 2D rendering context
 * 
 * @example
 * renderHoles(state.holes, ctx);
 */
renderHoles(holes: Hole[], ctx: CanvasRenderingContext2D): void
```

## Particle System API

Functions for creating and managing visual effects (implemented):

### initParticleSystem

```typescript
/**
 * Initializes the particle system by creating the object pool.
 * Should be called once at game startup before any particles are created.
 * 
 * Uses object pooling to avoid allocating/deallocating particles during gameplay,
 * which prevents garbage collection pauses and improves performance.
 * 
 * @example
 * initParticleSystem(); // Call once at game start
 */
initParticleSystem(): void
```

### createGoldParticles

```typescript
/**
 * Creates a burst of particles at the specified tile position.
 * Used for gold collection visual effect.
 * 
 * Particles are emitted in a radial burst pattern with random velocities.
 * Each particle has a random lifetime and fades out over time.
 * 
 * @param tilePos - Position in tile coordinates where particles should spawn
 * 
 * @example
 * createGoldParticles({ x: 5, y: 10 }); // Create particles at tile (5, 10)
 */
createGoldParticles(tilePos: Position): void
```

### updateParticles

```typescript
/**
 * Updates all active particles by advancing their positions and lifetimes.
 * Removes expired particles and returns them to the pool.
 * 
 * Should be called once per frame with the time elapsed since last frame.
 * 
 * @param deltaTime - Time elapsed since last update in seconds
 * 
 * @example
 * updateParticles(0.016); // ~60 FPS
 */
updateParticles(deltaTime: number): void
```

### renderParticles

```typescript
/**
 * Renders all active particles to the canvas context.
 * Particles fade out as they approach their maximum lifetime.
 * 
 * Should be called once per frame during the render phase.
 * 
 * @param ctx - Canvas 2D rendering context to draw particles on
 * 
 * @example
 * renderParticles(canvasContext);
 */
renderParticles(ctx: CanvasRenderingContext2D): void
```

### getActiveParticleCount

```typescript
/**
 * Gets the current number of active particles.
 * Useful for testing and debugging.
 * 
 * @returns Number of particles currently being updated and rendered
 * 
 * @example
 * const count = getActiveParticleCount();
 * console.log(`Active particles: ${count}`);
 */
getActiveParticleCount(): number
```

### getPoolSize

```typescript
/**
 * Gets the current number of particles available in the pool.
 * Useful for testing and debugging.
 * 
 * @returns Number of particles available for reuse
 * 
 * @example
 * const poolSize = getPoolSize();
 * console.log(`Pool size: ${poolSize}`);
 */
getPoolSize(): number
```

### clearParticles

```typescript
/**
 * Clears all active particles and returns them to the pool.
 * Useful for testing and level transitions.
 * 
 * @example
 * clearParticles(); // Clear all particles
 */
clearParticles(): void
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
