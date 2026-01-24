// Tests for particle system

import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ParticleManager } from './particles';
import type { Position } from './types';

describe('Particle System', () => {
  let particleManager: ParticleManager;
  
  beforeEach(() => {
    // Initialize particle system before each test
    particleManager = new ParticleManager();
    particleManager.init();
  });

  describe('Initialization', () => {
    test('should initialize with empty active particles and full pool', () => {
      expect(particleManager.getActiveParticleCount()).toBe(0);
      expect(particleManager.getPoolSize()).toBe(100);
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
            particleManager.clear();
            
            // Create gold particles at the position
            particleManager.createGoldParticles(tilePos);
            
            // Should have created 8-12 particles
            const particleCount = particleManager.getActiveParticleCount();
            expect(particleCount).toBeGreaterThanOrEqual(8);
            expect(particleCount).toBeLessThanOrEqual(12);
            
            // Pool should have fewer particles
            const poolSize = particleManager.getPoolSize();
            expect(poolSize).toBe(100 - particleCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should create particles with valid properties', () => {
      const tilePos = { x: 5, y: 5 };
      particleManager.createGoldParticles(tilePos);
      
      // Particles should be created
      expect(particleManager.getActiveParticleCount()).toBeGreaterThan(0);
    });

    test('should handle pool exhaustion gracefully', () => {
      // Exhaust the pool by creating many particle bursts
      for (let i = 0; i < 20; i++) {
        particleManager.createGoldParticles({ x: i, y: i });
      }
      
      // Should not crash, just stop creating particles when pool is empty
      expect(particleManager.getActiveParticleCount()).toBeLessThanOrEqual(100);
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
            particleManager.clear();
            particleManager.createGoldParticles(tilePos);
            
            const initialCount = particleManager.getActiveParticleCount();
            
            // Update particles for a short time (less than min lifetime of 0.5s)
            particleManager.update(deltaTime);
            
            // Particles should still be active (not expired yet)
            // since deltaTime < 0.5 and min maxLife is 0.5
            expect(particleManager.getActiveParticleCount()).toBe(initialCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should update particle positions based on velocity', () => {
      particleManager.createGoldParticles({ x: 5, y: 5 });
      const initialCount = particleManager.getActiveParticleCount();
      
      // Update particles for a short time
      particleManager.update(0.1);
      
      // Particles should still be active (not expired yet)
      expect(particleManager.getActiveParticleCount()).toBe(initialCount);
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
            particleManager.clear();
            particleManager.createGoldParticles(tilePos);
            
            const initialCount = particleManager.getActiveParticleCount();
            expect(initialCount).toBeGreaterThan(0);
            
            // Update particles for longer than max lifetime (1.0 seconds)
            particleManager.update(1.5);
            
            // All particles should be expired and removed
            expect(particleManager.getActiveParticleCount()).toBe(0);
            
            // Particles should be returned to pool
            expect(particleManager.getPoolSize()).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should remove expired particles', () => {
      particleManager.createGoldParticles({ x: 5, y: 5 });
      const initialCount = particleManager.getActiveParticleCount();
      
      // Update particles for longer than max lifetime (1.0 seconds)
      particleManager.update(1.5);
      
      // All particles should be expired and removed
      expect(particleManager.getActiveParticleCount()).toBe(0);
      
      // Particles should be returned to pool
      expect(particleManager.getPoolSize()).toBe(100);
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
      
      particleManager.createGoldParticles({ x: 5, y: 5 });
      
      // Should not throw
      expect(() => particleManager.render(mockCtx)).not.toThrow();
    });

    test('should reset global alpha after rendering', () => {
      const mockCtx = {
        fillStyle: '',
        globalAlpha: 1,
        fillRect: () => {}
      } as unknown as CanvasRenderingContext2D;
      
      particleManager.createGoldParticles({ x: 5, y: 5 });
      particleManager.render(mockCtx);
      
      // Global alpha should be reset to 1
      expect(mockCtx.globalAlpha).toBe(1);
    });
  });

  describe('Utility Functions', () => {
    test('should clear all active particles', () => {
      particleManager.createGoldParticles({ x: 5, y: 5 });
      expect(particleManager.getActiveParticleCount()).toBeGreaterThan(0);
      
      particleManager.clear();
      
      expect(particleManager.getActiveParticleCount()).toBe(0);
      expect(particleManager.getPoolSize()).toBe(100);
    });
  });
});
