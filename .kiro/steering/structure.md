# Project Structure

## Directory Organization

```
lode-runner/
├── src/                    # Application source code
│   ├── main.tsx           # Application entry point (renders App in StrictMode)
│   ├── App.tsx            # Root component
│   ├── App.css            # App component styles
│   ├── index.css          # Global styles
│   └── assets/            # Static assets (images, icons)
├── public/                # Public static files served at root
├── dist/                  # Build output (gitignored)
└── node_modules/          # Dependencies (gitignored)
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
