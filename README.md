# Lode Runner Browser Game

![Tests](https://img.shields.io/badge/tests-5%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff)

A browser-based recreation of the classic Lode Runner game built with React 19, TypeScript 5.9, and Canvas 2D rendering. Features 100 levels, enemy AI, property-based testing, and mobile touch controls.

## Features

- **Classic Gameplay**: Faithful recreation of Lode Runner mechanics including digging, hole regeneration, and enemy AI
- **100 Levels**: Progressive difficulty with unique level designs
- **Mobile Support**: Touch controls with responsive design for phones and tablets
- **Property-Based Testing**: Comprehensive test suite using fast-check for correctness validation
- **Persistent Storage**: High scores and settings saved to localStorage
- **Audio System**: Sound effects with volume control and mute toggle
- **Particle Effects**: Visual feedback for gold collection
- **60 FPS Performance**: Optimized game loop with minimal React re-renders

## Technology Stack

### Core
- **React 19.2.0** - UI library with StrictMode enabled
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Build tool with HMR support
- **Tailwind CSS 4.1.18** - Utility-first CSS framework

### Testing
- **Vitest 4.0.18** - Fast unit test framework
- **fast-check 4.5.3** - Property-based testing library
- **@testing-library/react 16.3.2** - React component testing utilities
- **jsdom 27.4.0** - DOM implementation for Node.js

### Development
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing with Tailwind

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

## Project Structure

```
lode-runner/
├── .kiro/
│   └── specs/lode-runner-game/    # Specification documents
│       ├── requirements.md         # 20 detailed requirements
│       ├── design.md              # Architecture and design
│       └── tasks.md               # Implementation plan (27 tasks)
├── src/
│   ├── game/                      # Game engine (pure TypeScript)
│   │   ├── types.ts              # Core type definitions
│   │   ├── constants.ts          # Game constants
│   │   ├── engine.ts             # Main game loop
│   │   ├── state.ts              # State management
│   │   ├── physics.ts            # Movement and collision
│   │   ├── digging.ts            # Hole creation/regeneration
│   │   ├── ai.ts                 # Enemy pathfinding
│   │   ├── rules.ts              # Win/loss conditions
│   │   ├── levels.ts             # 100 level definitions
│   │   ├── render.ts             # Canvas 2D rendering
│   │   ├── sprites.ts            # Sprite/animation system
│   │   ├── particles.ts          # Particle effects
│   │   ├── input.ts              # Keyboard/touch input
│   │   ├── audio.ts              # Sound effects
│   │   └── storage.ts            # localStorage persistence
│   ├── components/               # React components
│   │   ├── CanvasGame.tsx       # Canvas wrapper
│   │   ├── HUD.tsx              # Score/lives display
│   │   ├── Menu.tsx             # Menus and screens
│   │   └── MobileControls.tsx   # Touch controls
│   ├── test/                     # Test setup
│   │   ├── setup.ts             # Vitest configuration
│   │   └── setup.test.ts        # Setup validation tests
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── public/
│   └── assets/                   # Game assets
│       ├── sprites/              # Sprite sheets
│       └── sfx/                  # Sound effects
└── dist/                         # Build output
```

## Architecture

The game follows a layered architecture with clear separation of concerns:

### Game Engine Layer (Pure TypeScript)
- Independent of React, runs in requestAnimationFrame loop
- Manages game state, physics, AI, and rules
- 60 FPS target with delta time calculations
- Minimal garbage collection through object pooling

### Rendering Layer (Canvas 2D)
- Pixel-perfect rendering with disabled image smoothing
- Sprite-based animations for player and enemies
- Particle system for visual effects
- Efficient tile-based rendering

### UI Layer (React + Tailwind)
- Minimal re-renders using refs for game state
- Responsive design for desktop and mobile
- Touch controls with device detection
- HUD and menu components

### Infrastructure Layer
- Input handling (keyboard + touch)
- Audio management with Web Audio API
- localStorage persistence
- Error handling and graceful degradation

## Game Mechanics

### Controls

**Desktop (Keyboard)**:
- Arrow Keys / WASD - Move player
- Z / Q - Dig left
- X / E - Dig right
- P / Escape - Pause

**Mobile (Touch)**:
- On-screen D-pad for movement
- Dig left/right buttons

### Gameplay

1. Collect all gold pieces in the level
2. Avoid or trap enemies by digging holes
3. Reach the exit ladder after collecting all gold
4. Complete all 100 levels

### Tile Types

- **Brick** - Diggable tiles that regenerate after 5 seconds
- **Steel** - Solid, non-diggable tiles
- **Ladder** - Climbable vertical movement
- **Rope** - Horizontal traversal
- **Gold** - Collectible items (100 points each)
- **Exit** - Level completion (revealed after all gold collected)

## Testing Strategy

The project uses a comprehensive testing approach:

### Property-Based Tests (45 properties)
- Universal correctness properties validated across all inputs
- Examples: gravity application, collision detection, hole regeneration
- Uses fast-check for generative testing

### Unit Tests
- Specific examples and edge cases
- State initialization, transitions, and error handling
- Component rendering and interaction

### Integration Tests
- Full game flow validation
- Persistence across sessions
- Multi-level progression

## Development Workflow

### Spec-Driven Development

This project follows a requirements → design → tasks workflow:

1. **Requirements** (.kiro/specs/lode-runner-game/requirements.md)
   - 20 detailed requirements with acceptance criteria
   - User stories for each feature
   - Traceability to design and implementation

2. **Design** (.kiro/specs/lode-runner-game/design.md)
   - Architecture diagrams and component interfaces
   - Data models and algorithms
   - 45 correctness properties for testing

3. **Tasks** (.kiro/specs/lode-runner-game/tasks.md)
   - 27 incremental implementation tasks
   - Each task references specific requirements
   - Checkpoints for validation

### Implementation Status

- ✅ Task 1: Project setup and dependencies (COMPLETE)
- ⏳ Tasks 2-27: In progress (see tasks.md for details)

## Configuration

### Vite Configuration

The project uses Vitest for testing with jsdom environment:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

### TypeScript Configuration

Project references for optimized builds:
- `tsconfig.json` - Root configuration
- `tsconfig.app.json` - Application code
- `tsconfig.node.json` - Build tools

### Tailwind Configuration

Configured for React components with PostCSS:

```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

## Performance Optimizations

- **Minimal React Re-renders**: Game state stored in refs, not React state
- **Object Pooling**: Particle system reuses objects to avoid GC pauses
- **Sprite Batching**: Efficient canvas rendering with minimal draw calls
- **Delta Time Physics**: Frame-independent movement calculations
- **Lazy Loading**: Assets loaded asynchronously at initialization

## Browser Support

- Modern browsers with Canvas 2D API support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile browsers with touch event support

## Contributing

This project follows a spec-driven development approach. To contribute:

1. Review requirements and design documents in `.kiro/specs/lode-runner-game/`
2. Check tasks.md for current implementation status
3. Write tests before implementation (TDD)
4. Ensure all property-based tests pass
5. Follow TypeScript strict mode guidelines

## License

MIT

## Acknowledgments

- Original Lode Runner game by Doug Smith (1983)
- Built with React, TypeScript, and Vite
- Property-based testing with fast-check
