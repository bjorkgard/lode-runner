# Lode Runner Browser Game

![Tests](https://img.shields.io/badge/tests-316%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff)
![Progress](https://img.shields.io/badge/tasks-24%2F27%20complete-yellow)

A browser-based recreation of the classic Lode Runner game built with React 19, TypeScript 5.9, and Canvas 2D rendering. Features 100 levels, enemy AI, property-based testing, and mobile touch controls.

## Key Features

- **100 Levels** - Hand-designed tutorials and procedurally generated challenges
- **Enemy AI** - Pathfinding with Manhattan distance heuristic
- **Physics Engine** - Gravity, collision detection, and movement mechanics
- **Canvas Rendering** - Sprite animations with 60 FPS game loop
- **Mobile Support** - Touch controls with automatic device detection
- **Audio System** - Sound effects with volume control and mute toggle
- **State Persistence** - High scores and settings saved to localStorage
- **Property-Based Testing** - 316 passing tests with fast-check
- **Error Handling** - Graceful degradation and recovery
- **TypeScript** - Full type safety across the codebase

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

### Getting Started
- **[Getting Started](docs/getting-started.md)** - Installation, setup, and browser support
- **[Game Mechanics](docs/game-mechanics.md)** - Gameplay, controls, and level system

### Development
- **[Architecture](docs/architecture.md)** - System architecture and design patterns
- **[Project Structure](docs/project-structure.md)** - Directory organization and file descriptions
- **[API Reference](docs/api-reference.md)** - API documentation and type definitions
- **[Configuration](docs/configuration.md)** - Configuration files and settings
- **[Testing](docs/testing.md)** - Testing strategy and test coverage
- **[Contributing](docs/contributing.md)** - Development workflow and guidelines

### Project Specifications
- **[Requirements](.kiro/specs/lode-runner-game/requirements.md)** - 20 detailed requirements with acceptance criteria
- **[Design](.kiro/specs/lode-runner-game/design.md)** - Architecture diagrams and component interfaces
- **[Tasks](.kiro/specs/lode-runner-game/tasks.md)** - 27 incremental implementation tasks

### Additional Resources
- **[Changelog](docs/CHANGELOG.md)** - Version history and updates
- **[Technology Stack](docs/technology-stack.md)** - Core technologies and tools
- **[Implementation Status](docs/implementation-status.md)** - Feature completion tracking

## License

MIT

## Acknowledgments

- Original Lode Runner game by Doug Smith (1983)
- Built with React, TypeScript, and Vite
- Property-based testing with fast-check
