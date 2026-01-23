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

### Rendering Layer (Canvas 2D)
- Pixel-perfect rendering with disabled image smoothing
- Sprite-based animations for player and enemies
- Particle system for visual effects
- Efficient tile-based rendering

### UI Layer (React + Tailwind)
- Minimal re-renders using refs for game state
- Responsive design for desktop and mobile
- Touch controls with device detection
- HUD and menu components

### Infrastructure Layer
- Input handling (keyboard + touch)
- Audio management with Web Audio API
- localStorage persistence
- Error handling and graceful degradation

## Performance Optimizations

- **Minimal React Re-renders**: Game state stored in refs, not React state
- **Object Pooling**: Particle system reuses objects to avoid GC pauses
- **Sprite Batching**: Efficient canvas rendering with minimal draw calls
- **Delta Time Physics**: Frame-independent movement calculations
- **Lazy Loading**: Assets loaded asynchronously at initialization
