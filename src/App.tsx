import { useState, useRef, useCallback } from 'react';
import { CanvasGame } from './components/CanvasGame';
import { HUD } from './components/HUD';
import { Menu } from './components/Menu';
import { MobileControls } from './components/MobileControls';
import { GameState } from './game/types';
import type { GameEngine } from './game/engine';
import { PLAYER } from './constants/ui';

/**
 * Main App component that integrates all game components.
 * Manages React state for UI updates and coordinates between
 * the game engine and React components.
 * 
 * Architecture:
 * - CanvasGame: Wraps the game engine and canvas
 * - HUD: Displays game information (score, lives, level, timer)
 * - Menu: Shows different screens based on game state
 * - MobileControls: Touch controls for mobile devices
 * 
 * Requirements:
 * - 17.1: Game state management
 * - 17.2: State transitions and callbacks
 */
function App() {
  // React state for UI updates
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(PLAYER.INITIAL_LIVES);
  const [level, setLevel] = useState<number>(1);
  const [timer, setTimer] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [muted, setMuted] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);
  
  // Ref to access game engine from CanvasGame component
  const engineRef = useRef<GameEngine | null>(null);
  
  /**
   * Callback to update score in React state.
   * Called by game engine when score changes.
   * Memoized to prevent child component re-renders.
   */
  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);
  
  /**
   * Callback to update lives in React state.
   * Called by game engine when lives change.
   * Memoized to prevent child component re-renders.
   */
  const handleLivesChange = useCallback((newLives: number) => {
    setLives(newLives);
  }, []);
  
  /**
   * Callback to update level in React state.
   * Called by game engine when level changes.
   * Memoized to prevent child component re-renders.
   */
  const handleLevelChange = useCallback((newLevel: number) => {
    setLevel(newLevel);
  }, []);
  
  /**
   * Callback to update game state in React state.
   * Called by game engine when game state changes.
   * Memoized to prevent child component re-renders.
   */
  const handleGameStateChange = useCallback((newState: GameState) => {
    setGameState(newState);
  }, []);
  
  /**
   * Starts a new game.
   * Resets to level 1 with 3 lives and transitions to Playing state.
   * Memoized to prevent child component re-renders.
   */
  const handleNewGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.newGame();
    }
  }, []);
  
  /**
   * Resumes the game from pause.
   * Transitions from Paused to Playing state.
   * Memoized to prevent child component re-renders.
   */
  const handleResume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  }, []);
  
  /**
   * Quits to main menu from pause.
   * Transitions to Menu state.
   * Memoized to prevent child component re-renders.
   */
  const handleQuit = useCallback(() => {
    if (engineRef.current) {
      const engine = engineRef.current;
      const state = engine.getState();
      
      // Update state to Menu
      state.gameState = GameState.Menu;
      setGameState(GameState.Menu);
    }
  }, []);
  
  /**
   * Resets the high score to 0.
   * Clears the stored high score from localStorage.
   * Memoized to prevent child component re-renders.
   */
  const handleResetHighScore = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resetHighScore();
      setHighScore(0);
    }
  }, []);
  
  /**
   * Toggles audio mute state.
   * Updates both React state and audio manager.
   * Memoized to prevent child component re-renders.
   */
  const handleToggleMute = useCallback(() => {
    if (engineRef.current) {
      const audioManager = engineRef.current.getAudioManager();
      audioManager.toggleMute();
      setMuted(audioManager.getAudioSettings().muted);
    }
  }, []);
  
  /**
   * Forwards touch input to the game engine.
   * Allows mobile controls to simulate keyboard input.
   * Memoized to prevent child component re-renders.
   * 
   * @param direction - Input direction ('left', 'right', 'up', 'down', 'digLeft', 'digRight')
   * @param pressed - Whether the input is pressed (true) or released (false)
   */
  const handleTouchInput = useCallback((direction: string, pressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.handleTouchInput(direction, pressed);
    }
  }, []);
  
  /**
   * Callback to store engine reference from CanvasGame component.
   * This allows App to call engine methods for UI interactions.
   * Sets up timer observation using the Observer pattern.
   * Memoized to prevent child component re-renders.
   */
  const handleEngineReady = useCallback((engine: GameEngine) => {
    engineRef.current = engine;
    
    // Initialize UI state from engine
    const state = engine.getState();
    setScore(state.score);
    setLives(state.lives);
    setLevel(state.currentLevel);
    setTimer(state.levelTimer);
    setGameState(state.gameState);
    setHighScore(state.highScore);
    setMuted(engine.getAudioManager().getAudioSettings().muted);
    
    // Subscribe to timer changes using Observer pattern
    const observable = engine.getStateObservable();
    observable.onTimerChange((timer) => {
      setTimer(timer);
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* HUD - Always visible */}
      <HUD
        level={level}
        score={score}
        highScore={highScore}
        lives={lives}
        timer={timer}
        muted={muted}
        onToggleMute={handleToggleMute}
      />
      
      {/* Main game area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <CanvasGame
          onScoreChange={handleScoreChange}
          onLivesChange={handleLivesChange}
          onLevelChange={handleLevelChange}
          onGameStateChange={handleGameStateChange}
          onEngineReady={handleEngineReady}
        />
      </div>
      
      {/* Menu overlay - Shown based on game state */}
      <Menu
        gameState={gameState}
        finalScore={score}
        onNewGame={handleNewGame}
        onResetHighScore={handleResetHighScore}
        onResume={handleResume}
        onQuit={handleQuit}
      />
      
      {/* Mobile controls - Only shown on touch devices */}
      <MobileControls onInput={handleTouchInput} />
    </div>
  );
}

export default App;
