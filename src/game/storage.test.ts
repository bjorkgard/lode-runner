// Tests for storage system

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import {
  saveHighScore,
  loadHighScore,
  saveAudioSettings,
  loadAudioSettings,
  resetHighScore
} from './storage';
import { STORAGE_KEYS } from './constants';
import type { AudioSettings } from './types';

describe('Storage System', () => {
  // Clear localStorage before and after each test
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('High Score Persistence', () => {
    // Feature: lode-runner-game, Property 26: High Score Persistence Round-Trip
    test('Property 26: saving and loading high score returns same value', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          (score) => {
            // Clear any existing high score
            localStorage.removeItem(STORAGE_KEYS.highScore);

            // Save the score
            saveHighScore(score);

            // Load it back
            const loaded = loadHighScore();

            // Should match the saved value
            expect(loaded).toBe(score);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('high score only updates if new score is higher', () => {
      saveHighScore(1000);
      expect(loadHighScore()).toBe(1000);

      // Try to save a lower score
      saveHighScore(500);
      expect(loadHighScore()).toBe(1000); // Should remain 1000

      // Save a higher score
      saveHighScore(2000);
      expect(loadHighScore()).toBe(2000); // Should update
    });

    test('loadHighScore returns 0 when no score is stored', () => {
      expect(loadHighScore()).toBe(0);
    });

    test('resetHighScore removes the stored high score', () => {
      saveHighScore(5000);
      expect(loadHighScore()).toBe(5000);

      resetHighScore();
      expect(loadHighScore()).toBe(0);
    });
  });

  describe('Audio Settings Persistence', () => {
    // Feature: lode-runner-game, Property 27: Audio Settings Persistence Round-Trip
    test('Property 27: saving and loading audio settings returns same values', () => {
      fc.assert(
        fc.property(
          fc.record({
            muted: fc.boolean(),
            volume: fc.float({ min: 0, max: 1, noNaN: true })
          }),
          (settings: AudioSettings) => {
            // Clear any existing settings
            localStorage.removeItem(STORAGE_KEYS.audioSettings);

            // Save the settings
            saveAudioSettings(settings);

            // Load them back
            const loaded = loadAudioSettings();

            // Should match the saved values
            expect(loaded.muted).toBe(settings.muted);
            expect(loaded.volume).toBeCloseTo(settings.volume, 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('loadAudioSettings returns defaults when no settings are stored', () => {
      const defaults = loadAudioSettings();
      expect(defaults.muted).toBe(false);
      expect(defaults.volume).toBe(0.7);
    });

    test('audio settings persist across multiple save/load cycles', () => {
      const settings1: AudioSettings = { muted: true, volume: 0.5 };
      saveAudioSettings(settings1);
      expect(loadAudioSettings()).toEqual(settings1);

      const settings2: AudioSettings = { muted: false, volume: 0.9 };
      saveAudioSettings(settings2);
      expect(loadAudioSettings()).toEqual(settings2);
    });
  });

  describe('Storage Failure Handling', () => {
    // Feature: lode-runner-game, Property 28: Storage Failure Graceful Handling
    test('Property 28: storage failures return defaults without crashing', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('getItem', 'setItem', 'removeItem'),
          (methodName) => {
            // Mock localStorage to throw errors
            vi.spyOn(localStorage, methodName as any).mockImplementation(() => {
              throw new Error('Storage quota exceeded');
            });

            // Test operations that use this specific method
            if (methodName === 'getItem') {
              // getItem failures should return defaults
              expect(() => loadHighScore()).not.toThrow();
              expect(() => loadAudioSettings()).not.toThrow();
              
              const highScore = loadHighScore();
              expect(highScore).toBe(0);

              const audioSettings = loadAudioSettings();
              expect(audioSettings).toEqual({ muted: false, volume: 0.7 });
            } else if (methodName === 'setItem') {
              // setItem failures should not crash
              expect(() => saveHighScore(1000)).not.toThrow();
              expect(() => saveAudioSettings({ muted: true, volume: 0.5 })).not.toThrow();
            } else if (methodName === 'removeItem') {
              // removeItem failures should not crash
              expect(() => resetHighScore()).not.toThrow();
            }

            // Restore original method
            vi.restoreAllMocks();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('loadHighScore returns 0 when localStorage.getItem throws', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      expect(loadHighScore()).toBe(0);
      vi.restoreAllMocks();
    });

    test('loadAudioSettings returns defaults when localStorage.getItem throws', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      const settings = loadAudioSettings();
      expect(settings).toEqual({ muted: false, volume: 0.7 });
      vi.restoreAllMocks();
    });

    test('saveHighScore does not crash when localStorage.setItem throws', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => saveHighScore(5000)).not.toThrow();
      vi.restoreAllMocks();
    });

    test('saveAudioSettings does not crash when localStorage.setItem throws', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => saveAudioSettings({ muted: true, volume: 0.8 })).not.toThrow();
      vi.restoreAllMocks();
    });

    test('resetHighScore does not crash when localStorage.removeItem throws', () => {
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      expect(() => resetHighScore()).not.toThrow();
      vi.restoreAllMocks();
    });

    test('loadAudioSettings handles invalid JSON gracefully', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid json {');

      const settings = loadAudioSettings();
      expect(settings).toEqual({ muted: false, volume: 0.7 });
      vi.restoreAllMocks();
    });

    test('loadHighScore handles invalid number format gracefully', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('not a number');

      const score = loadHighScore();
      expect(score).toBe(0); // parseInt returns NaN, which we handle by returning 0
      vi.restoreAllMocks();
    });
  });
});
