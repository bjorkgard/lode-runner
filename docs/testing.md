# Testing Strategy

The project uses a comprehensive testing approach with **216 passing tests** (100% pass rate).

## Testing Frameworks

- **Vitest 4.0.18** - Fast unit test framework with jsdom environment
- **fast-check 4.5.3** - Property-based testing library
- **@testing-library/react 16.3.2** - React component testing utilities
- **jsdom 27.4.0** - DOM implementation for Node.js

## Test Types

### Property-Based Tests

Universal correctness properties validated across all inputs using fast-check.

**Planned**: 45 properties covering:
- Gravity application
- Collision detection
- Hole regeneration
- Enemy AI behavior
- Level progression

**Currently Implemented**:
- Property 2: Level Data Integrity - validates loading any valid level produces correct state
- Property 4: Gravity Application - validates unsupported entities fall over time
- Property 5: Ladder Movement Without Gravity - validates vertical movement on ladders
- Property 6: Rope Movement Without Gravity - validates horizontal movement on ropes
- Property 7: Solid Tile Collision - validates entities cannot move through solid tiles
- Property 8: Dig Left Creates Hole - validates digging left creates hole at correct position
- Property 9: Dig Right Creates Hole - validates digging right creates hole at correct position
- Property 10: Non-Brick Dig Rejection - validates digging into non-brick tiles fails
- Property 12: Hole Regeneration Restores Brick - validates holes regenerate back to brick after timer expires
- Property 13: Trapped Enemy Elimination - validates enemies in regenerating holes are eliminated
- Property 14: Enemy Chase Behavior - validates enemies move toward player over time
- Property 16: Enemy Trapping in Holes - validates enemies in holes become trapped
- Property 18: Gold Collection - validates collecting gold removes tile, increases score, and decrements count
- Property 19: Exit Revelation - validates collecting all gold reveals exit
- Property 20: Level Completion - validates reaching exit with all gold completes level
- Property 26: High Score Persistence Round-Trip - validates saving and loading high score returns same value
- Property 27: Audio Settings Persistence Round-Trip - validates saving and loading audio settings returns same values
- Property 28: Storage Failure Graceful Handling - validates storage failures return defaults without crashing
- Property 29: Mute Toggle - validates toggling mute flips muted state
- Property 30: Volume Setting - validates setting volume updates audio settings
- Property 44: Audio Load Failure Resilience - validates failed audio load doesn't crash game
- Property 45: Sprite Load Failure Resilience - validates sprite system remains functional regardless of load state

### Unit Tests

Specific examples and edge cases for individual functions and modules.

**Currently Implemented**: 216 tests
- Test setup validation (5 tests)
- Level system validation (28 tests)
- State management validation (18 tests)
- Physics system validation (16 tests)
- Animation system validation (22 tests)
- Error handling validation (29 tests)
- Digging system validation (16 tests)
- AI system validation (14 tests)
- Game rules validation (13 tests)
- Input handling validation (21 tests)
- Storage system validation (15 tests)
- Sprite system validation (8 tests)
- Audio system validation (11 tests)

**Planned**:
- Particle system tests
- Rendering tests

### Input Handling Suite (21 tests)

Comprehensive testing of keyboard and touch input:

**Input State Tests (10)**:
- Arrow keys update input state
- WASD keys update input state
- Dig keys update input state
- Pause keys update input state
- Key release clears input state
- Multiple simultaneous keys
- Case-insensitive key handling
- Prevents default browser behavior
- Touch input updates state
- Touch input for all directions

**updateInput Tests (6)**:
- Horizontal movement sets player velocity
- Vertical movement on ladders sets player velocity
- Dig actions trigger hole creation
- Pause toggle changes game state
- Dig actions only trigger on press (not hold)
- Pause only triggers on press (not hold)

**Touch Input Tests (2)**:
- setTouchInput updates input state
- Touch input works for all directions

**Helper Function Tests (3)**:
- getCurrentInput returns current state
- resetInput clears all input
- togglePause transitions between Playing and Paused

### Integration Tests

Full game flow validation (planned):
- Complete level playthrough
- Persistence across sessions
- Multi-level progression
- Death and restart flow
- Game over flow

## Test Coverage by Module

| Module | Tests | Status |
|--------|-------|--------|
| Test Setup | 5 | ✅ Complete |
| Levels | 28 | ✅ Complete |
| State Management | 18 | ✅ Complete |
| Physics | 16 | ✅ Complete |
| Animation | 22 | ✅ Complete |
| Error Handling | 29 | ✅ Complete |
| Digging | 16 | ✅ Complete |
| AI | 14 | ✅ Complete |
| Rules | 13 | ✅ Complete |
| Input | 21 | ✅ Complete |
| Storage | 15 | ✅ Complete |
| Sprites | 8 | ✅ Complete |
| Audio | 11 | ✅ Complete |
| Particles | 0 | ⏳ Pending |
| Rendering | 0 | ⏳ Pending |

## Test Suites

