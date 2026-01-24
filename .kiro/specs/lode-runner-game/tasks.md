# Implementation Plan: Lode Runner Browser Game

## Overview

This implementation plan breaks down the Lode Runner game into incremental, testable steps. The approach follows a bottom-up strategy: build core systems first (types, constants, state management), then game mechanics (physics, digging, AI), then rendering and UI, and finally integration and polish.

Each task builds on previous work, with checkpoints to ensure stability. Property-based tests are integrated throughout to validate correctness early.

## Tasks

- [x] 1. Project setup and dependencies
  - Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
  - Install testing dependencies: `npm install -D vitest @vitest/ui fast-check @testing-library/react @testing-library/user-event jsdom`
  - Install Canvas API types: `npm install -D @types/node`
  - Configure Tailwind in `tailwind.config.js` (content paths for src/**/*.{ts,tsx})
  - Add Tailwind directives to `src/index.css`
  - Update `vite.config.ts` to include Vitest configuration
  - Create test setup file for jsdom and Canvas mocks
  - _Requirements: 18.1, 18.6_

- [x] 2. Core type definitions and constants
  - [x] 2.1 Create `src/game/types.ts` with all game types
    - Define TileType enum, GameState enum
    - Define Position, Entity, Player, Enemy, Hole, Level, GameStateData, Particle interfaces
    - Define AudioSettings, InputState, SpriteSheet, Animation interfaces
    - _Requirements: 2.1, 17.1_
  
  - [x] 2.2 Create `src/game/constants.ts` with game constants
    - Define TILE_SIZE, GRAVITY, PLAYER_SPEED, ENEMY_SPEED
    - Define HOLE_REGEN_TIME, GOLD_POINTS, TIME_BONUS_MULTIPLIER
    - Define COLLISION_THRESHOLD, MAX_LEVELS
    - Define STORAGE_VERSION and STORAGE_KEYS
    - _Requirements: 8.1, 8.2, 9.1_

- [x] 3. Level data and loading system
  - [x] 3.1 Create `src/game/levels.ts` with 100 level definitions
    - Define LEVELS array with 100 level objects
    - Each level includes: number, width, height, tiles (2D array), playerStart, enemyStarts, parTime
    - Start with 10 complete levels, add placeholders for remaining 90
    - _Requirements: 9.1, 9.2_
  
  - [x] 3.2 Implement level loading functions
    - Implement `loadLevel(state, levelNumber)` function
    - Implement `countGold(tiles)` helper function
    - Implement `isValidLevel(level)` validation function
    - Handle invalid level data by skipping to next level
    - _Requirements: 2.3, 20.4_
  
  - [x] 3.3 Write property test for level loading
    - **Property 2: Level Data Integrity**
    - **Validates: Requirements 2.3**
    - Test that loading any valid level produces correct tile grid, player position, and enemy positions
    - _Requirements: 2.3_

- [x] 4. Game state management
  - [x] 4.1 Create `src/game/state.ts` with state initialization
    - Implement `createInitialState()` function
    - Implement `createPlayer(pos)` helper
    - Implement `createEnemy(pos)` helper
    - Implement `resetLevel(state)` function
    - _Requirements: 7.1, 9.2, 17.2_
  
  - [x] 4.2 Write unit tests for state initialization
    - Test that new game starts with 3 lives
    - Test that new game starts in Menu state
    - Test that new game loads level 1
    - _Requirements: 7.1, 9.2, 17.2_

