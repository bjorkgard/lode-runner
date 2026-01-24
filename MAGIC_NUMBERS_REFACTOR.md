# Magic Numbers Refactoring

## Overview

Extracted all magic numbers from the codebase into centralized constant files to improve maintainability, readability, and reduce the risk of inconsistencies.

## Problem

Magic numbers scattered throughout the codebase made it difficult to:
- Understand what values represent
- Change values consistently across the codebase
- Maintain and update the code
- Avoid typos and inconsistencies

### Examples of Magic Numbers Before

```typescript
// App.tsx
const [lives, setLives] = useState(3); // What does 3 represent?
setInterval(() => { ... }, 100); // Why 100ms?

// CanvasGame.tsx
const aspectRatio = 28 / 16; // Why these dimensions?
const minWidth = 280; // Why 280?
window.innerWidth - 40; // Why 40?

// HUD.tsx
Array.from({ length: 3 }).map(...) // Why 3?

// particles.ts
const PARTICLE_POOL_SIZE = 100; // Why 100?
const speed = 50 + Math.random() * 50; // Why 50-100?
```

## Solution

Created a centralized constants file (`src/constants/ui.ts`) that organizes all UI-related constants into logical groups.

### New Constants File Structure

```typescript
// src/constants/ui.ts

export const CANVAS = {
  WORLD_WIDTH_TILES: 28,
  WORLD_HEIGHT_TILES: 16,
  MIN_WIDTH: 280,
  MIN_HEIGHT: 160,
  MARGIN_HORIZONTAL: 40,
  MARGIN_VERTICAL: 200,
  get ASPECT_RATIO() {
    return this.WORLD_WIDTH_TILES / this.WORLD_HEIGHT_TILES;
  }
} as const;

export const TIMING = {
  TIMER_UPDATE_INTERVAL_MS: 100,
} as const;

export const PLAYER = {
  INITIAL_LIVES: 3,
  MAX_LIVES_DISPLAY: 3,
} as const;

export const LEVELS = {
  FIRST_LEVEL: 1,
  TOTAL_LEVELS: 100,
} as const;

export const SPRITES = {
  FRAME_WIDTH: 16,
  FRAME_HEIGHT: 16,
} as const;

export const PARTICLES = {
  POOL_SIZE: 100,
  MIN_SPEED: 50,
  MAX_SPEED: 100,
  get SPEED_RANGE() {
    return this.MAX_SPEED - this.MIN_SPEED;
  }
} as const;
```

## Files Modified

### 1. **src/App.tsx**
- ✅ Replaced `3` with `PLAYER.INITIAL_LIVES`
- ✅ Replaced `100` with `TIMING.TIMER_UPDATE_INTERVAL_MS`
- ✅ Added explicit type annotations to useState

**Before:**
```typescript
const [lives, setLives] = useState(3);
setInterval(() => { ... }, 100);
```

**After:**
```typescript
import { TIMING, PLAYER } from './constants/ui';

const [lives, setLives] = useState<number>(PLAYER.INITIAL_LIVES);
setInterval(() => { ... }, TIMING.TIMER_UPDATE_INTERVAL_MS);
```

### 2. **src/components/CanvasGame.tsx**
- ✅ Replaced `28 / 16` with `CANVAS.ASPECT_RATIO`
- ✅ Replaced `280` with `CANVAS.MIN_WIDTH`
- ✅ Replaced `160` with `CANVAS.MIN_HEIGHT`
- ✅ Replaced `40` with `CANVAS.MARGIN_HORIZONTAL`
- ✅ Replaced `200` with `CANVAS.MARGIN_VERTICAL`

**Before:**
```typescript
const aspectRatio = 28 / 16;
const minWidth = 280;
const minHeight = 160;
const maxWidth = Math.max(minWidth, window.innerWidth - 40);
const maxHeight = Math.max(minHeight, window.innerHeight - 200);
```

