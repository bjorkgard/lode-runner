# Lode Runner Browser Game

![Tests](https://img.shields.io/badge/tests-30%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff)
![Progress](https://img.shields.io/badge/tasks-3%2F27%20complete-yellow)

A browser-based recreation of the classic Lode Runner game built with React 19, TypeScript 5.9, and Canvas 2D rendering. Features 100 levels, enemy AI, property-based testing, and mobile touch controls.

## Features

### Implemented ✅
- **Type System**: Complete TypeScript type definitions for all game entities and state
- **Constants System**: Configurable game constants (speeds, timers, scoring)
- **Level System**: 100 complete levels with validation and loading
  - 10 hand-designed tutorial/introductory levels
  - 90 procedurally generated levels with progressive difficulty
  - Level validation and error handling
  - Gold counting and spawn position management
- **Test Infrastructure**: Comprehensive test suite with 30 passing tests
  - Property-based testing with fast-check
  - Unit tests for all implemented modules
  - Canvas, localStorage, and Audio API mocks

### In Progress 🚧
- Game state management
- Physics and collision detection
- Player and enemy movement

### Planned 📋
- **Classic Gameplay**: Digging, hole regeneration, and enemy AI
- **Mobile Support**: Touch controls with responsive design
- **Persistent Storage**: High scores and settings saved to localStorage
- **Audio System**: Sound effects with volume control and mute toggle
- **Particle Effects**: Visual feedback for gold collection
- **60 FPS Performance**: Optimized game loop with minimal React re-renders

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Documentation

- **[Getting Started](docs/getting-started.md)** - Installation, setup, and browser support
- **[Architecture](docs/architecture.md)** - System architecture and design patterns
- **[Project Structure](docs/project-structure.md)** - Directory organization and file descriptions
- **[Game Mechanics](docs/game-mechanics.md)** - Gameplay, controls, and level system
- **[Testing](docs/testing.md)** - Testing strategy and test coverage
- **[API Reference](docs/api-reference.md)** - API documentation and type definitions
- **[Configuration](docs/configuration.md)** - Configuration files and settings
- **[Contributing](docs/contributing.md)** - Development workflow and guidelines

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

## Specifications

This project follows a spec-driven development approach:

- **[Requirements](.kiro/specs/lode-runner-game/requirements.md)** - 20 detailed requirements with acceptance criteria
- **[Design](.kiro/specs/lode-runner-game/design.md)** - Architecture diagrams and component interfaces
- **[Tasks](.kiro/specs/lode-runner-game/tasks.md)** - 27 incremental implementation tasks

## License

MIT

## Acknowledgments

- Original Lode Runner game by Doug Smith (1983)
- Built with React, TypeScript, and Vite
- Property-based testing with fast-check
