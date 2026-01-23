# Performance Optimizations

This document describes the performance optimizations implemented in the Lode Runner game engine.

## Overview

The game engine has been optimized to minimize unnecessary memory allocations and improve lookup performance. These optimizations maintain the immutable functional programming style while significantly reducing computational overhead.

## Optimizations Implemented

### 1. Set-Based Hole Position Lookup (O(1) vs O(n))

**Problem**: Checking if a hole exists at a position required iterating through all holes.

**Solution**: Added a `holePositions: Set<string>` field to `GameStateData` that stores hole positions as "x,y" strings.

**Impact**:
- Hole existence check: O(n) → O(1)
- Particularly beneficial when multiple holes exist
- Minimal memory overhead (Set of strings)

**Implementation**:
```typescript
// Before: O(n) linear search
const holeExists = state.holes.some(
  h => h.pos.x === digPos.x && h.pos.y === digPos.y
);

// After: O(1) Set lookup
const posKey = `${digPos.x},${digPos.y}`;
if (state.holePositions.has(posKey)) {
  return state; // Hole already exists
}
```

### 2. Structural Sharing for Tile Grid Updates

**Problem**: Deep copying the entire tile grid (28×16 = 448 tiles) on every modification was wasteful.

**Solution**: Only copy the specific rows that are modified, sharing references to unchanged rows.

**Impact**:
- Tile updates: 448 array copies → 1-2 array copies
- ~99% reduction in array allocations for typical updates
- Maintains immutability while improving performance

**Implementation**:
```typescript
// Before: Deep copy entire grid
const updatedTiles = state.tiles.map(row => [...row]);
updatedTiles[y][x] = newValue;

// After: Structural sharing - only copy modified row
const updatedTiles = state.tiles.map((row, rowY) => 
  rowY === y ? [...row] : row  // Only copy the changed row
);
updatedTiles[y][x] = newValue;
```

### 3. Conditional Tile Grid Updates

**Problem**: Creating new tile arrays even when no changes occurred.

**Solution**: Track whether changes were made and only create new arrays when necessary.

**Impact**:
- Eliminates unnecessary allocations when no holes regenerate
- Reduces garbage collection pressure
- Improves frame consistency

**Implementation**:
```typescript
let hasChanges = false;
const tilesToUpdate = new Map<number, TileType[]>();

// ... process holes ...

if (hole.regenerationTimer <= 0) {
  hasChanges = true;
  if (!tilesToUpdate.has(hole.pos.y)) {
    tilesToUpdate.set(hole.pos.y, [...state.tiles[hole.pos.y]]);
  }
  // ... update tile ...
}

// Only create new array if changes were made
const updatedTiles = hasChanges
  ? state.tiles.map((row, y) => tilesToUpdate.get(y) || row)
  : state.tiles;  // Reuse existing array
```

## Performance Characteristics

### Before Optimizations

| Operation | Complexity | Allocations |
|-----------|-----------|-------------|
| Check hole exists | O(n) | 0 |
| Dig hole | O(1) | 448 arrays |
| Update holes | O(n) | 448 arrays |
| Collect gold | O(1) | 448 arrays |

### After Optimizations

| Operation | Complexity | Allocations |
|-----------|-----------|-------------|
| Check hole exists | O(1) | 0 |
| Dig hole | O(1) | 1 array + 1 Set |
| Update holes | O(n) | 0-n arrays |
| Collect gold | O(1) | 1 array |

## Memory Usage

### Additional Memory

- `holePositions` Set: ~50 bytes per hole (typical: 0-5 holes = 0-250 bytes)
- Negligible compared to tile grid: 448 tiles × 4 bytes = 1,792 bytes

### Memory Saved

- Avoided deep copies: ~1,792 bytes per frame when no changes
- Structural sharing: ~1,700 bytes saved per single-tile update

## Benchmark Expectations

Based on the optimizations, we expect:

1. **Hole Operations**: 10-100x faster for hole existence checks
2. **Tile Updates**: 50-90% reduction in memory allocations
3. **Frame Time**: 5-15% improvement in overall frame time
4. **GC Pressure**: 40-60% reduction in garbage collection frequency

## Future Optimization Opportunities

### 1. Tile Grid Immutable Data Structure

Consider using an immutable data structure library (e.g., Immutable.js) for the tile grid to get automatic structural sharing.

**Pros**:
- Automatic structural sharing at all levels
- Optimized for frequent updates
- Persistent data structure benefits

**Cons**:
- Additional dependency
- Learning curve
- Potential bundle size increase

### 2. Object Pooling for Entities

Reuse enemy and particle objects instead of creating new ones.

**Pros**:
- Eliminates allocation overhead
- Reduces GC pressure

**Cons**:
- More complex state management
- Requires careful reset logic

### 3. Spatial Partitioning for Collision Detection

Use a grid-based spatial hash for entity lookups.

**Pros**:
- O(1) entity queries by position
- Scales better with many entities

**Cons**:
- Additional memory overhead
- More complex to maintain

### 4. Memoization for Expensive Calculations

Cache results of expensive calculations like pathfinding.

**Pros**:
- Avoids redundant calculations
- Improves AI performance

**Cons**:
- Cache invalidation complexity
- Memory overhead

## Testing

All optimizations maintain the existing test suite with 161 passing tests (100% pass rate). The immutable functional programming style is preserved, ensuring:

- Predictable state updates
- Easy debugging and time-travel
- React-friendly state management
- No side effects

## Conclusion

These optimizations provide significant performance improvements while maintaining code quality and immutability. The game engine is now well-positioned to handle 60 FPS gameplay with multiple entities and frequent state updates.
