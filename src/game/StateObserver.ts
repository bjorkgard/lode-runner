/**
 * State Observer Pattern Implementation
 * 
 * Provides a clean, type-safe way to observe state changes in the game engine.
 * Replaces manual callback assignments with a subscription-based system.
 */

import type { GameStateData } from './types';
import { GameState } from './types';

/**
 * State change event containing both old and new values.
 * Allows observers to see what changed and react accordingly.
 */
export interface StateChangeEvent {
  /** Previous state snapshot */
  previous: StateSnapshot;
  /** Current state snapshot */
  current: StateSnapshot;
}

/**
 * Snapshot of observable state values.
 * Contains only the values that UI components typically need to observe.
 */
export interface StateSnapshot {
  score: number;
  lives: number;
  level: number;
  gameState: GameState;
  highScore: number;
  timer: number;
}

/**
 * Observer function type that receives state change events.
 */
export type StateObserver = (event: StateChangeEvent) => void;

/**
 * Specific observer types for individual state properties.
 * Allows subscribing to specific changes without receiving all events.
 */
export type ScoreObserver = (score: number, prevScore: number) => void;
export type LivesObserver = (lives: number, prevLives: number) => void;
export type LevelObserver = (level: number, prevLevel: number) => void;
export type GameStateObserver = (state: GameState, prevState: GameState) => void;
export type HighScoreObserver = (highScore: number, prevHighScore: number) => void;
export type TimerObserver = (timer: number, prevTimer: number) => void;

/**
 * StateObservable class that implements the Observer pattern.
 * Manages subscriptions and notifies observers of state changes.
 * 
 * Features:
 * - Type-safe subscriptions
 * - Automatic unsubscribe functions
 * - Specific property observers
 * - General state observers
 * - Efficient change detection
 * 
 * Usage:
 * ```typescript
 * const observable = new StateObservable();
 * 
 * // Subscribe to specific changes
 * const unsubscribe = observable.onScoreChange((score, prevScore) => {
 *   console.log(`Score changed from ${prevScore} to ${score}`);
 * });
 * 
 * // Subscribe to all changes
 * const unsubscribeAll = observable.subscribe((event) => {
 *   console.log('State changed:', event);
 * });
 * 
 * // Unsubscribe when done
 * unsubscribe();
 * unsubscribeAll();
 * ```
 */
export class StateObservable {
  private observers: Set<StateObserver> = new Set();
  private scoreObservers: Set<ScoreObserver> = new Set();
  private livesObservers: Set<LivesObserver> = new Set();
  private levelObservers: Set<LevelObserver> = new Set();
  private gameStateObservers: Set<GameStateObserver> = new Set();
  private highScoreObservers: Set<HighScoreObserver> = new Set();
  private timerObservers: Set<TimerObserver> = new Set();
  
  /**
   * Subscribes to all state changes.
   * Observer receives events for any state change.
   * 
   * @param observer - Function to call when state changes
   * @returns Unsubscribe function to remove the observer
   */
  public subscribe(observer: StateObserver): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }
  
  /**
   * Subscribes to score changes only.
   * 
   * @param observer - Function to call when score changes
   * @returns Unsubscribe function
   */
  public onScoreChange(observer: ScoreObserver): () => void {
    this.scoreObservers.add(observer);
    return () => this.scoreObservers.delete(observer);
  }
  
  /**
   * Subscribes to lives changes only.
   * 
   * @param observer - Function to call when lives change
   * @returns Unsubscribe function
   */
  public onLivesChange(observer: LivesObserver): () => void {
    this.livesObservers.add(observer);
    return () => this.livesObservers.delete(observer);
  }
  
  /**
   * Subscribes to level changes only.
   * 
   * @param observer - Function to call when level changes
   * @returns Unsubscribe function
   */
  public onLevelChange(observer: LevelObserver): () => void {
    this.levelObservers.add(observer);
    return () => this.levelObservers.delete(observer);
  }
  
  /**
   * Subscribes to game state changes only.
   * 
   * @param observer - Function to call when game state changes
   * @returns Unsubscribe function
   */
  public onGameStateChange(observer: GameStateObserver): () => void {
    this.gameStateObservers.add(observer);
    return () => this.gameStateObservers.delete(observer);
  }
  
  /**
   * Subscribes to high score changes only.
   * 
   * @param observer - Function to call when high score changes
   * @returns Unsubscribe function
   */
  public onHighScoreChange(observer: HighScoreObserver): () => void {
    this.highScoreObservers.add(observer);
    return () => this.highScoreObservers.delete(observer);
  }
  
  /**
   * Subscribes to timer changes only.
   * 
   * @param observer - Function to call when timer changes
   * @returns Unsubscribe function
   */
  public onTimerChange(observer: TimerObserver): () => void {
    this.timerObservers.add(observer);
    return () => this.timerObservers.delete(observer);
  }
  
  /**
   * Notifies all observers of state changes.
   * Only notifies specific observers if their watched value changed.
   * 
   * @param previous - Previous state snapshot
   * @param current - Current state snapshot
   */
  public notify(previous: StateSnapshot, current: StateSnapshot): void {
    // Notify general observers
    if (this.observers.size > 0) {
      const event: StateChangeEvent = { previous, current };
      this.observers.forEach(observer => observer(event));
    }
    
    // Notify specific observers only if their value changed
    if (previous.score !== current.score && this.scoreObservers.size > 0) {
      this.scoreObservers.forEach(observer => observer(current.score, previous.score));
    }
    
    if (previous.lives !== current.lives && this.livesObservers.size > 0) {
      this.livesObservers.forEach(observer => observer(current.lives, previous.lives));
    }
    
    if (previous.level !== current.level && this.levelObservers.size > 0) {
      this.levelObservers.forEach(observer => observer(current.level, previous.level));
    }
    
    if (previous.gameState !== current.gameState && this.gameStateObservers.size > 0) {
      this.gameStateObservers.forEach(observer => observer(current.gameState, previous.gameState));
    }
    
    if (previous.highScore !== current.highScore && this.highScoreObservers.size > 0) {
      this.highScoreObservers.forEach(observer => observer(current.highScore, previous.highScore));
    }
    
    if (previous.timer !== current.timer && this.timerObservers.size > 0) {
      this.timerObservers.forEach(observer => observer(current.timer, previous.timer));
    }
  }
  
  /**
   * Creates a state snapshot from the full game state.
   * Extracts only the observable properties.
   * 
   * @param state - Full game state
   * @returns State snapshot with observable properties
   */
  public static createSnapshot(state: GameStateData): StateSnapshot {
    return {
      score: state.score,
      lives: state.lives,
      level: state.currentLevel,
      gameState: state.gameState,
      highScore: state.highScore,
      timer: state.levelTimer
    };
  }
  
  /**
   * Removes all observers.
   * Useful for cleanup when the observable is no longer needed.
   */
  public clear(): void {
    this.observers.clear();
    this.scoreObservers.clear();
    this.livesObservers.clear();
    this.levelObservers.clear();
    this.gameStateObservers.clear();
    this.highScoreObservers.clear();
    this.timerObservers.clear();
  }
  
  /**
   * Gets the total number of observers.
   * Useful for debugging and testing.
   * 
   * @returns Total number of active observers
   */
  public getObserverCount(): number {
    return (
      this.observers.size +
      this.scoreObservers.size +
      this.livesObservers.size +
      this.levelObservers.size +
      this.gameStateObservers.size +
      this.highScoreObservers.size +
      this.timerObservers.size
    );
  }
}
