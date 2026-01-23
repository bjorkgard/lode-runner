# Design Document: Lode Runner Browser Game

## Overview

This design specifies a browser-based implementation of the classic Lode Runner game using React 19, TypeScript 5.9, and Canvas 2D rendering. The architecture separates concerns into distinct layers: game engine (pure TypeScript), rendering (Canvas 2D), UI components (React + Tailwind), and persistence (localStorage).

The game runs entirely client-side with no backend dependencies. The core game loop uses `requestAnimationFrame` for 60 FPS updates, with minimal React re-renders achieved through refs. The tile-based world system supports seven tile types with classic Lode Runner mechanics including digging, hole regeneration, gravity, and enemy AI.

Key design principles:
- **Separation of concerns**: Game logic independent of rendering and UI
- **Performance-first**: Minimize React renders, use object pooling, optimize canvas drawing
- **Data-driven**: Levels defined in structured format, easily extensible
- **Mobile-friendly**: Touch controls with responsive design
- **Persistent state**: High scores and settings saved to localStorage

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React App Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │
│  │   Menu   │  │   HUD    │  │  MobileControls     │  │
│  └──────────┘  └──────────┘  └─────────────────────┘  │
│         │            │                  │               │
│         └────────────┴──────────────────┘               │
│                      │                                   │
│              ┌───────▼────────┐                         │
│              │  CanvasGame    │                         │
│              │  (Component)   │                         │
│              └───────┬────────┘                         │
└──────────────────────┼──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Game Engine Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  State   │  │  Rules   │  │ Physics  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Digging  │  │    AI    │  │  Levels  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Rendering & Effects Layer                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Render  │  │ Sprites  │  │Particles │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Input   │  │  Audio   │  │ Storage  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**React App Layer**:
- `App.tsx`: Root component managing game state enum (Menu, Playing, Paused, GameOver)
- `Menu.tsx`: Start menu, pause menu, game over screen (Tailwind CSS)
- `HUD.tsx`: Displays score, lives, level, timer, mute button (Tailwind CSS)
- `MobileControls.tsx`: Touch controls overlay (shown only on touch devices)
- `CanvasGame.tsx`: Canvas wrapper component, initializes game engine, handles resize

**Game Engine Layer** (Pure TypeScript):
- `engine.ts`: Main game loop using requestAnimationFrame, orchestrates all systems
- `state.ts`: Game state management (player position, enemies, tiles, score, lives)
- `rules.ts`: Game rules (win conditions, death conditions, level completion)
- `physics.ts`: Movement, gravity, collision detection
- `digging.ts`: Hole creation, regeneration timers
- `ai.ts`: Enemy pathfinding and behavior
- `levels.ts`: Level data (100 levels) and parsing

**Rendering & Effects Layer**:
- `render.ts`: Canvas 2D rendering, sprite drawing, camera
- `sprites.ts`: Sprite sheet loading, animation management
- `particles.ts`: Particle system for gold pickup effects

**Infrastructure Layer**:
- `input.ts`: Keyboard and touch input handling
- `audio.ts`: Sound effect playback, volume control
- `storage.ts`: localStorage persistence for scores and settings

## Components and Interfaces

### Core Types

```typescript
// game/types.ts

enum TileType {
  Empty = 0,
  Brick = 1,
  Steel = 2,
  Ladder = 3,
  Rope = 4,
  Gold = 5,
  Exit = 6
}

enum GameState {
  Menu,
  Playing,
  Paused,
  GameOver,
  Victory
}

interface Position {
  x: number;  // Tile coordinates
  y: number;
}

interface Entity {
  pos: Position;
  velocity: { x: number; y: number };
  animation: AnimationState;
  isOnGround: boolean;
  isOnLadder: boolean;
  isOnRope: boolean;
}

interface Player extends Entity {
  lives: number;
  isDead: boolean;
  isDigging: boolean;
  digDirection: 'left' | 'right' | null;
}

interface Enemy extends Entity {
  isTrapped: boolean;
  trapTimer: number;
}

interface Hole {
  pos: Position;
  regenerationTimer: number;
  maxRegenTime: number;
}

interface Level {
  number: number;
  width: number;
  height: number;
  tiles: TileType[][];
  playerStart: Position;
  enemyStarts: Position[];
  parTime: number;  // For time bonus calculation
}

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

interface Particle {
  pos: { x: number; y: number };  // Pixel coordinates
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
  color: string;
}
```

### Game Engine Interface

```typescript
// game/engine.ts

class GameEngine {
  private state: GameStateData;
  private lastFrameTime: number;
  private animationFrameId: number | null;
  
  constructor(canvas: HTMLCanvasElement) {
    // Initialize all systems
  }
  
  start(): void {
    // Start game loop
    this.lastFrameTime = performance.now();
    this.loop();
  }
  
  stop(): void {
    // Stop game loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
  
  private loop(): void {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }
  
  private update(deltaTime: number): void {
    if (this.state.gameState !== GameState.Playing) return;
    
    // Update all game systems
    updateInput(this.state, deltaTime);
    updatePhysics(this.state, deltaTime);
    updateDigging(this.state, deltaTime);
    updateAI(this.state, deltaTime);
    updateRules(this.state, deltaTime);
    updateParticles(deltaTime);
  }
  
  private render(): void {
    renderGame(this.state);
  }
  
  // Public methods for UI interaction
  newGame(): void { /* ... */ }
  pauseGame(): void { /* ... */ }
  resumeGame(): void { /* ... */ }
  resetHighScore(): void { /* ... */ }
}
```

### Physics System

