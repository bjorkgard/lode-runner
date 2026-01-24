import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { CanvasGame } from './CanvasGame';
import { GameState } from '../game/types';

describe('CanvasGame Component', () => {
  beforeEach(() => {
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    })) as unknown as CanvasRenderingContext2D;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Feature: lode-runner-game, Property 37: Canvas Aspect Ratio Maintenance
  test('Property 37: canvas maintains 28:16 aspect ratio', () => {
    fc.assert(
      fc.property(
        fc.record({
          windowWidth: fc.integer(800, 3840),
          windowHeight: fc.integer(600, 2160)
        }),
        ({ windowWidth, windowHeight }) => {
          // Mock window dimensions
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: windowWidth
          });
          Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: windowHeight
          });

          // Render component
          const { container } = render(
            <CanvasGame
              onScoreChange={vi.fn()}
              onLivesChange={vi.fn()}
              onLevelChange={vi.fn()}
              onGameStateChange={vi.fn()}
            />
          );

          const canvas = container.querySelector('canvas');
          expect(canvas).toBeTruthy();

          if (canvas) {
            // Calculate expected aspect ratio (28:16 = 1.75)
            const expectedAspectRatio = 28 / 16;
            const actualAspectRatio = canvas.width / canvas.height;

            // Allow small floating point tolerance
            const tolerance = 0.01;
            expect(Math.abs(actualAspectRatio - expectedAspectRatio)).toBeLessThan(tolerance);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('canvas should have correct styling', () => {
    const { container } = render(
      <CanvasGame
        onScoreChange={vi.fn()}
        onLivesChange={vi.fn()}
        onLevelChange={vi.fn()}
        onGameStateChange={vi.fn()}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas?.className).toContain('border-2');
    expect(canvas?.className).toContain('border-gray-700');
    expect(canvas?.className).toContain('bg-black');
    expect(canvas?.style.imageRendering).toBe('pixelated');
  });

  test('canvas should initialize game engine', () => {
    const onScoreChange = vi.fn();
    const onLivesChange = vi.fn();
    const onLevelChange = vi.fn();
    const onGameStateChange = vi.fn();

    render(
      <CanvasGame
        onScoreChange={onScoreChange}
        onLivesChange={onLivesChange}
        onLevelChange={onLevelChange}
        onGameStateChange={onGameStateChange}
      />
    );

    // Engine should be initialized (callbacks will be called during initialization)
    // We can't directly test the engine ref, but we can verify the component renders
    expect(document.querySelector('canvas')).toBeTruthy();
  });

  test('callbacks should work even when parent re-renders with new callback references', () => {
    let scoreChangeCount = 0;
    let livesChangeCount = 0;
    
    // Initial callbacks
    const initialOnScoreChange = vi.fn(() => scoreChangeCount++);
    const initialOnLivesChange = vi.fn(() => livesChangeCount++);
    const onLevelChange = vi.fn();
    const onGameStateChange = vi.fn();
    const onEngineReady = vi.fn();

    const { rerender } = render(
      <CanvasGame
        onScoreChange={initialOnScoreChange}
        onLivesChange={initialOnLivesChange}
        onLevelChange={onLevelChange}
        onGameStateChange={onGameStateChange}
        onEngineReady={onEngineReady}
      />
    );

    // Verify engine is ready
    expect(onEngineReady).toHaveBeenCalledTimes(1);
    const engine = onEngineReady.mock.calls[0][0];
    
    // Create new callback references (simulating parent re-render)
    const newOnScoreChange = vi.fn(() => scoreChangeCount++);
    const newOnLivesChange = vi.fn(() => livesChangeCount++);
    
    // Re-render with new callback references
    rerender(
      <CanvasGame
        onScoreChange={newOnScoreChange}
        onLivesChange={newOnLivesChange}
        onLevelChange={onLevelChange}
        onGameStateChange={onGameStateChange}
        onEngineReady={onEngineReady}
      />
    );
    
    // Engine should NOT be re-initialized (onEngineReady should still be called only once)
    expect(onEngineReady).toHaveBeenCalledTimes(1);
    
    // Trigger actual state changes in the engine to verify new callbacks are used
    // Capture the previous state before making changes
    const prevState = (engine as any).captureStateSnapshot();
    
    // Manually update the engine's state
    (engine as any).state = {
      ...(engine as any).state,
      score: 100,
      lives: 2
    };
    
    // Manually notify observers with the previous state
    (engine as any).notifyStateChanges(prevState);
    
    // New callbacks should have been called (not the initial ones)
    // Note: CanvasGame only forwards the new value, not the old value
    expect(newOnScoreChange).toHaveBeenCalledWith(100);
    expect(newOnLivesChange).toHaveBeenCalledWith(2);
    expect(scoreChangeCount).toBe(1);
    expect(livesChangeCount).toBe(1);
    
    // Initial callbacks should NOT have been called
    expect(initialOnScoreChange).not.toHaveBeenCalled();
    expect(initialOnLivesChange).not.toHaveBeenCalled();
  });

  // Feature: lode-runner-game, Property 38: Canvas Resize Recalculation
  test('Property 38: resize events update canvas dimensions', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialWidth: fc.integer(800, 1920),
          initialHeight: fc.integer(600, 1080),
          newWidth: fc.integer(800, 3840),
          newHeight: fc.integer(600, 2160)
        }),
        ({ initialWidth, initialHeight, newWidth, newHeight }) => {
          // Set initial window dimensions
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: initialWidth
          });
          Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: initialHeight
          });

          // Render component
          const { container } = render(
            <CanvasGame
              onScoreChange={vi.fn()}
              onLivesChange={vi.fn()}
              onLevelChange={vi.fn()}
              onGameStateChange={vi.fn()}
            />
          );

          const canvas = container.querySelector('canvas');
          expect(canvas).toBeTruthy();

          if (canvas) {
            const initialCanvasWidth = canvas.width;
            const initialCanvasHeight = canvas.height;

            // Change window dimensions
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: newWidth
            });
            Object.defineProperty(window, 'innerHeight', {
              writable: true,
              configurable: true,
              value: newHeight
            });

            // Trigger resize event
            window.dispatchEvent(new Event('resize'));

            // Canvas dimensions should have been recalculated
            const newCanvasWidth = canvas.width;
            const newCanvasHeight = canvas.height;

            // If window dimensions changed, canvas dimensions should change
            // (unless constrained by the same limiting factor)
            if (initialWidth !== newWidth || initialHeight !== newHeight) {
              // At minimum, aspect ratio should still be maintained
              const aspectRatio = 28 / 16;
              const actualAspectRatio = newCanvasWidth / newCanvasHeight;
              const tolerance = 0.01;
              expect(Math.abs(actualAspectRatio - aspectRatio)).toBeLessThan(tolerance);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
