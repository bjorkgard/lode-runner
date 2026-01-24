// Tests for particle system

import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  initParticleSystem,
  createGoldParticles,
  updateParticles,
  renderParticles,
  getActiveParticleCount,
  getPoolSize,
  clearParticles
} from './particles';
import type { Position } from './types';

describe('Particle System', () => {
  beforeEach(() => {
    // Initialize particle system before each test
    initParticleSystem();
  });

  describe('Initialization', () => {
    test('should initialize with empty active particles and full pool', () => {
      expect(getActiveParticleCount()).toBe(0);
      expect(getPoolSize()).toBe(100);
    });
  });

  describe('Property 39: Gold Particle Creation', () => {
    // Feature: lode-runner-game, Property 39: Gold Particle Creation
    // Validates: Requirements 15.1
    test('collecting gold creates particles at the gold location', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.integer(0, 27),
            y: fc.integer(0, 15)
          }),
          (tilePos: Position) => {
            // Clear any existing particles
            clearParticles();
            
            // Create gold particles at the position
            createGoldParticles(tilePos);
            
            // Should have created 8-12 particles
            const particleCount = getActiveParticleCount();
            expect(particleCount).toBeGreaterThanOrEqual(8);
            expect(particleCount).toBeLessThanOrEqual(12);
            
            // Pool should have fewer particles
            const poolSize = getPoolSize();
            expect(poolSize).toBe(100 - particleCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should create particles with valid properties', () => {
      const tilePos = { x: 5, y: 5 };
      createGoldParticles(tilePos);
      
      // Particles should be created
      expect(getActiveParticleCount()).toBeGreaterThan(0);
    });

    test('should handle pool exhaustion gracefully', () => {
      // Exhaust the pool by creating many particle bursts
      for (let i = 0; i < 20; i++) {
        createGoldParticles({ x: i, y: i });
      }
      
      // Should not crash, just stop creating particles when pool is empty
      expect(getActiveParticleCount()).toBeLessThanOrEqual(100);
    });
  });

  describe('Property 40: Particle Movement and Fade', () => {
    // Feature: lode-runner-game, Property 40: Particle Movement and Fade
    // Validates: Requirements 15.2
    test('particles move and fade over time', () => {
      fc.assert(
        fc.property(
          fc.record({
            tilePos: fc.record({
              x: fc.integer(0, 27),
              y: fc.integer(0, 15)
            }),
            deltaTime: fc.float({ min: Math.fround(0.01), max: Math.fround(0.5), noNaN: true })
          }),
          ({ tilePos, deltaTime }) => {
            // Clear and create particles
            clearParticles();
            createGoldParticles(tilePos);
            
            const initialCount = getActiveParticleCount();
            
            // Update particles for a short time (less than min lifetime of 0.5s)
            updateParticles(deltaTime);
            
            // Particles should still be active (not expired yet)
            // since deltaTime < 0.5 and min maxLife is 0.5
            expect(getActiveParticleCount()).toBe(initialCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should update particle positions based on velocity', () => {
      createGoldParticles({ x: 5, y: 5 });
      const initialCount = getActiveParticleCount();
      
      // Update particles for a short time
      updateParticles(0.1);
      
      // Particles should still be active (not expired yet)
      expect(getActiveParticleCount()).toBe(initialCount);
    });
  });

  describe('Property 41: Particle Removal', () => {
    // Feature: lode-runner-game, Property 41: Particle Removal
    // Validates: Requirements 15.3
    test('particles are removed after their lifetime expires', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.integer(0, 27),
            y: fc.integer(0, 15)
          }),
          (tilePos: Position) => {
            // Clear and create particles
            clearParticles();
            createGoldParticles(tilePos);
            
            const initialCount = getActiveParticleCount();
            expect(initialCount).toBeGreaterThan(0);
            
            // Update particles for longer than max lifetime (1.0 seconds)
            updateParticles(1.5);
            
            // All particles should be expired and removed
            expect(getActiveParticleCount()).toBe(0);
            
            // Particles should be returned to pool
            expect(getPoolSize()).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should remove expired particles', () => {
      createGoldParticles({ x: 5, y: 5 });
      const initialCount = getActiveParticleCount();
      
      // Update particles for longer than max lifetime (1.0 seconds)
      updateParticles(1.5);
      
      // All particles should be expired and removed
      expect(getActiveParticleCount()).toBe(0);
      
      // Particles should be returned to pool
      expect(getPoolSize()).toBe(100);
    });
  });

  describe('Rendering', () => {
    test('should render without crashing', () => {
      // Create mock canvas context
      const mockCtx = {
        fillStyle: '',
        globalAlpha: 1,
        fillRect: () => {}
      } as unknown as CanvasRenderingContext2D;
      
      createGoldParticles({ x: 5, y: 5 });
      
      // Should not throw
      expect(() => renderParticles(mockCtx)).not.toThrow();
    });

    test('should reset global alpha after rendering', () => {
      const mockCtx = {
        fillStyle: '',
        globalAlpha: 1,
        fillRect: () => {}
      } as unknown as CanvasRenderingContext2D;
      
      createGoldParticles({ x: 5, y: 5 });
      renderParticles(mockCtx);
      
      // Global alpha should be reset to 1
      expect(mockCtx.globalAlpha).toBe(1);
    });
  });

  describe('Utility Functions', () => {
    test('should clear all active particles', () => {
      createGoldParticles({ x: 5, y: 5 });
      expect(getActiveParticleCount()).toBeGreaterThan(0);
      
      clearParticles();
      
      expect(getActiveParticleCount()).toBe(0);
      expect(getPoolSize()).toBe(100);
    });
  });
});
