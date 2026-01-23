# Testing Strategy

The project uses a comprehensive testing approach with **48 passing tests** (100% pass rate).

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

### Unit Tests

Specific examples and edge cases for individual functions and modules.

**Currently Implemented**: 48 tests
- Test setup validation (5 tests)
- Level system validation (25 tests)
- State management validation (18 tests)

**Planned**:
- State management tests
- Physics and collision tests
- Digging system tests
- AI behavior tests
- Rules and win/loss condition tests
- Input handling tests
- Storage persistence tests
- Audio system tests
- Rendering tests

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
| Levels | 25 | ✅ Complete |
| State Management | 18 | ✅ Complete |
| Physics | 0 | ⏳ Pending |
| Digging | 0 | ⏳ Pending |
| AI | 0 | ⏳ Pending |
| Rules | 0 | ⏳ Pending |
| Input | 0 | ⏳ Pending |
| Storage | 0 | ⏳ Pending |
| Audio | 0 | ⏳ Pending |
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
