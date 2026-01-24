// Tests for audio system

import { describe, test, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { AudioManager } from './audio';
import * as storage from './storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock Audio constructor
class MockAudio {
  src = '';
  volume = 1;
  oncanplaythrough: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  load() {
    // Simulate successful load
    setTimeout(() => {
      if (this.oncanplaythrough) {
        this.oncanplaythrough();
      }
    }, 0);
  }
  
  play() {
    return Promise.resolve();
  }
  
  cloneNode() {
    const clone = new MockAudio();
    clone.src = this.src;
    clone.volume = this.volume;
    return clone;
  }
}

global.Audio = MockAudio as any;

describe('Audio System', () => {
  let audioManager: AudioManager;
  
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    audioManager = new AudioManager();
  });

  describe('Property 29: Mute Toggle', () => {
    test('toggling mute flips muted state', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (initialMuted) => {
            const manager = new AudioManager();
            
            // Set initial muted state
            manager.setMuted(initialMuted);
            
            // Get state before toggle
            const beforeToggle = manager.getAudioSettings().muted;
            expect(beforeToggle).toBe(initialMuted);
            
            // Toggle mute
            manager.toggleMute();
            
            // Get state after toggle
            const afterToggle = manager.getAudioSettings().muted;
            
            // Verify muted state flipped
            expect(afterToggle).toBe(!beforeToggle);
            expect(afterToggle).toBe(!initialMuted);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('multiple toggles alternate between muted and unmuted', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.integer({ min: 1, max: 10 }),
          (initialMuted, toggleCount) => {
            const manager = new AudioManager();
            
            // Set initial state
            manager.setMuted(initialMuted);
            
            // Toggle multiple times
            for (let i = 0; i < toggleCount; i++) {
              manager.toggleMute();
            }
            
            // After even number of toggles, should be back to initial state
            // After odd number of toggles, should be opposite of initial state
            const finalMuted = manager.getAudioSettings().muted;
            const expectedMuted = toggleCount % 2 === 0 ? initialMuted : !initialMuted;
            
            expect(finalMuted).toBe(expectedMuted);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 30: Volume Setting', () => {
    test('setting volume updates audio settings', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1, noNaN: true }),
          (volume) => {
            const manager = new AudioManager();
            
            // Set volume
            manager.setVolume(volume);
            
            // Get audio settings
            const settings = manager.getAudioSettings();
            
            // Verify volume was set correctly
            expect(settings.volume).toBe(volume);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('volume is clamped to valid range [0, 1]', () => {
      fc.assert(
        fc.property(
          fc.float({ noNaN: true }),
          (volume) => {
            const manager = new AudioManager();
            
            // Set volume (may be outside valid range)
            manager.setVolume(volume);
            
            // Get audio settings
            const settings = manager.getAudioSettings();
            
            // Verify volume is clamped to [0, 1]
            expect(settings.volume).toBeGreaterThanOrEqual(0);
            expect(settings.volume).toBeLessThanOrEqual(1);
            
            // Verify clamping behavior
            // Note: Use Math.abs to handle -0 vs +0 edge case
            if (volume < 0) {
              expect(Math.abs(settings.volume)).toBe(0);
            } else if (volume > 1) {
              expect(settings.volume).toBe(1);
            } else {
              // For values in range, allow both -0 and +0 to be treated as 0
              if (Object.is(volume, -0)) {
                expect(Math.abs(settings.volume)).toBe(0);
              } else {
                expect(settings.volume).toBe(volume);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('volume setting persists to storage', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1, noNaN: true }),
          (volume) => {
            const manager = new AudioManager();
            
            // Set volume
            manager.setVolume(volume);
            
            // Load settings from storage
            const loadedSettings = storage.loadAudioSettings();
            
            // Verify volume was persisted
            expect(loadedSettings.volume).toBe(volume);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 44: Audio Load Failure Resilience', () => {
    test('failed audio load does not crash game', async () => {
      // Create a failing Audio mock
      class FailingAudio {
        src = '';
        volume = 1;
        oncanplaythrough: (() => void) | null = null;
        onerror: ((error: Error) => void) | null = null;
        
        load() {
          // Simulate load failure
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Failed to load audio'));
            }
          }, 0);
        }
        
        play() {
          return Promise.reject(new Error('Audio not loaded'));
        }
        
        cloneNode() {
          return new FailingAudio();
        }
      }
      
      // Temporarily replace Audio with failing version
      const originalAudio = global.Audio;
      global.Audio = FailingAudio as any;
      
      try {
        const manager = new AudioManager();
        
        // Attempt to initialize audio (should fail gracefully)
        await manager.init();
        
        // Game should continue - no exception thrown
        expect(true).toBe(true);
        
        // Attempting to play sound should not crash
        expect(() => manager.playSound('dig')).not.toThrow();
        expect(() => manager.playSound('goldPickup')).not.toThrow();
        expect(() => manager.playSound('death')).not.toThrow();
        expect(() => manager.playSound('levelComplete')).not.toThrow();
        expect(() => manager.playSound('uiClick')).not.toThrow();
      } finally {
        // Restore original Audio
        global.Audio = originalAudio;
      }
    });

    test('audio system functions work without loaded assets', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.float({ min: 0, max: 1, noNaN: true }),
          fc.constantFrom('dig', 'goldPickup', 'death', 'levelComplete', 'uiClick'),
          (muted, volume, soundName) => {
            const manager = new AudioManager();
            
            // These operations should not crash even if audio failed to load
            expect(() => manager.setMuted(muted)).not.toThrow();
            expect(() => manager.setVolume(volume)).not.toThrow();
            expect(() => manager.toggleMute()).not.toThrow();
            expect(() => manager.playSound(soundName as any)).not.toThrow();
            expect(() => manager.getAudioSettings()).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('partial audio load failure is handled gracefully', async () => {
      let loadCount = 0;
      
      // Create Audio mock that fails on specific files
      class PartiallyFailingAudio {
        src = '';
        volume = 1;
        oncanplaythrough: (() => void) | null = null;
        onerror: ((error: Error) => void) | null = null;
        
        load() {
          loadCount++;
          // Fail on every other load
          setTimeout(() => {
            if (loadCount % 2 === 0) {
              if (this.onerror) {
                this.onerror(new Error('Failed to load audio'));
              }
            } else {
              if (this.oncanplaythrough) {
                this.oncanplaythrough();
              }
            }
          }, 0);
        }
        
        play() {
          return Promise.resolve();
        }
        
        cloneNode() {
          const clone = new PartiallyFailingAudio();
          clone.src = this.src;
          clone.volume = this.volume;
          return clone;
        }
      }
      
      const originalAudio = global.Audio;
      global.Audio = PartiallyFailingAudio as any;
      
      try {
        const manager = new AudioManager();
        
        // Attempt to initialize audio (some files will fail)
        await manager.init();
        
        // Game should continue - no exception thrown
        expect(true).toBe(true);
        
        // All audio functions should still work
        expect(() => manager.playSound('dig')).not.toThrow();
        expect(() => manager.setMuted(true)).not.toThrow();
        expect(() => manager.setVolume(0.5)).not.toThrow();
      } finally {
        global.Audio = originalAudio;
      }
    });
  });
});