- [x] 5. Physics and movement system
  - [x] 5.1 Create `src/game/physics.ts` with physics functions
    - Implement `updatePhysics(state, deltaTime)` function
    - Implement `updatePlayerPhysics(player, tiles, deltaTime)` function
    - Implement `updateEnemyPhysics(enemy, tiles, deltaTime)` function
    - Implement `isSupported(entity, tiles)` helper
    - Implement `resolveCollisions(entity, tiles)` helper
    - Implement `getTileAt(pos, tiles)` helper
    - Implement `canMoveTo(pos, tiles)` helper
    - _Requirements: 3.2, 3.5, 5.3_
  
  - [x] 5.2 Write property test for gravity
    - **Property 4: Gravity Application**
    - **Validates: Requirements 3.2**
    - Test that unsupported player/enemy falls over time
    - _Requirements: 3.2_
  
  - [x] 5.3 Write property test for solid tile collision
    - **Property 7: Solid Tile Collision**
    - **Validates: Requirements 3.5**
    - Test that player cannot move through solid tiles
    - _Requirements: 3.5_
  
  - [x] 5.4 Write property test for ladder movement
    - **Property 5: Ladder Movement Without Gravity**
    - **Validates: Requirements 3.3**
    - Test that player on ladder can move vertically without gravity
    - _Requirements: 3.3_
  
  - [x] 5.5 Write property test for rope movement
    - **Property 6: Rope Movement Without Gravity**
    - **Validates: Requirements 3.4**
    - Test that player on rope can move horizontally without gravity
    - _Requirements: 3.4_

- [x] 6. Checkpoint - Core systems functional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Digging system
  - [x] 7.1 Create `src/game/digging.ts` with digging functions
    - Implement `updateDigging(state, deltaTime)` function
    - Implement `digHole(state, direction)` function
    - Implement `regenerateHole(state, hole, index)` function
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 7.2 Write property test for dig left
    - **Property 8: Dig Left Creates Hole**
    - **Validates: Requirements 4.1**
    - Test that digging left creates hole at correct position
    - _Requirements: 4.1_
  
  - [x] 7.3 Write property test for dig right
    - **Property 9: Dig Right Creates Hole**
    - **Validates: Requirements 4.2**
    - Test that digging right creates hole at correct position
    - _Requirements: 4.2_
  
  - [x] 7.4 Write property test for non-brick dig rejection
    - **Property 10: Non-Brick Dig Rejection**
    - **Validates: Requirements 4.3**
    - Test that digging into non-brick tiles fails
    - _Requirements: 4.3_
  
  - [x] 7.5 Write property test for hole regeneration
    - **Property 12: Hole Regeneration Restores Brick**
    - **Validates: Requirements 4.5**
    - Test that holes regenerate back to brick after timer expires
    - _Requirements: 4.5_
  
  - [x] 7.6 Write property test for trapped enemy elimination
    - **Property 13: Trapped Enemy Elimination**
    - **Validates: Requirements 4.6**
    - Test that enemies in regenerating holes are eliminated
    - _Requirements: 4.6_

- [x] 8. Enemy AI system
  - [x] 8.1 Create `src/game/ai.ts` with AI functions
    - Implement `updateAI(state, deltaTime)` function
    - Implement `calculateChaseDirection(enemy, player, tiles)` function
    - Implement `moveEnemy(enemy, direction, tiles, deltaTime)` function
    - Implement `checkEnemyTrapped(enemy, holes)` function
    - _Requirements: 5.2, 5.4_
  
  - [x] 8.2 Write property test for enemy chase behavior
    - **Property 14: Enemy Chase Behavior**
    - **Validates: Requirements 5.2**
    - Test that enemies move toward player over time
    - _Requirements: 5.2_
  
  - [x] 8.3 Write property test for enemy trapping
    - **Property 16: Enemy Trapping in Holes**
    - **Validates: Requirements 5.4**
    - Test that enemies in holes become trapped
    - _Requirements: 5.4_

