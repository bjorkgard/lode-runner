# Project Structure

## Directory Organization

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
│   ├── project-structure.md       # Directory organization
│   ├── game-mechanics.md          # Gameplay documentation
│   ├── testing.md                 # Testing strategy
│   ├── api-reference.md           # API documentation
│   ├── configuration.md           # Configuration guide
│   └── contributing.md            # Development guide
├── src/                           # Application source code
│   ├── game/                      # Game engine (pure TypeScript)
│   │   ├── types.ts              # Core type definitions
│   │   ├── constants.ts          # Game constants
│   │   ├── levels.ts             # 100 level definitions
│   │   └── *.ts                  # Other game modules (planned)
│   ├── components/               # React components (planned)
│   ├── test/                     # Test setup
│   │   ├── setup.ts             # Vitest configuration
│   │   └── setup.test.ts        # Setup validation tests
│   ├── main.tsx                  # Application entry point
│   ├── App.tsx                   # Root component
│   ├── App.css                   # App component styles
│   ├── index.css                 # Global styles
│   └── assets/                   # Static assets (images, icons)
├── public/                       # Public static files served at root
│   └── assets/                   # Game assets (sprites, sfx)
├── dist/                         # Build output (gitignored)
└── node_modules/                 # Dependencies (gitignored)
```

## Key Conventions

### Component Files
- React components use `.tsx` extension
- Component files are PascalCase (e.g., `App.tsx`)
- Co-located CSS files use same name (e.g., `App.css`)

### Entry Points
- `index.html` - HTML template with root div
- `src/main.tsx` - JavaScript entry point that mounts React app
- `src/App.tsx` - Root React component

### TypeScript Configuration
- Project uses TypeScript project references
- Separate configs for app code (`tsconfig.app.json`) and build tools (`tsconfig.node.json`)
- Root `tsconfig.json` orchestrates project references

### Build Artifacts
- Development server runs on Vite's default port
- Production builds output to `dist/` directory
- ESLint ignores `dist/` directory