**After:**
```typescript
import { CANVAS } from '../constants/ui';

const aspectRatio = CANVAS.ASPECT_RATIO;
const minWidth = CANVAS.MIN_WIDTH;
const minHeight = CANVAS.MIN_HEIGHT;
const maxWidth = Math.max(minWidth, window.innerWidth - CANVAS.MARGIN_HORIZONTAL);
const maxHeight = Math.max(minHeight, window.innerHeight - CANVAS.MARGIN_VERTICAL);
```

### 3. **src/components/HUD.tsx**
- ✅ Replaced `3` with `PLAYER.MAX_LIVES_DISPLAY`

**Before:**
```typescript
{Array.from({ length: 3 }).map((_, i) => (
  <span>♥</span>
))}
```

**After:**
```typescript
import { PLAYER } from '../constants/ui';

{Array.from({ length: PLAYER.MAX_LIVES_DISPLAY }).map((_, i) => (
  <span>♥</span>
))}
```

### 4. **src/components/Menu.tsx**
- ✅ Replaced `100` with `LEVELS.TOTAL_LEVELS`

**Before:**
```typescript
<p>You completed all 100 levels!</p>
```

**After:**
```typescript
import { LEVELS } from '../constants/ui';

<p>You completed all {LEVELS.TOTAL_LEVELS} levels!</p>
```

### 5. **src/game/state.ts**
- ✅ Replaced `1` with `LEVELS.FIRST_LEVEL`
- ✅ Replaced `3` with `PLAYER.INITIAL_LIVES`

**Before:**
```typescript
const baseState: GameStateData = {
  currentLevel: 1,
  lives: 3,
  // ...
};
return loadLevel(baseState, 1);
```

**After:**
```typescript
import { PLAYER, LEVELS } from '../constants/ui';

const baseState: GameStateData = {
  currentLevel: LEVELS.FIRST_LEVEL,
  lives: PLAYER.INITIAL_LIVES,
  // ...
};
return loadLevel(baseState, LEVELS.FIRST_LEVEL);
```

### 6. **src/game/particles.ts**
- ✅ Replaced `100` with `PARTICLES.POOL_SIZE`
- ✅ Replaced `50 + Math.random() * 50` with `PARTICLES.MIN_SPEED + Math.random() * PARTICLES.SPEED_RANGE`

**Before:**
```typescript
const PARTICLE_POOL_SIZE = 100;
const speed = 50 + Math.random() * 50;
```

**After:**
```typescript
import { PARTICLES } from '../constants/ui';

const PARTICLE_POOL_SIZE = PARTICLES.POOL_SIZE;
const speed = PARTICLES.MIN_SPEED + Math.random() * PARTICLES.SPEED_RANGE;
```

### 7. **src/game/sprites.ts**
- ✅ Replaced `16, 16` with `SPRITES.FRAME_WIDTH, SPRITES.FRAME_HEIGHT`

**Before:**
```typescript
this.loadSpriteSheet('/assets/sprites/player.png', 16, 16)
this.loadSpriteSheet('/assets/sprites/enemy.png', 16, 16)
this.loadSpriteSheet('/assets/sprites/tiles.png', 16, 16)
```

**After:**
```typescript
import { SPRITES } from '../constants/ui';

this.loadSpriteSheet('/assets/sprites/player.png', SPRITES.FRAME_WIDTH, SPRITES.FRAME_HEIGHT)
this.loadSpriteSheet('/assets/sprites/enemy.png', SPRITES.FRAME_WIDTH, SPRITES.FRAME_HEIGHT)
this.loadSpriteSheet('/assets/sprites/tiles.png', SPRITES.FRAME_WIDTH, SPRITES.FRAME_HEIGHT)
```

## Benefits

### ✅ **Improved Readability**
```typescript
// Before: What does 3 mean?
const [lives, setLives] = useState(3);

// After: Clear and self-documenting
const [lives, setLives] = useState(PLAYER.INITIAL_LIVES);
```

