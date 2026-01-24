import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { GameState } from '../game/types';

interface CanvasGameProps {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onGameStateChange: (state: GameState) => void;
}

/**
 * CanvasGame component that wraps the game engine and canvas.
 * Handles initialization, cleanup, and window resize events.
 * 
 * The component maintains the game engine in a ref to avoid re-renders
 * and uses callbacks to notify parent components of state changes.
 */
export function CanvasGame({
  onScoreChange,
  onLivesChange,
  onLevelChange,
  onGameStateChange
}: CanvasGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize game engine
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    
    // Set up callbacks to update React state
    engine.onScoreChange = onScoreChange;
    engine.onLivesChange = onLivesChange;
    engine.onLevelChange = onLevelChange;
    engine.onGameStateChange = onGameStateChange;
    
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
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [onScoreChange, onLivesChange, onLevelChange, onGameStateChange]);
  
  return (
    <canvas
      ref={canvasRef}
      className="border-2 border-gray-700 bg-black"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

/**
 * Resizes the canvas to fit the viewport while maintaining the game's aspect ratio.
 * The game world is 28 tiles wide by 16 tiles tall (28:16 aspect ratio).
 * 
 * @param canvas - The canvas element to resize
 */
function resizeCanvas(canvas: HTMLCanvasElement): void {
  const aspectRatio = 28 / 16; // Game world aspect ratio
  const minWidth = 280; // Minimum canvas width
  const minHeight = 160; // Minimum canvas height
  
  // Calculate available space with margins
  const maxWidth = Math.max(minWidth, window.innerWidth - 40); // Leave margin
  const maxHeight = Math.max(minHeight, window.innerHeight - 200); // Leave room for HUD
  
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