### Test Setup Suite (5 tests)

Validates the Vitest test environment:
- Vitest configuration validation
- Canvas 2D API mocks
- localStorage mocks
- Audio API mocks
- requestAnimationFrame mocks

### Level System Suite (25 tests)

Comprehensive testing of the level system:

**Level Data Tests (5)**:
- 100 levels defined
- Sequential numbering
- Consistent dimensions (28x16)
- Valid spawn positions
- Positive par times

**countGold Tests (3)**:
- Correct counting
- Zero gold handling
- Empty array handling

**isValidLevel Tests (7)**:
- Valid level acceptance
- Missing fields rejection
- Invalid dimensions
- Mismatched tiles
- Out-of-bounds positions
- Invalid par time

**getLevel Tests (2)**:
- Valid level retrieval
- Invalid number handling

**loadLevel Tests (7)**:
- Correct loading
- Deep copy verification
- Player state reset
- Enemy creation
- Gold counting
- Invalid level handling

**Property-Based Test (1)**:
- Level Data Integrity (Property 2)

### State Management Suite (18 tests)

Comprehensive testing of game state initialization and lifecycle:

**State Initialization Tests (3)**:
- New game starts with 3 lives
- New game starts in Menu state
- New game loads level 1

**createPlayer Tests (6)**:
- Creates player at specified position
- Creates player with 3 lives
- Creates player with zero velocity
- Creates player that is not dead
- Creates player that is not digging
- Creates player with animation state

**createEnemy Tests (4)**:
- Creates enemy at specified position
- Creates enemy with zero velocity
- Creates enemy that is not trapped
- Creates enemy with animation state

**resetLevel Tests (5)**:
- Resets level to initial state
- Does not change score
- Does not change lives
- Does not change high score
- Does not change current level number

### Physics System Suite (16 tests)

Comprehensive testing of physics and collision detection:

**Gravity Tests (3)**:
- Applies gravity to unsupported player
- Does not apply gravity to supported player
- Property test: unsupported entities fall over time

**Collision Tests (4)**:
- Prevents movement through brick tiles
- Prevents movement through steel tiles
- Allows movement through empty tiles
- Property test: entities cannot move through solid tiles

**Ladder Movement Tests (3)**:
- Allows vertical movement on ladders
- Disables gravity on ladders
- Property test: ladder movement without gravity

**Rope Movement Tests (3)**:
- Allows horizontal movement on ropes
- Disables gravity on ropes
- Property test: rope movement without gravity

**Helper Function Tests (3)**:
- getTileAt returns correct tile
- isSupported detects ground support
- canMoveTo validates movement

### Animation System Suite (22 tests)

Comprehensive testing of sprite animation:

**AnimationState Tests (10)**:
- Creates with initial animation
- Updates frame timer
- Advances frames
- Loops animations
- Stops at last frame for non-looping
- Changes animation
- Resets frame on animation change
- Gets current frame index
- Handles empty animation
- Handles single-frame animation

**Animation Definition Tests (12)**:
- Player idle animation
- Player run animation
- Player climb animation
- Player fall animation
- Player dig animation
- Enemy run animation
- Enemy climb animation
- Enemy fall animation
- Enemy trapped animation
- All animations have valid frames
- All animations have positive frame rates
- All animations have loop flag

### Error Handling Suite (29 tests)

Comprehensive testing of error handling system:

**GameError Tests (3)**:
- Creates error with message
- Creates error with context
- Converts to JSON

**Specific Error Types (6)**:
- LevelLoadError includes level number
- LevelValidationError includes validation errors
- StorageError includes operation and key
- AudioError includes audio file
- AssetLoadError includes asset path and type
- InvalidStateError includes state name

**ErrorHandler Tests (14)**:
- Handles error without recovery
- Handles error with recovery
- Converts regular Error to GameError
- Tracks error frequency
- Wraps function with error handling
- Returns function result when no error
- Uses custom logger
- Uses custom user message handler
- Updates configuration
- Tracks multiple different errors
- Clears error statistics
- Handles recovery action failure
- Logs errors at appropriate severity
- Shows user-friendly messages

**Utility Function Tests (6)**:
- safeAsync returns result on success
- safeAsync returns default value on error
- safeAsync returns undefined on error without default
- safe returns result on success
- safe returns default value on error
- safe returns undefined on error without default

### Digging System Suite (16 tests)

Comprehensive testing of hole creation and regeneration:

**digHole Tests (5)**:
- Does not mutate original state
- Returns new state object when hole is created
- Digging into steel tile should not create hole
- Digging into empty tile should not create hole
- Cannot dig where hole already exists

**updateDigging Tests (5)**:
- Does not mutate original state
- Returns new state object
- Decrements hole regeneration timer
- Hole regenerates after timer expires
- Trapped enemy is eliminated when hole regenerates