### ✅ **Easier Maintenance**
```typescript
// Before: Need to change in multiple places
const aspectRatio = 28 / 16;
// ... somewhere else ...
const width = 28;
const height = 16;

// After: Change once, applies everywhere
export const CANVAS = {
  WORLD_WIDTH_TILES: 28,
  WORLD_HEIGHT_TILES: 16,
  get ASPECT_RATIO() {
    return this.WORLD_WIDTH_TILES / this.WORLD_HEIGHT_TILES;
  }
};
```

### ✅ **Type Safety**
```typescript
// Constants are typed and readonly
export const PLAYER = {
  INITIAL_LIVES: 3,
  MAX_LIVES_DISPLAY: 3,
} as const;

// TypeScript prevents accidental modification
PLAYER.INITIAL_LIVES = 5; // ❌ Error: Cannot assign to 'INITIAL_LIVES'
```

### ✅ **Computed Values**
```typescript
// Derived values are automatically calculated
export const CANVAS = {
  WORLD_WIDTH_TILES: 28,
  WORLD_HEIGHT_TILES: 16,
  get ASPECT_RATIO() {
    return this.WORLD_WIDTH_TILES / this.WORLD_HEIGHT_TILES;
  }
};

// Always consistent
console.log(CANVAS.ASPECT_RATIO); // 1.75
```

### ✅ **Single Source of Truth**
- All UI constants in one place
- Easy to find and update
- No risk of inconsistencies
- Clear documentation of what values mean

## Testing

All 316 tests pass after refactoring:

```bash
npm test -- --run
```

**Results:**
- ✅ 21 test files passed
- ✅ 316 tests passed
- ✅ No TypeScript errors
- ✅ No runtime errors

## Usage Examples

### Accessing Constants

```typescript
import { CANVAS, PLAYER, LEVELS, TIMING, SPRITES, PARTICLES } from '../constants/ui';

// Canvas dimensions
const width = CANVAS.WORLD_WIDTH_TILES;
const aspectRatio = CANVAS.ASPECT_RATIO;

// Player configuration
const initialLives = PLAYER.INITIAL_LIVES;

// Level information
const totalLevels = LEVELS.TOTAL_LEVELS;

// Timing
const updateInterval = TIMING.TIMER_UPDATE_INTERVAL_MS;

// Sprites
const frameSize = SPRITES.FRAME_WIDTH;

// Particles
const poolSize = PARTICLES.POOL_SIZE;
const speedRange = PARTICLES.SPEED_RANGE;
```

### Adding New Constants

To add new constants, simply extend the appropriate group:

```typescript
// src/constants/ui.ts

export const PLAYER = {
  INITIAL_LIVES: 3,
  MAX_LIVES_DISPLAY: 3,
  // Add new constant
  MAX_LIVES: 5,
  INVINCIBILITY_DURATION_MS: 2000,
} as const;
```

## Best Practices

### ✅ **DO:**
- Group related constants together
- Use descriptive names (e.g., `INITIAL_LIVES` not `LIVES`)
- Add comments explaining what values represent
- Use `as const` for type safety
- Use computed properties for derived values

### ❌ **DON'T:**
- Mix unrelated constants in the same group
- Use abbreviations that aren't obvious
- Hardcode values that might change
- Duplicate constants across files

## Future Improvements

Potential enhancements:
1. **Configuration file**: Allow users to customize constants
2. **Environment-based constants**: Different values for dev/prod
3. **Runtime validation**: Ensure constants are within valid ranges
4. **Constants documentation**: Auto-generate docs from constants
5. **Constants testing**: Validate relationships between constants

## Related Files

- `src/constants/ui.ts` - UI constants (NEW)
- `src/game/constants.ts` - Game mechanics constants (existing)
- All component and game files - Updated to use constants

## Summary

Successfully extracted all magic numbers to centralized constants:

- ✅ **Files created**: 1 (`src/constants/ui.ts`)
- ✅ **Files modified**: 7
- ✅ **Magic numbers eliminated**: 20+
- ✅ **Tests passing**: 316/316
- ✅ **TypeScript errors**: 0
- ✅ **Improved maintainability**: Significantly

**Result**: More maintainable, readable, and consistent codebase!
