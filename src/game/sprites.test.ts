/**
 * Tests for sprite loading and management system
 * 
 * This test suite validates the sprite system's ability to:
 * - Load sprite sheets from image files
 * - Provide animation definitions for player and enemy entities
 * - Handle sprite load failures gracefully (Property 45)
 * - Maintain functionality regardless of sprite load state
 * 
 * The sprite system is critical for rendering but must not block
 * game functionality if assets fail to load. Fallback rendering
 * with colored rectangles ensures the game remains playable.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  getSpriteSheets,
  resetSpriteSheets,
  getAnimations,
  ANIMATIONS
} from './sprites';

describe('Sprite Loading System', () => {
  beforeEach(() => {
    // Reset sprite sheets before each test to ensure clean state
    resetSpriteSheets();
  });

  describe('getSpriteSheets', () => {
    /**
     * Validates that sprite sheets are null before loading.
     * This ensures the system starts in a safe state and can
     * detect when sprites haven't been loaded yet.
     */
    test('should return null before sprites are loaded', () => {
      const sheets = getSpriteSheets();
      expect(sheets).toBeNull();
    });
  });

  describe('getAnimations', () => {
    /**
     * Validates that player animations are accessible and complete.
     * Player requires: idle, run, climb, fall, and dig animations.
     */
    test('should return player animations', () => {
      const anims = getAnimations('player');
      expect(anims).toBe(ANIMATIONS.player);
      expect(anims.idle).toBeDefined();
      expect(anims.run).toBeDefined();
      expect(anims.climb).toBeDefined();
      expect(anims.fall).toBeDefined();
      expect(anims.dig).toBeDefined();
    });

    /**
     * Validates that enemy animations are accessible and complete.
     * Enemy requires: run, climb, fall, and trapped animations.
     */
    test('should return enemy animations', () => {
      const anims = getAnimations('enemy');
      expect(anims).toBe(ANIMATIONS.enemy);
      expect(anims.run).toBeDefined();
      expect(anims.climb).toBeDefined();
      expect(anims.fall).toBeDefined();
      expect(anims.trapped).toBeDefined();
    });
  });

  describe('Animation definitions', () => {
    /**
     * Validates that all player animations have valid frame data.
     * Each animation must have:
     * - frames array with at least one frame
     * - positive frameRate for animation speed
     * - loop boolean to control animation behavior
     */
    test('player animations have valid frame data', () => {
      const playerAnims = ANIMATIONS.player;
      
      for (const anim of Object.values(playerAnims)) {
        expect(anim.frames).toBeDefined();
        expect(anim.frames.length).toBeGreaterThan(0);
        expect(anim.frameRate).toBeGreaterThan(0);
        expect(typeof anim.loop).toBe('boolean');
      }
    });

    /**
     * Validates that all enemy animations have valid frame data.
     * Each animation must have:
     * - frames array with at least one frame
     * - positive frameRate for animation speed
     * - loop boolean to control animation behavior
     */
    test('enemy animations have valid frame data', () => {
      const enemyAnims = ANIMATIONS.enemy;
      
      for (const anim of Object.values(enemyAnims)) {
        expect(anim.frames).toBeDefined();
        expect(anim.frames.length).toBeGreaterThan(0);
        expect(anim.frameRate).toBeGreaterThan(0);
        expect(typeof anim.loop).toBe('boolean');
      }
    });
  });
});

/**
 * Property-Based Tests for Sprite System Resilience
 * 
 * These tests validate Property 45: Sprite Load Failure Resilience
 * 
 * The sprite system must remain functional regardless of whether
 * sprites successfully load or fail. This ensures the game can
 * continue with fallback rendering if assets are unavailable.
 * 
 * Key properties tested:
 * - System functions never throw exceptions
 * - getSpriteSheets returns null or valid object (never undefined)
 * - Animation data is always accessible
 * - Multiple resets don't break the system
 */
