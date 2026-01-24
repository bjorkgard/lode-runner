# Project Structure

```
lode-runner/
├── .kiro/
│   └── specs/lode-runner-game/    # Specification documents
│       ├── requirements.md         # 20 detailed requirements
│       ├── design.md              # Architecture and design
│       └── tasks.md               # Implementation plan (27 tasks)
├── docs/                          # Documentation
│   ├── getting-started.md         # Installation and setup
│   ├── architecture.md            # System architecture
│   ├── project-structure.md       # This file
│   ├── game-mechanics.md          # Gameplay documentation
│   ├── testing.md                 # Testing strategy
│   ├── api-reference.md           # API documentation
│   ├── configuration.md           # Configuration guide
│   └── contributing.md            # Development guide
├── src/
│   ├── game/                      # Game engine (pure TypeScript)
│   │   ├── types.ts              # ✅ Core type definitions
│   │   ├── constants.ts          # ✅ Game constants
│   │   ├── levels.ts             # ✅ 100 level definitions
│   │   ├── levels.test.ts        # ✅ Level system tests (28 tests)
│   │   ├── state.ts              # ✅ State management
│   │   ├── state.test.ts         # ✅ State management tests (18 tests)
│   │   ├── physics.ts            # ✅ Movement and collision detection
│   │   ├── physics.test.ts       # ✅ Physics system tests (16 tests)
│   │   ├── animation.ts          # ✅ Sprite animation system
│   │   ├── animation.test.ts     # ✅ Animation tests (22 tests)
│   │   ├── errors.ts             # ✅ Error handling system
│   │   ├── errors.test.ts        # ✅ Error handling tests (29 tests)
│   │   ├── digging.ts            # ✅ Hole creation/regeneration
│   │   ├── digging.test.ts       # ✅ Digging system tests (16 tests)
│   │   ├── ai.ts                 # ✅ Enemy pathfinding
│   │   ├── ai.test.ts            # ✅ AI system tests (14 tests)
│   │   ├── rules.ts              # ✅ Win/loss conditions
│   │   ├── rules.test.ts         # ✅ Game rules tests (13 tests)
│   │   ├── input.ts              # ✅ Keyboard/touch input
│   │   ├── input.test.ts         # ✅ Input handling tests (21 tests)
│   │   ├── storage.ts            # ✅ localStorage persistence
│   │   ├── storage.test.ts       # ✅ Storage system tests (15 tests)
│   │   ├── sprites.ts            # ✅ Sprite/animation system
│   │   ├── sprites.test.ts       # ✅ Sprite system tests (8 tests)
│   │   ├── audio.ts              # ✅ Sound effects
│   │   ├── audio.test.ts         # ✅ Audio system tests (11 tests)
│   │   ├── particles.ts          # ✅ Particle effects
│   │   ├── particles.test.ts     # ✅ Particle system tests (15 tests)
│   │   ├── render.ts             # ✅ Canvas 2D rendering
│   │   ├── render.test.ts        # ✅ Rendering system tests (12 tests)
│   │   ├── engine.ts             # ✅ Main game loop
│   │   └── engine.test.ts        # ✅ Game engine tests (8 tests)
│   ├── components/               # React components
│   │   ├── CanvasGame.tsx       # ✅ Canvas wrapper
│   │   ├── CanvasGame.test.tsx  # ✅ CanvasGame tests (8 tests)
│   │   ├── HUD.tsx              # ✅ Score/lives display
│   │   ├── HUD.test.tsx         # ✅ HUD tests (6 tests)
│   │   ├── Menu.tsx             # ✅ Menus and screens
│   │   └── MobileControls.tsx   # ✅ Touch controls
│   │       └── MobileControls.test.tsx # ✅ MobileControls tests (5 tests)
│   ├── test/                     # Test setup
│   │   ├── setup.ts             # ✅ Vitest configuration
│   │   ├── setup.test.ts        # ✅ Setup validation tests (5 tests)
│   │   └── helpers.ts           # ✅ Test helper functions
│   ├── App.tsx                   # ✅ Root component
│   └── main.tsx                  # Entry point
├── public/
│   └── assets/                   # Game assets
│       ├── sprites/              # Sprite sheets
│       └── sfx/                  # Sound effects
└── dist/                         # Build output
```

## Directory Descriptions

### `.kiro/specs/`
Contains the complete specification documents for the game:
- **requirements.md**: 20 detailed requirements with acceptance criteria
- **design.md**: Architecture diagrams, component interfaces, and data models
- **tasks.md**: 27 incremental implementation tasks with requirements traceability

### `docs/`
Project documentation organized by topic. See individual files for details.

### `src/game/`
Pure TypeScript game engine, independent of React. Contains all game logic, physics, AI, and rendering code.

**Implemented Modules**:
- `types.ts` - Complete type definitions for all game entities
- `constants.ts` - Game configuration constants
- `levels.ts` - 100 level definitions with validation
- `state.ts` - Game state initialization and management
- `physics.ts` - Movement, gravity, and collision detection
- `animation.ts` - Sprite animation state management
- `errors.ts` - Comprehensive error handling system
- `digging.ts` - Hole creation and regeneration mechanics
- `ai.ts` - Enemy pathfinding and chase behavior
- `rules.ts` - Win/loss conditions and level progression
- `input.ts` - Keyboard and touch input handling
- `storage.ts` - localStorage persistence for high scores and settings
- `sprites.ts` - Sprite sheet loading and animation definitions
- `audio.ts` - Sound effect management with volume control
- `particles.ts` - Particle effects system with object pooling
- `render.ts` - Canvas 2D rendering with sprite animations
- `engine.ts` - Main game loop with requestAnimationFrame

**Planned Modules**:
None - all core game modules are complete!

### `src/components/`
React components for UI, menus, and mobile controls. Uses Tailwind CSS for styling.

**Implemented Components**:
- `CanvasGame.tsx` - Canvas wrapper with engine initialization and resize handling
- `HUD.tsx` - Score, lives, level, timer, and mute toggle display
- `Menu.tsx` - Main menu, pause menu, game over, and victory screens
- `MobileControls.tsx` - Touch controls with automatic device detection

All components include comprehensive JSDoc documentation.

### `src/test/`
Test configuration and setup files for Vitest and jsdom.

### `public/assets/`
Static game assets including sprite sheets and sound effects.

### `dist/`
Build output directory (gitignored). Generated by `npm run build`.