```typescript
// game/physics.ts

function updatePhysics(state: GameStateData, deltaTime: number): void {
  updatePlayerPhysics(state.player, state.tiles, deltaTime);
  
  for (const enemy of state.enemies) {
    updateEnemyPhysics(enemy, state.tiles, deltaTime);
  }
}

function updatePlayerPhysics(player: Player, tiles: TileType[][], deltaTime: number): void {
  // Apply gravity if not supported
  if (!isSupported(player, tiles)) {
    player.velocity.y += GRAVITY * deltaTime;
  } else {
    player.velocity.y = 0;
    player.isOnGround = true;
  }
  
  // Apply velocity
  player.pos.x += player.velocity.x * deltaTime;
  player.pos.y += player.velocity.y * deltaTime;
  
  // Collision detection and resolution
  resolveCollisions(player, tiles);
  
  // Update state flags
  player.isOnLadder = getTileAt(player.pos, tiles) === TileType.Ladder;
  player.isOnRope = getTileAt(player.pos, tiles) === TileType.Rope;
}

function isSupported(entity: Entity, tiles: TileType[][]): boolean {
  const belowPos = { x: entity.pos.x, y: entity.pos.y + 1 };
  const tileBelow = getTileAt(belowPos, tiles);
  
  // Supported by solid tile, ladder, or rope
  return tileBelow === TileType.Brick ||
         tileBelow === TileType.Steel ||
         tileBelow === TileType.Ladder ||
         entity.isOnRope;
}

function resolveCollisions(entity: Entity, tiles: TileType[][]): void {
  // Tile-based collision detection
  const tileX = Math.floor(entity.pos.x);
  const tileY = Math.floor(entity.pos.y);
  
  const tile = getTileAt({ x: tileX, y: tileY }, tiles);
  
  // Can't move through solid tiles
  if (tile === TileType.Brick || tile === TileType.Steel) {
    // Push entity back to previous valid position
    // Implementation details...
  }
}
```

### Digging System

```typescript
// game/digging.ts

function updateDigging(state: GameStateData, deltaTime: number): void {
  // Update hole regeneration timers
  for (let i = state.holes.length - 1; i >= 0; i--) {
    const hole = state.holes[i];
    hole.regenerationTimer -= deltaTime;
    
    if (hole.regenerationTimer <= 0) {
      regenerateHole(state, hole, i);
    }
  }
}

function digHole(state: GameStateData, direction: 'left' | 'right'): void {
  const player = state.player;
  const digPos = {
    x: player.pos.x + (direction === 'left' ? -1 : 1),
    y: player.pos.y + 1
  };
  
  // Check if can dig
  const tile = getTileAt(digPos, state.tiles);
  if (tile !== TileType.Brick) return;
  
  // Check if already a hole here
  if (state.holes.some(h => h.pos.x === digPos.x && h.pos.y === digPos.y)) return;
  
  // Create hole
  state.tiles[digPos.y][digPos.x] = TileType.Empty;
  state.holes.push({
    pos: digPos,
    regenerationTimer: HOLE_REGEN_TIME,
    maxRegenTime: HOLE_REGEN_TIME
  });
  
  playSound('dig');
  player.isDigging = true;
  player.digDirection = direction;
}

function regenerateHole(state: GameStateData, hole: Hole, index: number): void {
  // Restore brick tile
  state.tiles[hole.pos.y][hole.pos.x] = TileType.Brick;
  
  // Check if enemy is trapped in hole
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    if (Math.floor(enemy.pos.x) === hole.pos.x && 
        Math.floor(enemy.pos.y) === hole.pos.y) {
      // Eliminate trapped enemy
      state.enemies.splice(i, 1);
    }
  }
  
  // Remove hole
  state.holes.splice(index, 1);
}
```

### Enemy AI System

```typescript
// game/ai.ts

function updateAI(state: GameStateData, deltaTime: number): void {
  for (const enemy of state.enemies) {
    if (enemy.isTrapped) {
      // Trapped enemies can't move
      continue;
    }
    
    // Simple chase AI using Manhattan distance heuristic
    const direction = calculateChaseDirection(enemy, state.player, state.tiles);
    moveEnemy(enemy, direction, state.tiles, deltaTime);
    
    // Check if enemy fell into hole
    checkEnemyTrapped(enemy, state.holes);
  }
}

function calculateChaseDirection(
  enemy: Enemy, 
  player: Player, 
  tiles: TileType[][]
): { x: number; y: number } {
  const dx = player.pos.x - enemy.pos.x;
  const dy = player.pos.y - enemy.pos.y;
  
  // Prioritize horizontal movement
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: Math.sign(dx), y: 0 };
  } else {
    return { x: 0, y: Math.sign(dy) };
  }
}

function moveEnemy(
  enemy: Enemy, 
  direction: { x: number; y: number }, 
  tiles: TileType[][], 
  deltaTime: number
): void {
  const targetPos = {
    x: enemy.pos.x + direction.x,
    y: enemy.pos.y + direction.y
  };
  
  // Check if move is valid
  if (canMoveTo(targetPos, tiles)) {
    enemy.velocity.x = direction.x * ENEMY_SPEED;
    enemy.velocity.y = direction.y * ENEMY_SPEED;
  }
}

function checkEnemyTrapped(enemy: Enemy, holes: Hole[]): void {
  const enemyTilePos = {
    x: Math.floor(enemy.pos.x),
    y: Math.floor(enemy.pos.y)
  };
  
  for (const hole of holes) {
    if (hole.pos.x === enemyTilePos.x && hole.pos.y === enemyTilePos.y) {
      enemy.isTrapped = true;
      enemy.velocity.x = 0;
      enemy.velocity.y = 0;
      break;
    }
  }
}
```

### Rules System

```typescript
// game/rules.ts

function updateRules(state: GameStateData, deltaTime: number): void {
  // Update level timer
  state.levelTimer += deltaTime;
  
  // Check gold collection
  checkGoldCollection(state);
  
  // Check player-enemy collision
  checkPlayerEnemyCollision(state);
  
  // Check level completion
  checkLevelCompletion(state);
}

function checkGoldCollection(state: GameStateData): void {
  const playerTilePos = {
    x: Math.floor(state.player.pos.x),
    y: Math.floor(state.player.pos.y)
  };
  
  const tile = state.tiles[playerTilePos.y][playerTilePos.x];
  
  if (tile === TileType.Gold) {
    // Collect gold
    state.tiles[playerTilePos.y][playerTilePos.x] = TileType.Empty;
    state.goldRemaining--;
    state.score += GOLD_POINTS;
    
    playSound('goldPickup');
    createGoldParticles(playerTilePos);
    
    // Reveal exit if all gold collected
    if (state.goldRemaining === 0) {
      state.exitRevealed = true;
    }
  }
}

function checkPlayerEnemyCollision(state: GameStateData): void {
  const player = state.player;
  
  for (const enemy of state.enemies) {
    const distance = Math.sqrt(
      Math.pow(player.pos.x - enemy.pos.x, 2) +
      Math.pow(player.pos.y - enemy.pos.y, 2)
    );
    
    if (distance < COLLISION_THRESHOLD) {
      killPlayer(state);
      break;
    }
  }
}

function killPlayer(state: GameStateData): void {
  state.player.isDead = true;
  state.lives--;
  
  playSound('death');
  
  if (state.lives > 0) {
    // Restart level
    setTimeout(() => restartLevel(state), 2000);
  } else {
    // Game over
    state.gameState = GameState.GameOver;
    saveHighScore(state.score);
  }
}

function checkLevelCompletion(state: GameStateData): void {
  if (!state.exitRevealed) return;
  
  const playerTilePos = {
    x: Math.floor(state.player.pos.x),
    y: Math.floor(state.player.pos.y)
  };
  
  const tile = state.tiles[playerTilePos.y][playerTilePos.x];
  
  if (tile === TileType.Exit) {
    completeLevel(state);
  }
}

function completeLevel(state: GameStateData): void {
  // Calculate time bonus
  const level = getLevel(state.currentLevel);
  const timeBonus = Math.max(0, (level.parTime - state.levelTimer) * TIME_BONUS_MULTIPLIER);
  state.score += timeBonus;
  
  playSound('levelComplete');
  
  // Load next level
  if (state.currentLevel < MAX_LEVELS) {
    state.currentLevel++;
    loadLevel(state, state.currentLevel);
  } else {
    // Victory!
    state.gameState = GameState.Victory;
  }
}
```

