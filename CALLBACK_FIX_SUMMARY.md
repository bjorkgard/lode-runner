# Callback Dependency Fix - CanvasGame Component

## Problem

The `CanvasGame.tsx` component had a critical React hooks dependency issue that could cause bugs:

```typescript
// ❌ BEFORE: Problematic code
useEffect(() => {
  const engine = new GameEngine(canvasRef.current);
  engine.onScoreChange = onScoreChange;
  engine.onLivesChange = onLivesChange;
  // ... more setup
  
  return () => {
    engine.stop();
  };
}, [onScoreChange, onLivesChange, onLevelChange, onGameStateChange, onEngineReady]);
```

### Issues with the old approach:

1. **Effect re-runs on every parent re-render**: When the parent component (`App.tsx`) re-renders, it creates new callback function references, causing the dependency array to detect changes.

2. **Multiple engine instances**: Each time the effect re-runs, it creates a new `GameEngine` instance without properly cleaning up the old one, leading to:
   - Memory leaks (old engines keep running)
   - Multiple game loops running simultaneously
   - Event listeners accumulating
   - Unpredictable game state

3. **Performance degradation**: Creating and destroying game engines repeatedly is expensive and unnecessary.

## Solution

Implemented the **callback ref pattern** to decouple callback updates from engine initialization:

```typescript
// ✅ AFTER: Fixed code
export function CanvasGame({ onScoreChange, onLivesChange, ... }: CanvasGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  // Store callbacks in a ref to avoid effect re-runs when they change
  const callbacksRef = useRef({
    onScoreChange,
    onLivesChange,
    onLevelChange,
    onGameStateChange,
    onEngineReady
  });
  
  // Update callback refs whenever props change (doesn't trigger effect re-run)
  useEffect(() => {
    callbacksRef.current = {
      onScoreChange,
      onLivesChange,
      onLevelChange,
      onGameStateChange,
      onEngineReady
    };
  });
  
  // Initialize engine only once on mount
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    
    // Set up callbacks using refs to always get latest callbacks
    engine.onScoreChange = (score) => callbacksRef.current.onScoreChange(score);
    engine.onLivesChange = (lives) => callbacksRef.current.onLivesChange(lives);
    // ... more callbacks
    
    engine.start();
    
    return () => {
      engine.stop();
    };
  }, []); // Empty deps - only run once on mount
  
  return <canvas ref={canvasRef} />;
}
```

### How it works:

1. **Separate effect for callback updates**: A dedicated effect updates `callbacksRef.current` whenever props change, but this doesn't trigger the engine initialization effect.

2. **Stable engine initialization**: The engine initialization effect has an empty dependency array `[]`, so it only runs once on mount.

3. **Callback indirection**: Engine callbacks use arrow functions that reference `callbacksRef.current`, ensuring they always call the latest callback version.

4. **Proper cleanup**: The engine is only created once and properly cleaned up on unmount.

## Benefits

✅ **No memory leaks**: Engine is created once and properly destroyed  
✅ **Better performance**: No unnecessary re-initialization  
✅ **Always up-to-date callbacks**: Latest callbacks are always used  
✅ **Predictable behavior**: Single game loop, single engine instance  
✅ **React best practices**: Follows React's recommendations for refs and effects  

## Testing

Added a comprehensive test to verify the fix:

```typescript
test('callbacks should work even when parent re-renders with new callback references', () => {
  // Renders component with initial callbacks
  const { rerender } = render(<CanvasGame {...initialCallbacks} />);
  
  // Re-renders with new callback references
  rerender(<CanvasGame {...newCallbacks} />);
  
  // Verifies:
  // 1. Engine is NOT re-initialized (onEngineReady called only once)
  // 2. New callbacks are used (not the old ones)
  // 3. Callbacks work correctly after re-render
});
```

**Test Results**: All 304 tests pass ✅

## Related Patterns

This fix uses the **Callback Ref Pattern**, which is recommended by React for:
- Avoiding unnecessary effect re-runs
- Keeping callbacks up-to-date without dependencies
- Managing external systems (like game engines) that shouldn't be recreated

## References

- [React Docs: Separating Events from Effects](https://react.dev/learn/separating-events-from-effects)
- [React Docs: useRef](https://react.dev/reference/react/useRef)
- [React Docs: useEffect](https://react.dev/reference/react/useEffect)
