/**
 * Vitest test setup configuration for Lode Runner game.
 * 
 * This file configures the test environment with necessary mocks and utilities
 * for testing a Canvas-based game in a jsdom environment. It provides:
 * 
 * - Canvas 2D API mocks for rendering tests
 * - requestAnimationFrame/cancelAnimationFrame for game loop tests
 * - Audio API mocks for sound effect tests
 * - localStorage mocks for persistence tests
 * - React Testing Library cleanup after each test
 * 
 * @module test/setup
 * @see {@link https://vitest.dev/config/} for Vitest configuration
 * @see {@link https://testing-library.com/docs/react-testing-library/intro/} for React Testing Library
 */

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/**
 * Cleanup React Testing Library after each test to prevent memory leaks
 * and ensure test isolation.
 */
afterEach(() => {
  cleanup();
});

/**
 * Mock implementation of Canvas 2D rendering context.
 * 
 * Provides all necessary Canvas 2D API methods as Vitest mock functions,
 * allowing tests to verify rendering calls without actual canvas operations.
 * 
 * @class MockCanvasRenderingContext2D
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D}
 */
class MockCanvasRenderingContext2D {
  /** Mock canvas element with default dimensions */
  canvas = {
    width: 800,
    height: 600,
  };
  
  /** Fill style for shapes and text */
  fillStyle = '';
  
  /** Stroke style for shapes and text */
  strokeStyle = '';
  
  /** Line width for drawing operations */
  lineWidth = 1;
  
  /** Global alpha (opacity) for all drawing operations */
  globalAlpha = 1;
  
  /** Image smoothing enabled flag (disabled for pixel-perfect rendering) */
  imageSmoothingEnabled = true;
  
  /** Mock method for filling rectangles */
  fillRect = vi.fn();
  
  /** Mock method for stroking rectangles */
  strokeRect = vi.fn();
  
  /** Mock method for clearing rectangles */
  clearRect = vi.fn();
  
  /** Mock method for beginning a path */
  beginPath = vi.fn();
  
  /** Mock method for closing a path */
  closePath = vi.fn();
  
  /** Mock method for moving to a point */
  moveTo = vi.fn();
  
  /** Mock method for drawing a line to a point */
  lineTo = vi.fn();
  
  /** Mock method for drawing an arc */
  arc = vi.fn();
  
  /** Mock method for filling the current path */
  fill = vi.fn();
  
  /** Mock method for stroking the current path */
  stroke = vi.fn();
  
  /** Mock method for drawing images (sprites) */
  drawImage = vi.fn();
  
  /** Mock method for saving canvas state */
  save = vi.fn();
  
  /** Mock method for restoring canvas state */
  restore = vi.fn();
  
  /** Mock method for translating the canvas */
  translate = vi.fn();
  
  /** Mock method for rotating the canvas */
  rotate = vi.fn();
  
  /** Mock method for scaling the canvas */
  scale = vi.fn();
  
  /** Mock method for setting transformation matrix */
  setTransform = vi.fn();
  
  /** Mock method for resetting transformation matrix */
  resetTransform = vi.fn();
  
  /** Mock method for measuring text width */
  measureText = vi.fn(() => ({ width: 0 }));
  
  /** Mock method for filling text */
  fillText = vi.fn();
  
  /** Mock method for stroking text */
  strokeText = vi.fn();
}

/**
 * Mock HTMLCanvasElement.getContext to return our mock 2D context.
 * This allows tests to create canvas elements and get a working context.
 */
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
    if (contextType === '2d') {
      return new MockCanvasRenderingContext2D() as any;
    }
    return null;
  });
}

/**
 * Mock requestAnimationFrame for game loop testing.
 * 
 * Simulates 60 FPS by calling the callback after 16ms (1000ms / 60fps ≈ 16ms).
 * Returns a mock frame ID that can be used with cancelAnimationFrame.
 * 
 * @param callback - The function to call on the next frame
 * @returns A mock frame request ID
 */
(globalThis as any).requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  setTimeout(() => callback(Date.now()), 16);
  return 1;
});

/**
 * Mock cancelAnimationFrame for stopping game loop in tests.
 * 
 * @param id - The frame request ID to cancel
 */
(globalThis as any).cancelAnimationFrame = vi.fn();

/**
 * Mock Audio API implementation.
 * 
 * Provides a mock Audio constructor with all necessary methods and properties
 * for testing sound effect playback without actual audio.
 * 
 * @class MockAudio
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement}
 */
class MockAudio {
  /** Mock play method that resolves immediately */
  play = vi.fn().mockResolvedValue(undefined);
  
  /** Mock pause method */
  pause = vi.fn();
  
  /** Mock load method */
  load = vi.fn();
  
  /** Volume level (0.0 to 1.0) */
  volume = 1;
  
  /** Muted state */
  muted = false;
  
  /** Current playback time in seconds */
  currentTime = 0;
  
  /** Total duration in seconds */
  duration = 0;
  
  /** Mock event listener registration */
  addEventListener = vi.fn();
  
  /** Mock event listener removal */
  removeEventListener = vi.fn();
}

/**
 * Replace global Audio constructor with mock implementation.
 */
(globalThis as any).Audio = MockAudio as any;

/**
 * Mock localStorage implementation.
 * 
 * Provides an in-memory storage that mimics the localStorage API,
 * allowing tests to verify persistence logic without browser storage.
 * 
 * The storage is reset between tests to ensure test isolation.
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage}
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    /**
     * Retrieves an item from storage.
     * @param key - The key to retrieve
     * @returns The stored value or null if not found
     */
    getItem: (key: string) => store[key] || null,
    
    /**
     * Stores an item in storage.
     * @param key - The key to store under
     * @param value - The value to store (converted to string)
     */
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    
    /**
     * Removes an item from storage.
     * @param key - The key to remove
     */
    removeItem: (key: string) => {
      delete store[key];
    },
    
    /**
     * Clears all items from storage.
     */
    clear: () => {
      store = {};
    },
  };
})();

/**
 * Replace global localStorage with mock implementation.
 */
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});