## Data Models

### Level Data Format

Levels are stored as a structured array of level definitions. Each level specifies dimensions, tile layout, spawn points, and par time.

```typescript
// game/levels.ts

const LEVELS: Level[] = [
  {
    number: 1,
    width: 28,
    height: 16,
    tiles: [
      // 2D array of TileType values
      // Example row: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 14 },
    enemyStarts: [
      { x: 10, y: 5 },
      { x: 20, y: 8 }
    ],
    parTime: 60  // seconds
  },
  // ... 99 more levels
];

function loadLevel(state: GameStateData, levelNumber: number): void {
  const level = LEVELS[levelNumber - 1];
  
  state.currentLevel = levelNumber;
  state.tiles = JSON.parse(JSON.stringify(level.tiles)); // Deep copy
  state.player.pos = { ...level.playerStart };
  state.enemies = level.enemyStarts.map(pos => createEnemy(pos));
  state.holes = [];
  state.goldRemaining = countGold(level.tiles);
  state.exitRevealed = false;
  state.levelTimer = 0;
}

function countGold(tiles: TileType[][]): number {
  let count = 0;
  for (const row of tiles) {
    for (const tile of row) {
      if (tile === TileType.Gold) count++;
    }
  }
  return count;
}
```

### Sprite and Animation Data

```typescript
// game/sprites.ts

interface SpriteSheet {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
}

interface Animation {
  frames: number[];  // Frame indices
  frameRate: number; // Frames per second
  loop: boolean;
}

const ANIMATIONS = {
  player: {
    idle: { frames: [0], frameRate: 1, loop: true },
    run: { frames: [1, 2, 3, 4], frameRate: 10, loop: true },
    climb: { frames: [5, 6], frameRate: 8, loop: true },
    fall: { frames: [7], frameRate: 1, loop: true },
    dig: { frames: [8, 9], frameRate: 12, loop: false }
  },
  enemy: {
    run: { frames: [0, 1, 2, 3], frameRate: 8, loop: true },
    climb: { frames: [4, 5], frameRate: 8, loop: true },
    fall: { frames: [6], frameRate: 1, loop: true },
    trapped: { frames: [7, 8], frameRate: 4, loop: true }
  }
};

class AnimationState {
  currentAnimation: string;
  currentFrame: number;
  frameTimer: number;
  
  update(deltaTime: number, animations: Record<string, Animation>): void {
    const anim = animations[this.currentAnimation];
    this.frameTimer += deltaTime;
    
    if (this.frameTimer >= 1 / anim.frameRate) {
      this.frameTimer = 0;
      this.currentFrame++;
      
      if (this.currentFrame >= anim.frames.length) {
        if (anim.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = anim.frames.length - 1;
        }
      }
    }
  }
  
  setAnimation(name: string): void {
    if (this.currentAnimation !== name) {
      this.currentAnimation = name;
      this.currentFrame = 0;
      this.frameTimer = 0;
    }
  }
}
```

### Storage Schema

```typescript
// game/storage.ts

const STORAGE_VERSION = 1;
const STORAGE_KEYS = {
  highScore: `loderunner_highscore_v${STORAGE_VERSION}`,
  audioSettings: `loderunner_audio_v${STORAGE_VERSION}`,
  currentLevel: `loderunner_level_v${STORAGE_VERSION}`
};

interface AudioSettings {
  muted: boolean;
  volume: number; // 0.0 to 1.0
}

function saveHighScore(score: number): void {
  try {
    const currentHigh = loadHighScore();
    if (score > currentHigh) {
      localStorage.setItem(STORAGE_KEYS.highScore, score.toString());
    }
  } catch (error) {
    console.error('Failed to save high score:', error);
  }
}

function loadHighScore(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.highScore);
    return stored ? parseInt(stored, 10) : 0;
  } catch (error) {
    console.error('Failed to load high score:', error);
    return 0;
  }
}

function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.audioSettings, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save audio settings:', error);
  }
}

function loadAudioSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.audioSettings);
    return stored ? JSON.parse(stored) : { muted: false, volume: 0.7 };
  } catch (error) {
    console.error('Failed to load audio settings:', error);
    return { muted: false, volume: 0.7 };
  }
}

function resetHighScore(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.highScore);
  } catch (error) {
    console.error('Failed to reset high score:', error);
  }
}
```

### Particle System Data

