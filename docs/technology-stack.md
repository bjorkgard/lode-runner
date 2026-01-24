# Technology Stack

## Core Technologies

### React 19.2.0
- UI library with StrictMode enabled
- Modern hooks-based architecture
- Fast Refresh for instant feedback during development

### TypeScript 5.9.3
- Type-safe JavaScript with full type coverage
- Project references for optimized builds
- Strict mode enabled for maximum type safety

### Vite 7.2.4
- Lightning-fast build tool and dev server
- Hot Module Replacement (HMR) support
- Optimized production builds with code splitting

### Tailwind CSS 4.1.18
- Utility-first CSS framework
- Responsive design utilities
- Custom configuration for game UI

## Testing Stack

### Vitest 4.0.18
- Fast unit test framework compatible with Vite
- Jest-compatible API
- Native ESM support
- 316 passing tests with 100% pass rate

### fast-check 4.5.3
- Property-based testing library
- Generates hundreds of test cases automatically
- Used for testing game logic invariants

### @testing-library/react 16.3.2
- React component testing utilities
- User-centric testing approach
- Integration with Vitest

### jsdom 27.4.0
- DOM implementation for Node.js
- Enables testing of browser APIs
- Canvas, localStorage, and Audio API mocks

## Development Tools

### ESLint
- Code quality and consistency
- TypeScript and React plugins
- React Hooks linting rules

### TypeScript Compiler
- Project references (tsconfig.app.json, tsconfig.node.json)
- Separate configs for app and build tools
- Incremental compilation

## Build Configuration

### Vite Configuration
- React plugin with Fast Refresh
- Development server with HMR
- Production optimizations

### TypeScript Configuration
- Root config orchestrates project references
- App-specific settings in tsconfig.app.json
- Build tool settings in tsconfig.node.json

## Common Commands

```bash
# Start development server with HMR
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Run ESLint on all files
npm run lint

# Preview production build locally
npm run preview

# Run test suite
npm test
```

## Browser Support

- Modern browsers with ES2020+ support
- Canvas 2D API required
- localStorage API for persistence
- Web Audio API for sound effects
- Touch events for mobile controls