- [x] 9. Game rules and win/loss conditions
  - [x] 9.1 Create `src/game/rules.ts` with game rules
    - Implement `updateRules(state, deltaTime)` function
    - Implement `checkGoldCollection(state)` function
    - Implement `checkPlayerEnemyCollision(state)` function
    - Implement `killPlayer(state)` function
    - Implement `checkLevelCompletion(state)` function
    - Implement `completeLevel(state)` function
    - Implement `restartLevel(state)` function
    - _Requirements: 6.1, 5.6, 6.4, 6.5, 7.2, 7.3, 8.2, 8.3_
  
  - [x] 9.2 Write property test for gold collection
    - **Property 18: Gold Collection**
    - **Validates: Requirements 6.1, 8.1**
    - Test that collecting gold removes tile, increases score, decrements count
    - _Requirements: 6.1, 8.1_
  
  - [x] 9.3 Write property test for exit revelation
    - **Property 19: Exit Revelation**
    - **Validates: Requirements 6.4**
    - Test that collecting all gold reveals exit
    - _Requirements: 6.4_
  
  - [x] 9.4 Write property test for level completion
    - **Property 20: Level Completion**
    - **Validates: Requirements 6.5, 6.7**
    - Test that reaching exit with all gold completes level
    - _Requirements: 6.5, 6.7_
  
  - [x] 9.5 Write property test for player-enemy collision
    - **Property 17: Player-Enemy Collision Death**
    - **Validates: Requirements 5.6**
    - Test that player-enemy collision causes death
    - _Requirements: 5.6_
  
  - [x] 9.6 Write property test for death decrements lives
    - **Property 21: Death Decrements Lives**
    - **Validates: Requirements 7.2**
    - Test that death reduces lives by 1
    - _Requirements: 7.2_
  
  - [x] 9.7 Write property test for death with lives restarts level
    - **Property 22: Death With Lives Restarts Level**
    - **Validates: Requirements 7.3**
    - Test that death with lives > 0 restarts level
    - _Requirements: 7.3_
  
  - [x] 9.8 Write unit test for game over
    - Test that death with 0 lives triggers GameOver state
    - _Requirements: 7.4_

- [x] 10. Checkpoint - Game mechanics complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Input handling system
  - [x] 11.1 Create `src/game/input.ts` with input functions
    - Implement `initInput()` function
    - Implement `handleKeyDown(event)` function
    - Implement `handleKeyUp(event)` function
    - Implement `updateInput(state, deltaTime)` function
    - Implement `setTouchInput(direction, pressed)` function
    - Implement `togglePause(state)` function
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 13.5, 17.4, 17.5_
  
  - [x] 11.2 Write property tests for input mapping
    - **Property 31: Arrow Key Input Mapping**
    - **Property 32: WASD Input Mapping**
    - **Property 33: Dig Left Input Mapping**
    - **Property 34: Dig Right Input Mapping**
    - **Property 35: Pause Input Mapping**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**
    - Test that keyboard events update input state correctly
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 11.3 Write property test for directional input response
    - **Property 3: Directional Input Response**
    - **Validates: Requirements 3.1**
    - Test that input moves player in correct direction
    - _Requirements: 3.1_

- [x] 12. Storage system
  - [x] 12.1 Create `src/game/storage.ts` with storage functions
    - Implement `saveHighScore(score)` function
    - Implement `loadHighScore()` function
    - Implement `saveAudioSettings(settings)` function
    - Implement `loadAudioSettings()` function
    - Implement `resetHighScore()` function
    - All functions should have try-catch error handling
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_
  
  - [x] 12.2 Write property test for high score persistence
    - **Property 26: High Score Persistence Round-Trip**
    - **Validates: Requirements 10.1, 10.2**
    - Test that saving and loading high score returns same value
    - _Requirements: 10.1, 10.2_
  
  - [x] 12.3 Write property test for audio settings persistence
    - **Property 27: Audio Settings Persistence Round-Trip**
    - **Validates: Requirements 10.3, 10.4**
    - Test that saving and loading audio settings returns same values
    - _Requirements: 10.3, 10.4_
  
  - [x] 12.4 Write property test for storage failure handling
    - **Property 28: Storage Failure Graceful Handling**
    - **Validates: Requirements 10.6**
    - Test that storage failures return defaults without crashing
    - _Requirements: 10.6_

- [x] 13. Audio system
  - [x] 13.1 Create `src/game/audio.ts` with audio functions
    - Implement `initAudio()` async function
    - Implement `loadAudio(path)` helper function
    - Implement `playSound(soundName)` function
    - Implement `setMuted(muted)` function
    - Implement `setVolume(volume)` function
    - Implement `toggleMute()` function
    - Add error handling for audio load failures
    - _Requirements: 11.1, 11.2, 11.3, 20.2_
  
  - [x] 13.2 Write property test for mute toggle
    - **Property 29: Mute Toggle**
    - **Validates: Requirements 11.2**
    - Test that toggling mute flips muted state
    - _Requirements: 11.2_
  
  - [x] 13.3 Write property test for volume setting
    - **Property 30: Volume Setting**
    - **Validates: Requirements 11.3**
    - Test that setting volume updates audio settings
    - _Requirements: 11.3_
  
  - [x] 13.4 Write property test for audio load failure
    - **Property 44: Audio Load Failure Resilience**
    - **Validates: Requirements 20.2**
    - Test that failed audio load doesn't crash game
    - _Requirements: 20.2_

