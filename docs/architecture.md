# Architecture

The game follows a layered architecture with clear separation of concerns:

## High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                     React App Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │
│  │   Menu   │  │   HUD    │  │  MobileControls     │  │
│  └──────────┘  └──────────┘  └─────────────────────┘  │
│         │            │                  │               │
│         └────────────┴──────────────────┘               │
│                      │                                   │
│              ┌───────▼────────┐                         │
│              │  CanvasGame    │                         │
│              │  (Component)   │                         │
│              └───────┬────────┘                         │
└──────────────────────┼──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Game Engine Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  State   │  │  Rules   │  │ Physics  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Digging  │  │    AI    │  │  Levels  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Rendering & Effects Layer                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Render  │  │ Sprites  │  │Particles │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Input   │  │  Audio   │  │ Storage  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## Layers

### Game Engine Layer (Pure TypeScript)
- Independent of React, runs in requestAnimationFrame loop
- Manages game state, physics, AI, and rules
- 60 FPS target with delta time calculations
- Minimal garbage collection through object pooling
- Comprehensive error handling with graceful degradation

### Rendering Layer (Canvas 2D)
- Pixel-perfect rendering with disabled image smoothing
- Sprite-based animations for player and enemies
- Particle system for visual effects
- Efficient tile-based rendering
- Fallback rendering on asset load failures

### UI Layer (React + Tailwind)
- Minimal re-renders using refs for game state
- Responsive design for desktop and mobile
- Touch controls with device detection
- HUD and menu components
- User-friendly error messages

### Infrastructure Layer
- Input handling (keyboard + touch)
- Audio management with Web Audio API
- localStorage persistence with error recovery
- Error handling and graceful degradation
- Asset loading with fallback strategies

## Error Handling Architecture

The game implements a comprehensive error handling system:

### Error Types
- **GameError**: Base class with timestamp and context
- **LevelLoadError**: Level loading failures
- **LevelValidationError**: Invalid level data
- **StorageError**: localStorage failures
- **AudioError**: Audio system failures
- **AssetLoadError**: Sprite/asset loading failures
- **InvalidStateError**: Invalid game state

### Error Handler
- Centralized error logging and recovery
- Error frequency tracking
- User-friendly message generation
- Configurable logging and notification
- Graceful degradation strategies

### Recovery Strategies
- **Storage failures**: Use default values, continue without persistence
- **Audio failures**: Continue without sound
- **Asset failures**: Use fallback rendering
- **Level failures**: Skip to next valid level
- **State errors**: Reset to safe state or show error screen

## Performance Optimizations

- **Minimal React Re-renders**: Game state stored in refs, not React state
- **Object Pooling**: Particle system reuses objects to avoid GC pauses
- **Sprite Batching**: Efficient canvas rendering with minimal draw calls
- **Delta Time Physics**: Frame-independent movement calculations
- **Lazy Loading**: Assets loaded asynchronously at initialization
- **Error Recovery**: Fast failure paths with minimal overhead
