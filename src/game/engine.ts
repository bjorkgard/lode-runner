// Game engine orchestration for Lode Runner

import type { GameStateData } from './types';
import { GameState } from './types';
import { createInitialState, resetLevel } from './state';
import { updateInput, initInput, setTouchInput } from './input';
import { updatePhysics } from './physics';
import { updateDigging } from './digging';
import { updateAI } from './ai';
import { updateRules } from './rules';
import { initParticleSystem, updateParticles } from './particles';
import { renderGame } from './render';
import { initAudio } from './audio';
import { loadSprites } from './sprites';
import { loadHighScore, saveHighScore, resetHighScore as resetStoredHighScore } from './storage';

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
 */
export class GameEngine {
  private state: GameStateData;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;
  private isInitialized: boolean = false;
  
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
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context from canvas');
    }
    
    this.ctx = ctx;
    this.state = createInitialState();
    
    // Initialize all systems asynchronously
    this.initialize();
  }
  
  /**
   * Initializes all game systems asynchronously.
   * Loads sprites, audio, and sets up input handlers.
   */
  private async initialize(): Promise<void> {
    try {
      // Initialize systems
      initInput();
      initParticleSystem();
      
      // Load assets (async)
      await Promise.all([
        loadSprites(),
        initAudio()
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
   * Cancels the animation frame request.
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
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
    this.state = updateInput(this.state, deltaTime);
    
    // Only update game logic when playing
    if (this.state.gameState === GameState.Playing) {
      this.state = updatePhysics(this.state, deltaTime);
      this.state = updateDigging(this.state, deltaTime);
      this.state = updateAI(this.state, deltaTime);
      this.state = updateRules(this.state, deltaTime);
      updateParticles(deltaTime);
      
      // Check if player died and needs respawn
      if (this.state.player.isDead && this.state.lives > 0 && this.state.gameState === GameState.Playing) {
        // Schedule level restart after a short delay
        setTimeout(() => {
          if (this.state.player.isDead && this.state.lives > 0) {
            this.state = resetLevel(this.state);
            this.state.player.isDead = false;
          }
        }, 2000);
      }
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
    
    renderGame(this.state, this.ctx);
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
   * Forwards touch input to the input system.
   * Allows mobile controls to simulate keyboard input.
   * 
   * @param direction - Input direction ('left', 'right', 'up', 'down', 'digLeft', 'digRight')
   * @param pressed - Whether the input is pressed (true) or released (false)
   */
  public handleTouchInput(direction: string, pressed: boolean): void {
    setTouchInput(direction, pressed);
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
}
