# Configuration

## Game Constants

All game constants are defined in `src/game/constants.ts`:

| Constant | Value | Description |
|----------|-------|-------------|
| `TILE_SIZE` | 16 | Size of each tile in pixels |
| `GRAVITY` | 500 | Gravity acceleration (px/s²) |
| `PLAYER_SPEED` | 100 | Player movement speed (px/s) |
| `ENEMY_SPEED` | 80 | Enemy movement speed (px/s) |
| `HOLE_REGEN_TIME` | 5 | Hole regeneration time (seconds) |
| `GOLD_POINTS` | 100 | Points per gold piece |
| `TIME_BONUS_MULTIPLIER` | 10 | Time bonus multiplier |
| `COLLISION_THRESHOLD` | 0.5 | Collision detection threshold (tiles) |
| `MAX_LEVELS` | 100 | Total number of levels |

## Vite Configuration

The project uses Vitest for testing with jsdom environment:

```typescript
// vite.config.ts
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

### Configuration Options

- **plugins**: Uses `@vitejs/plugin-react` for Fast Refresh
- **test.globals**: Enables global test APIs (describe, it, expect)
- **test.environment**: Uses jsdom for DOM simulation
- **test.setupFiles**: Runs setup file before tests
- **test.css**: Enables CSS processing in tests

## TypeScript Configuration

Project uses TypeScript project references for optimized builds:

### Root Configuration (`tsconfig.json`)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### Application Configuration (`tsconfig.app.json`)

- Target: ES2020
- Module: ESNext
- Strict mode enabled
- JSX: react-jsx
- Includes: src/**/*

### Node Configuration (`tsconfig.node.json`)

- Target: ES2022
- Module: ESNext
- For build tools and configuration files
- Includes: vite.config.ts, etc.

## Tailwind Configuration

Configured for React components with PostCSS:

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

### Content Paths

Tailwind scans these paths for class names:
- `./index.html`
- `./src/**/*.{js,ts,jsx,tsx}`

## ESLint Configuration

Uses flat config format with TypeScript and React plugins:

```javascript
// eslint.config.js
export default [
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

## Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### Script Descriptions

- **dev**: Start development server with HMR
- **build**: TypeScript compilation + Vite production build
- **lint**: Run ESLint on all files
- **preview**: Preview production build locally
- **test**: Run tests with Vitest
- **test:ui**: Run tests with Vitest UI

## Environment Variables

Currently no environment variables are used. Future configuration may include:

- API endpoints (if backend is added)
- Feature flags
- Analytics keys
- Asset CDN URLs