```typescript
// game/particles.ts

const PARTICLE_POOL_SIZE = 100;
let particlePool: Particle[] = [];
let activeParticles: Particle[] = [];

function initParticleSystem(): void {
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    particlePool.push({
      pos: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      life: 0,
      maxLife: 1,
      color: '#FFD700'
    });
  }
}

function createGoldParticles(tilePos: Position): void {
  const pixelPos = {
    x: tilePos.x * TILE_SIZE + TILE_SIZE / 2,
    y: tilePos.y * TILE_SIZE + TILE_SIZE / 2
  };
  
  // Create burst of 8-12 particles
  const count = 8 + Math.floor(Math.random() * 5);
  
  for (let i = 0; i < count; i++) {
    const particle = particlePool.pop();
    if (!particle) break;
    
    const angle = (Math.PI * 2 * i) / count;
    const speed = 50 + Math.random() * 50;
    
    particle.pos = { ...pixelPos };
    particle.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
    particle.life = 0;
    particle.maxLife = 0.5 + Math.random() * 0.5;
    particle.color = '#FFD700';
    
    activeParticles.push(particle);
  }
}

function updateParticles(deltaTime: number): void {
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const particle = activeParticles[i];
    
    particle.pos.x += particle.velocity.x * deltaTime;
    particle.pos.y += particle.velocity.y * deltaTime;
    particle.life += deltaTime;
    
    if (particle.life >= particle.maxLife) {
      // Return to pool
      activeParticles.splice(i, 1);
      particlePool.push(particle);
    }
  }
}

function renderParticles(ctx: CanvasRenderingContext2D): void {
  for (const particle of activeParticles) {
    const alpha = 1 - (particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(particle.pos.x - 2, particle.pos.y - 2, 4, 4);
  }
  ctx.globalAlpha = 1;
}
```

### Rendering System

```typescript
// game/render.ts

const TILE_SIZE = 16; // pixels
let spriteSheets: {
  player: SpriteSheet;
  enemy: SpriteSheet;
  tiles: SpriteSheet;
} | null = null;

async function loadSprites(): Promise<void> {
  spriteSheets = {
    player: await loadSpriteSheet('/assets/sprites/player.png', 16, 16),
    enemy: await loadSpriteSheet('/assets/sprites/enemy.png', 16, 16),
    tiles: await loadSpriteSheet('/assets/sprites/tiles.png', 16, 16)
  };
}

function loadSpriteSheet(
  path: string, 
  frameWidth: number, 
  frameHeight: number
): Promise<SpriteSheet> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ image: img, frameWidth, frameHeight });
    img.onerror = reject;
    img.src = path;
  });
}

function renderGame(state: GameStateData, ctx: CanvasRenderingContext2D): void {
  if (!spriteSheets) return;
  
  // Disable image smoothing for pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;
  
  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Render tiles
  renderTiles(state.tiles, ctx);
  
  // Render holes (visual indication)
  renderHoles(state.holes, ctx);
  
  // Render gold particles
  renderParticles(ctx);
  
  // Render enemies
  for (const enemy of state.enemies) {
    renderEnemy(enemy, ctx);
  }
  
  // Render player
  renderPlayer(state.player, ctx);
}

function renderTiles(tiles: TileType[][], ctx: CanvasRenderingContext2D): void {
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const tile = tiles[y][x];
      if (tile === TileType.Empty) continue;
      
      renderSprite(
        ctx,
        spriteSheets!.tiles,
        tile, // Frame index matches tile type
        x * TILE_SIZE,
        y * TILE_SIZE
      );
    }
  }
}

function renderPlayer(player: Player, ctx: CanvasRenderingContext2D): void {
  const anim = ANIMATIONS.player[player.animation.currentAnimation];
  const frameIndex = anim.frames[player.animation.currentFrame];
  
  renderSprite(
    ctx,
    spriteSheets!.player,
    frameIndex,
    player.pos.x * TILE_SIZE,
    player.pos.y * TILE_SIZE
  );
}

function renderEnemy(enemy: Enemy, ctx: CanvasRenderingContext2D): void {
  const anim = ANIMATIONS.enemy[enemy.animation.currentAnimation];
  const frameIndex = anim.frames[enemy.animation.currentFrame];
  
  renderSprite(
    ctx,
    spriteSheets!.enemy,
    frameIndex,
    enemy.pos.x * TILE_SIZE,
    enemy.pos.y * TILE_SIZE
  );
}

function renderSprite(
  ctx: CanvasRenderingContext2D,
  sheet: SpriteSheet,
  frameIndex: number,
  x: number,
  y: number
): void {
  const framesPerRow = Math.floor(sheet.image.width / sheet.frameWidth);
  const srcX = (frameIndex % framesPerRow) * sheet.frameWidth;
  const srcY = Math.floor(frameIndex / framesPerRow) * sheet.frameHeight;
  
  ctx.drawImage(
    sheet.image,
    srcX, srcY, sheet.frameWidth, sheet.frameHeight,
    x, y, TILE_SIZE, TILE_SIZE
  );
}

function renderHoles(holes: Hole[], ctx: CanvasRenderingContext2D): void {
  for (const hole of holes) {
    // Visual indication of hole regeneration progress
    const progress = 1 - (hole.regenerationTimer / hole.maxRegenTime);
    ctx.fillStyle = `rgba(139, 69, 19, ${progress * 0.5})`;
    ctx.fillRect(
      hole.pos.x * TILE_SIZE,
      hole.pos.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}
```

### Input System

