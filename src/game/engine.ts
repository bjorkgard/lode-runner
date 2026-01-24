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

/**
 * Callback function types for UI updates
 */
type StateCallback = (value: number) => void;
type GameStateCallback = (state: GameState) => void;

/**
 * Main game engine class that orchestrates all game systems.
 * Manages the game loop, state updates, and rendering.
 * 
 * The engine follows a clear separation of concerns:
 * - Game loop: requestAnimationFrame-based with delta time
 * - Update phase: Processes input, physics, AI, rules
 * - Render phase: Draws game state to canvas
 * - Callbacks: Notifies React components of state changes
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
  
  // Callbacks for UI updates
  public onScoreChange: StateCallback | null = null;
  public onLivesChange: StateCallback | null = null;
  public onLevelChange: StateCallback | null = null;
  public onGameStateChange: GameStateCallback | null = null;
  
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
   * Only updates game logic when in Playing state.
   * Handles death timer and respawn logic.
   * 
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private update(deltaTime: number): void {
    if (!this.isInitialized) return;
    
    // Track previous state for change detection
    const prevScore = this.state.score;
    const prevLives = this.state.lives;
    const prevLevel = this.state.currentLevel;
    const prevGameState = this.state.gameState;
    
    // Always process input (for pause toggle)
    this.state = this.inputManager.updateInput(this.state, deltaTime);
    
    // Only update game logic when playing
    if (this.state.gameState === GameState.Playing) {
      // Handle death timer and respawn
      if (this.state.player.isDead && this.state.lives > 0) {
        const newDeathTimer = this.state.player.deathTimer + deltaTime;
        
        if (newDeathTimer >= DEATH_RESPAWN_DELAY) {
          // Death delay elapsed, respawn player
          this.state = resetLevel(this.state);
          this.state = {
            ...this.state,
            player: {
              ...this.state.player,
              isDead: false,
              deathTimer: -1
            }
          };
        } else {
          // Update death timer
          this.state = {
            ...this.state,
            player: {
              ...this.state.player,
              deathTimer: newDeathTimer
            }
          };
        }
      } else if (!this.state.player.isDead) {
        // Normal gameplay updates (only when player is alive)
        this.state = updatePhysics(this.state, deltaTime);
        this.state = updateDigging(this.state, deltaTime);
        this.state = updateAI(this.state, deltaTime);
        this.state = updateRules(this.state, deltaTime);
      }
      
      // Always update particles
      this.particleManager.update(deltaTime);
    }
    
    // Update high score if current score exceeds it
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      saveHighScore(this.state.score);
    }
    
    // Trigger callbacks for state changes
    if (prevScore !== this.state.score && this.onScoreChange) {
      this.onScoreChange(this.state.score);
    }
    if (prevLives !== this.state.lives && this.onLivesChange) {
      this.onLivesChange(this.state.lives);
    }
    if (prevLevel !== this.state.currentLevel && this.onLevelChange) {
      this.onLevelChange(this.state.currentLevel);
    }
    if (prevGameState !== this.state.gameState && this.onGameStateChange) {
      this.onGameStateChange(this.state.gameState);
    }
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
    this.state = createInitialState();
    this.state.highScore = loadHighScore();
    this.state.gameState = GameState.Playing;
    
    // Trigger callbacks
    if (this.onScoreChange) this.onScoreChange(this.state.score);
    if (this.onLivesChange) this.onLivesChange(this.state.lives);
    if (this.onLevelChange) this.onLevelChange(this.state.currentLevel);
    if (this.onGameStateChange) this.onGameStateChange(this.state.gameState);
  }
  
  /**
   * Pauses the game.
   * Transitions from Playing to Paused state.
   */
  public pauseGame(): void {
    if (this.state.gameState === GameState.Playing) {
      this.state = {
        ...this.state,
        gameState: GameState.Paused
      };
      
      if (this.onGameStateChange) {
        this.onGameStateChange(this.state.gameState);
      }
    }
  }
  
  /**
   * Resumes the game from pause.
   * Transitions from Paused to Playing state.
   */
  public resumeGame(): void {
    if (this.state.gameState === GameState.Paused) {
      this.state = {
        ...this.state,
        gameState: GameState.Playing
      };
      
      if (this.onGameStateChange) {
        this.onGameStateChange(this.state.gameState);
      }
    }
  }
  
  /**
   * Resets the high score to 0.
   * Clears the stored high score from localStorage.
   */
  public resetHighScore(): void {
    resetStoredHighScore();
    this.state.highScore = 0;
    
    if (this.onScoreChange) {
      this.onScoreChange(this.state.score);
    }
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
  }
}
