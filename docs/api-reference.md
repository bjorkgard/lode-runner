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
