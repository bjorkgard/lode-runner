// Input handling system for Lode Runner

import type { GameStateData, InputState } from './types';
import { GameState } from './types';
import { PLAYER_SPEED } from './constants';
import { digHole } from './digging';

/**
 * Current input state tracking all pressed keys.
 * Updated by keyboard and touch input handlers.
 */
let currentInput: InputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  digLeft: false,
  digRight: false,
  pause: false
};

/**
 * Previous frame's input state for detecting button press events.
 * Used to distinguish between "button pressed" and "button held".
 */
let previousInput: InputState = { ...currentInput };

/**
 * Initializes the input system by attaching keyboard event listeners.
 * Should be called once during game initialization.
 */
export function initInput(): void {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
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
export function handleKeyDown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      currentInput.left = true;
      event.preventDefault();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      currentInput.right = true;
      event.preventDefault();
      break;
    case 'ArrowUp':
    case 'w':
    case 'W':
      currentInput.up = true;
      event.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      currentInput.down = true;
      event.preventDefault();
      break;
    case 'z':
    case 'Z':
    case 'q':
    case 'Q':
      currentInput.digLeft = true;
      event.preventDefault();
      break;
    case 'x':
    case 'X':
    case 'e':
    case 'E':
      currentInput.digRight = true;
      event.preventDefault();
      break;
    case 'p':
    case 'P':
    case 'Escape':
      currentInput.pause = true;
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
export function handleKeyUp(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      currentInput.left = false;
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      currentInput.right = false;
      break;
    case 'ArrowUp':
    case 'w':
    case 'W':
      currentInput.up = false;
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      currentInput.down = false;
      break;
    case 'z':
    case 'Z':
    case 'q':
    case 'Q':
      currentInput.digLeft = false;
      break;
    case 'x':
    case 'X':
    case 'e':
    case 'E':
      currentInput.digRight = false;
      break;
    case 'p':
    case 'P':
    case 'Escape':
      currentInput.pause = false;
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
export function updateInput(state: GameStateData, _deltaTime: number): GameStateData {
  let updatedState = state;
  
  // Handle horizontal movement
  let velocityX = 0;
  if (currentInput.left) {
    velocityX = -PLAYER_SPEED;
  } else if (currentInput.right) {
    velocityX = PLAYER_SPEED;
  }
  
  // Handle vertical movement on ladders
  let velocityY = state.player.velocity.y;
  if (state.player.isOnLadder) {
    if (currentInput.up) {
      velocityY = -PLAYER_SPEED;
    } else if (currentInput.down) {
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
  if (currentInput.digLeft && !previousInput.digLeft) {
    updatedState = digHole(updatedState, 'left');
  }
  if (currentInput.digRight && !previousInput.digRight) {
    updatedState = digHole(updatedState, 'right');
  }
  
  // Handle pause (only on button press)
  if (currentInput.pause && !previousInput.pause) {
    updatedState = togglePause(updatedState);
  }
  
  // Update previous input for next frame
  previousInput = { ...currentInput };
  
  return updatedState;
}

/**
 * Sets touch input state for mobile controls.
 * Allows external components to simulate keyboard input via touch.
 * 
 * @param direction - The input direction to set ('left', 'right', 'up', 'down', 'digLeft', 'digRight')
 * @param pressed - Whether the input is pressed (true) or released (false)
 */
export function setTouchInput(direction: string, pressed: boolean): void {
  switch (direction) {
    case 'left':
      currentInput.left = pressed;
      break;
    case 'right':
      currentInput.right = pressed;
      break;
    case 'up':
      currentInput.up = pressed;
      break;
    case 'down':
      currentInput.down = pressed;
      break;
    case 'digLeft':
      currentInput.digLeft = pressed;
      break;
    case 'digRight':
      currentInput.digRight = pressed;
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
export function togglePause(state: GameStateData): GameStateData {
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
export function getCurrentInput(): InputState {
  return { ...currentInput };
}

/**
 * Resets the input state to all false values.
 * Useful for testing and cleanup.
 */
export function resetInput(): void {
  currentInput = {
    left: false,
    right: false,
    up: false,
    down: false,
    digLeft: false,
    digRight: false,
    pause: false
  };
  previousInput = { ...currentInput };
}
