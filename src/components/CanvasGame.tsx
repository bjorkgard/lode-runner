import { useEffect, useRef, memo } from 'react';
import { GameEngine } from '../game/engine';
import { GameState } from '../game/types';
import { CANVAS } from '../constants/ui';

interface CanvasGameProps {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onGameStateChange: (state: GameState) => void;
  onEngineReady?: (engine: GameEngine) => void;
}

/**
 * CanvasGame component that wraps the game engine and canvas.
 * Handles initialization, cleanup, and window resize events.
 * 
 * Memoized to prevent unnecessary re-renders when parent updates.
 * The component maintains the game engine in a ref to avoid re-renders
 * and uses callbacks to notify parent components of state changes.
 * 
 * Uses a callback ref pattern to ensure callbacks are always up-to-date
 * without causing the effect to re-run on every parent re-render.
 */
export const CanvasGame = memo(function CanvasGame({
  onScoreChange,
  onLivesChange,
  onLevelChange,
  onGameStateChange,
  onEngineReady
}: CanvasGameProps) {
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
    
    // Initialize game engine
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    
    // Subscribe to state changes using Observer pattern
    const observable = engine.getStateObservable();
    
    const unsubscribeScore = observable.onScoreChange((score) => {
      callbacksRef.current.onScoreChange(score);
    });
    
    const unsubscribeLives = observable.onLivesChange((lives) => {
      callbacksRef.current.onLivesChange(lives);
    });
    
    const unsubscribeLevel = observable.onLevelChange((level) => {
      callbacksRef.current.onLevelChange(level);
    });
    
    const unsubscribeGameState = observable.onGameStateChange((state) => {
      callbacksRef.current.onGameStateChange(state);
    });
    
    // Notify parent that engine is ready
    if (callbacksRef.current.onEngineReady) {
      callbacksRef.current.onEngineReady(engine);
    }
    
    // Start game loop
    engine.start();
    
    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        resizeCanvas(canvasRef.current);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize
    
    // Cleanup on unmount
    return () => {
      unsubscribeScore();
      unsubscribeLives();
      unsubscribeLevel();
      unsubscribeGameState();
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty deps - only run once on mount
  
  return (
    <canvas
      ref={canvasRef}
      className="border-2 border-gray-700 bg-black"
      style={{ imageRendering: 'pixelated' }}
    />
  );
});

/**
 * Resizes the canvas to fit the viewport while maintaining the game's aspect ratio.
 * The game world is 28 tiles wide by 16 tiles tall (28:16 aspect ratio).
 * 
 * @param canvas - The canvas element to resize
 */
function resizeCanvas(canvas: HTMLCanvasElement): void {
  const aspectRatio = CANVAS.ASPECT_RATIO;
  const minWidth = CANVAS.MIN_WIDTH;
  const minHeight = CANVAS.MIN_HEIGHT;
  
  // Calculate available space with margins
  const maxWidth = Math.max(minWidth, window.innerWidth - CANVAS.MARGIN_HORIZONTAL);
  const maxHeight = Math.max(minHeight, window.innerHeight - CANVAS.MARGIN_VERTICAL);
  
  let width = maxWidth;
  let height = width / aspectRatio;
  
  // If height exceeds max, constrain by height instead
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  // Ensure minimum dimensions
  width = Math.max(minWidth, width);
  height = Math.max(minHeight, height);
  
  canvas.width = width;
  canvas.height = height;
}
