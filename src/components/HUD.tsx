interface HUDProps {
  level: number;
  score: number;
  highScore: number;
  lives: number;
  timer: number;
  muted: boolean;
  onToggleMute: () => void;
}

/**
 * HUD (Heads-Up Display) component that shows game information.
 * Displays level, score, high score, timer, lives, and mute toggle.
 * 
 * Uses Tailwind CSS for responsive styling and layout.
 * 
 * @param level - Current level number
 * @param score - Current score
 * @param highScore - High score from storage
 * @param lives - Number of lives remaining
 * @param timer - Elapsed time in seconds
 * @param muted - Whether audio is muted
 * @param onToggleMute - Callback to toggle mute state
 */
export function HUD({
  level,
  score,
  highScore,
  lives,
  timer,
  muted,
  onToggleMute
}: HUDProps) {
  /**
   * Formats seconds into MM:SS format.
   * 
   * @param seconds - Time in seconds
   * @returns Formatted time string (e.g., "1:23")
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-gray-800 text-white p-4 flex flex-wrap justify-between items-center gap-4">
      {/* Left section: Level, Score, High Score */}
      <div className="flex gap-4 sm:gap-6 text-sm sm:text-base">
        <div>
          Level: <span className="font-bold text-yellow-400">{level}</span>
        </div>
        <div>
          Score: <span className="font-bold text-green-400">{score}</span>
        </div>
        <div>
          High: <span className="font-bold text-blue-400">{highScore}</span>
        </div>
      </div>
      
      {/* Right section: Timer, Lives, Mute button */}
      <div className="flex gap-4 sm:gap-6 items-center text-sm sm:text-base">
        <div>
          Time: <span className="font-bold">{formatTime(timer)}</span>
        </div>
        <div className="flex gap-1" aria-label={`${lives} lives remaining`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span 
              key={i} 
              className={i < lives ? 'text-red-500' : 'text-gray-600'}
              aria-hidden="true"
            >
              ♥
            </span>
          ))}
        </div>
        <button
          onClick={onToggleMute}
          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 active:bg-gray-500 transition-colors"
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}
