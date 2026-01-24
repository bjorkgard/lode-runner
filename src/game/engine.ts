// Game engine orchestration for Lode Runner

import type { GameStateData } from './types';
import { GameState } from './types';
import { createInitialState, resetLevel } from './state';
import { InputManager } from './input';
import { updatePhysics } from './physics';
import { updateDigging } from './digging';
import { updateAI } from './ai';
import { updateRules } from './rules';
import { ParticleManager } from './particles';
import { renderGame } from './render';
import { AudioManager } from './audio';
import { SpriteManager } from './sprites';
import { loadHighScore, saveHighScore, resetHighScore as resetStoredHighScore } from './storage';
import { DEATH_RESPAWN_DELAY } from './constants';
import { StateObservable, type StateSnapshot } from './StateObserver';

/**
 * Main game engine class that orchestrates all game systems.
 * Manages the game loop, state updates, and rendering.
 * 
 * The engine follows a clear separation of concerns:
 * - Game loop: requestAnimationFrame-based with delta time
 * - Update phase: Processes input, physics, AI, rules
 * - Render phase: Draws game state to canvas
 * - State observation: Observer pattern for state change notifications
 * - Managers: Encapsulated subsystems (input, audio, sprites, particles)
 */
export class GameEngine {
  private state: GameStateData;
  private ctx: CanvasRenderingContext2D;
  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;
  private isInitialized: boolean = false;
  
  // Manager instances
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private spriteManager: SpriteManager;
  private particleManager: ParticleManager;
  private cleanupInput: (() => void) | null = null;
  
  // State observable for observer pattern
  private stateObservable: StateObservable;
  