- [x] 14. Sprite and animation system
  - [x] 14.1 Create `src/game/sprites.ts` with sprite functions
    - Implement `loadSpriteSheet(path, frameWidth, frameHeight)` function
    - Implement `loadSprites()` async function
    - Define ANIMATIONS object with player and enemy animations
    - Implement AnimationState class with update and setAnimation methods
    - Add error handling for sprite load failures
    - _Requirements: 14.3, 14.6, 20.3_
  
  - [x] 14.2 Write property test for sprite load failure
    - **Property 45: Sprite Load Failure Resilience**
    - **Validates: Requirements 20.3**
    - Test that failed sprite load doesn't crash rendering
    - _Requirements: 20.3_

- [x] 15. Particle system
  - [x] 15.1 Create `src/game/particles.ts` with particle functions
    - Implement `initParticleSystem()` function
    - Implement `createGoldParticles(tilePos)` function
    - Implement `updateParticles(deltaTime)` function
    - Implement `renderParticles(ctx)` function
    - Use object pooling for particles
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [x] 15.2 Write property test for particle creation
    - **Property 39: Gold Particle Creation**
    - **Validates: Requirements 15.1**
    - Test that gold collection creates particles
    - _Requirements: 15.1_
  
  - [x] 15.3 Write property test for particle lifecycle
    - **Property 40: Particle Movement and Fade**
    - **Property 41: Particle Removal**
    - **Validates: Requirements 15.2, 15.3**
    - Test that particles move, fade, and are removed correctly
    - _Requirements: 15.2, 15.3_

- [ ] 16. Rendering system
  - [ ] 16.1 Create `src/game/render.ts` with rendering functions
    - Implement `renderGame(state, ctx)` function
    - Implement `renderTiles(tiles, ctx)` function
    - Implement `renderPlayer(player, ctx)` function
    - Implement `renderEnemy(enemy, ctx)` function
    - Implement `renderSprite(ctx, sheet, frameIndex, x, y)` function
    - Implement `renderHoles(holes, ctx)` function
    - Disable image smoothing for pixel-perfect rendering
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 17. Game engine orchestration
  - [ ] 17.1 Create `src/game/engine.ts` with GameEngine class
    - Implement constructor that initializes all systems
    - Implement `start()` method to begin game loop
    - Implement `stop()` method to stop game loop
    - Implement `loop()` method with requestAnimationFrame
    - Implement `update(deltaTime)` method that calls all update functions
    - Implement `render()` method that calls render functions
    - Implement public methods: `newGame()`, `pauseGame()`, `resumeGame()`, `resetHighScore()`
    - Add callbacks for UI updates: onScoreChange, onLivesChange, onLevelChange, onGameStateChange
    - _Requirements: 1.1, 1.3, 1.4, 17.2, 17.3, 17.4, 17.5_
  
  - [ ] 17.2 Write property test for paused state immutability
    - **Property 1: Paused State Immutability**
    - **Validates: Requirements 1.4**
    - Test that paused game doesn't update state
    - _Requirements: 1.4_
  
  - [ ] 17.3 Write unit tests for state transitions
    - Test pause state transition
    - Test resume state transition
    - Test new game state transition
    - _Requirements: 17.3, 17.4, 17.5_

- [ ] 18. Checkpoint - Engine complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. React components - CanvasGame
  - [ ] 19.1 Create `src/components/CanvasGame.tsx`
    - Implement CanvasGame component with canvas ref
    - Initialize GameEngine in useEffect
    - Set up engine callbacks to update React state
    - Implement `resizeCanvas(canvas)` helper function
    - Handle window resize events
    - Clean up engine on unmount
    - _Requirements: 14.4, 19.1, 19.4_
  
  - [ ] 19.2 Write property test for canvas aspect ratio
    - **Property 37: Canvas Aspect Ratio Maintenance**
    - **Validates: Requirements 14.4**
    - Test that canvas maintains 28:16 aspect ratio
    - _Requirements: 14.4_
  
  - [ ] 19.3 Write property test for canvas resize
    - **Property 38: Canvas Resize Recalculation**
    - **Validates: Requirements 19.4**
    - Test that resize events update canvas dimensions
    - _Requirements: 19.4_