```typescript
// game/input.ts

interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  digLeft: boolean;
  digRight: boolean;
  pause: boolean;
}

let currentInput: InputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  digLeft: false,
  digRight: false,
  pause: false
};

let previousInput: InputState = { ...currentInput };

function initInput(): void {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}

function handleKeyDown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      currentInput.left = true;
      event.preventDefault();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      currentInput.right = true;
      event.preventDefault();
      break;
    case 'ArrowUp':
    case 'w':
    case 'W':
      currentInput.up = true;
      event.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      currentInput.down = true;
      event.preventDefault();
      break;
    case 'z':
    case 'Z':
    case 'q':
    case 'Q':
      currentInput.digLeft = true;
      event.preventDefault();
      break;
    case 'x':
    case 'X':
    case 'e':
    case 'E':
      currentInput.digRight = true;
      event.preventDefault();
      break;
    case 'p':
    case 'P':
    case 'Escape':
      currentInput.pause = true;
      event.preventDefault();
      break;
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      currentInput.left = false;
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      currentInput.right = false;
      break;
    case 'ArrowUp':
    case 'w':
    case 'W':
      currentInput.up = false;
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      currentInput.down = false;
      break;
    case 'z':
    case 'Z':
    case 'q':
    case 'Q':
      currentInput.digLeft = false;
      break;
    case 'x':
    case 'X':
    case 'e':
    case 'E':
      currentInput.digRight = false;
      break;
    case 'p':
    case 'P':
    case 'Escape':
      currentInput.pause = false;
      break;
  }
}

function updateInput(state: GameStateData, deltaTime: number): void {
  // Handle movement
  if (currentInput.left) {
    state.player.velocity.x = -PLAYER_SPEED;
  } else if (currentInput.right) {
    state.player.velocity.x = PLAYER_SPEED;
  } else {
    state.player.velocity.x = 0;
  }
  
  // Handle vertical movement on ladders/ropes
  if (state.player.isOnLadder) {
    if (currentInput.up) {
      state.player.velocity.y = -PLAYER_SPEED;
    } else if (currentInput.down) {
      state.player.velocity.y = PLAYER_SPEED;
    } else {
      state.player.velocity.y = 0;
    }
  }
  
  // Handle digging (only on button press, not hold)
  if (currentInput.digLeft && !previousInput.digLeft) {
    digHole(state, 'left');
  }
  if (currentInput.digRight && !previousInput.digRight) {
    digHole(state, 'right');
  }
  
  // Handle pause (only on button press)
  if (currentInput.pause && !previousInput.pause) {
    togglePause(state);
  }
  
  // Update previous input
  previousInput = { ...currentInput };
}

// Touch input for mobile
function setTouchInput(direction: string, pressed: boolean): void {
  switch (direction) {
    case 'left': currentInput.left = pressed; break;
    case 'right': currentInput.right = pressed; break;
    case 'up': currentInput.up = pressed; break;
    case 'down': currentInput.down = pressed; break;
    case 'digLeft': currentInput.digLeft = pressed; break;
    case 'digRight': currentInput.digRight = pressed; break;
  }
}
```

### Audio System

```typescript
// game/audio.ts

interface AudioAssets {
  dig: HTMLAudioElement;
  goldPickup: HTMLAudioElement;
  death: HTMLAudioElement;
  levelComplete: HTMLAudioElement;
  uiClick: HTMLAudioElement;
}

let audioAssets: AudioAssets | null = null;
let audioSettings: AudioSettings = { muted: false, volume: 0.7 };

async function initAudio(): Promise<void> {
  audioSettings = loadAudioSettings();
  
  try {
    audioAssets = {
      dig: await loadAudio('/assets/sfx/dig.mp3'),
      goldPickup: await loadAudio('/assets/sfx/gold.mp3'),
      death: await loadAudio('/assets/sfx/death.mp3'),
      levelComplete: await loadAudio('/assets/sfx/complete.mp3'),
      uiClick: await loadAudio('/assets/sfx/click.mp3')
    };
    
    // Set initial volume
    for (const audio of Object.values(audioAssets)) {
      audio.volume = audioSettings.volume;
    }
  } catch (error) {
    console.error('Failed to load audio assets:', error);
  }
}

function loadAudio(path: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = reject;
    audio.src = path;
    audio.load();
  });
}

function playSound(soundName: keyof AudioAssets): void {
  if (!audioAssets || audioSettings.muted) return;
  
  const audio = audioAssets[soundName];
  
  // Clone audio for overlapping sounds
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = audioSettings.volume;
  clone.play().catch(error => {
    console.error(`Failed to play sound ${soundName}:`, error);
  });
}

function setMuted(muted: boolean): void {
  audioSettings.muted = muted;
  saveAudioSettings(audioSettings);
}

function setVolume(volume: number): void {
  audioSettings.volume = Math.max(0, Math.min(1, volume));
  
  if (audioAssets) {
    for (const audio of Object.values(audioAssets)) {
      audio.volume = audioSettings.volume;
    }
  }
  
  saveAudioSettings(audioSettings);
}

function toggleMute(): void {
  setMuted(!audioSettings.muted);
}
```

### React Component Integration

```typescript
// components/CanvasGame.tsx

import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';

interface CanvasGameProps {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onGameStateChange: (state: GameState) => void;
}

export function CanvasGame({
  onScoreChange,
  onLivesChange,
  onLevelChange,
  onGameStateChange
}: CanvasGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize game engine
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    
    // Set up callbacks
    engine.onScoreChange = onScoreChange;
    engine.onLivesChange = onLivesChange;
    engine.onLevelChange = onLevelChange;
    engine.onGameStateChange = onGameStateChange;
    
    // Start game loop
    engine.start();
    
    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        resizeCanvas(canvasRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [onScoreChange, onLivesChange, onLevelChange, onGameStateChange]);
  
  return (
    <canvas
      ref={canvasRef}
      className="border-2 border-gray-700 bg-black"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const aspectRatio = 28 / 16; // Game world aspect ratio
  const maxWidth = window.innerWidth - 40;
  const maxHeight = window.innerHeight - 200; // Leave room for HUD
  
  let width = maxWidth;
  let height = width / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  canvas.width = width;
  canvas.height = height;
}
```

```typescript
// components/MobileControls.tsx

import { useState, useEffect } from 'react';

interface MobileControlsProps {
  onInput: (direction: string, pressed: boolean) => void;
}

export function MobileControls({ onInput }: MobileControlsProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);
  
  if (!isTouchDevice) return null;
  
  const handleTouchStart = (direction: string) => {
    onInput(direction, true);
  };
  
  const handleTouchEnd = (direction: string) => {
    onInput(direction, false);
  };
  
  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-between px-4">
      {/* D-pad */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-32 h-32">
        <div />
        <button
          onTouchStart={() => handleTouchStart('up')}
          onTouchEnd={() => handleTouchEnd('up')}
          className="bg-gray-700 rounded active:bg-gray-600"
        >
          ↑
        </button>
        <div />
        <button
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={() => handleTouchEnd('left')}
          className="bg-gray-700 rounded active:bg-gray-600"
        >
          ←
        </button>
        <div />
        <button
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={() => handleTouchEnd('right')}
          className="bg-gray-700 rounded active:bg-gray-600"
        >
          →
        </button>
        <div />
        <button
          onTouchStart={() => handleTouchStart('down')}
          onTouchEnd={() => handleTouchEnd('down')}
          className="bg-gray-700 rounded active:bg-gray-600"
        >
          ↓
        </button>
        <div />
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onTouchStart={() => handleTouchStart('digLeft')}
          onTouchEnd={() => handleTouchEnd('digLeft')}
          className="w-16 h-16 bg-red-700 rounded-full active:bg-red-600"
        >
          DIG L
        </button>
        <button
          onTouchStart={() => handleTouchStart('digRight')}
          onTouchEnd={() => handleTouchEnd('digRight')}
          className="w-16 h-16 bg-red-700 rounded-full active:bg-red-600"
        >
          DIG R
        </button>
      </div>
    </div>
  );
}
```

