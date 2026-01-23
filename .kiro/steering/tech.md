# Technology Stack

## Core Technologies
- **React 19.2.0** - UI library with StrictMode enabled
- **TypeScript 5.9.3** - Type-safe JavaScript with project references
- **Vite 7.2.4** - Build tool and dev server with HMR support

## Build System
- **Vite** with `@vitejs/plugin-react` for Fast Refresh using Babel
- **TypeScript** compiler with project references (tsconfig.app.json, tsconfig.node.json)
- **ESLint** with TypeScript and React plugins for code quality

## Development Tools
- ESLint with recommended configs for TypeScript and React
- React Hooks linting rules
- React Refresh plugin for Vite

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
```

## Configuration Files
- `vite.config.ts` - Vite configuration
- `eslint.config.js` - ESLint flat config with TypeScript and React rules
- `tsconfig.json` - Root TypeScript config with project references
- `tsconfig.app.json` - App-specific TypeScript settings
- `tsconfig.node.json` - Node/build-specific TypeScript settings