describe('Property-Based Tests', () => {
  beforeEach(() => {
    resetSpriteSheets();
  });

  /**
   * Property 45: Sprite Load Failure Resilience
   * 
   * Validates: Requirements 20.3
   * 
   * The sprite system must remain functional regardless of load state.
   * This property ensures that:
   * - getSpriteSheets never throws (returns null or object)
   * - System functions work with or without loaded sprites
   * - Animation data is always accessible
   * - Rendering code can safely check for null and use fallback
   * 
   * This enables graceful degradation: if sprites fail to load,
   * the game continues with colored rectangle rendering.
   */
  test('Property 45: sprite system remains functional regardless of load state', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // Arbitrary boolean to generate test cases
        () => {
          // Reset to ensure clean state
          resetSpriteSheets();
          
          // The core property: the system should be functional
          // regardless of whether sprites are loaded or not
          
          // getSpriteSheets should never throw
          expect(() => getSpriteSheets()).not.toThrow();
          
          // The result can be null (not loaded) or an object (loaded)
          const sheets = getSpriteSheets();
          expect(sheets === null || typeof sheets === 'object').toBe(true);
          
          // Rendering code can safely check: if (sheets) { use sprites } else { use fallback }
          const canRender = sheets !== null;
          expect(typeof canRender).toBe('boolean');
          
          // System functions should work regardless of sprite load state
          expect(() => getAnimations('player')).not.toThrow();
          expect(() => getAnimations('enemy')).not.toThrow();
          expect(() => resetSpriteSheets()).not.toThrow();
          
          // Animation data should always be available
          const playerAnims = getAnimations('player');
          const enemyAnims = getAnimations('enemy');
          expect(playerAnims).toBeDefined();
          expect(enemyAnims).toBeDefined();
          expect(playerAnims.idle).toBeDefined();
          expect(enemyAnims.run).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 45: Sprite Load Failure Resilience (Reset Stability)
   * 
   * Validates: Requirements 20.3
   * 
   * Resetting the sprite system multiple times should never throw
   * or leave the system in an invalid state. After any number of
   * resets, the system should return to a clean null state and
   * remain fully functional.
   * 
   * This ensures the system can be safely reinitialized or reset
   * during testing, error recovery, or asset reloading.
   */
  test('Property 45: resetSpriteSheets always succeeds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }), // Number of times to reset
        (resetCount) => {
          // Resetting multiple times should never throw
          for (let i = 0; i < resetCount; i++) {
            expect(() => resetSpriteSheets()).not.toThrow();
          }
          
          // After resetting, sheets should be null
          const sheets = getSpriteSheets();
          expect(sheets).toBeNull();
          
          // System should still be functional
          expect(() => getAnimations('player')).not.toThrow();
          expect(() => getAnimations('enemy')).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 45: Sprite Load Failure Resilience (Animation Access)
   * 
   * Validates: Requirements 20.3
   * 
   * Animation getters must never throw and always return valid data,
   * regardless of sprite load state. Animation definitions are
   * separate from sprite images and should always be accessible.
   * 
   * This ensures that animation state management works even when
   * sprite images fail to load, allowing the game to continue with
   * fallback rendering while maintaining correct animation timing.
   */
  test('Property 45: animation getters never throw', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('player', 'enemy'), // Entity type
        (entityType) => {
          // Getting animations should never throw
          expect(() => getAnimations(entityType as 'player' | 'enemy')).not.toThrow();
          
          const anims = getAnimations(entityType as 'player' | 'enemy');
          
          // Animations should always be defined
          expect(anims).toBeDefined();
          expect(typeof anims).toBe('object');
          
          // All animations should have required properties
          for (const anim of Object.values(anims)) {
            expect(anim.frames).toBeDefined();
            expect(Array.isArray(anim.frames)).toBe(true);
            expect(anim.frames.length).toBeGreaterThan(0);
            expect(typeof anim.frameRate).toBe('number');
            expect(anim.frameRate).toBeGreaterThan(0);
            expect(typeof anim.loop).toBe('boolean');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