```typescript
// components/HUD.tsx

interface HUDProps {
  level: number;
  score: number;
  highScore: number;
  lives: number;
  timer: number;
  muted: boolean;
  onToggleMute: () => void;
}

export function HUD({
  level,
  score,
  highScore,
  lives,
  timer,
  muted,
  onToggleMute
}: HUDProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex gap-6">
        <div>Level: <span className="font-bold">{level}</span></div>
        <div>Score: <span className="font-bold">{score}</span></div>
        <div>High: <span className="font-bold">{highScore}</span></div>
      </div>
      
      <div className="flex gap-6 items-center">
        <div>Time: <span className="font-bold">{formatTime(timer)}</span></div>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < lives ? 'text-red-500' : 'text-gray-600'}>
              ♥
            </span>
          ))}
        </div>
        <button
          onClick={onToggleMute}
          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}
```

```typescript
// components/Menu.tsx

interface MenuProps {
  gameState: GameState;
  finalScore?: number;
  onNewGame: () => void;
  onContinue?: () => void;
  onResetHighScore: () => void;
  onResume?: () => void;
  onQuit?: () => void;
}

export function Menu({
  gameState,
  finalScore,
  onNewGame,
  onContinue,
  onResetHighScore,
  onResume,
  onQuit
}: MenuProps) {
  if (gameState === GameState.Playing) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-xl">
        {gameState === GameState.Menu && (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center">LODE RUNNER</h1>
            <div className="flex flex-col gap-4">
              <button
                onClick={onNewGame}
                className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-500"
              >
                New Game
              </button>
              {onContinue && (
                <button
                  onClick={onContinue}
                  className="px-6 py-3 bg-green-600 rounded hover:bg-green-500"
                >
                  Continue
                </button>
              )}
              <button
                onClick={onResetHighScore}
                className="px-6 py-3 bg-red-600 rounded hover:bg-red-500"
              >
                Reset High Score
              </button>
            </div>
          </>
        )}
        
        {gameState === GameState.Paused && (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">PAUSED</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={onResume}
                className="px-6 py-3 bg-green-600 rounded hover:bg-green-500"
              >
                Resume
              </button>
              <button
                onClick={onQuit}
                className="px-6 py-3 bg-red-600 rounded hover:bg-red-500"
              >
                Quit to Menu
              </button>
            </div>
          </>
        )}
        
        {gameState === GameState.GameOver && (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center text-red-500">
              GAME OVER
            </h2>
            <p className="text-xl mb-6 text-center">
              Final Score: <span className="font-bold">{finalScore}</span>
            </p>
            <button
              onClick={onNewGame}
              className="w-full px-6 py-3 bg-blue-600 rounded hover:bg-blue-500"
            >
              Try Again
            </button>
          </>
        )}
        
        {gameState === GameState.Victory && (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-500">
              VICTORY!
            </h2>
            <p className="text-xl mb-6 text-center">
              You completed all 100 levels!
            </p>
            <p className="text-xl mb-6 text-center">
              Final Score: <span className="font-bold">{finalScore}</span>
            </p>
            <button
              onClick={onNewGame}
              className="w-full px-6 py-3 bg-blue-600 rounded hover:bg-blue-500"
            >
              Play Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Requirements 5.5 and 4.6 both test enemy elimination when holes regenerate (combined into Property 5)
- Requirements 9.3 and 6.7 both test level progression (combined into Property 11)
- Requirements 17.7 and 1.4 both test paused state behavior (combined into Property 1)
- Requirements 19.1 and 14.4 both test aspect ratio maintenance (combined into Property 22)
- Requirements 20.1 and 10.6 both test storage error handling (combined into Property 16)
- Requirements 17.6 and 7.4 both test game over state (combined into example test)

The following properties represent unique, testable behaviors:

### Core Game Loop Properties

**Property 1: Paused State Immutability**
*For any* game state in Paused mode, updating the game for any duration should not change player position, enemy positions, score, lives, or any gameplay state.
**Validates: Requirements 1.4, 17.7**

### Level Loading Properties

**Property 2: Level Data Integrity**
*For any* valid level definition, loading that level should produce a tile grid that exactly matches the level's tile data, with the player at the specified start position and enemies at their specified start positions.
**Validates: Requirements 2.3**

### Movement and Physics Properties

**Property 3: Directional Input Response**
*For any* valid player position and movement direction (left, right, up on ladder, down on ladder), applying that input should move the player in the corresponding direction or maintain position if blocked by solid tiles.
**Validates: Requirements 3.1**

**Property 4: Gravity Application**
*For any* player position without support (no solid tile, ladder, or rope below), the player's downward velocity should increase over time until supported.
**Validates: Requirements 3.2**

**Property 5: Ladder Movement Without Gravity**
*For any* player position on a Ladder tile, vertical input should move the player up or down without gravity affecting vertical velocity.
**Validates: Requirements 3.3**

**Property 6: Rope Movement Without Gravity**
*For any* player position on a Rope tile, horizontal input should move the player left or right without gravity affecting the player.
**Validates: Requirements 3.4**

**Property 7: Solid Tile Collision**
*For any* player position adjacent to a Steel or Brick tile, attempting to move into that tile should fail, leaving the player in the original position.
**Validates: Requirements 3.5**

### Digging System Properties

**Property 8: Dig Left Creates Hole**
*For any* player position with a Brick tile at position (x-1, y+1), digging left should create a hole at that position and add it to the holes list.
**Validates: Requirements 4.1**

**Property 9: Dig Right Creates Hole**
*For any* player position with a Brick tile at position (x+1, y+1), digging right should create a hole at that position and add it to the holes list.
**Validates: Requirements 4.2**

**Property 10: Non-Brick Dig Rejection**
*For any* player position with a non-Brick tile (Steel, Ladder, Rope, Empty, Gold, Exit) at the dig target position, attempting to dig should not create a hole.
**Validates: Requirements 4.3**

**Property 11: Hole Creation Starts Timer**
*For any* newly created hole, the hole should be added to the holes list with a regeneration timer set to the maximum regeneration time.
**Validates: Requirements 4.4**

**Property 12: Hole Regeneration Restores Brick**
*For any* hole with regeneration timer <= 0, the tile at that position should be restored to Brick and the hole should be removed from the holes list.
**Validates: Requirements 4.5**

**Property 13: Trapped Enemy Elimination**
*For any* enemy positioned in a hole when that hole regenerates, the enemy should be removed from the enemies list.
**Validates: Requirements 4.6, 5.5**

### Enemy AI Properties

**Property 14: Enemy Chase Behavior**
*For any* enemy and player position where the enemy has a clear path toward the player, the enemy should move closer to the player's position over time.
**Validates: Requirements 5.2**

**Property 15: Enemy Gravity**
*For any* enemy position without support (no solid tile or ladder below), the enemy's downward velocity should increase over time until supported.
**Validates: Requirements 5.3**

**Property 16: Enemy Trapping in Holes**
*For any* enemy whose position overlaps with a hole position, the enemy should be marked as trapped and have zero velocity.
**Validates: Requirements 5.4**

**Property 17: Player-Enemy Collision Death**
*For any* player and enemy positions within collision threshold distance, the player should be marked as dead and lives should decrement.
**Validates: Requirements 5.6**

### Gold Collection and Level Completion Properties

**Property 18: Gold Collection**
*For any* player position overlapping a Gold tile, the Gold tile should be removed, the score should increase by 100, and the gold remaining count should decrement.
**Validates: Requirements 6.1, 8.1**

**Property 19: Exit Revelation**
*For any* game state where gold remaining count reaches zero, the exit should be revealed (exitRevealed flag set to true).
**Validates: Requirements 6.4**

**Property 20: Level Completion**
*For any* game state where the player is on an Exit tile and exitRevealed is true, the level should complete and the next level should load.
**Validates: Requirements 6.5, 6.7, 9.3**

### Lives and Death Properties

**Property 21: Death Decrements Lives**
*For any* game state where the player dies, the lives count should decrease by exactly 1.
**Validates: Requirements 7.2**

**Property 22: Death With Lives Restarts Level**
*For any* game state where the player dies with lives > 0, the current level should be restarted with player and enemies at their start positions.
**Validates: Requirements 7.3**

### Scoring Properties

**Property 23: Time Bonus Calculation**
*For any* completed level, if the completion time is less than the par time, a positive time bonus should be added to the score.
**Validates: Requirements 8.2**

**Property 24: Score Persistence Across Levels**
*For any* game state transitioning from level N to level N+1, the score should be maintained (not reset).
**Validates: Requirements 8.3**

**Property 25: High Score Update**
*For any* game state where the current score exceeds the stored high score, the high score should be updated to match the current score.
**Validates: Requirements 8.5**

### Storage Properties

**Property 26: High Score Persistence Round-Trip**
*For any* valid high score value, saving it to storage and then loading from storage should return the same value.
**Validates: Requirements 10.1, 10.2**

**Property 27: Audio Settings Persistence Round-Trip**
*For any* valid audio settings (muted boolean, volume 0-1), saving them to storage and then loading from storage should return equivalent settings.
**Validates: Requirements 10.3, 10.4**

**Property 28: Storage Failure Graceful Handling**
*For any* storage operation that fails (throws exception), the system should return default values without crashing.
**Validates: Requirements 10.6, 20.1**

### Audio Properties

**Property 29: Mute Toggle**
*For any* audio settings state, toggling mute should flip the muted boolean value.
**Validates: Requirements 11.2**

**Property 30: Volume Setting**
*For any* volume value in range [0, 1], setting the volume should update the audio settings volume to that value (clamped to valid range).
**Validates: Requirements 11.3**

### Input Properties

**Property 31: Arrow Key Input Mapping**
*For any* arrow key press event (ArrowLeft, ArrowRight, ArrowUp, ArrowDown), the corresponding input state flag should be set to true.
**Validates: Requirements 12.1**

**Property 32: WASD Input Mapping**
*For any* WASD key press event (W, A, S, D), the corresponding directional input state flag should be set to true.
**Validates: Requirements 12.2**

**Property 33: Dig Left Input Mapping**
*For any* dig-left key press event (Z or Q), the digLeft input state flag should be set to true.
**Validates: Requirements 12.3**

**Property 34: Dig Right Input Mapping**
*For any* dig-right key press event (X or E), the digRight input state flag should be set to true.
**Validates: Requirements 12.4**

**Property 35: Pause Input Mapping**
*For any* pause key press event (P or Escape), the pause input state flag should be set to true.
**Validates: Requirements 12.5**

**Property 36: Touch Input Mapping**
*For any* touch control button press, the corresponding input state flag should be set to true.
**Validates: Requirements 13.5**

### Rendering Properties

**Property 37: Canvas Aspect Ratio Maintenance**
*For any* canvas resize operation, the resulting canvas dimensions should maintain the game world aspect ratio (28:16).
**Validates: Requirements 14.4, 19.1**

**Property 38: Canvas Resize Recalculation**
*For any* window resize event, the canvas dimensions should be recalculated to fit the new viewport while maintaining aspect ratio.
**Validates: Requirements 19.4**

### Particle System Properties

**Property 39: Gold Particle Creation**
*For any* gold collection event, particles should be added to the active particles list with positions at the gold location.
**Validates: Requirements 15.1**

**Property 40: Particle Movement and Fade**
*For any* active particle, updating it should move its position based on velocity and increase its life value.
**Validates: Requirements 15.2**

**Property 41: Particle Removal**
*For any* particle with life >= maxLife, the particle should be removed from the active particles list.
**Validates: Requirements 15.3**

### State Management Properties

**Property 42: Pause State Transition**
*For any* game state in Playing mode, triggering pause should transition the state to Paused.
**Validates: Requirements 17.4**

**Property 43: Resume State Transition**
*For any* game state in Paused mode, triggering resume should transition the state back to Playing.
**Validates: Requirements 17.5**

### Error Handling Properties

**Property 44: Audio Load Failure Resilience**
*For any* audio asset that fails to load, the game should continue to function without crashing.
**Validates: Requirements 20.2**

**Property 45: Sprite Load Failure Resilience**
*For any* sprite asset that fails to load, the rendering system should continue to function without crashing.
**Validates: Requirements 20.3**

**Property 46: Invalid Level Data Handling**
*For any* level with invalid data (missing required fields, out-of-bounds values), the system should skip to the next valid level without crashing.
**Validates: Requirements 20.4**

## Error Handling

### Storage Errors

**localStorage Failures**:
- Wrap all localStorage operations in try-catch blocks
- Return default values when reads fail (high score: 0, audio settings: { muted: false, volume: 0.7 })
- Log errors to console for debugging
- Continue game execution without crashing

```typescript
function loadHighScore(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.highScore);
    return stored ? parseInt(stored, 10) : 0;
  } catch (error) {
    console.error('Failed to load high score:', error);
    return 0; // Default value
  }
}
```

### Asset Loading Errors

**Audio Loading Failures**:
- Catch audio load errors during initialization
- Set audioAssets to null if loading fails
- Check for null before playing sounds
- Game continues without audio

**Sprite Loading Failures**:
- Catch sprite load errors during initialization
- Use fallback rendering (colored rectangles) if sprites fail
- Log errors to console
- Game remains playable

```typescript
async function loadSprites(): Promise<void> {
  try {
    spriteSheets = await loadAllSpriteSheets();
  } catch (error) {
    console.error('Failed to load sprites:', error);
    spriteSheets = null; // Trigger fallback rendering
  }
}
```

### Level Data Errors

**Invalid Level Data**:
- Validate level data before loading (check required fields, dimensions)
- Skip invalid levels and load next valid level
- Log validation errors
- Prevent game from getting stuck on invalid level

```typescript
function loadLevel(state: GameStateData, levelNumber: number): void {
  const level = LEVELS[levelNumber - 1];
  
  if (!isValidLevel(level)) {
    console.error(`Invalid level data for level ${levelNumber}`);
    // Skip to next level
    if (levelNumber < MAX_LEVELS) {
      loadLevel(state, levelNumber + 1);
    }
    return;
  }
  
  // Load valid level...
}
```

### Runtime Errors

**Game Loop Errors**:
- Wrap update and render calls in try-catch
- Log errors and attempt to continue
- Provide error state UI if unrecoverable

**Collision Detection Errors**:
- Validate entity positions before collision checks
- Clamp positions to valid tile coordinates
- Handle edge cases (entities outside world bounds)

## Testing Strategy

### Dual Testing Approach

This project requires both **unit tests** and **property-based tests** for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples that demonstrate correct behavior
- Edge cases (empty levels, boundary conditions, zero lives)
- Integration points between systems
- Error conditions (failed asset loads, invalid data)

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Correctness guarantees across the input space

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across many inputs.

### Property-Based Testing Configuration

**Library Selection**: Use **fast-check** for TypeScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: lode-runner-game, Property N: [property text]`

