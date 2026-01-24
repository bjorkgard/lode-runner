import { memo } from 'react';
import { GameState } from '../game/types';
import { LEVELS } from '../constants/ui';

interface MenuProps {
  gameState: GameState;
  finalScore?: number;
  onNewGame: () => void;
  onContinue?: () => void;
  onResetHighScore: () => void;
  onResume?: () => void;
  onQuit?: () => void;
}

/**
 * Menu component that displays different screens based on game state.
 * Handles main menu, pause menu, game over screen, and victory screen.
 * 
 * Memoized to prevent unnecessary re-renders when parent updates.
 * Only re-renders when props actually change.
 * 
 * Uses Tailwind CSS for styling and responsive layout.
 * 
 * @param gameState - Current game state (Menu, Paused, GameOver, Victory)
 * @param finalScore - Final score to display on game over/victory screens
 * @param onNewGame - Callback to start a new game
 * @param onContinue - Optional callback to continue from saved game
 * @param onResetHighScore - Callback to reset the high score
 * @param onResume - Optional callback to resume from pause
 * @param onQuit - Optional callback to quit to main menu
 */
export const Menu = memo(function Menu({
  gameState,
  finalScore,
  onNewGame,
  onContinue,
  onResetHighScore,
  onResume,
  onQuit
}: MenuProps) {
  // Don't render menu when game is playing
  if (gameState === GameState.Playing) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Main Menu */}
        {gameState === GameState.Menu && (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center text-yellow-400">
              LODE RUNNER
            </h1>
            <div className="flex flex-col gap-4">
              <button
                onClick={onNewGame}
                className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-500 active:bg-blue-700 transition-colors font-semibold"
              >
                New Game
              </button>
              {onContinue && (
                <button
                  onClick={onContinue}
                  className="px-6 py-3 bg-green-600 rounded hover:bg-green-500 active:bg-green-700 transition-colors font-semibold"
                >
                  Continue
                </button>
              )}
              <button
                onClick={onResetHighScore}
                className="px-6 py-3 bg-red-600 rounded hover:bg-red-500 active:bg-red-700 transition-colors font-semibold"
              >
                Reset High Score
              </button>
            </div>
          </>
        )}
        
        {/* Pause Menu */}
        {gameState === GameState.Paused && (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
              PAUSED
            </h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={onResume}
                className="px-6 py-3 bg-green-600 rounded hover:bg-green-500 active:bg-green-700 transition-colors font-semibold"
              >
                Resume
              </button>
              <button
                onClick={onQuit}
                className="px-6 py-3 bg-red-600 rounded hover:bg-red-500 active:bg-red-700 transition-colors font-semibold"
              >
                Quit to Menu
              </button>
            </div>
          </>
        )}
        
        {/* Game Over Screen */}
        {gameState === GameState.GameOver && (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center text-red-500">
              GAME OVER
            </h2>
            <p className="text-xl mb-6 text-center">
              Final Score: <span className="font-bold text-yellow-400">{finalScore}</span>
            </p>
            <button
              onClick={onNewGame}
              className="w-full px-6 py-3 bg-blue-600 rounded hover:bg-blue-500 active:bg-blue-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </>
        )}
        
        {/* Victory Screen */}
        {gameState === GameState.Victory && (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-500">
              VICTORY!
            </h2>
            <p className="text-xl mb-4 text-center">
              You completed all {LEVELS.TOTAL_LEVELS} levels!
            </p>
            <p className="text-xl mb-6 text-center">
              Final Score: <span className="font-bold text-yellow-400">{finalScore}</span>
            </p>
            <button
              onClick={onNewGame}
              className="w-full px-6 py-3 bg-blue-600 rounded hover:bg-blue-500 active:bg-blue-700 transition-colors font-semibold"
            >
              Play Again
            </button>
          </>
        )}
      </div>
    </div>
  );
});