  /**
   * Creates a new game engine instance.
   * Initializes all game systems and loads assets.
   * 
   * @param canvas - The HTML canvas element to render the game on
   */
  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context from canvas');
    }
    
    this.ctx = ctx;
    this.state = createInitialState();
    
    // Initialize managers
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    this.spriteManager = new SpriteManager();
    this.particleManager = new ParticleManager();
    this.stateObservable = new StateObservable();
    
    // Initialize all systems asynchronously
    this.initialize();
  }
  
  /**
   * Initializes all game systems asynchronously.
   * Loads sprites, audio, and sets up input handlers.
   */
  private async initialize(): Promise<void> {
    try {
      // Clean up any existing input listeners before initializing new ones
      if (this.cleanupInput) {
        this.cleanupInput();
        this.cleanupInput = null;
      }
      
      // Initialize input system and store cleanup function
      this.cleanupInput = this.inputManager.init();
      
      // Initialize particle system
      this.particleManager.init();
      
      // Load assets (async)
      await Promise.all([
        this.spriteManager.init(),
        this.audioManager.init()
      ]);
      
      // Load high score from storage
      this.state.highScore = loadHighScore();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize game engine:', error);
      this.isInitialized = true; // Continue anyway with fallback rendering
    }
  }
  
  /**
   * Starts the game loop.
   * Begins updating and rendering the game at 60 FPS.
   */
  public start(): void {
    if (this.animationFrameId !== null) {
      return; // Already running
    }
    
    this.lastFrameTime = performance.now();
    this.loop();
  }
  
  /**
   * Stops the game loop.
   * Cancels the animation frame request and cleans up resources.
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clean up input event listeners
    if (this.cleanupInput) {
      this.cleanupInput();
      this.cleanupInput = null;
    }
  }
  
  /**
   * Main game loop function.
   * Calculates delta time, updates game state, renders, and schedules next frame.
   */
  private loop = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;
    
    // Update game state
    this.update(deltaTime);
    
    // Render game
    this.render();
    
    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  };
  
  /**
   * Updates all game systems for the current frame.
   * Orchestrates input processing, gameplay updates, and UI callbacks.
   * 
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private update(deltaTime: number): void {
    if (!this.isInitialized) return;
    
    // Capture previous state for change detection
    const prevState = this.captureStateSnapshot();
    
    // Process input (always active for pause toggle)
    this.processInput(deltaTime);
    
    // Update gameplay systems when playing
    if (this.state.gameState === GameState.Playing) {
      this.updateGameplay(deltaTime);
    }
    
    // Update high score if needed
    this.updateHighScore();
    
    // Notify UI of state changes
    this.notifyStateChanges(prevState);
  }
  
  /**
   * Captures a snapshot of state values for change detection.
   * Returns only the values we need to track for UI updates.
   * 
   * @returns Object containing previous state values
   */
  private captureStateSnapshot(): StateSnapshot {
    return StateObservable.createSnapshot(this.state);
  }
  
  /**
   * Processes player input for the current frame.
   * Input is always processed to allow pause toggle even when not playing.
   * 
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private processInput(deltaTime: number): void {
    this.state = this.inputManager.updateInput(this.state, deltaTime);
  }
  
  /**
   * Updates all gameplay systems when in Playing state.
   * Handles death/respawn logic and normal gameplay updates.
   * 
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private updateGameplay(deltaTime: number): void {
    if (this.state.player.isDead && this.state.lives > 0) {
      this.handleDeathRespawn(deltaTime);
    } else if (!this.state.player.isDead) {
      this.updateGameSystems(deltaTime);
    }
    
    // Always update particles during gameplay
    this.particleManager.update(deltaTime);
  }
  
  /**
   * Handles death timer and respawn logic.
   * Waits for DEATH_RESPAWN_DELAY before respawning the player.
   * 
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private handleDeathRespawn(deltaTime: number): void {
    const newDeathTimer = this.state.player.deathTimer + deltaTime;
    
    if (newDeathTimer >= DEATH_RESPAWN_DELAY) {
      // Death delay elapsed, respawn player
      this.respawnPlayer();
    } else {
      // Update death timer
      this.updateDeathTimer(newDeathTimer);
    }
  }
  
  /**
   * Respawns the player after death delay.
   * Resets the level and clears death state.
   */
  private respawnPlayer(): void {
    this.state = resetLevel(this.state);
    this.state = {
      ...this.state,
      player: {
        ...this.state.player,
        isDead: false,
        deathTimer: -1
      }
    };
  }
  
  /**
   * Updates the death timer without respawning.
   * 
   * @param newDeathTimer - New death timer value
   */
  private updateDeathTimer(newDeathTimer: number): void {
    this.state = {
      ...this.state,
      player: {
        ...this.state.player,
        deathTimer: newDeathTimer
      }
    };
  }
  
  /**
   * Updates all core game systems during normal gameplay.
   * Processes physics, digging, AI, and game rules in order.
   * 
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private updateGameSystems(deltaTime: number): void {
    this.state = updatePhysics(this.state, deltaTime);
    this.state = updateDigging(this.state, deltaTime);
    this.state = updateAI(this.state, deltaTime);
    this.state = updateRules(this.state, deltaTime);
  }
  
  /**
   * Updates and persists the high score if current score exceeds it.
   */
  private updateHighScore(): void {
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      saveHighScore(this.state.score);
    }
  }
  
  /**
   * Notifies all observers of state changes.
   * Uses the Observer pattern to notify subscribers of changes.
   * 
   * @param prevState - Previous state snapshot for comparison
   */
  private notifyStateChanges(prevState: StateSnapshot): void {
    const currentState = this.captureStateSnapshot();
    this.stateObservable.notify(prevState, currentState);
  }
  
  /**
   * Renders the current game state to the canvas.
   */
  private render(): void {
    if (!this.isInitialized) return;
    
    renderGame(this.state, this.ctx, this.spriteManager, this.particleManager);
  }
  
  /**
   * Starts a new game.
   * Resets to level 1 with 3 lives and transitions to Playing state.
   */
  public newGame(): void {
    const prevState = this.captureStateSnapshot();
    
    this.state = createInitialState();
    this.state.highScore = loadHighScore();
    this.state.gameState = GameState.Playing;
    
    // Notify observers of all changes
    this.notifyStateChanges(prevState);
  }
  
  /**
   * Pauses the game.
   * Transitions from Playing to Paused state.
   */
  public pauseGame(): void {
    if (this.state.gameState === GameState.Playing) {
      const prevState = this.captureStateSnapshot();
      
      this.state = {
        ...this.state,
        gameState: GameState.Paused
      };
      
      this.notifyStateChanges(prevState);
    }
  }
  
  /**
   * Resumes the game from pause.
   * Transitions from Paused to Playing state.
   */
  public resumeGame(): void {
    if (this.state.gameState === GameState.Paused) {
      const prevState = this.captureStateSnapshot();
      
      this.state = {
        ...this.state,
        gameState: GameState.Playing
      };
      
      this.notifyStateChanges(prevState);
    }
  }
  
  /**
   * Resets the high score to 0.
   * Clears the stored high score from localStorage.
   */
  public resetHighScore(): void {
    const prevState = this.captureStateSnapshot();
    
    resetStoredHighScore();
    this.state.highScore = 0;
    
    this.notifyStateChanges(prevState);
  }
  
  /**
   * Gets the state observable for subscribing to state changes.
   * Allows external components to observe state changes using the Observer pattern.
   * 
   * @returns StateObservable instance for subscribing to changes
   * 
   * @example
   * ```typescript
   * const unsubscribe = engine.getStateObservable().onScoreChange((score, prevScore) => {
   *   console.log(`Score: ${prevScore} → ${score}`);
   * });
   * ```
   */
  public getStateObservable(): StateObservable {
    return this.stateObservable;
  }
  
  /**
   * Forwards touch input to the input manager.
   * Allows mobile controls to simulate keyboard input.
   * 
   * @param direction - Input direction ('left', 'right', 'up', 'down', 'digLeft', 'digRight')
   * @param pressed - Whether the input is pressed (true) or released (false)
   */
  public handleTouchInput(direction: string, pressed: boolean): void {
    this.inputManager.setTouchInput(direction, pressed);
  }
  
  /**
   * Gets the current game state.
   * Useful for debugging and testing.
   * 
   * @returns Current game state
   */
  public getState(): GameStateData {
    return this.state;
  }
  
  /**
   * Gets the audio manager instance.
   * Useful for UI components that need to control audio.
   * 
   * @returns Audio manager instance
   */
  public getAudioManager(): AudioManager {
    return this.audioManager;
  }
  
  /**
   * Cleans up all resources and event listeners.
   * Should be called when the engine is no longer needed (e.g., component unmount).
   * This is automatically called by stop(), but can be called explicitly for cleanup.
   */
  public cleanup(): void {
    // Stop the game loop
    this.stop();
    
    // Reset input state
    this.inputManager.reset();
    
    // Clear particles
    this.particleManager.clear();
    
    // Clear all observers
    this.stateObservable.clear();
  }
}