**Example Property Test**:
```typescript
import fc from 'fast-check';

// Feature: lode-runner-game, Property 18: Gold Collection
test('collecting gold removes tile, increases score, and decrements count', () => {
  fc.assert(
    fc.property(
      fc.record({
        playerPos: fc.record({ x: fc.integer(0, 27), y: fc.integer(0, 15) }),
        initialScore: fc.integer(0, 100000),
        goldCount: fc.integer(1, 50)
      }),
      ({ playerPos, initialScore, goldCount }) => {
        const state = createTestState({
          player: { pos: playerPos },
          score: initialScore,
          goldRemaining: goldCount,
          tiles: createTilesWithGoldAt(playerPos)
        });
        
        checkGoldCollection(state);
        
        expect(getTileAt(playerPos, state.tiles)).toBe(TileType.Empty);
        expect(state.score).toBe(initialScore + 100);
        expect(state.goldRemaining).toBe(goldCount - 1);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Test Organization**:
- One test file per module (e.g., `physics.test.ts`, `digging.test.ts`)
- Group related tests using `describe` blocks
- Use descriptive test names that explain the scenario

**Example Unit Tests**:
```typescript
describe('Digging System', () => {
  test('digging into steel tile should not create hole', () => {
    const state = createTestState({
      player: { pos: { x: 5, y: 5 } },
      tiles: createTilesWithSteelAt({ x: 6, y: 6 })
    });
    
    digHole(state, 'right');
    
    expect(state.holes).toHaveLength(0);
    expect(getTileAt({ x: 6, y: 6 }, state.tiles)).toBe(TileType.Steel);
  });
  
  test('hole should regenerate after timer expires', () => {
    const state = createTestState({
      holes: [{ pos: { x: 5, y: 5 }, regenerationTimer: 0.1, maxRegenTime: 5 }],
      tiles: createTilesWithEmptyAt({ x: 5, y: 5 })
    });
    
    updateDigging(state, 0.2); // Advance past timer
    
    expect(state.holes).toHaveLength(0);
    expect(getTileAt({ x: 5, y: 5 }, state.tiles)).toBe(TileType.Brick);
  });
});
```

### Integration Testing

**Canvas Integration**:
- Test that CanvasGame component initializes engine correctly
- Test that engine callbacks update React state
- Test that resize events update canvas dimensions

**Input Integration**:
- Test that keyboard events update game state
- Test that touch events update game state
- Test that input state affects player movement

**Storage Integration**:
- Test round-trip persistence of high scores
- Test round-trip persistence of audio settings
- Test that storage failures don't crash the game

### Test Coverage Goals

**Critical Paths** (must have 100% coverage):
- Gold collection and scoring
- Player death and lives system
- Level completion and progression
- Digging and hole regeneration
- Enemy collision detection

**Important Paths** (target 80%+ coverage):
- Movement and physics
- Enemy AI
- Input handling
- Storage operations

**Nice to Have** (target 60%+ coverage):
- Particle system
- Animation state management
- Canvas rendering helpers

### Testing Tools

**Framework**: Vitest (fast, Vite-native test runner)
**Property Testing**: fast-check
**Mocking**: Vitest built-in mocks for localStorage, Audio, Canvas
**Coverage**: Vitest coverage with c8

**Test Commands**:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run only property tests
npm test -- --grep "Property"

# Run only unit tests
npm test -- --grep -v "Property"
```

### Continuous Testing

**Development Workflow**:
1. Write property test for new feature (based on design property)
2. Write unit tests for edge cases
3. Implement feature
4. Run tests until all pass
5. Check coverage and add tests for uncovered paths

**Pre-commit Checks**:
- All tests must pass
- No decrease in coverage percentage
- ESLint must pass with no errors
