# Contributing Guide

This project follows a spec-driven development approach with comprehensive documentation and testing.

## Development Process

### 1. Review Specifications

Before starting work, review the specification documents:

- **Requirements** (`.kiro/specs/lode-runner-game/requirements.md`)
  - 20 detailed requirements with acceptance criteria
  - User stories for each feature
  - Traceability to design and implementation

- **Design** (`.kiro/specs/lode-runner-game/design.md`)
  - Architecture diagrams and component interfaces
  - Data models and algorithms
  - 45 correctness properties for testing

- **Tasks** (`.kiro/specs/lode-runner-game/tasks.md`)
  - 27 incremental implementation tasks
  - Each task references specific requirements
  - Checkpoints for validation

### 2. Test-Driven Development

Follow TDD practices:

1. Write property-based tests for universal correctness properties
2. Write unit tests for specific examples and edge cases
3. Implement functionality to make tests pass
4. All tests must pass before marking a task complete

### 3. Code Quality Standards

- Follow TypeScript strict mode guidelines
- Add JSDoc comments for all public APIs
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Avoid premature optimization

### 4. Testing Requirements

- Property-based tests use `fast-check` library
- Unit tests use `vitest` and `@testing-library/react`
- Aim for high code coverage (>80%)
- Test both happy paths and error cases

## Current Implementation Status

### Completed Tasks (3/27)

- ✅ Task 1: Project setup and dependencies
- ✅ Task 2: Core type definitions and constants
- ✅ Task 3: Level data and loading system

### Next Tasks

- Task 4: Game state management
- Task 5: Physics and movement system

See `.kiro/specs/lode-runner-game/tasks.md` for complete task list with requirements traceability.

## Code Style

### General Principles

- Use functional programming patterns where appropriate
- Prefer immutability for data structures
- Use TypeScript interfaces over types for object shapes
- Export types and interfaces for reusability
- Keep game logic separate from React components

### Naming Conventions

- **Files**: kebab-case for files (e.g., `game-engine.ts`)
- **Components**: PascalCase for React components (e.g., `CanvasGame.tsx`)
- **Functions**: camelCase for functions (e.g., `loadLevel`)
- **Constants**: UPPER_SNAKE_CASE for constants (e.g., `TILE_SIZE`)
- **Types/Interfaces**: PascalCase for types (e.g., `GameStateData`)

### File Organization

```typescript
// 1. Imports
import { type Level, TileType } from './types';
import { TILE_SIZE } from './constants';

// 2. Type definitions (if any)
interface LocalType {
  // ...
}

// 3. Constants (if any)
const LOCAL_CONSTANT = 42;

// 4. Main implementation
export function myFunction() {
  // ...
}

// 5. Helper functions (not exported)
function helperFunction() {
  // ...
}
```

## Commit Guidelines

### Commit Message Format

```
Task X.Y: Brief description

Detailed explanation of changes (if needed)

- Bullet points for multiple changes
- Reference requirements if applicable
```

### Examples

```
Task 3.1: Add level data for levels 1-10

Implemented 10 hand-designed tutorial levels with progressive difficulty.
Each level includes unique tile layouts, enemy spawns, and par times.
```

```
Task 3.3: Add property test for level loading

Implemented Property 2: Level Data Integrity test using fast-check.
Validates that loading any valid level produces correct state.
```

### Commit Best Practices

- Keep commits focused on single tasks or subtasks
- Run tests before committing (`npm test`)
- Update task status in `tasks.md` when completing work
- Reference task numbers in commit messages

## Pull Request Process

1. Ensure all tests pass (`npm test`)
2. Run linter (`npm run lint`)
3. Update documentation if needed
4. Reference task number in PR title
5. Describe changes and testing performed
6. Link to related requirements/design sections

## Development Workflow

### Starting a New Task

1. Read the task description in `tasks.md`
2. Review referenced requirements in `requirements.md`
3. Check design specifications in `design.md`
4. Create a new branch: `task-X-description`
5. Write tests first (TDD)
6. Implement functionality
7. Verify all tests pass
8. Update task status in `tasks.md`

### Running Tests

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

### Development Server

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Questions or Issues?

- Check the specification documents in `.kiro/specs/lode-runner-game/`
- Review existing tests for examples
- Consult the architecture documentation in `docs/architecture.md`
- Check the API reference in `docs/api-reference.md`

## License

MIT - See LICENSE file for details
