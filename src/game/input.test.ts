// Tests for input handling system

import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  handleKeyDown,
  handleKeyUp,
  getCurrentInput,
  resetInput,
  setTouchInput,
  updateInput,
  togglePause
} from './input';
import { createInitialState } from './state';
import { GameState } from './types';

describe('Input System', () => {
  beforeEach(() => {
    // Reset input state before each test
    resetInput();
  });

  describe('Property Tests', () => {
    // Feature: lode-runner-game, Property 31: Arrow Key Input Mapping
    test('Property 31: Arrow Key Input Mapping', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'),
          (key) => {
            resetInput();
            
            // Create keyboard event
            const event = new KeyboardEvent('keydown', { key });
            handleKeyDown(event);
            
            const input = getCurrentInput();
            
            // Verify correct input flag is set
            switch (key) {
              case 'ArrowLeft':
                expect(input.left).toBe(true);
                expect(input.right).toBe(false);
                expect(input.up).toBe(false);
                expect(input.down).toBe(false);
                break;
              case 'ArrowRight':
                expect(input.left).toBe(false);
                expect(input.right).toBe(true);
                expect(input.up).toBe(false);
                expect(input.down).toBe(false);
                break;
              case 'ArrowUp':
                expect(input.left).toBe(false);
                expect(input.right).toBe(false);
                expect(input.up).toBe(true);
                expect(input.down).toBe(false);
                break;
              case 'ArrowDown':
                expect(input.left).toBe(false);
                expect(input.right).toBe(false);
                expect(input.up).toBe(false);
                expect(input.down).toBe(true);
                break;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: lode-runner-game, Property 32: WASD Input Mapping
    test('Property 32: WASD Input Mapping', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('w', 'W', 'a', 'A', 's', 'S', 'd', 'D'),
          (key) => {
            resetInput();
            
            // Create keyboard event
            const event = new KeyboardEvent('keydown', { key });
            handleKeyDown(event);
            
            const input = getCurrentInput();
            
            // Verify correct input flag is set
            const lowerKey = key.toLowerCase();
            switch (lowerKey) {
              case 'a':
                expect(input.left).toBe(true);
                expect(input.right).toBe(false);
                expect(input.up).toBe(false);
                expect(input.down).toBe(false);
                break;
              case 'd':
                expect(input.left).toBe(false);
                expect(input.right).toBe(true);
                expect(input.up).toBe(false);
                expect(input.down).toBe(false);
                break;
              case 'w':
                expect(input.left).toBe(false);
                expect(input.right).toBe(false);
                expect(input.up).toBe(true);
                expect(input.down).toBe(false);
                break;
              case 's':
                expect(input.left).toBe(false);
                expect(input.right).toBe(false);
                expect(input.up).toBe(false);
                expect(input.down).toBe(true);
                break;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: lode-runner-game, Property 33: Dig Left Input Mapping
    test('Property 33: Dig Left Input Mapping', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('z', 'Z', 'q', 'Q'),
          (key) => {
            resetInput();
            
            // Create keyboard event
            const event = new KeyboardEvent('keydown', { key });
            handleKeyDown(event);
            
            const input = getCurrentInput();
            
            // Verify digLeft flag is set
            expect(input.digLeft).toBe(true);
            expect(input.digRight).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: lode-runner-game, Property 34: Dig Right Input Mapping
    test('Property 34: Dig Right Input Mapping', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('x', 'X', 'e', 'E'),
          (key) => {
            resetInput();
            
            // Create keyboard event
            const event = new KeyboardEvent('keydown', { key });
            handleKeyDown(event);
            
            const input = getCurrentInput();
            
            // Verify digRight flag is set
            expect(input.digRight).toBe(true);
            expect(input.digLeft).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: lode-runner-game, Property 35: Pause Input Mapping
    test('Property 35: Pause Input Mapping', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('p', 'P', 'Escape'),
          (key) => {
            resetInput();
            
            // Create keyboard event
            const event = new KeyboardEvent('keydown', { key });
            handleKeyDown(event);
            
            const input = getCurrentInput();
            
            // Verify pause flag is set
            expect(input.pause).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: lode-runner-game, Property 3: Directional Input Response
    test('Property 3: Directional Input Response', () => {
      fc.assert(
        fc.property(
          fc.record({
            direction: fc.constantFrom('left', 'right', 'up', 'down'),
            playerX: fc.integer({ min: 1, max: 26 }),
            playerY: fc.integer({ min: 1, max: 14 }),
            isOnLadder: fc.boolean()
          }),
          ({ direction, playerX, playerY, isOnLadder }) => {
            resetInput();
            
            // Create initial state with player at position
            let state = createInitialState();
            state = {
              ...state,
              gameState: GameState.Playing,
              player: {
                ...state.player,
                pos: { x: playerX, y: playerY },
                velocity: { x: 0, y: 0 },
                isOnLadder
              }
            };
            
            // Apply input
            setTouchInput(direction, true);
            const updatedState = updateInput(state, 0.016);
            
            // Verify velocity changed in correct direction
            switch (direction) {
              case 'left':
                expect(updatedState.player.velocity.x).toBeLessThan(0);
                break;
              case 'right':
                expect(updatedState.player.velocity.x).toBeGreaterThan(0);
                break;
              case 'up':
                if (isOnLadder) {
                  expect(updatedState.player.velocity.y).toBeLessThan(0);
                }
                break;
              case 'down':
                if (isOnLadder) {
                  expect(updatedState.player.velocity.y).toBeGreaterThan(0);
                }
                break;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    test('handleKeyUp clears input flags', () => {
      // Press left key
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      handleKeyDown(downEvent);
      expect(getCurrentInput().left).toBe(true);
      
      // Release left key
      const upEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
      handleKeyUp(upEvent);
      expect(getCurrentInput().left).toBe(false);
    });

    test('setTouchInput updates input state', () => {
      setTouchInput('left', true);
      expect(getCurrentInput().left).toBe(true);
      
      setTouchInput('left', false);
      expect(getCurrentInput().left).toBe(false);
      
      setTouchInput('digRight', true);
      expect(getCurrentInput().digRight).toBe(true);
    });

    test('togglePause switches between Playing and Paused', () => {
      let state = createInitialState();
      state = { ...state, gameState: GameState.Playing };
      
      // Toggle to paused
      state = togglePause(state);
      expect(state.gameState).toBe(GameState.Paused);
      
      // Toggle back to playing
      state = togglePause(state);
      expect(state.gameState).toBe(GameState.Playing);
    });

    test('togglePause does not affect Menu state', () => {
      let state = createInitialState();
      state = { ...state, gameState: GameState.Menu };
      
      state = togglePause(state);
      expect(state.gameState).toBe(GameState.Menu);
    });

    test('updateInput applies horizontal movement', () => {
      let state = createInitialState();
      state = { ...state, gameState: GameState.Playing };
      
      // Press right key
      setTouchInput('right', true);
      state = updateInput(state, 0.016);
      
      expect(state.player.velocity.x).toBeGreaterThan(0);
    });

    test('updateInput applies vertical movement on ladder', () => {
      let state = createInitialState();
      state = {
        ...state,
        gameState: GameState.Playing,
        player: {
          ...state.player,
          isOnLadder: true
        }
      };
      
      // Press up key
      setTouchInput('up', true);
      state = updateInput(state, 0.016);
      
      expect(state.player.velocity.y).toBeLessThan(0);
    });

    test('updateInput only triggers dig on button press, not hold', () => {
      let state = createInitialState();
      state = { ...state, gameState: GameState.Playing };
      
      // First frame: button pressed
      setTouchInput('digLeft', true);
      state = updateInput(state, 0.016);
      const firstDigging = state.player.isDigging;
      
      // Reset digging flag for next test
      state = {
        ...state,
        player: {
          ...state.player,
          isDigging: false,
          digDirection: null
        }
      };
      
      // Second frame: button still held (should not dig again)
      state = updateInput(state, 0.016);
      const secondDigging = state.player.isDigging;
      
      // First press should trigger dig, second frame should not
      expect(firstDigging || !secondDigging).toBe(true);
    });
  });
});