- [ ] 20. React components - HUD
  - [ ] 20.1 Create `src/components/HUD.tsx`
    - Implement HUD component with props for level, score, highScore, lives, timer, muted
    - Display all game information using Tailwind CSS
    - Implement `formatTime(seconds)` helper
    - Add mute toggle button with onToggleMute callback
    - Use responsive Tailwind classes
    - _Requirements: 16.2, 16.3_

- [ ] 21. React components - Menu
  - [ ] 21.1 Create `src/components/Menu.tsx`
    - Implement Menu component with props for gameState, finalScore, callbacks
    - Render different menus based on gameState (Menu, Paused, GameOver, Victory)
    - Use Tailwind CSS for styling
    - Add buttons for New Game, Continue, Reset High Score, Resume, Quit
    - _Requirements: 16.1, 16.4, 16.5_

- [ ] 22. React components - MobileControls
  - [ ] 22.1 Create `src/components/MobileControls.tsx`
    - Implement MobileControls component with onInput callback
    - Detect touch device in useEffect
    - Render D-pad and action buttons only on touch devices
    - Handle touchStart and touchEnd events
    - Use Tailwind CSS for responsive layout
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 22.2 Write property test for touch input mapping
    - **Property 36: Touch Input Mapping**
    - **Validates: Requirements 13.5**
    - Test that touch events update input state
    - _Requirements: 13.5_

- [ ] 23. Main App integration
  - [ ] 23.1 Update `src/App.tsx` to integrate all components
    - Import all components (CanvasGame, HUD, Menu, MobileControls)
    - Manage game state in React (score, lives, level, timer, gameState, muted)
    - Wire up all callbacks between components and engine
    - Handle touch input forwarding to engine
    - Use Tailwind CSS for layout
    - _Requirements: 17.1, 17.2_
  
  - [ ] 23.2 Update `src/index.css` with Tailwind directives
    - Add @tailwind base, components, utilities
    - Add any custom global styles
    - _Requirements: 16.6_

- [ ] 24. Asset creation and integration
  - [ ] 24.1 Create placeholder sprite sheets
    - Create `public/assets/sprites/player.png` (16x16 frames)
    - Create `public/assets/sprites/enemy.png` (16x16 frames)
    - Create `public/assets/sprites/tiles.png` (16x16 frames)
    - Use simple colored rectangles as placeholders
    - _Requirements: 14.6_
  
  - [ ] 24.2 Create placeholder sound effects
    - Create `public/assets/sfx/dig.mp3`
    - Create `public/assets/sfx/gold.mp3`
    - Create `public/assets/sfx/death.mp3`
    - Create `public/assets/sfx/complete.mp3`
    - Create `public/assets/sfx/click.mp3`
    - Use simple beep sounds as placeholders
    - _Requirements: 11.6_

- [ ] 25. Complete level data
  - [ ] 25.1 Add remaining 90 levels to `src/game/levels.ts`
    - Design or import level data for levels 11-100
    - Ensure all levels are valid and playable
    - Set appropriate par times for each level
    - _Requirements: 9.1_

- [ ] 26. Final integration testing
  - [ ] 26.1 Write integration tests
    - Test full game flow: start game, collect gold, complete level
    - Test death and restart flow
    - Test game over flow
    - Test pause and resume flow
    - Test high score persistence across sessions
    - _Requirements: 6.5, 7.3, 7.4, 10.1, 17.4, 17.5_

- [ ] 27. Final checkpoint - Complete game
  - Run all tests and ensure 100% pass
  - Test game manually in browser
  - Test on mobile device or emulator
  - Verify all 100 levels are playable
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: core systems → game mechanics → rendering → UI → integration