**Property-Based Tests (6)**:
- Property 8: Dig Left Creates Hole - validates digging left creates hole at correct position with proper timer and player state
- Property 9: Dig Right Creates Hole - validates digging right creates hole at correct position with proper timer and player state
- Property 10: Non-Brick Dig Rejection - validates digging into non-brick tiles (steel, ladder, rope, gold, exit, empty) fails gracefully
- Property 12: Hole Regeneration Restores Brick - validates holes regenerate back to brick after timer expires across various timer values
- Property 13: Trapped Enemy Elimination (in hole) - validates enemies positioned in regenerating holes are eliminated
- Property 13: Trapped Enemy Elimination (outside hole) - validates enemies outside regenerating holes are not eliminated

### AI System Suite (14 tests)

Comprehensive testing of enemy AI and pathfinding:

**calculateChaseDirection Tests (4)**:
- Moves toward player horizontally when player is to the right
- Moves toward player horizontally when player is to the left
- Moves toward player vertically when player is above
- Moves toward player vertically when player is below

**moveEnemy Tests (3)**:
- Sets velocity in chase direction
- Stops when blocked by solid tile
- Does not mutate original enemy object

**checkEnemyTrapped Tests (3)**:
- Marks enemy as trapped when in hole
- Does not mark enemy as trapped when not in hole
- Does not mutate original enemy object

**updateAI Tests (2)**:
- Updates all enemies
- Does not mutate original state

**Property-Based Tests (2)**:
- Property 14: Enemy Chase Behavior - validates enemies move toward player over time across various positions
- Property 16: Enemy Trapping in Holes - validates enemies in holes become trapped with zero velocity

### Game Rules Suite (13 tests)

Comprehensive testing of game rules, win/loss conditions, and level progression:

**checkGoldCollection Tests (3)**:
- Collects gold when player is on gold tile
- Increases score by 100 points
- Reveals exit when all gold collected

**checkPlayerEnemyCollision Tests (2)**:
- Kills player when colliding with enemy
- Does not kill player when not colliding

**killPlayer Tests (3)**:
- Decrements lives by 1
- Marks player as dead
- Triggers game over when lives reach 0

**checkLevelCompletion Tests (2)**:
- Completes level when player reaches exit with all gold
- Does not complete level when exit not revealed

**completeLevel Tests (1)**:
- Loads next level after completion

**Property-Based Tests (2)**:
- Property 18: Gold Collection - validates collecting gold removes tile, increases score, and decrements count
- Property 19: Exit Revelation - validates collecting all gold reveals exit

### Storage System Suite (15 tests)

Comprehensive testing of localStorage persistence:

**saveHighScore Tests (3)**:
- Saves new high score when higher than current
- Does not save lower score
- Handles localStorage errors gracefully

**loadHighScore Tests (4)**:
- Loads stored high score correctly
- Returns 0 when no score stored
- Returns 0 on parse error
- Handles localStorage errors gracefully

**saveAudioSettings Tests (2)**:
- Saves audio settings to localStorage
- Handles localStorage errors gracefully

**loadAudioSettings Tests (3)**:
- Loads stored audio settings correctly
- Returns default settings when not stored
- Handles localStorage errors gracefully

**resetHighScore Tests (1)**:
- Removes high score from localStorage

**Property-Based Tests (2)**:
- Property 26: High Score Persistence Round-Trip - validates saving and loading high score returns same value
- Property 27: Audio Settings Persistence Round-Trip - validates saving and loading audio settings returns same values

### Sprite System Suite (8 tests)

Comprehensive testing of sprite loading and animation management:

**getSpriteSheets Tests (1)**:
- Returns null before sprites are loaded

**getAnimations Tests (2)**:
- Returns player animations with all required animation states
- Returns enemy animations with all required animation states

**Animation Definition Tests (2)**:
- Player animations have valid frame data (frames, frameRate, loop)
- Enemy animations have valid frame data (frames, frameRate, loop)

**Property-Based Tests (3)**:
- Property 45: Sprite Load Failure Resilience - validates sprite system remains functional regardless of load state
- Property 45: resetSpriteSheets always succeeds - validates resetting multiple times never throws
- Property 45: animation getters never throw - validates getting animations always returns valid data

### Audio System Suite (11 tests)

Comprehensive testing of sound effects and volume control:

**Property 29: Mute Toggle Tests (2)**:
- Toggling mute flips muted state
- Multiple toggles alternate between muted and unmuted

**Property 30: Volume Setting Tests (3)**:
- Setting volume updates audio settings
- Volume is clamped to valid range [0, 1]
- Volume setting persists to storage

**Property 44: Audio Load Failure Resilience Tests (3)**:
- Failed audio load does not crash game
- Audio system functions work without loaded assets
- Partial audio load failure is handled gracefully

**Audio System Functions (3)**:
- initAudio loads audio settings from storage
- playSound does nothing when muted
- getAudioSettings returns current settings

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test src/game/levels.test.ts
```

## Test Coverage Goals

- Aim for >80% code coverage
- Test both happy paths and error cases
- All tests must pass before marking a task complete
- Property-based tests for universal correctness
- Unit tests for specific examples and edge cases
