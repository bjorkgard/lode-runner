// Input handling system for Lode Runner

import type { GameStateData, InputState } from './types';
import { GameState } from './types';
import { PLAYER_SPEED } from './constants';
import { digHole } from './digging';

/**
 * Input manager class that handles keyboard and touch input.
 * Encapsulates input state and provides methods for input processing.
 * 
 * Benefits of class-based approach:
 * - Easier to test (can create isolated instances)
 * - No module-level state pollution
 * - Better for hot module replacement
 * - Can have multiple instances if needed
 */
export class InputManager {
  private currentInput: InputState;
  private previousInput: InputState;
  private handleKeyDown: (event: KeyboardEvent) => void;
  private handleKeyUp: (event: KeyboardEvent) => void;
  
  constructor() {
    this.currentInput = {
      left: false,
      right: false,
      up: false,
      down: false,
      digLeft: false,
      digRight: false,
      pause: false
    };
    this.previousInput = { ...this.currentInput };
    
    // Bind event handlers to maintain 'this' context
    this.handleKeyDown = this.onKeyDown.bind(this);
    this.handleKeyUp = this.onKeyUp.bind(this);
  }
  
  /**
   * Initializes the input system by attaching keyboard event listeners.
   * Returns a cleanup function to remove event listeners.
   * 
   * @returns Cleanup function to remove event listeners
   */
  init(): () => void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    };
  }
  
  /**
   * Handles keyboard key down events.
   * Maps keyboard keys to input state flags and prevents default browser behavior.
   * 
   * Supported keys:
   * - Arrow keys / WASD: Directional movement
   * - Z/Q: Dig left
   * - X/E: Dig right
   * - P/Escape: Pause toggle
   * 
   * @param event - The keyboard event
   */
  private onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.currentInput.left = true;
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.currentInput.right = true;
        event.preventDefault();
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.currentInput.up = true;
        event.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.currentInput.down = true;
        event.preventDefault();
        break;
      case 'z':
      case 'Z':
      case 'q':
      case 'Q':
        this.currentInput.digLeft = true;
        event.preventDefault();
        break;
      case 'x':
      case 'X':
      case 'e':
      case 'E':
        this.currentInput.digRight = true;
        event.preventDefault();
        break;
      case 'p':
      case 'P':
      case 'Escape':
        this.currentInput.pause = true;
        event.preventDefault();
        break;
    }
  }
  
  /**
   * Handles keyboard key up events.
   * Clears input state flags when keys are released.
   * 
   * @param event - The keyboard event
   */
  private onKeyUp(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.currentInput.left = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.currentInput.right = false;
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.currentInput.up = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.currentInput.down = false;
        break;
      case 'z':
      case 'Z':
      case 'q':
      case 'Q':
        this.currentInput.digLeft = false;
        break;
      case 'x':
      case 'X':
      case 'e':
      case 'E':
        this.currentInput.digRight = false;
        break;
      case 'p':
      case 'P':
      case 'Escape':
        this.currentInput.pause = false;
        break;
    }
  }
  
  /**
   * Updates game state based on current input state.
   * Handles player movement, digging actions, and pause toggle.
   * Returns a new state object with input-driven changes applied.
   * 
   * Movement rules:
   * - Horizontal movement: Always applied when left/right pressed
   * - Vertical movement on ladders: Up/down keys move player vertically
   * - Digging: Only triggers on button press (not held)
   * - Pause: Only triggers on button press (not held)
   * 
   * @param state - Current game state
   * @param _deltaTime - Time elapsed since last update (unused, for consistency)
   * @returns New game state with input applied
   */
  updateInput(state: GameStateData, _deltaTime: number): GameStateData {
    let updatedState = state;
    
    // Handle horizontal movement
    let velocityX = 0;
    if (this.currentInput.left) {
      velocityX = -PLAYER_SPEED;
    } else if (this.currentInput.right) {
      velocityX = PLAYER_SPEED;
    }
    
    // Handle vertical movement on ladders
    let velocityY = state.player.velocity.y;
    if (state.player.isOnLadder) {
      if (this.currentInput.up) {
        velocityY = -PLAYER_SPEED;
      } else if (this.currentInput.down) {
        velocityY = PLAYER_SPEED;
      } else {
        velocityY = 0;
      }
    }
    
    // Update player velocity
    updatedState = {
      ...updatedState,
      player: {
        ...updatedState.player,
        velocity: { x: velocityX, y: velocityY }
      }
    };
    
    // Handle digging (only on button press, not hold)
    if (this.currentInput.digLeft && !this.previousInput.digLeft) {
      updatedState = digHole(updatedState, 'left');
    }
    if (this.currentInput.digRight && !this.previousInput.digRight) {
      updatedState = digHole(updatedState, 'right');
    }
    
    // Handle pause (only on button press)
    if (this.currentInput.pause && !this.previousInput.pause) {
      updatedState = this.togglePause(updatedState);
    }
    
    // Update previous input for next frame
    this.previousInput = { ...this.currentInput };
    
    return updatedState;
  }
  
  /**
   * Sets touch input state for mobile controls.
   * Allows external components to simulate keyboard input via touch.
   * 
   * @param direction - The input direction to set ('left', 'right', 'up', 'down', 'digLeft', 'digRight')
   * @param pressed - Whether the input is pressed (true) or released (false)
   */
  setTouchInput(direction: string, pressed: boolean): void {
    switch (direction) {
      case 'left':
        this.currentInput.left = pressed;
        break;
      case 'right':
        this.currentInput.right = pressed;
        break;
      case 'up':
        this.currentInput.up = pressed;
        break;
      case 'down':
        this.currentInput.down = pressed;
        break;
      case 'digLeft':
        this.currentInput.digLeft = pressed;
        break;
      case 'digRight':
        this.currentInput.digRight = pressed;
        break;
    }
  }
  
  /**
   * Toggles the game pause state.
   * Transitions between Playing and Paused states.
   * Returns a new state object with updated game state.
   * 
   * @param state - Current game state
   * @returns New game state with pause toggled
   */
  private togglePause(state: GameStateData): GameStateData {
    if (state.gameState === GameState.Playing) {
      return {
        ...state,
        gameState: GameState.Paused
      };
    } else if (state.gameState === GameState.Paused) {
      return {
        ...state,
        gameState: GameState.Playing
      };
    }
    
    // No change for other states (Menu, GameOver, Victory)
    return state;
  }
  
  /**
   * Gets the current input state for testing purposes.
   * @returns Current input state
   */
  getCurrentInput(): InputState {
    return { ...this.currentInput };
  }
  
  /**
   * Resets the input state to all false values.
   * Useful for testing and cleanup.
   */
  reset(): void {
    this.currentInput = {
      left: false,
      right: false,
      up: false,
      down: false,
      digLeft: false,
      digRight: false,
      pause: false
    };
    this.previousInput = { ...this.currentInput };
  }
}
